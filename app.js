/* ════════════════════════════════════════════
   Tallymark — application logic
   ════════════════════════════════════════════ */

/* ─── CONSTANTS ─── */
const KEYS = {
  schedule:  'wl_schedule',
  history:   'wl_v3',
  bw:        'wl_bw',
  name:      'wl_name',
  libSeen:   'wl_lib_seen',
  theme:     'wl_theme',
  units:     'wl_units',
  welcomed:  'wl_welcomed',
  library:   'wl_library',
  hideWarn:  'wl_hide_warn',
  greetDate: 'wl_greet_date',
  greetOrder:'wl_greet_order',
  music:     'wl_music_enabled',
};
// APP_VERSION is read from the service worker's cache name at runtime,
// so the only place to update the version is service-worker.js.
let APP_VERSION = '';
function loadAppVersion() {
  if (!('caches' in self)) return;
  caches.keys().then(function(keys) {
    var tm = keys.find(function(k) { return k.indexOf('tallymark-') === 0; });
    if (tm) {
      APP_VERSION = tm.replace('tallymark-', '');
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
const DEFAULT_LIBRARY = [
  {group:'Chest',exercises:[
    {name:'Barbell bench press',  reps:'6-10',  rest:'2 min', restSecs:120,type:'gym'},
    {name:'Dumbbell bench press', reps:'8-12',  rest:'2 min', restSecs:120,type:'dumbbell'},
    {name:'Push-up',              reps:'10-20', rest:'60 sec',restSecs:60, type:'bodyweight'},
  ]},
  {group:'Back',exercises:[
    {name:'Barbell bent-over row', reps:'6-10',  rest:'2 min', restSecs:120,type:'gym'},
    {name:'Dumbbell bent-over row',reps:'8-12',  rest:'90 sec',restSecs:90, type:'dumbbell'},
    {name:'Pull-up',               reps:'5-10',  rest:'2 min', restSecs:120,type:'bodyweight'},
  ]},
  {group:'Shoulders',exercises:[
    {name:'Barbell overhead press',reps:'6-10',  rest:'2 min', restSecs:120,type:'gym'},
    {name:'Dumbbell lateral raise',reps:'12-15', rest:'60 sec',restSecs:60, type:'dumbbell'},
    {name:'Pike push-up',          reps:'8-15',  rest:'60 sec',restSecs:60, type:'bodyweight'},
  ]},
  {group:'Biceps',exercises:[
    {name:'Barbell curl',          reps:'8-12',  rest:'60 sec',restSecs:60, type:'gym'},
    {name:'Dumbbell bicep curl',   reps:'10-12', rest:'60 sec',restSecs:60, type:'dumbbell'},
    {name:'Chin-up',               reps:'5-10',  rest:'2 min', restSecs:120,type:'bodyweight'},
  ]},
  {group:'Triceps',exercises:[
    {name:'Cable tricep pushdown',    reps:'10-15',rest:'60 sec',restSecs:60,type:'gym'},
    {name:'Overhead tricep extension',reps:'10-12',rest:'60 sec',restSecs:60,type:'dumbbell'},
    {name:'Diamond push-up',          reps:'8-15', rest:'60 sec',restSecs:60,type:'bodyweight'},
  ]},
  {group:'Quads',exercises:[
    {name:'Barbell squat',         reps:'6-10',  rest:'2 min', restSecs:120,type:'gym'},
    {name:'Dumbbell goblet squat', reps:'10-15', rest:'90 sec',restSecs:90, type:'dumbbell'},
    {name:'Bodyweight squat',      reps:'15-25', rest:'60 sec',restSecs:60, type:'bodyweight'},
  ]},
  {group:'Hamstrings & glutes',exercises:[
    {name:'Barbell deadlift',      reps:'4-8',   rest:'2 min', restSecs:120,type:'gym'},
    {name:'Dumbbell RDL',          reps:'8-12',  rest:'90 sec',restSecs:90, type:'dumbbell'},
    {name:'Glute bridge',          reps:'15-20', rest:'60 sec',restSecs:60, type:'bodyweight'},
  ]},
  {group:'Calves',exercises:[
    {name:'Seated calf raise machine',reps:'12-20',rest:'60 sec',restSecs:60,type:'gym'},
    {name:'Dumbbell calf raise',      reps:'15-20',rest:'45 sec',restSecs:45,type:'dumbbell'},
    {name:'Bodyweight calf raise',    reps:'20-30',rest:'45 sec',restSecs:45,type:'bodyweight'},
  ]},
  {group:'Core',exercises:[
    {name:'Cable crunch',          reps:'12-15',    rest:'60 sec',restSecs:60,type:'gym'},
    {name:'Dumbbell side bend',    reps:'12-15',    rest:'45 sec',restSecs:45,type:'dumbbell'},
    {name:'Plank',                 reps:'30-60 sec',rest:'60 sec',restSecs:60,type:'bodyweight'},
  ]},
];

/* ─── STATE ─── */
let schedule = JSON.parse(JSON.stringify(DEFAULT_DAYS));
let library  = JSON.parse(JSON.stringify(DEFAULT_LIBRARY));
let currentDay = DAY_NAMES[new Date().getDay()];
let sessionSets = {};
let timerInterval = null, timerSeconds = 0;
// Per-exercise rest timers — keyed by `${day}-${idx}`. Each: { secsLeft, total, intervalId }
let exerciseTimers = {};
let activeCharts = [];
let currentUnits = 'lbs';

/* ─── STORAGE ─── */
function saveSchedule() { try { localStorage.setItem(KEYS.schedule, JSON.stringify(schedule)); } catch {} }
function loadSchedule() { try { const s = localStorage.getItem(KEYS.schedule); if (s) schedule = JSON.parse(s); } catch {} }
function saveLibrary()  { try { localStorage.setItem(KEYS.library,  JSON.stringify(library));  } catch {} }
function loadLibrary()  { try { const s = localStorage.getItem(KEYS.library);  if (s) library  = JSON.parse(s); } catch {} }
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
const THEME_COLORS = { light: '#f4efe6', dark: '#0f1817', matrix: '#020503' };
function syncThemeColorMeta(t) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[t] || THEME_COLORS.light);
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(KEYS.theme, t);
  document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
  syncThemeColorMeta(t);
}
function syncWelcomeTheme(t) {
  document.querySelectorAll('#welcome-theme .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
}

function setMusicEnabled(on) {
  localStorage.setItem(KEYS.music, on ? '1' : '0');
  document.querySelector('.music-float').classList.toggle('show', on);
  if (!on) {
    const a = document.getElementById('audio-player');
    if (a && !a.paused) { a.pause(); muted = true; document.getElementById('mute-btn').textContent = '▶'; }
  }
}

/* ─── ID MIGRATION ─── */
function migrateIds() {
  let changed = false;
  library.forEach(g => g.exercises.forEach(ex => { if (!ex.id) { ex.id = genId(); changed = true; } }));
  if (changed) saveLibrary();
  const nameToId = {};
  library.forEach(g => g.exercises.forEach(ex => { nameToId[ex.name] = ex.id; }));
  let schedChanged = false;
  DAY_NAMES.forEach(d => {
    schedule[d].exercises.forEach(ex => { if (!ex.exId && nameToId[ex.name]) { ex.exId = nameToId[ex.name]; schedChanged = true; } });
  });
  if (schedChanged) saveSchedule();
  const hist = getHistory();
  let histChanged = false;
  Object.values(hist).forEach(entries => entries.forEach(e => { if (!e.exId && nameToId[e.name]) { e.exId = nameToId[e.name]; histChanged = true; } }));
  if (histChanged) saveHistory(hist);
}

/* ─── APP TITLE ─── */
function updateAppTitle() {
  const name = localStorage.getItem(KEYS.name) || '';
  document.getElementById('sidebar-title').textContent = name ? name + "'s Workout Log" : 'Workout Log';
}
function applySettingsName(val) { localStorage.setItem(KEYS.name, val); updateAppTitle(); }

/* ─── SETTINGS SHEET ─── */
function openSettings(isFirstLaunch) {
  if (isFirstLaunch) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    syncWelcomeTheme(theme);
    document.getElementById('welcome-wrap').classList.add('show');
    setTimeout(() => document.getElementById('welcome-name').focus(), 300);
    return;
  }
  document.getElementById('settings-name').value = localStorage.getItem(KEYS.name) || '';
  const bw = getCleanBw();
  document.getElementById('settings-bw').value = bw != null ? bw : '';
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === theme));
  document.getElementById('music-switch').checked = localStorage.getItem(KEYS.music) === '1';
  document.getElementById('settings-modal').classList.add('show');
}
function closeSettings() { document.getElementById('settings-modal').classList.remove('show'); }

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
    navigator.share({ title: 'Tallymark', text: 'Check out Tallymark — a workout tracker', url: APP_URL })
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
    tallymark_backup: true,
    version: APP_VERSION || 'unknown',
    savedAt: new Date().toISOString(),
    data: {
      history:  localStorage.getItem(KEYS.history)  || '{}',
      schedule: localStorage.getItem(KEYS.schedule) || '',
      library:  localStorage.getItem(KEYS.library)  || '',
      name:     localStorage.getItem(KEYS.name)     || '',
      bw:       localStorage.getItem(KEYS.bw)       || '',
      units:    localStorage.getItem(KEYS.units)    || 'lbs',
      theme:    localStorage.getItem(KEYS.theme)    || 'light',
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
  a.download = 'tallymark-backup-' + stamp + '.json';
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
function applyRestore() {
  const txt = document.getElementById('restore-textarea').value.trim();
  if (!txt) { alert('Paste your backup file contents first.'); return; }
  let parsed;
  try { parsed = JSON.parse(txt); }
  catch (e) { alert('That doesn\u2019t look like a valid backup file (couldn\u2019t parse JSON).'); return; }
  if (!parsed || !parsed.tallymark_backup || !parsed.data) {
    alert('That doesn\u2019t look like a Tallymark backup file.'); return;
  }
  showModal('Replace all data?', 'This will overwrite your current routine, history, and settings with the backup. This cannot be undone.', function() {
    const d = parsed.data;
    function set(key, val) {
      if (val === undefined || val === null || val === '') {
        try { localStorage.removeItem(key); } catch (e) {}
      } else {
        try { localStorage.setItem(key, val); } catch (e) {}
      }
    }
    set(KEYS.history,  d.history);
    set(KEYS.schedule, d.schedule);
    set(KEYS.library,  d.library);
    set(KEYS.name,     d.name);
    set(KEYS.bw,       d.bw);
    set(KEYS.units,    d.units);
    set(KEYS.theme,    d.theme);
    set(KEYS.welcomed, d.welcomed);
    set(KEYS.music,    d.music);
    set(KEYS.greetOrder, d.greetOrder);
    closeModal();
    closeRestoreSheet();
    location.reload();
  });
}

/* ─── INIT ─── */
(function init() {
  const savedTheme = localStorage.getItem(KEYS.theme) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  syncThemeColorMeta(savedTheme);
  loadSchedule();
  loadLibrary();

  document.addEventListener('DOMContentLoaded', () => {
    try {
      migrateIds();
      currentUnits = localStorage.getItem(KEYS.units) || 'lbs';

      // Sync visible toggles
      document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
      document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === savedTheme));

      updateAppTitle();
      updateBwDisplay();
      renderDayContent();

      // Dismiss day dropdown when clicking/tapping outside it
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.day-header')) closeDayPicker();
      });

      const vEl = document.getElementById('settings-version');
      if (vEl) vEl.textContent = APP_VERSION || '…';
      loadAppVersion();

      // Music opt-in
      if (localStorage.getItem(KEYS.music) === '1') document.querySelector('.music-float')?.classList.add('show');

      if (!localStorage.getItem(KEYS.welcomed)) openSettings(true);
      else if (typeof maybeShowGreeting === 'function') maybeShowGreeting();
    } catch (err) {
      console.error('Tallymark init error:', err);
    }
  });
})();

/* ─── SESSION DATA ─── */
function sk(d, i) { return d + '_' + i; }
function getSetData(d, i) {
  const k = sk(d, i);
  if (!sessionSets[k]) sessionSets[k] = { sets: [{reps:'', weight:''}], logged: false };
  return sessionSets[k];
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
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

/* ─── TAB SWITCHING ─── */
function switchTab(tab) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-' + tab).classList.add('active');
  ['log','history','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none'; });
  if (tab === 'history') renderHistory();
  else if (tab === 'clock') ensureClockBuilt();
  else destroyCharts();
  closeSidebar();
}

/* ─── DAY PICKER / CONTENT ─── */
function toggleDayPicker() {
  const dd = document.getElementById('day-dropdown');
  const picker = document.getElementById('day-picker-btn');
  if (!dd) return;
  const opening = !dd.classList.contains('show');
  dd.classList.toggle('show', opening);
  picker.classList.toggle('open', opening);
}
function closeDayPicker() {
  const dd = document.getElementById('day-dropdown');
  const picker = document.getElementById('day-picker-btn');
  if (dd) dd.classList.remove('show');
  if (picker) picker.classList.remove('open');
}
function selectDay(d) { flushInputs(); currentDay = d; closeDayPicker(); renderDayContent(); }

function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderDayContent() {
  const d = currentDay, day = schedule[d];
  const container = document.getElementById('day-content');
  const labelSuffix = day.label.includes('—') ? day.label.replace(/^.+?—\s*/, '') : '';
  const u = currentUnits;

  const dayDropdownItems = DAY_NAMES.map(dn =>
    `<div class="day-dropdown-item${dn===d?' active':''}${schedule[dn].restDay?' rest-day':''}" onclick="selectDay('${dn}')">${FULL_DAYS[dn]}</div>`
  ).join('');

  const top = `
    <div class="day-header">
      <button class="day-picker" id="day-picker-btn" onclick="toggleDayPicker()">
        <span class="day-abbr">${FULL_DAYS[d]}</span>
        <svg class="day-picker-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="day-dropdown" id="day-dropdown">${dayDropdownItems}</div>
      <input class="day-title-input" value="${escAttr(labelSuffix)}" placeholder="Add workout title..."
        oninput="schedule['${d}'].label=FULL_DAYS['${d}']+' — '+this.value;saveSchedule()">
    </div>
    <div class="day-actions">
      <button class="btn" onclick="toggleRestDay()">${day.restDay?'Mark as workout day':'Mark as rest day'}</button>
      <button class="btn" onclick="confirmCopyDay()">Copy to all days</button>
      <button class="btn" onclick="confirmClearSession()">Clear session</button>
    </div>`;

  if (day.restDay) {
    container.innerHTML = top + `<div class="rest-screen"><p>Rest day — enjoy your recovery.</p><button class="btn" style="padding:8px 16px;border:1px solid var(--border2);border-radius:999px;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-weight:500" onclick="toggleRestDay()">Mark as workout day</button></div>`;
    return;
  }

  const exCards = day.exercises.length === 0
    ? '<div class="empty">No exercises yet — tap “+ Add exercise” below to pick one from your library.</div>'
    : day.exercises.map((ex, i) => {
        const data = getSetData(d, i);
        const meta = [ex.reps ? ex.reps + ' reps' : '', ex.sets ? ex.sets + ' sets' : '', (ex.type==='custom'&&ex.duration) ? ex.duration : '', ex.rest ? ex.rest + ' rest' : ''].filter(Boolean).join(' · ');
        const noteHtml = ex.note ? `<div class="ex-note">${escHtml(ex.note)}</div>` : '';

        if (ex.type === 'custom') {
          return `<div class="exercise-card${data.logged?' is-logged':''}" data-idx="${i}">
            <div class="ex-head">
              <span class="ex-drag">⠿</span>
              <div class="ex-head-text">
                <div class="ex-name">${escHtml(ex.name)}</div>
                ${meta?`<div class="ex-meta">${meta}</div>`:''}
                ${noteHtml}
              </div>
              <button class="ex-x" onclick="removeExercise('${d}',${i})" aria-label="Remove">✕</button>
            </div>
          </div>`;
        }

        // Set number = (number of sets already logged today for this exercise) + 1
        const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
        const histAll = getHistory();
        const todaysEntry = (histAll[today] || []).find(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
        const setNumber = (todaysEntry ? todaysEntry.sets.length : 0) + 1;

        const rows = data.sets.map((s, si) => `
          <div class="set-row">
            <span class="set-num">${setNumber}</span>
            <input class="set-input" type="number" min="0" placeholder="Reps" value="${escAttr(s.reps)}" data-day="${d}" data-ex="${i}" data-si="${si}" data-reps="1" ${data.logged?'disabled':''}>
            <input class="set-input" type="number" min="0" placeholder="Weight" value="${escAttr(s.weight)}" data-day="${d}" data-ex="${i}" data-si="${si}" data-weight="1" ${data.logged?'disabled':''}>
            <button class="del-set" onclick="clearSet('${d}',${i},${si})" ${data.logged?'disabled':''} aria-label="Clear">✕</button>
          </div>`).join('');

        const timerKey = d + '-' + i;
        const timer = exerciseTimers[timerKey];
        let logBtnHtml;
        if (timer && timer.secsLeft > 0) {
          const m = Math.floor(timer.secsLeft/60), s = timer.secsLeft%60;
          const display = m + ':' + String(s).padStart(2,'0');
          logBtnHtml = `<button class="log-sets-btn timing" id="logbtn-${d}-${i}" onclick="skipExerciseTimer('${d}',${i})">Rest <span class="timer-count">${display}</span></button>`;
        } else {
          logBtnHtml = `<button class="log-sets-btn" onclick="logExercise('${d}',${i})">Log sets</button>`;
        }

        return `<div class="exercise-card${data.logged?' is-logged':''}" data-idx="${i}">
          <div class="ex-head">
            <span class="ex-drag">⠿</span>
            <div class="ex-head-text">
              <div class="ex-name">${escHtml(ex.name)}</div>
              ${meta?`<div class="ex-meta">${meta}</div>`:''}
              ${noteHtml}
            </div>
            <button class="ex-x" onclick="removeExercise('${d}',${i})" aria-label="Remove">✕</button>
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

  const addBtn = `<button class="add-exercise-btn" onclick="openLibSheet('${d}')">+ Add exercise</button>`;
  container.innerHTML = top + `<div id="drag-zone">${exCards}</div>` + addBtn;
  initDrag(d);
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
      const [kd, ki] = [k.split('_')[0], parseInt(k.split('_')[1])];
      if (kd !== d) { n[k] = sessionSets[k]; return; }
      if (ki < idx) n[k] = sessionSets[k];
      else if (ki > idx) n[kd+'_'+(ki-1)] = sessionSets[k];
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

/* ─── LOGGING ─── */
function logExercise(d, idx) {
  flushInputs();
  const data = getSetData(d, idx);
  const valid = data.sets.filter(s => s.reps !== '' || s.weight !== '');
  if (!valid.length) return;
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  const hist = getHistory();
  if (!hist[today]) hist[today] = [];
  const ex = schedule[d].exercises[idx];
  const newSets = valid.map(s => ({ reps: Number(s.reps)||0, weight: Number(s.weight)||0 }));
  const existing = hist[today].findIndex(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
  if (existing >= 0) {
    // Append to today's existing entry so multiple log presses on the same day merge
    hist[today][existing].sets = hist[today][existing].sets.concat(newSets);
  } else {
    hist[today].push({ exId: ex.exId||'', name: ex.name, sets: newSets });
  }
  saveHistory(hist);
  data.logged = true;
  data.lastLoggedCount = newSets.length; // remember for undo
  renderDayContent();
  startTimer(ex.restSecs || 90, d, idx);
}
function undoLog(d, idx) {
  const data = getSetData(d, idx);
  data.logged = false;
  // Remove only the sets that were just appended (not earlier same-day logs)
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  const hist = getHistory();
  const ex = schedule[d].exercises[idx];
  const removeCount = data.lastLoggedCount || 0;
  if (hist[today]) {
    const i = hist[today].findIndex(e => (e.exId && ex.exId) ? e.exId === ex.exId : e.name === ex.name);
    if (i >= 0) {
      const entry = hist[today][i];
      if (removeCount > 0 && entry.sets.length > removeCount) {
        // Earlier sets exist from a previous log this day — keep them, drop only the latest batch
        entry.sets = entry.sets.slice(0, entry.sets.length - removeCount);
      } else {
        // Either no earlier sets, or we don't know the count — remove the whole entry
        hist[today].splice(i, 1);
      }
      if (!hist[today].length) delete hist[today];
      saveHistory(hist);
    }
  }
  data.lastLoggedCount = 0;
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
  showModal('Clear session?', 'All logged sets for today will be cleared from this view. Your saved history is kept.', () => {
    Object.keys(sessionSets).forEach(k => { if (k.startsWith(currentDay + '_')) delete sessionSets[k]; });
    closeModal(); renderDayContent();
  });
}

/* ─── REST TIMER (per exercise, lives in the Log button) ─── */
function startTimer(secs, d, idx) {
  if (typeof d === 'undefined' || typeof idx === 'undefined') return;
  const key = d + '-' + idx;
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
      finishTimer(d, idx);
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
function finishTimer(d, idx) {
  const key = d + '-' + idx;
  delete exerciseTimers[key];
  // Clear input row and unlock so button reverts to "Log sets"
  const data = getSetData(d, idx);
  data.logged = false;
  data.sets = [{reps:'',weight:''}];
  renderDayContent();
}
function skipExerciseTimer(d, idx) {
  const key = d + '-' + idx;
  const t = exerciseTimers[key];
  if (t && t.intervalId) clearInterval(t.intervalId);
  finishTimer(d, idx);
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
