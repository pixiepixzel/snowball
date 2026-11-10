/**
 * Models for objects that used to borrow another object's model, either outright (the
 * "space freighter" was the shuttle) or in different colours (the "ghost coach" was a green
 * carriage). Each now has a shape of its own.
 *
 * Like every object: 1 unit = the object's size, standing on y = 0, about 2 units tall,
 * front facing -Z. Parts painted white take the per-object tint where a def has `tints`.
 */
import type { BufferGeometry } from 'three';
import { beam, blob, box, cone, cyl, frustum, merge, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
type V3 = [number, number, number];
const PI = Math.PI;
const TAU = PI * 2;
const WHITE = 0xffffff;
const DARK = 0x22262e;
const GOLD = 0xf2c230;

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
