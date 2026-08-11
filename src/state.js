/* ════════════════════════════════════════════
   Tally Up — Shared State
   Every piece of state that's read or written from more than one module
   lives here. ES modules support live-binding imports, so other files
   that `import { schedule } from './state.js'` always see the current
   value — but only this module may reassign the exported `let` bindings
   directly (via the setters below); everyone else mutates in place
   (schedule[d] = ..., sessionSets[k] = ...) or calls a setter.
   ════════════════════════════════════════════ */
import { DEFAULT_LIBRARY_V2_BASE } from './exercises-data.js';

/* ─── CONSTANTS ─── */
export const KEYS = {
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
export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const FULL_DAYS = {Sun:'Sunday',Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday'};
export const TAG_LABEL = {gym:'Gym',dumbbell:'Dumbbells',bodyweight:'Bodyweight',custom:'Custom'};
export const TAG_CLASS = {gym:'tag-gym',dumbbell:'tag-dumbbell',bodyweight:'tag-bodyweight',custom:'tag-custom'};
export function genId() { return Math.random().toString(36).slice(2, 7); }

export const DEFAULT_DAYS = {
  Sun:{label:'Sunday',   restDay:false,exercises:[]},
  Mon:{label:'Monday',   restDay:false,exercises:[]},
  Tue:{label:'Tuesday',  restDay:false,exercises:[]},
  Wed:{label:'Wednesday',restDay:false,exercises:[]},
  Thu:{label:'Thursday', restDay:false,exercises:[]},
  Fri:{label:'Friday',   restDay:false,exercises:[]},
  Sat:{label:'Saturday', restDay:false,exercises:[]},
};

/* ═══════════════════════════════════════════════════════════
   LIBRARY V2 — muscle group taxonomy
   ═══════════════════════════════════════════════════════════ */
export const MUSCLE_GROUPS_V2 = [
  { key:'chest',     label:'Chest',     color:'coral',  subs:['Presses','Isolation','Bodyweight'] },
  { key:'back',      label:'Back',      color:'blue',   subs:['Vertical Pull','Rows','Lat Isolation','Upper back','Traps'] },
  { key:'shoulders', label:'Shoulders', color:'amber',  subs:['Presses','Lateral Delts','Rear Delts','Front delts'] },
  { key:'arms',      label:'Arms',      color:'purple', subs:['Biceps','Triceps','Forearms','Grip'] },
  { key:'legs',      label:'Legs',      color:'teal',   subs:['Quads','Hamstrings','Glutes','Calves'] },
  { key:'core',      label:'Core',      color:'green',  subs:['Flexion','Anti-Extension','Anti-Rotation','Lateral','Rotation'] },
  { key:'fullbody',  label:'Full Body', color:'gray',   subs:['Deadlifts','Olympic Lifts','Presses','Kettlebell','Bodyweight','Conditioning'] },
  { key:'cardio',    label:'Cardio',    color:'gray',   subs:['Running','Walking','Cycling','Rowing','Other'] },
];

// Live, mutable working copy of the library — this is what the rest of the app
// reads from and writes to. Starts as a fresh copy of the hardcoded defaults,
// then any saved edits/additions are merged on top at load time.
export let DEFAULT_LIBRARY_V2 = JSON.parse(JSON.stringify(DEFAULT_LIBRARY_V2_BASE));

export function saveLibraryV2() {
  try { localStorage.setItem(KEYS.libraryV2, JSON.stringify(DEFAULT_LIBRARY_V2)); } catch {}
}
export function loadLibraryV2() {
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
export function genLibV2Id() {
  let id;
  do { id = genId(); } while (DEFAULT_LIBRARY_V2.some(e => e.id === id));
  return id;
}

/* ─── CORE APP STATE ───
   These are exported as live bindings. Importers see updates automatically
   when this module reassigns them (via the setter functions below) or when
   they mutate the object/array in place (schedule[d].foo = ..., which does
   NOT require a setter since the reference itself doesn't change). */
export let schedule = JSON.parse(JSON.stringify(DEFAULT_DAYS));
export let currentDay = DAY_NAMES[new Date().getDay()];
export let dayEditMode = false;
export let sessionSets = {};
export let exerciseTimers = {};
export let activeCharts = [];
export let currentUnits = 'lbs';
export let showInstructionsIcons = false;
export let APP_VERSION = '';

export function setSchedule(s) { schedule = s; }
export function setCurrentDay(d) { currentDay = d; }
export function setDayEditMode(v) { dayEditMode = v; }
export function setSessionSets(s) { sessionSets = s; }
export function setCurrentUnits(u) { currentUnits = u; }
export function setShowInstructionsIcons(v) { showInstructionsIcons = v; }
export function setAppVersion(v) { APP_VERSION = v; }

/* ─── VIEWED DATE ───
   Lives here (not in calendar.js) because both calendar.js and schedule-day.js
   need it, and schedule-day.js is a lower-level module that calendar.js's
   render functions depend on — putting it in calendar.js would create a
   circular import. state.js has no dependents among app modules, so it's the
   correct home for anything more than one "feature" module needs. */
export let viewedDate = new Date();
viewedDate.setHours(0,0,0,0);
export function setViewedDate(d) { viewedDate = d; }
// ISO yyyy-mm-dd, used for safely embedding a date in an onclick attribute
export function formatISODate(date) { return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0'); }
export function parseISODate(str) { const [y,m,d] = str.split('-').map(Number); return new Date(y, m-1, d); }
export function cloneDate(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

/* ─── STORAGE ─── */
export function saveSchedule() { try { localStorage.setItem(KEYS.schedule, JSON.stringify(schedule)); } catch {} }
export function loadSchedule() { try { const s = localStorage.getItem(KEYS.schedule); if (s) schedule = JSON.parse(s); } catch {} }
export function getHistory()   { try { return JSON.parse(localStorage.getItem(KEYS.history) || '{}'); } catch { return {}; } }
export function saveHistory(h) { try { localStorage.setItem(KEYS.history, JSON.stringify(h)); } catch {} }

export function getCleanBw() {
  let raw = localStorage.getItem(KEYS.bw);
  if (!raw) return null;
  try { raw = JSON.parse(raw); } catch {}
  if (typeof raw === 'object') { localStorage.removeItem(KEYS.bw); return null; }
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

/* ─── SHARED UTILITIES ─── */
export function escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); }
export function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
