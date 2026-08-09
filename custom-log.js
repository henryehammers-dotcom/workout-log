/* ════════════════════════════════════════════
   Tally Up — Custom Log
   A blank log page: pick any exercise from the library, freeform
   sets/reps, editable date, saves straight to history.
   ════════════════════════════════════════════ */

let _customLog = null; // { date: Date, entries: [{ exId, name, sets:[{reps,weight}] }] }

function openCustomLog(isoDate) {
  try {
    const date = isoDate ? parseISODate(isoDate) : cloneDate(viewedDate);
    _customLog = { date, entries: [] };
    const wrap = document.getElementById('custom-log-wrap');
    if (!wrap) { alert('Custom log failed to open (missing sheet). Please reload the app.'); return; }
    wrap.classList.add('show');
    renderCustomLog();
  } catch (err) {
    console.error('openCustomLog failed:', err);
    alert('Custom log failed to open: ' + err.message);
  }
}
function closeCustomLog() {
  _customLog = null;
  document.getElementById('custom-log-wrap')?.classList.remove('show');
}
function customLogSetDate(val) {
  if (!_customLog || !val) return;
  const [y,m,d] = val.split('-').map(Number);
  _customLog.date = new Date(y, m-1, d);
  renderCustomLogHeader();
}
function renderCustomLogHeader() {
  if (!_customLog) return;
  const el = document.getElementById('custom-log-date');
  if (!el) return;
  const display = _customLog.date.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', year:'numeric' });
  el.innerHTML = `<span class="edit-session-date-big" id="custom-log-date-display" onclick="customLogDateEditToggle()">${escHtml(display)}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  </span>`;
}
function customLogDateEditToggle() {
  if (!_customLog) return;
  const el = document.getElementById('custom-log-date');
  const iso = formatISODate(_customLog.date);
  el.innerHTML = `<input type="date" class="edit-session-date-input-big" id="custom-log-date-input" value="${iso}">`;
  const input = document.getElementById('custom-log-date-input');
  input.addEventListener('change', () => {
    if (!input.value) { renderCustomLogHeader(); return; }
    customLogSetDate(input.value);
  });
  input.focus();
}
function customLogAddExercise() {
  openLibV2ForCustomLog();
}
// Bridges the existing Library-V2 picker into custom-log mode
let _customLogPicking = false;
function openLibV2ForCustomLog() {
  _customLogPicking = true;
  document.getElementById('custom-log-wrap').classList.remove('show');
  switchTab('library');
}
function customLogReceiveExercise(ex) {
  if (!_customLog) return;
  _customLog.entries.push({ exId: ex.id||'', name: ex.name, type: ex.type, sets: [{reps:'',weight:''}] });
  document.getElementById('custom-log-wrap').classList.add('show');
  renderCustomLog();
}
function customLogRemoveEntry(i) {
  if (!_customLog) return;
  _customLog.entries.splice(i, 1);
  renderCustomLog();
}
function customLogAddSet(i) {
  if (!_customLog || !_customLog.entries[i]) return;
  _customLog.entries[i].sets.push({reps:'',weight:''});
  renderCustomLog();
}
function customLogRemoveSet(i, si) {
  if (!_customLog || !_customLog.entries[i]) return;
  _customLog.entries[i].sets.splice(si, 1);
  if (!_customLog.entries[i].sets.length) _customLog.entries[i].sets.push({reps:'',weight:''});
  renderCustomLog();
}
function customLogFlush() {
  if (!_customLog) return;
  document.querySelectorAll('#custom-log-entries [data-cli]').forEach(el => {
    const i = Number(el.dataset.cli), si = Number(el.dataset.clsi), field = el.dataset.field;
    if (_customLog.entries[i] && _customLog.entries[i].sets[si]) _customLog.entries[i].sets[si][field] = el.value;
  });
}
function renderCustomLog() {
  if (!_customLog) return;
  try {
    renderCustomLogHeader();
    const u = currentUnits;
    const entriesHtml = _customLog.entries.length === 0
      ? '<div class="empty">No exercises added yet — tap “+ Add exercise” below.</div>'
      : _customLog.entries.map((e, i) => `
        <div class="exercise-card" data-idx="${i}">
          <div class="ex-head">
            <div class="ex-head-text"><div class="ex-name">${escHtml(e.name)}</div></div>
            <button class="ex-x" onclick="customLogRemoveEntry(${i})" aria-label="Remove">✕</button>
          </div>
          <div class="sets-table">
            <div class="sets-thead">
              <span class="sets-thead-cell center">Set</span>
              <span class="sets-thead-cell center">Reps</span>
              <span class="sets-thead-cell center">Weight (${u})</span>
              <span></span>
            </div>
            ${e.sets.map((s, si) => `
              <div class="set-row">
                <span class="set-num">${si+1}</span>
                <input class="set-input" type="number" min="0" placeholder="Reps" value="${escAttr(s.reps)}" data-cli="${i}" data-clsi="${si}" data-field="reps">
                <input class="set-input" type="number" min="0" placeholder="Weight" value="${escAttr(s.weight)}" data-cli="${i}" data-clsi="${si}" data-field="weight">
                <button class="del-set" onclick="customLogRemoveSet(${i},${si})" aria-label="Clear">✕</button>
              </div>`).join('')}
          </div>
          <div class="card-footer">
            <button class="add-exercise-btn" style="margin-top:0" onclick="customLogAddSet(${i})">+ Add set</button>
          </div>
        </div>`).join('');
    const entriesEl = document.getElementById('custom-log-entries');
    if (!entriesEl) { console.error('renderCustomLog: #custom-log-entries not found in DOM'); return; }
    entriesEl.innerHTML = entriesHtml;
    entriesEl.querySelectorAll('[data-cli]').forEach(el => {
      el.addEventListener('input', customLogFlush);
    });
  } catch (err) {
    console.error('renderCustomLog failed:', err);
    const entriesEl = document.getElementById('custom-log-entries');
    if (entriesEl) entriesEl.innerHTML = `<div class="empty">Something went wrong loading this — ${escHtml(err.message)}</div>`;
  }
}
function saveCustomLog() {
  if (!_customLog) return;
  customLogFlush();
  const dateKey = formatHistoryDate(_customLog.date);
  const hist = getHistory();
  if (!hist[dateKey]) hist[dateKey] = [];
  _customLog.entries.forEach(e => {
    const cleanSets = e.sets
      .filter(s => s.reps !== '' || s.weight !== '')
      .map(s => ({ reps: Number(s.reps)||0, weight: Number(s.weight)||0 }));
    if (!cleanSets.length) return;
    const existing = hist[dateKey].findIndex(x => (x.exId && e.exId) ? x.exId === e.exId : x.name === e.name);
    if (existing >= 0) hist[dateKey][existing].sets = hist[dateKey][existing].sets.concat(cleanSets);
    else hist[dateKey].push({ exId: e.exId||'', name: e.name, sets: cleanSets });
  });
  if (!hist[dateKey].length) delete hist[dateKey];
  saveHistory(hist);
  closeCustomLog();
  jumpToDate(_customLog ? _customLog.date : new Date());
}
