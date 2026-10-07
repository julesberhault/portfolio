import { CRT } from './crt.js';
import { School } from './boids.js';
import { MdtSim } from './mdt.js';

const root = document.documentElement;
root.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
if (coarse) root.classList.add('is-touch');

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/* ---------- Stable viewport height ---------- */
// Mobile browsers resize the window as their toolbars slide (Brave on iOS resizes the
// window itself). Layout is sized from heights frozen at load and anchored to the top,
// so scrolling never changes the page length: a shorter window just hides the bottom.
//   --vh       the window height, for the page layout
//   --vh-full  the tallest the window can get, for full-height backdrops (fish sonar)
// Touch devices refresh them only when the width changes (rotation); with a mouse,
// any window resize does.
let vhWidth = window.innerWidth;
function setStableVh() {
  if (coarse && window.innerWidth === vhWidth) return;
  vhWidth = window.innerWidth;
  root.style.setProperty('--vh', `${window.innerHeight}px`);
  root.style.setProperty('--vh-full', `${coarse ? Math.max(window.innerHeight, screen.height) : window.innerHeight}px`);
  root.classList.toggle('vh-short', window.innerHeight < 640);
}
window.addEventListener('resize', debounce(setStableVh, 150));

const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');

/* ---------- Ground-control monitor wall: a playlist of channels ---------- */

const PLAYLIST = [
  { name: 'gcs-kelp-fish', ch: '04' },
  { name: 'gcs-seabed', ch: '05' },
  { name: 'gcs-main', ch: '06' },
  { name: 'gcs-fan-rocks', ch: '07' },
  { name: 'gcs-fish', ch: '08' },
  { name: 'gcs-amber-kelp', ch: '09' },
];
// VP9 WebM is much lighter, but Safari and every iOS browser (all WebKit) claim WebM and then
// stall on these files, so only they get the H.264 MP4.
const ua = navigator.userAgent;
const webkitOnly = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  || (/Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua));
const clipExt = !webkitOnly && document.createElement('video').canPlayType('video/webm; codecs="vp9"') ? 'webm' : 'mp4';
// All clips run exactly CLIP_SECONDS, and one shared clock schedules the wall. Monitor k (screens
// shuffled) is CLIP_SECONDS / monitors further through the list than monitor k - 1, starting from a
// random channel, so one monitor changes channel at a time, each onto the channel that just went free:
// a steady roll through the list, never a doubled feed. Load delays and off-screen pauses are absorbed
// by tuning to the schedule rather than chaining each clip off the last.
const CLIP_SECONDS = 20;
const wallEpoch = performance.now() / 1000;
const monScreens = [...document.querySelectorAll('.gcs__mon .screen')].sort(() => Math.random() - 0.5);
const stagger = CLIP_SECONDS / monScreens.length;
const firstCh = Math.floor(Math.random() * PLAYLIST.length);
// The channel monitor k should show now, and how far into the clip.
function onSchedule(k) {
  const s = performance.now() / 1000 - wallEpoch + k * stagger;
  return { idx: (firstCh + k + Math.floor(s / CLIP_SECONDS)) % PLAYLIST.length, pos: s % CLIP_SECONDS };
}
const monitors = monScreens.map((el, k) => {
  const mon = { el, k, video: el.querySelector('video'), label: el.querySelector('.hud--ch'), idx: onSchedule(k).idx };
  tuneMonitor(mon);
  // Join the clip at its scheduled point once the new source can seek.
  mon.video.addEventListener('loadedmetadata', () => {
    const s = onSchedule(mon.k);
    if (s.idx === mon.idx && s.pos > 0.25) mon.video.currentTime = s.pos;
  });
  return mon;
});

function tuneMonitor(mon) {
  const clip = PLAYLIST[mon.idx];
  mon.video.loop = false;
  mon.video.poster = `assets/vid/web/${clip.name}-poster.webp`;
  mon.video.src = `assets/vid/web/${clip.name}.${clipExt}`;
  if (mon.label) mon.label.lastChild.textContent = `CH ${clip.ch}`;
}
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

// Mechanical tape counter. Each reel is 9,0,1,…,9,0 so a digit wrapping 9→0 (or 0→9)
// keeps rolling the same way as the scroll, then snaps silently, instead of
// spinning back through every digit.
const reels = [...document.querySelectorAll('.counter__reel')].map((el) => {
  el.innerHTML = ['9', ...'0123456789', '0'].map((d) => `<span>${d}</span>`).join('');
  const reel = { el, digit: 0, snap: null };
  el.style.setProperty('--d', 1);
  el.addEventListener('transitionend', () => {
    if (reel.snap === null) return;
    el.style.transition = 'none';
    el.style.setProperty('--d', reel.snap);
    void el.offsetHeight;
    el.style.transition = '';
    reel.snap = null;
  });
  return reel;
});
let lastCount = 0;
function updateChrome() {
  nav.classList.toggle('is-solid', window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const v = Math.round(clamp(window.scrollY / Math.max(1, max), 0, 1) * 999);
  if (v === lastCount) return;
  const up = v > lastCount;
  lastCount = v;
  const digits = pad(v, 3);
  reels.forEach((reel, i) => {
    const d = Number(digits[i]);
    if (d === reel.digit) return;
    if (up && d === 0 && reel.digit === 9) {
      reel.el.style.setProperty('--d', 11);
      reel.snap = 1;
    } else if (!up && d === 9 && reel.digit === 0) {
      reel.el.style.setProperty('--d', 0);
      reel.snap = 10;
    } else {
      reel.el.style.setProperty('--d', d + 1);
      reel.snap = null;
    }
    reel.digit = d;
  });
}

/* ---------- Reveals ---------- */

const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    revealIO.unobserve(e.target);
  }
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

const seen = new Map();
document.querySelectorAll('[data-reveal]').forEach((el) => {
  const i = seen.get(el.parentElement) || 0;
  seen.set(el.parentElement, i + 1);
  el.style.setProperty('--delay', `${Math.min(i, 4) * 0.08}s`);
  revealIO.observe(el);
});

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

function changeChannel(mon, idx) {
  mon.idx = idx;
  tuneMonitor(mon);
  const screen = screens.get(mon.el);
  if (screen) crt.channelChange(screen);
  mon.video.play().catch(() => {});
}

// When a clip ends, the monitor changes channel to the next clip in the playlist, indefinitely.
// A clip that ends a hair before the schedule flips still moves on to the next channel.
monitors.forEach((mon) => {
  mon.video.addEventListener('ended', () => {
    const { idx } = onSchedule(mon.k);
    changeChannel(mon, idx === mon.idx ? (idx + 1) % PLAYLIST.length : idx);
  });
  // A monitor that was paused off-screen rejoins its scheduled channel when it plays again.
  mon.video.addEventListener('play', () => {
    const { idx } = onSchedule(mon.k);
    if (idx !== mon.idx) changeChannel(mon, idx);
  });
});

if (crt) {
  // touchend and click count as user activation on iOS (touchstart does not).
  const resume = () => crt.resumeVideos();
  window.addEventListener('touchend', resume, { passive: true, once: true });
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
  new ResizeObserver(debounce(drawHeroName, 200)).observe(hero);
}

/* ---------- Detector tape ---------- */

const tape = document.querySelector('[data-tape]');
const tapeScreenEl = tape.querySelector('[data-screen]');
const tapeScreen = screens.get(tapeScreenEl);
const tapeImg = tapeScreenEl.querySelector('.screen__media');
const tapeCard = tape.querySelector('[data-steps]');
const steps = [...tapeCard.querySelectorAll('[data-step]')];
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
  // Nothing about the Detector shows at first; as the tape plays the card appears,
  // then its title, figures and autonomy suite are added one after another.
  const lit = reduced ? steps.length : Math.floor(p * 0.9999 * (steps.length + 1));
  steps.forEach((el, i) => el.classList.toggle('is-on', i < lit));
  tapeCard.classList.toggle('is-empty', lit === 0);
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
  mdtCanvas.className = 'screen__sim';
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
// Phone-width screens get 120 fish, desktops 240.
const small = window.innerWidth < 720;
const school = new School(fishCanvas, { max: small ? 120 : 240, groups: small ? 4 : 6, reduced });

// The fish get their own full-resolution canvas over the sonar, untouched by the tube.
fishCanvas.className = 'screen__fish';
fishCanvas.setAttribute('aria-hidden', 'true');
sonarEl.append(fishCanvas);

let settled = false;
function sizeSchool() {
  const r = sonarEl.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  // Up to 1.5× device pixels: clean edges without looking cut-out, capped at about 3 MP.
  const s = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(3e6 / (r.width * r.height)));
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
    school.pull = 0.0004;
    school.zone = left >= right
      ? { x0: 0.03, x1: Math.max(0.1, a0 - 0.02), y0: 0.12, y1: 0.9 }
      : { x0: Math.min(0.9, a1 + 0.02), x1: 0.97, y0: 0.12, y1: 0.9 };
  } else {
    // Phones and tablets: the band of open water above the cards.
    school.avoid = null;
    school.pull = 0.0008;
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
new ResizeObserver(debounce(sizeSchool, 200)).observe(sonarEl);

if (!reduced) {
  new IntersectionObserver((entries) => {
    for (const e of entries) school.setPresent(e.intersectionRatio > 0.35);
  }, { threshold: [0, 0.35, 0.6] }).observe(sonarEl);

  const experience = document.getElementById('experience');
  // Mouse only: on touchscreens a finger scrolls the page, so it never pushes fish.
  const predator = (e) => {
    if (e.pointerType !== 'mouse') return;
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
  experience.addEventListener('pointerleave', () => { school.pred.on = false; });
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
