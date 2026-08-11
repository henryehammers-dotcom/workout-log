/* ════════════════════════════════════════════
   Tally Up — Daily greeting
   ════════════════════════════════════════════ */
import { KEYS, schedule } from './state.js';
import { DAY_NAMES, FULL_DAYS } from './state.js';

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
export function maybeShowGreeting() {
  if (!localStorage.getItem(KEYS.welcomed)) return;
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(KEYS.greetDate) === today) return;
  localStorage.setItem(KEYS.greetDate, today);
  const name = localStorage.getItem(KEYS.name) || '';
  const day = DAY_NAMES[new Date().getDay()];
  const dayFull = FULL_DAYS[day];
  const sched = schedule[day];
  const { msg } = getGreetMessage();
  document.getElementById('greeting-day').textContent = name ? `Happy ${dayFull}, ${name}!` : `Happy ${dayFull}!`;
  if (sched.restDay) {
    document.getElementById('greeting-workout').textContent = '';
    document.getElementById('greeting-msg').textContent = "What are you doing here? You should be resting! 😁";
  } else {
    const suffix = sched.label.includes('—') ? sched.label.replace(/^.+?—\s*/, '').trim() : '';
    document.getElementById('greeting-workout').textContent = suffix ? `Today is ${suffix}` : "Today's workout";
    document.getElementById('greeting-msg').textContent = msg;
  }
  document.getElementById('greeting-wrap').classList.add('show');
}
export function dismissGreeting() { document.getElementById('greeting-wrap').classList.remove('show'); }
