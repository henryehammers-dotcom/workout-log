/* ════════════════════════════════════════════
   Tally Up — History (list, momentum chart, edit session)
   ════════════════════════════════════════════ */
import { activeCharts, currentUnits, getHistory, saveHistory,
         escAttr, escHtml } from './state.js';
import { formatHistoryDate } from './calendar.js';
import { showModal, closeModal } from './modal.js';

/* ─── HISTORY ─── */
export function destroyCharts() { activeCharts.forEach(c => { try { c.destroy(); } catch {} }); activeCharts.length = 0; }
// Parses "Wednesday, Jul 22, 2026" or legacy "Wednesday, Jul 22" (no year) into a real Date.
// Legacy entries assume the most recent past occurrence of that month/day, since they predate
// year-tagging and we can't know which year they were actually logged in.
export function parseSessionDate(str) {
  const parts = str.split(',').map(s => s.trim());
  const monthDay = parts[1] || '';
  const yearPart = parts[2];
  if (yearPart) {
    const d = new Date(`${monthDay} ${yearPart}`);
    if (!isNaN(d)) return d;
  }
  // Legacy, no year: try this year, and if that's in the future, assume last year instead
  const now = new Date();
  const guess = new Date(`${monthDay} ${now.getFullYear()}`);
  if (!isNaN(guess)) {
    if (guess > now) guess.setFullYear(guess.getFullYear() - 1);
    return guess;
  }
  return new Date(0); // unparseable fallback, sorts first
}
export function getExerciseIndex(hist) {
  const idx = {};
  Object.entries(hist).forEach(([date, entries]) => {
    entries.forEach(e => {
      const key = e.exId || e.name;
      if (!idx[key]) idx[key] = { name: e.name, sessions: [] };
      idx[key].sessions.push({ date, sets: e.sets });
    });
  });
  Object.values(idx).forEach(entry => {
    entry.sessions.sort((a, b) => parseSessionDate(a.date) - parseSessionDate(b.date));
  });
  return idx;
}
export function getHistoryDisplayNames(index) { return Object.entries(index).map(([key, val]) => ({ key, name: val.name })).sort((a,b) => a.name.localeCompare(b.name)); }
export function sessionVolume(sets) { return sets.reduce((sum, s) => sum + (Number(s.reps)||0) * (Number(s.weight)||0), 0); }
// Estimated 1-rep max for a single set (Epley formula), used for strength trend
export function setE1RM(s) { const w = Number(s.weight)||0, r = Number(s.reps)||0; return r > 0 ? w * (1 + r/30) : 0; }
// A session's strength score = its best single-set e1RM (not summed across sets)
export function sessionBestE1RM(sets) { return Math.max(0, ...sets.map(setE1RM)); }

let histSearchQuery = '';
export function openHistSearch() {
  document.getElementById('hist-header-row').classList.add('searching');
  document.getElementById('hist-search-btn').style.display = 'none';
  document.getElementById('hist-search-pill').classList.add('show');
  const input = document.getElementById('hist-search-input');
  input.value = '';
  histSearchQuery = '';
  setTimeout(() => input.focus(), 200);
}
export function closeHistSearch() {
  document.getElementById('hist-header-row').classList.remove('searching');
  document.getElementById('hist-search-btn').style.display = '';
  document.getElementById('hist-search-pill').classList.remove('show');
  histSearchQuery = '';
  renderHistory();
}
export function histSearchInput(query) {
  histSearchQuery = query.trim();
  renderHistory();
}
export function renderHistory(selected) {
  destroyCharts();
  const container = document.getElementById('history-container');
  let hist, index;
  try { hist = getHistory(); index = getExerciseIndex(hist); }
  catch { container.innerHTML = '<div class="empty">Could not load history.</div>'; return; }
  const exercises = Object.keys(index);
  if (!exercises.length) { container.innerHTML = '<div class="empty">No history yet. Log a workout to see it here.</div>'; return; }

  if (!selected) {
    let list = getHistoryDisplayNames(index);
    if (typeof histSearchQuery !== 'undefined' && histSearchQuery) {
      const q = histSearchQuery.toLowerCase();
      list = list.filter(({name}) => name.toLowerCase().includes(q));
    }
    if (!list.length) { container.innerHTML = '<div class="empty">No history matches your search.</div>'; return; }
    container.innerHTML =
      list.map(({key, name}) => {
        const entry = index[key];
        const sessions = entry.sessions;
        const best = Math.max(...sessions.flatMap(s => s.sets.map(x => Number(x.weight)||0)));
        const totalVol = sessions.reduce((sum, s) => sum + sessionVolume(s.sets), 0);
        return `<div class="hist-card" data-exkey="${escAttr(key)}">
          <div class="hist-card-text">
            <div class="hist-name">${escHtml(name)}</div>
            <div class="hist-meta">${sessions.length} session${sessions.length!==1?'s':''} · best ${best} ${currentUnits} · vol ${totalVol.toLocaleString()} ${currentUnits}</div>
          </div>
          <span class="hist-chev">›</span>
        </div>`;
      }).join('');
    container.querySelectorAll('[data-exkey]').forEach(el => el.addEventListener('click', () => renderHistory(el.dataset.exkey)));
    return;
  }

  const entry = index[selected]; if (!entry) { renderHistory(); return; }
  const sessions = entry.sessions;
  const labels = sessions.map(s => s.date.replace(/\w+,\s/, ''));
  const best = Math.max(...sessions.flatMap(s => s.sets.map(x => Number(x.weight)||0)));
  const totalVol = sessions.reduce((sum, s) => sum + sessionVolume(s.sets), 0);
  const e1rmPerSession = sessions.map(s => sessionBestE1RM(s.sets));

  let trendStr = '—', trendColor = 'var(--text3)';
  if (sessions.length >= 4) {
    const recent = e1rmPerSession.slice(-3).reduce((a,b)=>a+b,0) / 3;
    const prev = e1rmPerSession.slice(-6,-3);
    if (prev.length > 0) {
      const prevAvg = prev.reduce((a,b)=>a+b,0) / prev.length;
      if (prevAvg > 0) {
        const pct = Math.round(((recent - prevAvg) / prevAvg) * 100);
        trendStr = pct > 0 ? `+${pct}%` : `${pct}%`;
        trendColor = pct > 0 ? 'var(--green)' : pct < 0 ? 'var(--red)' : 'var(--text3)';
      }
    }
  }

  // Group sessions into month folders (most recent first), most recent month expanded by default
  const monthGroups = []; // [{ key, label, rows: [sessionObj,...] }]
  sessions.slice().reverse().forEach(s => {
    const d = parseSessionDate(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let group = monthGroups.find(g => g.key === key);
    if (!group) { group = { key, label, rows: [] }; monthGroups.push(group); }
    group.rows.push(s);
  });

  const sessionFolders = monthGroups.map((group, i) => {
    const rowsHtml = group.rows.map(s => {
      const bestW = Math.max(...s.sets.map(x => Number(x.weight)||0));
      return `<div class="session-row session-row-tap" data-exkey="${escAttr(selected)}" data-date="${escAttr(s.date)}" role="button" tabindex="0">
        <div class="session-date">${escHtml(s.date.replace(/\w+,\s/,''))}<span class="session-edit-hint">tap to edit</span></div>
        <div class="session-sets">${s.sets.map(x=>`<span class="pill${Number(x.weight)===bestW&&bestW>0?' pill-best':''}">${x.reps} × ${x.weight} ${currentUnits}</span>`).join('')}</div>
      </div>`;
    }).join('');
    const open = i === 0; // most recent month starts expanded
    return `<div class="session-folder${open?' open':''}">
      <button class="session-folder-header" onclick="this.parentElement.classList.toggle('open')">
        <span class="session-folder-label">${escHtml(group.label)}</span>
        <span class="session-folder-count">${group.rows.length}</span>
        <svg class="session-folder-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="session-folder-body">${rowsHtml}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <button class="back-btn" onclick="renderHistory()">‹ All exercises</button>
    <div class="ex-detail-name">${escHtml(entry.name)}</div>
    <div class="ex-detail-count">${sessions.length} session${sessions.length!==1?'s':''}</div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-label">Best weight</div><div class="stat-value">${best} ${currentUnits}</div></div>
      <div class="stat-card"><div class="stat-label">Total volume</div><div class="stat-value">${totalVol.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Trend</div><div class="stat-value" style="color:${trendColor}">${trendStr}</div></div>
    </div>
    <div class="chart-wrap">
      <div class="chart-title-row">
        <div class="chart-title">Session momentum</div>
        <button class="chart-info-btn" onclick="showFormulaInfo()" aria-label="How this is measured">?</button>
      </div>
      <div class="momentum-bars" id="momentum-bars"></div>
      <div class="momentum-detail" id="momentum-detail">Tap a bar to see that session</div>
    </div>
    <div class="session-history">${sessionFolders}</div>`;

  const barsEl = document.getElementById('momentum-bars');
  const detailEl = document.getElementById('momentum-detail');
  const BAR_WINDOW = 25;
  const windowStart = Math.max(0, sessions.length - BAR_WINDOW);
  const visSessions = sessions.slice(windowStart);
  const visE1rm = e1rmPerSession.slice(windowStart);
  const visLabels = labels.slice(windowStart);
  const minE = Math.min(...visE1rm), maxE = Math.max(...visE1rm);
  const range = maxE - minE || 1;
  const prMax = Math.max(...e1rmPerSession); // true all-time best, even if outside the visible window
  barsEl.innerHTML = visE1rm.map((v, i) => {
    const h = 24 + ((v - minE) / range) * 76;
    const isPR = v === prMax;
    const isUp = i === 0 || v >= visE1rm[i-1];
    const cls = isPR ? 'bar-pr' : (isUp ? 'bar-up' : 'bar-down');
    return `<div class="momentum-col" data-date="${escAttr(visSessions[i].date)}" data-score="${Math.round(v)}" role="button" tabindex="0">
      <div class="momentum-bar ${cls}" style="height:${Math.round(h)}px"></div>
      <span class="momentum-label">${visLabels[i]}</span>
    </div>`;
  }).join('');

  // Wire tappable momentum bars -> reveal date + score
  barsEl.querySelectorAll('.momentum-col').forEach(el => {
    const reveal = () => {
      const d = el.dataset.date.replace(/\w+,\s/, '');
      detailEl.textContent = `${d} · ${el.dataset.score} ${currentUnits} est.`;
    };
    el.addEventListener('click', reveal);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });
  });

  // Wire tappable session rows -> open edit sheet
  container.querySelectorAll('.session-row-tap').forEach(el => {
    const open = () => openEditSession(el.dataset.exkey, el.dataset.date);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
export function showFormulaInfo() {
  showModal(
    'How session momentum is measured',
    `Each bar shows your estimated one-rep max for that session — the heaviest single set, scaled up using the Epley formula: weight × (1 + reps ÷ 30). This rewards genuine strength gains over just doing more total reps at a lighter weight.`,
    closeModal
  );
}

/* ─── EDIT SESSION SHEET ─── */
let _editSession = null; // { exKey, date, sets: [...], name, exId }

export function openEditSession(exKey, date) {
  const hist = getHistory();
  if (!hist[date]) return;
  const i = hist[date].findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) return;
  const entry = hist[date][i];
  _editSession = {
    exKey,
    date,
    _openedFromDate: date,
    dateChanged: false,
    name: entry.name,
    exId: entry.exId || '',
    sets: entry.sets.map(s => ({ reps: String(s.reps ?? ''), weight: String(s.weight ?? '') })),
  };
  renderEditSession();
  document.getElementById('edit-session-wrap').classList.add('show');
}
export function closeEditSession() {
  _editSession = null;
  document.getElementById('edit-session-wrap').classList.remove('show');
}
// Renders the session date as a big, tappable element. Tapping swaps it for a
// native date input; changing that input stages a new date on _editSession
// (actually moving the history entry happens on Save, in saveEditSession).
function renderEditSessionDate() {
  const el = document.getElementById('edit-session-date');
  if (!el || !_editSession) return;
  const display = _editSession.date.replace(/\w+,\s/, '');
  el.innerHTML = `<span class="edit-session-date-big" id="edit-session-date-display" onclick="editSessionDateEditToggle()">${escHtml(display)}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  </span>`;
}
export function editSessionDateEditToggle() {
  if (!_editSession) return;
  const el = document.getElementById('edit-session-date');
  const d = parseSessionDate(_editSession.date);
  const iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  el.innerHTML = `<input type="date" class="edit-session-date-input-big" id="edit-session-date-input" value="${iso}">`;
  const input = document.getElementById('edit-session-date-input');
  input.addEventListener('change', () => {
    if (!input.value) { renderEditSessionDate(); return; }
    const [y,m,dd] = input.value.split('-').map(Number);
    const newDate = new Date(y, m-1, dd);
    _editSession.date = formatHistoryDate(newDate);
    _editSession.dateChanged = true;
    renderEditSessionDate();
  });
  input.focus();
}
function renderEditSession() {
  if (!_editSession) return;
  document.getElementById('edit-session-title').textContent = _editSession.name;
  renderEditSessionDate();
  const rows = _editSession.sets.map((s, i) => `
    <div class="edit-set-row">
      <div class="edit-set-num">Set ${i+1}</div>
      <input class="set-input edit-set-input" type="number" min="0" placeholder="Reps" value="${escAttr(s.reps)}" data-i="${i}" data-field="reps">
      <input class="set-input edit-set-input" type="number" min="0" placeholder="Weight" value="${escAttr(s.weight)}" data-i="${i}" data-field="weight">
    </div>`).join('');
  document.getElementById('edit-session-sets').innerHTML = rows || '<div class="empty">No sets.</div>';
  document.getElementById('edit-session-sets').querySelectorAll('.edit-set-input').forEach(el => {
    el.addEventListener('input', () => {
      const idx = Number(el.dataset.i);
      const field = el.dataset.field;
      if (_editSession && _editSession.sets[idx]) _editSession.sets[idx][field] = el.value;
    });
  });
}
export function saveEditSession() {
  if (!_editSession) return;
  // Flush any in-progress input values (mobile keyboards sometimes lag)
  document.getElementById('edit-session-sets').querySelectorAll('.edit-set-input').forEach(el => {
    const idx = Number(el.dataset.i);
    const field = el.dataset.field;
    if (_editSession.sets[idx]) _editSession.sets[idx][field] = el.value;
  });
  const cleanSets = _editSession.sets
    .filter(s => s.reps !== '' || s.weight !== '')
    .map(s => ({ reps: Number(s.reps)||0, weight: Number(s.weight)||0 }));
  const exKey = _editSession.exKey;
  const hist = getHistory();
  // The entry always still lives under the date it was originally opened from —
  // find and remove it from there first, then re-insert under the (possibly new) date.
  const fromDate = _editSession._openedFromDate;
  const dayEntries = hist[fromDate];
  if (!dayEntries) { closeEditSession(); renderHistory(); return; }
  const i = dayEntries.findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) { closeEditSession(); renderHistory(); return; }
  const entry = dayEntries[i];
  dayEntries.splice(i, 1);
  if (!dayEntries.length) delete hist[fromDate];

  if (cleanSets.length) {
    entry.sets = cleanSets;
    const toDate = _editSession.date;
    if (!hist[toDate]) hist[toDate] = [];
    // Merge into an existing entry for the same exercise on the target date, if any
    const existingIdx = hist[toDate].findIndex(e => (e.exId || e.name) === exKey);
    if (existingIdx >= 0 && toDate !== fromDate) {
      hist[toDate][existingIdx].sets = hist[toDate][existingIdx].sets.concat(cleanSets);
    } else if (existingIdx >= 0) {
      hist[toDate][existingIdx] = entry;
    } else {
      hist[toDate].push(entry);
    }
  }
  // else: all sets cleared -> entry stays removed (deleted)

  saveHistory(hist);
  closeEditSession();
  // If exercise still has any sessions across history, stay on its detail view; otherwise fall back to list
  renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
}

export function deleteSession() {
  if (!_editSession) return;
  const exKey = _editSession.exKey;
  const date = _editSession._openedFromDate;
  const name = _editSession.name;
  // Close the edit-session sheet before showing the confirmation modal — its
  // overlay sits at a higher z-index than the modal, which would otherwise
  // bury the modal underneath it and make "Continue"/"Delete" unclickable.
  closeEditSession();
  showModal('Delete this session?', `Permanently remove the ${date.replace(/\w+,\s/, '')} session for ${name}?`, () => {
    const hist = getHistory();
    const dayEntries = hist[date];
    if (dayEntries) {
      const i = dayEntries.findIndex(e => (e.exId || e.name) === exKey);
      if (i >= 0) {
        dayEntries.splice(i, 1);
        if (!dayEntries.length) delete hist[date];
        saveHistory(hist);
      }
    }
    closeModal();
    renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
  });
}

function exerciseStillHasSessions(exKey) {
  if (!exKey) return false;
  const hist = getHistory();
  return Object.values(hist).some(entries => entries.some(e => (e.exId || e.name) === exKey));
}
