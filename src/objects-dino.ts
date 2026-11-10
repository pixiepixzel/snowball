/**
 * Models for the second world, the Lost World: plants, fossils and dinosaurs.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall (long animals are about 2–3 units nose to tail), front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, rodZ, speckle, spike, taper, torus, type V3 } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const BONE = 0xe8dfc8;
const LEAF = 0x3f9a4a;
const LEAF_DARK = 0x2f7f3c;
const LEAF_LIGHT = 0x6fbf5a;
const TRUNK = 0x7a5a3a;
const DARK = 0x22262e;
const EYE = 0xffd23f;

/** A ring of leaves spreading from a point: positive `lift` rises, negative droops. */
function fronds(parts: Parts, n: number, len: number, y: number, color: number, lift: number, x = 0, z = 0): void {
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * PI) / n + y;
    const cx = Math.cos(a);
    const cz = -Math.sin(a);
    parts.push(beam(len * 0.24, color, [x + cx * len * 0.1, y, z + cz * len * 0.1], [x + cx * len, y + lift * len, z + cz * len], 0.04));
  }
}

/** Four legs under a body: front pair at z = -zf, back pair at z = +zb. */
function legs(parts: Parts, color: number, x: number, zf: number, zb: number, h: number, w: number): void {
  for (const sx of [-1, 1]) {
    parts.push(box(w, h, w * 1.1, color, { x: sx * x, z: -zf }));
    parts.push(box(w, h, w * 1.1, color, { x: sx * x, z: zb }));
  }
}

function eyes(parts: Parts, x: number, y: number, z: number, s = 0.06): void {
  parts.push(box(s, s * 1.2, s, EYE, { x: -x, y, z }), box(s, s * 1.2, s, EYE, { x, y, z }));
}

// ------------------------------------------------------------------ small things
export const dragonfly = () =>
  merge([
    rodZ(0.07, 1.7, 0x2aa6c8, 0, 0.9, 0.1, 5),
    blob(0.2, 0x1f7f9a, { y: 0.9, z: -0.8 }),
    box(1.7, 0.03, 0.42, 0xc8f3ff, { y: 0.96, z: -0.35 }),
    box(1.4, 0.03, 0.36, 0xc8f3ff, { y: 0.96, z: 0.1 }),
  ]);

const mushroomShape = (cap: number, spot: number) =>
  merge([
    cyl(0.22, 0.32, 0.9, 0xf3ead8, {}, 7),
    cyl(0.6, 0.76, 0.1, 0xe2d6ba, { y: 0.82 }, 8),
    blob(0.85, cap, { y: 1.0, sy: 0.6 }, 1),
    blob(0.14, spot, { x: 0.35, y: 1.38, z: -0.2 }),
    blob(0.12, spot, { x: -0.3, y: 1.4, z: 0.25 }),
    blob(0.1, spot, { x: -0.5, y: 1.18, z: -0.4 }),
    blob(0.12, spot, { x: 0.1, y: 1.46, z: 0.4 }),
    cyl(0.12, 0.16, 0.45, 0xf3ead8, { x: 0.75, z: 0.3 }, 6),
    blob(0.34, cap, { x: 0.75, y: 0.5, z: 0.3, sy: 0.6 }),
  ]);
export const mushroom = () => mushroomShape(0xd9412e, 0xffffff);
export const giantMushroom = () => mushroomShape(0x8a4fd0, 0xffe08a);

export const dinoEgg = () =>
  merge([
    torus(0.62, 0.17, 0x8a6a3a, { y: 0.17 }, 9, 5),
    blob(0.6, 0xf2ead2, { y: 0.88, sy: 1.3 }, 1),
    blob(0.12, 0x6fae6a, { x: 0.36, y: 1.0, z: -0.42 }),
    blob(0.1, 0x6fae6a, { x: -0.42, y: 0.7, z: -0.3 }),
    blob(0.11, 0x6fae6a, { x: 0.1, y: 1.42, z: 0.36 }),
    blob(0.1, 0x6fae6a, { x: -0.2, y: 1.25, z: -0.5 }),
  ]);

export const fern = () => {
  const parts: Parts = [cyl(0.1, 0.16, 0.5, LEAF_DARK, {}, 5)];
  fronds(parts, 7, 1.1, 0.45, LEAF, 0.45);
  fronds(parts, 5, 0.8, 0.6, LEAF_LIGHT, 1.3);
  return merge(parts);
};

/** The Lost World's early hazard: a knot of thorns. */
export const thornBush = () => {
  const parts: Parts = [speckle(blob(0.7, 0x4a2f4f, { y: 0.62 }, 1), 0.12), blob(0.45, 0x3a2440, { x: 0.5, y: 0.4, z: 0.3 })];
  for (let i = 0; i < 9; i++) {
    const a = (i * 2 * PI) / 9;
    const up = 0.25 + (i % 3) * 0.35;
    parts.push(spike(0.11, 0.75, 0xe0506e, [Math.cos(a) * 0.45, 0.6 + up * 0.3, Math.sin(a) * 0.45], [Math.cos(a), up, Math.sin(a)]));
  }
  parts.push(spike(0.11, 0.7, 0xe0506e, [0, 1.15, 0], [0.1, 1, 0]));
  return merge(parts);
};

export const nest = () =>
  merge([
    torus(0.75, 0.24, 0x8a6a3a, { y: 0.24 }, 10, 5),
    torus(0.6, 0.18, 0x74552c, { y: 0.42 }, 9, 5),
    blob(0.3, 0xf2ead2, { x: -0.22, y: 0.55, z: 0.1, sy: 1.25 }, 1),
    blob(0.3, 0xe6f0d8, { x: 0.25, y: 0.55, z: -0.15, sy: 1.25 }, 1),
    blob(0.28, 0xf2ead2, { x: 0.05, y: 0.62, z: 0.3, sy: 1.25 }, 1),
  ]);

export const bonePile = () =>
  merge([
    beam(0.14, BONE, [-0.8, 0.12, -0.3], [0.8, 0.22, 0.3]),
    beam(0.14, BONE, [-0.6, 0.3, 0.5], [0.7, 0.14, -0.5]),
    blob(0.14, BONE, { x: -0.85, y: 0.14, z: -0.32 }),
    blob(0.14, BONE, { x: 0.85, y: 0.24, z: 0.32 }),
    blob(0.14, BONE, { x: -0.62, y: 0.32, z: 0.52 }),
    blob(0.14, BONE, { x: 0.72, y: 0.16, z: -0.52 }),
    // A small skull on top.
    blob(0.34, BONE, { y: 0.62, z: -0.05, sz: 1.2 }, 1),
    box(0.3, 0.16, 0.3, BONE, { y: 0.38, z: -0.42 }),
    box(0.1, 0.12, 0.05, DARK, { x: -0.13, y: 0.6, z: -0.42 }),
    box(0.1, 0.12, 0.05, DARK, { x: 0.13, y: 0.6, z: -0.42 }),
  ]);

/** Stubby trunk with a crown of leaves. */
export const cycad = () => {
  const parts: Parts = [];
  for (let i = 0; i < 4; i++) parts.push(cyl(0.2 - i * 0.02, 0.24 - i * 0.02, 0.3, i % 2 ? TRUNK : 0x8f6c46, { y: i * 0.28 }, 7));
  fronds(parts, 8, 0.95, 1.15, LEAF, 0.25);
  fronds(parts, 6, 0.7, 1.25, LEAF_LIGHT, 0.9);
  return merge(parts);
};

export const palm = () => {
  const parts: Parts = [];
  // A gently leaning trunk in segments.
  const lean: V3[] = [
    [0, 0, 0],
    [0.06, 0.45, 0],
    [0.16, 0.9, 0],
    [0.3, 1.32, 0],
    [0.46, 1.7, 0],
  ];
  for (let i = 0; i < 4; i++) parts.push(taper(0.15 - i * 0.02, 0.13 - i * 0.02, i % 2 ? TRUNK : 0x8f6c46, lean[i], lean[i + 1], 7));
  fronds(parts, 8, 0.95, 1.72, LEAF, -0.3, 0.46, 0);
  fronds(parts, 6, 0.7, 1.78, LEAF_LIGHT, 0.35, 0.46, 0);
  parts.push(blob(0.1, 0x5a3d25, { x: 0.38, y: 1.62, z: 0.1 }), blob(0.1, 0x5a3d25, { x: 0.54, y: 1.62, z: -0.08 }));
  return merge(parts);
};

/** A giant conifer with a red trunk and no snow. */
export const sequoia = () =>
  merge([
    cyl(0.14, 0.24, 0.9, 0x9a4a2c, {}, 8),
    speckle(cone(0.6, 0.6, 0x2a7448, { y: 0.6 }, 8), 0.1, 1),
    speckle(cone(0.52, 0.55, 0x2f8050, { y: 0.92 }, 8), 0.1, 2),
    speckle(cone(0.42, 0.5, 0x2a7448, { y: 1.22 }, 8), 0.1, 3),
    speckle(cone(0.3, 0.5, 0x38915c, { y: 1.5 }, 8), 0.1, 4),
  ]);

// ------------------------------------------------------------------ fossils and rock
export const ribcage = () => {
  const parts: Parts = [rodZ(0.07, 2.0, BONE, 0, 0.95, 0.1, 6)];
  for (let i = 0; i < 6; i++) {
    const z = -0.55 + i * 0.3;
    const w = 0.55 - Math.abs(i - 2.5) * 0.06;
    for (const s of [-1, 1]) {
      parts.push(beam(0.07, BONE, [0, 0.95, z], [s * w, 0.7, z]));
      parts.push(beam(0.07, BONE, [s * w, 0.7, z], [s * w * 0.75, 0.05, z]));
    }
  }
  // Skull at the front.
  parts.push(blob(0.36, BONE, { y: 0.8, z: -1.0, sz: 1.4 }, 1));
  parts.push(box(0.3, 0.12, 0.6, BONE, { y: 0.4, z: -1.25 }));
  parts.push(box(0.12, 0.14, 0.05, DARK, { x: -0.16, y: 0.84, z: -1.4 }), box(0.12, 0.14, 0.05, DARK, { x: 0.16, y: 0.84, z: -1.4 }));
  for (let i = 0; i < 4; i++) parts.push(spike(0.04, 0.14, BONE, [-0.12 + i * 0.08, 0.52, -1.5], [0, -1, 0], 4));
  return merge(parts);
};

export const boulders = () =>
  merge([
    speckle(blob(0.85, 0x8a7a6a, { y: 0.7, sy: 0.9 }, 1), 0.1, 1),
    speckle(blob(0.6, 0x7a6a5c, { x: 0.8, y: 0.45, z: 0.3 }, 1), 0.1, 2),
    speckle(blob(0.5, 0x94846f, { x: -0.75, y: 0.38, z: -0.35 }, 1), 0.1, 3),
    blob(0.5, LEAF, { y: 1.42, sy: 0.25, sx: 1.1 }),
    blob(0.3, LEAF_LIGHT, { x: 0.8, y: 0.98, z: 0.3, sy: 0.3 }),
  ]);

/** A banded desert pillar with a cap rock balanced on top. */
export const rockSpire = () =>
  merge([
    bands(frustum(1.0, 1.0, 0.7, 0.7, 0.6, 0xffffff, {}), [0x9a5a3a, 0xb8714a]),
    bands(frustum(0.7, 0.7, 0.42, 0.42, 0.75, 0xffffff, { y: 0.6 }), [0xc8845a, 0xa8603c, 0xd89868]),
    bands(frustum(0.42, 0.42, 0.34, 0.34, 0.35, 0xffffff, { y: 1.35 }), [0xb8714a, 0x9a5a3a]),
    speckle(blob(0.42, 0x8a4a30, { y: 1.85, sy: 0.6, sx: 1.2 }, 1), 0.1),
  ]);

/** A cone of dark rock with a glowing crater and lava running down it. */
const volcanoShape = (height: number, side: boolean) => {
  const parts: Parts = [
    grade(frustum(2.0, 2.0, 0.6, 0.6, height, 0xffffff, {}), 0x5a4640, 0x3a2a2c),
    cyl(0.36, 0.42, 0.08, 0xff7a1a, { y: height - 0.02 }, 8),
    cyl(0.22, 0.26, 0.06, 0xffd23f, { y: height + 0.03 }, 8),
    beam(0.16, 0xff6a1a, [0.2, height, -0.3], [0.5, height * 0.45, -0.72], 0.05),
    beam(0.12, 0xff8a2a, [-0.25, height, 0.25], [-0.7, height * 0.3, 0.8], 0.05),
    blob(0.3, 0x6a6470, { x: 0.1, y: height + 0.4 }),
    blob(0.22, 0x8a8490, { x: -0.15, y: height + 0.75 }),
  ];
  if (side) parts.push(grade(frustum(1.2, 1.2, 0.34, 0.34, height * 0.55, 0xffffff, { x: 0.95, z: 0.5 }), 0x5a4640, 0x3a2a2c), cyl(0.2, 0.24, 0.06, 0xff7a1a, { x: 0.95, y: height * 0.55 - 0.02, z: 0.5 }, 7));
  return merge(parts);
};
export const volcano = () => volcanoShape(1.5, false);
export const superVolcano = () => volcanoShape(1.75, true);

// ------------------------------------------------------------------ dinosaurs
/** Two-legged runner: the baby dinosaur, the raptor and the gallimimus share this body. */
const runnerShape = (skin: number, stripe: number, belly: number) => {
  const parts: Parts = [
    blob(0.42, skin, { y: 1.0, sz: 1.6, sy: 0.95 }, 1),
    blob(0.3, belly, { y: 0.86, z: -0.15, sz: 1.5, sy: 0.8 }),
    taper(0.2, 0.13, skin, [0, 1.1, -0.5], [0, 1.6, -0.95], 6),
    box(0.26, 0.24, 0.6, skin, { y: 1.5, z: -1.25 }),
    box(0.2, 0.08, 0.5, belly, { y: 1.42, z: -1.28 }),
    taper(0.26, 0.03, skin, [0, 1.05, 0.5], [0, 1.25, 1.9], 6),
    box(0.5, 0.06, 0.14, stripe, { y: 1.36, z: -0.1 }),
    box(0.46, 0.06, 0.14, stripe, { y: 1.36, z: 0.25 }),
    box(0.34, 0.06, 0.12, stripe, { y: 1.3, z: 0.6 }),
  ];
  eyes(parts, 0.14, 1.64, -1.14);
  for (const s of [-1, 1]) {
    parts.push(beam(0.2, skin, [s * 0.25, 0.95, 0.1], [s * 0.28, 0.5, -0.05]));
    parts.push(beam(0.14, skin, [s * 0.28, 0.5, -0.05], [s * 0.28, 0.08, 0.15]));
    parts.push(box(0.16, 0.08, 0.4, skin, { x: s * 0.28, z: -0.02 }));
    parts.push(beam(0.08, skin, [s * 0.3, 1.0, -0.45], [s * 0.3, 0.75, -0.7]));
  }
  return merge(parts);
};
export const compy = () => runnerShape(0x6cbf5a, 0x3f8f4a, 0xf0e6a8);
export const raptor = () => runnerShape(0x2f9a9a, 0xf08a2a, 0xe8dcb8);
/** Painted white so each one takes its own colour from the tint list. */
export const gallimimus = () => runnerShape(0xffffff, 0x4a3a2a, 0xf3ead8);

export const pterodactyl = () => {
  const skin = 0xc87a4a;
  const parts: Parts = [
    blob(0.36, skin, { y: 0.95, sz: 1.3 }, 1),
    taper(0.14, 0.1, skin, [0, 1.05, -0.3], [0, 1.45, -0.6], 6),
    blob(0.2, skin, { y: 1.5, z: -0.65 }),
    // Long beak and the crest behind the head.
    spike(0.1, 0.9, 0xf2c14e, [0, 1.48, -0.75], [0, -0.15, -1], 4),
    spike(0.08, 0.6, 0xe2473c, [0, 1.58, -0.55], [0, 0.5, 1], 4),
    box(0.14, 0.5, 0.14, skin, { x: -0.15 }),
    box(0.14, 0.5, 0.14, skin, { x: 0.15 }),
  ];
  eyes(parts, 0.15, 1.56, -0.78);
  // Wings spread wide: an arm bone and a skin membrane each side.
  for (const s of [-1, 1]) {
    parts.push(beam(0.07, skin, [s * 0.25, 1.1, -0.1], [s * 1.5, 1.45, -0.2]));
    parts.push(beam(0.9, 0xe8b07a, [s * 0.3, 1.02, 0.15], [s * 1.45, 1.36, 0.1], 0.03));
  }
  return merge(parts);
};

export const stego = () => {
  const skin = 0x5f9a4a;
  const parts: Parts = [
    blob(0.62, skin, { y: 0.95, sz: 1.5 }, 1),
    blob(0.42, 0xcfd89a, { y: 0.72, sz: 1.5, sy: 0.6 }),
    taper(0.3, 0.16, skin, [0, 0.9, -0.75], [0, 0.55, -1.35], 6),
    box(0.24, 0.2, 0.42, skin, { y: 0.4, z: -1.62 }),
    taper(0.34, 0.06, skin, [0, 0.9, 0.75], [0, 0.6, 1.95], 6),
  ];
  eyes(parts, 0.13, 0.52, -1.7, 0.05);
  legs(parts, 0x4a7f3c, 0.42, 0.5, 0.5, 0.6, 0.26);
  // The row of plates down the back.
  const sizes = [0.3, 0.44, 0.52, 0.52, 0.42, 0.3];
  sizes.forEach((s, i) => parts.push(box(0.07, s, s, 0xf08a2a, { y: 1.42 + (i > 0 && i < 5 ? 0.08 : 0), z: -0.72 + i * 0.3, rx: PI / 4 })));
  for (const s of [-1, 1]) {
    parts.push(spike(0.06, 0.42, BONE, [s * 0.08, 0.68, 1.6], [s, 0.7, 0.1], 4));
    parts.push(spike(0.06, 0.38, BONE, [s * 0.06, 0.64, 1.82], [s, 0.6, 0.3], 4));
  }
  return merge(parts);
};

/** Triceratops. `skin` lets the charging one that plays the snowplough be redder. */
const trikeShape = (skin: number) => {
  const parts: Parts = [
    blob(0.66, skin, { y: 0.92, z: 0.15, sz: 1.4 }, 1),
    blob(0.44, 0xe0cfa8, { y: 0.7, z: 0.15, sz: 1.4, sy: 0.6 }),
    taper(0.36, 0.08, skin, [0, 0.85, 0.9], [0, 0.55, 1.85], 6),
    // Big head, bony frill, beak and three horns.
    box(0.56, 0.5, 0.75, skin, { y: 0.55, z: -1.2 }),
    cyl(0.7, 0.7, 0.1, 0xb86a3a, { y: 0.85, z: -0.8, rx: PI / 2 - 0.35 }, 9),
    cyl(0.5, 0.5, 0.12, 0xe8a05a, { y: 0.9, z: -0.84, rx: PI / 2 - 0.35 }, 9),
    spike(0.16, 0.34, 0xf2c14e, [0, 0.62, -1.55], [0, -0.5, -1], 4),
    spike(0.07, 0.8, BONE, [-0.2, 1.0, -1.25], [-0.1, 0.5, -1]),
    spike(0.07, 0.8, BONE, [0.2, 1.0, -1.25], [0.1, 0.5, -1]),
    spike(0.07, 0.34, BONE, [0, 0.98, -1.55], [0, 0.8, -0.6]),
  ];
  eyes(parts, 0.29, 0.86, -1.35);
  legs(parts, skin, 0.44, 0.45, 0.7, 0.55, 0.3);
  return merge(parts);
};
export const trike = () => trikeShape(0xb5764a);
export const chargingTrike = () => trikeShape(0xc8502f);

export const ankylo = () => {
  const skin = 0x8a7a4a;
  const parts: Parts = [
    blob(0.7, skin, { y: 0.62, sz: 1.35, sy: 0.6 }, 1),
    blob(0.5, 0x6f6238, { y: 0.9, sz: 1.3, sy: 0.4 }, 1),
    box(0.4, 0.3, 0.5, skin, { y: 0.35, z: -1.15 }),
    taper(0.22, 0.1, skin, [0, 0.55, 0.9], [0, 0.4, 1.7], 6),
    blob(0.26, 0x5a4f2c, { y: 0.4, z: 1.85 }, 1),
  ];
  eyes(parts, 0.21, 0.52, -1.3, 0.05);
  legs(parts, 0x6f6238, 0.5, 0.5, 0.5, 0.36, 0.26);
  // Rows of armour studs.
  for (let i = 0; i < 5; i++) {
    for (const x of [-0.42, 0, 0.42]) parts.push(spike(0.1, 0.22, BONE, [x, 0.95 - Math.abs(x) * 0.25, -0.6 + i * 0.3], [x * 0.6, 1, 0], 4));
  }
  return merge(parts);
};

/** T. rex. Painted through `skin` so the allosaurus can reuse the body in another colour. */
const rexShape = (skin: number, stripe: number) => {
  const belly = 0xe8d8b0;
  const parts: Parts = [
    blob(0.56, skin, { y: 1.18, z: 0.1, sz: 1.5, sy: 1.0 }, 1),
    blob(0.4, belly, { y: 0.98, z: -0.1, sz: 1.4, sy: 0.8 }),
    taper(0.34, 0.26, skin, [0, 1.3, -0.55], [0, 1.72, -0.95], 7),
    // Head: skull, snout, lower jaw and teeth.
    box(0.5, 0.42, 0.6, skin, { y: 1.58, z: -1.3 }),
    box(0.42, 0.3, 0.5, skin, { y: 1.6, z: -1.72 }),
    box(0.38, 0.12, 0.72, belly, { y: 1.4, z: -1.52, rx: -0.14 }),
    box(0.44, 0.08, 0.14, stripe, { y: 2.0, z: -1.2 }),
    taper(0.4, 0.04, skin, [0, 1.15, 0.7], [0, 1.0, 2.3], 7),
    box(0.6, 0.07, 0.18, stripe, { y: 1.66, z: -0.1 }),
    box(0.6, 0.07, 0.18, stripe, { y: 1.68, z: 0.3 }),
    box(0.46, 0.07, 0.16, stripe, { y: 1.56, z: 0.72 }),
  ];
  eyes(parts, 0.26, 1.82, -1.42, 0.08);
  for (let i = 0; i < 5; i++) {
    for (const s of [-1, 1]) parts.push(spike(0.035, 0.12, 0xffffff, [s * 0.17, 1.6, -1.94 + i * 0.1], [0, -1, 0], 4));
  }
  for (const s of [-1, 1]) {
    parts.push(beam(0.34, skin, [s * 0.34, 1.1, 0.25], [s * 0.38, 0.55, 0.0]));
    parts.push(beam(0.2, skin, [s * 0.38, 0.55, 0.0], [s * 0.38, 0.1, 0.25]));
    parts.push(box(0.26, 0.1, 0.55, skin, { x: s * 0.38, z: 0.02 }));
    parts.push(beam(0.09, skin, [s * 0.36, 1.2, -0.5], [s * 0.36, 0.98, -0.72]));
  }
  return merge(parts);
};
export const trex = () => rexShape(0xa8502f, 0x6a2c1a);
export const allosaurus = () => rexShape(0x4f8a6a, 0x2c5a44);

export const brachio = () => {
  const skin = 0x6f8fa8;
  const parts: Parts = [
    blob(0.6, skin, { y: 0.95, z: 0.2, sz: 1.4, sy: 0.95 }, 1),
    blob(0.42, 0xc8d8e0, { y: 0.74, z: 0.2, sz: 1.4, sy: 0.6 }),
    // The long neck, in two sections, and a small head.
    taper(0.3, 0.2, skin, [0, 1.0, -0.4], [0, 1.5, -0.8], 7),
    taper(0.2, 0.13, skin, [0, 1.5, -0.8], [0, 2.15, -1.0], 7),
    box(0.22, 0.18, 0.4, skin, { y: 2.08, z: -1.22 }),
    taper(0.3, 0.05, skin, [0, 0.9, 0.95], [0, 0.4, 2.1], 7),
    box(0.3, 0.04, 0.12, 0x4f6f88, { y: 1.34, z: 0.0 }),
    box(0.3, 0.04, 0.12, 0x4f6f88, { y: 1.34, z: 0.3 }),
    box(0.3, 0.04, 0.12, 0x4f6f88, { y: 1.3, z: 0.6 }),
  ];
  eyes(parts, 0.12, 2.2, -1.25, 0.05);
  legs(parts, 0x5f7f98, 0.36, 0.3, 0.75, 0.7, 0.26);
  return merge(parts);
};

// ------------------------------------------------------------------ walls
// 18 units wide, about 2 tall, +Z towards the player — same rules as the walls in objects.ts.

export const bambooWall = () => {
  const parts: Parts = [box(18.2, 0.12, 0.2, 0x8a6a3a, { y: 0.5, z: 0.12 }), box(18.2, 0.12, 0.2, 0x8a6a3a, { y: 1.4, z: 0.12 })];
  for (let i = 0; i < 30; i++) {
    const x = -8.7 + i * 0.6;
    const h = 1.7 + (i % 4) * 0.12;
    parts.push(cyl(0.2, 0.22, h, i % 2 ? 0x9ac85a : 0x7fb048, { x }, 6));
    parts.push(cyl(0.23, 0.23, 0.06, 0x5f8f34, { x, y: 0.7 }, 6), cyl(0.23, 0.23, 0.06, 0x5f8f34, { x, y: 1.25 }, 6));
    parts.push(spike(0.2, 0.22, i % 2 ? 0x9ac85a : 0x7fb048, [x, h, 0], [0, 1, 0], 6));
  }
  return merge(parts);
};

export const vineWall = () => {
  const parts: Parts = [box(18.2, 0.2, 0.3, 0x5a3d25, { y: 0.4 }), box(18.2, 0.2, 0.3, 0x5a3d25, { y: 1.5 })];
  for (let i = 0; i < 13; i++) {
    const x = -9 + i * 1.5;
    parts.push(cyl(0.2, 0.26, 2.0, 0x6b4a2e, { x }, 6));
    // Hanging vines and leaves between the posts.
    if (i < 12) {
      parts.push(beam(0.1, LEAF_DARK, [x + 0.2, 1.9, 0.15], [x + 1.3, 0.25, 0.15]));
      parts.push(beam(0.1, LEAF, [x + 1.3, 1.9, 0.2], [x + 0.2, 0.25, 0.2]));
      parts.push(blob(0.34, LEAF_LIGHT, { x: x + 0.75, y: 1.1, z: 0.25, sy: 0.6 }), blob(0.26, 0xe0506e, { x: x + 0.75, y: 1.75, z: 0.2 }));
    }
  }
  return merge(parts);
};

export const boneWall = () => {
  const parts: Parts = [rodZ(0.01, 0.01, BONE, 0, 0, 0, 3)];
  // A fence of great curved ribs with a skull in the middle.
  for (let i = 0; i < 19; i++) {
    const x = -9 + i;
    const h = 1.5 + (i % 3) * 0.2;
    parts.push(taper(0.16, 0.1, BONE, [x, 0, 0.1], [x + 0.12, h * 0.6, -0.1], 5));
    parts.push(taper(0.1, 0.03, BONE, [x + 0.12, h * 0.6, -0.1], [x - 0.1, h, 0.25], 5));
  }
  parts.push(taper(0.12, 0.12, BONE, [-9.2, 0.55, 0.2], [9.2, 0.55, 0.2], 6), taper(0.1, 0.1, BONE, [-9.2, 1.1, 0.05], [9.2, 1.1, 0.05], 6));
  parts.push(blob(0.75, BONE, { y: 1.35, z: 0.5, sz: 1.1 }, 1), box(0.6, 0.3, 0.5, BONE, { y: 0.75, z: 0.85 }));
  parts.push(box(0.26, 0.3, 0.06, DARK, { x: -0.3, y: 1.35, z: 1.2 }), box(0.26, 0.3, 0.06, DARK, { x: 0.3, y: 1.35, z: 1.2 }));
  return merge(parts);
};

/** Dark rock with glowing cracks and flames along the top. Recoloured for Space's plasma wall. */
export const moltenWall = (rock: number, glow: number, flame: number) => () => {
  const parts: Parts = [];
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    const h = 1.35 + ((i * 5) % 4) * 0.14;
    parts.push(speckle(box(1.5, h, 0.9, rock, { x }), 0.12, i + 1));
    parts.push(beam(0.1, glow, [x - 0.4, 0.15, 0.46], [x + 0.1, h * 0.7, 0.46], 0.03));
    parts.push(beam(0.08, glow, [x + 0.1, h * 0.7, 0.46], [x + 0.45, h * 0.35, 0.46], 0.03));
    parts.push(spike(0.3, 0.6 + (i % 3) * 0.15, flame, [x - 0.3, h, 0], [0, 1, 0], 5));
    parts.push(spike(0.22, 0.45, glow, [x + 0.35, h, 0.1], [0.1, 1, 0], 5));
  }
  parts.push(box(18.2, 0.12, 1.0, glow, {}));
  return merge(parts);
};
