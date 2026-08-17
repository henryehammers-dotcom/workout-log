/* ════════════════════════════════════════════
   Tally Up — Music player
   Composer pills. Clicking one starts that composer's playlist on a random
   track and shows the eq bars next to it; clicking the same (already
   active) pill again pauses/resumes it. Tracks auto-advance in order from
   the random starting point, looping back to the start of the playlist
   array when the last track finishes.

   TRACK LISTS: each composer's tracklist lives in its own folder as
   music/<Folder>/tracks.json — a plain JSON array of filenames, e.g.:
     ["01-aria.mp3", "02-variation1.mp3"]
   To add a track: drop the mp3 in the composer's folder and add its
   filename to that folder's tracks.json. Nothing in this file, index.html,
   or the service worker needs to change for a track-only addition.
   To add a whole new composer: add one line to COMPOSERS below (the key
   used elsewhere, e.g. in selectPlaylist('key'), and the folder name on
   disk — folder casing must match the repo/GitHub Pages exactly), plus one
   pill button in index.html's #composer-pills block.

   OFFLINE CACHING: playlists are NOT precached by the service worker (see
   service-worker.js's FILES list — intentionally excludes music, so a
   fresh install stays small regardless of composer count). Instead, the
   first time a composer is played, its tracks are explicitly saved into
   a dedicated cache (MUSIC_CACHE) in the background, so replays after that
   are instant/offline. Until that finishes, playback still works fine via
   a normal network fetch — caching is a background nice-to-have, never a
   blocker for play().
   ════════════════════════════════════════════ */

// key used by selectPlaylist('key') → folder name on disk under music/
const COMPOSERS = {
  bach: 'Bach',
  beethoven: 'Beethoven',
  mozart: 'Mozart',
  tchaikovsky: 'Tchaikovsky',
  rachmaninoff: 'Rachmaninoff',
};

const MUSIC_CACHE = 'tallyup-music-v1';
const CACHED_KEY = 'wl_cached_composers';
const cachedComposers = new Set(JSON.parse(localStorage.getItem(CACHED_KEY) || '[]'));

// In-memory cache of fetched tracklists, keyed by composer key, so we only
// fetch each folder's tracks.json once per session.
const playlistCache = {};

async function getPlaylist(key) {
  if (playlistCache[key]) return playlistCache[key];
  const folder = COMPOSERS[key];
  if (!folder) return null;
  const res = await fetch(`music/${folder}/tracks.json`);
  if (!res.ok) throw new Error(`tracks.json fetch failed for ${folder}: ${res.status}`);
  const filenames = await res.json();
  const playlist = {
    label: folder,
    tracks: filenames.map(f => `music/${folder}/${f}`),
  };
  playlistCache[key] = playlist;
  return playlist;
}

// Explicitly saves a composer's tracks for offline playback, once, in the
// background. Failure is non-fatal — playback still works via normal
// fetch, this just means replays won't be guaranteed-offline yet.
async function ensureComposerCached(key, playlist) {
  if (cachedComposers.has(key)) return;
  try {
    const cache = await caches.open(MUSIC_CACHE);
    await cache.addAll(playlist.tracks);
    cachedComposers.add(key);
    localStorage.setItem(CACHED_KEY, JSON.stringify([...cachedComposers]));
  } catch (err) {
    console.warn('[music] failed to cache composer', key, err);
  }
}

let audio = null;
let currentPlaylistKey = null;
let currentPlaylist = null; // resolved { label, tracks } for currentPlaylistKey
let currentTrackIndex = 0;
let paused = false;

// Lets other modules (e.g. the rest-day snoring sound) check/pause playback
// without touching this module's internals directly.
export function isMusicPlaying() {
  return !!(currentPlaylistKey && audio && !audio.paused);
}
export function pauseMusic() {
  if (audio && !audio.paused) { audio.pause(); paused = true; }
}

// calendar.js registers its snore-pausing function here at load time, so
// starting a playlist can pause the snore loop without this module importing
// calendar.js back (calendar.js already imports from here — see the same
// pattern/comment in schedule-day.js's registerCalendarRenderer).
let _pauseSnore = null;
export function registerSnorePauser(fn) { _pauseSnore = fn; }

export function initMusic() {
  audio = document.getElementById('audio-player');
  audio.removeAttribute('loop'); // looping is handled manually per-playlist below
  audio.volume = 0.5;
  audio.addEventListener('ended', playNextTrack);
  // The eq bar reflects genuine playback state, driven by the audio element's
  // own events rather than our call sites' optimistic assumptions — this way
  // a failed/stalled play() never shows a falsely-animating eq bar.
  audio.addEventListener('playing', () => setEqPlaying(currentPlaylistKey, true));
  audio.addEventListener('pause', () => setEqPlaying(currentPlaylistKey, false));
  audio.addEventListener('error', () => {
    const err = audio.error;
    console.error('[music] audio element error:', err && err.code, err && err.message, 'src=', audio.src);
    setEqPlaying(currentPlaylistKey, false);
  });
}

function setActivePill(key) {
  Object.keys(COMPOSERS).forEach(k => {
    document.getElementById('pill-' + k)?.classList.toggle('active', k === key);
  });
}
function setEqPlaying(key, playing) {
  if (!key) return;
  document.getElementById('eq-' + key)?.classList.toggle('playing', playing);
}

export async function selectPlaylist(key) {
  if (!COMPOSERS[key]) return;

  // Clicking the already-active pill toggles pause/resume instead of restarting.
  if (key === currentPlaylistKey) {
    if (paused) {
      audio.play().catch(err => console.error('[music] play() failed on resume:', err));
      paused = false;
    } else {
      audio.pause();
      paused = true;
    }
    return;
  }

  let playlist;
  try {
    playlist = await getPlaylist(key);
  } catch (err) {
    console.error('[music] failed to load playlist for', key, err);
    return;
  }
  if (!playlist || !playlist.tracks.length) return;

  // Switching to a different composer — clear the previous one's eq bars.
  if (currentPlaylistKey) setEqPlaying(currentPlaylistKey, false);

  // Starting music pauses the snore loop, mirroring toggleSnoreAudio()'s own
  // pause-music-on-start behavior, so only one audio source plays at once.
  if (_pauseSnore) _pauseSnore();

  currentPlaylistKey = key;
  currentPlaylist = playlist;
  // Random starting track each time a composer is picked fresh.
  currentTrackIndex = Math.floor(Math.random() * playlist.tracks.length);
  paused = false;
  setActivePill(key);
  loadCurrentTrack();
  audio.play().catch(err => {
    console.error('[music] play() failed on selectPlaylist:', err, 'src=', audio.src);
  });

  // Fire-and-forget: don't block playback on caching finishing.
  ensureComposerCached(key, playlist);
}

function loadCurrentTrack() {
  if (!currentPlaylist) return;
  audio.src = currentPlaylist.tracks[currentTrackIndex];
  audio.load();
}
function playNextTrack() {
  if (!currentPlaylist) return;
  currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
  loadCurrentTrack();
  audio.play().catch(err => console.error('[music] play() failed on playNextTrack:', err));
}
