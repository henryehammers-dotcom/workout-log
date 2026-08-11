/* ════════════════════════════════════════════
   Tally Up — Modal (generic confirm dialog)
   ════════════════════════════════════════════ */
export function showModal(title, body, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const oldBtn = document.getElementById('modal-ok');
  const newBtn = oldBtn.cloneNode(true);
  newBtn.addEventListener('click', onConfirm);
  oldBtn.replaceWith(newBtn);
  document.getElementById('modal-wrap').classList.add('show');
}
export function closeModal() { document.getElementById('modal-wrap').classList.remove('show'); }
