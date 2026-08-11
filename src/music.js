/* ════════════════════════════════════════════
   Tally Up — Music player
   ════════════════════════════════════════════ */
let audio = null;
let muted = true;

export function initMusic() {
  audio = document.getElementById('audio-player');
  audio.src = 'mozart-on-meth.mp3';
  audio.volume = 0.5;
}
function setMusicIcons(playing) {
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const eq = document.getElementById('eq-bars');
  if (playIcon) playIcon.style.display = playing ? 'none' : '';
  if (pauseIcon) pauseIcon.style.display = playing ? '' : 'none';
  if (eq) eq.classList.toggle('playing', playing);
}
export function toggleMute() {
  if (muted) { audio.play().catch(()=>{}); muted = false; setMusicIcons(true); }
  else { audio.pause(); muted = true; setMusicIcons(false); }
}
export function toggleTrackMenu() {
  const m = document.getElementById('track-menu');
  m.classList.toggle('show');
}
export function selectTrack(el) {
  const wasPlaying = !muted;
  audio.src = el.dataset.src; audio.load();
  document.getElementById('track-name').textContent = el.dataset.name;
  document.getElementById('track-menu').classList.remove('show');
  if (wasPlaying) audio.play().catch(()=>{});
}
document.addEventListener('click', e => {
  if (!e.target.closest('#track-btn') && !e.target.closest('#track-menu')) {
    document.getElementById('track-menu')?.classList.remove('show');
  }
});
