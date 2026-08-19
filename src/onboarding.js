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
  const onb = document.getElementById('onboarding-step');
  if (onb) onb.style.display = '';
  renderQuestion();
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
    const icon = opt.icon ? `<i class="ti ti-${escAttr(opt.icon)}" aria-hidden="true"></i>` : '';
    return `<button class="onb-opt${isSel ? ' active' : ''}" data-value="${escAttr(opt.value)}" onclick="onboardingSelectOption('${escAttr(opt.value)}')">
      ${icon}<span>${escHtml(opt.label)}</span>
      ${isSel ? '<i class="ti ti-check onb-opt-check" aria-hidden="true"></i>' : ''}
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
  document.getElementById('welcome-wrap')?.classList.remove('show');
  // TODO: once the Tally page ships, replace this with opening it directly
  // (it will fully replace greeting.js). For now, fall back to the existing
  // daily greeting so onboarding completion doesn't dead-end.
  const showGreeting = window.maybeShowGreeting;
  if (typeof showGreeting === 'function') setTimeout(showGreeting, 200);
}
