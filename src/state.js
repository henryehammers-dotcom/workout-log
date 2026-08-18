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
  lastBackupAt: 'wl_last_backup_at',
  hideBw:    'wl_hide_bw',
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

// Every muscle name used anywhere in muscles.primary/secondary/stabilizers across
// the library, alphabetized. Powers the Secondary Muscles dropdown picker in the
// edit/new exercise form (#7). Kept as a flat list rather than per-group since a
// handful of muscles (e.g. Core, Forearms) are legitimately relevant across
// multiple groups as secondary/stabilizer muscles.
export const ALL_MUSCLES = [
  'Adductors', 'Arms', 'Back', 'Biceps', 'Brachialis', 'Brachioradialis', 'Calves',
  'Cardiovascular system', 'Chest', 'Core', 'Forearms', 'Front delts', 'Full body',
  'Glutes', 'Hamstrings', 'Hand muscles', 'Hip flexors', 'Lats', 'Legs', 'Lower abs',
  'Obliques', 'Quads', 'Rear delts', 'Rotator cuff', 'Serratus anterior', 'Shoulders',
  'Side delts', 'Spinal erectors', 'Teres major', 'Tibialis anterior', 'Traps',
  'Triceps', 'Upper abs', 'Upper back', 'Upper chest', 'Upper traps', 'Wrist extensors',
  'Wrist flexors',
];

// Movement patterns actually used within each muscle group, derived from the
// existing exercise data. Powers the Movement Pattern dropdown in the edit/new
// exercise form (#8), filtered by the form's currently-selected muscle group.
export const MOVEMENT_PATTERNS_BY_GROUP = {
  chest:     ['Horizontal push', 'Diagonal push', 'Horizontal adduction', 'Diagonal adduction'],
  back:      ['Vertical pull', 'Horizontal pull', 'Shoulder extension', 'Scapular elevation'],
  shoulders: ['Vertical push', 'Shoulder flexion', 'Shoulder abduction', 'Horizontal abduction'],
  arms:      ['Elbow flexion', 'Elbow extension', 'Horizontal push', 'Vertical push', 'Flexion', 'Extension', 'Carry'],
  legs:      ['Squat', 'Lunge', 'Hip hinge', 'Hip extension', 'Extension', 'Flexion', 'Abduction', 'Step'],
  core:      ['Flexion', 'Rotation', 'Anti-rotation'],
  fullbody:  ['Squat', 'Hip hinge', 'Olympic pull', 'Vertical push', 'Carry'],
  cardio:    ['Cardio'],
};

/* ═══════════════════════════════════════════════════════════
   FORM FIELD HELP TEXT — powers the "?" popups in the add/edit
   exercise form (Type, Difficulty, Laterality, Position, and the
   Sets/Reps/Rest section).
   ═══════════════════════════════════════════════════════════ */
export const FIELD_HELP = {
  type: {
    title: 'Type',
    intro: 'What kind of movement this is, mechanically.',
    options: [
      ['Compound', 'Works multiple joints and muscle groups at once (e.g. a squat or bench press). Usually the priority for building overall strength and size.'],
      ['Isolation', 'Works one joint and one main muscle (e.g. a bicep curl). Good for targeting a specific muscle after compound work.'],
      ['Isometric', 'The muscle holds tension without the joint moving (e.g. a plank). Builds stability and endurance rather than moving through a range of motion.'],
      ['Carry', 'Loaded walking (e.g. a farmer\u2019s carry). Builds grip, core stability, and total-body tension under load.'],
      ['Conditioning', 'High-effort, fatigue-driven work meant to raise heart rate and challenge work capacity, more than build max strength.'],
      ['Cardio', 'Sustained aerobic activity (e.g. running, cycling) aimed at heart and lung endurance rather than muscle loading.'],
    ],
  },
  difficulty: {
    title: 'Difficulty',
    intro: 'How much technique, stability, or strength the movement demands before it\u2019s safe and effective.',
    options: [
      ['Beginner', 'Straightforward to learn, forgiving of imperfect form, low injury risk. Good starting point for someone new to the movement.'],
      ['Intermediate', 'Requires some technique or stability built up from beginner movements. A natural next step once the basics feel easy.'],
      ['Advanced', 'Demands more coordination, mobility, or strength to perform safely \u2014 usually best attempted once the intermediate version is comfortable.'],
    ],
  },
  laterality: {
    title: 'Laterality',
    intro: 'Whether both sides of the body work together or independently.',
    options: [
      ['Bilateral', 'Both limbs move together and share the load (e.g. a barbell squat). Generally allows more total weight.'],
      ['Unilateral', 'One limb (or side) works at a time (e.g. a single-arm row). Helps fix side-to-side imbalances and challenges stability more.'],
    ],
  },
  setsRepsRest: {
    title: 'Sets, Reps & Rest',
    intro: 'These three work together to determine what kind of adaptation you\u2019re training for.',
    options: [
      ['Strength (heavy, low reps)', 'Roughly 1\u20135 reps, 3\u20135+ min rest. Trains your nervous system to produce maximal force. Best on compound lifts.'],
      ['Hypertrophy (muscle growth)', 'Roughly 6\u201312 reps, 60\u201390 sec rest. The classic muscle-building range \u2014 enough load to challenge the muscle, enough volume to accumulate fatigue.'],
      ['Endurance (light, high reps)', 'Roughly 12\u201320+ reps, 30\u201360 sec rest. Builds muscular stamina and work capacity more than raw size or strength.'],
      ['How to know when to increase weight', 'If, for two sessions in a row, you finish all sets at the top of your rep range and still feel like you can do 1-2 more, go up in weight. Increase in small increments at a time.'],
    ],
  },
};

// Live, mutable working copy of the library — this is what the rest of the app
// reads from and writes to. Starts as a fresh copy of the hardcoded defaults,
// then any saved edits/additions are merged on top at load time.
export let DEFAULT_LIBRARY_V2 = JSON.parse(JSON.stringify(DEFAULT_LIBRARY_V2_BASE));

// Bump this whenever the exercise object *shape* changes in a way that makes
// older saved libraries incompatible (fields renamed/removed, new required
// fields, etc.) — NOT for ordinary additions of new exercises, which are
// backward-compatible. This is what loadLibraryV2() checks instead of
// guessing from array length or field presence.
const LIBRARY_SCHEMA_VERSION = 1;

export function saveLibraryV2() {
  try {
    const payload = { schemaVersion: LIBRARY_SCHEMA_VERSION, exercises: DEFAULT_LIBRARY_V2 };
    localStorage.setItem(KEYS.libraryV2, JSON.stringify(payload));
  } catch {}
}
// Merges a saved (localStorage) library with the current base file, exercise
// by exercise, rather than letting the saved copy blindly win everywhere.
// Without this, any code update to exercises-data.js (bug fixes, recategorized
// exercises, new difficulty ratings, etc.) would be silently invisible to any
// user who has ever saved so much as one edit through the in-app form — the
// saved snapshot would shadow the entire base file forever, not just the
// exercises actually edited.
//
// Relies on an explicit `_userEdited: true` flag stamped onto an exercise by
// saveLibExerciseForm() at the moment the user actually saves it through the
// form — a plain diff against the current base file doesn't work here, since
// a code fix to the base file changes its contents *by definition*, making
// "differs from current base" indistinguishable from "user edited it".
//
// Rule per exercise ID:
//  - Flagged _userEdited in saved data → user customized it, keep their
//    saved version untouched.
//  - Not flagged, but exists in the base file → user never touched it
//    (just carried along in the saved blob), take the current base file
//    version so bug fixes/updates always reach it.
//  - Exists only in saved data with no base-file counterpart → a user-created
//    exercise with no _userEdited flag from before this flag existed; keep it
//    regardless, since there's nothing to refresh it from.
//  - Exists only in the base file (added since the user's last save) →
//    include it.
function mergeLibraryWithBase(savedExercises) {
  const baseById = new Map(DEFAULT_LIBRARY_V2_BASE.map(e => [e.id, e]));
  const seenIds = new Set();
  const merged = savedExercises.map(savedEx => {
    seenIds.add(savedEx.id);
    const baseEx = baseById.get(savedEx.id);
    if (!baseEx) return savedEx; // user-created, no base counterpart
    if (savedEx._userEdited) return savedEx; // explicitly customized, keep it
    return baseEx; // untouched, refresh from the current base file
  });
  DEFAULT_LIBRARY_V2_BASE.forEach(baseEx => {
    if (!seenIds.has(baseEx.id)) merged.push(baseEx); // new since user's last save
  });
  return merged;
}
export function loadLibraryV2() {
  try {
    const saved = localStorage.getItem(KEYS.libraryV2);
    if (!saved) return;
    const parsed = JSON.parse(saved);

    // Current format: { schemaVersion, exercises }. Trust the version number
    // directly — no guessing from shape.
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.exercises)) {
      if (parsed.schemaVersion === LIBRARY_SCHEMA_VERSION) {
        DEFAULT_LIBRARY_V2 = mergeLibraryWithBase(parsed.exercises);
        saveLibraryV2(); // persist the merged result so the next load is already up to date
      }
      // A schemaVersion that doesn't match means this save predates a
      // breaking shape change — fall back to the fresh defaults rather than
      // loading incompatible data (same as if nothing were saved at all).
      return;
    }

    // One-time migration path: a save from before schemaVersion existed (a
    // bare array, no wrapper). Use the same heuristic the old code relied on
    // to decide whether it's worth keeping, then immediately re-save it in
    // the new wrapped format so this branch is never needed again for this
    // user going forward.
    const looksModern = Array.isArray(parsed) && parsed.length > 150 && parsed.every(e => e && typeof e.blurb === 'string');
    if (looksModern) {
      DEFAULT_LIBRARY_V2 = mergeLibraryWithBase(parsed);
      saveLibraryV2();
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
export let hideBodyweight = false;
export let APP_VERSION = '';

export function setSchedule(s) { schedule = s; }
export function setCurrentDay(d) { currentDay = d; }
export function setDayEditMode(v) { dayEditMode = v; }
export function setSessionSets(s) { sessionSets = s; }
export function setCurrentUnits(u) { currentUnits = u; }
export function setShowInstructionsIcons(v) { showInstructionsIcons = v; }
export function setHideBodyweight(v) { hideBodyweight = v; }
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
