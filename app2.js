/* ════════════════════════════════════════════
   Tallymark — application logic, part 2
   (history, library, clock, greeting, music)
   ════════════════════════════════════════════ */

/* ─── HISTORY ─── */
function destroyCharts() { activeCharts.forEach(c => { try { c.destroy(); } catch {} }); activeCharts = []; }
function getExerciseIndex(hist) {
  const idx = {};
  Object.entries(hist).forEach(([date, entries]) => {
    entries.forEach(e => {
      const key = e.exId || e.name;
      if (!idx[key]) idx[key] = { name: e.name, sessions: [] };
      idx[key].sessions.push({ date, sets: e.sets });
    });
  });
  return idx;
}
function getHistoryDisplayNames(index) { return Object.entries(index).map(([key, val]) => ({ key, name: val.name })).sort((a,b) => a.name.localeCompare(b.name)); }
function sessionVolume(sets) { return sets.reduce((sum, s) => sum + (Number(s.reps)||0) * (Number(s.weight)||0), 0); }
// Estimated 1-rep max for a single set (Epley formula), used for strength trend
function setE1RM(s) { const w = Number(s.weight)||0, r = Number(s.reps)||0; return r > 0 ? w * (1 + r/30) : 0; }
// A session's strength score = its best single-set e1RM (not summed across sets)
function sessionBestE1RM(sets) { return Math.max(0, ...sets.map(setE1RM)); }
function parseRepRange(str) { if (!str) return null; const m = str.match(/(\d+)\s*[-–—]\s*(\d+)/); return m ? { lo: parseInt(m[1]), hi: parseInt(m[2]) } : null; }
function getRepRangeForExercise(nameOrId) {
  for (const g of library) for (const ex of g.exercises) if ((ex.id && ex.id === nameOrId) || ex.name === nameOrId) return parseRepRange(ex.reps);
  for (const d of Object.values(schedule)) for (const ex of d.exercises) if (ex.name === nameOrId && ex.reps) return parseRepRange(ex.reps);
  return null;
}

function renderHistory(selected) {
  destroyCharts();
  const container = document.getElementById('history-container');
  let hist, index;
  try { hist = getHistory(); index = getExerciseIndex(hist); }
  catch { container.innerHTML = '<div class="empty">Could not load history.</div>'; return; }
  const exercises = Object.keys(index);
  if (!exercises.length) { container.innerHTML = '<div class="empty">No history yet. Log a workout to see it here.</div>'; return; }

  if (!selected) {
    const list = getHistoryDisplayNames(index);
    container.innerHTML = `<div class="history-section-label">All exercises · ${list.length}</div>` +
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
  const volPerSession = sessions.map(s => sessionVolume(s.sets));
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

  const sessionRows = sessions.slice().reverse().map(s => {
    const bestW = Math.max(...s.sets.map(x => Number(x.weight)||0));
    return `<div class="session-row session-row-tap" data-exkey="${escAttr(selected)}" data-date="${escAttr(s.date)}" role="button" tabindex="0">
      <div class="session-date">${escHtml(s.date.replace(/\w+,\s/,''))}<span class="session-edit-hint">tap to edit</span></div>
      <div class="session-sets">${s.sets.map(x=>`<span class="pill${Number(x.weight)===bestW&&bestW>0?' pill-best':''}">${x.reps} × ${x.weight} ${currentUnits}</span>`).join('')}</div>
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
    <div class="session-history">${sessionRows}</div>`;

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
function showFormulaInfo() {
  showModal(
    'How session momentum is measured',
    `Each bar shows your estimated one-rep max for that session — the heaviest single set, scaled up using the Epley formula: weight × (1 + reps ÷ 30). This rewards genuine strength gains over just doing more total reps at a lighter weight.`,
    closeModal
  );
}

/* ─── EDIT SESSION SHEET ─── */
let _editSession = null; // { exKey, date, sets: [...], name, exId }

function openEditSession(exKey, date) {
  const hist = getHistory();
  if (!hist[date]) return;
  const i = hist[date].findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) return;
  const entry = hist[date][i];
  _editSession = {
    exKey,
    date,
    name: entry.name,
    exId: entry.exId || '',
    sets: entry.sets.map(s => ({ reps: String(s.reps ?? ''), weight: String(s.weight ?? '') })),
  };
  renderEditSession();
  document.getElementById('edit-session-wrap').classList.add('show');
}
function closeEditSession() {
  _editSession = null;
  document.getElementById('edit-session-wrap').classList.remove('show');
}
function renderEditSession() {
  if (!_editSession) return;
  document.getElementById('edit-session-title').textContent = _editSession.name;
  document.getElementById('edit-session-date').textContent = _editSession.date.replace(/\w+,\s/, '');
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
function saveEditSession() {
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
  const dayEntries = hist[_editSession.date];
  if (!dayEntries) { closeEditSession(); renderHistory(); return; }
  const i = dayEntries.findIndex(e => (e.exId || e.name) === exKey);
  if (i < 0) { closeEditSession(); renderHistory(); return; }
  if (!cleanSets.length) {
    // All sets cleared -> remove this session entirely
    dayEntries.splice(i, 1);
    if (!dayEntries.length) delete hist[_editSession.date];
  } else {
    dayEntries[i].sets = cleanSets;
  }
  saveHistory(hist);
  closeEditSession();
  // If exercise still has any sessions across history, stay on its detail view; otherwise fall back to list
  renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
}

function deleteSession() {
  if (!_editSession) return;
  const exKey = _editSession.exKey;
  const date = _editSession.date;
  const name = _editSession.name;
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
    closeEditSession();
    renderHistory(exerciseStillHasSessions(exKey) ? exKey : undefined);
  });
}

function exerciseStillHasSessions(exKey) {
  if (!exKey) return false;
  const hist = getHistory();
  return Object.values(hist).some(entries => entries.some(e => (e.exId || e.name) === exKey));
}

/* ─── LIBRARY SHEET ─── */
let _libPickingDay = null;

function openLibSheet(day) {
  _libPickingDay = day;
  document.getElementById('lib-search').value = '';
  document.getElementById('lib-filter').value = '';
  hideLibAddForm();
  renderLibSheet();
  document.getElementById('lib-sheet-wrap').classList.add('show');
  setTimeout(() => document.getElementById('lib-search').focus(), 100);
}
function closeLibSheet() { document.getElementById('lib-sheet-wrap').classList.remove('show'); }
function showLibAddForm() {
  document.getElementById('lib-add-form').style.display = 'block';
  document.getElementById('lib-sheet-search-row').style.display = 'none';
  setTimeout(() => document.getElementById('lf-name').focus(), 100);
}
function hideLibAddForm() {
  const form = document.getElementById('lib-add-form');
  if (form) form.style.display = 'none';
  const searchRow = document.getElementById('lib-sheet-search-row');
  if (searchRow) searchRow.style.display = 'flex';
}

function renderLibSheet() {
  const q = (document.getElementById('lib-search')?.value || '').toLowerCase();
  const f = document.getElementById('lib-filter')?.value || '';
  const container = document.getElementById('lib-sheet-list');
  if (!container) return;
  let html = '';
  library.forEach((g, gi) => {
    const filtered = g.exercises.filter(ex => (!q || ex.name.toLowerCase().includes(q)) && (!f || ex.type === f));
    if (!filtered.length) return;
    html += `<div class="lib-section-label">${escHtml(g.group)}</div>`;
    filtered.forEach(ex => {
      const ei = g.exercises.indexOf(ex);
      const meta = [ex.reps ? ex.reps+' reps' : '', ex.sets ? ex.sets+' sets' : '', ex.duration||'', ex.rest ? ex.rest+' rest' : ''].filter(Boolean).join(' · ');
      html += `<div class="lib-item-wrap" id="liw-${gi}-${ei}">
        <div class="lib-swipe-actions">
          <button class="lib-swipe-btn lib-swipe-edit" onclick="startLibEdit(${gi},${ei})">Edit</button>
          <button class="lib-swipe-btn lib-swipe-delete" onclick="deleteLibEntry(${gi},${ei})">Delete</button>
        </div>
        <div class="lib-item" id="li-${gi}-${ei}" onclick="addFromLibrarySheet(${gi},${ei})">
          <div class="lib-item-left">
            <div class="lib-item-name">${escHtml(ex.name)}<span class="lib-tag ${TAG_CLASS[ex.type]||'tag-gym'}">${TAG_LABEL[ex.type]||ex.type}</span></div>
            <div class="lib-item-meta">${meta}</div>
          </div>
        </div>
      </div>`;
    });
  });
  if (!html) html = '<div class="empty">No exercises found.</div>';
  container.innerHTML = html;
  initLibSwipe();
}

function initLibSwipe() {
  document.querySelectorAll('#lib-sheet-list .lib-item').forEach(item => {
    let startX = 0, startY = 0, dx = 0, isSwiping = false, isVertical = false;
    item.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; dx = 0; isSwiping = false; isVertical = false; }, { passive: true });
    item.addEventListener('touchmove', e => {
      dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!isSwiping && !isVertical) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) isSwiping = true;
        else if (Math.abs(dy) > 6) isVertical = true;
      }
      if (!isSwiping) return;
      e.preventDefault();
      item.style.transition = 'none';
      item.style.transform = `translateX(${Math.max(-130, Math.min(0, dx))}px)`;
    }, { passive: false });
    item.addEventListener('touchend', () => {
      if (!isSwiping) return;
      item.style.transition = 'transform 0.2s ease';
      if (dx < -60) {
        document.querySelectorAll('#lib-sheet-list .lib-item.swiped').forEach(el => { if (el !== item) { el.classList.remove('swiped'); el.style.transform = ''; } });
        item.style.transform = 'translateX(-130px)';
        item.classList.add('swiped');
      } else { item.style.transform = ''; item.classList.remove('swiped'); }
    });
  });
}

function startLibEdit(gi, ei) {
  const ex = library[gi].exercises[ei];
  const wrap = document.getElementById(`liw-${gi}-${ei}`);
  if (!wrap) return;
  const group = library[gi].group;
  const isCustom = ex.type === 'custom';
  wrap.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--accent-border);border-radius:10px;padding:12px">
      <div class="field-grid">
        <div class="field-group"><span class="field-hint">Name</span><input class="field-input" type="text" id="le-name-${gi}-${ei}" value="${escAttr(ex.name)}"></div>
        <div class="field-group"><span class="field-hint">Muscle group</span><input class="field-input" type="text" id="le-group-${gi}-${ei}" value="${escAttr(group)}"></div>
      </div>
      <div class="field-grid" style="grid-template-columns:1fr 1fr 1fr">
        <div class="field-group"><span class="field-hint">Equipment</span>
          <select class="field-select" id="le-type-${gi}-${ei}">
            <option value="gym"${ex.type==='gym'?' selected':''}>Gym</option>
            <option value="dumbbell"${ex.type==='dumbbell'?' selected':''}>Dumbbells</option>
            <option value="bodyweight"${ex.type==='bodyweight'?' selected':''}>Bodyweight</option>
            <option value="custom"${isCustom?' selected':''}>Custom</option>
          </select>
        </div>
        <div class="field-group"><span class="field-hint">Sets</span><input class="field-input" type="number" id="le-sets-${gi}-${ei}" value="${ex.sets||''}" placeholder="—" min="1"></div>
        <div class="field-group"><span class="field-hint">Reps</span><input class="field-input" type="text" id="le-reps-${gi}-${ei}" value="${escAttr(ex.reps)}" placeholder="8-12"></div>
      </div>
      ${isCustom ? `<div class="field-grid" style="grid-template-columns:1fr"><div class="field-group"><span class="field-hint">Duration</span><input class="field-input" type="text" id="le-duration-${gi}-${ei}" value="${escAttr(ex.duration)}" placeholder="e.g. 30 min"></div></div>` : ''}
      <div class="field-grid">
        <div class="field-group"><span class="field-hint">Rest</span><input class="field-input" type="number" id="le-rest-${gi}-${ei}" value="${parseInt(ex.rest)||90}" min="1"></div>
        <div class="field-group"><span class="field-hint">Unit</span>
          <select class="field-select" id="le-unit-${gi}-${ei}">
            <option value="sec"${!ex.rest.includes('min')?' selected':''}>sec</option>
            <option value="min"${ex.rest.includes('min')?' selected':''}>min</option>
          </select>
        </div>
      </div>
      <div class="field-group" style="margin-bottom:10px"><span class="field-hint">Note (optional)</span><input class="field-input" type="text" id="le-note-${gi}-${ei}" value="${escAttr(ex.note)}" placeholder="e.g. Keep core tight"></div>
      <div style="display:flex;gap:8px">
        <button class="btn-base primary" style="flex:1" onclick="saveLibEdit(${gi},${ei})">Save</button>
        <button class="btn-base" style="flex:1" onclick="renderLibSheet()">Cancel</button>
      </div>
    </div>`;
}

function saveLibEdit(gi, ei) {
  const name  = document.getElementById(`le-name-${gi}-${ei}`).value.trim();
  const group = document.getElementById(`le-group-${gi}-${ei}`).value.trim();
  const type  = document.getElementById(`le-type-${gi}-${ei}`).value;
  const sets  = parseInt(document.getElementById(`le-sets-${gi}-${ei}`).value) || 0;
  const durEl = document.getElementById(`le-duration-${gi}-${ei}`);
  const duration = durEl ? durEl.value.trim() : '';
  const note  = document.getElementById(`le-note-${gi}-${ei}`).value.trim();
  const reps  = document.getElementById(`le-reps-${gi}-${ei}`).value.trim();
  const rv    = parseInt(document.getElementById(`le-rest-${gi}-${ei}`).value) || 90;
  const unit  = document.getElementById(`le-unit-${gi}-${ei}`).value;
  if (!name) return;
  if (type !== 'custom') {
    const repsEl = document.getElementById(`le-reps-${gi}-${ei}`);
    if (!validReps(repsEl.value)) { repsEl.style.borderColor = 'var(--red)'; setTimeout(() => repsEl.style.borderColor = '', 1500); return; }
  }
  const updated = { ...library[gi].exercises[ei], name, reps, sets, duration, note, rest: rv+' '+unit, restSecs: unit==='min'?rv*60:rv, type };
  const oldGroup = library[gi].group;
  if (group && group.toLowerCase() !== oldGroup.toLowerCase()) {
    library[gi].exercises.splice(ei, 1);
    if (library[gi].exercises.length === 0) library.splice(gi, 1);
    const newGi = library.findIndex(g => g.group.toLowerCase() === group.toLowerCase());
    if (newGi >= 0) library[newGi].exercises.push(updated);
    else library.push({ group, exercises: [updated] });
  } else {
    library[gi].exercises[ei] = updated;
  }
  saveLibrary();
  if (updated.id) {
    DAY_NAMES.forEach(d => {
      schedule[d].exercises.forEach((ex, i) => {
        if (ex.exId === updated.id) {
          schedule[d].exercises[i] = { ...ex, name: updated.name, reps: updated.reps, sets: updated.sets, duration: updated.duration, note: updated.note, rest: updated.rest, restSecs: updated.restSecs, type: updated.type };
        }
      });
    });
    saveSchedule();
    renderDayContent();
  }
  renderLibSheet();
}

function addFromLibrarySheet(gi, ei) {
  const ex = library[gi].exercises[ei];
  const d = _libPickingDay;
  if (!d) return;
  const already = schedule[d].exercises.some(e => e.name === ex.name);
  if (already) {
    showModal('Already added', `${ex.name} is already in ${FULL_DAYS[d]}. Add it again anyway?`, () => {
      schedule[d].exercises.push({ exId:ex.id, name:ex.name, reps:ex.reps, sets:ex.sets||0, duration:ex.duration||'', note:ex.note||'', rest:ex.rest, restSecs:ex.restSecs, type:ex.type });
      saveSchedule(); closeModal();
      if (currentDay === d) renderDayContent();
      closeLibSheet();
    });
    return;
  }
  schedule[d].exercises.push({ exId:ex.id, name:ex.name, reps:ex.reps, sets:ex.sets||0, duration:ex.duration||'', note:ex.note||'', rest:ex.rest, restSecs:ex.restSecs, type:ex.type });
  saveSchedule();
  if (currentDay === d) renderDayContent();
  closeLibSheet();
}

function saveNewLibEntry() {
  const name = document.getElementById('lf-name').value.trim();
  const group = document.getElementById('lf-group').value.trim();
  const type = document.getElementById('lf-type').value;
  const reps = document.getElementById('lf-reps').value.trim();
  const sets = parseInt(document.getElementById('lf-sets').value) || 0;
  const duration = type === 'custom' ? document.getElementById('lf-duration').value.trim() : '';
  const note = document.getElementById('lf-note').value.trim();
  const rv = parseInt(document.getElementById('lf-rest').value) || 90;
  const unit = document.getElementById('lf-unit').value;
  if (!name) { document.getElementById('lf-name').focus(); return; }
  if (!group) { document.getElementById('lf-group').focus(); return; }
  if (type !== 'custom') {
    const repsEl = document.getElementById('lf-reps');
    if (!validReps(repsEl.value)) { repsEl.style.borderColor = 'var(--red)'; setTimeout(() => repsEl.style.borderColor = '', 1500); return; }
  }
  const restSecs = unit === 'min' ? rv * 60 : rv;
  const gi = library.findIndex(g => g.group.toLowerCase() === group.toLowerCase());
  const entry = { id: genId(), name, reps, sets, duration, note, rest: rv+' '+unit, restSecs, type };
  if (gi >= 0) library[gi].exercises.push(entry);
  else library.push({ group, exercises: [entry] });
  saveLibrary();
  hideLibAddForm();
  // Clear fields
  ['lf-name','lf-group','lf-reps','lf-sets','lf-duration','lf-note'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('lf-rest').value = 90;
  renderLibSheet();
}

function deleteLibEntry(gi, ei) {
  showModal('Remove exercise?', `Remove "${library[gi].exercises[ei].name}" from the library?`, () => {
    library[gi].exercises.splice(ei, 1);
    if (library[gi].exercises.length === 0) library.splice(gi, 1);
    saveLibrary(); closeModal(); renderLibSheet();
  });
}

/* ─── VALIDATION ─── */
function toggleDurationField(prefix, type) {
  const wrap = document.getElementById(prefix + '-duration-wrap');
  if (wrap) wrap.style.display = type === 'custom' ? 'grid' : 'none';
}
function validReps(val) {
  if (!val || val.trim() === '') return true;
  return /^\d+\s*[-–]\s*\d+$/.test(val.trim());
}
document.addEventListener('keydown', e => {
  if (e.target.type === 'number' && ['e','E','+','-'].includes(e.key)) e.preventDefault();
});

/* ─── MUSIC ─── */
const audio = document.getElementById('audio-player');
let muted = true;
audio.src = 'mozart-on-meth.mp3';
audio.volume = 0.5;
function toggleMute() {
  if (muted) { audio.play().catch(()=>{}); muted = false; document.getElementById('mute-btn').textContent = '❚❚'; }
  else { audio.pause(); muted = true; document.getElementById('mute-btn').textContent = '▶'; }
}
function toggleTrackMenu() {
  const m = document.getElementById('track-menu');
  m.classList.toggle('show');
}
function selectTrack(el) {
  const wasPlaying = !muted;
  audio.src = el.dataset.src; audio.load();
  document.getElementById('track-name').textContent = el.dataset.name;
  document.getElementById('track-menu').classList.remove('show');
  if (wasPlaying) audio.play().catch(()=>{});
}
document.addEventListener('click', e => {
  if (!e.target.closest('#track-btn') && !e.target.closest('#track-menu')) {
    document.getElementById('track-menu').classList.remove('show');
  }
});

/* ─── CLOCK ─── */
function switchClockTab(sub, el) {
  document.querySelectorAll('#tab-clock .clock-subtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('clock-timer').style.display = sub === 'timer' ? '' : 'none';
  document.getElementById('clock-stopwatch').style.display = sub === 'stopwatch' ? '' : 'none';
}

function buildDrum(id) {
  const drum = document.getElementById(id);
  if (!drum || drum.querySelector('.drum-inner')) return;
  const max = parseInt(drum.dataset.max);
  const inner = document.createElement('div');
  inner.className = 'drum-inner';
  for (let i = 0; i <= max; i++) {
    const item = document.createElement('div');
    item.className = 'drum-item' + (i === 0 ? ' drum-selected' : '');
    item.textContent = String(i).padStart(2, '0');
    inner.appendChild(item);
  }
  const ft = document.createElement('div'); ft.className = 'drum-fade-top';
  const fb = document.createElement('div'); fb.className = 'drum-fade-bot';
  drum.appendChild(inner); drum.appendChild(ft); drum.appendChild(fb);
  setDrumValue(drum, 0);
  initDrumInteraction(drum);
}
function setDrumValue(drum, val) {
  const max = parseInt(drum.dataset.max);
  val = Math.max(0, Math.min(max, val));
  drum.dataset.val = val;
  const inner = drum.querySelector('.drum-inner');
  inner.style.transform = `translateY(${50 - val * 50}px)`;
  drum.querySelectorAll('.drum-item').forEach((el, i) => el.classList.toggle('drum-selected', i === val));
  updateClockCountdown();
}
function initDrumInteraction(drum) {
  let startY = 0, startVal = 0, dragging = false;
  function onStart(y) { startY = y; startVal = parseInt(drum.dataset.val); dragging = true; }
  function onMove(y) { if (!dragging) return; const delta = Math.round((startY - y) / 50); setDrumValue(drum, startVal + delta); }
  function onEnd() { dragging = false; }
  drum.addEventListener('touchstart', e => { e.preventDefault(); onStart(e.touches[0].clientY); }, { passive: false });
  drum.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0].clientY); }, { passive: false });
  drum.addEventListener('touchend', onEnd);
  drum.addEventListener('mousedown', e => { onStart(e.clientY); });
  document.addEventListener('mousemove', e => { if (dragging) onMove(e.clientY); });
  document.addEventListener('mouseup', onEnd);
  drum.addEventListener('wheel', e => { e.preventDefault(); const delta = e.deltaY > 0 ? 1 : -1; setDrumValue(drum, parseInt(drum.dataset.val) + delta); }, { passive: false });
}
function updateClockCountdown() {
  const h = parseInt(document.getElementById('drum-h')?.dataset.val || 0);
  const m = parseInt(document.getElementById('drum-m')?.dataset.val || 0);
  const s = parseInt(document.getElementById('drum-s')?.dataset.val || 0);
  const el = document.getElementById('clock-countdown');
  if (el && !ctRunning) el.textContent = formatClockTime(h * 3600 + m * 60 + s);
}
function formatClockTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

let ctInterval = null, ctRemaining = 0, ctRunning = false;
function clockTimerToggle() {
  if (!ctRunning) {
    const h = parseInt(document.getElementById('drum-h').dataset.val);
    const m = parseInt(document.getElementById('drum-m').dataset.val);
    const s = parseInt(document.getElementById('drum-s').dataset.val);
    if (!ctRemaining) ctRemaining = h * 3600 + m * 60 + s;
    if (!ctRemaining) return;
    ctRunning = true;
    document.getElementById('ct-start').textContent = 'Pause';
    document.getElementById('ct-start').classList.add('running');
    document.getElementById('clock-drums').style.display = 'none';
    document.getElementById('clock-countdown').style.display = '';
    document.getElementById('clock-countdown').textContent = formatClockTime(ctRemaining);
    ctInterval = setInterval(() => {
      ctRemaining--;
      document.getElementById('clock-countdown').textContent = formatClockTime(ctRemaining);
      if (ctRemaining <= 0) {
        clearInterval(ctInterval); ctRunning = false; ctRemaining = 0;
        document.getElementById('ct-start').textContent = 'Start';
        document.getElementById('ct-start').classList.remove('running');
        document.getElementById('clock-drums').style.display = 'grid';
        document.getElementById('clock-countdown').style.display = 'none';
        updateClockCountdown();
      }
    }, 1000);
  } else {
    clearInterval(ctInterval); ctRunning = false;
    document.getElementById('ct-start').textContent = 'Resume';
    document.getElementById('ct-start').classList.remove('running');
  }
}
function clockTimerReset() {
  clearInterval(ctInterval); ctRunning = false; ctRemaining = 0;
  document.getElementById('ct-start').textContent = 'Start';
  document.getElementById('ct-start').classList.remove('running');
  document.getElementById('clock-drums').style.display = 'grid';
  document.getElementById('clock-countdown').style.display = 'none';
  setDrumValue(document.getElementById('drum-h'), 0);
  setDrumValue(document.getElementById('drum-m'), 0);
  setDrumValue(document.getElementById('drum-s'), 0);
  updateClockCountdown();
}
window._clockBuilt = false;
function ensureClockBuilt() { if (!window._clockBuilt) { buildDrum('drum-h'); buildDrum('drum-m'); buildDrum('drum-s'); window._clockBuilt = true; } }

/* ── Stopwatch ── */
let swRunning = false, swStart = 0, swElapsed = 0, swInterval = null, swLaps = [], swLastLap = 0;
function swToggle() {
  if (!swRunning) {
    swStart = Date.now() - swElapsed;
    swRunning = true;
    document.getElementById('sw-start-btn').textContent = 'Stop';
    document.getElementById('sw-start-btn').classList.add('running');
    document.getElementById('sw-lap-btn').disabled = false;
    document.getElementById('sw-lap-btn').style.display = '';
    document.getElementById('sw-reset-btn').style.display = 'none';
    swInterval = setInterval(swTick, 10);
  } else {
    clearInterval(swInterval); swRunning = false;
    document.getElementById('sw-start-btn').textContent = 'Start';
    document.getElementById('sw-start-btn').classList.remove('running');
    document.getElementById('sw-lap-btn').disabled = true;
    document.getElementById('sw-lap-btn').style.display = 'none';
    document.getElementById('sw-reset-btn').style.display = '';
  }
}
function swTick() {
  swElapsed = Date.now() - swStart;
  const total = Math.floor(swElapsed / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  document.getElementById('sw-display').textContent = (h ? h + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  const csEl = document.querySelector('.sw-display .cs'); if (csEl) csEl.textContent = '.' + String(cs).padStart(2,'0');
}
function formatSw(ms) {
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  return (h ? h + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
}
function swLap() {
  if (!swRunning) return;
  const split = swElapsed - swLastLap;
  swLastLap = swElapsed;
  swLaps.unshift({ n: swLaps.length + 1, total: swElapsed, split });
  document.getElementById('sw-laps').innerHTML = swLaps.map(l =>
    `<div class="sw-lap-row"><span class="sw-lap-num">Lap ${l.n}</span><span class="sw-lap-split">${formatSw(l.split)}</span><span class="sw-lap-time">${formatSw(l.total)}</span></div>`
  ).join('');
}
function swReset() {
  clearInterval(swInterval);
  swRunning = false; swStart = 0; swElapsed = 0; swLaps = []; swLastLap = 0;
  document.getElementById('sw-display').textContent = '00:00';
  const csEl = document.querySelector('.sw-display .cs'); if (csEl) csEl.textContent = '.00';
  document.getElementById('sw-laps').innerHTML = '';
  document.getElementById('sw-start-btn').textContent = 'Start';
  document.getElementById('sw-start-btn').classList.remove('running');
  document.getElementById('sw-lap-btn').disabled = true;
  document.getElementById('sw-lap-btn').style.display = 'none';
  document.getElementById('sw-reset-btn').style.display = 'none';
}

/* ─── GREETING ─── */
const GREET_MESSAGES = [
  { msg: "You've been putting in the work. Today's no different.", reminder: "Remember to stay hydrated!" },
  { msg: "Another day, another chance to get better. Let's do it.", reminder: "Don't forget to warm up properly!" },
  { msg: "You've been doing great. Keep that momentum going today.", reminder: "Make sure you've eaten something before you start!" },
  { msg: "Take it one set at a time and enjoy it. You've got this.", reminder: "Don't rush your rest!" },
  { msg: "Today's a great day to feel strong. Go enjoy it.", reminder: "Focus on your form today!" },
  { msg: "Just remember why you started. Now let's go get it.", reminder: "Get a good stretch in after!" },
  { msg: "Believe in the process. Today's session is adding up to something.", reminder: "Log everything — progress matters!" },
  { msg: "Give it everything you've got today — you'll be glad you did.", reminder: "Drink some water before you start!" },
  { msg: "Have a great one today. You've earned it.", reminder: "Make sure you get enough sleep tonight to recover!" },
  { msg: "You're doing something most people won't. Remember that.", reminder: "Take a few deep breaths before you start — it helps!" },
];
function getGreetMessage() {
  let order = [];
  try { order = JSON.parse(localStorage.getItem(KEYS.greetOrder) || '[]'); } catch {}
  if (!order.length) {
    order = [...Array(GREET_MESSAGES.length).keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  const idx = order.shift();
  localStorage.setItem(KEYS.greetOrder, JSON.stringify(order));
  return GREET_MESSAGES[idx];
}
function maybeShowGreeting() {
  if (!localStorage.getItem(KEYS.welcomed)) return;
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(KEYS.greetDate) === today) return;
  localStorage.setItem(KEYS.greetDate, today);
  const name = localStorage.getItem(KEYS.name) || '';
  const day = DAY_NAMES[new Date().getDay()];
  const dayFull = FULL_DAYS[day];
  const sched = schedule[day];
  const { msg, reminder } = getGreetMessage();
  document.getElementById('greeting-day').textContent = name ? `Happy ${dayFull}, ${name}!` : `Happy ${dayFull}!`;
  if (sched.restDay) {
    document.getElementById('greeting-workout').textContent = '';
    document.getElementById('greeting-msg').textContent = "What are you doing here? You should be resting! 😁";
    document.getElementById('greeting-reminder').textContent = '';
  } else {
    const suffix = sched.label.includes('—') ? sched.label.replace(/^.+?—\s*/, '').trim() : '';
    if (suffix) document.getElementById('greeting-workout').textContent = `Today's workout is ${suffix}`;
    else if (sched.exercises.length === 0) document.getElementById('greeting-workout').textContent = "Looks like you don't have anything planned yet for today!";
    else document.getElementById('greeting-workout').textContent = '';
    document.getElementById('greeting-msg').textContent = msg;
    document.getElementById('greeting-reminder').textContent = reminder;
  }
  document.getElementById('greeting-wrap').classList.add('show');
}
function dismissGreeting() { document.getElementById('greeting-wrap').classList.remove('show'); }

/* ─── UPDATE BANNER ─── */
let _updateAvailable = false;
function applyUpdate() { document.getElementById('update-banner').classList.remove('show'); _updateAvailable = false; window.location.reload(true); }
function checkForUpdate() {
  try {
    if (_updateAvailable) return;
    fetch('./app.js?v=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text())
      .then(js => {
        const match = js.match(/APP_VERSION\s*=\s*'(v\d+)'/);
        if (match && match[1] !== APP_VERSION) {
          _updateAvailable = true;
          const banner = document.getElementById('update-banner');
          if (banner) banner.classList.add('show');
        }
      }).catch(() => {});
  } catch (e) { /* never let update-checking break the app */ }
}
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
