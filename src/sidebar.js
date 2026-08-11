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

/* ─── SWIPE-FROM-LEFT-EDGE TO OPEN ───
   A swipe starting within EDGE_ZONE px of the left edge of the screen,
   moving mostly rightward (not a vertical scroll), and travelling at
   least MIN_SWIPE px opens the sidebar — the standard mobile "edge swipe"
   pattern, so it doesn't fight with normal vertical page scrolling or
   with horizontal drag-to-reorder inside the day view. */
const EDGE_ZONE = 24;
const MIN_SWIPE = 60;
let touchStartX = null, touchStartY = null, touchStartedAtEdge = false;

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartedAtEdge = t.clientX <= EDGE_ZONE;
}
function onTouchEnd(e) {
  if (!touchStartedAtEdge || touchStartX === null) { touchStartX = null; return; }
  const t = e.changedTouches[0];
  if (!t) { touchStartX = null; return; }
  const dx = t.clientX - touchStartX;
  const dy = Math.abs(t.clientY - touchStartY);
  // Require a mostly-horizontal rightward swipe so vertical scrolling near
  // the edge never accidentally triggers the sidebar.
  if (dx >= MIN_SWIPE && dx > dy * 1.5) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('show')) openSidebar();
  }
  touchStartX = null; touchStartY = null; touchStartedAtEdge = false;
}
document.addEventListener('touchstart', onTouchStart, { passive: true });
document.addEventListener('touchend', onTouchEnd, { passive: true });
