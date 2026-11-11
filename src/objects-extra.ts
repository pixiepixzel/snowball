/**
 * Models for objects that used to borrow another object's model, either outright (the
 * "space freighter" was the shuttle) or in different colours (the "ghost coach" was a green
 * carriage). Each now has a shape of its own.
 *
 * Like every object: 1 unit = the object's size, standing on y = 0, about 2 units tall,
 * front facing -Z. Parts painted white take the per-object tint where a def has `tints`.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, merge, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
type V3 = [number, number, number];
const PI = Math.PI;
const TAU = PI * 2;
const WHITE = 0xffffff;
const DARK = 0x22262e;
const GOLD = 0xf2c230;

// ------------------------------------------------------------------ Snowy Mountain

/** Penguin: a small round penguin in a scarf. The scarf is the part that takes the tint. */
export const penguin = () => {
  const coat = 0x2a3140;
  const front = 0xeef2f8;
  const orange = 0xff9a1a;
  return merge([
    blob(0.6, coat, { y: 0.78, sy: 1.25 }, 1),
    blob(0.47, front, { y: 0.72, z: -0.2, sy: 1.25 }, 1),
    blob(0.42, coat, { y: 1.62 }, 1),
    blob(0.29, front, { y: 1.58, z: -0.2, sy: 0.9 }, 1),
    blob(0.055, 0x12141a, { x: -0.13, y: 1.68, z: -0.44 }),
    blob(0.055, 0x12141a, { x: 0.13, y: 1.68, z: -0.44 }),
    spike(0.1, 0.24, orange, [0, 1.54, -0.42], [0, -0.15, -1], 5),
    blob(0.15, coat, { x: -0.62, y: 0.86, sy: 2.3, sz: 0.8, rz: -0.28 }),
    blob(0.15, coat, { x: 0.62, y: 0.86, sy: 2.3, sz: 0.8, rz: 0.28 }),
    blob(0.17, orange, { x: -0.22, y: 0.07, z: -0.22, sy: 0.4, sz: 1.5 }),
    blob(0.17, orange, { x: 0.22, y: 0.07, z: -0.22, sy: 0.4, sz: 1.5 }),
    torus(0.4, 0.1, WHITE, { y: 1.24 }, 10, 5),
    box(0.16, 0.42, 0.07, WHITE, { x: 0.28, y: 0.8, z: -0.46 }),
  ]);
};

// ------------------------------------------------------------------ Lost World

/** Tree fern: a shaggy trunk with a wide crown of fronds that arch out and droop. */
export const treeFern = () => {
  const parts: Parts = [];
  for (let i = 0; i < 4; i++) parts.push(cyl(0.13 - i * 0.012, 0.16 - i * 0.012, 0.36, i % 2 ? 0x5a3d25 : 0x6b4a2e, { y: i * 0.33 }, 6));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    const mid: V3 = [Math.cos(a) * 0.45, 1.66, Math.sin(a) * 0.45];
    const tip: V3 = [Math.cos(a) * 0.9, 1.28, Math.sin(a) * 0.9];
    const green = i % 2 ? 0x3f9a4a : 0x58b85a;
    parts.push(beam(0.17, green, [0, 1.34, 0], mid, 0.03), beam(0.13, green, mid, tip, 0.03));
  }
  // A new frond still curled up in the middle.
  parts.push(cyl(0.03, 0.03, 0.4, 0x8ad06a, { y: 1.34 }, 4), torus(0.09, 0.035, 0x8ad06a, { y: 1.8, rx: PI / 2 }, 8, 4));
  return merge(parts);
};

/** Giant palm: a very tall, slender trunk with a small fountain of fronds and coconuts at the top. */
export const giantPalm = () => {
  const parts: Parts = [];
  const trunk: V3[] = [
    [0, 0, 0],
    [0.06, 0.48, 0],
    [0.04, 0.96, 0],
    [-0.05, 1.42, 0],
    [-0.02, 1.8, 0],
  ];
  for (let i = 0; i < 4; i++) parts.push(taper(0.115 - i * 0.012, 0.1 - i * 0.012, i % 2 ? 0x8f6c46 : 0x7a5a3a, trunk[i], trunk[i + 1], 6));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const mid: V3 = [Math.cos(a) * 0.3 - 0.02, 2.0, Math.sin(a) * 0.3];
    const tip: V3 = [Math.cos(a) * 0.62 - 0.02, 1.84 - (i % 2) * 0.1, Math.sin(a) * 0.62];
    const green = i % 2 ? 0x58a84a : 0x6fbf5a;
    parts.push(beam(0.14, green, [-0.02, 1.8, 0], mid, 0.03), beam(0.1, green, mid, tip, 0.03));
  }
  parts.push(blob(0.08, 0x5a3d25, { x: 0.06, y: 1.72, z: 0.06 }), blob(0.08, 0x5a3d25, { x: -0.1, y: 1.72, z: -0.04 }), blob(0.08, 0x5a3d25, { x: 0, y: 1.7, z: -0.1 }));
  return merge(parts);
};

// ------------------------------------------------------------------ Space

/** Scout ship: a small dart of a ship with a bubble canopy and stubby wings, hovering. */
export const scoutShip = () =>
  merge([
    spike(0.4, 1.15, WHITE, [0, 0.75, 0.15], [0, 0, -1], 6),
    blob(0.4, WHITE, { y: 0.75, z: 0.15, sz: 0.9 }, 1),
    blob(0.23, 0x2c3a4c, { y: 0.98, z: -0.12, sz: 1.4 }, 1),
    box(1.4, 0.05, 0.42, 0x3a4150, { y: 0.71, z: 0.25 }),
    box(0.05, 0.42, 0.34, 0x3a4150, { x: -0.68, y: 0.6, z: 0.3 }),
    box(0.05, 0.42, 0.34, 0x3a4150, { x: 0.68, y: 0.6, z: 0.3 }),
    spike(0.16, 0.22, 0x5ae0ff, [0, 0.75, 0.5], [0, 0, 1], 6),
    cyl(0.28, 0.16, 0.05, 0x5ae0ff, { y: 0.16 }, 8),
  ]);

/** Space freighter: a cab, a long spine stacked with cargo containers, and an engine block. */
export const freighter = () => {
  const parts: Parts = [
    box(0.72, 0.5, 0.5, 0xc9ced6, { y: 0.32, z: -0.98 }),
    box(0.62, 0.2, 0.06, 0x2c3a4c, { y: 0.56, z: -1.24 }),
    box(0.3, 0.14, 2.2, 0x5a6270, { y: 0.34, z: 0.1 }),
    box(0.94, 0.52, 0.38, 0x3a4150, { y: 0.26, z: 1.12 }),
    spike(0.2, 0.26, 0x5ae0ff, [-0.26, 0.52, 1.3], [0, 0, 1], 7),
    spike(0.2, 0.26, 0x5ae0ff, [0.26, 0.52, 1.3], [0, 0, 1], 7),
    cyl(0.02, 0.02, 0.3, 0x9aa3ad, { y: 0.82, z: -0.98 }, 4),
    blob(0.1, 0xc9ced6, { y: 1.16, z: -0.98, sy: 0.5 }, 1),
    box(0.08, 0.16, 2.0, DARK, { x: -0.36, z: 0.1 }),
    box(0.08, 0.16, 2.0, DARK, { x: 0.36, z: 0.1 }),
  ];
  const cargo = [0xe2473c, 0xffc23a, 0x3f7de0, 0x54b86a];
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const at = { x: side * 0.37, z: -0.52 + i * 0.44 };
      parts.push(box(0.44, 0.44, 0.4, cargo[(i + (side > 0 ? 2 : 0)) % 4], { ...at, y: 0.2 }));
      parts.push(box(0.46, 0.04, 0.42, 0x2a2f3a, { ...at, y: 0.42 }));
    }
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Candy World

/** Jelly baby: a plump little figure with its arms up and a curl on its head. */
export const jellyBaby = () =>
  merge([
    blob(0.5, WHITE, { y: 0.78, sy: 1.25 }, 1),
    blob(0.4, WHITE, { y: 1.56 }, 1),
    blob(0.13, WHITE, { x: 0.06, y: 1.98 }),
    taper(0.17, 0.14, WHITE, [-0.4, 1.02, 0], [-0.72, 1.42, 0], 6),
    taper(0.17, 0.14, WHITE, [0.4, 1.02, 0], [0.72, 1.42, 0], 6),
    blob(0.25, WHITE, { x: -0.24, y: 0.22, sy: 1.1 }),
    blob(0.25, WHITE, { x: 0.24, y: 0.22, sy: 1.1 }),
    blob(0.05, DARK, { x: -0.14, y: 1.64, z: -0.36 }),
    blob(0.05, DARK, { x: 0.14, y: 1.64, z: -0.36 }),
    box(0.2, 0.04, 0.04, DARK, { y: 1.42, z: -0.37 }),
    blob(0.06, DARK, { y: 0.82, z: -0.5 }),
  ]);

/** One candy cane of a pair: a striped shaft from the foot up and out, then a hook curling back in. */
function cane(parts: Parts, side: number, a: number, b: number): void {
  const top: V3 = [side * 0.5, 1.5, 0];
  for (let i = 0; i < 6; i++) {
    const t0 = i / 6;
    const t1 = (i + 1) / 6;
    parts.push(taper(0.09, 0.09, i % 2 ? a : b, [top[0] * t0, top[1] * t0, 0], [top[0] * t1, top[1] * t1, 0], 6));
  }
  const r = 0.25;
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * PI;
    const a1 = ((i + 1) / 6) * PI;
    // From the top of the shaft (the outer end of the arc), over the top, down to the middle.
    const from: V3 = [side * (r + Math.cos(a0) * r), top[1] + Math.sin(a0) * r, 0];
    const to: V3 = [side * (r + Math.cos(a1) * r), top[1] + Math.sin(a1) * r, 0];
    parts.push(taper(0.09, 0.09, i % 2 ? b : a, from, to, 6));
  }
}

/** Candy cane heart: two giant canes leaning apart from one foot, their hooks meeting to make a heart. */
export const caneHeart = () => {
  const parts: Parts = [];
  cane(parts, -1, 0x3fb85a, 0xfdfdfd);
  cane(parts, 1, 0xd81e3a, 0xfdfdfd);
  // A ribbon tied where they cross.
  parts.push(blob(0.13, 0xff7ab8, { y: 0.42, z: -0.08 }), blob(0.14, 0xff7ab8, { x: -0.2, y: 0.46, z: -0.08, sy: 0.7 }), blob(0.14, 0xff7ab8, { x: 0.2, y: 0.46, z: -0.08, sy: 0.7 }));
  return merge(parts);
};

/** Cookie cottage: a round biscuit house under one enormous chocolate-chip cookie. */
export const cookieCottage = () => {
  const parts: Parts = [
    speckle(cyl(0.8, 0.86, 0.95, 0xe0b070, {}, 12), 0.05),
    speckle(cone(1.12, 0.7, 0xd09a54, { y: 0.95 }, 12), 0.06, 2),
    torus(0.88, 0.08, 0xfdfdfd, { y: 0.97 }, 14, 4),
    box(0.36, 0.62, 0.08, 0x6a3e22, { z: -0.84 }),
    blob(0.04, GOLD, { x: 0.1, y: 0.3, z: -0.9 }),
    box(0.26, 0.26, 0.08, 0xbfeaff, { x: -0.52, y: 0.42, z: -0.66, ry: 0.65 }),
    box(0.26, 0.26, 0.08, 0xbfeaff, { x: 0.52, y: 0.42, z: -0.66, ry: -0.65 }),
    cyl(0.12, 0.12, 0.5, 0xd8a460, { x: 0.45, y: 1.2, z: 0.3 }, 6),
    blob(0.16, 0xfdfdfd, { x: 0.45, y: 1.76, z: 0.3 }, 1),
  ];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const out = 0.3 + (i % 3) * 0.26;
    parts.push(blob(0.1, 0x4a2a16, { x: Math.cos(a) * out, y: 0.99 + 0.7 * (1 - out / 1.12), z: Math.sin(a) * out }));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Ancient Desert

/** Royal barge: a gilded hull with a curled prow and stern, a canopy over a throne, and rows of oars. */
export const royalBarge = () => {
  const parts: Parts = [
    frustum(0.66, 2.2, 0.9, 2.5, 0.32, 0xe0a820, { y: 0.05 }),
    box(0.86, 0.04, 2.3, 0x8a5a2a, { y: 0.37 }),
    taper(0.16, 0.06, 0xe0a820, [0, 0.3, -1.2], [0, 1.1, -1.5], 6),
    blob(0.12, 0x2a5ac8, { y: 1.16, z: -1.5 }),
    taper(0.16, 0.06, 0xe0a820, [0, 0.3, 1.2], [0, 0.95, 1.5], 6),
    blob(0.1, 0x2a5ac8, { y: 1.0, z: 1.5 }),
    frustum(0.9, 0.94, 0.5, 0.5, 0.2, 0x8a3ab0, { y: 1.02, z: 0.25 }),
    box(0.94, 0.05, 0.98, GOLD, { y: 0.98, z: 0.25 }),
    box(0.32, 0.36, 0.3, 0x2a5ac8, { y: 0.39, z: 0.42 }),
    box(0.36, 0.3, 0.06, GOLD, { y: 0.6, z: 0.58 }),
  ];
  for (const x of [-0.38, 0.38]) for (const z of [-0.16, 0.66]) parts.push(cyl(0.03, 0.03, 0.6, GOLD, { x, y: 0.39, z }, 5));
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) parts.push(beam(0.04, 0x8a5a2a, [side * 0.44, 0.38, -0.95 + i * 0.22], [side * 0.98, 0.02, -0.85 + i * 0.22]));
  }
  return merge(parts);
};

/** Great obelisk: an obelisk on a stepped pedestal with gold bands, guarded by four small pylons. */
export const greatObelisk = () => {
  const stone = 0x8a6a5a;
  const parts: Parts = [
    box(1.0, 0.14, 1.0, stone, {}),
    box(0.78, 0.14, 0.78, 0x9a7a68, { y: 0.14 }),
    box(0.56, 0.14, 0.56, stone, { y: 0.28 }),
    speckle(frustum(0.36, 0.36, 0.2, 0.2, 1.4, 0xa07a66, { y: 0.42 }), 0.05),
    cone(0.15, 0.22, GOLD, { y: 1.82, ry: PI / 4 }, 4),
    box(0.35, 0.05, 0.35, GOLD, { y: 0.66 }),
    box(0.28, 0.05, 0.28, GOLD, { y: 1.24 }),
  ];
  for (const x of [-0.4, 0.4]) {
    for (const z of [-0.4, 0.4]) parts.push(box(0.16, 0.3, 0.16, 0x9a7a68, { x, y: 0.14, z }), cone(0.11, 0.13, GOLD, { x, y: 0.44, z, ry: PI / 4 }, 4));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Under the Sea

/** Giant clam: a fluted shell gaping open on a rock, glowing along its lips, with a pearl inside. */
export const giantClam = () => {
  const parts: Parts = [speckle(blob(0.7, 0x6a7a8a, { y: 0.12, sy: 0.25 }, 1), 0.08)];
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + i * 0.3;
    const dx = Math.sin(a);
    const dz = -Math.cos(a);
    const shell = i % 2 ? 0x8a6ad0 : 0x7558bc;
    // The lower half fans out along the ground from the hinge; the upper half stands open above it.
    const low: V3 = [dx * 1.0, 0.42, 0.6 + dz * 1.15];
    const high: V3 = [dx * 0.85, 1.38, 0.62 + dz * 0.72];
    parts.push(taper(0.12, 0.2, shell, [0, 0.3, 0.6], low, 5), taper(0.12, 0.2, shell, [0, 0.44, 0.62], high, 5));
    parts.push(blob(0.13, 0x7ae0e8, { x: low[0], y: low[1] + 0.05, z: low[2] }), blob(0.13, 0x7ae0e8, { x: high[0], y: high[1], z: high[2] }));
  }
  parts.push(blob(0.55, 0x3ac8c0, { y: 0.5, z: 0.02, sy: 0.3 }, 1), blob(0.28, 0xfff4f0, { y: 0.72, z: -0.02 }, 1));
  return merge(parts);
};

// ------------------------------------------------------------------ Spooky Hollow

/** Ghost coach: a long coach with a row of glowing windows, six wheels, a coffin on the roof and no horses. */
export const ghostCoach = () => {
  const body = 0x3a5a4a;
  const glow = 0x8ae04a;
  const iron = 0x26262e;
  const parts: Parts = [
    box(0.92, 0.75, 2.1, body, { y: 0.42 }),
    frustum(0.98, 2.16, 0.8, 1.9, 0.16, 0x2a4438, { y: 1.17 }),
    box(0.4, 0.2, 0.9, 0x5a4636, { y: 1.33, z: 0.2 }),
    box(0.44, 0.04, 0.94, 0x3a2c22, { y: 1.53, z: 0.2 }),
    box(0.8, 0.1, 0.3, iron, { y: 0.84, z: -1.2 }),
    blob(0.1, glow, { x: -0.5, y: 1.24, z: -1.08 }),
    blob(0.1, glow, { x: 0.5, y: 1.24, z: -1.08 }),
    beam(0.05, iron, [-0.25, 0.45, -1.1], [-0.25, 0.25, -1.75]),
    beam(0.05, iron, [0.25, 0.45, -1.1], [0.25, 0.25, -1.75]),
    blob(0.2, 0xd8ffd0, { y: 0.9, z: 1.25, sz: 1.5 }, 1),
    blob(0.13, 0xd8ffd0, { x: 0.2, y: 1.15, z: 1.5 }, 1),
  ];
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) parts.push(box(0.05, 0.32, 0.3, glow, { x: side * 0.47, y: 0.7, z: -0.72 + i * 0.47 }));
  }
  for (const z of [-0.7, 0, 0.7]) {
    for (const x of [-0.52, 0.52]) parts.push(rodX(0.36, 0.08, iron, x, 0.36, z, 10), rodX(0.08, 0.12, glow, x, 0.36, z, 6));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Toy Room

/** Toy castle: square corner towers with battlements round one tall round tower, with a drawbridge down. */
export const toyCastle = () => {
  const wall = 0xb8c0cc;
  const parts: Parts = [
    box(1.5, 0.66, 1.3, wall, {}),
    cyl(0.36, 0.4, 1.4, 0xd0d6e0, {}, 10),
    cone(0.5, 0.5, 0x2f7de0, { y: 1.4 }, 10),
    cyl(0.015, 0.015, 0.26, 0x9aa3ad, { y: 1.88 }, 4),
    box(0.24, 0.14, 0.02, 0xffd23f, { x: 0.13, y: 2.0 }),
    box(0.34, 0.44, 0.1, 0x3a2a1c, { z: -0.63 }),
    rodZ(0.17, 0.1, 0x3a2a1c, 0, 0.44, -0.63, 8),
    box(0.34, 0.04, 0.5, 0x8a5a2a, { z: -0.92 }),
    box(0.1, 0.18, 0.04, 0x2c3a4c, { y: 0.9, z: -0.39 }),
  ];
  for (let i = 0; i < 5; i++) for (const z of [-0.59, 0.59]) parts.push(box(0.14, 0.14, 0.12, wall, { x: -0.48 + i * 0.24, y: 0.66, z }));
  for (const x of [-0.74, 0.74]) {
    for (const z of [-0.62, 0.62]) {
      parts.push(box(0.44, 1.0, 0.44, x * z > 0 ? 0xe8402a : 0xffd23f, { x, z }));
      for (const [dx, dz] of [
        [-0.15, -0.15],
        [0.15, -0.15],
        [-0.15, 0.15],
        [0.15, 0.15],
      ]) {
        parts.push(box(0.14, 0.14, 0.14, wall, { x: x + dx, y: 1.0, z: z + dz }));
      }
    }
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Rebuilt models
// Models that did not read as what they are named, or were a near-copy of another.

/** Dragonfly (Lost World): a long segmented tail, a big-eyed head and four pale wings. It hovers and turns. */
export const dragonfly = () => {
  const body = 0x2aa6c8;
  const dark = 0x1f8aa8;
  const parts: Parts = [
    blob(0.2, dark, { y: 0.9, z: -0.62 }, 1),
    blob(0.09, 0xff7a3a, { x: -0.13, y: 0.97, z: -0.72 }),
    blob(0.09, 0xff7a3a, { x: 0.13, y: 0.97, z: -0.72 }),
    blob(0.2, body, { y: 0.9, z: -0.32, sz: 1.4 }, 1),
  ];
  for (let i = 0; i < 6; i++) parts.push(blob(0.12 - i * 0.012, i % 2 ? dark : body, { y: 0.9, z: 0.02 + i * 0.19, sz: 1.3 }));
  for (const side of [-1, 1]) {
    parts.push(box(0.85, 0.02, 0.26, 0xc8f0ff, { x: side * 0.52, y: 1.0, z: -0.42, rz: side * 0.2 }));
    parts.push(box(0.74, 0.02, 0.22, 0xa8e0f8, { x: side * 0.46, y: 0.98, z: -0.14, rz: side * 0.14 }));
  }
  return merge(parts);
};

/** Pterodactyl (Lost World): perched on a rock, wings raised, with a long beak and a crest. */
export const pterodactyl = () => {
  const skin = 0xc87a4a;
  const dark = 0x9a5a34;
  const parts: Parts = [
    speckle(blob(0.55, 0x8a7a6a, { y: 0.2, sy: 0.42 }, 1), 0.08),
    blob(0.3, skin, { y: 0.95, sy: 1.3 }, 1),
    taper(0.13, 0.1, skin, [0, 1.2, -0.1], [0, 1.6, -0.3], 6),
    blob(0.17, skin, { y: 1.66, z: -0.34 }, 1),
    spike(0.1, 0.62, 0xf2c14e, [0, 1.64, -0.44], [0, -0.12, -1], 5),
    spike(0.09, 0.5, dark, [0, 1.72, -0.26], [0, 0.45, 1], 4),
    blob(0.035, 0x12141a, { x: -0.1, y: 1.73, z: -0.44 }),
    blob(0.035, 0x12141a, { x: 0.1, y: 1.73, z: -0.44 }),
    spike(0.07, 0.42, skin, [0, 0.8, 0.2], [0, -0.3, 1], 4),
  ];
  for (const side of [-1, 1]) {
    parts.push(taper(0.06, 0.03, dark, [side * 0.2, 1.2, 0], [side * 1.0, 1.78, 0.05], 5));
    parts.push(box(0.92, 0.03, 0.5, 0xe0a070, { x: side * 0.58, y: 1.38, z: 0.12, rz: side * 0.6 }));
    parts.push(cyl(0.04, 0.04, 0.4, dark, { x: side * 0.12, y: 0.34 }, 5));
  }
  return merge(parts);
};

/** Scarab (Ancient Desert): a jewel beetle with a gold rim, rolling a little sun in front of it. */
export const scarab = () => {
  const parts: Parts = [
    blob(0.5, 0x2a5ac8, { y: 0.75, sy: 0.55, sz: 1.3 }, 1),
    box(0.05, 0.05, 1.15, GOLD, { y: 0.99, z: 0.05 }),
    blob(0.3, 0x1f3f9a, { y: 0.72, z: -0.62, sy: 0.6 }, 1),
    blob(0.13, 0x12141a, { y: 0.72, z: -0.9, sy: 0.6 }),
    torus(0.52, 0.05, GOLD, { y: 0.74, sz: 1.3 }, 12, 4),
    blob(0.2, 0xff8a1a, { y: 0.86, z: -1.12 }, 1),
  ];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) parts.push(beam(0.05, 0x12141a, [side * 0.4, 0.66, -0.4 + i * 0.4], [side * 0.85, 0.42, -0.5 + i * 0.5]));
  }
  return merge(parts);
};

/** Sarcophagus (Ancient Desert): a gold mummy case lying on a stone slab, with a striped headdress, a face and crossed arms. */
export const sarcophagus = () => {
  const blue = 0x2a5ac8;
  const parts: Parts = [
    frustum(0.9, 2.0, 0.8, 1.9, 0.28, 0x8a6a3a, {}),
    frustum(0.72, 1.3, 0.56, 1.2, 0.3, GOLD, { y: 0.28, z: 0.3 }),
    box(0.84, 0.36, 0.56, blue, { y: 0.28, z: -0.62 }),
    blob(0.2, 0xf2d27a, { y: 0.66, z: -0.62, sy: 0.6 }, 1),
    blob(0.035, 0x12141a, { x: -0.07, y: 0.75, z: -0.67 }),
    blob(0.035, 0x12141a, { x: 0.07, y: 0.75, z: -0.67 }),
    box(0.07, 0.06, 0.2, blue, { y: 0.58, z: -0.38 }),
    box(0.6, 0.06, 0.1, 0xc8402a, { y: 0.58, z: -0.06, ry: 0.5 }),
    box(0.6, 0.06, 0.1, 0x2aa6c8, { y: 0.58, z: -0.06, ry: -0.5 }),
  ];
  for (let i = 0; i < 4; i++) parts.push(box(0.86, 0.37, 0.05, GOLD, { y: 0.28, z: -0.84 + i * 0.14 }));
  for (let i = 0; i < 3; i++) parts.push(box(0.6 - i * 0.04, 0.04, 0.08, i % 2 ? blue : 0xc8402a, { y: 0.58, z: 0.3 + i * 0.25 }));
  return merge(parts);
};

/** Eel (Under the Sea): a moray rising out of its hole in a rock, mouth open. */
export const eel = () => {
  const green = 0x3f8a6a;
  const light = 0x4a9a76;
  const parts: Parts = [speckle(blob(0.6, 0x6a7a8a, { y: 0.2, sy: 0.45 }, 1), 0.08), blob(0.26, 0x2a3440, { y: 0.4, sy: 0.3 })];
  const pts: V3[] = [
    [0, 0.35, 0.1],
    [0.12, 0.75, 0.05],
    [0.05, 1.15, -0.1],
    [-0.12, 1.5, -0.2],
    [-0.05, 1.78, -0.42],
  ];
  for (let i = 0; i < 4; i++) parts.push(taper(0.2 - i * 0.02, 0.18 - i * 0.02, i % 2 ? green : light, pts[i], pts[i + 1], 7));
  for (let i = 1; i < 4; i++) parts.push(blob(0.19 - i * 0.02, green, { x: pts[i][0], y: pts[i][1], z: pts[i][2] }));
  parts.push(
    blob(0.2, light, { x: -0.05, y: 1.82, z: -0.5, sz: 1.5 }, 1),
    box(0.2, 0.05, 0.3, 0x2f6a52, { x: -0.05, y: 1.62, z: -0.6, rx: 0.35 }),
    box(0.14, 0.03, 0.2, 0xff8a9a, { x: -0.05, y: 1.67, z: -0.58, rx: 0.2 }),
    blob(0.05, GOLD, { x: -0.19, y: 1.92, z: -0.6 }),
    blob(0.05, GOLD, { x: 0.09, y: 1.92, z: -0.6 }),
    blob(0.05, GOLD, { x: 0.2, y: 0.95, z: -0.06 }),
    blob(0.05, GOLD, { x: -0.16, y: 1.32, z: -0.26 }),
  );
  return merge(parts);
};

/** Sugar star (Candy World): a fat five-pointed star standing on edge, so it flashes as it turns. */
export const sugarStar = () => {
  const parts: Parts = [blob(0.42, 0xff7ab8, { y: 1.0, sz: 0.55 }, 1)];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    parts.push(spike(0.3, 0.72, i % 2 ? 0xff9ac8 : 0xff7ab8, [Math.cos(a) * 0.22, 1.0 + Math.sin(a) * 0.22, 0], [Math.cos(a), Math.sin(a), 0], 5));
  }
  const sprinkles = [0xffffff, 0xffd23f, 0x5ad0ff, 0xfdfdfd];
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    for (const z of [-0.24, 0.24]) parts.push(blob(0.05, sprinkles[i % 4], { x: Math.cos(a) * 0.2, y: 1.0 + Math.sin(a) * 0.2, z }));
  }
  return merge(parts);
};

/** Feather (Sky Kingdom): a curved quill with barbs either side, widest in the middle. */
export const feather = () => {
  const parts: Parts = [taper(0.035, 0.015, 0xf4f8ff, [0, 0.15, 0], [0.3, 1.95, 0], 5)];
  for (let i = 0; i < 9; i++) {
    const t = 0.22 + i * 0.085;
    const px = 0.3 * t;
    const py = 0.15 + 1.8 * t;
    const len = 0.5 * Math.sin(PI * (0.15 + 0.8 * (i / 8))) + 0.12;
    const blue = i % 2 ? 0x8ac8ff : 0xb8e0ff;
    parts.push(beam(0.17, blue, [px, py, 0], [px - len, py + len * 0.55, 0], 0.03));
    parts.push(beam(0.17, blue, [px, py, 0], [px + len * 0.9, py + len * 0.3, 0], 0.03));
  }
  return merge(parts);
};

/** Kite (Sky Kingdom): a diamond kite standing on its point, with a tail of bows. */
export const kite = () => {
  const parts: Parts = [
    cone(0.55, 0.6, 0xe8402a, { y: 1.25, sz: 0.06 }, 4),
    cone(0.55, 1.05, 0xffc23a, { y: 0.2, sz: 0.06, rx: PI }, 4),
    box(0.04, 1.65, 0.05, 0x8a5a2a, { y: 0.2, z: 0.03 }),
    box(1.1, 0.04, 0.05, 0x8a5a2a, { y: 1.23, z: 0.03 }),
    taper(0.015, 0.015, 0xf4f8ff, [0, 0.2, 0], [0.3, 0.03, 0.7], 4),
  ];
  const bows = [0x3f7de0, 0xff7ab8, 0x54b86a];
  for (let i = 0; i < 3; i++) parts.push(blob(0.07, bows[i], { x: 0.08 + i * 0.09, y: 0.16 - i * 0.045, z: 0.18 + i * 0.2, sx: 1.8 }));
  return merge(parts);
};

/** Beanstalk (Sky Kingdom): a thick stalk winding up to a cloud, with a big leaf at every turn. */
export const beanstalk = () => {
  const parts: Parts = [];
  const turns = 9;
  const at = (i: number): V3 => {
    const a = i * 0.9;
    const r = 0.17 * (1 - i / (turns * 1.6));
    return [Math.cos(a) * r, (i / turns) * 1.8, Math.sin(a) * r];
  };
  for (let i = 0; i < turns; i++) parts.push(taper(0.13 - i * 0.008, 0.122 - i * 0.008, i % 2 ? 0x4ab85a : 0x3f9a4a, at(i), at(i + 1), 6));
  for (let i = 1; i < turns; i++) {
    const [x, y, z] = at(i);
    const a = i * 0.9 + 1.2;
    parts.push(beam(0.22, i % 2 ? 0x6fd06a : 0x58b85a, [x, y, z], [x + Math.cos(a) * 0.5, y + 0.14, z + Math.sin(a) * 0.5], 0.03));
  }
  parts.push(blob(0.32, 0xfdfdff, { y: 1.9, sy: 0.7 }, 1), blob(0.22, 0xf4f8ff, { x: 0.3, y: 1.84, sy: 0.7 }, 1), blob(0.2, 0xf4f8ff, { x: -0.28, y: 1.86, z: 0.1, sy: 0.7 }, 1));
  return merge(parts);
};

/** Beacon (Space): a striped mast on a tripod with a red lamp on top and a small solar panel. */
export const beacon = () => {
  const steel = 0x6a7383;
  const parts: Parts = [
    beam(0.05, steel, [0, 0.5, 0], [0.42, 0, 0.25]),
    beam(0.05, steel, [0, 0.5, 0], [-0.42, 0, 0.25]),
    beam(0.05, steel, [0, 0.5, 0], [0, 0, -0.48]),
    cyl(0.16, 0.16, 0.08, 0x3a4150, { y: 1.6 }, 8),
    blob(0.17, 0xff3b30, { y: 1.83 }, 1),
    cyl(0.12, 0.18, 0.05, 0x3a4150, { y: 1.97 }, 8),
    box(0.5, 0.03, 0.3, 0x2a5ac8, { x: 0.3, y: 1.08, rz: 0.4 }),
  ];
  for (let i = 0; i < 4; i++) parts.push(cyl(0.075, 0.075, 0.3, i % 2 ? 0xf0f2f6 : 0xe2473c, { y: 0.4 + i * 0.3 }, 7));
  return merge(parts);
};

/** Mega rocket (Space): a tall moon rocket in stages, standing on its pad beside a red gantry. */
export const megaRocket = () => {
  const white = 0xf0f2f6;
  const black = 0x22262e;
  const red = 0xc8402a;
  const parts: Parts = [
    box(1.3, 0.1, 1.3, 0x5a6270, {}),
    cyl(0.3, 0.3, 0.75, white, { y: 0.22 }, 10),
    cyl(0.305, 0.305, 0.1, black, { y: 0.5 }, 10),
    cyl(0.24, 0.3, 0.12, black, { y: 0.97 }, 10),
    cyl(0.24, 0.24, 0.4, white, { y: 1.09 }, 10),
    cyl(0.16, 0.24, 0.12, white, { y: 1.49 }, 10),
    cyl(0.16, 0.16, 0.16, 0xe2473c, { y: 1.61 }, 10),
    cone(0.16, 0.2, white, { y: 1.77 }, 10),
    cyl(0.015, 0.015, 0.16, 0x9aa3ad, { y: 1.95 }, 4),
    box(0.16, 1.5, 0.16, red, { x: -0.54, y: 0.1 }),
  ];
  for (const x of [-0.14, 0.14]) for (const z of [-0.14, 0.14]) parts.push(cone(0.1, 0.14, black, { x, y: 0.09, z }, 6));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + PI / 4;
    parts.push(box(0.05, 0.28, 0.2, 0xe2473c, { x: Math.cos(a) * 0.36, y: 0.22, z: Math.sin(a) * 0.36, ry: -a + PI / 2 }));
  }
  for (const y of [0.55, 1.0, 1.45]) parts.push(box(0.3, 0.04, 0.06, red, { x: -0.36, y }));
  return merge(parts);
};

// ------------------------------------------------------------------ Markers on the bank

/** A distance post: a white pole with one, two or three red bands, for a quarter, half and three-quarters of a scene. */
export const distancePost = (bands: number) => () => {
  // The board near the top is where the game writes the distance (game.ts updatePostLabels).
  const parts: Parts = [
    cyl(0.09, 0.11, 1.5, 0xf0f2f6, {}, 6),
    cyl(0.2, 0.2, 0.06, 0x3a4150, {}, 6),
    box(1.3, 0.56, 0.1, 0x22324a, { y: 1.42 }),
    box(1.2, 0.46, 0.12, 0xf4f6fa, { y: 1.47 }),
  ];
  for (let i = 0; i < bands; i++) parts.push(cyl(0.115, 0.115, 0.14, 0xe2473c, { y: 1.12 - i * 0.24 }, 6));
  return merge(parts);
};

/** The best-run flag: a tall gold pole with a gold pennant and a star on top. It stands where the furthest run ended. */
export const bestFlag = () => {
  const parts: Parts = [cyl(0.05, 0.07, 1.9, GOLD, {}, 6), cyl(0.2, 0.24, 0.08, 0xd9920a, {}, 8), cone(0.5, 0.55, GOLD, { x: 0.3, y: 1.3, sz: 0.06, rz: -PI / 2 }, 4), blob(0.1, WHITE, { x: 0.22, y: 1.57, z: -0.05 })];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    parts.push(spike(0.09, 0.22, 0xffe07a, [Math.cos(a) * 0.06, 2.05 + Math.sin(a) * 0.06, 0], [Math.cos(a), Math.sin(a), 0], 4));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Second round of rebuilt models
// Models that were hard to recognise: four different things that were all "a ball with
// spikes", some shapeless lumps, and a few that just didn't read as what they are called.

const DARK_EYE = 0x12141a;

/** Thorn bush (Lost World): a clump of dark leaves bristling with long pale thorns, with red berries. */
export const thornBush = () => {
  const parts: Parts = [
    speckle(blob(0.62, 0x2f6a3a, { y: 0.6, sy: 0.85 }, 1), 0.1, 1),
    speckle(blob(0.5, 0x3f8a4a, { x: 0.45, y: 0.5, z: 0.15, sy: 0.8 }, 1), 0.1, 2),
    speckle(blob(0.48, 0x357a40, { x: -0.45, y: 0.52, z: -0.1, sy: 0.8 }, 1), 0.1, 3),
    speckle(blob(0.42, 0x3f8a4a, { y: 1.05, z: 0.05 }, 1), 0.1, 4),
  ];
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4;
    const up = 0.2 + (i % 4) * 0.25;
    const dir: V3 = [Math.cos(a), up, Math.sin(a)];
    parts.push(spike(0.075, 0.62, 0xf2ead2, [Math.cos(a) * 0.6, 0.45 + up * 0.6, Math.sin(a) * 0.6], dir, 4));
  }
  for (let i = 0; i < 5; i++) parts.push(blob(0.08, 0xe2473c, { x: Math.cos(i * 1.9) * 0.55, y: 0.5 + (i % 3) * 0.25, z: Math.sin(i * 1.9) * 0.55 }));
  return merge(parts);
};

/** Sea urchin (Under the Sea): a small dome on the sand with a great many long, thin spines. */
export const urchin = () => {
  const parts: Parts = [speckle(blob(0.6, 0xd8c8a8, { y: 0.06, sy: 0.25 }, 1), 0.06), blob(0.42, 0x4a2a80, { y: 0.45, sy: 0.85 }, 1)];
  for (let i = 0; i < 22; i++) {
    const a = i * 2.4;
    const up = 0.15 + (i % 6) * 0.3;
    const dir: V3 = [Math.cos(a), up, Math.sin(a)];
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    const base: V3 = [(dir[0] / len) * 0.36, 0.45 + (dir[1] / len) * 0.32, (dir[2] / len) * 0.36];
    parts.push(spike(0.035, 0.95, i % 3 ? 0x6a4aa8 : 0xc8a0ff, base, dir, 4));
  }
  return merge(parts);
};

/** Space mine (Space): a metal sphere with stubby red-tipped horns and a blinking light, hanging on a tether. */
export const spaceMine = () => {
  const parts: Parts = [
    cyl(0.3, 0.36, 0.1, 0x3a4150, {}, 8),
    cyl(0.03, 0.03, 0.5, 0x9aa3ad, { y: 0.1 }, 4),
    blob(0.58, 0x4a5262, { y: 1.1 }, 1),
    torus(0.59, 0.05, 0xffc23a, { y: 1.1 }, 14, 4),
    cyl(0.06, 0.06, 0.14, 0x22262e, { y: 1.66 }, 6),
    blob(0.09, 0xff3b30, { y: 1.86 }),
  ];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const up = i % 2 ? 0.45 : -0.25;
    const dir: V3 = [Math.cos(a), up, Math.sin(a)];
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    const at = (k: number): V3 => [(dir[0] / len) * k, 1.1 + (dir[1] / len) * k, (dir[2] / len) * k];
    parts.push(taper(0.09, 0.07, 0x6a7383, at(0.52), at(0.74), 6), blob(0.08, 0xff3b30, { x: at(0.78)[0], y: at(0.78)[1], z: at(0.78)[2] }));
  }
  return merge(parts);
};

/** Tumbleweed (Ancient Desert): an airy ball of dry twigs, hoops of them crossing every way. */
export const tumbleweed = () => {
  const parts: Parts = [];
  const twig = [0xa8864a, 0xc8a460, 0x8a6a3a];
  for (let i = 0; i < 7; i++) {
    parts.push(torus(0.62 - (i % 3) * 0.06, 0.035, twig[i % 3], { y: 0.72, rx: i * 0.9, rz: i * 1.3, ry: i * 0.5 }, 9, 3));
  }
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    const dir: V3 = [Math.cos(a), 0.3 + (i % 3) * 0.4 - 0.4, Math.sin(a)];
    parts.push(spike(0.025, 0.3, twig[(i + 1) % 3], [Math.cos(a) * 0.55, 0.72 + dir[1] * 0.4, Math.sin(a) * 0.55], dir, 3));
  }
  return merge(parts);
};

/** Mossy boulder (Lost World): three sharp-cut rocks, thick moss over their tops, a fern and a toadstool. */
export const mossyBoulder = () => {
  const parts: Parts = [
    speckle(blob(0.85, 0x8a8478, { y: 0.62, sy: 0.85 }, 0), 0.12, 1),
    speckle(blob(0.55, 0x7a7468, { x: 0.75, y: 0.38, z: 0.25, sy: 0.8 }, 0), 0.12, 2),
    speckle(blob(0.45, 0x9a9488, { x: -0.7, y: 0.3, z: 0.3, sy: 0.75 }, 0), 0.12, 3),
    blob(0.62, 0x4a9a3a, { y: 1.2, sy: 0.35 }, 1),
    blob(0.4, 0x5ab04a, { x: 0.75, y: 0.72, z: 0.25, sy: 0.35 }, 1),
    blob(0.32, 0x4a9a3a, { x: -0.7, y: 0.56, z: 0.3, sy: 0.35 }, 1),
    cyl(0.05, 0.06, 0.2, 0xf2ead2, { x: 0.25, y: 1.3, z: -0.2 }, 5),
    blob(0.14, 0xd9412e, { x: 0.25, y: 1.52, z: -0.2, sy: 0.6 }),
  ];
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    parts.push(beam(0.08, 0x6fbf5a, [-0.3, 1.25, 0.1], [-0.3 + Math.sin(a) * 0.45, 1.6 - Math.abs(a) * 0.15, 0.1 + Math.cos(a) * 0.15], 0.02));
  }
  return merge(parts);
};

/** Rock spire (Lost World): a tall column of banded red rock worn thin in the middle, with a boulder balanced on top. */
export const rockSpire = () => {
  const parts: Parts = [];
  const layers = [0x9a5a3a, 0xb8714a, 0xc88a5a, 0xa8603a, 0xd09a6a, 0xb8714a, 0x9a5a3a];
  const widths = [0.62, 0.5, 0.4, 0.32, 0.3, 0.36, 0.44];
  layers.forEach((c, i) => parts.push(speckle(cyl(widths[i] * 0.92, widths[i], 0.24, c, { y: i * 0.22, ry: i * 0.5 }, 7), 0.08, i + 1)));
  parts.push(speckle(blob(0.5, 0x8a4a2e, { y: 1.78, sy: 0.6, sx: 1.15 }, 0), 0.1, 9));
  return merge(parts);
};

/** Moon rock (Space): a pale chunk of moon, pitted with craters, with a tiny flag stuck in it. */
export const moonRock = () => {
  const parts: Parts = [speckle(blob(0.75, 0xc8ccd6, { y: 0.6, sy: 0.75 }, 1), 0.07)];
  const pits: V3[] = [
    [0.1, 1.1, -0.3],
    [-0.45, 0.85, -0.4],
    [0.5, 0.75, -0.42],
    [-0.1, 0.55, -0.72],
    [0.35, 1.0, 0.25],
  ];
  for (const [x, y, z] of pits) parts.push(blob(0.16, 0x7a7e8a, { x, y, z, sy: 0.5 }), torus(0.17, 0.03, 0xe6e8ee, { x, y: y + 0.02, z }, 8, 3));
  parts.push(cyl(0.02, 0.02, 0.6, 0xe8eef8, { x: -0.2, y: 1.1 }, 4), box(0.3, 0.2, 0.02, 0xe2473c, { x: -0.04, y: 1.5 }));
  return merge(parts);
};

/** Asteroid (Space): a dark, knobbly lump of rock with veins of glowing ore and crystals breaking out of it. */
export const asteroid = () => {
  const parts: Parts = [
    speckle(blob(0.8, 0x5a5048, { y: 0.9, sx: 1.15, sy: 0.9 }, 0), 0.14, 1),
    speckle(blob(0.5, 0x6a5e54, { x: 0.6, y: 1.25, z: 0.2 }, 0), 0.14, 2),
    speckle(blob(0.45, 0x4a423c, { x: -0.6, y: 0.6, z: -0.2 }, 0), 0.14, 3),
    beam(0.06, 0x5ae0ff, [-0.5, 0.5, -0.62], [0.1, 1.0, -0.74], 0.03),
    beam(0.05, 0x5ae0ff, [0.1, 1.0, -0.74], [0.6, 0.85, -0.6], 0.03),
  ];
  const shards: [V3, V3][] = [
    [[0.4, 1.55, 0], [0.4, 1, 0.1]],
    [[-0.3, 1.5, -0.2], [-0.4, 1, -0.2]],
    [[0.85, 0.8, -0.3], [1, 0.3, -0.3]],
    [[-0.9, 0.9, 0.1], [-1, 0.5, 0.2]],
  ];
  for (const [base, dir] of shards) parts.push(spike(0.11, 0.42, 0x8ff0ff, base, dir, 4));
  return merge(parts);
};

/** Bubble (Under the Sea): a big round bubble with a bright glint and a ring of light, and two little ones beside it. */
export const bubble = () =>
  merge([
    blob(0.7, 0xbfeaff, { y: 1.0 }, 2),
    torus(0.71, 0.03, 0xffffff, { y: 1.0, rx: PI / 2 }, 16, 3),
    blob(0.2, 0xffffff, { x: -0.3, y: 1.32, z: -0.5, sx: 1.3, sz: 0.4 }),
    blob(0.08, 0xffffff, { x: -0.05, y: 1.5, z: -0.5, sz: 0.4 }),
    blob(0.24, 0xd8f4ff, { x: 0.75, y: 0.45, z: 0.1 }, 1),
    blob(0.15, 0xd8f4ff, { x: -0.7, y: 0.3, z: -0.2 }, 1),
    blob(0.06, 0xffffff, { x: 0.68, y: 0.55, z: -0.1 }),
  ]);

/** Triceratops (Lost World): four sturdy legs, a big bony frill, three horns and a beak. Faces -Z. */
export const triceratops = () => {
  const hide = 0xb5764a;
  const dark = 0x8a5632;
  const parts: Parts = [
    blob(0.6, hide, { y: 0.85, z: 0.25, sz: 1.5, sy: 0.85 }, 1),
    taper(0.3, 0.08, hide, [0, 0.85, 0.95], [0, 0.55, 1.6], 6),
    blob(0.4, hide, { y: 0.9, z: -0.75, sz: 1.2 }, 1),
    // The frill: a wide fan standing up behind the head.
    cyl(0.56, 0.56, 0.1, dark, { y: 1.05, z: -0.45, rx: PI / 2 - 0.35 }, 9),
    cyl(0.42, 0.42, 0.12, 0xd8a070, { y: 1.06, z: -0.49, rx: PI / 2 - 0.35 }, 9),
    spike(0.07, 0.6, 0xf2ead2, [-0.2, 1.12, -0.9], [-0.15, 0.6, -1], 5),
    spike(0.07, 0.6, 0xf2ead2, [0.2, 1.12, -0.9], [0.15, 0.6, -1], 5),
    spike(0.06, 0.3, 0xf2ead2, [0, 0.95, -1.18], [0, 0.6, -1], 5),
    spike(0.14, 0.26, 0xe8c070, [0, 0.72, -1.15], [0, -0.3, -1], 4),
    blob(0.045, DARK_EYE, { x: -0.3, y: 0.98, z: -0.95 }),
    blob(0.045, DARK_EYE, { x: 0.3, y: 0.98, z: -0.95 }),
  ];
  for (const x of [-0.36, 0.36]) for (const z of [-0.3, 0.75]) parts.push(cyl(0.15, 0.17, 0.55, dark, { x, z }, 6));
  return merge(parts);
};

/** Candy bar (Candy World): a bar of chocolate half out of its bright wrapper, standing on end. */
export const candyBar = () => {
  const parts: Parts = [box(0.9, 1.0, 0.3, 0xe8408a, {}), box(0.92, 0.2, 0.32, 0xffd23f, { y: 0.4 }), box(0.94, 0.07, 0.34, 0xc9ced6, { y: 0.98 })];
  for (let row = 0; row < 2; row++) {
    for (const x of [-0.21, 0.21]) parts.push(box(0.38, 0.4, 0.24, 0x6a3e22, { x, y: 1.05 + row * 0.44 }), box(0.26, 0.26, 0.28, 0x8a5a36, { x, y: 1.12 + row * 0.44 }));
  }
  return merge(parts);
};

/** Rock candy (Candy World): a wooden stick crusted with chunky sugar crystals in pink and blue. */
export const rockCandy = () => {
  const parts: Parts = [cyl(0.05, 0.05, 1.0, 0xe0b070, {}, 5), blob(0.09, 0xe0b070, { y: 0.02 })];
  const sugar = [0xff9ac8, 0x8ad0ff, 0xffc0dc, 0xb8e4ff, 0xd8a0ff];
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4;
    const y = 0.75 + (i / 16) * 1.05;
    const out = 0.26 - Math.abs(i - 8) * 0.012;
    const s = 0.2 + (i % 3) * 0.05;
    parts.push(box(s, s, s, sugar[i % 5], { x: Math.cos(a) * out, y, z: Math.sin(a) * out, rx: i * 0.7, ry: i * 1.1 }));
  }
  parts.push(box(0.22, 0.22, 0.22, 0xffffff, { y: 1.85, ry: 0.6, rx: 0.5 }));
  return merge(parts);
};

/** Thorn tangle (Spooky Hollow): bramble canes arching over, studded with thorns, with a few dark berries. */
export const thornTangle = () => {
  const parts: Parts = [];
  const cane = [0x4a3a32, 0x5a4638, 0x3a2c28];
  for (let i = 0; i < 5; i++) {
    const turn = i * 1.26;
    const reach = 0.75 - (i % 2) * 0.15;
    const high = 1.5 - (i % 3) * 0.3;
    const at = (t: number): V3 => {
      const r = -reach + 2 * reach * t;
      return [Math.cos(turn) * r, Math.sin(PI * t) * high + 0.02, Math.sin(turn) * r];
    };
    for (let k = 0; k < 6; k++) {
      parts.push(taper(0.055, 0.05, cane[i % 3], at(k / 6), at((k + 1) / 6), 5));
      const p = at((k + 0.5) / 6);
      const side = k % 2 ? 1 : -1;
      parts.push(spike(0.06, 0.34, 0xe8dfc8, p, [Math.cos(turn + 1.6) * side, 0.5, Math.sin(turn + 1.6) * side], 4));
    }
    const top = at(0.5);
    if (i % 2 === 0) parts.push(blob(0.09, 0x6a3ab0, { x: top[0] + 0.1, y: top[1] - 0.12, z: top[2] }));
  }
  return merge(parts);
};

/** Desert runner (Ancient Desert): a traveller in a long robe and headscarf with a staff. Robe and scarf take the tint. */
export const desertRunner = () =>
  merge([
    frustum(0.75, 0.6, 0.44, 0.34, 1.15, WHITE, {}),
    box(0.5, 0.1, 0.38, 0x8a5a2a, { y: 0.78 }),
    blob(0.24, 0xc8905a, { y: 1.42 }, 1),
    blob(0.27, WHITE, { y: 1.5, z: 0.05, sy: 0.9 }, 1),
    box(0.34, 0.5, 0.08, WHITE, { y: 0.98, z: 0.22 }),
    blob(0.035, DARK_EYE, { x: -0.09, y: 1.44, z: -0.22 }),
    blob(0.035, DARK_EYE, { x: 0.09, y: 1.44, z: -0.22 }),
    taper(0.08, 0.06, WHITE, [-0.24, 1.1, 0], [-0.46, 0.7, -0.15], 5),
    taper(0.08, 0.06, WHITE, [0.24, 1.1, 0], [0.5, 0.95, -0.25], 5),
    blob(0.07, 0xc8905a, { x: 0.52, y: 0.95, z: -0.28 }),
    cyl(0.03, 0.03, 1.75, 0x6b4a2e, { x: 0.55, z: -0.28 }, 5),
    box(0.16, 0.06, 0.26, 0x6b4a2e, { x: -0.15, z: -0.1 }),
    box(0.16, 0.06, 0.26, 0x6b4a2e, { x: 0.15, z: -0.1 }),
  ]);

/** Hang glider (Sky Kingdom): a wide striped wing on a triangular frame, with its pilot hanging underneath. */
export const hangGlider = () => {
  const parts: Parts = [];
  const stripes = [0xffd23f, 0xe8402a, 0xffd23f, 0x3f8ae8, 0xffd23f];
  // The wing: five panels fanning back from the nose, swept like an arrowhead.
  stripes.forEach((c, i) => {
    const x = (i - 2) * 0.4;
    parts.push(box(0.4, 0.04, 1.4 - Math.abs(i - 2) * 0.45, c, { x, y: 1.25, z: Math.abs(i - 2) * 0.34, rx: -0.12 }));
  });
  parts.push(
    beam(0.03, 0x9aa3ad, [0, 1.25, -0.5], [-0.35, 0.45, 0.1]),
    beam(0.03, 0x9aa3ad, [0, 1.25, -0.5], [0.35, 0.45, 0.1]),
    beam(0.03, 0x9aa3ad, [-0.35, 0.45, 0.1], [0.35, 0.45, 0.1]),
    // The pilot, lying along under the wing.
    blob(0.2, 0x3f7de0, { y: 0.8, z: 0.3, sz: 2.2 }, 1),
    blob(0.15, 0xf2c8a0, { y: 0.84, z: -0.2 }, 1),
    blob(0.16, 0xe8402a, { y: 0.9, z: -0.16, sy: 0.7 }),
    cyl(0.012, 0.012, 0.4, 0x9aa3ad, { y: 0.85, z: 0.2 }, 3),
  );
  return merge(parts);
};

/** Alien obelisk (Space): a dark slab covered in glowing signs, a crystal burning on top and two rings turning round it. */
export const alienObelisk = () => {
  const parts: Parts = [
    box(0.7, 0.08, 0.7, 0x22283a, {}),
    frustum(0.42, 0.42, 0.26, 0.26, 1.55, 0x2a3048, { y: 0.08 }),
    spike(0.16, 0.34, 0x5ae0ff, [0, 1.63, 0], [0, 1, 0], 4),
    torus(0.5, 0.03, 0x5ae0ff, { y: 0.75, rx: 0.3 }, 14, 3),
    torus(0.42, 0.025, 0xb06aff, { y: 1.2, rx: -0.35, rz: 0.2 }, 14, 3),
  ];
  // Signs down the front and back: bars, dots and angles.
  for (let i = 0; i < 5; i++) {
    const y = 0.3 + i * 0.26;
    const w = 0.2 - i * 0.02;
    for (const z of [-1, 1]) {
      parts.push(box(i % 2 ? w : 0.05, 0.05, 0.03, 0x5ae0ff, { x: i % 2 ? 0 : -0.07, y, z: z * (0.21 - i * 0.016) }));
      if (i % 2 === 0) parts.push(box(0.05, 0.05, 0.03, 0xb06aff, { x: 0.07, y, z: z * (0.21 - i * 0.016) }));
    }
  }
  return merge(parts);
};

/** Eel (Under the Sea): a moray lunging out of a hole in the rock, jaws wide open showing its teeth. */
export const morayEel = () => {
  const green = 0x3f8a6a;
  const light = 0x58b08a;
  const parts: Parts = [speckle(blob(0.75, 0x6a7a8a, { y: 0.28, sy: 0.6 }, 0), 0.1, 1), blob(0.3, 0x1a2430, { y: 0.55, z: -0.35, sz: 0.5 })];
  const spine: V3[] = [
    [0, 0.5, -0.2],
    [0.18, 0.9, -0.35],
    [0.1, 1.3, -0.5],
    [-0.1, 1.55, -0.75],
  ];
  for (let i = 0; i < 3; i++) parts.push(taper(0.22 - i * 0.015, 0.2 - i * 0.015, i % 2 ? light : green, spine[i], spine[i + 1], 7));
  for (let i = 1; i < 3; i++) parts.push(blob(0.21 - i * 0.015, green, { x: spine[i][0], y: spine[i][1], z: spine[i][2] }));
  parts.push(
    // Upper and lower jaw, hinged open.
    box(0.36, 0.14, 0.5, light, { x: -0.1, y: 1.62, z: -1.0, rx: -0.25 }),
    box(0.32, 0.1, 0.46, green, { x: -0.1, y: 1.3, z: -0.95, rx: 0.4 }),
    box(0.26, 0.04, 0.36, 0xff8a9a, { x: -0.1, y: 1.4, z: -0.95, rx: 0.4 }),
    blob(0.2, light, { x: -0.1, y: 1.62, z: -0.72 }, 1),
    blob(0.06, GOLD, { x: -0.27, y: 1.78, z: -0.86 }),
    blob(0.06, GOLD, { x: 0.07, y: 1.78, z: -0.86 }),
    blob(0.03, DARK_EYE, { x: -0.28, y: 1.78, z: -0.91 }),
    blob(0.03, DARK_EYE, { x: 0.08, y: 1.78, z: -0.91 }),
    box(0.03, 0.5, 0.2, 0x2f6a52, { x: 0.14, y: 0.75, z: -0.22 }),
  );
  for (const x of [-0.22, -0.1, 0.02]) parts.push(cone(0.03, 0.09, 0xffffff, { x, y: 1.5, z: -1.18, rx: PI }, 4), cone(0.03, 0.08, 0xffffff, { x, y: 1.4, z: -1.12 }, 4));
  const whole = merge(parts);
  whole.rotateY(-1.15);
  whole.translate(-0.3, 0, 0);
  return whole;
};

/** Sarcophagus (Ancient Desert): a golden mummy case standing upright, striped headdress, painted face, arms crossed. */
export const mummyCase = () => {
  const blue = 0x2a5ac8;
  const parts: Parts = [
    box(0.7, 0.1, 0.5, 0x8a6a3a, {}),
    frustum(0.5, 0.36, 0.66, 0.42, 1.25, GOLD, { y: 0.1 }),
    // The headdress: a striped hood falling to the shoulders either side of the face.
    box(0.78, 0.5, 0.42, blue, { y: 1.35 }),
    blob(0.25, 0xf2d27a, { y: 1.62, z: -0.16, sy: 1.1, sz: 0.6 }, 1),
    blob(0.04, DARK_EYE, { x: -0.09, y: 1.68, z: -0.3 }),
    blob(0.04, DARK_EYE, { x: 0.09, y: 1.68, z: -0.3 }),
    box(0.07, 0.2, 0.07, blue, { y: 1.3, z: -0.26 }),
    spike(0.05, 0.14, GOLD, [0, 1.86, -0.2], [0, 1, -0.4], 4),
    // Crossed bands over the chest.
    box(0.56, 0.08, 0.06, 0xc8402a, { y: 1.02, z: -0.22, rz: 0.5 }),
    box(0.56, 0.08, 0.06, 0x2aa6c8, { y: 1.02, z: -0.22, rz: -0.5 }),
  ];
  for (let i = 0; i < 5; i++) parts.push(box(0.8, 0.045, 0.44, GOLD, { y: 1.38 + i * 0.095 }));
  for (let i = 0; i < 4; i++) parts.push(box(0.5 - i * 0.03, 0.05, 0.06, i % 2 ? blue : 0xc8402a, { y: 0.3 + i * 0.16, z: -0.2 + i * 0.012 }));
  return merge(parts);
};

// ------------------------------------------------------------------ Candy World, third round
// Sweets on thin sticks looked far smaller than the game counts them, so these are built
// to fill their space; and a few that didn't read as what they are.

/** Candy floss (Candy World): a big spun-sugar cloud on a striped paper cone. */
export const candyFloss = () => {
  const parts: Parts = [
    taper(0.05, 0.3, 0xfdfdfd, [0, 0, 0], [0, 0.85, 0], 8),
    torus(0.12, 0.03, 0x6aa8ff, { y: 0.3 }, 8, 3),
    torus(0.2, 0.03, 0x6aa8ff, { y: 0.55 }, 8, 3),
    torus(0.28, 0.03, 0x6aa8ff, { y: 0.8 }, 8, 3),
    speckle(blob(0.78, 0xff9ac8, { y: 1.45, sy: 0.95 }, 2), 0.05, 1),
    speckle(blob(0.5, 0xffb0d6, { y: 2.0 }, 1), 0.05, 2),
    blob(0.2, 0xffc8e2, { y: 2.42 }, 1),
  ];
  // Wisps wound round it, the way it comes off the machine.
  for (let i = 0; i < 4; i++) parts.push(torus(0.74 - i * 0.12, 0.07, i % 2 ? 0xffc8e2 : 0xff7ab8, { y: 1.15 + i * 0.3, rx: 0.25, ry: i * 1.3 }, 12, 4));
  return merge(parts);
};

/** One wafer biscuit: three sheets with cream between and a waffle grid pressed into both faces. Stands up, face to -Z. */
function waferBiscuit(w: number, h: number, cream: number): Parts {
  const sheet = 0xe0b070;
  const groove = 0xb8863e;
  const parts: Parts = [
    box(w, h, 0.1, sheet, { z: -0.16 }),
    box(w * 0.96, h * 0.97, 0.07, cream, { y: h * 0.015, z: -0.08 }),
    box(w, h, 0.1, sheet, {}),
    box(w * 0.96, h * 0.97, 0.07, cream, { y: h * 0.015, z: 0.08 }),
    box(w, h, 0.1, sheet, { z: 0.16 }),
  ];
  for (const z of [-0.215, 0.215]) {
    for (let i = 1; i < 4; i++) parts.push(box(0.04, h * 0.94, 0.02, groove, { x: -w / 2 + (w * i) / 4, y: h * 0.03, z }));
    for (let i = 1; i < 6; i++) parts.push(box(w * 0.94, 0.04, 0.02, groove, { y: (h * i) / 6, z }));
  }
  return parts;
}

/** Wafer (Candy World): two wafer biscuits stood up together, pink cream in one and white in the other. */
export const waferStack = () => {
  const back = merge(waferBiscuit(1.0, 1.9, 0xfff4e0));
  back.rotateY(0.25);
  back.translate(0.3, 0, 0.25);
  const front = merge(waferBiscuit(0.95, 1.5, 0xff9ac8));
  front.rotateY(-0.2);
  front.translate(-0.3, 0, -0.2);
  return merge([back, front]);
};

/** Giant lollipop (Candy World): a thick round lolly with a rainbow spiral, a fat stick and a bow. */
export const swirlLolly = () => {
  const parts: Parts = [
    cyl(0.1, 0.1, 0.9, 0xfdfdfd, {}, 6),
    rodZ(0.8, 0.5, 0xfdfdfd, 0, 1.5, 0, 16),
    rodZ(0.84, 0.3, 0xff7ab8, 0, 1.5, 0, 16),
    // The bow where the stick meets the sweet.
    blob(0.2, 0xd81e3a, { x: -0.2, y: 0.72, z: -0.14, sy: 0.7 }),
    blob(0.2, 0xd81e3a, { x: 0.2, y: 0.72, z: -0.14, sy: 0.7 }),
    blob(0.1, 0xff5a7a, { y: 0.72, z: -0.16 }),
  ];
  const rainbow = [0xd81e3a, 0xff8a2a, 0xffd84a, 0x3fb85a, 0x6aa8ff, 0xb06aff];
  const steps = 30;
  const at = (i: number, z: number): V3 => {
    const t = i / steps;
    const a = t * TAU * 2.5;
    const rad = 0.06 + t * 0.64;
    return [Math.cos(a) * rad, 1.5 + Math.sin(a) * rad, z];
  };
  for (const z of [-0.25, 0.25]) for (let i = 0; i < steps; i++) parts.push(taper(0.075, 0.075, rainbow[Math.floor(i / 2) % 6], at(i, z), at(i + 1, z), 5));
  return merge(parts);
};

/** Candy cane heart (Candy World): two fat striped canes crossed at the foot, their hooks curling in to make a heart, tied with a bow. */
export const candyHeart = () => {
  const parts: Parts = [];
  const tube = 0.12;
  for (const side of [-1, 1]) {
    // Up and out from the foot...
    const foot: V3 = [-side * 0.12, 0.05, 0];
    const shoulder: V3 = [side * 0.66, 1.5, 0];
    for (let i = 0; i < 7; i++) {
      const p = (k: number): V3 => [foot[0] + ((shoulder[0] - foot[0]) * k) / 7, foot[1] + ((shoulder[1] - foot[1]) * k) / 7, side * 0.06];
      parts.push(taper(tube, tube, i % 2 ? 0xfdfdfd : 0xd81e3a, p(i), p(i + 1), 7));
    }
    // ...then the hook curls over and back in to the middle.
    for (let i = 0; i < 6; i++) {
      const p = (k: number): V3 => {
        const a = (k / 6) * PI;
        return [side * (0.33 + Math.cos(a) * 0.33), 1.5 + Math.sin(a) * 0.36, side * 0.06];
      };
      parts.push(taper(tube, tube, i % 2 ? 0xd81e3a : 0xfdfdfd, p(i), p(i + 1), 7));
    }
    parts.push(blob(tube, 0xd81e3a, { x: 0, y: 1.5, z: side * 0.06 }));
    parts.push(blob(0.2, 0x3fb85a, { x: side * 0.24, y: 0.42, z: -0.2, sy: 0.7 }));
  }
  parts.push(blob(0.11, 0x2f9a48, { y: 0.42, z: -0.24 }));
  return merge(parts);
};

/** Rock candy (Candy World): a thick stick with a big lump of chunky sugar crystals, as wide as a small tree. */
export const rockCandyBig = () => {
  const parts: Parts = [cyl(0.1, 0.1, 0.7, 0xe0b070, {}, 6), blob(0.5, 0xffc0dc, { y: 1.25, sy: 1.35 }, 1)];
  const sugar = [0xff9ac8, 0x8ad0ff, 0xffc0dc, 0xb8e4ff, 0xd8a0ff];
  for (let i = 0; i < 20; i++) {
    const a = i * 2.4;
    const k = i / 19;
    const out = 0.2 + Math.sin(PI * k) * 0.32;
    const s = 0.36 + (i % 3) * 0.08;
    parts.push(box(s, s, s, sugar[i % 5], { x: Math.cos(a) * out, y: 0.5 + k * 1.2, z: Math.sin(a) * out, rx: i * 0.7, ry: i * 1.1 }));
  }
  parts.push(box(0.3, 0.3, 0.3, 0xffffff, { y: 1.75, ry: 0.6, rx: 0.5 }));
  return merge(parts);
};

/** Wrapped sweet (Candy World): a big striped boiled sweet stood on end, its wrapper twisted into a fan top and bottom. */
export const wrappedSweet = () => {
  const paper = 0xffe07a;
  const fold = 0xf2b83a;
  const parts: Parts = [
    bands(blob(0.66, 0xffffff, { y: 1.05, sy: 1.02 }, 2), [0xd81e3a, 0xfdfdfd, 0xd81e3a, 0xfdfdfd, 0xd81e3a, 0xfdfdfd, 0xd81e3a]),
    // The twists: pinched tight at the sweet, fanning out wide.
    taper(0.56, 0.12, paper, [0, 0, 0], [0, 0.46, 0], 10),
    taper(0.12, 0.56, paper, [0, 1.64, 0], [0, 2.1, 0], 10),
    torus(0.14, 0.05, fold, { y: 0.44 }, 8, 4),
    torus(0.14, 0.05, fold, { y: 1.66 }, 8, 4),
  ];
  // Pleats in the paper.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const x = Math.cos(a);
    const z = Math.sin(a);
    parts.push(beam(0.05, fold, [x * 0.14, 0.44, z * 0.14], [x * 0.56, 0.02, z * 0.56]), beam(0.05, fold, [x * 0.14, 1.66, z * 0.14], [x * 0.56, 2.08, z * 0.56]));
  }
  return merge(parts);
};
