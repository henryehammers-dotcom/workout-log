/* ════════════════════════════════════════════
   Tally Up — Clock (Timer + Stopwatch)
   ════════════════════════════════════════════ */

export function switchClockTab(sub, el) {
  document.querySelectorAll('#tab-clock .clock-subtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('clock-timer').style.display = sub === 'timer' ? '' : 'none';
  document.getElementById('clock-stopwatch').style.display = sub === 'stopwatch' ? '' : 'none';
}

function buildDrum(id) {
  const drum = document.getElementById(id);
  if (!drum || drum.querySelector('.drum-inner')) return;
  const max = parseInt(drum.dataset.max);
  const inner = document.createElement('div');
  inner.className = 'drum-inner';
  for (let i = 0; i <= max; i++) {
    const item = document.createElement('div');
    item.className = 'drum-item' + (i === 0 ? ' drum-selected' : '');
    item.textContent = String(i).padStart(2, '0');
    inner.appendChild(item);
  }
  const ft = document.createElement('div'); ft.className = 'drum-fade-top';
  const fb = document.createElement('div'); fb.className = 'drum-fade-bot';
  drum.appendChild(inner); drum.appendChild(ft); drum.appendChild(fb);
  setDrumValue(drum, 0);
  initDrumInteraction(drum);
}
function setDrumValue(drum, val) {
  const max = parseInt(drum.dataset.max);
  val = Math.max(0, Math.min(max, val));
  drum.dataset.val = val;
  const inner = drum.querySelector('.drum-inner');
  inner.style.transform = `translateY(${50 - val * 50}px)`;
  drum.querySelectorAll('.drum-item').forEach((el, i) => el.classList.toggle('drum-selected', i === val));
  updateClockCountdown();
}
function initDrumInteraction(drum) {
  let startY = 0, startVal = 0, dragging = false;
  function onStart(y) { startY = y; startVal = parseInt(drum.dataset.val); dragging = true; }
  function onMove(y) { if (!dragging) return; const delta = Math.round((startY - y) / 50); setDrumValue(drum, startVal + delta); }
  function onEnd() { dragging = false; }
  drum.addEventListener('touchstart', e => { e.preventDefault(); onStart(e.touches[0].clientY); }, { passive: false });
  drum.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0].clientY); }, { passive: false });
  drum.addEventListener('touchend', onEnd);
  drum.addEventListener('mousedown', e => { onStart(e.clientY); });
  document.addEventListener('mousemove', e => { if (dragging) onMove(e.clientY); });
  document.addEventListener('mouseup', onEnd);
  drum.addEventListener('wheel', e => { e.preventDefault(); const delta = e.deltaY > 0 ? 1 : -1; setDrumValue(drum, parseInt(drum.dataset.val) + delta); }, { passive: false });
}
function updateClockCountdown() {
  const h = parseInt(document.getElementById('drum-h')?.dataset.val || 0);
  const m = parseInt(document.getElementById('drum-m')?.dataset.val || 0);
  const s = parseInt(document.getElementById('drum-s')?.dataset.val || 0);
  const el = document.getElementById('clock-countdown');
  if (el && !ctRunning) el.textContent = formatClockTime(h * 3600 + m * 60 + s);
}
function formatClockTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

let ctInterval = null, ctRemaining = 0, ctRunning = false;
export function clockTimerToggle() {
  if (!ctRunning) {
    const h = parseInt(document.getElementById('drum-h').dataset.val);
    const m = parseInt(document.getElementById('drum-m').dataset.val);
    const s = parseInt(document.getElementById('drum-s').dataset.val);
    if (!ctRemaining) ctRemaining = h * 3600 + m * 60 + s;
    if (!ctRemaining) return;
    ctRunning = true;
    document.getElementById('ct-start').textContent = 'Pause';
    document.getElementById('ct-start').classList.add('running');
    document.getElementById('clock-drums').style.display = 'none';
    document.getElementById('clock-countdown').style.display = '';
    document.getElementById('clock-countdown').textContent = formatClockTime(ctRemaining);
    ctInterval = setInterval(() => {
      ctRemaining--;
      document.getElementById('clock-countdown').textContent = formatClockTime(ctRemaining);
      if (ctRemaining <= 0) {
        clearInterval(ctInterval); ctRunning = false; ctRemaining = 0;
        document.getElementById('ct-start').textContent = 'Start';
        document.getElementById('ct-start').classList.remove('running');
        document.getElementById('clock-drums').style.display = 'grid';
        document.getElementById('clock-countdown').style.display = 'none';
        updateClockCountdown();
      }
    }, 1000);
  } else {
    clearInterval(ctInterval); ctRunning = false;
    document.getElementById('ct-start').textContent = 'Resume';
    document.getElementById('ct-start').classList.remove('running');
  }
}
export function clockTimerReset() {
  clearInterval(ctInterval); ctRunning = false; ctRemaining = 0;
  document.getElementById('ct-start').textContent = 'Start';
  document.getElementById('ct-start').classList.remove('running');
  document.getElementById('clock-drums').style.display = 'grid';
  document.getElementById('clock-countdown').style.display = 'none';
  setDrumValue(document.getElementById('drum-h'), 0);
  setDrumValue(document.getElementById('drum-m'), 0);
  setDrumValue(document.getElementById('drum-s'), 0);
  updateClockCountdown();
}
let _clockBuilt = false;
export function ensureClockBuilt() { if (!_clockBuilt) { buildDrum('drum-h'); buildDrum('drum-m'); buildDrum('drum-s'); _clockBuilt = true; } }

/* ── Stopwatch ── */
let swRunning = false, swStart = 0, swElapsed = 0, swInterval = null, swLaps = [], swLastLap = 0;
export function swToggle() {
  if (!swRunning) {
    swStart = Date.now() - swElapsed;
    swRunning = true;
    document.getElementById('sw-start-btn').textContent = 'Stop';
    document.getElementById('sw-start-btn').classList.add('running');
    document.getElementById('sw-lap-btn').disabled = false;
    document.getElementById('sw-lap-btn').style.display = '';
    document.getElementById('sw-reset-btn').style.display = 'none';
    swInterval = setInterval(swTick, 10);
  } else {
    clearInterval(swInterval); swRunning = false;
    document.getElementById('sw-start-btn').textContent = 'Start';
    document.getElementById('sw-start-btn').classList.remove('running');
    document.getElementById('sw-lap-btn').disabled = true;
    document.getElementById('sw-lap-btn').style.display = 'none';
    document.getElementById('sw-reset-btn').style.display = '';
  }
}
function swTick() {
  swElapsed = Date.now() - swStart;
  const total = Math.floor(swElapsed / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  document.getElementById('sw-display').textContent = (h ? h + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  const csEl = document.querySelector('.sw-display .cs'); if (csEl) csEl.textContent = '.' + String(cs).padStart(2,'0');
}
function formatSw(ms) {
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  return (h ? h + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
}
export function swLap() {
  if (!swRunning) return;
  const split = swElapsed - swLastLap;
  swLastLap = swElapsed;
  swLaps.unshift({ n: swLaps.length + 1, total: swElapsed, split });
  document.getElementById('sw-laps').innerHTML = swLaps.map(l =>
    `<div class="sw-lap-row"><span class="sw-lap-num">Lap ${l.n}</span><span class="sw-lap-split">${formatSw(l.split)}</span><span class="sw-lap-time">${formatSw(l.total)}</span></div>`
  ).join('');
}
export function swReset() {
  clearInterval(swInterval);
  swRunning = false; swStart = 0; swElapsed = 0; swLaps = []; swLastLap = 0;
  document.getElementById('sw-display').textContent = '00:00';
  const csEl = document.querySelector('.sw-display .cs'); if (csEl) csEl.textContent = '.00';
  document.getElementById('sw-laps').innerHTML = '';
  document.getElementById('sw-start-btn').textContent = 'Start';
  document.getElementById('sw-start-btn').classList.remove('running');
  document.getElementById('sw-lap-btn').disabled = true;
  document.getElementById('sw-lap-btn').style.display = 'none';
  document.getElementById('sw-reset-btn').style.display = 'none';
}
