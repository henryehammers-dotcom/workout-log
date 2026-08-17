/* ════════════════════════════════════════════
   Tally Up — Music player
   Four always-visible composer pills. Clicking one starts that composer's
   playlist on a random track and shows the eq bars next to it; clicking the
   same (already active) pill again pauses/resumes it. Tracks auto-advance
   in order from the random starting point, looping back to the start of
   the playlist array when the last track finishes.

   NOTE: filenames use the folder casing actually present in the repo
   (Bach/Beethoven/Mozart/Tchaikovsky), matching what's on GitHub Pages —
   keep this in sync with the repo's music/ folder if files are renamed.
   ════════════════════════════════════════════ */
const PLAYLISTS = {
  bach: {
    label: 'Bach',
    tracks: [
      'music/Bach/01-aria.mp3',
      'music/Bach/02-variation1.mp3',
      'music/Bach/03-variation2.mp3',
      'music/Bach/04-variation3.mp3',
      'music/Bach/05-variation4.mp3',
      'music/Bach/06-variation5.mp3',
      'music/Bach/07-variation6.mp3',
      'music/Bach/08-variation7.mp3',
      'music/Bach/09-variation8.mp3',
      'music/Bach/10-variation9.mp3',
      'music/Bach/11-variation10.mp3',
      'music/Bach/12-variation11.mp3',
      'music/Bach/13-variation12.mp3',
      'music/Bach/14-variation13.mp3',
      'music/Bach/15-variation14.mp3',
      'music/Bach/16-variation15.mp3',
      'music/Bach/17-variation16.mp3',
      'music/Bach/18-variation17.mp3',
      'music/Bach/19-variation18.mp3',
      'music/Bach/20-variation19.mp3',
      'music/Bach/21-variation20.mp3',
      'music/Bach/22-variation21.mp3',
      'music/Bach/23-variation22.mp3',
      'music/Bach/24-variation23.mp3',
      'music/Bach/25-variation24.mp3',
      'music/Bach/26-variation25.mp3',
      'music/Bach/27-variation26.mp3',
      'music/Bach/28-variation27.mp3',
      'music/Bach/29-variation28.mp3',
      'music/Bach/30-variation29.mp3',
      'music/Bach/31-variation30.mp3',
      'music/Bach/32-aria-da-capo.mp3',
      'music/Bach/33-toccata-fugue-dminor.mp3',
      'music/Bach/34-prelude-fugue-eminor.mp3',
    ],
  },
  beethoven: {
    label: 'Beethoven',
    tracks: [
      'music/Beethoven/01-coriolan-overture.mp3',
      'music/Beethoven/02-egmont-overture.mp3',
      'music/Beethoven/03-quartet6-1.mp3',
      'music/Beethoven/04-quartet6-2.mp3',
      'music/Beethoven/05-quartet6-3.mp3',
      'music/Beethoven/06-quartet6-4.mp3',
      'music/Beethoven/07-eroica-1.mp3',
      'music/Beethoven/08-eroica-2.mp3',
      'music/Beethoven/09-eroica-3.mp3',
      'music/Beethoven/10-eroica-4.mp3',
    ],
  },
  mozart: {
    label: 'Mozart',
    tracks: [
      'music/Mozart/01-eine-kleine-nachtmusik.mp3',
      'music/Mozart/02-magic-flute-overture.mp3',
      'music/Mozart/03-marriage-of-figaro.mp3',
      'music/Mozart/04-symphony40-1.mp3',
      'music/Mozart/05-symphony40-2.mp3',
      'music/Mozart/06-symphony40-3.mp3',
      'music/Mozart/07-symphony40-4.mp3',
      'music/Mozart/08-rondo-alla-turca.mp3',
      'music/Mozart/09-quartet15-1.mp3',
      'music/Mozart/10-quartet15-4.mp3',
    ],
  },
  tchaikovsky: {
    label: 'Tchaikovsky',
    tracks: [
      'music/Tchaikovsky/01-piano-concerto1.mp3',
      'music/Tchaikovsky/02-swan-lake-scene.mp3',
      'music/Tchaikovsky/03-sleeping-beauty-waltz.mp3',
      'music/Tchaikovsky/04-swan-lake-waltz.mp3',
      'music/Tchaikovsky/05-nutcracker-chinese-dance.mp3',
      'music/Tchaikovsky/06-1812-overture.mp3',
      'music/Tchaikovsky/07-pathetique-1.mp3',
      'music/Tchaikovsky/08-pathetique-2.mp3',
      'music/Tchaikovsky/09-pathetique-3.mp3',
      'music/Tchaikovsky/10-pathetique-4.mp3',
    ],
  },
};

let audio = null;
let currentPlaylistKey = null;
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
  ['bach', 'beethoven', 'mozart', 'tchaikovsky'].forEach(k => {
    document.getElementById('pill-' + k)?.classList.toggle('active', k === key);
  });
}
function setEqPlaying(key, playing) {
  if (!key) return;
  document.getElementById('eq-' + key)?.classList.toggle('playing', playing);
}

export function selectPlaylist(key) {
  const playlist = PLAYLISTS[key];
  if (!playlist) return;

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

  // Switching to a different composer — clear the previous one's eq bars.
  if (currentPlaylistKey) setEqPlaying(currentPlaylistKey, false);

  currentPlaylistKey = key;
  // Random starting track each time a composer is picked fresh.
  currentTrackIndex = Math.floor(Math.random() * playlist.tracks.length);
  paused = false;
  setActivePill(key);
  loadCurrentTrack();
  audio.play().catch(err => {
    console.error('[music] play() failed on selectPlaylist:', err, 'src=', audio.src);
  });
}

function loadCurrentTrack() {
  const playlist = PLAYLISTS[currentPlaylistKey];
  if (!playlist) return;
  audio.src = playlist.tracks[currentTrackIndex];
  audio.load();
}
function playNextTrack() {
  const playlist = PLAYLISTS[currentPlaylistKey];
  if (!playlist) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.tracks.length;
  loadCurrentTrack();
  audio.play().catch(err => console.error('[music] play() failed on playNextTrack:', err));
}
