/* ════════════════════════════════════════════
   Tally Up — Bodyweight
   ════════════════════════════════════════════ */
import { KEYS, getCleanBw, currentUnits, hideBodyweight, setHideBodyweight } from './state.js';

export function saveBodyweight(val) {
  if (val === '' || val == null) return;
  localStorage.setItem(KEYS.bw, parseFloat(val));
  updateBwDisplay();
}
export function updateBwDisplay() {
  const val = getCleanBw();
  document.getElementById('bw-display').textContent = val != null ? val : '—';
  document.getElementById('bw-unit-label').textContent = currentUnits;
  const su = document.getElementById('settings-bw-unit');
  if (su) su.textContent = currentUnits;
  // Sidebar chip hides entirely when the user's opted out — some people find
  // a visible number motivating, others don't want to see it, so this is a
  // pure display toggle: the value itself is untouched either way.
  const chip = document.getElementById('bw-chip');
  if (chip) chip.style.display = hideBodyweight ? 'none' : '';
}
export function toggleHideBodyweight(on) {
  setHideBodyweight(!!on);
  localStorage.setItem(KEYS.hideBw, hideBodyweight ? '1' : '0');
  document.getElementById('hide-bw-toggle')?.classList.toggle('on', hideBodyweight);
  updateBwDisplay();
}
