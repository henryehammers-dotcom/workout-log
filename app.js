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
  libraryV2: 'wl_library_v2',
  blurbsV2:  'wl_blurbs_v2',
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
const DEFAULT_LIBRARY_V2_BASE = [
  {name:"Incline Barbell Bench Press", group:"chest", sub:"Upper chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"2amry"},
  {name:"Low-To-High Cable Fly", group:"chest", sub:"Upper chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"0w9h7"},
  {name:"Barbell Bench Press", group:"chest", sub:"Mid chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"isr4t"},
  {name:"Dumbbell Bench Press", group:"chest", sub:"Mid chest", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell", id:"hbux8"},
  {name:"Push-Up", group:"chest", sub:"Mid chest", reps:"10-20", rest:"60 sec", restSecs:60, type:"bodyweight", id:"96te4"},
  {name:"Flat Cable Fly", group:"chest", sub:"Mid chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"rvpg1"},
  {name:"Decline Barbell Bench Press", group:"chest", sub:"Lower chest", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"g3f58"},
  {name:"Dips", group:"chest", sub:"Lower chest", reps:"8-15", rest:"90 sec", restSecs:90, type:"bodyweight", id:"5ka8e"},
  {name:"Decline Dumbbell Press", group:"chest", sub:"Lower chest", reps:"8-12", rest:"2 min", restSecs:120, type:"dumbbell", id:"7khny"},
  {name:"High-To-Low Cable Fly", group:"chest", sub:"Lower chest", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"14iif"},
  {name:"Lat Pulldown", group:"back", sub:"Lats", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym", id:"tbyoj"},
  {name:"Barbell Row", group:"back", sub:"Lats", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"e3xwn"},
  {name:"Straight-Arm Pulldown", group:"back", sub:"Lats", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"pj6dk"},
  {name:"Barbell Shrug", group:"back", sub:"Traps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym", id:"1dihs"},
  {name:"Dumbbell Shrug", group:"back", sub:"Traps", reps:"10-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"wdin1"},
  {name:"Farmer's Carry", group:"back", sub:"Traps", reps:"30-45 sec", rest:"90 sec", restSecs:90, type:"dumbbell", id:"qian2"},
  {name:"Face Pull", group:"back", sub:"Traps", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"w7q9t"},
  {name:"Deadlift", group:"back", sub:"Lower back", reps:"4-8", rest:"2 min", restSecs:120, type:"gym", id:"vgvgq"},
  {name:"Back Extension", group:"back", sub:"Lower back", reps:"12-15", rest:"60 sec", restSecs:60, type:"bodyweight", id:"3jphz"},
  {name:"Good Morning", group:"back", sub:"Lower back", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym", id:"9d8n8"},
  {name:"Seated Cable Row", group:"back", sub:"Rhomboids", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym", id:"y7nqm"},
  {name:"Chest-Supported Row", group:"back", sub:"Rhomboids", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell", id:"4rvhw"},
  {name:"Reverse Pec Deck", group:"back", sub:"Rhomboids", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"prjbp"},
  {name:"Bent-Over Rear Delt Row", group:"back", sub:"Rhomboids", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"6jlbx"},
  {name:"Barbell Overhead Press", group:"shoulders", sub:"Front delts", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"ftbdr"},
  {name:"Front Raise", group:"shoulders", sub:"Front delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"d2wfq"},
  {name:"Cable Lateral Raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"qdwmt"},
  {name:"Machine Lateral Raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"zzgf4"},
  {name:"Upright Row", group:"shoulders", sub:"Side delts", reps:"10-12", rest:"60 sec", restSecs:60, type:"gym", id:"06gow"},
  {name:"Reverse Pec Deck (Delts)", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"qxyjr"},
  {name:"Bent-Over Dumbbell Raise", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"dumbbell", id:"8ylke"},
  {name:"Cable Rear Delt Fly", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"qt9ug"},
  {name:"Barbell Curl", group:"arms", sub:"Biceps", reps:"8-12", rest:"60 sec", restSecs:60, type:"gym", id:"q6r23"},
  {name:"Dumbbell Curl", group:"arms", sub:"Biceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"38h9s"},
  {name:"Hammer Curl", group:"arms", sub:"Biceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"u2oux"},
  {name:"Cable Curl", group:"arms", sub:"Biceps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym", id:"wvb43"},
  {name:"Cable Tricep Pushdown", group:"arms", sub:"Triceps", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym", id:"bhn7l"},
  {name:"Close-Grip Bench Press", group:"arms", sub:"Triceps", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"g39x4"},
  {name:"Skull Crusher", group:"arms", sub:"Triceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"gym", id:"eejic"},
  {name:"Overhead Tricep Extension", group:"arms", sub:"Triceps", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", id:"w8upx"},
  {name:"Dumbbell Wrist Curl", group:"arms", sub:"Forearms", reps:"12-20", rest:"45 sec", restSecs:45, type:"dumbbell", id:"h2hjc"},
  {name:"Reverse Wrist Curl", group:"arms", sub:"Forearms", reps:"12-20", rest:"45 sec", restSecs:45, type:"dumbbell", id:"hkx0e"},
  {name:"Cable Crunch", group:"core", sub:"Upper abs", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"ze3jw"},
  {name:"Sit-Up", group:"core", sub:"Upper abs", reps:"15-20", rest:"45 sec", restSecs:45, type:"bodyweight", id:"7aw2p"},
  {name:"Machine Crunch", group:"core", sub:"Upper abs", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"5oynt"},
  {name:"Hanging Leg Raise", group:"core", sub:"Lower abs", reps:"10-15", rest:"60 sec", restSecs:60, type:"bodyweight", id:"rck6u"},
  {name:"Reverse Crunch", group:"core", sub:"Lower abs", reps:"12-15", rest:"45 sec", restSecs:45, type:"bodyweight", id:"92b2z"},
  {name:"Leg Raise", group:"core", sub:"Lower abs", reps:"12-15", rest:"45 sec", restSecs:45, type:"bodyweight", id:"4wvqi"},
  {name:"Dumbbell Side Bend", group:"core", sub:"Obliques", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell", id:"g7vnk"},
  {name:"Russian Twist", group:"core", sub:"Obliques", reps:"15-20", rest:"45 sec", restSecs:45, type:"bodyweight", id:"ihuhx"},
  {name:"Cable Woodchopper", group:"core", sub:"Obliques", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym", id:"mxace"},
  {name:"Side Plank", group:"core", sub:"Obliques", reps:"30-45 sec", rest:"45 sec", restSecs:45, type:"bodyweight", id:"2we8g"},
  {name:"Barbell Squat", group:"legs", sub:"Quads", reps:"6-10", rest:"2 min", restSecs:120, type:"gym", id:"jcrnh"},
  {name:"Leg Press", group:"legs", sub:"Quads", reps:"8-12", rest:"2 min", restSecs:120, type:"gym", id:"zu5bw"},
  {name:"Dumbbell Goblet Squat", group:"legs", sub:"Quads", reps:"10-15", rest:"90 sec", restSecs:90, type:"dumbbell", id:"0k96z"},
  {name:"Bodyweight Squat", group:"legs", sub:"Quads", reps:"15-25", rest:"60 sec", restSecs:60, type:"bodyweight", id:"7br31"},
  {name:"Leg Extension", group:"legs", sub:"Quads", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"1c206"},
  {name:"Leg Curl", group:"legs", sub:"Hamstrings", reps:"10-15", rest:"60 sec", restSecs:60, type:"gym", id:"0jovp"},
  {name:"Good Morning (Legs)", group:"legs", sub:"Hamstrings", reps:"8-12", rest:"90 sec", restSecs:90, type:"gym", id:"wz0ar"},
  {name:"Nordic Curl", group:"legs", sub:"Hamstrings", reps:"6-10", rest:"90 sec", restSecs:90, type:"bodyweight", id:"2z6wj"},
  {name:"Barbell Hip Thrust", group:"legs", sub:"Glutes", reps:"8-12", rest:"2 min", restSecs:120, type:"gym", id:"3n20d"},
  {name:"Glute Bridge", group:"legs", sub:"Glutes", reps:"15-20", rest:"60 sec", restSecs:60, type:"bodyweight", id:"h9ve3"},
  {name:"Cable Kickback", group:"legs", sub:"Glutes", reps:"12-15", rest:"60 sec", restSecs:60, type:"gym", id:"81fuj"},
  {name:"Seated Calf Raise", group:"legs", sub:"Calves", reps:"12-20", rest:"60 sec", restSecs:60, type:"gym", id:"ikyui"},
  {name:"Cable Adduction", group:"legs", sub:"Adductors", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym", id:"sw8nh"},
  {name:"Sumo Squat", group:"legs", sub:"Adductors", reps:"10-15", rest:"90 sec", restSecs:90, type:"dumbbell", id:"99065"},
  {name:"Cable Abduction", group:"legs", sub:"Abductors", reps:"12-15", rest:"45 sec", restSecs:45, type:"gym", id:"li8rs"},
  {name:"Lateral Band Walk", group:"legs", sub:"Abductors", reps:"12-15 steps", rest:"45 sec", restSecs:45, type:"bodyweight", id:"s4rlo"},
  {name:"Stationary Bike", group:"cardio", reps:"20-30 min", rest:"n/a", restSecs:0, type:"custom", id:"q8leu"},
  {name:"Rowing Machine", group:"cardio", reps:"15-20 min", rest:"n/a", restSecs:0, type:"custom", id:"xy40z"},
  {name:"Elliptical", group:"cardio", reps:"20-30 min", rest:"n/a", restSecs:0, type:"custom", id:"djq1c"},
  {name:"Stair Climber", group:"cardio", reps:"15-20 min", rest:"n/a", restSecs:0, type:"custom", id:"q8j2g"},
  {name:"Jump Rope", group:"cardio", reps:"5-10 min", rest:"60 sec", restSecs:60, type:"bodyweight", id:"56r6t"},
  {name:"Child's Pose", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"qy9vb"},
  {name:"Hip Flexor Stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"ejhhk"},
  {name:"Hamstring Stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"t0u1d"},
  {name:"Couch Stretch", group:"mobility", reps:"30-60 sec", rest:"30 sec", restSecs:30, type:"bodyweight", id:"hkzs9"},
  {name:"World's Greatest Stretch", group:"mobility", reps:"5-8 reps", rest:"30 sec", restSecs:30, type:"bodyweight", id:"n7wb5"},
  {name:"Thoracic Rotation", group:"mobility", reps:"10-12 reps", rest:"30 sec", restSecs:30, type:"bodyweight", id:"1z3ym"},
  {name:"Dumbbell Incline Bench Press", group:"chest", sub:"Upper chest", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", sets:3, id:"24e8a"},
  {name:"Dumbbell Chest Fly", group:"chest", sub:"Upper chest", reps:"8-10", rest:"90 sec", restSecs:90, type:"dumbbell", sets:3, id:"rkmkf"},
  {name:"Pull-Up", group:"back", sub:"Lats", reps:"3-5", rest:"75 sec", restSecs:75, type:"bodyweight", sets:3, id:"5965m"},
  {name:"Dumbbell Row", group:"back", sub:"Lats", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", sets:2, id:"rnvlx"},
  {name:"Dumbbell Lateral Raise", group:"shoulders", sub:"Side delts", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell", sets:3, id:"c86i0"},
  {name:"Dumbbell Shoulder Press", group:"shoulders", sub:"Front delts", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", sets:3, id:"6mxt7"},
  {name:"Arnold Press", group:"shoulders", sub:"Front delts", reps:"10-12", rest:"60 sec", restSecs:60, type:"dumbbell", sets:3, id:"hh1qr"},
  {name:"Dumbbell Romanian Deadlift", group:"legs", sub:"Hamstrings", reps:"10-12", rest:"75 sec", restSecs:75, type:"dumbbell", sets:3, id:"0yilr"},
  {name:"Bulgarian Split Squat", group:"legs", sub:"Glutes", reps:"8-12", rest:"90 sec", restSecs:90, type:"dumbbell", sets:3, id:"i5pkg"},
  {name:"Bodyweight Calf Raise", group:"legs", sub:"Calves", reps:"15-20", rest:"30 sec", restSecs:30, type:"bodyweight", sets:2, id:"i4vm1"},
  {name:"Cat-Cow", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"10 slow reps", id:"7a9nr"},
  {name:"Pigeon Pose", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"90 sec/side", id:"xcamg"},
  {name:"Rear Delt Fly", group:"shoulders", sub:"Rear delts", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell", sets:2, id:"56r6p"},
  {name:"Incline Bicep Curl", group:"arms", sub:"Biceps", reps:"8-10", rest:"90 sec", restSecs:90, type:"dumbbell", sets:3, id:"onkz4"},
  {name:"Tricep Overhead Extension", group:"arms", sub:"Triceps", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell", sets:2, id:"z6w58"},
  {name:"Dumbbell Hip Thrust", group:"legs", sub:"Glutes", reps:"10-12", rest:"75 sec", restSecs:75, type:"dumbbell", sets:3, id:"3y5au"},
  {name:"Donkey Kick", group:"legs", sub:"Glutes", reps:"12-15", rest:"30 sec", restSecs:30, type:"bodyweight", sets:3, id:"imbd8"},
  {name:"Dumbbell Step-Up", group:"legs", sub:"Quads", reps:"10-12", rest:"90 sec", restSecs:90, type:"dumbbell", sets:3, id:"vevtf"},
  {name:"Plank", group:"core", sub:"Upper abs", reps:"", rest:"45 sec", restSecs:45, type:"custom", sets:2, duration:"45 sec", id:"8safy"},
  {name:"Weighted Sit-Up", group:"core", sub:"Upper abs", reps:"12-15", rest:"45 sec", restSecs:45, type:"dumbbell", sets:3, id:"eqsyw"},
  {name:"Treadmill (Zone 2)", group:"cardio", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"30 min", id:"m4lol"},
  {name:"Frogger Stretch", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"60-90 sec/side", id:"r52g0"},
  {name:"Deep Squat Hold", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"60-90 sec", id:"4onlx"},
  {name:"Standing Forward Hold", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"60-90 sec", id:"eozgw"},
  {name:"Seated Single Leg Stretch", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"60-90 sec/side", id:"9ta3l"},
  {name:"Thread The Needle", group:"mobility", reps:"", rest:"90 sec", restSecs:90, type:"custom", sets:0, duration:"60-90 sec/side", id:"ih0qk"},
];

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
    if (saved) DEFAULT_LIBRARY_V2 = JSON.parse(saved);
  } catch {}
}
// Generates an ID guaranteed not to collide with any existing exercise ID —
// genId() alone is extremely unlikely to collide, but this makes it certain.
function genLibV2Id() {
  let id;
  do { id = genId(); } while (DEFAULT_LIBRARY_V2.some(e => e.id === id));
  return id;
}

// Sister-variant chains: same movement, different equipment. Clicking "See X version"
// on any exercise in a chain advances to the next one, wrapping back to the first.
const SISTER_CHAINS = [
  ["2amry", "24e8a"],
  ["isr4t", "hbux8"],
  ["g3f58", "7khny"],
  ["1dihs", "wdin1"],
  ["ftbdr", "6mxt7"],
  ["3n20d", "3y5au"],
  ["i4vm1", "ikyui"],
  ["7aw2p", "eqsyw"],
  ["jcrnh", "0k96z", "7br31"],
  ["qdwmt", "c86i0", "zzgf4"],
  ["q6r23", "38h9s", "u2oux", "wvb43"],
  ["e3xwn", "rnvlx", "y7nqm", "4rvhw"],
];
function getSisterOf(name) {
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === name);
  if (!ex || !ex.id) return null;
  for (const chain of SISTER_CHAINS) {
    const i = chain.indexOf(ex.id);
    if (i !== -1) {
      const sisterId = chain[(i + 1) % chain.length];
      const sisterEx = DEFAULT_LIBRARY_V2.find(e => e.id === sisterId);
      return sisterEx ? sisterEx.name : null;
    }
  }
  return null;
}

// Blurbs, keyed by exact exercise name. Filled in incrementally.
const EXERCISE_BLURBS = {
  "Incline Barbell Bench Press": "Set the bench to a 30-45° incline, grip the bar slightly wider than shoulder-width. Lower it to your upper chest with elbows at ~45°, then press up until arms extend. Feet planted, core tight throughout.",
  "Dumbbell Incline Bench Press": "Set the bench to a 30-45° incline. Start with dumbbells at upper-chest height, elbows around 45° out. Press up and slightly back until arms extend, then lower with control. Feet planted, core tight throughout.",
  "Dumbbell Chest Fly": "Lie on an incline bench, dumbbells pressed straight up, palms facing in. Lower them out to the sides in a wide arc, slight elbow bend. Bring back up, squeezing chest at the top.",
  "Low-To-High Cable Fly": "Stand between two low cable pulleys, handle in each hand. Bring your hands up and together in front of your chest in a wide arc, like hugging a big ball. Slowly let them back down.",
  "Barbell Bench Press": "Lie flat on a bench, bar above your chest, hands slightly wider than shoulders. Lower the bar to your chest, then push it back up until your arms straighten.",
  "Dumbbell Bench Press": "Lie flat on a bench holding a dumbbell in each hand above your chest. Lower them down to chest level, elbows bent, then push back up.",
  "Push-Up": "Start face-down, hands under shoulders, body in a straight line. Lower your chest to the floor by bending your elbows, then push back up.",
  "Flat Cable Fly": "Stand between two cable pulleys set at chest height. Bring your hands together in front of you in a hugging motion, then let them back out slowly.",
  "Decline Barbell Bench Press": "Lie on a bench angled downward, feet higher than your head. Lower the bar to your lower chest, then press it back up.",
  "Dips": "Grip two parallel bars, arms straight, body hanging. Lower yourself by bending your elbows until your upper arms are about parallel to the floor, then push back up.",
  "Decline Dumbbell Press": "Lie on a bench angled downward, holding a dumbbell in each hand above your lower chest. Lower them down, then press back up.",
  "High-To-Low Cable Fly": "Stand between two cable pulleys set above your head. Pull your hands down and together in front of your hips, then let them back up slowly.",
  "Lat Pulldown": "Sit at the machine, grab the bar wide overhead. Pull it down to your upper chest, squeezing your back, then let it rise back up with control.",
  "Barbell Row": "Bend forward at the hips holding a bar, back flat. Pull the bar up to your stomach, squeezing your back, then lower it back down.",
  "Straight-Arm Pulldown": "Stand facing a high cable, arms straight down in front of you holding the bar. Pull it down to your thighs keeping arms straight, then let it rise back up.",
  "Barbell Shrug": "Stand holding a bar in front of you, arms straight. Lift your shoulders straight up toward your ears, then lower them back down.",
  "Dumbbell Shrug": "Stand holding a dumbbell in each hand at your sides. Lift your shoulders straight up toward your ears, then lower them back down.",
  "Farmer's Carry": "Pick up a heavy dumbbell or weight in each hand and simply walk forward for the set distance or time, keeping your shoulders back and core tight.",
  "Face Pull": "Stand facing a cable set at head height with a rope handle. Pull the rope toward your face, elbows out wide, then let it back out slowly.",
  "Deadlift": "Stand with feet hip-width apart, bar on the floor in front of you. Bend at your hips and knees to grip it, then stand up tall by pushing through your feet, keeping the bar close to your legs.",
  "Back Extension": "Lie face-down on the machine with your hips on the pad, ankles secured. Lower your upper body down, then lift back up until your body is straight.",
  "Good Morning": "Stand with a bar across your upper back. Keeping your legs mostly straight, bend forward at the hips until your torso is close to parallel with the floor, then stand back up.",
  "Seated Cable Row": "Sit at the machine, feet braced, grab the handle with arms extended. Pull it toward your stomach, squeezing your back, then let it extend back out.",
  "Chest-Supported Row": "Lie face-down on an inclined bench holding dumbbells hanging below you. Pull them up toward your sides, squeezing your back, then lower back down.",
  "Reverse Pec Deck": "Sit at the machine facing the pad, arms out in front holding the handles. Pull your arms back and out to the sides, squeezing your shoulder blades, then return slowly.",
  "Bent-Over Rear Delt Row": "Bend forward at the hips holding dumbbells hanging below you. Pull your elbows up and out to the sides, then lower back down.",
  "Barbell Overhead Press": "Stand holding a bar at shoulder height. Press it straight overhead until your arms are extended, then lower it back to your shoulders.",
  "Front Raise": "Stand holding a dumbbell in each hand at your sides. Raise them straight out in front of you to shoulder height, then lower back down.",
  "Cable Lateral Raise": "Stand sideways to a low cable pulley, handle in the hand farthest from the machine. Raise your arm out to the side to shoulder height, then lower back down.",
  "Machine Lateral Raise": "Sit at the machine, arms inside the pads at your sides. Push your arms out and up to the sides, then lower back down.",
  "Upright Row": "Stand holding a bar or dumbbells in front of your thighs. Pull it straight up toward your chin, elbows leading and out to the sides, then lower back down.",
  "Reverse Pec Deck (Delts)": "Sit at the machine facing the pad, arms out in front holding the handles. Pull your arms back and out to the sides, squeezing your shoulder blades, then return slowly.",
  "Bent-Over Dumbbell Raise": "Bend forward at the hips holding dumbbells hanging below you. Raise your arms out to the sides until level with your shoulders, then lower back down.",
  "Cable Rear Delt Fly": "Stand facing a cable machine with the handles crossed at chest height. Pull your arms out and back to the sides, then return slowly to the front.",
  "Barbell Curl": "Stand holding a bar with palms facing forward, arms extended. Curl the bar up toward your shoulders, then lower it back down.",
  "Dumbbell Curl": "Stand holding a dumbbell in each hand, arms at your sides, palms facing forward. Curl them up toward your shoulders, then lower back down.",
  "Hammer Curl": "Stand holding a dumbbell in each hand, palms facing your body. Curl them up toward your shoulders, then lower back down.",
  "Cable Curl": "Stand facing a low cable with a bar attachment, arms extended down. Curl it up toward your shoulders, then lower back down with control.",
  "Cable Tricep Pushdown": "Stand facing a high cable with a bar or rope attachment, elbows tucked at your sides. Push the bar down until your arms are straight, then let it rise back up.",
  "Close-Grip Bench Press": "Lie flat on a bench, hands close together on the bar, just inside shoulder width. Lower the bar to your chest, then push it back up.",
  "Skull Crusher": "Lie on a bench holding a bar or dumbbells above your forehead, elbows pointing up. Bend your elbows to lower the weight toward your forehead, then straighten back up.",
  "Overhead Tricep Extension": "Stand or sit holding a dumbbell with both hands overhead. Lower it behind your head by bending your elbows, then straighten your arms back up.",
  "Dumbbell Wrist Curl": "Sit with your forearm resting on your thigh, palm up, holding a light dumbbell. Curl your wrist up, then lower back down.",
  "Reverse Wrist Curl": "Sit with your forearm resting on your thigh, palm down, holding a light dumbbell. Curl your wrist up, then lower back down.",
  "Cable Crunch": "Kneel facing away from a high cable, rope behind your head. Curl your body forward, bringing your elbows toward your knees, then return slowly.",
  "Sit-Up": "Lie on your back, knees bent, feet flat on the floor. Curl your whole upper body up toward your knees, then lower back down.",
  "Machine Crunch": "Sit at the machine with pads against your chest or shoulders. Curl forward, contracting your abs, then return slowly.",
  "Hanging Leg Raise": "Hang from a pull-up bar with straight arms. Raise your legs up in front of you as high as you can, then lower back down with control.",
  "Reverse Crunch": "Lie on your back, knees bent toward your chest. Curl your hips up off the floor, bringing your knees toward your chest, then lower back down.",
  "Leg Raise": "Lie on your back, legs straight. Raise them up toward the ceiling without bending your knees, then lower back down without letting your feet touch the floor.",
  "Dumbbell Side Bend": "Stand holding a dumbbell in one hand at your side. Bend sideways toward that hand, then straighten back up. Finish all reps, then switch sides.",
  "Russian Twist": "Sit with knees bent, leaning back slightly, feet either on the floor or lifted. Twist your torso side to side, touching the floor beside you each time.",
  "Cable Woodchopper": "Stand sideways to a high cable, handle in both hands. Pull it down and across your body toward your opposite hip, then return slowly.",
  "Side Plank": "Lie on your side, propped up on one forearm, body in a straight line. Hold this position, keeping your hips lifted off the floor.",
  "Barbell Squat": "Stand with a bar across your upper back, feet shoulder-width apart. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Leg Press": "Sit in the machine, feet on the platform shoulder-width apart. Push the platform away by straightening your legs, then let it come back slowly.",
  "Dumbbell Goblet Squat": "Hold a dumbbell with both hands at your chest. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Bodyweight Squat": "Stand with feet shoulder-width apart, no weight. Bend your knees and hips to lower down like sitting in a chair, then stand back up.",
  "Leg Extension": "Sit at the machine with the pad against the front of your ankles. Straighten your legs to lift the pad up, then lower back down with control.",
  "Leg Curl": "Lie face-down or sit at the machine with the pad against the back of your ankles. Curl your legs, bringing your heels toward your glutes, then lower back down.",
  "Good Morning (Legs)": "Stand with a bar across your upper back. Keeping your legs mostly straight, bend forward at the hips until your torso is close to parallel with the floor, then stand back up.",
  "Nordic Curl": "Kneel with your ankles held down by a partner or anchor. Slowly lower your body forward as far as you can, using your hamstrings to control the movement, then pull back up.",
  "Glute Bridge": "Lie on your back, knees bent, feet flat on the floor. Push through your heels to lift your hips up until your body forms a straight line, then lower back down.",
  "Cable Kickback": "Stand facing a low cable with the strap around your ankle. Kick your leg straight back and up, then return slowly to the start.",
  "Seated Calf Raise": "Sit at the machine with the pad on your thighs and your toes on the platform. Push up onto your toes as high as you can, then lower back down.",
  "Cable Adduction": "Stand sideways to a low cable with the strap around your ankle furthest from the machine. Pull that leg across your body, then return slowly.",
  "Sumo Squat": "Stand with feet wider than shoulder-width, toes pointed out, holding a dumbbell if you like. Bend your knees to lower down, then stand back up.",
  "Cable Abduction": "Stand sideways to a low cable with the strap around your ankle nearest the machine. Pull that leg out and away from your body, then return slowly.",
  "Lateral Band Walk": "Put a resistance band around your ankles or knees, feet shoulder-width apart, knees slightly bent. Step sideways in small steps, keeping tension on the band.",
  "Stationary Bike": "Sit on the bike and pedal at a steady pace for the set time.",
  "Rowing Machine": "Sit on the rower, feet strapped in, handle in both hands. Push with your legs, then pull the handle to your stomach, leaning back slightly. Reverse the motion to return.",
  "Elliptical": "Stand on the pedals and hold the handles, moving your legs and arms in a smooth, walking-like motion for the set time.",
  "Stair Climber": "Step onto the machine and climb at a steady pace, like walking up stairs, for the set time.",
  "Jump Rope": "Hold one handle in each hand, swing the rope over your head and jump over it as it passes under your feet.",
  "Child's Pose": "Kneel on the floor, then sit back onto your heels and stretch your arms forward, lowering your chest toward the ground. Hold and breathe.",
  "Hip Flexor Stretch": "Kneel on one knee with the other foot planted in front of you. Gently push your hips forward until you feel a stretch in the front of your hip. Hold, then switch sides.",
  "Hamstring Stretch": "Sit or stand with one leg extended in front of you, heel on the floor. Hinge forward at your hips, reaching toward your toes, keeping your back flat. Hold, then switch sides.",
  "Couch Stretch": "Kneel in front of a couch or bench with your back foot resting on it behind you. Push your hips forward gently until you feel a stretch in the front of your thigh. Hold, then switch sides.",
  "World's Greatest Stretch": "Step forward into a lunge, place both hands on the floor inside your front foot, then rotate one arm up toward the ceiling, opening your chest. Return and repeat, then switch sides.",
  "Thoracic Rotation": "Get on all fours, place one hand behind your head. Rotate your upper body, bringing that elbow up toward the ceiling, then back down under your body. Repeat, then switch sides.",
  "Pull-Up": "Hang from a bar with hands wider than shoulders, palms facing away. Pull your body up until your chin clears the bar, then lower back down with control.",
  "Dumbbell Row": "Place one knee and hand on a bench, holding a dumbbell in the other hand hanging down. Pull it up to your side, squeezing your back, then lower back down. Finish, then switch sides.",
  "Dumbbell Lateral Raise": "Stand holding a dumbbell in each hand at your sides. Raise them out to the sides up to shoulder height, then lower back down.",
  "Dumbbell Shoulder Press": "Stand or sit holding a dumbbell in each hand at shoulder height. Press them straight overhead until your arms extend, then lower back down.",
  "Arnold Press": "Sit holding dumbbells in front of your shoulders, palms facing you. As you press overhead, rotate your palms to face forward. Reverse the rotation as you lower back down.",
  "Dumbbell Romanian Deadlift": "Stand holding a bar or dumbbells in front of your thighs. Keeping your legs mostly straight, hinge at your hips to lower the weight down your legs, then stand back up.",
  "Bulgarian Split Squat": "Stand a couple feet in front of a bench, resting one foot behind you on it. Bend your front knee to lower down, then push back up. Finish, then switch legs.",
  "Bodyweight Calf Raise": "Stand with feet flat on the floor. Rise up onto your toes as high as you can, then lower back down.",
  "Cat-Cow": "Get on all fours. Arch your back and drop your belly toward the floor while lifting your head (cow), then round your spine up toward the ceiling while tucking your chin (cat). Move slowly between the two.",
  "Pigeon Pose": "From all fours, bring one knee forward and place it behind your wrist, extending the other leg straight back. Lower your body forward over your front leg. Hold, then switch sides.",
  "Rear Delt Fly": "Bend forward slightly holding a dumbbell in each hand. Raise your arms out to the sides until level with your shoulders, then lower back down.",
  "Incline Bicep Curl": "Sit on an incline bench, arms hanging straight down holding dumbbells. Curl them up toward your shoulders, then lower back down.",
  "Tricep Overhead Extension": "Stand or sit holding a dumbbell with both hands overhead. Lower it behind your head by bending your elbows, then straighten your arms back up.",
  "Dumbbell Hip Thrust": "Sit on the floor with your upper back against a bench, a dumbbell resting on your hips. Push through your heels to lift your hips up, then lower back down.",
  "Donkey Kick": "Get on all fours. Keeping your knee bent, kick one leg up and back toward the ceiling, then lower back down. Finish, then switch legs.",
  "Dumbbell Step-Up": "Stand facing a bench or box, holding a dumbbell in each hand. Step up onto it with one foot, then bring the other foot up to join it. Step back down and repeat.",
  "Plank": "Get into a push-up position, but rest on your forearms instead of your hands. Keep your body in a straight line and hold.",
  "Weighted Sit-Up": "Lie on your back, knees bent, holding a weight against your chest. Curl your whole upper body up toward your knees, then lower back down.",
  "Treadmill (Zone 2)": "Walk or jog at a pace where you can still hold a conversation, for the set amount of time.",
  "Frogger Stretch": "Get on all fours, then widen your knees out to the sides. Rock your hips backward and forward slowly to feel a stretch in your inner thighs.",
  "Deep Squat Hold": "Lower into a full squat, feet flat on the floor, and simply hold that position, letting your hips sink low.",
  "Standing Forward Hold": "Stand with feet hip-width apart, then bend forward at your hips and let your upper body hang down toward your toes. Hold and relax.",
  "Seated Single Leg Stretch": "Sit with one leg extended straight out, the other bent with your foot near your inner thigh. Reach toward the toes of your straight leg. Hold, then switch sides.",
  "Thread The Needle": "Get on all fours. Slide one arm underneath your body and through the gap between your other arm and leg, lowering your shoulder to the floor. Hold, then switch sides.",
  "Barbell Hip Thrust": "Sit on the floor with your upper back against a bench, a bar resting across your hips. Push through your heels to lift your hips up, then lower back down.",
};
function saveBlurbsV2() {
  try { localStorage.setItem(KEYS.blurbsV2, JSON.stringify(EXERCISE_BLURBS)); } catch {}
}
function loadBlurbsV2() {
  try {
    const saved = localStorage.getItem(KEYS.blurbsV2);
    if (saved) Object.assign(EXERCISE_BLURBS, JSON.parse(saved));
  } catch {}
}

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
  loadLibraryV2();
  loadBlurbsV2();

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
// Resolves a scheduled exercise's display fields (name/reps/rest/type) from the
// current Library entry when it has an exId, so editing the Library updates it
// everywhere it's scheduled. Falls back to the day's own stored copy if there's
// no exId, or if the Library entry it pointed to has since been deleted.
function resolveScheduledExercise(ex) {
  if (ex.exId) {
    const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === ex.exId);
    if (libEx) {
      return { ...ex, name: libEx.name, reps: libEx.reps, rest: libEx.rest, restSecs: libEx.restSecs, type: libEx.type };
    }
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
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

/* ─── TAB SWITCHING ─── */
/* ─── LIBRARY (V2) — not yet wired to day-logging ─── */
let libv2ActiveGroup = null;
let libv2ActiveSub = null;
let libv2SearchQuery = '';

function openLibV2Search() {
  document.getElementById('libv2-title').style.display = 'none';
  document.getElementById('libv2-search-btn').style.display = 'none';
  const pill = document.getElementById('libv2-search-pill');
  pill.classList.add('show');
  const input = document.getElementById('libv2-search-input');
  input.value = '';
  libv2SearchQuery = '';
  document.querySelectorAll('.libv2-scroll-wrap').forEach(el => el.style.display = 'none');
  setTimeout(() => input.focus(), 50);
  renderLibV2();
}
function closeLibV2Search() {
  document.getElementById('libv2-title').style.display = '';
  document.getElementById('libv2-search-btn').style.display = '';
  document.getElementById('libv2-search-pill').classList.remove('show');
  document.querySelectorAll('.libv2-scroll-wrap').forEach(el => el.style.display = '');
  libv2SearchQuery = '';
  renderLibV2();
}
function libv2Search(query) {
  libv2SearchQuery = query.trim();
  renderLibV2();
}

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

  // Exercise grid: search overrides group/sub filters when active; otherwise
  // show everything by default, narrowing as group/sub filters are applied.
  let filtered = DEFAULT_LIBRARY_V2;
  if (libv2SearchQuery) {
    const q = libv2SearchQuery.toLowerCase();
    filtered = filtered.filter(ex => ex.name.toLowerCase().includes(q));
  } else {
    if (libv2ActiveGroup) filtered = filtered.filter(ex => ex.group === libv2ActiveGroup);
    if (libv2ActiveSub) filtered = filtered.filter(ex => ex.sub === libv2ActiveSub);
  }

  if (!filtered.length) {
    tilesEl.innerHTML = `<div class="empty">${libv2SearchQuery ? 'No exercises match your search.' : 'No exercises match this filter yet.'}</div>`;
    return;
  }
  tilesEl.innerHTML = filtered.map(ex => `
    <div class="libv2-tile" data-exname="${escAttr(ex.name)}">
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
// Delegated, document-level click handler for library exercise tiles.
// Attached immediately at script parse time — does not depend on DOMContentLoaded
// or any other init step succeeding first, and survives any number of re-renders
// of the tiles grid since it's attached once to the document, not per-tile.
document.addEventListener('click', function(e) {
  const tile = e.target.closest('.libv2-tile');
  if (tile && tile.dataset.exname) {
    openExerciseDetail(tile.dataset.exname);
  }
});

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
  document.getElementById('ex-detail-gear-btn').onclick = () => { closeExerciseDetail(); openLibV2EditForm(ex.name); };
  document.getElementById('ex-detail-wrap').classList.add('show');
}
function closeExerciseDetail() {
  document.getElementById('ex-detail-wrap').classList.remove('show');
}
function addExerciseToDayFromLibrary(ex) {
  const d = _libv2PickingDay || currentDay;
  const already = schedule[d].exercises.some(e => e.name === ex.name);
  const doAdd = () => {
    schedule[d].exercises.push({
      exId: ex.id || '',
      name: ex.name,
      reps: ex.reps,
      sets: 0,
      duration: ex.type === 'custom' ? (ex.reps || '') : '',
      note: '',
      rest: ex.rest,
      restSecs: ex.restSecs,
      type: ex.type,
    });
    saveSchedule();
    if (currentDay === d) renderDayContent();
  };
  if (already) {
    closeExerciseDetail();
    showModal('Already added', `${ex.name} is already in ${FULL_DAYS[d]}. Add it again anyway?`, () => {
      doAdd();
      closeModal();
    });
    return;
  }
  doAdd();
  const btn = document.getElementById('ex-detail-add-btn');
  if (btn) {
    btn.textContent = `✓ Added to ${d}`;
    setTimeout(() => { closeExerciseDetail(); btn.textContent = 'Add to Day'; }, 700);
  } else {
    closeExerciseDetail();
  }
}

// Opens the Library tab specifically to add an exercise into the given day —
// called from the "+ Add exercise" button on the Log tab (edit mode).
function openLibV2ForDay(day) {
  _libv2PickingDay = day;
  switchTab('library');
}

/* ─── LIBRARY V2 ADD/EDIT FORM ─── */
let _libv2PickingDay = null; // set when Library is opened from a specific day's "+ Add exercise" button
let _libv2FormEditingName = null; // null = adding new; otherwise the name of the exercise being edited

function libv2PopulateGroupSelect(selectedGroupKey) {
  const sel = document.getElementById('lv2f-group');
  sel.innerHTML = MUSCLE_GROUPS_V2.map(g =>
    `<option value="${g.key}"${g.key === selectedGroupKey ? ' selected' : ''}>${g.label}</option>`
  ).join('');
}
function libv2FormSyncSubs() {
  const groupKey = document.getElementById('lv2f-group').value;
  const groupObj = MUSCLE_GROUPS_V2.find(g => g.key === groupKey);
  const subSel = document.getElementById('lv2f-sub');
  const subs = groupObj ? groupObj.subs : [];
  if (subs.length) {
    subSel.style.display = '';
    subSel.innerHTML = subs.map(s => `<option value="${escAttr(s)}">${escHtml(s)}</option>`).join('');
  } else {
    subSel.style.display = 'none';
    subSel.innerHTML = '';
  }
}
function openLibV2AddForm() {
  _libv2FormEditingName = null;
  document.getElementById('libv2-form-title').textContent = 'Add exercise';
  document.getElementById('lv2f-name').value = '';
  document.getElementById('lv2f-reps').value = '';
  document.getElementById('lv2f-rest').value = '';
  document.getElementById('lv2f-type').value = 'gym';
  document.getElementById('lv2f-instructions').value = '';
  document.getElementById('lv2f-delete-btn').style.display = 'none';
  libv2PopulateGroupSelect(MUSCLE_GROUPS_V2[0].key);
  libv2FormSyncSubs();
  document.getElementById('libv2-form-wrap').classList.add('show');
}
function openLibV2EditForm(name) {
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === name);
  if (!ex) return;
  _libv2FormEditingName = name;
  document.getElementById('libv2-form-title').textContent = 'Edit exercise';
  document.getElementById('lv2f-name').value = ex.name;
  document.getElementById('lv2f-reps').value = ex.reps || '';
  document.getElementById('lv2f-rest').value = ex.rest || '';
  document.getElementById('lv2f-type').value = ex.type || 'gym';
  document.getElementById('lv2f-instructions').value = EXERCISE_BLURBS[ex.name] || '';
  document.getElementById('lv2f-delete-btn').style.display = '';
  libv2PopulateGroupSelect(ex.group);
  libv2FormSyncSubs();
  if (ex.sub) document.getElementById('lv2f-sub').value = ex.sub;
  document.getElementById('libv2-form-wrap').classList.add('show');
}
function closeLibV2Form() {
  document.getElementById('libv2-form-wrap').classList.remove('show');
}
function saveLibV2Form() {
  const name = document.getElementById('lv2f-name').value.trim();
  if (!name) { document.getElementById('lv2f-name').focus(); return; }
  const group = document.getElementById('lv2f-group').value;
  const subSelect = document.getElementById('lv2f-sub');
  const sub = subSelect.style.display !== 'none' ? subSelect.value : undefined;
  const type = document.getElementById('lv2f-type').value;
  const reps = document.getElementById('lv2f-reps').value.trim() || '8-12';
  const restRaw = document.getElementById('lv2f-rest').value.trim() || '60 sec';
  const instructions = document.getElementById('lv2f-instructions').value.trim();
  const restSecsMatch = restRaw.match(/(\d+)\s*min/);
  const restSecsMatchSec = restRaw.match(/(\d+)\s*sec/);
  const restSecs = restSecsMatch ? parseInt(restSecsMatch[1]) * 60 : (restSecsMatchSec ? parseInt(restSecsMatchSec[1]) : 60);

  if (_libv2FormEditingName) {
    const ex = DEFAULT_LIBRARY_V2.find(e => e.name === _libv2FormEditingName);
    if (ex) {
      // If the name changed, move the instructions entry over to the new name
      if (_libv2FormEditingName !== name && EXERCISE_BLURBS[_libv2FormEditingName] !== undefined) {
        EXERCISE_BLURBS[name] = EXERCISE_BLURBS[_libv2FormEditingName];
        delete EXERCISE_BLURBS[_libv2FormEditingName];
      }
      ex.name = name; ex.group = group; ex.type = type; ex.reps = reps; ex.rest = restRaw; ex.restSecs = restSecs;
      if (sub !== undefined) ex.sub = sub; else delete ex.sub;
    }
  } else {
    const newEx = { name, group, type, reps, rest: restRaw, restSecs, id: genLibV2Id() };
    if (sub !== undefined) newEx.sub = sub;
    DEFAULT_LIBRARY_V2.push(newEx);
  }
  if (instructions) EXERCISE_BLURBS[name] = instructions;
  else delete EXERCISE_BLURBS[name];
  saveLibraryV2();
  saveBlurbsV2();
  closeLibV2Form();
  renderLibV2();
}

function deleteLibV2Exercise() {
  if (!_libv2FormEditingName) return;
  const ex = DEFAULT_LIBRARY_V2.find(e => e.name === _libv2FormEditingName);
  if (!ex) return;

  // Find every day currently scheduling this exercise (matched by exId).
  const daysUsingIt = DAY_NAMES.filter(d =>
    schedule[d].exercises.some(e => ex.id && e.exId === ex.id)
  ).map(d => FULL_DAYS[d]);

  const doDelete = () => {
    const idx = DEFAULT_LIBRARY_V2.findIndex(e => e.id === ex.id);
    if (idx !== -1) DEFAULT_LIBRARY_V2.splice(idx, 1);
    delete EXERCISE_BLURBS[ex.name];
    // Remove it from every day that had it scheduled, since keeping it there
    // would be a dead entry with no way to log new history against it.
    DAY_NAMES.forEach(d => {
      schedule[d].exercises = schedule[d].exercises.filter(e => !(ex.id && e.exId === ex.id));
    });
    saveLibraryV2();
    saveBlurbsV2();
    saveSchedule();
    closeLibV2Form();
    renderLibV2();
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

function switchTab(tab) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-' + tab).classList.add('active');
  if (tab !== 'library') _libv2PickingDay = null;
  ['log','history','library','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none'; });
  if (tab === 'history') renderHistory();
  else if (tab === 'library') {
    renderLibV2();
    document.getElementById('log-back-btn')?.classList.remove('show');
    requestAnimationFrame(() => renderLibV2()); // safety re-render once tab is actually visible
  }
  else if (tab === 'clock') { ensureClockBuilt(); document.getElementById('log-back-btn')?.classList.remove('show'); }
  else { destroyCharts(); renderDayContent(); document.getElementById('log-back-btn')?.classList.remove('show'); }
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
    : day.exercises.map((rawEx, i) => {
        const ex = resolveScheduledExercise(rawEx);
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

  const addBtn = dayEditMode ? `<button class="add-exercise-btn" onclick="openLibV2ForDay('${d}')">+ Add exercise</button>` : '';
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
