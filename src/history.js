/* ════════════════════════════════════════════
   Tally Up — History (list, momentum chart, edit session)
   ════════════════════════════════════════════ */
import { activeCharts, currentUnits, getHistory, saveHistory,
         escAttr, escHtml, FREQUENCY_UPPER_BOUND, DEFAULT_LIBRARY_V2,
         MUSCLE_GROUPS_V2, WEIGHT_MILESTONES } from './state.js';
import { formatHistoryDate } from './calendar.js';
import { showModal, closeModal } from './modal.js';

/* ─── HISTORY ─── */
export function destroyCharts() { activeCharts.forEach(c => { try { c.destroy(); } catch {} }); activeCharts.length = 0; }
// Parses "Wednesday, Jul 22, 2026" or legacy "Wednesday, Jul 22" (no year) into a real Date.
// Legacy entries assume the most recent past occurrence of that month/day, since they predate
// year-tagging and we can't know which year they were actually logged in.
export function parseSessionDate(str) {
  const parts = str.split(',').map(s => s.trim());
  const monthDay = parts[1] || '';
  const yearPart = parts[2];
  if (yearPart) {
    const d = new Date(`${monthDay} ${yearPart}`);
    if (!isNaN(d)) return d;
  }
  // Legacy, no year: try this year, and if that's in the future, assume last year instead
  const now = new Date();
  const guess = new Date(`${monthDay} ${now.getFullYear()}`);
  if (!isNaN(guess)) {
    if (guess > now) guess.setFullYear(guess.getFullYear() - 1);
    return guess;
  }
  return new Date(0); // unparseable fallback, sorts first
}
export function getExerciseIndex(hist) {
  const idx = {};
  Object.entries(hist).forEach(([date, entries]) => {
    entries.forEach(e => {
      const key = e.exId || e.name;
      if (!idx[key]) idx[key] = { name: e.name, sessions: [] };
      idx[key].sessions.push({ date, sets: e.sets });
    });
  });
  Object.values(idx).forEach(entry => {
    entry.sessions.sort((a, b) => parseSessionDate(a.date) - parseSessionDate(b.date));
  });
  return idx;
}
export function getHistoryDisplayNames(index) { return Object.entries(index).map(([key, val]) => ({ key, name: val.name })).sort((a,b) => a.name.localeCompare(b.name)); }
export function sessionVolume(sets) { return sets.reduce((sum, s) => sum + (Number(s.reps)||0) * (Number(s.weight)||0), 0); }
// Estimated 1-rep max for a single set (Epley formula), used for strength trend
export function setE1RM(s) { const w = Number(s.weight)||0, r = Number(s.reps)||0; return r > 0 ? w * (1 + r/30) : 0; }
// A session's strength score = its best single-set e1RM (not summed across sets)
export function sessionBestE1RM(sets) { return Math.max(0, ...sets.map(setE1RM)); }

/* ═══════════════════════════════════════════════════════════
   TALLY PAGE — derived stats read-only from existing history.
   None of this writes to history; it only reads getHistory() and
   computes. Kept alongside the other derived-stat helpers above
   (sessionVolume, setE1RM, etc.) rather than in a separate module,
   since it's the same category of function: pure derivation.
   ═══════════════════════════════════════════════════════════ */

// Sunday-Saturday week boundaries for a given date, matching the rest of the
// app's Sunday-start convention (see calendar.js's week view). Returns the
// Date for that week's Sunday at local midnight and the following Sunday
// (exclusive upper bound), so callers can test `date >= start && date < end`.
export function getWeekBounds(refDate) {
  const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  d.setDate(d.getDate() - d.getDay()); // back up to this week's Sunday
  const start = d;
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

// Distinct calendar days with at least one logged set, within [start, end).
// A "day" counts once no matter how many exercises/sets were logged on it —
// the weekly quota is about showing up, not volume.
function distinctLoggedDaysInRange(hist, start, end) {
  const days = new Set();
  Object.keys(hist).forEach(dateKey => {
    const d = parseSessionDate(dateKey);
    if (d >= start && d < end && hist[dateKey].length) days.add(dateKey);
  });
  return days.size;
}

// Weekly quota progress for the Tally day-bar box. `targetFrequency` is the
// profile's Q2 answer key ('1-2'|'3-4'|'5-6'|'7') — the upper bound of that
// range is the goal (see FREQUENCY_UPPER_BOUND in state.js). Returns enough
// for the UI to render "2/4 days logged this week" pre-goal, or "+1 day over
// your goal" post-goal, plus a flag for the red->green bar-fill switch.
export function getWeeklyQuotaProgress(targetFrequency, refDate) {
  const goal = FREQUENCY_UPPER_BOUND[targetFrequency] || null;
  const { start, end } = getWeekBounds(refDate || new Date());
  const hist = getHistory();
  const daysLogged = distinctLoggedDaysInRange(hist, start, end);
  if (!goal) return { daysLogged, goal: null, met: false, overflow: 0 };
  const met = daysLogged >= goal;
  return { daysLogged, goal, met, overflow: met ? daysLogged - goal : 0 };
}

// Longest run of *consecutive calendar days* with a logged set, and the
// current run ending today (or yesterday, if nothing's logged yet today —
// a streak shouldn't zero out at midnight before the user's had a chance to
// train). Streaks are NOT bounded by week — a 12-day run stays a 12-day
// streak regardless of Sunday resets (per spec).
export function getStreaks(refDate) {
  const hist = getHistory();
  const loggedDayKeys = Object.keys(hist).filter(k => hist[k] && hist[k].length);
  if (!loggedDayKeys.length) return { current: 0, best: 0 };
  // De-dupe by real calendar day (parseSessionDate could theoretically
  // collide across legacy vs current date-string formats for the same real
  // day) and index by day for O(1) consecutive-day lookups below.
  const daySet = new Set(loggedDayKeys.map(k => {
    const d = parseSessionDate(k);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }));
  const sortedUnique = Array.from(daySet).sort((a, b) => a - b);

  let best = 1, run = 1;
  for (let i = 1; i < sortedUnique.length; i++) {
    const diffDays = Math.round((sortedUnique[i] - sortedUnique[i-1]) / 86400000);
    if (diffDays === 1) { run++; } else { run = 1; }
    if (run > best) best = run;
  }

  const today = new Date(refDate || new Date());
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayMid = todayMid - 86400000;
  // Current streak anchors at today if already logged, else at yesterday
  // (so the streak display doesn't drop to 0 first thing in the morning
  // before today's session happens) — otherwise there's no active streak.
  let anchor = null;
  if (daySet.has(todayMid)) anchor = todayMid;
  else if (daySet.has(yesterdayMid)) anchor = yesterdayMid;
  let current = 0;
  if (anchor != null) {
    current = 1;
    let cursor = anchor - 86400000;
    while (daySet.has(cursor)) { current++; cursor -= 86400000; }
  }
  return { current, best };
}

// Rough session length: last set's loggedAt minus first set's loggedAt, for
// a given history date-key. Sets logged before this feature shipped have no
// loggedAt at all, so any day mixing old and new data (or entirely old data)
// simply can't produce a duration — returns null rather than a misleading
// number built from partial timestamps.
export function sessionDurationMinutes(dateKey) {
  const hist = getHistory();
  const entries = hist[dateKey];
  if (!entries || !entries.length) return null;
  const timestamps = [];
  entries.forEach(e => e.sets.forEach(s => { if (s.loggedAt != null) timestamps.push(s.loggedAt); }));
  if (timestamps.length < 2) return null; // need at least a first and last point
  const span = Math.max(...timestamps) - Math.min(...timestamps);
  return Math.round(span / 60000);
}

// Average session length across logged days in [start, end) that actually
// have duration data (see sessionDurationMinutes) — days without loggedAt
// data are excluded rather than counted as 0, so they don't drag the
// average down artificially. Returns null if no day in range has data yet.
export function getWeeklyAvgSessionMinutes(refDate) {
  const { start, end } = getWeekBounds(refDate || new Date());
  const hist = getHistory();
  const perDay = [];
  Object.keys(hist).forEach(dateKey => {
    const d = parseSessionDate(dateKey);
    if (d < start || d >= end) return;
    const mins = sessionDurationMinutes(dateKey);
    if (mins != null) perDay.push({ dateKey, minutes: mins });
  });
  if (!perDay.length) return { avgMinutes: null, days: [] };
  const avg = Math.round(perDay.reduce((sum, d) => sum + d.minutes, 0) / perDay.length);
  return { avgMinutes: avg, days: perDay };
}

// Resolves a logged history entry back to its Library exercise, mirroring
// schedule-day.js's resolveScheduledExercise fallback chain (exId match ->
// exact name match -> case/trailing-s-insensitive name match) so a session
// logged against a since-renamed or since-deleted exercise still resolves
// wherever the Library still has a matching entry.
function normalizeExName(n) { return (n || '').trim().toLowerCase().replace(/s$/, ''); }
export function resolveHistoryEntryToLibrary(entry) {
  let libEx = null;
  if (entry.exId) libEx = DEFAULT_LIBRARY_V2.find(e => e.id === entry.exId);
  if (!libEx && entry.name) libEx = DEFAULT_LIBRARY_V2.find(e => e.name === entry.name);
  if (!libEx && entry.name) {
    const norm = normalizeExName(entry.name);
    libEx = DEFAULT_LIBRARY_V2.find(e => normalizeExName(e.name) === norm);
  }
  return libEx || null; // null if the exercise was deleted and nothing matches by name either
}

// Days since a muscle group was last trained, for every group in
// MUSCLE_GROUPS_V2 except cardio (cardio doesn't have a meaningful "last
// trained" concept the same way a muscle group does). A group with zero
// history returns null for daysSince (never trained), not Infinity/-1, so
// callers can distinguish "never" from "a very long time ago" if they want to.
export function getMuscleGroupGaps(refDate) {
  const hist = getHistory();
  const today = new Date(refDate || new Date());
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastTrained = {}; // group key -> most recent Date trained
  Object.keys(hist).forEach(dateKey => {
    const entries = hist[dateKey];
    if (!entries || !entries.length) return;
    const d = parseSessionDate(dateKey);
    entries.forEach(entry => {
      const libEx = resolveHistoryEntryToLibrary(entry);
      if (!libEx || !libEx.group || libEx.group === 'cardio') return;
      if (!lastTrained[libEx.group] || d > lastTrained[libEx.group]) lastTrained[libEx.group] = d;
    });
  });
  return MUSCLE_GROUPS_V2
    .filter(g => g.key !== 'cardio')
    .map(g => {
      const last = lastTrained[g.key] || null;
      const daysSince = last
        ? Math.round((todayMid - new Date(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000)
        : null;
      return { key: g.key, label: g.label, daysSince };
    });
}

// "Needs attention" list for the Tally box: groups at/over the staleness
// threshold, sorted so the profile's priority groups (Q3) surface first
// regardless of how stale non-priority groups are, then by staleness
// descending within each bucket. `threshold` is normally
// FREQUENCY_UPPER_BOUND[profile.targetFrequency] (see state.js) — e.g.
// someone training 1-2 days/week flags a group after 2 days untouched.
export function getMuscleGroupsNeedingAttention(priorityMuscles, threshold, refDate) {
  const gaps = getMuscleGroupGaps(refDate);
  const priority = new Set(priorityMuscles || []);
  const stale = gaps.filter(g => g.daysSince == null || g.daysSince >= threshold);
  stale.sort((a, b) => {
    const aPri = priority.has(a.key) ? 1 : 0, bPri = priority.has(b.key) ? 1 : 0;
    if (aPri !== bPri) return bPri - aPri;
    const aDays = a.daysSince == null ? Infinity : a.daysSince;
    const bDays = b.daysSince == null ? Infinity : b.daysSince;
    return bDays - aDays;
  });
  return { all: gaps, needingAttention: stale };
}

/* ─── CALORIE ESTIMATE (rough, range-based — see note below) ───
   Standard MET (Metabolic Equivalent of Task) approach: calories = MET ×
   weight(kg) × duration(hours). This is a well-established estimation
   method, but MET tables are themselves broad bands from population
   averages — there's no way to make this precise without real
   physiological data (heart rate, etc.), which this app doesn't collect.
   Returning a range rather than a point estimate is a deliberate way of
   being honest about that uncertainty, not just a UI choice. */
const MET_RANGE = {
  lifting: [3.5, 6],   // general resistance training, light-to-vigorous effort
  cardio:  [5, 10],    // walking/light cardio through vigorous running/cycling
};
export function estimateCalorieRange(weightLbs, minutes, sessionType) {
  if (weightLbs == null || !minutes) return null;
  const kg = weightLbs / 2.20462;
  const hours = minutes / 60;
  const [metLow, metHigh] = MET_RANGE[sessionType] || MET_RANGE.lifting;
  const low = Math.round(metLow * kg * hours);
  const high = Math.round(metHigh * kg * hours);
  return { low, high };
}
// Classifies a logged day as lifting or cardio based on majority exercise
// type, for picking which MET band to use. Falls back to 'lifting' if
// nothing resolves (safer default — cardio's MET range runs higher, so
// defaulting to lifting avoids overestimating an unclassifiable session).
export function classifySessionType(dateKey) {
  const hist = getHistory();
  const entries = hist[dateKey];
  if (!entries || !entries.length) return 'lifting';
  let cardioCount = 0, otherCount = 0;
  entries.forEach(entry => {
    const libEx = resolveHistoryEntryToLibrary(entry);
    if (libEx && libEx.group === 'cardio') cardioCount++; else otherCount++;
  });
  return cardioCount > otherCount ? 'cardio' : 'lifting';
}

/* ─── OVERALL TREND (Tally box) ───
   Reuses the exact same per-session classification the History momentum
   chart already uses (compare this session's e1RM to the exercise's own
   immediately-prior session; PR if it's that exercise's all-time best e1RM)
   — see the isPR/isUp logic around the momentum-bars render above — but
   applied per calendar day and averaged across whichever exercises were
   logged that day, per the Tally spec. */

// Classifies one exercise's session at `sessionIdx` within its own sorted
// session list: 'pr' | 'up' | 'down' | 'equal'. Mirrors the momentum chart's
// isPR/isUp exactly, except "equal" is now its own state (the momentum bars
// fold equal into "up" for a simpler 2-color chart; the Tally spec calls for
// a real 4th state, so it's split out here rather than reused as-is).
function classifySessionTrend(sessions, sessionIdx) {
  const e1rms = sessions.map(s => sessionBestE1RM(s.sets));
  const v = e1rms[sessionIdx];
  if (sessionIdx === 0) return v > 0 ? 'pr' : 'up'; // first-ever session with real weight is trivially a new best
  const priorBest = Math.max(...e1rms.slice(0, sessionIdx));
  const prev = e1rms[sessionIdx - 1];
  // PR requires strictly beating every prior session, not just tying it —
  // an exact repeat of a previous best is a real, common case (same weight/
  // reps as last time) and should read as 'equal', not a false PR badge.
  if (v > priorBest) return 'pr';
  if (v > prev) return 'up';
  if (v < prev) return 'down';
  return 'equal';
}

// Every exercise's classification for a given history date-key, keyed by
// exercise key (exId||name) so a caller can filter down to specific
// exercises without recomputing. Exercises with 0 valid e1RM (e.g. a set
// logged with 0 reps) are skipped rather than forced into a state.
export function getDayTrendBreakdown(dateKey) {
  const hist = getHistory();
  const entries = hist[dateKey];
  if (!entries || !entries.length) return [];
  const index = getExerciseIndex(hist);
  const results = [];
  entries.forEach(entry => {
    const key = entry.exId || entry.name;
    const exSessions = index[key];
    if (!exSessions) return;
    const sessionIdx = exSessions.sessions.findIndex(s => s.date === dateKey);
    if (sessionIdx === -1) return;
    const trend = classifySessionTrend(exSessions.sessions, sessionIdx);
    results.push({ key, name: entry.name, trend });
  });
  return results;
}

// Averages a day's per-exercise trends into one overall verdict for the
// Tally "Overall trend" box, optionally filtered to specific exercise keys
// (the box's filter picker — reps/weight/sets metric filtering happens at
// the display layer using each exercise's own sets, not here, since metric
// choice doesn't change *which* exercises count, only what's shown per bar).
// Averaging rule: PR counts as up for the purpose of the average (a PR is
// definitionally an improvement), then majority vote decides the day's
// color; a tie between up and down falls back to 'equal'.
export function getDayOverallTrend(dateKey, exerciseKeys) {
  let breakdown = getDayTrendBreakdown(dateKey);
  if (exerciseKeys && exerciseKeys.length) {
    const wanted = new Set(exerciseKeys);
    breakdown = breakdown.filter(b => wanted.has(b.key));
  }
  if (!breakdown.length) return { trend: null, hasPR: false, breakdown };
  const hasPR = breakdown.some(b => b.trend === 'pr');
  let upCount = 0, downCount = 0, equalCount = 0;
  breakdown.forEach(b => {
    if (b.trend === 'pr' || b.trend === 'up') upCount++;
    else if (b.trend === 'down') downCount++;
    else equalCount++;
  });
  let trend;
  if (upCount > downCount) trend = 'up';
  else if (downCount > upCount) trend = 'down';
  else trend = equalCount >= Math.max(upCount, downCount) ? 'equal' : 'up';
  return { trend, hasPR, breakdown };
}

// Recent days' overall trend, most recent first, for the Tally trend bar
// chart — `days` distinct logged dates going backward from refDate (not a
// fixed calendar window, since the box should show N *sessions*, skipping
// rest days rather than padding with empty bars for days nothing was logged).
export function getRecentDayTrends(days, refDate, exerciseKeys) {
  const hist = getHistory();
  const today = new Date(refDate || new Date());
  const loggedKeys = Object.keys(hist)
    .filter(k => hist[k] && hist[k].length)
    .filter(k => parseSessionDate(k) <= today)
    .sort((a, b) => parseSessionDate(b) - parseSessionDate(a)); // most recent first
  return loggedKeys.slice(0, days).reverse().map(dateKey => {
    const { trend, hasPR } = getDayOverallTrend(dateKey, exerciseKeys);
    return { dateKey, trend, hasPR };
  });
}

/* ─── TOTAL WEIGHT LIFTED (milestone ladder) ─── */
// Cumulative weight across every set in every logged session, all-time. Sums
// raw weight×reps per set (same math as sessionVolume, applied across all
// history rather than one session) — always in lbs regardless of the user's
// current unit setting, since WEIGHT_MILESTONES (state.js) is lbs-based and
// conversion for display happens at render time, not here.
export function getTotalWeightLiftedLbs() {
  const hist = getHistory();
  let total = 0;
  Object.values(hist).forEach(entries => {
    entries.forEach(entry => { total += sessionVolume(entry.sets); });
  });
  return total;
}
// Returns the milestone ladder windowed around the user's current total: the
// most recently passed milestone, the next unreached one, plus `context`
// milestones on either side for scroll continuity (per spec: box shows a
// window, full list is scrollable independent of the page).
export function getMilestoneWindow(totalLbs, context) {
  const ctx = context == null ? 2 : context;
  let nextIdx = WEIGHT_MILESTONES.findIndex(m => m.lbs > totalLbs);
  if (nextIdx === -1) nextIdx = WEIGHT_MILESTONES.length; // past every milestone
  const lo = Math.max(0, nextIdx - 1 - ctx);
  const hi = Math.min(WEIGHT_MILESTONES.length, nextIdx + ctx);
  return WEIGHT_MILESTONES.slice(lo, hi).map((m, i) => ({
    ...m,
    reached: (lo + i) < nextIdx,
  }));
}

let histSearchQuery = '';
export function openHistSearch() {
  document.getElementById('hist-header-row').classList.add('searching');
  document.getElementById('hist-search-btn').style.display = 'none';
  document.getElementById('hist-search-pill').classList.add('show');
  const input = document.getElementById('hist-search-input');
  input.value = '';
  histSearchQuery = '';
  setTimeout(() => input.focus(), 200);
}
export function closeHistSearch() {
  document.getElementById('hist-header-row').classList.remove('searching');
  document.getElementById('hist-search-btn').style.display = '';
  document.getElementById('hist-search-pill').classList.remove('show');
  histSearchQuery = '';
  renderHistory();
}
export function histSearchInput(query) {
  histSearchQuery = query.trim();
  renderHistory();
}
export function renderHistory(selected) {
  destroyCharts();
  const container = document.getElementById('history-container');
  let hist, index;
  try { hist = getHistory(); index = getExerciseIndex(hist); }
  catch { container.innerHTML = '<div class="empty">Could not load history.</div>'; return; }
  const exercises = Object.keys(index);
  if (!exercises.length) { container.innerHTML = '<div class="empty">No history yet. Log a workout to see it here.</div>'; return; }

  if (!selected) {
    let list = getHistoryDisplayNames(index);
    if (typeof histSearchQuery !== 'undefined' && histSearchQuery) {
      const q = histSearchQuery.toLowerCase();
      list = list.filter(({name}) => name.toLowerCase().includes(q));
    }
    if (!list.length) { container.innerHTML = '<div class="empty">No history matches your search.</div>'; return; }
    container.innerHTML =
      list.map(({key, name}) => {
        const entry = index[key];
        const sessions = entry.sessions;
        const best = Math.max(...sessions.flatMap(s => s.sets.map(x => Number(x.weight)||0)));
        const totalVol = sessions.reduce((sum, s) => sum + sessionVolume(s.sets), 0);
        return `<div class="hist-card" data-exkey="${escAttr(key)}">
          <div class="hist-card-text">
            <div class="hist-name">${escHtml(name)}</div>
            <div class="hist-meta">${sessions.length} session${sessions.length!==1?'s':''} · best ${best} ${currentUnits} · vol ${totalVol.toLocaleString()} ${currentUnits}</div>
          </div>
          <span class="hist-chev">›</span>
        </div>`;
      }).join('');
    container.querySelectorAll('[data-exkey]').forEach(el => el.addEventListener('click', () => renderHistory(el.dataset.exkey)));
    return;
  }

  const entry = index[selected]; if (!entry) { renderHistory(); return; }
  const sessions = entry.sessions;
  const labels = sessions.map(s => s.date.replace(/\w+,\s/, ''));
  const best = Math.max(...sessions.flatMap(s => s.sets.map(x => Number(x.weight)||0)));
  const totalVol = sessions.reduce((sum, s) => sum + sessionVolume(s.sets), 0);
  const e1rmPerSession = sessions.map(s => sessionBestE1RM(s.sets));

  let trendStr = '—', trendColor = 'var(--text3)';
  if (sessions.length >= 4) {
    const recent = e1rmPerSession.slice(-3).reduce((a,b)=>a+b,0) / 3;
    const prev = e1rmPerSession.slice(-6,-3);
    if (prev.length > 0) {
      const prevAvg = prev.reduce((a,b)=>a+b,0) / prev.length;
      if (prevAvg > 0) {
        const pct = Math.round(((recent - prevAvg) / prevAvg) * 100);
        trendStr = pct > 0 ? `+${pct}%` : `${pct}%`;
        trendColor = pct > 0 ? 'var(--green)' : pct < 0 ? 'var(--red)' : 'var(--text3)';
      }
    }
  }

  // Group sessions into month folders (most recent first), most recent month expanded by default
  const monthGroups = []; // [{ key, label, rows: [sessionObj,...] }]
  sessions.slice().reverse().forEach(s => {
    const d = parseSessionDate(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let group = monthGroups.find(g => g.key === key);
    if (!group) { group = { key, label, rows: [] }; monthGroups.push(group); }
    group.rows.push(s);
  });

  const sessionFolders = monthGroups.map((group, i) => {
    const rowsHtml = group.rows.map(s => {
      const bestW = Math.max(...s.sets.map(x => Number(x.weight)||0));
      return `<div class="session-row session-row-tap" data-exkey="${escAttr(selected)}" data-date="${escAttr(s.date)}" role="button" tabindex="0">
        <div class="session-date">${escHtml(s.date.replace(/\w+,\s/,''))}<span class="session-edit-hint">tap to edit</span></div>
        <div class="session-sets">${s.sets.map(x=>`<span class="pill${Number(x.weight)===bestW&&bestW>0?' pill-best':''}">${x.reps} × ${x.weight} ${currentUnits}</span>`).join('')}</div>
      </div>`;
    }).join('');
    const open = i === 0; // most recent month starts expanded
    return `<div class="session-folder${open?' open':''}">
      <button class="session-folder-header" onclick="this.parentElement.classList.toggle('open')">
        <span class="session-folder-label">${escHtml(group.label)}</span>
        <span class="session-folder-count">${group.rows.length}</span>
        <svg class="session-folder-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="session-folder-body">${rowsHtml}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <button class="back-btn" onclick="renderHistory()">‹ All exercises</button>
    <div class="ex-detail-name">${escHtml(entry.name)}</div>
    <div class="ex-detail-count">${sessions.length} session${sessions.length!==1?'s':''}</div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-label">Best weight</div><div class="stat-value">${best} ${currentUnits}</div></div>
      <div class="stat-card"><div class="stat-label">Total volume</div><div class="stat-value">${totalVol.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Trend</div><div class="stat-value" style="color:${trendColor}">${trendStr}</div></div>
    </div>
    <div class="chart-wrap">
      <div class="chart-title-row">
        <div class="chart-title">Session momentum</div>
        <button class="chart-info-btn" onclick="showFormulaInfo()" aria-label="How this is measured">?</button>
      </div>
      <div class="momentum-bars" id="momentum-bars"></div>
      <div class="momentum-detail" id="momentum-detail">Tap a bar to see that session</div>
    </div>
    <div class="session-history">${sessionFolders}</div>`;

  const barsEl = document.getElementById('momentum-bars');
  const detailEl = document.getElementById('momentum-detail');
  const BAR_WINDOW = 25;
  const windowStart = Math.max(0, sessions.length - BAR_WINDOW);
  const visSessions = sessions.slice(windowStart);
  const visE1rm = e1rmPerSession.slice(windowStart);
  const visLabels = labels.slice(windowStart);
  const minE = Math.min(...visE1rm), maxE = Math.max(...visE1rm);
  const range = maxE - minE || 1;
  const prMax = Math.max(...e1rmPerSession); // true all-time best, even if outside the visible window
  barsEl.innerHTML = visE1rm.map((v, i) => {
    const h = 24 + ((v - minE) / range) * 76;
    const isPR = v === prMax;
    const isUp = i === 0 || v >= visE1rm[i-1];
    const cls = isPR ? 'bar-pr' : (isUp ? 'bar-up' : 'bar-down');
    return `<div class="momentum-col" data-date="${escAttr(visSessions[i].date)}" data-score="${Math.round(v)}" role="button" tabindex="0">
      <div class="momentum-bar ${cls}" style="height:${Math.round(h)}px"></div>
      <span class="momentum-label">${visLabels[i]}</span>
    </div>`;
  }).join('');

  // Wire tappable momentum bars -> reveal date + score
  barsEl.querySelectorAll('.momentum-col').forEach(el => {
    const reveal = () => {
      const d = el.dataset.date.replace(/\w+,\s/, '');
      detailEl.textContent = `${d} · ${el.dataset.score} ${currentUnits} est.`;
    };
    el.addEventListener('click', reveal);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });
  });

  // Wire tappable session rows -> open edit sheet
  container.querySelectorAll('.session-row-tap').forEach(el => {
    const open = () => openEditSession(el.dataset.exkey, el.dataset.date);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
export function showFormulaInfo() {
  showModal(
    'How session momentum is measured',
    `Each bar shows your estimated one-rep max for that session — the heaviest single set, scaled up using the Epley formula: weight × (1 + reps ÷ 30). This rewards genuine strength gains over just doing more total reps at a lighter weight.`,
    closeModal
  );
}

/* ─── EDIT SESSION SHEET ─── */
let _editSession = null; // { exKey, date, sets: [...], name, exId }

export function openEditSession(exKey, date) {
  const hist = getHistory();
  if (!hist[date]) return;
  const i = hist[date].findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) return;
  const entry = hist[date][i];
  _editSession = {
    exKey,
    date,
    _openedFromDate: date,
    dateChanged: false,
    name: entry.name,
    exId: entry.exId || '',
    sets: entry.sets.map(s => ({ reps: String(s.reps ?? ''), weight: String(s.weight ?? ''), loggedAt: s.loggedAt })),
  };
  renderEditSession();
  document.getElementById('edit-session-wrap').classList.add('show');
}
export function closeEditSession() {
  _editSession = null;
  document.getElementById('edit-session-wrap').classList.remove('show');
}
// Renders the session date as a big, tappable element. Tapping swaps it for a
// native date input; changing that input stages a new date on _editSession
// (actually moving the history entry happens on Save, in saveEditSession).
function renderEditSessionDate() {
  const el = document.getElementById('edit-session-date');
  if (!el || !_editSession) return;
  const display = _editSession.date.replace(/\w+,\s/, '');
  el.innerHTML = `<span class="edit-session-date-big" id="edit-session-date-display" onclick="editSessionDateEditToggle()">${escHtml(display)}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  </span>`;
}
export function editSessionDateEditToggle() {
  if (!_editSession) return;
  const el = document.getElementById('edit-session-date');
  const d = parseSessionDate(_editSession.date);
  const iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  el.innerHTML = `<input type="date" class="edit-session-date-input-big" id="edit-session-date-input" value="${iso}">`;
  const input = document.getElementById('edit-session-date-input');
  input.addEventListener('change', () => {
    if (!input.value) { renderEditSessionDate(); return; }
    const [y,m,dd] = input.value.split('-').map(Number);
    const newDate = new Date(y, m-1, dd);
    _editSession.date = formatHistoryDate(newDate);
    _editSession.dateChanged = true;
    renderEditSessionDate();
  });
  input.focus();
}
function renderEditSession() {
  if (!_editSession) return;
  document.getElementById('edit-session-title').textContent = _editSession.name;
  renderEditSessionDate();
  const rows = _editSession.sets.map((s, i) => `
    <div class="edit-set-row">
      <div class="edit-set-num">Set ${i+1}</div>
      <input class="set-input edit-set-input" type="number" min="0" placeholder="Reps" value="${escAttr(s.reps)}" data-i="${i}" data-field="reps">
      <input class="set-input edit-set-input" type="number" min="0" placeholder="Weight" value="${escAttr(s.weight)}" data-i="${i}" data-field="weight">
    </div>`).join('');
  document.getElementById('edit-session-sets').innerHTML = rows || '<div class="empty">No sets.</div>';
  document.getElementById('edit-session-sets').querySelectorAll('.edit-set-input').forEach(el => {
    el.addEventListener('input', () => {
      const idx = Number(el.dataset.i);
      const field = el.dataset.field;
      if (_editSession && _editSession.sets[idx]) _editSession.sets[idx][field] = el.value;
    });
  });
}
export function saveEditSession() {
  if (!_editSession) return;
  // Flush any in-progress input values (mobile keyboards sometimes lag)
  document.getElementById('edit-session-sets').querySelectorAll('.edit-set-input').forEach(el => {
    const idx = Number(el.dataset.i);
    const field = el.dataset.field;
    if (_editSession.sets[idx]) _editSession.sets[idx][field] = el.value;
  });
  const cleanSets = _editSession.sets
    .filter(s => s.reps !== '' || s.weight !== '')
    .map(s => s.loggedAt != null
      ? { reps: Number(s.reps)||0, weight: Number(s.weight)||0, loggedAt: s.loggedAt }
      : { reps: Number(s.reps)||0, weight: Number(s.weight)||0 });
  const exKey = _editSession.exKey;
  const hist = getHistory();
  // The entry always still lives under the date it was originally opened from —
  // find and remove it from there first, then re-insert under the (possibly new) date.
  const fromDate = _editSession._openedFromDate;
  const dayEntries = hist[fromDate];
  if (!dayEntries) { closeEditSession(); renderHistory(); return; }
  const i = dayEntries.findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) { closeEditSession(); renderHistory(); return; }
  const entry = dayEntries[i];
  dayEntries.splice(i, 1);
  if (!dayEntries.length) delete hist[fromDate];

  if (cleanSets.length) {
    entry.sets = cleanSets;
    const toDate = _editSession.date;
    if (!hist[toDate]) hist[toDate] = [];
    // Merge into an existing entry for the same exercise on the target date, if any
    const existingIdx = hist[toDate].findIndex(e => (e.exId || e.name) === exKey);
    if (existingIdx >= 0 && toDate !== fromDate) {
      hist[toDate][existingIdx].sets = hist[toDate][existingIdx].sets.concat(cleanSets);
    } else if (existingIdx >= 0) {
      hist[toDate][existingIdx] = entry;
    } else {
      hist[toDate].push(entry);
    }
  }
  // else: all sets cleared -> entry stays removed (deleted)

  saveHistory(hist);
  closeEditSession();
  // If exercise still has any sessions across history, stay on its detail view; otherwise fall back to list
  renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
}

export function deleteSession() {
  if (!_editSession) return;
  const exKey = _editSession.exKey;
  const date = _editSession._openedFromDate;
  const name = _editSession.name;
  // Close the edit-session sheet before showing the confirmation modal — its
  // overlay sits at a higher z-index than the modal, which would otherwise
  // bury the modal underneath it and make "Continue"/"Delete" unclickable.
  closeEditSession();
  showModal('Delete this session?', `Permanently remove the ${date.replace(/\w+,\s/, '')} session for ${name}?`, () => {
    const hist = getHistory();
    const dayEntries = hist[date];
    if (dayEntries) {
      const i = dayEntries.findIndex(e => (e.exId || e.name) === exKey);
      if (i >= 0) {
        dayEntries.splice(i, 1);
        if (!dayEntries.length) delete hist[date];
        saveHistory(hist);
      }
    }
    closeModal();
    renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
  });
}

function exerciseStillHasSessions(exKey) {
  if (!exKey) return false;
  const hist = getHistory();
  return Object.values(hist).some(entries => entries.some(e => (e.exId || e.name) === exKey));
}
