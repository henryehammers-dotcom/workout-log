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

/* ═══════════════════════════════════════════════════════════
   LIBRARY V2 — PREVIEW ONLY, NOT WIRED TO ANYTHING YET
   Two-tier tag system: group (gross) + sub (sub-region).
   Filtering later will match on group OR group+sub together.
   ═══════════════════════════════════════════════════════════ */
const MUSCLE_GROUPS_V2 = [
  { key:'chest',     label:'Chest',     color:'coral',  subs:['Upper chest','Mid chest','Lower chest'] },
  { key:'back',      label:'Back',      color:'blue',   subs:['Lats','Traps','Lower back','Rhomboids'] },
  { key:'shoulders', label:'Shoulders', color:'amber',  subs:['Front delts','Side delts','Rear delts'] },
  { key:'arms',      label:'Arms',      color:'purple', subs:['Biceps','Triceps','Forearms'] },
  { key:'core',      label:'Core',      color:'green',  subs:['Upper abs','Lower abs','Obliques'] },
  { key:'legs',      label:'Legs',      color:'teal',   subs:['Quads','Hamstrings','Glutes','Calves','Adductors','Abductors'] },
  { key:'cardio',    label:'Cardio',    color:'gray',   subs:[] },
  { key:'mobility',  label:'Mobility',  color:'gray',   subs:[] },
];

// Full merged library: boilerplate defaults + Henry personal exercises (IDs preserved)
const DEFAULT_LIBRARY_V2 = [
  {name:"Incline barbell bench press", group:"chest", sub:"Upper chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Low-to-high cable fly", group:"chest", sub:"Upper chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Barbell bench press", group:"chest", sub:"Mid chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Dumbbell bench press", group:"chest", sub:"Mid chest", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell"},
  {name:"Push-up", group:"chest", sub:"Mid chest", reps:"10-20", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Flat cable fly", group:"chest", sub:"Mid chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Decline barbell bench press", group:"chest", sub:"Lower chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Dips", group:"chest", sub:"Lower chest", reps:"8-15", rest:"90 sec", restSecs:90, type:"bodyweight"},
  {name:"Decline dumbbell press", group:"chest", sub:"Lower chest", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell"},
  {name:"High-to-low cable fly", group:"chest", sub:"Lower chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Lat pulldown", group:"back", sub:"Lats", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym"},
  {name:"Barbell row", group:"back", sub:"Lats", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Straight-arm pulldown", group:"back", sub:"Lats", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Barbell shrug", group:"back", sub:"Traps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Dumbbell shrug", group:"back", sub:"Traps", reps:"10-15", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Farmer's carry", group:"back", sub:"Traps", reps:"30-45 sec", rest:"90 sec", restSecs:90, type:"dumbbell"},
  {name:"Face pull", group:"back", sub:"Traps", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Deadlift", group:"back", sub:"Lower back", reps:"4-8", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Back extension", group:"back", sub:"Lower back", reps:"12-15", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Good morning", group:"back", sub:"Lower back", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym"},
  {name:"Seated cable row", group:"back", sub:"Rhomboids", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym"},
  {name:"Chest-supported row", group:"back", sub:"Rhomboids", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell"},
  {name:"Reverse pec deck", group:"back", sub:"Rhomboids", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Bent-over rear delt row", group:"back", sub:"Rhomboids", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Barbell overhead press", group:"shoulders", sub:"Front delts", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Front raise", group:"shoulders", sub:"Front delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Cable lateral raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Machine lateral raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Upright row", group:"shoulders", sub:"Side delts", reps:"10-12", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Reverse pec deck (delts)", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Bent-over dumbbell raise", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Cable rear delt fly", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Barbell curl", group:"arms", sub:"Biceps", reps:"8-12", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Dumbbell curl", group:"arms", sub:"Biceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Hammer curl", group:"arms", sub:"Biceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Cable curl", group:"arms", sub:"Biceps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Cable tricep pushdown", group:"arms", sub:"Triceps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Close-grip bench press", group:"arms", sub:"Triceps", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Skull crusher", group:"arms", sub:"Triceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Overhead tricep extension", group:"arms", sub:"Triceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell"},
  {name:"Dumbbell wrist curl", group:"arms", sub:"Forearms", reps:"12-20", rest:"45 sec", restSecs:45, type:"dumbbell"},
  {name:"Reverse wrist curl", group:"arms", sub:"Forearms", reps:"12-20", rest:"45 sec", restSecs:45, type:"dumbbell"},
  {name:"Cable crunch", group:"core", sub:"Upper abs", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Sit-up", group:"core", sub:"Upper abs", reps:"15-20", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Machine crunch", group:"core", sub:"Upper abs", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Hanging leg raise", group:"core", sub:"Lower abs", reps:"10-15", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Reverse crunch", group:"core", sub:"Lower abs", reps:"12-15", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Leg raise", group:"core", sub:"Lower abs", reps:"12-15", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Dumbbell side bend", group:"core", sub:"Obliques", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell"},
  {name:"Russian twist", group:"core", sub:"Obliques", reps:"15-20", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Cable woodchopper", group:"core", sub:"Obliques", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym"},
  {name:"Side plank", group:"core", sub:"Obliques", reps:"30-45 sec", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Barbell squat", group:"legs", sub:"Quads", reps:"6-10", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Leg press", group:"legs", sub:"Quads", reps:"8-12", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Dumbbell goblet squat", group:"legs", sub:"Quads", reps:"10-15", rest:"90 sec", restSecs:90, type:"dumbbell"},
  {name:"Bodyweight squat", group:"legs", sub:"Quads", reps:"15-25", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Leg extension", group:"legs", sub:"Quads", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Leg curl", group:"legs", sub:"Hamstrings", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Good morning (legs)", group:"legs", sub:"Hamstrings", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym"},
  {name:"Nordic curl", group:"legs", sub:"Hamstrings", reps:"6-10", rest:"90 sec", restSecs:90, type:"bodyweight"},
  {name:"Barbell hip thrust", group:"legs", sub:"Glutes", reps:"8-12", rest:"2 min", restSecs:120, type:"gym"},
  {name:"Glute bridge", group:"legs", sub:"Glutes", reps:"15-20", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Cable kickback", group:"legs", sub:"Glutes", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Seated calf raise", group:"legs", sub:"Calves", reps:"12-20", rest:"60 sec", restSecs:60, type:"gym"},
  {name:"Cable adduction", group:"legs", sub:"Adductors", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym"},
  {name:"Sumo squat", group:"legs", sub:"Adductors", reps:"10-15", rest:"90 sec", restSecs:90, type:"dumbbell"},
  {name:"Cable abduction", group:"legs", sub:"Abductors", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym"},
  {name:"Lateral band walk", group:"legs", sub:"Abductors", reps:"12-15 steps", rest:"45 sec", restSecs:45, type:"bodyweight"},
  {name:"Stationary bike", group:"cardio", reps:"20-30 min", rest:"n/a", restSecs:0, type:"custom"},
  {name:"Rowing machine", group:"cardio", reps:"15-20 min", rest:"n/a", restSecs:0, type:"custom"},
  {name:"Elliptical", group:"cardio", reps:"20-30 min", rest:"n/a", restSecs:0, type:"custom"},
  {name:"Stair climber", group:"cardio", reps:"15-20 min", rest:"n/a", restSecs:0, type:"custom"},
  {name:"Jump rope", group:"cardio", reps:"5-10 min", rest:"60 sec", restSecs:60, type:"bodyweight"},
  {name:"Child's pose", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"Hip flexor stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"Hamstring stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"Couch stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"World's greatest stretch", group:"mobility", reps:"5-8 reps", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"Thoracic rotation", group:"mobility", reps:"10-12 reps", rest:"30 sec", restSecs:30, type:"bodyweight"},
  {name:"Incline dumbbell press", group:"chest", sub:"Upper chest", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell", id:"24e8a"},
  {name:"Incline dumbbell fly", group:"chest", sub:"Upper chest", reps:"10-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"rkmkf"},
  {name:"Pull-up", group:"back", sub:"Lats", reps:"5-10", rest:"2 min", restSecs:120, type:"bodyweight", id:"5965m"},
  {name:"Single-arm dumbbell row", group:"back", sub:"Lats", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell", id:"rnvlx"},
  {name:"Dumbbell lateral raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"c86i0"},
  {name:"Dumbbell shoulder press", group:"shoulders", sub:"Front delts", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell", id:"6mxt7"},
  {name:"Arnold press", group:"shoulders", sub:"Front delts", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell", id:"hh1qr"},
  {name:"Romanian deadlift", group:"legs", sub:"Hamstrings", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell", id:"0yilr"},
  {name:"Bulgarian split squat", group:"legs", sub:"Glutes", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell", id:"i5pkg"},
  {name:"Bodyweight calf raise", group:"legs", sub:"Calves", reps:"20-30", rest:"45 sec", restSecs:45, type:"bodyweight", id:"i4vm1"},
  {name:"Cat-cow", group:"mobility", reps:"10-15", rest:"30 sec", restSecs:30, type:"bodyweight", id:"7a9nr"},
  {name:"Pigeon pose", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"xcamg"},
  {name:"Rear Delt Fly", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"56r6p"},
  {name:"Incline Bicep Curl", group:"arms", sub:"Biceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"onkz4"},
  {name:"Tricep Overhead Extension", group:"arms", sub:"Triceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"z6w58"},
  {name:"Dumbbell Hip Thrust", group:"legs", sub:"Glutes", reps:"10-15", rest:"90 sec", restSecs:90, type:"dumbbell", id:"3y5au"},
  {name:"Donkey Kick", group:"legs", sub:"Glutes", reps:"15-20", rest:"60 sec", restSecs:60, type:"bodyweight", id:"imbd8"},
  {name:"Dumbbell Step-up", group:"legs", sub:"Quads", reps:"10-12", rest:"90 sec", restSecs:90, type:"dumbbell", id:"vevtf"},
  {name:"Plank", group:"core", sub:"Upper abs", reps:"30-60 sec", rest:"60 sec", restSecs:60, type:"bodyweight", id:"8safy"},
  {name:"Weighted Sit-up", group:"core", sub:"Upper abs", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"eqsyw"},
  {name:"Treadmill (zone 2)", group:"cardio", reps:"20-30 min", rest:"n/a", restSecs:0, type:"custom", id:"m4lol"},
  {name:"Frogger Stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"r52g0"},
  {name:"Deep Squat Hold", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"4onlx"},
  {name:"Standing Forward Hold", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"eozgw"},
  {name:"Seated Single Leg Stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"9ta3l"},
  {name:"Thread the needle", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"ih0qk"},
];

// Sister-variant chains: same movement, different equipment. Clicking "See X version"
// on any exercise in a chain advances to the next one, wrapping back to the first.
const SISTER_CHAINS = [
  ["Incline barbell bench press", "Incline dumbbell press"],
  ["Barbell bench press", "Dumbbell bench press"],
  ["Decline barbell bench press", "Decline dumbbell press"],
  ["Barbell shrug", "Dumbbell shrug"],
  ["Barbell overhead press", "Dumbbell shoulder press"],
  ["Barbell hip thrust", "Dumbbell Hip Thrust"],
  ["Bodyweight calf raise", "Seated calf raise"],
  ["Sit-up", "Weighted Sit-up"],
  ["Barbell squat", "Dumbbell goblet squat", "Bodyweight squat"],
  ["Cable lateral raise", "Dumbbell lateral raise", "Machine lateral raise"],
  ["Barbell curl", "Dumbbell curl", "Hammer curl", "Cable curl"],
  ["Barbell row", "Single-arm dumbbell row", "Seated cable row", "Chest-supported row"],
];
function getSisterOf(name) {
  for (const chain of SISTER_CHAINS) {
    const i = chain.indexOf(name);
    if (i !== -1) return chain[(i + 1) % chain.length];
  }
  return null;
}

// Blurbs, keyed by exact exercise name. Filled in incrementally.
const EXERCISE_BLURBS = {
  "Incline barbell bench press": "Set the bench to a 30-45° incline, grip the bar slightly wider than shoulder-width. Lower it to your upper chest with elbows at ~45°, then press up until arms extend. Feet planted, core tight throughout.",
  "Incline dumbbell press": "Set the bench to a 30-45° incline. Start with dumbbells at upper-chest height, elbows around 45° out. Press up and slightly back until arms extend, then lower with control. Feet planted, core tight throughout.",
  "Incline dumbbell fly": "Lie on an incline bench, dumbbells pressed straight up, palms facing in. Lower them out to the sides in a wide arc, slight elbow bend. Bring back up, squeezing chest at the top.",
  "Low-to-high cable fly": "Stand between two low cable pulleys, handle in each hand. Bring your hands up and together in front of your chest in a wide arc, like hugging a big ball. Slowly let them back down.",
  "Barbell bench press": "Lie flat on a bench, bar above your chest, hands slightly wider than shoulders. Lower the bar to your chest, then push it back up until your arms straighten.",
  "Dumbbell bench press": "Lie flat on a bench holding a dumbbell in each hand above your chest. Lower them down to chest level, elbows bent, then push back up.",
  "Push-up": "Start face-down, hands under shoulders, body in a straight line. Lower your chest to the floor by bending your elbows, then push back up.",
  "Flat cable fly": "Stand between two cable pulleys set at chest height. Bring your hands together in front of you in a hugging motion, then let them back out slowly.",
  "Decline barbell bench press": "Lie on a bench angled downward, feet higher than your head. Lower the bar to your lower chest, then press it back up.",
  "Dips": "Grip two parallel bars, arms straight, body hanging. Lower yourself by bending your elbows until your upper arms are about parallel to the floor, then push back up.",
  "Decline dumbbell press": "Lie on a bench angled downward, holding a dumbbell in each hand above your lower chest. Lower them down, then press back up.",
  "High-to-low cable fly": "Stand between two cable pulleys set above your head. Pull your hands down and together in front of your hips, then let them back up slowly.",
  "Lat pulldown": "Sit at the machine, grab the bar wide overhead. Pull it down to your upper chest, squeezing your back, then let it rise back up with control.",
  "Barbell row": "Bend forward at the hips holding a bar, back flat. Pull the bar up to your stomach, squeezing your back, then lower it back down.",
  "Straight-arm pulldown": "Stand facing a high cable, arms straight down in front of you holding the bar. Pull it down to your thighs keeping arms straight, then let it rise back up.",
  "Barbell shrug": "Stand holding a bar in front of you, arms straight. Lift your shoulders straight up toward your ears, then lower them back down.",
  "Dumbbell shrug": "Stand holding a dumbbell in each hand at your sides. Lift your shoulders straight up toward your ears, then lower them back down.",
  "Farmer's carry": "Pick up a heavy dumbbell or weight in each hand and simply walk forward for the set distance or time, keeping your shoulders back and core tight.",
  "Face pull": "Stand facing a cable set at head height with a rope handle. Pull the rope toward your face, elbows out wide, then let it back out slowly.",
  "Deadlift": "Stand with feet hip-width apart, bar on the floor in front of you. Bend at your hips and knees to grip it, then stand up tall by pushing through your feet, keeping the bar close to your legs.",
  "Back extension": "Lie face-down on the machine with your hips on the pad, ankles secured. Lower your upper body down, then lift back up until your body is straight.",
  "Good morning": "Stand with a bar across your upper back. Keeping your legs mostly straight, bend forward at the hips until your torso is close to parallel with the floor, then stand back up.",
  "Seated cable row": "Sit at the machine, feet braced, grab the handle with arms extended. Pull it toward your stomach, squeezing your back, then let it extend back out.",
  "Chest-supported row": "Lie face-down on an inclined bench holding dumbbells hanging below you. Pull them up toward your sides, squeezing your back, then lower back down.",
  "Reverse pec deck": "Sit at the machine facing the pad, arms out in front holding the handles. Pull your arms back and out to the sides, squeezing your shoulder blades, then return slowly.",
  "Bent-over rear delt row": "Bend forward at the hips holding dumbbells hanging below you. Pull your elbows up and out to the sides, then lower back down.",
  "Barbell overhead press": "Stand holding a bar at shoulder height. Press it straight overhead until your arms are extended, then lower it back to your shoulders.",
  "Front raise": "Stand holding a dumbbell in each hand at your sides. Raise them straight out in front of you to shoulder height, then lower back down.",
  "Cable lateral raise": "Stand sideways to a low cable pulley, handle in the hand farthest from the machine. Raise your arm out to the side to shoulder height, then lower back down.",
  "Machine lateral raise": "Sit at the machine, arms inside the pads at your sides. Push your arms out and up to the sides, then lower back down.",
  "Upright row": "Stand holding a bar or dumbbells in front of your thighs. Pull it straight up toward your chin, elbows leading and out to the sides, then lower back down.",
  "Reverse pec deck (delts)": "Sit at the machine facing the pad, arms out in front holding the handles. Pull your arms back and out to the sides, squeezing your shoulder blades, then return slowly.",
  "Bent-over dumbbell raise": "Bend forward at the hips holding dumbbells hanging below you. Raise your arms out to the sides until level with your shoulders, then lower back down.",
  "Cable rear delt fly": "Stand facing a cable machine with the handles crossed at chest height. Pull your arms out and back to the sides, then return slowly to the front.",
  "Barbell curl": "Stand holding a bar with palms facing forward, arms extended. Curl the bar up toward your shoulders, then lower it back down.",
  "Dumbbell curl": "Stand holding a dumbbell in each hand, arms at your sides, palms facing forward. Curl them up toward your shoulders, then lower back down.",
  "Hammer curl": "Stand holding a dumbbell in each hand, palms facing your body. Curl them up toward your shoulders, then lower back down.",
  "Cable curl": "Stand facing a low cable with a bar attachment, arms extended down. Curl it up toward your shoulders, then lower back down with control.",
  "Cable tricep pushdown": "Stand facing a high cable with a bar or rope attachment, elbows tucked at your sides. Push the bar down until your arms are straight, then let it rise back up.",
  "Close-grip bench press": "Lie flat on a bench, hands close together on the bar, just inside shoulder width. Lower the bar to your chest, then push it back up.",
  "Skull crusher": "Lie on a bench holding a bar or dumbbells above your forehead, elbows pointing up. Bend your elbows to lower the weight toward your forehead, then straighten back up.",
  "Overhead tricep extension": "Stand or sit holding a dumbbell with both hands overhead. Lower it behind your head by bending your elbows, then straighten your arms back up.",
  "Dumbbell wrist curl": "Sit with your forearm resting on your thigh, palm up, holding a light dumbbell. Curl your wrist up, then lower back down.",
  "Reverse wrist curl": "Sit with your forearm resting on your thigh, palm down, holding a light dumbbell. Curl your wrist up, then lower back down.",
  "Cable crunch": "Kneel facing away from a high cable, rope behind your head. Curl your body forward, bringing your elbows toward your knees, then return slowly.",
  "Sit-up": "Lie on your back, knees bent, feet flat on the floor. Curl your whole upper body up toward your knees, then lower back down.",
  "Machine crunch": "Sit at the machine with pads against your chest or shoulders. Curl forward, contracting your abs, then return slowly.",
  "Hanging leg raise": "Hang from a pull-up bar with straight arms. Raise your legs up in front of you as high as you can, then lower back down with control.",
  "Reverse crunch": "Lie on your back, knees bent toward your chest. Curl your hips up off the floor, bringing your knees toward your chest, then lower back down.",
  "Leg raise": "Lie on your back, legs straight. Raise them up toward the ceiling without bending your knees, then lower back down without letting your feet touch the floor.",
  "Dumbbell side bend": "Stand holding a dumbbell in one hand at your side. Bend sideways toward that hand, then straighten back up. Finish all reps, then switch sides.",
  "Russian twist": "Sit with knees bent, leaning back slightly, feet either on the floor or lifted. Twist your torso side to side, touching the floor beside you each time.",
  "Cable woodchopper": "Stand sideways to a high cable, handle in both hands. Pull it down and across your body toward your opposite hip, then return slowly.",
  "Side plank": "Lie on your side, propped up on one forearm, body in a straight line. Hold this position, keeping your hips lifted off the floor.",
  "Barbell squat": "Stand with a bar across your upper back, feet shoulder-width apart. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Leg press": "Sit in the machine, feet on the platform shoulder-width apart. Push the platform away by straightening your legs, then let it come back slowly.",
  "Dumbbell goblet squat": "Hold a dumbbell with both hands at your chest. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Bodyweight squat": "Stand with feet shoulder-width apart, no weight. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Leg extension": "Sit at the machine with the pad against the front of your ankles. Straighten your legs to lift the pad up, then lower back down with control.",
  "Leg curl": "Lie face-down or sit at the machine with the pad against the back of your ankles. Curl your legs, bringing your heels toward your glutes, then lower back down.",
  "Good morning (legs)": "Stand with a bar across your upper back. Keeping your legs mostly straight, bend forward at the hips until your torso is close to parallel with the floor, then stand back up.",
  "Nordic curl": "Kneel with your ankles held down by a partner or anchor. Slowly lower your body forward as far as you can, using your hamstrings to control the movement, then pull back up.",
  "Glute bridge": "Lie on your back, knees bent, feet flat on the floor. Push through your heels to lift your hips up until your body forms a straight line, then lower back down.",
  "Cable kickback": "Stand facing a low cable with the strap around your ankle. Kick your leg straight back and up, then return slowly to the start.",
  "Seated calf raise": "Sit at the machine with the pad on your thighs and your toes on the platform. Push up onto your toes as high as you can, then lower back down.",
  "Cable adduction": "Stand sideways to a low cable with the strap around your ankle furthest from the machine. Pull that leg across your body, then return slowly.",
  "Sumo squat": "Stand with feet wider than shoulder-width, toes pointed out, holding a dumbbell if you like. Bend your knees to lower down, then stand back up.",
  "Cable abduction": "Stand sideways to a low cable with the strap around your ankle nearest the machine. Pull that leg out and away from your body, then return slowly.",
  "Lateral band walk": "Put a resistance band around your ankles or knees, feet shoulder-width apart, knees slightly bent. Step sideways in small steps, keeping tension on the band.",
  "Stationary bike": "Sit on the bike and pedal at a steady pace for the set time.",
  "Rowing machine": "Sit on the rower, feet strapped in, handle in both hands. Push with your legs, then pull the handle to your stomach, leaning back slightly. Reverse the motion to return.",
  "Elliptical": "Stand on the pedals and hold the handles, moving your legs and arms in a smooth, walking-like motion for the set time.",
  "Stair climber": "Step onto the machine and climb at a steady pace, like walking up stairs, for the set time.",
  "Jump rope": "Hold one handle in each hand, swing the rope over your head and jump over it as it passes under your feet.",
  "Child's pose": "Kneel on the floor, then sit back onto your heels and stretch your arms forward, lowering your chest toward the ground. Hold and breathe.",
  "Hip flexor stretch": "Kneel on one knee with the other foot planted in front of you. Gently push your hips forward until you feel a stretch in the front of your hip. Hold, then switch sides.",
  "Hamstring stretch": "Sit or stand with one leg extended in front of you, heel on the floor. Hinge forward at your hips, reaching toward your toes, keeping your back flat. Hold, then switch sides.",
  "Couch stretch": "Kneel in front of a couch or bench with your back foot resting on it behind you. Push your hips forward gently until you feel a stretch in the front of your thigh. Hold, then switch sides.",
  "World's greatest stretch": "Step forward into a lunge, place both hands on the floor inside your front foot, then rotate one arm up toward the ceiling, opening your chest. Return and repeat, then switch sides.",
  "Thoracic rotation": "Get on all fours, place one hand behind your head. Rotate your upper body, bringing that elbow up toward the ceiling, then back down under your body. Repeat, then switch sides.",
  "Incline dumbbell press": "Set the bench to a 30-45° incline. Start with dumbbells at upper-chest height, elbows around 45° out. Press up and slightly back until arms extend, then lower with control. Feet planted, core tight throughout.",
  "Pull-up": "Hang from a bar with hands wider than shoulders, palms facing away. Pull your body up until your chin clears the bar, then lower back down with control.",
  "Single-arm dumbbell row": "Place one knee and hand on a bench, holding a dumbbell in the other hand hanging down. Pull it up to your side, squeezing your back, then lower back down. Finish, then switch sides.",
  "Dumbbell lateral raise": "Stand holding a dumbbell in each hand at your sides. Raise them out to the sides up to shoulder height, then lower back down.",
  "Dumbbell shoulder press": "Stand or sit holding a dumbbell in each hand at shoulder height. Press them straight overhead until your arms extend, then lower back down.",
  "Arnold press": "Sit holding dumbbells in front of your shoulders, palms facing you. As you press overhead, rotate your palms to face forward. Reverse the rotation as you lower back down.",
  "Romanian deadlift": "Stand holding a bar or dumbbells in front of your thighs. Keeping your legs mostly straight, hinge at your hips to lower the weight down your legs, then stand back up.",
  "Bulgarian split squat": "Stand a couple feet in front of a bench, resting one foot behind you on it. Bend your front knee to lower down, then push back up. Finish, then switch legs.",
  "Bodyweight calf raise": "Stand with feet flat on the floor. Rise up onto your toes as high as you can, then lower back down.",
  "Cat-cow": "Get on all fours. Arch your back and drop your belly toward the floor while lifting your head (cow), then round your spine up toward the ceiling while tucking your chin (cat). Move slowly between the two.",
  "Pigeon pose": "From all fours, bring one knee forward and place it behind your wrist, extending the other leg straight back. Lower your body forward over your front leg. Hold, then switch sides.",
  "Rear Delt Fly": "Bend forward slightly holding a dumbbell in each hand. Raise your arms out to the sides until level with your shoulders, then lower back down.",
  "Incline Bicep Curl": "Sit on an incline bench, arms hanging straight down holding dumbbells. Curl them up toward your shoulders, then lower back down.",
  "Tricep Overhead Extension": "Stand or sit holding a dumbbell with both hands overhead. Lower it behind your head by bending your elbows, then straighten your arms back up.",
  "Dumbbell Hip Thrust": "Sit on the floor with your upper back against a bench, a dumbbell resting on your hips. Push through your heels to lift your hips up, then lower back down.",
  "Donkey Kick": "Get on all fours. Keeping your knee bent, kick one leg up and back toward the ceiling, then lower back down. Finish, then switch legs.",
  "Dumbbell Step-up": "Stand facing a bench or box, holding a dumbbell in each hand. Step up onto it with one foot, then bring the other foot up to join it. Step back down and repeat.",
  "Plank": "Get into a push-up position, but rest on your forearms instead of your hands. Keep your body in a straight line and hold.",
  "Weighted Sit-up": "Lie on your back, knees bent, holding a weight against your chest. Curl your whole upper body up toward your knees, then lower back down.",
  "Treadmill (zone 2)": "Walk or jog at a pace where you can still hold a conversation, for the set amount of time.",
  "Frogger Stretch": "Get on all fours, then widen your knees out to the sides. Rock your hips backward and forward slowly to feel a stretch in your inner thighs.",
  "Deep Squat Hold": "Lower into a full squat, feet flat on the floor, and simply hold that position, letting your hips sink low.",
  "Standing Forward Hold": "Stand with feet hip-width apart, then bend forward at your hips and let your upper body hang down toward your toes. Hold and relax.",
  "Seated Single Leg Stretch": "Sit with one leg extended straight out, the other bent with your foot near your inner thigh. Reach toward the toes of your straight leg. Hold, then switch sides.",
  "Thread the needle": "Get on all fours. Slide one arm underneath your body and through the gap between your other arm and leg, lowering your shoulder to the floor. Hold, then switch sides.",
  "Barbell hip thrust": "Sit on the floor with your upper back against a bench, a bar resting across your hips. Push through your heels to lift your hips up, then lower back down.",
};

/* ─── STATE ─── */
let schedule = JSON.parse(JSON.stringify(DEFAULT_DAYS));
let library  = JSON.parse(JSON.stringify(DEFAULT_LIBRARY));
let currentDay = DAY_NAMES[new Date().getDay()];
let dayEditMode = false;
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
const THEME_COLORS = { light: '#f4efe6', dark: '#0f1817', matrix: '#020503', mdnt: '#000000' };
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

      // Dismiss day dropdown / day menu when clicking/tapping outside them
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.day-header')) { closeDayPicker(); closeDayMenu(); }
      });

      const vEl = document.getElementById('settings-version');
      if (vEl) vEl.textContent = APP_VERSION || '…';
      loadAppVersion();

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
/* ─── LIBRARY (V2) — not yet wired to day-logging ─── */
let libv2ActiveGroup = null;
let libv2ActiveSub = null;

function libv2SelectGroup(key) {
  libv2ActiveGroup = (libv2ActiveGroup === key) ? null : key;
  libv2ActiveSub = null; // reset sub-filter when gross group changes
  renderLibV2();
}
function libv2SelectSub(sub) {
  if (libv2ActiveSub === sub) {
    libv2ActiveSub = null;
  } else {
    libv2ActiveSub = sub;
    // Auto-select the parent gross group, so tapping a sub-tile directly
    // highlights its gross group and narrows the sub-row to match.
    const parent = MUSCLE_GROUPS_V2.find(g => g.subs.includes(sub));
    if (parent) libv2ActiveGroup = parent.key;
  }
  renderLibV2();
}
function renderLibV2() {
  const groupRow = document.getElementById('libv2-group-row');
  const subRow = document.getElementById('libv2-sub-row');
  const tilesEl = document.getElementById('libv2-tiles');

  groupRow.innerHTML = MUSCLE_GROUPS_V2.map(g =>
    `<button class="libv2-chip${g.key===libv2ActiveGroup?' libv2-tint-'+g.color+' active':''}" onclick="libv2SelectGroup('${g.key}')">${g.label}</button>`
  ).join('');

  // Sub-row: show only the active group's subs if one is selected, otherwise
  // every sub-region across every group, tinted by its parent group's color.
  const activeGroupObj = MUSCLE_GROUPS_V2.find(g => g.key === libv2ActiveGroup);
  const subsToShow = activeGroupObj
    ? activeGroupObj.subs.map(s => ({ sub: s, color: activeGroupObj.color }))
    : MUSCLE_GROUPS_V2.flatMap(g => g.subs.map(s => ({ sub: s, color: g.color })));

  subRow.innerHTML = subsToShow.map(({sub, color}) =>
    `<button class="libv2-chip libv2-chip-sub libv2-tint-${color}${sub===libv2ActiveSub?' active':''}" onclick="libv2SelectSub('${escAttr(sub)}')">${escHtml(sub)}</button>`
  ).join('');

  // Exercise grid: show everything by default, narrowing as filters are applied.
  let filtered = DEFAULT_LIBRARY_V2;
  if (libv2ActiveGroup) filtered = filtered.filter(ex => ex.group === libv2ActiveGroup);
  if (libv2ActiveSub) filtered = filtered.filter(ex => ex.sub === libv2ActiveSub);

  if (!filtered.length) {
    tilesEl.innerHTML = '<div class="empty">No exercises match this filter yet.</div>';
    return;
  }
  tilesEl.innerHTML = filtered.map(ex => `
    <div class="libv2-tile" onclick="openExerciseDetail('${escAttr(ex.name).replace(/'/g, "\\'")}')">
      <div class="libv2-tile-name">${escHtml(ex.name)}</div>
      <div class="libv2-tile-tags">${escHtml(ex.sub)} · ${escHtml(ex.reps)} reps · ${escHtml(ex.rest)} rest</div>
    </div>
  `).join('');
}

/* ─── EXERCISE DETAIL POPUP ─── */
function sisterLabel(name) {
  const keywords = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Seated'];
  for (const kw of keywords) {
    if (name.toLowerCase().includes(kw.toLowerCase())) return kw;
  }
  return name.split(' ')[0];
}
function openExerciseDetail(name) {
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === name);
  if (!ex) return;
  const blurb = EXERCISE_BLURBS[name] || 'No description yet.';
  const sister = getSisterOf(name);
  document.getElementById('ex-detail-title').textContent = name.toUpperCase();
  document.getElementById('ex-detail-blurb').textContent = blurb;
  const sisterBtn = document.getElementById('ex-detail-sister-btn');
  if (sister) {
    sisterBtn.style.visibility = 'visible';
    sisterBtn.textContent = `See ${sisterLabel(sister)} version`;
    sisterBtn.onclick = () => openExerciseDetail(sister);
  } else {
    sisterBtn.style.visibility = 'hidden';
  }
  document.getElementById('ex-detail-add-btn').onclick = () => addExerciseToDayFromLibrary(ex);
  document.getElementById('ex-detail-wrap').classList.add('show');
}
function closeExerciseDetail() {
  document.getElementById('ex-detail-wrap').classList.remove('show');
}
function addExerciseToDayFromLibrary(ex) {
  // Placeholder — actual "add to current day" wiring comes later.
  closeExerciseDetail();
}

function switchTab(tab) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-' + tab).classList.add('active');
  ['log','history','library','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none'; });
  if (tab === 'history') renderHistory();
  else if (tab === 'library') {
    renderLibV2();
    document.getElementById('log-back-btn')?.classList.remove('show');
    requestAnimationFrame(() => renderLibV2()); // safety re-render once tab is actually visible
  }
  else if (tab === 'clock') { ensureClockBuilt(); document.getElementById('log-back-btn')?.classList.remove('show'); }
  else { destroyCharts(); document.getElementById('log-back-btn')?.classList.remove('show'); }
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
function toggleDayPicker() {
  const dd = document.getElementById('day-dropdown');
  const picker = document.getElementById('day-picker-btn');
  if (!dd) return;
  closeDayMenu();
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
function selectDay(d) { flushInputs(); currentDay = d; dayEditMode = false; closeDayPicker(); renderDayContent(); }

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

function renderDayContent() {
  const d = currentDay, day = schedule[d];
  const container = document.getElementById('day-content');
  const labelSuffix = day.label.includes('—') ? day.label.replace(/^.+?—\s*/, '') : '';
  const u = currentUnits;

  const dayDropdownItems = DAY_NAMES.map(dn =>
    `<div class="day-dropdown-item${dn===d?' active':''}${schedule[dn].restDay?' rest-day':''}" onclick="selectDay('${dn}')">${FULL_DAYS[dn]}</div>`
  ).join('');

  const titleHtml = dayEditMode
    ? `<input class="day-title-input" value="${escAttr(labelSuffix)}" placeholder="Add workout title..."
        oninput="schedule['${d}'].label=FULL_DAYS['${d}']+' — '+this.value;saveSchedule()">`
    : `<div class="day-title-input day-title-readonly">${labelSuffix ? escHtml(labelSuffix) : '<span class="day-title-placeholder">Add workout title…</span>'}</div>`;

  const top = `
    <div class="day-header">
      <button class="day-picker" id="day-picker-btn" onclick="toggleDayPicker()">
        <span class="day-abbr">${FULL_DAYS[d]}</span>
        <svg class="day-picker-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="day-dropdown" id="day-dropdown">${dayDropdownItems}</div>
      ${titleHtml}
      ${dayEditMode ? '<div class="edit-mode-badge">Editing</div>' : ''}
      <button class="day-menu-btn" id="day-menu-btn" onclick="toggleDayMenu()" aria-label="Day options">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      <div class="day-menu-dropdown" id="day-menu-dropdown">
        <button class="day-menu-item" onclick="closeDayMenu();toggleDayEditMode()">${dayEditMode?'Done editing':'Edit workout'}</button>
        <button class="day-menu-item" onclick="closeDayMenu();toggleRestDay()">${day.restDay?'Mark as workout day':'Mark as rest day'}</button>
        <button class="day-menu-item" onclick="closeDayMenu();confirmCopyDay()">Copy to all days</button>
        <button class="day-menu-item" onclick="closeDayMenu();confirmClearSession()">Clear session</button>
      </div>
    </div>`;

  if (day.restDay) {
    container.innerHTML = top + `<div class="rest-screen"><p>Rest day — enjoy your recovery.</p><button class="btn" style="padding:8px 16px;border:1px solid var(--border2);border-radius:999px;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-weight:500" onclick="toggleRestDay()">Mark as workout day</button></div>`;
    return;
  }

  const exCards = day.exercises.length === 0
    ? (dayEditMode
        ? '<div class="empty">No exercises yet — tap “+ Add exercise” below to pick one from your library.</div>'
        : '<div class="empty">No exercises yet — tap the ••• menu above and choose “Edit workout” to add some.</div>')
    : day.exercises.map((ex, i) => {
        const data = getSetData(d, i);
        const meta = [ex.reps ? ex.reps + ' reps' : '', ex.sets ? ex.sets + ' sets' : '', (ex.type==='custom'&&ex.duration) ? ex.duration : '', ex.rest ? ex.rest + ' rest' : ''].filter(Boolean).join(' · ');
        const noteHtml = ex.note ? `<div class="ex-note">${escHtml(ex.note)}</div>` : '';

        if (ex.type === 'custom') {
          return `<div class="exercise-card${data.logged?' is-logged':''}" data-idx="${i}">
            <div class="ex-head">
              ${dayEditMode?'<span class="ex-drag">⠿</span>':''}
              <div class="ex-head-text">
              <div class="ex-name" onclick="openExerciseHistory('${escAttr(ex.exId || ex.name).replace(/'/g, "\\'")}')">${escHtml(ex.name)}</div>
                ${meta?`<div class="ex-meta">${meta}</div>`:''}
                ${noteHtml}
              </div>
              ${dayEditMode?`<button class="ex-x" onclick="removeExercise('${d}',${i})" aria-label="Remove">✕</button>`:''}
            </div>
          </div>`;
        }

        // Set number = (number of sets already logged today for this exercise) + 1
        const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' });
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
            ${dayEditMode?'<span class="ex-drag">⠿</span>':''}
            <div class="ex-head-text">
              <div class="ex-name" onclick="openExerciseHistory('${escAttr(ex.exId || ex.name).replace(/'/g, "\\'")}')">${escHtml(ex.name)}</div>
              ${meta?`<div class="ex-meta">${meta}</div>`:''}
              ${noteHtml}
            </div>
            ${dayEditMode?`<button class="ex-x" onclick="removeExercise('${d}',${i})" aria-label="Remove">✕</button>`:''}
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

  const addBtn = dayEditMode ? `<button class="add-exercise-btn" onclick="openLibSheet('${d}')">+ Add exercise</button>` : '';
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
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' });
  const hist = getHistory();
  if (!hist[today]) hist[today] = [];
  const ex = schedule[d].exercises[idx];
  const bw = ex.type === 'bodyweight' ? getCleanBw() : null;
  const newSets = valid.map(s => {
    const weight = s.weight !== '' ? Number(s.weight)||0 : (bw != null ? bw : 0);
    return { reps: Number(s.reps)||0, weight };
  });
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
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' });
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
