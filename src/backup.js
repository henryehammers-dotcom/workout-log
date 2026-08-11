/* ════════════════════════════════════════════
   Tally Up — Share, Export, Backup / Restore
   ════════════════════════════════════════════ */
import { KEYS, DAY_NAMES, FULL_DAYS, schedule, setSchedule, currentUnits,
         getHistory, DEFAULT_LIBRARY_V2, APP_VERSION, escHtml } from './state.js';
import { showModal, closeModal } from './modal.js';

export const APP_URL = 'https://henryehammers-dotcom.github.io/workout-log/';

/* ─── SHARE ─── */
export function shareApp() {
  if (navigator.share) {
    navigator.share({ title: 'Tally Up', text: 'Check out Tally Up — a workout tracker', url: APP_URL })
      .catch(err => { if (err.name !== 'AbortError') copyAppLink(); });
    return;
  }
  copyAppLink();
}
export function copyAppLink() {
  const btn = document.querySelector('[onclick="shareApp()"] .data-card-title');
  const flash = (text, color) => { if (btn) { const orig = btn.textContent; btn.textContent = text; btn.style.color = color; setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(APP_URL).then(() => flash('✓ Link copied!', 'var(--green)')).catch(() => promptFallback());
  } else {
    promptFallback();
  }
  function promptFallback() {
    window.prompt('Copy this link:', APP_URL);
  }
}

/* ─── EXPORT FOR AI ─── */
export function exportForAI() {
  const name = localStorage.getItem(KEYS.name) || 'User';
  const hist = getHistory();
  const lines = [`${name}'s workout data\n`, '=== WEEKLY SCHEDULE ==='];
  DAY_NAMES.forEach(d => {
    const day = schedule[d];
    if (day.restDay) { lines.push(`${FULL_DAYS[d]}: Rest day`); return; }
    const exList = day.exercises.map(e => {
      const parts = [e.name];
      if (e.sets) parts.push(`${e.sets} sets`);
      if (e.duration) parts.push(e.duration);
      if (e.reps) parts.push(`${e.reps} reps`);
      if (e.rest) parts.push(`${e.rest} rest`);
      if (e.note) parts.push(`[${e.note}]`);
      return parts.join(', ');
    });
    lines.push(`${FULL_DAYS[d]}: ${exList.length ? exList.join(' | ') : 'No exercises'}`);
  });
  lines.push('\n=== WORKOUT HISTORY ===');
  const dates = Object.keys(hist).sort();
  if (!dates.length) { lines.push('No history recorded yet.'); }
  else {
    dates.forEach(date => {
      lines.push(`\n${date}`);
      hist[date].forEach(entry => {
        const sets = entry.sets.map((s, i) => `Set ${i+1}: ${s.reps} reps @ ${s.weight} ${currentUnits}`).join(', ');
        lines.push(`  ${entry.name}: ${sets}`);
      });
    });
  }
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = document.querySelector('[onclick="exportForAI()"] .data-card-title');
    if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; btn.style.color = 'var(--green)'; setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000); }
  }).catch(() => alert('Copy failed — try again.'));
}

/* ─── SAVE FILE ─── */
export function saveFile() {
  const backup = {
    tallyup_backup: true,
    version: APP_VERSION || 'unknown',
    savedAt: new Date().toISOString(),
    data: {
      history:  localStorage.getItem(KEYS.history)  || '{}',
      schedule: localStorage.getItem(KEYS.schedule) || '',
      libraryV2: localStorage.getItem(KEYS.libraryV2) || '',
      blurbsV2:  localStorage.getItem(KEYS.blurbsV2)  || '',
      name:     localStorage.getItem(KEYS.name)     || '',
      bw:       localStorage.getItem(KEYS.bw)       || '',
      units:    localStorage.getItem(KEYS.units)    || 'lbs',
      theme:    localStorage.getItem(KEYS.theme)    || 'light',
      base:     localStorage.getItem(KEYS.base)     || 'beige',
      accent:   localStorage.getItem(KEYS.accent)   || 'teal',
      welcomed: localStorage.getItem(KEYS.welcomed) || '',
      music:    localStorage.getItem(KEYS.music)    || '',
      greetOrder: localStorage.getItem(KEYS.greetOrder) || '',
    },
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  a.download = 'tallyup-backup-' + stamp + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  try { localStorage.setItem(KEYS.lastBackupAt, new Date().toISOString()); } catch {}
  renderLastBackupLine();
}

// Renders the "last backed up" line in Settings, if that element is present
// (it only exists while the settings sheet's markup is in the DOM — this is
// a no-op harmlessly whenever it's not, e.g. before first paint).
export function renderLastBackupLine() {
  const el = document.getElementById('settings-last-backup');
  if (!el) return;
  const raw = localStorage.getItem(KEYS.lastBackupAt);
  if (!raw) { el.textContent = 'No backup yet'; return; }
  const d = new Date(raw);
  if (isNaN(d)) { el.textContent = 'No backup yet'; return; }
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const label = sameDay
    ? 'today at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  el.textContent = 'Last backed up ' + label;
}

export function openRestoreSheet() {
  document.getElementById('restore-textarea').value = '';
  document.getElementById('restore-wrap').classList.add('show');
  setTimeout(function(){ document.getElementById('restore-textarea').focus(); }, 100);
}
export function closeRestoreSheet() {
  document.getElementById('restore-wrap').classList.remove('show');
}
// Wired to the file input's onchange: reads the picked .json file and drops
// its text into the same textarea applyRestore() already reads from, so the
// rest of the restore flow (validation, orphan handling, etc.) is untouched.
export function handleRestoreFileSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('restore-textarea').value = reader.result;
  };
  reader.onerror = () => {
    alert('Could not read that file — try again or paste its contents manually.');
  };
  reader.readAsText(file);
  input.value = ''; // reset so picking the same file again still fires onchange
}
let _restorePendingParsed = null; // holds the parsed backup between the confirm modal and the orphan-choice step

export function applyRestore() {
  const txt = document.getElementById('restore-textarea').value.trim();
  if (!txt) { alert('Paste your backup file contents first.'); return; }
  let parsed;
  try { parsed = JSON.parse(txt); }
  catch (e) { alert('That doesn\u2019t look like a valid backup file (couldn\u2019t parse JSON).'); return; }
  if (!parsed || !(parsed.tallyup_backup || parsed.tallymark_backup) || !parsed.data) {
    alert('That doesn\u2019t look like a Tally Up backup file.'); return;
  }
  showModal('Replace all data?', 'This will overwrite your current routine, history, and settings with the backup. This cannot be undone.', function() {
    closeModal();
    _restorePendingParsed = parsed;
    const orphans = findRestoreOrphans(parsed.data);
    if (orphans.length) {
      showRestoreOrphanWarning(orphans);
    } else {
      finishRestore(parsed.data, 'add'); // nothing orphaned — "add" vs "ignore" makes no difference here
    }
  });
}

// Scans a backup's schedule + history for exId references that don't match
// anything in the CURRENT library, and returns the distinct set of them with
// their original name and a rough count of how many places they appear.
function findRestoreOrphans(d) {
  const seen = {}; // exId -> { name, count }
  function scan(list) {
    list.forEach(entry => {
      if (entry.exId && !DEFAULT_LIBRARY_V2.some(e => e.id === entry.exId)) {
        if (!seen[entry.exId]) seen[entry.exId] = { name: entry.name || '(unnamed)', count: 0 };
        seen[entry.exId].count++;
      }
    });
  }
  try {
    const sched = d.schedule ? JSON.parse(d.schedule) : null;
    if (sched) DAY_NAMES.forEach(dn => scan(sched[dn]?.exercises || []));
  } catch (e) {}
  try {
    const hist = d.history ? JSON.parse(d.history) : null;
    if (hist) Object.values(hist).forEach(entries => scan(entries));
  } catch (e) {}
  return Object.entries(seen).map(([exId, info]) => ({ exId, ...info }));
}

function showRestoreOrphanWarning(orphans) {
  document.getElementById('restore-orphan-count').textContent =
    orphans.length + ' exercise' + (orphans.length === 1 ? '' : 's') + ' not in the library';
  document.getElementById('restore-orphan-list').innerHTML = orphans.map(o =>
    `<div class="restore-orphan-item">${escHtml(o.name)} <span class="restore-orphan-item-count">— ${o.count} entr${o.count === 1 ? 'y' : 'ies'}</span></div>`
  ).join('');
  closeRestoreSheet();
  document.getElementById('restore-orphan-wrap').classList.add('show');
}
export function restoreOrphanChoice(choice) {
  document.getElementById('restore-orphan-wrap').classList.remove('show');
  if (!_restorePendingParsed) return;
  finishRestore(_restorePendingParsed.data, choice);
  _restorePendingParsed = null;
}

// choice: 'add' keeps orphaned entries in history/schedule with their original
// name but no library link. 'ignore' drops those entries entirely.
function finishRestore(d, choice) {
  function set(key, val) {
    if (val === undefined || val === null || val === '') {
      try { localStorage.removeItem(key); } catch (e) {}
    } else {
      try { localStorage.setItem(key, val); } catch (e) {}
    }
  }
  // The exercise library (KEYS.libraryV2) is intentionally NOT restored from
  // backups. It's app-shipped reference data (242 structured exercises) that
  // gets updated independently of the user's personal data — restoring an
  // old backup's library here would silently roll back the exercise catalog
  // to whatever existed when that backup was made, including for everyone
  // else's devices restoring the same file.
  //
  // Every restored entry's stored `name` is re-synced to whatever the CURRENT
  // library calls that same exId, since names can drift over time. Entries
  // whose exId has no match in the current library are either dropped
  // ('ignore') or kept as-is with their original name ('add') per the user's
  // choice from the orphan warning.
  try {
    const restoredSchedule = d.schedule ? JSON.parse(d.schedule) : null;
    if (restoredSchedule) {
      DAY_NAMES.forEach(dn => {
        if (!restoredSchedule[dn]) return;
        let exercises = restoredSchedule[dn].exercises || [];
        exercises.forEach(se => {
          if (se.exId) {
            const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === se.exId);
            if (libEx) se.name = libEx.name;
          }
        });
        if (choice === 'ignore') {
          exercises = exercises.filter(se => !se.exId || DEFAULT_LIBRARY_V2.some(e => e.id === se.exId));
        }
        restoredSchedule[dn].exercises = exercises;
      });
      set(KEYS.schedule, JSON.stringify(restoredSchedule));
    }
    const restoredHistory = d.history ? JSON.parse(d.history) : null;
    if (restoredHistory) {
      Object.keys(restoredHistory).forEach(dateKey => {
        let entries = restoredHistory[dateKey];
        entries.forEach(he => {
          if (he.exId) {
            const libEx = DEFAULT_LIBRARY_V2.find(e => e.id === he.exId);
            if (libEx) he.name = libEx.name;
          }
        });
        if (choice === 'ignore') {
          entries = entries.filter(he => !he.exId || DEFAULT_LIBRARY_V2.some(e => e.id === he.exId));
        }
        if (entries.length) restoredHistory[dateKey] = entries;
        else delete restoredHistory[dateKey];
      });
      set(KEYS.history, JSON.stringify(restoredHistory));
    }
  } catch (e) {
    console.error('Restore name re-sync failed, restored data kept with original names:', e);
  }
  set(KEYS.name,     d.name);
  set(KEYS.bw,       d.bw);
  set(KEYS.units,    d.units);
  set(KEYS.theme,    d.theme);
  set(KEYS.base,     d.base);
  set(KEYS.accent,   d.accent);
  set(KEYS.welcomed, d.welcomed);
  set(KEYS.music,    d.music);
  set(KEYS.greetOrder, d.greetOrder);
  closeRestoreSheet();
  location.reload();
}
