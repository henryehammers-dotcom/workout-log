/* ─────────────────────────────────────────────────────────
   Tallymark logo animation
   Builds an animated SVG logo inside a host element.
   Two contexts:
     • Welcome screen — plays automatically when the welcome wrap
       becomes visible. Tap to replay.
     • Header — static (final pose) by default. Plays only on tap.
   ───────────────────────────────────────────────────────── */
(function(){
'use strict';

/* Timing */
const TALLY_GAP = 160;
const TALLY_FALL_DUR = 280;
const TALLY_BOUNCE1_DUR = 180;
const TALLY_BOUNCE2_DUR = 110;
const TALLY_BOUNCE1_H = 7;
const TALLY_BOUNCE2_H = 2.5;
const TALLY_TOTAL = TALLY_FALL_DUR + TALLY_BOUNCE1_DUR + TALLY_BOUNCE2_DUR;
const TALLY_STARTS = [0, TALLY_GAP, TALLY_GAP*2, TALLY_GAP*3];

const BAR_DROP_START = TALLY_STARTS[3] + TALLY_TOTAL + 220;
const BAR_DROP_DUR = 380;
const BAR_PAUSE = 130;
const BAR_TIP_START = BAR_DROP_START + BAR_DROP_DUR + BAR_PAUSE;
const BAR_TIP_DUR = 440;

const TOTAL_DUR = BAR_TIP_START + BAR_TIP_DUR + 200;

/* Geometry */
const GROUND = 80;
const TALLY_TOP_REST = 20;
const TALLY_H = 60;
const FALL_FROM = -25;

const PIVOT_X = 9;
const PIVOT_Y_LOCAL = 50;
const FINAL_CX = 50, FINAL_CY = 50, FINAL_ROT = -32;
const STAND = (() => {
  const r = FINAL_ROT * Math.PI / 180;
  const dist = 50 - PIVOT_X;
  return { x: FINAL_CX - dist*Math.cos(r), y: FINAL_CY - dist*Math.sin(r) };
})();

/* Easing */
const easeInQuad  = t => t*t;
const easeOutQuad = t => 1 - (1-t)*(1-t);

function tallyDy(localT) {
  if (localT <= 0) return -(TALLY_TOP_REST - FALL_FROM) - TALLY_H;
  if (localT < TALLY_FALL_DUR) {
    const e = easeInQuad(localT / TALLY_FALL_DUR);
    const startTop = FALL_FROM - TALLY_H;
    const top = startTop + (TALLY_TOP_REST - startTop) * e;
    return top - TALLY_TOP_REST;
  }
  let t2 = localT - TALLY_FALL_DUR;
  if (t2 < TALLY_BOUNCE1_DUR) return -TALLY_BOUNCE1_H * Math.sin((t2/TALLY_BOUNCE1_DUR) * Math.PI);
  t2 -= TALLY_BOUNCE1_DUR;
  if (t2 < TALLY_BOUNCE2_DUR) return -TALLY_BOUNCE2_H * Math.sin((t2/TALLY_BOUNCE2_DUR) * Math.PI);
  return 0;
}
function tallySquashY(localT) {
  const w = 90;
  if (localT < TALLY_FALL_DUR || localT > TALLY_FALL_DUR + w) return 1;
  const p = (localT - TALLY_FALL_DUR) / w;
  return 1 - 0.12 * Math.sin(p * Math.PI);
}
function barTransform(px, py, rot) {
  const tx = px - PIVOT_X, ty = py - PIVOT_Y_LOCAL;
  return `translate(${tx},${ty}) rotate(${rot} ${PIVOT_X} ${PIVOT_Y_LOCAL})`;
}

/* SVG markup with per-instance ids */
const TALLY_FILL  = '#f4ece0';
const BAR_FILL    = '#e98a7a';
function logoSVG(prefix) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <g id="${prefix}-tally-1-wrap"><rect id="${prefix}-tally-1" x="26" y="20" width="6" height="60" rx="0.5" fill="${TALLY_FILL}"/></g>
    <g id="${prefix}-tally-4-wrap"><rect id="${prefix}-tally-4" x="68" y="20" width="6" height="60" rx="0.5" fill="${TALLY_FILL}"/></g>
    <g id="${prefix}-barbell">
      <rect x="4" y="48.5" width="92" height="3" rx="0.8" fill="${BAR_FILL}"/>
      <rect x="77" y="38" width="3.5" height="24" rx="0.6" fill="${BAR_FILL}"/>
      <rect x="83" y="40" width="3.5" height="20" rx="0.6" fill="${BAR_FILL}"/>
      <rect x="89" y="43" width="3.5" height="14" rx="0.6" fill="${BAR_FILL}"/>
      <rect x="19.5" y="38" width="3.5" height="24" rx="0.6" fill="${BAR_FILL}"/>
      <rect x="13.5" y="40" width="3.5" height="20" rx="0.6" fill="${BAR_FILL}"/>
      <rect x="7.5" y="43" width="3.5" height="14" rx="0.6" fill="${BAR_FILL}"/>
    </g>
    <g id="${prefix}-tally-2-wrap"><rect id="${prefix}-tally-2" x="40" y="20" width="6" height="60" rx="0.5" fill="${TALLY_FILL}"/></g>
    <g id="${prefix}-tally-3-wrap"><rect id="${prefix}-tally-3" x="54" y="20" width="6" height="60" rx="0.5" fill="${TALLY_FILL}"/></g>
  </svg>`;
}

class Logo {
  constructor(rootEl, prefix, opts) {
    opts = opts || {};
    rootEl.innerHTML = logoSVG(prefix);
    this.prefix = prefix;
    this.rootEl = rootEl;
    this.curT = opts.startAtEnd ? TOTAL_DUR : -1;
    this.raf = 0;
    this.startT = 0;
    this.playing = false;
    this.tick();
    rootEl.addEventListener('click', () => {
      if (!this.playing) this.play();
    });
  }

  applyTally(idx) {
    const wrap = document.getElementById(`${this.prefix}-tally-${idx+1}-wrap`);
    const rect = document.getElementById(`${this.prefix}-tally-${idx+1}`);
    if (!wrap || !rect) return;
    const localT = this.curT - TALLY_STARTS[idx];
    if (localT <= 0) {
      wrap.setAttribute('transform', `translate(0,${-200})`);
      rect.setAttribute('y', TALLY_TOP_REST);
      rect.setAttribute('height', TALLY_H);
      return;
    }
    const dy = tallyDy(localT);
    const sy = tallySquashY(localT);
    if (sy < 1) {
      const newH = TALLY_H * sy;
      rect.setAttribute('y', GROUND - newH);
      rect.setAttribute('height', newH);
    } else {
      rect.setAttribute('y', TALLY_TOP_REST);
      rect.setAttribute('height', TALLY_H);
    }
    wrap.setAttribute('transform', `translate(0,${dy})`);
  }

  applyBarbell() {
    const bar = document.getElementById(`${this.prefix}-barbell`);
    if (!bar) return;
    const t = this.curT;
    if (t < BAR_DROP_START) {
      bar.setAttribute('transform', barTransform(STAND.x, -200, 90));
      return;
    }
    if (t < BAR_DROP_START + BAR_DROP_DUR) {
      const e = easeInQuad((t - BAR_DROP_START) / BAR_DROP_DUR);
      const startY = -120;
      const y = startY + (STAND.y - startY) * e;
      bar.setAttribute('transform', barTransform(STAND.x, y, 90));
      return;
    }
    if (t < BAR_TIP_START) {
      bar.setAttribute('transform', barTransform(STAND.x, STAND.y, 90));
      return;
    }
    if (t < BAR_TIP_START + BAR_TIP_DUR) {
      const e = easeOutQuad((t - BAR_TIP_START) / BAR_TIP_DUR);
      const rot = 90 + (FINAL_ROT - 90) * e;
      bar.setAttribute('transform', barTransform(STAND.x, STAND.y, rot));
      return;
    }
    bar.setAttribute('transform', barTransform(STAND.x, STAND.y, FINAL_ROT));
  }

  tick() {
    for (let i=0; i<4; i++) this.applyTally(i);
    this.applyBarbell();
  }

  frame = (now) => {
    this.curT = now - this.startT;
    this.tick();
    if (this.curT < TOTAL_DUR + 200) {
      this.raf = requestAnimationFrame(this.frame);
    } else {
      this.curT = TOTAL_DUR;
      this.tick();
      this.playing = false;
    }
  };

  play() {
    cancelAnimationFrame(this.raf);
    this.playing = true;
    this.curT = 0;
    this.startT = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
}

/* Wire up — defer until DOM is ready */
function init() {
  const headerEl  = document.getElementById('app-logo-stage');
  const welcomeEl = document.getElementById('welcome-logo-stage');
  if (!headerEl || !welcomeEl) return;

  // Header logo: static, tap to play
  window.tallymarkHeaderLogo = new Logo(headerEl, 'h', { startAtEnd: true });

  // Welcome logo: plays automatically every time welcome-wrap becomes visible
  const welcome = new Logo(welcomeEl, 'w', { startAtEnd: true });
  window.tallymarkWelcomeLogo = welcome;

  const wrap = document.getElementById('welcome-wrap');
  if (wrap) {
    // Replay every time the wrap gets `.show` (covers first launch + any re-show)
    let wasShown = wrap.classList.contains('show');
    if (wasShown) welcome.play();
    const obs = new MutationObserver(() => {
      const isShown = wrap.classList.contains('show');
      if (isShown && !wasShown) welcome.play();
      wasShown = isShown;
    });
    obs.observe(wrap, { attributes: true, attributeFilter: ['class'] });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
