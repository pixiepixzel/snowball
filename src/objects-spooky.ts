/**
 * Models for Spooky Hollow: pumpkins, graves, ghosts and haunted houses.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { beam, blob, box, cone, cyl, frustum, grade, merge, prism, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const NIGHT = 0x2a2438;
const PURPLE = 0x5a3a8a;
const VIOLET = 0x8a5ad0;
const PUMPKIN = 0xff7a1a;
const GLOW = 0xffd84a;
const SLIME = 0x8ae04a;
const BONE = 0xece4d0;
const GRAVE = 0x8a8a96;
const DARK_GRAVE = 0x5e5e6c;
const DEAD = 0x4a3a32;
const IRON = 0x2c2c36;
const BLOOD = 0xa8202a;
const STRAW = 0xd8b04a;

/** A lit window: a glowing pane with a dark cross bar. */
const windowAt = (x: number, y: number, z: number, w = 0.32, h = 0.4): Parts => [box(w, h, 0.05, GLOW, { x, y, z }), box(w + 0.02, 0.04, 0.06, IRON, { x, y: y + h / 2 - 0.02, z }), box(0.04, h, 0.06, IRON, { x, y, z })];

// ------------------------------------------------------------------ small things
export const bat = () =>
  merge([
    blob(0.3, NIGHT, { y: 0.7, sy: 1.2 }, 1),
    spike(0.08, 0.24, NIGHT, [-0.14, 0.98, 0], [-0.2, 1, 0], 4),
    spike(0.08, 0.24, NIGHT, [0.14, 0.98, 0], [0.2, 1, 0], 4),
    // Wings: a flat sheet each side with three points along the trailing edge.
    box(0.9, 0.05, 0.5, 0x3a3050, { x: -0.7, y: 0.86, rz: -0.25 }),
    box(0.9, 0.05, 0.5, 0x3a3050, { x: 0.7, y: 0.86, rz: 0.25 }),
    ...[-1.0, -0.7, -0.4, 0.4, 0.7, 1.0].map((x) => spike(0.14, 0.34, 0x3a3050, [x, 0.9 + (Math.abs(x) - 0.3) * 0.26, 0.2], [0, -0.2, 1], 3)),
    beam(0.05, NIGHT, [-0.25, 0.8, -0.2], [-1.15, 1.08, -0.2]),
    beam(0.05, NIGHT, [0.25, 0.8, -0.2], [1.15, 1.08, -0.2]),
    blob(0.05, BLOOD, { x: -0.1, y: 0.82, z: -0.26 }),
    blob(0.05, BLOOD, { x: 0.1, y: 0.82, z: -0.26 }),
  ]);

export const candles = () => {
  const parts: Parts = [blob(0.8, BONE, { y: 0.08, sy: 0.14 }, 1)];
  const one = (x: number, z: number, h: number): void => {
    parts.push(cyl(0.2, 0.24, h, BONE, { x, z }, 7), spike(0.12, 0.36, PUMPKIN, [x, h, z], [0, 1, 0], 5), spike(0.06, 0.24, GLOW, [x, h + 0.02, z], [0, 1, 0], 4));
    parts.push(blob(0.1, BONE, { x: x + 0.2, y: h * 0.7, z, sy: 1.6 }));
  };
  one(0, 0, 1.2);
  one(-0.5, 0.2, 0.7);
  one(0.45, -0.25, 0.9);
  return merge(parts);
};

export const skull = () =>
  merge([
    blob(0.8, BONE, { y: 1.0 }, 1),
    box(0.9, 0.5, 0.8, BONE, { y: 0.1, z: -0.1 }),
    blob(0.24, IRON, { x: -0.3, y: 1.0, z: -0.62 }, 1),
    blob(0.24, IRON, { x: 0.3, y: 1.0, z: -0.62 }, 1),
    spike(0.1, 0.2, IRON, [0, 0.62, -0.74], [0, 1, 0], 3),
    ...[-0.3, -0.1, 0.1, 0.3].map((x) => box(0.14, 0.26, 0.06, 0xd8ceb4, { x, y: 0.1, z: -0.52 })),
  ]);

export const bone = () =>
  merge([
    rodZ(0.14, 1.5, BONE, 0, 0.18, 0, 6),
    blob(0.24, BONE, { x: -0.16, y: 0.2, z: -0.8 }),
    blob(0.24, BONE, { x: 0.16, y: 0.2, z: -0.8 }),
    blob(0.24, BONE, { x: -0.16, y: 0.2, z: 0.8 }),
    blob(0.24, BONE, { x: 0.16, y: 0.2, z: 0.8 }),
  ]);

/** Spooky Hollow's early hazard: a knot of dead thorns. */
export const thorns = () => {
  const parts: Parts = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const lean = 0.25 + (i % 3) * 0.3;
    const h = 1.0 + (i % 4) * 0.35;
    const tip: [number, number, number] = [Math.cos(a) * lean * h * 0.7, h, Math.sin(a) * lean * h * 0.7];
    parts.push(taper(0.1, 0.03, i % 2 ? DEAD : 0x3a2c28, [Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15], tip, 4));
    parts.push(spike(0.04, 0.3, 0x6a5a52, [tip[0] * 0.6, tip[1] * 0.6, tip[2] * 0.6], [Math.sin(a), 0.5, -Math.cos(a)], 3));
    parts.push(spike(0.04, 0.26, 0x6a5a52, [tip[0] * 0.3, tip[1] * 0.3, tip[2] * 0.3], [-Math.sin(a), 0.6, Math.cos(a)], 3));
  }
  return merge(parts);
};

export const blackCat = () =>
  merge([
    blob(0.4, NIGHT, { y: 0.56, sz: 1.3 }, 1),
    taper(0.3, 0.26, NIGHT, [0, 0.6, -0.3], [0, 1.1, -0.5], 6),
    blob(0.34, NIGHT, { y: 1.3, z: -0.56 }, 1),
    spike(0.13, 0.3, NIGHT, [-0.2, 1.52, -0.52], [-0.2, 1, 0], 3),
    spike(0.13, 0.3, NIGHT, [0.2, 1.52, -0.52], [0.2, 1, 0], 3),
    blob(0.07, SLIME, { x: -0.14, y: 1.36, z: -0.84 }),
    blob(0.07, SLIME, { x: 0.14, y: 1.36, z: -0.84 }),
    taper(0.07, 0.04, NIGHT, [0, 0.6, 0.5], [0.2, 1.5, 0.7], 4),
    taper(0.04, 0.03, NIGHT, [0.2, 1.5, 0.7], [-0.05, 1.8, 0.6], 4),
    box(0.14, 0.4, 0.14, NIGHT, { x: -0.2, z: -0.3 }),
    box(0.14, 0.4, 0.14, NIGHT, { x: 0.2, z: -0.3 }),
    box(0.14, 0.4, 0.14, NIGHT, { x: -0.2, z: 0.36 }),
    box(0.14, 0.4, 0.14, NIGHT, { x: 0.2, z: 0.36 }),
  ]);

/** A carved pumpkin with a glowing face. */
export const pumpkin = () => {
  const parts: Parts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * PI) / 3;
    parts.push(blob(0.62, i % 2 ? PUMPKIN : 0xf06a10, { x: Math.cos(a) * 0.32, y: 0.72, z: Math.sin(a) * 0.32, sy: 1.1 }, 1));
  }
  parts.push(taper(0.1, 0.06, 0x4a7a2a, [0, 1.3, 0], [0.12, 1.7, 0], 5));
  parts.push(spike(0.16, 0.26, GLOW, [-0.28, 0.76, -0.8], [0, 1, 0], 3), spike(0.16, 0.26, GLOW, [0.28, 0.76, -0.8], [0, 1, 0], 3));
  parts.push(box(0.7, 0.14, 0.06, GLOW, { y: 0.4, z: -0.88 }), box(0.14, 0.12, 0.07, PUMPKIN, { x: -0.14, y: 0.46, z: -0.88 }), box(0.14, 0.12, 0.07, PUMPKIN, { x: 0.16, y: 0.38, z: -0.88 }));
  return merge(parts);
};

export const coffin = () =>
  merge([
    frustum(0.7, 2.0, 0.8, 2.1, 0.4, DEAD, {}),
    frustum(0.84, 2.14, 0.7, 2.0, 0.12, 0x5a463c, { y: 0.4 }),
    box(0.1, 0.05, 0.9, GLOW, { y: 0.52, z: -0.2 }),
    box(0.44, 0.05, 0.1, GLOW, { y: 0.52, z: -0.4 }),
    box(0.06, 0.1, 0.3, 0xb8a060, { x: -0.44, y: 0.2 }),
    box(0.06, 0.1, 0.3, 0xb8a060, { x: 0.44, y: 0.2 }),
  ]);

export const broomstick = () => {
  const parts: Parts = [rodZ(0.06, 1.5, 0x8a6240, 0, 0.16, -0.3, 5), torus(0.14, 0.05, BLOOD, { y: 0.16, z: 0.46, rx: PI / 2 }, 7, 3)];
  for (let i = 0; i < 7; i++) parts.push(taper(0.07, 0.03, i % 2 ? STRAW : 0xc09a3a, [0, 0.16, 0.46], [(i - 3) * 0.12, 0.1 + (i % 2) * 0.12, 1.2], 4));
  return merge(parts);
};

/** A leafless tree. `gnarl` makes it taller and more twisted. */
export const deadTree = (gnarl: number) => () => {
  const parts: Parts = [speckle(taper(0.24, 0.14, DEAD, [0, 0, 0], [0.1 * gnarl, 0.9, 0], 6), 0.08)];
  const limb = (from: [number, number, number], dx: number, dz: number, len: number, r: number, depth: number): void => {
    const to: [number, number, number] = [from[0] + dx * len, from[1] + len * 0.75, from[2] + dz * len];
    parts.push(taper(r, r * 0.6, depth % 2 ? DEAD : 0x3a2c28, from, to, 5));
    if (depth > 0) {
      limb(to, dx + 0.5, dz + 0.3, len * 0.72, r * 0.6, depth - 1);
      limb(to, dx - 0.6, dz - 0.2, len * 0.72, r * 0.6, depth - 1);
    }
  };
  limb([0.1 * gnarl, 0.9, 0], 0.5, 0.1, 0.62, 0.13, 2);
  limb([0.1 * gnarl, 0.9, 0], -0.55, -0.1, 0.6, 0.13, 2);
  limb([0.05 * gnarl, 0.6, 0], -0.2, 0.5, 0.4, 0.08, 1);
  parts.push(blob(0.1, NIGHT, { x: 0.02, y: 0.56, z: -0.2, sy: 1.5 }));
  return merge(parts);
};

export const scarecrow = () =>
  merge([
    // The pole and the crossbar it hangs on.
    cyl(0.06, 0.08, 1.5, 0x6a4a2a, {}, 5),
    rodX(0.06, 1.9, 0x6a4a2a, 0, 1.1, 0, 5),
    // A ragged red shirt with a patch, sleeves out along the crossbar.
    frustum(0.7, 0.4, 0.56, 0.34, 0.75, 0xb8442e, { y: 0.5 }),
    box(0.5, 0.24, 0.26, 0xb8442e, { x: -0.56, y: 0.98 }),
    box(0.5, 0.24, 0.26, 0xb8442e, { x: 0.56, y: 0.98 }),
    box(0.2, 0.2, 0.03, GLOW, { x: -0.12, y: 0.74, z: -0.2 }),
    // Straw sticking out of the cuffs and the hem.
    ...[-0.86, 0.86].map((x) => spike(0.13, 0.34, STRAW, [x, 1.1, 0], [Math.sign(x), -0.3, 0], 4)),
    spike(0.24, 0.3, STRAW, [0, 0.52, 0], [0, -1, 0], 5),
    // A sack head with a face, and a hat that sits on top of it rather than over it.
    blob(0.34, STRAW, { y: 1.56 }, 1),
    blob(0.06, IRON, { x: -0.12, y: 1.62, z: -0.3 }),
    blob(0.06, IRON, { x: 0.12, y: 1.62, z: -0.3 }),
    spike(0.05, 0.16, PUMPKIN, [0, 1.54, -0.32], [0, -0.2, -1], 4),
    box(0.22, 0.04, 0.03, IRON, { y: 1.42, z: -0.31 }),
    cyl(0.48, 0.5, 0.05, DEAD, { y: 1.82 }, 9),
    cone(0.26, 0.4, DEAD, { y: 1.87 }, 7),
    torus(0.27, 0.035, BLOOD, { y: 1.9 }, 8, 3),
  ]);

export const gravestones = () => {
  const parts: Parts = [speckle(blob(1.0, 0x4a5a3a, { y: 0.06, sy: 0.14 }, 1), 0.08)];
  const stone = (x: number, z: number, h: number, tilt: number, cross: boolean): void => {
    if (cross) {
      parts.push(box(0.2, h, 0.16, GRAVE, { x, z, rz: tilt }), box(0.64, 0.2, 0.16, GRAVE, { x: x - Math.sin(tilt) * h * 0.66, y: h * 0.62, z, rz: tilt }));
    } else {
      parts.push(speckle(box(0.6, h, 0.2, GRAVE, { x, z, rz: tilt }), 0.05, Math.round(h * 10)));
      parts.push(rodZ(0.3, 0.2, GRAVE, x - Math.sin(tilt) * h, h * Math.cos(tilt), z, 8));
      parts.push(box(0.3, 0.05, 0.03, DARK_GRAVE, { x: x - Math.sin(tilt) * h * 0.7, y: h * 0.7, z: z - 0.1, rz: tilt }));
    }
  };
  stone(-0.5, -0.2, 1.1, 0.1, false);
  stone(0.4, 0.1, 1.5, -0.06, true);
  stone(0.0, 0.6, 0.8, -0.16, false);
  return merge(parts);
};

export const cauldron = () => {
  const parts: Parts = [
    blob(0.9, IRON, { y: 0.8, sy: 0.85 }, 1),
    torus(0.74, 0.1, 0x3c3c48, { y: 1.3 }, 12, 4),
    cyl(0.7, 0.7, 0.06, SLIME, { y: 1.28 }, 12),
    blob(0.18, 0xb8f07a, { x: 0.2, y: 1.42, z: -0.1 }),
    blob(0.12, 0xb8f07a, { x: -0.3, y: 1.4, z: 0.2 }),
    blob(0.1, 0xd8ffa0, { x: -0.1, y: 1.7, z: -0.2 }),
    blob(0.07, 0xd8ffa0, { x: 0.3, y: 1.95, z: 0.1 }),
    taper(0.05, 0.05, 0x8a6240, [0.3, 1.3, 0.3], [0.7, 2.1, 0.5], 4),
  ];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * PI) / 3;
    parts.push(box(0.16, 0.3, 0.16, IRON, { x: Math.cos(a) * 0.5, z: Math.sin(a) * 0.5 }));
    parts.push(spike(0.14, 0.5, PUMPKIN, [Math.cos(a + 1) * 0.6, 0, Math.sin(a + 1) * 0.6], [0, 1, 0], 4));
  }
  return merge(parts);
};

/** A ghost. Painted `color`; pass white to let the game tint it. Also what charges at you. */
export const ghost = (color: number) => () => {
  const parts: Parts = [blob(0.6, color, { y: 1.4 }, 1), cyl(0.6, 0.72, 0.9, color, { y: 0.5 }, 9)];
  for (let i = 0; i < 6; i++) {
    const a = (i * PI) / 3;
    parts.push(spike(0.24, 0.5, color, [Math.cos(a) * 0.5, 0.52, Math.sin(a) * 0.5], [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3], 4));
  }
  parts.push(blob(0.12, IRON, { x: -0.2, y: 1.5, z: -0.5, sy: 1.5 }), blob(0.12, IRON, { x: 0.2, y: 1.5, z: -0.5, sy: 1.5 }), blob(0.14, IRON, { y: 1.14, z: -0.6, sy: 1.6 }));
  parts.push(beam(0.16, color, [-0.5, 1.2, -0.1], [-0.9, 1.5, -0.5]), beam(0.16, color, [0.5, 1.2, -0.1], [0.9, 1.5, -0.5]));
  return merge(parts);
};

export const lamppost = () =>
  merge([
    // A stout crooked post with a big glowing lantern, so it shows up in the dark.
    cyl(0.3, 0.36, 0.2, IRON, {}, 7),
    cyl(0.18, 0.24, 0.16, 0x3c3c48, { y: 0.2 }, 7),
    taper(0.13, 0.1, 0x3c3c48, [0, 0.3, 0], [0.1, 1.62, 0], 6),
    torus(0.15, 0.04, IRON, { x: 0.05, y: 0.9 }, 7, 3),
    beam(0.09, 0x3c3c48, [0.1, 1.62, 0], [0.5, 1.84, 0]),
    box(0.4, 0.06, 0.4, IRON, { x: 0.52, y: 1.26 }),
    frustum(0.3, 0.3, 0.44, 0.44, 0.44, GLOW, { x: 0.52, y: 1.32 }),
    blob(0.16, 0xfff4b8, { x: 0.52, y: 1.52 }),
    cone(0.38, 0.26, IRON, { x: 0.52, y: 1.76, ry: PI / 4 }, 4),
    ...[-0.2, 0.2].flatMap((dx) => [-0.2, 0.2].map((dz) => box(0.04, 0.44, 0.04, IRON, { x: 0.52 + dx, y: 1.32, z: dz }))),
  ]);

export const pumpkinCart = () => {
  const parts: Parts = [
    box(1.0, 0.1, 1.6, 0x6a4a2a, { y: 0.42 }),
    box(0.08, 0.36, 1.6, DEAD, { x: -0.5, y: 0.5 }),
    box(0.08, 0.36, 1.6, DEAD, { x: 0.5, y: 0.5 }),
    box(1.0, 0.36, 0.08, DEAD, { y: 0.5, z: 0.8 }),
    beam(0.06, 0x6a4a2a, [-0.3, 0.46, -0.8], [-0.3, 0.2, -1.5]),
    beam(0.06, 0x6a4a2a, [0.3, 0.46, -0.8], [0.3, 0.2, -1.5]),
  ];
  for (const x of [-0.62, 0.62]) parts.push(rodX(0.42, 0.1, DEAD, x, 0.42, 0.2, 10), rodX(0.1, 0.14, 0xb8a060, x, 0.42, 0.2, 6));
  const pk: [number, number, number, number][] = [
    [-0.2, 0.8, -0.4, 0.34],
    [0.24, 0.78, 0.0, 0.3],
    [-0.18, 0.84, 0.44, 0.36],
    [0.1, 1.2, -0.1, 0.26],
  ];
  for (const [x, y, z, r] of pk) parts.push(blob(r, PUMPKIN, { x, y, z, sy: 0.85 }, 1), cyl(0.04, 0.04, 0.12, 0x4a7a2a, { x, y: y + r * 0.8, z }, 4));
  return merge(parts);
};

export const mausoleum = () =>
  merge([
    box(1.7, 0.16, 1.5, DARK_GRAVE, {}),
    speckle(box(1.4, 1.0, 1.2, GRAVE, { y: 0.16 }), 0.05),
    prism(1.6, 0.5, 1.4, DARK_GRAVE, { y: 1.16, ry: PI / 2 }),
    cyl(0.1, 0.12, 1.0, BONE, { x: -0.54, y: 0.16, z: -0.66 }, 6),
    cyl(0.1, 0.12, 1.0, BONE, { x: 0.54, y: 0.16, z: -0.66 }, 6),
    box(0.44, 0.74, 0.05, IRON, { y: 0.16, z: -0.61 }),
    box(0.3, 0.5, 0.06, SLIME, { y: 0.22, z: -0.62 }),
    box(0.1, 0.4, 0.1, GRAVE, { y: 1.62 }),
    box(0.3, 0.1, 0.1, GRAVE, { y: 1.8 }),
  ]);

/** A horse-less coach. Colours make it a carriage or a ghost coach. */
export const carriage = (body: number, trim: number) => () => {
  const parts: Parts = [
    box(0.9, 0.8, 1.3, body, { y: 0.5 }),
    frustum(0.9, 1.3, 0.7, 1.0, 0.24, trim, { y: 1.3 }),
    box(0.5, 0.3, 0.5, body, { y: 0.6, z: -0.86 }),
    ...windowAt(-0.46, 0.8, 0, 0.05, 0.3),
    ...windowAt(0.46, 0.8, 0, 0.05, 0.3),
    box(0.3, 0.3, 0.05, GLOW, { y: 0.84, z: -0.66 }),
    beam(0.05, IRON, [-0.2, 0.5, -1.1], [-0.2, 0.3, -1.7]),
    beam(0.05, IRON, [0.2, 0.5, -1.1], [0.2, 0.3, -1.7]),
    blob(0.1, GLOW, { x: -0.5, y: 1.2, z: -0.66 }),
    blob(0.1, GLOW, { x: 0.5, y: 1.2, z: -0.66 }),
  ];
  for (const x of [-0.52, 0.52]) for (const z of [-0.5, 0.45]) parts.push(rodX(z < 0 ? 0.34 : 0.44, 0.08, IRON, x, z < 0 ? 0.34 : 0.44, z, 10), rodX(0.08, 0.12, trim, x, z < 0 ? 0.34 : 0.44, z, 6));
  return merge(parts);
};

export const well = () =>
  merge([
    speckle(cyl(0.7, 0.76, 0.7, GRAVE, {}, 9), 0.07),
    cyl(0.56, 0.56, 0.06, IRON, { y: 0.66 }, 9),
    box(0.1, 1.1, 0.1, DEAD, { x: -0.62, y: 0.6 }),
    box(0.1, 1.1, 0.1, DEAD, { x: 0.62, y: 0.6 }),
    prism(1.6, 0.5, 1.0, PURPLE, { y: 1.66 }),
    rodX(0.05, 1.3, DEAD, 0, 1.4, 0, 5),
    cyl(0.02, 0.02, 0.5, BONE, { y: 0.9 }, 4),
    cyl(0.14, 0.12, 0.2, DEAD, { y: 0.74 }, 6),
    blob(0.1, SLIME, { y: 0.74 }),
  ]);

/** A crooked house with lit windows. `wide` adds a wing and a tower (a manor). */
export const hauntedHouse = (wide: boolean, wall: number, roof: number) => () => {
  const parts: Parts = [
    speckle(frustum(1.2, 1.1, 1.3, 1.2, 1.1, wall, {}, 0.06), 0.05),
    prism(1.5, 0.8, 1.4, roof, { x: 0.06, y: 1.1, ry: PI / 2 }),
    box(0.3, 0.52, 0.05, IRON, { z: -0.56 }),
    ...windowAt(-0.38, 0.5, -0.58),
    ...windowAt(0.42, 0.5, -0.6),
    // Lit windows on the sides and back too, and a round one in the gable.
    box(0.05, 0.36, 0.3, GLOW, { x: -0.63, y: 0.5 }),
    box(0.05, 0.36, 0.3, GLOW, { x: 0.7, y: 0.5 }),
    box(0.34, 0.4, 0.05, GLOW, { y: 0.46, z: 0.6 }),
    box(0.32, 0.32, 0.05, GLOW, { x: 0.06, y: 1.26, z: -0.44 }),
    box(0.32, 0.32, 0.05, GLOW, { x: 0.06, y: 1.26, z: 0.44 }),
    box(0.2, 0.6, 0.2, 0x3a3040, { x: 0.42, y: 1.3, z: 0.3, rz: -0.1 }),
  ];
  if (wide) {
    parts.push(speckle(box(0.8, 0.8, 0.9, wall, { x: -0.92, z: 0.05 }), 0.05, 2), prism(1.0, 0.5, 0.9, roof, { x: -0.92, y: 0.8 }), ...windowAt(-0.92, 0.3, -0.42));
    parts.push(speckle(cyl(0.3, 0.32, 1.7, wall, { x: 0.86, z: -0.2 }, 7), 0.05, 3), cone(0.42, 0.7, roof, { x: 0.86, y: 1.7, z: -0.2 }, 7), ...windowAt(0.86, 1.1, -0.5, 0.16, 0.26));
  }
  return merge(parts);
};

export const clockTower = () =>
  merge([
    speckle(frustum(0.84, 0.84, 0.7, 0.7, 1.4, GRAVE, {}), 0.05),
    box(0.84, 0.1, 0.84, DARK_GRAVE, { y: 1.4 }),
    cone(0.6, 0.6, PURPLE, { y: 1.5, ry: PI / 4 }, 4),
    rodZ(0.24, 0.06, BONE, 0, 1.06, -0.38, 10),
    box(0.03, 0.18, 0.03, IRON, { y: 1.06, z: -0.43 }),
    box(0.14, 0.03, 0.03, IRON, { x: 0.06, y: 1.05, z: -0.43 }),
    box(0.2, 0.4, 0.05, IRON, { z: -0.42 }),
    ...windowAt(0, 0.56, -0.4, 0.14, 0.22),
    spike(0.03, 0.3, IRON, [0, 2.08, 0], [0, 1, 0], 4),
  ]);

export const witchTower = () =>
  merge([
    speckle(taper(0.42, 0.34, 0x4a4458, [0, 0, 0], [0.12, 0.9, 0], 8), 0.06),
    speckle(taper(0.34, 0.4, 0x4a4458, [0.12, 0.9, 0], [-0.04, 1.4, 0], 8), 0.06, 2),
    cyl(0.56, 0.5, 0.08, DEAD, { x: -0.04, y: 1.4 }, 8),
    spike(0.5, 0.5, VIOLET, [-0.04, 1.46, 0], [0.1, 1, 0], 8),
    spike(0.2, 0.4, VIOLET, [0.0, 1.86, 0], [0.5, 1, 0], 6),
    ...windowAt(0.06, 0.5, -0.4, 0.14, 0.22),
    ...windowAt(0.0, 1.1, -0.38, 0.16, 0.2),
    box(0.2, 0.36, 0.05, IRON, { z: -0.42 }),
    blob(0.12, SLIME, { x: 0.4, y: 2.2, z: 0 }),
  ]);

export const chapel = () =>
  merge([
    speckle(box(1.2, 0.9, 1.7, GRAVE, {}), 0.05),
    prism(1.8, 0.7, 1.3, NIGHT, { y: 0.9, ry: PI / 2 }),
    speckle(box(0.56, 1.5, 0.56, GRAVE, { z: -0.8 }), 0.05, 2),
    cone(0.44, 0.6, NIGHT, { y: 1.5, z: -0.8, ry: PI / 4 }, 4),
    box(0.04, 0.3, 0.04, BONE, { y: 2.1, z: -0.8 }),
    box(0.2, 0.04, 0.04, BONE, { y: 2.26, z: -0.8 }),
    box(0.26, 0.5, 0.05, IRON, { z: -1.08 }),
    box(0.2, 0.3, 0.05, GLOW, { y: 0.9, z: -1.08 }),
    ...windowAt(-0.6, 0.36, -0.2, 0.05, 0.4),
    ...windowAt(-0.6, 0.36, 0.4, 0.05, 0.4),
    ...windowAt(0.6, 0.36, -0.2, 0.05, 0.4),
    ...windowAt(0.6, 0.36, 0.4, 0.05, 0.4),
  ]);

export const vampireCastle = () => {
  const parts: Parts = [speckle(box(1.3, 1.0, 1.0, 0x4a4458, {}), 0.05), box(0.36, 0.6, 0.05, IRON, { z: -0.5 }), box(0.26, 0.44, 0.06, BLOOD, { y: 0.04, z: -0.51 })];
  for (let i = 0; i < 5; i++) parts.push(box(0.16, 0.16, 1.0, 0x3a3448, { x: -0.56 + i * 0.28, y: 1.0 }));
  const tower = (x: number, z: number, h: number, r: number): void => {
    parts.push(speckle(cyl(r, r * 1.1, h, 0x4a4458, { x, z }, 7), 0.05, Math.round(h * 7)));
    parts.push(cone(r * 1.5, r * 3.2, BLOOD, { x, y: h, z }, 7));
    parts.push(...windowAt(x, h * 0.7, z - r * 1.02, r * 0.5, r * 0.8));
  };
  tower(-0.7, -0.3, 1.5, 0.22);
  tower(0.7, -0.3, 1.3, 0.22);
  tower(0, 0.2, 1.75, 0.3);
  tower(-0.5, 0.45, 1.1, 0.18);
  return merge(parts);
};

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
export const pumpkinWall = () => {
  const parts: Parts = [speckle(box(18.2, 0.3, 0.9, DEAD, {}), 0.06)];
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    const r = 0.74 + (i % 3) * 0.07;
    parts.push(speckle(blob(r, i % 2 ? PUMPKIN : 0xf06a10, { x, y: 0.3 + r * 0.85, sy: 0.9 }, 1), 0.05, i + 1));
    parts.push(cyl(0.08, 0.06, 0.24, 0x4a7a2a, { x, y: 0.3 + r * 1.6 }, 5));
    parts.push(spike(0.16, 0.24, GLOW, [x - 0.26, 0.3 + r * 0.95, -r * 0.8], [0, 1, 0], 3), spike(0.16, 0.24, GLOW, [x + 0.26, 0.3 + r * 0.95, -r * 0.8], [0, 1, 0], 3));
    parts.push(box(0.6, 0.12, 0.06, GLOW, { x, y: 0.3 + r * 0.5, z: -r * 0.86 }));
  }
  return merge(parts);
};

export const graveWall = () => {
  const parts: Parts = [speckle(box(18.2, 0.3, 0.9, 0x4a5a3a, {}), 0.06)];
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    const h = 1.2 + ((i * 5) % 4) * 0.12;
    parts.push(speckle(box(1.3, h, 0.4, i % 2 ? GRAVE : DARK_GRAVE, { x, y: 0.3 }), 0.05, i + 1));
    parts.push(rodZ(0.65, 0.4, i % 2 ? GRAVE : DARK_GRAVE, x, 0.3 + h, 0, 8));
    parts.push(box(0.1, 0.5, 0.04, IRON, { x, y: 0.3 + h * 0.5, z: -0.22 }), box(0.36, 0.1, 0.04, IRON, { x, y: 0.3 + h * 0.74, z: -0.22 }));
  }
  return merge(parts);
};

export const thornWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 37; i++) {
    const x = -9 + i * 0.5;
    const h = 1.5 + ((i * 7) % 5) * 0.12;
    const lean = (i % 2 ? 1 : -1) * 0.4;
    parts.push(taper(0.16, 0.05, i % 3 ? DEAD : 0x3a2c28, [x, 0, (i % 3) * 0.2 - 0.2], [x + lean, h, (i % 2) * 0.3 - 0.15], 4));
    parts.push(spike(0.06, 0.4, 0x6a5a52, [x + lean * 0.5, h * 0.5, 0], [-lean, 0.5, -1], 3));
    if (i % 4 === 0) parts.push(blob(0.12, BLOOD, { x: x + lean * 0.7, y: h * 0.7, z: -0.2 }));
  }
  return merge(parts);
};

export const ironFence = () => {
  const parts: Parts = [box(18.2, 0.24, 0.6, DARK_GRAVE, {}), rodX(0.07, 18.2, IRON, 0, 0.6, 0, 5), rodX(0.07, 18.2, IRON, 0, 1.5, 0, 5)];
  for (let i = 0; i < 37; i++) {
    const x = -9 + i * 0.5;
    const post = i % 6 === 0;
    parts.push(cyl(post ? 0.14 : 0.05, post ? 0.16 : 0.05, post ? 1.9 : 1.6, post ? DARK_GRAVE : IRON, { x, y: 0.24 }, post ? 6 : 4));
    parts.push(post ? blob(0.2, GLOW, { x, y: 2.24 }, 1) : spike(0.08, 0.26, IRON, [x, 1.84, 0], [0, 1, 0], 4));
  }
  return merge(parts);
};

/** A castle wall with battlements and a row of lit arrow slits. */
export const battlement = (stone: number, dark: number, light: number) => () => {
  const parts: Parts = [speckle(box(18.2, 1.6, 0.9, stone, {}), 0.05), box(18.3, 0.12, 1.0, dark, { y: 1.6 })];
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    parts.push(box(0.8, 0.4, 0.94, i % 2 ? stone : dark, { x, y: 1.72 }));
    parts.push(box(0.14, 0.6, 0.05, light, { x, y: 0.7, z: -0.46 }));
  }
  for (const x of [-9, -3, 3, 9]) parts.push(speckle(cyl(0.7, 0.76, 2.0, dark, { x }, 8), 0.05, 7), cone(0.86, 0.5, light, { x, y: 2.0 }, 8));
  return merge(parts);
};
