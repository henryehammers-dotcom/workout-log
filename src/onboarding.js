/* ════════════════════════════════════════════
   Tally Up — Onboarding questionnaire
   Six-question goal/profile questionnaire shown once, right after the
   existing name/theme/accent welcome screen and before the app proper.
   Also reused (read-only render logic) by the Settings > Profile edit
   screen — see renderProfileEditForm() in theme.js, which builds its own
   markup but pulls option lists from GOAL_QUESTIONS/buildPriorityMuscleOptions
   here so the two surfaces can't drift apart.
   ════════════════════════════════════════════ */
import { GOAL_QUESTIONS, buildPriorityMuscleOptions, saveProfile, escAttr, escHtml } from './state.js';

let qIndex = 0;
// In-progress answers, only committed to the profile (via saveProfile) once
// the whole flow finishes — so backing out partway through onboarding never
// leaves a half-saved profile behind.
let draft = {};

function questionsWithOptions() {
  // priorityMuscles' options depend on MUSCLE_GROUPS_V2, which can't be
  // baked into the static GOAL_QUESTIONS array without an import cycle risk,
  // so it's resolved here at render time instead.
  return GOAL_QUESTIONS.map(q => q.optionsFromMuscleGroups
    ? Object.assign({}, q, { options: buildPriorityMuscleOptions() })
    : q);
}

export function startOnboardingQuestionnaire() {
  qIndex = 0;
  draft = {};
  // Both steps live inside the same #welcome-wrap overlay (see index.html) —
  // swap which inner section is visible rather than opening a new overlay,
  // so there's no flash of the app underneath between steps.
  const form = document.getElementById('welcome-form');
  if (form) form.style.display = 'none';
  const sub = document.getElementById('welcome-sub');
  if (sub) sub.style.display = 'none';
  const onb = document.getElementById('onboarding-step');
  if (onb) onb.style.display = '';
  renderQuestion();
}

// This app has no icon font loaded — only raw inline SVGs throughout
// index.html — so the ti-* class approach never actually rendered anything.
// Small lookup covering the icon names used by GOAL_QUESTIONS in state.js.
const ONB_ICON_PATHS = {
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  'calendar-check': '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  scale: '<path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
};
function onbIconSvg(name) {
  const path = ONB_ICON_PATHS[name];
  if (!path) return '';
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
function onbCheckSvg() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="onb-opt-check" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
}

function renderQuestion() {
  const questions = questionsWithOptions();
  const q = questions[qIndex];
  const total = questions.length;

  const dots = document.getElementById('onboarding-progress');
  if (dots) {
    dots.innerHTML = questions.map((_, i) =>
      `<div class="onb-progress-seg${i <= qIndex ? ' filled' : ''}"></div>`
    ).join('');
  }
  const counter = document.getElementById('onboarding-counter');
  if (counter) counter.textContent = `Question ${qIndex + 1} of ${total}`;
  const titleEl = document.getElementById('onboarding-question');
  if (titleEl) titleEl.textContent = q.question;

  const selected = draft[q.key];
  const isMulti = !!q.multi;
  const optsHtml = q.options.map(opt => {
    const isSel = isMulti
      ? Array.isArray(selected) && selected.includes(opt.value)
      : selected === opt.value;
    const icon = opt.icon ? onbIconSvg(opt.icon) : '';
    return `<button class="onb-opt${isSel ? ' active' : ''}" data-value="${escAttr(opt.value)}" onclick="onboardingSelectOption('${escAttr(opt.value)}')">
      ${icon}<span>${escHtml(opt.label)}</span>
      ${isSel ? onbCheckSvg() : ''}
    </button>`;
  }).join('');
  const optsEl = document.getElementById('onboarding-options');
  if (optsEl) optsEl.innerHTML = optsHtml;

  const backBtn = document.getElementById('onboarding-back');
  if (backBtn) backBtn.style.visibility = qIndex === 0 ? 'hidden' : 'visible';
  const nextBtn = document.getElementById('onboarding-next');
  if (nextBtn) nextBtn.textContent = qIndex === total - 1 ? 'Finish' : 'Next';
}

export function onboardingSelectOption(value) {
  const questions = questionsWithOptions();
  const q = questions[qIndex];
  if (q.multi) {
    const cur = Array.isArray(draft[q.key]) ? draft[q.key].slice() : [];
    const at = cur.indexOf(value);
    if (at === -1) cur.push(value); else cur.splice(at, 1);
    draft[q.key] = cur;
  } else {
    draft[q.key] = value;
  }
  renderQuestion();
}

export function onboardingBack() {
  if (qIndex === 0) return;
  qIndex--;
  renderQuestion();
}

export function onboardingNext() {
  const questions = questionsWithOptions();
  const q = questions[qIndex];
  const answered = q.multi ? Array.isArray(draft[q.key]) && draft[q.key].length > 0 : !!draft[q.key];
  // Priority-muscle question is the only multi-select and is allowed to be
  // skipped (someone with "no particular focus" shouldn't be blocked from
  // continuing) — every other question requires a selection to advance.
  if (!answered && !q.multi) return;

  if (qIndex === questions.length - 1) {
    finishOnboarding();
    return;
  }
  qIndex++;
  renderQuestion();
}

function finishOnboarding() {
  saveProfile({
    goal: draft.goal || '',
    targetFrequency: draft.targetFrequency || '',
    priorityMuscles: draft.priorityMuscles || [],
    experience: draft.experience || '',
    blocker: draft.blocker || '',
    usefulFor: draft.usefulFor || '',
  });
  const onb = document.getElementById('onboarding-step');
  if (onb) onb.style.display = 'none';
  const form = document.getElementById('welcome-form');
  if (form) form.style.display = '';
  const sub = document.getElementById('welcome-sub');
  if (sub) sub.style.display = '';
  document.getElementById('welcome-wrap')?.classList.remove('show');
  // Onboarding is done — open the Tally sheet, which is what should show
  // on a fresh app open from here on.
  const openTally = window.openTallySheet;
  if (typeof openTally === 'function') setTimeout(openTally, 200);
}
