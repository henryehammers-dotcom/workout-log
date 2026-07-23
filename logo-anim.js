/* ════════════════════════════════════════════
   Tallymark logo — barbell drop/tip animation
   ════════════════════════════════════════════ */

// Full markup with animation classes — used whenever the drop/tip sequence should play.
const LOGO_SVG_ANIMATED = `
<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block">
  <rect x="27.09" y="14.29" width="7.12" height="71.43" fill="#fff" class="tm-bar" style="animation-delay:0s;transform-origin:30.65px 85.72px"/>
  <rect x="38.34" y="14.29" width="7.12" height="71.43" fill="#fff" class="tm-bar" style="animation-delay:0.25s;transform-origin:41.9px 85.72px"/>
  <rect x="64.62" y="14.29" width="7.12" height="71.43" fill="#fff" class="tm-bar" style="animation-delay:0.75s;transform-origin:68.18px 85.72px"/>
  <g class="tm-barbell-drop">
    <g class="tm-barbell-tip">
      <polygon points="19.02,86.77 76.44,10.00 78.44,11.50 21.02,88.27 19.02,86.77" fill="#00bf63"/>
      <polygon points="55.43,13.86 57.49,11.23 81.12,29.70 79.06,32.34 55.43,13.86" fill="#00bf63"/>
      <polygon points="81.27,22.99 79.37,25.50 62.21,12.51 64.11,10.00 81.27,22.99" fill="#00bf63"/>
      <polygon points="68.28,11.11 70.26,8.42 81.23,16.52 79.24,19.21 68.28,11.11" fill="#00bf63"/>
      <polygon points="15.73,68.61 17.77,65.97 41.51,84.31 39.47,86.95 15.73,68.61" fill="#00bf63"/>
      <polygon points="34.62,85.80 32.66,88.27 15.82,74.87 17.78,72.40 34.62,85.80" fill="#00bf63"/>
      <polygon points="15.82,81.50 17.88,78.87 28.63,87.26 26.57,89.90 15.82,81.50" fill="#00bf63"/>
    </g>
  </g>
  <rect x="53.75" y="14.29" width="7.12" height="71.43" fill="#fff" class="tm-bar" style="animation-delay:0.5s;transform-origin:57.31px 85.72px"/>
</svg>`;

// Static markup showing the animation's END STATE (no animation classes) — used for the
// in-app logo's initial paint so it isn't blank before the first tap.
const LOGO_SVG_STATIC = `
<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block">
  <rect x="27.09" y="14.29" width="7.12" height="71.43" fill="#fff"/>
  <rect x="38.34" y="14.29" width="7.12" height="71.43" fill="#fff"/>
  <rect x="64.62" y="14.29" width="7.12" height="71.43" fill="#fff"/>
  <polygon points="19.02,86.77 76.44,10.00 78.44,11.50 21.02,88.27 19.02,86.77" fill="#00bf63"/>
  <polygon points="55.43,13.86 57.49,11.23 81.12,29.70 79.06,32.34 55.43,13.86" fill="#00bf63"/>
  <polygon points="81.27,22.99 79.37,25.50 62.21,12.51 64.11,10.00 81.27,22.99" fill="#00bf63"/>
  <polygon points="68.28,11.11 70.26,8.42 81.23,16.52 79.24,19.21 68.28,11.11" fill="#00bf63"/>
  <polygon points="15.73,68.61 17.77,65.97 41.51,84.31 39.47,86.95 15.73,68.61" fill="#00bf63"/>
  <polygon points="34.62,85.80 32.66,88.27 15.82,74.87 17.78,72.40 34.62,85.80" fill="#00bf63"/>
  <polygon points="15.82,81.50 17.88,78.87 28.63,87.26 26.57,89.90 15.82,81.50" fill="#00bf63"/>
  <rect x="53.75" y="14.29" width="7.12" height="71.43" fill="#fff"/>
</svg>`;

const LOGO_STYLE_ID = 'tm-logo-anim-style';
const LOGO_STYLE_CSS = `
@keyframes tmDropBarHeavy {
  0%   { transform: translateY(-140px); }
  68%  { transform: translateY(-140px); }
  90%  { transform: translateY(0) scaleY(1); }
  94%  { transform: translateY(0) scaleY(0.85); }
  100% { transform: translateY(0) scaleY(1); }
}
.tm-bar { animation: tmDropBarHeavy 1.35s cubic-bezier(.6,0,.9,.35) both; }

@keyframes tmDropStraight {
  0%   { transform: translateY(-170px); }
  65%  { transform: translateY(-170px); }
  88%  { transform: translateY(0) scaleY(1); }
  93%  { transform: translateY(0) scaleY(0.86); }
  100% { transform: translateY(0) scaleY(1); }
}
.tm-barbell-drop { animation: tmDropStraight 1.5s cubic-bezier(.6,0,.9,.3) 1.1s both; }

@keyframes tmTipOver {
  0%   { transform: rotate(-36.8deg); }
  100% { transform: rotate(0deg); }
}
.tm-barbell-tip { transform-origin: 20px 87.5px; animation: tmTipOver 1s cubic-bezier(.5,0,.3,1) 2.75s both; }
`;

function ensureLogoStyleInjected() {
  if (document.getElementById(LOGO_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = LOGO_STYLE_ID;
  style.textContent = LOGO_STYLE_CSS;
  document.head.appendChild(style);
}

// Mounts a fresh copy of the animated markup into the given container, restarting it from scratch.
function playLogoAnim(container) {
  if (!container) return;
  ensureLogoStyleInjected();
  container.innerHTML = '';
  // Force a reflow before inserting so the animation reliably restarts on repeat taps.
  void container.offsetWidth;
  container.innerHTML = LOGO_SVG_ANIMATED;
}

function initLogoAnim() {
  const appLogo = document.getElementById('app-logo-stage');
  const welcomeLogo = document.getElementById('welcome-logo-stage');

  // In-app logo: static final frame until tapped, then plays the full drop/tip animation.
  if (appLogo) {
    appLogo.innerHTML = LOGO_SVG_STATIC;
    appLogo.addEventListener('click', () => playLogoAnim(appLogo));
  }

  // Onboarding logo: plays automatically once, and can also be tapped to replay.
  if (welcomeLogo) {
    welcomeLogo.addEventListener('click', () => playLogoAnim(welcomeLogo));
    playLogoAnim(welcomeLogo);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogoAnim);
} else {
  initLogoAnim();
}
