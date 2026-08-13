/* ════════════════════════════════════════════
   Tally Up — Library V2
   Landing (muscle groups) → category (exercise cards) → detail popup.
   Also: search, similar-exercises, add-to-day, and the add/edit form.
   ════════════════════════════════════════════ */
import { DAY_NAMES, FULL_DAYS, MUSCLE_GROUPS_V2, ALL_MUSCLES, MOVEMENT_PATTERNS_BY_GROUP, FIELD_HELP,
         DEFAULT_LIBRARY_V2, saveLibraryV2, genLibV2Id,
         schedule, saveSchedule, currentDay, getHistory, saveHistory, escAttr, escHtml,
         viewedDate, formatISODate, parseISODate, cloneDate } from './state.js';
import { MUSCLE_GROUP_ICONS } from './muscle-group-icons.js';
import { renderDayContent } from './schedule-day.js';
import { showModal, closeModal } from './modal.js';
import { switchTab } from './tabs.js';
import { customLogReceiveExercise, isCustomLogPicking, setCustomLogPicking } from './custom-log.js';
import { speakInstructions } from './speech.js';

/* Set when Library is opened from a specific day's "+ Add exercise" button */
let _libPickingDay = null;
export function getLibPickingDay() { return _libPickingDay; }
export function clearLibPickingDay() { _libPickingDay = null; }

let libActiveGroupKey = null; // group shown in category view, or highlighted on landing after a visit
let libActiveFilterSub = null; // sub-group filter chip selected within a category
let libSearchQuery = '';
export function getLibActiveGroupKey() { return libActiveGroupKey; }
export function resetLibNavState() {
  libActiveGroupKey = null;
  libActiveFilterSub = null;
  libSearchQuery = '';
}
let _libDetailExId = null; // exercise currently shown in the detail popup, for Similar/Add-to-day/edit

export function renderLibV2() {
  renderLibGroupsGrid();
}
export function renderLibGroupsGrid() {
  const wrap = document.getElementById('lib-groups-wrap');
  if (!wrap) return;
  const sections = [
    { label: 'Upper body', keys: ['chest', 'back', 'shoulders', 'arms'] },
    { label: 'Lower body', keys: ['legs'] },
    { label: 'Other', keys: ['core', 'fullbody', 'cardio'] },
  ];
  wrap.innerHTML = sections.map(sec => {
    const tiles = sec.keys.map(key => {
      const g = MUSCLE_GROUPS_V2.find(mg => mg.key === key);
      if (!g) return '';
      const count = DEFAULT_LIBRARY_V2.filter(e => e.group === key).length;
      const active = libActiveGroupKey === key ? ' active' : '';
      const icon = MUSCLE_GROUP_ICONS[key] || '';
      return `<button class="lib-group-tile${active}" onclick="openLibCategory('${g.key}')">
        <div class="lib-group-tile-text">
          <div class="lib-group-tile-name">${escHtml(g.label)}</div>
          <div class="lib-group-tile-count">${count} exercises</div>
        </div>
        <div class="lib-group-tile-icon">${icon}</div>
      </button>`;
    }).join('');
    return `<div class="lib-section-label">${escHtml(sec.label)}</div><div class="lib-group-grid">${tiles}</div>`;
  }).join('');
}

/* ─── CATEGORY VIEW ─── */
export function openLibCategory(groupKey) {
  libActiveGroupKey = groupKey;
  libActiveFilterSub = null;
  document.getElementById('lib-landing').style.display = 'none';
  document.getElementById('lib-category').style.display = '';
  renderLibCategory();
}
export function closeLibCategory() {
  document.getElementById('lib-category').style.display = 'none';
  document.getElementById('lib-landing').style.display = '';
  renderLibGroupsGrid();
}
export function libSelectFilterSub(sub) {
  libActiveFilterSub = (libActiveFilterSub === sub) ? null : sub;
  renderLibCategory();
}
export function renderLibCategory() {
  const g = MUSCLE_GROUPS_V2.find(mg => mg.key === libActiveGroupKey);
  if (!g) return;
  document.getElementById('lib-category-title').textContent = g.label;
  const all = DEFAULT_LIBRARY_V2.filter(e => e.group === libActiveGroupKey);
  document.getElementById('lib-category-count').textContent = all.length + ' exercises';

  const filterRow = document.getElementById('lib-filter-row');
  filterRow.innerHTML = ['All', ...g.subs].map(sub => {
    const isAll = sub === 'All';
    const active = isAll ? (!libActiveFilterSub) : (libActiveFilterSub === sub);
    return `<button class="lib-filter-chip${active ? ' active' : ''}" onclick="libSelectFilterSub(${isAll ? 'null' : `'${escAttr(sub)}'`})">${escHtml(sub)}</button>`;
  }).join('');

  const filtered = libActiveFilterSub ? all.filter(e => e.sub === libActiveFilterSub) : all;
  const cardsEl = document.getElementById('lib-exercise-cards');
  if (!filtered.length) {
    cardsEl.innerHTML = `<div class="empty">No exercises match this filter yet.</div>`;
    return;
  }
  cardsEl.innerHTML = filtered.map(ex => libExerciseCardHtml(ex)).join('');
}
function libExerciseCardHtml(ex) {
  return `<div class="lib-exercise-card" onclick="openExerciseDetail('${ex.id}')">
    <div class="lib-exercise-card-top">
      <div class="lib-exercise-card-name">${escHtml(ex.name)}</div>
      <span class="lib-diff-badge lib-diff-${escAttr(ex.difficulty || 'beginner')}">${escHtml((ex.difficulty || 'beginner').replace(/^./, c => c.toUpperCase()))}</span>
    </div>
    <div class="lib-exercise-card-desc">${escHtml(ex.card || '')}</div>
  </div>`;
}

/* ─── SEARCH ─── */
export function openLibSearch() {
  document.getElementById('lib-category').style.display = 'none';
  document.getElementById('lib-landing').style.display = '';
  document.querySelector('#lib-landing .lib-header-row').classList.add('searching');
  document.getElementById('lib-search-btn').style.display = 'none';
  document.getElementById('lib-search-pill').classList.add('show');
  document.getElementById('lib-groups-wrap').style.display = 'none';
  const input = document.getElementById('lib-search-input');
  input.value = '';
  libSearchQuery = '';
  document.getElementById('lib-search-results').style.display = '';
  document.getElementById('lib-search-results').innerHTML = '';
  setTimeout(() => input.focus(), 200);
}
export function closeLibSearch() {
  document.querySelector('#lib-landing .lib-header-row').classList.remove('searching');
  document.getElementById('lib-search-btn').style.display = '';
  document.getElementById('lib-search-pill').classList.remove('show');
  document.getElementById('lib-groups-wrap').style.display = '';
  document.getElementById('lib-search-results').style.display = 'none';
  libSearchQuery = '';
  renderLibGroupsGrid();
}
export function libSearchInput(query) {
  libSearchQuery = query.trim();
  const resultsEl = document.getElementById('lib-search-results');
  if (!libSearchQuery) { resultsEl.innerHTML = ''; return; }
  const q = libSearchQuery.toLowerCase();
  const matches = DEFAULT_LIBRARY_V2.filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    (ex.muscles && ex.muscles.primary && ex.muscles.primary.some(m => m.toLowerCase().includes(q))) ||
    (ex.equipment && ex.equipment.some(eq => eq.toLowerCase().includes(q)))
  );
  resultsEl.innerHTML = matches.length
    ? matches.map(ex => libExerciseCardHtml(ex)).join('')
    : `<div class="empty">No exercises match your search.</div>`;
}

/* ─── EXERCISE DETAIL POPUP ─── */
export function findLibExById(id) { return DEFAULT_LIBRARY_V2.find(e => e.id === id); }
export function findLibExByIdOrName(idOrName) {
  return DEFAULT_LIBRARY_V2.find(e => e.id === idOrName) || DEFAULT_LIBRARY_V2.find(e => e.name === idOrName);
}
export function openExerciseDetail(idOrName) {
  const ex = findLibExByIdOrName(idOrName);
  if (!ex) return;
  _libDetailExId = ex.id;
  document.getElementById('ex-detail-title').textContent = ex.name;
  const diff = (ex.difficulty || 'beginner');
  const badgesEl = document.getElementById('ex-detail-badges');
  badgesEl.innerHTML = `<span class="ex-detail-badge lib-diff-${escAttr(diff)}">${escHtml(diff.replace(/^./, c => c.toUpperCase()))}</span>` +
    (ex.exerciseType ? `<span class="ex-detail-badge ex-detail-badge-neutral">${escHtml(ex.exerciseType.replace(/^./, c => c.toUpperCase()))}</span>` : '') +
    (ex.blurb ? `<button class="ex-instr-speak-btn" id="ex-instr-speak-btn" aria-label="Read instructions aloud" onclick="speakExerciseInstructions()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </button>` : '');
  document.getElementById('ex-detail-blurb').textContent = ex.blurb || ex.card || 'No description yet.';

  const primary = (ex.muscles && ex.muscles.primary) || [];
  const secondary = (ex.muscles && ex.muscles.secondary) || [];
  const worksText = primary.length
    ? primary.join(', ') + (secondary.length ? ` <span class="ex-detail-more-toggle" id="ex-detail-more-toggle" onclick="toggleExDetailSecondary()">+${secondary.length} more</span><span class="ex-detail-secondary" id="ex-detail-secondary" style="display:none">${escHtml(secondary.join(', '))}</span>` : '')
    : '—';
  const equipText = (ex.equipment && ex.equipment.length) ? ex.equipment.join(', ') : '—';
  const setsRepsText = [ex.sets ? ex.sets + ' sets' : '', ex.reps ? ex.reps + ' reps' : ''].filter(Boolean).join(' · ') || '—';
  document.getElementById('ex-detail-stats').innerHTML = `
    <tr><td><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Works</td><td>${worksText}</td></tr>
    <tr><td><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="1"/><path d="M4 9V7a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2M16 9V7a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>Equipment</td><td>${escHtml(equipText)}</td></tr>
    <tr><td><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Sets · Reps</td><td>${escHtml(setsRepsText)}</td></tr>
    <tr><td><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Rest</td><td>${escHtml(ex.rest || '—')}</td></tr>
  `;

  const addBtn = document.getElementById('ex-detail-add-btn');
  if (isCustomLogPicking()) {
    addBtn.textContent = 'Add to custom log';
    addBtn.onclick = () => {
      setCustomLogPicking(false);
      closeExerciseDetail();
      switchTab('log');
      customLogReceiveExercise(ex);
    };
  } else {
    addBtn.textContent = 'Add to day';
    addBtn.onclick = () => openLibAddDay(ex.id);
  }
  document.getElementById('ex-detail-similar-btn').onclick = () => openLibSimilar(ex.id);
  document.getElementById('ex-detail-gear-btn').onclick = () => { closeExerciseDetail(); openLibExerciseForm(ex.id); };
  document.getElementById('ex-detail-wrap').classList.add('show');
}
export function closeExerciseDetail() {
  document.getElementById('ex-detail-wrap').classList.remove('show');
}
export function toggleExDetailSecondary() {
  const toggle = document.getElementById('ex-detail-more-toggle');
  const secondary = document.getElementById('ex-detail-secondary');
  if (!toggle || !secondary) return;
  const showing = secondary.style.display !== 'none';
  secondary.style.display = showing ? 'none' : '';
  toggle.style.display = showing ? '' : 'none';
}
export function speakExerciseInstructions() {
  const ex = findLibExById(_libDetailExId);
  if (!ex || !ex.blurb) return;
  speakInstructions(ex.blurb, document.getElementById('ex-instr-speak-btn'));
}

export function openExerciseInstructions(name) {
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === name);
  const blurb = ex && ex.blurb;
  if (!blurb) return;
  document.getElementById('ex-instr-title').textContent = name;
  document.getElementById('ex-instr-body').textContent = blurb;
  document.getElementById('ex-instr-wrap').classList.add('show');
}
export function closeExerciseInstructions() {
  document.getElementById('ex-instr-wrap').classList.remove('show');
}

/* ─── SIMILAR EXERCISES ─── */
function libSimilarByMuscle(ex) {
  const primary = (ex.muscles && ex.muscles.primary) || [];
  if (!primary.length) return [];
  return DEFAULT_LIBRARY_V2.filter(o => o.id !== ex.id && o.muscles && o.muscles.primary &&
    o.muscles.primary.some(m => primary.includes(m)));
}
function libSimilarByEquipment(ex) {
  const eq = ex.equipment || [];
  if (!eq.length) return [];
  return DEFAULT_LIBRARY_V2.filter(o => o.id !== ex.id && o.equipment &&
    o.equipment.some(e => eq.includes(e)));
}
function libSimilarByMovement(ex) {
  if (!ex.movementPattern) return [];
  return DEFAULT_LIBRARY_V2.filter(o => o.id !== ex.id && o.movementPattern === ex.movementPattern);
}
let libSimilarActiveCat = null;
export function openLibSimilar(exId) {
  const ex = findLibExById(exId);
  if (!ex) return;
  _libDetailExId = exId;
  libSimilarActiveCat = null;
  document.getElementById('lib-similar-title').textContent = 'Similar exercises';
  document.getElementById('lib-similar-sub').textContent = 'To ' + ex.name.toLowerCase();
  closeExerciseDetail();
  renderLibSimilar();
  document.getElementById('lib-similar-wrap').classList.add('show');
}
export function closeLibSimilar() {
  document.getElementById('lib-similar-wrap').classList.remove('show');
}
export function libSelectSimilarCat(cat) {
  libSimilarActiveCat = (libSimilarActiveCat === cat) ? null : cat;
  renderLibSimilar();
}
function renderLibSimilar() {
  const ex = findLibExById(_libDetailExId);
  if (!ex) return;
  const muscleMatches = libSimilarByMuscle(ex);
  const equipMatches = libSimilarByEquipment(ex);
  const movementMatches = libSimilarByMovement(ex);
  const primaryLabel = (ex.muscles && ex.muscles.primary && ex.muscles.primary.join(', ')) || '—';
  const equipLabel = (ex.equipment && ex.equipment.join(' or ')) || '—';

  const cats = [
    { key: 'muscle', name: 'Similar muscles', hint: primaryLabel, results: muscleMatches },
    { key: 'equipment', name: 'Similar equipment', hint: equipLabel, results: equipMatches },
    { key: 'movement', name: 'Similar movement', hint: ex.movementPattern || '—', results: movementMatches },
  ];

  document.getElementById('lib-similar-categories').innerHTML = cats.map(c => `
    <div class="lib-similar-cat${libSimilarActiveCat === c.key ? ' active' : ''}" onclick="libSelectSimilarCat('${c.key}')">
      <div>
        <div class="lib-similar-cat-name">${escHtml(c.name)}</div>
        <div class="lib-similar-cat-hint">${escHtml(c.hint)}</div>
      </div>
      <div class="lib-similar-cat-count">${c.results.length}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  `).join('');

  const activeCat = cats.find(c => c.key === libSimilarActiveCat);
  const resultsEl = document.getElementById('lib-similar-results');
  if (!activeCat) { resultsEl.innerHTML = ''; return; }
  resultsEl.innerHTML = `<div class="lib-similar-group-label">${escHtml(activeCat.name)}</div>` +
    (activeCat.results.length
      ? activeCat.results.map(r => `
        <div class="lib-similar-result" onclick="openExerciseFromSimilar('${r.id}')">
          <div class="lib-similar-result-name">${escHtml(r.name)}</div>
          <div class="lib-similar-result-desc">${escHtml(r.card || '')}</div>
        </div>`).join('')
      : `<div class="empty">Nothing else matches yet.</div>`);
}
// Clicking a result inside the Similar Exercises popup should replace it with
// that exercise's own detail view, not stack a second overlay on top of it.
export function openExerciseFromSimilar(idOrName) {
  closeLibSimilar();
  openExerciseDetail(idOrName);
}

/* ─── ADD TO DAY (calendar + repeat) ─── */
let libAddDayExId = null;
let libAddDaySelectedDates = [];
let libAddDayRepeat = 'never';
let libAddDayCalMonth = null;

export function openLibAddDay(exId) {
  const ex = findLibExById(exId);
  if (!ex) return;
  libAddDayExId = exId;
  libAddDaySelectedDates = [];
  libAddDayRepeat = 'never';
  libAddDayCalMonth = new Date(viewedDate.getFullYear(), viewedDate.getMonth(), 1);
  if (_libPickingDay) {
    const dayIdx = DAY_NAMES.indexOf(_libPickingDay);
    if (dayIdx !== -1) {
      const d = new Date();
      while (d.getDay() !== dayIdx) d.setDate(d.getDate() + 1);
      libAddDaySelectedDates = [formatISODate(d)];
      libAddDayCalMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    }
  }
  closeExerciseDetail();
  document.getElementById('lib-add-day-title').textContent = 'Add ' + ex.name.toLowerCase();
  renderLibAddDayCal();
  renderLibAddDayRepeat();
  document.getElementById('lib-add-day-wrap').classList.add('show');
}
export function closeLibAddDay() {
  document.getElementById('lib-add-day-wrap').classList.remove('show');
  _libPickingDay = null;
}
export function libAddDayCalNav(dir) {
  libAddDayCalMonth = new Date(libAddDayCalMonth.getFullYear(), libAddDayCalMonth.getMonth() + dir, 1);
  renderLibAddDayCal();
}
export function libToggleCalDate(iso) {
  const idx = libAddDaySelectedDates.indexOf(iso);
  if (idx === -1) libAddDaySelectedDates.push(iso);
  else libAddDaySelectedDates.splice(idx, 1);
  renderLibAddDayCal();
}
function renderLibAddDayCal() {
  const label = libAddDayCalMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('lib-cal-month-label').textContent = label;
  const year = libAddDayCalMonth.getFullYear(), month = libAddDayCalMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const numDays = new Date(year, month + 1, 0).getDate();
  const dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  let html = dow.map(d => `<div class="lib-cal-dow">${d}</div>`).join('');
  for (let i = 0; i < firstDow; i++) html += `<div class="lib-cal-day empty"></div>`;
  for (let d = 1; d <= numDays; d++) {
    const iso = formatISODate(new Date(year, month, d));
    const selected = libAddDaySelectedDates.includes(iso);
    html += `<div class="lib-cal-day${selected ? ' selected' : ''}" onclick="libToggleCalDate('${iso}')">${d}</div>`;
  }
  document.getElementById('lib-cal-grid').innerHTML = html;
  const n = libAddDaySelectedDates.length;
  document.getElementById('lib-cal-selected-count').textContent = n === 0 ? 'No dates selected' : n + ' date' + (n === 1 ? '' : 's') + ' selected';
  document.getElementById('lib-add-day-confirm-btn').textContent = n > 1 ? `Add to ${n} days` : 'Add';
}
export function libSelectRepeat(val) {
  libAddDayRepeat = val;
  renderLibAddDayRepeat();
}
function renderLibAddDayRepeat() {
  const opts = [
    { key: 'never', label: 'Never' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'biweekly', label: 'Every 2 weeks' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];
  document.getElementById('lib-repeat-row').innerHTML = opts.map(o =>
    `<button class="lib-repeat-chip${libAddDayRepeat === o.key ? ' active' : ''}" onclick="libSelectRepeat('${o.key}')">${escHtml(o.label)}</button>`
  ).join('');
}
function libExpandRepeatDates(baseDates, repeat) {
  if (repeat === 'never') return baseDates.slice();
  const stepFns = {
    daily:    d => { const r = cloneDate(d); r.setDate(r.getDate() + 1); return r; },
    weekly:   d => { const r = cloneDate(d); r.setDate(r.getDate() + 7); return r; },
    biweekly: d => { const r = cloneDate(d); r.setDate(r.getDate() + 14); return r; },
    monthly:  d => { const r = cloneDate(d); r.setMonth(r.getMonth() + 1); return r; },
    yearly:   d => { const r = cloneDate(d); r.setFullYear(r.getFullYear() + 1); return r; },
  };
  const step = stepFns[repeat];
  if (!step) return baseDates.slice();
  const horizon = new Date(); horizon.setFullYear(horizon.getFullYear() + 1);
  const out = new Set();
  baseDates.forEach(iso => {
    let d = parseISODate(iso);
    let guard = 0;
    while (d <= horizon && guard < 366) {
      out.add(formatISODate(d));
      d = step(d);
      guard++;
    }
  });
  return [...out];
}
export function confirmLibAddDay() {
  const ex = findLibExById(libAddDayExId);
  if (!ex || !libAddDaySelectedDates.length) return;
  const allDates = libExpandRepeatDates(libAddDaySelectedDates, libAddDayRepeat);
  allDates.forEach(iso => {
    const d = parseISODate(iso);
    const dn = DAY_NAMES[d.getDay()];
    if (!schedule[dn].exercises.some(e => e.exId === ex.id)) {
      schedule[dn].exercises.push({ exId: ex.id, name: ex.name });
    }
  });
  saveSchedule();
  closeLibAddDay();
  if (schedule[currentDay]) renderDayContent();
}

/* ─── ADD / EDIT EXERCISE FORM ─── */
let _libFormEditingId = null;
let _libFormSecondary = [];
let _libFormEquipment = [];

function libFormPopulateGroupSelect(selectedGroupKey) {
  const sel = document.getElementById('lf-group');
  sel.innerHTML = MUSCLE_GROUPS_V2.map(g =>
    `<option value="${g.key}"${g.key === selectedGroupKey ? ' selected' : ''}>${g.label}</option>`
  ).join('');
}
export function libFormSyncSubs() {
  const groupKey = document.getElementById('lf-group').value;
  const groupObj = MUSCLE_GROUPS_V2.find(g => g.key === groupKey);
  const subSel = document.getElementById('lf-sub');
  const subs = groupObj ? groupObj.subs : [];
  subSel.innerHTML = subs.map(s => `<option value="${escAttr(s)}">${escHtml(s)}</option>`).join('');
  libFormSyncMovementOptions();
}
// Rebuilds the Movement Pattern dropdown to only show patterns relevant to the
// form's currently-selected muscle group (#8). Preserves the current value if
// it's still valid for the new group; otherwise falls back to the first option.
function libFormSyncMovementOptions(keepValue) {
  const groupKey = document.getElementById('lf-group').value;
  const patterns = MOVEMENT_PATTERNS_BY_GROUP[groupKey] || [];
  const sel = document.getElementById('lf-movement');
  const prevValue = keepValue !== undefined ? keepValue : sel.value;
  sel.innerHTML = patterns.map(p => `<option value="${escAttr(p)}">${escHtml(p)}</option>`).join('');
  if (prevValue && patterns.includes(prevValue)) sel.value = prevValue;
}
// Rebuilds the Secondary Muscles dropdown picker, excluding muscles already
// added as tags. Disabled (with an explanatory placeholder) once the 3-muscle
// cap is reached (#7).
function libFormSyncSecondaryPicker() {
  const sel = document.getElementById('lf-secondary-picker');
  const atLimit = _libFormSecondary.length >= 3;
  if (atLimit) {
    sel.innerHTML = `<option value="">Limit reached (3 max) — remove one to add another</option>`;
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  const available = ALL_MUSCLES.filter(m => !_libFormSecondary.includes(m));
  sel.innerHTML = `<option value="">Add a secondary muscle…</option>` +
    available.map(m => `<option value="${escAttr(m)}">${escHtml(m)}</option>`).join('');
}
export function libFormAddSecondaryFromPicker() {
  const sel = document.getElementById('lf-secondary-picker');
  const val = sel.value;
  if (!val || _libFormSecondary.length >= 3) return;
  _libFormSecondary.push(val);
  libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary');
  libFormSyncSecondaryPicker();
}
function libFormRenderTags(containerId, items, removeFn) {
  document.getElementById(containerId).innerHTML = items.map((item, i) =>
    `<span class="lib-tag-pill">${escHtml(item)}<button onclick="${removeFn}(${i})" aria-label="Remove">✕</button></span>`
  ).join('');
}
export function libFormRemoveSecondary(i) {
  _libFormSecondary.splice(i, 1);
  libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary');
  libFormSyncSecondaryPicker();
}
export function libFormRemoveEquipment(i) {
  _libFormEquipment.splice(i, 1);
  libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment');
  const eqInput = document.getElementById('lf-equipment-input');
  if (eqInput) {
    eqInput.disabled = false;
    eqInput.placeholder = 'Type and press enter to add';
  }
}
function libFormWireTagInputs() {
  const eqInput = document.getElementById('lf-equipment-input');
  eqInput.onkeydown = (e) => {
    if (e.key === 'Enter' && eqInput.value.trim()) {
      e.preventDefault();
      if (_libFormEquipment.length >= 3) return;
      _libFormEquipment.push(eqInput.value.trim());
      eqInput.value = '';
      libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment');
      eqInput.placeholder = _libFormEquipment.length >= 3 ? 'Limit reached (3 max)' : 'Type and press enter to add';
      eqInput.disabled = _libFormEquipment.length >= 3;
    }
  };
}
export function openLibExerciseForm(exId) {
  libFormWireTagInputs();
  const eqInput = document.getElementById('lf-equipment-input');
  eqInput.disabled = false;
  eqInput.placeholder = 'Type and press enter to add';
  if (exId) {
    const ex = findLibExById(exId);
    if (!ex) return;
    _libFormEditingId = exId;
    document.getElementById('lib-form-title').textContent = 'Edit exercise';
    document.getElementById('lf-name').value = ex.name;
    libFormPopulateGroupSelect(ex.group);
    libFormSyncSubs();
    if (ex.sub) document.getElementById('lf-sub').value = ex.sub;
    document.getElementById('lf-primary').value = (ex.muscles && ex.muscles.primary && ex.muscles.primary.join(', ')) || '';
    _libFormSecondary = (ex.muscles && ex.muscles.secondary) ? [...ex.muscles.secondary].slice(0, 3) : [];
    _libFormEquipment = ex.equipment ? [...ex.equipment].slice(0, 3) : [];
    libFormSyncMovementOptions(ex.movementPattern || '');
    document.getElementById('lf-type').value = ex.exerciseType || 'compound';
    document.getElementById('lf-difficulty').value = ex.difficulty || 'beginner';
    document.getElementById('lf-laterality').value = ex.laterality || 'bilateral';
    document.getElementById('lf-position').value = ex.position || 'standing';
    document.getElementById('lf-sets').value = ex.sets != null ? ex.sets : '';
    document.getElementById('lf-reps').value = ex.reps || '';
    // Split the stored restSecs back into a plain number + unit for the two
    // fields (#10). Falls back to parsing the legacy free-text `rest` string
    // if restSecs is somehow missing, then defaults to 60 secs.
    const restSecsVal = (typeof ex.restSecs === 'number' && ex.restSecs > 0) ? ex.restSecs : null;
    if (restSecsVal !== null && restSecsVal % 60 === 0 && restSecsVal >= 60) {
      document.getElementById('lf-rest-value').value = restSecsVal / 60;
      document.getElementById('lf-rest-unit').value = 'mins';
    } else if (restSecsVal !== null) {
      document.getElementById('lf-rest-value').value = restSecsVal;
      document.getElementById('lf-rest-unit').value = 'secs';
    } else {
      document.getElementById('lf-rest-value').value = 60;
      document.getElementById('lf-rest-unit').value = 'secs';
    }
    document.getElementById('lf-card').value = ex.card || '';
    document.getElementById('lf-blurb').value = ex.blurb || '';
    document.getElementById('lib-form-btn-row').style.display = '';
  } else {
    _libFormEditingId = null;
    document.getElementById('lib-form-title').textContent = 'New exercise';
    ['lf-name','lf-primary','lf-sets','lf-reps','lf-card','lf-blurb'].forEach(id => document.getElementById(id).value = '');
    _libFormSecondary = [];
    _libFormEquipment = [];
    libFormPopulateGroupSelect(MUSCLE_GROUPS_V2[0].key);
    libFormSyncSubs();
    document.getElementById('lf-type').value = 'compound';
    document.getElementById('lf-difficulty').value = 'beginner';
    document.getElementById('lf-laterality').value = 'bilateral';
    document.getElementById('lf-position').value = 'standing';
    document.getElementById('lf-rest-value').value = 60;
    document.getElementById('lf-rest-unit').value = 'secs';
    document.getElementById('lib-form-btn-row').style.display = 'none';
  }
  libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary');
  libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment');
  libFormSyncSecondaryPicker();
  document.getElementById('lib-form-wrap').classList.add('show');
}
export function closeLibExerciseForm() {
  document.getElementById('lib-form-wrap').classList.remove('show');
}
export function saveLibExerciseForm() {
  const name = document.getElementById('lf-name').value.trim();
  if (!name) { document.getElementById('lf-name').focus(); return; }
  const group = document.getElementById('lf-group').value;
  const sub = document.getElementById('lf-sub').value;
  const primaryRaw = document.getElementById('lf-primary').value.trim();
  const primary = primaryRaw ? primaryRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const movementPattern = document.getElementById('lf-movement').value.trim();
  const exerciseType = document.getElementById('lf-type').value;
  const difficulty = document.getElementById('lf-difficulty').value;
  const laterality = document.getElementById('lf-laterality').value;
  const position = document.getElementById('lf-position').value;
  const setsRaw = document.getElementById('lf-sets').value.trim();
  const sets = setsRaw ? (Math.max(0, parseInt(setsRaw)) || 0) : undefined;
  const reps = document.getElementById('lf-reps').value.trim() || '8-12';
  // Rebuild rest/restSecs from the split value+unit fields (#10).
  const restValueRaw = parseFloat(document.getElementById('lf-rest-value').value);
  const restValue = (!isNaN(restValueRaw) && restValueRaw >= 0) ? restValueRaw : 60;
  const restUnit = document.getElementById('lf-rest-unit').value;
  const restSecs = restUnit === 'mins' ? Math.round(restValue * 60) : Math.round(restValue);
  const restRaw = restUnit === 'mins'
    ? `${restValue} min${restValue === 1 ? '' : 's'}`
    : `${restValue} sec${restValue === 1 ? '' : 's'}`;
  const card = document.getElementById('lf-card').value.trim();
  const blurb = document.getElementById('lf-blurb').value.trim();
  const type = _libFormEquipment.includes('Dumbbell') ? 'dumbbell'
    : _libFormEquipment.includes('Bodyweight') ? 'bodyweight'
    : 'gym';

  const muscles = { primary, secondary: [..._libFormSecondary].slice(0, 3), stabilizers: [] };

  if (_libFormEditingId) {
    const ex = findLibExById(_libFormEditingId);
    if (ex) {
      const oldName = ex.name;
      Object.assign(ex, { name, group, sub, muscles, equipment: [..._libFormEquipment], movementPattern, exerciseType, laterality, position, difficulty, card, blurb, reps, rest: restRaw, restSecs, type, _userEdited: true });
      if (sets !== undefined) ex.sets = sets;
      if (oldName !== name) {
        let schedTouched = false;
        DAY_NAMES.forEach(d => {
          schedule[d].exercises.forEach(se => {
            if (se.name === oldName) { se.exId = ex.id; se.name = ex.name; schedTouched = true; }
          });
        });
        if (schedTouched) saveSchedule();
        const hist = getHistory();
        let histTouched = false;
        Object.values(hist).forEach(entries => entries.forEach(he => {
          if (he.name === oldName) { he.exId = ex.id; he.name = ex.name; histTouched = true; }
        }));
        if (histTouched) saveHistory(hist);
      }
    }
  } else {
    const newEx = { id: genLibV2Id(), name, group, sub, muscles, equipment: [..._libFormEquipment], movementPattern, exerciseType, laterality, position, difficulty, card, blurb, reps, rest: restRaw, restSecs, type, _userEdited: true };
    if (sets !== undefined) newEx.sets = sets;
    DEFAULT_LIBRARY_V2.push(newEx);
  }
  saveLibraryV2();
  closeLibExerciseForm();
  if (libActiveGroupKey) renderLibCategory();
  renderLibGroupsGrid();
}
export function deleteLibExercise() {
  if (!_libFormEditingId) return;
  const ex = findLibExById(_libFormEditingId);
  if (!ex) return;

  const daysUsingIt = DAY_NAMES.filter(d =>
    schedule[d].exercises.some(e => ex.id && e.exId === ex.id)
  ).map(d => FULL_DAYS[d]);

  // Close the exercise-edit form before showing the confirmation modal — its
  // overlay sits at a higher z-index than the modal, which would otherwise
  // bury the modal underneath it and make "Continue"/"Delete" unclickable.
  closeLibExerciseForm();

  const doDelete = () => {
    const idx = DEFAULT_LIBRARY_V2.findIndex(e => e.id === ex.id);
    if (idx !== -1) DEFAULT_LIBRARY_V2.splice(idx, 1);
    DAY_NAMES.forEach(d => {
      schedule[d].exercises = schedule[d].exercises.filter(e => !(ex.id && e.exId === ex.id));
    });
    saveLibraryV2();
    saveSchedule();
    if (libActiveGroupKey) renderLibCategory();
    renderLibGroupsGrid();
    if (schedule[currentDay]) renderDayContent();
  };

  if (daysUsingIt.length) {
    const dayList = daysUsingIt.join(', ');
    showModal(
      'Delete exercise?',
      `"${ex.name}" is currently in ${dayList}. Deleting it from the library will also remove it from ${daysUsingIt.length > 1 ? 'those days' : 'that day'}, and you won't be able to log any more history for it. This can't be undone.`,
      () => { doDelete(); closeModal(); }
    );
  } else {
    showModal('Delete exercise?', `Delete "${ex.name}" from the library? This can't be undone.`, () => { doDelete(); closeModal(); });
  }
}

/* ─── FIELD HELP POPUP (#5, #9) ─── */
export function openFieldHelp(fieldKey) {
  const data = FIELD_HELP[fieldKey];
  if (!data) return;
  document.getElementById('field-help-title').textContent = data.title;
  document.getElementById('field-help-intro').textContent = data.intro;
  document.getElementById('field-help-options').innerHTML = data.options.map(([name, desc]) =>
    `<div><div class="field-help-option-name">${escHtml(name)}</div><div class="field-help-option-desc">${escHtml(desc)}</div></div>`
  ).join('');
  document.getElementById('field-help-wrap').classList.add('show');
}
export function closeFieldHelp() {
  document.getElementById('field-help-wrap').classList.remove('show');
}

export function openLibV2ForDay(day) {
  _libPickingDay = day;
  switchTab('library');
}
