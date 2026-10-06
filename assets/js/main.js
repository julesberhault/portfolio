import { CRT } from './crt.js';
import { School } from './boids.js';
import { MdtSim } from './mdt.js';

const root = document.documentElement;
root.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
if (coarse) root.classList.add('is-touch');

const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const timecode = (sec) => {
  const f = Math.floor((sec % 1) * 25);
  return `${pad(sec / 3600)}:${pad((sec / 60) % 60)}:${pad(sec % 60)}:${pad(f)}`;
};

/* ---------- Nav: solid bar, menu, current section, tape counter ---------- */

const nav = document.querySelector('[data-nav]');
const menu = document.querySelector('[data-menu]');
const links = [...document.querySelectorAll('.nav__links a')];

menu.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
});
links.forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.focus();
  }
});

const sectionIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const id = e.target.id;
    links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`)));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
['about', 'projects', 'experience', 'skills', 'contact'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionIO.observe(el);
});

const reels = [...document.querySelectorAll('.counter__reel')];
reels.forEach((r) => {
  r.innerHTML = Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join('');
});
let lastCount = -1;
function updateChrome() {
  nav.classList.toggle('is-solid', window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const v = Math.round(clamp(window.scrollY / Math.max(1, max), 0, 1) * 999);
  if (v === lastCount) return;
  lastCount = v;
  const digits = pad(v, 3);
  reels.forEach((r, i) => r.style.setProperty('--d', digits[i]));
}

/* ---------- Reveals and counters ---------- */

const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    revealIO.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
  }
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

const revealed = [...document.querySelectorAll('[data-reveal]')];
const seen = new Map();
revealed.forEach((el) => {
  const parent = el.parentElement;
  const i = seen.get(parent) || 0;
  seen.set(parent, i + 1);
  el.style.setProperty('--delay', `${Math.min(i, 4) * 0.08}s`);
  revealIO.observe(el);
});

function countUp(el) {
  if (reduced || el.dataset.done) return;
  el.dataset.done = '1';
  const end = Number(el.dataset.count);
  const plain = 'plain' in el.dataset;
  const start = plain ? end - 27 : 0;
  const fmt = (n) => (plain ? String(n) : n.toLocaleString('en-US'));
  // Reserve the final width so rolling digits never reflow the line (no scroll jumps).
  el.style.display = 'inline-block';
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  const t0 = performance.now();
  const dur = 1300;
  const tick = (now) => {
    const p = clamp((now - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(Math.round(start + (end - start) * e));
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = fmt(start);
  requestAnimationFrame(tick);
}

/* ---------- CRT screens ---------- */

let crt = null;
try {
  crt = new CRT({ reduced });
  root.classList.add('has-crt');
} catch (err) {
  crt = null;
}

const screens = new Map();
if (crt) {
  document.querySelectorAll('[data-screen]').forEach((el) => screens.set(el, crt.add(el)));
} else {
  document.querySelectorAll('video.screen__media').forEach((v) => {
    if (!reduced) {
      v.autoplay = true;
      v.play().catch(() => {});
    }
  });
}

if (crt) {
  const resume = () => crt.resumeVideos();
  window.addEventListener('touchstart', resume, { passive: true, once: true });
  window.addEventListener('click', resume, { once: true });
}


/* ---------- Hero: the name drawn on the tube, and the timecode ---------- */

const hero = document.querySelector('.hero');
const heroScreen = screens.get(hero.querySelector('[data-screen]'));
const tcEl = hero.querySelector('[data-timecode]');
const nameEl = hero.querySelector('.hero__name');
const nameCanvas = document.createElement('canvas');
const nameInk = document.createElement('canvas');

// Paint the veil and the name as an amber phosphor dot matrix into the hero
// screen's overlay, so the CRT curves, scans, blooms and splits them with the picture.
function drawHeroName() {
  if (!heroScreen) return;
  const sr = heroScreen.el.getBoundingClientRect();
  if (sr.width < 2 || sr.height < 2) return;
  const k = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = Math.round(sr.width * k);
  const H = Math.round(sr.height * k);
  nameCanvas.width = nameInk.width = W;
  nameCanvas.height = nameInk.height = H;
  const ctx = nameCanvas.getContext('2d');
  const veil = ctx.createLinearGradient(0, H, 0, H * 0.36);
  veil.addColorStop(0, 'rgba(4, 6, 8, 0.86)');
  veil.addColorStop(0.45, 'rgba(4, 6, 8, 0.5)');
  veil.addColorStop(1, 'rgba(4, 6, 8, 0)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  const cs = getComputedStyle(nameEl);
  const fs = parseFloat(cs.fontSize) * k;
  const ink = nameInk.getContext('2d');
  ink.font = `700 ${fs}px Silkscreen`;
  if ('letterSpacing' in ink) ink.letterSpacing = `${(parseFloat(cs.letterSpacing) || 0) * k}px`;
  ink.textBaseline = 'middle';
  ink.fillStyle = '#ffb43a';
  nameEl.querySelectorAll('span').forEach((word) => {
    const r = word.getBoundingClientRect();
    ink.fillText(word.textContent.toUpperCase(), (r.left - sr.left) * k, (r.top - sr.top + r.height / 2) * k);
  });

  // Keep only round phosphor dots inside the letters.
  const cell = Math.max(3, Math.round(fs / 17));
  const dot = document.createElement('canvas');
  dot.width = dot.height = cell;
  const d = dot.getContext('2d');
  d.fillStyle = '#fff';
  d.beginPath();
  d.arc(cell / 2, cell / 2, cell * 0.44, 0, Math.PI * 2);
  d.fill();
  ink.globalCompositeOperation = 'destination-in';
  ink.fillStyle = ink.createPattern(dot, 'repeat');
  ink.fillRect(0, 0, W, H);

  ctx.save();
  ctx.filter = `blur(${fs * 0.14}px)`;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(nameInk, 0, 0);
  ctx.restore();
  ctx.drawImage(nameInk, 0, 0);

  if (!heroScreen.overlay) crt.setOverlay(heroScreen, nameCanvas);
  heroScreen.overlay.dirty = true;
  heroScreen.dirty = true;
}

if (heroScreen) {
  document.fonts.load('700 64px Silkscreen').then(drawHeroName, drawHeroName);
  new ResizeObserver(() => drawHeroName()).observe(hero);
}

/* ---------- Detector tape ---------- */

const tape = document.querySelector('[data-tape]');
const tapeScreenEl = tape.querySelector('[data-screen]');
const tapeScreen = screens.get(tapeScreenEl);
const tapeImg = tapeScreenEl.querySelector('.screen__media');
const steps = [...tape.querySelectorAll('[data-steps] li')];
const frameNum = tape.querySelector('[data-frame]');
const tapeTc = tape.querySelector('[data-tape-tc]');
const FRAMES = Number(tapeScreenEl.dataset.frames);
const frames = [];
const tapeStick = tape.querySelector('.tape__stick');
let lastIdx = -1;
let shownFrame = null;

function loadFrames() {
  if (frames.length) return;
  const big = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1300;
  const base = big ? tapeScreenEl.dataset.baseLg : tapeScreenEl.dataset.baseSm;
  for (let i = 1; i <= FRAMES; i++) {
    const img = new Image();
    img.decoding = 'async';
    img.src = `${base}${pad(i)}.webp`;
    frames.push(img);
  }
}
new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) loadFrames();
}, { rootMargin: '150% 0px' }).observe(tape);

function updateTape(t) {
  const r = tape.getBoundingClientRect();
  if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
  // Use the sticky frame's own height (100svh), which stays put when a phone's
  // address bar shows or hides, so the tape never steps backwards mid-scroll.
  const view = tapeStick.offsetHeight || window.innerHeight;
  const p = reduced ? 0.33 : clamp(-r.top / Math.max(1, r.height - view), 0, 1);
  const idx = Math.round(p * (FRAMES - 1));
  const on = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.9999));
  steps.forEach((li, i) => li.classList.toggle('is-on', reduced || i === on));
  if (idx !== lastIdx) {
    lastIdx = idx;
    frameNum.textContent = pad(idx + 1);
    tapeTc.textContent = timecode(idx / 25);
  }
  const img = frames[idx];
  if (!img) return;
  if (tapeScreen) crt.setFrame(tapeScreen, img);
  else if (img.complete && shownFrame !== img) {
    tapeImg.src = img.src;
    shownFrame = img;
  }
}

/* ---------- Ranging illustration (Exail, 2021) ---------- */

const mdtEl = document.querySelector('[data-mdt]');
const mdtCanvas = document.createElement('canvas');
const mdt = new MdtSim(mdtCanvas);
const mdtScreen = screens.get(mdtEl);
let mdtVisible = false;
if (mdtScreen) {
  crt.setCanvasSource(mdtScreen, mdtCanvas);
} else {
  mdtCanvas.className = 'screen__gl';
  mdtCanvas.setAttribute('aria-hidden', 'true');
  mdtEl.append(mdtCanvas);
}
new IntersectionObserver((entries) => {
  mdtVisible = entries[0].isIntersecting;
}).observe(mdtEl);
document.fonts.load('17px VT323').then(() => {
  mdt.draw(7);
  if (mdtScreen) mdtScreen.dirty = true;
});

/* ---------- Fish school on the sonar ---------- */

const sonarEl = document.querySelector('[data-boids]');
const sonarScreen = screens.get(sonarEl);
const targetsEl = document.querySelector('[data-targets]');
const fishCanvas = document.createElement('canvas');
const small = window.innerWidth < 720 || (navigator.hardwareConcurrency || 8) <= 4;
const school = new School(fishCanvas, { max: small ? 180 : 480, groups: small ? 3 : 5, reduced });

// The fish get their own full-resolution canvas over the sonar, untouched by the tube.
fishCanvas.className = 'screen__fish';
fishCanvas.setAttribute('aria-hidden', 'true');
sonarEl.append(fishCanvas);

let settled = false;
function sizeSchool() {
  const r = sonarEl.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  // Device-pixel resolution keeps the strokes crisp, capped at about 4 MP.
  const s = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (r.width * r.height)));
  school.resize(r.width * s, r.height * s, s);
  // Keep the school in the open water beside the timeline, never under it.
  const tl = document.querySelector('.experience .timeline');
  const t = tl ? tl.getBoundingClientRect() : null;
  if (window.innerWidth >= 960 && t) {
    const a0 = (t.left - r.left) / r.width;
    const a1 = (t.right - r.left) / r.width;
    const left = a0 - 0.04;
    const right = 0.96 - (a1 + 0.04);
    school.avoid = [a0 - 0.03, a1 + 0.03];
    school.pull = 0.0006;
    school.zone = left >= right
      ? { x0: 0.03, x1: Math.max(0.1, a0 - 0.02), y0: 0.12, y1: 0.9 }
      : { x0: Math.min(0.9, a1 + 0.02), x1: 0.97, y0: 0.12, y1: 0.9 };
  } else {
    // Phones and tablets: the band of open water above the cards.
    school.avoid = null;
    school.pull = 0.0012;
    school.zone = { x0: 0.08, x1: 0.92, y0: 0.1, y1: 0.4 };
  }
  if (reduced) {
    // A still school: settle the simulation once, then draw a single frame.
    if (!settled) {
      school.settle();
      settled = true;
    }
    school.draw();
    if (targetsEl) targetsEl.textContent = pad(school.count, 3);
  }
}
sizeSchool();
new ResizeObserver(sizeSchool).observe(sonarEl);

if (!reduced) {
  new IntersectionObserver((entries) => {
    for (const e of entries) school.setPresent(e.intersectionRatio > 0.35);
  }, { threshold: [0, 0.35, 0.6] }).observe(sonarEl);

  const experience = document.getElementById('experience');
  const predator = (e) => {
    const r = sonarEl.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const px = ((e.clientX - r.left) / r.width) * school.w;
    const py = ((e.clientY - r.top) / r.height) * school.h;
    const p = school.pred;
    // Pointer velocity lets fish be dragged along the cursor's path.
    if (p.on && inside) {
      p.vx = clamp(p.vx * 0.5 + (px - p.x) * 0.5, -40, 40);
      p.vy = clamp(p.vy * 0.5 + (py - p.y) * 0.5, -40, 40);
    }
    p.on = inside;
    p.x = px;
    p.y = py;
  };
  experience.addEventListener('pointermove', predator);
  experience.addEventListener('pointerdown', predator);
  experience.addEventListener('pointerleave', () => { school.pred.on = false; });
  window.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') school.pred.on = false; });
}

let fishVisible = false;
new IntersectionObserver((entries) => {
  fishVisible = entries[0].isIntersecting;
}).observe(sonarEl);

/* ---------- Frame loop ---------- */

let tPrev = performance.now();
const tStart = tPrev;
let countTick = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - tPrev) / 1000);
  tPrev = now;
  const t = (now - tStart) / 1000;


  updateChrome();
  updateTape(t);

  if (tcEl && (!heroScreen || heroScreen.visible) && !reduced) tcEl.textContent = timecode(t);


  if (!reduced && (fishVisible || school.count > 0)) {
    school.step(dt);
    school.draw();
    if (++countTick % 8 === 0) targetsEl.textContent = pad(school.count, 3);
  }

  if (mdtVisible && !reduced) mdt.draw(t);

  if (crt) crt.frame(t, dt);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
