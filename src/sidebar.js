/* ════════════════════════════════════════════
   Tally Up — Sidebar
   ════════════════════════════════════════════ */
export function openSidebar() {
  document.getElementById('sidebar').classList.add('show');
  document.getElementById('sidebar-overlay').classList.add('show');
}
export function closeSidebar() {
  try {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('sidebar-overlay').classList.remove('show');
  } catch (err) {
    console.error('closeSidebar failed:', err);
  }
}
