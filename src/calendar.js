/* ════════════════════════════════════════════
   Tally Up — Calendar (Day / Week / Month / Year)
   ════════════════════════════════════════════ */
import { KEYS, DAY_NAMES, schedule, currentDay, setCurrentDay, dayEditMode, currentUnits,
         sessionSets, exerciseTimers, showInstructionsIcons, getHistory, saveHistory, getCleanBw,
         viewedDate, setViewedDate, formatISODate, parseISODate, cloneDate,
         escAttr, escHtml } from './state.js';
import { flushInputs, resolveScheduledExercise, getSetData, registerCalendarRenderer } from './schedule-day.js';
import { destroyCharts, getExerciseIndex, sessionBestE1RM, parseSessionDate } from './history.js';
import { timerKeyFor, startTimer } from './timers.js';
import { initDrag } from './drag.js';

/* ─── STATE ─── */
export let calendarView = 'day';       // 'day' | 'week' | 'month' | 'year'
export let monthViewMode = localStorage.getItem(KEYS.monthViewMode) || 'trends';   // 'labels' | 'trends' | 'none'

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
export function setMonthViewMode(mode) {
  // "labels" and "trends" are mutually exclusive; clicking an active one turns it off.
  monthViewMode = (monthViewMode === mode) ? 'none' : mode;
  localStorage.setItem(KEYS.monthViewMode, monthViewMode);
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
  if (calendarView === 'day') body = renderDayView();
  else if (calendarView === 'week') body = renderWeekView();
  else if (calendarView === 'month') body = renderMonthView();
  else body = renderYearView();

  container.innerHTML = `<div class="cal-wrap">${pill}${body}</div>`;

  if (calendarView === 'day') initDrag(DAY_NAMES[viewedDate.getDay()]);
}

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

  const titleHtml = dayEditMode
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
      <button class="cal-custom-log-btn" onclick="openCustomLog(formatISODate(viewedDate))" aria-label="Custom log">
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
  const customEntries = historyEntriesForDate(date);
  const hasCustomOnRestDay = day.restDay && customEntries.length > 0;

  if (day.restDay && !hasCustomOnRestDay) {
    return top + actionsRow + `<div class="rest-screen"><p>Rest day — enjoy your recovery.</p><button class="btn" style="padding:8px 16px;border:1px solid var(--border2);border-radius:999px;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-weight:500" onclick="toggleRestDay()">Mark as workout day</button></div>`;
  }

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
    ? (dayEditMode
        ? '<div class="empty">No exercises yet — tap “+ Add exercise” below to pick one from your library.</div>'
        : '<div class="empty">No exercises yet — tap the ••• menu above and choose “Edit workout” to add some.</div>')
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
            <button class="del-set" onclick="clearSet('${dn}',${i},${si})" ${data.logged?'disabled':''} aria-label="Clear">✕</button>
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
              <span></span>
            </div>
            ${rows}
          </div>
          <div class="card-footer">
            ${logBtnHtml}
          </div>
        </div>`;
      }).join('');

  const addBtn = dayEditMode ? `<button class="add-exercise-btn" onclick="openLibV2ForDay('${dn}')">+ Add exercise</button>` : '';
  return top + actionsRow + `<div id="drag-zone">${exCards}</div>` + addBtn;
}

// Writes history under an arbitrary date instead of always "today".
export function logExerciseOnDate(d, idx, isoDate) {
  flushInputs();
  const date = parseISODate(isoDate);
  const data = getSetData(d, idx);
  const valid = data.sets.filter(s => s.reps !== '' || s.weight !== '');
  if (!valid.length) return;
  const dateKey = formatHistoryDate(date);
  const hist = getHistory();
  if (!hist[dateKey]) hist[dateKey] = [];
  const ex = schedule[d].exercises[idx];
  const bw = ex.type === 'bodyweight' ? getCleanBw() : null;
  const newSets = valid.map(s => {
    const weight = s.weight !== '' ? Number(s.weight)||0 : (bw != null ? bw : 0);
    return { reps: Number(s.reps)||0, weight };
  });
  const existing = hist[dateKey].findIndex(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
  if (existing >= 0) {
    hist[dateKey][existing].sets = hist[dateKey][existing].sets.concat(newSets);
  } else {
    hist[dateKey].push({ exId: ex.exId||'', name: ex.name, sets: newSets });
  }
  saveHistory(hist);
  data.logged = true;
  data.lastLoggedCount = newSets.length;
  renderCalendarRoot();
  startTimer(ex.restSecs || 90, d, idx, isoDate);
}
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
      ${monthModeToggleHtml()}
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
      ${monthModeToggleHtml()}
    </div>
    <div class="cal-grid cal-grid-month">
      ${dowHeaders}
      ${cells.map(d => calDayCellHtml(d, d.getMonth() === viewedDate.getMonth())).join('')}
    </div>`;
}
function monthModeToggleHtml() {
  return `
    <div class="cal-mode-toggles">
      <button class="cal-mode-toggle" onclick="setMonthViewMode('labels')">
        <span>Day Labels</span>
        <span class="cal-mode-dot${monthViewMode==='labels'?' filled':''}"></span>
      </button>
      <button class="cal-mode-toggle" onclick="setMonthViewMode('trends')">
        <span>Daily Trends</span>
        <span class="cal-mode-dot${monthViewMode==='trends'?' filled':''}"></span>
      </button>
    </div>`;
}
function calDayCellHtml(date, inCurrentPeriod) {
  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = isSameDate(date, today);
  const summary = dayLogSummary(date);
  const badge = summary.logged
    ? (summary.pr
        ? `<span class="cal-cell-badge cal-cell-pr" title="PR">★</span>`
        : `<span class="cal-cell-badge cal-cell-check" title="Logged">✓</span>`)
    : '';
  let bottom = '';
  if (monthViewMode === 'labels') {
    const label = dayLabelSuffix(date);
    if (label) bottom = `<div class="cal-cell-label">${escHtml(label)}</div>`;
  } else if (monthViewMode === 'trends') {
    const trend = dayTrend(date);
    if (trend) bottom = `<div class="cal-cell-trend cal-trend-${trend}">${trendArrowSvg(trend)}</div>`;
  }
  return `<div class="cal-cell${inCurrentPeriod?'':' cal-cell-dim'}" onclick="jumpToDate(new Date(${date.getFullYear()},${date.getMonth()},${date.getDate()}))">
    <div class="cal-cell-top">
      <span class="cal-cell-date${isToday?' cal-cell-date-today':''}">${date.getDate()}</span>
      ${badge}
    </div>
    ${bottom}
  </div>`;
}

/* Week view — one row per day, full weekday name on the left so nothing gets
   cut off, with the day's badge and logged exercises alongside. */
function calWeekRowHtml(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const isToday = isSameDate(date, today);
  const summary = dayLogSummary(date);
  const badge = summary.logged
    ? (summary.pr
        ? `<span class="cal-cell-badge cal-cell-pr" title="PR">★</span>`
        : `<span class="cal-cell-badge cal-cell-check" title="Logged">✓</span>`)
    : '';
  let modeBit = '';
  if (monthViewMode === 'labels') {
    const label = dayLabelSuffix(date);
    if (label) modeBit = `<div class="cal-week-row-tag">${escHtml(label)}</div>`;
  } else if (monthViewMode === 'trends') {
    const trend = dayTrend(date);
    if (trend) modeBit = `<div class="cal-cell-trend cal-trend-${trend}">${trendArrowSvg(trend)}</div>`;
  }
  const entries = historyEntriesForDate(date);
  const exList = entries.length
    ? `<div class="cal-week-row-exercises">${entries.map(e => `<span class="cal-week-row-ex">${escHtml(e.name)}</span>`).join('')}</div>`
    : '';
  const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  return `<div class="cal-week-row" onclick="jumpToDate(new Date(${date.getFullYear()},${date.getMonth()},${date.getDate()}))">
    <div class="cal-week-row-head">
      <span class="cal-week-row-day${isToday?' cal-cell-date-today':''}">${weekdayName}</span>
      <span class="cal-week-row-date${isToday?' cal-cell-date-today':''}">${date.getDate()}</span>
      ${badge}
    </div>
    ${modeBit}
    ${exList}
  </div>`;
}
function trendArrowSvg(dir) {
  if (dir === 'up') return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="18" x2="18" y2="6"/><polyline points="9 6 18 6 18 15"/></svg>`;
  if (dir === 'down') return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><polyline points="18 9 18 18 9 18"/></svg>`;
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
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

// Give schedule-day.js's legacy renderDayContent() a way to trigger our render
// without creating a circular top-level import (see registerCalendarRenderer
// in schedule-day.js for the rationale).
registerCalendarRenderer(renderCalendarRoot);
