/* ════════════════════════════════════════════
   Tally Up — application logic
   ════════════════════════════════════════════ */

/* ─── CONSTANTS ─── */
const KEYS = {
  schedule:  'wl_schedule',
  history:   'wl_v3',
  bw:        'wl_bw',
  name:      'wl_name',
  theme:     'wl_theme',
  base:      'wl_base',
  accent:    'wl_accent',
  units:     'wl_units',
  welcomed:  'wl_welcomed',
  greetDate: 'wl_greet_date',
  greetOrder:'wl_greet_order',
  music:     'wl_music_enabled',
  libraryV2: 'wl_library_v2',
  blurbsV2:  'wl_blurbs_v2',
  showInstr: 'wl_show_instr_icons',
  monthViewMode: 'wl_month_view_mode',
};
// APP_VERSION is read from the service worker's cache name at runtime,
// so the only place to update the version is service-worker.js.
let APP_VERSION = '';
function loadAppVersion() {
  if (!self.caches) return;
  caches.keys().then(function(keys) {
    var tm = keys.find(function(k) { return k.indexOf('tallyup-') === 0; });
    if (tm) {
      APP_VERSION = tm.replace('tallyup-', '');
      var vEl = document.getElementById('settings-version');
      if (vEl) vEl.textContent = APP_VERSION;
    }
  }).catch(function(){});
}
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const FULL_DAYS = {Sun:'Sunday',Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday'};
const TAG_LABEL = {gym:'Gym',dumbbell:'Dumbbells',bodyweight:'Bodyweight',custom:'Custom'};
const TAG_CLASS = {gym:'tag-gym',dumbbell:'tag-dumbbell',bodyweight:'tag-bodyweight',custom:'tag-custom'};
function genId() { return Math.random().toString(36).slice(2, 7); }

/* ─── DEFAULT DATA ─── */
const DEFAULT_DAYS = {
  Sun:{label:'Sunday',   restDay:false,exercises:[]},
  Mon:{label:'Monday',   restDay:false,exercises:[]},
  Tue:{label:'Tuesday',  restDay:false,exercises:[]},
  Wed:{label:'Wednesday',restDay:false,exercises:[]},
  Thu:{label:'Thursday', restDay:false,exercises:[]},
  Fri:{label:'Friday',   restDay:false,exercises:[]},
  Sat:{label:'Saturday', restDay:false,exercises:[]},
};
/* ═══════════════════════════════════════════════════════════
   LIBRARY V2 — PREVIEW ONLY, NOT WIRED TO ANYTHING YET
   Two-tier tag system: group (gross) + sub (sub-region).
   Filtering later will match on group OR group+sub together.
   ═══════════════════════════════════════════════════════════ */
const MUSCLE_GROUPS_V2 = [
  { key:'chest',     label:'Chest',     color:'coral',  subs:['Presses','Isolation','Bodyweight'] },
  { key:'back',      label:'Back',      color:'blue',   subs:['Vertical Pull','Rows','Lat Isolation','Upper back','Traps'] },
  { key:'shoulders', label:'Shoulders', color:'amber',  subs:['Presses','Lateral Delts','Rear Delts','Front delts'] },
  { key:'arms',      label:'Arms',      color:'purple', subs:['Biceps','Triceps','Forearms','Grip'] },
  { key:'legs',      label:'Legs',      color:'teal',   subs:['Quads','Hamstrings','Glutes','Calves'] },
  { key:'core',      label:'Core',      color:'green',  subs:['Flexion','Anti-Extension','Anti-Rotation','Lateral','Rotation'] },
  { key:'fullbody',  label:'Full Body', color:'gray',   subs:['Deadlifts','Olympic Lifts','Presses','Kettlebell','Bodyweight','Conditioning'] },
  { key:'cardio',    label:'Cardio',    color:'gray',   subs:['Running','Walking','Cycling','Rowing','Other'] },
];
// DEFAULT_LIBRARY_V2_BASE is defined in exercises-data.js (loaded before this file)
// Live, mutable working copy of the library — this is what the rest of the app reads
// from and writes to. Starts as a fresh copy of the hardcoded defaults, then any saved
// edits/additions are merged on top at load time (see loadLibraryV2 below).
let DEFAULT_LIBRARY_V2 = JSON.parse(JSON.stringify(DEFAULT_LIBRARY_V2_BASE));

function saveLibraryV2() {
  try { localStorage.setItem(KEYS.libraryV2, JSON.stringify(DEFAULT_LIBRARY_V2)); } catch {}
}
function loadLibraryV2() {
  try {
    const saved = localStorage.getItem(KEYS.libraryV2);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Guard against stale saved copies from before the 242-exercise library
      // rebuild silently overwriting the fresh data with old/incompatible
      // exercise objects (missing muscles/equipment/blurb/etc, mismatched IDs).
      // A real modern save always has more than the old ~105-exercise count and
      // every entry carries the new `blurb` field, which old saves never had.
      const looksModern = Array.isArray(parsed) && parsed.length > 150 && parsed.every(e => e && typeof e.blurb === 'string');
      if (looksModern) DEFAULT_LIBRARY_V2 = parsed;
    }
  } catch {}
}
// Generates an ID guaranteed not to collide with any existing exercise ID —
// genId() alone is extremely unlikely to collide, but this makes it certain.
function genLibV2Id() {
  let id;
  do { id = genId(); } while (DEFAULT_LIBRARY_V2.some(e => e.id === id));
  return id;
}


/* ─── STATE ─── */
let schedule = JSON.parse(JSON.stringify(DEFAULT_DAYS));
// currentDay tracks the day-of-week of whatever date the calendar is currently
// viewing (see calendar.js / viewedDate) — it's what schedule-editing actions
// (rest-day toggle, copy-to-all-days, add-exercise) operate on.
let currentDay = DAY_NAMES[new Date().getDay()];
let dayEditMode = false;
let sessionSets = {};
let timerInterval = null, timerSeconds = 0;
// Per-exercise rest timers — keyed by `${day}-${idx}`. Each: { secsLeft, total, intervalId }
let exerciseTimers = {};
let activeCharts = [];
let currentUnits = 'lbs';
let showInstructionsIcons = false;

/* ─── STORAGE ─── */
function saveSchedule() { try { localStorage.setItem(KEYS.schedule, JSON.stringify(schedule)); } catch {} }
function loadSchedule() { try { const s = localStorage.getItem(KEYS.schedule); if (s) schedule = JSON.parse(s); } catch {} }
function getHistory()   { try { return JSON.parse(localStorage.getItem(KEYS.history) || '{}'); } catch { return {}; } }
function saveHistory(h) { try { localStorage.setItem(KEYS.history, JSON.stringify(h)); } catch {} }

function getCleanBw() {
  let raw = localStorage.getItem(KEYS.bw);
  if (!raw) return null;
  try { raw = JSON.parse(raw); } catch {}
  if (typeof raw === 'object') { localStorage.removeItem(KEYS.bw); return null; }
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}
function saveBodyweight(val) {
  if (val === '' || val == null) return;
  localStorage.setItem(KEYS.bw, parseFloat(val));
  updateBwDisplay();
}
function updateBwDisplay() {
  const val = getCleanBw();
  document.getElementById('bw-display').textContent = val != null ? val : '—';
  document.getElementById('bw-unit-label').textContent = currentUnits;
  const su = document.getElementById('settings-bw-unit');
  if (su) su.textContent = currentUnits;
}

/* ─── UNITS & THEME ─── */
function setUnits(u) {
  currentUnits = u;
  localStorage.setItem(KEYS.units, u);
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === u));
  updateBwDisplay();
  renderDayContent();
}
const THEME_COLORS = { 'light-beige': '#f4efe6', 'light-white': '#ffffff', 'dark-green': '#0f1817', 'dark-black': '#000000' };
// Old themes retired in the light/dark + accent rework — map them to the closest
// (theme, base, accent) so existing users land somewhere familiar instead of erroring out.
const LEGACY_THEME_MIGRATION = {
  matrix: { theme: 'dark', base: 'green', accent: 'green' },
  mdnt:   { theme: 'dark', base: 'black', accent: 'red' },
};
const ACCENTS = [
  { id: 'teal',    light: '#1f4f47', dark: '#5fb5a4' },
  { id: 'coral',   light: '#e85d52', dark: '#ef7a70' },
  { id: 'orange',  light: '#ff751f', dark: '#ff9955' },
  { id: 'scarlet', light: '#ff3131', dark: '#ff6b6b' },
  { id: 'red',     light: '#c03232', dark: '#e57373' },
  { id: 'pink',    light: '#d6478a', dark: '#ef8ec0' },
  { id: 'purple',  light: '#6b4fa0', dark: '#afa9ec' },
  { id: 'indigo',  light: '#4c4fb0', dark: '#9497e0' },
  { id: 'blue',    light: '#1a5fa5', dark: '#5b9bd5' },
  { id: 'cyan',    light: '#0e8f9e', dark: '#5cd6e6' },
  { id: 'green',   light: '#2a8a5c', dark: '#5dc78a' },
  { id: 'yellow',  light: '#b8901a', dark: '#f0d955' },
  { id: 'amber',   light: '#a8710a', dark: '#f0b955' },
  { id: 'gray',    light: '#5b5b58', dark: '#b0b0ab' },
];
// Each family (light/dark) cycles between two base variants when its button is
// tapped again while already active. Tapping the *other* family switches into it
// at its default base rather than cycling.
const THEME_BASE_CYCLE = { light: ['beige', 'white'], dark: ['green', 'black'] };
const THEME_BASE_DEFAULT = { light: 'beige', dark: 'green' };
function syncThemeColorMeta(t, b) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[t + '-' + b] || THEME_COLORS['light-beige']);
}
function applyTheme(t, b) {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('data-base', b);
  localStorage.setItem(KEYS.theme, t);
  localStorage.setItem(KEYS.base, b);
  document.querySelectorAll('#theme-toggle .seg-opt, #welcome-theme .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
  syncThemeColorMeta(t, b);
  syncThemeBaseLabel(b);
  renderAccentSwatches();
}
function syncThemeBaseLabel(b) {
  const label = '(' + b + ')';
  const w = document.getElementById('welcome-base-label'); if (w) w.textContent = label;
  const s = document.getElementById('settings-base-label'); if (s) s.textContent = label;
}
// Called by the Light/Dark buttons. If that family is already active, cycles to
// its other base variant; otherwise switches families at the default base.
function setTheme(t) {
  const curTheme = document.documentElement.getAttribute('data-theme');
  const curBase = document.documentElement.getAttribute('data-base') || THEME_BASE_DEFAULT[t];
  let nextBase;
  if (curTheme === t) {
    const cycle = THEME_BASE_CYCLE[t];
    const idx = cycle.indexOf(curBase);
    nextBase = cycle[(idx + 1) % cycle.length];
  } else {
    nextBase = THEME_BASE_DEFAULT[t];
  }
  applyTheme(t, nextBase);
}
function setAccent(a) {
  document.documentElement.setAttribute('data-accent', a);
  localStorage.setItem(KEYS.accent, a);
  renderAccentSwatches();
}
function renderAccentSwatches() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const current = localStorage.getItem(KEYS.accent) || 'teal';
  const html = ACCENTS.map(a => `<button class="accent-swatch${a.id===current?' active':''}" style="--sw-color:${theme==='dark'?a.dark:a.light}" aria-label="${a.id}" onclick="setAccent('${a.id}')"></button>`).join('');
  const w = document.getElementById('welcome-accent'); if (w) w.innerHTML = html;
  const s = document.getElementById('settings-accent'); if (s) s.innerHTML = html;
}
function toggleInstructionsIcons(on) {
  showInstructionsIcons = !!on;
  localStorage.setItem(KEYS.showInstr, showInstructionsIcons ? '1' : '0');
  document.getElementById('instr-icons-toggle')?.classList.toggle('on', showInstructionsIcons);
  renderDayContent();
}
function syncWelcomeTheme(t) {
  document.querySelectorAll('#welcome-theme .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
}

/* ─── ID MIGRATION ─── */
// Stamps exId onto any schedule/history entries that don't have one yet, using
// the current Library V2 as the source of truth (matched by name). This only
// backfills legacy entries created before live-linking existed; entries that
// already have an exId are left untouched.
function migrateIds() {
  const nameToId = {};
  const fuzzyToId = {}; // normalized (lowercase, trimmed, trailing-s stripped) -> id
  function normalize(n) {
    return (n || '').trim().toLowerCase().replace(/s$/, '');
  }
  DEFAULT_LIBRARY_V2.forEach(ex => {
    nameToId[ex.name] = ex.id;
    fuzzyToId[normalize(ex.name)] = ex.id;
  });
  const validIds = new Set(DEFAULT_LIBRARY_V2.map(ex => ex.id));
  // Fixes an exId in place if it's missing, or if it's set but doesn't match any
  // current Library V2 entry (a leftover from the old, pre-fix id system) while
  // the name still matches something in the library — safe to repair since the
  // name is the more reliable signal in that case. Never touches the name itself,
  // except when only a fuzzy (case/plural-insensitive) match is found, in which
  // case the name is also corrected to the library's exact current spelling so
  // future exact matches work without relying on the fuzzy fallback again.
  function fixExId(entry) {
    if (entry.exId && validIds.has(entry.exId)) return false;
    if (nameToId[entry.name]) { entry.exId = nameToId[entry.name]; return true; }
    const fuzzyId = fuzzyToId[normalize(entry.name)];
    if (fuzzyId) {
      entry.exId = fuzzyId;
      const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === fuzzyId);
      if (libEx) entry.name = libEx.name;
      return true;
    }
    return false;
  }
  let schedChanged = false;
  DAY_NAMES.forEach(d => {
    schedule[d].exercises.forEach(ex => { if (fixExId(ex)) schedChanged = true; });
  });
  if (schedChanged) saveSchedule();
  const hist = getHistory();
  let histChanged = false;
  Object.values(hist).forEach(entries => entries.forEach(e => { if (fixExId(e)) histChanged = true; }));
  if (histChanged) saveHistory(hist);
}

/* ─── APP TITLE ─── */
function updateAppTitle() {
  const name = localStorage.getItem(KEYS.name) || '';
  document.getElementById('sidebar-title').textContent = name ? name + "'s Tally" : 'Tally Up';
}
function applySettingsName(val) { localStorage.setItem(KEYS.name, val); updateAppTitle(); }

/* ─── SETTINGS SHEET ─── */
function openSettings(isFirstLaunch) {
  if (isFirstLaunch) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const base = document.documentElement.getAttribute('data-base') || THEME_BASE_DEFAULT[theme];
    syncWelcomeTheme(theme);
    syncThemeBaseLabel(base);
    renderAccentSwatches();
    document.getElementById('welcome-wrap')?.classList.add('show');
    setTimeout(() => document.getElementById('welcome-name')?.focus(), 300);
    return;
  }
  const modal = document.getElementById('settings-modal');
  if (!modal) { console.error('openSettings: #settings-modal not found in DOM'); return; }
  modal.classList.add('show');
  // Belt-and-suspenders: force the overlay's geometry inline so it can never
  // render collapsed even if a browser mishandles the CSS `inset` shorthand.
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.left = '0';
  const nameEl = document.getElementById('settings-name');
  if (nameEl) nameEl.value = localStorage.getItem(KEYS.name) || '';
  const bw = getCleanBw();
  const bwEl = document.getElementById('settings-bw');
  if (bwEl) bwEl.value = bw != null ? bw : '';
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const base = document.documentElement.getAttribute('data-base') || THEME_BASE_DEFAULT[theme];
  document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === theme));
  syncThemeBaseLabel(base);
  renderAccentSwatches();
  document.getElementById('instr-icons-toggle')?.classList.toggle('on', showInstructionsIcons);
}
function closeSettings() { document.getElementById('settings-modal')?.classList.remove('show'); }

function finishWelcome() {
  const nameInput = document.getElementById('welcome-name');
  const name = nameInput.value.trim();
  if (!name) { document.getElementById('welcome-error').style.display = 'block'; nameInput.focus(); return; }
  localStorage.setItem(KEYS.name, name);
  localStorage.setItem(KEYS.welcomed, '1');
  updateAppTitle();
  document.getElementById('welcome-wrap').classList.remove('show');
  setTimeout(maybeShowGreeting, 200);
}

/* ─── EXPORT FOR AI ─── */
/* ─── SHARE ─── */
const APP_URL = 'https://henryehammers-dotcom.github.io/workout-log/';
function shareApp() {
  if (navigator.share) {
    navigator.share({ title: 'Tally Up', text: 'Check out Tally Up — a workout tracker', url: APP_URL })
      .catch(err => { if (err.name !== 'AbortError') copyAppLink(); });
    return;
  }
  copyAppLink();
}
function copyAppLink() {
  const btn = document.querySelector('[onclick="shareApp()"] .data-card-title');
  const flash = (text, color) => { if (btn) { const orig = btn.textContent; btn.textContent = text; btn.style.color = color; setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(APP_URL).then(() => flash('✓ Link copied!', 'var(--green)')).catch(() => promptFallback());
  } else {
    promptFallback();
  }
  function promptFallback() {
    window.prompt('Copy this link:', APP_URL);
  }
}

function exportForAI() {
  const name = localStorage.getItem(KEYS.name) || 'User';
  const hist = getHistory();
  const lines = [`${name}'s workout data\n`, '=== WEEKLY SCHEDULE ==='];
  DAY_NAMES.forEach(d => {
    const day = schedule[d];
    if (day.restDay) { lines.push(`${FULL_DAYS[d]}: Rest day`); return; }
    const exList = day.exercises.map(e => {
      const parts = [e.name];
      if (e.sets) parts.push(`${e.sets} sets`);
      if (e.duration) parts.push(e.duration);
      if (e.reps) parts.push(`${e.reps} reps`);
      if (e.rest) parts.push(`${e.rest} rest`);
      if (e.note) parts.push(`[${e.note}]`);
      return parts.join(', ');
    });
    lines.push(`${FULL_DAYS[d]}: ${exList.length ? exList.join(' | ') : 'No exercises'}`);
  });
  lines.push('\n=== WORKOUT HISTORY ===');
  const dates = Object.keys(hist).sort();
  if (!dates.length) { lines.push('No history recorded yet.'); }
  else {
    dates.forEach(date => {
      lines.push(`\n${date}`);
      hist[date].forEach(entry => {
        const sets = entry.sets.map((s, i) => `Set ${i+1}: ${s.reps} reps @ ${s.weight} ${currentUnits}`).join(', ');
        lines.push(`  ${entry.name}: ${sets}`);
      });
    });
  }
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = document.querySelector('[onclick="exportForAI()"] .data-card-title');
    if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; btn.style.color = 'var(--green)'; setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000); }
  }).catch(() => alert('Copy failed — try again.'));
}

/* ─── SAVE FILE ─── */
function saveFile() {
  const backup = {
    tallyup_backup: true,
    version: APP_VERSION || 'unknown',
    savedAt: new Date().toISOString(),
    data: {
      history:  localStorage.getItem(KEYS.history)  || '{}',
      schedule: localStorage.getItem(KEYS.schedule) || '',
      libraryV2: localStorage.getItem(KEYS.libraryV2) || '',
      blurbsV2:  localStorage.getItem(KEYS.blurbsV2)  || '',
      name:     localStorage.getItem(KEYS.name)     || '',
      bw:       localStorage.getItem(KEYS.bw)       || '',
      units:    localStorage.getItem(KEYS.units)    || 'lbs',
      theme:    localStorage.getItem(KEYS.theme)    || 'light',
      base:     localStorage.getItem(KEYS.base)     || 'beige',
      accent:   localStorage.getItem(KEYS.accent)   || 'teal',
      welcomed: localStorage.getItem(KEYS.welcomed) || '',
      music:    localStorage.getItem(KEYS.music)    || '',
      greetOrder: localStorage.getItem(KEYS.greetOrder) || '',
    },
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  a.download = 'tallyup-backup-' + stamp + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function openRestoreSheet() {
  document.getElementById('restore-textarea').value = '';
  document.getElementById('restore-wrap').classList.add('show');
  setTimeout(function(){ document.getElementById('restore-textarea').focus(); }, 100);
}
function closeRestoreSheet() {
  document.getElementById('restore-wrap').classList.remove('show');
}
let _restorePendingParsed = null; // holds the parsed backup between the confirm modal and the orphan-choice step

function applyRestore() {
  const txt = document.getElementById('restore-textarea').value.trim();
  if (!txt) { alert('Paste your backup file contents first.'); return; }
  let parsed;
  try { parsed = JSON.parse(txt); }
  catch (e) { alert('That doesn\u2019t look like a valid backup file (couldn\u2019t parse JSON).'); return; }
  if (!parsed || !(parsed.tallyup_backup || parsed.tallymark_backup) || !parsed.data) {
    alert('That doesn\u2019t look like a Tally Up backup file.'); return;
  }
  showModal('Replace all data?', 'This will overwrite your current routine, history, and settings with the backup. This cannot be undone.', function() {
    closeModal();
    _restorePendingParsed = parsed;
    const orphans = findRestoreOrphans(parsed.data);
    if (orphans.length) {
      showRestoreOrphanWarning(orphans);
    } else {
      finishRestore(parsed.data, 'add'); // nothing orphaned — "add" vs "ignore" makes no difference here
    }
  });
}

// Scans a backup's schedule + history for exId references that don't match
// anything in the CURRENT library, and returns the distinct set of them with
// their original name and a rough count of how many places they appear.
function findRestoreOrphans(d) {
  const seen = {}; // exId -> { name, count }
  function scan(list) {
    list.forEach(entry => {
      if (entry.exId && !DEFAULT_LIBRARY_V2.some(e => e.id === entry.exId)) {
        if (!seen[entry.exId]) seen[entry.exId] = { name: entry.name || '(unnamed)', count: 0 };
        seen[entry.exId].count++;
      }
    });
  }
  try {
    const sched = d.schedule ? JSON.parse(d.schedule) : null;
    if (sched) DAY_NAMES.forEach(dn => scan(sched[dn]?.exercises || []));
  } catch (e) {}
  try {
    const hist = d.history ? JSON.parse(d.history) : null;
    if (hist) Object.values(hist).forEach(entries => scan(entries));
  } catch (e) {}
  return Object.entries(seen).map(([exId, info]) => ({ exId, ...info }));
}

function showRestoreOrphanWarning(orphans) {
  document.getElementById('restore-orphan-count').textContent =
    orphans.length + ' exercise' + (orphans.length === 1 ? '' : 's') + ' not in the library';
  document.getElementById('restore-orphan-list').innerHTML = orphans.map(o =>
    `<div class="restore-orphan-item">${escHtml(o.name)} <span class="restore-orphan-item-count">— ${o.count} entr${o.count === 1 ? 'y' : 'ies'}</span></div>`
  ).join('');
  closeRestoreSheet();
  document.getElementById('restore-orphan-wrap').classList.add('show');
}
function restoreOrphanChoice(choice) {
  document.getElementById('restore-orphan-wrap').classList.remove('show');
  if (!_restorePendingParsed) return;
  finishRestore(_restorePendingParsed.data, choice);
  _restorePendingParsed = null;
}

// choice: 'add' keeps orphaned entries in history/schedule with their original
// name but no library link. 'ignore' drops those entries entirely.
function finishRestore(d, choice) {
  function set(key, val) {
    if (val === undefined || val === null || val === '') {
      try { localStorage.removeItem(key); } catch (e) {}
    } else {
      try { localStorage.setItem(key, val); } catch (e) {}
    }
  }
  // The exercise library (KEYS.libraryV2) is intentionally NOT restored from
  // backups. It's app-shipped reference data (242 structured exercises) that
  // gets updated independently of the user's personal data — restoring an
  // old backup's library here would silently roll back the exercise catalog
  // to whatever existed when that backup was made, including for everyone
  // else's devices restoring the same file.
  //
  // Every restored entry's stored `name` is re-synced to whatever the CURRENT
  // library calls that same exId, since names can drift over time. Entries
  // whose exId has no match in the current library are either dropped
  // ('ignore') or kept as-is with their original name ('add') per the user's
  // choice from the orphan warning.
  try {
    const restoredSchedule = d.schedule ? JSON.parse(d.schedule) : null;
    if (restoredSchedule) {
      DAY_NAMES.forEach(dn => {
        if (!restoredSchedule[dn]) return;
        let exercises = restoredSchedule[dn].exercises || [];
        exercises.forEach(se => {
          if (se.exId) {
            const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === se.exId);
            if (libEx) se.name = libEx.name;
          }
        });
        if (choice === 'ignore') {
          exercises = exercises.filter(se => !se.exId || DEFAULT_LIBRARY_V2.some(e => e.id === se.exId));
        }
        restoredSchedule[dn].exercises = exercises;
      });
      set(KEYS.schedule, JSON.stringify(restoredSchedule));
    }
    const restoredHistory = d.history ? JSON.parse(d.history) : null;
    if (restoredHistory) {
      Object.keys(restoredHistory).forEach(dateKey => {
        let entries = restoredHistory[dateKey];
        entries.forEach(he => {
          if (he.exId) {
            const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === he.exId);
            if (libEx) he.name = libEx.name;
          }
        });
        if (choice === 'ignore') {
          entries = entries.filter(he => !he.exId || DEFAULT_LIBRARY_V2.some(e => e.id === he.exId));
        }
        if (entries.length) restoredHistory[dateKey] = entries;
        else delete restoredHistory[dateKey];
      });
      set(KEYS.history, JSON.stringify(restoredHistory));
    }
  } catch (e) {
    console.error('Restore name re-sync failed, restored data kept with original names:', e);
  }
  set(KEYS.name,     d.name);
  set(KEYS.bw,       d.bw);
  set(KEYS.units,    d.units);
  set(KEYS.theme,    d.theme);
  set(KEYS.base,     d.base);
  set(KEYS.accent,   d.accent);
  set(KEYS.welcomed, d.welcomed);
  set(KEYS.music,    d.music);
  set(KEYS.greetOrder, d.greetOrder);
  closeRestoreSheet();
  location.reload();
}

/* ─── INIT ─── */
(function init() {
  let savedTheme = localStorage.getItem(KEYS.theme) || 'light';
  let savedBase = localStorage.getItem(KEYS.base) || THEME_BASE_DEFAULT[savedTheme] || 'beige';
  let savedAccent = localStorage.getItem(KEYS.accent) || 'teal';
  // Migrate anyone still on the retired matrix/mdnt themes to light/dark + base + accent.
  if (LEGACY_THEME_MIGRATION[savedTheme]) {
    const m = LEGACY_THEME_MIGRATION[savedTheme];
    savedTheme = m.theme;
    savedBase = m.base;
    savedAccent = m.accent;
    localStorage.setItem(KEYS.theme, savedTheme);
    localStorage.setItem(KEYS.base, savedBase);
    localStorage.setItem(KEYS.accent, savedAccent);
  }
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-base', savedBase);
  document.documentElement.setAttribute('data-accent', savedAccent);
  syncThemeColorMeta(savedTheme, savedBase);
  loadSchedule();
  loadLibraryV2();

  document.addEventListener('DOMContentLoaded', () => {
    try {
      migrateIds();
      currentUnits = localStorage.getItem(KEYS.units) || 'lbs';
      showInstructionsIcons = localStorage.getItem(KEYS.showInstr) === '1';

      // Sync visible toggles
      document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
      document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === savedTheme));
      syncThemeBaseLabel(savedBase);

      updateAppTitle();
      updateBwDisplay();
      renderDayContent();

      // Hamburger button sits in normal flow at the top of the page (so it
      // never overlaps the Day view's date/title), and only becomes a
      // floating fixed button once the page has been scrolled down.
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      if (hamburgerBtn) {
        const updateHamburgerFloat = () => {
          hamburgerBtn.classList.toggle('floating', window.scrollY > 8);
        };
        window.addEventListener('scroll', updateHamburgerFloat, { passive: true });
        updateHamburgerFloat();
      }

      // Dismiss day dropdown / day menu when clicking/tapping outside them
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.day-header') && !e.target.closest('.cal-day-actions-row')) { closeDayPicker(); closeDayMenu(); }
      });

      const vEl = document.getElementById('settings-version');
      if (vEl) vEl.textContent = APP_VERSION || '…';
      loadAppVersion();

      if (!localStorage.getItem(KEYS.welcomed)) openSettings(true);
      else if (typeof maybeShowGreeting === 'function') maybeShowGreeting();
    } catch (err) {
      console.error('Tally Up init error:', err);
    }
  });
})();

/* ─── SESSION DATA ─── */
// Keyed by (viewed date + exercise index) rather than just day-of-week, so that
// e.g. logging Wednesday's leg day on one Wednesday doesn't leave every other
// Wednesday viewed later in the same session stuck showing "already logged".
// Falls back to plain day-of-week if calendar.js hasn't loaded (shouldn't happen).
function sk(d, i) {
  const dateTag = (typeof viewedDate !== 'undefined' && typeof formatISODate === 'function') ? formatISODate(viewedDate) : '';
  return d + '_' + i + (dateTag ? '_' + dateTag : '');
}
function getSetData(d, i) {
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
function resolveScheduledExercise(ex) {
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
function flushInputs() {
  document.querySelectorAll('[data-reps],[data-weight]').forEach(el => {
    const d = el.dataset.day, i = parseInt(el.dataset.ex), si = parseInt(el.dataset.si);
    const field = 'reps' in el.dataset ? 'reps' : 'weight';
    const data = getSetData(d, i);
    if (data.sets[si]) data.sets[si][field] = el.value;
  });
}

/* ─── SIDEBAR ─── */
function openSidebar() {
  document.getElementById('sidebar').classList.add('show');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeSidebar() {
  try {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('sidebar-overlay').classList.remove('show');
  } catch (err) {
    console.error('closeSidebar failed:', err);
  }
}

/* ─── TAB SWITCHING ─── */
/* ─── LIBRARY — landing (muscle groups) → category (exercise cards) → detail popup ─── */
let libActiveGroupKey = null; // group shown in category view, or highlighted on landing after a visit
let libActiveFilterSub = null; // sub-group filter chip selected within a category
let libSearchQuery = '';
let _libPickingDay = null; // set when Library is opened from a specific day's "+ Add exercise" button
let _libDetailExId = null; // exercise currently shown in the detail popup, for Similar/Add-to-day/edit

function renderLibV2() {
  renderLibGroupsGrid();
}
function renderLibGroupsGrid() {
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
      return `<button class="lib-group-tile${active}" onclick="openLibCategory('${g.key}')">
        <div class="lib-group-tile-dot"></div>
        <div class="lib-group-tile-name">${escHtml(g.label)}</div>
        <div class="lib-group-tile-count">${count} exercises</div>
      </button>`;
    }).join('');
    return `<div class="lib-section-label">${escHtml(sec.label)}</div><div class="lib-group-grid">${tiles}</div>`;
  }).join('');
}

/* ─── CATEGORY VIEW ─── */
function openLibCategory(groupKey) {
  libActiveGroupKey = groupKey;
  libActiveFilterSub = null;
  document.getElementById('lib-landing').style.display = 'none';
  document.getElementById('lib-category').style.display = '';
  renderLibCategory();
}
function closeLibCategory() {
  document.getElementById('lib-category').style.display = 'none';
  document.getElementById('lib-landing').style.display = '';
  renderLibGroupsGrid();
}
function libSelectFilterSub(sub) {
  libActiveFilterSub = (libActiveFilterSub === sub) ? null : sub;
  renderLibCategory();
}
function renderLibCategory() {
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
function openLibSearch() {
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
function closeLibSearch() {
  document.querySelector('#lib-landing .lib-header-row').classList.remove('searching');
  document.getElementById('lib-search-btn').style.display = '';
  document.getElementById('lib-search-pill').classList.remove('show');
  document.getElementById('lib-groups-wrap').style.display = '';
  document.getElementById('lib-search-results').style.display = 'none';
  libSearchQuery = '';
  renderLibGroupsGrid();
}
function libSearchInput(query) {
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
function findLibExById(id) { return DEFAULT_LIBRARY_V2.find(e => e.id === id); }
function findLibExByIdOrName(idOrName) {
  return DEFAULT_LIBRARY_V2.find(e => e.id === idOrName) || DEFAULT_LIBRARY_V2.find(e => e.name === idOrName);
}
function openExerciseDetail(idOrName) {
  const ex = findLibExByIdOrName(idOrName);
  if (!ex) return;
  _libDetailExId = ex.id;
  document.getElementById('ex-detail-title').textContent = ex.name;
  const diff = (ex.difficulty || 'beginner');
  const badgesEl = document.getElementById('ex-detail-badges');
  badgesEl.innerHTML = `<span class="ex-detail-badge lib-diff-${escAttr(diff)}">${escHtml(diff.replace(/^./, c => c.toUpperCase()))}</span>` +
    (ex.exerciseType ? `<span class="ex-detail-badge ex-detail-badge-neutral">${escHtml(ex.exerciseType.replace(/^./, c => c.toUpperCase()))}</span>` : '');
  document.getElementById('ex-detail-blurb').textContent = ex.blurb || ex.card || 'No description yet.';

  const primary = (ex.muscles && ex.muscles.primary) || [];
  const secondary = (ex.muscles && ex.muscles.secondary) || [];
  const worksText = primary.length
    ? primary.join(', ') + (secondary.length ? ` <span style="color:var(--text3)">+${secondary.length} more</span>` : '')
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
  if (typeof _customLogPicking !== 'undefined' && _customLogPicking) {
    addBtn.textContent = 'Add to custom log';
    addBtn.onclick = () => {
      _customLogPicking = false;
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
function closeExerciseDetail() {
  document.getElementById('ex-detail-wrap').classList.remove('show');
}

function openExerciseInstructions(name) {
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === name);
  const blurb = ex && ex.blurb;
  if (!blurb) return;
  document.getElementById('ex-instr-title').textContent = name;
  document.getElementById('ex-instr-body').textContent = blurb;
  document.getElementById('ex-instr-wrap').classList.add('show');
}
function closeExerciseInstructions() {
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
function openLibSimilar(exId) {
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
function closeLibSimilar() {
  document.getElementById('lib-similar-wrap').classList.remove('show');
}
function libSelectSimilarCat(cat) {
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
        <div class="lib-similar-result" onclick="openExerciseDetail('${r.id}')">
          <div class="lib-similar-result-name">${escHtml(r.name)}</div>
          <div class="lib-similar-result-desc">${escHtml(r.card || '')}</div>
        </div>`).join('')
      : `<div class="empty">Nothing else matches yet.</div>`);
}

/* ─── ADD TO DAY (calendar + repeat) ─── */
let libAddDayExId = null;
let libAddDaySelectedDates = [];
let libAddDayRepeat = 'never';
let libAddDayCalMonth = null;

function openLibAddDay(exId) {
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
function closeLibAddDay() {
  document.getElementById('lib-add-day-wrap').classList.remove('show');
  _libPickingDay = null;
}
function libAddDayCalNav(dir) {
  libAddDayCalMonth = new Date(libAddDayCalMonth.getFullYear(), libAddDayCalMonth.getMonth() + dir, 1);
  renderLibAddDayCal();
}
function libToggleCalDate(iso) {
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
function libSelectRepeat(val) {
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
function confirmLibAddDay() {
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
function libFormSyncSubs() {
  const groupKey = document.getElementById('lf-group').value;
  const groupObj = MUSCLE_GROUPS_V2.find(g => g.key === groupKey);
  const subSel = document.getElementById('lf-sub');
  const subs = groupObj ? groupObj.subs : [];
  subSel.innerHTML = subs.map(s => `<option value="${escAttr(s)}">${escHtml(s)}</option>`).join('');
}
function libFormRenderTags(containerId, items, removeFn) {
  document.getElementById(containerId).innerHTML = items.map((item, i) =>
    `<span class="lib-tag-pill">${escHtml(item)}<button onclick="${removeFn}(${i})" aria-label="Remove">✕</button></span>`
  ).join('');
}
function libFormRemoveSecondary(i) { _libFormSecondary.splice(i, 1); libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary'); }
function libFormRemoveEquipment(i) { _libFormEquipment.splice(i, 1); libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment'); }
function libFormWireTagInputs() {
  const secInput = document.getElementById('lf-secondary-input');
  secInput.onkeydown = (e) => {
    if (e.key === 'Enter' && secInput.value.trim()) {
      e.preventDefault();
      _libFormSecondary.push(secInput.value.trim());
      secInput.value = '';
      libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary');
    }
  };
  const eqInput = document.getElementById('lf-equipment-input');
  eqInput.onkeydown = (e) => {
    if (e.key === 'Enter' && eqInput.value.trim()) {
      e.preventDefault();
      _libFormEquipment.push(eqInput.value.trim());
      eqInput.value = '';
      libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment');
    }
  };
}
function openLibExerciseForm(exId) {
  libFormWireTagInputs();
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
    _libFormSecondary = (ex.muscles && ex.muscles.secondary) ? [...ex.muscles.secondary] : [];
    _libFormEquipment = ex.equipment ? [...ex.equipment] : [];
    document.getElementById('lf-movement').value = ex.movementPattern || '';
    document.getElementById('lf-type').value = ex.exerciseType || 'compound';
    document.getElementById('lf-difficulty').value = ex.difficulty || 'beginner';
    document.getElementById('lf-laterality').value = ex.laterality || 'bilateral';
    document.getElementById('lf-position').value = ex.position || 'standing';
    document.getElementById('lf-sets').value = ex.sets != null ? ex.sets : '';
    document.getElementById('lf-reps').value = ex.reps || '';
    document.getElementById('lf-rest').value = ex.rest || '';
    document.getElementById('lf-card').value = ex.card || '';
    document.getElementById('lf-blurb').value = ex.blurb || '';
    document.getElementById('lib-form-btn-row').style.display = '';
  } else {
    _libFormEditingId = null;
    document.getElementById('lib-form-title').textContent = 'New exercise';
    ['lf-name','lf-primary','lf-movement','lf-sets','lf-reps','lf-rest','lf-card','lf-blurb'].forEach(id => document.getElementById(id).value = '');
    _libFormSecondary = [];
    _libFormEquipment = [];
    libFormPopulateGroupSelect(MUSCLE_GROUPS_V2[0].key);
    libFormSyncSubs();
    document.getElementById('lf-type').value = 'compound';
    document.getElementById('lf-difficulty').value = 'beginner';
    document.getElementById('lf-laterality').value = 'bilateral';
    document.getElementById('lf-position').value = 'standing';
    document.getElementById('lib-form-btn-row').style.display = 'none';
  }
  libFormRenderTags('lf-secondary-tags', _libFormSecondary, 'libFormRemoveSecondary');
  libFormRenderTags('lf-equipment-tags', _libFormEquipment, 'libFormRemoveEquipment');
  document.getElementById('lib-form-wrap').classList.add('show');
}
function closeLibExerciseForm() {
  document.getElementById('lib-form-wrap').classList.remove('show');
}
function saveLibExerciseForm() {
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
  const restRaw = document.getElementById('lf-rest').value.trim() || '60 sec';
  const restSecsMatchMin = restRaw.match(/(\d+)\s*min/);
  const restSecsMatchSec = restRaw.match(/(\d+)\s*sec/);
  const restSecs = restSecsMatchMin ? parseInt(restSecsMatchMin[1]) * 60 : (restSecsMatchSec ? parseInt(restSecsMatchSec[1]) : 60);
  const card = document.getElementById('lf-card').value.trim();
  const blurb = document.getElementById('lf-blurb').value.trim();
  const type = _libFormEquipment.includes('Dumbbell') ? 'dumbbell'
    : _libFormEquipment.includes('Bodyweight') ? 'bodyweight'
    : 'gym';

  const muscles = { primary, secondary: [..._libFormSecondary], stabilizers: [] };

  if (_libFormEditingId) {
    const ex = findLibExById(_libFormEditingId);
    if (ex) {
      const oldName = ex.name;
      Object.assign(ex, { name, group, sub, muscles, equipment: [..._libFormEquipment], movementPattern, exerciseType, laterality, position, difficulty, card, blurb, reps, rest: restRaw, restSecs, type });
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
    const newEx = { id: genLibV2Id(), name, group, sub, muscles, equipment: [..._libFormEquipment], movementPattern, exerciseType, laterality, position, difficulty, card, blurb, reps, rest: restRaw, restSecs, type };
    if (sets !== undefined) newEx.sets = sets;
    DEFAULT_LIBRARY_V2.push(newEx);
  }
  saveLibraryV2();
  closeLibExerciseForm();
  if (libActiveGroupKey) renderLibCategory();
  renderLibGroupsGrid();
}
function deleteLibExercise() {
  if (!_libFormEditingId) return;
  const ex = findLibExById(_libFormEditingId);
  if (!ex) return;

  const daysUsingIt = DAY_NAMES.filter(d =>
    schedule[d].exercises.some(e => ex.id && e.exId === ex.id)
  ).map(d => FULL_DAYS[d]);

  const doDelete = () => {
    const idx = DEFAULT_LIBRARY_V2.findIndex(e => e.id === ex.id);
    if (idx !== -1) DEFAULT_LIBRARY_V2.splice(idx, 1);
    DAY_NAMES.forEach(d => {
      schedule[d].exercises = schedule[d].exercises.filter(e => !(ex.id && e.exId === ex.id));
    });
    saveLibraryV2();
    saveSchedule();
    closeLibExerciseForm();
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

function openLibV2ForDay(day) {
  _libPickingDay = day;
  switchTab('library');
}


function switchTab(tab) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-' + tab).classList.add('active');
  if (tab !== 'library') {
    _libPickingDay = null;
    if (document.getElementById('lib-search-pill')?.classList.contains('show')) closeLibSearch();
    libActiveGroupKey = null;
    libActiveFilterSub = null;
    libSearchQuery = '';
    document.getElementById('lib-landing').style.display = '';
    document.getElementById('lib-category').style.display = 'none';
  }
  if (tab !== 'history') {
    if (document.getElementById('hist-search-pill')?.classList.contains('show')) closeHistSearch();
  }
  // Leaving to a tab that isn't Library or Log (where the Custom Log sheet lives)
  // means the user abandoned the picker — don't leave "Add to Custom Log" stuck
  // as the exercise-detail button label for a future normal "Add to Day" visit.
  if (tab !== 'library' && tab !== 'log' && typeof _customLogPicking !== 'undefined') {
    _customLogPicking = false;
  }
  ['log','history','library','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none'; });
  if (tab === 'history') renderHistory();
  else if (tab === 'library') {
    renderLibV2();
    document.getElementById('log-back-btn')?.classList.remove('show');
    requestAnimationFrame(() => renderLibV2()); // safety re-render once tab is actually visible
  }
  else if (tab === 'clock') { ensureClockBuilt(); document.getElementById('log-back-btn')?.classList.remove('show'); }
  else { destroyCharts(); renderDayContent(); document.getElementById('log-back-btn')?.classList.remove('show'); requestAnimationFrame(() => renderDayContent()); }
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
  closeSidebar();
}
function openExerciseHistory(key) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-history').classList.add('active');
  ['log','history','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === 'history' ? '' : 'none'; });
  renderHistory(key);
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
}

/* ─── DAY PICKER / CONTENT ─── */
function closeDayPicker() {
  const dd = document.getElementById('day-dropdown');
  const picker = document.getElementById('day-picker-btn');
  if (dd) dd.classList.remove('show');
  if (picker) picker.classList.remove('open');
}

function toggleDayMenu() {
  const dd = document.getElementById('day-menu-dropdown');
  if (!dd) return;
  closeDayPicker();
  dd.classList.toggle('show');
}
function closeDayMenu() {
  const dd = document.getElementById('day-menu-dropdown');
  if (dd) dd.classList.remove('show');
}
function toggleDayEditMode() {
  flushInputs();
  dayEditMode = !dayEditMode;
  renderDayContent();
}

function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Legacy entry point — kept because lots of code (rest-day toggle, copy-day,
// clear-session, timers, unit/theme switches, etc.) calls this to refresh the
// Log tab. It now just keeps currentDay in sync with the calendar's viewed
// date and delegates actual rendering to the calendar system (calendar.js).
function renderDayContent() {
  currentDay = DAY_NAMES[viewedDate.getDay()];
  renderCalendarRoot();
}

/* ─── DRAG ─── */
function initDrag(d) {
  const zone = document.getElementById('drag-zone');
  if (!zone) return;
  let srcIdx = null, dragEl = null, clone = null, targetIdx = null, offsetY = 0;
  function getCards() { return Array.from(zone.querySelectorAll('.exercise-card')); }
  function startDrag(card, clientY) {
    flushInputs();
    srcIdx = parseInt(card.dataset.idx); targetIdx = srcIdx; dragEl = card;
    const rect = card.getBoundingClientRect();
    offsetY = clientY - rect.top;
    clone = card.cloneNode(true);
    clone.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;z-index:1000;opacity:0.92;box-shadow:0 12px 32px rgba(0,0,0,0.25);pointer-events:none;border-radius:14px;background:var(--bg2);border:1px solid var(--accent)`;
    document.body.appendChild(clone);
    card.style.opacity = '0.25';
    updateHighlight();
  }
  function updateHighlight() { getCards().forEach((c, i) => { c.style.borderColor = (i === targetIdx && c !== dragEl) ? 'var(--accent)' : ''; }); }
  function moveDrag(clientY) {
    if (!dragEl || !clone) return;
    clone.style.top = (clientY - offsetY) + 'px';
    const cr = clone.getBoundingClientRect(), cloneCenter = cr.top + cr.height / 2;
    let best = srcIdx;
    getCards().forEach((c, i) => { if (c === dragEl) return; const r = c.getBoundingClientRect(); if (cloneCenter >= r.top && cloneCenter <= r.bottom) best = i; });
    targetIdx = best; updateHighlight();
  }
  function endDrag() {
    if (!dragEl || srcIdx === null) return;
    getCards().forEach(c => c.style.borderColor = '');
    if (clone) clone.remove(); clone = null;
    if (targetIdx !== null && targetIdx !== srcIdx) {
      const exs = schedule[d].exercises;
      const moved = exs.splice(srcIdx, 1)[0];
      exs.splice(targetIdx, 0, moved);
      sessionSets = {};
      saveSchedule();
      renderDayContent();
    }
    dragEl = null; srcIdx = null; targetIdx = null;
  }
  let touchMoveHandler = null;
  getCards().forEach(card => {
    const handle = card.querySelector('.ex-drag');
    if (!handle) return;
    handle.addEventListener('touchstart', e => {
      e.stopPropagation();
      startDrag(card, e.touches[0].clientY);
      if (touchMoveHandler) document.removeEventListener('touchmove', touchMoveHandler);
      touchMoveHandler = e2 => { if (!dragEl) return; e2.preventDefault(); moveDrag(e2.touches[0].clientY); };
      document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    }, { passive: true });
    const cleanupTouch = () => { endDrag(); if (touchMoveHandler) { document.removeEventListener('touchmove', touchMoveHandler); touchMoveHandler = null; } };
    handle.addEventListener('touchend', cleanupTouch);
    handle.addEventListener('touchcancel', cleanupTouch);
    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      startDrag(card, e.clientY);
      const onMove = ev => moveDrag(ev.clientY);
      const onUp = () => { endDrag(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

/* ─── ADD/REMOVE ─── */
function toggleRestDay() { flushInputs(); schedule[currentDay].restDay = !schedule[currentDay].restDay; saveSchedule(); renderDayContent(); }
function removeExercise(d, idx) {
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
    sessionSets = n; saveSchedule(); closeModal(); renderDayContent();
  });
}
function clearSet(d, i, si) {
  flushInputs();
  const data = getSetData(d, i);
  if (data.logged) return;
  if (data.sets[si]) { data.sets[si].reps = ''; data.sets[si].weight = ''; }
  renderDayContent();
}

/* ─── CONFIRM ACTIONS ─── */
function confirmCopyDay() {
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
    sessionSets = {}; saveSchedule(); closeModal(); renderDayContent();
  });
}
function confirmClearSession() {
  showModal('Clear session?', 'All logged sets for this day will be cleared from this view. Your saved history is kept.', () => {
    const dateTag = (typeof formatISODate === 'function') ? formatISODate(viewedDate) : '';
    const prefix = currentDay + '_';
    const suffix = dateTag ? '_' + dateTag : '';
    Object.keys(sessionSets).forEach(k => {
      if (k.startsWith(prefix) && (!suffix || k.endsWith(suffix))) delete sessionSets[k];
    });
    closeModal(); renderDayContent();
  });
}

/* ─── REST TIMER (per exercise, lives in the Log button) ─── */
// Timer key includes the date being logged against, so a rest timer started
// while viewing one date doesn't bleed into another date that happens to share
// the same day-of-week (e.g. two different Wednesdays navigated to in one session).
function timerKeyFor(d, idx, isoDate) {
  const tag = isoDate || ((typeof viewedDate !== 'undefined' && typeof formatISODate === 'function') ? formatISODate(viewedDate) : '');
  return d + '-' + idx + (tag ? '-' + tag : '');
}
function startTimer(secs, d, idx, isoDate) {
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
function finishTimer(d, idx, isoDate) {
  const key = timerKeyFor(d, idx, isoDate);
  delete exerciseTimers[key];
  // Clear input row and unlock so button reverts to "Log sets"
  const data = getSetData(d, idx);
  data.logged = false;
  data.sets = [{reps:'',weight:''}];
  renderDayContent();
}
function skipExerciseTimer(d, idx, isoDate) {
  const key = timerKeyFor(d, idx, isoDate);
  const t = exerciseTimers[key];
  if (t && t.intervalId) clearInterval(t.intervalId);
  finishTimer(d, idx, isoDate);
}

/* ─── MODAL ─── */
function showModal(title, body, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const oldBtn = document.getElementById('modal-ok');
  const newBtn = oldBtn.cloneNode(true);
  newBtn.addEventListener('click', onConfirm);
  oldBtn.replaceWith(newBtn);
  document.getElementById('modal-wrap').classList.add('show');
}
function closeModal() { document.getElementById('modal-wrap').classList.remove('show'); }
