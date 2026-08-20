/* ════════════════════════════════════════════
   Tally Up — Calendar (Day / Week / Month / Year)
   ════════════════════════════════════════════ */
import { DAY_NAMES, schedule, currentDay, setCurrentDay, dayEditMode, currentUnits,
         sessionSets, exerciseTimers, showInstructionsIcons, getHistory, saveHistory, getCleanBw,
         viewedDate, setViewedDate, formatISODate, parseISODate, cloneDate,
         escAttr, escHtml } from './state.js';
import { flushInputs, resolveScheduledExercise, getSetData, registerCalendarRenderer } from './schedule-day.js';
import { destroyCharts, getExerciseIndex, sessionBestE1RM, parseSessionDate } from './history.js';
import { timerKeyFor, startTimer, registerSetCommitter } from './timers.js';
import { initDrag } from './drag.js';
import { openCustomLog } from './custom-log.js';
import { isMusicPlaying, pauseMusic, registerSnorePauser } from './music.js';

/* ─── STATE ─── */
export let calendarView = 'day';       // 'day' | 'week' | 'month' | 'year'

// Tracks whether the most recent renderDayView() call rendered the plain
// rest screen (no scheduled or custom-logged workout) — read right after by
// renderCalendarRoot() to decide whether the snoring sound should be playing.
let lastRenderWasPureRestScreen = false;

export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── DATE HELPERS ─── */
// Formats a Date the same way the rest of the app keys history: "Wednesday, Jul 22, 2026"
export function formatHistoryDate(date) {
  return date.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' });
}
export function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function addDays(d, n) { const r = cloneDate(d); r.setDate(r.getDate() + n); return r; }
export function addMonths(d, n) { const r = cloneDate(d); r.setMonth(r.getMonth() + n); return r; }
export function startOfWeek(d) { return addDays(d, -d.getDay()); } // Sunday start
export function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
export function daysInMonth(d) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }

/* ─── PIVOT: switching Day/Week/Month/Year ─── */
export function switchCalendarView(view, opts) {
  opts = opts || {};
  flushInputs();
  calendarView = view;
  if (opts.date) setViewedDate(cloneDate(opts.date));
  renderCalendarRoot();
}
export function calendarNav(dir) {
  flushInputs();
  if (calendarView === 'day') setViewedDate(addDays(viewedDate, dir));
  else if (calendarView === 'week') setViewedDate(addDays(viewedDate, dir * 7));
  else if (calendarView === 'month') setViewedDate(addMonths(viewedDate, dir));
  renderCalendarRoot();
}
export function openCustomLogForViewedDate() {
  openCustomLog(formatISODate(viewedDate));
}

export function jumpToDate(date) {
  flushInputs();
  setViewedDate(cloneDate(date));
  calendarView = 'day';
  renderCalendarRoot();
}
export function jumpToMonth(monthIdx, year) {
  setViewedDate(new Date(year, monthIdx, 1));
  calendarView = 'month';
  renderCalendarRoot();
}

/* ─── HISTORY LOOKUPS FOR A GIVEN DATE ─── */
export function historyEntriesForDate(date) {
  const hist = getHistory();
  return hist[formatHistoryDate(date)] || [];
}
// Was anything logged on this date, and was any of it a PR (best-ever e1RM for that exercise)?
export function dayLogSummary(date) {
  const entries = historyEntriesForDate(date);
  if (!entries.length) return { logged: false, pr: false };
  const hist = getHistory();
  const index = getExerciseIndex(hist);
  let pr = false;
  for (const e of entries) {
    const key = e.exId || e.name;
    const allSessions = index[key] ? index[key].sessions : [];
    const bestEver = Math.max(0, ...allSessions.map(s => sessionBestE1RM(s.sets)));
    const thisScore = sessionBestE1RM(e.sets);
    if (bestEver > 0 && thisScore >= bestEver && thisScore > 0) {
      // Confirm this session IS the best (guards against a later-in-history higher tie elsewhere)
      pr = true;
      break;
    }
  }
  return { logged: true, pr };
}
// Rolls up a trend arrow for a day: compares each logged exercise that day to its
// own immediately-preceding session (by e1RM), and returns the majority direction.
export function dayTrend(date) {
  const entries = historyEntriesForDate(date);
  if (!entries.length) return null;
  const hist = getHistory();
  const index = getExerciseIndex(hist);
  const dateStr = formatHistoryDate(date);
  let up = 0, down = 0, flat = 0;
  entries.forEach(e => {
    const key = e.exId || e.name;
    const sessions = index[key] ? index[key].sessions : [];
    const sorted = sessions.slice().sort((a,b) => parseSessionDate(a.date) - parseSessionDate(b.date));
    const thisIdx = sorted.findIndex(s => s.date === dateStr && JSON.stringify(s.sets) === JSON.stringify(e.sets));
    const cutIdx = thisIdx >= 0 ? thisIdx : sorted.length - 1;
    if (cutIdx <= 0) return; // no prior session to compare against
    const prevScore = sessionBestE1RM(sorted[cutIdx-1].sets);
    const thisScore = sessionBestE1RM(sorted[cutIdx].sets);
    if (prevScore <= 0) return;
    const pctChange = (thisScore - prevScore) / prevScore;
    if (Math.abs(pctChange) < 0.01) flat++;
    else if (pctChange > 0) up++;
    else down++;
  });
  if (up === 0 && down === 0 && flat === 0) return null;
  if (up > down) return 'up';
  if (down > up) return 'down';
  return 'flat';
}
// Per-exercise status (not day-level rollup) — used by week view's exercise
// list, where each logged exercise gets its own highlight rather than one
// shared per-day color. Compares this entry's e1RM against its all-time best
// (for PR) and its immediately-preceding session (for trend), reusing the
// same sessions/e1RM machinery as dayLogSummary/dayTrend above.
function exerciseEntryStatus(entry, date) {
  const hist = getHistory();
  const index = getExerciseIndex(hist);
  const key = entry.exId || entry.name;
  const allSessions = index[key] ? index[key].sessions : [];
  const thisScore = sessionBestE1RM(entry.sets);

  const bestEver = Math.max(0, ...allSessions.map(s => sessionBestE1RM(s.sets)));
  const pr = bestEver > 0 && thisScore >= bestEver && thisScore > 0;

  const dateStr = formatHistoryDate(date);
  const sorted = allSessions.slice().sort((a,b) => parseSessionDate(a.date) - parseSessionDate(b.date));
  const thisIdx = sorted.findIndex(s => s.date === dateStr && JSON.stringify(s.sets) === JSON.stringify(entry.sets));
  const cutIdx = thisIdx >= 0 ? thisIdx : sorted.length - 1;
  let trend = null;
  if (cutIdx > 0) {
    const prevScore = sessionBestE1RM(sorted[cutIdx-1].sets);
    if (prevScore > 0) {
      const pctChange = (thisScore - prevScore) / prevScore;
      trend = Math.abs(pctChange) < 0.01 ? 'flat' : (pctChange > 0 ? 'up' : 'down');
    }
  }
  return { pr, trend };
}
function dayLabelSuffix(date) {
  const dn = DAY_NAMES[date.getDay()];
  const sched = schedule[dn];
  if (!sched) return '';
  if (sched.restDay) return 'Rest';
  return sched.label.includes('—') ? sched.label.replace(/^.+?—\s*/, '').trim() : '';
}

/* ─── ROOT RENDER ─── */
export function renderCalendarRoot() {
  const container = document.getElementById('day-content');
  if (!container) return;
  destroyCharts();
  // Keep the legacy day-of-week variable in sync with whatever date is being
  // viewed — lots of existing code (rest-day toggle, copy-to-all-days, the
  // library's "add to day" flow, etc.) still reads `currentDay` directly.
  setCurrentDay(DAY_NAMES[viewedDate.getDay()]);

  const pill = `
    <div class="cal-pill" id="cal-pill">
      <button class="cal-pill-opt${calendarView==='day'?' active':''}" onclick="switchCalendarView('day')">Day</button>
      <button class="cal-pill-opt${calendarView==='week'?' active':''}" onclick="switchCalendarView('week')">Week</button>
      <button class="cal-pill-opt${calendarView==='month'?' active':''}" onclick="switchCalendarView('month')">Month</button>
      <button class="cal-pill-opt${calendarView==='year'?' active':''}" onclick="switchCalendarView('year')">Year</button>
    </div>`;

  let body = '';
  if (calendarView === 'day') { body = renderDayView(); }
  else { lastRenderWasPureRestScreen = false; if (calendarView === 'week') body = renderWeekView(); else if (calendarView === 'month') body = renderMonthView(); else body = renderYearView(); }

  container.innerHTML = `<div class="cal-wrap">${pill}${body}</div>`;

  if (calendarView === 'day') initDrag(DAY_NAMES[viewedDate.getDay()]);
  updateSnoreAudio();
}

// Stops the rest-day snoring loop whenever the plain rest screen stops being
// shown — leaving the Log tab, changing calendar view, or navigating to any
// other day all re-run renderCalendarRoot (or hide the tab), so this stays in
// sync automatically without needing its own teardown hooks elsewhere.
// Playback itself is no longer automatic (browsers block autoplay without a
// user gesture) — it's started by tapping the zzz animation, via
// toggleSnoreAudio() below.
function updateSnoreAudio() {
  const snore = document.getElementById('snore-player');
  if (!snore) return;
  const logTab = document.getElementById('tab-log');
  const logTabVisible = logTab && logTab.style.display !== 'none';
  const shouldStayOn = logTabVisible && calendarView === 'day' && lastRenderWasPureRestScreen;

  if (!shouldStayOn && !snore.paused) snore.pause();
}

// Tapping the zzz animation toggles the snoring loop on/off. Starting it
// pauses the music player (mirroring music.js's own pause-snore-on-start
// behavior), so only one audio source ever plays at once.
export function toggleSnoreAudio() {
  const snore = document.getElementById('snore-player');
  if (!snore) return;
  if (snore.paused) {
    if (isMusicPlaying()) pauseMusic();
    snore.play().catch(err => console.error('[snore] play() failed:', err));
  } else {
    snore.pause();
  }
}
registerSnorePauser(() => {
  const snore = document.getElementById('snore-player');
  if (snore && !snore.paused) snore.pause();
});

/* ─── DAY VIEW (this is the old Log tab, now date-aware) ─── */
function renderDayView() {
  const date = viewedDate;
  const dn = DAY_NAMES[date.getDay()];
  const day = schedule[dn];
  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = isSameDate(date, today);
  const labelSuffix = day.label.includes('—') ? day.label.replace(/^.+?—\s*/, '') : '';
  const u = currentUnits;
  const weekdayStr = date.toLocaleDateString('en-US', { weekday:'long' });
  const monthDayStr = date.toLocaleDateString('en-US', { month:'long', day:'numeric' });

  // A pure rest day (no custom-logged entry today) gets a static, uneditable
  // "Rest" title instead of the normal editable workout-title field — there's
  // nothing to name on a rest day.
  const customEntriesForTitle = historyEntriesForDate(date);
  const isPureRestDay = day.restDay && customEntriesForTitle.length === 0;

  const titleHtml = isPureRestDay
    ? `<div class="day-title-input day-title-readonly">Rest</div>`
    : dayEditMode
    ? `<input class="day-title-input" value="${escAttr(labelSuffix)}" placeholder="Add workout title..."
        oninput="schedule['${dn}'].label=FULL_DAYS['${dn}']+' — '+this.value;saveSchedule()">`
    : `<div class="day-title-input day-title-readonly">${labelSuffix ? escHtml(labelSuffix) : '<span class="day-title-placeholder">Add workout title…</span>'}</div>`;

  const top = `
    <div class="day-header cal-day-header">
      <div class="cal-day-date"><span class="cal-title-accent">${escHtml(weekdayStr)}</span> ${escHtml(monthDayStr)}</div>
      ${titleHtml}
      ${!isToday ? `<button class="cal-today-btn" onclick="jumpToDate(new Date())">Jump to today</button>` : ''}
      ${dayEditMode ? '<div class="edit-mode-badge">Editing</div>' : ''}
    </div>`;

  const actionsRow = `
    <div class="cal-day-actions-row">
      <button class="day-menu-btn cal-day-menu-btn" id="day-menu-btn" onclick="toggleDayMenu()" aria-label="Day options">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      <button class="cal-custom-log-btn" onclick="openCustomLogForViewedDate()" aria-label="Custom log">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </button>
      <button class="cal-add-exercise-btn" onclick="openLibV2ForDay('${dn}')" aria-label="Add exercise">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <div class="day-menu-dropdown" id="day-menu-dropdown">
        <button class="day-menu-item" onclick="closeDayMenu();toggleDayEditMode()">${dayEditMode?'Done editing':'Edit workout'}</button>
        <button class="day-menu-item" onclick="closeDayMenu();toggleRestDay()">${day.restDay?'Mark as workout day':'Mark as rest day'}</button>
        <button class="day-menu-item" onclick="closeDayMenu();confirmCopyDay()">Copy to all days</button>
        <button class="day-menu-item" onclick="closeDayMenu();confirmClearSession()">Clear session</button>
      </div>
    </div>`;

  // A rest day that has a custom-logged entry for this exact date shows as a normal
  // workout day instead of the rest screen, scoped only to this date.
  const customEntries = customEntriesForTitle;
  const hasCustomOnRestDay = day.restDay && customEntries.length > 0;

  if (isPureRestDay) {
    lastRenderWasPureRestScreen = true;
    // No overflow menu / custom-log button on the plain rest screen — nothing
    // there applies (can't edit/copy/clear a day with no workout, and custom
    // logging is what flips this into the hasCustomOnRestDay branch above).
    return top + `<div class="rest-screen"><div class="rest-zzz-wrap" onclick="toggleSnoreAudio()" role="button" aria-label="Play snoring sound"><span>z</span><span>Z</span><span>Z</span></div><p>Enjoy your recovery!</p><button class="btn" style="padding:8px 16px;border:1px solid var(--border2);border-radius:999px;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-weight:500" onclick="toggleRestDay()">Mark as workout day</button></div>`;
  }
  lastRenderWasPureRestScreen = false;

  if (day.restDay && hasCustomOnRestDay) {
    // Render the custom-logged sets read-only for this rest day (no scheduled exercises exist to log against).
    const rows = customEntries.map(e => {
      const bestW = Math.max(...e.sets.map(x => Number(x.weight)||0));
      return `<div class="exercise-card is-logged">
        <div class="ex-head"><div class="ex-head-text"><div class="ex-name">${escHtml(e.name)}</div></div></div>
        <div class="session-sets">${e.sets.map(x=>`<span class="pill${Number(x.weight)===bestW&&bestW>0?' pill-best':''}">${x.reps} × ${x.weight} ${u}</span>`).join('')}</div>
      </div>`;
    }).join('');
    return top + actionsRow + `<div id="drag-zone">${rows}</div><button class="add-exercise-btn" onclick="openCustomLog('${formatISODate(date)}')">+ Add another custom entry</button>`;
  }

  const exCards = day.exercises.length === 0
    ? '<div class="empty">No exercises yet — tap the + above to add one from your library.</div>'
    : day.exercises.map((rawEx, i) => {
        const ex = resolveScheduledExercise(rawEx);
        const data = getSetData(dn, i);
        const meta = [ex.reps ? ex.reps + ' reps' : '', ex.sets ? ex.sets + ' sets' : '', (ex.type==='custom'&&ex.duration) ? ex.duration : '', ex.rest ? ex.rest + ' rest' : ''].filter(Boolean).join(' · ');
        const noteHtml = ex.note ? `<div class="ex-note">${escHtml(ex.note)}</div>` : '';
        const hasBlurb = !!(ex.blurb && ex.blurb.trim());
        const infoHtml = (showInstructionsIcons && hasBlurb)
          ? `<button class="ex-info-btn" onclick="event.stopPropagation();openExerciseInstructions('${escAttr(ex.name).replace(/'/g, "\\'")}')" aria-label="View instructions">?</button>`
          : '';

        if (ex.type === 'custom') {
          return `<div class="exercise-card${data.logged?' is-logged':''}" data-idx="${i}">
            ${!dayEditMode?infoHtml:''}
            <div class="ex-head">
              ${dayEditMode?'<span class="ex-drag">⠿</span>':''}
              <div class="ex-head-text">
              <div class="ex-name" onclick="openExerciseHistory('${escAttr(ex.exId || ex.name).replace(/'/g, "\\'")}')">${escHtml(ex.name)}</div>
                ${meta?`<div class="ex-meta">${meta}</div>`:''}
                ${noteHtml}
              </div>
              ${dayEditMode?`<button class="ex-x" onclick="removeExercise('${dn}',${i})" aria-label="Remove">✕</button>`:''}
            </div>
          </div>`;
        }

        const dateKey = formatHistoryDate(date);
        const histAll = getHistory();
        const todaysEntry = (histAll[dateKey] || []).find(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
        const setNumber = (todaysEntry ? todaysEntry.sets.length : 0) + 1;

        const rows = data.sets.map((s, si) => `
          <div class="set-row">
            <span class="set-num">${setNumber}</span>
            <input class="set-input" type="number" min="0" placeholder="Reps" value="${escAttr(s.reps)}" data-day="${dn}" data-ex="${i}" data-si="${si}" data-reps="1" ${data.logged?'disabled':''}>
            <input class="set-input" type="number" min="0" placeholder="Weight" value="${escAttr(s.weight)}" data-day="${dn}" data-ex="${i}" data-si="${si}" data-weight="1" ${data.logged?'disabled':''}>
          </div>`).join('');

        const timerKey = timerKeyFor(dn, i, formatISODate(date));
        const timer = exerciseTimers[timerKey];
        let logBtnHtml;
        if (timer && timer.secsLeft > 0) {
          const m = Math.floor(timer.secsLeft/60), s = timer.secsLeft%60;
          const display = m + ':' + String(s).padStart(2,'0');
          logBtnHtml = `<button class="log-sets-btn timing" id="logbtn-${timerKey}" onclick="skipExerciseTimer('${dn}',${i},'${formatISODate(date)}')">Rest <span class="timer-count">${display}</span></button>`;
        } else {
          logBtnHtml = `<button class="log-sets-btn" onclick="logExerciseOnDate('${dn}',${i},'${formatISODate(date)}')">Log sets</button>`;
        }

        return `<div class="exercise-card${data.logged?' is-logged':''}" data-idx="${i}">
          ${!dayEditMode?infoHtml:''}
          <div class="ex-head">
            ${dayEditMode?'<span class="ex-drag">⠿</span>':''}
            <div class="ex-head-text">
              <div class="ex-name" onclick="openExerciseHistory('${escAttr(ex.exId || ex.name).replace(/'/g, "\\'")}')">${escHtml(ex.name)}</div>
              ${meta?`<div class="ex-meta">${meta}</div>`:''}
              ${noteHtml}
            </div>
            ${dayEditMode?`<button class="ex-x" onclick="removeExercise('${dn}',${i})" aria-label="Remove">✕</button>`:''}
          </div>
          <div class="sets-table">
            <div class="sets-thead">
              <span class="sets-thead-cell center">Set</span>
              <span class="sets-thead-cell center">Reps</span>
              <span class="sets-thead-cell center">Weight (${u})</span>
            </div>
            ${rows}
          </div>
          <div class="card-footer">
            ${logBtnHtml}
          </div>
        </div>`;
      }).join('');

  return top + actionsRow + `<div id="drag-zone">${exCards}</div>`;
}

// Writes history under an arbitrary date instead of always "today".
// NOTE: the actual history write is deliberately deferred until the rest
// timer finishes or is skipped (see commitPendingSet, called from
// timers.js's finishTimer). Logging a set only locks the inputs and starts
// the timer here — set number, reps, and weight stay exactly as logged
// on-screen throughout the rest period, only advancing once rest is done.
// This function is registered with timers.js via registerSetCommitter at
// load time (bottom of this file) so timers.js can trigger the write
// without importing calendar.js's history internals directly.
export function logExerciseOnDate(d, idx, isoDate) {
  flushInputs();
  const data = getSetData(d, idx);
  const valid = data.sets.filter(s => s.reps !== '' || s.weight !== '');
  if (!valid.length) return;
  const ex = schedule[d].exercises[idx];
  // Stash exactly what was entered — this is what commitPendingSet will
  // write to history once rest ends. Keeping it on `data` (not local scope)
  // means it survives the re-render that happens right after this call.
  data.pendingSets = valid.map(s => ({ reps: s.reps, weight: s.weight }));
  data.logged = true;
  renderCalendarRoot();
  startTimer(ex.restSecs || 90, d, idx, isoDate);
}

// Called by timers.js when a rest timer finishes naturally or is skipped.
// This is where the pending set actually gets written to history — the
// point at which the set number, reps, and weight are allowed to advance.
export function commitPendingSet(d, idx, isoDate) {
  const date = parseISODate(isoDate);
  const data = getSetData(d, idx);
  const pending = data.pendingSets;
  if (!pending || !pending.length) return;
  const dateKey = formatHistoryDate(date);
  const hist = getHistory();
  if (!hist[dateKey]) hist[dateKey] = [];
  const ex = schedule[d] && schedule[d].exercises[idx];
  if (!ex) return;
  const bw = ex.type === 'bodyweight' ? getCleanBw() : null;
  // loggedAt is new as of this change — purely additive, used only for
  // deriving rough session-length stats going forward. Existing history
  // entries predate this and simply won't have it; any code reading it must
  // treat a missing loggedAt as "no timing data available," not as 0/invalid.
  const now = Date.now();
  const newSets = pending.map(s => {
    const weight = s.weight !== '' ? Number(s.weight)||0 : (bw != null ? bw : 0);
    return { reps: Number(s.reps)||0, weight, loggedAt: now };
  });
  const existing = hist[dateKey].findIndex(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
  if (existing >= 0) {
    hist[dateKey][existing].sets = hist[dateKey][existing].sets.concat(newSets);
  } else {
    hist[dateKey].push({ exId: ex.exId||'', name: ex.name, sets: newSets });
  }
  saveHistory(hist);
  data.pendingSets = null;
}
registerSetCommitter(commitPendingSet);
/* ─── WEEK VIEW ─── */
function renderWeekView() {
  const weekStart = startOfWeek(viewedDate);
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const label = sameMonth
    ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}`
    : `${MONTH_NAMES[weekStart.getMonth()].slice(0,3)} ${weekStart.getDate()} – ${MONTH_NAMES[weekEnd.getMonth()].slice(0,3)} ${weekEnd.getDate()}`;

  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i));

  return `
    <div class="cal-card-header">
      <div class="cal-card-header-top">
        <div class="cal-title"><span class="cal-title-accent">${escHtml(label)}</span></div>
      </div>
    </div>
    <div class="cal-week-list">
      ${days.map(d => calWeekRowHtml(d)).join('')}
    </div>`;
}

/* ─── MONTH VIEW ─── */
function renderMonthView() {
  const first = startOfMonth(viewedDate);
  const gridStart = addDays(first, -first.getDay());
  const totalDays = daysInMonth(viewedDate);
  const lastOfMonth = new Date(viewedDate.getFullYear(), viewedDate.getMonth(), totalDays);
  const gridEnd = addDays(lastOfMonth, 6 - lastOfMonth.getDay());
  const cells = [];
  let cur = gridStart;
  while (cur <= gridEnd) { cells.push(cur); cur = addDays(cur, 1); }

  const dowHeaders = ['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => `<div class="cal-dow">${d}</div>`).join('');

  return `
    <div class="cal-card-header">
      <div class="cal-card-header-top">
        <div class="cal-title">
          <span class="cal-title-accent">${MONTH_NAMES[viewedDate.getMonth()].toUpperCase()}</span> ${viewedDate.getFullYear()}
        </div>
      </div>
    </div>
    <div class="cal-grid cal-grid-month">
      ${dowHeaders}
      ${cells.map(d => calDayCellHtml(d, d.getMonth() === viewedDate.getMonth())).join('')}
    </div>`;
}
function calDayCellHtml(date, inCurrentPeriod) {
  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = isSameDate(date, today);
  const summary = dayLogSummary(date);
  const trend = dayTrend(date);
  // PR takes visual priority over a plain up/down/flat trend.
  const highlightClass = summary.pr ? 'cal-trend-pr' : (trend ? 'cal-trend-' + trend : '');
  const label = dayLabelSuffix(date);
  const bottom = label ? `<div class="cal-cell-label${highlightClass ? ' ' + highlightClass : ''}">${escHtml(label)}</div>` : '';
  return `<div class="cal-cell${inCurrentPeriod?'':' cal-cell-dim'}" onclick="jumpToDate(new Date(${date.getFullYear()},${date.getMonth()},${date.getDate()}))">
    <div class="cal-cell-top">
      <span class="cal-cell-date${isToday?' cal-cell-date-today':''}">${date.getDate()}</span>
    </div>
    ${bottom}
  </div>`;
}

/* Week view — one row per day, full weekday name on the left so nothing gets
   cut off, with the day's badge and logged exercises alongside. */
function calWeekRowHtml(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = isSameDate(date, today);
  const entries = historyEntriesForDate(date);
  const exList = entries.length
    ? `<div class="cal-week-row-exercises">${entries.map(e => {
        const status = exerciseEntryStatus(e, date);
        const cls = status.pr ? 'cal-trend-pr' : (status.trend ? 'cal-trend-' + status.trend : '');
        return `<div class="cal-week-row-ex${cls ? ' ' + cls : ''}">${escHtml(e.name)}</div>`;
      }).join('')}</div>`
    : '';
  const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const workoutLabel = dayLabelSuffix(date);
  return `<div class="cal-week-row" onclick="jumpToDate(new Date(${date.getFullYear()},${date.getMonth()},${date.getDate()}))">
    <div class="cal-week-row-head">
      <span class="cal-week-row-day${isToday?' cal-cell-date-today':''}">${weekdayName}</span>
      <span class="cal-week-row-date${isToday?' cal-cell-date-today':''}">${date.getDate()}</span>
      ${workoutLabel ? `<span class="cal-week-row-workout${workoutLabel==='Rest'?' cal-week-row-rest':''}">${escHtml(workoutLabel)}</span>` : ''}
    </div>
    ${exList}
  </div>`;
}

/* ─── YEAR VIEW ─── */
function renderYearView() {
  const year = viewedDate.getFullYear();
  const now = new Date();
  const isCurrentYear = year === now.getFullYear();
  const currentMonthIdx = now.getMonth();
  return `
    <div class="cal-card-header">
      <div class="cal-title">${year}</div>
    </div>
    <div class="cal-year-list">
      ${MONTH_NAMES.map((m,i) => `<button class="cal-year-item${isCurrentYear && i === currentMonthIdx ? ' cal-year-item-current' : ''}" onclick="jumpToMonth(${i},${year})"><span>${m}</span><span class="cal-year-item-chev">›</span></button>`).join('')}
    </div>`;
}

/* Dismiss month dropdown on outside click */
document.addEventListener('click', (e) => {
  if (!e.target.closest('#cal-month-title') && !e.target.closest('#cal-month-dropdown')) {
    document.getElementById('cal-month-dropdown')?.classList.remove('show');
  }
});

/* Dismiss day options dropdown on outside click — previously required
   pressing the menu button again to close; this matches the standard
   tap-outside-to-dismiss behavior the month dropdown already has. */
document.addEventListener('click', (e) => {
  if (!e.target.closest('#day-menu-btn') && !e.target.closest('#day-menu-dropdown')) {
    document.getElementById('day-menu-dropdown')?.classList.remove('show');
  }
});

// Give schedule-day.js's legacy renderDayContent() a way to trigger our render
// without creating a circular top-level import (see registerCalendarRenderer
// in schedule-day.js for the rationale).
registerCalendarRenderer(renderCalendarRoot);
