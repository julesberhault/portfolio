// Fish banks drawn as amber vector strokes with long afterglow on a sonar screen.
// Several loose schools, each flocking only with its own kind: wide spacing,
// light cohesion, flashes on turns, ripples crossing the banks, and a pointer
// that pushes them aside and drags them along its path.

const TAU = Math.PI * 2;

export class School {
  constructor(canvas, { max = 600, groups = 5, reduced = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.max = max;
    this.groups = groups;
    this.reduced = reduced;
    this.x = new Float32Array(max);
    this.y = new Float32Array(max);
    this.vx = new Float32Array(max);
    this.vy = new Float32Array(max);
    this.z = new Float32Array(max);
    this.ph = new Float32Array(max);
    this.fl = new Float32Array(max);
    this.ang = new Float32Array(max);
    this.g = new Uint8Array(max);
    this.alive = new Uint8Array(max);
    this.next = new Int32Array(max);
    // Each bank has its own size, pace and wandering path.
    this.bank = Array.from({ length: groups }, (_, k) => ({
      size: 0.8 + ((k * 0.37) % 0.55),
      pace: 0.85 + ((k * 0.23) % 0.35),
      phx: k * 1.9 + 0.4,
      phy: k * 2.7 + 1.1,
      ax: 0,
      ay: 0,
    }));
    this.count = 0;
    this.present = false;
    this.side = -1;
    this.exitDir = 1;
    this.pred = { x: 0, y: 0, vx: 0, vy: 0, on: false };
    this.wave = { x: -1e4, dir: 1, at: 3 };
    this.t = 0;
    this.zone = { x0: 0.08, x1: 0.92, y0: 0.18, y1: 0.82 };
    this.avoid = null;
    this.pull = 0.0009;
    this.w = 1;
    this.h = 1;
    this.s = 1;
  }

  resize(w, h, s) {
    this.canvas.width = Math.max(1, Math.round(w));
    this.canvas.height = Math.max(1, Math.round(h));
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.s = s;
    this.cell = 46 * s;
    this.cols = Math.ceil(this.w / this.cell) + 2;
    this.rows = Math.ceil(this.h / this.cell) + 2;
    this.head = new Int32Array(this.cols * this.rows);
  }

  setPresent(on) {
    if (on === this.present) return;
    this.present = on;
    if (on) {
      const mid = (this.zone.x0 + this.zone.x1) / 2;
      this.side = Math.abs(mid - 0.5) < 0.1 ? (Math.random() < 0.5 ? -1 : 1) : mid < 0.5 ? -1 : 1;
    } else this.exitDir = this.side;
  }

  spawn(k) {
    const { s, zone } = this;
    for (let i = 0; i < this.max && k > 0; i++) {
      if (this.alive[i]) continue;
      const z = 0.5 + Math.random() * 0.5;
      const g = i % this.groups;
      this.alive[i] = 1;
      this.g[i] = g;
      this.x[i] = this.side < 0 ? -30 * s - Math.random() * 160 * s : this.w + 30 * s + Math.random() * 160 * s;
      this.y[i] = this.h * (zone.y0 + (zone.y1 - zone.y0) * ((g + 0.2 + Math.random() * 0.6) / this.groups));
      this.vx[i] = -this.side * (1.5 + Math.random()) * s * z;
      this.vy[i] = (Math.random() - 0.5) * s;
      this.z[i] = z;
      this.ph[i] = Math.random() * TAU;
      this.fl[i] = 0;
      this.ang[i] = Math.atan2(this.vy[i], this.vx[i]);
      this.count++;
      k--;
    }
  }

  settle(steps = 420) {
    this.setPresent(true);
    for (let i = 0; i < steps; i++) this.step(1 / 60);
  }

  step(dt) {
    const f = Math.min(dt * 60, 2.5);
    const { w, h, s, cell, cols, rows, head, next, x, y, vx, vy, z, g, alive } = this;
    this.t += dt;

    if (this.present && this.count < this.max) this.spawn(this.reduced ? this.max : 12);

    head.fill(-1);
    for (let i = 0; i < this.max; i++) {
      if (!alive[i]) continue;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(x[i] / cell) + 1));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(y[i] / cell) + 1));
      const c = cy * cols + cx;
      next[i] = head[c];
      head[c] = i;
    }

    // Every bank wanders its own slow path through the open water.
    const zn = this.zone;
    for (const b of this.bank) {
      b.ax = w * (zn.x0 + (zn.x1 - zn.x0) * (0.5 + 0.44 * Math.sin(this.t * 0.09 * b.pace + b.phx)));
      b.ay = h * (zn.y0 + (zn.y1 - zn.y0) * (0.5 + 0.44 * Math.sin(this.t * 0.13 * b.pace + b.phy)));
    }
    const zoneMid = w * (zn.x0 + zn.x1) / 2;
    const av = this.avoid;

    // A ripple of agitation that crosses the banks now and then.
    const wave = this.wave;
    if (this.t > wave.at && wave.x < -1e3) {
      wave.dir = Math.random() < 0.5 ? -1 : 1;
      wave.x = wave.dir > 0 ? 0 : w;
    }
    if (wave.x > -1e3) {
      wave.x += wave.dir * 9 * s * f;
      if (wave.x < -50 * s || wave.x > w + 50 * s) {
        wave.x = -1e4;
        wave.at = this.t + 4 + Math.random() * 4;
      }
    }

    const pred = this.pred;
    pred.vx *= Math.pow(0.86, f);
    pred.vy *= Math.pow(0.86, f);

    const sepR = 30 * s;
    const viewR = 46 * s;
    const sepR2 = sepR * sepR;
    const viewR2 = viewR * viewR;
    const pushR = 170 * s;
    const margin = Math.min(w, h) * 0.08;
    const maxV = 2.6 * s;
    const minV = 1.0 * s;

    for (let i = 0; i < this.max; i++) {
      if (!alive[i]) continue;
      const xi = x[i];
      const yi = y[i];
      const gi = g[i];
      let sx = 0, sy = 0, avx = 0, avy = 0, cx = 0, cy = 0, n = 0;
      const gx = Math.min(cols - 1, Math.max(0, Math.floor(xi / cell) + 1));
      const gy = Math.min(rows - 1, Math.max(0, Math.floor(yi / cell) + 1));
      for (let oy = -1; oy <= 1; oy++) {
        const ry = gy + oy;
        if (ry < 0 || ry >= rows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const rx = gx + ox;
          if (rx < 0 || rx >= cols) continue;
          for (let j = head[ry * cols + rx]; j !== -1; j = next[j]) {
            if (j === i) continue;
            const dx = xi - x[j];
            const dy = yi - y[j];
            const d2 = dx * dx + dy * dy;
            if (d2 > viewR2) continue;
            if (d2 < sepR2 && d2 > 0.0001) {
              const d = Math.sqrt(d2);
              const k = (1 - d / sepR) / d;
              sx += dx * k;
              sy += dy * k;
            }
            if (g[j] !== gi) continue;
            avx += vx[j];
            avy += vy[j];
            cx += x[j];
            cy += y[j];
            n++;
          }
        }
      }

      let ax = sx * 0.85 * s;
      let ay = sy * 0.85 * s;
      if (n) {
        ax += (avx / n - vx[i]) * 0.04 + (cx / n - xi) * 0.0004;
        ay += (avy / n - vy[i]) * 0.04 + (cy / n - yi) * 0.0004;
      }

      if (this.present) {
        const b = this.bank[gi];
        ax += (b.ax - xi) * this.pull;
        ay += (b.ay - yi) * this.pull;
        if (yi > (zn.y1 + 0.06) * h) ay -= 0.12 * s;
        if (yi < (zn.y0 - 0.04) * h) ay += 0.12 * s;
        // Stay out from under the text panels.
        if (av && xi > av[0] * w && xi < av[1] * w) ax += Math.sign(zoneMid - xi) * 0.16 * s;
        const turn = 0.12 * s;
        if (xi < margin) ax += turn * (1 - xi / margin);
        if (xi > w - margin) ax -= turn * (1 - (w - xi) / margin);
        if (yi < margin) ay += turn * (1 - yi / margin);
        if (yi > h - margin) ay -= turn * (1 - (h - yi) / margin);
      } else {
        ax += this.exitDir * 0.09 * s;
        if (yi < margin) ay += 0.08 * s;
        if (yi > h - margin) ay -= 0.08 * s;
      }

      let boost = 1;
      if (pred.on) {
        const dx = xi - pred.x;
        const dy = yi - pred.y;
        const d = Math.hypot(dx, dy);
        if (d < pushR && d > 0.001) {
          // The pointer pushes fish away and drags them along its path.
          const k = (1 - d / pushR) * (1 - d / pushR);
          ax += (dx / d) * k * 1.5 * s + pred.vx * k * 0.14;
          ay += (dy / d) * k * 1.5 * s + pred.vy * k * 0.14;
          boost = 1 + k * 1.2;
          this.fl[i] = Math.min(1, this.fl[i] + k * 0.35);
        }
      }

      if (wave.x > -1e3 && Math.abs(xi - wave.x) < 26 * s) {
        boost = Math.max(boost, 1.5);
        this.fl[i] = Math.min(1, this.fl[i] + 0.3);
      }

      ax += (Math.random() - 0.5) * 0.06 * s;
      ay += (Math.random() - 0.5) * 0.06 * s;

      vx[i] += ax * f;
      vy[i] += ay * f;
      const sp = Math.hypot(vx[i], vy[i]) || 1;
      const pace = this.bank[gi].pace;
      const lim = maxV * pace * (0.7 + 0.3 * z[i]) * boost;
      const low = minV * pace * (0.7 + 0.3 * z[i]);
      const k = sp > lim ? lim / sp : sp < low ? low / sp : 1;
      vx[i] *= k;
      vy[i] *= k;
      x[i] += vx[i] * f;
      y[i] += vy[i] * f;

      const a = Math.atan2(vy[i], vx[i]);
      let da = a - this.ang[i];
      if (da > Math.PI) da -= TAU;
      if (da < -Math.PI) da += TAU;
      this.ang[i] = a;
      this.fl[i] = Math.min(1, this.fl[i] * Math.pow(0.9, f) + Math.abs(da) * 2.4);
      this.ph[i] += (0.2 + (sp * 0.09) / s) * f;

      if (!this.present && (x[i] < -90 * s || x[i] > w + 90 * s || y[i] < -90 * s || y[i] > h + 90 * s)) {
        alive[i] = 0;
        this.count--;
      }
    }
  }

  draw() {
    const { ctx, w, h, s } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.reduced) {
      ctx.clearRect(0, 0, w, h);
    } else {
      // Long phosphor afterglow: every fish drags a fading trace behind it.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < this.max; i++) {
      if (!this.alive[i]) continue;
      const zi = this.z[i];
      const fl = this.fl[i];
      const size = this.bank[this.g[i]].size;
      const L = (9 + 9 * zi) * size * s;
      const W = L * 0.28;
      const wag = Math.sin(this.ph[i]);
      const tb = wag * W * 0.45;
      const bend = wag * W * 0.5;
      const c = Math.cos(this.ang[i]);
      const sn = Math.sin(this.ang[i]);
      const gr = Math.round(176 + 70 * fl);
      const bl = Math.round(58 + 170 * fl);
      const alpha = 0.38 + 0.55 * zi;
      ctx.setTransform(c, sn, -sn, c, this.x[i], this.y[i]);

      // Vector glyph: one tapering body stroke and a bright eye.
      ctx.lineWidth = (0.9 + 0.9 * zi) * s;
      ctx.strokeStyle = `rgba(255, ${gr}, ${bl}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(L * 0.5, 0);
      ctx.quadraticCurveTo(0, -bend, -L * 0.5, tb);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, ${Math.min(255, gr + 30)}, ${Math.min(255, bl + 60)}, ${Math.min(1, alpha + 0.2)})`;
      ctx.beginPath();
      ctx.arc(L * 0.42, 0, (0.9 + 0.8 * zi) * s, 0, TAU);
      ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
