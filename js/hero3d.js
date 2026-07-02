/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — hero háttér
   Finoman lebegő aranypor-részecskék a hero mögött.
   (A fő látványelem a 3D öltönyös alak — model-viewer.)
   Nincs külső függőség.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── témafüggő színek ── */
  let palette = readPalette();
  function readPalette() {
    const light = document.documentElement.dataset.theme === "light";
    return {
      gold: light ? "201,162,75" : "212,175,106",
      dustAlpha: light ? 0.3 : 0.42,
    };
  }
  new MutationObserver(() => { palette = readPalette(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── aranypor ── */
  const DUST = [];
  for (let i = 0; i < 90; i++) {
    DUST.push({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00004 - Math.random() * 0.00013,
      tw: Math.random() * Math.PI * 2,
    });
  }

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = now / 1000;

    ctx.clearRect(0, 0, W, H);
    for (const d of DUST) {
      if (!reduceMotion) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < -0.02) d.x = 1.02; else if (d.x > 1.02) d.x = -0.02;
      }
      const a = palette.dustAlpha * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.7 + d.tw)));
      ctx.fillStyle = `rgba(${palette.gold},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, 6.2832);
      ctx.fill();
    }
  }
  requestAnimationFrame(frame);
})();
