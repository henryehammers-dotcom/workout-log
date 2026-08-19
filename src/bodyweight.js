/* ════════════════════════════════════════════
   Tally Up — Bodyweight
   ════════════════════════════════════════════ */
import { KEYS } from './state.js';

// Bodyweight is still tracked (used for bodyweight-exercise volume calcs and
// the Profile edit sheet's weight field) — only the sidebar display chip and
// its show/hide toggle have been removed, per the Settings reorg.
export function saveBodyweight(val) {
  if (val === '' || val == null) return;
  localStorage.setItem(KEYS.bw, parseFloat(val));
}
