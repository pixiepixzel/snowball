/**
 * Models for Candy World: sweets, cakes and gingerbread.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, prism, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const PINK = 0xff7ab8;
const HOT = 0xe8408a;
const MINT = 0x7fe0c0;
const CREAM = 0xfff4e0;
const ICING = 0xfdfdfd;
const CHOC = 0x6a3e22;
const DARK_CHOC = 0x4a2a16;
const GINGER = 0xb8743a;
const BISCUIT = 0xe0b070;
const CHERRY = 0xd81e3a;
const LEMON = 0xffd84a;
const SWEETS = [CHERRY, LEMON, MINT, 0x6aa8ff, 0xb06aff, 0xff9a3c];

/** A pole of alternating stripes from y0 up, each `step` tall. */
const stripes = (r: number, y0: number, count: number, step: number, a: number, b: number, x = 0, z = 0): Parts => {
  const parts: Parts = [];
  for (let i = 0; i < count; i++) parts.push(cyl(r, r, step, i % 2 ? b : a, { x, y: y0 + i * step, z }, 7));
  return parts;
};

/** Coloured sprinkles scattered over a dome of radius r centred at height cy. */
const sprinkles = (r: number, cy: number, count: number): Parts => {
  const parts: Parts = [];
  for (let i = 0; i < count; i++) {
    const a = i * 2.4;
    const up = 0.25 + ((i * 7) % 6) * 0.11;
    const ring = Math.sqrt(Math.max(0, 1 - up * up));
    parts.push(box(0.12, 0.05, 0.05, SWEETS[i % SWEETS.length], { x: Math.cos(a) * ring * r, y: cy + up * r, z: Math.sin(a) * ring * r, ry: a }));
  }
  return parts;
};

// ------------------------------------------------------------------ small sweets
export const sugarStar = () =>
  merge([box(1.3, 0.22, 1.3, PINK, { y: 0.6 }), box(1.3, 0.22, 1.3, ICING, { y: 0.6, ry: PI / 4 }), blob(0.5, LEMON, { y: 0.72, sy: 0.7 })]);

export const gumdrop = (color: number) => () =>
  merge([speckle(cyl(0.42, 0.85, 1.0, color, {}, 9), 0.06), speckle(blob(0.44, color, { y: 1.0, sy: 0.7 }, 1), 0.06, 2), ...sprinkles(0.6, 0.5, 6).map((g) => grade(g, ICING, ICING))]);

export const macaron = () =>
  merge([
    blob(0.9, PINK, { y: 0.34, sy: 0.36 }, 1),
    cyl(0.84, 0.84, 0.22, CREAM, { y: 0.42 }, 12),
    blob(0.9, HOT, { y: 0.74, sy: 0.38 }, 1),
  ]);

export const candyBar = () =>
  merge([
    box(0.9, 0.22, 2.0, HOT, {}),
    box(0.92, 0.24, 0.5, LEMON, { z: -0.2 }),
    box(0.7, 0.26, 0.24, ICING, { z: -0.2 }),
    frustum(0.9, 0.2, 1.0, 0.02, 0.2, 0xc9ced6, { z: 1.1 }),
    frustum(0.9, 0.2, 1.0, 0.02, 0.2, 0xc9ced6, { z: -1.1 }),
  ]);

/** Candy World's early hazard: a cluster of sharp sugar crystals. */
export const rockCandy = () => {
  const parts: Parts = [cyl(0.06, 0.06, 0.5, BISCUIT, {}, 5)];
  const tones = [0xb06aff, 0xd8a8ff, 0x8a4ae0, 0xe8ccff];
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * PI) / 7;
    const lean = i === 0 ? 0 : 0.5;
    parts.push(grade(spike(0.28, 1.2 + (i % 3) * 0.35, tones[i % 4], [Math.cos(a) * 0.25 * lean, 0.3, Math.sin(a) * 0.25 * lean], [Math.cos(a) * lean, 1, Math.sin(a) * lean], 5), tones[(i + 2) % 4], 0xffffff));
  }
  return merge(parts);
};

/** A gummy bear. Painted `color`; pass white to let the game tint it. */
export const gummyBear = (color: number) => () =>
  merge([
    blob(0.56, color, { y: 0.72, sy: 1.15 }, 1),
    blob(0.46, color, { y: 1.52 }, 1),
    blob(0.17, color, { x: -0.32, y: 1.92 }),
    blob(0.17, color, { x: 0.32, y: 1.92 }),
    blob(0.2, color, { y: 1.42, z: -0.38 }),
    blob(0.06, DARK_CHOC, { x: -0.16, y: 1.62, z: -0.42 }),
    blob(0.06, DARK_CHOC, { x: 0.16, y: 1.62, z: -0.42 }),
    blob(0.2, color, { x: -0.58, y: 0.95, z: -0.12 }),
    blob(0.2, color, { x: 0.58, y: 0.95, z: -0.12 }),
    blob(0.24, color, { x: -0.3, y: 0.2, z: -0.1 }),
    blob(0.24, color, { x: 0.3, y: 0.2, z: -0.1 }),
  ]);

export const cottonCandy = () =>
  merge([
    cyl(0.06, 0.04, 0.9, CREAM, {}, 5),
    speckle(blob(0.7, PINK, { y: 1.2 }, 1), 0.06),
    speckle(blob(0.5, 0xffa8d0, { x: 0.4, y: 1.5, z: 0.2 }, 1), 0.06, 2),
    speckle(blob(0.5, 0xffc0dc, { x: -0.4, y: 1.0, z: -0.25 }, 1), 0.06, 3),
    speckle(blob(0.42, 0xffa8d0, { y: 1.85 }, 1), 0.06, 4),
  ]);

export const cookie = () => {
  const parts: Parts = [speckle(cyl(0.95, 1.0, 0.26, BISCUIT, {}, 12), 0.07)];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.2;
    const r = 0.25 + (i % 3) * 0.24;
    parts.push(blob(0.13, DARK_CHOC, { x: Math.cos(a) * r, y: 0.27, z: Math.sin(a) * r, sy: 0.6 }));
  }
  return merge(parts);
};

export const wafer = () =>
  merge([
    box(0.9, 0.12, 2.0, BISCUIT, {}),
    box(0.86, 0.08, 1.96, PINK, { y: 0.12 }),
    box(0.9, 0.12, 2.0, BISCUIT, { y: 0.2 }),
    box(0.86, 0.08, 1.96, CREAM, { y: 0.32 }),
    box(0.9, 0.12, 2.0, 0xd8a460, { y: 0.4 }),
  ]);

/** A flat round lollipop on a stick, its face towards the player. */
export const lollipop = (a: number, b: number) => () =>
  merge([
    cyl(0.06, 0.06, 1.1, ICING, {}, 5),
    rodZ(0.78, 0.2, a, 0, 1.6, 0, 14),
    rodZ(0.56, 0.24, b, 0, 1.6, 0, 12),
    rodZ(0.34, 0.28, a, 0, 1.6, 0, 10),
    rodZ(0.14, 0.32, b, 0, 1.6, 0, 8),
  ]);

/** A ball lollipop: a striped sphere on a stick. */
export const ballPop = (colors: number[]) => () =>
  merge([cyl(0.07, 0.07, 1.1, ICING, {}, 5), bands(blob(0.72, 0xffffff, { y: 1.5 }, 2), colors), box(0.3, 0.1, 0.02, ICING, { y: 1.06, z: -0.08 })]);

export const gingerbreadMan = () =>
  merge([
    // A plump biscuit body, round enough to read as a figure from any side.
    speckle(blob(0.52, GINGER, { y: 0.98, sy: 1.1, sz: 0.62 }, 1), 0.05),
    speckle(blob(0.42, GINGER, { y: 1.8, sz: 0.7 }, 1), 0.05, 2),
    taper(0.2, 0.17, GINGER, [-0.36, 1.26, 0], [-0.92, 1.04, 0], 7),
    taper(0.2, 0.17, GINGER, [0.36, 1.26, 0], [0.92, 1.04, 0], 7),
    blob(0.19, GINGER, { x: -0.94, y: 1.03 }),
    blob(0.19, GINGER, { x: 0.94, y: 1.03 }),
    taper(0.22, 0.2, GINGER, [-0.22, 0.6, 0], [-0.4, 0.1, 0], 7),
    taper(0.22, 0.2, GINGER, [0.22, 0.6, 0], [0.4, 0.1, 0], 7),
    blob(0.22, GINGER, { x: -0.42, y: 0.14, z: -0.04, sy: 0.7 }),
    blob(0.22, GINGER, { x: 0.42, y: 0.14, z: -0.04, sy: 0.7 }),
    // Icing: eyes, smile, buttons, and cuffs on the wrists and ankles.
    blob(0.07, ICING, { x: -0.15, y: 1.9, z: -0.27 }),
    blob(0.07, ICING, { x: 0.15, y: 1.9, z: -0.27 }),
    box(0.26, 0.05, 0.04, ICING, { y: 1.66, z: -0.29 }),
    blob(0.09, CHERRY, { y: 1.2, z: -0.32 }),
    blob(0.09, MINT, { y: 0.9, z: -0.33 }),
    torus(0.19, 0.04, ICING, { x: -0.76, y: 1.1, rz: PI / 2 - 0.36 }, 8, 3),
    torus(0.19, 0.04, ICING, { x: 0.76, y: 1.1, rz: PI / 2 + 0.36 }, 8, 3),
    torus(0.22, 0.04, ICING, { x: -0.36, y: 0.3 }, 8, 3),
    torus(0.22, 0.04, ICING, { x: 0.36, y: 0.3 }, 8, 3),
  ]);

// ------------------------------------------------------------------ bakes
export const cupcake = () => {
  const parts: Parts = [
    frustum(0.9, 0.9, 1.3, 1.3, 0.8, 0x6aa8ff, {}),
    speckle(blob(0.74, PINK, { y: 1.0, sy: 0.6 }, 1), 0.04),
    speckle(blob(0.54, 0xffa8d0, { y: 1.34, sy: 0.6 }, 1), 0.04, 2),
    blob(0.34, PINK, { y: 1.62, sy: 0.7 }, 1),
    blob(0.16, CHERRY, { y: 1.92 }, 1),
  ];
  for (let i = 0; i < 8; i++) parts.push(box(0.05, 0.8, 0.05, 0x4a88e0, { x: Math.cos((i * PI) / 4) * 0.56, z: Math.sin((i * PI) / 4) * 0.56 }));
  parts.push(...sprinkles(0.7, 1.0, 8));
  return merge(parts);
};

export const doughnut = () => {
  const parts: Parts = [torus(0.62, 0.36, BISCUIT, { y: 0.36 }, 14, 7), torus(0.62, 0.3, PINK, { y: 0.5, sy: 0.75 }, 14, 6)];
  for (let i = 0; i < 12; i++) {
    const a = i * 0.55;
    parts.push(box(0.14, 0.05, 0.05, SWEETS[i % SWEETS.length], { x: Math.cos(a) * 0.62, y: 0.72, z: Math.sin(a) * 0.62, ry: a * 3 }));
  }
  return merge(parts);
};

export const iceCream = () =>
  merge([
    speckle(cone(0.5, 1.15, BISCUIT, { rx: PI }, 8), 0.08),
    torus(0.5, 0.07, 0xd8a460, { y: 1.12 }, 10, 4),
    blob(0.56, PINK, { y: 1.34 }, 1),
    blob(0.46, MINT, { y: 1.9 }, 1),
    blob(0.13, CHERRY, { y: 2.36 }, 1),
    box(0.1, 0.6, 0.24, DARK_CHOC, { x: 0.3, y: 1.9, rz: -0.4 }),
  ]);

/** A candy cane: a striped stick with a hook at the top. `h` is the height of the straight part. */
export const candyCane = (a: number, b: number, h = 1.5) => () => {
  const parts: Parts = stripes(0.13, 0, Math.round(h / 0.19), 0.19, a, b);
  // The hook: short striped pieces round a half circle.
  for (let i = 0; i < 6; i++) {
    const t0 = (i * PI) / 6;
    const t1 = ((i + 1) * PI) / 6;
    parts.push(taper(0.13, 0.13, i % 2 ? a : b, [0.36 - Math.cos(t0) * 0.36, h + Math.sin(t0) * 0.36, 0], [0.36 - Math.cos(t1) * 0.36, h + Math.sin(t1) * 0.36, 0], 7));
  }
  return merge(parts);
};

export const gingerbreadHouse = (roof: number) => () => {
  const parts: Parts = [
    box(1.5, 0.95, 1.3, GINGER, {}),
    prism(1.74, 0.85, 1.6, roof, { y: 0.95, ry: PI / 2 }),
    box(1.54, 0.08, 1.34, ICING, { y: 0.9 }),
    box(0.36, 0.56, 0.05, DARK_CHOC, { z: -0.66 }),
    box(0.3, 0.26, 0.05, LEMON, { x: -0.48, y: 0.42, z: -0.66 }),
    box(0.3, 0.26, 0.05, LEMON, { x: 0.48, y: 0.42, z: -0.66 }),
    box(0.28, 0.5, 0.28, GINGER, { x: 0.4, y: 1.3, z: 0.3 }),
    box(0.34, 0.08, 0.34, ICING, { x: 0.4, y: 1.8, z: 0.3 }),
  ];
  // Sweets along the eaves and round the door.
  for (let i = 0; i < 5; i++) parts.push(blob(0.09, SWEETS[i % SWEETS.length], { x: -0.6 + i * 0.3, y: 0.86, z: -0.68 }));
  parts.push(blob(0.1, CHERRY, { y: 0.66, z: -0.68 }));
  return merge(parts);
};

export const swissRoll = () =>
  merge([
    rodZ(0.6, 1.8, CHOC, 0, 0.6, 0, 12),
    rodZ(0.5, 1.84, CREAM, 0, 0.6, 0, 10),
    rodZ(0.36, 1.88, CHOC, 0, 0.6, 0, 9),
    rodZ(0.2, 1.92, CREAM, 0, 0.6, 0, 8),
    box(0.2, 0.06, 1.7, ICING, { y: 1.18 }),
    blob(0.14, CHERRY, { y: 1.3, z: -0.5 }),
    blob(0.14, CHERRY, { y: 1.3, z: 0.5 }),
  ]);

export const jelly = () =>
  merge([
    cyl(1.0, 1.0, 0.08, ICING, {}, 12),
    grade(cyl(0.55, 0.85, 1.0, 0xffffff, { y: 0.08 }, 10), 0xc81e4a, 0xff6a8a),
    blob(0.55, 0xff8aa4, { y: 1.08, sy: 0.5 }, 1),
    blob(0.18, ICING, { y: 1.36 }, 1),
    blob(0.1, CHERRY, { y: 1.52 }),
  ]);

/** A tiered cake. `tiers` is how many layers (2 for a birthday cake, 3 for a wedding cake). */
export const layerCake = (tiers: number, sponge: number, icing: number, trim: number) => () => {
  const parts: Parts = [cyl(1.05, 1.05, 0.08, ICING, {}, 14)];
  const step = 1.7 / tiers;
  for (let t = 0; t < tiers; t++) {
    const r = 0.95 - t * (0.62 / tiers);
    const y = 0.08 + t * step;
    parts.push(cyl(r, r, step - 0.12, sponge, { y }, 14));
    parts.push(cyl(r + 0.03, r + 0.03, 0.14, icing, { y: y + step - 0.14 }, 14));
    for (let i = 0; i < 8; i++) {
      const a = (i * PI) / 4 + t;
      parts.push(blob(0.09, i % 2 ? trim : icing, { x: Math.cos(a) * r, y: y + step - 0.18, z: Math.sin(a) * r, sy: 1.5 }));
    }
  }
  // Candles on top.
  for (const x of [-0.14, 0.14]) {
    parts.push(cyl(0.04, 0.04, 0.28, trim, { x, y: 1.78 }, 5));
    parts.push(spike(0.05, 0.14, LEMON, [x, 2.06, 0], [0, 1, 0], 5));
  }
  return merge(parts);
};

export const chocBar = () => {
  const parts: Parts = [box(0.9, 0.36, 2.0, CHOC, {})];
  for (let i = 0; i < 4; i++) for (const x of [-0.22, 0.22]) parts.push(frustum(0.4, 0.44, 0.3, 0.34, 0.1, 0x7a4a2a, { x, y: 0.36, z: -0.75 + i * 0.5 }));
  // Half-peeled foil and wrapper at the back.
  parts.push(box(0.96, 0.42, 0.8, 0xc9ced6, { y: -0.01, z: 0.66 }));
  parts.push(box(0.98, 0.44, 0.5, CHERRY, { y: -0.02, z: 0.82 }));
  return merge(parts);
};

export const pancakeStack = () => {
  const parts: Parts = [cyl(1.0, 1.0, 0.08, ICING, {}, 14)];
  for (let i = 0; i < 7; i++) parts.push(speckle(cyl(0.82, 0.86, 0.22, i % 2 ? 0xe0a858 : 0xd09848, { x: Math.sin(i * 2.1) * 0.05, y: 0.08 + i * 0.24, z: Math.cos(i * 1.7) * 0.05 }, 12), 0.05, i + 1));
  parts.push(blob(0.7, 0x9a4e12, { y: 1.78, sy: 0.14 }, 1));
  parts.push(taper(0.14, 0.07, 0x9a4e12, [0.7, 1.74, 0.2], [0.82, 0.8, 0.24], 5));
  parts.push(taper(0.12, 0.06, 0x9a4e12, [-0.6, 1.74, -0.5], [-0.72, 1.1, -0.56], 5));
  parts.push(box(0.36, 0.14, 0.36, LEMON, { y: 1.84, ry: 0.4 }));
  return merge(parts);
};

export const sundae = () =>
  merge([
    cyl(0.5, 0.56, 0.1, 0xc8e4f2, {}, 10),
    cyl(0.12, 0.12, 0.3, 0xc8e4f2, { y: 0.1 }, 7),
    grade(cone(0.62, 0.9, 0xffffff, { y: 0.4, rx: PI }, 10), 0xe8f6ff, 0xa8d8f0),
    blob(0.5, PINK, { x: -0.22, y: 1.42 }, 1),
    blob(0.5, CREAM, { x: 0.24, y: 1.46, z: 0.1 }, 1),
    blob(0.44, CHOC, { y: 1.82, z: -0.12 }, 1),
    speckle(blob(0.34, ICING, { y: 2.2, sy: 0.8 }, 1), 0.03),
    blob(0.13, CHERRY, { y: 2.52 }),
    box(0.26, 0.9, 0.06, BISCUIT, { x: 0.36, y: 1.6, rz: -0.35 }),
  ]);

export const candyCastle = () => {
  const parts: Parts = [box(1.3, 0.9, 1.3, PINK, {}), box(1.36, 0.1, 1.36, ICING, { y: 0.9 }), box(0.34, 0.5, 0.05, CHOC, { z: -0.66 })];
  const tower = (x: number, z: number, h: number, r: number, roof: number): void => {
    parts.push(...stripes(r, 0, Math.round(h / 0.3), 0.3, ICING, 0xffc0dc, x, z));
    parts.push(speckle(cone(r * 1.35, r * 2.6, roof, { x, y: h, z }, 8), 0.05));
    parts.push(blob(r * 0.4, CHERRY, { x, y: h + r * 2.7, z }));
  };
  tower(-0.62, -0.62, 1.2, 0.26, MINT);
  tower(0.62, -0.62, 1.2, 0.26, LEMON);
  tower(-0.62, 0.62, 1.2, 0.26, LEMON);
  tower(0.62, 0.62, 1.2, 0.26, MINT);
  tower(0, 0, 1.5, 0.38, HOT);
  return merge(parts);
};

/** The thing that charges up the slope in Candy World: a giant gobstopper. */
export const gobstopper = () =>
  merge([
    bands(blob(0.95, 0xffffff, { y: 0.95 }, 2), [CHERRY, ICING, 0x3f7de0, ICING, LEMON, ICING, MINT, ICING, CHERRY]),
    rodX(0.08, 2.1, ICING, 0, 0.95, 0, 5),
  ]);

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
export const caneWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 13; i++) parts.push(...stripes(0.34, 0, 9, 0.2, i % 2 ? CHERRY : MINT, ICING, -9 + i * 1.5), blob(0.38, i % 2 ? CHERRY : MINT, { x: -9 + i * 1.5, y: 1.85 }, 1));
  parts.push(rodX(0.14, 18, ICING, 0, 1.1, 0, 6), rodX(0.14, 18, PINK, 0, 0.5, 0, 6));
  return merge(parts);
};

/** A wall of stacked slabs with a contrasting line between rows: wafers, chocolate, gingerbread. */
export const slabWall = (a: number, b: number, line: number, top: number) => () => {
  const parts: Parts = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const x = -8 + i * 2 + (row % 2 ? 0 : 0.5) - 0.25;
      parts.push(speckle(box(1.94, 0.5, 0.8, (i + row) % 2 ? a : b, { x, y: row * 0.58 }), 0.05, i + row * 9 + 1));
    }
    parts.push(box(18.4, 0.08, 0.84, line, { y: row * 0.58 + 0.5 }));
  }
  for (let i = 0; i < 12; i++) parts.push(blob(0.2, i % 2 ? top : line, { x: -8.25 + i * 1.5, y: 1.86, sy: 0.8 }, 1));
  return merge(parts);
};

export const cookieWall = () => {
  const parts: Parts = [box(18, 0.3, 0.8, CHOC, {})];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    parts.push(speckle(rodZ(1.0, 0.36, BISCUIT, x, 1.15, 0, 12), 0.06, i + 1));
    for (let k = 0; k < 5; k++) parts.push(blob(0.13, DARK_CHOC, { x: x + Math.cos(k * 2.3 + i) * 0.55, y: 1.15 + Math.sin(k * 2.3 + i) * 0.55, z: -0.2 }));
  }
  return merge(parts);
};

/** The last wall of Candy World: one enormous cake. */
export const cakeWall = () => {
  const parts: Parts = [box(18, 0.75, 0.9, 0xf2d6a0, {}), box(18.1, 0.16, 0.94, HOT, { y: 0.75 }), box(18, 0.7, 0.9, 0xf2d6a0, { y: 0.91 }), box(18.2, 0.24, 1.0, ICING, { y: 1.61 })];
  for (let i = 0; i < 18; i++) {
    const x = -8.5 + i;
    parts.push(blob(0.2, ICING, { x, y: 1.56, z: -0.48, sy: 1.6 + (i % 3) * 0.5 }));
    if (i % 2 === 0) parts.push(blob(0.2, CHERRY, { x, y: 2.0 }, 1));
    else parts.push(cyl(0.05, 0.05, 0.4, i % 4 === 1 ? MINT : LEMON, { x, y: 1.85 }, 5), spike(0.07, 0.18, 0xff9a3c, [x, 2.25, 0], [0, 1, 0], 5));
  }
  return merge(parts);
};
