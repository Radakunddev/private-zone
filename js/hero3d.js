/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — hero 3D
   A logó pajzsformája 3D részecske-konstellációként:
   saját perspektivikus vetítés, egér-parallax, aranypor háttér.
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
      ink: light ? "22,24,29" : "240,237,230",
      lineAlpha: light ? 0.16 : 0.20,
      dotAlpha: light ? 0.75 : 0.9,
      dustAlpha: light ? 0.28 : 0.4,
    };
  }
  new MutationObserver(() => { palette = readPalette(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── geometria: a logó körvonalai (512-es SVG-térből) ── */
  function quad(p0, p1, p2, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push([
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
      ]);
    }
    return pts;
  }
  function line(p0, p1, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]);
    }
    return pts;
  }
  function star(cx, cy, s, n) {
    // 10 csúcsú csillag-poligon élei mentén mintavételezve
    const R = 20 * s, r = 8 * s, verts = [];
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + k * Math.PI / 5;
      const rad = k % 2 === 0 ? R : r;
      verts.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]);
    }
    let pts = [];
    for (let k = 0; k < 10; k++) {
      pts = pts.concat(line(verts[k], verts[(k + 1) % 10], n).slice(0, -1));
    }
    return pts;
  }

  // körvonal-szakaszok: [pontlista, zárt-e]
  const strokes = [
    // bal hajtóka: külső ív, alsó csúcs, belső él, felső él
    [quad([84, 104], [96, 330], [253, 466], 46)
      .concat(line([253, 466], [213, 152], 34).slice(1))
      .concat(line([213, 152], [84, 104], 12).slice(1)), true],
    // jobb hajtóka (tükrözve)
    [quad([428, 104], [416, 330], [259, 466], 46)
      .concat(line([259, 466], [299, 152], 34).slice(1))
      .concat(line([299, 152], [428, 104], 12).slice(1)), true],
    // csokornyakkendő
    [line([196, 96], [244, 113], 6).concat(line([244, 113], [244, 139], 4).slice(1))
      .concat(line([244, 139], [196, 150], 6).slice(1))
      .concat(quad([196, 150], [188, 123], [196, 96], 6).slice(1)), true],
    [line([316, 96], [268, 113], 6).concat(line([268, 113], [268, 139], 4).slice(1))
      .concat(line([268, 139], [316, 150], 6).slice(1))
      .concat(quad([316, 150], [324, 123], [316, 96], 6).slice(1)), true],
    [line([256, 110], [267, 126], 3).concat(line([267, 126], [256, 142], 3).slice(1))
      .concat(line([256, 142], [245, 126], 3).slice(1))
      .concat(line([245, 126], [256, 110], 3).slice(1)), true],
    // csillagok
    [star(256, 216, 1, 2), true],
    [star(256, 296, 1, 2), true],
    [star(256, 376, 1, 2), true],
  ];

  /* ── pontok 3D-be emelése ── */
  // normalizálás: (x-256)/256, (y-286)/256 — kicsit feljebb tolt középpont
  const NODES = [];      // {x,y,z, r, tw}  — körvonal-pontok
  const EDGES = [];      // [i, j]          — összekötendő párok
  strokes.forEach(([pts, closed]) => {
    const base = NODES.length;
    pts.forEach((p, i) => {
      NODES.push({
        x: (p[0] - 256) / 256,
        y: (p[1] - 286) / 256,
        z: (Math.random() - 0.5) * 0.16,
        r: 1.1 + Math.random() * 1.2,
        tw: Math.random() * Math.PI * 2,
      });
      if (i > 0) EDGES.push([base + i - 1, base + i]);
    });
    if (closed) EDGES.push([base + pts.length - 1, base]);
  });

  // belső, halványabb "szövet" pontok a hajtókákon belül
  const FILL = [];
  for (let i = 0; i < 130; i++) {
    const t = Math.random();
    const side = Math.random() < 0.5 ? -1 : 1;
    // külső ív és belső él közötti véletlen pont
    const outer = quadAt([84, 104], [96, 330], [253, 466], t);
    const inner = [213 + (253 - 213) * t, 152 + (466 - 152) * t];
    const m = Math.random();
    const x = outer[0] + (inner[0] - outer[0]) * m;
    const y = outer[1] + (inner[1] - outer[1]) * m;
    // a bal hajtókán mintavételezett pont; side > 0 esetén a jobb oldalra tükrözve
    FILL.push({
      x: (x - 256) / 256 * (side > 0 ? -1 : 1),
      y: (y - 286) / 256,
      z: (Math.random() - 0.5) * 0.22,
      r: 0.6 + Math.random() * 0.9,
      tw: Math.random() * Math.PI * 2,
    });
  }
  function quadAt(p0, p1, p2, t) {
    const u = 1 - t;
    return [
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ];
  }

  /* ── aranypor a háttérben ── */
  const DUST = [];
  for (let i = 0; i < 70; i++) {
    DUST.push({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00004 - Math.random() * 0.00012,
      tw: Math.random() * Math.PI * 2,
    });
  }

  /* ── viewport, egér ── */
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, scale = 1;
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const desktop = W > 880;
    cx = desktop ? W * 0.72 : W * 0.5;
    cy = desktop ? H * 0.52 : H * 0.42;
    scale = Math.min(W * (desktop ? 0.30 : 0.42), H * 0.36);
  }
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── vetítés és rajzolás ── */
  const FOV = 2.6;
  const proj = new Array(NODES.length + FILL.length);

  function project(p, sinY, cosY, sinX, cosX) {
    // Y-tengely körüli forgatás
    let x = p.x * cosY + p.z * sinY;
    let z = -p.x * sinY + p.z * cosY;
    // X-tengely körüli billentés
    let y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;
    const s = FOV / (FOV + z);
    return [cx + x * s * scale, cy + y * s * scale, s, z];
  }

  let t0 = performance.now();
  let visible = true;

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;

    const t = (now - t0) / 1000;
    curX += (mouseX - curX) * 0.04;
    curY += (mouseY - curY) * 0.04;

    const angY = reduceMotion ? 0 : Math.sin(t * 0.32) * 0.52 + curX * 0.42;
    const angX = reduceMotion ? 0 : Math.sin(t * 0.21) * 0.10 + curY * 0.18;
    const sinY = Math.sin(angY), cosY = Math.cos(angY);
    const sinX = Math.sin(angX), cosX = Math.cos(angX);

    ctx.clearRect(0, 0, W, H);

    /* aranypor */
    for (const d of DUST) {
      d.x += d.vx; d.y += d.vy;
      if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
      if (d.x < -0.02) d.x = 1.02; else if (d.x > 1.02) d.x = -0.02;
      const a = palette.dustAlpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + d.tw)));
      ctx.fillStyle = `rgba(${palette.gold},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, 6.2832);
      ctx.fill();
    }

    /* pontok vetítése */
    for (let i = 0; i < NODES.length; i++) proj[i] = project(NODES[i], sinY, cosY, sinX, cosX);
    for (let i = 0; i < FILL.length; i++) proj[NODES.length + i] = project(FILL[i], sinY, cosY, sinX, cosX);

    /* élek — a pajzs sziluettje */
    ctx.lineWidth = 1;
    for (const [a, b] of EDGES) {
      const pa = proj[a], pb = proj[b];
      const depth = (pa[2] + pb[2]) / 2;                 // közelebbi = fényesebb
      const alpha = palette.lineAlpha * (depth * depth);
      ctx.strokeStyle = `rgba(${palette.gold},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }

    /* belső pontok */
    for (let i = 0; i < FILL.length; i++) {
      const p = proj[NODES.length + i], f = FILL[i];
      const a = 0.22 * p[2] * (0.5 + 0.5 * Math.sin(t * 1.3 + f.tw));
      ctx.fillStyle = `rgba(${palette.ink},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], f.r * p[2], 0, 6.2832);
      ctx.fill();
    }

    /* körvonal-pontok — csillogó arany csomópontok */
    for (let i = 0; i < NODES.length; i++) {
      const p = proj[i], nd = NODES[i];
      const tw = 0.55 + 0.45 * Math.sin(t * 1.6 + nd.tw);
      const a = palette.dotAlpha * p[2] * tw;
      const r = nd.r * p[2];
      ctx.fillStyle = `rgba(${palette.gold},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, 6.2832);
      ctx.fill();
      if (nd.r > 2 && tw > 0.9) {                        // ritka felvillanás
        ctx.fillStyle = `rgba(${palette.gold},${(a * 0.25).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r * 3.2, 0, 6.2832);
        ctx.fill();
      }
    }
  }
  requestAnimationFrame(frame);
})();
