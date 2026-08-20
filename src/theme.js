/* ════════════════════════════════════════════
   Tally Up — Theme, Units, Settings Sheet
   ════════════════════════════════════════════ */
import { KEYS, currentUnits, setCurrentUnits, showInstructionsIcons, setShowInstructionsIcons,
         getCleanBw, APP_VERSION, setAppVersion,
         GOAL_QUESTIONS, buildPriorityMuscleOptions, getProfile, saveProfile,
         escAttr, escHtml, lockBodyScroll, unlockBodyScroll } from './state.js';
import { renderDayContent } from './schedule-day.js';
import { renderLastBackupLine } from './backup.js';
import { startOnboardingQuestionnaire } from './onboarding.js';

/* ─── SIDEBAR MODE (Home nav vs. Music composer pills) ─── */
export function setSidebarMode(mode) {
  const homeNav = document.getElementById('sidebar-nav-home');
  const musicPills = document.getElementById('composer-pills');
  if (homeNav) homeNav.style.display = mode === 'home' ? '' : 'none';
  if (musicPills) musicPills.style.display = mode === 'music' ? '' : 'none';
  document.querySelectorAll('#sidebar-mode-toggle .seg-opt').forEach(el =>
    el.classList.toggle('active', el.dataset.mode === mode));
  localStorage.setItem(KEYS.sidebarMode, mode);
}
// Restores the last-used mode on load — called once from main.js's init,
// same pattern as the theme/units restoration already done there.
export function restoreSidebarMode() {
  const saved = localStorage.getItem(KEYS.sidebarMode);
  setSidebarMode(saved === 'music' ? 'music' : 'home');
}

/* ─── APP VERSION (from version.json) ─── */
// APP_VERSION is read from version.json at runtime. To ship a new version,
// bump both version.json AND the CACHE name in service-worker.js (the cache
// name change is what actually triggers clients to pick up new files).
export function loadAppVersion() {
  fetch('./version.json', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      setAppVersion(data.version || '');
      var vEl = document.getElementById('settings-version');
      if (vEl) vEl.textContent = APP_VERSION;
    })
    .catch(function(){});
}

/* ─── UNITS ─── */
export function setUnits(u) {
  if (u === currentUnits) return;
  // Convert the stored bodyweight number itself, not just its display label —
  // otherwise "180" silently relabels from lbs to kg (a ~2.2x real-world jump)
  // and throws off any bodyweight-exercise volume math downstream.
  const bw = getCleanBw();
  if (bw != null) {
    const converted = u === 'kg' ? bw / 2.20462 : bw * 2.20462;
    localStorage.setItem(KEYS.bw, Math.round(converted * 10) / 10);
  }
  setCurrentUnits(u);
  localStorage.setItem(KEYS.units, u);
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === u));
  renderDayContent();
}

/* ─── THEME ─── */
export const THEME_COLORS = { 'light-beige': '#f4efe6', 'light-white': '#ffffff', 'dark-green': '#0f1817', 'dark-black': '#000000' };
// Old themes retired in the light/dark + accent rework — map them to the closest
// (theme, base, accent) so existing users land somewhere familiar instead of erroring out.
export const LEGACY_THEME_MIGRATION = {
  matrix: { theme: 'dark', base: 'green', accent: 'green' },
  mdnt:   { theme: 'dark', base: 'black', accent: 'red' },
};
export const ACCENTS = [
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
export const THEME_BASE_CYCLE = { light: ['beige', 'white'], dark: ['green', 'black'] };
export const THEME_BASE_DEFAULT = { light: 'beige', dark: 'green' };

export function syncThemeColorMeta(t, b) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[t + '-' + b] || THEME_COLORS['light-beige']);
}
export function applyTheme(t, b) {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('data-base', b);
  localStorage.setItem(KEYS.theme, t);
  localStorage.setItem(KEYS.base, b);
  document.querySelectorAll('#theme-toggle .seg-opt, #welcome-theme .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
  syncThemeColorMeta(t, b);
  syncThemeBaseLabel(b);
  renderAccentSwatches();
}
export function syncThemeBaseLabel(b) {
  const label = '(' + b + ')';
  const w = document.getElementById('welcome-base-label'); if (w) w.textContent = label;
  const s = document.getElementById('settings-base-label'); if (s) s.textContent = label;
}
// Called by the Light/Dark buttons. If that family is already active, cycles to
// its other base variant; otherwise switches families at the default base.
export function setTheme(t) {
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
export function setAccent(a) {
  document.documentElement.setAttribute('data-accent', a);
  localStorage.setItem(KEYS.accent, a);
  renderAccentSwatches();
}
export function renderAccentSwatches() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const current = localStorage.getItem(KEYS.accent) || 'teal';
  const html = ACCENTS.map(a => `<button class="accent-swatch${a.id===current?' active':''}" style="--sw-color:${theme==='dark'?a.dark:a.light}" aria-label="${a.id}" onclick="setAccent('${a.id}')"></button>`).join('');
  const w = document.getElementById('welcome-accent'); if (w) w.innerHTML = html;
  const s = document.getElementById('settings-accent'); if (s) s.innerHTML = html;
}
export function toggleInstructionsIcons(on) {
  setShowInstructionsIcons(!!on);
  localStorage.setItem(KEYS.showInstr, showInstructionsIcons ? '1' : '0');
  document.getElementById('instr-icons-toggle')?.classList.toggle('on', showInstructionsIcons);
  renderDayContent();
}
export function syncWelcomeTheme(t) {
  document.querySelectorAll('#welcome-theme .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === t));
}

/* ─── APP TITLE ─── */
export function updateAppTitle() {
  const name = localStorage.getItem(KEYS.name) || '';
  document.getElementById('sidebar-title').textContent = name ? name + "'s Tally" : 'Tally Up';
}
export function applySettingsName(val) { localStorage.setItem(KEYS.name, val); updateAppTitle(); }

/* ─── SETTINGS SHEET ─── */
export function openSettings(isFirstLaunch) {
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
  lockBodyScroll(['settings-modal']);
  // Belt-and-suspenders: force the overlay's geometry inline so it can never
  // render collapsed even if a browser mishandles the CSS `inset` shorthand.
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.left = '0';
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
  document.getElementById('instr-icons-toggle')?.classList.toggle('on', showInstructionsIcons);
  renderProfileSummaryCard();
}
export function closeSettings() {
  document.getElementById('settings-modal')?.classList.remove('show');
  unlockBodyScroll();
}

/* ─── PROFILE (Settings summary card + edit sheet) ─── */
function goalLabel(value) {
  const opt = GOAL_QUESTIONS[0].options.find(o => o.value === value);
  return opt ? opt.label : '';
}
function frequencyLabel(value) {
  const opt = GOAL_QUESTIONS[1].options.find(o => o.value === value);
  return opt ? opt.label : '';
}
// Called whenever the profile might have changed — after onboarding finishes,
// after a Settings > Profile save, and once on openSettings() so the card is
// never stale if the user edited elsewhere (e.g. bodyweight, name).
export function renderProfileSummaryCard() {
  const p = getProfile();
  const name = localStorage.getItem(KEYS.name) || '';
  const avatarEl = document.getElementById('profile-summary-avatar');
  if (avatarEl) avatarEl.textContent = name ? name.trim().charAt(0).toUpperCase() : '?';
  const nameEl = document.getElementById('profile-summary-name');
  if (nameEl) nameEl.textContent = name || 'Your profile';
  const subEl = document.getElementById('profile-summary-sub');
  if (subEl) {
    const parts = [];
    if (p.goal) parts.push(goalLabel(p.goal));
    if (p.targetFrequency) parts.push(frequencyLabel(p.targetFrequency));
    subEl.textContent = parts.length ? parts.join(', ') : 'Tap to set your goals';
  }
}

// In-sheet draft of edits, committed on Save so backing out with Cancel
// (or tapping outside the sheet) never partially applies a change.
let profileEditDraft = null;
export function openProfileEdit() {
  const p = getProfile();
  profileEditDraft = Object.assign({}, p, { priorityMuscles: (p.priorityMuscles || []).slice() });
  renderProfileEditForm();
  document.getElementById('profile-edit-wrap')?.classList.add('show');
}
export function closeProfileEdit() {
  document.getElementById('profile-edit-wrap')?.classList.remove('show');
  profileEditDraft = null;
}
export function openDataControls() {
  document.getElementById('data-controls-wrap')?.classList.add('show');
  renderLastBackupLine();
}
export function closeDataControls() {
  document.getElementById('data-controls-wrap')?.classList.remove('show');
}
function renderProfileEditForm() {
  const container = document.getElementById('profile-edit-scroll');
  if (!container || !profileEditDraft) return;
  const d = profileEditDraft;
  const name = localStorage.getItem(KEYS.name) || '';
  const bw = getCleanBw();
  const ft = d.heightIn != null ? Math.floor(d.heightIn / 12) : '';
  const inch = d.heightIn != null ? d.heightIn % 12 : '';

  const goalOptsHtml = GOAL_QUESTIONS[0].options.map(o =>
    `<option value="${escAttr(o.value)}"${d.goal === o.value ? ' selected' : ''}>${escHtml(o.label)}</option>`
  ).join('');
  const freqOptsHtml = GOAL_QUESTIONS[1].options.map(o =>
    `<option value="${escAttr(o.value)}"${d.targetFrequency === o.value ? ' selected' : ''}>${escHtml(o.label)}</option>`
  ).join('');
  const muscleChipsHtml = buildPriorityMuscleOptions().map(o => {
    const isActive = d.priorityMuscles.includes(o.value);
    return `<button type="button" class="pf-chip${isActive ? ' active' : ''}" onclick="toggleProfileEditMuscle('${escAttr(o.value)}')">${escHtml(o.label)}</button>`;
  }).join('');

  container.innerHTML = `
    <div class="pf-field">
      <label class="pf-field-label">Name</label>
      <input class="field-input" id="pf-name" type="text" value="${escAttr(name)}" oninput="profileEditDraftSet('name_display', this.value)">
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Height</label>
      <div class="pf-height-row">
        <input class="field-input" id="pf-height-ft" type="number" min="0" max="8" value="${ft}" oninput="profileEditSetHeight()">
        <span>ft</span>
        <input class="field-input" id="pf-height-in" type="number" min="0" max="11" value="${inch}" oninput="profileEditSetHeight()">
        <span>in</span>
      </div>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Current weight</label>
      <div class="pf-weight-row">
        <input class="field-input" id="pf-weight" type="number" min="0" step="0.1" value="${bw != null ? bw : ''}" oninput="profileEditSetWeight(this.value)">
        <span>${currentUnits}</span>
      </div>
      <div class="pf-field-note" id="pf-weight-note"></div>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Main goal</label>
      <select class="field-select" id="pf-goal" onchange="profileEditDraftSet('goal', this.value)">${goalOptsHtml}</select>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Weekly goal</label>
      <select class="field-select" id="pf-frequency" onchange="profileEditDraftSet('targetFrequency', this.value)">${freqOptsHtml}</select>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Priority muscle groups</label>
      <div class="pf-chip-row">${muscleChipsHtml}</div>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Theme <span class="theme-base-label" id="settings-base-label"></span></label>
      <div class="segmented" id="theme-toggle">
        <button class="seg-opt" data-val="light" onclick="setTheme('light')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          Light
        </button>
        <button class="seg-opt" data-val="dark" onclick="setTheme('dark')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          Dark
        </button>
      </div>
    </div>
    <div class="pf-field">
      <label class="pf-field-label">Accent color</label>
      <div class="accent-swatch-row" id="settings-accent"></div>
    </div>
  `;
  // Theme/accent controls render generic markup that renderAccentSwatches()/
  // openSettings() normally populate with active-state — sync them here too
  // since this sheet has its own copies of #theme-toggle / #settings-accent
  // ids (only one is ever in the DOM/visible at a time, so reusing the ids
  // is safe, matching the existing welcome-theme/settings-theme dual-id pattern).
  const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const curBase = document.documentElement.getAttribute('data-base') || THEME_BASE_DEFAULT[curTheme];
  document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === curTheme));
  syncThemeBaseLabel(curBase);
  renderAccentSwatches();
}
// Generic setter for straightforward text/select fields onto the in-sheet
// draft. name_display is handled separately (see saveProfileEdit) since the
// display name lives in KEYS.name, not on the profile object itself.
export function profileEditDraftSet(key, value) {
  if (!profileEditDraft) return;
  if (key === 'name_display') { profileEditDraft._nameDisplay = value; return; }
  profileEditDraft[key] = value;
}
export function profileEditSetHeight() {
  if (!profileEditDraft) return;
  const ft = parseInt(document.getElementById('pf-height-ft')?.value, 10) || 0;
  const inch = parseInt(document.getElementById('pf-height-in')?.value, 10) || 0;
  profileEditDraft.heightIn = (ft * 12) + inch;
}
export function profileEditSetWeight(val) {
  if (!profileEditDraft) return;
  profileEditDraft._weightInput = val;
}
export function toggleProfileEditMuscle(value) {
  if (!profileEditDraft) return;
  const at = profileEditDraft.priorityMuscles.indexOf(value);
  if (at === -1) profileEditDraft.priorityMuscles.push(value);
  else profileEditDraft.priorityMuscles.splice(at, 1);
  renderProfileEditForm();
}
export function saveProfileEdit() {
  if (!profileEditDraft) return;
  if (profileEditDraft._nameDisplay != null) {
    applySettingsName(profileEditDraft._nameDisplay.trim());
  }
  if (profileEditDraft._weightInput !== undefined && profileEditDraft._weightInput !== '') {
    // Reuses the same storage path the old Settings bodyweight field used and
    // whatever else reads KEYS.bw directly (e.g. bodyweight-exercise volume
    // math), so it stays a single source of truth.
    localStorage.setItem(KEYS.bw, parseFloat(profileEditDraft._weightInput));
  }
  saveProfile({
    heightIn: profileEditDraft.heightIn,
    goal: profileEditDraft.goal,
    targetFrequency: profileEditDraft.targetFrequency,
    priorityMuscles: profileEditDraft.priorityMuscles,
  });
  renderProfileSummaryCard();
  closeProfileEdit();
}

export function finishWelcome() {
  const nameInput = document.getElementById('welcome-name');
  const name = nameInput.value.trim();
  if (!name) { document.getElementById('welcome-error').style.display = 'block'; nameInput.focus(); return; }
  localStorage.setItem(KEYS.name, name);
  localStorage.setItem(KEYS.welcomed, '1');
  updateAppTitle();
  // Welcome screen (name/theme/accent) is done — hand off to the goals
  // questionnaire before the app proper opens. welcome-wrap itself stays
  // visible (onboarding renders inside the same full-screen overlay) so
  // there's no flash of the underlying app between the two steps.
  startOnboardingQuestionnaire();
}
