// Fish banks drawn as amber water drops, fading toward the tail, over the sonar's water field.
// Several loose, slow-drifting schools: each fish wanders gently on its own heading
// and pace, a slow current moves them about, rare startles loosen part of a bank,
// ripples cross the banks, and the pointer pushes fish aside and drags them along.

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
    this.turn = new Float32Array(max);
    this.wa = new Float32Array(max);
    this.sf = new Float32Array(max);
    this.g = new Uint8Array(max);
    this.alive = new Uint8Array(max);
    this.next = new Int32Array(max);
    this.shape = null;
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
    this.startle = { x: 0, y: 0, t: -1e4, at: 2 };
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
      this.vx[i] = -this.side * (0.8 + Math.random() * 0.5) * s * z;
      this.vy[i] = (Math.random() - 0.5) * s;
      this.z[i] = z;
      this.ph[i] = Math.random() * TAU;
      this.fl[i] = 0;
      this.ang[i] = Math.atan2(this.vy[i], this.vx[i]);
      this.wa[i] = Math.random() * TAU;
      this.sf[i] = 0.8 + Math.random() * 0.45;
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
      wave.x += wave.dir * 5 * s * f;
      if (wave.x < -50 * s || wave.x > w + 50 * s) {
        wave.x = -1e4;
        wave.at = this.t + 6 + Math.random() * 4;
      }
    }

    // Startle: every few seconds an unseen threat scatters part of a bank.
    const st = this.startle;
    if (this.present && this.t > st.at) {
      st.x = w * (zn.x0 + Math.random() * (zn.x1 - zn.x0));
      st.y = h * (zn.y0 + Math.random() * (zn.y1 - zn.y0));
      st.t = this.t;
      st.at = this.t + 6 + Math.random() * 5;
    }
    const stAge = this.t - st.t;
    const stR = (80 + stAge * 150) * s;
    const stOn = stAge < 0.8;

    const pred = this.pred;
    pred.vx *= Math.pow(0.86, f);
    pred.vy *= Math.pow(0.86, f);

    const sepR = 30 * s;
    const viewR = 46 * s;
    const sepR2 = sepR * sepR;
    const viewR2 = viewR * viewR;
    const pushR = 170 * s;
    const margin = Math.min(w, h) * 0.08;
    const maxV = 1.5 * s;
    const minV = 0.6 * s;

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

      let ax = sx * 0.55 * s;
      let ay = sy * 0.55 * s;
      if (n) {
        ax += (avx / n - vx[i]) * 0.03 + (cx / n - xi) * 0.0003;
        ay += (avy / n - vy[i]) * 0.03 + (cy / n - yi) * 0.0003;
      }

      // Each fish's own restless wander, plus a slowly shifting current.
      this.wa[i] += (Math.random() - 0.5) * 0.3 * f;
      ax += Math.cos(this.wa[i]) * 0.045 * s;
      ay += Math.sin(this.wa[i]) * 0.045 * s;
      ax += Math.sin(yi / (90 * s) + this.t * 0.3) * 0.025 * s;
      ay += Math.cos(xi / (110 * s) - this.t * 0.25) * 0.025 * s;

      if (this.present) {
        const b = this.bank[gi];
        ax += (b.ax - xi) * this.pull;
        ay += (b.ay - yi) * this.pull;
        // Soft floor and ceiling: a force that ramps up smoothly past the band's edge
        // (no on/off threshold for fish to flicker against).
        const below = (yi - (zn.y1 + 0.02) * h) / (0.12 * h);
        const above = ((zn.y0 - 0.02) * h - yi) / (0.12 * h);
        if (below > 0) ay -= Math.min(1, below) * 0.07 * s;
        if (above > 0) ay += Math.min(1, above) * 0.07 * s;
        // Stay out from under the text panels.
        if (av && xi > av[0] * w && xi < av[1] * w) {
          // Ease out of the text-panel band, strongest at its middle, zero at its edges.
          const mid = ((av[0] + av[1]) / 2) * w;
          const half = ((av[1] - av[0]) / 2) * w;
          const depth = 1 - Math.abs(xi - mid) / half;
          ax += Math.sign(zoneMid - xi) * (0.03 + 0.07 * depth) * s;
        }
        const turn = 0.06 * s;
        if (xi < margin) ax += turn * (1 - xi / margin);
        if (xi > w - margin) ax -= turn * (1 - (w - xi) / margin);
        if (yi < margin) ay += turn * (1 - yi / margin);
        if (yi > h - margin) ay -= turn * (1 - (h - yi) / margin);
      } else {
        ax += this.exitDir * 0.05 * s;
        if (yi < margin) ay += 0.05 * s;
        if (yi > h - margin) ay -= 0.05 * s;
      }

      let boost = 1;
      if (pred.on) {
        const dx = xi - pred.x;
        const dy = yi - pred.y;
        const d = Math.hypot(dx, dy);
        if (d < pushR && d > 0.001) {
          // The pointer pushes fish away and drags them along its path.
          const k = (1 - d / pushR) * (1 - d / pushR);
          ax += (dx / d) * k * 0.8 * s + pred.vx * k * 0.08;
          ay += (dy / d) * k * 0.8 * s + pred.vy * k * 0.08;
          boost = 1 + k * 0.6;
          this.fl[i] = Math.min(1, this.fl[i] + k * 0.2);
        }
      }

      if (stOn) {
        const dx = xi - st.x;
        const dy = yi - st.y;
        const d = Math.hypot(dx, dy);
        if (d < stR && d > 0.001) {
          const k = 1 - d / stR;
          ax += (dx / d) * k * 0.7 * s;
          ay += (dy / d) * k * 0.7 * s;
          boost = Math.max(boost, 1 + k * 0.6);
          this.fl[i] = Math.min(1, this.fl[i] + k * 0.2);
        }
      }

      if (wave.x > -1e3 && Math.abs(xi - wave.x) < 26 * s) {
        boost = Math.max(boost, 1.2);
        this.fl[i] = Math.min(1, this.fl[i] + 0.15);
      }


      vx[i] += ax * f;
      vy[i] += ay * f;
      const sp = Math.hypot(vx[i], vy[i]) || 1;
      const pace = this.bank[gi].pace * this.sf[i];
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
      // Flash on sustained turns only: a smoothed turn rate, so small heading jitter never flickers.
      this.turn[i] += (Math.abs(da) - this.turn[i]) * Math.min(1, 0.15 * f);
      this.fl[i] = Math.min(1, this.fl[i] * Math.pow(0.93, f) + Math.max(0, this.turn[i] - 0.02) * 2);
      this.ph[i] += (0.2 + (sp * 0.09) / s) * f;

      if (!this.present && (x[i] < -90 * s || x[i] > w + 90 * s || y[i] < -90 * s || y[i] > h + 90 * s)) {
        alive[i] = 0;
        this.count--;
      }
    }
  }

  // One shared water-drop shape in local units: a round head of radius 1 at the
  // origin, tapering to a point 5.6 radii behind it. The gradient fades it linearly
  // from the back of the round head to the tail tip.
  drop() {
    if (this.shape) return this.shape;
    const T = 5.6;
    const path = new Path2D();
    path.moveTo(0, -1);
    path.arc(0, 0, 1, -Math.PI / 2, Math.PI / 2);
    path.quadraticCurveTo(-T * 0.35, 1, -T, 0);
    path.quadraticCurveTo(-T * 0.35, -1, 0, -1);
    path.closePath();
    const fade = (rgb) => {
      const g = this.ctx.createLinearGradient(0, 0, -T, 0);
      g.addColorStop(0, `rgba(${rgb}, 1)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      return g;
    };
    this.shape = { path, amber: fade('255, 180, 58'), flash: fade('255, 244, 222') };
    return this.shape;
  }

  draw() {
    const { ctx, w, h, s } = this;
    const { path, amber, flash } = this.drop();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < this.max; i++) {
      if (!this.alive[i]) continue;
      const zi = this.z[i];
      const fl = this.fl[i];
      const r = (1.5 + 1.2 * zi) * this.bank[this.g[i]].size * s;
      const speed = Math.hypot(this.vx[i], this.vy[i]) / s;
      // Faster fish stretch a little, like a drop elongating.
      const sx = r * (0.9 + 0.12 * speed);
      const c = Math.cos(this.ang[i]);
      const sn = Math.sin(this.ang[i]);
      const alpha = 0.5 + 0.45 * zi;
      ctx.setTransform(c * sx, sn * sx, -sn * r, c * r, this.x[i], this.y[i]);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = amber;
      ctx.fill(path);
      if (fl > 0.05) {
        ctx.globalAlpha = alpha * fl * 0.85;
        ctx.fillStyle = flash;
        ctx.fill(path);
      }
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
