/* ════════════════════════════════════════════
   Tally Up — Bodyweight
   ════════════════════════════════════════════ */
import { KEYS, getCleanBw, currentUnits } from './state.js';

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
}
