/* ════════════════════════════════════════════
   Tally Up — Music player
   Four always-visible composer pills. Clicking one starts that composer's
   playlist on a random track and shows the eq bars next to it; clicking the
   same (already active) pill again pauses/resumes it. Tracks auto-advance
   in order once a random starting point is picked, looping back to the
   start of the playlist array when the last track finishes.
   ════════════════════════════════════════════ */
const PLAYLISTS = {
  bach: {
    label: 'Bach',
    tracks: ['music/bach/01-best-of-bach.mp3'],
  },
  beethoven: {
    label: 'Beethoven',
    tracks: ['music/beethoven/01-best-of-beethoven.mp3'],
  },
  mozart: {
    label: 'Mozart',
    tracks: [
      'music/mozart/01-eine-kleine-nachtmusik.mp3',
      'music/mozart/02-magic-flute-overture.mp3',
      'music/mozart/03-marriage-of-figaro.mp3',
      'music/mozart/04-symphony40-1.mp3',
      'music/mozart/05-symphony40-2.mp3',
      'music/mozart/06-symphony40-3.mp3',
      'music/mozart/07-symphony40-4.mp3',
      'music/mozart/08-rondo-alla-turca.mp3',
      'music/mozart/09-quartet15-1.mp3',
      'music/mozart/10-quartet15-4.mp3',
    ],
  },
  tchaikovsky: {
    label: 'Tchaikovsky',
    tracks: ['music/tchaikovsky/01-best-of-tchaikovsky.mp3'],
  },
};

let audio = null;
let currentPlaylistKey = null;
let currentTrackIndex = 0;
let paused = false;

export function initMusic() {
  audio = document.getElementById('audio-player');
  audio.removeAttribute('loop'); // looping is handled manually per-playlist below
  audio.volume = 0.5;
  audio.addEventListener('ended', playNextTrack);
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
      audio.play().catch(()=>{});
      paused = false;
      setEqPlaying(key, true);
    } else {
      audio.pause();
      paused = true;
      setEqPlaying(key, false);
    }
    return;
  }

  // Switching to a different composer — clear the previous one's eq bars
  // before lighting up the new one, since setActivePill only toggles the
  // pill's .active class, not the independent eq-bars .playing class.
  if (currentPlaylistKey) setEqPlaying(currentPlaylistKey, false);

  currentPlaylistKey = key;
  // Random starting track each time a composer is picked fresh.
  currentTrackIndex = Math.floor(Math.random() * playlist.tracks.length);
  paused = false;
  setActivePill(key);
  loadCurrentTrack();
  audio.play().catch(()=>{});
  setEqPlaying(key, true);
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
  audio.play().catch(()=>{});
}
