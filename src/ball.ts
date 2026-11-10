/**
 * The player's snowball: steering, rolling, growth, the pop spring, and the objects
 * stuck to its surface.
 */
import * as THREE from 'three';
import { CONFIG, SKINS, ZONES, type SkinDef } from './config';
import { paintSkin, skinSwatch } from './skins';
import { LAP_GROWTH, designRadius, groundY, laneHalfWidth, locate, rebaseD, twistAt } from './zones';
import { worldForLap } from './worlds';
import { PERKS } from './perks';
import { clamp, damp, hash2 } from './util';
import type { InstancePool } from './instances';
import type { WorldObject } from './world';

interface Stuck {
  pool: InstancePool;
  slot: number;
  /** Position of the object's base in the ball's own (rotating) frame, metres. */
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  size: number;
  /** Distance of the base from the ball's centre. */
  dist: number;
  age: number;
}

const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _twist = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _ballM = new THREE.Matrix4();
const _color = new THREE.Color();

function buildSnowballGeometry(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const pos = g.getAttribute('position');
  // Lumpy: nudge each corner in or out. Keyed on position so shared corners stay welded.
  for (let i = 0; i < pos.count; i++) {
    _v.fromBufferAttribute(pos, i);
    const k = hash2(Math.round(_v.x * 50) + Math.round(_v.y * 50) * 13.7, Math.round(_v.z * 50));
    _v.multiplyScalar(0.965 + k * 0.07);
    pos.setXYZ(i, _v.x, _v.y, _v.z);
  }
  g.computeVertexNormals();
  // Each facet gets its own shade so the roll is readable; the skin paints them (skins.ts).
  return g;
}

/**
 * A rounder ball with many small facets, for skins with a pattern (stripes, patches): on
 * the snowball's big facets a pattern comes out too blocky to recognise.
 */
function buildPatternGeometry(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 7);
  g.computeVertexNormals();
  return g;
}

export class Ball {
  /** World-space centre of the ball. */
  readonly position = new THREE.Vector3();
  readonly mesh: THREE.Mesh;
  private shadow: THREE.Mesh;
  private material: THREE.MeshPhongMaterial;
  /** The glow the current skin gives off by itself [r, g, b], and the shop pictures made so far. */
  private skinGlow: [number, number, number] = [0, 0, 0];
  private swatches = new Map<string, string>();
  /** The lumpy snowball shape, and the finer one patterned skins use (made when first needed). */
  private lumpy = buildSnowballGeometry();
  private fine: THREE.BufferGeometry | null = null;
  private stuck: Stuck[] = [];
  private freeStuck: Stuck[] = [];
  private blobShadow = true;

  /** Sideways position (m) and distance rolled downhill (m). */
  x = 0;
  d = 0;
  /** Radius (m). */
  r = CONFIG.START_RADIUS;
  /** Forward and sideways velocity (m/s). */
  speed = 0;
  vx = 0;
  /** Where steering wants the ball to be. */
  targetX = 0;
  /** Sideways shove from a collision (m/s), decays quickly. */
  knock = 0;
  /** Seconds of invulnerability left. */
  invuln = 0;
  /** Pop scale-bounce multiplier. */
  pop = 1;
  popVel = 0;
  /** False while parked on the title screen or after the run. */
  rolling = false;
  /** Height above the snow (m) and vertical speed (m/s) while jumping. */
  h = 0;
  vh = 0;
  airborne = false;
  /** True if the current flight came off a ramp (those are scored on landing). */
  rampFlight = false;
  /** Set for one frame when the ball touches down; the game reads and clears it. */
  landed = false;
  /** Sideways speed at the moment of touchdown, as a fraction of max steering speed. */
  landingSlide = 0;
  private jumpCooldown = 0;
  /** Gravity for the current flight, in ball radii per second² (set at take-off). */
  private gravityK = CONFIG.JUMP_GRAVITY_K;
  /** Sideways wind on the ball right now, in ball radii per second (the game sets it). */
  wind = 0;
  /** True during a yeti rage: the ball breaks anything it touches instead of bouncing off. */
  smashing = false;
  /** Extra glow colour [r, g, b] while a secret object's power is running (the game sets it). */
  readonly glow: [number, number, number] = [0, 0, 0];

  constructor(scene: THREE.Scene) {
    // With no shine this lights exactly like a matte material; shiny skins turn it up.
    this.material = new THREE.MeshPhongMaterial({ vertexColors: true, specular: 0x000000 });
    this.mesh = new THREE.Mesh(this.lumpy, this.material);
    this.mesh.castShadow = true;
    this.setSkin(SKINS[0]);
    scene.add(this.mesh);

    const disc = new THREE.CircleGeometry(1, 20);
    disc.rotateX(-Math.PI / 2);
    const p = disc.getAttribute('position');
    for (let i = 0; i < p.count; i++) p.setY(i, p.getZ(i) * CONFIG.SLOPE);
    this.shadow = new THREE.Mesh(
      disc,
      new THREE.MeshBasicMaterial({
        color: 0x9fb4d4,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      }),
    );
    this.shadow.renderOrder = 2;
    scene.add(this.shadow);
    this.reset();
  }

  /** Back to the start line. The world's pools must be reset by the caller too. */
  reset(): void {
    for (const s of this.stuck) this.freeStuck.push(s);
    this.stuck.length = 0;
    this.x = 0;
    this.d = 0;
    this.r = CONFIG.START_RADIUS;
    this.speed = 0;
    this.vx = 0;
    this.targetX = 0;
    this.knock = 0;
    this.invuln = 0;
    this.pop = 1;
    this.popVel = 0;
    this.rolling = false;
    this.h = 0;
    this.vh = 0;
    this.airborne = false;
    this.rampFlight = false;
    this.landed = false;
    this.jumpCooldown = 0;
    this.wind = 0;
    this.smashing = false;
    this.glow[0] = this.glow[1] = this.glow[2] = 0;
    this.mesh.quaternion.identity();
    this.mesh.visible = true;
    this.shadow.visible = this.blobShadow;
    this.material.emissive.setRGB(this.skinGlow[0], this.skinGlow[1], this.skinGlow[2]);
    this.place();
  }

  /** Change how the ball looks (config.ts SKINS). Purely cosmetic. */
  setSkin(skin: SkinDef): void {
    this.mesh.geometry = this.shapeFor(skin);
    paintSkin(this.mesh.geometry, skin);
    this.material.specular.setScalar(skin.shine * 0.9);
    this.material.shininess = 25 + skin.shine * 75;
    _color.setHex(skin.glow);
    this.skinGlow = [_color.r, _color.g, _color.b];
    this.material.emissive.copy(_color);
  }

  /** A small picture of the ball in a skin, for the shop (an image URL; made once each). */
  swatch(skin: SkinDef): string {
    let url = this.swatches.get(skin.id);
    if (url === undefined) {
      url = skinSwatch(this.shapeFor(skin), skin);
      this.swatches.set(skin.id, url);
    }
    return url;
  }

  /** Speckled skins keep the lumpy snowball; anything with a pattern gets the finer ball. */
  private shapeFor(skin: SkinDef): THREE.BufferGeometry {
    if (skin.pattern === 'speckle') return this.lumpy;
    this.fine ??= buildPatternGeometry();
    return this.fine;
  }

  /** Shrink by one lap along with the rest of the world (see REBASE_LAP in zones.ts). */
  rebase(): void {
    const k = 1 / LAP_GROWTH;
    this.d = rebaseD(this.d);
    this.x *= k;
    this.r *= k;
    this.speed *= k;
    this.vx *= k;
    this.targetX *= k;
    this.knock *= k;
    this.h *= k;
    this.vh *= k;
    for (const s of this.stuck) {
      s.pos.multiplyScalar(k);
      s.size *= k;
      s.dist *= k;
    }
    this.place();
  }

  /** The speed the ball settles at for its current size. */
  cruiseSpeed(): number {
    const C = CONFIG;
    // Faster down each mountain, and a little faster again every lap. The radius is
    // divided by the lap's scale so "radii per second" stays the same on Giant laps.
    const p = locate(this.d);
    const ramp = 1 + (C.SPEED_RAMP * p.g) / ZONES.length + Math.min(C.LAP_SPEED_MAX, C.LAP_SPEED_STEP * p.lap);
    return C.SPEED_K * Math.pow(this.r / p.scale, C.SPEED_POW) * p.scale * ramp * worldForLap(p.lap).twist.speed;
  }

  /**
   * Hop into the air. `height` is the apex in ball radii (defaults to a tap-jump).
   * Returns false if the ball is already airborne or still recovering from a landing.
   */
  jump(height = CONFIG.JUMP_HEIGHT_K, fromRamp = false): boolean {
    if (this.airborne || (!fromRamp && this.jumpCooldown > 0)) return false;
    // The world's twist may change gravity and how high a tap-jump goes. Whatever it is
    // at take-off holds for the whole flight.
    const twist = twistAt(this.d);
    this.gravityK = CONFIG.JUMP_GRAVITY_K * twist.gravity;
    if (!fromRamp) height *= twist.jump;
    const g = this.gravityK * this.r;
    this.vh = Math.sqrt(2 * g * height * this.r);
    this.h = 0.001;
    this.airborne = true;
    this.rampFlight = fromRamp;
    this.popVel += 4;
    return true;
  }

  get stuckCount(): number {
    return this.stuck.length;
  }

  /** Match the ball's shadow to the ground it is rolling on (a darker shade of it). */
  setGroundColor(hex: number): void {
    (this.shadow.material as THREE.MeshBasicMaterial).color.setHex(hex).multiplyScalar(0.7);
  }

  /** Use the simple disc shadow (only needed when real cast shadows are off). */
  setBlobShadow(on: boolean): void {
    this.blobShadow = on;
    this.shadow.visible = on && this.mesh.visible;
  }

  setVisible(v: boolean): void {
    this.mesh.visible = v;
    this.shadow.visible = v && this.blobShadow;
  }

  /**
   * @param steer    drag since last frame, in screen widths (positive = right)
   * @param keyAxis  -1 / 0 / +1 from the keyboard
   */
  update(dt: number, steer: number, keyAxis: number): void {
    const C = CONFIG;
    const cruise = this.cruiseSpeed();
    const target = this.rolling ? cruise : 0;
    this.speed += (target - this.speed) * damp(C.ACCEL_RATE, dt);

    const prevX = this.x;
    const prevD = this.d;
    this.d += this.speed * dt;

    // --- steering: the drag moves a target, the ball chases it with a critically
    // damped spring. That is what makes it feel heavy rather than twitchy.
    if (this.rolling) this.targetX += steer * C.STEER_SENS * this.r + keyAxis * C.KEY_STEER_SPEED * this.r * dt;
    const lead = C.STEER_MAX_LEAD * this.r;
    const lim = Math.max(0, laneHalfWidth(this.d) - this.r);
    this.targetX = clamp(clamp(this.targetX, this.x - lead, this.x + lead), -lim, lim);
    this.smoothDampX(dt);

    this.x += (this.knock + (this.rolling ? this.wind * this.r : 0)) * dt;
    this.knock *= Math.exp(-5 * dt);
    if (this.x > lim) {
      this.x = lim;
      if (this.vx > 0) this.vx = 0;
      if (this.knock > 0) this.knock = 0;
    } else if (this.x < -lim) {
      this.x = -lim;
      if (this.vx < 0) this.vx = 0;
      if (this.knock < 0) this.knock = 0;
    }

    // --- roll: spin about the axis perpendicular to the direction of travel.
    const mx = this.x - prevX;
    const mz = -(this.d - prevD);
    const moved = Math.hypot(mx, mz);
    if (moved > 1e-7) {
      _axis.set(mz / moved, 0, -mx / moved);
      _q.setFromAxisAngle(_axis, moved / this.r);
      this.mesh.quaternion.premultiply(_q).normalize();
    }

    // --- jump: a simple ballistic arc, scaled to the ball so it looks the same at any size.
    if (this.jumpCooldown > 0) this.jumpCooldown -= dt;
    if (this.airborne) {
      this.vh -= this.gravityK * this.r * dt;
      this.h += this.vh * dt;
      if (this.h <= 0) {
        this.h = 0;
        this.vh = 0;
        this.airborne = false;
        this.landed = true;
        this.landingSlide = Math.abs(this.vx) / (C.STEER_MAX_SPEED * this.r);
        this.jumpCooldown = C.JUMP_COOLDOWN;
        this.popVel -= 5;
      }
    }

    // --- plain snow slowly packs on; faster if the run is going badly.
    if (this.rolling && this.speed > 0 && !this.airborne) {
      const behind = this.r < designRadius(this.d) * C.CATCHUP_BELOW;
      const rate = C.SNOW_GROWTH * (behind ? C.CATCHUP_MULT : 1);
      this.r *= Math.exp(rate * dt * Math.min(1, this.speed / cruise));
    }

    // --- pop spring
    const acc = -C.POP_STIFFNESS * (this.pop - 1) - C.POP_DAMPING * this.popVel;
    this.popVel += acc * dt;
    this.pop = clamp(this.pop + this.popVel * dt, 0.7, 1.45);

    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    const flash = this.invuln / C.HIT_INVULN;
    // Red while hurt; icy blue during a yeti rage; green under a tractor beam.
    const g = this.glow;
    const own = this.skinGlow;
    this.material.emissive.setRGB(0.55 * flash + g[0] + own[0], 0.04 * flash + g[1] + own[1], 0.04 * flash + g[2] + own[2]);

    this.place();
  }

  /** Critically damped spring towards targetX (same maths as Unity's SmoothDamp). */
  private smoothDampX(dt: number): void {
    const smooth = Math.max(0.0001, (CONFIG.STEER_SMOOTH * twistAt(this.d).slide) / PERKS.grip);
    const omega = 2 / smooth;
    const k = omega * dt;
    const decay = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k);
    const maxChange = CONFIG.STEER_MAX_SPEED * PERKS.grip * this.r * smooth;
    const change = clamp(this.x - this.targetX, -maxChange, maxChange);
    const goal = this.x - change;
    const temp = (this.vx + omega * change) * dt;
    this.vx = (this.vx - omega * temp) * decay;
    let out = goal + (change + temp) * decay;
    if (this.targetX - this.x > 0 === out > this.targetX) {
      out = this.targetX;
      this.vx = 0;
    }
    this.x = out;
  }

  /** Re-apply position and scale after something moved or resized the ball. */
  syncTransform(): void {
    this.place();
  }

  private place(): void {
    const ground = groundY(this.d);
    this.position.set(this.x, ground + this.r * 1.02 + this.h, -this.d);
    this.mesh.position.copy(this.position);
    this.mesh.scale.setScalar(this.r * this.pop);
    this.shadow.position.set(this.x, ground, -this.d);
    this.shadow.scale.setScalar(this.r * 0.95);
  }

  /** Add an object's volume to the ball. */
  grow(size: number): void {
    const v = this.r * this.r * this.r + size * size * size * CONFIG.VOLUME_GAIN * PERKS.growth;
    this.r = Math.cbrt(v);
  }

  /**
   * Stick a world object onto the surface where it touched, then grow. The object's
   * instance slot is adopted, so it keeps its model and tint.
   */
  absorb(o: WorldObject, pool: InstancePool): void {
    // Direction from the ball's centre to the object's centre, in world space.
    _v.set(o.x - this.x, groundY(o.d) + o.size - this.position.y, -o.d - this.position.z);
    if (_v.lengthSq() < 1e-8) _v.set(0, -1, 0);
    _v.normalize();
    // ...and in the ball's own frame, so it turns with the ball from now on.
    _q.copy(this.mesh.quaternion).invert();
    _v.applyQuaternion(_q);

    const s = this.freeStuck.pop() ?? { pool, slot: 0, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), size: 0, dist: 0, age: 0 };
    s.pool = pool;
    s.slot = o.slot;
    s.size = o.size;
    s.dist = Math.max(this.r * 0.3, this.r - CONFIG.STUCK_EMBED * o.size);
    s.pos.copy(_v).multiplyScalar(s.dist);
    // Stand it up along the surface normal, keeping a random twist.
    s.quat.setFromUnitVectors(UP, _v).multiply(_twist.setFromAxisAngle(UP, o.rot));
    s.age = 0;
    this.stuck.push(s);
    if (this.stuck.length > CONFIG.MAX_STUCK) this.dropStuck(0);

    this.grow(o.size);
  }

  /** A hit by something too big. (nx, nd) points from the obstacle to the ball. */
  hit(nx: number, nd: number, obstacleX: number): void {
    const C = CONFIG;
    const cruise = this.cruiseSpeed();
    const headOn = Math.max(0, -nd);
    this.speed = this.speed * (1 - headOn) * 0.6 - cruise * C.HIT_BOUNCE * headOn;
    let side = nx;
    if (Math.abs(side) < 0.25) side = (this.x >= obstacleX ? 1 : -1) * 0.5;
    this.knock = side * C.HIT_KNOCK * cruise;
    this.vx = 0;
    this.targetX = this.x;
    this.r *= 1 - C.HIT_RADIUS_LOSS * PERKS.hitLoss;
    this.invuln = C.HIT_INVULN;
    this.popVel -= 5;
    const lose = Math.ceil(this.stuck.length * C.HIT_KNOCK_OFF);
    for (let i = 0; i < lose; i++) this.dropStuck(this.stuck.length - 1);
  }

  private dropStuck(index: number): void {
    const s = this.stuck[index];
    s.pool.release(s.slot);
    this.stuck.splice(index, 1);
    this.freeStuck.push(s);
  }

  /** Release every stuck object (used when the ball shatters). */
  shed(): void {
    while (this.stuck.length > 0) this.dropStuck(this.stuck.length - 1);
  }

  /** Write the world matrices of everything stuck to the ball. Call after update(). */
  syncStuck(dt: number): void {
    if (this.stuck.length === 0) return;
    _ballM.compose(this.position, this.mesh.quaternion, _s.setScalar(this.pop));
    for (let i = this.stuck.length - 1; i >= 0; i--) {
      const s = this.stuck[i];
      // Swallowed completely by later growth: stop drawing it.
      if (s.dist + s.size * 1.9 < this.r) {
        this.dropStuck(i);
        continue;
      }
      s.age += dt;
      const squash = 1 + 0.45 * Math.exp(-s.age * 9) * Math.cos(s.age * 22);
      _m.compose(s.pos, s.quat, _s.setScalar(s.size * squash));
      _m.premultiply(_ballM);
      s.pool.setMatrix(s.slot, _m);
    }
  }
}
