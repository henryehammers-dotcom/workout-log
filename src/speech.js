/* ════════════════════════════════════════════
   Tally Up — Exercise instructions text-to-speech
   Uses the browser's built-in SpeechSynthesis API (free, offline, no setup).
   Reads only the exercise's instructions text (blurb) aloud when the mic
   icon next to the Compound/Isolation badge is tapped.
   ════════════════════════════════════════════ */
let currentUtterance = null;

export function speakInstructions(text, btn) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech isn\u2019t supported in this browser.');
    return;
  }
  // Tapping the mic again while it's already reading stops playback,
  // rather than queuing/restarting — feels like a toggle, not a re-trigger.
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (btn) btn.classList.remove('speaking');
    return;
  }
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.onstart = () => { if (btn) btn.classList.add('speaking'); };
  utterance.onend = () => { if (btn) btn.classList.remove('speaking'); };
  utterance.onerror = () => { if (btn) btn.classList.remove('speaking'); };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
