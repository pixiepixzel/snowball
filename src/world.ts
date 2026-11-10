/**
 * The mountain: terrain chunks generated ahead of the ball, the objects and hazards on
 * them (instanced and pooled), and everything being recycled once it falls behind the
 * camera. The run is endless — see zones.ts for how laps repeat at a bigger scale.
 *
 * Logic space is 2D: `x` across the slope, `d` distance downhill. World space puts d on
 * -Z and drops the ground by SLOPE per metre.
 */
import * as THREE from 'three';
import { CONFIG, ZONES } from './config';
import { OBJECT_DEFS, type ObjectDef } from './objects';
import { InstancePool } from './instances';
import { LAP_GROWTH, LAP_LENGTH, designRadius, gateNeed, groundY, laneHalfWidth, locate, rebaseD, worldAt } from './zones';
import { objectSource, worldForLap, type Scenery, type SceneLook, type WorldConfig } from './worlds';
import { PERKS } from './perks';
import { clamp, hash2, mulberry32 } from './util';
import { FEAST_PATTERN, INTRO_PATTERN, pickPattern, type Beat, type Choice, type Placed, type Tier } from './patterns';

export interface WorldObject {
  def: ObjectDef;
  /** Slot in the def's instance pool. */
  slot: number;
  /** Slot in the blob-shadow pool, or -1. */
  shadow: number;
  /** Slot in the danger-ring pool, or -1. */
  ring: number;
  x: number;
  d: number;
  baseX: number;
  yOff: number;
  sink: number;
  size: number;
  /** Footprint radius in metres. */
  fp: number;
  rot: number;
  phase: number;
  /** True while the object is too big for the ball (it gets a red ring). */
  danger: boolean;
  /** Gates: ball radius needed to smash through. Rivers: radius needed to freeze it. */
  need: number;
  /** Stretch for things lying on the snow (0 = use `size` in every direction). */
  sx: number;
  sz: number;
  /** Ploughs: speed up the slope, m/s. */
  speed: number;
  /** Rivers: where the bridge is (`aux`) and its half-width (`aux2`). */
  aux: number;
  aux2: number;
  /** Rivers: 1 once frozen. */
  state: number;
  /** 1 normally; shrinks to 0 as the camera passes a tall object. */
  fade: number;
  /** Decoration on the banks: never collides. */
  scenery: boolean;
}

interface Chunk {
  d0: number;
  d1: number;
  mesh: THREE.Mesh;
  decals: number[];
}

// Cross-section of the valley: u in lane half-widths, height in lane half-widths.
const PROFILE_U = [-3.4, -2.3, -1.55, -1.14, -1, -0.5, 0, 0.5, 1, 1.14, 1.55, 2.3, 3.4];
const PROFILE_H = [1.7, 0.95, 0.36, 0.05, 0, 0, 0, 0, 0, 0.05, 0.36, 0.95, 1.7];
const COLS = PROFILE_U.length - 1;

const C_WHITE = new THREE.Color(0xffffff);
/** Tint on a wall the ball is still too small to break. */
const C_GATE_LOCKED = new THREE.Color(0xff9a94);
/** The gold disc under a secret object. */
const C_SECRET = new THREE.Color(0xffc21e);
const C_RING_A = new THREE.Color(0xff2d20);
const C_RING_B = new THREE.Color(0xff7a5c);

/** Ground colours for one scene, derived from its ZONES entry. */
interface Palette {
  lane: THREE.Color;
  bankLow: THREE.Color;
  bankMid: THREE.Color;
  ridge: THREE.Color;
  ridgeSnow: THREE.Color;
  /** Blob shadow under objects (only used when real shadows are off). */
  shadow: THREE.Color;
  /** Pale drifts on the ground. */
  decal: THREE.Color;
}

/** @param caps white tops on the ridges (snow, icing, cloud); otherwise a second, lighter rock tone */
function buildPalette(z: SceneLook, caps: boolean): Palette {
  const lane = new THREE.Color(z.lane);
  const ridge = new THREE.Color(z.ridge);
  const bankMid = new THREE.Color(z.bankMid);
  return {
    lane,
    bankLow: new THREE.Color(z.bankLow),
    bankMid,
    ridge,
    ridgeSnow: caps ? ridge.clone().lerp(C_WHITE, 0.72) : ridge.clone().lerp(bankMid, 0.55),
    shadow: lane.clone().multiplyScalar(0.8),
    decal: lane.clone().lerp(C_WHITE, 0.55),
  };
}
/** One palette per scene of each lap's world, built the first time the lap is seen. */
const paletteCache = new Map<number, Palette[]>();
const palettesFor = (lap: number): Palette[] => {
  let list = paletteCache.get(lap);
  if (!list) {
    const world = worldForLap(lap);
    list = world.scenes.map((scene) => buildPalette(scene, world.scenery.caps));
    paletteCache.set(lap, list);
  }
  return list;
};
const paletteAt = (d: number): Palette => {
  const p = locate(d);
  return palettesFor(p.lap)[p.zone];
};

/** Does this object belong in this world? (A remix world takes each kind from one of its sources.) */
const inWorld = (def: ObjectDef, world: WorldConfig): boolean => (def.world ?? 0) === objectSource(world, def.slot ?? 0);

/**
 * Mark which vertices take the instance tint. For models with a `tints` list only the
 * pure-white "paint" does; for everything else the whole model does (so a wall can be
 * tinted red while it is still too strong to break).
 */
function addTintMask(g: THREE.BufferGeometry, paintOnly: boolean): void {
  const color = g.getAttribute('color');
  const mask = new Float32Array(color.count);
  for (let i = 0; i < color.count; i++) {
    const white = color.getX(i) > 0.99 && color.getY(i) > 0.99 && color.getZ(i) > 0.99;
    mask[i] = !paintOnly || white ? 1 : 0;
  }
  g.setAttribute('tintMask', new THREE.BufferAttribute(mask, 1));
}

/** Tilt a flat piece of geometry so it lies on the slope (the ground is y = z × SLOPE). */
function layOnSlope(g: THREE.BufferGeometry): void {
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + p.getZ(i) * CONFIG.SLOPE);
  g.computeVertexNormals();
}

/**
 * A small tileable snow texture drawn in code: soft drifts plus fine grain and glints.
 * It is multiplied over the ground colours, so the same texture gives powder on the
 * summit, scuffed ice on the lake and gritty asphalt in town.
 */
type Ground = Scenery['ground'];

/**
 * The pattern laid over the ground's colours. Every kind is drawn in near-white and
 * multiplied over the scene's own colours, so it only adds texture:
 *   'snow'  soft drifts and bright glints
 *   'sand'  wind ripples running across the slope
 *   'soft'  gentle mottling, no glints (grass, rock, cloud, moon dust)
 *   'tiles' a chequered play mat
 */
function makeGroundTexture(kind: Ground): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return new THREE.Texture();
  const rnd = mulberry32(11);
  g.fillStyle = '#f3f4f7';
  g.fillRect(0, 0, size, size);
  const finish = (): THREE.Texture => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  if (kind === 'tiles') {
    // Four squares to a tile, alternately a shade darker, with a fine seam between them.
    const half = size / 2;
    g.fillStyle = 'rgba(150,160,185,0.3)';
    g.fillRect(0, 0, half, half);
    g.fillRect(half, half, half, half);
    g.fillStyle = 'rgba(90,100,130,0.35)';
    for (const p of [0, half]) {
      g.fillRect(p - 2, 0, 4, size);
      g.fillRect(0, p - 2, size, 4);
    }
    g.fillRect(size - 2, 0, 2, size);
    g.fillRect(0, size - 2, size, 2);
    return finish();
  }

  if (kind === 'sand') {
    // Ripples: wavy lines across the slope, a whole number of waves so the tile repeats.
    for (let line = 0; line < 14; line++) {
      const y0 = (line + 0.5) * (size / 14);
      const waves = 2 + (line % 3);
      const phase = rnd() * 6.28;
      g.beginPath();
      for (let x = 0; x <= size; x += 4) {
        const y = y0 + Math.sin((x / size) * waves * 6.283 + phase) * 4;
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.lineWidth = 3 + (line % 2) * 2;
      g.strokeStyle = line % 2 ? 'rgba(150,130,100,0.32)' : 'rgba(255,255,255,0.55)';
      g.stroke();
    }
    for (let i = 0; i < 380; i++) {
      g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(160,140,110,0.35)';
      g.fillRect(rnd() * size, rnd() * size, 1.5, 1.5);
    }
    return finish();
  }
  // Soft drifts, drawn with wrap-around so the tile repeats without a seam.
  for (let i = 0; i < 34; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 18 + rnd() * 44;
    const light = i % 2 === 0;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const grad = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        grad.addColorStop(0, light ? 'rgba(255,255,255,0.6)' : 'rgba(188,200,220,0.5)');
        grad.addColorStop(1, light ? 'rgba(255,255,255,0)' : 'rgba(188,200,220,0)');
        g.fillStyle = grad;
        g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
  if (kind === 'soft') {
    // A few darker flecks instead of glints.
    for (let i = 0; i < 160; i++) {
      g.fillStyle = 'rgba(150,160,180,0.3)';
      const s = 1.5 + rnd() * 2.5;
      g.fillRect(rnd() * size, rnd() * size, s, s);
    }
    return finish();
  }
  // Snow: grain and glints.
  for (let i = 0; i < 520; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(200,210,226,0.45)';
    const s = 1 + rnd() * 1.6;
    g.fillRect(rnd() * size, rnd() * size, s, s);
  }
  return finish();
}

const _m = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _d = new THREE.Vector3();
const _n = new THREE.Vector3();
const _e1 = new THREE.Vector3();
const _e2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

const defById = (id: string): ObjectDef => OBJECT_DEFS.find((def) => def.id === id) as ObjectDef;

/** The rare secret objects, and the sum of their weights for picking one. */
const SECRET_DEFS = OBJECT_DEFS.filter((def) => def.special === 'secret');
const SECRET_WEIGHT = SECRET_DEFS.reduce((sum, def) => sum + def.weight, 0);

export class World {
  readonly objects: WorldObject[] = [];
  private pools = new Map<string, InstancePool>();
  private poolList: InstancePool[] = [];
  private shadows: InstancePool;
  private rings: InstancePool;
  private ringMaterial: THREE.MeshBasicMaterial;
  private chunks: Chunk[] = [];
  private meshPool: THREE.Mesh[] = [];
  private freeObjects: WorldObject[] = [];
  private placed: Placed[] = [];
  /** One ground material per pattern (snow, sand, soft, tiles); each chunk uses its world's. */
  private groundMaterials: Record<Ground, THREE.MeshLambertMaterial>;
  private scene: THREE.Scene;

  private rng = mulberry32(1);
  private nextD = 0;
  private chunkIndex = 0;
  private beatIndex = 0;
  private lastPattern = '';
  private lastZone = 0;
  private realShadows = CONFIG.SHADOWS;
  /** Running texture coordinate along the slope, so the snow texture never seams. */
  private groundV = 0;
  /** The river of the scene being generated: where it is and how much room to leave. */
  private riverD = -1;
  private riverHalf = 0;
  /** Which scene that river belongs to (lap × scenes per lap + scene). */
  private riverScene = -1;
  private riverSpawned = false;
  /** Walls at or before this distance are not built (see reset: where the run started). */
  private noGateBefore = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    // Per-instance tints (car colours, jackets, house walls...) should only recolour the
    // parts of a model painted pure white, not its snow, glass or tyres. A per-vertex
    // mask says which is which, and this small shader patch applies the tint through it.
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float tintMask;')
        .replace(
          '#include <color_vertex>',
          '#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\n\tvColor.xyz = color.rgb * mix( vec3( 1.0 ), instanceColor.xyz, tintMask );\n#endif',
        );
    };
    for (const def of OBJECT_DEFS) {
      const geometry = def.build();
      if (def.flat) layOnSlope(geometry);
      addTintMask(geometry, !!def.tints);
      const pool = new InstancePool(geometry, material, def.capacity ?? 220);
      pool.mesh.castShadow = !def.flat;
      pool.mesh.receiveShadow = !!def.flat;
      this.pools.set(def.id, pool);
      this.poolList.push(pool);
      scene.add(pool.mesh);
    }

    // Ground discs, one draw call for all: the pale drift marks and (only when real
    // shadows are off) simple blob shadows.
    const disc = new THREE.CircleGeometry(1, 10);
    disc.rotateX(-Math.PI / 2);
    layOnSlope(disc);
    const shadowMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.shadows = new InstancePool(disc, shadowMaterial, 1100);
    this.shadows.mesh.renderOrder = 1;
    this.shadows.mesh.receiveShadow = true;
    scene.add(this.shadows.mesh);

    // Danger rings: a bright unlit red ring around anything too big to absorb. It sits
    // outside the object's outline, so the object can't hide it, and it ignores lighting,
    // so shade and dark ground can't dim it.
    const ring = new THREE.RingGeometry(1, 1.3, 30);
    ring.rotateX(-Math.PI / 2);
    layOnSlope(ring);
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff2d20,
      toneMapped: false,
      fog: false,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    this.rings = new InstancePool(ring, this.ringMaterial, 400);
    this.rings.mesh.renderOrder = 2;
    scene.add(this.rings.mesh);

    const ground = (kind: Ground) => new THREE.MeshLambertMaterial({ vertexColors: true, map: makeGroundTexture(kind) });
    this.groundMaterials = { snow: ground('snow'), sand: ground('sand'), soft: ground('soft'), tiles: ground('tiles') };
    this.reset(1);
  }

  /** Switch between real cast shadows and cheap blob shadows under objects. */
  setRealShadows(on: boolean): void {
    if (on === this.realShadows) return;
    this.realShadows = on;
    for (const o of this.objects) if (o.shadow >= 0) this.writeShadow(o);
  }

  poolOf(def: ObjectDef): InstancePool {
    return this.pools.get(def.id) as InstancePool;
  }

  /** @param startD where the run begins (0 normally; further down for demos that skip ahead) */
  reset(seed: number, startD = 0): void {
    for (const pool of this.poolList) pool.reset();
    this.shadows.reset();
    this.rings.reset();
    for (const o of this.objects) this.freeObjects.push(o);
    this.objects.length = 0;
    for (const ch of this.chunks) {
      ch.mesh.visible = false;
      this.meshPool.push(ch.mesh);
    }
    this.chunks.length = 0;
    this.placed.length = 0;
    this.rng = mulberry32(seed);
    this.groundV = 0;
    this.nextD = startD - CONFIG.CHUNK_LEN_K * designRadius(startD);
    this.chunkIndex = 0;
    // Skipping ahead: no tutorial beats, and no "new scene" feast for the scene we land in.
    this.beatIndex = startD > 0 ? 2 : 0;
    this.lastPattern = '';
    const start = locate(startD);
    this.lastZone = start.lap * ZONES.length + start.zone;
    this.riverD = -1;
    this.riverScene = -1;
    this.noGateBefore = startD;
    this.riverSpawned = false;
  }

  /**
   * Shrink everything by one lap (see REBASE_LAP in zones.ts). Every object, the ground
   * and the generator's own bookkeeping move to where they would be one lap earlier, so
   * nothing changes on screen.
   */
  rebase(time: number): void {
    const k = 1 / LAP_GROWTH;
    for (const o of this.objects) {
      o.d = rebaseD(o.d);
      o.x *= k;
      o.baseX *= k;
      o.yOff *= k;
      o.sink *= k;
      o.size *= k;
      o.fp *= k;
      o.need *= k;
      o.sx *= k;
      o.sz *= k;
      o.speed *= k;
      o.aux *= k;
      o.aux2 *= k;
      this.writeMatrix(o, time);
      if (o.shadow >= 0) this.writeShadow(o);
      if (o.ring >= 0) this.writeRing(o);
    }
    for (const p of this.placed) {
      p.x *= k;
      p.d = rebaseD(p.d);
      p.fp *= k;
    }
    // World space is (x, height, -d): a point moves by this much, then scales by k.
    const offY = LAP_LENGTH * CONFIG.SLOPE;
    const offZ = LAP_LENGTH;
    for (const ch of this.chunks) {
      ch.d0 = rebaseD(ch.d0);
      ch.d1 = rebaseD(ch.d1);
      const pos = ch.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
      const P = pos.array as Float32Array;
      for (let i = 0; i < P.length; i += 3) {
        P[i] *= k;
        P[i + 1] = (P[i + 1] + offY) * k;
        P[i + 2] = (P[i + 2] + offZ) * k;
      }
      pos.needsUpdate = true;
      for (const s of ch.decals) this.shadows.shrink(s, k, offY, offZ);
    }
    this.nextD = rebaseD(this.nextD);
    if (this.riverD >= 0) this.riverD = rebaseD(this.riverD);
    this.riverHalf *= k;
    this.noGateBefore = -1;
  }

  /** Generate ahead, recycle behind, animate movers, refresh danger rings. */
  update(ballD: number, ballR: number, camR: number, camX: number, dt: number, time: number, smashAll = false): void {
    const ahead = ballD + CONFIG.SPAWN_AHEAD_K * camR;
    while (this.nextD < ahead) this.generateChunk();

    // The rings pulse gently so they catch the eye.
    this.ringMaterial.color.copy(C_RING_A).lerp(C_RING_B, 0.5 + 0.5 * Math.sin(time * 7));

    const behind = ballD - CONFIG.DESPAWN_BEHIND_K * camR;
    // During a yeti rage nothing is dangerous, so no red rings.
    const absorbMax = smashAll ? Infinity : ballR * CONFIG.ABSORB_RATIO;
    // Tall things the ball has passed sink away before the camera reaches them, so
    // nothing ever blocks the view or clips through the lens.
    const camD = ballD - CONFIG.CAM_DIST_K * camR;
    const fadeStart = camD + 7.5 * camR;
    const objs = this.objects;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      const special = o.def.special;
      // Wide things (walls, rivers) wait until they are well behind before leaving.
      if (o.d < behind - (special === 'gate' || special === 'river' || special === 'bridge' ? o.size * 3 : 0)) {
        this.remove(i);
        continue;
      }
      let moved = false;
      if (!o.def.flat && o.d < fadeStart && o.size * 2 > 1.2 * camR && Math.abs(o.x - camX) < o.fp + 7 * camR) {
        const fade = clamp((o.d - (camD + 3.5 * camR)) / (4 * camR), 0, 1);
        if (fade !== o.fade) {
          o.fade = fade;
          moved = true;
        }
      }
      if (o.speed !== 0) {
        // Ploughs drive up the slope.
        o.d -= o.speed * dt;
        moved = true;
      } else if (o.def.motion && !o.scenery) {
        if (o.def.motion === 'ski') {
          o.d += CONFIG.SKIER_SPEED * o.size * dt;
          const lim = Math.max(0, laneHalfWidth(o.d) - o.fp);
          o.x = clamp(o.baseX + Math.sin(time * 0.9 + o.phase) * o.size * 1.6, -lim, lim);
          o.rot = -Math.cos(time * 0.9 + o.phase) * 0.45;
        }
        moved = true;
      }

      if (!o.scenery && (!special || special === 'plough')) {
        const danger = o.size >= absorbMax;
        if (danger !== o.danger) {
          o.danger = danger;
          if (danger) {
            o.ring = this.rings.alloc();
            moved = true;
          } else if (o.ring >= 0) {
            this.rings.release(o.ring);
            o.ring = -1;
          }
        }
      } else if (special === 'gate') {
        // Walls glow red until the ball is big enough to break them.
        const locked = ballR < o.need;
        if (locked !== o.danger) {
          o.danger = locked;
          this.poolOf(o.def).setColor(o.slot, locked ? C_GATE_LOCKED : C_WHITE);
        }
      }

      if (moved) {
        this.writeMatrix(o, time);
        if (o.shadow >= 0) this.writeShadow(o);
        if (o.ring >= 0) this.writeRing(o);
      }
    }

    while (this.chunks.length > 0 && this.chunks[0].d1 < behind) {
      const ch = this.chunks.shift() as Chunk;
      ch.mesh.visible = false;
      this.meshPool.push(ch.mesh);
      for (const s of ch.decals) this.shadows.release(s);
    }
  }

  /**
   * Tractor beam: drag everything small enough to absorb towards the ball.
   * @param range how far ahead and to the side it reaches (m)
   * @param step  how far each thing moves this frame (m)
   */
  pull(ballX: number, ballD: number, ballR: number, range: number, step: number, time: number): void {
    const absorbMax = ballR * CONFIG.ABSORB_RATIO;
    for (const o of this.objects) {
      const special = o.def.special;
      if (o.scenery || (special && special !== 'secret')) continue;
      if (!special && o.size >= absorbMax) continue;
      const dd = o.d - ballD;
      const dx = ballX - o.x;
      if (dd < -ballR || dd > range || Math.abs(dx) > range) continue;
      const dist = Math.hypot(dx, dd);
      if (dist < 1e-6) continue;
      const move = Math.min(step, dist);
      o.x += (dx / dist) * move;
      o.d -= (dd / dist) * move * 0.4;
      o.baseX = o.x;
      this.writeMatrix(o, time);
      if (o.shadow >= 0) this.writeShadow(o);
      if (o.ring >= 0) this.writeRing(o);
    }
  }

  /** Push instance changes to the GPU. Call once per frame after everything moved. */
  commit(): void {
    for (const pool of this.poolList) pool.commit();
    this.shadows.commit();
    this.rings.commit();
  }

  /** Remove an object and free its instance. */
  remove(index: number): void {
    const o = this.take(index);
    this.poolOf(o.def).release(o.slot);
    this.recycle(o);
  }

  /**
   * Take an object out of the world but keep its instance slot alive — the ball adopts
   * the slot when it absorbs the object. Call `recycle` when done with the record.
   */
  take(index: number): WorldObject {
    const objs = this.objects;
    const o = objs[index];
    if (o.shadow >= 0) {
      this.shadows.release(o.shadow);
      o.shadow = -1;
    }
    if (o.ring >= 0) {
      this.rings.release(o.ring);
      o.ring = -1;
    }
    const last = objs.pop() as WorldObject;
    if (index < objs.length) objs[index] = last;
    return o;
  }

  recycle(o: WorldObject): void {
    this.freeObjects.push(o);
  }

  /** The ball was big enough: turn a river to ice. */
  freeze(o: WorldObject): void {
    o.state = 1;
    this.poolOf(o.def).setColor(o.slot, _color.setHex(worldAt(o.d).ice));
  }

  get stats(): { objects: number; chunks: number } {
    return { objects: this.objects.length, chunks: this.chunks.length };
  }

  // ---------------------------------------------------------------- objects

  private spawn(def: ObjectDef, x: number, d: number, size: number, scenery = false, yOff = 0): WorldObject | null {
    const pool = this.poolOf(def);
    const slot = pool.alloc();
    if (slot < 0) return null;
    const special = def.special;
    const o = this.freeObjects.pop() ?? ({} as WorldObject);
    o.def = def;
    o.slot = slot;
    o.x = x;
    o.baseX = x;
    o.d = d;
    o.size = size;
    o.fp = size * def.footprint;
    o.rot = special || def.motion === 'ski' ? 0 : this.rng() * Math.PI * 2;
    o.phase = this.rng() * Math.PI * 2;
    o.scenery = scenery;
    o.yOff = yOff;
    o.sink = def.flat ? 0 : o.fp * CONFIG.SLOPE + (scenery ? size * 0.12 : 0);
    o.danger = false;
    o.need = 0;
    o.sx = 0;
    o.sz = 0;
    o.speed = 0;
    o.aux = 0;
    o.aux2 = 0;
    o.state = 0;
    o.fade = 1;
    o.shadow = -1;
    o.ring = -1;
    pool.setColor(slot, def.tints ? _color.setHex(def.tints[Math.floor(this.rng() * def.tints.length)]) : C_WHITE);
    if (!scenery && (!special || special === 'plough' || special === 'secret')) {
      o.shadow = this.shadows.alloc();
      if (o.shadow >= 0) {
        this.shadows.setColor(o.shadow, special === 'secret' ? C_SECRET : paletteAt(d).shadow);
        this.writeShadow(o);
      }
    }
    this.writeMatrix(o, 0);
    this.objects.push(o);
    return o;
  }

  private writeMatrix(o: WorldObject, time: number): void {
    let y = groundY(o.d) + o.yOff - o.sink;
    let rot = o.rot;
    if (!o.scenery) {
      if (o.def.motion === 'hop') y += Math.abs(Math.sin(time * 5 + o.phase)) * 0.4 * o.size;
      else if (o.def.motion === 'spin') {
        rot += time * 1.6;
        y += (0.25 + 0.12 * Math.sin(time * 2.2 + o.phase)) * o.size;
      }
    }
    _pos.set(o.x, y, -o.d);
    _quat.setFromAxisAngle(UP, rot);
    if (o.sx > 0) _scale.set(o.sx, o.sz, o.sz);
    else _scale.setScalar(o.size * o.fade);
    // Walls are stretched upwards so they tower over the ball that has to break them.
    if (o.def.special === 'gate') _scale.y *= 1.7;
    this.poolOf(o.def).setMatrix(o.slot, _m.compose(_pos, _quat, _scale));
  }

  private writeShadow(o: WorldObject): void {
    // Secret objects stand on a gold disc so they catch the eye; everything else gets a
    // blob shadow, and only when real shadows are off.
    const s = o.def.special === 'secret' ? o.size * 1.5 * o.fade : this.realShadows ? 0 : Math.max(o.fp * 1.25, o.size * 0.5) * o.fade;
    _m.makeScale(s, s, s);
    _m.setPosition(o.x, groundY(o.d), -o.d);
    this.shadows.setMatrix(o.shadow, _m);
  }

  private writeRing(o: WorldObject): void {
    // The ring's inner edge sits just outside the widest part of the model.
    const s = Math.max(o.fp * 1.3, o.size * 0.95) * o.fade;
    _m.makeScale(s, s, s);
    _m.setPosition(o.x, groundY(o.d), -o.d);
    this.rings.setMatrix(o.ring, _m);
  }

  // ---------------------------------------------------------------- chunks

  private generateChunk(): void {
    const d0 = this.nextD;
    const R0 = designRadius(d0);
    let len = CONFIG.CHUNK_LEN_K * R0;
    // Snap a chunk boundary exactly onto the end of each scene, where its wall stands.
    // (Looked up a hair past d0, so a chunk starting exactly on a boundary belongs to
    // the new scene whatever the rounding.)
    const place = locate(d0 + R0 * 0.001);
    const zone = place.zone;
    const lap = place.lap;
    const zoneStart = place.zoneStart;
    const zoneEnd = place.zoneEnd;
    let d1 = d0 + len;
    if (d0 >= 0 && d1 > zoneEnd - len * 0.5) {
      d1 = zoneEnd;
      len = d1 - d0;
    }
    const world = worldForLap(lap);
    const palette = palettesFor(lap)[zone];

    // Entering a new scene: decide where its river (if any) will be, so the beats on
    // either side know to leave room for it.
    const sceneNo = lap * ZONES.length + zone;
    if (d0 >= 0 && sceneNo !== this.riverScene) {
      this.riverScene = sceneNo;
      this.riverSpawned = false;
      const hasRiver = CONFIG.RIVER_ZONES.includes(zone) || (lap > 0 && zone > 0);
      if (hasRiver) {
        this.riverD = zoneStart + (zoneEnd - zoneStart) * CONFIG.RIVER_AT;
        this.riverHalf = (CONFIG.RIVER_WIDTH_K * designRadius(this.riverD)) / 2;
      } else {
        this.riverD = -1;
      }
    }

    const mesh = this.meshPool.pop() ?? this.createGroundMesh();
    mesh.material = this.groundMaterials[world.scenery.ground];
    // One repeat of the snow texture per 8 design radii, continuous across chunks.
    const vLen = len / (8 * R0);
    this.fillGround(mesh, d0, d1, this.groundV, vLen, palette);
    this.groundV = (this.groundV + vLen) % 1;
    mesh.visible = true;
    const chunk: Chunk = { d0, d1, mesh, decals: [] };
    this.chunks.push(chunk);

    // A couple of pale drifts per chunk on top of the snow texture.
    for (let i = 0; i < 2; i++) {
      const slot = this.shadows.alloc();
      if (slot < 0) break;
      const d = d0 + this.rng() * len;
      const hw = laneHalfWidth(d);
      const sx = R0 * (0.5 + this.rng() * 1.1);
      const sz = sx * (1.8 + this.rng() * 2.2);
      _m.makeScale(sx, sz, sz);
      _m.setPosition((this.rng() * 2 - 1) * hw * 0.92, groundY(d), -d);
      this.shadows.setMatrix(slot, _m);
      this.shadows.setColor(slot, palette.decal);
      chunk.decals.push(slot);
    }

    if (d0 >= 0) {
      const beats = CONFIG.BEATS_PER_CHUNK;
      for (let b = 0; b < beats; b++) {
        const bd0 = d0 + (len * b) / beats;
        if (bd0 < CONFIG.START_CLEAR_K * CONFIG.START_RADIUS) continue;
        this.generateBeat(bd0, len / beats);
      }
      this.generateScenery(d0, len);

      if (this.riverD >= d0 && this.riverD < d1 && !this.riverSpawned) this.spawnRiver();

      // The scene's wall, scaled to span the valley (gate models are 18 units wide).
      // (Not the wall just behind a run that starts part-way down: that one is already past.)
      if (d1 === zoneEnd && zoneEnd > this.noGateBefore) {
        const gate = defById(world.scenes[zone].gate);
        const wall = this.spawn(gate, 0, zoneEnd, (laneHalfWidth(zoneEnd * 0.999999) * 1.25) / 9);
        if (wall) wall.need = gateNeed(zoneEnd * 0.999999);
      }
    }

    this.nextD = d1;
    this.chunkIndex++;
  }

  /** A band of water across the whole slope, with a bridge somewhere along it. */
  private spawnRiver(): void {
    this.riverSpawned = true;
    const d = this.riverD;
    const R = designRadius(d);
    const hw = laneHalfWidth(d);
    const depth = this.riverHalf * 2;
    const bridgeHalf = CONFIG.BRIDGE_HALF_K * R;
    const bridgeX = (this.rng() * 2 - 1) * Math.max(0, hw - bridgeHalf - R);
    const lift = 0.02 * R;

    const river = this.spawn(defById('river'), 0, d, depth, false, lift);
    if (river) {
      river.sx = (hw * 1.35) / 9;
      river.sz = depth;
      river.fp = depth / 2;
      river.need = CONFIG.RIVER_NEED_K * R;
      river.aux = bridgeX;
      river.aux2 = bridgeHalf;
      this.poolOf(river.def).setColor(river.slot, _color.setHex(worldAt(d).water));
      this.writeMatrix(river, 0);
    }
    const bridge = this.spawn(defById('bridge'), bridgeX, d, depth, false, lift * 2);
    if (bridge) {
      bridge.sx = bridgeHalf;
      bridge.sz = depth / 2 + 0.5 * R;
      this.writeMatrix(bridge, 0);
    }
  }

  private createGroundMesh(): THREE.Mesh {
    const verts = COLS * CONFIG.GROUND_ROWS * 6;
    const g = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'color']) {
      const attr = new THREE.BufferAttribute(new Float32Array(verts * 3), 3);
      attr.setUsage(THREE.DynamicDrawUsage);
      g.setAttribute(name, attr);
    }
    const uv = new THREE.BufferAttribute(new Float32Array(verts * 2), 2);
    uv.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('uv', uv);
    const mesh = new THREE.Mesh(g, this.groundMaterials.snow);
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    return mesh;
  }

  private groundVertex(col: number, row: number, d0: number, d1: number, out: THREE.Vector3): void {
    const rows = CONFIG.GROUND_ROWS;
    const d = d0 + ((d1 - d0) * row) / rows;
    const hw = laneHalfWidth(d);
    let u = PROFILE_U[col];
    let h = PROFILE_H[col];
    if (h > 0.04) {
      // Rough up the banks. Keyed on the global row so neighbouring chunks line up.
      const key = this.chunkIndex * rows + row;
      h *= 0.8 + hash2(col * 7.3, key * 1.7) * 0.45;
      u += (hash2(col * 3.1 + 5, key * 2.3) - 0.5) * 0.14 * Math.sign(u);
    }
    out.set(u * hw, groundY(d) + h * hw, -d);
  }

  private fillGround(mesh: THREE.Mesh, d0: number, d1: number, v0: number, vLen: number, pal: Palette): void {
    const rows = CONFIG.GROUND_ROWS;
    const g = mesh.geometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const nor = g.getAttribute('normal') as THREE.BufferAttribute;
    const col = g.getAttribute('color') as THREE.BufferAttribute;
    const tex = g.getAttribute('uv') as THREE.BufferAttribute;
    const P = pos.array as Float32Array;
    const N = nor.array as Float32Array;
    const K = col.array as Float32Array;
    const T = tex.array as Float32Array;
    let o = 0;
    let ot = 0;
    // Texture coordinates of the quad being written: [u, v] for corners a, b, c, d.
    const quadUv = new Float32Array(8);
    const tri = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, color: THREE.Color, shade: number, i0: number, i1: number, i2: number) => {
      _e1.subVectors(p1, p0);
      _e2.subVectors(p2, p0);
      _n.crossVectors(_e1, _e2).normalize();
      const corners = [i0, i1, i2];
      const points = [p0, p1, p2];
      for (let k = 0; k < 3; k++) {
        const p = points[k];
        P[o] = p.x;
        P[o + 1] = p.y;
        P[o + 2] = p.z;
        N[o] = _n.x;
        N[o + 1] = _n.y;
        N[o + 2] = _n.z;
        K[o] = color.r * shade;
        K[o + 1] = color.g * shade;
        K[o + 2] = color.b * shade;
        T[ot] = quadUv[corners[k] * 2];
        T[ot + 1] = quadUv[corners[k] * 2 + 1];
        o += 3;
        ot += 2;
      }
    };
    for (let r = 0; r < rows; r++) {
      const key = this.chunkIndex * rows + r;
      const va = v0 + (vLen * r) / rows;
      const vb = v0 + (vLen * (r + 1)) / rows;
      for (let c = 0; c < COLS; c++) {
        this.groundVertex(c, r, d0, d1, _a);
        this.groundVertex(c + 1, r, d0, d1, _b);
        this.groundVertex(c + 1, r + 1, d0, d1, _c);
        this.groundVertex(c, r + 1, d0, d1, _d);
        const ua = PROFILE_U[c] * 0.9;
        const ub = PROFILE_U[c + 1] * 0.9;
        quadUv.set([ua, va, ub, va, ub, vb, ua, vb]);
        const h = (PROFILE_H[c] + PROFILE_H[c + 1]) / 2;
        for (let t = 0; t < 2; t++) {
          const rnd = hash2(c * 2 + t + 0.5, key * 0.77 + 3.1);
          let color = pal.lane;
          let shade = 0.94 + rnd * 0.06;
          if (h >= 0.6) {
            color = rnd < 0.45 ? pal.ridgeSnow : pal.ridge;
            shade = 0.9 + rnd * 0.2;
          } else if (h >= 0.15) {
            color = rnd < 0.22 ? pal.ridge : pal.bankMid;
            shade = 0.94 + rnd * 0.08;
          } else if (h >= 0.02) {
            color = pal.bankLow;
            shade = 0.95 + rnd * 0.05;
          }
          if (t === 0) tri(_a, _b, _c, color, shade, 0, 1, 2);
          else tri(_a, _c, _d, color, shade, 0, 2, 3);
        }
      }
    }
    tex.needsUpdate = true;
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    col.needsUpdate = true;
  }

  /** Height of the bank (m above the lane) at |u| lane half-widths from the centre. */
  private bankHeight(u: number, hw: number): number {
    const a = Math.abs(u);
    for (let i = COLS / 2; i < COLS; i++) {
      if (a <= PROFILE_U[i + 1]) {
        const t = (a - PROFILE_U[i]) / (PROFILE_U[i + 1] - PROFILE_U[i]);
        return (PROFILE_H[i] + (PROFILE_H[i + 1] - PROFILE_H[i]) * t) * hw;
      }
    }
    return PROFILE_H[COLS] * hw;
  }

  private generateScenery(d0: number, len: number): void {
    const mid = d0 + len / 2;
    const place = locate(mid);
    const g = place.g;
    const scale = place.scale;
    const world = worldForLap(place.lap);
    const R = designRadius(mid) / scale;
    const pool: ObjectDef[] = [];
    for (const def of OBJECT_DEFS) {
      if (def.special || def.motion || !inWorld(def, world)) continue;
      if (g < def.zone + def.span[0] || g >= def.zone + def.span[1]) continue;
      const q = def.size / R;
      if (q >= 0.45 && q <= 3.5) pool.push(def);
    }
    if (pool.length === 0) return;
    for (let i = 0; i < CONFIG.SCENERY_PER_CHUNK; i++) {
      const def = pool[Math.floor(this.rng() * pool.length)];
      const d = d0 + this.rng() * len;
      const hw = laneHalfWidth(d);
      // Bigger things stand further up the bank so they frame the lane, not crowd it.
      const near = 1.4 + Math.min(1, def.size / R / 3.5) * 0.6;
      const u = (this.rng() < 0.5 ? -1 : 1) * (near + this.rng() * 1.3);
      const size = def.size * scale * (1 + (this.rng() * 2 - 1) * def.jitter);
      this.spawn(def, u * hw, d, size, true, this.bankHeight(u, hw) * 0.95);
    }
  }

  // ---------------------------------------------------------------- beats

  /**
   * Fairness pass: make sure at least one straight line through the beat is free of
   * obstacles. If the pattern plus extras closed every line, the obstacles on the least
   * blocked line are taken away again.
   */
  private keepLaneOpen(obstacles: WorldObject[], R: number, hw: number): void {
    const clear = CONFIG.CLEAR_LANE_K * R;
    if (clear <= 0 || obstacles.length === 0) return;
    const lim = Math.max(0, hw - 1.2 * R);
    const lanes = 17;
    let bestCount = Infinity;
    let bestX = 0;
    const start = Math.floor(this.rng() * lanes);
    for (let k = 0; k < lanes; k++) {
      // Start from a random lane so the open line isn't always in the same place.
      const x = -lim + (2 * lim * ((k + start) % lanes)) / (lanes - 1);
      let count = 0;
      for (const o of obstacles) if (Math.abs(o.x - x) < o.fp + clear) count++;
      if (count < bestCount) {
        bestCount = count;
        bestX = x;
        if (count === 0) return;
      }
    }
    for (const o of obstacles) {
      if (Math.abs(o.x - bestX) >= o.fp + clear) continue;
      const index = this.objects.indexOf(o);
      if (index >= 0) this.remove(index);
    }
  }

  /**
   * Sort the objects available at scene coordinate g into tiers. R is the design radius
   * in first-lap units (later laps scale the objects up instead).
   */
  private tiersAt(g: number, R: number, world: WorldConfig): Record<Tier, ObjectDef[]> {
    const C = CONFIG;
    const lists: Record<Tier, ObjectDef[]> = { crumb: [], food: [], target: [], obstacle: [] };
    const edible: ObjectDef[] = [];
    const big: ObjectDef[] = [];
    for (const def of OBJECT_DEFS) {
      if (def.special || !inWorld(def, world)) continue;
      if (g < def.zone + def.span[0] || g >= def.zone + def.span[1]) continue;
      const q = def.size / R;
      if (q < C.TIER_MIN_Q) continue;
      if (q <= C.TIER_TARGET_MAX) edible.push(def);
      else big.push(def);
      if (q <= C.TIER_CRUMB_MAX) lists.crumb.push(def);
      else if (q <= C.TIER_FOOD_MAX) lists.food.push(def);
      else if (q <= C.TIER_TARGET_MAX) lists.target.push(def);
      else if (q >= C.OBSTACLE_MIN_Q && q <= C.OBSTACLE_MAX_Q) lists.obstacle.push(def);
    }
    // Fallbacks so a pattern always gets something sensible.
    edible.sort((a, b) => a.size - b.size);
    big.sort((a, b) => a.size - b.size);
    const largest = (l: ObjectDef[]) => l.reduce((a, b) => (b.size > a.size ? b : a));
    if (lists.crumb.length === 0 && edible.length > 0) lists.crumb.push(edible[0]);
    if (lists.food.length === 0 && lists.crumb.length > 0) lists.food.push(largest(lists.crumb));
    if (lists.target.length === 0 && lists.food.length > 0) lists.target.push(largest(lists.food));
    if (lists.obstacle.length === 0 && big.length > 0) lists.obstacle.push(big[0]);
    return lists;
  }

  private generateBeat(bd0: number, blen: number): void {
    const C = CONFIG;
    const mid = bd0 + blen / 2;
    const place = locate(mid);
    const lap = place.lap;
    const scale = place.scale;
    const zone = place.zone;
    const g = place.g;
    // Keep the ground just before and just after a wall clear, so the wall reads.
    const zoneStart = place.zoneStart;
    const zoneEnd = place.zoneEnd;
    const globalZone = lap * ZONES.length + zone;
    const R = designRadius(mid);
    const hw = laneHalfWidth(bd0);
    const theme = worldForLap(lap);
    const tiers = this.tiersAt(g, R / scale, theme);
    const rng = this.rng;
    const placed = this.placed;
    // Obstacles get denser down each mountain, and denser again every lap.
    const obstacleDensity = C.OBSTACLE_DENSITY + (C.OBSTACLE_DENSITY_RAMP * g) / ZONES.length + C.LAP_OBSTACLE_STEP * Math.min(lap, C.LAP_HARDER_UNTIL);
    const beatObstacles: WorldObject[] = [];
    const riverD = this.riverD;
    const riverHalf = this.riverHalf;

    // Forget placements that can no longer overlap anything new.
    let keep = 0;
    for (const p of placed) if (p.d > bd0 - 8 * R) placed[keep++] = p;
    placed.length = keep;

    /** True if distance d (with a margin) falls in ground that must stay empty. */
    const blocked = (d: number, margin: number): boolean => {
      if (d >= zoneEnd - margin - 3 * R) return true;
      if (globalZone > 0 && d <= zoneStart + margin + 2.5 * R) return true;
      return riverD >= 0 && Math.abs(d - riverD) < riverHalf + margin + 2.5 * R;
    };

    const world = this;
    const beat: Beat = {
      R,
      hw,
      len: blen,
      rng,
      pick(tier: Tier): Choice | null {
        const list = tiers[tier];
        if (list.length === 0) return null;
        let total = 0;
        for (const def of list) total += def.weight;
        let t = rng() * total;
        let def = list[0];
        for (const candidate of list) {
          t -= candidate.weight;
          if (t <= 0) {
            def = candidate;
            break;
          }
        }
        const size = def.size * scale * (1 + (rng() * 2 - 1) * def.jitter);
        return { def, size, fp: size * def.footprint, tier };
      },
      spawn(c: Choice, x: number, v: number): Placed | null {
        const obstacle = c.tier === 'obstacle';
        if (rng() > (obstacle ? obstacleDensity : C.SPAWN_DENSITY)) return null;
        const lim = Math.max(0, hw - c.fp * (obstacle ? 0.6 : 1));
        const px = clamp(x, -lim, lim);
        const d = bd0 + clamp(v, 0, 1) * blen;
        if (blocked(d, c.fp)) return null;
        for (const p of placed) {
          let gap: number;
          if (p.reserved) {
            // Kept-clear ground (e.g. the gap in a gate): only obstacles are refused.
            if (!obstacle) continue;
            gap = 0;
          } else if (obstacle !== p.obstacle) gap = 0.5 * R;
          else if (obstacle) gap = -0.25 * Math.min(p.fp, c.fp);
          else gap = 0.15 * R;
          const min = p.fp + c.fp + gap;
          const dx = p.x - px;
          const dd = p.d - d;
          if (dx * dx + dd * dd < min * min) return null;
        }
        const made = world.spawn(c.def, px, d, c.size);
        if (!made) return null;
        if (obstacle) beatObstacles.push(made);
        const rec: Placed = { x: px, d, fp: c.fp, obstacle };
        placed.push(rec);
        return rec;
      },
      put(tier: Tier, u: number, v: number): Placed | null {
        const c = this.pick(tier);
        if (!c) return null;
        return this.spawn(c, clamp(u, -1, 1) * Math.max(0, hw - c.fp - 0.4 * R), v);
      },
      putAt(tier: Tier, x: number, v: number): Placed | null {
        const c = this.pick(tier);
        return c ? this.spawn(c, x, v) : null;
      },
      reserve(x: number, v: number, radius: number): void {
        placed.push({ x, d: bd0 + v * blen, fp: radius, obstacle: false, reserved: true });
      },
    };

    let pattern;
    if (this.beatIndex < 2) pattern = INTRO_PATTERN;
    else if (globalZone !== this.lastZone) pattern = FEAST_PATTERN;
    else pattern = pickPattern(rng, this.lastPattern);
    pattern.fn(beat);

    // Density above 1: sprinkle extras on top of the pattern.
    const extraFood = Math.floor((C.SPAWN_DENSITY - 1) * 5 + rng());
    for (let i = 0; i < extraFood; i++) beat.put(rng() < 0.6 ? 'crumb' : 'food', rng() * 2 - 1, rng());
    if (obstacleDensity > 1 && pattern !== INTRO_PATTERN && pattern !== FEAST_PATTERN) {
      const extra = Math.floor((obstacleDensity - 1) * 2.5 + rng());
      for (let i = 0; i < extra; i++) beat.put('obstacle', rng() * 2 - 1, rng());
    }

    this.keepLaneOpen(beatObstacles, R, hw);

    // ---- Hazards. Nothing in the very first scene: that one is for learning to roll.
    if (globalZone > 0 && pattern !== FEAST_PATTERN) {
      /** Room for a circle of radius `rad` at (x, d), away from everything placed so far? */
      const roomFor = (x: number, d: number, rad: number): boolean => {
        for (const p of placed) {
          if (p.reserved) continue;
          const min = p.fp + rad + 0.5 * R;
          if ((p.x - x) * (p.x - x) + (p.d - d) * (p.d - d) < min * min) return false;
        }
        return true;
      };

      if (rng() < C.RAMP_CHANCE * theme.twist.ramp) {
        const size = C.RAMP_SIZE_K * R;
        const x = (rng() * 2 - 1) * Math.max(0, hw - size * 1.6);
        const d = bd0 + blen * 0.12;
        // A ramp needs clear ground to stand on and a long clear run to land in.
        const landing = riverD < 0 || riverD < d || riverD - d > 26 * R;
        if (landing && !blocked(d, size * 1.3) && zoneEnd - d > 24 * R && roomFor(x, d, size * 1.3)) {
          const ramp = this.spawn(defById('ramp'), x, d, size);
          if (ramp) {
            ramp.sink = size * 0.26;
            this.writeMatrix(ramp, 0);
            placed.push({ x, d, fp: size * 1.3, obstacle: true });
          }
        }
      }

      if ((zone >= 3 || lap > 0) && rng() < C.PLOUGH_CHANCE * theme.twist.plough) {
        const size = C.PLOUGH_SIZE_K * R;
        const x = (rng() * 2 - 1) * Math.max(0, hw - size * 1.2);
        const d = bd0 + blen;
        if (!blocked(d, size * 2)) {
          const speed = C.PLOUGH_SPEED * C.SPEED_K * Math.pow(R / scale, C.SPEED_POW) * scale;
          const plough = this.spawn(defById(theme.plough), x, d, size);
          if (plough) {
            plough.speed = speed;
            plough.rot = Math.PI; // blade towards the player
            this.writeMatrix(plough, 0);
          }
        }
      }

      // Once in a while, a secret object (the Lucky charm upgrade makes it more often).
      if (rng() < C.SECRET_CHANCE * PERKS.luck) {
        const size = C.SECRET_SIZE_K * R;
        const x = (rng() * 2 - 1) * Math.max(0, hw - size * 1.5);
        const d = bd0 + rng() * blen;
        let pick = rng() * SECRET_WEIGHT;
        let def = SECRET_DEFS[0];
        for (const s of SECRET_DEFS) {
          def = s;
          pick -= s.weight;
          if (pick <= 0) break;
        }
        if (!blocked(d, size) && roomFor(x, d, size)) {
          const found = this.spawn(def, x, d, size);
          if (found) {
            found.rot = Math.PI; // face the player
            this.writeMatrix(found, 0);
          }
        }
      }
    }

    this.lastPattern = pattern.name;
    this.lastZone = globalZone;
    this.beatIndex++;
  }
}
