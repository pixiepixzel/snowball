/**
 * Models for Under the Sea: shells, fish, wrecks and sunken cities.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const CORAL = 0xff6a5a;
const PINK = 0xff9ab0;
const ORANGE = 0xff8a2a;
const KELP = 0x2f8a4a;
const TEAL = 0x2ab0a8;
const DEEP = 0x1e4a8a;
const SKY = 0x6ac8f0;
const PEARL = 0xf4f0e8;
const SANDY = 0xe8d4a0;
const WOOD = 0x7a5232;
const DARK = 0x1e2430;
const GOLD = 0xf2c230;
const GREY = 0x8a98a8;
const BRASS = 0xc89a3a;

// ------------------------------------------------------------------ small things
export const bubble = () =>
  merge([blob(0.7, 0xbfeaff, { y: 0.8 }, 1), blob(0.2, 0xffffff, { x: -0.3, y: 1.1, z: -0.45 }), blob(0.3, 0xd8f4ff, { x: 0.7, y: 0.4, z: 0.2 }, 1), blob(0.2, 0xd8f4ff, { x: -0.6, y: 0.3, z: 0.4 })]);

/** A scallop shell standing up on its hinge: a fan of ribs, pink and cream by turns. */
export const shell = () => {
  const parts: Parts = [
    // The back of the shell, filling in behind the ribs.
    blob(0.86, 0xf6c8cc, { y: 0.92, z: 0.1, sy: 0.95, sz: 0.2 }, 1),
    // The hinge it stands on, with its two little wings.
    box(0.56, 0.2, 0.3, 0xe89aa8, { z: 0.02 }),
    box(0.26, 0.14, 0.2, 0xf6c8cc, { x: -0.4, y: 0.06, z: 0.04 }),
    box(0.26, 0.14, 0.2, 0xf6c8cc, { x: 0.4, y: 0.06, z: 0.04 }),
  ];
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.36;
    parts.push(taper(0.09, 0.17, i % 2 ? PINK : 0xfff0e6, [0, 0.16, -0.06], [Math.sin(a) * 0.95, 0.16 + Math.cos(a) * 1.5, -0.04], 6));
    parts.push(blob(0.17, i % 2 ? PINK : 0xfff0e6, { x: Math.sin(a) * 0.95, y: 0.16 + Math.cos(a) * 1.5, z: -0.04 }));
  }
  return merge(parts);
};

export const starfish = () => {
  const parts: Parts = [blob(0.4, ORANGE, { y: 0.2, sy: 0.5 }, 1)];
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * PI) / 5 - PI / 2;
    parts.push(spike(0.24, 0.9, i % 2 ? 0xff9a3c : ORANGE, [Math.cos(a) * 0.2, 0.16, Math.sin(a) * 0.2], [Math.cos(a), 0.04, Math.sin(a)], 5));
    parts.push(blob(0.06, 0xffd8a0, { x: Math.cos(a) * 0.5, y: 0.3, z: Math.sin(a) * 0.5 }));
  }
  return merge(parts);
};

/** A ray gliding just above the sand. */
export const ray = () =>
  merge([
    cone(1.0, 0.16, 0x5a7aa8, { y: 0.2, ry: PI / 4, sz: 0.9 }, 4),
    blob(0.3, 0x6a8ab8, { y: 0.3, z: -0.2, sy: 0.5, sz: 1.6 }, 1),
    taper(0.06, 0.02, 0x4a6a98, [0, 0.24, 0.6], [0, 0.24, 1.6], 4),
    blob(0.05, DARK, { x: -0.16, y: 0.42, z: -0.5 }),
    blob(0.05, DARK, { x: 0.16, y: 0.42, z: -0.5 }),
    blob(0.1, PEARL, { x: -0.4, y: 0.28, z: 0.1, sy: 0.3 }),
    blob(0.1, PEARL, { x: 0.4, y: 0.28, z: 0.1, sy: 0.3 }),
  ]);

/** The sea's early hazard. */
export const urchin = () => {
  const parts: Parts = [blob(0.6, 0x3a2a5a, { y: 0.8 }, 1)];
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4;
    const up = 1 - (i / 15) * 1.5;
    const ring = Math.sqrt(Math.max(0, 1 - up * up));
    const dir: [number, number, number] = [Math.cos(a) * ring, up, Math.sin(a) * ring];
    parts.push(spike(0.07, 0.8, i % 2 ? 0x6a4aa8 : 0x8a6ad0, [dir[0] * 0.5, 0.8 + dir[1] * 0.5, dir[2] * 0.5], dir, 4));
  }
  return merge(parts);
};

export const crab = () =>
  merge([
    blob(0.7, CORAL, { y: 0.6, sy: 0.55, sx: 1.2 }, 1),
    cyl(0.03, 0.03, 0.3, CORAL, { x: -0.24, y: 0.9 }, 4),
    cyl(0.03, 0.03, 0.3, CORAL, { x: 0.24, y: 0.9 }, 4),
    blob(0.1, PEARL, { x: -0.24, y: 1.26 }),
    blob(0.1, PEARL, { x: 0.24, y: 1.26 }),
    blob(0.05, DARK, { x: -0.24, y: 1.28, z: -0.08 }),
    blob(0.05, DARK, { x: 0.24, y: 1.28, z: -0.08 }),
    beam(0.12, 0xe8503c, [-0.7, 0.6, -0.2], [-1.1, 0.9, -0.6]),
    beam(0.12, 0xe8503c, [0.7, 0.6, -0.2], [1.1, 0.9, -0.6]),
    blob(0.26, CORAL, { x: -1.16, y: 1.02, z: -0.74, sy: 0.7 }, 1),
    blob(0.26, CORAL, { x: 1.16, y: 1.02, z: -0.74, sy: 0.7 }, 1),
    beam(0.07, 0xe8503c, [-0.6, 0.5, 0.1], [-1.1, 0, 0.2]),
    beam(0.07, 0xe8503c, [0.6, 0.5, 0.1], [1.1, 0, 0.2]),
    beam(0.07, 0xe8503c, [-0.6, 0.5, 0.35], [-1.0, 0, 0.6]),
    beam(0.07, 0xe8503c, [0.6, 0.5, 0.35], [1.0, 0, 0.6]),
  ]);

export const anemone = () => {
  const parts: Parts = [speckle(cyl(0.5, 0.62, 0.7, 0xb04a8a, {}, 9), 0.06)];
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4;
    const r = 0.14 + (i % 4) * 0.1;
    parts.push(taper(0.08, 0.05, i % 2 ? PINK : 0xffc0d8, [Math.cos(a) * r, 0.68, Math.sin(a) * r], [Math.cos(a) * (r + 0.36), 1.5 + (i % 3) * 0.14, Math.sin(a) * (r + 0.36)], 4));
    parts.push(blob(0.08, 0xffe0ec, { x: Math.cos(a) * (r + 0.38), y: 1.56 + (i % 3) * 0.14, z: Math.sin(a) * (r + 0.38) }));
  }
  return merge(parts);
};

/** An open clam with a pearl. `lip` colours the inside. */
export const clam = (outer: number, lip: number) => () => {
  const parts: Parts = [speckle(blob(0.95, outer, { y: 0.22, sy: 0.32 }, 1), 0.06), blob(0.84, lip, { y: 0.34, sy: 0.16 }, 1), blob(0.26, PEARL, { y: 0.56 }, 1)];
  parts.push(speckle(blob(0.95, outer, { y: 0.95, z: 0.6, sy: 0.3, rx: -1.0 }, 1), 0.06, 2));
  for (let i = 0; i < 7; i++) parts.push(blob(0.1, outer, { x: -0.75 + i * 0.25, y: 0.4, z: -0.7 + Math.abs(i - 3) * 0.12 }));
  return merge(parts);
};

export const eel = () => {
  const parts: Parts = [];
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 8; i++) pts.push([Math.sin(i * 0.9) * 0.28, 0.24, -1.0 + i * 0.25]);
  for (let i = 0; i < 8; i++) parts.push(taper(0.2 - i * 0.015, 0.2 - (i + 1) * 0.015, i % 2 ? 0x3f8a6a : 0x2f7a5a, pts[i], pts[i + 1], 6));
  parts.push(blob(0.24, 0x3f8a6a, { x: pts[0][0], y: 0.26, z: -1.08, sz: 1.3 }, 1));
  parts.push(blob(0.05, GOLD, { x: pts[0][0] - 0.13, y: 0.38, z: -1.2 }), blob(0.05, GOLD, { x: pts[0][0] + 0.13, y: 0.38, z: -1.2 }));
  parts.push(box(0.03, 0.2, 1.5, 0x5aaa8a, { y: 0.4, z: 0.1 }));
  return merge(parts);
};

export const seaweed = () => {
  const parts: Parts = [blob(0.4, SANDY, { y: 0.06, sy: 0.3 }, 1)];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.2;
    const h = 1.4 + (i % 3) * 0.3;
    const sway = i % 2 ? 0.25 : -0.25;
    parts.push(taper(0.12, 0.1, i % 2 ? KELP : 0x3f9a5a, [x, 0, (i % 2) * 0.16], [x + sway, h * 0.5, (i % 2) * 0.16], 4));
    parts.push(taper(0.1, 0.03, i % 2 ? 0x3f9a5a : KELP, [x + sway, h * 0.5, (i % 2) * 0.16], [x - sway * 0.6, h, (i % 2) * 0.16], 4));
  }
  return merge(parts);
};

/** Branching coral. */
export const coralTree = (a: number, b: number) => () => {
  const parts: Parts = [speckle(cyl(0.2, 0.3, 0.6, a, {}, 6), 0.06)];
  const branch = (x: number, y: number, z: number, dx: number, dz: number, len: number, depth: number): void => {
    const ex = x + dx * len;
    const ey = y + len;
    const ez = z + dz * len;
    parts.push(taper(0.06 + depth * 0.05, 0.04 + depth * 0.04, depth % 2 ? a : b, [x, y, z], [ex, ey, ez], 5));
    if (depth === 0) {
      parts.push(blob(0.11, 0xffe8e0, { x: ex, y: ey, z: ez }));
      return;
    }
    branch(ex, ey, ez, dx + 0.5, dz + 0.2, len * 0.75, depth - 1);
    branch(ex, ey, ez, dx - 0.5, dz - 0.25, len * 0.75, depth - 1);
  };
  branch(0, 0.5, 0, 0.5, 0.1, 0.6, 2);
  branch(0, 0.5, 0, -0.5, -0.1, 0.6, 2);
  branch(0, 0.5, 0, 0, 0.3, 0.7, 1);
  return merge(parts);
};

/** A striped reef fish hovering above the sand. */
export const fish = (body: number, stripe: number) => () =>
  merge([
    cyl(0.04, 0.04, 0.6, GREY, {}, 4),
    bands(blob(0.62, 0xffffff, { y: 1.1, sx: 0.5, sz: 1.4 }, 1), [body, stripe, body, stripe, body]),
    spike(0.36, 0.5, body, [0, 1.1, 1.2], [0, 0, -1], 4),
    spike(0.2, 0.44, stripe, [0, 1.6, 0.1], [0, 1, 0.5], 4),
    box(0.04, 0.24, 0.34, stripe, { x: -0.32, y: 0.86, z: -0.1, rz: 0.5 }),
    box(0.04, 0.24, 0.34, stripe, { x: 0.32, y: 0.86, z: -0.1, rz: -0.5 }),
    blob(0.08, PEARL, { x: -0.2, y: 1.24, z: -0.66 }),
    blob(0.08, PEARL, { x: 0.2, y: 1.24, z: -0.66 }),
    blob(0.04, DARK, { x: -0.24, y: 1.24, z: -0.72 }),
    blob(0.04, DARK, { x: 0.24, y: 1.24, z: -0.72 }),
  ]);

export const treasureChest = () => {
  const parts: Parts = [
    box(1.6, 0.8, 1.1, WOOD, {}),
    rodX(0.56, 1.6, 0x8a6240, 0, 0.84, 0.1, 8),
    box(1.64, 0.12, 1.14, BRASS, { y: 0.74 }),
    box(0.16, 0.86, 1.14, BRASS, { x: -0.6 }),
    box(0.16, 0.86, 1.14, BRASS, { x: 0.6 }),
    box(0.24, 0.3, 0.06, GOLD, { y: 0.5, z: -0.57 }),
  ];
  for (let i = 0; i < 7; i++) parts.push(blob(0.13, i % 3 ? GOLD : 0xff5a7a, { x: -0.6 + i * 0.2, y: 0.9 + (i % 2) * 0.06, z: -0.5 }));
  return merge(parts);
};

export const turtle = () =>
  merge([
    speckle(blob(0.8, 0x4a8a4a, { y: 0.6, sy: 0.55, sz: 1.15 }, 1), 0.1),
    blob(0.7, 0xd8c890, { y: 0.4, sy: 0.3, sz: 1.1 }, 1),
    blob(0.28, 0x7ab86a, { y: 0.6, z: -1.05, sz: 1.3 }, 1),
    blob(0.04, DARK, { x: -0.16, y: 0.7, z: -1.24 }),
    blob(0.04, DARK, { x: 0.16, y: 0.7, z: -1.24 }),
    box(0.9, 0.08, 0.4, 0x7ab86a, { x: -0.86, y: 0.36, z: -0.5, ry: 0.5 }),
    box(0.9, 0.08, 0.4, 0x7ab86a, { x: 0.86, y: 0.36, z: -0.5, ry: -0.5 }),
    box(0.5, 0.08, 0.3, 0x7ab86a, { x: -0.6, y: 0.34, z: 0.8, ry: -0.6 }),
    box(0.5, 0.08, 0.3, 0x7ab86a, { x: 0.6, y: 0.34, z: 0.8, ry: 0.6 }),
    spike(0.08, 0.3, 0x7ab86a, [0, 0.4, 0.9], [0, 0, 1], 4),
  ]);

/** A jellyfish. The bell is white so the game can tint it. */
export const jellyfish = () => {
  const parts: Parts = [blob(0.7, 0xffffff, { y: 1.5, sy: 0.75 }, 1), cyl(0.62, 0.7, 0.14, 0xffffff, { y: 1.2 }, 10), blob(0.3, 0xffe8f4, { y: 1.6, sy: 0.6 }, 1)];
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * PI) / 7;
    const x = Math.cos(a) * 0.42;
    const z = Math.sin(a) * 0.42;
    parts.push(taper(0.06, 0.04, 0xffe8f4, [x, 1.2, z], [x * 1.3, 0.7, z * 1.3 + 0.1], 4));
    parts.push(taper(0.04, 0.02, 0xffe8f4, [x * 1.3, 0.7, z * 1.3 + 0.1], [x * 0.9, 0.1, z * 0.9 + 0.3], 4));
  }
  return merge(parts);
};

export const anchor = () =>
  merge([
    // Chunky enough to read from a distance: a thick shank, a big ring and broad flukes.
    blob(0.5, SANDY, { y: 0.1, sy: 0.4 }, 1),
    cyl(0.17, 0.2, 1.5, GREY, { y: 0.25 }, 7),
    torus(0.3, 0.1, 0x6a7888, { y: 1.98, rx: PI / 2 }, 10, 5),
    rodX(0.13, 1.1, 0x6a7888, 0, 1.52, 0, 6),
    blob(0.17, GREY, { x: -0.58, y: 1.52 }),
    blob(0.17, GREY, { x: 0.58, y: 1.52 }),
    taper(0.22, 0.17, GREY, [0, 0.3, 0], [-0.8, 0.62, 0], 6),
    taper(0.22, 0.17, GREY, [0, 0.3, 0], [0.8, 0.62, 0], 6),
    spike(0.3, 0.5, 0x6a7888, [-0.8, 0.56, 0], [-0.35, 1, 0], 4),
    spike(0.3, 0.5, 0x6a7888, [0.8, 0.56, 0], [0.35, 1, 0], 4),
    blob(0.24, GREY, { y: 0.3 }, 1),
  ]);

export const dolphin = () =>
  merge([
    cyl(0.04, 0.04, 0.5, GREY, {}, 4),
    blob(0.42, 0x6a9ac8, { y: 0.95, sz: 2.0, sy: 0.9 }, 1),
    blob(0.34, 0xd8e8f4, { y: 0.84, sz: 1.8, sy: 0.6 }, 1),
    spike(0.14, 0.5, 0x6a9ac8, [0, 0.92, -0.9], [0, -0.1, -1], 5),
    spike(0.18, 0.5, 0x5a8ab8, [0, 1.26, 0.05], [0, 1, 0.7], 4),
    box(0.5, 0.05, 0.24, 0x5a8ab8, { x: -0.44, y: 0.74, z: -0.3, rz: 0.5 }),
    box(0.5, 0.05, 0.24, 0x5a8ab8, { x: 0.44, y: 0.74, z: -0.3, rz: -0.5 }),
    taper(0.2, 0.08, 0x6a9ac8, [0, 0.95, 0.7], [0, 1.1, 1.2], 5),
    box(0.8, 0.05, 0.3, 0x5a8ab8, { y: 1.1, z: 1.25 }),
    blob(0.04, DARK, { x: -0.3, y: 1.02, z: -0.6 }),
    blob(0.04, DARK, { x: 0.3, y: 1.02, z: -0.6 }),
  ]);

/** A wrecked ship's mast, still standing. */
export const mast = () =>
  merge([
    blob(0.55, SANDY, { y: 0.1, sy: 0.4 }, 1),
    cyl(0.12, 0.18, 2.0, WOOD, {}, 7),
    // Two yards, a torn sail hanging from the upper one, and a crow's nest.
    rodX(0.07, 1.5, 0x5a3a22, 0, 1.5, 0, 6),
    rodX(0.06, 1.1, 0x5a3a22, 0, 0.72, 0, 6),
    box(1.3, 0.72, 0.05, 0xe8e0c8, { y: 0.76 }),
    box(0.3, 0.24, 0.06, 0xc8c0a8, { x: -0.5, y: 0.6 }),
    box(0.26, 0.3, 0.06, 0xc8c0a8, { x: 0.4, y: 0.56 }),
    cyl(0.32, 0.24, 0.26, 0x8a6240, { y: 1.66 }, 8),
    torus(0.32, 0.04, 0x5a3a22, { y: 1.92 }, 8, 3),
    // A black flag at the top.
    box(0.5, 0.3, 0.04, DARK, { x: 0.3, y: 2.0 }),
    blob(0.07, PEARL, { x: 0.3, y: 2.16, z: -0.03 }),
    beam(0.03, 0xe8e0c8, [0.74, 1.5, 0], [0.16, 0.2, 0.34]),
    beam(0.03, 0xe8e0c8, [-0.74, 1.5, 0], [-0.16, 0.2, 0.34]),
  ]);

export const divingBell = () => {
  const parts: Parts = [cyl(0.75, 0.82, 1.0, BRASS, { y: 0.2 }, 10), blob(0.75, BRASS, { y: 1.2, sy: 0.8 }, 1), torus(0.8, 0.07, 0x8a6a24, { y: 0.24 }, 12, 4), torus(0.76, 0.06, 0x8a6a24, { y: 1.2 }, 12, 4), torus(0.2, 0.06, GREY, { y: 1.9, rx: PI / 2 }, 8, 4)];
  for (let i = 0; i < 4; i++) {
    const a = (i * PI) / 2 + PI / 4;
    parts.push(box(0.14, 0.24, 0.14, GREY, { x: Math.cos(a) * 0.7, z: Math.sin(a) * 0.7 }));
    parts.push(blob(0.2, SKY, { x: Math.cos(a - PI / 4) * 0.78, y: 0.76, z: Math.sin(a - PI / 4) * 0.78 }, 1));
    parts.push(torus(0.22, 0.04, 0x8a6a24, { x: Math.cos(a - PI / 4) * 0.8, y: 0.76, z: Math.sin(a - PI / 4) * 0.8, rx: PI / 2, ry: -(a - PI / 4) + PI / 2 }, 8, 3));
  }
  return merge(parts);
};

/** A shark. Also the thing that charges up the slope at you. */
export const shark = () =>
  merge([
    cyl(0.04, 0.04, 0.4, GREY, { z: 0.2 }, 4),
    blob(0.44, 0x6a7a8a, { y: 0.8, sz: 2.1 }, 1),
    blob(0.36, PEARL, { y: 0.66, sz: 1.9, sy: 0.6 }, 1),
    spike(0.3, 0.6, 0x6a7a8a, [0, 0.8, -0.8], [0, 0, -1], 6),
    spike(0.22, 0.66, 0x5a6a7a, [0, 1.14, -0.1], [0, 1, 0.6], 4),
    box(0.6, 0.05, 0.3, 0x5a6a7a, { x: -0.5, y: 0.58, z: -0.3, rz: 0.5 }),
    box(0.6, 0.05, 0.3, 0x5a6a7a, { x: 0.5, y: 0.58, z: -0.3, rz: -0.5 }),
    taper(0.22, 0.08, 0x6a7a8a, [0, 0.8, 0.7], [0, 0.86, 1.2], 5),
    spike(0.16, 0.6, 0x5a6a7a, [0, 0.86, 1.15], [0, 1, 0.5], 4),
    spike(0.12, 0.36, 0x5a6a7a, [0, 0.86, 1.15], [0, -1, 0.5], 4),
    box(0.44, 0.06, 0.3, 0xb81e2a, { y: 0.56, z: -1.0 }),
    blob(0.05, DARK, { x: -0.3, y: 0.9, z: -0.86 }),
    blob(0.05, DARK, { x: 0.3, y: 0.9, z: -0.86 }),
    ...[-0.16, -0.05, 0.06, 0.17].map((x) => spike(0.04, 0.1, PEARL, [x, 0.62, -1.12], [0, -1, 0], 3)),
  ]);

export const submarine = () =>
  merge([
    rodZ(0.5, 1.6, 0xf2c230, 0, 0.75, 0, 10),
    blob(0.5, 0xf2c230, { y: 0.75, z: -0.8 }, 1),
    spike(0.5, 0.6, 0xe0a820, [0, 0.75, 0.8], [0, 0, 1], 10),
    cyl(0.28, 0.32, 0.5, 0xe0a820, { y: 1.2, z: -0.1 }, 8),
    cyl(0.04, 0.04, 0.5, GREY, { y: 1.7, z: -0.1 }, 5),
    box(0.08, 0.08, 0.26, GREY, { y: 2.14, z: -0.2 }),
    blob(0.2, SKY, { y: 0.8, z: -1.2 }, 1),
    blob(0.14, SKY, { x: -0.48, y: 0.84, z: -0.3 }),
    blob(0.14, SKY, { x: -0.48, y: 0.84, z: 0.2 }),
    blob(0.14, SKY, { x: 0.48, y: 0.84, z: -0.3 }),
    blob(0.14, SKY, { x: 0.48, y: 0.84, z: 0.2 }),
    box(0.06, 0.7, 0.3, 0xc8402a, { y: 0.4, z: 1.3 }),
    box(0.8, 0.06, 0.3, 0xc8402a, { y: 0.72, z: 1.3 }),
    box(0.3, 0.2, 1.2, 0x8a6a24, { y: 0.04 }),
  ]);

export const shipwreck = () => {
  const parts: Parts = [
    frustum(0.5, 1.8, 1.0, 2.1, 0.8, WOOD, { rz: 0.25, y: 0.1 }),
    box(0.96, 0.08, 2.0, 0x8a6240, { y: 0.84, x: -0.2, rz: 0.25 }),
    taper(0.07, 0.05, 0x5a3a22, [-0.2, 0.8, -0.3], [-0.75, 2.1, -0.3], 5),
    beam(0.05, 0x5a3a22, [-0.75, 1.5, -0.3], [0.1, 1.9, -0.3]),
    box(0.7, 0.5, 0.03, 0xc8c0a8, { x: -0.3, y: 1.3, z: -0.3, rz: 0.4 }),
    taper(0.06, 0.04, 0x5a3a22, [-0.1, 0.8, 0.5], [0.1, 1.3, 0.6], 5),
    box(0.6, 0.5, 0.5, 0x8a6240, { x: -0.16, y: 0.84, z: 0.75, rz: 0.25 }),
    blob(0.5, SANDY, { x: 0.5, y: 0.1, z: -0.4, sy: 0.4 }, 1),
    blob(0.16, DARK, { x: 0.36, y: 0.5, z: -0.5 }),
    blob(0.16, DARK, { x: 0.4, y: 0.5, z: 0.2 }),
  ];
  for (let i = 0; i < 5; i++) parts.push(beam(0.05, 0x5a3a22, [0.3, 0.2, -0.8 + i * 0.4], [0.62, 0.95, -0.8 + i * 0.4]));
  return merge(parts);
};

export const whale = () =>
  merge([
    blob(0.62, DEEP, { y: 0.8, sz: 1.7, sx: 1.05 }, 1),
    blob(0.54, 0xcfe0f0, { y: 0.6, sz: 1.6, sy: 0.6, sx: 1.0 }, 1),
    taper(0.4, 0.14, DEEP, [0, 0.8, 0.8], [0, 1.0, 1.5], 6),
    box(1.1, 0.07, 0.36, 0x16407a, { y: 1.0, z: 1.56 }),
    box(0.6, 0.06, 0.3, 0x16407a, { x: -0.72, y: 0.5, z: -0.2, rz: 0.4 }),
    box(0.6, 0.06, 0.3, 0x16407a, { x: 0.72, y: 0.5, z: -0.2, rz: -0.4 }),
    blob(0.05, PEARL, { x: -0.5, y: 0.8, z: -0.8 }),
    blob(0.05, PEARL, { x: 0.5, y: 0.8, z: -0.8 }),
    // Spout.
    cyl(0.05, 0.05, 0.4, 0xbfeaff, { y: 1.4, z: -0.3 }, 5),
    blob(0.2, 0xd8f4ff, { y: 1.9, z: -0.3 }, 1),
    blob(0.14, 0xd8f4ff, { x: 0.24, y: 1.76, z: -0.3 }),
    blob(0.14, 0xd8f4ff, { x: -0.24, y: 1.76, z: -0.3 }),
  ]);

export const lighthouse = () =>
  merge([
    speckle(blob(0.7, 0x6a7a80, { y: 0.14, sy: 0.4 }, 1), 0.08),
    bands(cyl(0.34, 0.5, 1.4, 0xffffff, { y: 0.2 }, 9), [0xf4f0e8, 0xc8402a, 0xf4f0e8, 0xc8402a, 0xf4f0e8]),
    cyl(0.5, 0.5, 0.07, GREY, { y: 1.6 }, 9),
    cyl(0.26, 0.26, 0.3, 0xfff06a, { y: 1.67 }, 8),
    cone(0.36, 0.3, 0xc8402a, { y: 1.97 }, 8),
    box(0.18, 0.36, 0.05, DARK, { y: 0.2, z: -0.5 }),
  ]);

/** A giant tentacle rising out of the sea bed. */
export const tentacle = () => {
  const parts: Parts = [blob(0.6, SANDY, { y: 0.1, sy: 0.4 }, 1)];
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 9; i++) {
    const t = i / 9;
    pts.push([Math.sin(t * 4.2) * 0.32 * (0.4 + t), t * 1.9 - (t > 0.82 ? (t - 0.82) * 2.2 : 0), -t * t * 0.5]);
  }
  for (let i = 0; i < 9; i++) {
    const r0 = 0.3 - i * 0.028;
    parts.push(taper(r0, r0 - 0.028, i % 2 ? 0x8a3a8a : 0x9a4a9a, pts[i], pts[i + 1], 6));
    parts.push(blob(0.07, PINK, { x: pts[i][0], y: pts[i][1] + 0.1, z: pts[i][2] - r0 * 0.9 }));
  }
  return merge(parts);
};

export const seaTemple = () => {
  const parts: Parts = [box(2.0, 0.2, 1.7, 0x6a8a98, {}), box(1.8, 0.14, 1.5, 0x8aaab8, { y: 0.2 }), box(1.1, 0.9, 0.9, 0x7a9aa8, { y: 0.34, z: 0.1 })];
  for (let i = 0; i < 4; i++) {
    const x = -0.72 + i * 0.48;
    parts.push(speckle(cyl(0.11, 0.13, i === 2 ? 0.6 : 1.0, 0xd8eaf0, { x, y: 0.34, z: -0.56 }, 7), 0.05, i + 1));
  }
  parts.push(box(1.9, 0.2, 1.5, 0x8aaab8, { y: 1.36, rz: 0.03 }), blob(0.7, TEAL, { y: 1.56, sy: 0.6 }, 1), spike(0.08, 0.4, GOLD, [0, 1.94, 0], [0, 1, 0], 5));
  parts.push(taper(0.06, 0.03, KELP, [0.9, 0.2, 0.5], [1.0, 1.2, 0.4], 4), taper(0.06, 0.03, KELP, [-0.9, 0.2, -0.3], [-0.8, 1.0, -0.4], 4));
  return merge(parts);
};

export const atlantisTower = () => {
  const parts: Parts = [cyl(0.6, 0.7, 0.2, 0x6a8a98, {}, 10), grade(cyl(0.3, 0.5, 1.3, 0xffffff, { y: 0.2 }, 9), 0x2a7a9a, 0x8ae0e8), grade(cone(0.34, 0.6, 0xffffff, { y: 1.5 }, 9), 0x8ae0e8, 0xeafcff)];
  for (const y of [0.6, 1.0, 1.4]) parts.push(torus(0.5 - (y - 0.6) * 0.14, 0.05, GOLD, { y }, 12, 4));
  for (let i = 0; i < 4; i++) {
    const a = (i * PI) / 2 + PI / 4;
    parts.push(grade(cyl(0.1, 0.13, 0.9, 0xffffff, { x: Math.cos(a) * 0.62, y: 0.2, z: Math.sin(a) * 0.62 }, 6), 0x2a7a9a, 0x8ae0e8));
    parts.push(blob(0.12, 0xb8fff4, { x: Math.cos(a) * 0.62, y: 1.2, z: Math.sin(a) * 0.62 }));
  }
  parts.push(blob(0.12, 0xeafcff, { y: 2.14 }));
  return merge(parts);
};

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
export const coralWall = () => {
  const parts: Parts = [speckle(box(18.2, 0.4, 0.9, 0xc8b890, {}), 0.06)];
  const tones = [CORAL, PINK, ORANGE, 0xb06aff, TEAL, 0xffd84a];
  for (let i = 0; i < 18; i++) {
    const x = -8.5 + i;
    const c = tones[i % tones.length];
    if (i % 3 === 0) parts.push(speckle(blob(0.7, c, { x, y: 0.9, sy: 0.9 }, 1), 0.08, i + 1));
    else {
      parts.push(taper(0.2, 0.12, c, [x, 0.4, 0], [x - 0.2, 1.3, 0.1], 5), taper(0.12, 0.07, c, [x - 0.2, 1.3, 0.1], [x - 0.5, 1.9, 0], 5), taper(0.12, 0.07, c, [x - 0.2, 1.3, 0.1], [x + 0.25, 1.95 - (i % 2) * 0.2, 0.1], 5));
      parts.push(taper(0.14, 0.08, c, [x, 0.6, 0], [x + 0.4, 1.4, -0.1], 5));
    }
  }
  return merge(parts);
};

export const kelpWall = () => {
  const parts: Parts = [speckle(box(18.2, 0.3, 0.8, 0x5a6a5a, {}), 0.06)];
  for (let i = 0; i < 36; i++) {
    const x = -8.75 + i * 0.5;
    const h = 1.5 + ((i * 7) % 5) * 0.13;
    const sway = (i % 2 ? 1 : -1) * 0.18;
    const z = ((i * 3) % 3) * 0.2 - 0.2;
    parts.push(taper(0.16, 0.13, i % 2 ? KELP : 0x3f9a5a, [x, 0.3, z], [x + sway, 0.3 + h * 0.5, z], 4));
    parts.push(taper(0.13, 0.04, i % 2 ? 0x3f9a5a : 0x4aaa66, [x + sway, 0.3 + h * 0.5, z], [x - sway, 0.3 + h, z], 4));
  }
  return merge(parts);
};

export const chainWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3;
    parts.push(box(0.7, 0.3, 0.7, 0x5a6a78, { x }), cyl(0.22, 0.26, 1.7, GREY, { x, y: 0.3 }, 7), blob(0.3, 0x6a7888, { x, y: 2.1 }, 1));
  }
  for (const y of [0.7, 1.25, 1.8]) for (let i = 0; i < 30; i++) parts.push(torus(0.24, 0.07, i % 2 ? 0x6a7888 : GREY, { x: -8.7 + i * 0.6, y, rx: PI / 2, ry: i % 2 ? PI / 2 : 0 }, 7, 4));
  return merge(parts);
};
