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
  sidebarMode: 'wl_sidebar_mode',
  profile:   'wl_profile',
  tallyLayout: 'wl_tally_layout',
  tallyHidden: 'wl_tally_hidden',
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

/* ═══════════════════════════════════════════════════════════
   PROFILE + GOALS — powers onboarding, Settings > Profile, and
   the Tally page (highlight bar mode, box priority/ordering,
   "needs attention" threshold, calorie estimate inputs).
   ═══════════════════════════════════════════════════════════ */
// The 6-question onboarding set. `key` is the field name saved onto the
// profile object; `flavor:true` means the answer is stored but doesn't
// drive any Tally logic yet (kept for future use / possible feedback tie-in).
export const GOAL_QUESTIONS = [
  {
    key: 'goal',
    question: "What's your main goal right now?",
    options: [
      { value: 'strength',     label: 'Get stronger',    icon: 'bolt' },
      { value: 'muscle',       label: 'Build muscle',    icon: 'flame' },
      { value: 'consistency',  label: 'Stay consistent', icon: 'calendar-check' },
      { value: 'fitness',      label: 'General fitness', icon: 'heart' },
      { value: 'weight_loss',  label: 'Lose weight',     icon: 'scale' },
    ],
  },
  {
    key: 'targetFrequency',
    question: 'How many days a week are you aiming to train?',
    options: [
      { value: '1-2', label: '1-2 days a week' },
      { value: '3-4', label: '3-4 days a week' },
      { value: '5-6', label: '5-6 days a week' },
      { value: '7',   label: 'Every day' },
    ],
  },
  {
    key: 'priorityMuscles',
    question: 'Any muscle groups you especially want to focus on?',
    multi: true,
    // populated at render time from MUSCLE_GROUPS_V2 so this list can't drift
    // from the real taxonomy; see buildPriorityMuscleOptions() below.
    optionsFromMuscleGroups: true,
  },
  {
    key: 'experience',
    question: 'How experienced are you with lifting?',
    flavor: true,
    options: [
      { value: 'new',        label: 'New to this' },
      { value: 'some',       label: "Been at it a while" },
      { value: 'experienced',label: 'Very experienced' },
    ],
  },
  {
    key: 'blocker',
    question: 'What usually gets in the way of consistency for you?',
    flavor: true,
    options: [
      { value: 'motivation', label: 'Motivation' },
      { value: 'time',       label: 'Time' },
      { value: 'injury',     label: 'Injury or soreness' },
      { value: 'none',       label: "Nothing really, I'm consistent" },
    ],
  },
  {
    key: 'usefulFor',
    question: 'What would make this app feel most useful to you?',
    flavor: true,
    options: [
      { value: 'progress',    label: 'Seeing progress over time' },
      { value: 'motivation',  label: 'Staying motivated day to day' },
      { value: 'logging',     label: 'Just a place to log workouts' },
      { value: 'structure',   label: 'Structure and planning' },
    ],
  },
];
export function buildPriorityMuscleOptions() {
  return MUSCLE_GROUPS_V2
    .filter(g => g.key !== 'cardio') // cardio has no "last trained" concept the same way
    .map(g => ({ value: g.key, label: g.label }));
}
// Upper bound of the user's chosen weekly frequency, in days — used both as
// the weekly quota target (day bar) and as the "needs attention" staleness
// threshold for a priority muscle group (state.js/history.js Tally logic).
export const FREQUENCY_UPPER_BOUND = { '1-2': 2, '3-4': 4, '5-6': 6, '7': 1 };

// Cumulative-weight-lifted milestone ladder for the Tally "Total weight
// lifted" box. Stored in lbs; converted at display time for kg users via
// the same conversion the rest of the app uses (see theme.js setUnits).
export const WEIGHT_MILESTONES = [
  { label: 'African elephant',           lbs: 10000 },
  { label: 'School bus',                 lbs: 15000 },
  { label: 'T-rex',                      lbs: 25000 },
  { label: 'Semi truck',                 lbs: 40000 },
  { label: 'Humpback whale',             lbs: 55000 },
  { label: 'Empty Boeing 737',           lbs: 70000 },
  { label: 'M1 Abrams tank',             lbs: 90000 },
  { label: 'MGM bronze lion',            lbs: 100000 },
  { label: 'Full Boeing 737',            lbs: 150000 },
  { label: 'Empty space shuttle',        lbs: 200000 },
  { label: 'Blue whale',                 lbs: 250000 },
  { label: 'Full Boeing 747',            lbs: 400000 },
  { label: 'Statue of Liberty',          lbs: 500000 },
  { label: 'International Space Station',lbs: 650000 },
  { label: 'Cumulus cloud',              lbs: 1000000 },
  { label: 'Saturn V rocket',            lbs: 1300000 },
  { label: '80 school buses',            lbs: 2000000 },
];

// Default shape for a brand-new profile. height/weight are optional (weight
// is normally sourced from KEYS.bw via getCleanBw(), but the profile keeps
// its own snapshot + timestamp so the Tally's "last updated" note and the
// weight-loss week-over-week delta don't depend on bodyweight.js internals).
function defaultProfile() {
  return {
    name: '',
    heightIn: null,
    goal: '',
    targetFrequency: '',
    priorityMuscles: [],
    experience: '',
    blocker: '',
    usefulFor: '',
    createdAt: null,
  };
}
let profileCache = null;
export function getProfile() {
  if (profileCache) return profileCache;
  try {
    const saved = localStorage.getItem(KEYS.profile);
    profileCache = saved ? Object.assign(defaultProfile(), JSON.parse(saved)) : defaultProfile();
  } catch { profileCache = defaultProfile(); }
  return profileCache;
}
// Shallow-merges `patch` onto the saved profile and persists it. Used by both
// the onboarding questionnaire (one field at a time) and the Settings profile
// edit screen (several fields at once).
export function saveProfile(patch) {
  const current = getProfile();
  profileCache = Object.assign({}, current, patch);
  if (!profileCache.createdAt) profileCache.createdAt = formatISODate(new Date());
  try { localStorage.setItem(KEYS.profile, JSON.stringify(profileCache)); } catch {}
  return profileCache;
}
export function hasCompletedProfile() {
  const p = getProfile();
  return !!(p.goal && p.targetFrequency);
}

/* ═══════════════════════════════════════════════════════════
   TALLY BOX REGISTRY — every possible box the Tally page can
   show, its width class (full spans the row alone; half pairs
   two per row — see .tally-box-row CSS), and the default
   layout for a fresh install (all boxes, in this order).
   Actual rendering logic lives in tally.js; this is just the
   catalog + persisted arrangement, matching the pattern of
   other reference data in this file (GOAL_QUESTIONS, etc.).
   ═══════════════════════════════════════════════════════════ */
export const TALLY_BOX_DEFS = [
  { id: 'overallTrend',  label: 'Overall trend',     width: 'full' },
  { id: 'bestStreak',    label: 'Best streak',       width: 'third' },
  { id: 'daysLogged',    label: 'Days logged',       width: 'third' },
  { id: 'setsCompleted', label: 'Sets completed',    width: 'third' },
  { id: 'totalWeight',   label: 'Total weight lifted',width: 'full' },
  { id: 'avgSession',    label: 'Avg session length',width: 'half' },
  { id: 'lastTrained',   label: 'Last trained',      width: 'half' },
  // The highlight-mode boxes double as regular boxes when they're NOT the
  // active highlight for the user's goal (per spec — whichever mode isn't
  // headlining still needs to be visible somewhere on the page).
  { id: 'prCallout',        label: 'Recent PR',          width: 'full' },
  { id: 'weekCheckmarks',   label: 'This week',          width: 'full' },
  { id: 'calorieRow',       label: 'Calories this week', width: 'full' },
];
const DEFAULT_TALLY_LAYOUT = TALLY_BOX_DEFS.map(b => b.id);

export function getTallyLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS.tallyLayout) || 'null');
    if (Array.isArray(saved) && saved.length) {
      // Guard against a stale saved layout referencing a box id that no
      // longer exists (e.g. after an app update removes/renames a box) —
      // drop unknown ids rather than let them render as blank/broken boxes.
      const validIds = new Set(TALLY_BOX_DEFS.map(b => b.id));
      const cleaned = saved.filter(id => validIds.has(id));
      // Any box added since this layout was saved (a new box id not present
      // in the saved array) gets appended at the end, so updates don't
      // silently hide new boxes from existing users.
      const missing = DEFAULT_TALLY_LAYOUT.filter(id => !cleaned.includes(id));
      return cleaned.concat(missing);
    }
  } catch {}
  return DEFAULT_TALLY_LAYOUT.slice();
}
export function saveTallyLayout(order) {
  try { localStorage.setItem(KEYS.tallyLayout, JSON.stringify(order)); } catch {}
}
// Hidden/removed boxes are tracked separately from order — removing a box
// via Edit Tally doesn't delete it from the layout array, it just marks it
// hidden, so re-adding via the "+" picker restores its prior position
// instead of appending it back at the end.
export function getTallyHidden() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS.tallyHidden) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
export function saveTallyHidden(hiddenIds) {
  try { localStorage.setItem(KEYS.tallyHidden, JSON.stringify(hiddenIds)); } catch {}
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

/* ─── BODY SCROLL LOCK (shared by any full-screen overlay: Tally sheet,
   Settings, etc.) — freezes the page underneath while an overlay is open.
   A prior version of this set document.body.style.position='fixed', which
   is the textbook approach but turned out to interfere with the overlay's
   OWN inner scrolling in this app (the sheet's #tally-scroll stopped
   scrolling entirely once body's layout changed underneath it). Fixed by
   only blocking touchmove on the specific overlay elements passed in —
   body itself is never touched, so nothing about it can cascade into
   breaking a fixed-position child's own scroll behavior. Reference-counted
   via _lockCount so nested opens (Settings opened from within another
   overlay) don't unlock prematurely when the inner one closes first. */
let _lockCount = 0;
let _lockedOverlays = [];
function blockScroll(e) {
  // Only block if the touch target is the overlay backdrop itself, not
  // something inside a genuinely scrollable child (e.g. #tally-scroll,
  // #settings-modal's own content area) — those need touchmove to reach
  // their own scroll handling untouched.
  if (e.target.dataset.scrollLockBackdrop !== undefined) e.preventDefault();
}
export function lockBodyScroll(overlayIds) {
  _lockCount++;
  (overlayIds || []).forEach(id => {
    const el = document.getElementById(id);
    if (el && !_lockedOverlays.includes(id)) {
      el.dataset.scrollLockBackdrop = '1';
      el.addEventListener('touchmove', blockScroll, { passive: false });
      _lockedOverlays.push(id);
    }
  });
}
export function unlockBodyScroll() {
  _lockCount = Math.max(0, _lockCount - 1);
  if (_lockCount > 0) return; // still locked by another overlay
  _lockedOverlays.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.removeEventListener('touchmove', blockScroll); delete el.dataset.scrollLockBackdrop; }
  });
  _lockedOverlays = [];
}
