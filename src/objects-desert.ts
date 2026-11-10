/**
 * Models for the Ancient Desert: sand, palms, tombs and pyramids.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, prism, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const SAND = 0xe2c388;
const STONE = 0xd2b078;
const DARK_STONE = 0xa88656;
const MUD = 0xc49a62;
const GOLD = 0xf2c230;
const LAPIS = 0x2a5ac8;
const TEAL = 0x2aa6a0;
const RED = 0xc8402a;
const LINEN = 0xf2ead8;
const WOOD = 0x8a5a32;
const LEAF = 0x4a9a3a;
const FUR = 0xc89a5a;

// ------------------------------------------------------------------ small things
export const scarab = () =>
  merge([
    blob(0.7, LAPIS, { y: 0.6, sy: 0.5, sz: 1.25 }, 1),
    blob(0.36, GOLD, { y: 0.6, z: -0.8, sy: 0.6 }, 1),
    box(0.04, 0.3, 1.2, GOLD, { y: 0.56, z: 0.1 }),
    box(1.5, 0.04, 0.5, TEAL, { y: 0.72, z: 0.1, rz: 0.2, x: 0.5 }),
    box(1.5, 0.04, 0.5, TEAL, { y: 0.72, z: 0.1, rz: -0.2, x: -0.5 }),
    blob(0.22, GOLD, { y: 0.9, z: -1.05 }, 1),
  ]);

export const coins = () => {
  const parts: Parts = [];
  for (let i = 0; i < 5; i++) parts.push(cyl(0.6, 0.6, 0.16, i % 2 ? 0xe0a820 : GOLD, { x: Math.sin(i * 2) * 0.08, y: i * 0.17, z: Math.cos(i * 3) * 0.08 }, 10));
  parts.push(cyl(0.6, 0.6, 0.16, GOLD, { x: 0.75, y: 0.3, z: 0.2, rz: 1.2 }, 10));
  return merge(parts);
};

export const clayPot = () =>
  merge([
    bands(blob(0.8, 0xffffff, { y: 0.8, sy: 1.0 }, 1), [0xb86a3a, 0xc87a44, LAPIS, 0xc87a44, 0xb86a3a]),
    cyl(0.4, 0.3, 0.4, 0xc87a44, { y: 1.5 }, 9),
    torus(0.42, 0.07, 0xb86a3a, { y: 1.9 }, 10, 4),
    torus(0.2, 0.05, 0xb86a3a, { x: 0.7, y: 1.4, rz: PI / 2 }, 8, 4),
    torus(0.2, 0.05, 0xb86a3a, { x: -0.7, y: 1.4, rz: PI / 2 }, 8, 4),
  ]);

export const rug = () => {
  const parts: Parts = [box(1.0, 0.08, 2.0, RED, {}), box(0.8, 0.09, 1.7, 0xe0a820, {}), box(0.56, 0.1, 1.4, LAPIS, {}), box(0.3, 0.11, 0.3, GOLD, { ry: PI / 4 })];
  for (let i = 0; i < 6; i++) for (const z of [-1.06, 1.06]) parts.push(box(0.08, 0.05, 0.14, LINEN, { x: -0.42 + i * 0.17, z }));
  return merge(parts);
};

/** The desert's early hazard. */
export const cactus = () => {
  const parts: Parts = [
    speckle(cyl(0.3, 0.34, 1.9, 0x4a9a52, {}, 8), 0.07),
    blob(0.3, 0x4a9a52, { y: 1.9 }, 1),
    taper(0.2, 0.2, 0x4a9a52, [0.3, 0.8, 0], [0.75, 0.9, 0], 7),
    taper(0.2, 0.18, 0x4a9a52, [0.75, 0.9, 0], [0.75, 1.6, 0], 7),
    taper(0.18, 0.18, 0x3f8a48, [-0.3, 1.1, 0], [-0.68, 1.2, 0], 7),
    taper(0.18, 0.16, 0x3f8a48, [-0.68, 1.2, 0], [-0.68, 1.75, 0], 7),
    blob(0.12, 0xff7ab8, { y: 2.2 }),
    blob(0.1, 0xff7ab8, { x: 0.75, y: 1.7 }),
  ];
  for (let i = 0; i < 8; i++) parts.push(spike(0.03, 0.2, LINEN, [Math.cos(i * 2.4) * 0.3, 0.3 + i * 0.2, Math.sin(i * 2.4) * 0.3], [Math.cos(i * 2.4), 0.2, Math.sin(i * 2.4)], 4));
  return merge(parts);
};

export const fennec = () =>
  merge([
    blob(0.46, FUR, { y: 0.6, sz: 1.4 }, 1),
    blob(0.36, FUR, { y: 1.05, z: -0.5 }, 1),
    spike(0.12, 0.3, LINEN, [0, 0.98, -0.78], [0, -0.2, -1], 5),
    blob(0.05, 0x22262e, { y: 0.94, z: -1.06 }),
    spike(0.2, 0.7, FUR, [-0.22, 1.25, -0.45], [-0.3, 1, 0.1], 4),
    spike(0.2, 0.7, FUR, [0.22, 1.25, -0.45], [0.3, 1, 0.1], 4),
    blob(0.05, 0x22262e, { x: -0.16, y: 1.14, z: -0.8 }),
    blob(0.05, 0x22262e, { x: 0.16, y: 1.14, z: -0.8 }),
    taper(0.16, 0.22, FUR, [0, 0.6, 0.55], [0.1, 0.9, 1.2], 6),
    blob(0.2, LINEN, { x: 0.12, y: 0.96, z: 1.3 }),
    box(0.14, 0.4, 0.14, 0xb08848, { x: -0.22, z: -0.36 }),
    box(0.14, 0.4, 0.14, 0xb08848, { x: 0.22, z: -0.36 }),
    box(0.14, 0.4, 0.14, 0xb08848, { x: -0.22, z: 0.36 }),
    box(0.14, 0.4, 0.14, 0xb08848, { x: 0.22, z: 0.36 }),
  ]);

export const tumbleweed = () => {
  const parts: Parts = [speckle(blob(0.8, 0xa8864a, { y: 0.8 }, 1), 0.18)];
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4;
    const up = Math.sin(i * 1.9) * 0.8;
    const ring = Math.sqrt(1 - up * up);
    parts.push(spike(0.04, 0.5, 0x8a6a34, [Math.cos(a) * ring * 0.7, 0.8 + up * 0.7, Math.sin(a) * ring * 0.7], [Math.cos(a) * ring, up, Math.sin(a) * ring], 4));
  }
  return merge(parts);
};

export const sarcophagus = () =>
  merge([
    frustum(0.9, 2.0, 0.8, 1.9, 0.4, GOLD, {}),
    frustum(0.8, 1.9, 0.5, 1.6, 0.2, 0xe0a820, { y: 0.4 }),
    blob(0.3, GOLD, { y: 0.62, z: -0.62, sy: 0.6 }, 1),
    box(0.62, 0.1, 0.5, LAPIS, { y: 0.52, z: -0.62 }),
    box(0.5, 0.05, 0.12, LAPIS, { y: 0.6, z: -0.1 }),
    box(0.5, 0.05, 0.12, TEAL, { y: 0.6, z: 0.2 }),
    box(0.5, 0.05, 0.12, RED, { y: 0.6, z: 0.5 }),
  ]);

export const scroll = () =>
  merge([
    box(0.8, 0.05, 1.5, LINEN, { y: 0.1 }),
    rodX(0.14, 1.0, 0xe8dcc0, 0, 0.16, -0.8, 7),
    rodX(0.14, 1.0, 0xe8dcc0, 0, 0.16, 0.8, 7),
    blob(0.1, WOOD, { x: -0.54, y: 0.16, z: -0.8 }),
    blob(0.1, WOOD, { x: 0.54, y: 0.16, z: -0.8 }),
    box(0.5, 0.06, 0.06, 0x3a2a20, { y: 0.1, z: -0.3 }),
    box(0.4, 0.06, 0.06, 0x3a2a20, { y: 0.1, z: 0 }),
    box(0.5, 0.06, 0.06, RED, { y: 0.1, z: 0.3 }),
  ]);

/** A date palm with a leaning trunk. `lean` tips it sideways. */
export const datePalm = (lean: number) => () => {
  const parts: Parts = [];
  let x = 0;
  for (let i = 0; i < 7; i++) {
    parts.push(speckle(cyl(0.13, 0.16, 0.24, i % 2 ? 0x8a6a42 : 0x9a7a4e, { x, y: i * 0.22 }, 6), 0.08, i + 1));
    x += lean * 0.05 * i * 0.3;
  }
  const top = 1.56;
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * PI) / 7;
    parts.push(spike(0.2, 0.95, i % 2 ? LEAF : 0x3f8a32, [x, top, 0], [Math.cos(a), 0.25, Math.sin(a)], 3));
    parts.push(spike(0.14, 0.5, 0x5aaa44, [x + Math.cos(a) * 0.85, top + 0.2, Math.sin(a) * 0.85], [Math.cos(a), -0.9, Math.sin(a)], 3));
  }
  parts.push(blob(0.13, 0xb8621e, { x: x + 0.14, y: top - 0.12 }), blob(0.13, 0xb8621e, { x: x - 0.12, y: top - 0.14, z: 0.1 }));
  return merge(parts);
};

export const mummy = () => {
  const parts: Parts = [
    blob(0.5, LINEN, { y: 0.95, sy: 1.3 }, 1),
    blob(0.38, LINEN, { y: 1.82 }, 1),
    beam(0.2, LINEN, [-0.42, 1.35, 0], [-0.5, 1.3, -0.8]),
    beam(0.2, LINEN, [0.42, 1.35, 0], [0.5, 1.3, -0.8]),
    box(0.26, 0.5, 0.3, 0xe0d6c0, { x: -0.2 }),
    box(0.26, 0.5, 0.3, 0xe0d6c0, { x: 0.2 }),
    box(0.4, 0.1, 0.05, 0x22262e, { y: 1.84, z: -0.36 }),
    blob(0.05, 0xfff06a, { x: -0.1, y: 1.89, z: -0.38 }),
    blob(0.05, 0xfff06a, { x: 0.1, y: 1.89, z: -0.38 }),
  ];
  for (let i = 0; i < 6; i++) parts.push(torus(0.48 - Math.abs(i - 2.5) * 0.04, 0.03, 0xcfc4a8, { y: 0.5 + i * 0.2, rz: (i % 2 ? 1 : -1) * 0.14 }, 9, 3));
  parts.push(beam(0.1, 0xe0d6c0, [0.3, 0.7, 0.3], [0.5, 0.1, 0.6], 0.03));
  return merge(parts);
};

export const tent = () =>
  merge([
    prism(1.9, 1.35, 1.8, LINEN, {}),
    prism(1.94, 0.5, 1.84, RED, { y: 0.95, sy: 0.9 }),
    box(0.5, 0.9, 0.05, 0x3a2a20, { z: -0.9, x: 0 }),
    cyl(0.04, 0.04, 1.7, WOOD, {}, 5),
    spike(0.1, 0.3, GOLD, [0, 1.7, 0], [0, 1, 0], 4),
    beam(0.03, WOOD, [-1.0, 1.3, 0], [-1.5, 0, 0]),
    beam(0.03, WOOD, [1.0, 1.3, 0], [1.5, 0, 0]),
  ]);

/** A reed boat with a sail. Colours make it a fishing boat or a royal barge. */
export const reedBoat = (hull: number, sail: number, trim: number) => () =>
  merge([
    frustum(0.5, 1.5, 0.8, 2.0, 0.4, hull, {}),
    taper(0.2, 0.08, hull, [0, 0.3, -0.9], [0, 0.95, -1.3], 6),
    taper(0.2, 0.08, hull, [0, 0.3, 0.9], [0, 0.95, 1.3], 6),
    box(0.84, 0.06, 2.0, trim, { y: 0.38 }),
    cyl(0.04, 0.05, 1.5, WOOD, { y: 0.4 }, 5),
    box(1.2, 0.9, 0.04, sail, { y: 0.9 }),
    box(1.24, 0.05, 0.06, WOOD, { y: 1.8 }),
    box(1.2, 0.14, 0.05, trim, { y: 1.3 }),
    box(0.5, 0.36, 0.6, trim, { y: 0.4, z: 0.55 }),
  ]);

/** A camel. Front faces -Z. */
export const camel = () =>
  merge([
    blob(0.5, FUR, { y: 1.1, sz: 1.5 }, 1),
    blob(0.3, 0xb88a4c, { y: 1.62, z: -0.1 }, 1),
    taper(0.22, 0.14, FUR, [0, 1.2, -0.65], [0, 1.9, -1.0], 6),
    blob(0.2, FUR, { y: 1.98, z: -1.12, sz: 1.5 }, 1),
    blob(0.04, 0x22262e, { x: -0.13, y: 2.04, z: -1.16 }),
    blob(0.04, 0x22262e, { x: 0.13, y: 2.04, z: -1.16 }),
    beam(0.14, 0xb08848, [-0.26, 0.9, -0.5], [-0.26, 0, -0.5]),
    beam(0.14, 0xb08848, [0.26, 0.9, -0.5], [0.26, 0, -0.5]),
    beam(0.14, 0xb08848, [-0.26, 0.9, 0.5], [-0.26, 0, 0.5]),
    beam(0.14, 0xb08848, [0.26, 0.9, 0.5], [0.26, 0, 0.5]),
    box(0.9, 0.3, 0.7, RED, { y: 1.24, z: 0 }),
    box(0.94, 0.08, 0.74, GOLD, { y: 1.24 }),
    taper(0.05, 0.03, FUR, [0, 1.2, 0.72], [0, 0.6, 0.86], 4),
  ]);

/** A robed desert runner. The robe is white so the game can tint it. */
export const nomad = () =>
  merge([
    frustum(0.5, 0.5, 0.9, 0.7, 1.1, 0xffffff, { rx: PI, y: 1.3 }),
    blob(0.3, 0xd8a070, { y: 1.62 }, 1),
    blob(0.34, 0xffffff, { y: 1.72, z: 0.06, sy: 0.9 }, 1),
    box(0.44, 0.1, 0.08, 0xffffff, { y: 1.5, z: -0.22 }),
    beam(0.14, 0xffffff, [-0.36, 1.2, 0], [-0.6, 0.8, -0.3]),
    beam(0.14, 0xffffff, [0.36, 1.2, 0], [0.6, 0.8, -0.3]),
    box(0.18, 0.24, 0.3, WOOD, { x: -0.16, z: -0.05 }),
    box(0.18, 0.24, 0.3, WOOD, { x: 0.16, z: -0.05 }),
    box(0.36, 0.06, 1.8, 0xe8dcc0, { y: -0.02 }),
  ]);

export const torch = () =>
  merge([
    cyl(0.07, 0.09, 1.5, WOOD, {}, 6),
    cyl(0.22, 0.1, 0.3, 0x8a6a34, { y: 1.5 }, 7),
    torus(0.22, 0.04, GOLD, { y: 1.8 }, 8, 3),
    spike(0.2, 0.6, 0xff7a1a, [0, 1.78, 0], [0.1, 1, 0], 5),
    spike(0.12, 0.42, 0xffd84a, [0, 1.8, 0], [-0.1, 1, 0.1], 5),
    box(0.4, 0.1, 0.4, STONE, {}),
  ]);

/** A two-wheeled chariot and its horse. Also the thing that charges up the slope at you. */
export const chariot = () =>
  merge([
    // Horse.
    blob(0.36, 0x7a4a2a, { y: 0.95, z: -0.6, sz: 1.5 }, 1),
    taper(0.18, 0.13, 0x7a4a2a, [0, 1.1, -1.0], [0, 1.6, -1.3], 6),
    blob(0.17, 0x7a4a2a, { y: 1.64, z: -1.44, sz: 1.5 }, 1),
    spike(0.07, 0.36, 0x3a2a20, [0, 1.6, -1.2], [0, 0.6, 1], 4),
    beam(0.1, 0x5a3a20, [-0.2, 0.8, -1.0], [-0.24, 0, -1.15]),
    beam(0.1, 0x5a3a20, [0.2, 0.8, -1.0], [0.24, 0, -0.9]),
    beam(0.1, 0x5a3a20, [-0.2, 0.8, -0.2], [-0.24, 0, -0.1]),
    beam(0.1, 0x5a3a20, [0.2, 0.8, -0.2], [0.24, 0, -0.35]),
    box(0.5, 0.08, 0.3, RED, { y: 1.24, z: -0.6 }),
    // Pole and car.
    beam(0.05, WOOD, [0, 0.7, -0.2], [0, 0.5, 0.5]),
    box(0.9, 0.08, 0.7, WOOD, { y: 0.46, z: 0.85 }),
    frustum(0.9, 0.06, 0.9, 0.06, 0.7, GOLD, { y: 0.5, z: 0.52 }),
    box(0.06, 0.6, 0.7, GOLD, { x: -0.45, y: 0.5, z: 0.85 }),
    box(0.06, 0.6, 0.7, GOLD, { x: 0.45, y: 0.5, z: 0.85 }),
    box(0.94, 0.08, 0.1, LAPIS, { y: 1.16, z: 0.52 }),
    rodX(0.46, 0.08, WOOD, -0.56, 0.46, 0.9, 10),
    rodX(0.46, 0.08, WOOD, 0.56, 0.46, 0.9, 10),
    rodX(0.1, 0.12, GOLD, -0.58, 0.46, 0.9, 6),
    rodX(0.1, 0.12, GOLD, 0.58, 0.46, 0.9, 6),
  ]);

/** A tall four-sided needle with a gold tip. */
export const obelisk = (stone: number, mark: number) => () => {
  const parts: Parts = [box(0.7, 0.2, 0.7, DARK_STONE, {}), frustum(0.5, 0.5, 0.3, 0.3, 1.5, stone, { y: 0.2 }), cone(0.22, 0.3, GOLD, { y: 1.7, ry: PI / 4 }, 4)];
  for (let i = 0; i < 5; i++) parts.push(box(0.16, 0.1, 0.03, mark, { y: 0.45 + i * 0.24, z: -0.25 + i * 0.018 }));
  return merge(parts);
};

export const mudHouse = () =>
  merge([
    speckle(box(1.6, 1.1, 1.4, MUD, {}), 0.04),
    box(1.7, 0.14, 1.5, 0xb08a54, { y: 1.1 }),
    speckle(box(0.9, 0.7, 0.9, MUD, { x: -0.3, y: 1.24, z: 0.2 }), 0.04, 2),
    box(1.0, 0.1, 1.0, 0xb08a54, { x: -0.3, y: 1.94, z: 0.2 }),
    box(0.36, 0.64, 0.05, 0x5a3a20, { x: 0.3, z: -0.71 }),
    box(0.24, 0.24, 0.05, 0x3a2a20, { x: -0.4, y: 0.5, z: -0.71 }),
    box(0.2, 0.2, 0.05, 0x3a2a20, { x: -0.3, y: 1.5, z: -0.26 }),
    box(0.7, 0.04, 0.5, RED, { x: 0.3, y: 0.76, z: -0.95, rx: 0.3 }),
    rodX(0.04, 0.5, WOOD, 0.9, 1.0, 0.3, 4),
    rodX(0.04, 0.5, WOOD, 0.9, 1.0, -0.3, 4),
  ]);

export const ruin = () => {
  const parts: Parts = [box(1.9, 0.2, 1.3, DARK_STONE, {})];
  const column = (x: number, z: number, h: number): void => {
    parts.push(speckle(cyl(0.22, 0.25, h, STONE, { x, y: 0.2, z }, 8), 0.06, Math.round(h * 10)));
    parts.push(box(0.56, 0.1, 0.56, DARK_STONE, { x, y: 0.2, z }));
  };
  column(-0.65, -0.4, 1.6);
  column(0, -0.4, 1.0);
  column(0.65, -0.4, 1.6);
  column(-0.65, 0.4, 0.6);
  column(0.65, 0.4, 1.3);
  parts.push(box(1.9, 0.26, 0.5, STONE, { y: 1.8, z: -0.4, rz: 0.0 }));
  parts.push(rodX(0.22, 0.9, STONE, 0.1, 0.42, 0.5, 8));
  return merge(parts);
};

export const temple = () => {
  const parts: Parts = [box(2.0, 0.2, 1.7, DARK_STONE, {}), box(1.8, 0.14, 1.5, STONE, { y: 0.2 }), box(1.3, 1.1, 1.0, SAND, { y: 0.34, z: 0.15 }), box(0.4, 0.8, 0.05, 0x3a2a20, { y: 0.34, z: -0.36 })];
  for (let i = 0; i < 4; i++) {
    const x = -0.72 + i * 0.48;
    parts.push(cyl(0.12, 0.14, 1.1, LINEN, { x, y: 0.34, z: -0.6 }, 7));
    parts.push(cone(0.2, 0.18, i % 2 ? LAPIS : RED, { x, y: 1.3, z: -0.6, rx: PI }, 7));
  }
  parts.push(box(1.9, 0.26, 1.6, STONE, { y: 1.46 }), box(1.94, 0.1, 1.64, GOLD, { y: 1.72 }), box(1.7, 0.12, 0.05, LAPIS, { y: 1.52, z: -0.81 }));
  return merge(parts);
};

export const sphinx = () =>
  merge([
    box(1.0, 0.16, 2.0, DARK_STONE, {}),
    speckle(box(0.8, 0.6, 1.5, STONE, { y: 0.16, z: 0.2 }), 0.04),
    speckle(blob(0.44, STONE, { y: 0.8, z: 0.7, sy: 0.8 }, 1), 0.04, 2),
    box(0.24, 0.24, 0.8, STONE, { x: -0.28, y: 0.16, z: -0.85 }),
    box(0.24, 0.24, 0.8, STONE, { x: 0.28, y: 0.16, z: -0.85 }),
    box(0.6, 0.8, 0.5, STONE, { y: 0.76, z: -0.4 }),
    // Head-dress and face.
    frustum(0.9, 0.5, 0.6, 0.4, 0.75, GOLD, { y: 1.2, z: -0.34 }),
    blob(0.32, 0xd8b078, { y: 1.62, z: -0.5, sy: 1.1 }, 1),
    box(0.92, 0.1, 0.52, LAPIS, { y: 1.3, z: -0.34 }),
    box(0.8, 0.1, 0.5, LAPIS, { y: 1.56, z: -0.34 }),
    box(0.12, 0.3, 0.1, LAPIS, { y: 1.1, z: -0.72 }),
    blob(0.04, 0x22262e, { x: -0.12, y: 1.7, z: -0.78 }),
    blob(0.04, 0x22262e, { x: 0.12, y: 1.7, z: -0.78 }),
  ]);

export const watchtower = () =>
  merge([
    speckle(frustum(1.0, 1.0, 0.76, 0.76, 1.5, MUD, {}), 0.04),
    box(0.96, 0.12, 0.96, 0xb08a54, { y: 1.5 }),
    box(0.16, 0.3, 0.16, MUD, { x: -0.38, y: 1.62, z: -0.38 }),
    box(0.16, 0.3, 0.16, MUD, { x: 0.38, y: 1.62, z: -0.38 }),
    box(0.16, 0.3, 0.16, MUD, { x: -0.38, y: 1.62, z: 0.38 }),
    box(0.16, 0.3, 0.16, MUD, { x: 0.38, y: 1.62, z: 0.38 }),
    box(0.9, 0.06, 0.9, RED, { y: 1.92 }),
    box(0.26, 0.5, 0.05, 0x3a2a20, { z: -0.5 }),
    box(0.16, 0.24, 0.05, 0x3a2a20, { y: 0.9, z: -0.42 }),
    cyl(0.03, 0.03, 0.5, WOOD, { y: 1.98 }, 4),
    box(0.3, 0.18, 0.02, GOLD, { x: 0.16, y: 2.28 }),
  ]);

/** A pyramid. `steps` > 0 makes it a stepped one. */
export const pyramid = (steps: number, stone: number, cap: number) => () => {
  const parts: Parts = [];
  if (steps > 0) {
    for (let i = 0; i < steps; i++) {
      const w = 2.0 - (i * 1.6) / steps;
      parts.push(speckle(box(w, 1.7 / steps, w, i % 2 ? stone : DARK_STONE, { y: (i * 1.7) / steps }), 0.04, i + 1));
    }
    parts.push(box(0.36, 0.3, 0.36, cap, { y: 1.7 }));
    parts.push(frustum(0.3, 1.2, 0.3, 0.2, 1.7, LINEN, { z: -0.52 }, 0, 0.5));
  } else {
    parts.push(speckle(cone(1.42, 1.75, stone, { ry: PI / 4 }, 4), 0.05));
    parts.push(cone(0.36, 0.45, cap, { y: 1.34, ry: PI / 4 }, 4));
    parts.push(box(0.26, 0.3, 0.06, 0x3a2a20, { y: 0.02, z: -0.94 }));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
export const stakeWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 19; i++) {
    const h = 1.5 + (i % 3) * 0.2;
    parts.push(cyl(0.14, 0.18, h, i % 2 ? WOOD : 0x9a6a3a, { x: -9 + i }, 6), cone(0.16, 0.34, 0x6a4424, { x: -9 + i, y: h }, 6));
  }
  parts.push(rodX(0.07, 18.4, LINEN, 0, 0.6, -0.16, 5), rodX(0.07, 18.4, LINEN, 0, 1.2, -0.16, 5));
  return merge(parts);
};

export const columnWall = () => {
  const parts: Parts = [box(18.2, 0.2, 1.0, DARK_STONE, {}), box(18.2, 0.3, 1.0, STONE, { y: 1.7 }), box(18.3, 0.1, 1.04, GOLD, { y: 2.0 })];
  for (let i = 0; i < 10; i++) {
    const x = -8.55 + i * 1.9;
    parts.push(speckle(cyl(0.34, 0.4, 1.4, LINEN, { x, y: 0.2 }, 8), 0.05, i + 1));
    parts.push(cone(0.5, 0.26, i % 2 ? LAPIS : RED, { x, y: 1.46, rx: PI }, 8));
    if (i < 9) parts.push(box(1.1, 1.3, 0.3, SAND, { x: x + 0.95, y: 0.2, z: 0.25 }));
  }
  return merge(parts);
};

export const obeliskWall = () => {
  const parts: Parts = [box(18.2, 0.36, 0.9, DARK_STONE, {})];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    parts.push(speckle(frustum(1.3, 0.8, 0.8, 0.5, 1.3, i % 2 ? STONE : SAND, { x, y: 0.36 }), 0.05, i + 1));
    parts.push(cone(0.5, 0.4, GOLD, { x, y: 1.66, ry: PI / 4 }, 4));
    parts.push(box(0.3, 0.6, 0.04, LAPIS, { x, y: 0.7, z: -0.36 }));
    if (i < 8) parts.push(box(0.8, 0.8, 0.6, DARK_STONE, { x: x + 1, y: 0.36 }));
  }
  return merge(parts);
};

/** The last wall of the desert: a row of pyramids shoulder to shoulder. */
export const pyramidWall = () => {
  const parts: Parts = [box(18.2, 0.3, 1.0, DARK_STONE, {})];
  for (let i = 0; i < 6; i++) {
    const x = -7.5 + i * 3;
    parts.push(speckle(cone(2.05, 1.75, i % 2 ? SAND : STONE, { x, y: 0.2, ry: PI / 4, sz: 0.36 }, 4), 0.05, i + 1));
    parts.push(cone(0.44, 0.4, GOLD, { x, y: 1.6, ry: PI / 4, sz: 0.36 }, 4));
  }
  return merge(parts);
};

/** Sandbags... of the ancient kind: a tumble of sandstone blocks. */
export const blockWall = (a: number, b: number, trim: number) => () => {
  const parts: Parts = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 10; i++) {
      const w = 1.7 + ((i * 3 + row) % 3) * 0.1;
      const x = -8.1 + i * 1.8 + (row % 2 ? 0.45 : -0.45);
      parts.push(speckle(box(w, 0.6, 0.86, (i + row) % 2 ? a : b, { x, y: row * 0.62 }), 0.06, i + row * 10 + 1));
    }
  }
  parts.push(box(18.4, 0.12, 0.9, trim, { y: 1.86 }));
  return merge(parts);
};
