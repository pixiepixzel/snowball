/**
 * Everything the snowball can meet on the mountain, as one data list.
 *
 * To add an object: write a builder with the helpers from shapes.ts (1 unit = the
 * object's size, standing on y = 0, about 2 units tall, front facing -Z) and add an
 * entry to OBJECT_DEFS. Whether it behaves as food or as an obstacle is decided
 * automatically from its size compared with the ball the scene expects (see the TIER_*
 * values in config.ts), so the thing that blocks you in one scene is usually a snack in
 * the next.
 *
 * To look at the models on their own, open the game with `?gallery` (and `&page=1`,
 * `&page=2`... for more).
 */
import type { BufferGeometry } from 'three';
import * as C from './objects-candy';
import * as E from './objects-desert';
import * as D from './objects-dino';
import * as K from './objects-sky';
import * as U from './objects-sea';
import * as X from './objects-secret';
import * as S from './objects-space';
import * as H from './objects-spooky';
import * as T from './objects-toys';
import { blob, box, cone, cyl, frustum, grade, merge, move, prism, speckle, torus } from './shapes';

export interface ObjectDef {
  id: string;
  /** Singular / plural names for the "What's inside" list. */
  name: string;
  plural: string;
  /** Which world it belongs to: 0 = the mountain (default), 1 = Lost World, 2 = Space. See worlds.ts. */
  world?: number;
  /** Home scene index within its world (0 = first scene ... 6 = last), matching ZONES in config.ts. */
  zone: number;
  /**
   * Where it spawns, in scene units relative to its home scene: [0, 1] is exactly the
   * home scene, [-0.3, 1.4] starts late in the previous scene and spills into the next.
   */
  span: [number, number];
  /** Effective radius in metres. Drives the absorb rule and the volume gained. */
  size: number;
  /** Random size variation, ± fraction. */
  jitter: number;
  /** Collision circle radius as a fraction of size. */
  footprint: number;
  /** Which part it plays: the same number for a mountain object and its stand-ins in other worlds. */
  slot?: number;
  /** Relative spawn frequency among objects of the same tier. */
  weight: number;
  /** Representative colour (used for the end-screen chips). */
  color: number;
  /** Shape builder: returns unit-scale, vertex-coloured geometry. */
  build: () => BufferGeometry;
  /**
   * Optional per-instance colour tints, multiplied over the whole model. Paint the parts
   * that should take the colour white, and keep the rest dark so the tint barely shows.
   */
  tints?: number[];
  /** Optional idle animation. */
  motion?: 'spin' | 'hop' | 'ski';
  /** Landmarks get slow-motion and a bigger shake when absorbed. */
  landmark?: boolean;
  /**
   * Things the game places and handles itself rather than through spawn patterns:
   *   'gate'    a wall across the whole slope at the end of a scene (the id is named by a
   *             ZONES entry's `gate`). Gate models are 18 units wide and 2 tall; +Z is
   *             the side the player sees.
   *   'river'   a band of water across the slope; 'bridge' is the way over it
   *   'ramp'    launches the ball into the air
   *   'plough'  a snowplough driving up the slope
   *   'secret'  a rare object with a special power (objects-secret.ts)
   */
  special?: 'gate' | 'river' | 'bridge' | 'ramp' | 'plough' | 'secret';
  /** Lies on the snow (river, bridge): the model is tilted to the slope. */
  flat?: boolean;
  /** Height of the model in its own units (default 2). Low things are easier to jump. */
  height?: number;
  /** Max simultaneous instances (world + stuck on the ball). */
  capacity?: number;
}

type Parts = BufferGeometry[];
const PI = Math.PI;

// ------------------------------------------------------------------ palette
const SNOW = 0xf2f6fc;
const BARK = 0x6b4a2e;
const RED = 0xe2473c;
const ROOF = 0xb5443a;
const SLATE = 0x4a5568;
const GLASS = 0x3f5f80;
const GLOW = 0xffd97a;
const TYRE = 0x1d2026;
const STONE = 0xdcd4c4;
const TRIM = 0x9a917f;
const DARK = 0x22262e;
const STEEL = 0x9aa3ad;
const WOOD = 0xc08a4a;

// ------------------------------------------------------------------ small helpers
/** Horizontal rod along X / along Z, centred on (x, y, z). */
const rodX = (r: number, len: number, color: number, x: number, y: number, z: number, seg = 6) =>
  cyl(r, r, len, color, { x, y: y - len / 2, z, rz: PI / 2 }, seg);
const rodZ = (r: number, len: number, color: number, x: number, y: number, z: number, seg = 6) =>
  cyl(r, r, len, color, { x, y: y - len / 2, z, rx: PI / 2 }, seg);

/** A wheel on an axle along X, centred on (x, y, z): tyre plus hub cap. */
const wheel = (x: number, y: number, z: number, r: number, w = 0.14): Parts => [
  rodX(r, w, TYRE, x, y, z, 10),
  rodX(r * 0.5, w + 0.03, 0xc9ced6, x, y, z, 6),
];

/** Off-white for trim: looks white but, unlike pure white, is not recoloured by tints. */
const TRIM_WHITE = 0xf3f5f8;

/** Framed window on a wall facing ±Z (at depth z) or ±X (at x). `y` is its sill. */
const winZ = (x: number, y: number, z: number, w: number, h: number, glass = GLASS, frame = TRIM_WHITE): Parts => [
  box(w + 0.08, h + 0.08, 0.04, frame, { x, y: y - 0.04, z }),
  box(w, h, 0.04, glass, { x, y, z: z + Math.sign(z) * 0.02 }),
];
const winX = (x: number, y: number, z: number, w: number, h: number, glass = GLASS, frame = TRIM_WHITE): Parts => [
  box(0.04, h + 0.08, w + 0.08, frame, { x, y: y - 0.04, z }),
  box(0.04, h, w, glass, { x: x + Math.sign(x) * 0.02, y, z }),
];

// ------------------------------------------------------------------ Summit
const snowflake = () => {
  const parts: Parts = [cyl(0.3, 0.3, 0.16, 0xd6f3ff, { y: 0.56 }, 6)];
  for (let i = 0; i < 3; i++) {
    const ry = (i * PI) / 3;
    parts.push(box(1.9, 0.12, 0.2, 0x4fbcff, { y: 0.58, ry }));
    for (const s of [-1, 1]) {
      // Little barbs branching off each arm.
      const x = Math.cos(ry) * 0.62 * s;
      const z = -Math.sin(ry) * 0.62 * s;
      parts.push(box(0.5, 0.11, 0.13, 0x8fd8ff, { x, y: 0.585, z, ry: ry + PI / 3.2 }));
      parts.push(box(0.5, 0.11, 0.13, 0x8fd8ff, { x, y: 0.585, z, ry: ry - PI / 3.2 }));
    }
  }
  return merge(parts);
};

const mitten = () =>
  merge([
    cyl(0.5, 0.52, 0.42, TRIM_WHITE, {}, 8),
    cyl(0.54, 0.54, 0.09, 0xd6dde8, { y: 0.16 }, 8),
    // The knitted part is pure white so each mitten takes its own colour.
    frustum(0.9, 0.5, 1.0, 0.56, 0.75, 0xffffff, { y: 0.42 }),
    blob(0.5, 0xffffff, { y: 1.2, sy: 0.85, sz: 0.56 }, 1),
    blob(0.25, 0xffffff, { x: 0.62, y: 0.76, sy: 1.5, sz: 0.9, rz: -0.55 }, 1),
    box(0.62, 0.1, 0.02, TRIM_WHITE, { y: 0.82, z: -0.275 }),
    box(0.62, 0.1, 0.02, TRIM_WHITE, { y: 0.82, z: 0.275 }),
  ]);

const hat = () =>
  merge([
    cyl(0.88, 0.92, 0.36, TRIM_WHITE, {}, 10),
    cyl(0.6, 0.84, 0.6, 0xffffff, { y: 0.36 }, 10),
    cyl(0.74, 0.81, 0.16, 0xffe08a, { y: 0.48 }, 10),
    blob(0.6, 0xffffff, { y: 0.96, sy: 0.7 }, 1),
    blob(0.3, TRIM_WHITE, { y: 1.5 }, 1),
  ]);

const snowboard = () =>
  merge([
    move(
      merge([
        box(0.56, 1.5, 0.09, 0xff8a1a, { y: 0.28 }),
        cyl(0.28, 0.28, 0.09, 0xff8a1a, { y: 1.78 - 0.045, rx: PI / 2 }, 10),
        cyl(0.28, 0.28, 0.09, 0xff8a1a, { y: 0.28 - 0.045, rx: PI / 2 }, 10),
        box(0.57, 0.14, 0.1, 0xffe08a, { y: 0.92 }),
        box(0.57, 0.07, 0.1, 0xffe08a, { y: 1.1 }),
        box(0.5, 0.2, 0.2, 0x2d3340, { y: 0.56, z: -0.07 }),
        box(0.5, 0.2, 0.2, 0x2d3340, { y: 1.3, z: -0.07 }),
        box(0.54, 0.06, 0.24, 0x8a93a3, { y: 0.63, z: -0.07 }),
        box(0.54, 0.06, 0.24, 0x8a93a3, { y: 1.37, z: -0.07 }),
      ]),
      { rz: 0.2, rx: -0.14, y: -0.12 },
    ),
    blob(0.5, SNOW, { y: 0.08, sy: 0.36, sx: 1.2 }, 1),
  ]);

// The early hazard: a cluster of sharp ice crystals, deep blue at the root and pale at
// the tip. Deliberately spiky and saturated so it reads as "don't touch" at a glance.
const shard = (r: number, h: number, t: Parameters<typeof cone>[3]) => grade(cone(r, h, 0xffffff, t, 5), 0x1f7fd6, 0xc4ecff);
const iceSpike = () =>
  merge([
    shard(0.55, 2.0, {}),
    shard(0.42, 1.5, { x: 0.55, z: 0.2, rz: -0.3 }),
    shard(0.38, 1.3, { x: -0.52, z: -0.25, rz: 0.34 }),
    shard(0.32, 1.05, { x: 0.05, z: 0.6, rx: 0.36 }),
    shard(0.3, 0.95, { x: -0.1, z: -0.62, rx: -0.36 }),
    shard(0.24, 0.72, { x: 0.62, z: -0.45, rz: -0.5, rx: -0.3 }),
    shard(0.22, 0.6, { x: -0.6, z: 0.42, rz: 0.55, rx: 0.3 }),
    blob(0.5, 0xe9f6ff, { y: 0.06, sy: 0.3, sx: 1.7, sz: 1.6 }, 1),
  ]);

// ------------------------------------------------------------------ Forest
const FUR = 0xb48c64;
const FUR_DARK = 0x9a7650;
const CREAM = 0xe9d9c2;
const rabbit = () =>
  merge([
    blob(0.55, FUR, { y: 0.62, z: 0.1, sz: 1.3, sy: 0.95 }, 1),
    blob(0.36, CREAM, { y: 0.5, z: -0.32, sy: 0.9, sx: 0.8 }, 1),
    blob(0.3, FUR_DARK, { x: -0.34, y: 0.36, z: 0.42, sy: 1.1 }),
    blob(0.3, FUR_DARK, { x: 0.34, y: 0.36, z: 0.42, sy: 1.1 }),
    blob(0.35, FUR, { y: 1.2, z: -0.5 }, 1),
    blob(0.16, CREAM, { y: 1.1, z: -0.8, sy: 0.8 }),
    box(0.07, 0.06, 0.05, 0xd9728a, { y: 1.13, z: -0.95 }),
    box(0.07, 0.09, 0.05, DARK, { x: -0.2, y: 1.26, z: -0.78 }),
    box(0.07, 0.09, 0.05, DARK, { x: 0.2, y: 1.26, z: -0.78 }),
    frustum(0.17, 0.09, 0.1, 0.06, 0.64, FUR, { x: -0.15, y: 1.42, z: -0.42, rz: 0.16, rx: 0.15 }),
    frustum(0.17, 0.09, 0.1, 0.06, 0.64, FUR, { x: 0.15, y: 1.42, z: -0.42, rz: -0.16, rx: 0.15 }),
    box(0.08, 0.4, 0.03, 0xe8a9b5, { x: -0.18, y: 1.5, z: -0.48, rz: 0.16, rx: 0.15 }),
    box(0.08, 0.4, 0.03, 0xe8a9b5, { x: 0.18, y: 1.5, z: -0.48, rz: -0.16, rx: 0.15 }),
    blob(0.19, 0xffffff, { y: 0.7, z: 0.86 }),
    box(0.14, 0.12, 0.3, CREAM, { x: -0.2, z: -0.55 }),
    box(0.14, 0.12, 0.3, CREAM, { x: 0.2, z: -0.55 }),
  ]);

const bush = () =>
  merge([
    speckle(blob(0.78, 0x3d8c50, { y: 0.66 }, 1), 0.12, 1),
    speckle(blob(0.56, 0x347a45, { x: 0.64, y: 0.48, z: 0.2 }, 1), 0.12, 2),
    speckle(blob(0.52, 0x46995a, { x: -0.6, y: 0.45, z: -0.25 }, 1), 0.12, 3),
    blob(0.42, 0x2f6f3f, { x: 0.1, y: 0.4, z: -0.62 }),
    blob(0.5, SNOW, { y: 1.3, sy: 0.38, sx: 1.1 }, 1),
    blob(0.3, SNOW, { x: 0.66, y: 0.92, z: 0.2, sy: 0.4 }),
    blob(0.26, SNOW, { x: -0.62, y: 0.86, z: -0.25, sy: 0.4 }),
    blob(0.08, RED, { x: -0.3, y: 0.95, z: -0.62 }),
    blob(0.08, RED, { x: 0.36, y: 0.7, z: -0.74 }),
    blob(0.08, RED, { x: -0.78, y: 0.66, z: 0.1 }),
    blob(0.08, RED, { x: 0.2, y: 0.98, z: 0.68 }),
    blob(0.08, RED, { x: 0.95, y: 0.6, z: -0.1 }),
  ]);

const sled = () => {
  const parts: Parts = [];
  for (const x of [-0.36, 0.36]) {
    parts.push(box(0.07, 0.07, 1.7, RED, { x, z: 0.1 }));
    parts.push(box(0.07, 0.07, 0.46, RED, { x, y: 0.11, z: -0.9, rx: 0.75 }));
    parts.push(box(0.06, 0.3, 0.06, RED, { x, y: 0.05, z: -0.45 }));
    parts.push(box(0.06, 0.3, 0.06, RED, { x, y: 0.05, z: 0.6 }));
  }
  for (let i = 0; i < 4; i++) parts.push(box(0.19, 0.06, 1.45, i % 2 ? WOOD : 0xad7a3e, { x: -0.3 + i * 0.2, y: 0.35, z: 0.12 }));
  parts.push(box(0.86, 0.07, 0.09, 0x8a5a2e, { y: 0.3, z: -0.5 }));
  parts.push(box(0.86, 0.07, 0.09, 0x8a5a2e, { y: 0.3, z: 0.7 }));
  parts.push(box(0.8, 0.06, 0.08, RED, { y: 0.27, z: -1.04 }));
  return merge(parts);
};

const skis = () =>
  merge([
    box(0.17, 1.85, 0.05, RED, { x: -0.2, rz: 0.14 }),
    box(0.17, 1.85, 0.05, RED, { x: 0.2, rz: -0.14 }),
    box(0.17, 0.22, 0.05, RED, { x: -0.33, y: 1.8, z: -0.05, rz: 0.14, rx: -0.5 }),
    box(0.17, 0.22, 0.05, RED, { x: 0.33, y: 1.8, z: -0.05, rz: -0.14, rx: -0.5 }),
    box(0.18, 0.2, 0.09, DARK, { x: -0.08, y: 0.8, rz: 0.14 }),
    box(0.18, 0.2, 0.09, DARK, { x: 0.08, y: 0.8, rz: -0.14 }),
    box(0.18, 0.1, 0.06, 0xffffff, { x: -0.16, y: 1.3, rz: 0.14 }),
    box(0.18, 0.1, 0.06, 0xffffff, { x: 0.16, y: 1.3, rz: -0.14 }),
    cyl(0.03, 0.03, 1.6, 0xb8bec8, { x: 0.62, rz: -0.1 }, 5),
    cyl(0.03, 0.03, 1.6, 0xb8bec8, { x: -0.62, rz: 0.1 }, 5),
    cyl(0.05, 0.05, 0.22, DARK, { x: 0.76, y: 1.45, rz: -0.1 }, 5),
    cyl(0.05, 0.05, 0.22, DARK, { x: -0.76, y: 1.45, rz: 0.1 }, 5),
    cyl(0.12, 0.12, 0.03, DARK, { x: 0.635, y: 0.2 }, 6),
    cyl(0.12, 0.12, 0.03, DARK, { x: -0.635, y: 0.2 }, 6),
    blob(0.6, SNOW, { y: 0.06, sy: 0.3, sx: 1.3 }, 1),
  ]);

/** One tier of pine branches and the snow lying on its upper half. */
const tier = (r: number, h: number, y: number, color: number, seed: number): Parts => [
  speckle(cone(r, h, color, { y }, 8), 0.1, seed),
  cone(r * 0.53, h * 0.53, SNOW, { y: y + h * 0.5 }, 8),
];

const smallTree = () =>
  merge([
    cyl(0.1, 0.15, 0.5, BARK, {}, 6),
    ...tier(0.78, 0.85, 0.32, 0x2a7448, 1),
    ...tier(0.62, 0.8, 0.72, 0x2f8050, 2),
    ...tier(0.45, 0.78, 1.1, 0x38915c, 3),
    blob(0.5, SNOW, { y: 0.04, sy: 0.22 }),
  ]);

const bigTree = () =>
  merge([
    cyl(0.13, 0.2, 0.5, 0x5a3d25, {}, 7),
    ...tier(0.84, 0.75, 0.3, 0x1c6040, 1),
    ...tier(0.7, 0.72, 0.62, 0x1f6a44, 2),
    ...tier(0.56, 0.68, 0.95, 0x237550, 3),
    ...tier(0.4, 0.68, 1.28, 0x2a8058, 4),
    blob(0.55, SNOW, { y: 0.04, sy: 0.2 }),
  ]);

// ------------------------------------------------------------------ Frozen Lake
const snowman = () =>
  merge([
    blob(0.64, 0xdbe6f4, { y: 0.56 }, 1),
    blob(0.46, 0xe3ecf7, { y: 1.26 }, 1),
    blob(0.31, 0xecf2fa, { y: 1.78 }, 1),
    torus(0.33, 0.08, RED, { y: 1.5 }, 10, 5),
    box(0.14, 0.42, 0.06, RED, { x: 0.18, y: 1.08, z: -0.36, rz: 0.12 }),
    cyl(0.34, 0.34, 0.05, DARK, { y: 1.99 }, 10),
    cyl(0.21, 0.21, 0.32, DARK, { y: 2.03 }, 10),
    cyl(0.215, 0.215, 0.07, RED, { y: 2.06 }, 10),
    cone(0.07, 0.32, 0xff8a3c, { y: 1.63, z: -0.44, rx: -PI / 2 }, 5),
    box(0.06, 0.06, 0.05, DARK, { x: -0.12, y: 1.86, z: -0.28 }),
    box(0.06, 0.06, 0.05, DARK, { x: 0.12, y: 1.86, z: -0.28 }),
    box(0.07, 0.07, 0.05, DARK, { y: 1.4, z: -0.43 }),
    box(0.07, 0.07, 0.05, DARK, { y: 1.2, z: -0.46 }),
    box(0.07, 0.07, 0.05, DARK, { y: 0.8, z: -0.6 }),
    cyl(0.025, 0.025, 0.7, BARK, { x: 0.72, y: 0.98, rz: -1.1 }, 4),
    cyl(0.025, 0.025, 0.7, BARK, { x: -0.72, y: 0.98, rz: 1.1 }, 4),
    cyl(0.02, 0.02, 0.2, BARK, { x: 1.0, y: 1.42, rz: -0.3 }, 4),
    cyl(0.02, 0.02, 0.2, BARK, { x: -1.0, y: 1.42, rz: 0.3 }, 4),
  ]);

const fishingHut = () => {
  const parts: Parts = [
    box(0.12, 0.12, 1.6, BARK, { x: -0.55 }),
    box(0.12, 0.12, 1.6, BARK, { x: 0.55 }),
    box(1.3, 1.2, 1.3, 0xd9503c, { y: 0.1 }),
    box(1.34, 0.1, 1.34, 0xffffff, { y: 0.1 }),
    prism(1.5, 0.45, 1.52, 0x33415a, { y: 1.3 }),
    prism(1.52, 0.32, 0.96, SNOW, { y: 1.47 }),
    box(0.42, 0.82, 0.05, 0x5a3d25, { y: 0.14, z: -0.665 }),
    box(0.5, 0.9, 0.03, 0xffffff, { y: 0.12, z: -0.655 }),
    cyl(0.08, 0.08, 0.55, 0x33415a, { x: 0.4, y: 1.4, z: 0.3 }, 6),
    cyl(0.12, 0.12, 0.06, 0x33415a, { x: 0.4, y: 1.94, z: 0.3 }, 6),
    ...winX(0.66, 0.55, 0, 0.4, 0.36, GLOW),
    ...winX(-0.66, 0.55, 0, 0.4, 0.36, GLOW),
    // The fishing hole and a rod propped beside it.
    cyl(0.3, 0.3, 0.03, 0x1f5f9e, { z: -1.2 }, 8),
    cyl(0.36, 0.36, 0.02, 0xcfe8f7, { z: -1.2 }, 8),
    cyl(0.02, 0.02, 0.9, BARK, { x: 0.3, y: 0.05, z: -0.9, rx: -0.7 }, 4),
  ];
  for (let i = 0; i < 5; i++) parts.push(box(0.03, 1.1, 0.02, 0xb93f2e, { x: -0.52 + i * 0.26, y: 0.2, z: 0.66 }));
  return merge(parts);
};

// Note for all models: never leave two faces at exactly the same height or depth — they
// flicker ("z-fight") when seen from a distance. Every layer here steps by at least 0.04.
const boat = () =>
  merge([
    frustum(0.6, 1.5, 0.95, 1.7, 0.5, 0x2f6fb5, { y: 0.04 }),
    cyl(0.5, 0.3, 0.46, 0x2f6fb5, { y: 0.04, z: -0.98, ry: PI, sx: 1.05, sz: 1.3 }, 3),
    // White gunwale: a rim around the edge, not a slab, so nothing overlaps the floor.
    box(0.1, 0.14, 1.78, 0xffffff, { x: -0.47, y: 0.48 }),
    box(0.1, 0.14, 1.78, 0xffffff, { x: 0.47, y: 0.48 }),
    box(0.84, 0.14, 0.1, 0xffffff, { y: 0.48, z: 0.84 }),
    box(0.84, 0.14, 0.1, 0xffffff, { y: 0.48, z: -0.84 }),
    box(0.84, 0.08, 1.58, 0x8a5a3a, { y: 0.5 }),
    box(0.84, 0.07, 0.24, 0xe8d8b0, { y: 0.66, z: 0.3 }),
    box(0.84, 0.07, 0.24, 0xe8d8b0, { y: 0.66, z: -0.35 }),
    box(1.06, 0.12, 0.08, RED, { y: 0.22, z: 0.9 }),
    // Oars resting across the gunwales.
    rodX(0.03, 1.8, WOOD, 0, 0.78, 0.0, 5),
    box(0.3, 0.03, 0.16, WOOD, { x: 1.0, y: 0.765, z: 0.0 }),
    box(0.3, 0.03, 0.16, WOOD, { x: -1.0, y: 0.765, z: 0.0 }),
  ]);

// ------------------------------------------------------------------ Ski Resort
const skier = () => {
  const parts: Parts = [
    blob(0.23, 0xf0c8a0, { y: 1.78, z: -0.14 }, 1),
    blob(0.26, 0xffffff, { y: 1.85, z: -0.09, sy: 0.75 }, 1),
    box(0.36, 0.11, 0.08, DARK, { y: 1.74, z: -0.36 }),
    blob(0.1, 0xffffff, { y: 2.07, z: -0.07 }),
    cyl(0.2, 0.23, 0.1, 0x3a3f4b, { y: 1.55, z: -0.1 }, 8),
    // Jacket: leaning forward into the slope.
    frustum(0.5, 0.3, 0.62, 0.38, 0.66, 0xffffff, { y: 0.94, z: 0.02, rx: -0.18 }),
    box(0.5, 0.08, 0.32, 0x3a3f4b, { y: 0.94, z: 0.02, rx: -0.18 }),
  ];
  for (const s of [-1, 1]) {
    parts.push(box(0.11, 0.05, 1.7, DARK, { x: s * 0.17 }));
    parts.push(box(0.11, 0.05, 0.24, DARK, { x: s * 0.17, y: 0.06, z: -0.93, rx: 0.5 }));
    parts.push(box(0.17, 0.2, 0.32, 0x3a3f4b, { x: s * 0.17, y: 0.05, z: -0.02 }));
    parts.push(box(0.17, 0.45, 0.2, 0x2d3340, { x: s * 0.17, y: 0.2, z: 0.02, rx: 0.2 }));
    parts.push(box(0.2, 0.42, 0.24, 0x2d3340, { x: s * 0.17, y: 0.58, z: 0.0, rx: -0.25 }));
    parts.push(box(0.15, 0.5, 0.17, 0xffffff, { x: s * 0.4, y: 1.0, z: -0.14, rx: -0.7 }));
    parts.push(blob(0.1, DARK, { x: s * 0.4, y: 1.0, z: -0.4 }));
    parts.push(cyl(0.025, 0.025, 1.35, 0xb8bec8, { x: s * 0.44, y: 0.02, z: -0.08, rx: 0.5 }, 4));
    parts.push(cyl(0.09, 0.09, 0.02, DARK, { x: s * 0.44, y: 0.14, z: -0.36, rx: 0.5 }, 6));
  }
  return merge(parts);
};

const signpost = () => {
  /** A plank with a pointed end, facing the camera side, pointing left or right. */
  const arrow = (y: number, dir: number, color: number, ry: number): Parts => [
    box(0.8, 0.26, 0.06, color, { x: dir * 0.36, y, ry }),
    box(0.19, 0.19, 0.06, color, { x: dir * 0.76 * Math.cos(ry), y: y + 0.035, z: -dir * 0.76 * Math.sin(ry), rz: PI / 4, ry }),
    box(0.82, 0.05, 0.08, SNOW, { x: dir * 0.36, y: y + 0.26, ry }),
  ];
  return merge([
    cyl(0.07, 0.09, 2.0, BARK, {}, 6),
    ...arrow(1.55, 1, 0xf2c14e, 0),
    ...arrow(1.2, -1, RED, 0.2),
    ...arrow(0.85, 1, 0x3f7de0, -0.25),
    blob(0.16, SNOW, { y: 2.02, sy: 0.6 }),
    blob(0.5, SNOW, { y: 0.05, sy: 0.25 }),
  ]);
};

const snowmobile = () =>
  merge([
    // Front skis and their struts.
    box(0.13, 0.05, 0.9, DARK, { x: -0.4, z: -0.62 }),
    box(0.13, 0.05, 0.9, DARK, { x: 0.4, z: -0.62 }),
    box(0.13, 0.05, 0.2, DARK, { x: -0.4, y: 0.05, z: -1.12, rx: 0.6 }),
    box(0.13, 0.05, 0.2, DARK, { x: 0.4, y: 0.05, z: -1.12, rx: 0.6 }),
    box(0.05, 0.3, 0.05, STEEL, { x: -0.4, y: 0.04, z: -0.55, rz: -0.3 }),
    box(0.05, 0.3, 0.05, STEEL, { x: 0.4, y: 0.04, z: -0.55, rz: 0.3 }),
    // Rear track.
    box(0.46, 0.26, 1.0, DARK, { z: 0.42 }),
    rodX(0.13, 0.46, 0x3a3f4b, 0, 0.13, 0.92, 8),
    rodX(0.13, 0.46, 0x3a3f4b, 0, 0.13, -0.08, 8),
    // Body, hood, seat.
    frustum(0.66, 1.8, 0.6, 1.6, 0.3, 0xffffff, { y: 0.24 }),
    frustum(0.6, 0.75, 0.44, 0.3, 0.26, 0xffffff, { y: 0.54, z: -0.42 }, 0, 0.12),
    box(0.4, 0.14, 0.85, DARK, { y: 0.54, z: 0.36 }),
    box(0.4, 0.3, 0.1, DARK, { y: 0.6, z: 0.82, rx: 0.2 }),
    box(0.5, 0.34, 0.05, 0x9fd3ff, { y: 0.76, z: -0.2, rx: -0.4 }),
    rodX(0.025, 0.66, DARK, 0, 0.92, -0.02, 5),
    cyl(0.03, 0.03, 0.3, DARK, { y: 0.66, z: -0.06, rx: 0.3 }, 5),
    box(0.3, 0.1, 0.05, 0xfff1a8, { y: 0.52, z: -0.82 }),
    box(0.7, 0.07, 0.07, STEEL, { y: 0.26, z: -0.92 }),
  ]);

const liftPole = () =>
  merge([
    box(0.5, 0.14, 0.5, 0x8d8f96, {}),
    frustum(0.26, 0.26, 0.14, 0.14, 1.8, 0x7c8794, { y: 0.14 }),
    box(1.3, 0.1, 0.14, 0x5d6672, { y: 1.86 }),
    box(0.1, 0.34, 0.1, 0x5d6672, { x: -0.3, y: 1.6, rz: 0.75 }),
    box(0.1, 0.34, 0.1, 0x5d6672, { x: 0.3, y: 1.6, rz: -0.75 }),
    rodX(0.11, 0.06, DARK, -0.62, 1.98, 0, 8),
    rodX(0.11, 0.06, DARK, 0.62, 1.98, 0, 8),
    // The cable, and one chair hanging from each side.
    rodZ(0.012, 2.6, DARK, -0.62, 2.09, 0, 4),
    rodZ(0.012, 2.6, DARK, 0.62, 2.09, 0, 4),
    box(0.03, 0.5, 0.03, 0x394150, { x: 0.62, y: 1.58, z: 0.6 }),
    box(0.4, 0.05, 0.2, RED, { x: 0.62, y: 1.54, z: 0.6 }),
    box(0.4, 0.26, 0.04, RED, { x: 0.62, y: 1.56, z: 0.7 }),
    box(0.03, 0.5, 0.03, 0x394150, { x: -0.62, y: 1.58, z: -0.7 }),
    box(0.4, 0.05, 0.2, RED, { x: -0.62, y: 1.54, z: -0.7 }),
    box(0.4, 0.26, 0.04, RED, { x: -0.62, y: 1.56, z: -0.6 }),
  ]);

const cabin = () => {
  const parts: Parts = [];
  for (let i = 0; i < 5; i++) parts.push(box(1.62, 0.19, 1.32, i % 2 ? 0x8a5a3a : 0x7a4d30, { y: i * 0.18 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(box(0.14, 0.92, 0.14, 0x5d3a22, { x: sx * 0.8, z: sz * 0.65 }));
  parts.push(
    prism(1.95, 0.72, 1.65, 0x4e3527, { y: 0.9 }),
    prism(1.99, 0.62, 1.3, SNOW, { y: 1.07 }),
    box(0.26, 0.6, 0.26, 0x8d8f96, { x: 0.5, y: 1.15, z: 0.3 }),
    box(0.32, 0.07, 0.32, SNOW, { x: 0.5, y: 1.75, z: 0.3 }),
    box(0.42, 0.62, 0.04, 0x5d3a22, { z: -0.665 }),
    box(0.34, 0.56, 0.05, 0x3e2a1c, { z: -0.68 }),
    box(0.5, 0.08, 0.22, 0x8d8f96, { z: -0.8 }),
    ...winZ(-0.5, 0.36, -0.67, 0.28, 0.28, GLOW, 0x5d3a22),
    ...winZ(0.5, 0.36, -0.67, 0.28, 0.28, GLOW, 0x5d3a22),
    ...winX(0.82, 0.36, 0, 0.32, 0.28, GLOW, 0x5d3a22),
    ...winX(-0.82, 0.36, 0, 0.32, 0.28, GLOW, 0x5d3a22),
    // Woodpile against the side wall.
    rodZ(0.1, 0.5, 0x9a6a42, 0.98, 0.1, 0.35, 6),
    rodZ(0.1, 0.5, 0x8a5a3a, 1.16, 0.1, 0.35, 6),
    rodZ(0.1, 0.5, 0xa9774a, 1.07, 0.27, 0.35, 6),
  );
  return merge(parts);
};

// ------------------------------------------------------------------ Village
const car = () =>
  merge([
    frustum(0.94, 2.0, 0.9, 1.92, 0.36, 0xffffff, { y: 0.2 }),
    box(0.96, 0.1, 2.04, 0xb9c0ca, { y: 0.16 }),
    frustum(0.84, 1.15, 0.7, 0.72, 0.34, 0x2c3a4c, { y: 0.56, z: 0.12 }),
    box(0.72, 0.05, 0.76, 0xffffff, { y: 0.9, z: 0.12 }),
    box(0.8, 0.09, 0.07, STEEL, { y: 0.2, z: -1.0 }),
    box(0.8, 0.09, 0.07, STEEL, { y: 0.2, z: 1.0 }),
    box(0.2, 0.1, 0.05, 0xfff1a8, { x: -0.3, y: 0.38, z: -0.985 }),
    box(0.2, 0.1, 0.05, 0xfff1a8, { x: 0.3, y: 0.38, z: -0.985 }),
    box(0.2, 0.08, 0.05, 0xd93a30, { x: -0.3, y: 0.4, z: 0.975 }),
    box(0.2, 0.08, 0.05, 0xd93a30, { x: 0.3, y: 0.4, z: 0.975 }),
    box(0.07, 0.07, 0.1, DARK, { x: -0.5, y: 0.6, z: -0.3 }),
    box(0.07, 0.07, 0.1, DARK, { x: 0.5, y: 0.6, z: -0.3 }),
    ...wheel(-0.46, 0.2, -0.62, 0.2),
    ...wheel(0.46, 0.2, -0.62, 0.2),
    ...wheel(-0.46, 0.2, 0.64, 0.2),
    ...wheel(0.46, 0.2, 0.64, 0.2),
  ]);

const shed = () => {
  const parts: Parts = [
    box(1.4, 1.0, 1.2, 0x9c4a3c, {}),
    box(1.46, 0.08, 1.26, 0x70757d, {}),
    prism(1.62, 0.6, 1.42, SLATE, { y: 1.0 }),
    prism(1.64, 0.5, 1.1, SNOW, { y: 1.14 }),
    // Double doors with braces.
    box(0.66, 0.74, 0.04, 0xffffff, { z: -0.61 }),
    box(0.29, 0.68, 0.05, 0x7a3a30, { x: -0.155, y: 0.02, z: -0.615 }),
    box(0.29, 0.68, 0.05, 0x7a3a30, { x: 0.155, y: 0.02, z: -0.615 }),
    box(0.04, 0.74, 0.02, 0xffffff, { x: -0.155, y: 0, z: -0.645, rz: 0.4 }),
    box(0.04, 0.74, 0.02, 0xffffff, { x: 0.155, y: 0, z: -0.645, rz: -0.4 }),
    ...winX(0.71, 0.45, 0, 0.36, 0.3),
    // A shovel leaning on the wall.
    cyl(0.025, 0.025, 0.9, WOOD, { x: -0.8, y: 0.12, z: 0.3, rz: -0.12 }, 4),
    box(0.04, 0.24, 0.2, STEEL, { x: -0.73, z: 0.3, rz: -0.12 }),
  ];
  for (let i = 0; i < 7; i++) parts.push(box(0.03, 0.96, 0.02, 0x86392e, { x: -0.6 + i * 0.2, y: 0.02, z: 0.605 }));
  return merge(parts);
};

const house = () =>
  merge([
    box(1.58, 0.1, 1.33, TRIM, {}),
    box(1.5, 1.0, 1.25, 0xffffff, { y: 0.08 }),
    prism(1.78, 0.78, 1.5, ROOF, { y: 1.08 }),
    prism(1.8, 0.74, 1.12, SNOW, { y: 1.29 }),
    box(0.22, 0.62, 0.22, 0x8a5a3a, { x: 0.45, y: 1.42, z: 0.25 }),
    box(0.28, 0.06, 0.28, SNOW, { x: 0.45, y: 2.04, z: 0.25 }),
    // Front door with a little porch roof and a step.
    box(0.4, 0.62, 0.03, 0xffffff, { y: 0.08, z: -0.635 }),
    box(0.32, 0.56, 0.05, 0x5a3d25, { y: 0.08, z: -0.645 }),
    box(0.04, 0.04, 0.04, GLOW, { x: 0.1, y: 0.34, z: -0.68 }),
    box(0.54, 0.06, 0.26, ROOF, { y: 0.74, z: -0.72, rx: -0.3 }),
    box(0.5, 0.07, 0.2, TRIM, { z: -0.73 }),
    ...winZ(-0.5, 0.42, -0.63, 0.28, 0.32),
    ...winZ(0.5, 0.42, -0.63, 0.28, 0.32),
    ...winZ(-0.42, 0.42, 0.63, 0.28, 0.32),
    ...winZ(0.42, 0.42, 0.63, 0.28, 0.32),
    ...winX(-0.755, 0.42, 0, 0.36, 0.32),
    ...winX(0.755, 0.42, 0, 0.36, 0.32),
    ...winX(-0.755, 1.2, 0, 0.2, 0.2),
    ...winX(0.755, 1.2, 0, 0.2, 0.2),
    // Window boxes under the front windows.
    box(0.36, 0.07, 0.08, RED, { x: -0.5, y: 0.33, z: -0.67 }),
    box(0.36, 0.07, 0.08, RED, { x: 0.5, y: 0.33, z: -0.67 }),
  ]);

const hotel = () => {
  const WALL = 0xead9b8;
  const parts: Parts = [box(1.7, 1.6, 1.1, WALL, {}), box(1.76, 0.3, 1.16, 0x8f7f6a, {})];
  for (let f = 0; f < 3; f++) {
    const y = 0.42 + f * 0.4;
    parts.push(box(1.72, 0.2, 1.12, GLASS, { y }));
    parts.push(box(1.62, 0.04, 0.16, 0xffffff, { y: y - 0.05, z: -0.63 }));
    parts.push(box(1.62, 0.12, 0.03, 0x6a7482, { y: y - 0.01, z: -0.7 }));
    for (let c = 0; c < 6; c++) parts.push(box(0.06, 0.2, 1.14, WALL, { x: -0.7 + c * 0.28, y }));
  }
  parts.push(
    frustum(1.84, 1.24, 1.2, 0.6, 0.3, ROOF, { y: 1.6 }),
    frustum(1.22, 0.62, 1.0, 0.4, 0.08, SNOW, { y: 1.9 }),
    box(0.9, 0.06, 0.32, ROOF, { y: 0.32, z: -0.7 }),
    box(0.05, 0.32, 0.05, TRIM, { x: -0.4, z: -0.82 }),
    box(0.05, 0.32, 0.05, TRIM, { x: 0.4, z: -0.82 }),
    box(0.5, 0.28, 0.05, 0x5a3d25, { z: -0.585 }),
    box(0.02, 0.28, 0.06, GLOW, { z: -0.59 }),
    box(0.8, 0.14, 0.05, 0x2d3340, { y: 1.44, z: -0.575 }),
    box(0.7, 0.05, 0.06, GLOW, { y: 1.485, z: -0.58 }),
  );
  return merge(parts);
};

// ------------------------------------------------------------------ Town
const bus = () => {
  const parts: Parts = [
    box(0.74, 0.62, 1.9, 0xffffff, { y: 0.14 }),
    frustum(0.74, 0.14, 0.7, 0.06, 0.62, 0xffffff, { y: 0.14, z: -1.0 }, 0, 0.04),
    box(0.76, 0.24, 1.8, 0x2c3a4c, { y: 0.42 }),
    box(0.66, 0.26, 0.05, 0x2c3a4c, { y: 0.4, z: -1.045 }),
    box(0.76, 0.06, 1.96, 0xd8dde4, { y: 0.16 }),
    box(0.4, 0.1, 0.05, DARK, { y: 0.68, z: -1.04 }),
    box(0.5, 0.1, 0.6, 0xd8dde4, { y: 0.76, z: 0.3 }),
    box(0.72, 0.08, 0.06, STEEL, { y: 0.14, z: -1.07 }),
    box(0.72, 0.08, 0.06, STEEL, { y: 0.14, z: 0.97 }),
    box(0.16, 0.08, 0.05, 0xfff1a8, { x: -0.25, y: 0.26, z: -1.075 }),
    box(0.16, 0.08, 0.05, 0xfff1a8, { x: 0.25, y: 0.26, z: -1.075 }),
    box(0.16, 0.07, 0.05, 0xd93a30, { x: -0.25, y: 0.28, z: 0.955 }),
    box(0.16, 0.07, 0.05, 0xd93a30, { x: 0.25, y: 0.28, z: 0.955 }),
    box(0.02, 0.44, 0.3, 0x2c3a4c, { x: -0.375, y: 0.18, z: -0.66 }),
    ...wheel(-0.36, 0.16, -0.62, 0.16, 0.12),
    ...wheel(0.36, 0.16, -0.62, 0.16, 0.12),
    ...wheel(-0.36, 0.16, 0.6, 0.16, 0.12),
    ...wheel(0.36, 0.16, 0.6, 0.16, 0.12),
  ];
  for (let i = 0; i < 6; i++) parts.push(box(0.78, 0.24, 0.04, 0xffffff, { y: 0.42, z: -0.7 + i * 0.3 }));
  return merge(parts);
};

const building = () => {
  const parts: Parts = [
    box(1.1, 1.92, 1.1, 0xffffff, {}),
    box(1.14, 0.34, 1.14, 0x6f7785, {}),
    box(0.5, 0.26, 0.04, 0x2c3a4c, { z: -0.575 }),
    box(1.0, 0.05, 0.22, RED, { y: 0.3, z: -0.64, rx: -0.2 }),
    box(1.18, 0.1, 1.18, 0x6f7785, { y: 1.92 }),
    box(0.34, 0.2, 0.3, STEEL, { x: -0.25, y: 2.02, z: 0.2 }),
    cyl(0.14, 0.14, 0.26, 0x8a5a3a, { x: 0.3, y: 2.02, z: -0.2 }, 8),
    cone(0.16, 0.1, SLATE, { x: 0.3, y: 2.28, z: -0.2 }, 8),
    cyl(0.012, 0.012, 0.4, DARK, { x: 0.35, y: 2.02, z: 0.35 }, 4),
  ];
  for (let f = 0; f < 4; f++) {
    const y = 0.5 + f * 0.36;
    parts.push(box(1.12, 0.2, 1.12, GLASS, { y }));
    for (let c = 0; c < 4; c++) {
      parts.push(box(0.07, 0.2, 1.14, 0xffffff, { x: -0.42 + c * 0.28, y }));
      parts.push(box(1.14, 0.2, 0.07, 0xffffff, { z: -0.42 + c * 0.28, y }));
    }
    parts.push(box(1.14, 0.03, 1.14, 0xd8dde4, { y: y - 0.03 }));
  }
  return merge(parts);
};

const churchTower = () => {
  const parts: Parts = [
    box(0.76, 0.14, 0.76, TRIM, {}),
    box(0.62, 1.0, 0.62, STONE, { y: 0.1 }),
    box(0.7, 0.07, 0.7, TRIM, { y: 1.05 }),
    box(0.58, 0.36, 0.58, STONE, { y: 1.12 }),
    box(0.68, 0.07, 0.68, TRIM, { y: 1.46 }),
    cone(0.47, 0.5, SLATE, { y: 1.53, ry: PI / 4 }, 4),
    box(0.03, 0.18, 0.03, 0xe8c45a, { y: 2.0 }),
    box(0.11, 0.03, 0.03, 0xe8c45a, { y: 2.09 }),
    box(0.26, 0.48, 0.03, TRIM, { y: 0.14, z: -0.31 }),
    box(0.2, 0.42, 0.05, 0x5a3d25, { y: 0.14, z: -0.315 }),
  ];
  for (let k = 0; k < 4; k++) {
    const a = (k * PI) / 2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    // Belfry opening, clock face and hands on each side.
    parts.push(box(0.2, 0.24, 0.04, 0x2d3340, { x: sx * 0.275, y: 1.18, z: cz * 0.275, ry: a }));
    parts.push(box(0.24, 0.24, 0.03, 0xf4f1e6, { x: sx * 0.3, y: 0.74, z: cz * 0.3, ry: a }));
    parts.push(box(0.025, 0.1, 0.035, DARK, { x: sx * 0.305, y: 0.86, z: cz * 0.305, ry: a }));
    parts.push(box(0.08, 0.025, 0.035, DARK, { x: sx * 0.305 + cz * 0.03, y: 0.85, z: cz * 0.305 - sx * 0.03, ry: a }));
    // Corner pinnacles.
    const px = (k < 2 ? 1 : -1) * 0.3;
    const pz = (k % 2 ? 1 : -1) * 0.3;
    parts.push(cone(0.06, 0.2, SLATE, { x: px, y: 1.53, z: pz }, 4));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ City
const church = () => {
  const parts: Parts = [
    box(0.84, 0.1, 1.6, TRIM, { z: 0.25 }),
    box(0.75, 0.72, 1.5, STONE, { y: 0.06, z: 0.25 }),
    prism(1.58, 0.46, 0.87, SLATE, { y: 0.78, z: 0.25, ry: PI / 2 }),
    // Rounded apse at the back.
    cyl(0.32, 0.32, 0.6, STONE, { y: 0.06, z: 1.0 }, 8),
    cone(0.36, 0.24, SLATE, { y: 0.66, z: 1.0 }, 8),
    // Tower over the entrance.
    box(0.6, 0.12, 0.6, TRIM, { z: -0.72 }),
    box(0.54, 1.3, 0.54, STONE, { y: 0.08, z: -0.72 }),
    box(0.6, 0.06, 0.6, TRIM, { y: 1.38, z: -0.72 }),
    cone(0.42, 0.5, SLATE, { y: 1.44, z: -0.72, ry: PI / 4 }, 4),
    box(0.03, 0.16, 0.03, 0xe8c45a, { y: 1.92, z: -0.72 }),
    box(0.1, 0.03, 0.03, 0xe8c45a, { y: 2.0, z: -0.72 }),
    box(0.26, 0.42, 0.03, TRIM, { y: 0.1, z: -0.985 }),
    box(0.2, 0.36, 0.05, 0x5a3d25, { y: 0.1, z: -0.995 }),
    cyl(0.12, 0.12, 0.04, 0x7fb4e8, { y: 0.9 - 0.02, z: -1.0, rx: PI / 2 }, 8),
    box(0.16, 0.26, 0.04, 0x2d3340, { y: 1.06, z: -0.995 }),
  ];
  for (let i = 0; i < 4; i++) {
    const z = -0.2 + i * 0.32;
    for (const s of [-1, 1]) {
      parts.push(box(0.04, 0.34, 0.14, 0x7fb4e8, { x: s * 0.385, y: 0.3, z }));
      parts.push(box(0.1, 0.6, 0.08, TRIM, { x: s * 0.4, y: 0.06, z: z + 0.16 }));
    }
  }
  return merge(parts);
};

const officeTower = () => {
  const parts: Parts = [
    box(0.92, 0.12, 0.92, 0x40566f, {}),
    grade(box(0.8, 1.2, 0.8, 0xffffff, { y: 0.1 }), 0x1c4478, 0x3577bd),
    grade(box(0.6, 0.6, 0.6, 0xffffff, { y: 1.3 }), 0x2f6db3, 0x5a9ee0),
    box(0.84, 0.05, 0.84, 0xdfe9f5, { y: 1.3 }),
    box(0.64, 0.05, 0.64, 0xdfe9f5, { y: 1.9 }),
    box(0.3, 0.1, 0.3, 0x40566f, { y: 1.95 }),
    cyl(0.015, 0.015, 0.3, 0x40566f, { y: 2.05 }, 4),
    blob(0.035, RED, { y: 2.36 }),
    box(0.5, 0.04, 0.2, 0xdfe9f5, { y: 0.34, z: -0.48 }),
    box(0.3, 0.22, 0.03, 0x1f2f44, { y: 0.12, z: -0.405 }),
  ];
  // Floor lines and vertical fins on the lower block, then on the upper block.
  for (let f = 1; f < 6; f++) parts.push(box(0.82, 0.03, 0.82, 0xcfe0f2, { y: 0.1 + f * 0.2 }));
  for (let f = 1; f < 3; f++) parts.push(box(0.62, 0.03, 0.62, 0xcfe0f2, { y: 1.3 + f * 0.2 }));
  // (Fins are thin slabs through the block; they must stay off the corner planes or
  // they would cover the whole glass face.)
  for (let c = 0; c < 4; c++) {
    const o = -0.3 + c * 0.2;
    parts.push(box(0.025, 1.2, 0.83, 0xcfe0f2, { x: o, y: 0.1 }));
    parts.push(box(0.83, 1.2, 0.025, 0xcfe0f2, { z: o, y: 0.1 }));
  }
  for (let c = 0; c < 3; c++) {
    const o = -0.2 + c * 0.2;
    parts.push(box(0.025, 0.6, 0.63, 0xcfe0f2, { x: o, y: 1.3 }));
    parts.push(box(0.63, 0.6, 0.025, 0xcfe0f2, { z: o, y: 1.3 }));
  }
  // Corner posts.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(box(0.05, 1.2, 0.05, 0xdfe9f5, { x: sx * 0.4, y: 0.1, z: sz * 0.4 }));
  return merge(parts);
};

// ------------------------------------------------------------------ Gates
// Walls across the whole slope: 18 units wide, about 2 tall. +Z faces the player.

const iceWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 12; i++) {
    const h = 1.4 + ((i * 7) % 5) * 0.11;
    const x = -8.25 + i * 1.5;
    parts.push(grade(box(1.47, h, 0.85, 0xffffff, { x }), 0x2a86dc, 0xa9e2ff));
    parts.push(box(1.5, 0.1, 0.9, 0xf2fbff, { x, y: h }));
    parts.push(grade(cone(0.4, 0.62, 0xffffff, { x: x - 0.3, y: h + 0.08 }, 4), 0x7fd0ff, 0xf0faff));
    parts.push(grade(cone(0.28, 0.44, 0xffffff, { x: x + 0.4, y: h + 0.08, z: 0.15 }, 4), 0x7fd0ff, 0xf0faff));
  }
  return merge(parts);
};

const logWall = () => {
  const parts: Parts = [];
  const logs: [number, number, number][] = [
    [0.36, 0.36, 0x8a5a3a],
    [0.34, 1.04, 0x74482a],
    [0.32, 1.66, 0x9a6a42],
  ];
  for (const [r, y, color] of logs) {
    parts.push(rodX(r, 18, color, 0, y, 0, 8));
    // Pale sawn ends.
    parts.push(rodX(r * 0.82, 18.06, 0xe0c090, 0, y, 0, 8));
    parts.push(rodX(r + 0.012, 17.9, color, 0, y, 0, 8));
  }
  for (let i = 0; i < 5; i++) {
    const x = -8.4 + i * 4.2;
    parts.push(box(0.3, 2.15, 0.3, 0x4a3020, { x, z: 0.5 }));
    parts.push(box(0.3, 2.15, 0.3, 0x4a3020, { x, z: -0.5 }));
    parts.push(box(0.36, 0.08, 1.3, 0xd9c79a, { x, y: 1.9 }));
    parts.push(blob(0.22, SNOW, { x, y: 2.18, z: 0.5, sy: 0.5 }));
  }
  for (let i = 0; i < 6; i++) parts.push(blob(0.5, SNOW, { x: -7.5 + i * 3, y: 1.98, sy: 0.22, sx: 2.2, sz: 0.5 }));
  return merge(parts);
};

const plankWall = () => {
  const parts: Parts = [
    box(18.2, 0.18, 0.12, 0x5a3d25, { y: 0.45, z: 0.17 }),
    box(18.2, 0.18, 0.12, 0x5a3d25, { y: 1.35, z: 0.17 }),
  ];
  for (let i = 0; i < 18; i++) {
    const x = -8.5 + i;
    const h = 1.6 + (i % 3) * 0.1;
    const color = i % 2 ? 0xb9833f : 0x9a6a30;
    parts.push(box(0.88, h, 0.2, color, { x }));
    // Pointed picket top.
    parts.push(prism(0.2, 0.26, 0.88, color, { x, y: h, ry: PI / 2 }));
  }
  // Life rings hung on the fence.
  for (const x of [-5, 0, 5]) {
    parts.push(torus(0.42, 0.11, 0xffffff, { x, y: 1.0, z: 0.3, rx: PI / 2 }, 12, 6));
    parts.push(box(0.26, 0.28, 0.24, RED, { x, y: 1.3, z: 0.3 }));
    parts.push(box(0.26, 0.28, 0.24, RED, { x, y: 0.44, z: 0.3 }));
    parts.push(box(0.28, 0.26, 0.24, RED, { x: x + 0.42, y: 0.87, z: 0.3 }));
    parts.push(box(0.28, 0.26, 0.24, RED, { x: x - 0.42, y: 0.87, z: 0.3 }));
  }
  return merge(parts);
};

const netWall = () => {
  const parts: Parts = [
    box(18, 1.3, 0.05, 0xff7a1a, { y: 0.35 }),
    box(18.1, 0.08, 0.09, 0xffffff, { y: 1.62 }),
    box(18.1, 0.08, 0.09, 0xffffff, { y: 0.33 }),
  ];
  for (let i = 0; i < 4; i++) parts.push(box(18, 0.03, 0.07, 0xc85a10, { y: 0.55 + i * 0.27 }));
  for (let i = 0; i < 36; i++) parts.push(box(0.03, 1.3, 0.07, 0xc85a10, { x: -8.75 + i * 0.5, y: 0.35 }));
  const flags = [RED, 0xffc93c, 0x3f7de0, 0x54d17a];
  for (let i = 0; i < 9; i++) {
    const x = -9 + i * 2.25;
    parts.push(cyl(0.1, 0.1, 2.0, 0xffffff, { x }, 6));
    parts.push(cyl(0.105, 0.105, 0.3, RED, { x, y: 0.4 }, 6));
    parts.push(cyl(0.105, 0.105, 0.3, RED, { x, y: 1.1 }, 6));
    parts.push(blob(0.14, SNOW, { x, y: 2.02, sy: 0.6 }));
    // A pennant between each pair of posts.
    if (i < 8) parts.push(prism(0.05, 0.42, 0.5, flags[i % 4], { x: x + 1.125, y: 1.66, ry: PI / 2, rz: PI }));
  }
  return merge(parts);
};

const stoneWall = () => {
  const parts: Parts = [];
  const greys = [0x9a9288, 0xb1a99d, 0x8a8278, 0xa49c90];
  for (let row = 0; row < 3; row++) {
    const y = row * 0.55;
    const shift = row % 2 ? 0.75 : 0;
    for (let i = -1; i < 12; i++) {
      const x = -8.25 + i * 1.5 + shift;
      if (x < -8.6 || x > 8.6) continue;
      parts.push(box(1.44, 0.52, 0.9 + ((i + row) % 3) * 0.04, greys[(i * 3 + row * 5 + 12) % 4], { x, y }));
    }
  }
  parts.push(box(18.2, 0.5, 0.78, 0x7f786f, { y: 0.02 }));
  parts.push(box(18.3, 0.14, 1.1, 0x6f6a62, { y: 1.66 }));
  parts.push(box(18.3, 0.08, 1.14, SNOW, { y: 1.8 }));
  for (const x of [-9, -3, 3, 9]) {
    parts.push(box(1.0, 2.0, 1.2, 0x8a8278, { x }));
    parts.push(frustum(1.14, 1.34, 0.5, 0.6, 0.24, 0x6f6a62, { x, y: 2.0 }));
    parts.push(blob(0.3, GLOW, { x, y: 2.36 }));
  }
  return merge(speckleAll(parts, 0.05));
};

const roadblock = () => {
  const parts: Parts = [];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    const color = i % 2 ? 0xf5f5f5 : RED;
    // A concrete "jersey" barrier: wide foot, narrow top.
    parts.push(frustum(1.94, 1.1, 1.94, 0.6, 0.5, color, { x }));
    parts.push(frustum(1.94, 0.6, 1.94, 0.34, 1.1, color, { x, y: 0.5 }));
    parts.push(box(1.96, 0.3, 0.37, i % 2 ? RED : 0xf5f5f5, { x, y: 0.95 }));
    parts.push(box(1.7, 0.08, 0.2, 0x2d3340, { x, y: 1.6 }));
    parts.push(cyl(0.1, 0.12, 0.2, 0x2d3340, { x, y: 1.68 }, 6));
    parts.push(blob(0.2, 0xffc93c, { x, y: 2.0 }, 1));
  }
  return merge(parts);
};

const dam = () => {
  const parts: Parts = [
    grade(box(18, 2.0, 0.9, 0xffffff, {}), 0x7f8892, 0xaab3bd),
    box(18.2, 0.1, 1.2, 0x7c8794, { y: 2.0 }),
    box(18.2, 0.14, 0.04, 0x55606c, { y: 2.1, z: 0.56 }),
    box(18.2, 0.14, 0.04, 0x55606c, { y: 2.1, z: -0.56 }),
    frustum(18, 1.5, 18, 0.9, 0.5, 0x858e98, {}),
  ];
  for (let i = 0; i < 11; i++) {
    const x = -8.5 + i * 1.7;
    parts.push(frustum(0.4, 0.9, 0.34, 0.3, 1.8, 0x8a939e, { x, z: 0.5 }, 0, -0.25));
  }
  for (let i = 0; i < 5; i++) {
    const x = -3.4 + i * 1.7;
    parts.push(box(0.9, 0.6, 0.1, 0x3a4350, { x: x + 0.85, y: 1.2, z: 0.46 }));
    parts.push(box(0.8, 0.5, 0.06, 0x2d7fc8, { x: x + 0.85, y: 0.66, z: 0.5 }));
  }
  for (const x of [-8.6, 8.6]) {
    parts.push(box(0.9, 2.5, 1.3, 0x99a2ac, { x }));
    parts.push(box(1.0, 0.1, 1.4, 0x55606c, { x, y: 2.5 }));
    parts.push(box(0.4, 0.3, 0.05, GLOW, { x, y: 2.05, z: 0.66 }));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Hazards

/**
 * A band of water across the slope: 18 units wide, 1 deep. Painted in greys so the game
 * can tint it blue while it flows and pale ice-white once the ball has frozen it.
 */
const river = () => {
  const parts: Parts = [box(18.6, 0.008, 1, 0xb8bcc2, {})];
  for (let i = 0; i < 14; i++) {
    const x = -8.4 + i * 1.3;
    parts.push(box(0.7, 0.008, 0.05, 0xffffff, { x, y: 0.006, z: -0.3 + ((i * 5) % 7) * 0.1 }));
    parts.push(box(0.45, 0.008, 0.04, 0xe2e6ea, { x: x + 0.6, y: 0.006, z: 0.32 - ((i * 3) % 5) * 0.12 }));
  }
  // Snowy banks on both edges.
  parts.push(box(18.6, 0.02, 0.07, 0xf3f5f8, { z: 0.52 }), box(18.6, 0.02, 0.07, 0xf3f5f8, { z: -0.52 }));
  return merge(parts);
};

/**
 * A bridge: deck 2 × 2 units (x and z from -1 to 1), stretched by the game to fit. Every
 * world has its own (worlds.ts names it): the same shape in that world's materials.
 */
interface BridgeLook {
  /** Deck colours, repeated plank by plank. */
  planks: number[];
  /** True if the strips run the length of the bridge rather than across it (the rainbow). */
  along?: boolean;
  rail: number;
  /** Posts, if they are a different colour from the rail. */
  post?: number;
  /** The strip along the top of each rail: snow, vines, icing, a glowing light. */
  cap: number;
}

const bridgeOf = (look: BridgeLook) => () => {
  const parts: Parts = [];
  const n = look.planks.length;
  if (look.along) {
    for (let i = 0; i < n; i++) parts.push(box(2 / n, 0.035, 2.34, look.planks[i], { x: -1 + ((i + 0.5) * 2) / n, y: 0.03 }));
  } else {
    for (let i = 0; i < 9; i++) parts.push(box(2.0, 0.035, 0.24, look.planks[i % n], { y: 0.03, z: -1.04 + i * 0.26 }));
  }
  for (const x of [-1, 1]) {
    parts.push(box(0.06, 0.05, 2.3, look.rail, { x, y: 0.32 }));
    for (let i = 0; i < 4; i++) parts.push(box(0.07, 0.36, 0.07, look.post ?? look.rail, { x, y: 0, z: -1.05 + i * 0.7 }));
    parts.push(box(0.1, 0.03, 2.34, look.cap, { x, y: 0.37 }));
  }
  return merge(parts);
};

/**
 * A kicker. The ball arrives from +Z (uphill), rolls up the slope and is launched off the
 * lip at -Z. Every world has its own (worlds.ts names it): the same wedge with three
 * bright stripes so it reads as a ramp from a distance, in that world's materials, with
 * that world's markers standing either side of the lip.
 */
interface RampLook {
  body: number;
  /** The three stripes across the face, bottom to top. */
  stripes: [number, number, number];
  rail: number;
  /** What stands at one end of the lip, built at (x, 1.0, -1.15) and about 0.75 tall. */
  marker: (x: number) => Parts;
}

const LIP_Z = -1.15;
const rampOf = (look: RampLook) => () => {
  const lean = 0.41; // slope of the ramp face, radians
  return merge([
    frustum(2.0, 2.4, 2.0, 0.12, 1.0, look.body, {}, 0, -1.14),
    box(1.7, 0.04, 0.28, look.stripes[0], { y: 0.27, z: 0.55, rx: lean }),
    box(1.7, 0.04, 0.28, look.stripes[1], { y: 0.53, z: -0.05, rx: lean }),
    box(1.7, 0.04, 0.28, look.stripes[2], { y: 0.79, z: -0.65, rx: lean }),
    box(0.1, 0.1, 2.5, look.rail, { x: -1.0, y: 0.5, z: 0.02, rx: lean }),
    box(0.1, 0.1, 2.5, look.rail, { x: 1.0, y: 0.5, z: 0.02, rx: lean }),
    ...look.marker(-1.0),
    ...look.marker(1.0),
  ]);
};

/** A thin pole standing at the lip, for markers that are "something on a stick". */
const lipPole = (x: number, color: number, h = 0.7): BufferGeometry => cyl(0.05, 0.05, h, color, { x, y: 1.0, z: LIP_Z }, 5);

// The markers, one kind per world.
const flagMarker = (x: number): Parts => [lipPole(x, 0xffffff), prism(0.04, 0.3, 0.4, RED, { x, y: 1.42, z: -1.33, ry: PI / 2, rz: -PI / 2 })];
const torchMarker = (x: number): Parts => [
  lipPole(x, 0x6b4a2e, 0.55),
  cyl(0.11, 0.07, 0.1, 0x3a2a1c, { x, y: 1.52, z: LIP_Z }, 6),
  cone(0.12, 0.3, 0xff7a1a, { x, y: 1.6, z: LIP_Z }, 5),
  cone(0.06, 0.18, 0xffd23f, { x, y: 1.64, z: LIP_Z }, 4),
];
const beaconMarker = (x: number): Parts => [
  lipPole(x, 0x6a7383, 0.6),
  box(0.22, 0.04, 0.22, 0x3a4150, { x, y: 1.58, z: LIP_Z }),
  blob(0.12, 0x5ae0ff, { x, y: 1.74, z: LIP_Z }),
];
const lollipopMarker = (x: number): Parts => [
  lipPole(x, 0xffffff, 0.5),
  blob(0.2, x < 0 ? 0xff5a9a : 0x5ad0ff, { x, y: 1.66, z: LIP_Z }, 1),
  torus(0.12, 0.035, 0xffffff, { x, y: 1.66, z: LIP_Z, rx: PI / 2 }, 8, 4),
];
const obeliskMarker = (x: number): Parts => [
  frustum(0.22, 0.22, 0.13, 0.13, 0.6, 0xd8c090, { x, y: 1.0, z: LIP_Z }),
  cone(0.1, 0.16, 0xf2c230, { x, y: 1.6, z: LIP_Z, ry: PI / 4 }, 4),
];
const buoyMarker = (x: number): Parts => [
  cyl(0.1, 0.17, 0.32, 0xe2473c, { x, y: 1.0, z: LIP_Z }, 8),
  cyl(0.11, 0.11, 0.07, 0xffffff, { x, y: 1.14, z: LIP_Z }, 8),
  lipPole(x, 0xe8e8e8, 0.62),
  blob(0.09, 0xffd23f, { x, y: 1.7, z: LIP_Z }),
];
const pumpkinMarker = (x: number): Parts => [
  lipPole(x, 0x2a222e, 0.4),
  blob(0.21, 0xff8a1a, { x, y: 1.55, z: LIP_Z, sy: 0.8 }, 1),
  cyl(0.03, 0.04, 0.1, 0x3f8a2a, { x, y: 1.7, z: LIP_Z }, 5),
  box(0.07, 0.06, 0.03, 0xffe066, { x: x - 0.07, y: 1.55, z: LIP_Z + 0.19 }),
  box(0.07, 0.06, 0.03, 0xffe066, { x: x + 0.07, y: 1.55, z: LIP_Z + 0.19 }),
];
const blockMarker = (x: number): Parts => [
  box(0.26, 0.24, 0.26, 0xe2473c, { x, y: 1.0, z: LIP_Z }),
  box(0.24, 0.22, 0.24, 0x3f7de0, { x, y: 1.24, z: LIP_Z, ry: 0.5 }),
  box(0.2, 0.2, 0.2, 0x54b86a, { x, y: 1.46, z: LIP_Z, ry: -0.3 }),
];
const starMarker = (x: number): Parts => [
  lipPole(x, 0xffffff, 0.55),
  blob(0.17, 0xffd23f, { x, y: 1.7, z: LIP_Z }),
  blob(0.13, 0xffffff, { x: x - 0.1, y: 1.02, z: LIP_Z }, 1),
  blob(0.15, 0xffffff, { x: x + 0.08, y: 1.03, z: LIP_Z - 0.05 }, 1),
];

/** A snowplough truck. Front (the blade) faces -Z like every other model. */
const plough = () =>
  merge([
    box(0.95, 0.2, 1.9, 0x3a3f4b, { y: 0.22, z: 0.15 }),
    // Cab and salt hopper.
    box(0.9, 0.6, 0.6, 0xff8a1a, { y: 0.42, z: -0.35 }),
    box(0.82, 0.26, 0.05, 0x2c3a4c, { y: 0.68, z: -0.66 }),
    box(0.05, 0.24, 0.4, 0x2c3a4c, { x: -0.455, y: 0.68, z: -0.35 }),
    box(0.05, 0.24, 0.4, 0x2c3a4c, { x: 0.455, y: 0.68, z: -0.35 }),
    frustum(0.9, 1.1, 1.0, 1.2, 0.5, 0xffb347, { y: 0.42, z: 0.52 }),
    box(1.02, 0.05, 1.22, 0x3a3f4b, { y: 0.92, z: 0.52 }),
    // Flashing beacon.
    cyl(0.08, 0.08, 0.1, DARK, { y: 1.02, z: -0.35 }, 6),
    blob(0.11, 0xffd23f, { y: 1.17, z: -0.35 }),
    // The blade: wide, tall and angled, with hazard stripes.
    box(1.9, 0.62, 0.1, 0xffd23f, { y: 0.02, z: -0.98, rx: 0.22 }),
    box(1.94, 0.1, 0.12, DARK, { y: 0.04, z: -1.0, rx: 0.22 }),
    box(0.22, 0.5, 0.11, DARK, { x: -0.6, y: 0.1, z: -0.995, rx: 0.22 }),
    box(0.22, 0.5, 0.11, DARK, { x: 0.0, y: 0.1, z: -0.995, rx: 0.22 }),
    box(0.22, 0.5, 0.11, DARK, { x: 0.6, y: 0.1, z: -0.995, rx: 0.22 }),
    box(0.12, 0.12, 0.4, 0x3a3f4b, { x: -0.3, y: 0.24, z: -0.8 }),
    box(0.12, 0.12, 0.4, 0x3a3f4b, { x: 0.3, y: 0.24, z: -0.8 }),
    box(0.2, 0.1, 0.05, 0xfff1a8, { x: -0.3, y: 0.46, z: -0.67 }),
    box(0.2, 0.1, 0.05, 0xfff1a8, { x: 0.3, y: 0.46, z: -0.67 }),
    ...wheel(-0.48, 0.2, -0.4, 0.2, 0.16),
    ...wheel(0.48, 0.2, -0.4, 0.2, 0.16),
    ...wheel(-0.48, 0.2, 0.7, 0.2, 0.16),
    ...wheel(0.48, 0.2, 0.7, 0.2, 0.16),
  ]);

function speckleAll(parts: Parts, amount: number): Parts {
  parts.forEach((p, i) => speckle(p, amount, i + 1));
  return parts;
}

const CAR_TINTS = [0xe2473c, 0x4f8cff, 0xffc93c, 0x7bd389, 0xf2f2f2, 0x8a8f9a];
const JACKET_TINTS = [0xff5a5a, 0x4f8cff, 0xffc93c, 0x54d17a, 0xc56cf0, 0xff8a3c];
const HOUSE_TINTS = [0xfff1d0, 0xffd9d0, 0xd9ecff, 0xe2f5d5, 0xfde6a8];
const BUILDING_TINTS = [0xe8dcc8, 0xd7c4b0, 0xc9d3de, 0xe6b8a2, 0xb9c6b0];
const BRIGHT_TINTS = [0xe2473c, 0x3f7de0, 0x54b86a, 0xff8a1a, 0xb05fd6, 0xe85a9c];

const gate = (id: string, name: string, zone: number, color: number, build: () => BufferGeometry): ObjectDef => ({
  id, name, plural: `${name}s`, zone, span: [1, 1], size: 1, jitter: 0, footprint: 0.5, weight: 0, color, build, special: 'gate', capacity: 2,
});

const hazard = (
  id: string,
  name: string,
  special: NonNullable<ObjectDef['special']>,
  color: number,
  build: () => BufferGeometry,
  capacity: number,
  flat: boolean,
): ObjectDef => ({ id, name, plural: `${name}s`, zone: 0, span: [0, 0], size: 1, jitter: 0, footprint: 0.7, weight: 0, color, build, special, capacity, flat });

const secret = (id: string, name: string, color: number, build: () => BufferGeometry, weight: number, motion: ObjectDef['motion']): ObjectDef => ({
  id, name, plural: `${name}s`, zone: 0, span: [0, 0], size: 1, jitter: 0, footprint: 0.9, weight, color, build, special: 'secret', motion, capacity: 6,
});

/** World 0: the snowy mountain. The other worlds copy these objects' numbers (see `themed`). */
const MOUNTAIN: ObjectDef[] = [
  // ---- Scene 0: Summit (ball 0.25 → 0.5 m radius)
  { id: 'snowflake', name: 'snowflake', plural: 'snowflakes', zone: 0, span: [0, 1.3], size: 0.06, jitter: 0.15, footprint: 0.9, weight: 3, color: 0x4fbcff, build: snowflake, motion: 'spin' },
  { id: 'mitten', name: 'mitten', plural: 'mittens', zone: 0, span: [0, 1.5], size: 0.1, jitter: 0.15, footprint: 0.6, weight: 2.5, color: RED, build: mitten, tints: BRIGHT_TINTS },
  { id: 'hat', name: 'bobble hat', plural: 'bobble hats', zone: 0, span: [0, 1.8], size: 0.15, jitter: 0.15, footprint: 0.7, weight: 2, color: 0x3f7de0, build: hat, tints: BRIGHT_TINTS },
  { id: 'snowboard', name: 'snowboard', plural: 'snowboards', zone: 0, span: [0.3, 2.2], size: 0.26, jitter: 0.12, footprint: 0.4, weight: 1.5, color: 0xff8a1a, build: snowboard },
  { id: 'iceSpike', name: 'ice spike', plural: 'ice spikes', zone: 0, span: [0.1, 2.4], size: 0.5, jitter: 0.3, footprint: 0.65, weight: 1, color: 0x38a9f0, build: iceSpike },

  // ---- Scene 1: Forest (0.5 → 1.1 m)
  { id: 'rabbit', name: 'rabbit', plural: 'rabbits', zone: 1, span: [-0.3, 1.4], size: 0.24, jitter: 0.1, footprint: 0.6, weight: 2, color: 0xb48c64, build: rabbit, motion: 'hop' },
  { id: 'bush', name: 'bush', plural: 'bushes', zone: 1, span: [-0.1, 1.5], size: 0.38, jitter: 0.2, footprint: 0.8, weight: 3, color: 0x3d8c50, build: bush },
  { id: 'sled', name: 'sled', plural: 'sleds', zone: 1, span: [0, 1.7], size: 0.5, jitter: 0.1, footprint: 0.6, weight: 2, color: 0xc08a4a, build: sled },
  { id: 'skis', name: 'pair of skis', plural: 'pairs of skis', zone: 1, span: [0.2, 1.8], size: 0.62, jitter: 0.1, footprint: 0.45, weight: 1.5, color: RED, build: skis },
  { id: 'smallTree', name: 'small tree', plural: 'small trees', zone: 1, span: [0, 2.3], size: 0.95, jitter: 0.2, footprint: 0.4, weight: 3, color: 0x2f8050, build: smallTree },
  { id: 'bigTree', name: 'big tree', plural: 'big trees', zone: 1, span: [0.3, 3.3], size: 2.1, jitter: 0.2, footprint: 0.36, weight: 2, color: 0x1f6a44, build: bigTree },

  // ---- Scene 2: Frozen Lake (1.1 → 2.4 m)
  { id: 'snowman', name: 'snowman', plural: 'snowmen', zone: 2, span: [0, 1.7], size: 1.3, jitter: 0.2, footprint: 0.6, weight: 2.5, color: 0xdbe6f4, build: snowman },
  { id: 'fishingHut', name: 'fishing hut', plural: 'fishing huts', zone: 2, span: [0.1, 1.8], size: 1.7, jitter: 0.12, footprint: 0.75, weight: 2, color: 0xd9503c, build: fishingHut },
  { id: 'boat', name: 'rowing boat', plural: 'rowing boats', zone: 2, span: [0.15, 2], size: 2.6, jitter: 0.12, footprint: 0.55, weight: 1.5, color: 0x2f6fb5, build: boat },

  // ---- Scene 3: Ski Resort (2.4 → 5 m)
  { id: 'skier', name: 'skier', plural: 'skiers', zone: 3, span: [-0.7, 1.3], size: 1.2, jitter: 0.1, footprint: 0.45, weight: 3, color: 0xff5a5a, build: skier, tints: JACKET_TINTS, motion: 'ski' },
  { id: 'signpost', name: 'signpost', plural: 'signposts', zone: 3, span: [-0.2, 1.4], size: 1.7, jitter: 0.1, footprint: 0.3, weight: 2, color: 0xf2c14e, build: signpost },
  { id: 'snowmobile', name: 'snowmobile', plural: 'snowmobiles', zone: 3, span: [0, 1.5], size: 2.3, jitter: 0.1, footprint: 0.6, weight: 2, color: 0xffc93c, build: snowmobile, tints: [0xe2473c, 0xffc93c, 0x4f8cff, 0xff8a3c] },
  { id: 'liftPole', name: 'chairlift pole', plural: 'chairlift poles', zone: 3, span: [-0.3, 1.8], size: 4.2, jitter: 0.1, footprint: 0.25, weight: 2, color: 0x7c8794, build: liftPole, capacity: 120 },
  { id: 'cabin', name: 'cabin', plural: 'cabins', zone: 3, span: [-0.45, 1.9], size: 4.6, jitter: 0.12, footprint: 0.8, weight: 1.5, color: 0x8a5a3a, build: cabin, capacity: 100 },

  // ---- Scene 4: Village (5 → 10 m)
  { id: 'car', name: 'car', plural: 'cars', zone: 4, span: [-0.3, 1.4], size: 3.6, jitter: 0.1, footprint: 0.65, weight: 3, color: 0x4f8cff, build: car, tints: CAR_TINTS },
  { id: 'shed', name: 'shed', plural: 'sheds', zone: 4, span: [0, 1.5], size: 5, jitter: 0.15, footprint: 0.78, weight: 2, color: 0x9c4a3c, build: shed },
  { id: 'house', name: 'house', plural: 'houses', zone: 4, span: [-0.55, 1.9], size: 9.5, jitter: 0.15, footprint: 0.82, weight: 2.5, color: ROOF, build: house, tints: HOUSE_TINTS, landmark: true, capacity: 120 },
  { id: 'hotel', name: 'hotel', plural: 'hotels', zone: 4, span: [-0.2, 2.5], size: 13, jitter: 0.12, footprint: 0.8, weight: 1, color: 0xead9b8, build: hotel, landmark: true, capacity: 80 },

  // ---- Scene 5: Town (10 → 22 m)
  { id: 'bus', name: 'bus', plural: 'buses', zone: 5, span: [-0.2, 1.4], size: 8, jitter: 0.08, footprint: 0.6, weight: 3, color: 0xffc93c, build: bus, tints: [0xffc93c, 0xe2473c, 0x4f8cff, 0x54d17a] },
  { id: 'building', name: 'building', plural: 'buildings', zone: 5, span: [0, 2], size: 15, jitter: 0.2, footprint: 0.62, weight: 3, color: 0xd7c4b0, build: building, tints: BUILDING_TINTS },
  { id: 'churchTower', name: 'church tower', plural: 'church towers', zone: 5, span: [0.1, 2], size: 27, jitter: 0.08, footprint: 0.42, weight: 1, color: STONE, build: churchTower, landmark: true, capacity: 60 },

  // ---- Scene 6: City (22 → 48 m)
  { id: 'church', name: 'church', plural: 'churches', zone: 6, span: [-0.7, 1], size: 31, jitter: 0.05, footprint: 0.7, weight: 1.5, color: SLATE, build: church, landmark: true, capacity: 60 },
  { id: 'officeTower', name: 'office tower', plural: 'office towers', zone: 6, span: [-0.6, 1], size: 48, jitter: 0.1, footprint: 0.45, weight: 1, color: 0x5b7fa6, build: officeTower, landmark: true, capacity: 50 },

];

/**
 * An object for another world that plays the same part as a mountain object: it copies
 * that object's scene, size, footprint and spawn weight, so every world is balanced the
 * same way, and swaps in its own model and name. E.g. the raptor stands in for the small
 * tree: a hazard early in its scene, a snack later on.
 */
const themed = (
  world: number,
  like: string,
  id: string,
  name: string,
  plural: string,
  color: number,
  build: () => BufferGeometry,
  extra: Partial<ObjectDef> = {},
): ObjectDef => {
  const base = MOUNTAIN.find((def) => def.id === like);
  if (!base) throw new Error(`themed(): no mountain object called "${like}"`);
  return { ...base, tints: undefined, id, name, plural, color, build, world, ...extra };
};

// Number the mountain objects before the other worlds copy them: an object and its
// stand-ins share a slot, which is how a remix world picks one of each (worlds.ts).
MOUNTAIN.forEach((def, i) => (def.slot = i));

/** World 1: the Lost World. */
const LOST_WORLD: ObjectDef[] = [
  themed(1, 'snowflake', 'dragonfly', 'dragonfly', 'dragonflies', 0x2aa6c8, D.dragonfly),
  themed(1, 'mitten', 'mushroom', 'mushroom', 'mushrooms', 0xd9412e, D.mushroom),
  themed(1, 'hat', 'dinoEgg', 'dinosaur egg', 'dinosaur eggs', 0xf2ead2, D.dinoEgg),
  themed(1, 'snowboard', 'fern', 'fern', 'ferns', 0x3f9a4a, D.fern),
  themed(1, 'iceSpike', 'thornBush', 'thorn bush', 'thorn bushes', 0xe0506e, D.thornBush),
  themed(1, 'rabbit', 'compy', 'baby dinosaur', 'baby dinosaurs', 0x6cbf5a, D.compy),
  themed(1, 'bush', 'nest', 'nest', 'nests', 0x8a6a3a, D.nest),
  themed(1, 'sled', 'bonePile', 'pile of bones', 'piles of bones', 0xe8dfc8, D.bonePile),
  themed(1, 'skis', 'cycad', 'cycad', 'cycads', 0x3f9a4a, D.cycad),
  themed(1, 'smallTree', 'raptor', 'raptor', 'raptors', 0x2f9a9a, D.raptor),
  themed(1, 'bigTree', 'palm', 'palm tree', 'palm trees', 0x6fbf5a, D.palm),
  themed(1, 'snowman', 'giantMushroom', 'giant mushroom', 'giant mushrooms', 0x8a4fd0, D.giantMushroom),
  themed(1, 'fishingHut', 'pterodactyl', 'pterodactyl', 'pterodactyls', 0xc87a4a, D.pterodactyl),
  themed(1, 'boat', 'stego', 'stegosaurus', 'stegosauruses', 0x5f9a4a, D.stego),
  themed(1, 'skier', 'gallimimus', 'gallimimus', 'gallimimuses', 0xf08a2a, D.gallimimus, { tints: [0xf08a2a, 0xe2c14e, 0x7fb4e8, 0xd97a9a, 0x9ad06a] }),
  themed(1, 'signpost', 'treeFern', 'tree fern', 'tree ferns', 0x3f9a4a, D.cycad),
  themed(1, 'snowmobile', 'trike', 'triceratops', 'triceratopses', 0xb5764a, D.trike),
  themed(1, 'liftPole', 'tallPalm', 'giant palm', 'giant palms', 0x6fbf5a, D.palm),
  themed(1, 'cabin', 'ribcage', 'fossil skeleton', 'fossil skeletons', 0xe8dfc8, D.ribcage),
  themed(1, 'car', 'ankylo', 'ankylosaurus', 'ankylosauruses', 0x8a7a4a, D.ankylo),
  themed(1, 'shed', 'boulders', 'mossy boulder', 'mossy boulders', 0x8a7a6a, D.boulders),
  themed(1, 'house', 'trex', 'T. rex', 'T. rexes', 0xa8502f, D.trex),
  themed(1, 'hotel', 'brachio', 'brachiosaurus', 'brachiosauruses', 0x6f8fa8, D.brachio),
  themed(1, 'bus', 'allosaurus', 'allosaurus', 'allosauruses', 0x4f8a6a, D.allosaurus),
  themed(1, 'building', 'rockSpire', 'rock spire', 'rock spires', 0xb8714a, D.rockSpire),
  themed(1, 'churchTower', 'sequoia', 'giant sequoia', 'giant sequoias', 0x2a7448, D.sequoia),
  themed(1, 'church', 'volcano', 'volcano', 'volcanoes', 0x5a4640, D.volcano),
  themed(1, 'officeTower', 'superVolcano', 'super volcano', 'super volcanoes', 0xff7a1a, D.superVolcano),
];

/** World 2: Space. */
const SPACE: ObjectDef[] = [
  themed(2, 'snowflake', 'starBit', 'star bit', 'star bits', 0xffd23f, S.starBit),
  themed(2, 'mitten', 'moonRock', 'moon rock', 'moon rocks', 0x8a8478, S.moonRock),
  themed(2, 'hat', 'helmet', 'space helmet', 'space helmets', 0xe8ecf2, S.helmet),
  themed(2, 'snowboard', 'flag', 'flag', 'flags', RED, S.flag),
  themed(2, 'iceSpike', 'spaceMine', 'space mine', 'space mines', 0x3a3f4b, S.spaceMine),
  themed(2, 'rabbit', 'alien', 'little alien', 'little aliens', 0x7fd65a, S.alien),
  themed(2, 'bush', 'crate', 'supply crate', 'supply crates', 0xe2b23c, S.crate),
  themed(2, 'sled', 'rover', 'moon rover', 'moon rovers', 0xe8ecf2, S.rover),
  themed(2, 'skis', 'antenna', 'antenna', 'antennas', 0x8a93a3, S.antenna),
  themed(2, 'smallTree', 'rocket', 'rocket', 'rockets', RED, S.rocket),
  themed(2, 'bigTree', 'bigRocket', 'booster rocket', 'booster rockets', RED, S.bigRocket),
  themed(2, 'snowman', 'astronaut', 'astronaut', 'astronauts', 0xe8ecf2, S.astronaut),
  themed(2, 'fishingHut', 'lander', 'lunar lander', 'lunar landers', 0xe2b23c, S.lander),
  themed(2, 'boat', 'ufo', 'UFO', 'UFOs', 0x7fe8ff, S.ufo),
  themed(2, 'skier', 'scout', 'scout saucer', 'scout saucers', 0x7fe8ff, S.ufo, { tints: [0xff7a5a, 0x7fe8ff, 0xffd23f, 0x9ad06a, 0xd08aff] }),
  themed(2, 'signpost', 'beacon', 'beacon', 'beacons', RED, S.antenna),
  themed(2, 'snowmobile', 'satellite', 'satellite', 'satellites', 0x2f5fc8, S.satellite),
  themed(2, 'liftPole', 'obelisk', 'alien obelisk', 'alien obelisks', 0x3a4060, S.obelisk),
  themed(2, 'cabin', 'habitat', 'moon base', 'moon bases', 0xe8ecf2, S.habitat),
  themed(2, 'car', 'shuttle', 'space shuttle', 'space shuttles', 0xe8ecf2, S.shuttle),
  themed(2, 'shed', 'asteroid', 'asteroid', 'asteroids', 0x7a7068, S.asteroid),
  themed(2, 'house', 'station', 'space station', 'space stations', 0x2f5fc8, S.station),
  themed(2, 'hotel', 'moon', 'moon', 'moons', 0xc8ccd6, S.moon),
  themed(2, 'bus', 'freighter', 'space freighter', 'space freighters', 0xc9ced6, S.shuttle),
  themed(2, 'building', 'bluePlanet', 'blue planet', 'blue planets', 0x5a8fd0, S.gasGiant),
  themed(2, 'churchTower', 'megaRocket', 'mega rocket', 'mega rockets', RED, S.bigRocket),
  themed(2, 'church', 'ringedPlanet', 'ringed planet', 'ringed planets', 0xe8b070, S.ringedPlanet),
  themed(2, 'officeTower', 'star', 'star', 'stars', 0xffc23a, S.star),
];

const SWEET_TINTS = [0xff5a7a, 0xffd23f, 0x7fe0c0, 0x6aa8ff, 0xb06aff, 0xff9a3c];
const PALE_TINTS = [0xffffff, 0xd8ffe8, 0xe0d8ff, 0xc8f0ff, 0xfff0c8];

/** World 3: Candy World. */
const CANDY: ObjectDef[] = [
  themed(3, 'snowflake', 'sugarStar', 'sugar star', 'sugar stars', 0xff7ab8, C.sugarStar),
  themed(3, 'mitten', 'gumdrop', 'gumdrop', 'gumdrops', 0xd81e3a, C.gumdrop(0xd81e3a)),
  themed(3, 'hat', 'macaron', 'macaron', 'macarons', 0xff7ab8, C.macaron),
  themed(3, 'snowboard', 'candyBar', 'candy bar', 'candy bars', 0xe8408a, C.candyBar),
  themed(3, 'iceSpike', 'rockCandy', 'rock candy', 'rock candies', 0xb06aff, C.rockCandy),
  themed(3, 'rabbit', 'gummyBear', 'gummy bear', 'gummy bears', 0xff5a7a, C.gummyBear(0xff5a7a)),
  themed(3, 'bush', 'cottonCandy', 'candy floss', 'candy flosses', 0xff7ab8, C.cottonCandy),
  themed(3, 'sled', 'cookie', 'cookie', 'cookies', 0xe0b070, C.cookie),
  themed(3, 'skis', 'wafer', 'wafer', 'wafers', 0xe0b070, C.wafer),
  themed(3, 'smallTree', 'lollipop', 'lollipop', 'lollipops', 0xd81e3a, C.lollipop(0xd81e3a, 0xfdfdfd)),
  themed(3, 'bigTree', 'giantLollipop', 'giant lollipop', 'giant lollipops', 0x6aa8ff, C.ballPop([0x6aa8ff, 0xfdfdfd, 0xff7ab8, 0xfdfdfd, 0xffd84a, 0xfdfdfd, 0x6aa8ff])),
  themed(3, 'snowman', 'gingerbreadMan', 'gingerbread man', 'gingerbread men', 0xb8743a, C.gingerbreadMan),
  themed(3, 'fishingHut', 'cupcake', 'cupcake', 'cupcakes', 0xff7ab8, C.cupcake),
  themed(3, 'boat', 'doughnut', 'doughnut', 'doughnuts', 0xff7ab8, C.doughnut),
  themed(3, 'skier', 'jellyBaby', 'jelly baby', 'jelly babies', 0x7fe0c0, C.gummyBear(0xffffff), { tints: SWEET_TINTS }),
  themed(3, 'signpost', 'candyCane', 'candy cane', 'candy canes', 0xd81e3a, C.candyCane(0xd81e3a, 0xfdfdfd, 1.5)),
  themed(3, 'snowmobile', 'iceCream', 'ice cream', 'ice creams', 0xff7ab8, C.iceCream),
  themed(3, 'liftPole', 'giantCane', 'giant candy cane', 'giant candy canes', 0x3fb85a, C.candyCane(0x3fb85a, 0xfdfdfd, 1.6)),
  themed(3, 'cabin', 'gingerbreadHouse', 'gingerbread house', 'gingerbread houses', 0xb8743a, C.gingerbreadHouse(0xfdfdfd)),
  themed(3, 'car', 'swissRoll', 'swiss roll', 'swiss rolls', 0x6a3e22, C.swissRoll),
  themed(3, 'shed', 'jelly', 'jelly', 'jellies', 0xff6a8a, C.jelly),
  themed(3, 'house', 'cookieCottage', 'cookie cottage', 'cookie cottages', 0xff7ab8, C.gingerbreadHouse(0xff7ab8)),
  themed(3, 'hotel', 'birthdayCake', 'birthday cake', 'birthday cakes', 0xff7ab8, C.layerCake(2, 0xf2d6a0, 0xff7ab8, 0xd81e3a)),
  themed(3, 'bus', 'chocBar', 'chocolate bar', 'chocolate bars', 0x6a3e22, C.chocBar),
  themed(3, 'building', 'pancakeStack', 'stack of pancakes', 'stacks of pancakes', 0xe0a858, C.pancakeStack),
  themed(3, 'churchTower', 'sundae', 'ice cream sundae', 'ice cream sundaes', 0xff7ab8, C.sundae),
  themed(3, 'church', 'weddingCake', 'wedding cake', 'wedding cakes', 0xfdfdfd, C.layerCake(3, 0xfff4e0, 0xfdfdfd, 0xff7ab8)),
  themed(3, 'officeTower', 'candyCastle', 'candy castle', 'candy castles', 0xff7ab8, C.candyCastle),
];

/** World 4: the Ancient Desert. */
const DESERT: ObjectDef[] = [
  themed(4, 'snowflake', 'scarab', 'scarab', 'scarabs', 0x2a5ac8, E.scarab),
  themed(4, 'mitten', 'coins', 'pile of coins', 'piles of coins', 0xf2c230, E.coins),
  themed(4, 'hat', 'clayPot', 'clay pot', 'clay pots', 0xc87a44, E.clayPot),
  themed(4, 'snowboard', 'rug', 'rug', 'rugs', 0xc8402a, E.rug),
  themed(4, 'iceSpike', 'cactus', 'cactus', 'cacti', 0x4a9a52, E.cactus),
  themed(4, 'rabbit', 'fennec', 'desert fox', 'desert foxes', 0xc89a5a, E.fennec),
  themed(4, 'bush', 'tumbleweed', 'tumbleweed', 'tumbleweeds', 0xa8864a, E.tumbleweed),
  themed(4, 'sled', 'sarcophagus', 'sarcophagus', 'sarcophagi', 0xf2c230, E.sarcophagus),
  themed(4, 'skis', 'scroll', 'scroll', 'scrolls', 0xf2ead8, E.scroll),
  themed(4, 'smallTree', 'datePalm', 'date palm', 'date palms', 0x4a9a3a, E.datePalm(0.6)),
  themed(4, 'bigTree', 'tallPalmTree', 'tall palm', 'tall palms', 0x4a9a3a, E.datePalm(-1)),
  themed(4, 'snowman', 'mummy', 'mummy', 'mummies', 0xf2ead8, E.mummy),
  themed(4, 'fishingHut', 'tent', 'tent', 'tents', 0xc8402a, E.tent),
  themed(4, 'boat', 'reedBoat', 'reed boat', 'reed boats', 0xc8a060, E.reedBoat(0xc8a060, 0xf2ead8, 0xc8402a)),
  themed(4, 'skier', 'nomad', 'desert runner', 'desert runners', 0x2aa6a0, E.nomad, { tints: [0xf2ead8, 0x2aa6a0, 0xc8402a, 0x2a5ac8, 0xf2c230] }),
  themed(4, 'signpost', 'torch', 'torch', 'torches', 0xff7a1a, E.torch),
  themed(4, 'snowmobile', 'chariot', 'chariot', 'chariots', 0xf2c230, E.chariot),
  themed(4, 'liftPole', 'obeliskStone', 'obelisk', 'obelisks', 0xd2b078, E.obelisk(0xd2b078, 0x2a5ac8)),
  themed(4, 'cabin', 'mudHouse', 'mud-brick house', 'mud-brick houses', 0xc49a62, E.mudHouse),
  themed(4, 'car', 'camel', 'camel', 'camels', 0xc89a5a, E.camel),
  themed(4, 'shed', 'ruin', 'ruined columns', 'ruined columns', 0xd2b078, E.ruin),
  themed(4, 'house', 'temple', 'temple', 'temples', 0xe2c388, E.temple),
  themed(4, 'hotel', 'sphinx', 'sphinx', 'sphinxes', 0xd2b078, E.sphinx),
  themed(4, 'bus', 'royalBarge', 'royal barge', 'royal barges', 0xf2c230, E.reedBoat(0xe0a820, 0x8a3ab0, 0x2a5ac8)),
  themed(4, 'building', 'watchtower', 'watchtower', 'watchtowers', 0xc49a62, E.watchtower),
  themed(4, 'churchTower', 'greatObelisk', 'great obelisk', 'great obelisks', 0x8a6a5a, E.obelisk(0x8a6a5a, 0xf2c230)),
  themed(4, 'church', 'stepPyramid', 'step pyramid', 'step pyramids', 0xd2b078, E.pyramid(5, 0xd2b078, 0xf2c230)),
  themed(4, 'officeTower', 'greatPyramid', 'great pyramid', 'great pyramids', 0xe2c388, E.pyramid(0, 0xe2c388, 0xf2c230)),
];

/** World 5: Under the Sea. */
const SEA: ObjectDef[] = [
  themed(5, 'snowflake', 'bubble', 'bubble', 'bubbles', 0xbfeaff, U.bubble),
  themed(5, 'mitten', 'shell', 'seashell', 'seashells', 0xff9ab0, U.shell),
  themed(5, 'hat', 'starfish', 'starfish', 'starfish', 0xff8a2a, U.starfish),
  themed(5, 'snowboard', 'ray', 'stingray', 'stingrays', 0x5a7aa8, U.ray),
  themed(5, 'iceSpike', 'urchin', 'sea urchin', 'sea urchins', 0x6a4aa8, U.urchin),
  themed(5, 'rabbit', 'crab', 'crab', 'crabs', 0xff6a5a, U.crab),
  themed(5, 'bush', 'anemone', 'anemone', 'anemones', 0xff9ab0, U.anemone),
  themed(5, 'sled', 'clam', 'clam', 'clams', 0xd8c8b0, U.clam(0xd8c8b0, 0xff9ab0)),
  themed(5, 'skis', 'eel', 'eel', 'eels', 0x3f8a6a, U.eel),
  themed(5, 'smallTree', 'seaweed', 'seaweed', 'clumps of seaweed', 0x2f8a4a, U.seaweed),
  themed(5, 'bigTree', 'coralTree', 'coral', 'corals', 0xff6a5a, U.coralTree(0xff6a5a, 0xff9ab0)),
  themed(5, 'snowman', 'clownfish', 'clownfish', 'clownfish', 0xff8a2a, U.fish(0xff8a2a, 0xf4f0e8)),
  themed(5, 'fishingHut', 'treasureChest', 'treasure chest', 'treasure chests', 0xf2c230, U.treasureChest),
  themed(5, 'boat', 'turtle', 'sea turtle', 'sea turtles', 0x4a8a4a, U.turtle),
  themed(5, 'skier', 'jellyfish', 'jellyfish', 'jellyfish', 0xff9ab0, U.jellyfish, { tints: [0xff9ab0, 0xb8a0ff, 0x8ad8ff, 0xfff0a0, 0x9af0d0] }),
  themed(5, 'signpost', 'anchor', 'anchor', 'anchors', 0x8a98a8, U.anchor),
  themed(5, 'snowmobile', 'dolphin', 'dolphin', 'dolphins', 0x6a9ac8, U.dolphin),
  themed(5, 'liftPole', 'mast', "ship's mast", "ship's masts", 0x7a5232, U.mast),
  themed(5, 'cabin', 'divingBell', 'diving bell', 'diving bells', 0xc89a3a, U.divingBell),
  themed(5, 'car', 'shark', 'shark', 'sharks', 0x6a7a8a, U.shark),
  themed(5, 'shed', 'giantClam', 'giant clam', 'giant clams', 0x8a6ad0, U.clam(0x8a6ad0, 0x7ae0e8)),
  themed(5, 'house', 'submarine', 'submarine', 'submarines', 0xf2c230, U.submarine),
  themed(5, 'hotel', 'shipwreck', 'shipwreck', 'shipwrecks', 0x7a5232, U.shipwreck),
  themed(5, 'bus', 'whale', 'whale', 'whales', 0x1e4a8a, U.whale),
  themed(5, 'building', 'lighthouse', 'sunken lighthouse', 'sunken lighthouses', 0xc8402a, U.lighthouse),
  themed(5, 'churchTower', 'tentacle', 'kraken tentacle', 'kraken tentacles', 0x9a4a9a, U.tentacle),
  themed(5, 'church', 'seaTemple', 'sunken temple', 'sunken temples', 0x2ab0a8, U.seaTemple),
  themed(5, 'officeTower', 'atlantisTower', 'tower of Atlantis', 'towers of Atlantis', 0x8ae0e8, U.atlantisTower),
];

/** World 6: Spooky Hollow. */
const SPOOKY: ObjectDef[] = [
  themed(6, 'snowflake', 'bat', 'bat', 'bats', 0x3a3050, H.bat),
  themed(6, 'mitten', 'candles', 'candle stub', 'candle stubs', 0xece4d0, H.candles),
  themed(6, 'hat', 'skull', 'skull', 'skulls', 0xece4d0, H.skull),
  themed(6, 'snowboard', 'bone', 'bone', 'bones', 0xece4d0, H.bone),
  themed(6, 'iceSpike', 'deadThorns', 'thorn tangle', 'thorn tangles', 0x4a3a32, H.thorns),
  themed(6, 'rabbit', 'blackCat', 'black cat', 'black cats', 0x2a2438, H.blackCat),
  themed(6, 'bush', 'pumpkin', 'pumpkin', 'pumpkins', 0xff7a1a, H.pumpkin),
  themed(6, 'sled', 'coffin', 'coffin', 'coffins', 0x4a3a32, H.coffin),
  themed(6, 'skis', 'broomstick', 'broomstick', 'broomsticks', 0xd8b04a, H.broomstick),
  themed(6, 'smallTree', 'deadTree', 'dead tree', 'dead trees', 0x4a3a32, H.deadTree(1)),
  themed(6, 'bigTree', 'gnarledTree', 'gnarled tree', 'gnarled trees', 0x4a3a32, H.deadTree(-2)),
  themed(6, 'snowman', 'scarecrow', 'scarecrow', 'scarecrows', 0xd8b04a, H.scarecrow),
  themed(6, 'fishingHut', 'gravestones', 'gravestone', 'gravestones', 0x8a8a96, H.gravestones),
  themed(6, 'boat', 'cauldron', 'cauldron', 'cauldrons', 0x8ae04a, H.cauldron),
  themed(6, 'skier', 'ghost', 'ghost', 'ghosts', 0xd8ffe8, H.ghost(0xffffff), { tints: PALE_TINTS }),
  themed(6, 'signpost', 'lamppost', 'lamp post', 'lamp posts', 0xffd84a, H.lamppost),
  themed(6, 'snowmobile', 'pumpkinCart', 'pumpkin cart', 'pumpkin carts', 0xff7a1a, H.pumpkinCart),
  themed(6, 'liftPole', 'twistedTree', 'twisted tree', 'twisted trees', 0x4a3a32, H.deadTree(2.5)),
  themed(6, 'cabin', 'mausoleum', 'mausoleum', 'mausoleums', 0x8a8a96, H.mausoleum),
  themed(6, 'car', 'carriage', 'black carriage', 'black carriages', 0x5a3a8a, H.carriage(0x2a2438, 0x5a3a8a)),
  themed(6, 'shed', 'well', 'wishing well', 'wishing wells', 0x8a8a96, H.well),
  themed(6, 'house', 'hauntedHouse', 'haunted house', 'haunted houses', 0x5a3a8a, H.hauntedHouse(false, 0x9484ac, 0x54407a)),
  themed(6, 'hotel', 'manor', 'haunted manor', 'haunted manors', 0x5a3a8a, H.hauntedHouse(true, 0x8880a0, 0x3e3460)),
  themed(6, 'bus', 'ghostCoach', 'ghost coach', 'ghost coaches', 0x8ae04a, H.carriage(0x3a5a4a, 0x8ae04a)),
  themed(6, 'building', 'clockTower', 'clock tower', 'clock towers', 0x8a8a96, H.clockTower),
  themed(6, 'churchTower', 'witchTower', "witch's tower", "witch's towers", 0x8a5ad0, H.witchTower),
  themed(6, 'church', 'chapel', 'chapel', 'chapels', 0x8a8a96, H.chapel),
  themed(6, 'officeTower', 'vampireCastle', "vampire's castle", "vampire's castles", 0xa8202a, H.vampireCastle),
];

/** World 7: the Toy Room. */
const TOYS: ObjectDef[] = [
  themed(7, 'snowflake', 'jack', 'jack', 'jacks', 0xe8402a, T.jack),
  themed(7, 'mitten', 'button', 'button', 'buttons', 0x2f7de0, T.button),
  themed(7, 'hat', 'dice', 'dice', 'dice', 0xf4f4f4, T.dice),
  themed(7, 'snowboard', 'crayon', 'crayon', 'crayons', 0x3fb85a, T.crayon),
  themed(7, 'iceSpike', 'pushpin', 'drawing pin', 'drawing pins', 0xe8402a, T.pushpin),
  themed(7, 'rabbit', 'windupMouse', 'wind-up mouse', 'wind-up mice', 0x9aa4b0, T.windupMouse),
  themed(7, 'bush', 'rubberBall', 'rubber ball', 'rubber balls', 0xe8402a, T.rubberBall),
  themed(7, 'sled', 'skateboard', 'skateboard', 'skateboards', 0xff8a2a, T.skateboard),
  themed(7, 'skis', 'domino', 'domino', 'dominoes', 0x26262e, T.domino),
  themed(7, 'smallTree', 'stackRings', 'ring stacker', 'ring stackers', 0xffd23f, T.stackRings),
  themed(7, 'bigTree', 'toyTree', 'toy tree', 'toy trees', 0x3fb85a, T.toyTree),
  themed(7, 'snowman', 'teddy', 'teddy bear', 'teddy bears', 0xb8824a, T.teddy),
  themed(7, 'fishingHut', 'jackInBox', 'jack-in-the-box', 'jack-in-the-boxes', 0xe8402a, T.jackInBox),
  themed(7, 'boat', 'toyBoat', 'toy boat', 'toy boats', 0xe8402a, T.toyBoat),
  themed(7, 'skier', 'tinRobot', 'tin robot', 'tin robots', 0x2f7de0, T.robot, { tints: BRIGHT_TINTS }),
  themed(7, 'signpost', 'pinwheel', 'pinwheel', 'pinwheels', 0xffd23f, T.pinwheel),
  themed(7, 'snowmobile', 'toyCar', 'toy car', 'toy cars', 0x2f7de0, T.toyCar(0x2f7de0)),
  themed(7, 'liftPole', 'pencil', 'pencil', 'pencils', 0xffd23f, T.pencil),
  themed(7, 'cabin', 'blockHouse', 'block house', 'block houses', 0x2f7de0, T.blockHouse),
  themed(7, 'car', 'toyTruck', 'toy truck', 'toy trucks', 0xffd23f, T.toyTruck),
  themed(7, 'shed', 'drum', 'drum', 'drums', 0xe8402a, T.drum),
  themed(7, 'house', 'dollhouse', 'dollhouse', 'dollhouses', 0xffc0d8, T.dollhouse),
  themed(7, 'hotel', 'fort', 'toy fort', 'toy forts', 0xd8a868, T.fort(0xd8a868, 0xe8402a, 0x2f7de0)),
  themed(7, 'bus', 'toyTrain', 'toy train', 'toy trains', 0xe8402a, T.toyTrain),
  themed(7, 'building', 'blockTower', 'block tower', 'block towers', 0xffd23f, T.blockTower),
  themed(7, 'churchTower', 'toyRocket', 'toy rocket', 'toy rockets', 0xe8402a, T.toyRocket),
  themed(7, 'church', 'toyCastle', 'toy castle', 'toy castles', 0xa8b0bc, T.fort(0xb8c0cc, 0x2f7de0, 0xffd23f)),
  themed(7, 'officeTower', 'giantRobot', 'giant robot', 'giant robots', 0xe8402a, T.giantRobot),
];

/** World 8: the Sky Kingdom. */
const SKY: ObjectDef[] = [
  themed(8, 'snowflake', 'feather', 'feather', 'feathers', 0x8ac8ff, K.feather),
  themed(8, 'mitten', 'paperPlane', 'paper plane', 'paper planes', 0xf0f0f6, K.paperPlane),
  themed(8, 'hat', 'cloudPuff', 'little cloud', 'little clouds', 0xdce8f6, K.cloud(1.6, 0.5)),
  themed(8, 'snowboard', 'kite', 'kite', 'kites', 0xe8402a, K.kite),
  themed(8, 'iceSpike', 'thunderbolt', 'lightning bolt', 'lightning bolts', 0xffe23a, K.thunderbolt),
  themed(8, 'rabbit', 'bird', 'bluebird', 'bluebirds', 0x4a9ae8, K.bird),
  themed(8, 'bush', 'fluffyCloud', 'fluffy cloud', 'fluffy clouds', 0xdce8f6, K.cloud(1.9, 0.75)),
  themed(8, 'sled', 'hangGlider', 'hang glider', 'hang gliders', 0xffd23f, K.hangGlider),
  themed(8, 'skis', 'rainbow', 'rainbow', 'rainbows', 0xff8a2a, K.rainbow),
  themed(8, 'smallTree', 'balloon', 'balloon', 'balloons', 0xe8402a, K.balloon(0xe8402a)),
  themed(8, 'bigTree', 'balloonBunch', 'bunch of balloons', 'bunches of balloons', 0x3f8ae8, K.balloonBunch),
  themed(8, 'snowman', 'windsock', 'windsock', 'windsocks', 0xff8a2a, K.windsock),
  themed(8, 'fishingHut', 'hotAirBalloon', 'hot air balloon', 'hot air balloons', 0xe8402a, K.hotAirBalloon),
  themed(8, 'boat', 'blimp', 'blimp', 'blimps', 0xc8d0dc, K.blimp(0xc8d0dc, 0xe8402a, false)),
  themed(8, 'skier', 'parachutist', 'parachutist', 'parachutists', 0xff8a2a, K.parachutist, { tints: BRIGHT_TINTS }),
  themed(8, 'signpost', 'weatherVane', 'weather vane', 'weather vanes', 0xf2c230, K.weatherVane),
  themed(8, 'snowmobile', 'biplane', 'biplane', 'biplanes', 0xe8402a, K.biplane),
  themed(8, 'liftPole', 'windTurbine', 'wind turbine', 'wind turbines', 0xf0f0f6, K.windTurbine),
  themed(8, 'cabin', 'cloudHouse', 'cloud house', 'cloud houses', 0x3f8ae8, K.cloudHouse),
  themed(8, 'car', 'helicopter', 'helicopter', 'helicopters', 0x4ab85a, K.helicopter),
  themed(8, 'shed', 'thundercloud', 'thundercloud', 'thunderclouds', 0x5a6478, K.thundercloud(false)),
  themed(8, 'house', 'airship', 'airship', 'airships', 0xf2c230, K.blimp(0xe8c070, 0x3f8ae8, true)),
  themed(8, 'hotel', 'floatingIsland', 'floating island', 'floating islands', 0x5aa84a, K.floatingIsland),
  themed(8, 'bus', 'airliner', 'airliner', 'airliners', 0xf0f0f6, K.airliner),
  themed(8, 'building', 'skyTower', 'sky tower', 'sky towers', 0x3f8ae8, K.skyTower),
  themed(8, 'churchTower', 'beanstalk', 'beanstalk', 'beanstalks', 0x4ab85a, K.beanstalk),
  themed(8, 'church', 'skyTemple', 'sky temple', 'sky temples', 0xf2c230, K.skyTemple),
  themed(8, 'officeTower', 'cloudPalace', 'cloud palace', 'cloud palaces', 0xff7ab8, K.cloudPalace),
];

export const OBJECT_DEFS: ObjectDef[] = [
  ...MOUNTAIN,
  ...LOST_WORLD,
  ...SPACE,
  ...CANDY,
  ...DESERT,
  ...SEA,
  ...SPOOKY,
  ...TOYS,
  ...SKY,

  // ---- Gates: one wall at the end of each scene (named by `gate` in config.ts ZONES for
  // the mountain, and in worlds.ts for the other worlds)
  gate('iceWall', 'ice wall', 0, 0x4fb6f5, iceWall),
  gate('logWall', 'log pile', 1, 0x8a5a3a, logWall),
  gate('plankWall', 'boathouse fence', 2, 0xb9833f, plankWall),
  gate('netWall', 'safety net', 3, 0xff7a1a, netWall),
  gate('stoneWall', 'village wall', 4, 0x9a9288, stoneWall),
  gate('roadblock', 'roadblock', 5, 0xe2473c, roadblock),
  gate('dam', 'dam', 6, 0x9aa3ad, dam),
  // Lost World
  gate('bambooWall', 'bamboo fence', 0, 0x9ac85a, D.bambooWall),
  gate('vineWall', 'vine wall', 2, 0x3f9a4a, D.vineWall),
  gate('boneWall', 'bone fence', 3, 0xe8dfc8, D.boneWall),
  gate('redRockWall', 'rock slide', 4, 0xb8714a, S.rockWall(0xb8714a, 0x9a5a3a)),
  gate('ashWall', 'ash heap', 5, 0x4a4046, S.rockWall(0x4a4046, 0x5e525a)),
  gate('lavaWall', 'lava wall', 6, 0xff7a1a, D.moltenWall(0x3a2a2c, 0xff7a1a, 0xffd23f)),
  // Space
  gate('junkWall', 'space junk', 0, 0xe2b23c, S.junkWall),
  gate('moonWall', 'crater rim', 1, 0xb8bcc8, S.rockWall(0xb8bcc8, 0x8a8e9a)),
  gate('laserWall', 'laser fence', 2, 0xff3b30, S.laserWall),
  gate('marsWall', 'canyon wall', 3, 0xc8683a, S.rockWall(0xc8683a, 0x9a4a28)),
  gate('ringWall', 'ice ring', 4, 0x9a7ae8, S.crystalWall(0x5a3ac8, 0xd8c8ff)),
  gate('plasmaWall', 'solar flare', 5, 0xffc23a, D.moltenWall(0x8a2a10, 0xffd23f, 0xfff4b8)),
  gate('voidWall', 'event horizon', 6, 0xb06aff, S.voidWall),

  // Candy World
  gate('caneWall', 'candy cane fence', 0, 0xd81e3a, C.caneWall),
  gate('waferWall', 'wafer wall', 1, 0xe0b070, C.slabWall(0xe0b070, 0xd8a460, 0xff7ab8, 0xfff4e0)),
  gate('jellyWall', 'jelly wall', 2, 0xff6a8a, S.crystalWall(0xc81e4a, 0xff9ab0)),
  gate('cookieWall', 'cookie wall', 3, 0xe0b070, C.cookieWall),
  gate('gingerWall', 'gingerbread wall', 4, 0xb8743a, C.slabWall(0xb8743a, 0xa8642e, 0xfdfdfd, 0xd81e3a)),
  gate('chocWall', 'chocolate wall', 5, 0x6a3e22, C.slabWall(0x6a3e22, 0x4a2a16, 0x8a5a36, 0xfff4e0)),
  gate('cakeWall', 'giant cake', 6, 0xff7ab8, C.cakeWall),
  // Ancient Desert
  gate('stakeWall', 'stake fence', 0, 0x8a5a32, E.stakeWall),
  gate('mudWall', 'mud-brick wall', 1, 0xc49a62, E.blockWall(0xc49a62, 0xb08a54, 0x8a6238)),
  gate('sandRockWall', 'rock fall', 2, 0xd2b078, S.rockWall(0xd2b078, 0xa88656)),
  gate('columnWall', 'colonnade', 3, 0xf2ead8, E.columnWall),
  gate('tombWall', 'tomb wall', 4, 0xd2b078, E.blockWall(0xd2b078, 0xa88656, 0xf2c230)),
  gate('obeliskWall', 'row of obelisks', 5, 0xe2c388, E.obeliskWall),
  gate('pyramidWall', 'pyramid wall', 6, 0xe2c388, E.pyramidWall),
  // Under the Sea
  gate('coralWall', 'coral reef', 0, 0xff6a5a, U.coralWall),
  gate('kelpWall', 'kelp curtain', 1, 0x2f8a4a, U.kelpWall),
  gate('fishNet', 'fishing net', 2, 0xff7a1a, netWall),
  gate('hullWall', 'wrecked hull', 3, 0x7a5232, plankWall),
  gate('chainWall', 'anchor chains', 4, 0x8a98a8, U.chainWall),
  gate('trenchWall', 'trench rocks', 5, 0x3a5470, S.rockWall(0x3a5470, 0x2a3e5e)),
  gate('atlantisWall', 'crystal gate', 6, 0x8ae0e8, S.crystalWall(0x1a6a8a, 0xb8fff4)),
  // Spooky Hollow
  gate('pumpkinWall', 'row of pumpkins', 0, 0xff7a1a, H.pumpkinWall),
  gate('graveWall', 'row of tombstones', 1, 0x8a8a96, H.graveWall),
  gate('thornWall', 'thorn hedge', 2, 0x4a3a32, H.thornWall),
  gate('ironFence', 'iron fence', 3, 0x2c2c36, H.ironFence),
  gate('mossWall', 'mossy stones', 4, 0x4a6a3e, S.rockWall(0x4a6a3e, 0x5a5e66)),
  gate('cryptWall', 'crypt wall', 5, 0x5e5e6c, E.blockWall(0x5e5e6c, 0x4a4458, 0x8a5ad0)),
  gate('castleWall', 'castle wall', 6, 0xa8202a, H.battlement(0x4a4458, 0x3a3448, 0xa8202a)),
  // Toy Room
  gate('abcWall', 'alphabet blocks', 0, 0xffd23f, T.abcWall),
  gate('dominoWall', 'row of dominoes', 1, 0x26262e, T.dominoWall),
  gate('pencilWall', 'pencil fence', 2, 0xffd23f, T.pencilWall),
  gate('bookWall', 'row of books', 3, 0x2f7de0, T.bookWall),
  gate('raceWall', 'crash barrier', 4, 0xe8402a, E.blockWall(0xe8402a, 0xf4f4f4, 0x26262e)),
  gate('brickWall', 'brick wall', 5, 0xc8502f, C.slabWall(0xc8502f, 0xb04428, 0xe8dcc8, 0xe8dcc8)),
  gate('pillowWall', 'pillow fort', 6, 0xffc0d8, T.pillowWall),
  // Sky Kingdom
  gate('buntingWall', 'bunting', 0, 0xe8402a, K.buntingWall),
  gate('cloudWall', 'cloud bank', 1, 0xdce8f6, K.cloudWall(false)),
  gate('balloonWall', 'wall of balloons', 2, 0xe8402a, K.balloonWall),
  gate('rainbowWall', 'rainbow', 3, 0xff8a2a, K.rainbowWall),
  gate('stormWall', 'thundercloud', 4, 0x5a6478, K.cloudWall(true)),
  gate('isleWall', 'floating rocks', 5, 0x8a6a4a, S.rockWall(0x8a6a4a, 0x5aa84a)),
  gate('auroraWall', 'aurora', 6, 0x7ae0c0, S.crystalWall(0x2a8a7a, 0xb8ffe0)),

  // Each world's stand-in for the snowplough: the thing that charges up the slope at you.
  { ...hazard('stampede', 'charging triceratops', 'plough', 0xc8502f, D.chargingTrike, 24, false), height: 1.4 },
  { ...hazard('meteor', 'meteor', 'plough', 0x9fe6ff, S.comet, 24, false), height: 1.5 },
  { ...hazard('gobstopper', 'giant gobstopper', 'plough', 0xd81e3a, C.gobstopper, 24, false), height: 1.5 },
  { ...hazard('chariotCharge', 'charging chariot', 'plough', 0xf2c230, E.chariot, 24, false), height: 1.4 },
  { ...hazard('sharkAttack', 'hungry shark', 'plough', 0x6a7a8a, U.shark, 24, false), height: 1.2 },
  { ...hazard('ghoul', 'angry ghost', 'plough', 0xb8ffd8, H.ghost(0xb8ffd8), 24, false), height: 1.5 },
  { ...hazard('windupCar', 'runaway toy car', 'plough', 0xe8402a, T.toyCar(0xe8402a), 24, false), height: 1.0 },
  { ...hazard('thunderhead', 'angry thundercloud', 'plough', 0x5a6478, K.thundercloud(true), 24, false), height: 1.5 },

  // ---- Secret objects: rare, in any world, always absorbable, each with its own power
  // (see "Secret objects" in config.ts; `weight` is how likely each is when one appears).
  secret('goldenSnowflake', 'golden snowflake', 0xffc92e, X.goldenSnowflake, 5, 'spin'),
  secret('yeti', 'yeti', 0x6ac8f0, X.yeti, 2.5, 'hop'),
  secret('secretUfo', 'flying saucer', 0x8affb0, X.secretUfo, 2.5, 'spin'),

  // ---- Hazards: placed by the world generator (see the "Hazard" sections of config.ts)
  hazard('river', 'river', 'river', 0x2f7fd0, river, 6, true),
  // A bridge and a ramp for each world, named by `bridge` and `ramp` in worlds.ts.
  hazard('bridge', 'bridge', 'bridge', 0xb9833f, bridgeOf({ planks: [0x9a6a30, 0xb9833f], rail: 0x5a3d25, cap: SNOW }), 6, true),
  hazard('bridgeLost', 'log bridge', 'bridge', 0x8a5a3a, bridgeOf({ planks: [0x8a5a3a, 0x6f4526], rail: 0x4a3424, cap: 0x3f9a4a }), 6, true),
  hazard('bridgeSpace', 'gantry', 'bridge', 0x8a93a3, bridgeOf({ planks: [0x8a93a3, 0x6a7383], rail: 0x3a4150, cap: 0x5ae0ff }), 6, true),
  hazard('bridgeCandy', 'wafer bridge', 'bridge', 0xe0b070, bridgeOf({ planks: [0xe0b070, 0xd09a54], rail: 0xffffff, post: 0xd81e3a, cap: 0xff7ab8 }), 6, true),
  hazard('bridgeDesert', 'stone bridge', 'bridge', 0xd8c090, bridgeOf({ planks: [0xd8c090, 0xc4a870], rail: 0xa8864e, cap: 0xf2ead8 }), 6, true),
  hazard('bridgeSea', 'wreck bridge', 'bridge', 0x6a5a48, bridgeOf({ planks: [0x7a6850, 0x5c4d3c], rail: 0x3fae9a, cap: 0xffd9c0 }), 6, true),
  hazard('bridgeSpooky', 'rickety bridge', 'bridge', 0x4a3a35, bridgeOf({ planks: [0x5a4640, 0x3a2c28], rail: 0xe8dfc8, cap: 0xff8a1a }), 6, true),
  hazard('bridgeToys', 'block bridge', 'bridge', 0xe2473c, bridgeOf({ planks: [0xe2473c, 0xf2c230, 0x3f7de0, 0x54b86a], rail: 0xffffff, cap: 0xe2473c }), 6, true),
  hazard(
    'bridgeSky',
    'rainbow bridge',
    'bridge',
    0xffd23f,
    bridgeOf({ planks: [0xe2473c, 0xff8a1a, 0xffd23f, 0x54b86a, 0x3f7de0, 0xb05fd6], along: true, rail: 0xffffff, cap: 0xffffff }),
    6,
    true,
  ),
  hazard('ramp', 'ramp', 'ramp', 0xff7a1a, rampOf({ body: 0xe9f1fb, stripes: [0xff7a1a, 0xff7a1a, 0xff7a1a], rail: RED, marker: flagMarker }), 30, false),
  hazard('rampLost', 'ramp', 'ramp', 0x7a5a3c, rampOf({ body: 0x7a5a3c, stripes: [0xe8dfc8, 0xe8dfc8, 0xe8dfc8], rail: 0x4a3424, marker: torchMarker }), 30, false),
  hazard('rampSpace', 'ramp', 'ramp', 0x8a93a3, rampOf({ body: 0x8a93a3, stripes: [0x5ae0ff, 0x5ae0ff, 0x5ae0ff], rail: 0x3a4150, marker: beaconMarker }), 30, false),
  hazard('rampCandy', 'ramp', 'ramp', 0xffb3d1, rampOf({ body: 0xffb3d1, stripes: [0xffffff, 0xd81e3a, 0xffffff], rail: 0xd81e3a, marker: lollipopMarker }), 30, false),
  hazard('rampDesert', 'ramp', 'ramp', 0xd8c090, rampOf({ body: 0xd8c090, stripes: [0x2aa6c8, 0x2aa6c8, 0x2aa6c8], rail: 0xa8864e, marker: obeliskMarker }), 30, false),
  hazard('rampSea', 'ramp', 'ramp', 0x6a5a48, rampOf({ body: 0x7a6850, stripes: [0xffd9a0, 0xffd9a0, 0xffd9a0], rail: 0x3fae9a, marker: buoyMarker }), 30, false),
  hazard('rampSpooky', 'ramp', 'ramp', 0x4a3f4f, rampOf({ body: 0x5a4d60, stripes: [0xff8a1a, 0xff8a1a, 0xff8a1a], rail: 0x2a222e, marker: pumpkinMarker }), 30, false),
  hazard('rampToys', 'ramp', 'ramp', 0xf2c230, rampOf({ body: 0xf2c230, stripes: [0xe2473c, 0x3f7de0, 0x54b86a], rail: 0x3f7de0, marker: blockMarker }), 30, false),
  hazard('rampSky', 'ramp', 'ramp', 0xffffff, rampOf({ body: 0xffffff, stripes: [0xe2473c, 0xffd23f, 0x3f7de0], rail: 0xff7ab8, marker: starMarker }), 30, false),
  { ...hazard('plough', 'snowplough', 'plough', 0xff8a1a, plough, 24, false), height: 1.25 },
];
