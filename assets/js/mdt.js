// Illustration of the horizon-referenced ranging method from Jules's 2021 report
// ("Développement et optimisation d'un système de détection et de suivi d'obstacles
// en mer"). One infrared camera, h = 2 m above the water, 50° × 40° field of view,
// 640 × 512 pixels: the pixel gap between the horizon and a target's waterline gives
// the angle below the horizon, which with the horizon dip gives range; x gives bearing.
// The scene is synthetic; the geometry and parameters are the report's.

const H = 2.0;
const R = 6378137;
const HFOV = 50;
const VFOV = 40;
const W = 640;
const HH = 512;
const DEG = 180 / Math.PI;
const PX_PER_DEG = HH / VFOV;
const DIP = Math.acos(R / (R + H)) * DEG;

const gapForRange = (r) => (Math.atan(H / r) * DEG - DIP) * PX_PER_DEG;
const rangeForGap = (gap) => H / Math.tan((DIP + gap / PX_PER_DEG) / DEG);

const pad = (n, l) => String(Math.round(Math.abs(n))).padStart(l, '0');

// A small workboat in white-hot infrared, bow to the right, drawn in a box of
// length L and height Ht whose waterline centre sits at (x, y). Warm stern and
// engine, cooler bow, cold glass, a hot exhaust, bow wave, wake and reflection.
function drawVessel(ctx, x, y, L, Ht, t) {
  const P = (nx, ny) => [nx * L, ny * Ht];
  ctx.save();
  ctx.translate(x, y);

  // Wake and bow wave on the water, behind and ahead of the hull.
  const wake = ctx.createLinearGradient(-L * 1.6, 0, -L * 0.45, 0);
  wake.addColorStop(0, 'rgba(170, 170, 170, 0)');
  wake.addColorStop(1, 'rgba(170, 170, 170, 0.45)');
  ctx.fillStyle = wake;
  ctx.beginPath();
  ctx.moveTo(-L * 0.45, -Ht * 0.02);
  ctx.lineTo(-L * 1.6, -Ht * 0.01);
  ctx.lineTo(-L * 1.6, Ht * 0.07);
  ctx.lineTo(-L * 0.45, Ht * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(205, 205, 205, 0.7)';
  ctx.beginPath();
  ctx.ellipse(L * 0.38, Ht * 0.01, L * 0.1, Ht * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // Faint reflection of the warm hull on the water.
  ctx.fillStyle = 'rgba(190, 190, 190, 0.12)';
  ctx.fillRect(-L * 0.44, Ht * 0.03, L * 0.82, Ht * 0.16);

  // The vessel pitches gently with the swell.
  ctx.rotate((Math.sin(t * 1.3) * 1.2) / DEG);

  // Hull: transom stern, sheer rising to a raked bow, warm aft and cooler forward.
  const hull = ctx.createLinearGradient(-L * 0.5, 0, L * 0.5, 0);
  hull.addColorStop(0, '#e6e6e6');
  hull.addColorStop(0.55, '#bdbdbd');
  hull.addColorStop(1, '#a2a2a2');
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(...P(-0.47, 0));
  ctx.lineTo(...P(-0.5, -0.3));
  ctx.quadraticCurveTo(...P(0.1, -0.31), ...P(0.42, -0.38));
  ctx.lineTo(...P(0.5, -0.43));
  ctx.quadraticCurveTo(...P(0.47, -0.16), ...P(0.38, 0));
  ctx.closePath();
  ctx.fill();
  // Cooler wet band along the waterline.
  ctx.fillStyle = 'rgba(70, 70, 70, 0.55)';
  ctx.beginPath();
  ctx.moveTo(...P(-0.47, 0));
  ctx.lineTo(...P(-0.48, -0.06));
  ctx.lineTo(...P(0.41, -0.06));
  ctx.lineTo(...P(0.38, 0));
  ctx.closePath();
  ctx.fill();

  // Deck rail with posts.
  ctx.strokeStyle = 'rgba(225, 225, 225, 0.85)';
  ctx.lineWidth = Math.max(0.6, Ht * 0.025);
  ctx.beginPath();
  ctx.moveTo(...P(-0.46, -0.4));
  ctx.quadraticCurveTo(...P(0.1, -0.41), ...P(0.4, -0.48));
  for (const nx of [-0.4, -0.28, -0.16, 0.24, 0.34]) {
    const yy = nx < 0.1 ? -0.31 : -0.34;
    ctx.moveTo(...P(nx, yy));
    ctx.lineTo(...P(nx, yy - 0.09));
  }
  ctx.stroke();

  // Wheelhouse with a raked front, cold dark windows, and a flybridge top.
  ctx.fillStyle = '#d4d4d4';
  ctx.beginPath();
  ctx.moveTo(...P(-0.14, -0.31));
  ctx.lineTo(...P(-0.14, -0.64));
  ctx.lineTo(...P(0.1, -0.66));
  ctx.lineTo(...P(0.2, -0.33));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a5a5a';
  ctx.beginPath();
  ctx.moveTo(...P(-0.1, -0.5));
  ctx.lineTo(...P(-0.1, -0.59));
  ctx.lineTo(...P(0.1, -0.6));
  ctx.lineTo(...P(0.15, -0.49));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d4d4d4';
  for (const nx of [-0.04, 0.03]) ctx.fillRect(...P(nx, -0.6), L * 0.012, Ht * 0.11);
  ctx.fillStyle = '#c8c8c8';
  ctx.fillRect(...P(-0.17, -0.7), L * 0.3, Ht * 0.05);

  // Mast, radar bar and whip antennas.
  ctx.strokeStyle = 'rgba(215, 215, 215, 0.9)';
  ctx.lineWidth = Math.max(0.6, Ht * 0.03);
  ctx.beginPath();
  ctx.moveTo(...P(-0.02, -0.7));
  ctx.lineTo(...P(-0.02, -0.96));
  ctx.moveTo(...P(-0.09, -0.86));
  ctx.lineTo(...P(0.06, -0.86));
  ctx.moveTo(...P(-0.08, -0.7));
  ctx.lineTo(...P(-0.1, -1));
  ctx.stroke();
  ctx.fillStyle = '#e2e2e2';
  ctx.fillRect(...P(-0.07, -0.91), L * 0.12, Ht * 0.035);

  // Hot exhaust at the stern: the brightest thing in a thermal image.
  const ex = P(-0.36, -0.36);
  const glow = ctx.createRadialGradient(ex[0], ex[1], 0, ex[0], ex[1], Math.max(3, Ht * 0.35));
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  glow.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ex[0], ex[1], Math.max(3, Ht * 0.35), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(...P(-0.39, -0.48), L * 0.05, Ht * 0.17);

  ctx.restore();
}

export class MdtSim {
  constructor(canvas, { scale = 1.5 } = {}) {
    this.canvas = canvas;
    this.k = scale;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(HH * scale);
    this.ctx = canvas.getContext('2d');
    // Fixed ripple field on the sea, drawn with perspective below the horizon.
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    this.ripples = Array.from({ length: 170 }, () => ({ x: rand() * W, d: Math.pow(rand(), 1.6), s: 0.6 + rand() }));
  }

  draw(t) {
    const { ctx, k } = this;
    const cycle = 18;
    const u = (t % cycle) / cycle;
    const range = 320 * Math.pow(55 / 320, u);
    const bearing = -14 + 20 * u + 2 * Math.sin(t * 0.4);
    const roll = 0.7 * Math.sin(t * 0.7);
    const heave = 4 * Math.sin(t * 0.9) + 1.5 * Math.sin(t * 2.1 + 1);
    const yh = 214 + heave;
    const gap = gapForRange(range);

    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, W, HH);

    // Scene rotates with the vessel's roll around the horizon centre.
    ctx.save();
    ctx.translate(W / 2, yh);
    ctx.rotate(roll / DEG);
    ctx.translate(-W / 2, -yh);

    // White-hot infrared: a cold, dark sky and warmer water.
    const sky = ctx.createLinearGradient(0, yh - 260, 0, yh);
    sky.addColorStop(0, '#0a0a0a');
    sky.addColorStop(1, '#2c2c2c');
    ctx.fillStyle = sky;
    ctx.fillRect(-60, yh - 400, W + 120, 400);
    const sea = ctx.createLinearGradient(0, yh, 0, HH + 60);
    sea.addColorStop(0, '#3e3e3e');
    sea.addColorStop(1, '#6c6c6c');
    ctx.fillStyle = sea;
    ctx.fillRect(-60, yh, W + 120, HH + 120 - yh);

    for (const r of this.ripples) {
      const y = yh + 2 + r.d * (HH + 40 - yh);
      const depth = (y - yh) / (HH - yh);
      const len = 3 + depth * 26 * r.s;
      const x = ((r.x + t * (6 + depth * 30) * r.s) % (W + 80)) - 40;
      ctx.strokeStyle = `rgba(150, 150, 150, ${0.12 + depth * 0.3})`;
      ctx.lineWidth = 0.6 + depth * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }

    // The target: a 14 m workboat standing 5 m above the water, sized from its range.
    const tx = W / 2 + bearing * (W / HFOV);
    const tw = Math.atan(14 / range) * DEG * (W / HFOV);
    const th = Math.atan(5 / range) * DEG * PX_PER_DEG;
    const yw = yh + gap;
    drawVessel(ctx, tx, yw, tw, th, t);

    // Detection overlay in amber phosphor: segmented horizon, track box, gap bracket.
    const amber = 'rgba(255, 180, 58, 0.95)';
    ctx.strokeStyle = amber;
    ctx.fillStyle = amber;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(-60, yh);
    ctx.lineTo(W + 60, yh);
    ctx.stroke();
    ctx.setLineDash([]);

    const bx = tx - tw / 2 - 4;
    const by = yw - th - 4;
    const bw = tw + 8;
    const bh = th + 6;
    ctx.strokeRect(bx, by, bw, bh);
    const mx = bx - 10;
    ctx.beginPath();
    ctx.moveTo(mx, yh);
    ctx.lineTo(mx, yw);
    ctx.moveTo(mx - 4, yh);
    ctx.lineTo(mx + 4, yh);
    ctx.moveTo(mx - 4, yw);
    ctx.lineTo(mx + 4, yw);
    ctx.stroke();
    ctx.restore();

    ctx.font = '17px VT323, monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = amber;
    ctx.fillText('TRK 01', bx, by - 6);
    ctx.fillText('HORIZON', 14, yh - 6);

    // Bearing scale along the top.
    ctx.strokeStyle = 'rgba(255, 180, 58, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let b = -20; b <= 20; b += 5) {
      const x = W / 2 + b * (W / HFOV);
      const tall = b % 10 === 0 ? 9 : 5;
      ctx.moveTo(x, 34);
      ctx.lineTo(x, 34 + tall);
    }
    ctx.moveTo(W / 2 - 20 * (W / HFOV), 34);
    ctx.lineTo(W / 2 + 20 * (W / HFOV), 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx, 30);
    ctx.lineTo(tx - 5, 22);
    ctx.lineTo(tx + 5, 22);
    ctx.closePath();
    ctx.fill();

    // Readouts: range is recovered from the measured gap with the report's formula.
    const measured = rangeForGap(gap);
    const sign = bearing < 0 ? '-' : '+';
    ctx.font = '19px VT323, monospace';
    const ry = 78;
    ctx.fillText(`BRG ${sign}${Math.abs(bearing).toFixed(1).padStart(4, '0')}°`, 18, ry);
    ctx.fillText(`GAP ${gap.toFixed(1)} PX`, 176, ry);
    ctx.fillText(`RNG ${pad(measured, 4)} M`, 340, ry);
    ctx.fillText('h 2.0 M', 528, ry);
  }
}
