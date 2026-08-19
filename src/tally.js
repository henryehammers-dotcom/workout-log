/* ════════════════════════════════════════════
   Tally Up — Tally page (swipe-up sheet)
   Opens on every app launch (see main.js init) and via the tally icon in
   the Log tab header. Always live-recomputed from current history/profile
   state on open — no cached daily snapshot, no once-per-day gating.
   Supersedes greeting.js, which is left in place unused for easy rollback.
   ════════════════════════════════════════════ */
import { KEYS, schedule, DAY_NAMES, FULL_DAYS, getProfile, getCleanBw,
         currentUnits, TALLY_BOX_DEFS, getTallyLayout, saveTallyLayout,
         getTallyHidden, saveTallyHidden, FREQUENCY_UPPER_BOUND,
         escHtml, escAttr, getHistory } from './state.js';
import { formatHistoryDate } from './calendar.js';
import {
  getWeeklyQuotaProgress, getStreaks, getWeeklyAvgSessionMinutes,
  getMuscleGroupsNeedingAttention, estimateCalorieRange, classifySessionType,
  getRecentDayTrends, getTotalWeightLiftedLbs, getMilestoneWindow,
  getExerciseIndex, getHistoryDisplayNames, getDayTrendBreakdown,
} from './history.js';

/* ─── UNIT CONVERSION (display only — all storage stays lbs) ─── */
function lbsToDisplay(lbs) {
  if (currentUnits === 'kg') return Math.round((lbs / 2.20462) * 10) / 10;
  return Math.round(lbs * 10) / 10;
}
function fmtWeight(lbs) {
  return lbsToDisplay(lbs).toLocaleString() + ' ' + currentUnits;
}
// This app has no icon font loaded (only raw inline SVG icons throughout
// index.html) — this was the bug behind "no icons anywhere": every ti-*
// class reference rendered as an empty element. Real inline SVGs from here on.
function filterIconSvg(onclickAttr, label) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer;flex-shrink:0" onclick="event.stopPropagation();${onclickAttr}" role="button" aria-label="${label}"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
}
function checkIconSvg() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
}
function medalIconSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>`;
}
function flameIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
}
function calendarIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
}
function trendUpIconSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
}

/* ─── SHEET OPEN / CLOSE / SWIPE ─── */
export function openTallySheet() {
  renderTallySheet();
  document.getElementById('tally-overlay')?.classList.add('show');
}
export function closeTallySheet() {
  document.getElementById('tally-overlay')?.classList.remove('show');
  _restBoxesRevealed = false; // rest-day reveal is per-viewing, not sticky across opens
}
// Called at the end of app init (see main.js) — opens on every launch per
// spec (no once-per-day gating, unlike the old greeting).
export function openTallySheetOnLaunch() {
  if (!localStorage.getItem(KEYS.welcomed)) return; // not onboarded yet
  openTallySheet();
}

let _dragStartY = null, _dragCurrentY = null, _dragging = false;
export function tallySheetDragStart(clientY) {
  _dragStartY = clientY; _dragCurrentY = clientY; _dragging = true;
  document.getElementById('tally-sheet')?.classList.add('dragging');
}
export function tallySheetDragMove(clientY) {
  if (!_dragging) return;
  _dragCurrentY = clientY;
  const delta = Math.max(0, clientY - _dragStartY); // only allow dragging down
  const sheet = document.getElementById('tally-sheet');
  if (sheet) sheet.style.transform = `translateY(${delta}px)`;
}
export function tallySheetDragEnd() {
  if (!_dragging) return;
  _dragging = false;
  const sheet = document.getElementById('tally-sheet');
  const delta = _dragCurrentY - _dragStartY;
  sheet?.classList.remove('dragging');
  if (sheet) sheet.style.transform = '';
  // Dismiss if dragged down more than ~110px, a typical native bottom-sheet
  // dismiss threshold — otherwise it springs back via the sheet's own CSS
  // transition now that the inline transform's been cleared.
  if (delta > 110) closeTallySheet();
  _dragStartY = null; _dragCurrentY = null;
}
function wireSheetSwipe() {
  const grabber = document.getElementById('tally-grabber');
  const sheet = document.getElementById('tally-sheet');
  if (!grabber || !sheet || grabber.dataset.wired) return;
  grabber.dataset.wired = '1';
  grabber.addEventListener('touchstart', e => tallySheetDragStart(e.touches[0].clientY), { passive: true });
  grabber.addEventListener('touchmove', e => { e.preventDefault(); tallySheetDragMove(e.touches[0].clientY); }, { passive: false });
  grabber.addEventListener('touchend', tallySheetDragEnd);
  grabber.addEventListener('mousedown', e => {
    tallySheetDragStart(e.clientY);
    const onMove = ev => tallySheetDragMove(ev.clientY);
    const onUp = () => { tallySheetDragEnd(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* ─── STAT COMPUTATION (pulls together every history.js/state.js helper
   into one snapshot for a single render pass) ─── */
function parseDateLoose(str) {
  const parts = str.split(',').map(s => s.trim());
  const monthDay = parts[1] || '';
  const yearPart = parts[2];
  const d = new Date(`${monthDay} ${yearPart || new Date().getFullYear()}`);
  return isNaN(d) ? new Date(0) : d;
}
// Scans every exercise's session history for the single most recent PR
// (matches history.js's own pr classification: a session's e1RM strictly
// exceeds every session before it). Used by the PR highlight/box.
function findMostRecentPR(hist) {
  const index = getExerciseIndex(hist);
  let best = null; // { name, date, weight, reps }
  Object.values(index).forEach(entry => {
    const sessions = entry.sessions;
    const e1rmSeries = sessions.map(s => Math.max(0, ...s.sets.map(x => {
      const w = Number(x.weight)||0, r = Number(x.reps)||0; return r>0 ? w*(1+r/30) : 0;
    })));
    sessions.forEach((s, i) => {
      const v = e1rmSeries[i];
      if (v <= 0) return;
      const priorBest = i === 0 ? -1 : Math.max(...e1rmSeries.slice(0, i));
      const isPR = i === 0 || v > priorBest;
      if (!isPR) return;
      if (!best || parseDateLoose(s.date) > parseDateLoose(best.date)) {
        const bestSet = s.sets.reduce((a, b) => {
          const ea = (Number(a.weight)||0) * (1 + (Number(a.reps)||0)/30);
          const eb = (Number(b.weight)||0) * (1 + (Number(b.reps)||0)/30);
          return eb > ea ? b : a;
        }, s.sets[0]);
        best = { name: entry.name, date: s.date, weight: bestSet.weight, reps: bestSet.reps };
      }
    });
  });
  return best;
}
function computeTallyStats() {
  const profile = getProfile();
  const now = new Date();
  const quota = getWeeklyQuotaProgress(profile.targetFrequency, now);
  const streaks = getStreaks(now);
  const avgSession = getWeeklyAvgSessionMinutes(now);
  const threshold = FREQUENCY_UPPER_BOUND[profile.targetFrequency] || 3;
  const attention = getMuscleGroupsNeedingAttention(profile.priorityMuscles, threshold, now);
  const totalLbs = getTotalWeightLiftedLbs();
  const milestoneWindow = getMilestoneWindow(totalLbs, 2);
  const recentTrends = getRecentDayTrends(7, now, _trendExerciseFilter.length ? _trendExerciseFilter : null);
  const hist = getHistory();
  const loggedDayCount = Object.keys(hist).filter(k => hist[k] && hist[k].length).length;
  const setsCompleted = Object.values(hist).reduce((sum, entries) =>
    sum + entries.reduce((s2, e) => s2 + e.sets.length, 0), 0);
  const mostRecentPR = findMostRecentPR(hist);
  return { profile, quota, streaks, avgSession, attention, totalLbs, milestoneWindow, recentTrends, loggedDayCount, setsCompleted, mostRecentPR };
}

/* ─── HEADER (day label, workout name, rest-day banner) ─── */
let _restBoxesRevealed = false;
export function toggleTallyRestReveal() {
  _restBoxesRevealed = !_restBoxesRevealed;
  applyRestRevealState();
}
function applyRestRevealState() {
  const boxesEl = document.getElementById('tally-boxes');
  const titleEl = document.getElementById('tally-section-title');
  const btn = document.getElementById('tally-show-anyway-btn');
  if (_restBoxesRevealed) {
    boxesEl?.classList.remove('hide');
    titleEl?.classList.remove('hide');
    if (btn) btn.textContent = 'Hide Tally';
  } else {
    boxesEl?.classList.add('hide');
    titleEl?.classList.add('hide');
    if (btn) btn.textContent = 'Show Tally';
  }
}
function renderHeader() {
  const name = localStorage.getItem(KEYS.name) || '';
  const day = DAY_NAMES[new Date().getDay()];
  const dayFull = FULL_DAYS[day];
  const sched = schedule[day];
  const dayLabelEl = document.getElementById('tally-day-label');
  if (dayLabelEl) dayLabelEl.textContent = name ? `Happy ${dayFull}, ${name}!` : `Happy ${dayFull}!`;
  const workoutLabelEl = document.getElementById('tally-workout-label');
  const restBanner = document.getElementById('tally-rest-banner');
  const boxesEl = document.getElementById('tally-boxes');
  const titleEl = document.getElementById('tally-section-title');

  if (sched.restDay) {
    if (workoutLabelEl) workoutLabelEl.innerHTML = 'Today is a <strong>Rest Day</strong>';
    if (restBanner) restBanner.style.display = '';
    applyRestRevealState();
  } else {
    const suffix = sched.label.includes('—') ? sched.label.replace(/^.+?—\s*/, '').trim() : '';
    if (workoutLabelEl) workoutLabelEl.textContent = suffix ? `Today's workout is ${suffix}` : "Today's workout";
    if (restBanner) restBanner.style.display = 'none';
    boxesEl?.classList.remove('hide');
    titleEl?.classList.remove('hide');
  }
}

/* ─── HIGHLIGHT BAR (4 modes, fixed size/position — whichever mode ISN'T
   active for the user's goal still renders as a regular box further down,
   via the matching id in BOX_RENDERERS below) ─── */
function highlightModeForGoal(goal) {
  if (goal === 'strength' || goal === 'muscle') return 'prCallout';
  if (goal === 'consistency') return 'weekCheckmarks';
  if (goal === 'fitness') return 'calorieRow';
  if (goal === 'weight_loss') return 'weightDeltaCombined'; // calorie row + weight delta combined, per spec
  return 'prCallout'; // no goal set yet (shouldn't happen post-onboarding) — safe default
}
// The real TALLY_BOX_DEFS id that a highlight mode duplicates — used to
// exclude that box from the regular grid and the add-picker, so it can
// never appear twice (once as the fixed highlight, once as a normal box).
// weightDeltaCombined isn't a real box id itself; it renders calorieRow's
// content with a delta appended, so calorieRow is what needs excluding.
function highlightModeBoxId(mode) {
  return mode === 'weightDeltaCombined' ? 'calorieRow' : mode;
}
function loggedDateKeySetThisWeek() {
  const hist = getHistory();
  const set = new Set();
  Object.keys(hist).forEach(k => { if (hist[k] && hist[k].length) set.add(k); });
  return set;
}
function weekCheckmarkDots(loggedDateKeys) {
  const today = new Date();
  const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday); d.setDate(d.getDate() + i);
    const key = formatHistoryDate(d);
    days.push({ label: 'SMTWTFS'[i], logged: loggedDateKeys.has(key) });
  }
  return days;
}
function renderPRHighlightInner(stats) {
  const pr = stats.mostRecentPR;
  if (!pr) {
    return `<div style="display:flex;align-items:center;gap:12px">${medalIconSvg()}<div><div class="tally-box-label" style="margin:0">Recent PR</div><div class="tally-box-sub">Log a session to start tracking PRs.</div></div></div>`;
  }
  return `<div style="display:flex;align-items:center;gap:12px">
    ${medalIconSvg()}
    <div>
      <div class="tally-box-label" style="margin:0">Heaviest ever</div>
      <div class="tally-box-value">${escHtml(pr.name)}</div>
      <div class="tally-box-sub">${fmtWeight(Number(pr.weight)||0)} × ${pr.reps}, on ${escHtml(pr.date.replace(/\w+,\s/,''))}</div>
    </div>
  </div>`;
}
function renderWeekCheckmarksInner() {
  const days = weekCheckmarkDots(loggedDateKeySetThisWeek());
  const dotsHtml = days.map(d => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1">
      <span style="font-size:11px;color:var(--text3)">${d.label}</span>
      <span style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;
        background:${d.logged ? '#3fb87f' : 'transparent'};
        border:1.5px solid ${d.logged ? '#3fb87f' : '#ccc'};
        color:${d.logged ? '#fff' : '#999'}">${d.logged ? '✓' : ''}</span>
    </div>`).join('');
  return `<div class="tally-box-label">This week</div><div style="display:flex;gap:4px;margin-top:8px">${dotsHtml}</div>`;
}
// Duration used for the calorie estimate row: the week's derived avg
// session length if available (real data), else a flat 45min placeholder —
// clearly approximate either way, which is exactly why this box shows a
// range rather than a single number.
function calorieEstimateDuration(stats) {
  return stats.avgSession.avgMinutes != null ? stats.avgSession.avgMinutes : 45;
}
function renderCalorieRowInner(stats, includeWeightDelta) {
  const bw = getCleanBw(); // in currentUnits
  const bwLbs = bw != null ? (currentUnits === 'kg' ? bw * 2.20462 : bw) : null;
  const hist = getHistory();
  const today = new Date();
  const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const mins = calorieEstimateDuration(stats);
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday); d.setDate(d.getDate() + i);
    const key = formatHistoryDate(d);
    const entries = hist[key];
    let rangeStr = '—';
    if (entries && entries.length && bwLbs != null) {
      const type = classifySessionType(key);
      const range = estimateCalorieRange(bwLbs, mins, type);
      if (range) rangeStr = `${range.low}-${range.high}`;
    }
    cells.push({ label: 'SMTWTFS'[i], rangeStr });
  }
  const cellsHtml = cells.map(c => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
      <span style="font-size:11px;color:var(--text3)">${c.label}</span>
      <span style="font-size:11px;color:var(--text2);font-variant-numeric:tabular-nums">${c.rangeStr}</span>
    </div>`).join('');
  let deltaHtml = '';
  if (includeWeightDelta) {
    deltaHtml = `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div class="tally-box-label">Weight this week</div>
      <div class="tally-box-value">${bw != null ? bw + ' ' + currentUnits : '—'}</div>
    </div>`;
  }
  return `<div class="tally-box-label">Estimated calories</div>
    <div style="display:flex;gap:4px;margin-top:8px">${cellsHtml}</div>
    ${bwLbs == null ? '<div class="tally-box-sub" style="margin-top:8px">Add your weight in Settings for calorie estimates.</div>' : ''}
    ${deltaHtml}`;
}
function renderHighlightBarHtml(stats) {
  const mode = highlightModeForGoal(stats.profile.goal);
  let inner;
  if (mode === 'prCallout') inner = renderPRHighlightInner(stats);
  else if (mode === 'weekCheckmarks') inner = renderWeekCheckmarksInner();
  else if (mode === 'calorieRow') inner = renderCalorieRowInner(stats, false);
  else inner = renderCalorieRowInner(stats, true); // weightDeltaCombined
  const highlightHtml = `<div class="tally-box-row full"><div class="tally-box highlight">${inner}</div></div>`;
  return highlightHtml + renderWeeklyQuotaPill(stats);
}
// Standalone solid-color pill showing weekly quota progress, rendered right
// below the highlight box — matches the mockup, which shows this as its own
// element rather than nested inside the PR/highlight card.
function renderWeeklyQuotaPill(stats) {
  const { daysLogged, goal, met, overflow } = stats.quota;
  const text = goal == null ? `${daysLogged} days logged this week`
    : (met && overflow > 0) ? `+${overflow} day${overflow===1?'':'s'} over your goal`
    : `${daysLogged}/${goal} days logged this week`;
  const color = met ? '#3fb87f' : '#e8695c';
  const pct = goal ? Math.min(100, Math.round((daysLogged / goal) * 100)) : 0;
  return `<div style="position:relative;height:26px;border-radius:999px;background:#eee;margin:8px 0 2px;overflow:hidden">
    <div style="position:absolute;top:0;left:0;bottom:0;width:${pct}%;background:${color};border-radius:999px;transition:width .3s"></div>
    <div style="position:relative;height:100%;display:flex;align-items:center;justify-content:flex-end;padding:0 12px">
      <span style="font-size:10px;color:#555;white-space:nowrap;font-weight:600">${escHtml(text)}</span>
    </div>
  </div>`;
}

/* ─── FILTERS (Overall trend: which exercise(s)/metric; Last trained: which
   muscle groups to show) — real popup sheets, not alert(). ─── */
let _trendExerciseFilter = []; // empty = all exercises included
let _trendMetricFilter = 'all'; // 'all' | 'reps' | 'weight' | 'sets' — display-only for now, doesn't change which exercises count (see history.js note on the trend box)
let _muscleFilterShowAll = false; // false = only priority/needs-attention groups; true = every group

export function openTallyTrendFilter() {
  const hist = getHistory();
  const index = getExerciseIndex(hist);
  const options = getHistoryDisplayNames(index);
  const body = document.getElementById('tally-filter-body');
  const title = document.getElementById('tally-filter-title');
  if (title) title.textContent = 'Filter trend';
  if (body) {
    const metricRow = `<div style="display:flex;gap:6px;margin-bottom:14px">
      ${['all','reps','weight','sets'].map(m => `<button class="tally-filter-chip${_trendMetricFilter===m?' active':''}" onclick="setTallyTrendMetric('${m}')">${m === 'all' ? 'All' : m[0].toUpperCase()+m.slice(1)}</button>`).join('')}
    </div>`;
    const exRows = options.length
      ? options.map(o => `<button class="tally-filter-row${_trendExerciseFilter.includes(o.key)?' active':''}" onclick="toggleTallyTrendExercise('${escAttr(o.key)}')">
          <span>${escHtml(o.name)}</span>${_trendExerciseFilter.includes(o.key) ? checkIconSvg() : ''}
        </button>`).join('')
      : '<p style="font-size:13px;color:var(--text3);padding:8px 0">No exercises logged yet.</p>';
    body.innerHTML = metricRow + `<p style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;margin:0 0 8px">Exercises (none selected = all)</p>` + exRows;
  }
  document.getElementById('tally-filter-wrap')?.classList.add('show');
}
export function setTallyTrendMetric(metric) {
  _trendMetricFilter = metric;
  openTallyTrendFilter(); // re-render the sheet with the new active state
}
export function toggleTallyTrendExercise(key) {
  const at = _trendExerciseFilter.indexOf(key);
  if (at === -1) _trendExerciseFilter.push(key); else _trendExerciseFilter.splice(at, 1);
  openTallyTrendFilter();
}
export function closeTallyFilter() {
  document.getElementById('tally-filter-wrap')?.classList.remove('show');
  if (_lastStats) renderFullBody(_lastStats); // apply whatever filter state changed while the sheet was open
}

/* ─── STANDARD BOXES (non-highlight registry — ids/widths in
   TALLY_BOX_DEFS, state.js). Highlight-mode boxes (prCallout/
   weekCheckmarks/calorieRow/weightDelta) are included here too, rendered
   plainly, for whichever modes aren't the active highlight. ─── */
// Visual variant per box, matching the mockup: the trend chart and total
// weight lifted render as neutral gray sections; everything else uses the
// standard solid-periwinkle stat block.
const BOX_VARIANTS = {
  overallTrend: 'neutral',
  totalWeight: 'neutral',
  bestStreak: 'stat-box',
  daysLogged: 'stat-box',
  setsCompleted: 'stat-box',
};
const BOX_RENDERERS = {
  overallTrend(stats) {
    const bars = stats.recentTrends;
    const filterIcon = filterIconSvg('openTallyTrendFilter()', 'Filter trend');
    if (!bars.length) return `<div style="display:flex;justify-content:space-between;align-items:center"><div class="tally-box-label" style="margin:0">Overall trend</div>${filterIcon}</div><div class="tally-box-sub">Log a few sessions to see your trend.</div>`;
    const colorFor = t => t === 'up' ? '#3fb87f' : t === 'down' ? '#e8695c' : '#ccc';
    const maxH = 44;
    const barsHtml = bars.map(b => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;cursor:pointer" data-date="${escAttr(b.dateKey)}" class="tally-trend-bar">
        <div style="width:70%;height:${maxH}px;display:flex;align-items:flex-end">
          <div style="width:100%;height:${b.hasPR ? maxH : Math.round(maxH*0.6)}px;border-radius:4px;background:${b.hasPR ? '#5170ff' : colorFor(b.trend)}"></div>
        </div>
      </div>`).join('');
    return `<div style="display:flex;justify-content:space-between;align-items:center"><div class="tally-box-label" style="margin:0">Overall trend</div>${filterIcon}</div>
      <div style="display:flex;gap:6px;margin-top:8px;align-items:flex-end">${barsHtml}</div>
      <div class="tally-box-sub" style="margin-top:8px">Tap a bar to see that session</div>`;
  },
  bestStreak(stats) {
    return `<div class="tally-box-label">Best streak</div><div class="tally-box-value">${stats.streaks.best} days</div>
      <div class="tally-icon-badge">${flameIconSvg()}</div>`;
  },
  daysLogged(stats) {
    return `<div class="tally-box-label">Days logged</div><div class="tally-box-value">${stats.loggedDayCount}</div>
      <div class="tally-icon-badge">${calendarIconSvg()}</div>`;
  },
  setsCompleted(stats) {
    return `<div class="tally-box-label">Sets completed</div><div class="tally-box-value">${stats.setsCompleted.toLocaleString()}</div>
      <div class="tally-icon-badge">${trendUpIconSvg()}</div>`;
  },
  avgSession(stats) {
    const avg = stats.avgSession.avgMinutes;
    return `<div class="tally-box-label">Avg session length</div>
      <div class="tally-box-value">${avg != null ? avg + ' min' : '—'}</div>
      <div class="tally-box-sub" onclick="openTallySessionTimesPopup()" style="cursor:pointer;text-decoration:underline">See full week</div>`;
  },
  totalWeight(stats) {
    const rows = stats.milestoneWindow.map(m => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #ccc;${m.reached?'':'opacity:0.4'}">
        <span style="font-size:10px;color:#555">${fmtWeight(m.lbs)}</span>
        <span style="font-size:11px;font-weight:700;text-transform:uppercase">${escHtml(m.label)}</span>
      </div>`).join('');
    // The ladder scrolls independently of the whole Tally sheet — its own
    // max-height + overflow-y, separate from .tally-scroll's outer scroll —
    // so you can browse the milestone list without scrolling the page.
    return `<div class="tally-box-label" style="text-align:center;margin-bottom:8px">Total weight lifted</div>
      <div class="tally-weight-ladder" style="max-height:170px;overflow-y:auto;overscroll-behavior:contain">${rows}</div>
      <div style="margin:10px -12px -10px;background:#e05d52;padding:10px;text-align:center;border-radius:0 0 12px 12px">
        <div style="font-size:14px;font-weight:400;color:#111">${fmtWeight(stats.totalLbs)}</div>
      </div>`;
  },
  lastTrained(stats) {
    const source = _muscleFilterShowAll ? stats.attention.all : stats.attention.needingAttention;
    const shown = source.slice(0, 2);
    const rows = shown.map((g, i) => {
      const text = g.daysSince == null ? 'never trained' : g.daysSince + ' days ago';
      const pillBg = i === 0 ? '#fff' : 'rgba(255,255,255,0.55)';
      const pillText = i === 0 ? '#111' : '#333';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
        <span style="font-size:12px;font-weight:600">${escHtml(g.label)}</span>
        <span style="font-size:10px;font-weight:700;background:${pillBg};color:${pillText};border-radius:999px;padding:2px 8px">${escHtml(text)}</span>
      </div>`;
    }).join('');
    return `<div class="tally-box-label">Last trained</div>
      ${shown.length ? rows : '<div class="tally-box-sub">Nothing overdue right now.</div>'}
      <div class="tally-box-sub" onclick="openTallyMuscleGapsPopup()" style="cursor:pointer;text-decoration:underline;margin-top:6px;font-size:10px">See all</div>`;
  },
  prCallout(stats) { return renderPRHighlightInner(stats); },
  weekCheckmarks() { return renderWeekCheckmarksInner(); },
  calorieRow(stats) { return renderCalorieRowInner(stats, false); },
  weightDelta() {
    const bw = getCleanBw();
    return `<div class="tally-box-label">Weight</div>
      <div class="tally-box-value">${bw != null ? bw + ' ' + currentUnits : '—'}</div>`;
  },
};

/* ─── BOX GRID ASSEMBLY (groups visible boxes into rows respecting the
   width-collision rule: full-width boxes always alone on their row;
   half-width boxes pair two per row) ─── */
function buildBoxRows(visibleIds) {
  const rows = [];
  let pending = []; // boxes of the current same-width run, not yet flushed to a row
  let pendingWidth = null;
  const capacity = { half: 2, third: 3 };
  const flush = () => {
    if (!pending.length) return;
    rows.push({ type: pendingWidth, ids: pending });
    pending = []; pendingWidth = null;
  };
  visibleIds.forEach(id => {
    const def = TALLY_BOX_DEFS.find(b => b.id === id);
    if (!def || !BOX_RENDERERS[id]) return;
    if (def.width === 'full') {
      flush();
      rows.push({ type: 'full', ids: [id] });
      return;
    }
    // A width change (half -> third or vice versa) starts a fresh row
    // rather than mixing widths in one row.
    if (pendingWidth && pendingWidth !== def.width) flush();
    pendingWidth = def.width;
    pending.push(id);
    if (pending.length >= capacity[def.width]) flush();
  });
  flush();
  return rows;
}

export function openTallyTrendDay(dateKey) {
  const title = document.getElementById('tally-filter-title');
  if (title) title.textContent = dateKey.replace(/\w+,\s/, '');
  const body = document.getElementById('tally-filter-body');
  if (body) {
    const breakdown = getDayTrendBreakdown(dateKey);
    const labelFor = t => t === 'pr' ? 'New PR' : t === 'up' ? 'Up' : t === 'down' ? 'Down' : 'Same as last time';
    const colorFor = t => t === 'pr' ? '#5170ff' : t === 'up' ? '#3fb87f' : t === 'down' ? '#e8695c' : '#999';
    body.innerHTML = breakdown.length
      ? breakdown.map(b => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:14px">${escHtml(b.name)}</span>
          <span style="font-size:12px;font-weight:600;color:${colorFor(b.trend)}">${labelFor(b.trend)}</span>
        </div>`).join('')
      : '<p style="font-size:13px;color:var(--text3);padding:8px 0">No data for this session.</p>';
  }
  document.getElementById('tally-filter-wrap')?.classList.add('show');
}
function wireTrendBarClicks() {
  document.querySelectorAll('.tally-trend-bar[data-date]').forEach(el => {
    if (el.dataset.wired) return;
    el.dataset.wired = '1';
    el.addEventListener('click', () => openTallyTrendDay(el.dataset.date));
  });
}
// Prevents a touch-drag inside the milestone ladder from also dragging the
// whole Tally sheet's outer scroll — stopPropagation on touchmove is what
// actually matters for touch devices; an onwheel handler (the previous
// attempt) only affects desktop mouse-wheel scrolling and does nothing here.
function wireWeightLadderScroll() {
  const el = document.querySelector('.tally-weight-ladder');
  if (!el || el.dataset.wired) return;
  el.dataset.wired = '1';
  el.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
}

/* ─── FULL RENDER PASS ─── */
let _lastStats = null;
function renderFullBody(stats) {
  const container = document.getElementById('tally-boxes');
  if (!container) return;
  const activeHighlightBoxId = highlightModeBoxId(highlightModeForGoal(stats.profile.goal));
  const layout = getTallyLayout();
  const hidden = new Set(getTallyHidden());
  hidden.add(activeHighlightBoxId); // never show the highlight's box a second time in the regular grid
  const visibleIds = layout.filter(id => !hidden.has(id));
  const rows = buildBoxRows(visibleIds);

  const rowsHtml = rows.map(row => {
    const cellsHtml = row.ids.map(id => {
      const inner = BOX_RENDERERS[id](stats);
      const variant = BOX_VARIANTS[id] || '';
      return `<div class="tally-box${variant ? ' '+variant : ''}" data-box-id="${id}">${inner}</div>`;
    }).join('');
    return `<div class="tally-box-row ${row.type === 'third' ? 'triple' : row.type}">${cellsHtml}</div>`;
  }).join('');

  container.innerHTML = renderHighlightBarHtml(stats) + rowsHtml;
  wireTrendBarClicks();
  wireWeightLadderScroll();
}
export function renderTallySheet() {
  wireSheetSwipe();
  renderHeader();
  _lastStats = computeTallyStats();
  renderFullBody(_lastStats);
}

/* ─── DETAIL POPUPS (session times, muscle gaps) — real sheets, reusing
   the same filter-sheet markup/overlay as openTallyTrendFilter/
   the same filter-sheet markup/overlay as openTallySessionTimesPopup above. ─── */
export function openTallySessionTimesPopup() {
  if (!_lastStats) return;
  const title = document.getElementById('tally-filter-title');
  if (title) title.textContent = "This week's session times";
  const body = document.getElementById('tally-filter-body');
  const days = _lastStats.avgSession.days;
  if (body) {
    body.innerHTML = days.length
      ? days.map(d => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:14px">${escHtml(d.dateKey.replace(/\w+,\s/, ''))}</span>
          <span style="font-size:13px;color:var(--text3)">${d.minutes} min</span>
        </div>`).join('')
      : '<p style="font-size:13px;color:var(--text3);padding:8px 0">No session-length data yet for this week — this fills in as you log more sessions.</p>';
  }
  document.getElementById('tally-filter-wrap')?.classList.add('show');
}
export function openTallyMuscleGapsPopup() {
  if (!_lastStats) return;
  const title = document.getElementById('tally-filter-title');
  if (title) title.textContent = 'Last trained — all groups';
  const body = document.getElementById('tally-filter-body');
  if (body) {
    body.innerHTML = _lastStats.attention.all.map(g => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:14px">${escHtml(g.label)}</span>
        <span style="font-size:12px;color:var(--text3)">${g.daysSince == null ? 'never trained' : g.daysSince + ' days ago'}</span>
      </div>`).join('');
  }
  document.getElementById('tally-filter-wrap')?.classList.add('show');
}
