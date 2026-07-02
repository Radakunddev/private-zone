/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — Aurora háttéreffekt
   A React Bits <Aurora /> komponens hűséges vanilla portja.
   Ugyanazok a shaderek és prop-ok (colorStops, speed, blend,
   amplitude), de natív WebGL2-vel — nincs React, nincs ogl függőség.

   Automatikusan minden [data-aurora] elemre ráépül. Prop-ok
   data-attribútumokból:
     data-colors="#ffffff,#cfac97,#ffc527"
     data-speed="0.5"  data-blend="0.69"  data-amplitude="1.0"
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

  function hexToRGB(hex) {
    const h = hex.trim().replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("Aurora shader error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function initAurora(container, opts) {
    const colorStops = opts.colorStops || ["#5227FF", "#7cff67", "#5227FF"];
    const speed = opts.speed ?? 1.0;
    let blend = opts.blend ?? 0.5;
    let amplitude = opts.amplitude ?? 1.0;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "transparent";

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return; // WebGL2 nem elérhető — a hero többi rétege marad

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Aurora link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // teljes képernyős háromszög (mint az ogl Triangle)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uAmplitude = gl.getUniformLocation(program, "uAmplitude");
    const uBlend = gl.getUniformLocation(program, "uBlend");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uColorStops = gl.getUniformLocation(program, "uColorStops[0]");

    let stopsArr = new Float32Array(colorStops.flatMap(hexToRGB));

    container.appendChild(canvas);

    const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    function resize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (!w || !h) return;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);
    resize();

    function draw(timeMs) {
      const time = timeMs * 0.01;
      gl.uniform1f(uTime, time * speed * 0.1);
      gl.uniform1f(uAmplitude, amplitude);
      gl.uniform1f(uBlend, blend);
      gl.uniform3fv(uColorStops, stopsArr);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      // statikus egyetlen képkocka mozgás nélkül
      requestAnimationFrame(() => { resize(); draw(1000); });
      return;
    }

    let paused = false;
    new IntersectionObserver((e) => { paused = !e[0].isIntersecting; })
      .observe(container);

    let raf = 0;
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (paused) return;
      draw(t);
    }
    raf = requestAnimationFrame(loop);
  }

  function boot() {
    document.querySelectorAll("[data-aurora]").forEach((el) => {
      const colors = (el.dataset.colors || "").split(",").map((s) => s.trim()).filter(Boolean);
      initAurora(el, {
        colorStops: colors.length === 3 ? colors : undefined,
        speed: el.dataset.speed !== undefined ? parseFloat(el.dataset.speed) : undefined,
        blend: el.dataset.blend !== undefined ? parseFloat(el.dataset.blend) : undefined,
        amplitude: el.dataset.amplitude !== undefined ? parseFloat(el.dataset.amplitude) : undefined,
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
