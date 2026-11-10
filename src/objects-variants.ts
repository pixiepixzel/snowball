/**
 * Rarer versions of each world's most common tall thing: its tree, or whatever stands in
 * for a tree there (a lollipop, a rocket, a balloon...). Now and then one of these turns
 * up in place of the ordinary one. They play exactly the same; they are there to be
 * spotted, and each has its own place in the collection book. How often each rarity
 * appears is in config.ts (RARITIES).
 *
 * VARIANTS maps the id of the ordinary object to its rarer versions. Like every object:
 * 1 unit = the object's size, standing on y = 0, about 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import type { RarityId } from './config';
import { beam, blob, box, cone, cyl, grade, merge, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
type V3 = [number, number, number];
const PI = Math.PI;
const TAU = PI * 2;
const GOLD = 0xf2c230;
const GOLD_DARK = 0xd9920a;
const GOLD_PALE = 0xffe07a;

export interface Variant {
  rarity: RarityId;
  id: string;
  name: string;
  plural: string;
  /** Colour of its chip on the end screen. */
  color: number;
  build: () => BufferGeometry;
}

// ------------------------------------------------------------------ shared pieces

const trunk = (color: number, h = 0.7, r = 0.12): BufferGeometry => cyl(r * 0.8, r, h, color, {}, 6);

/** A conifer: cones stacked up a trunk, one colour per tier. */
const tiers = (colors: number[], y0 = 0.45, r0 = 0.72): Parts =>
  colors.map((c, i) => speckle(cone(r0 - i * (r0 / (colors.length + 1.2)), 0.78 - i * 0.05, c, { y: y0 + i * 0.42 }, 7), 0.08, i + 1));

/** A round-headed tree: a clump of leafy blobs. */
const canopy = (a: number, b: number, y = 1.3, r = 0.6): Parts => [
  speckle(blob(r, a, { y }, 1), 0.07, 1),
  speckle(blob(r * 0.7, b, { x: r * 0.62, y: y - 0.15, z: 0.1 }, 1), 0.07, 2),
  speckle(blob(r * 0.7, a, { x: -r * 0.58, y: y + 0.05, z: -0.15 }, 1), 0.07, 3),
  speckle(blob(r * 0.62, b, { y: y + 0.45, z: 0.05 }, 1), 0.07, 4),
];

/** A five-pointed star standing upright, for the top of anything grand. */
const star = (y: number, color = GOLD, r = 0.2, x = 0): Parts => {
  const parts: Parts = [blob(r * 0.6, color, { x, y, sz: 0.6 })];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    parts.push(spike(r * 0.42, r * 1.1, color, [x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, 0], [Math.cos(a), Math.sin(a), 0], 4));
  }
  return parts;
};

/** Palm fronds: `n` leaves arching out from (cx, y) and drooping at the ends. */
const fronds = (n: number, len: number, y: number, a: number, b: number, cx = 0, droop = 0.4, wide = 0.16): Parts => {
  const parts: Parts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const mid: V3 = [cx + Math.cos(t) * len * 0.5, y + len * 0.28, Math.sin(t) * len * 0.5];
    const tip: V3 = [cx + Math.cos(t) * len, y + len * 0.28 - len * droop, Math.sin(t) * len];
    const color = i % 2 ? a : b;
    parts.push(beam(wide, color, [cx, y, 0], mid, 0.03), beam(wide * 0.8, color, mid, tip, 0.03));
  }
  return parts;
};

/** A leaning palm trunk in ringed segments, ending at (lean, h). */
const palmTrunk = (h: number, lean: number, a: number, b: number, x0 = 0, r = 0.13): Parts => {
  const parts: Parts = [];
  for (let i = 0; i < 4; i++) {
    const t0 = i / 4;
    const t1 = (i + 1) / 4;
    parts.push(taper(r - i * 0.015, r - (i + 1) * 0.015, i % 2 ? a : b, [x0 + lean * t0 * t0, h * t0, 0], [x0 + lean * t1 * t1, h * t1, 0], 6));
  }
  return parts;
};

// ------------------------------------------------------------------ Snowy Mountain (small tree)

const birch = () => {
  const parts: Parts = [cyl(0.09, 0.12, 1.0, 0xeef0f2, {}, 6), ...canopy(0x9ad06a, 0xc8e07a, 1.35, 0.55)];
  for (let i = 0; i < 4; i++) parts.push(box(0.1, 0.035, 0.03, 0x2a2f3a, { x: i % 2 ? 0.04 : -0.04, y: 0.2 + i * 0.2, z: -0.1 }));
  return merge(parts);
};
const maple = () => merge([trunk(0x6b4a2e, 0.85, 0.14), ...canopy(0xe2473c, 0xff8a1a, 1.3, 0.66), blob(0.3, 0xffc23a, { x: 0.2, y: 1.75, z: -0.3 }, 1)]);
const frostTree = () => {
  const parts: Parts = [trunk(0x8fb4d8, 0.5, 0.1)];
  [0xa8dcff, 0xc8ecff, 0xe6f8ff].forEach((c, i) => parts.push(grade(cone(0.66 - i * 0.16, 0.8, 0xffffff, { y: 0.4 + i * 0.42 }, 5), 0x6ab8f0, c)));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    parts.push(spike(0.07, 0.34, 0xe6f8ff, [Math.cos(a) * 0.45, 0.7 + (i % 3) * 0.3, Math.sin(a) * 0.45], [Math.cos(a), 0.5, Math.sin(a)], 4));
  }
  return merge(parts);
};
const goldenTree = () => {
  const parts: Parts = [trunk(GOLD_DARK, 0.5, 0.11), ...tiers([GOLD, GOLD_PALE, GOLD]), ...star(1.98)];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const y = 0.62 + (i % 4) * 0.3;
    const r = 0.56 - (i % 4) * 0.12;
    parts.push(blob(0.07, i % 2 ? 0xe2473c : 0xffffff, { x: Math.cos(a) * r, y, z: Math.sin(a) * r }));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Candy World (lollipop)

/** A lollipop: a stick with a sweet on top, round, heart, star or ball. */
const lolly = (head: Parts, stick = 0xfdfdfd): BufferGeometry => merge([cyl(0.05, 0.05, 1.1, stick, {}, 5), ...head]);
const disc = (a: number, b: number): Parts => [
  cyl(0.62, 0.62, 0.16, a, { y: 1.32, rx: PI / 2 }, 14),
  torus(0.44, 0.07, b, { y: 1.4, z: -0.09, rx: PI / 2 }, 14, 4),
  torus(0.22, 0.07, b, { y: 1.4, z: -0.09, rx: PI / 2 }, 10, 4),
  torus(0.44, 0.07, b, { y: 1.4, z: 0.09, rx: PI / 2 }, 14, 4),
];
const heartPop = () =>
  lolly([
    blob(0.38, 0xff5a9a, { x: -0.27, y: 1.6, sz: 0.55 }, 1),
    blob(0.38, 0xff5a9a, { x: 0.27, y: 1.6, sz: 0.55 }, 1),
    cone(0.6, 0.7, 0xff5a9a, { y: 0.92, sz: 0.34, rx: PI }, 4),
    blob(0.1, 0xffffff, { x: -0.3, y: 1.74, z: -0.2 }),
  ]);
const starPop = () => {
  const head: Parts = [blob(0.36, 0xffd23f, { y: 1.45, sz: 0.5 }, 1)];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    head.push(spike(0.26, 0.56, i % 2 ? 0x5ad0ff : 0xffd23f, [Math.cos(a) * 0.2, 1.45 + Math.sin(a) * 0.2, 0], [Math.cos(a), Math.sin(a), 0], 5));
  }
  return lolly(head);
};
const goldenPop = () => {
  const head: Parts = [blob(0.56, GOLD, { y: 1.45 }, 1), torus(0.57, 0.06, GOLD_PALE, { y: 1.45 }, 14, 4), torus(0.57, 0.06, GOLD_PALE, { y: 1.45, rx: PI / 2 }, 14, 4), ...star(2.12, 0xffffff, 0.14)];
  return lolly(head, GOLD_DARK);
};

// ------------------------------------------------------------------ Lost World (palm tree)

const bananaPalm = () =>
  merge([
    ...palmTrunk(1.45, 0.1, 0x7a8a4a, 0x6a7a3e, 0, 0.15),
    ...fronds(7, 0.95, 1.45, 0x8ad06a, 0xa8e07a, 0.1, 0.3, 0.3),
    blob(0.16, 0xffd23f, { x: 0.18, y: 1.25, z: -0.12, sy: 1.6 }),
    blob(0.14, 0xf2c230, { x: 0.02, y: 1.2, z: -0.18, sy: 1.6 }),
  ]);
const blossomTree = () => {
  const parts: Parts = [...palmTrunk(1.05, 0.12, 0x6b4a2e, 0x7a5636, 0, 0.15), ...canopy(0xff9ac8, 0xffc0dc, 1.4, 0.62)];
  for (let i = 0; i < 6; i++) parts.push(blob(0.07, 0xffffff, { x: Math.cos(i * 2.2) * 0.55, y: 1.3 + (i % 3) * 0.22, z: Math.sin(i * 2.2) * 0.55 }));
  return merge(parts);
};
const amberTree = () => {
  const parts: Parts = [...palmTrunk(0.95, 0.05, 0x5a3d25, 0x6b4a2e, 0, 0.16)];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    parts.push(grade(spike(0.2, 0.85, 0xffffff, [Math.cos(a) * 0.12, 0.95, Math.sin(a) * 0.12], [Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7], 5), 0xc8601a, 0xffd27a));
  }
  parts.push(grade(spike(0.24, 1.05, 0xffffff, [0, 0.95, 0], [0, 1, 0], 5), 0xc8601a, 0xffe0a0));
  return merge(parts);
};
const goldenPalm = () => merge([...palmTrunk(1.65, 0.3, GOLD_DARK, GOLD, 0, 0.14), ...fronds(8, 0.9, 1.65, GOLD, GOLD_PALE, 0.3), blob(0.11, 0xffffff, { x: 0.36, y: 1.56, z: 0.08 }), blob(0.11, 0xffffff, { x: 0.22, y: 1.56, z: -0.1 })]);

// ------------------------------------------------------------------ Ancient Desert (date palm)

const twinPalm = () =>
  merge([...palmTrunk(1.5, 0.45, 0x8a6a3a, 0x9a7a48), ...fronds(7, 0.75, 1.5, 0x4a9a3a, 0x5ab04a, 0.45), ...palmTrunk(1.15, -0.5, 0x8a6a3a, 0x9a7a48, -0.1), ...fronds(6, 0.65, 1.15, 0x4a9a3a, 0x5ab04a, -0.6)]);
const bloomCactus = () =>
  merge([
    cyl(0.2, 0.24, 1.7, 0x3f9a4a, {}, 8),
    blob(0.2, 0x3f9a4a, { y: 1.7 }, 1),
    taper(0.13, 0.13, 0x4aa856, [0.2, 0.8, 0], [0.55, 0.9, 0], 6),
    taper(0.13, 0.11, 0x4aa856, [0.55, 0.9, 0], [0.55, 1.45, 0], 6),
    taper(0.12, 0.12, 0x4aa856, [-0.2, 1.0, 0], [-0.5, 1.1, 0], 6),
    taper(0.12, 0.1, 0x4aa856, [-0.5, 1.1, 0], [-0.5, 1.5, 0], 6),
    blob(0.13, 0xff5a9a, { y: 1.92 }),
    blob(0.1, 0xff5a9a, { x: 0.55, y: 1.52 }),
    blob(0.1, 0xffd23f, { x: -0.5, y: 1.56 }),
  ]);
const oasisPalm = () =>
  merge([
    cyl(0.85, 0.9, 0.06, 0xd8c090, {}, 12),
    cyl(0.68, 0.68, 0.05, 0x2aa6c8, { y: 0.04 }, 12),
    ...palmTrunk(1.6, 0.25, 0x8a6a3a, 0x9a7a48, -0.3),
    ...fronds(8, 0.85, 1.6, 0x3fae5a, 0x6fd06a, -0.05),
    blob(0.1, 0xc8402a, { x: 0.04, y: 1.48, z: 0.1 }),
    blob(0.1, 0xc8402a, { x: -0.14, y: 1.48, z: -0.08 }),
    blob(0.12, 0x3fae5a, { x: 0.45, y: 0.12, z: 0.2 }),
    blob(0.1, 0xff7ab8, { x: 0.45, y: 0.22, z: 0.2 }),
  ]);
const sunPalm = () =>
  merge([...palmTrunk(1.6, 0.2, GOLD_DARK, GOLD), ...fronds(9, 0.85, 1.6, GOLD, GOLD_PALE, 0.2, 0.25), blob(0.24, 0xff8a1a, { x: 0.2, y: 2.05 }, 1), torus(0.3, 0.035, GOLD_PALE, { x: 0.2, y: 2.05, rx: PI / 2 }, 12, 4)]);

// ------------------------------------------------------------------ Under the Sea (seaweed)

const seaFan = () => {
  const parts: Parts = [speckle(blob(0.4, 0xd8c8a8, { y: 0.08, sy: 0.3 }, 1), 0.07), cyl(0.07, 0.09, 0.4, 0xe8a020, {}, 5)];
  for (let i = 0; i < 9; i++) {
    const a = -1.1 + (i / 8) * 2.2;
    const len = 1.5 - Math.abs(a) * 0.35;
    const tip: V3 = [Math.sin(a) * len, 0.35 + Math.cos(a) * len, 0];
    parts.push(beam(0.07, i % 2 ? 0xffc23a : 0xf2a020, [0, 0.35, 0], tip, 0.05));
    if (i < 8) {
      const a2 = -1.1 + ((i + 1) / 8) * 2.2;
      parts.push(beam(0.045, 0xffd86a, [Math.sin(a) * len * 0.6, 0.35 + Math.cos(a) * len * 0.6, 0], [Math.sin(a2) * len * 0.62, 0.35 + Math.cos(a2) * len * 0.62, 0], 0.04));
    }
  }
  return merge(parts);
};
const tubeCoral = () => {
  const parts: Parts = [speckle(blob(0.5, 0xd8c8a8, { y: 0.08, sy: 0.3 }, 1), 0.07)];
  const spots: [number, number, number][] = [
    [0, 0, 1.7],
    [0.3, 0.12, 1.25],
    [-0.28, 0.1, 1.4],
    [0.1, -0.3, 1.0],
    [-0.15, 0.32, 0.8],
    [0.4, -0.2, 0.7],
  ];
  spots.forEach(([x, z, h], i) => {
    parts.push(grade(cyl(0.16, 0.12, h, 0xffffff, { x, z }, 7), 0x7a3ac8, 0xd8a0ff));
    parts.push(cyl(0.11, 0.11, 0.03, i % 2 ? 0xff7ab8 : 0xffd23f, { x, y: h, z }, 7));
  });
  return merge(parts);
};
const glowKelp = () => {
  const parts: Parts = [speckle(blob(0.4, 0x6a7a8a, { y: 0.08, sy: 0.3 }, 1), 0.07)];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.2;
    const h = 1.3 + (i % 3) * 0.3;
    const sway = (i % 2 ? 1 : -1) * 0.18;
    parts.push(beam(0.16, 0x2ad0c0, [x, 0.1, 0], [x + sway, h * 0.5, 0.05], 0.04), beam(0.14, 0x5af0e0, [x + sway, h * 0.5, 0.05], [x - sway * 0.5, h, 0], 0.04));
    parts.push(blob(0.1, 0xd8fff8, { x: x - sway * 0.5, y: h + 0.08 }));
  }
  return merge(parts);
};
const pearlCoral = () => {
  const parts: Parts = [speckle(blob(0.45, 0xf2e6d0, { y: 0.08, sy: 0.3 }, 1), 0.05), taper(0.14, 0.1, 0xfdf6ee, [0, 0.1, 0], [0, 0.8, 0], 6)];
  const tips: V3[] = [
    [0.55, 1.5, 0.1],
    [-0.5, 1.45, -0.1],
    [0.15, 1.9, -0.25],
    [-0.15, 1.8, 0.3],
    [0.45, 1.05, -0.35],
  ];
  for (const tip of tips) {
    parts.push(taper(0.09, 0.05, 0xfdf6ee, [0, 0.8, 0], tip, 5), blob(0.12, 0xffffff, { x: tip[0], y: tip[1] + 0.08, z: tip[2] }, 1));
    parts.push(torus(0.08, 0.025, GOLD, { x: tip[0] * 0.6, y: 0.8 + (tip[1] - 0.8) * 0.6, z: tip[2] * 0.6 }, 8, 4));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ Spooky Hollow (dead tree)

/** A bare tree in the given bark colour; returns its parts and the ends of its branches. */
const bareTree = (bark: number): { parts: Parts; ends: V3[] } => {
  const ends: V3[] = [
    [0.6, 1.5, 0.05],
    [-0.55, 1.65, -0.1],
    [0.2, 1.95, -0.2],
    [-0.25, 1.3, 0.35],
  ];
  const parts: Parts = [taper(0.17, 0.11, bark, [0, 0, 0], [0.05, 0.95, 0], 6)];
  for (const end of ends) parts.push(taper(0.09, 0.03, bark, [0.05, 0.9, 0], end, 5));
  parts.push(taper(0.04, 0.02, bark, [0.36, 1.26, 0.03], [0.75, 1.2, -0.2], 4), taper(0.04, 0.02, bark, [-0.33, 1.35, -0.06], [-0.8, 1.35, 0.15], 4));
  return { parts, ends };
};
const owlTree = () => {
  const { parts } = bareTree(0x4a3a32);
  parts.push(blob(0.2, 0x8a6a4a, { x: 0.52, y: 1.7, sy: 1.2 }, 1), blob(0.07, 0xffd23f, { x: 0.45, y: 1.78, z: -0.16 }), blob(0.07, 0xffd23f, { x: 0.6, y: 1.78, z: -0.16 }));
  parts.push(blob(0.03, 0x12141a, { x: 0.45, y: 1.78, z: -0.22 }), blob(0.03, 0x12141a, { x: 0.6, y: 1.78, z: -0.22 }), cone(0.05, 0.1, 0x6a4a2e, { x: 0.42, y: 1.88 }, 4), cone(0.05, 0.1, 0x6a4a2e, { x: 0.63, y: 1.88 }, 4));
  return merge(parts);
};
const lanternTree = () => {
  const { parts, ends } = bareTree(0x3a2c28);
  ends.forEach((end, i) => {
    parts.push(cyl(0.012, 0.012, 0.3, 0x12141a, { x: end[0], y: end[1] - 0.3, z: end[2] }, 4));
    parts.push(blob(0.13, i % 2 ? 0xff8a1a : 0xffc23a, { x: end[0], y: end[1] - 0.42, z: end[2], sy: 1.2 }, 1));
  });
  return merge(parts);
};
const weepingTree = () => {
  const { parts, ends } = bareTree(0x3a2c3a);
  ends.forEach((end, i) => {
    for (let k = 0; k < 3; k++) {
      const dx = (k - 1) * 0.16;
      parts.push(beam(0.07, (i + k) % 2 ? 0x8a5ad0 : 0xb08af0, [end[0] + dx, end[1], end[2]], [end[0] + dx * 1.6, end[1] - 0.8 - k * 0.12, end[2] + 0.05], 0.03));
    }
  });
  return merge(parts);
};
const ghostFireTree = () => {
  const { parts, ends } = bareTree(0xe8f4ee);
  ends.forEach((end) => {
    parts.push(grade(spike(0.13, 0.45, 0xffffff, [end[0], end[1], end[2]], [0, 1, 0], 5), 0x3fe08a, 0xe8fff0));
  });
  parts.push(grade(spike(0.2, 0.6, 0xffffff, [0.05, 0.2, -0.16], [0, 1, 0], 5), 0x3fe08a, 0xe8fff0), blob(0.05, 0x12141a, { x: 0, y: 0.6, z: -0.16 }), blob(0.05, 0x12141a, { x: 0.12, y: 0.6, z: -0.16 }));
  return merge(parts);
};

// ------------------------------------------------------------------ Toy Room (toy tree)

const toyBase = (color = 0xc08a4a): Parts => [cyl(0.4, 0.45, 0.12, color, {}, 10), cyl(0.09, 0.09, 0.55, 0x8a5a2a, { y: 0.1 }, 6)];
const ballTree = () => merge([...toyBase(), blob(0.7, 0x3fb85a, { y: 1.3 }, 1), blob(0.09, 0xe8402a, { x: 0.4, y: 1.5, z: -0.5 }), blob(0.09, 0xffd23f, { x: -0.35, y: 1.15, z: -0.58 }), blob(0.09, 0x2f7de0, { x: 0.1, y: 0.9, z: -0.6 })]);
const blockTree = () => {
  const parts: Parts = [...toyBase(0x2f7de0)];
  const greens = [0x2f9a4a, 0x3fb85a, 0x58c86a, 0x7ad88a];
  greens.forEach((c, i) => parts.push(box(1.1 - i * 0.26, 0.36, 1.1 - i * 0.26, c, { y: 0.6 + i * 0.36, ry: i * 0.4 })));
  return merge(parts);
};
const stripeTree = () => merge([...toyBase(0xe8402a), ...tiers([0xe8402a, 0xfdfdfd, 0xe8402a, 0xfdfdfd], 0.55, 0.7), blob(0.12, 0xffd23f, { y: 2.2 })]);
const trophyTree = () => {
  const parts: Parts = [...toyBase(GOLD_DARK), ...tiers([GOLD, GOLD_PALE, GOLD], 0.55, 0.7), ...star(2.05)];
  for (let i = 0; i < 6; i++) parts.push(blob(0.07, [0xe8402a, 0x2f7de0, 0x3fb85a][i % 3], { x: Math.cos(i * 2.1) * (0.5 - (i % 3) * 0.1), y: 0.75 + (i % 3) * 0.36, z: Math.sin(i * 2.1) * (0.5 - (i % 3) * 0.1) }));
  return merge(parts);
};

// ------------------------------------------------------------------ Sky Kingdom (balloon)

/** A balloon on a string, with a knot under it. */
const balloonOn = (shape: Parts, knot: number): BufferGeometry => merge([cyl(0.012, 0.012, 0.95, 0xf4f8ff, {}, 4), cone(0.08, 0.1, knot, { y: 0.88, rx: PI }, 5), ...shape]);
const stripedBalloon = () =>
  balloonOn([blob(0.6, 0x3f8ae8, { y: 1.5, sy: 1.15 }, 1), torus(0.6, 0.07, 0xfdfdfd, { y: 1.5 }, 14, 4), torus(0.5, 0.06, 0xfdfdfd, { y: 1.85 }, 12, 4), torus(0.5, 0.06, 0xfdfdfd, { y: 1.15 }, 12, 4)], 0x3f8ae8);
const heartBalloon = () =>
  balloonOn([blob(0.4, 0xff5a9a, { x: -0.28, y: 1.75, sz: 0.6 }, 1), blob(0.4, 0xff5a9a, { x: 0.28, y: 1.75, sz: 0.6 }, 1), cone(0.64, 0.78, 0xff5a9a, { y: 0.98, sz: 0.38, rx: PI }, 4), blob(0.1, 0xffffff, { x: -0.32, y: 1.9, z: -0.22 })], 0xff5a9a);
const starBalloon = () => {
  const shape: Parts = [blob(0.4, 0xffd23f, { y: 1.55, sz: 0.55 }, 1)];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    shape.push(spike(0.3, 0.6, 0xffd23f, [Math.cos(a) * 0.22, 1.55 + Math.sin(a) * 0.22, 0], [Math.cos(a), Math.sin(a), 0], 5));
  }
  shape.push(blob(0.09, 0xffffff, { x: -0.12, y: 1.68, z: -0.2 }));
  return balloonOn(shape, 0xffd23f);
};
const goldenBalloon = () =>
  balloonOn([blob(0.62, GOLD, { y: 1.5, sy: 1.15 }, 1), blob(0.14, 0xffffff, { x: -0.25, y: 1.8, z: -0.42 }), cyl(0.2, 0.26, 0.14, GOLD_PALE, { y: 2.16 }, 8), ...[-0.18, 0, 0.18].map((x) => cone(0.07, 0.16, GOLD_PALE, { x, y: 2.28 }, 4))], GOLD_DARK);

// ------------------------------------------------------------------ Space (rocket)

/** A rocket: body colours bottom to top, a nose, fins, a window. */
const rocketOf = (body: number, band: number, nose: number, fin: number, fins: number, fat = 0.3): Parts => {
  const parts: Parts = [
    cyl(fat, fat, 1.0, body, { y: 0.3 }, 9),
    cyl(fat * 1.02, fat * 1.02, 0.12, band, { y: 0.95 }, 9),
    cone(fat, 0.55, nose, { y: 1.3 }, 9),
    cone(fat * 0.6, 0.26, 0x3a3f4b, { y: 0.08 }, 7),
    blob(fat * 0.4, 0x8fd8ff, { y: 0.9, z: -fat * 0.92, sz: 0.4 }),
  ];
  for (let i = 0; i < fins; i++) {
    const a = (i / fins) * TAU + PI / fins;
    parts.push(box(0.05, 0.5, 0.34, fin, { x: Math.cos(a) * (fat + 0.12), y: 0.12, z: Math.sin(a) * (fat + 0.12), ry: -a + PI / 2 }));
  }
  return parts;
};
const dartRocket = () => merge([...rocketOf(0x3f7de0, 0xfdfdfd, 0xfdfdfd, 0xffc23a, 3, 0.22), spike(0.03, 0.3, 0x9aa3ad, [0, 1.85, 0], [0, 1, 0], 4)]);
const alienRocket = () =>
  merge([
    blob(0.5, 0x54b86a, { y: 0.95, sy: 1.25 }, 1),
    blob(0.3, 0x8fd8ff, { y: 1.5 }, 1),
    torus(0.52, 0.08, 0x2f8a4a, { y: 0.8 }, 12, 4),
    cone(0.3, 0.3, 0x3a3f4b, { y: 0.1 }, 7),
    blob(0.07, 0xffd23f, { x: -0.3, y: 1.0, z: -0.4 }),
    blob(0.07, 0xffd23f, { x: 0.3, y: 1.0, z: -0.4 }),
    cyl(0.015, 0.015, 0.25, 0x2f8a4a, { y: 1.78 }, 4),
    blob(0.06, 0xff5a9a, { y: 2.06 }),
    ...[0, 1, 2].map((i) => beam(0.05, 0x2f8a4a, [Math.cos(i * 2.1) * 0.3, 0.4, Math.sin(i * 2.1) * 0.3], [Math.cos(i * 2.1) * 0.6, 0, Math.sin(i * 2.1) * 0.6])),
  ]);
const chromeRocket = () => {
  const parts: Parts = [...rocketOf(0xc9ced6, 0x6a7383, 0xe8eef8, 0x8a93a3, 4)];
  for (const x of [-0.42, 0.42]) parts.push(cyl(0.12, 0.12, 0.8, 0xe8eef8, { x, y: 0.2 }, 7), cone(0.12, 0.22, 0x5ae0ff, { x, y: 1.0 }, 7), cone(0.08, 0.14, 0x3a3f4b, { x, y: 0.06 }, 6));
  parts.push(torus(0.31, 0.03, 0x5ae0ff, { y: 0.6 }, 12, 4));
  return merge(parts);
};
const goldenRocket = () => merge([...rocketOf(GOLD, 0xffffff, GOLD_PALE, GOLD_DARK, 4), ...star(2.0, 0xffffff, 0.15), torus(0.31, 0.03, 0xffffff, { y: 0.55 }, 12, 4)]);

// ------------------------------------------------------------------ the table

const v = (rarity: RarityId, id: string, name: string, color: number, build: () => BufferGeometry, plural = `${name}s`): Variant => ({ rarity, id, name, plural, color, build });

/** Keyed by the id of the ordinary object each set stands in for. */
export const VARIANTS: Record<string, Variant[]> = {
  smallTree: [
    v('uncommon', 'birch', 'birch tree', 0x9ad06a, birch),
    v('rare', 'maple', 'red maple', 0xe2473c, maple),
    v('superRare', 'frostTree', 'frost tree', 0xa8dcff, frostTree),
    v('mythic', 'goldenTree', 'golden tree', GOLD, goldenTree),
  ],
  lollipop: [
    v('uncommon', 'swirlPop', 'mint swirl lollipop', 0x3fb85a, () => lolly(disc(0x3fb85a, 0xfdfdfd))),
    v('rare', 'heartPop', 'heart lollipop', 0xff5a9a, heartPop),
    v('superRare', 'starPop', 'star lollipop', 0xffd23f, starPop),
    v('mythic', 'goldenPop', 'golden lollipop', GOLD, goldenPop),
  ],
  palm: [
    v('uncommon', 'bananaPalm', 'banana palm', 0x8ad06a, bananaPalm),
    v('rare', 'blossomTree', 'blossom tree', 0xff9ac8, blossomTree),
    v('superRare', 'amberTree', 'amber tree', 0xffb24a, amberTree),
    v('mythic', 'goldenPalm', 'golden palm', GOLD, goldenPalm),
  ],
  datePalm: [
    v('uncommon', 'twinPalm', 'twin palm', 0x4a9a3a, twinPalm),
    v('rare', 'bloomCactus', 'flowering cactus', 0x3f9a4a, bloomCactus, 'flowering cacti'),
    v('superRare', 'oasisPalm', 'oasis palm', 0x2aa6c8, oasisPalm),
    v('mythic', 'sunPalm', 'sun palm', GOLD, sunPalm),
  ],
  seaweed: [
    v('uncommon', 'seaFan', 'sea fan', 0xffc23a, seaFan),
    v('rare', 'tubeCoral', 'tube coral', 0x9a5ad6, tubeCoral),
    v('superRare', 'glowKelp', 'glowing kelp', 0x2ad0c0, glowKelp, 'clumps of glowing kelp'),
    v('mythic', 'pearlCoral', 'pearl coral', 0xfdf6ee, pearlCoral),
  ],
  deadTree: [
    v('uncommon', 'owlTree', 'owl tree', 0x8a6a4a, owlTree),
    v('rare', 'lanternTree', 'lantern tree', 0xff8a1a, lanternTree),
    v('superRare', 'weepingTree', 'weeping tree', 0x8a5ad0, weepingTree),
    v('mythic', 'ghostFireTree', 'ghost-fire tree', 0x3fe08a, ghostFireTree),
  ],
  toyTree: [
    v('uncommon', 'ballTree', 'round toy tree', 0x3fb85a, ballTree),
    v('rare', 'blockTree', 'block tree', 0x2f9a4a, blockTree),
    v('superRare', 'stripeTree', 'candy-stripe tree', 0xe8402a, stripeTree),
    v('mythic', 'trophyTree', 'golden toy tree', GOLD, trophyTree),
  ],
  balloon: [
    v('uncommon', 'stripedBalloon', 'striped balloon', 0x3f8ae8, stripedBalloon),
    v('rare', 'heartBalloon', 'heart balloon', 0xff5a9a, heartBalloon),
    v('superRare', 'starBalloon', 'star balloon', 0xffd23f, starBalloon),
    v('mythic', 'goldenBalloon', 'golden balloon', GOLD, goldenBalloon),
  ],
  rocket: [
    v('uncommon', 'dartRocket', 'dart rocket', 0x3f7de0, dartRocket),
    v('rare', 'alienRocket', 'alien pod', 0x54b86a, alienRocket),
    v('superRare', 'chromeRocket', 'chrome rocket', 0xc9ced6, chromeRocket),
    v('mythic', 'goldenRocket', 'golden rocket', GOLD, goldenRocket),
  ],
};
