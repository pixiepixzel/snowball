/**
 * Walls that used to borrow another wall's shape in different colours (eight of them were
 * the same pile of rocks). Each now has a model of its own.
 *
 * Like every wall: 18 units wide (x from -9 to 9), about 2 tall, standing on y = 0, with
 * +Z the side the player sees.
 */
import type { BufferGeometry } from 'three';
import { bands, blob, box, cone, cyl, frustum, grade, merge, rodX, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

// ------------------------------------------------------------------ Lost World

/** Ash heap: a row of grey cinder cones with embers still glowing in them. */
export const ashHeap = () => {
  const parts: Parts = [box(18.2, 0.22, 1.0, 0x3a3238, {})];
  for (let i = 0; i < 10; i++) {
    const x = -8.1 + i * 1.8;
    const h = 1.3 + ((i * 7) % 4) * 0.2;
    parts.push(speckle(cone(1.15, h, i % 2 ? 0x4a4046 : 0x5e525a, { x, y: 0.2 }, 7), 0.14, i + 1));
    parts.push(blob(0.11, 0xff7a1a, { x: x - 0.3, y: 0.2 + h * 0.45, z: 0.56 }));
    parts.push(blob(0.08, 0xffd23f, { x: x + 0.35, y: 0.2 + h * 0.25, z: 0.8 }));
    if (i % 3 === 0) parts.push(taper(0.07, 0.03, 0x2a2226, [x + 0.15, 0.2 + h * 0.75, 0], [x + 0.5, 0.2 + h + 0.45, 0.1], 4));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Space

/** Crater rim: a long ridge of moon rock, pocked with craters and topped with boulders. */
export const craterRim = () => {
  const parts: Parts = [speckle(frustum(18.4, 1.3, 18, 0.5, 1.5, 0xb8bcc8, {}), 0.1, 3)];
  for (let i = 0; i < 6; i++) {
    const x = -7.5 + i * 3;
    const r = 0.42 + (i % 2) * 0.1;
    parts.push(torus(r, 0.09, 0x9a9eaa, { x, y: 0.75, z: 0.5, rx: PI / 2 - 0.26 }, 10, 4));
    parts.push(cyl(r, r, 0.05, 0x6a6e7a, { x, y: 0.72, z: 0.47, rx: PI / 2 - 0.26 }, 10));
    parts.push(speckle(blob(0.42 + (i % 3) * 0.1, 0x9a9eaa, { x: x + 1.5, y: 1.62, sy: 0.75 }, 1), 0.12, i + 5));
  }
  return merge(parts);
};

/** Canyon wall: a line of flat-topped mesas in layers of red rock. */
export const mesaWall = () => {
  const parts: Parts = [];
  const layers = [0x6e2e16, 0xc8683a, 0xf0c090, 0x8a3c1e, 0xd88a52, 0xf4d0a8];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    const h = 1.3 + ((i * 5) % 4) * 0.22;
    const w = 1.95 + (i % 2) * 0.12;
    parts.push(bands(frustum(w, 0.95, w * 0.8, 0.72, h, 0xffffff, { x }), layers));
    parts.push(box(w * 0.84, 0.1, 0.78, 0xe8b080, { x, y: h }));
  }
  return merge(parts);
};

/** Solar flare: loops of plasma arcing out of a glowing surface. */
export const flareWall = () => {
  const parts: Parts = [grade(box(18.2, 0.5, 1.0, 0xffffff, {}), 0x8a2a10, 0xffc23a)];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    const r = 0.95 + (i % 3) * 0.15;
    parts.push(torus(r, 0.13, i % 2 ? 0xffd23f : 0xff8a1a, { x, y: 0.45, rx: PI / 2 }, 14, 5));
    parts.push(torus(r * 0.58, 0.08, 0xfff4b8, { x, y: 0.45, z: 0.14, rx: PI / 2 }, 10, 4));
    parts.push(spike(0.16, 0.5 + (i % 2) * 0.3, 0xfff4b8, [x + 1, 0.45, 0.1], [0.15, 1, 0], 5));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Candy World

/** Jelly wall: a row of wobbly jellies on a plate, each with a blob of cream. */
export const jellyWall = () => {
  const parts: Parts = [box(18.2, 0.12, 1.0, 0xfff4e0, {})];
  const flavours = [
    [0xc81e4a, 0xff9ab0],
    [0xe8892a, 0xffd29a],
    [0x3aa84a, 0xb8f0a0],
  ];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    const [deep, pale] = flavours[i % 3];
    parts.push(grade(cyl(0.55, 0.96, 1.25, 0xffffff, { x, y: 0.12 }, 10), deep, pale));
    parts.push(grade(blob(0.56, 0xffffff, { x, y: 1.37, sy: 0.6 }, 1), pale, 0xffffff));
    parts.push(blob(0.15, 0xfff4e0, { x, y: 1.76 }, 1));
  }
  return merge(parts);
};

/** Gingerbread wall: one long biscuit with icing along the top, iced windows and gumdrops. */
export const gingerWall = () => {
  const parts: Parts = [speckle(box(18, 1.75, 0.8, 0xb8743a, {}), 0.05, 2)];
  for (let i = 0; i < 18; i++) parts.push(blob(0.52, 0xfdfdfd, { x: -8.5 + i, y: 1.75, sy: 0.45, sz: 0.9 }, 1));
  const drops = [0xd81e3a, 0x3aa84a, 0xffd23f];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    parts.push(box(0.92, 0.92, 0.06, 0xfdfdfd, { x, y: 0.4, z: 0.4 }));
    parts.push(box(0.7, 0.7, 0.08, 0x7a4420, { x, y: 0.51, z: 0.4 }));
    parts.push(box(0.08, 0.7, 0.1, 0xfdfdfd, { x, y: 0.51, z: 0.4 }));
    if (i < 8) {
      parts.push(blob(0.17, drops[i % 3], { x: x + 1, y: 0.5, z: 0.44 }, 1));
      parts.push(blob(0.17, drops[(i + 1) % 3], { x: x + 1, y: 1.15, z: 0.44 }, 1));
    }
  }
  return merge(parts);
};

/** Chocolate wall: a giant bar of chocolate, squares showing above its foil wrapper. */
export const chocWall = () => {
  const parts: Parts = [box(18.1, 2.0, 0.6, 0x4a2a16, {}), box(18.4, 0.5, 0.8, 0xc9ced6, {}), box(18.45, 0.22, 0.84, 0xd81e3a, { y: 0.12 })];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const x = -8 + i * 2;
      parts.push(box(1.8, 0.42, 0.16, 0x6a3e22, { x, y: 0.56 + row * 0.48, z: 0.32 }));
      parts.push(box(1.4, 0.2, 0.06, 0x8a5a36, { x, y: 0.67 + row * 0.48, z: 0.42 }));
    }
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Ancient Desert

/** Tomb wall: smooth sandstone with a painted band, false doors and rows of hieroglyphs. */
export const tombWall = () => {
  const parts: Parts = [
    speckle(box(18, 1.7, 0.8, 0xd2b078, {}), 0.05, 4),
    box(18.3, 0.2, 0.95, 0xa88656, { y: 1.7 }),
    box(18.3, 0.14, 0.9, 0xa88656, {}),
    box(18.05, 0.2, 0.82, 0x2aa6c8, { y: 1.38 }),
    box(18.06, 0.06, 0.83, 0xf2c230, { y: 1.32 }),
  ];
  const inks = [0x8a3a1c, 0x2aa6c8, 0x3a2a1c];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    if (i % 2 === 0) {
      parts.push(box(1.05, 1.1, 0.1, 0xa88656, { x, y: 0.14, z: 0.4 }));
      parts.push(box(0.62, 0.92, 0.12, 0x3a2a1c, { x, y: 0.14, z: 0.41 }));
      parts.push(box(1.2, 0.1, 0.14, 0xf2c230, { x, y: 1.16, z: 0.4 }));
    } else {
      for (let k = 0; k < 8; k++) {
        parts.push(box(0.16, 0.16 + ((k * 3 + i) % 3) * 0.07, 0.04, inks[(k + i) % 3], { x: x - 0.52 + (k % 4) * 0.35, y: 0.3 + Math.floor(k / 4) * 0.48, z: 0.41 }));
      }
    }
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Under the Sea

/** Fishing net: rope mesh strung between posts, floats along the top and a few fish caught in it. */
export const fishNet = () => {
  const parts: Parts = [];
  const rope = 0xd8c8a0;
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3;
    parts.push(cyl(0.12, 0.15, 2.0, 0x7a5232, { x }, 6));
    parts.push(blob(0.2, i % 2 ? 0xe2473c : 0xffffff, { x, y: 2.1 }, 1));
  }
  for (let k = 0; k < 5; k++) parts.push(rodX(0.035, 18, rope, 0, 0.25 + k * 0.38, 0, 4));
  for (let i = 0; i < 25; i++) parts.push(cyl(0.03, 0.03, 1.56, rope, { x: -9 + i * 0.75, y: 0.23 }, 4));
  for (let i = 0; i < 12; i++) parts.push(blob(0.13, i % 2 ? 0xff7a1a : 0xffd23f, { x: -8.25 + i * 1.5, y: 1.8, sx: 1.5 }));
  const fish = [0x5ac8e8, 0xff8a5a, 0xffd23f];
  for (let i = 0; i < 6; i++) {
    const x = -7.6 + i * 3.05;
    const y = 0.62 + (i % 2) * 0.5;
    parts.push(blob(0.2, fish[i % 3], { x, y, z: 0.1, sx: 1.7, sz: 0.5 }, 1));
    parts.push(cone(0.16, 0.24, fish[i % 3], { x: x + 0.42, y: y - 0.12, z: 0.1, rz: PI / 2, sz: 0.4 }, 4));
  }
  return merge(parts);
};

/** Wrecked hull: the side of a sunken ship, planks missing, ribs sticking up, brass portholes. */
export const hullWall = () => {
  const parts: Parts = [box(18.2, 0.25, 0.9, 0x4a3220, {})];
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 7; i++) {
      if ((i * 3 + row * 5) % 7 === 0) continue; // a plank that has rotted away
      const x = -8.4 + i * 2.8 + (row % 2 ? 0.7 : -0.7);
      parts.push(speckle(box(2.75, 0.36, 0.3, row % 2 ? 0x7a5232 : 0x6a4428, { x, y: 0.25 + row * 0.4, z: 0.1 + row * 0.05 }), 0.08, i + row * 7 + 1));
    }
  }
  for (let i = 0; i < 10; i++) {
    const x = -8.1 + i * 1.8;
    parts.push(taper(0.12, 0.07, 0x4a3220, [x, 0.2, -0.3], [x, 2.15, 0.2], 5));
  }
  for (let i = 0; i < 4; i++) {
    const x = -6.3 + i * 4.2;
    parts.push(torus(0.26, 0.06, 0xd8a83a, { x, y: 1.25, z: 0.36, rx: PI / 2 }, 10, 4));
    parts.push(blob(0.18, 0x1a2a40, { x, y: 1.25, z: 0.3, sz: 0.3 }, 1));
    parts.push(blob(0.22, 0x3fae9a, { x: x + 1.6, y: 0.3, z: 0.42, sy: 0.6 }, 1));
  }
  return merge(parts);
};

/** Trench rocks: six-sided columns of dark basalt, with vents glowing on top of some. */
export const basaltWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 16; i++) {
    const x = -8.62 + i * 1.15;
    const h = 1.0 + ((i * 7) % 6) * 0.2;
    parts.push(speckle(cyl(0.62, 0.66, h, i % 2 ? 0x3a5470 : 0x2a3e5e, { x, z: (i % 3) * 0.12 - 0.12 }, 6), 0.1, i + 1));
    if (i % 4 === 1) {
      parts.push(cone(0.3, 0.3, 0x1a2a40, { x, y: h }, 6));
      parts.push(blob(0.12, 0xff8a3a, { x, y: h + 0.3 }));
      parts.push(blob(0.07, 0xb8f0ff, { x: x + 0.1, y: h + 0.6 }));
      parts.push(blob(0.05, 0xb8f0ff, { x: x - 0.08, y: h + 0.82 }));
    }
  }
  return merge(parts);
};

/** Crystal gate: the gate of a sunken city. Crystal pillars with gold capitals and sealed panels between them. */
export const crystalGate = () => {
  const parts: Parts = [box(18.4, 0.28, 1.0, 0x1a6a8a, {})];
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3;
    parts.push(grade(cyl(0.4, 0.5, 1.42, 0xffffff, { x, y: 0.28 }, 8), 0x1a6a8a, 0xb8fff4));
    parts.push(box(1.1, 0.16, 1.0, 0xf2c230, { x, y: 1.7 }));
    parts.push(grade(cone(0.3, 0.46, 0xffffff, { x, y: 1.86, ry: PI / 4 }, 4), 0xb8fff4, 0xffffff));
    if (i < 6) {
      parts.push(grade(box(2.2, 1.3, 0.3, 0xffffff, { x: x + 1.5, y: 0.28 }), 0x1f8aa8, 0x8ae0e8));
      parts.push(torus(0.42, 0.07, 0xf2c230, { x: x + 1.5, y: 0.95, z: 0.19, rx: PI / 2 }, 12, 4));
      parts.push(blob(0.16, 0xffffff, { x: x + 1.5, y: 0.95, z: 0.2 }, 1));
    }
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Spooky Hollow

/** Mossy stones: a ring of standing stones, some with a slab laid across the top. */
export const hengeWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    const h = 1.45 + (i % 3) * 0.12;
    parts.push(speckle(frustum(1.0, 0.72, 0.8, 0.6, h, 0x5a5e66, { x, rz: ((i % 3) - 1) * 0.05 }), 0.1, i + 1));
    parts.push(blob(0.34, 0x4a6a3e, { x: x - 0.12, y: h, sy: 0.4 }, 1));
    parts.push(blob(0.24, 0x5a8a3e, { x: x + 0.2, y: h * 0.45, z: 0.34, sz: 0.4 }, 1));
    if (i % 2 === 0 && i < 8) parts.push(speckle(box(3.0, 0.3, 0.7, 0x4e525a, { x: x + 1, y: 1.6 }), 0.1, i + 30));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Toy Room

/** Crash barrier: red and white blocks with stacks of tyres in front and a chequered strip on top. */
export const tyreWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 9; i++) parts.push(box(1.96, 1.15, 0.5, i % 2 ? 0xf4f4f4 : 0xe8402a, { x: -8 + i * 2, z: -0.2 }));
  for (let i = 0; i < 18; i++) parts.push(box(1.0, 0.26, 0.5, i % 2 ? 0xf4f4f4 : 0x26262e, { x: -8.5 + i, y: 1.15, z: -0.2 }));
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    const stack = 3 + (i % 2);
    for (let k = 0; k < stack; k++) parts.push(torus(0.46, 0.2, k % 2 ? 0x34343e : 0x26262e, { x, y: 0.2 + k * 0.38, z: 0.3 }, 10, 5));
    parts.push(cyl(0.26, 0.26, 0.06, 0xffd23f, { x, y: 0.2 + (stack - 1) * 0.38 + 0.14, z: 0.3 }, 8));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Sky Kingdom

/** Floating rocks: little islands hanging in the air, grass and a tree on top, cloud underneath. */
export const isleWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 7; i++) {
    const x = -8.1 + i * 2.7;
    const lift = 0.35 + (i % 3) * 0.18;
    const r = 1.25 + (i % 2) * 0.12;
    parts.push(speckle(cone(r, 1.1, 0x8a6a4a, { x, y: lift, rx: PI }, 7), 0.12, i + 1));
    parts.push(cyl(r, r, 0.18, 0x5aa84a, { x, y: lift + 1.1 }, 7));
    parts.push(cyl(0.06, 0.07, 0.2, 0x6b4a2e, { x: x - 0.4, y: lift + 1.28 }, 5));
    parts.push(cone(0.26, 0.5, 0x3f8a3a, { x: x - 0.4, y: lift + 1.44 }, 5));
    parts.push(blob(0.3, 0xffffff, { x: x + 0.45, y: lift + 0.05, z: 0.3, sy: 0.7 }, 1));
    parts.push(blob(0.22, 0xffffff, { x: x - 0.5, y: lift, z: 0.2, sy: 0.7 }, 1));
  }
  return merge(parts);
};

/** Aurora: curtains of light, green at the foot and pink or violet at the top, with stars above. */
export const auroraWall = () => {
  const parts: Parts = [box(18.2, 0.1, 0.9, 0xb8ffe0, {})];
  for (let i = 0; i < 24; i++) {
    const x = -8.63 + i * 0.75;
    const h = 1.45 + Math.sin(i * 0.9) * 0.32 + ((i * 5) % 3) * 0.1;
    const ribbon = box(0.72, h, 0.12, 0xffffff, { x, y: 0.1, z: Math.sin(i * 0.7) * 0.25, ry: Math.sin(i * 1.3) * 0.4 });
    parts.push(grade(ribbon, i % 3 === 0 ? 0x2a8a7a : 0x3ac8a0, i % 2 ? 0xff8ad8 : 0xb8a0ff));
    if (i % 4 === 2) parts.push(blob(0.09, 0xffffff, { x, y: h + 0.35 }));
  }
  return merge(parts);
};
