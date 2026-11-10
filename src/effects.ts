/**
 * Visual juice that lives in the 3D scene: snow spray and bursts (one instanced mesh of
 * pooled chunks) and the groove the ball leaves in the snow.
 * Screen shake lives in camera.ts; floating text lives in ui.ts.
 */
import * as THREE from 'three';
import { CONFIG } from './config';
import { LAP_GROWTH, LAP_LENGTH, groundY, rebaseD } from './zones';
import type { ChaseStyle, Weather } from './worlds';
import type { Ball } from './ball';

/** A soft round dot, drawn in code, used for each snowflake. */
function makeFlakeTexture(): THREE.Texture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return new THREE.Texture();
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export class Effects {
  // --- particles (struct of arrays, ring-allocated)
  private n = CONFIG.MAX_PARTICLES;
  private mesh: THREE.InstancedMesh;
  private px = new Float32Array(this.n);
  private py = new Float32Array(this.n);
  private pz = new Float32Array(this.n);
  private vx = new Float32Array(this.n);
  private vy = new Float32Array(this.n);
  private vz = new Float32Array(this.n);
  private life = new Float32Array(this.n);
  private maxLife = new Float32Array(this.n);
  private size = new Float32Array(this.n);
  private grav = new Float32Array(this.n);
  /** Length multiplier along the direction of travel (1 = a chunk, 30 = a wind streak). */
  private stretch = new Float32Array(this.n);
  private cursor = 0;
  private sprayAcc = 0;
  private lineAcc = 0;
  private windAcc = 0;

  // --- trail ribbon
  private trail: THREE.Mesh;
  private trailPos: Float32Array;
  private sections = CONFIG.TRAIL_SECTIONS;
  private trailCount = 0;
  private lastX = 0;
  private lastD = 0;

  // --- avalanche
  private avalanche: THREE.InstancedMesh;
  private avalancheAcc = 0;

  // --- falling snow
  private snowfall: THREE.Points;
  private flakes: Float32Array;
  private flakeMaterial: THREE.PointsMaterial;
  private weather: Weather | null = { color: 0xffffff, size: 1, fall: 1.6, blow: 0 };
  /** How the thing chasing the ball moves (worlds.ts `chase.style`). */
  private chaseStyle: ChaseStyle = 'tumble';

  constructor(scene: THREE.Scene) {
    const chunk = new THREE.OctahedronGeometry(1, 0);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x6f7f95 });
    this.mesh = new THREE.InstancedMesh(chunk, material, this.n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    (this.mesh.instanceMatrix.array as Float32Array).fill(0);
    scene.add(this.mesh);

    const s = this.sections;
    this.trailPos = new Float32Array(s * 2 * 3);
    const g = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(this.trailPos, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', attr);
    const index: number[] = [];
    for (let i = 0; i < s - 1; i++) {
      const a = i * 2;
      // Sections run uphill → downhill; wind so the ribbon faces up.
      index.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
    g.setIndex(index);
    g.setDrawRange(0, 0);
    // Constant up-facing normals so the groove is lit, and shadowed, like the snow.
    const normals = new Float32Array(s * 2 * 3);
    const tilt = Math.hypot(1, CONFIG.SLOPE);
    for (let i = 0; i < s * 2; i++) {
      normals[i * 3 + 1] = 1 / tilt;
      normals[i * 3 + 2] = -CONFIG.SLOPE / tilt;
    }
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    this.trail = new THREE.Mesh(
      g,
      new THREE.MeshLambertMaterial({
        color: 0xb4c6e4,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    this.trail.receiveShadow = true;
    this.trail.frustumCulled = false;
    scene.add(this.trail);

    // The avalanche's boulders: one instanced mesh, positioned every frame.
    const lump = new THREE.IcosahedronGeometry(1, 1);
    this.avalanche = new THREE.InstancedMesh(lump, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x55617a, flatShading: true }), 54);
    this.avalanche.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    (this.avalanche.instanceMatrix.array as Float32Array).fill(0);
    this.avalanche.frustumCulled = false;
    this.avalanche.visible = false;
    scene.add(this.avalanche);

    // Falling snow: a small cloud of flakes kept in a box in front of the camera.
    const count = CONFIG.SNOWFALL;
    this.flakes = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.flakes[i * 3] = (Math.random() - 0.5) * 18;
      this.flakes[i * 3 + 1] = (Math.random() - 0.5) * 14;
      this.flakes[i * 3 + 2] = -1 - Math.random() * 24;
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(this.flakes, 3));
    this.flakeMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      map: makeFlakeTexture(),
      size: 0.1,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      fog: false,
    });
    this.snowfall = new THREE.Points(fg, this.flakeMaterial);
    this.snowfall.frustumCulled = false;
    this.snowfall.visible = count > 0;
    scene.add(this.snowfall);
  }

  /** Dress the chaser for the current world: its colours and how it moves. */
  setChaseColors(color: number, glow: number, style: ChaseStyle = 'tumble'): void {
    const m = this.avalanche.material as THREE.MeshLambertMaterial;
    m.color.setHex(color);
    m.emissive.setHex(glow);
    this.chaseStyle = style;
  }

  /**
   * The avalanche: a wall of tumbling snow boulders across the whole slope, with its
   * front edge at distance `frontD`. Pass `active = false` to hide it.
   */
  updateAvalanche(active: boolean, frontD: number, halfWidth: number, r: number, time: number, eyeD: number): void {
    this.avalanche.visible = active;
    if (!active) return;
    const m = this.avalanche.instanceMatrix.array as Float32Array;
    const n = this.avalanche.count;
    const style = this.chaseStyle;
    for (let i = 0; i < n; i++) {
      // Each lump has its own place in the wall and moves on its own rhythm.
      const u = (i / (n - 1)) * 2 - 1;
      const row = i % 3;
      const phase = i * 2.399;
      const bob = Math.abs(Math.sin(time * (2.2 + (i % 5) * 0.35) + phase));
      let s = r * (1.0 + ((i * 7) % 5) * 0.28);
      let x = u * halfWidth * 1.25 + Math.sin(time * 1.3 + phase) * r * 0.6;
      let d = frontD - row * r * 1.8 - s * 0.4 + Math.sin(time * 3 + phase) * r * 0.5;
      // Shape (as multiples of s) and height of its centre above the ground.
      let sx = 1;
      let sy = 0.8 + 0.25 * bob;
      let sz = 1;
      let lift = s * (0.35 + 0.6 * bob) + row * r * 0.5;
      if (style === 'flood') {
        // A rolling wave: wide flat swells that rise and fall together along the front.
        const swell = 0.5 + 0.5 * Math.sin(time * 2.4 + u * 5 - row * 1.1);
        sx = 2.0;
        sy = 0.5 + 0.35 * swell;
        sz = 1.5;
        lift = s * (0.2 + 0.3 * swell) + (2 - row) * r * 0.15;
        d = frontD - row * r * 1.5 - s * 0.5;
      } else if (style === 'cloud') {
        // A rolling bank: round puffs, higher towards the back, churning slowly. The front
        // row stays low so the camera can still see the ball over it.
        const churn = Math.sin(time * 0.9 + phase);
        s = r * (1.0 + ((i * 7) % 5) * 0.12);
        sx = 1.3;
        sy = 1 + 0.08 * churn;
        lift = s * (0.45 + row * 0.55) + churn * r * 0.15;
        d = frontD - row * r * 1.5 - s * 0.6 + churn * r * 0.3;
        x += churn * r * 0.5;
      } else if (style === 'swarm') {
        // Thin shapes hovering off the ground and darting about.
        // Small, so the camera still sees the ball between them.
        const dart = Math.sin(time * 4.2 + phase * 1.7);
        s = r * (0.6 + ((i * 7) % 5) * 0.06);
        sx = 0.6;
        sy = 1.4;
        sz = 0.6;
        lift = s * (1.0 + 0.8 * bob) + row * r * 0.5;
        x += dart * r * 1.1;
        d = frontD - row * r * 1.6 - s * 0.4 + Math.sin(time * 3.3 + phase) * r * 0.9;
      }
      // Anything level with or behind the camera is not drawn: it would fill the lens.
      if (d < eyeD + r * 2) s = 0;
      const o = i * 16;
      m[o] = s * sx;
      m[o + 5] = s * sy;
      m[o + 10] = s * sz;
      m[o + 12] = x;
      m[o + 13] = d * -CONFIG.SLOPE + lift;
      m[o + 14] = -d;
      m[o + 15] = 1;
    }
    this.avalanche.instanceMatrix.needsUpdate = true;
    // Spray thrown forward off the front.
    this.avalancheAcc += 0.5;
    while (this.avalancheAcc >= 1) {
      this.avalancheAcc -= 1;
      this.emit(
        (Math.random() * 2 - 1) * halfWidth,
        frontD * -CONFIG.SLOPE + r * (0.5 + Math.random() * 3),
        -frontD - r * Math.random() * 2,
        (Math.random() - 0.5) * r * 3,
        r * (2 + Math.random() * 5),
        -r * (9 + Math.random() * 8),
        r * (0.15 + Math.random() * 0.25),
        0.5 + Math.random() * 0.5,
        r * 14,
      );
    }
  }

  /**
   * Drift the flakes past the camera. Positions are in the camera's own space measured
   * in camera radii, so the snowfall looks the same at every ball size.
   * @param speed the ball's forward speed in m/s (flakes rush past faster at speed)
   * @param wind  sideways wind in ball radii per second (a crosswind blows the flakes across)
   */
  updateSnowfall(dt: number, camera: THREE.Camera, camR: number, speed: number, wind = 0): void {
    const weather = this.weather;
    this.snowfall.visible = CONFIG.SNOWFALL > 0 && weather !== null;
    if (!weather || !this.snowfall.visible) return;
    const f = this.flakes;
    const rush = (speed / camR) * 0.55 * dt;
    const fall = weather.fall * dt;
    const blow = (wind * 1.6 + weather.blow) * dt;
    for (let i = 0; i < f.length; i += 3) {
      f[i] += Math.sin(f[i + 1] * 1.7 + f[i + 2]) * 0.35 * dt + blow;
      if (f[i] > 9) f[i] -= 18;
      else if (f[i] < -9) f[i] += 18;
      f[i + 1] -= fall;
      f[i + 2] += rush;
      // Off the bottom (or, for things that rise, the top): come back in at the other side.
      const out = f[i + 1] < -7 || f[i + 1] > 7;
      if (f[i + 2] > -0.8 || out) {
        f[i] = (Math.random() - 0.5) * 18;
        f[i + 1] = out ? (f[i + 1] < 0 ? 7 : -7) : (Math.random() - 0.5) * 14;
        f[i + 2] = f[i + 2] > -0.8 ? -25 : f[i + 2];
      }
    }
    this.snowfall.geometry.getAttribute('position').needsUpdate = true;
    this.snowfall.position.copy(camera.position);
    this.snowfall.quaternion.copy(camera.quaternion);
    this.snowfall.scale.setScalar(camR);
    this.flakeMaterial.size = 0.085 * camR * weather.size;
  }

  /** What drifts through the air in this world (snow, sand, bubbles...), or null for nothing. */
  setWeather(weather: Weather | null): void {
    this.weather = weather;
    if (weather) this.flakeMaterial.color.setHex(weather.color);
  }

  /** Shrink by one lap along with the rest of the world (see REBASE_LAP in zones.ts). */
  rebase(): void {
    const k = 1 / LAP_GROWTH;
    // World space is (x, height, -d): a point moves by this much, then scales by k.
    const offY = LAP_LENGTH * CONFIG.SLOPE;
    const offZ = LAP_LENGTH;
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      this.px[i] *= k;
      this.py[i] = (this.py[i] + offY) * k;
      this.pz[i] = (this.pz[i] + offZ) * k;
      this.vx[i] *= k;
      this.vy[i] *= k;
      this.vz[i] *= k;
      this.size[i] *= k;
      this.grav[i] *= k;
    }
    const P = this.trailPos;
    for (let i = 0; i < P.length; i += 3) {
      P[i] *= k;
      P[i + 1] = (P[i + 1] + offY) * k;
      P[i + 2] = (P[i + 2] + offZ) * k;
    }
    this.trail.geometry.getAttribute('position').needsUpdate = true;
    this.lastX *= k;
    this.lastD = rebaseD(this.lastD);
  }

  reset(): void {
    this.life.fill(0);
    (this.mesh.instanceMatrix.array as Float32Array).fill(0);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.trailCount = 0;
    this.trail.geometry.setDrawRange(0, 0);
    this.sprayAcc = 0;
    this.lineAcc = 0;
    this.avalanche.visible = false;
  }

  private emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, life: number, grav: number): void {
    const i = this.cursor;
    this.cursor = (i + 1) % this.n;
    this.px[i] = x;
    this.py[i] = y;
    this.pz[i] = z;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.vz[i] = vz;
    this.size[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.grav[i] = grav;
    this.stretch[i] = 1;
  }

  /**
   * Wind streaks: thin slivers hanging in the air ahead that the ball rushes past.
   * They are the cheapest strong cue for speed.
   */
  private updateSpeedLines(dt: number, ball: Ball): void {
    if (!ball.mesh.visible || CONFIG.SPEED_LINE_RATE <= 0) return;
    const frac = ball.speed / ball.cruiseSpeed();
    if (frac < 0.5) return;
    this.lineAcc += CONFIG.SPEED_LINE_RATE * frac * dt;
    const r = ball.r;
    while (this.lineAcc >= 1) {
      this.lineAcc -= 1;
      const d = ball.d + r * (38 + Math.random() * 30);
      const i = this.cursor;
      this.emit(
        ball.x + (Math.random() - 0.5) * r * 24,
        groundY(d) + r * (0.5 + Math.random() * 6.5),
        -d,
        0,
        0,
        0,
        r * (0.025 + Math.random() * 0.02),
        (r * 80) / Math.max(1, ball.speed),
        0,
      );
      this.stretch[i] = 28 + Math.random() * 22;
    }
  }

  /** Crosswind: flecks of snow blowing across the slope, so you can see which way it pushes. */
  private updateWind(dt: number, ball: Ball): void {
    if (ball.wind === 0 || !ball.mesh.visible || !ball.rolling) return;
    const r = ball.r;
    this.windAcc += 12 * Math.abs(ball.wind) * dt;
    while (this.windAcc >= 1) {
      this.windAcc -= 1;
      const d = ball.d + r * (-3 + Math.random() * 34);
      this.emit(
        ball.x + (Math.random() - 0.5) * r * 30,
        groundY(d) + r * (0.3 + Math.random() * 5),
        -d,
        ball.wind * r * 4.5,
        0,
        -ball.speed * 0.55,
        r * (0.04 + Math.random() * 0.05),
        0.5 + Math.random() * 0.5,
        0,
      );
    }
  }

  /** A puff of snow chunks. `scale` is the size of whatever caused it (m). */
  burst(x: number, y: number, z: number, scale: number, count: number, power = 1, forward = 0): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const up = 0.35 + Math.random() * 0.65;
      const out = Math.sqrt(1 - up * up * 0.6) * (0.5 + Math.random() * 0.7);
      const sp = scale * power * (3 + Math.random() * 5);
      this.emit(
        x + Math.cos(a) * scale * 0.4,
        y + Math.random() * scale * 0.4,
        z + Math.sin(a) * scale * 0.4,
        Math.cos(a) * out * sp,
        up * sp * 1.1,
        Math.sin(a) * out * sp - forward,
        scale * (0.07 + Math.random() * 0.13),
        0.5 + Math.random() * 0.55,
        scale * 16,
      );
    }
  }

  update(dt: number, ball: Ball): void {
    this.updateSpray(dt, ball);
    this.updateSpeedLines(dt, ball);
    this.updateWind(dt, ball);
    this.updateParticles(dt);
    this.updateTrail(ball);
  }

  /** Rooster tails thrown up from both sides of the contact patch. */
  private updateSpray(dt: number, ball: Ball): void {
    if (!ball.mesh.visible || ball.speed <= 0.01 || ball.airborne) return;
    const r = ball.r;
    const frac = Math.min(1.2, ball.speed / ball.cruiseSpeed());
    this.sprayAcc += CONFIG.SPRAY_RATE * frac * dt;
    const ground = groundY(ball.d);
    while (this.sprayAcc >= 1) {
      this.sprayAcc -= 1;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.emit(
        ball.x + side * r * (0.35 + Math.random() * 0.35),
        ground + r * 0.08,
        -ball.d + r * (0.1 + Math.random() * 0.5),
        side * r * (1.2 + Math.random() * 2.6) - ball.vx * 0.4,
        r * (2.5 + Math.random() * 4.5),
        -ball.speed * (0.25 + Math.random() * 0.25),
        r * (0.05 + Math.random() * 0.1),
        0.4 + Math.random() * 0.45,
        r * 17,
      );
    }
  }

  private updateParticles(dt: number): void {
    const m = this.mesh.instanceMatrix.array as Float32Array;
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      const o = i * 16;
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        m[o] = m[o + 5] = m[o + 10] = 0;
        continue;
      }
      this.vy[i] -= this.grav[i] * dt;
      this.px[i] += this.vx[i] * dt;
      this.py[i] += this.vy[i] * dt;
      this.pz[i] += this.vz[i] * dt;
      const floor = this.pz[i] * CONFIG.SLOPE; // ground height at this particle (z = -d)
      if (this.py[i] < floor) {
        this.py[i] = floor;
        this.vy[i] *= -0.25;
        this.vx[i] *= 0.6;
        this.vz[i] *= 0.6;
      }
      const streak = this.stretch[i] > 1;
      const s = streak ? this.size[i] : this.size[i] * Math.sqrt(this.life[i] / this.maxLife[i]);
      m[o] = s;
      m[o + 5] = s;
      m[o + 10] = s * this.stretch[i];
      m[o + 12] = this.px[i];
      m[o + 13] = this.py[i];
      m[o + 14] = this.pz[i];
      m[o + 15] = 1;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** A pressed-down ribbon behind the ball: the newest section rides under the ball. */
  private updateTrail(ball: Ball): void {
    // No groove while the ball is in the air: the trail simply waits where it took off.
    if (!ball.mesh.visible || ball.airborne) return;
    const P = this.trailPos;
    const s = this.sections;
    const step = CONFIG.TRAIL_STEP_K * ball.r;
    const moved = Math.hypot(ball.x - this.lastX, ball.d - this.lastD);
    if (this.trailCount === 0 || moved > step) {
      // Shift everything one section towards the tail and open a new head.
      P.copyWithin(0, 6);
      this.trailCount = Math.min(s, this.trailCount + 1);
      this.lastX = ball.x;
      this.lastD = ball.d;
    }
    const w = CONFIG.TRAIL_HALF_WIDTH_K * ball.r;
    const y = groundY(ball.d) + ball.r * 0.012;
    const h = (s - 1) * 6;
    P[h] = ball.x - w;
    P[h + 1] = y;
    P[h + 2] = -ball.d;
    P[h + 3] = ball.x + w;
    P[h + 4] = y;
    P[h + 5] = -ball.d;
    const g = this.trail.geometry;
    g.getAttribute('position').needsUpdate = true;
    const quads = Math.max(0, this.trailCount - 1);
    g.setDrawRange((s - 1 - quads) * 6, quads * 6);
  }
}
