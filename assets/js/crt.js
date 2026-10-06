// Shared WebGL2 cathode-ray renderer.
// One offscreen GL canvas draws each visible screen, then copies the result
// into that screen's own 2D canvas, so pictures scroll natively with the page.

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const COMMON = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}`;

// Signal fields: slow, grainy, domain-warped gradients (water / thermal).
const FIELD_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uRes;
uniform float uTime;
uniform int uMode;
${COMMON}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  vec2 q = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = q * vec2(uRes.x / uRes.y, 1.0) * 1.7;
  float t = uTime;
  vec2 w1 = vec2(fbm(p + vec2(0.0, t * 0.035)), fbm(p + vec2(5.2, 1.3) - t * 0.03));
  vec2 w2 = vec2(fbm(p + 2.2 * w1 + vec2(1.7, 9.2) + t * 0.045),
                 fbm(p + 2.2 * w1 + vec2(8.3, 2.8) - t * 0.04));
  float f = fbm(p + 2.4 * w2);
  vec3 c;
  if (uMode == 1) {
    vec3 deep = vec3(0.006, 0.03, 0.045);
    vec3 mid = vec3(0.02, 0.21, 0.25);
    vec3 hi = vec3(0.22, 0.58, 0.6);
    c = mix(deep, mid, smoothstep(0.22, 0.85, f));
    c = mix(c, hi, smoothstep(0.55, 0.95, f * (0.6 + 0.8 * w2.x)) * 0.7);
    float shafts = pow(max(0.0, sin((q.x * 1.3 - q.y * 0.35) * 13.0 + w1.x * 4.0 + t * 0.15)), 10.0);
    c += shafts * smoothstep(1.0, 0.0, q.y) * 0.16 * vec3(0.35, 0.75, 0.72);
    c *= mix(1.05, 0.55, q.y);
  } else {
    float h = clamp(f * 1.35 - 0.18 + 0.3 * w1.y, 0.0, 1.0);
    c = mix(vec3(0.015, 0.015, 0.02), vec3(0.02, 0.2, 0.22), smoothstep(0.0, 0.32, h));
    c = mix(c, vec3(0.88, 0.38, 0.08), smoothstep(0.34, 0.6, h));
    c = mix(c, vec3(0.86, 0.11, 0.07), smoothstep(0.62, 0.8, h));
    c = mix(c, vec3(1.0, 0.82, 0.5), smoothstep(0.86, 1.0, h));
  }
  o = vec4(c, 1.0);
}`;

// The tube: curvature, misconvergence, VHS chroma bleed, hue drift, colour split
// on events and scroll, bloom, scanlines, aperture grille, slow roll bar, grain.
// Nothing displaces the picture: no power-on, wobble, jitter, tears or flicker.
const CRT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uTex;
uniform sampler2D uOver;
uniform sampler2D uWater;
uniform vec2 uRes;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform float uTime, uDist, uGlitch, uStatic;
uniform float uCurv, uFill, uMotion, uDpr, uHasOver, uLod, uPlain;
${COMMON}
const mat3 TO_YIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
const mat3 TO_RGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);

vec3 src(vec2 uv) {
  vec2 t = uv * uScale + uOffset;
  vec3 c = texture(uTex, clamp(t, vec2(0.0005), vec2(0.9995))).rgb;
  // Below the photo (portrait hero): fade into live water before the last rows can smear.
  if (uFill > 0.5) c = mix(c, texture(uWater, uv).rgb * 0.8, smoothstep(0.86, 0.995, t.y));
  if (uHasOver > 0.5) {
    vec4 f = texture(uOver, clamp(uv, vec2(0.0), vec2(1.0)));
    c = mix(c, f.rgb, f.a) + f.rgb * f.a * 0.25;
  }
  return c;
}

void main() {
  vec2 uv = vUv;
  // Plain screens (the fish sonar) skip the tube entirely.
  if (uPlain > 0.5) {
    o = vec4(src(uv), 1.0);
    return;
  }
  vec2 px = uv * uRes;
  vec2 cc = uv * 2.0 - 1.0;
  float r2 = dot(cc, cc);
  vec2 bc = cc * (1.0 + uCurv * r2) / (1.0 + uCurv);
  vec2 suv = bc * 0.5 + 0.5;


  float edge = r2 * 0.5;
  float split = 0.0006 + 0.0024 * edge + 0.011 * uDist + 0.012 * uGlitch;
  vec2 so = vec2(split, 0.0) + cc * 0.0012 * edge;
  vec3 col = vec3(src(suv + so).r, src(suv).g, src(suv - so).b);

  float bw = (2.0 + 4.0 * uDist) * uDpr / uRes.x;
  vec3 yiq = TO_YIQ * col;
  vec3 a1 = TO_YIQ * src(suv - vec2(bw, 0.0));
  vec3 a2 = TO_YIQ * src(suv - vec2(bw * 2.5, 0.0));
  yiq.yz = yiq.yz * 0.45 + a1.yz * 0.33 + a2.yz * 0.22;
  float ang = (0.035 * sin(uTime * 0.11) + 0.02 * sin(uTime * 0.037 + 1.0)) * uMotion;
  float ca = cos(ang), sa = sin(ang);
  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;
  col = TO_RGB * yiq;

  vec3 b = textureLod(uTex, clamp(suv * uScale + uOffset, vec2(0.0005), vec2(0.9995)), uLod).rgb;
  col += max(b - 0.5, 0.0) * 0.6;

  // Channel change: a burst of analog static that clears as the new feed locks in.
  if (uStatic > 0.001) {
    float n = hash(floor(px / (2.0 * uDpr)) + fract(uTime * 13.7) * vec2(57.0, 113.0));
    float band = 0.75 + 0.25 * sin(suv.y * 40.0 + uTime * 90.0);
    col = mix(col, vec3(n * band), clamp(uStatic, 0.0, 1.0));
  }

  float lines = uRes.y / (3.0 * uDpr);
  float sl = 0.5 + 0.5 * cos(suv.y * lines * 6.2831853);
  col *= 1.0 - 0.16 * sl;
  float mx = mod(gl_FragCoord.x, 3.0);
  vec3 mask = mx < 1.0 ? vec3(1.0, 0.85, 0.85) : (mx < 2.0 ? vec3(0.85, 1.0, 0.85) : vec3(0.85, 0.85, 1.0));
  col *= mask * 1.08;

  col *= 1.0 - 0.42 * smoothstep(0.3, 1.5, r2);
  float roll = fract(uTime * 0.07);
  col *= 1.0 + 0.05 * exp(-pow((uv.y - roll) * 12.0, 2.0)) * uMotion;
  col += (hash(px + fract(uTime * 7.31) * vec2(91.0, 37.0) * uMotion) - 0.5) * 0.05;

  vec2 ef = smoothstep(1.0, 0.988, abs(bc));
  col *= ef.x * ef.y;
  o = vec4(max(col, 0.0), 1.0);
}`;

const PIXEL_BUDGET = 2.2e6;
const FIELD_DIVISOR = 3;
const STANDBY = { w: 320, h: 200 };

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

function program(gl, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'program link failed');
  }
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function fit(sw, sh, iw, ih, fx, fy, hero) {
  const as = sw / sh;
  const ai = iw / ih;
  let sx;
  let sy;
  if (hero && as < 1) {
    // Portrait: keep the AUV hull spanning the width, let water fill below.
    sx = Math.max(as / ai, 0.4);
    sy = (sx * ai) / as;
  } else if (as > ai) {
    sx = 1;
    sy = ai / as;
  } else {
    sx = as / ai;
    sy = 1;
  }
  const ox = sx > 1 ? (1 - sx) / 2 : (1 - sx) * fx;
  const oy = sy > 1 ? 0 : (1 - sy) * fy;
  return { scale: [sx, sy], offset: [ox, oy], fill: sy > 1 };
}

export class CRT {
  constructor({ reduced = false } = {}) {
    this.reduced = reduced;
    this.screens = [];
    this.glc = document.createElement('canvas');
    const gl = this.glc.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    // If a phone's GPU drops the context, fall back to the plain photos and videos.
    this.lost = false;
    this.glc.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.lost = true;
      document.documentElement.classList.remove('has-crt');
    });
    this.crt = program(gl, CRT_FRAG);
    this.field = program(gl, FIELD_FRAG);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    this.blank = this.texture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    this.standby = this.target(STANDBY.w, STANDBY.h);
    this.standbyTime = -1;

    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const s = this.screens.find((x) => x.el === e.target);
        if (!s) continue;
        s.visible = e.isIntersecting;
        if (s.video) {
          if (s.visible) s.video.play().catch(() => {});
          else s.video.pause();
        }
        s.dirty = true;
      }
    }, { threshold: [0, 0.1] });

    this.ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const s = this.screens.find((x) => x.el === e.target);
        if (s) this.measure(s);
      }
    });

    this.glitchAt = 6 + Math.random() * 6;
  }

  texture() {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  target(w, h) {
    const gl = this.gl;
    const tex = this.texture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo, w, h };
  }

  upload(tex, source) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  add(el, opts = {}) {
    const type = el.dataset.screen;
    const canvas = document.createElement('canvas');
    canvas.className = 'screen__gl';
    canvas.setAttribute('aria-hidden', 'true');
    const media = el.querySelector('.screen__media');
    if (media) media.after(canvas);
    else el.prepend(canvas);

    const [fx, fy] = (el.dataset.focus || '0.5 0.5').split(' ').map(Number);
    const s = {
      el,
      type,
      canvas,
      ctx: canvas.getContext('2d', { alpha: false }),
      hero: el.dataset.fit === 'hero',
      fx,
      fy: el.dataset.fit === 'hero' ? 0 : fy,
      curv: Number(el.dataset.curv || 0.06),
      plain: 'plain' in el.dataset,
      img: type === 'image' ? media : null,
      video: type === 'video' ? media : null,
      tex: null,
      iw: 0,
      ih: 0,
      ready: false,
      visible: false,
      dist: 0,
      glitch: 0,
      static: 0,
      overlay: null,
      field: null,
      dirty: true,
      w: 1,
      h: 1,
      scale: 1,
      ...opts,
    };

    if (s.img) {
      const done = () => {
        if (!s.img.naturalWidth) return;
        s.tex = s.tex || this.texture();
        this.upload(s.tex, s.img);
        s.iw = s.img.naturalWidth;
        s.ih = s.img.naturalHeight;
        s.ready = true;
        s.dirty = true;
      };
      if (s.img.complete) done();
      else s.img.addEventListener('load', done, { once: true });
    }
    if (s.video) {
      s.tex = this.texture();
      s.lastTime = -1;
      // Show the poster until the video has frames (or if autoplay is blocked).
      if (s.video.poster) {
        const poster = new Image();
        poster.decoding = 'async';
        poster.onload = () => {
          if (s.lastTime >= 0) return;
          this.upload(s.tex, poster);
          s.iw = poster.naturalWidth;
          s.ih = poster.naturalHeight;
          s.ready = true;
          s.dirty = true;
        };
        poster.src = s.video.poster;
      }
    }

    this.screens.push(s);
    this.measure(s, true);
    this.io.observe(el);
    this.ro.observe(el);
    this.bindEvents(s);
    return s;
  }

  bindEvents(s) {
    const host = s.el.closest('.bezel, .hero, .tape__stick, .interlude, .experience, .contact') || s.el;
    host.addEventListener('pointerenter', (e) => {
      // Touches that start a scroll also fire pointerenter; only a mouse hover splits colour.
      if (this.reduced || e.pointerType !== 'mouse') return;
      s.dist = Math.max(s.dist, 0.55);
    });
    host.addEventListener('click', (e) => {
      if (this.reduced) return;
      if (e.target.closest('a, button, .timeline, .tape__card')) return;
      s.dist = 1;
    });
  }

  // Resize handling. Mobile browsers fire a burst of resizes while their toolbars
  // slide in and out; reallocating the canvas on each one clears it and flickers.
  // During a burst the existing picture is just stretched by CSS (invisible for such
  // small changes); the backing canvas is rebuilt once the size has settled.
  measure(s, immediate = false) {
    const r = s.el.getBoundingClientRect();
    s.cssW = r.width;
    s.cssH = r.height;
    if (immediate) {
      this.resizeCanvas(s);
      return;
    }
    clearTimeout(s.resizeTimer);
    s.resizeTimer = setTimeout(() => this.resizeCanvas(s), 200);
  }

  resizeCanvas(s) {
    const r = s.el.getBoundingClientRect();
    s.cssW = r.width;
    s.cssH = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const area = Math.max(1, r.width * r.height);
    s.scale = Math.min(dpr, Math.sqrt(PIXEL_BUDGET / area));
    const w = Math.max(1, Math.round(r.width * s.scale));
    const h = Math.max(1, Math.round(r.height * s.scale));
    if (w === s.w && h === s.h) return;
    s.w = w;
    s.h = h;
    s.canvas.width = w;
    s.canvas.height = h;
    for (const key of ['field', 'water']) {
      if (!s[key]) continue;
      this.gl.deleteTexture(s[key].tex);
      this.gl.deleteFramebuffer(s[key].fbo);
      s[key] = null;
    }
    s.dirty = true;
    // The resize cleared the canvas: redraw it at once so it never shows blank.
    if (this.lastT !== undefined && s.visible && !this.lost) {
      this.draw(s, this.lastT, this.reduced ? 0 : 1);
      s.dirty = false;
    }
  }

  setFrame(s, img) {
    if (!img || !img.complete || !img.naturalWidth) return;
    if (s.frame !== img) {
      s.tex = s.tex || this.texture();
      this.upload(s.tex, img);
      s.frame = img;
      s.iw = img.naturalWidth;
      s.ih = img.naturalHeight;
      s.ready = true;
      s.dirty = true;
    }
  }

  // A canvas drawn elsewhere (the ranging illustration) becomes this screen's picture.
  setCanvasSource(s, canvas) {
    s.src = canvas;
    s.tex = s.tex || this.texture();
  }

  // Called from a real tap or click: playing every monitor once inside the gesture
  // unlocks them on phones that block muted autoplay (iOS Low Power Mode).
  // A monitor switching to its next clip: static and a colour glitch, like a channel change.
  channelChange(s) {
    s.lastTime = -1;
    if (this.reduced) return;
    s.static = 1;
    s.glitch = 1;
  }

  resumeVideos() {
    for (const s of this.screens) {
      if (!s.video) continue;
      s.video.play().then(() => { if (!s.visible) s.video.pause(); }).catch(() => {});
    }
  }

  setOverlay(s, canvas) {
    s.overlay = { canvas, tex: null };
  }

  renderField(s, mode, target, t) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(this.field.p);
    gl.uniform2f(this.field.u.uRes, target.w, target.h);
    gl.uniform1f(this.field.u.uTime, t);
    gl.uniform1i(this.field.u.uMode, mode);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  frame(t, dt) {
    if (this.lost) return;
    const motion = this.reduced ? 0 : 1;
    const ft = this.reduced ? 12.5 : t;
    this.lastT = ft;

    if (!this.reduced && t > this.glitchAt) {
      const live = this.screens.filter((s) => s.visible);
      if (live.length) live[Math.floor(Math.random() * live.length)].glitch = 1;
      this.glitchAt = t + 10 + Math.random() * 10;
    }

    for (const s of this.screens) {
      if (!s.visible) continue;
      if (!this.reduced) {
        s.dist *= Math.exp(-dt * 3.2);
        s.glitch = Math.max(0, s.glitch - dt / 0.15);
        s.static = Math.max(0, s.static - dt / 0.45);
      }
      if (this.reduced && !s.dirty && !(s.overlay && s.overlay.dirty)) continue;
      this.draw(s, ft, motion);
      s.dirty = false;
    }
  }

  draw(s, t, motion) {
    const gl = this.gl;
    let tex = this.blank;
    let fitted = { scale: [1, 1], offset: [0, 0], fill: false };

    if (s.type === 'water' || s.type === 'thermal') {
      if (!s.field) {
        s.field = this.target(Math.max(2, Math.round(s.w / FIELD_DIVISOR)), Math.max(2, Math.round(s.h / FIELD_DIVISOR)));
      }
      this.renderField(s, s.type === 'water' ? 1 : 2, s.field, t);
      tex = s.field.tex;
    } else {
      if (s.src && s.visible) {
        this.upload(s.tex, s.src);
        s.iw = s.src.width;
        s.ih = s.src.height;
        s.ready = true;
      }
      // Upload a video frame only when playback has moved on.
      if (s.video && s.visible && s.video.readyState >= 2 && s.video.currentTime !== s.lastTime) {
        this.upload(s.tex, s.video);
        s.lastTime = s.video.currentTime;
        s.iw = s.video.videoWidth;
        s.ih = s.video.videoHeight;
        s.ready = true;
      }
      if (s.ready) {
        tex = s.tex;
        fitted = fit(s.w, s.h, s.iw, s.ih, s.fx, s.fy, s.hero);
      } else {
        if (this.standbyTime !== t) {
          this.renderField(s, 2, this.standby, t);
          this.standbyTime = t;
        }
        tex = this.standby.tex;
      }
    }
    s.fit = fitted;

    let water = this.blank;
    if (fitted.fill) {
      if (!s.water) {
        s.water = this.target(Math.max(2, Math.round(s.w / FIELD_DIVISOR)), Math.max(2, Math.round(s.h / FIELD_DIVISOR)));
      }
      this.renderField(s, 1, s.water, t);
      water = s.water.tex;
    }

    if (this.glc.width < s.w || this.glc.height < s.h) {
      this.glc.width = Math.max(this.glc.width, s.w);
      this.glc.height = Math.max(this.glc.height, s.h);
    }

    const u = this.crt.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, s.w, s.h);
    gl.useProgram(this.crt.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(u.uTex, 0);

    let hasOver = 0;
    if (s.overlay) {
      gl.activeTexture(gl.TEXTURE1);
      if (!s.overlay.tex) {
        s.overlay.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, s.overlay.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      gl.bindTexture(gl.TEXTURE_2D, s.overlay.tex);
      if (s.overlay.dirty !== false) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.overlay.canvas);
        s.overlay.dirty = false;
      }
      gl.uniform1i(u.uOver, 1);
      hasOver = 1;
      gl.activeTexture(gl.TEXTURE0);
    } else {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.blank);
      gl.uniform1i(u.uOver, 1);
      gl.activeTexture(gl.TEXTURE0);
    }

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, water);
    gl.uniform1i(u.uWater, 2);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform2f(u.uRes, s.w, s.h);
    gl.uniform2f(u.uScale, fitted.scale[0], fitted.scale[1]);
    gl.uniform2f(u.uOffset, fitted.offset[0], fitted.offset[1]);
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uDist, s.dist);
    gl.uniform1f(u.uGlitch, s.glitch);
    gl.uniform1f(u.uStatic, s.static);
    gl.uniform1f(u.uPlain, s.plain ? 1 : 0);
    gl.uniform1f(u.uCurv, s.curv);
    gl.uniform1f(u.uFill, fitted.fill ? 1 : 0);
    gl.uniform1f(u.uMotion, motion);
    gl.uniform1f(u.uDpr, s.scale);
    gl.uniform1f(u.uHasOver, hasOver);
    gl.uniform1f(u.uLod, 3.5);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    s.ctx.drawImage(this.glc, 0, this.glc.height - s.h, s.w, s.h, 0, 0, s.w, s.h);
  }
}
