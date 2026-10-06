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
// length L and height Ht whose waterline centre sits at (x, y), pitched by `pitch`
// degrees. Warm stern, cooler bow, cold glass, bow wave, wake and reflection; bright enough
// to stand out clearly from the water.
function drawVessel(ctx, x, y, L, Ht, pitch) {
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
  ctx.rotate(pitch / DEG);

  // Hull: transom stern, sheer rising to a raked bow, warm aft and cooler forward.
  const hull = ctx.createLinearGradient(-L * 0.5, 0, L * 0.5, 0);
  hull.addColorStop(0, '#fbfbfb');
  hull.addColorStop(0.55, '#e4e4e4');
  hull.addColorStop(1, '#cdcdcd');
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
  ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
  ctx.beginPath();
  ctx.moveTo(...P(-0.47, 0));
  ctx.lineTo(...P(-0.48, -0.06));
  ctx.lineTo(...P(0.41, -0.06));
  ctx.lineTo(...P(0.38, 0));
  ctx.closePath();
  ctx.fill();

  // Wheelhouse with a raked front, cold dark windows, and a flybridge top.
  ctx.fillStyle = '#f0f0f0';
  ctx.beginPath();
  ctx.moveTo(...P(-0.14, -0.31));
  ctx.lineTo(...P(-0.14, -0.64));
  ctx.lineTo(...P(0.1, -0.66));
  ctx.lineTo(...P(0.2, -0.33));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(...P(-0.1, -0.5));
  ctx.lineTo(...P(-0.1, -0.59));
  ctx.lineTo(...P(0.1, -0.6));
  ctx.lineTo(...P(0.15, -0.49));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f0f0f0';
  for (const nx of [-0.04, 0.03]) ctx.fillRect(...P(nx, -0.6), L * 0.012, Ht * 0.11);
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(...P(-0.17, -0.7), L * 0.3, Ht * 0.05);

  // Mast, radar bar and whip antennas.
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = Math.max(0.6, Ht * 0.03);
  ctx.beginPath();
  ctx.moveTo(...P(-0.02, -0.7));
  ctx.lineTo(...P(-0.02, -0.96));
  ctx.moveTo(...P(-0.09, -0.86));
  ctx.lineTo(...P(0.06, -0.86));
  ctx.moveTo(...P(-0.08, -0.7));
  ctx.lineTo(...P(-0.1, -1));
  ctx.stroke();
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(...P(-0.07, -0.91), L * 0.12, Ht * 0.035);

  ctx.restore();
}


// Outline points of the vessel (hull, superstructure, mast and antenna tips), in
// the same normalised units, used to fit the tracking box to its outer bounds.
const OUTLINE = [
  [-0.47, 0], [-0.5, -0.3], [0.42, -0.38], [0.5, -0.43], [0.38, 0],
  [-0.17, -0.7], [0.13, -0.7], [-0.09, -0.86], [0.06, -0.86], [-0.02, -0.96], [-0.1, -1],
];

function vesselBounds(x, y, L, Ht, pitch) {
  const a = pitch / DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [nx, ny] of OUTLINE) {
    const px = nx * L;
    const py = ny * Ht;
    const rx = x + px * c - py * s;
    const ry = y + px * s + py * c;
    x0 = Math.min(x0, rx); x1 = Math.max(x1, rx);
    y0 = Math.min(y0, ry); y1 = Math.max(y1, ry);
  }
  return { x0, y0, x1, y1 };
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
    sea.addColorStop(0, '#303030');
    sea.addColorStop(1, '#565656');
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

    // The target: an 18 m workboat standing 6.5 m above the water, sized from its range.
    const tx = W / 2 + bearing * (W / HFOV);
    const tw = Math.atan(18 / range) * DEG * (W / HFOV);
    const th = Math.atan(6.5 / range) * DEG * PX_PER_DEG;
    const yw = yh + gap;
    const pitch = Math.sin(t * 1.3) * 1.2;
    drawVessel(ctx, tx, yw, tw, th, pitch);

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

    // Track box fitted to the vessel's outer bounds (hull to antenna tip), 1 px clear.
    const vb = vesselBounds(tx, yw, tw, th, pitch);
    const bx = vb.x0 - 1.5;
    const by = vb.y0 - 1.5;
    const bw = vb.x1 - vb.x0 + 3;
    const bh = vb.y1 - vb.y0 + 3;
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
