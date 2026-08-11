/* ════════════════════════════════════════════
   Tally Up — Main entry point
   Wires up the app on load and exposes every function referenced by an
   inline HTML event handler (onclick="..." etc.) onto `window`, since ES
   module functions are scoped and not visible to inline markup otherwise.
   This list was built by grepping every onclick/oninput/onchange in
   index.html and every dynamically-generated handler string in the other
   modules — see the project's refactor notes for the extraction method.
   ════════════════════════════════════════════ */
import { KEYS, DAY_NAMES, escAttr, formatISODate, saveSchedule,
         loadSchedule, loadLibraryV2, currentUnits, setCurrentUnits,
         showInstructionsIcons, setShowInstructionsIcons } from './state.js';
import * as themeMod from './theme.js';
import * as bodyweightMod from './bodyweight.js';
import * as backupMod from './backup.js';
import * as modalMod from './modal.js';
import * as libraryMod from './library.js';
import * as calendarMod from './calendar.js';
import * as scheduleDayMod from './schedule-day.js';
import * as timersMod from './timers.js';
import * as historyMod from './history.js';
import * as customLogMod from './custom-log.js';
import * as tabsMod from './tabs.js';
import * as sidebarMod from './sidebar.js';
import * as clockMod from './clock.js';
import * as musicMod from './music.js';
import * as greetingMod from './greeting.js';

/* ─── WINDOW BRIDGE ───
   Every function an inline HTML handler calls by bare name must live here.
   Grouped by source module for traceability against the modules above. */
Object.assign(window, {
  // state.js (called directly from dynamically-built HTML strings)
  escAttr,
  formatISODate,
  saveSchedule,

  // theme.js
  setUnits: themeMod.setUnits,
  setTheme: themeMod.setTheme,
  setAccent: themeMod.setAccent,
  toggleInstructionsIcons: themeMod.toggleInstructionsIcons,
  syncWelcomeTheme: themeMod.syncWelcomeTheme,
  applySettingsName: themeMod.applySettingsName,
  openSettings: themeMod.openSettings,
  closeSettings: themeMod.closeSettings,
  finishWelcome: themeMod.finishWelcome,

  // bodyweight.js
  saveBodyweight: bodyweightMod.saveBodyweight,

  // backup.js
  shareApp: backupMod.shareApp,
  exportForAI: backupMod.exportForAI,
  saveFile: backupMod.saveFile,
  openRestoreSheet: backupMod.openRestoreSheet,
  closeRestoreSheet: backupMod.closeRestoreSheet,
  applyRestore: backupMod.applyRestore,
  restoreOrphanChoice: backupMod.restoreOrphanChoice,

  // modal.js
  closeModal: modalMod.closeModal,

  // library.js
  openLibCategory: libraryMod.openLibCategory,
  closeLibCategory: libraryMod.closeLibCategory,
  libSelectFilterSub: libraryMod.libSelectFilterSub,
  openLibSearch: libraryMod.openLibSearch,
  closeLibSearch: libraryMod.closeLibSearch,
  libSearchInput: libraryMod.libSearchInput,
  openExerciseDetail: libraryMod.openExerciseDetail,
  closeExerciseDetail: libraryMod.closeExerciseDetail,
  openExerciseInstructions: libraryMod.openExerciseInstructions,
  closeExerciseInstructions: libraryMod.closeExerciseInstructions,
  openLibSimilar: libraryMod.openLibSimilar,
  closeLibSimilar: libraryMod.closeLibSimilar,
  libSelectSimilarCat: libraryMod.libSelectSimilarCat,
  openLibAddDay: libraryMod.openLibAddDay,
  closeLibAddDay: libraryMod.closeLibAddDay,
  libAddDayCalNav: libraryMod.libAddDayCalNav,
  libToggleCalDate: libraryMod.libToggleCalDate,
  libSelectRepeat: libraryMod.libSelectRepeat,
  confirmLibAddDay: libraryMod.confirmLibAddDay,
  libFormSyncSubs: libraryMod.libFormSyncSubs,
  libFormRemoveSecondary: libraryMod.libFormRemoveSecondary,
  libFormRemoveEquipment: libraryMod.libFormRemoveEquipment,
  openLibExerciseForm: libraryMod.openLibExerciseForm,
  closeLibExerciseForm: libraryMod.closeLibExerciseForm,
  saveLibExerciseForm: libraryMod.saveLibExerciseForm,
  deleteLibExercise: libraryMod.deleteLibExercise,
  openLibV2ForDay: libraryMod.openLibV2ForDay,

  // calendar.js
  switchCalendarView: calendarMod.switchCalendarView,
  calendarNav: calendarMod.calendarNav,
  jumpToDate: calendarMod.jumpToDate,
  jumpToMonth: calendarMod.jumpToMonth,
  setMonthViewMode: calendarMod.setMonthViewMode,
  logExerciseOnDate: calendarMod.logExerciseOnDate,

  // schedule-day.js
  toggleDayMenu: scheduleDayMod.toggleDayMenu,
  closeDayMenu: scheduleDayMod.closeDayMenu,
  toggleDayEditMode: scheduleDayMod.toggleDayEditMode,
  toggleRestDay: scheduleDayMod.toggleRestDay,
  removeExercise: scheduleDayMod.removeExercise,
  clearSet: scheduleDayMod.clearSet,
  confirmCopyDay: scheduleDayMod.confirmCopyDay,
  confirmClearSession: scheduleDayMod.confirmClearSession,

  // timers.js
  skipExerciseTimer: timersMod.skipExerciseTimer,
  // NOTE: index.html's dead #timer-bar markup calls skipTimer() which was
  // never defined even in the original monolithic app (the real function is
  // skipExerciseTimer, above) — that bar is never shown by any code path, so
  // this was already an unreachable no-op before the refactor. Left as-is
  // rather than silently introducing new behavior.

  // history.js
  openHistSearch: historyMod.openHistSearch,
  closeHistSearch: historyMod.closeHistSearch,
  histSearchInput: historyMod.histSearchInput,
  renderHistory: historyMod.renderHistory,
  showFormulaInfo: historyMod.showFormulaInfo,
  editSessionDateEditToggle: historyMod.editSessionDateEditToggle,
  closeEditSession: historyMod.closeEditSession,
  saveEditSession: historyMod.saveEditSession,
  deleteSession: historyMod.deleteSession,

  // custom-log.js
  openCustomLog: customLogMod.openCustomLog,
  closeCustomLog: customLogMod.closeCustomLog,
  customLogSetDate: customLogMod.customLogSetDate,
  customLogDateEditToggle: customLogMod.customLogDateEditToggle,
  customLogAddExercise: customLogMod.customLogAddExercise,
  customLogRemoveEntry: customLogMod.customLogRemoveEntry,
  customLogAddSet: customLogMod.customLogAddSet,
  customLogRemoveSet: customLogMod.customLogRemoveSet,
  saveCustomLog: customLogMod.saveCustomLog,

  // tabs.js
  switchTab: tabsMod.switchTab,
  openExerciseHistory: tabsMod.openExerciseHistory,

  // sidebar.js
  openSidebar: sidebarMod.openSidebar,
  closeSidebar: sidebarMod.closeSidebar,

  // clock.js
  switchClockTab: clockMod.switchClockTab,
  clockTimerToggle: clockMod.clockTimerToggle,
  clockTimerReset: clockMod.clockTimerReset,
  swToggle: clockMod.swToggle,
  swLap: clockMod.swLap,
  swReset: clockMod.swReset,

  // music.js
  toggleMute: musicMod.toggleMute,
  toggleTrackMenu: musicMod.toggleTrackMenu,
  selectTrack: musicMod.selectTrack,

  // greeting.js
  dismissGreeting: greetingMod.dismissGreeting,

  // main.js (this file)
  applyUpdate,
});

/* ─── UPDATE BANNER ─── */
let _updateAvailable = false;
function applyUpdate() { document.getElementById('update-banner').classList.remove('show'); _updateAvailable = false; window.location.reload(true); }
function checkForUpdate() {
  try {
    if (_updateAvailable) return;
    fetch('./version.json?v=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        // state.js's APP_VERSION is a live binding; import it fresh each check
        // rather than caching it at module-eval time (it's set asynchronously
        // by loadAppVersion() after fetch, so an early cached read would be '').
        import('./state.js').then(({ APP_VERSION }) => {
          if (data.version && APP_VERSION && data.version !== APP_VERSION) {
            _updateAvailable = true;
            const banner = document.getElementById('update-banner');
            if (banner) banner.classList.add('show');
          }
        });
      }).catch(() => {});
  } catch (e) { /* never let update-checking break the app */ }
}

/* ─── VALIDATION ─── */
document.addEventListener('keydown', e => {
  if (e.target.type === 'number' && ['e','E','+','-'].includes(e.key)) e.preventDefault();
});

/* ─── ID MIGRATION ─── */
// Stamps exId onto any schedule/history entries that don't have one yet, using
// the current Library V2 as the source of truth (matched by name). This only
// backfills legacy entries created before live-linking existed; entries that
// already have an exId are left untouched.
function migrateIds() {
  return import('./state.js').then(({ DEFAULT_LIBRARY_V2, schedule, getHistory, saveHistory }) => {
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
  });
}

/* ─── APP TITLE / BODYWEIGHT DISPLAY ON INIT ─── */

/* ─── INIT ─── */
(function init() {
  let savedTheme = localStorage.getItem(KEYS.theme) || 'light';
  let savedBase = localStorage.getItem(KEYS.base) || themeMod.THEME_BASE_DEFAULT[savedTheme] || 'beige';
  let savedAccent = localStorage.getItem(KEYS.accent) || 'teal';
  // Migrate anyone still on the retired matrix/mdnt themes to light/dark + base + accent.
  if (themeMod.LEGACY_THEME_MIGRATION[savedTheme]) {
    const m = themeMod.LEGACY_THEME_MIGRATION[savedTheme];
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
  themeMod.syncThemeColorMeta(savedTheme, savedBase);
  loadSchedule();
  loadLibraryV2();
  musicMod.initMusic();

  document.addEventListener('DOMContentLoaded', () => {
    try {
      migrateIds().then(() => {
        setCurrentUnits(localStorage.getItem(KEYS.units) || 'lbs');
        setShowInstructionsIcons(localStorage.getItem(KEYS.showInstr) === '1');

        // Sync visible toggles
        document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
        document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === savedTheme));
        themeMod.syncThemeBaseLabel(savedBase);

        themeMod.updateAppTitle();
        bodyweightMod.updateBwDisplay();
        scheduleDayMod.renderDayContent();

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
          if (!e.target.closest('.day-header') && !e.target.closest('.cal-day-actions-row')) {
            scheduleDayMod.closeDayPicker();
            scheduleDayMod.closeDayMenu();
          }
        });

        const vEl = document.getElementById('settings-version');
        import('./state.js').then(({ APP_VERSION }) => {
          if (vEl) vEl.textContent = APP_VERSION || '…';
        });
        themeMod.loadAppVersion();

        if (!localStorage.getItem(KEYS.welcomed)) themeMod.openSettings(true);
        else greetingMod.maybeShowGreeting();
      });
    } catch (err) {
      console.error('Tally Up init error:', err);
    }
  });
})();

try { checkForUpdate(); } catch (e) {}
setInterval(() => { try { checkForUpdate(); } catch (e) {} }, 5 * 60 * 1000);

/* ─── SERVICE WORKER ─── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    reg.update();
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) checkForUpdate();
      });
    });
  }).catch(() => {});
}
