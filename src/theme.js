/* ════════════════════════════════════════════
   Tally Up — Theme, Units, Settings Sheet
   ════════════════════════════════════════════ */
import { KEYS, currentUnits, setCurrentUnits, showInstructionsIcons, setShowInstructionsIcons,
         hideBodyweight, getCleanBw, APP_VERSION, setAppVersion } from './state.js';
import { renderDayContent } from './schedule-day.js';
import { updateBwDisplay } from './bodyweight.js';
import { maybeShowGreeting } from './greeting.js';
import { renderLastBackupLine } from './backup.js';

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
  updateBwDisplay();
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
  // Belt-and-suspenders: force the overlay's geometry inline so it can never
  // render collapsed even if a browser mishandles the CSS `inset` shorthand.
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.left = '0';
  const nameEl = document.getElementById('settings-name');
  if (nameEl) nameEl.value = localStorage.getItem(KEYS.name) || '';
  const bw = getCleanBw();
  const bwEl = document.getElementById('settings-bw');
  if (bwEl) bwEl.value = bw != null ? bw : '';
  document.querySelectorAll('#units-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === currentUnits));
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const base = document.documentElement.getAttribute('data-base') || THEME_BASE_DEFAULT[theme];
  document.querySelectorAll('#theme-toggle .seg-opt').forEach(el => el.classList.toggle('active', el.dataset.val === theme));
  syncThemeBaseLabel(base);
  renderAccentSwatches();
  document.getElementById('instr-icons-toggle')?.classList.toggle('on', showInstructionsIcons);
  document.getElementById('hide-bw-toggle')?.classList.toggle('on', hideBodyweight);
  renderLastBackupLine();
}
export function closeSettings() { document.getElementById('settings-modal')?.classList.remove('show'); }

export function finishWelcome() {
  const nameInput = document.getElementById('welcome-name');
  const name = nameInput.value.trim();
  if (!name) { document.getElementById('welcome-error').style.display = 'block'; nameInput.focus(); return; }
  localStorage.setItem(KEYS.name, name);
  localStorage.setItem(KEYS.welcomed, '1');
  updateAppTitle();
  document.getElementById('welcome-wrap').classList.remove('show');
  setTimeout(maybeShowGreeting, 200);
}
