/* ════════════════════════════════════════════
   Tally Up — Exercise Library Data
   242 structured exercises. Loaded before app.js (see index.html
   script order), so DEFAULT_LIBRARY_V2_BASE exists as a global by
   the time app.js references it.
   ════════════════════════════════════════════ */

// Full merged library: boilerplate defaults + Henry personal exercises (IDs preserved)
// Full merged library — 242 structured exercises. Every entry carries both
// the new taxonomy (muscles, equipment, movementPattern, exerciseType,
// laterality, position, difficulty, card, blurb) AND the legacy operational
// fields (reps/rest/restSecs/type/sets) the rest of the app depends on, so
// scheduling, logging, and the rest timer keep working unchanged.
//
// Legacy `type` field (drives equipment icon + bodyweight-volume calc):
//   gym        — barbell/machine/cable/smith/landmine, weighted
//   dumbbell   — dumbbell-loaded
//   bodyweight — bodyweight-loaded (adds user bodyweight to volume calcs)
//   custom     — cardio/duration-based, no set/rep scheme
export const DEFAULT_LIBRARY_V2_BASE = [

/* ─────────────────────────────────────────────
   CHEST — Presses
   ───────────────────────────────────────────── */

{
  id: "isr4t",
  name: "Barbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Rotator cuff"] },
  equipment: ["Barbell", "Bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A barbell press performed while lying on a flat bench.",
  blurb: "Lie on a flat bench and press a loaded barbell up from your chest until your arms are straight, then lower it back down under control. It's one of the most common ways to build chest strength and size, and it also works your shoulders and triceps. Keep your feet planted and shoulder blades pulled back for a stable base.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "2amry",
  name: "Incline Barbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Rotator cuff"] },
  equipment: ["Barbell", "Incline bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A barbell press performed on an inclined bench to emphasize the upper chest.",
  blurb: "Same barbell press as the flat bench, but the bench is tilted up so you're pressing at an angle instead of straight up. That angle shifts more of the work onto the upper part of your chest, near your collarbone. It's a great add-on if you want a fuller-looking chest, not just a bigger one.",
  reps: "8-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "g3f58",
  name: "Decline Barbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts"], stabilizers: ["Rotator cuff"] },
  equipment: ["Barbell", "Decline bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "advanced",
  card: "A barbell press performed on a declined bench.",
  blurb: "This is a bench press done on a bench tilted the opposite way, with your head lower than your feet. It shifts emphasis toward the lower chest and can feel more natural on your shoulders for some people. Make sure the bench has foot supports so you don't slide around.",
  reps: "8-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "hbux8",
  name: "Dumbbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Rotator cuff"] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A flat-bench press using two independently loaded dumbbells.",
  blurb: "The same idea as a barbell bench press, but you're holding a dumbbell in each hand instead of one bar. Because each arm works independently, it demands a bit more stability and can help even out strength differences between sides. It also lets your hands move more naturally than a fixed barbell.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "24e8a", // kept — logged history (11 sets, as "Incline Dumbbell Press")
  name: "Incline Dumbbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Rotator cuff"] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A dumbbell press performed on an incline to emphasize the upper chest.",
  blurb: "An incline press done with dumbbells instead of a barbell, which lets your arms move through a slightly more natural path. Like other incline presses, it shifts more of the work to your upper chest. Go a little lighter than you would on the barbell version until you're used to balancing two independent weights.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "7xucs",
  name: "Decline Dumbbell Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts"], stabilizers: ["Rotator cuff"] },
  equipment: ["Dumbbell", "Decline bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "advanced",
  card: "A dumbbell chest press performed on a declined bench.",
  blurb: "A dumbbell version of the decline bench press, performed on a bench angled with your head below your feet. It targets the lower chest while letting each arm move independently. Start light since stabilizing two dumbbells upside-down takes some getting used to.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "bt1h1",
  name: "Dumbbell Floor Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A dumbbell press performed from the floor with a shortened range of motion.",
  blurb: "You lie flat on the floor instead of a bench and press dumbbells straight up. Your upper arms hit the floor at the bottom, which naturally limits how far you lower the weight — a built-in safety net if you're pressing heavy or training alone. It's an easy way to do a chest press with minimal setup.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "mfjqw",
  name: "Barbell Floor Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A barbell press from the floor that limits the bottom portion of the movement.",
  blurb: "Same idea as the dumbbell floor press, but with a barbell instead. The floor stops your elbows before your shoulders are under strain, which makes this a good option if you have shoulder issues with a full-range bench press. It's also handy for practicing lockout strength.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "g39x4",
  name: "Close-Grip Bench Press",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: ["Chest", "Front delts"], stabilizers: ["Rotator cuff"] },
  equipment: ["Barbell", "Bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A bench press using a narrower grip to increase triceps involvement.",
  blurb: "A bench press with your hands set closer together than shoulder-width. Narrowing your grip shifts more of the load onto your triceps while still working your chest. Keep your elbows tucked in rather than flared out to protect your wrists and elbows.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "07v8h",
  name: "Smith Machine Bench Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: [] },
  equipment: ["Smith machine", "Bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A guided barbell chest press performed on a Smith machine.",
  blurb: "A bench press performed on a Smith machine, where the bar moves along a fixed vertical track instead of moving freely. That guided path makes it easier to focus on pushing the weight without worrying about balance. It's a solid option if you're newer to pressing or training without a spotter.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "xet15",
  name: "Incline Smith Machine Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: [] },
  equipment: ["Smith machine", "Incline bench"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "An incline chest press performed with the guided bar of a Smith machine.",
  blurb: "An incline press using the guided bar of a Smith machine rather than a free barbell. You get the upper-chest emphasis of an incline press with the added stability of a fixed bar path. A good choice if you want to push closer to failure safely.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "3jn55",
  name: "Machine Chest Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine press that trains the chest through a guided path.",
  blurb: "You sit at a machine and push two handles forward, mimicking a bench press without needing a bar or dumbbells. The seat and backrest keep you locked in place, so all your effort goes into pushing rather than balancing. It's a beginner-friendly way to build pressing strength.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "vxz7i",
  name: "Incline Machine Chest Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "intermediate",
  card: "A machine chest press performed on an incline.",
  blurb: "Basically the same as the machine chest press, but the handles and seat are angled to emphasize your upper chest. It offers the same guided, easy-to-learn movement as the flat version. A solid option when the incline bench and dumbbells are taken.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "zrdvy",
  name: "Single-Arm Machine Chest Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Core"] },
  equipment: ["Machine"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "unilateral", position: "seated", difficulty: "beginner",
  card: "A unilateral machine press that trains each side independently.",
  blurb: "A machine chest press done one arm at a time instead of both together. Working unilaterally means each side has to pull its own weight, which can help fix strength imbalances between your left and right. It also adds a bit of core engagement since you're resisting rotation.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "25rh3",
  name: "Landmine Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: [] },
  equipment: ["Barbell", "Landmine"],
  movementPattern: "Diagonal push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A diagonal barbell press performed from a landmine setup.",
  blurb: "You press a barbell that's anchored to the floor at one end, so the movement travels on a diagonal arc rather than straight up. That angle hits the upper chest and shoulders in a way that's often easier on the joints than a barbell overhead or bench press. It only requires one end of the bar to be loaded, so it's a good option when equipment is limited.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "bg1k0",
  name: "Single-Arm Landmine Press",
  group: "chest", sub: "Presses",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Landmine"],
  movementPattern: "Diagonal push",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A unilateral landmine press that combines upper-body pressing with core stabilization.",
  blurb: "The landmine press done one arm at a time. Because you're pressing to one side, your core has to work hard to keep your torso from twisting, so this doubles as a light core exercise. It's a great option if you're working around a shoulder that doesn't love heavy bilateral pressing.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CHEST — Fly / Isolation
   ───────────────────────────────────────────── */

{
  id: "rkmkf", // kept — logged history (4 sets, as "Dumbbell Flyes")
  name: "Dumbbell Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Horizontal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A chest isolation movement performed by bringing two dumbbells together in an arc.",
  blurb: "You lie on a bench holding a dumbbell in each hand and bring them together in a wide arcing motion above your chest, like you're hugging a big barrel. Unlike a press, your elbows stay bent throughout, which puts more of the work directly on your chest muscles. Keep the arc controlled — this isn't a movement to rush.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "8lof6",
  name: "Incline Dumbbell Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Horizontal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "An incline dumbbell fly emphasizing the upper chest.",
  blurb: "The same wide arcing dumbbell movement as a regular fly, but done on an incline bench to bias the upper chest. It's a good finisher after presses if you want to really feel your upper chest working. Use lighter weight than you'd think — flys put more stress on the shoulder joint than presses do.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "ol10z",
  name: "Cable Chest Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable fly that brings the arms together against constant resistance.",
  blurb: "You stand between two cable towers and bring the handles together in front of you in a hugging motion, targeting the chest without needing a bench. Because cables keep tension on your muscles throughout the whole movement, it can feel more challenging than dumbbells at the same weight. Great for finishing off a chest workout.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "0w9h7",
  name: "Low-to-High Cable Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Diagonal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable fly traveling upward and inward to emphasize the upper chest.",
  blurb: "A cable fly where the handles start low and travel up and across your body. That upward path shifts the emphasis toward your upper chest. Set the pulleys low and take a small step forward to get the full range of motion.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "14iif",
  name: "High-to-Low Cable Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Diagonal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable fly traveling downward and inward.",
  blurb: "The opposite setup from the low-to-high version — the handles start high and travel down and across your body. This angle works more of the lower chest. It pairs well with the low-to-high version if you want to hit your whole chest in one exercise pairing.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "u4hbp",
  name: "Pec Deck",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine fly that isolates the chest through a guided path.",
  blurb: "You sit in a machine with padded arms and squeeze them together in front of your chest, like the machine version of a dumbbell fly. It's an easy, safe way to isolate your chest without worrying about balancing free weights. Just don't let the pads slam together at the top — control the squeeze instead.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "rx1r5",
  name: "Machine Fly",
  group: "chest", sub: "Isolation",
  muscles: { primary: ["Chest"], secondary: ["Front delts"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal adduction",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A machine-based chest fly performed with a controlled arc.",
  blurb: "A general term for any machine designed to mimic the dumbbell or cable fly motion, bringing your arms together in an arc to isolate the chest. Machines like this are a good low-skill way to add chest volume at the end of a workout. Focus on a slow, controlled squeeze rather than using momentum.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CHEST — Bodyweight
   ───────────────────────────────────────────── */

{
  id: "5oswz",
  name: "Wide Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A push-up performed with a wider hand position.",
  blurb: "A push-up with your hands set wider than shoulder-width apart. The wider hand position shifts more of the emphasis onto your chest rather than your triceps. Keep your elbows from flaring out too aggressively to protect your shoulders.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "32c3x",
  name: "Close-Grip Push-Up",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: ["Chest", "Front delts"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A narrow-hand push-up that increases triceps involvement.",
  blurb: "A push-up with your hands close together, almost touching under your chest. This narrower position shifts more of the work onto your triceps while still training your chest. It's a natural next step once regular push-ups start feeling easy.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "9ar69",
  name: "Incline Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A push-up performed with the hands elevated for an easier variation.",
  blurb: "A push-up with your hands on something raised, like a bench or step, instead of the floor. Elevating your hands reduces the percentage of your bodyweight you're pushing, making it an easier variation than a standard push-up. It's a great way to build up to the full version if regular push-ups are too tough right now.",
  reps: "12-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "usokz",
  name: "Decline Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Upper chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A push-up performed with the feet elevated.",
  blurb: "A push-up with your feet up on something raised instead of your hands. This shifts more of your bodyweight onto your upper body and emphasizes the upper chest a bit more. It's noticeably harder than a standard push-up, so work up to it gradually.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "pqtzt",
  name: "Weighted Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts", "Core"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Weight plate"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A push-up performed with additional external weight.",
  blurb: "A regular push-up with extra weight added, usually a plate resting on your back. Once bodyweight push-ups stop being challenging, this is a simple way to keep progressing without needing a bench or bar. Have someone help place the plate so you can get into position safely first.",
  reps: "8-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "tsota",
  name: "Deficit Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Chest"], secondary: ["Front delts", "Triceps"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A push-up performed with the hands elevated to increase range of motion.",
  blurb: "A push-up where your hands are elevated on blocks or handles, letting your chest dip below hand level at the bottom. That extra drop increases the range of motion compared to a standard push-up, which can mean more muscle growth stimulus. Ease into it, since the deeper stretch puts more demand on your shoulders.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},

/* ─────────────────────────────────────────────
   BACK — Vertical Pull
   ───────────────────────────────────────────── */

{
  id: "5965m", // kept — logged history (10 sets, as "Pull-ups")
  name: "Pull-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back", "Forearms"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "intermediate",
  card: "A bodyweight vertical pull performed from a hanging position.",
  blurb: "Hang from a bar and pull yourself up until your chin clears it, then lower back down under control. It's one of the best exercises for building a wider, stronger back, and it also works your biceps and grip. If a full pull-up is too tough right now, an assisted version or a band can help you build up to it.",
  reps: "3-8", rest: "75 sec", restSecs: 75, type: "bodyweight", sets: 3
},
{
  id: "8pxqg",
  name: "Chin-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back", "Forearms"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "intermediate",
  card: "A supinated-grip pull-up with increased biceps involvement.",
  blurb: "Same movement as a pull-up, but your palms face toward you instead of away. That grip position brings your biceps in more, which many people find makes the exercise feel a bit easier than a standard pull-up. It still builds serious back strength either way.",
  reps: "3-8", rest: "75 sec", restSecs: 75, type: "bodyweight", sets: 3
},
{
  id: "qkx7m",
  name: "Neutral-Grip Pull-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "intermediate",
  card: "A pull-up performed with palms facing each other.",
  blurb: "A pull-up where your palms face each other instead of away or toward you. This grip tends to be gentler on the shoulders and wrists than the other grip styles. A good option to rotate in if your joints need a break from the usual pull-up grip.",
  reps: "3-8", rest: "75 sec", restSecs: 75, type: "bodyweight", sets: 3
},
{
  id: "nkyn0",
  name: "Wide-Grip Pull-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Upper back", "Biceps"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "advanced",
  card: "A pull-up performed with a wider-than-shoulder-width grip.",
  blurb: "A pull-up with your hands set wider than shoulder-width. The wider grip shortens your range of motion but shifts more of the emphasis onto your upper back and lats. It's noticeably harder than a standard pull-up, so it's worth building up to.",
  reps: "3-6", rest: "90 sec", restSecs: 90, type: "bodyweight", sets: 3
},
{
  id: "uel53",
  name: "Assisted Pull-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: ["Core"] },
  equipment: ["Machine", "Resistance band"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A pull-up performed with assistance to reduce the required bodyweight load.",
  blurb: "A pull-up done with help from a machine or a resistance band looped under your knees, which takes some of your bodyweight out of the equation. It's the standard way to build toward doing full pull-ups on your own. Reduce the assistance over time as you get stronger.",
  reps: "6-10", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "00s07",
  name: "Weighted Pull-Up",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back", "Forearms"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Pull-up bar", "Weight plate"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "advanced",
  card: "A pull-up performed with additional external weight.",
  blurb: "A pull-up with extra weight attached, usually hanging from a belt around your waist. Once regular pull-ups feel easy, this is how you keep making the exercise harder. Only add weight once you can comfortably do several strict pull-ups with just your bodyweight.",
  reps: "3-6", rest: "2 min", restSecs: 120, type: "bodyweight", sets: 3
},
{
  id: "tbyoj",
  name: "Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated cable pull that brings a bar toward the upper chest.",
  blurb: "You sit at a cable machine and pull a bar down toward your upper chest, working the same muscles as a pull-up but with adjustable weight. It's a great option if you can't yet do pull-ups, or if you want a controlled way to add back volume. Keep your torso upright rather than leaning back to swing the weight down.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "7z43t",
  name: "Wide-Grip Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Upper back", "Biceps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A lat pulldown performed with a wide overhand grip.",
  blurb: "A lat pulldown using a grip wider than shoulder-width. The wider hand position shifts more of the work onto your upper back and the outer part of your lats. Avoid pulling the bar behind your neck — bringing it to your upper chest is safer and just as effective.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "xe7sg",
  name: "Close-Grip Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A lat pulldown performed with a narrow grip.",
  blurb: "A lat pulldown using a narrow grip, often on a small V-shaped handle. The closer hand position brings your biceps in more and can feel more comfortable on the shoulders. A good variation to mix in alongside the standard wide-grip version.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "9vq4y",
  name: "Neutral-Grip Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A lat pulldown performed with a neutral grip.",
  blurb: "A lat pulldown where your palms face each other on a neutral-grip handle. This grip is often easier on the wrists and shoulders than a wide overhand grip. It still effectively targets your lats and upper back.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "dh5xw",
  name: "Single-Arm Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "unilateral", position: "seated", difficulty: "intermediate",
  card: "A unilateral pulldown that trains one side of the back at a time.",
  blurb: "A lat pulldown done one arm at a time using a single handle. Working unilaterally helps even out any strength differences between your sides and adds a bit of core stability work. It also lets each arm move through a slightly more natural path.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "z72gz",
  name: "Kneeling Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Core"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A kneeling cable pulldown emphasizing shoulder extension.",
  blurb: "A lat pulldown performed while kneeling instead of seated, which changes the angle you're pulling from. Kneeling emphasizes pulling your arms down and back rather than just down, hitting your lats a bit differently. It's a nice variation once you're comfortable with the standard seated version.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   BACK — Rows
   ───────────────────────────────────────────── */

{
  id: "e3xwn",
  name: "Barbell Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A bent-over barbell row performed with a stable torso.",
  blurb: "You hinge forward at the hips holding a barbell and pull it up toward your stomach, then lower it back down. This builds your whole upper back along with your lats and biceps. Keep your back flat and core braced throughout — don't let your lower back round as you pull.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "zlihc",
  name: "Pendlay Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A strict barbell row performed from the floor on every repetition.",
  blurb: "A stricter version of the barbell row where the bar returns to the floor and comes to a complete stop after every single rep. That dead stop removes any bouncing or momentum, forcing your back to do all the work on each pull. It's a great way to build raw pulling strength.",
  reps: "6-8", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "11gf5",
  name: "Yates Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A barbell row performed with a more upright torso and underhand grip.",
  blurb: "A barbell row done with a more upright torso and an underhand grip, rather than bent far forward. The more vertical position can feel more natural and puts less strain on your lower back. It still works your whole upper back effectively.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "rnvlx", // kept — logged history (10 sets, as "Dumbbell Rows")
  name: "Dumbbell Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Lats"], secondary: ["Upper back", "Biceps"], stabilizers: ["Core"] },
  equipment: ["Dumbbell"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A one-arm dumbbell row performed with support from a bench or stable surface.",
  blurb: "You brace one hand and knee on a bench and row a dumbbell up with the other arm, working one side of your back at a time. Because you're only holding one weight, it's easier to keep your torso stable and really focus on squeezing your back. A great option for beginners learning to row with good form.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "ip49s",
  name: "Chest-Supported Dumbbell Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A dumbbell row performed with the chest supported to reduce lower-back involvement.",
  blurb: "You lie chest-down on an inclined bench and row two dumbbells up toward your body. Having your chest supported takes your lower back out of the equation entirely, letting you focus purely on pulling with your back. A good pick if regular bent-over rows bother your lower back.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "yci6x",
  name: "Incline Bench Dumbbell Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Rear delts", "Biceps"], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A chest-supported dumbbell row performed on an incline bench.",
  blurb: "Basically the same setup as the chest-supported dumbbell row, just described by the bench angle instead of the support itself. You lie face-down on the incline and row dumbbells up toward your ribs. It's a joint-friendly way to load your upper back hard.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "4nep1",
  name: "Single-Arm Cable Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Lats"], secondary: ["Upper back", "Biceps"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "unilateral", position: "seated", difficulty: "beginner",
  card: "A unilateral cable row emphasizing controlled shoulder extension.",
  blurb: "You stand or kneel at a cable machine and row a single handle toward your body with one arm. Working one side at a time lets you really focus on squeezing your shoulder blade back at the top. It also helps catch any imbalances between your left and right sides.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "y7nqm",
  name: "Seated Cable Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated cable row performed with a stable torso.",
  blurb: "You sit at a cable machine with your feet braced and pull a handle toward your stomach, working your whole upper back at once. It's one of the most straightforward rowing exercises to learn, since the seat and footplate keep you locked in place. Focus on squeezing your shoulder blades together at the end of each pull.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "tj5cb",
  name: "Close-Grip Cable Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Lats"], secondary: ["Upper back", "Biceps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated cable row using a narrow handle.",
  blurb: "A seated cable row using a narrow, close-together handle instead of a wide bar. The closer grip tends to bring your lats and biceps in more. A good variation to rotate in alongside the standard wide-grip cable row.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "gzxlt",
  name: "Wide-Grip Cable Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Rear delts", "Lats", "Biceps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated row using a wider grip to emphasize the upper back.",
  blurb: "A seated cable row using a wide bar instead of a narrow handle. The wider grip shifts more of the emphasis toward your upper back and rear shoulders. Pull the bar toward your upper chest rather than your stomach to keep that emphasis.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "9swgz",
  name: "Chest-Supported Machine Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided row performed with the chest supported against a pad.",
  blurb: "A row performed on a machine where your chest presses against a support pad while you pull the handles back. That chest support removes any temptation to use your lower back or momentum, so all the effort goes into your upper back muscles. A great beginner-friendly rowing option.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "0de0l",
  name: "Machine Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine row through a guided movement path.",
  blurb: "A general seated row done on a machine with a fixed, guided path instead of free cables or dumbbells. Machines like this make it easy to focus purely on the pulling motion without worrying about balance. A solid choice for building rowing strength with less of a learning curve.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "yiy85",
  name: "T-Bar Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A loaded row performed with a bar fixed or held between the legs.",
  blurb: "You straddle or stand over a barbell anchored at one end and row it up toward your chest. The fixed angle of the bar makes for a slightly different pulling path than a standard barbell row. It's a back-builder favorite for adding thickness to your upper back.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "zld0g",
  name: "Landmine Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Biceps"], stabilizers: [] },
  equipment: ["Barbell", "Landmine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A row performed with one end of a barbell fixed to the floor.",
  blurb: "Similar to the T-bar row, but you're rowing one end of a barbell that's anchored to the floor or a landmine attachment. It works your whole upper back with a slightly different angle than a standard row. Handy if you don't have a dedicated T-bar setup.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "l9lrd",
  name: "Meadows Row",
  group: "back", sub: "Rows",
  muscles: { primary: ["Upper back"], secondary: ["Lats", "Rear delts", "Biceps"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Landmine"],
  movementPattern: "Horizontal pull",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A unilateral landmine row performed from a staggered stance.",
  blurb: "A one-arm row done with a landmine-anchored barbell, pulling from a staggered stance. The single-arm setup lets you really twist and squeeze through your upper back and rear shoulder at the top of each rep. It's a favorite for building back thickness and detail.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   BACK — Lat Isolation
   ───────────────────────────────────────────── */

{
  id: "pj6dk",
  name: "Straight-Arm Pulldown",
  group: "back", sub: "Lat Isolation",
  muscles: { primary: ["Lats"], secondary: ["Teres major", "Core"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable exercise that pulls the arms downward while keeping the elbows mostly straight.",
  blurb: "You stand at a cable machine and pull the handle down in an arc with mostly straight arms, rather than bending your elbows like a typical row. This isolates your lats without much help from your biceps. Focus on pulling with your armpits, not just your hands.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "ysbn6",
  name: "Cable Pullover",
  group: "back", sub: "Lat Isolation",
  muscles: { primary: ["Lats"], secondary: ["Teres major"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable pullover emphasizing the lats through shoulder extension.",
  blurb: "Similar to the straight-arm pulldown, but done by pulling the cable down and back in more of a pullover motion. It stretches and works your lats through shoulder extension rather than a rowing motion. A good isolation move to finish off a back workout.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "1hltc",
  name: "Dumbbell Pullover",
  group: "back", sub: "Lat Isolation",
  muscles: { primary: ["Lats"], secondary: ["Chest", "Serratus anterior"], stabilizers: [] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Shoulder extension",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A lying dumbbell movement that moves the arms through an overhead arc.",
  blurb: "You lie on a bench and lower a single dumbbell behind your head in an arc, then pull it back up over your chest. This stretches and works your lats through a big overhead range of motion. Keep the weight light at first since the stretched position can be demanding on the shoulders.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "fnxv3",
  name: "Machine Pullover",
  group: "back", sub: "Lat Isolation",
  muscles: { primary: ["Lats"], secondary: ["Teres major"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Shoulder extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided pullover movement designed to isolate the lats.",
  blurb: "A machine version of the pullover, where you push against a pad with your arms to pull them down in an arc. It's an easy way to isolate your lats without needing to balance a dumbbell overhead. Good for beginners who want the pullover stretch without the technique challenge.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   BACK — Upper Back / Traps
   ───────────────────────────────────────────── */

{
  id: "w7q9t",
  name: "Face Pull",
  group: "back", sub: "Upper back",
  muscles: { primary: ["Rear delts"], secondary: ["Traps", "Rotator cuff"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable pull toward the face that trains the rear shoulders and upper back.",
  blurb: "You pull a cable rope toward your face, elbows flaring out wide, finishing with your hands near your ears. This works your rear shoulders and upper back, and it's especially useful for improving posture and shoulder health. It's a light, high-rep exercise — not one to load up heavy.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "l7ty2",
  name: "Rear Delt Cable Row",
  group: "back", sub: "Upper back",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal pull",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable row performed with the elbows flared to emphasize the rear delts.",
  blurb: "A cable row done with your elbows flared out wide instead of tucked in, which shifts the emphasis toward your rear shoulders and upper back. It's similar in spirit to a face pull but performed more like a row. A great addition if your rear delts and upper back need extra attention.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "1dihs",
  name: "Barbell Shrug",
  group: "back", sub: "Traps",
  muscles: { primary: ["Traps"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Scapular elevation",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A loaded shoulder shrug emphasizing the upper trapezius.",
  blurb: "You hold a loaded barbell and simply shrug your shoulders straight up toward your ears, then lower back down. This directly targets your traps, the muscles that give your upper back and neck area a thicker look. Avoid rolling your shoulders — a straight up-and-down motion is safer and more effective.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "wdin1",
  name: "Dumbbell Shrug",
  group: "back", sub: "Traps",
  muscles: { primary: ["Traps"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Scapular elevation",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A dumbbell shrug performed with the weights at the sides.",
  blurb: "The same shrugging motion as the barbell version, but holding a dumbbell in each hand instead. Dumbbells let your arms hang more naturally at your sides. A good option if a barbell shrug feels awkward or your gym's bar is set up for other lifts.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "1qkni",
  name: "Machine Shrug",
  group: "back", sub: "Traps",
  muscles: { primary: ["Traps"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Scapular elevation",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A machine-based shrug with a guided resistance path.",
  blurb: "A shrug performed on a machine with handles or a padded yoke instead of free weights. The guided motion makes it easy to focus purely on shrugging without worrying about grip or balance. A solid beginner-friendly way to build trap size.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "u4ega",
  name: "Cable Shrug",
  group: "back", sub: "Traps",
  muscles: { primary: ["Traps"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Scapular elevation",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable shrug performed against continuous resistance.",
  blurb: "A shrugging motion performed against a cable instead of a barbell or dumbbells. Cables keep constant tension on your traps throughout the movement, which some people find more effective than free weights. Simple to set up and easy to learn.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   SHOULDERS — Presses
   ───────────────────────────────────────────── */

{
  id: "ftbdr",
  name: "Barbell Overhead Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps", "Upper chest"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A standing barbell press performed from shoulder height to overhead.",
  blurb: "Standing up, you press a barbell from shoulder height straight overhead until your arms are locked out. It's one of the best all-around builders for shoulder strength and size, and it also works your triceps and core for stability. Brace your abs and squeeze your glutes to keep your lower back from arching as you press.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "xc8fu",
  name: "Seated Barbell Overhead Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps"], stabilizers: [] },
  equipment: ["Barbell", "Bench"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "intermediate",
  card: "A barbell overhead press performed while seated.",
  blurb: "The same overhead pressing motion as the standing version, but done seated on a bench for extra stability. Sitting takes your legs out of the movement, so all the work falls on your shoulders and triceps. A good option if balancing a standing press feels shaky.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "6mxt7", // kept — logged history (11 sets, as "Dumbbell Shoulder Press")
  name: "Dumbbell Shoulder Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A shoulder press using two dumbbells.",
  blurb: "You press a dumbbell in each hand from shoulder height up overhead, standing or seated. Because each arm moves independently, it lets your shoulders find a natural pressing path and helps even out any strength differences side to side. A great all-around shoulder builder.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "n7plt",
  name: "Seated Dumbbell Shoulder Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps"], stabilizers: [] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A dumbbell shoulder press performed while seated.",
  blurb: "The same dumbbell shoulder press, done seated with back support instead of standing. Sitting removes the need to stabilize your whole body, letting you focus purely on pressing. A solid choice if you want to isolate your shoulders without worrying about balance.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "hh1qr", // kept — logged history (6 sets, as "Arnold Press")
  name: "Arnold Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A rotating dumbbell shoulder press beginning with the palms facing inward.",
  blurb: "A dumbbell shoulder press with a twist — you start with your palms facing you at shoulder height and rotate them outward as you press overhead. That rotation works your shoulders through a bigger range of motion than a standard press. Go lighter than usual at first since the rotating motion takes some getting used to.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "9d40d",
  name: "Machine Shoulder Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided overhead press performed on a shoulder machine.",
  blurb: "You sit at a machine and push two handles straight up overhead, similar to a dumbbell shoulder press but with a guided, fixed path. The machine handles balance for you, so it's an easy way to safely build shoulder pressing strength. A good option for beginners or anyone easing back into pressing.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "e51jx",
  name: "Single-Arm Dumbbell Press",
  group: "shoulders", sub: "Presses",
  muscles: { primary: ["Front delts"], secondary: ["Side delts", "Triceps", "Core"], stabilizers: ["Core"] },
  equipment: ["Dumbbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A unilateral dumbbell shoulder press requiring additional core stability.",
  blurb: "A dumbbell shoulder press done with one arm at a time instead of both together. Pressing unilaterally forces your core to work hard to keep you from tipping to one side, so it doubles as light core training. It's also useful for fixing side-to-side strength imbalances.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},

/* ─────────────────────────────────────────────
   SHOULDERS — Lateral Delts
   ───────────────────────────────────────────── */

{
  id: "c86i0", // kept — logged history (17 sets, as "Dumbbell Lateral Raise")
  name: "Dumbbell Lateral Raise",
  group: "shoulders", sub: "Lateral Delts",
  muscles: { primary: ["Side delts"], secondary: ["Upper traps"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Shoulder abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A dumbbell raise performed out to the sides to target the lateral deltoids.",
  blurb: "You hold a dumbbell in each hand and raise your arms out to the sides until they're roughly level with your shoulders, then lower back down. This isolates the side of your shoulder, which is what gives shoulders that rounded, capped look. Use lighter weight than you'd expect — strict form matters more than how much you lift here.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "qdwmt",
  name: "Cable Lateral Raise",
  group: "shoulders", sub: "Lateral Delts",
  muscles: { primary: ["Side delts"], secondary: ["Upper traps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A lateral raise performed against cable resistance.",
  blurb: "The same out-to-the-side raise as the dumbbell version, but performed against a cable instead. Cables keep tension on your shoulder throughout the whole movement, even at the bottom where dumbbells go slack. Many people find this makes the exercise feel more effective at the same weight.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "3f0vz",
  name: "Single-Arm Cable Lateral Raise",
  group: "shoulders", sub: "Lateral Delts",
  muscles: { primary: ["Side delts"], secondary: ["Upper traps"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder abduction",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A one-arm cable lateral raise with continuous resistance.",
  blurb: "A cable lateral raise done one arm at a time using a single low pulley. Working one side at a time makes it easy to focus on feeling the correct muscle working, and helps if one shoulder tends to take over during two-handed raises. A great option for really dialing in your form.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "zzgf4",
  name: "Machine Lateral Raise",
  group: "shoulders", sub: "Lateral Delts",
  muscles: { primary: ["Side delts"], secondary: ["Upper traps"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Shoulder abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided lateral raise performed on a shoulder machine.",
  blurb: "A lateral raise performed on a machine with a fixed, guided arm path instead of free weights or cables. The machine handles stability for you, which makes it easier to focus purely on the raising motion. A solid, low-skill way to build shoulder width.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "91cw4",
  name: "Leaning Cable Lateral Raise",
  group: "shoulders", sub: "Lateral Delts",
  muscles: { primary: ["Side delts"], secondary: ["Upper traps"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder abduction",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A cable lateral raise performed while leaning away from the machine.",
  blurb: "You hold onto a cable machine with one hand and lean your body away from it while raising the other arm out to the side. Leaning changes the angle of resistance so your shoulder has to work harder at the start of the raise, where a normal lateral raise feels easiest. A more advanced variation worth trying once the basic raise feels too easy.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   SHOULDERS — Rear Delts
   ───────────────────────────────────────────── */

{
  id: "56r6p", // kept — logged history (13 sets, as "Rear Delt Flyes")
  name: "Reverse Dumbbell Fly",
  group: "shoulders", sub: "Rear Delts",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Horizontal abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A bent-over dumbbell raise targeting the rear shoulders.",
  blurb: "You hinge forward at the hips and raise two dumbbells out to your sides, targeting the back of your shoulders. This is one of the few exercises that directly hits your rear delts, which are easy to neglect but important for shoulder health and posture. Keep the weight light and focus on squeezing your shoulder blades together.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "prjbp",
  name: "Reverse Pec Deck",
  group: "shoulders", sub: "Rear Delts",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Horizontal abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A machine fly performed in reverse to target the rear delts.",
  blurb: "A machine version of the reverse fly, where you push your arms backward against pads instead of raising dumbbells. It's an easy, stable way to target your rear shoulders without worrying about balancing weights while bent over. A good beginner option for building rear delt strength.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "qt9ug",
  name: "Cable Rear Delt Fly",
  group: "shoulders", sub: "Rear Delts",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable fly performed with the arms moving outward to target the rear delts.",
  blurb: "You stand facing a cable machine and pull the handles out and back, targeting your rear shoulders. Cables keep steady tension through the whole movement, which can make this feel more effective than the dumbbell version. A great finisher for rounding out shoulder training.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "ob8q3",
  name: "Single-Arm Cable Rear Delt Fly",
  group: "shoulders", sub: "Rear Delts",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Horizontal abduction",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral cable fly targeting one rear delt at a time.",
  blurb: "A cable rear delt fly done one arm at a time. Working unilaterally lets you focus on really feeling your rear shoulder work and helps catch any imbalance between sides. Keep the weight light — this is a precision exercise, not a heavy lift.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "04pzb",
  name: "Chest-Supported Rear Delt Fly",
  group: "shoulders", sub: "Rear Delts",
  muscles: { primary: ["Rear delts"], secondary: ["Upper back"], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Horizontal abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A rear-delt fly performed with the chest supported on an incline bench.",
  blurb: "You lie face-down on an inclined bench and raise dumbbells out to the sides, targeting your rear shoulders. Having your chest supported removes any temptation to use momentum or your lower back, so all the effort goes into your rear delts. A great strict way to build this often-neglected area.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},

/* ─────────────────────────────────────────────
   SHOULDERS — Front Delts
   ───────────────────────────────────────────── */

{
  id: "spigq",
  name: "Dumbbell Front Raise",
  group: "shoulders", sub: "Front delts",
  muscles: { primary: ["Front delts"], secondary: ["Upper chest"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Shoulder flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A dumbbell raise performed directly in front of the body.",
  blurb: "You hold a dumbbell in each hand and raise them straight out in front of you to about shoulder height. This targets the front of your shoulder, which already gets a lot of work from pressing exercises, so it's often used sparingly. Keep the weight light and avoid swinging the dumbbells up with momentum.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "3zz6j",
  name: "Barbell Front Raise",
  group: "shoulders", sub: "Front delts",
  muscles: { primary: ["Front delts"], secondary: ["Upper chest"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Shoulder flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A front shoulder raise performed with a barbell.",
  blurb: "The same forward raise as the dumbbell version, but using a barbell held with both hands. It works the front of your shoulders through a fixed, symmetrical path. A good option if you prefer barbells over dumbbells for this movement.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "3ij8b",
  name: "Cable Front Raise",
  group: "shoulders", sub: "Front delts",
  muscles: { primary: ["Front delts"], secondary: ["Upper chest"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Shoulder flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A front raise performed against cable resistance.",
  blurb: "A front raise performed against cable resistance instead of dumbbells. The cable keeps tension on your shoulder throughout the movement, even at the bottom of the rep where dumbbells would go slack. A solid alternative if you want a bit more constant challenge.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "49r8m",
  name: "Plate Front Raise",
  group: "shoulders", sub: "Front delts",
  muscles: { primary: ["Front delts"], secondary: ["Upper chest"], stabilizers: [] },
  equipment: ["Weight plate"],
  movementPattern: "Shoulder flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A front raise performed while holding a single weight plate.",
  blurb: "You hold a single weight plate with both hands and raise it straight out in front of you. It works the same front-shoulder muscles as a dumbbell front raise, just using a plate instead. A simple, equipment-light way to add a front-delt exercise to your routine.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   ARMS — Biceps
   ───────────────────────────────────────────── */

{
  id: "q6r23",
  name: "Barbell Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A standing barbell curl targeting the elbow flexors.",
  blurb: "Standing with a barbell in front of you, you curl it up toward your shoulders by bending at the elbows, then lower it back down. It's the classic bicep builder and one of the simplest exercises to learn. Keep your elbows pinned at your sides so your shoulders don't take over the lift.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "alpk1",
  name: "EZ-Bar Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["EZ bar"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A curl performed with an angled EZ bar.",
  blurb: "The same curling motion as a barbell curl, but using an EZ bar, which has angled grips instead of a straight bar. That angle is often easier on the wrists, especially if a straight bar feels uncomfortable. It works your biceps just as effectively.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "38h9s",
  name: "Dumbbell Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A standing curl performed with two dumbbells.",
  blurb: "You curl a dumbbell in each hand up toward your shoulders, either together or one at a time. Dumbbells let your wrists rotate naturally as you lift, which some people find more comfortable than a fixed barbell. A great foundational bicep exercise.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "xp35e",
  name: "Alternating Dumbbell Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A dumbbell curl performed one arm at a time.",
  blurb: "A dumbbell curl where you lift one arm at a time instead of both together. Alternating lets you focus fully on each rep and makes it easier to keep good form throughout. It's a simple way to make sure both arms are working equally hard.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "u2oux",
  name: "Hammer Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Brachialis"], secondary: ["Biceps", "Brachioradialis"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A neutral-grip dumbbell curl emphasizing the brachialis and forearms.",
  blurb: "You curl dumbbells with your palms facing each other the whole time, like you're holding a hammer, instead of rotating your palms up. This grip shifts some of the work to the muscle on the side of your upper arm and your forearms, alongside your biceps. A great complement to standard curls.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "6ftgp",
  name: "Cross-Body Hammer Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Brachialis"], secondary: ["Biceps", "Brachioradialis"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A hammer curl performed diagonally across the body.",
  blurb: "A hammer curl where you bring the dumbbell up and across your body toward the opposite shoulder, instead of straight up. That diagonal path changes the angle slightly and can feel more natural for some people. It still targets the same muscles as a regular hammer curl.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "onkz4", // kept — logged history (14 sets, as "Incline Bicep Curls")
  name: "Incline Dumbbell Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "intermediate",
  card: "A seated curl performed on an incline bench with the arms behind the torso.",
  blurb: "You sit on an incline bench with your arms hanging straight down behind you and curl the weight up from there. Starting with your arms behind your torso puts your biceps in a stretched position from the very first rep, which many people find makes the exercise feel more intense. A great way to add variety to your bicep training.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "v41y7",
  name: "Preacher Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Barbell", "EZ bar"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A curl performed with the upper arms supported against a preacher pad.",
  blurb: "You rest your upper arms on an angled pad and curl a bar up from there. The pad locks your upper arms in place, so you can't swing or use momentum to help lift the weight. It's a strict, cheat-proof way to isolate your biceps.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "ewb02",
  name: "Dumbbell Preacher Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "seated", difficulty: "beginner",
  card: "A unilateral preacher curl performed with a dumbbell.",
  blurb: "The same preacher curl setup, but using a single dumbbell and one arm at a time instead of a bar. Working unilaterally lets you really focus on squeezing each rep and catch any strength differences between arms. A precise way to build bicep detail.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "xe309",
  name: "Machine Preacher Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided preacher curl performed on a machine.",
  blurb: "A preacher curl performed on a machine with a fixed, guided arm path instead of a free bar. The machine takes care of stability, so all you have to focus on is curling. A good low-skill way to safely isolate your biceps.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "wvb43",
  name: "Cable Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A curl performed against continuous cable resistance.",
  blurb: "You curl a cable attachment up toward your shoulders, similar to a barbell curl but with constant tension from the cable instead of gravity alone. That steady tension, even at the bottom of the movement, is something free weights can't fully replicate. A solid finisher for bicep work.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "86ox4",
  name: "Single-Arm Cable Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral cable curl performed one arm at a time.",
  blurb: "A cable curl done one arm at a time using a single low pulley. Working unilaterally lets you focus on feeling each rep and fixing any imbalance between arms. It also lets you rotate your wrist slightly for a stronger squeeze at the top.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "rr16x",
  name: "Bayesian Cable Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A cable curl performed with the arm positioned behind the torso.",
  blurb: "You stand facing away from a low cable and curl with your arm positioned behind your torso. Starting from behind your body stretches your bicep more at the bottom of the movement than a standard curl does. A more advanced variation once regular cable curls feel comfortable.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "ojgyp",
  name: "Spider Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Dumbbell", "EZ bar", "Incline bench"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A curl performed chest-down on an incline bench.",
  blurb: "Similar to a preacher curl, but you lean your chest against a steep incline bench with your arms hanging straight down in front of you. This position keeps constant tension on your biceps throughout the whole rep, with no rest at the top or bottom. Use lighter weight than a standard curl since this variation is more demanding.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "b4lwc",
  name: "Concentration Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "seated", difficulty: "beginner",
  card: "A seated one-arm curl with the upper arm braced against the leg.",
  blurb: "Sitting down, you brace one elbow against the inside of your thigh and curl a single dumbbell up. Bracing your arm removes any swinging or momentum, forcing your bicep to do all the work. A great exercise for really focusing on the muscle and building a strong mind-muscle connection.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "lz7th",
  name: "Drag Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A barbell curl where the elbows travel backward as the bar rises.",
  blurb: "A barbell curl where you keep the bar close to your body and let your elbows drift backward as you curl, instead of keeping them fixed at your sides. That backward elbow path changes the angle of pull on your bicep. It's a more advanced variation worth trying once your curl form is solid.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "jjmuy",
  name: "Reverse Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Brachioradialis"], secondary: ["Biceps", "Forearms"], stabilizers: [] },
  equipment: ["Barbell", "EZ bar"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "An overhand curl emphasizing the forearms and brachioradialis.",
  blurb: "You curl a bar with your palms facing down instead of up, which is the opposite grip from a normal curl. This shifts the emphasis onto your forearms and the muscle on the outer part of your upper arm, rather than your biceps directly. A useful exercise for building grip and forearm strength alongside arm size.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "12pym",
  name: "Zottman Curl",
  group: "arms", sub: "Biceps",
  muscles: { primary: ["Biceps"], secondary: ["Brachialis", "Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A dumbbell curl combining a supinated lift with a pronated lowering phase.",
  blurb: "You curl a dumbbell up with your palms facing up like a normal curl, but then rotate your wrists so your palms face down as you lower it back. That combination trains your biceps on the way up and your forearms on the way down. A great two-for-one exercise for arm and grip strength.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},

/* ─────────────────────────────────────────────
   ARMS — Triceps
   ───────────────────────────────────────────── */

{
  id: "eejic",
  name: "Skull Crusher",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Barbell", "EZ bar", "Bench"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A lying triceps extension performed by lowering a weight toward the forehead.",
  blurb: "Lying on a bench, you lower a barbell down toward your forehead by bending only at the elbows, then press it back up. Despite the name, the goal is to lower it under control, not actually hit your head. It's a strong tricep isolation move — start light until you're confident with the motion.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "hevs6",
  name: "EZ-Bar Skull Crusher",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["EZ bar", "Bench"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A lying triceps extension using an angled EZ bar.",
  blurb: "The same lying tricep extension as a skull crusher, but using an EZ bar with angled grips instead of a straight one. That angle is usually easier on the wrists. It targets your triceps just as effectively as the straight-bar version.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "988rh",
  name: "Dumbbell Skull Crusher",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A lying triceps extension performed with dumbbells.",
  blurb: "A skull crusher done with dumbbells instead of a barbell. Dumbbells let each arm move independently and your wrists rotate slightly, which some people find more comfortable. A solid tricep builder either way.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "8hksp",
  name: "Incline Dumbbell Skull Crusher",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Dumbbell", "Incline bench"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A triceps extension performed on an incline bench.",
  blurb: "The dumbbell skull crusher performed on an incline bench instead of flat. The incline changes the angle slightly, putting a bit more constant tension on your triceps throughout the movement. A good variation once the flat version feels routine.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "z6w58", // kept — logged history (8 sets, as "Tricep Overhead Extension")
  name: "Overhead Dumbbell Extension",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "An overhead triceps extension performed with a dumbbell.",
  blurb: "Standing or seated, you hold a dumbbell with both hands behind your head and extend your arms straight up overhead. This works your triceps through a big stretch at the bottom, which many people find more effective than pushdown-style exercises. Keep your elbows pointed forward, not flared out to the sides.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "j0sxt",
  name: "Single-Arm Overhead Dumbbell Extension",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral overhead triceps extension.",
  blurb: "The same overhead extension, done with one arm and one dumbbell instead of two hands on one weight. Working unilaterally lets you focus on each arm individually and helps fix any strength imbalance. A great follow-up once the two-handed version feels comfortable.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "7qes7",
  name: "Cable Overhead Triceps Extension",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "An overhead triceps extension performed against cable resistance.",
  blurb: "An overhead tricep extension using a cable instead of a dumbbell, usually facing away from the machine. The cable keeps tension on your triceps throughout the whole movement, even at the top where a dumbbell would go slack. A great way to add variety to your tricep training.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "vg036",
  name: "EZ-Bar Overhead Extension",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["EZ bar"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "An overhead triceps extension performed with an EZ bar.",
  blurb: "The overhead extension motion done with an EZ bar instead of a dumbbell or cable. The angled grips make it a bit easier on the wrists during the overhead stretch. Works your triceps the same way as the other overhead variations.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "oi4x5",
  name: "Cable Triceps Pushdown",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A standing cable extension performed by pressing the handle downward.",
  blurb: "You stand at a cable machine and push a bar straight down by extending your elbows, then let it back up under control. This is one of the most common tricep exercises in any gym, and for good reason — it's simple, effective, and easy to learn. Keep your elbows tucked at your sides throughout, rather than letting them drift forward.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "5ny7l",
  name: "Rope Triceps Pushdown",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A pushdown performed with a rope attachment.",
  blurb: "The same pushdown motion as the cable version, but using a rope attachment instead of a straight bar. The rope lets your hands spread apart at the bottom, which can add a bit of extra squeeze to the movement. A popular variation for really finishing off your triceps.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "ilnfw",
  name: "Straight-Bar Triceps Pushdown",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable pushdown performed with a straight bar.",
  blurb: "A tricep pushdown using a straight bar attachment instead of a rope or angled bar. It's essentially the same movement, just with a different handle — some people find a straight bar allows a stronger grip. Keep your elbows locked at your sides as you push down.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "zuirc",
  name: "Single-Arm Cable Pushdown",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral cable pushdown performed one arm at a time.",
  blurb: "A cable pushdown done one arm at a time using a single handle. Working unilaterally lets you focus on each arm and catch any imbalance between sides. It also lets you rotate your wrist slightly for a stronger contraction.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "rgbw3",
  name: "Reverse-Grip Pushdown",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Elbow extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable pushdown performed with an underhand grip.",
  blurb: "A tricep pushdown done with your palms facing up instead of down, which is the opposite grip from the standard version. This grip shifts the emphasis slightly and can feel different on the elbows. A good variation to mix in for some training variety.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "gdgra",
  name: "Weighted Dip",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: ["Chest", "Front delts"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Weight plate"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "advanced",
  card: "A bodyweight dip performed with additional external weight.",
  blurb: "You lower your body between two parallel bars by bending your elbows, then push back up, with extra weight attached for added resistance. Once bodyweight dips feel easy, this is how you keep progressing. It's a serious tricep and chest builder, so add weight gradually.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "bodyweight", sets: 3
},
{
  id: "c5quu",
  name: "Bench Dip",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: ["Chest", "Front delts"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Bench"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A bodyweight triceps dip performed with the hands behind the body.",
  blurb: "You place your hands behind you on a bench and lower your hips toward the floor by bending your elbows, then push back up. It's a simple bodyweight way to train your triceps without needing dip bars. Keep your hips close to the bench rather than drifting forward, which protects your shoulders.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "1qbub",
  name: "Machine Dip",
  group: "arms", sub: "Triceps",
  muscles: { primary: ["Triceps"], secondary: ["Chest", "Front delts"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided dip movement performed on a resistance machine.",
  blurb: "A dip performed on a machine with a guided, fixed path instead of free-standing dip bars. The machine handles the balance and stability for you, making it an easier and safer way to build dip strength. A great option if bodyweight dips are still too challenging.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   ARMS — Forearms / Grip
   ───────────────────────────────────────────── */

{
  id: "0rp36",
  name: "Wrist Curl",
  group: "arms", sub: "Forearms",
  muscles: { primary: ["Wrist flexors"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Barbell", "Dumbbell"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A forearm isolation exercise using repeated wrist flexion.",
  blurb: "You rest your forearms on a bench or your thighs with your palms up, holding a bar, and curl your wrists up and down. It directly targets your forearms, which don't get much focused attention from bigger lifts. Use light weight and higher reps — this is a small muscle group that responds well to that.",
  reps: "12-20", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "hkx0e",
  name: "Reverse Wrist Curl",
  group: "arms", sub: "Forearms",
  muscles: { primary: ["Wrist extensors"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Barbell", "Dumbbell"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A forearm exercise using repeated wrist extension.",
  blurb: "The same setup as a wrist curl, but with your palms facing down instead of up. This works the opposite side of your forearm from a regular wrist curl. Doing both versions together gives your forearms balanced training.",
  reps: "12-20", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "h2hjc",
  name: "Dumbbell Wrist Curl",
  group: "arms", sub: "Forearms",
  muscles: { primary: ["Wrist flexors"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A wrist curl performed with dumbbells.",
  blurb: "A wrist curl performed with a dumbbell in each hand instead of a barbell. Dumbbells let each wrist move independently, which can feel more natural. Works the same forearm muscles as the barbell version.",
  reps: "12-20", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "mqute",
  name: "Reverse Dumbbell Wrist Curl",
  group: "arms", sub: "Forearms",
  muscles: { primary: ["Wrist extensors"], secondary: ["Forearms"], stabilizers: [] },
  equipment: ["Dumbbell"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A reverse wrist curl performed with dumbbells.",
  blurb: "The reverse wrist curl motion, done with dumbbells instead of a barbell. Your palms face down and you curl your wrists up and down to work the top of your forearm. A good complement to a regular dumbbell wrist curl.",
  reps: "12-20", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "qian2",
  name: "Farmer's Carry",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Traps", "Core", "Legs"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Kettlebell"],
  movementPattern: "Carry",
  exerciseType: "carry", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A loaded carry performed while walking with weights at the sides.",
  blurb: "You pick up a heavy dumbbell or kettlebell in each hand and simply walk for a set distance or time. It's a deceptively simple exercise that builds serious grip, forearm, and core strength, all at once. Keep your shoulders back and core tight rather than letting the weight pull you forward.",
  reps: "30-60 sec", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "0mkvr",
  name: "Suitcase Carry",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Core", "Traps"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Kettlebell"],
  movementPattern: "Carry",
  exerciseType: "carry", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A one-sided loaded carry that challenges grip and core stability.",
  blurb: "Like a farmer's carry, but you hold the weight in just one hand instead of both. Carrying unevenly forces your core to work hard to keep you from tipping to one side. A great way to build grip strength and core stability together.",
  reps: "30-60 sec", rest: "60 sec", restSecs: 60, type: "dumbbell", sets: 3
},
{
  id: "quw4s",
  name: "Plate Pinch",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Hand muscles"], stabilizers: [] },
  equipment: ["Weight plate"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A grip exercise performed by pinching smooth weight plates between the fingers and thumb.",
  blurb: "You hold two smooth weight plates together, gripping them only with your fingers and thumb, and hold that position. This is a pure grip-strength exercise with no other muscles doing the work. It looks simple but is surprisingly tough — start with lighter plates than you'd expect.",
  reps: "20-30 sec", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "g9v9g",
  name: "Dead Hang",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Lats", "Shoulders"], stabilizers: [] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "hanging", difficulty: "beginner",
  card: "A static hang from a pull-up bar that challenges grip endurance.",
  blurb: "You simply hang from a pull-up bar with your arms fully extended and hold the position. It's one of the simplest ways to build grip endurance, and it also gently stretches your shoulders and back. A great low-impact addition to any workout.",
  reps: "20-45 sec", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "v87dm",
  name: "Towel Hang",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Lats", "Shoulders"], stabilizers: [] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "hanging", difficulty: "advanced",
  card: "A hanging grip exercise performed while holding a towel.",
  blurb: "Similar to a dead hang, but you hang from a towel draped over the bar instead of gripping the bar directly. The towel's thickness makes it much harder to hold onto, seriously challenging your grip. Work up to this once regular dead hangs feel easy.",
  reps: "15-30 sec", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "ig8qd",
  name: "Barbell Hold",
  group: "arms", sub: "Grip",
  muscles: { primary: ["Forearms"], secondary: ["Traps"], stabilizers: [] },
  equipment: ["Barbell"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A static barbell hold designed to train grip endurance.",
  blurb: "You simply hold a loaded barbell in your hands and stand there, letting your grip do all the work. It's about as straightforward as exercises get, but it's an effective way to build raw grip and forearm endurance. Good as a finisher after your main lifts.",
  reps: "20-45 sec", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Quads (Squats)
   ───────────────────────────────────────────── */

{
  id: "275yf",
  name: "Barbell Back Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Squat rack"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A loaded squat performed with a barbell across the upper back.",
  blurb: "You rest a barbell across your upper back and squat down until your thighs are at least parallel to the floor, then stand back up. It's one of the most effective exercises for building leg and glute strength overall, and it also trains your core. Keep your chest up and knees tracking over your toes as you descend.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "f8d60",
  name: "High-Bar Back Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Squat rack"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A back squat performed with the bar positioned higher on the upper back.",
  blurb: "A back squat with the bar positioned higher on your traps rather than lower on your rear shoulders. This bar position tends to keep your torso more upright, which shifts a bit more emphasis onto your quads. It's the more common squat style you'll see in most gyms.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "9wqc0",
  name: "Low-Bar Back Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Squat rack"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A back squat performed with the bar positioned lower across the shoulders.",
  blurb: "A back squat with the bar set lower, across the rear of your shoulders. This position lets you lean forward more and typically lets you lift heavier, while bringing your hips and hamstrings into the movement more. It takes some practice to get the bar placement comfortable.",
  reps: "5-8", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "qx7dm",
  name: "Front Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Core", "Upper back"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Squat rack"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A squat performed with the bar supported across the front of the shoulders.",
  blurb: "You hold the barbell across the front of your shoulders instead of your back, then squat down and stand back up. That front-loaded position forces a more upright torso and puts extra emphasis on your quads. It also demands solid shoulder and wrist mobility to hold the bar in place.",
  reps: "6-8", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "dasom",
  name: "Box Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Box"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A squat performed to a box or bench to standardize depth.",
  blurb: "A squat where you sit back onto a box or bench at the bottom before standing back up, instead of squatting to a self-judged depth. The box gives you a consistent depth to hit every rep and forces you to sit back rather than just bend your knees. A great way to build control and confidence in your squat.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "7sjuh",
  name: "Safety Bar Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Upper back", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Squat rack"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A squat performed with a safety bar that changes the loading position.",
  blurb: "A squat performed with a specialized bar that rests on padded yokes around your shoulders instead of directly on your back. This bar shifts some of the balance demands compared to a straight barbell, which some people find easier on their shoulders and wrists. A useful option if a normal barbell squat feels uncomfortable.",
  reps: "6-10", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "guotf",
  name: "Smith Machine Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes"], stabilizers: [] },
  equipment: ["Smith machine"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A guided squat performed on a Smith machine.",
  blurb: "A squat performed on a Smith machine, where the bar moves along a fixed vertical track. That guided path removes the balancing act of a free squat, letting you focus purely on pushing through your legs. A good option for beginners or when training without a spotter.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "qam12",
  name: "Goblet Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Core"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Kettlebell"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A squat performed while holding a weight in front of the chest.",
  blurb: "You hold a single dumbbell or kettlebell close to your chest and squat down, then stand back up. Holding the weight in front naturally encourages good squat form and an upright torso. It's one of the easiest squat variations to learn, making it great for beginners.",
  reps: "10-15", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "rg7k5",
  name: "Hack Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A machine squat performed along a fixed angled path.",
  blurb: "You sit in a machine with a padded platform and push the weight up by extending your legs, at an angle rather than straight up like a standing squat. The machine handles your balance, letting you focus purely on driving through your legs. A great way to load your quads heavily with less technical skill required.",
  reps: "8-12", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "f06gx",
  name: "Belt Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A squat loaded through a belt around the hips rather than the shoulders.",
  blurb: "A squat where the weight hangs from a belt around your hips instead of resting on your shoulders. Since the load pulls straight down through your hips rather than your spine, it's often easier on your back. A good option if you want to squat heavy without loading your upper body.",
  reps: "8-12", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Quads (Unilateral / Lunges)
   ───────────────────────────────────────────── */

{
  id: "i5pkg", // kept — logged history (8 sets, as "Bulgarian Split Squats")
  name: "Bulgarian Split Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Barbell", "Bench"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A single-leg squat variation with the rear foot elevated.",
  blurb: "You put one foot up on a bench behind you and squat down on the other leg, with weights in your hands for extra resistance. It's a serious single-leg challenge that builds strength and balance at the same time. Keep most of your weight on your front leg and don't let your front knee cave inward.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "j6k5g",
  name: "Dumbbell Split Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Dumbbell"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A stationary split squat performed while holding dumbbells.",
  blurb: "A split squat done while holding dumbbells, with your rear foot staying on the ground instead of elevated. It's an easier entry point than a Bulgarian split squat before you add the elevated back foot. Great for building single-leg strength with less balance demand.",
  reps: "10-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "9o9hp",
  name: "Front-Foot Elevated Split Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Bodyweight"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A split squat with the front foot elevated to increase range of motion.",
  blurb: "A split squat with your front foot raised on a small platform instead of flat on the floor. That elevation lets your front knee travel further forward, giving your quad a bigger range of motion. A more advanced variation once regular split squats feel comfortable.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "ouklu",
  name: "Reverse Lunge",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Dumbbell", "Barbell"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A lunge performed by stepping backward into the split stance.",
  blurb: "From standing, you step one leg backward into a lunge position, lower down, then push back up to standing. Stepping back tends to be a bit gentler on the knees than stepping forward. A great single-leg exercise that also challenges your balance.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "o2h3u",
  name: "Forward Lunge",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Dumbbell", "Barbell"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A lunge performed by stepping forward into the split stance.",
  blurb: "From standing, you step one leg forward into a lunge position, lower down, then push back to standing. It's one of the most familiar leg exercises and works your whole leg along with your balance. Keep your front knee from traveling too far past your toes.",
  reps: "10-12", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "8zyz2",
  name: "Walking Lunge",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Dumbbell", "Barbell"],
  movementPattern: "Lunge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "Alternating lunges performed continuously while moving forward.",
  blurb: "You lunge forward with one leg, then instead of stepping back, you bring your other leg through into the next lunge, walking forward continuously. This adds a cardio and coordination element on top of the usual lunge muscle work. A great finisher for a leg workout.",
  reps: "10-12 steps", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "vevtf", // kept — logged history (1 set, as "Dumbbell Step-ups")
  name: "Step-Up",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bench", "Box", "Dumbbell"],
  movementPattern: "Step",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral leg exercise performed by stepping onto an elevated platform.",
  blurb: "You step up onto a bench or box with one leg, driving through that foot to bring your whole body up, then step back down. It's a simple, functional exercise that mimics everyday movements like climbing stairs. Focus on pushing through your front foot rather than pushing off the bottom leg.",
  reps: "10-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Quads (Isolation)
   ───────────────────────────────────────────── */

{
  id: "1c206",
  name: "Leg Extension",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine exercise that isolates the quadriceps through knee extension.",
  blurb: "You sit in a machine and extend your legs against resistance, working only your knee joint. It's one of the most direct ways to isolate your quads without involving your hips or glutes. A great addition if you want extra quad-focused volume beyond squats.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "sr4l4",
  name: "Single-Leg Leg Extension",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "unilateral", position: "seated", difficulty: "beginner",
  card: "A unilateral leg extension performed one leg at a time.",
  blurb: "A leg extension done one leg at a time instead of both together. Working unilaterally lets you focus on each leg individually and catch any strength imbalance between them. Same simple, isolated quad movement as the two-leg version.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Hamstrings (Hinges)
   ───────────────────────────────────────────── */

{
  id: "53e3m",
  name: "Romanian Deadlift",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A controlled hip hinge performed with a barbell while maintaining a relatively fixed knee angle.",
  blurb: "You hold a barbell and hinge forward at your hips, lowering the bar down your legs while keeping a slight bend in your knees, then drive your hips forward to stand back up. This targets your hamstrings and glutes through a big stretch at the bottom. Keep the bar close to your legs and your back flat throughout.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "0yilr", // kept — logged history (16 sets, as "Dumbbell Romanian Deadlift")
  name: "Dumbbell Romanian Deadlift",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Dumbbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A Romanian deadlift performed with dumbbells.",
  blurb: "The same hip-hinging movement as a barbell Romanian deadlift, but using dumbbells instead. Dumbbells let your arms hang more naturally at your sides and can feel easier to control for beginners. Works your hamstrings and glutes the same way as the barbell version.",
  reps: "10-12", rest: "75 sec", restSecs: 75, type: "dumbbell", sets: 3
},
{
  id: "e0vsg",
  name: "Single-Leg Romanian Deadlift",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Core"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Kettlebell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A unilateral hip hinge performed on one leg.",
  blurb: "A Romanian deadlift done while balancing on one leg, with your other leg extending back behind you for counterbalance. It's a serious hamstring and balance challenge in one move. Start with light weight and a wall or sturdy object nearby until your balance improves.",
  reps: "8-10", rest: "75 sec", restSecs: 75, type: "dumbbell", sets: 3
},
{
  id: "4tbvh",
  name: "Stiff-Leg Deadlift",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A deadlift variation performed with minimal knee bend.",
  blurb: "Similar to a Romanian deadlift, but performed with straighter legs throughout, which increases the stretch on your hamstrings. Because there's less knee bend to share the load, this version tends to feel more intense. Go lighter than your regular deadlift weight until you're used to the extra stretch.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "9d8n8",
  name: "Good Morning",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A loaded hip hinge performed with a barbell across the upper back.",
  blurb: "You rest a barbell across your upper back like a squat, then hinge forward at your hips with a slight knee bend until your torso is close to parallel with the floor, then stand back up. This is an advanced hamstring and lower-back exercise that requires careful form. Start very light and focus on hinging at your hips, not rounding your spine.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "5yej7",
  name: "Barbell Good Morning",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A barbell hip hinge performed with the weight supported across the upper back.",
  blurb: "The same hip-hinge movement as a good morning, just naming the barbell specifically since that's the standard way it's performed. You bend forward from the hips with the bar on your back, then return to standing. Always prioritize a flat back and light weight when learning this one.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Hamstrings (Curls)
   ───────────────────────────────────────────── */

{
  id: "5dvyq",
  name: "Lying Leg Curl",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Calves"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A prone machine curl that isolates the hamstrings through knee flexion.",
  blurb: "You lie face-down on a machine and curl your legs up toward your glutes by bending only at the knees. It's one of the most direct ways to isolate your hamstrings without involving your hips. A great complement to hip-hinge exercises like Romanian deadlifts.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "xksg6",
  name: "Seated Leg Curl",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Calves"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine curl targeting the hamstrings.",
  blurb: "The same knee-bending curl motion as the lying version, but performed seated on a machine instead. Sitting changes the angle slightly and some people find it more comfortable than lying face-down. Works your hamstrings just as effectively.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "dt2so",
  name: "Standing Leg Curl",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Calves"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A standing unilateral leg curl.",
  blurb: "A leg curl performed while standing, working one leg at a time. Standing changes the hip angle slightly compared to lying or seated versions, giving your hamstrings a bit of variety. Also naturally trains one leg at a time, which helps balance strength between sides.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "0hjqt",
  name: "Single-Leg Leg Curl",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Calves"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "unilateral", position: "lying", difficulty: "beginner",
  card: "A unilateral hamstring curl performed one leg at a time.",
  blurb: "A leg curl machine used one leg at a time instead of both together. Working unilaterally lets you focus fully on each leg and catch any strength imbalance. Otherwise, it's the same simple knee-flexion movement as the two-leg version.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "dkn4w",
  name: "Nordic Hamstring Curl",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "kneeling", difficulty: "advanced",
  card: "A bodyweight hamstring exercise emphasizing controlled lowering.",
  blurb: "You kneel with your ankles anchored and slowly lower your torso forward toward the floor, using only your hamstrings to control the descent, then use your arms to push back up. This is one of the most challenging bodyweight hamstring exercises out there. Start with a partner or band assistance until you build up enough strength to lower yourself under control.",
  reps: "5-8", rest: "90 sec", restSecs: 90, type: "bodyweight", sets: 3
},
{
  id: "pqgj5",
  name: "Glute-Ham Raise",
  group: "legs", sub: "Hamstrings",
  muscles: { primary: ["Hamstrings"], secondary: ["Glutes", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "advanced",
  card: "A combined hamstring curl and hip extension performed on a GHD machine.",
  blurb: "You anchor your feet and hinge your body forward and back through a combination of hamstring curling and hip extension, using a specialized bench or machine. It works your hamstrings, glutes, and lower back together in one demanding movement. This is an advanced exercise, so build up strength with regular leg curls and hip hinges first.",
  reps: "6-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Glutes
   ───────────────────────────────────────────── */

{
  id: "3n20d",
  name: "Barbell Hip Thrust",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Bench"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A loaded hip extension performed with the upper back supported on a bench.",
  blurb: "You sit on the ground with your upper back against a bench and a barbell across your hips, then drive your hips up until your body forms a straight line, before lowering back down. This is one of the best exercises for directly targeting your glutes. Keep your chin tucked and squeeze your glutes hard at the top of each rep.",
  reps: "8-12", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "3y5au", // kept — logged history (25 sets, as "Dumbbell Hip Thrust (bench)")
  name: "Dumbbell Hip Thrust",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Bench"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A hip thrust performed with a dumbbell resting across the hips.",
  blurb: "The same hip-driving movement as a barbell hip thrust, but using a dumbbell resting across your hips instead of a barbell. It's often easier to set up than a barbell version, especially at home or in a busy gym. Squeeze your glutes at the top just like the barbell version.",
  reps: "10-12", rest: "75 sec", restSecs: 75, type: "dumbbell", sets: 3
},
{
  id: "4fj1g",
  name: "Smith Machine Hip Thrust",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: [] },
  equipment: ["Smith machine", "Bench"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A hip thrust performed with a guided Smith machine bar.",
  blurb: "A hip thrust performed using a Smith machine bar, which moves along a fixed track instead of freely. That guided path can make the setup feel more stable and secure. Works your glutes the same way as a barbell hip thrust.",
  reps: "8-12", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "2xtl0",
  name: "Machine Hip Thrust",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided hip thrust performed on a dedicated machine.",
  blurb: "A hip thrust performed on a dedicated machine with a padded seat, rather than a barbell and bench setup. The machine makes it quick and easy to get into position without fussing with plates and pads. A convenient, glute-focused option if your gym has one.",
  reps: "10-12", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "h9ve3",
  name: "Glute Bridge",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A floor-based hip extension using the glutes to raise the hips.",
  blurb: "You lie on your back with your knees bent and feet flat on the floor, then lift your hips up by squeezing your glutes, and lower back down. It's a simple bodyweight introduction to hip-extension training. A great starting point before progressing to loaded hip thrusts.",
  reps: "15-20", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "2uuce",
  name: "Single-Leg Glute Bridge",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Hip extension",
  exerciseType: "compound", laterality: "unilateral", position: "lying", difficulty: "beginner",
  card: "A unilateral glute bridge performed with one foot off the floor.",
  blurb: "The same hip-lifting motion as a glute bridge, but performed with one foot lifted off the floor instead of both feet down. Working one leg at a time makes the exercise noticeably more challenging and helps address any side-to-side imbalance. A good progression once regular glute bridges feel easy.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "9oek8",
  name: "Cable Pull-Through",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable hip-hinge movement emphasizing glute-driven hip extension.",
  blurb: "You stand facing away from a low cable, hinge forward at your hips to reach the handle between your legs, then drive your hips forward to standing. This trains the same hip-hinge pattern as a Romanian deadlift but with steady cable tension. A great option for building glutes with less spinal loading than a barbell.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "no2g1",
  name: "High Step-Up",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Quads", "Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Box", "Bench"],
  movementPattern: "Step",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "A high step-up using a greater hip range of motion.",
  blurb: "A step-up performed onto a taller box or bench than usual, requiring a bigger range of motion at your hip. That extra hip travel brings your glutes into the movement more than a standard step-up. Make sure the platform is stable and appropriately sized for your height before loading up.",
  reps: "8-10", rest: "90 sec", restSecs: 90, type: "bodyweight", sets: 3
},
{
  id: "81fuj",
  name: "Cable Kickback",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Hip extension",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral cable hip extension that isolates the glutes.",
  blurb: "You attach a cuff to your ankle at a cable machine and kick your leg back and up, working one glute at a time. It's a focused, isolated way to target your glutes without much else getting involved. Keep the movement controlled rather than using momentum to swing your leg back.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "imbd8", // kept — logged history (7 sets, as "Donkey Kicks")
  name: "Donkey Kick",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Hip extension",
  exerciseType: "isolation", laterality: "unilateral", position: "kneeling", difficulty: "beginner",
  card: "A kneeling bodyweight hip extension performed one leg at a time.",
  blurb: "On your hands and knees, you kick one leg up and back like a mule, squeezing your glute at the top. It's a simple bodyweight way to isolate your glutes with no equipment needed. Keep your core braced so your lower back doesn't arch as you kick.",
  reps: "12-15", rest: "30 sec", restSecs: 30, type: "bodyweight", sets: 3
},
{
  id: "0aru9",
  name: "Machine Hip Abduction",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Abduction",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated machine exercise that moves the knees outward against resistance.",
  blurb: "You sit in a machine with pads against the outside of your knees and push your legs apart against resistance. This targets the outer side of your glutes, which helps with hip stability and shape. A straightforward, low-skill exercise to isolate that area.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "7hew0",
  name: "Cable Hip Abduction",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: [], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Abduction",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral cable movement that raises the leg outward.",
  blurb: "You attach a cuff to your ankle at a cable machine and raise your leg out to the side, away from your body. This works the same outer glute muscles as the hip abduction machine, just with cable resistance instead. Keep your torso stable and avoid leaning to help lift the leg.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "5t4zc",
  name: "Frog Pump",
  group: "legs", sub: "Glutes",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Hip extension",
  exerciseType: "isolation", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A glute-focused floor exercise performed with the soles of the feet together.",
  blurb: "You lie on your back with the soles of your feet together and knees bent out to the sides, then lift and lower your hips. The wide knee position emphasizes your glutes in a slightly different way than a standard glute bridge. A great high-rep finisher for glute training.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},

/* ─────────────────────────────────────────────
   LEGS — Calves
   ───────────────────────────────────────────── */

{
  id: "71814",
  name: "Standing Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Machine", "Bodyweight"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A standing calf raise emphasizing the gastrocnemius.",
  blurb: "Standing, you rise up onto your toes by pressing through the balls of your feet, then lower back down. This is the most direct way to build calf size and strength. Use a full range of motion, lowering your heels below the platform for a good stretch, rather than just bouncing at the top.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "ikyui",
  name: "Seated Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated calf raise performed with the knees bent.",
  blurb: "The same rising-onto-your-toes motion as a standing calf raise, but performed seated with your knees bent. The bent-knee position shifts emphasis toward a different part of your calf than the standing version. Both are worth including for complete calf development.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "71wfv",
  name: "Leg Press Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A calf raise performed from the foot platform of a leg press.",
  blurb: "You perform a calf raise using the foot platform of a leg press machine instead of standing on the floor. This lets you load significant weight onto your calves without needing to balance a bar on your back. A convenient way to add heavy calf work into a leg day.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "s8nze",
  name: "Smith Machine Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Smith machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A standing calf raise performed beneath a Smith machine bar.",
  blurb: "A standing calf raise performed with a Smith machine bar across your shoulders instead of a dedicated calf machine. The fixed bar path adds stability while letting you load weight onto the movement. A good substitute if your gym doesn't have a calf raise machine.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "i4vm1", // kept — logged history (4 sets, as "Bodyweight Calf Raise")
  name: "Single-Leg Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Bodyweight", "Dumbbell"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A unilateral calf raise performed on one leg.",
  blurb: "A calf raise done on one leg at a time, either with or without added weight. Working unilaterally makes the exercise noticeably harder and helps ensure both calves are developing evenly. A great bodyweight option that needs no equipment at all.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 2
},
{
  id: "dlmdx",
  name: "Donkey Calf Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Calves"], secondary: [], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Extension",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A calf raise performed with the torso hinged forward.",
  blurb: "You hinge forward at the hips with your upper body supported, then perform a calf raise from that bent-over position. Leaning forward changes the stretch on your calf slightly compared to standing upright. A more advanced calf variation worth adding once the basics feel easy.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "qx6sa",
  name: "Tibialis Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Tibialis anterior"], secondary: [], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A lower-leg exercise that lifts the toes toward the shin.",
  blurb: "Standing, you lift your toes up toward your shins, working the muscle on the front of your lower leg rather than your calf. This muscle is often overlooked but plays an important role in ankle strength and injury prevention. Bodyweight alone is usually enough resistance to start.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "vf3pb",
  name: "Seated Tibialis Raise",
  group: "legs", sub: "Calves",
  muscles: { primary: ["Tibialis anterior"], secondary: [], stabilizers: [] },
  equipment: ["Machine", "Weight plate"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated dorsiflexion exercise targeting the tibialis anterior.",
  blurb: "The same toe-lifting motion as a standing tibialis raise, but performed seated with added weight like a plate on your knees. Sitting removes balance demands and lets you load the movement a bit more. A good way to build up the front of your lower leg alongside your calves.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CORE — Flexion
   ───────────────────────────────────────────── */

{
  id: "os9bz",
  name: "Crunch",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Obliques"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A short-range abdominal flexion exercise performed from the floor.",
  blurb: "Lying on your back with knees bent, you curl your shoulders up off the floor by contracting your abs, then lower back down. It's the classic beginner ab exercise and a good starting point for core training. Focus on curling your ribs toward your hips rather than pulling on your neck with your hands.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "ze3jw",
  name: "Cable Crunch",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Obliques"], stabilizers: [] },
  equipment: ["Cable machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A weighted crunch performed against cable resistance.",
  blurb: "You kneel facing a cable machine, hold a rope behind your head, and curl your torso down toward your knees using your abs. Adding cable resistance lets you make crunches progressively harder as you get stronger, unlike bodyweight crunches alone. Focus on curling your spine, not just nodding your head forward.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "5oynt",
  name: "Machine Crunch",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Obliques"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A guided weighted crunch performed on an abdominal machine.",
  blurb: "A crunch performed on a machine with a padded lever you curl against. The guided motion makes it easy to add resistance and progress over time without needing a cable setup. A straightforward way to build ab strength.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "1wa96",
  name: "Decline Sit-Up",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Bodyweight", "Decline bench"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A sit-up performed on a declined bench.",
  blurb: "A sit-up performed on a bench angled so your head is lower than your feet, which increases the difficulty compared to a flat sit-up. It works the same muscles as a regular sit-up, just with your bodyweight working against you more. Use the ankle supports to keep your legs from lifting off the bench.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "7aw2p",
  name: "Sit-Up",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "beginner",
  card: "A full-range abdominal exercise performed from the floor.",
  blurb: "Lying on your back, you curl your whole torso up until you're sitting upright, then lower back down. It's a classic core exercise that works your abs through a bigger range of motion than a crunch. Anchoring your feet or bending your knees can make the movement more comfortable.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "eqsyw", // kept — logged history (1 set, as "Weighted Sit-ups")
  name: "Weighted Sit-Up",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Weight plate", "Dumbbell"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "supine", difficulty: "intermediate",
  card: "A sit-up performed while holding additional weight.",
  blurb: "The same sit-up motion, but holding a weight plate or dumbbell against your chest for added resistance. Once bodyweight sit-ups feel easy, this is a simple way to keep progressing your core strength. Hold the weight securely against your chest rather than letting it shift around.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "dumbbell", sets: 3
},
{
  id: "hr0lh",
  name: "Hanging Knee Raise",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "intermediate",
  card: "A hanging exercise that raises bent knees toward the torso.",
  blurb: "You hang from a pull-up bar and raise your knees up toward your chest, then lower back down. This works your lower abs in particular, along with your grip from hanging on. Avoid swinging — a controlled raise is much more effective than momentum.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "rck6u",
  name: "Hanging Leg Raise",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Lower abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Bodyweight", "Pull-up bar"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "hanging", difficulty: "advanced",
  card: "A hanging leg raise performed with relatively straight legs.",
  blurb: "Similar to a hanging knee raise, but you keep your legs relatively straight instead of bending your knees as you lift. The straight legs increase the challenge significantly since your abs have to work harder to lift the added leverage. Build up to this with knee raises first if it feels too difficult.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "jv5jk",
  name: "Captain's Chair Knee Raise",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Upper abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A supported knee raise performed from a captain's chair.",
  blurb: "You stand supported on padded arms and raise your knees up toward your chest. The support pads take pressure off your grip compared to hanging from a bar, letting you focus purely on your abs. A great option if hanging exercises are hard on your hands or shoulders.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "mqgez",
  name: "Captain's Chair Leg Raise",
  group: "core", sub: "Flexion",
  muscles: { primary: ["Lower abs"], secondary: ["Hip flexors"], stabilizers: [] },
  equipment: ["Machine"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A supported straight-leg raise performed from a captain's chair.",
  blurb: "The same supported setup as a knee raise machine, but you keep your legs straighter as you lift them. It's a more challenging version of the knee raise that really works your lower abs. Progress to this once knee raises feel manageable.",
  reps: "10-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CORE — Anti-Extension
   ───────────────────────────────────────────── */

{
  id: "8safy",
  name: "Plank",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Shoulders", "Glutes"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A static bodyweight hold that trains the core to resist spinal extension.",
  blurb: "You hold your body in a straight line, supported on your forearms and toes, and simply hold the position. It's one of the most well-known core exercises because it trains your whole midsection to stay stable, not just your abs. Keep your hips level — don't let them sag down or pike up.",
  reps: "30-60 sec", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 2
},
{
  id: "lcaar",
  name: "Weighted Plank",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Shoulders", "Glutes"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Weight plate"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "lying", difficulty: "intermediate",
  card: "A plank performed with additional weight across the back.",
  blurb: "The same forearm plank hold, but with a weight plate placed on your back for extra resistance. Once a regular plank stops being challenging, this is a simple way to keep progressing. Make sure your hips stay level even with the added weight.",
  reps: "30-45 sec", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 2
},
{
  id: "k7ani",
  name: "Ab Wheel Rollout",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Lats", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "advanced",
  card: "A rolling core exercise requiring the trunk to resist extension.",
  blurb: "Kneeling down, you roll a small wheel forward as far as you can control, then pull it back in using your core. This is a demanding exercise that trains your entire midsection to resist your body folding forward. Start with a short range of motion and build up gradually — it's harder than it looks.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "idee3",
  name: "Stability Ball Rollout",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Shoulders"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A rollout performed using a stability ball.",
  blurb: "Similar to an ab wheel rollout, but using a large stability ball to roll out on instead of a wheel. The ball adds an extra balance challenge on top of the core demand. A good alternative if you don't have an ab wheel available.",
  reps: "8-12", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "vh9bc",
  name: "Dead Bug",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Hip flexors"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isolation", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "A controlled floor exercise that trains the core while the limbs move independently.",
  blurb: "Lying on your back with your arms up and knees bent at 90 degrees, you slowly extend one arm and the opposite leg out, then bring them back and switch sides. Despite the odd name, it's an excellent exercise for training your core to stay stable while your limbs move. Keep your lower back pressed into the floor throughout.",
  reps: "10-12", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "r31ba",
  name: "Hollow Body Hold",
  group: "core", sub: "Anti-Extension",
  muscles: { primary: ["Core"], secondary: ["Hip flexors"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Flexion",
  exerciseType: "isometric", laterality: "bilateral", position: "lying", difficulty: "intermediate",
  card: "A static body position requiring the core to maintain a rounded, braced shape.",
  blurb: "Lying on your back, you lift your shoulders and legs slightly off the floor, creating a curved, hollowed-out body shape, and hold it. This position is used across gymnastics and calisthenics to build serious core control. Start with your knees bent if a fully extended hold is too demanding at first.",
  reps: "20-30 sec", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},

/* ─────────────────────────────────────────────
   CORE — Anti-Rotation
   ───────────────────────────────────────────── */

{
  id: "6kwdb",
  name: "Pallof Press",
  group: "core", sub: "Anti-Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Upper abs"], stabilizers: ["Core"] },
  equipment: ["Cable machine", "Resistance band"],
  movementPattern: "Anti-rotation",
  exerciseType: "isolation", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A cable press where the core resists rotation from the side.",
  blurb: "You stand sideways to a cable machine, hold the handle at your chest, and press it straight out in front of you while resisting the pull that tries to rotate your torso. It's not about moving your arms — it's about keeping your core still against a force trying to twist you. A great exercise for building rotational stability.",
  reps: "10-12", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "0n7dq",
  name: "Half-Kneeling Pallof Press",
  group: "core", sub: "Anti-Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Core", "Glutes"], stabilizers: ["Core"] },
  equipment: ["Cable machine", "Resistance band"],
  movementPattern: "Anti-rotation",
  exerciseType: "isolation", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A kneeling Pallof press that adds a more demanding base position.",
  blurb: "The same anti-rotation press as a standing Pallof press, but performed from a half-kneeling position instead. Kneeling on one leg removes some stability from your lower body, making your core work even harder to resist the twisting force. A more advanced progression once the standing version feels solid.",
  reps: "10-12", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "ylfpt",
  name: "Cable Anti-Rotation Hold",
  group: "core", sub: "Anti-Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Core"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Anti-rotation",
  exerciseType: "isometric", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A static cable hold where the core resists rotational force.",
  blurb: "You hold a cable handle out at arm's length and simply resist the pull trying to rotate your torso, without any pressing motion involved. It's a pure isometric hold that trains your core's ability to resist rotation. Keep your hips and shoulders square throughout.",
  reps: "20-30 sec", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CORE — Lateral / Rotation
   ───────────────────────────────────────────── */

{
  id: "2we8g",
  name: "Side Plank",
  group: "core", sub: "Lateral",
  muscles: { primary: ["Obliques"], secondary: ["Glutes", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Anti-rotation",
  exerciseType: "isometric", laterality: "unilateral", position: "lying", difficulty: "beginner",
  card: "A side-facing plank that challenges the obliques and lateral core.",
  blurb: "Propped up on one forearm and the side of your foot, you hold your body in a straight line facing sideways. This targets your obliques, the muscles on the sides of your core, which a standard plank doesn't hit as directly. Keep your hips lifted and stacked rather than letting them drop.",
  reps: "30-45 sec", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 2
},
{
  id: "5uelm",
  name: "Weighted Side Plank",
  group: "core", sub: "Lateral",
  muscles: { primary: ["Obliques"], secondary: ["Glutes", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Bodyweight", "Weight plate"],
  movementPattern: "Anti-rotation",
  exerciseType: "isometric", laterality: "unilateral", position: "lying", difficulty: "intermediate",
  card: "A side plank performed with additional external weight.",
  blurb: "The same side plank hold, but with a weight plate resting on your hip for extra resistance. Once a regular side plank feels easy to hold, this is a simple way to make it harder. Keep the same straight-line body position even with the added weight.",
  reps: "20-30 sec", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 2
},
{
  id: "s4258",
  name: "Cable Woodchop",
  group: "core", sub: "Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Core", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Rotation",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A diagonal cable rotation that trains the trunk through a controlled arc.",
  blurb: "Standing sideways to a low cable, you pull the handle up and across your body in a diagonal chopping motion. This trains your core to rotate with control, which is useful for sports and everyday movement alike. Rotate through your torso, not just your arms.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "h0v88",
  name: "Cable Lift",
  group: "core", sub: "Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Core", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Cable machine"],
  movementPattern: "Rotation",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "beginner",
  card: "A diagonal cable movement traveling from low to high.",
  blurb: "The opposite direction from a woodchop — you pull the cable from low up to high, diagonally across your body. It works the same rotational core muscles from a different angle. Pairing this with a woodchop trains rotation in both directions.",
  reps: "12-15", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "ihuhx",
  name: "Russian Twist",
  group: "core", sub: "Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Upper abs"], stabilizers: [] },
  equipment: ["Bodyweight", "Weight plate"],
  movementPattern: "Rotation",
  exerciseType: "compound", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A seated rotational exercise performed by moving the torso from side to side.",
  blurb: "Sitting on the floor with your knees bent and leaning back slightly, you rotate your torso side to side, tapping the floor on each side. It's a well-known move for targeting your obliques. Lifting your feet off the floor makes it harder, keeping them down makes it easier.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},
{
  id: "g9qnl",
  name: "Landmine Rotation",
  group: "core", sub: "Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Shoulders", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Landmine"],
  movementPattern: "Rotation",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A standing rotational movement performed with a landmine bar.",
  blurb: "Standing next to a barbell anchored to the floor at one end, you rotate the free end of the bar from one side of your body to the other. This trains rotational core strength using a heavier, more dynamic load than most core exercises. Keep the movement controlled rather than yanking the bar around.",
  reps: "10-12", rest: "45 sec", restSecs: 45, type: "gym", sets: 3
},
{
  id: "7b7wy",
  name: "Bicycle Crunch",
  group: "core", sub: "Rotation",
  muscles: { primary: ["Obliques"], secondary: ["Upper abs", "Hip flexors"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Rotation",
  exerciseType: "compound", laterality: "bilateral", position: "lying", difficulty: "beginner",
  card: "An alternating abdominal exercise combining trunk rotation and knee drive.",
  blurb: "Lying on your back, you bring one elbow toward the opposite knee while extending the other leg, then switch sides in a pedaling motion. It combines ab flexion with rotation in one continuous movement. Focus on twisting through your torso rather than just moving your elbows.",
  reps: "15-20", rest: "45 sec", restSecs: 45, type: "bodyweight", sets: 3
},

/* ─────────────────────────────────────────────
   FULL BODY — Deadlifts
   ───────────────────────────────────────────── */

{
  id: "us80d",
  name: "Conventional Deadlift",
  group: "fullbody", sub: "Deadlifts",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings", "Spinal erectors", "Lats", "Traps"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A full-body barbell lift performed by pulling the weight from the floor.",
  blurb: "You bend down and lift a loaded barbell from the floor up to standing, using your legs, back, and grip all together. It's one of the most complete strength exercises there is, working nearly your entire body in one lift. Keep the bar close to your legs and your back flat as you pull.",
  reps: "4-6", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "h62ix",
  name: "Sumo Deadlift",
  group: "fullbody", sub: "Deadlifts",
  muscles: { primary: ["Glutes"], secondary: ["Quads", "Hamstrings", "Adductors", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A wide-stance deadlift with the hands positioned inside the legs.",
  blurb: "A deadlift performed with your feet set wide and your hands gripping inside your legs, rather than a narrower conventional stance. The wide stance brings your inner thighs and hips into the lift more. It often allows a more upright torso than a conventional deadlift.",
  reps: "4-6", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "x87z0",
  name: "Trap-Bar Deadlift",
  group: "fullbody", sub: "Deadlifts",
  muscles: { primary: ["Glutes"], secondary: ["Quads", "Hamstrings", "Traps", "Spinal erectors"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A deadlift performed from inside a hexagonal trap bar.",
  blurb: "You stand inside a hexagonal bar and lift it from the floor, with the handles at your sides instead of in front of you. This bar shape tends to feel more natural on the back and is often recommended for people newer to deadlifting. A great starting point for learning the deadlift pattern safely.",
  reps: "6-8", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   FULL BODY — Olympic Lifts
   ───────────────────────────────────────────── */

{
  id: "08q5o",
  name: "Clean",
  group: "fullbody", sub: "Olympic Lifts",
  muscles: { primary: ["Full body"], secondary: ["Glutes", "Quads", "Hamstrings", "Traps", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Olympic pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "An explosive barbell lift that moves the weight from the floor to the shoulders.",
  blurb: "An explosive lift where you pull a barbell from the floor and catch it at your shoulders in one fluid motion. It's a technical, full-body power exercise borrowed from Olympic weightlifting. This movement takes real practice to learn safely — start with a coach or very light weight.",
  reps: "3-5", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "2q1pr",
  name: "Power Clean",
  group: "fullbody", sub: "Olympic Lifts",
  muscles: { primary: ["Full body"], secondary: ["Glutes", "Quads", "Hamstrings", "Traps", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Olympic pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "An explosive clean caught in a higher, partial-squat position.",
  blurb: "A version of the clean where you catch the bar in a higher, quarter-squat position instead of a full squat. It's slightly less technical than a full clean but still requires real explosiveness and coordination. Like the standard clean, this is best learned with guidance before adding weight.",
  reps: "3-5", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "el84w",
  name: "Hang Clean",
  group: "fullbody", sub: "Olympic Lifts",
  muscles: { primary: ["Full body"], secondary: ["Glutes", "Hamstrings", "Traps", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Olympic pull",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A clean variation beginning with the bar above the floor.",
  blurb: "A clean that starts with the bar already at knee height instead of on the floor, rather than pulling from a dead stop. This removes the initial pull off the ground and focuses on the explosive second half of the lift. Still a technical movement worth learning with light weight first.",
  reps: "3-5", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "32jfn",
  name: "Clean and Press",
  group: "fullbody", sub: "Olympic Lifts",
  muscles: { primary: ["Full body"], secondary: ["Shoulders", "Triceps", "Glutes", "Quads"], stabilizers: ["Core"] },
  equipment: ["Barbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "A clean followed by an overhead press.",
  blurb: "A clean immediately followed by pressing the bar overhead, combining two explosive movements into one. It's a demanding full-body exercise that tests strength, power, and coordination together. Master the clean and the overhead press separately before combining them.",
  reps: "3-5", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   FULL BODY — Presses / Compound
   ───────────────────────────────────────────── */

{
  id: "24bpm",
  name: "Push Press",
  group: "fullbody", sub: "Presses",
  muscles: { primary: ["Shoulders"], secondary: ["Triceps", "Legs", "Core"], stabilizers: ["Core"] },
  equipment: ["Barbell", "Dumbbell"],
  movementPattern: "Vertical push",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "An overhead press assisted by a powerful leg drive.",
  blurb: "An overhead press where you dip your knees slightly and drive upward to help launch the weight overhead, rather than pressing with just your arms and shoulders. That leg drive lets you move more weight than a strict press. A great way to build explosive power in your shoulders and legs together.",
  reps: "5-8", rest: "2 min", restSecs: 120, type: "gym", sets: 3
},
{
  id: "4cxza",
  name: "Thruster",
  group: "fullbody", sub: "Presses",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Shoulders", "Triceps", "Core"], stabilizers: ["Core"] },
  equipment: ["Dumbbell", "Barbell", "Kettlebell"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A front-loaded squat flowing directly into an overhead press.",
  blurb: "You hold weight at your shoulders, squat down, then stand up and press the weight overhead in one continuous motion. It combines a squat and a shoulder press into a single demanding exercise. Because it hits so many muscles at once, it's also great for conditioning.",
  reps: "8-12", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},

/* ─────────────────────────────────────────────
   FULL BODY — Kettlebell
   ───────────────────────────────────────────── */

{
  id: "qox97",
  name: "Kettlebell Swing",
  group: "fullbody", sub: "Kettlebell",
  muscles: { primary: ["Glutes"], secondary: ["Hamstrings", "Core", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Kettlebell"],
  movementPattern: "Hip hinge",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "An explosive kettlebell hinge driven by the hips.",
  blurb: "You hold a kettlebell with both hands and swing it up to about chest height using power from your hips, not your arms. This is a hip-hinge exercise disguised as a swinging motion, and it builds serious glute and hamstring power. Think of it as an explosive hip snap, not an arm lift.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "55ks9",
  name: "Kettlebell Clean",
  group: "fullbody", sub: "Kettlebell",
  muscles: { primary: ["Full body"], secondary: ["Glutes", "Hamstrings", "Shoulders"], stabilizers: ["Core"] },
  equipment: ["Kettlebell"],
  movementPattern: "Olympic pull",
  exerciseType: "compound", laterality: "unilateral", position: "standing", difficulty: "intermediate",
  card: "An explosive kettlebell movement that brings the weight to the shoulder.",
  blurb: "You explosively bring a kettlebell up from between your legs to rest against your forearm at shoulder height. It's a technical movement that takes practice to catch smoothly without banging your wrist. Start with a light kettlebell and focus on the technique before adding weight.",
  reps: "6-10", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "hwzgt",
  name: "Turkish Get-Up",
  group: "fullbody", sub: "Kettlebell",
  muscles: { primary: ["Full body"], secondary: ["Shoulders", "Core", "Legs"], stabilizers: ["Core"] },
  equipment: ["Kettlebell"],
  movementPattern: "Carry",
  exerciseType: "compound", laterality: "unilateral", position: "lying", difficulty: "advanced",
  card: "A controlled sequence moving from the floor to standing while holding a weight overhead.",
  blurb: "A slow, controlled sequence that takes you from lying on the floor to standing up, all while holding a weight locked out overhead. It's one of the most complete exercises for building total-body coordination, stability, and strength. Learn this one without any weight first until the steps feel natural.",
  reps: "3-5 per side", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   FULL BODY — Bodyweight / Conditioning
   ───────────────────────────────────────────── */

{
  id: "pu1hf",
  name: "Bear Crawl",
  group: "fullbody", sub: "Bodyweight",
  muscles: { primary: ["Full body"], secondary: ["Shoulders", "Core", "Legs"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Carry",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "intermediate",
  card: "A quadrupedal crawling movement requiring coordinated full-body control.",
  blurb: "On your hands and feet with your hips low, you crawl forward while keeping your core braced and your movements controlled. It works your whole body together and is a great way to build coordination alongside strength. Keep your hips level rather than rocking side to side as you move.",
  reps: "20-30 sec", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},
{
  id: "0l04l",
  name: "Sled Push",
  group: "fullbody", sub: "Conditioning",
  muscles: { primary: ["Quads"], secondary: ["Glutes", "Calves", "Core"], stabilizers: ["Core"] },
  equipment: ["Sled"],
  movementPattern: "Carry",
  exerciseType: "conditioning", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A loaded sled pushed across a surface for strength and conditioning.",
  blurb: "You load a sled with weight and push it forward across the floor or turf. It's a highly effective way to build leg strength and conditioning without putting stress on your joints the way running does. Keep your body low and drive hard through your legs.",
  reps: "20-40 sec", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},
{
  id: "3zgo1",
  name: "Sled Drag",
  group: "fullbody", sub: "Conditioning",
  muscles: { primary: ["Legs"], secondary: ["Glutes", "Hamstrings", "Calves", "Core"], stabilizers: ["Core"] },
  equipment: ["Sled"],
  movementPattern: "Carry",
  exerciseType: "conditioning", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A loaded sled pulled across a surface.",
  blurb: "Similar to a sled push, but you pull the sled behind you using a harness or straps instead of pushing it. Dragging works your legs and core from a different angle than pushing does. A great low-impact way to build work capacity.",
  reps: "20-40 sec", rest: "90 sec", restSecs: 90, type: "gym", sets: 3
},

/* ─────────────────────────────────────────────
   CARDIO — Running / Walking
   ───────────────────────────────────────────── */

{
  id: "fanzd",
  name: "Treadmill",
  group: "cardio", sub: "Running",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Indoor walking or running performed on a treadmill.",
  blurb: "You walk or run on a moving belt, controlling your pace and incline as you go. It's one of the most accessible ways to get cardio in, especially when weather or scheduling make outdoor options hard. Great for building cardiovascular endurance at whatever pace suits you.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},
{
  id: "274r9",
  name: "Outdoor Run",
  group: "cardio", sub: "Running",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Continuous running performed outdoors.",
  blurb: "Running outside instead of on a treadmill, at whatever distance or pace fits your goals. It's a straightforward way to build cardiovascular fitness and requires no equipment beyond good shoes. The changing terrain outdoors also adds a bit more variety than a treadmill.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},
{
  id: "rlwti",
  name: "Sprint",
  group: "cardio", sub: "Running",
  muscles: { primary: ["Legs"], secondary: ["Glutes", "Calves", "Core"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "conditioning", laterality: "bilateral", position: "standing", difficulty: "advanced",
  card: "Short, high-intensity running performed at near-maximal effort.",
  blurb: "Short bursts of running at your maximum or near-maximum effort, usually followed by rest between efforts. Sprinting builds explosive power and cardiovascular fitness at the same time. Warm up thoroughly before sprinting — the intensity makes it easy to strain a muscle if you go in cold.",
  reps: "6-10 sprints", rest: "90 sec", restSecs: 90, type: "custom", sets: 0, duration: "6-10 sprints"
},
{
  id: "ag8v8",
  name: "Incline Walk",
  group: "cardio", sub: "Walking",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Glutes", "Calves"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Walking performed at an elevated incline to increase the workload.",
  blurb: "Walking on a treadmill set to an incline, which increases the effort compared to walking flat. It's a joint-friendly way to raise your heart rate and burn more calories than flat walking. A great low-impact cardio option that's easy to build into any routine.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},

/* ─────────────────────────────────────────────
   CARDIO — Cycling
   ───────────────────────────────────────────── */

{
  id: "q8leu",
  name: "Stationary Bike",
  group: "cardio", sub: "Cycling",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Quads", "Glutes"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "Continuous cycling performed on a stationary bike.",
  blurb: "You pedal a stationary bike at your own pace and resistance level. It's a low-impact way to get your heart rate up without the joint stress of running. Great for cardio on days when you want something easier on your knees and hips.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},
{
  id: "clxap",
  name: "Outdoor Cycling",
  group: "cardio", sub: "Cycling",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Quads", "Glutes", "Calves"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "Cycling performed outdoors over a continuous route.",
  blurb: "Cycling outdoors instead of on a stationary bike, covering real distance over changing terrain. It builds the same cardiovascular fitness as indoor cycling with the added variety of being outside. A great option if you enjoy being outdoors while you train.",
  reps: "20-40 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-40 min"
},
{
  id: "htnmq",
  name: "Assault Bike",
  group: "cardio", sub: "Cycling",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs", "Shoulders", "Arms"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "conditioning", laterality: "bilateral", position: "seated", difficulty: "intermediate",
  card: "A full-body cycling movement using both the pedals and moving handles.",
  blurb: "A stationary bike with moving handles that you push and pull as you pedal, working your arms and legs together. It's known for being an intense, full-body way to build cardio conditioning quickly. Because it's demanding, even short intervals can be a serious workout.",
  reps: "10-20 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "10-20 min"
},

/* ─────────────────────────────────────────────
   CARDIO — Rowing / Other
   ───────────────────────────────────────────── */

{
  id: "xy40z",
  name: "Rowing Machine",
  group: "cardio", sub: "Rowing",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs", "Back", "Arms"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "seated", difficulty: "beginner",
  card: "A full-body rowing movement performed on an indoor ergometer.",
  blurb: "You sit at a rowing machine and pull the handle toward your body while pushing with your legs, mimicking the motion of rowing a boat. It's one of the few cardio machines that works your whole body, not just your legs. Focus on driving with your legs first, then finishing the pull with your arms.",
  reps: "15-20 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "15-20 min"
},
{
  id: "q8j2g",
  name: "Stair Climber",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Quads", "Glutes", "Calves"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Continuous climbing performed on a stair machine.",
  blurb: "You continuously step on a machine that simulates climbing stairs. It's a demanding way to build cardiovascular fitness while also working your legs and glutes. Keep a steady pace rather than leaning heavily on the handrails, which reduces how much work your body actually does.",
  reps: "15-20 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "15-20 min"
},
{
  id: "djq1c",
  name: "Elliptical",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs", "Arms"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Low-impact cardiovascular exercise performed on an elliptical machine.",
  blurb: "You move your legs in a smooth, gliding motion on a machine that combines walking and cycling patterns. It's very low-impact, making it a good option if running or jumping bothers your joints. Many machines also let you push and pull the handles for some upper-body involvement.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},
{
  id: "wlc6p",
  name: "Ski Erg",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Lats", "Triceps", "Core", "Legs"], stabilizers: [] },
  equipment: ["Cardio machine"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "intermediate",
  card: "A rhythmic pulling movement modeled after cross-country skiing.",
  blurb: "You stand at a machine and pull two handles down and back, mimicking the motion of cross-country skiing. It works your whole body, especially your core, back, and arms, alongside your cardiovascular system. A great alternative to rowing if you want to emphasize a different movement pattern.",
  reps: "10-15 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "10-15 min"
},
{
  id: "56r6t",
  name: "Jump Rope",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Calves", "Shoulders"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Repeated rope jumps performed at a continuous rhythm.",
  blurb: "You swing a rope under your feet and jump over it repeatedly in a steady rhythm. It's a simple, portable way to build cardio fitness and coordination at the same time. Start with shorter intervals — jump rope is more demanding on your calves and cardio than it looks.",
  reps: "5-10 min", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 0, duration: "5-10 min"
},
{
  id: "xwm4u",
  name: "Swimming",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Full body"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "prone", difficulty: "beginner",
  card: "Continuous swimming performed for cardiovascular conditioning.",
  blurb: "Swimming laps or doing continuous swim sets in a pool. It's a full-body, low-impact way to build cardiovascular fitness that's especially easy on your joints. A great option if you're managing an injury or just want a break from land-based cardio.",
  reps: "20-30 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-30 min"
},
{
  id: "178p8",
  name: "Walking",
  group: "cardio", sub: "Other",
  muscles: { primary: ["Cardiovascular system"], secondary: ["Legs"], stabilizers: [] },
  equipment: ["Bodyweight"],
  movementPattern: "Cardio",
  exerciseType: "cardio", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "Continuous walking performed for movement or cardiovascular activity.",
  blurb: "Simply walking at a comfortable pace, indoors or outside. It's one of the most accessible and sustainable forms of exercise there is, and it adds up over time even at a relaxed pace. A great daily habit to build alongside your regular workouts.",
  reps: "20-40 min", rest: "n/a", restSecs: 0, type: "custom", sets: 0, duration: "20-40 min"
},

/* ─────────────────────────────────────────────
   USER CUSTOM EXERCISES — not in the 238-exercise spec,
   but preserved because real logged history exists against
   these exact IDs. Minimal schema (best-effort tagging).
   ───────────────────────────────────────────── */

{
  id: "tgky3", // kept — logged history (4 sets, as "Dumbbell Sumo Squat"), custom user exercise
  name: "Dumbbell Sumo Squat",
  group: "legs", sub: "Quads",
  muscles: { primary: ["Quads", "Adductors"], secondary: ["Glutes"], stabilizers: ["Core"] },
  equipment: ["Dumbbell"],
  movementPattern: "Squat",
  exerciseType: "compound", laterality: "bilateral", position: "standing", difficulty: "beginner",
  card: "A wide-stance dumbbell squat that emphasizes the inner thighs and quads.",
  blurb: "A wide-stance squat performed while holding a single dumbbell between your legs. The wide stance and turned-out feet bring your inner thighs into the movement more than a standard squat. A good variety exercise for hitting your quads and adductors together.",
  reps: "10-15", rest: "90 sec", restSecs: 90, type: "dumbbell", sets: 3
},
{
  id: "frimi", // kept — logged history (4 sets, as "Band Lat Pulldowns"), custom user exercise
  name: "Band Lat Pulldown",
  group: "back", sub: "Vertical Pull",
  muscles: { primary: ["Lats"], secondary: ["Biceps", "Upper back"], stabilizers: [] },
  equipment: ["Resistance band"],
  movementPattern: "Vertical pull",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A band-resisted pulldown that trains the lats without a cable machine.",
  blurb: "A lat pulldown-style pull performed using a resistance band anchored overhead instead of a cable machine. It mimics the same pulling motion and trains your lats and upper back, just with a band instead of stacked weight. A handy option when you don't have access to a cable machine.",
  reps: "12-15", rest: "60 sec", restSecs: 60, type: "gym", sets: 3
},
{
  id: "l2q0i", // kept — logged history (4 sets, as "Push Ups"), custom user exercise
  name: "Push-Up",
  group: "chest", sub: "Bodyweight",
  muscles: { primary: ["Chest"], secondary: ["Triceps", "Front delts", "Core"], stabilizers: ["Core"] },
  equipment: ["Bodyweight"],
  movementPattern: "Horizontal push",
  exerciseType: "compound", laterality: "bilateral", position: "kneeling", difficulty: "beginner",
  card: "A bodyweight horizontal press performed from a plank position.",
  blurb: "The classic bodyweight chest exercise: hands on the floor, body straight, lower yourself down and push back up. It trains your chest, shoulders, and triceps together, plus your core has to work to keep your body in a straight line. No equipment needed, which makes it easy to do almost anywhere.",
  reps: "12-20", rest: "60 sec", restSecs: 60, type: "bodyweight", sets: 3
},

];
