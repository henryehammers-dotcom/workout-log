/* ════════════════════════════════════════════
   Tally Up — Rest timer (per exercise, lives in the Log button)
   ════════════════════════════════════════════ */
import { exerciseTimers, viewedDate, formatISODate } from './state.js';
import { getSetData } from './schedule-day.js';
import { renderDayContent } from './schedule-day.js';

// Timer key includes the date being logged against, so a rest timer started
// while viewing one date doesn't bleed into another date that happens to share
// the same day-of-week (e.g. two different Wednesdays navigated to in one session).
export function timerKeyFor(d, idx, isoDate) {
  const tag = isoDate || formatISODate(viewedDate);
  return d + '-' + idx + (tag ? '-' + tag : '');
}
export function startTimer(secs, d, idx, isoDate) {
  if (typeof d === 'undefined' || typeof idx === 'undefined') return;
  const key = timerKeyFor(d, idx, isoDate);
  if (exerciseTimers[key] && exerciseTimers[key].intervalId) {
    clearInterval(exerciseTimers[key].intervalId);
  }
  exerciseTimers[key] = { secsLeft: secs, total: secs, intervalId: null };
  renderDayContent();
  exerciseTimers[key].intervalId = setInterval(() => {
    const t = exerciseTimers[key];
    if (!t) return;
    t.secsLeft--;
    if (t.secsLeft <= 0) {
      clearInterval(t.intervalId);
      finishTimer(d, idx, isoDate);
    } else {
      // Update only the button text — no full re-render so any other inputs stay focused
      const btn = document.getElementById('logbtn-' + key);
      if (btn) {
        const m = Math.floor(t.secsLeft/60), s = t.secsLeft%60;
        const span = btn.querySelector('.timer-count');
        if (span) span.textContent = m + ':' + String(s).padStart(2,'0');
      }
    }
  }, 1000);
}
export function finishTimer(d, idx, isoDate) {
  const key = timerKeyFor(d, idx, isoDate);
  delete exerciseTimers[key];
  // Clear input row and unlock so button reverts to "Log sets"
  const data = getSetData(d, idx);
  data.logged = false;
  data.sets = [{reps:'',weight:''}];
  renderDayContent();
}
export function skipExerciseTimer(d, idx, isoDate) {
  const key = timerKeyFor(d, idx, isoDate);
  const t = exerciseTimers[key];
  if (t && t.intervalId) clearInterval(t.intervalId);
  finishTimer(d, idx, isoDate);
}
