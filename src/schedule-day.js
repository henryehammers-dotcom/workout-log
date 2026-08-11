/* ════════════════════════════════════════════
   Tally Up — Day content: session data, add/remove, day picker
   ════════════════════════════════════════════ */
import { DAY_NAMES, FULL_DAYS, DEFAULT_LIBRARY_V2, schedule, saveSchedule, currentDay, setCurrentDay,
         dayEditMode, setDayEditMode, sessionSets, viewedDate, formatISODate } from './state.js';
import { showModal, closeModal } from './modal.js';

/* ─── SESSION DATA ─── */
// Keyed by (viewed date + exercise index) rather than just day-of-week, so that
// e.g. logging Wednesday's leg day on one Wednesday doesn't leave every other
// Wednesday viewed later in the same session stuck showing "already logged".
function sk(d, i) {
  const dateTag = formatISODate(viewedDate);
  return d + '_' + i + (dateTag ? '_' + dateTag : '');
}
export function getSetData(d, i) {
  const k = sk(d, i);
  if (!sessionSets[k]) sessionSets[k] = { sets: [{reps:'', weight:''}], logged: false };
  return sessionSets[k];
}
// Resolves a scheduled exercise's display fields (name/reps/rest/type) from the
// current Library entry when it has an exId, so editing the Library updates it
// everywhere it's scheduled. Falls back to matching by name (for exercises added
// before live-linking existed, or with a missing/stale exId), then finally to
// the day's own stored copy if nothing in the Library matches at all.
function normalizeExName(n) {
  return (n || '').trim().toLowerCase().replace(/s$/, '');
}
export function resolveScheduledExercise(ex) {
  let libEx = null;
  if (ex.exId) libEx = DEFAULT_LIBRARY_V2.find(e => e.id === ex.exId);
  if (!libEx && ex.name) libEx = DEFAULT_LIBRARY_V2.find(e => e.name === ex.name);
  // Final fallback: case/trailing-s-insensitive match, so a rename that only
  // differs by capitalization or a trailing "s" still displays live instead of
  // silently falling back to the stale stored copy.
  if (!libEx && ex.name) {
    const norm = normalizeExName(ex.name);
    libEx = DEFAULT_LIBRARY_V2.find(e => normalizeExName(e.name) === norm);
  }
  if (libEx) {
    return { ...ex, name: libEx.name, reps: libEx.reps, rest: libEx.rest, restSecs: libEx.restSecs, type: libEx.type, blurb: libEx.blurb };
  }
  return ex;
}
export function flushInputs() {
  document.querySelectorAll('[data-reps],[data-weight]').forEach(el => {
    const d = el.dataset.day, i = parseInt(el.dataset.ex), si = parseInt(el.dataset.si);
    const field = 'reps' in el.dataset ? 'reps' : 'weight';
    const data = getSetData(d, i);
    if (data.sets[si]) data.sets[si][field] = el.value;
  });
}

/* ─── DAY PICKER / CONTENT ─── */
export function closeDayPicker() {
  const dd = document.getElementById('day-dropdown');
  const picker = document.getElementById('day-picker-btn');
  if (dd) dd.classList.remove('show');
  if (picker) picker.classList.remove('open');
}
export function toggleDayMenu() {
  const dd = document.getElementById('day-menu-dropdown');
  if (!dd) return;
  closeDayPicker();
  dd.classList.toggle('show');
}
export function closeDayMenu() {
  const dd = document.getElementById('day-menu-dropdown');
  if (dd) dd.classList.remove('show');
}
export function toggleDayEditMode() {
  flushInputs();
  setDayEditMode(!dayEditMode);
  renderDayContent();
}

// Legacy entry point — kept because lots of code (rest-day toggle, copy-day,
// clear-session, timers, unit/theme switches, etc.) calls this to refresh the
// Log tab. It now just keeps currentDay in sync with the calendar's viewed
// date and delegates actual rendering to the calendar system (calendar.js).
// calendar.js registers its renderCalendarRoot here at load time (see the
// bottom of calendar.js) to avoid a circular top-level import: calendar.js
// already imports from this module, so this module cannot import back from
// calendar.js directly.
let _renderCalendarRoot = null;
export function registerCalendarRenderer(fn) { _renderCalendarRoot = fn; }
export function renderDayContent() {
  setCurrentDay(DAY_NAMES[viewedDate.getDay()]);
  if (_renderCalendarRoot) _renderCalendarRoot();
}

/* ─── ADD/REMOVE ─── */
export function toggleRestDay() { flushInputs(); schedule[currentDay].restDay = !schedule[currentDay].restDay; saveSchedule(); renderDayContent(); }
export function removeExercise(d, idx) {
  showModal('Remove exercise?', `Remove "${schedule[d].exercises[idx].name}" from ${FULL_DAYS[d]}?`, () => {
    flushInputs();
    schedule[d].exercises.splice(idx, 1);
    const n = {};
    Object.keys(sessionSets).forEach(k => {
      const parts = k.split('_');
      const kd = parts[0], ki = parseInt(parts[1]), dateTag = parts.slice(2).join('_');
      const suffix = dateTag ? '_' + dateTag : '';
      if (kd !== d) { n[k] = sessionSets[k]; return; }
      if (ki < idx) n[k] = sessionSets[k];
      else if (ki > idx) n[kd+'_'+(ki-1)+suffix] = sessionSets[k];
    });
    Object.keys(sessionSets).forEach(k => delete sessionSets[k]);
    Object.assign(sessionSets, n);
    saveSchedule(); closeModal(); renderDayContent();
  });
}

export function clearSet(d, i, si) {
  flushInputs();
  const data = getSetData(d, i);
  if (data.logged) return;
  if (data.sets[si]) { data.sets[si].reps = ''; data.sets[si].weight = ''; }
  renderDayContent();
}

/* ─── CONFIRM ACTIONS ─── */
export function confirmCopyDay() {
  showModal('Copy to all days?', `This copies ${currentDay}'s exercises to the entire week (skipping rest days). Continue?`, () => {
    flushInputs();
    const src = JSON.parse(JSON.stringify(schedule[currentDay].exercises));
    const srcSuffix = schedule[currentDay].label.replace(/^.+?—\s*/, '');
    DAY_NAMES.forEach(d => {
      if (d !== currentDay && !schedule[d].restDay) {
        schedule[d].exercises = JSON.parse(JSON.stringify(src));
        schedule[d].label = FULL_DAYS[d] + ' — ' + srcSuffix;
      }
    });
    Object.keys(sessionSets).forEach(k => delete sessionSets[k]);
    saveSchedule(); closeModal(); renderDayContent();
  });
}
export function confirmClearSession() {
  showModal('Clear session?', 'All logged sets for this day will be cleared from this view. Your saved history is kept.', () => {
    const dateTag = formatISODate(viewedDate);
    const prefix = currentDay + '_';
    const suffix = dateTag ? '_' + dateTag : '';
    Object.keys(sessionSets).forEach(k => {
      if (k.startsWith(prefix) && (!suffix || k.endsWith(suffix))) delete sessionSets[k];
    });
    closeModal(); renderDayContent();
  });
}
