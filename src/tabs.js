/* ════════════════════════════════════════════
   Tally Up — Tab switching
   ════════════════════════════════════════════ */
import { closeSidebar } from './sidebar.js';
import { closeLibSearch, resetLibNavState, clearLibPickingDay, renderLibV2 } from './library.js';
import { closeHistSearch, renderHistory, destroyCharts } from './history.js';
import { setCustomLogPicking } from './custom-log.js';
import { renderDayContent } from './schedule-day.js';
import { ensureClockBuilt } from './clock.js';

export function switchTab(tab) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-' + tab).classList.add('active');
  if (tab !== 'library') {
    clearLibPickingDay();
    if (document.getElementById('lib-search-pill')?.classList.contains('show')) closeLibSearch();
    resetLibNavState();
    document.getElementById('lib-landing').style.display = '';
    document.getElementById('lib-category').style.display = 'none';
  }
  if (tab !== 'history') {
    if (document.getElementById('hist-search-pill')?.classList.contains('show')) closeHistSearch();
  }
  // Leaving to a tab that isn't Library or Log (where the Custom Log sheet lives)
  // means the user abandoned the picker — don't leave "Add to Custom Log" stuck
  // as the exercise-detail button label for a future normal "Add to Day" visit.
  if (tab !== 'library' && tab !== 'log') {
    setCustomLogPicking(false);
  }
  ['log','history','library','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none'; });
  if (tab === 'history') renderHistory();
  else if (tab === 'library') {
    renderLibV2();
    document.getElementById('log-back-btn')?.classList.remove('show');
    requestAnimationFrame(() => renderLibV2()); // safety re-render once tab is actually visible
  }
  else if (tab === 'clock') { ensureClockBuilt(); document.getElementById('log-back-btn')?.classList.remove('show'); }
  else { destroyCharts(); renderDayContent(); document.getElementById('log-back-btn')?.classList.remove('show'); requestAnimationFrame(() => renderDayContent()); }
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
  closeSidebar();
}
export function openExerciseHistory(key) {
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  document.getElementById('snav-history').classList.add('active');
  ['log','history','clock'].forEach(t => { document.getElementById('tab-' + t).style.display = t === 'history' ? '' : 'none'; });
  renderHistory(key);
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
}
