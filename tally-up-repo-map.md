# Tally Up — Repo Map

Path: `~/Documents/GitHub/workout-log/`

Purpose of this doc: tell a future Claude chat exactly which files to ask
Henry for based on what part of the app the task touches. Don't dump the
whole repo — request only what's listed below for the relevant feature area.

Current version at time of writing: **v172**

---

## Root files

**`index.html`**
The single-page app shell. All tab containers (Log, History, Clock, Library)
and every popup/sheet/modal (exercise detail, similar exercises, add-to-day,
add/edit exercise form, settings, restore, custom log, etc.) live here as
static markup with empty containers that JS fills in. ~1400 lines. Also
holds the `<audio id="snore-player" src="sfx/man-snoring.mp3" loop
preload="none">` element (~line 1470) for the rest-day snoring sound;
the rest-screen's "zzz" animation that triggers it is rendered dynamically
by calendar.js, not static markup here. Needed for: any UI/markup change
(new fields, buttons, popups, layout).

**`manifest.json`**
PWA manifest — app name, standalone display mode, colors, icon references.
Needed for: install/home-screen appearance changes.

**`version.json`**
Single field, current build number (currently `"v172"`). Bumped on deploy;
paired with the service worker cache name to invalidate old cached files.
Needed for: shipping a new version (bump this + `service-worker.js` CACHE
name).

**`service-worker.js`**
PWA offline/caching layer. Lists every source file to cache, installs them
individually, network-first for HTML / cache-first for everything else.
CACHE name currently `tallyup-v172`. Needed for: adding/removing a source
file from the project, or changing offline/caching behavior.

**`Tallyup-Icon-192.png`, `Tallyup-Icon-512.png`**
App icons referenced by manifest.json. Needed for: icon/branding changes.

**`music/`** (folder, not code)
Four subfolders — Bach, Beethoven, Mozart, Tchaikovsky — holding the mp3s
referenced by `src/music.js`'s `PLAYLISTS` object. Needed for: adding/
changing music tracks.

**`sfx/man-snoring.mp3`**
Audio asset for the rest-day snoring sound — a cartoon/exaggerated snore
(swapped once already from an original realistic snore to a goofier one).
Referenced by `index.html`'s `#snore-player` element. Must stay in sync
with `service-worker.js`'s FILES list (`./sfx/man-snoring.mp3`) — if this
file is ever renamed/moved, both index.html's audio `src` AND the service
worker's cache list need updating together, or playback fails silently
with a `NotSupportedError` and no other visible symptom. Needed for:
changing/replacing the rest-day sound effect.

---

## src/ files

**`src/state.js`**
Central shared state. Holds: localStorage keys (`KEYS`, including
`lastBackupAt: 'wl_last_backup_at'` for the backup ticker), `MUSCLE_GROUPS_V2`
(the group/sub-group taxonomy — chest/back/shoulders/arms/legs/core/
fullbody/cardio, each with its sub-category list), the live mutable
`DEFAULT_LIBRARY_V2` (cloned from exercises-data.js at load — this is what
the app actually reads/writes), schedule/history storage helpers,
`viewedDate`, shared HTML-escaping utilities. Nearly every other module
imports from this. Needed for: ANY exercise-library task (taxonomy,
categories, data shape), state/storage questions.

**`src/exercises-data.js`**
The raw exercise database: `DEFAULT_LIBRARY_V2_BASE`, an array of 242
exercise objects. Each has taxonomy fields (`muscles.primary/secondary/
stabilizers`, `equipment`, `movementPattern`, `exerciseType`, `laterality`,
`position`, `difficulty`, `card`, `blurb`) and legacy operational fields
(`reps`, `rest`, `restSecs`, `type`, `sets`). Some entries near the bottom
are flagged "kept — logged history" — custom/user exercises preserved
because real workout history references their exact IDs; can't be freely
deleted/renamed without also fixing schedule/history. Needed for: fixing
exercise data — duplicates, wrong categories, wrong difficulty, bad
descriptions, adding/removing exercises.

**`src/library.js`**
The exercise library/database UI and logic. Covers: muscle-group landing
grid, category view + sub-group filter chips, search, exercise detail
popup (badges, "Works" muscle summary w/ "+X more" text, equipment,
sets/reps/rest, Similar Exercises), Similar Exercises popup (matches by
muscle/equipment/movement pattern), Add-to-day (calendar + repeat
scheduling), and the full Add/Edit Exercise form (reads fields in, writes
back to `DEFAULT_LIBRARY_V2`, handles live schedule/history renaming,
delete-with-confirmation). Needed for: almost all library UI/UX changes —
card display, edit form fields, dropdowns, popups, category assignment.

**`src/main.js`**
App entry point / wiring hub. (1) Exposes every function from every module
onto `window` so inline `onclick="..."` in index.html (and dynamically-
generated handler strings in other modules, e.g. calendar.js) can find
them — includes `toggleSnoreAudio: calendarMod.toggleSnoreAudio`, wired
here for the rest-day zzz tap — (2) runs init on load — theme, loading
schedule/library, ID migration, auto-update checking, service worker
registration. Needed for: wiring a new function to an `onclick` handler
(must be added to the `Object.assign(window, {...})` list here), init/
startup behavior changes.

**`src/calendar.js`**
Powers Day/Week/Month/Year calendar views. Date navigation, PR/streak
badges, trend arrows (vs. prior session), month grid, week list, year
list, logging a set against a specific date. Also owns the rest-day
snoring sound: `toggleSnoreAudio()` (exported, plays/pauses the
`#snore-player` loop on tap of the zzz animation, pauses the music player
first via `pauseMusic()` if it's playing) and `updateSnoreAudio()`
(private — auto-*pauses* the sound whenever the plain rest screen stops
being shown, e.g. leaving the tab, changing calendar view, navigating to
a different day; does NOT auto-play, since browsers block programmatic
autoplay without a user gesture). Registers a snore-pause callback with
music.js at load time via `registerSnorePauser` (avoids a circular import,
same pattern as `registerCalendarRenderer` used with schedule-day.js).
Needed for: calendar view changes, date navigation, PR/trend badge logic,
rest-day sound behavior.

**`src/schedule-day.js`**
Manages a day's scheduled workout: in-progress set data (keyed by
day+exercise+date), day menu (rest-day toggle, copy-to-all-days, clear
session, remove exercise), and `resolveScheduledExercise()` — the
live-linking logic that makes a scheduled exercise's display (name/reps/
rest/type) always reflect the current library entry via `exId`, falling
back to name matching. Needed for: how scheduled/logged exercises stay in
sync with library edits.

**`src/history.js`**
Logged-workout history: exercise list (sessions, best weight, volume),
per-exercise detail view with strength-trend chart and month-grouped
session folders, edit/delete a logged session, e1RM math (Epley formula)
for PR detection and trends. This is the *logged data* about past
workouts, not the exercise library itself. Needed for: history views,
session editing, PR/trend calculations.

**`src/custom-log.js`**
"Custom Log" flow: freeform logging sheet — pick any exercise from the
library (bridges into Library's picker mode via `isCustomLogPicking`/
`customLogReceiveExercise`), add sets with arbitrary reps/weight, editable
date, saves to history. Needed for: the custom/freeform logging flow.

**`src/timers.js`**
Automatic rest-timer that starts after logging a set (uses the exercise's
`restSecs`). Lives inside the exercise's Log button in day view; auto-
resets for the next set when done, or can be skipped. Needed for: rest
timer behavior.

**`src/drag.js`**
Drag-and-drop reordering of exercises within a scheduled day (touch +
mouse). Reorders `schedule[day].exercises` on drop. Needed for: reorder/
drag behavior in the day view.

**`src/backup.js`**
Share/export/backup/restore. Share app link, export workout data as text
(for pasting into an AI chat), download full JSON backup of localStorage,
restore from backup (with orphan-exercise detection when a backed-up
`exId` no longer matches the current library). Note: **the exercise
library itself is deliberately never restored from backups** — only
schedule/history/settings. `saveFile()` writes the "last backed up"
timestamp (`KEYS.lastBackupAt`) and calls `renderLastBackupLine()` BEFORE
triggering the download click (not after) — a.click() on a download link
can hand off to an OS-level save/share sheet on mobile that suspends page
JS, so anything after the click isn't guaranteed to run promptly. The
downloaded filename's timestamp is built from local date/time parts
(`getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes`), not
`toISOString()`, so it always reflects the user's own device clock/
timezone rather than UTC. Needed for: backup/restore/export flows.

**`src/bodyweight.js`**
Tiny module: stores/displays bodyweight (used for bodyweight-exercise
volume calcs). Needed for: bodyweight display/storage.

**`src/theme.js`**
Theme/appearance system: light/dark + base variants, 14 accent colors,
units (lbs/kg) toggle, Settings sheet, first-launch Welcome flow.
`openSettings()` calls `renderLastBackupLine()` (from backup.js) each time
the sheet opens, to show the current last-backup timestamp. Needed for:
appearance, units, settings sheet, welcome flow.

**`src/tabs.js`**
Top-level tab switcher (Log/History/Library/Clock). Resets tab-specific
state on leave, shows/hides tab containers, triggers each tab's render.
Needed for: tab-switching behavior.

**`src/sidebar.js`**
Nav sidebar open/close + left-edge swipe gesture to open on mobile. Needed
for: sidebar/nav behavior.

**`src/clock.js`**
Clock tab: standalone countdown timer (drum-wheel UI) + stopwatch with
laps. Separate from the automatic rest timer in `timers.js`. Needed for:
Clock tab changes.

**`src/music.js`**
Always-visible background music player: four composer playlists (Bach,
Beethoven, Mozart, Tchaikovsky), hardcoded mp3 paths. Click a pill to play
random track from that playlist, click again to pause/resume, auto-
advance + loop. Exports `isMusicPlaying()`/`pauseMusic()` (used by
calendar.js to pause music when snore starts) and `registerSnorePauser(fn)`
(lets calendar.js register a callback so starting a playlist pauses the
snore loop — avoids music.js importing calendar.js directly, since
calendar.js already imports from music.js). Needed for: music player
changes, snore/music mutual-exclusivity behavior.

**`src/greeting.js`**
Once-per-day welcome popup: shuffled rotation of encouragement messages +
reminders, shows the day's workout title or rest-day joke. Needed for:
daily greeting changes.

**`src/modal.js`**
Tiny generic confirm-dialog utility (title, body, confirm callback). Used
throughout for "Are you sure?" prompts. Needed for: rarely needed directly
— only if changing the generic confirm modal itself.

**`src/speech.js`**
Text-to-speech for exercise instructions via browser SpeechSynthesis API.
Triggered by mic icon next to the difficulty badge in exercise detail.
Needed for: TTS/instructions-reading changes.

**`src/muscle-group-icons.js`**
`MUSCLE_GROUP_ICONS` — line-art SVG icon per muscle group, injected into
library landing tiles. Purely visual/decorative data. Needed for: changing
muscle-group tile icons.

---

## Quick lookup by task type

- **Fix/edit exercise data** (duplicates, wrong category, wrong difficulty,
  descriptions) → `exercises-data.js`, `state.js` (for taxonomy)
- **Exercise card / detail popup UI** → `library.js`, `index.html`
  (`#ex-detail-wrap` section)
- **Add/Edit exercise form UI** (dropdowns, new fields, validation) →
  `library.js`, `index.html` (`#lib-form-wrap` section), `state.js`
  (taxonomy/muscle lists)
- **Category/group assignment behavior** → `library.js`
  (`saveLibExerciseForm`), `state.js` (`MUSCLE_GROUPS_V2`)
- **How scheduled days reflect library edits** → `schedule-day.js`
  (`resolveScheduledExercise`)
- **Calendar / PR badges / trends** → `calendar.js`, `history.js`
- **Logging a workout (scheduled day)** → `schedule-day.js`, `calendar.js`,
  `timers.js`
- **Logging a workout (freeform/custom)** → `custom-log.js`
- **History / session editing** → `history.js`
- **Backup / restore / export** → `backup.js`
- **Theming / settings / units** → `theme.js`
- **Rest-day snoring sound (play/pause, mutual exclusivity w/ music)** →
  `calendar.js` (`toggleSnoreAudio`, `updateSnoreAudio`), `music.js`
  (`registerSnorePauser`, `selectPlaylist`), `main.js` (window wiring),
  `index.html` (`#snore-player` element), `sfx/man-snoring.mp3` (asset)
- **New file added to project** → also update `service-worker.js` FILES
  list and bump `version.json`
- **New function needs an onclick handler** → also wire it in `main.js`'s
  `Object.assign(window, {...})`
