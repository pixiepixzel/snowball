/**
 * Models for the third world, Space: gear, ships, rocks and whole planets.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const HULL = 0xe8ecf2;
const STEEL = 0x8a93a3;
const DARK = 0x22262e;
const GOLD = 0xe2b23c;
const PANEL = 0x2f5fc8;
const GLOW = 0x7fe8ff;
const RED = 0xe2473c;
const ROCK = 0x8a8478;

/** A solar panel wing: a blue slab with a frame, centred on (x, y, z). */
const panel = (x: number, y: number, z: number, w: number, d: number): Parts => [
  box(w, 0.04, d, PANEL, { x, y, z }),
  box(w + 0.06, 0.02, d + 0.06, STEEL, { x, y: y + 0.01, z }),
  box(0.03, 0.05, d, 0x9fc0ff, { x, y, z }),
];

/** Dark dents pressed into a rock or moon of radius r centred at height cy. */
function craters(parts: Parts, r: number, cy: number, color: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const a = i * 2.4;
    const up = Math.sin(i * 1.7) * 0.7;
    const ring = Math.sqrt(1 - up * up);
    const s = r * (0.14 + ((i * 3) % 4) * 0.05);
    const dir: [number, number, number] = [Math.cos(a) * ring, up, Math.sin(a) * ring];
    // A flattened lump just proud of the surface, facing outwards.
    parts.push(spike(s, s * 0.25, color, [dir[0] * r * 0.97, cy + dir[1] * r * 0.97, dir[2] * r * 0.97], dir, 7));
  }
}

// ------------------------------------------------------------------ small things
export const starBit = () =>
  merge([
    box(1.3, 0.2, 1.3, 0xffd23f, { y: 0.6 }),
    box(1.3, 0.2, 1.3, 0xffe680, { y: 0.6, ry: PI / 4 }),
    blob(0.5, 0xfff4b8, { y: 0.7, sy: 0.7 }),
  ]);

export const moonRock = () => {
  const parts: Parts = [speckle(blob(0.85, ROCK, { y: 0.6, sy: 0.75 }, 1), 0.12), speckle(blob(0.45, 0x74706a, { x: 0.7, y: 0.3, z: 0.3 }), 0.12, 2)];
  craters(parts, 0.62, 0.62, 0x5a564f, 4);
  return merge(parts);
};

export const helmet = () =>
  merge([
    cyl(0.6, 0.66, 0.24, STEEL, {}, 10),
    blob(0.85, HULL, { y: 0.98 }, 1),
    blob(0.62, GOLD, { y: 0.98, z: -0.36, sx: 1.05, sy: 0.85 }, 1),
    box(0.2, 0.3, 0.3, STEEL, { x: -0.86, y: 0.8 }),
    box(0.2, 0.3, 0.3, STEEL, { x: 0.86, y: 0.8 }),
    cyl(0.03, 0.03, 0.4, STEEL, { x: 0.5, y: 1.7 }, 4),
    blob(0.08, RED, { x: 0.5, y: 2.14 }),
  ]);

export const flag = () =>
  merge([
    blob(0.5, 0x9a9eaa, { y: 0.1, sy: 0.3, sx: 1.2 }, 1),
    cyl(0.04, 0.05, 2.0, STEEL, {}, 5),
    box(0.95, 0.2, 0.03, RED, { x: 0.5, y: 1.78 }),
    box(0.95, 0.2, 0.03, 0xffffff, { x: 0.5, y: 1.58 }),
    box(0.95, 0.2, 0.03, RED, { x: 0.5, y: 1.38 }),
    box(0.36, 0.3, 0.035, 0x2f5fc8, { x: 0.2, y: 1.68 }),
  ]);

/** Space's early hazard: a mine bristling with spikes. */
export const spaceMine = () => {
  const parts: Parts = [blob(0.72, 0x3a3f4b, { y: 1.0 }, 1), torus(0.74, 0.07, RED, { y: 1.0 }, 12, 4), blob(0.16, 0xff5a4a, { y: 1.74 })];
  for (let i = 0; i < 10; i++) {
    const a = (i * 2 * PI) / 5;
    const up = i < 5 ? 0.45 : -0.45;
    const ring = Math.sqrt(1 - up * up);
    const dir: [number, number, number] = [Math.cos(a + (i < 5 ? 0 : 0.6)) * ring, up, Math.sin(a + (i < 5 ? 0 : 0.6)) * ring];
    parts.push(spike(0.11, 0.5, 0xc9ced6, [dir[0] * 0.66, 1.0 + dir[1] * 0.66, dir[2] * 0.66], dir, 5));
  }
  parts.push(cyl(0.05, 0.05, 0.3, STEEL, {}, 4));
  return merge(parts);
};

export const alien = () =>
  merge([
    blob(0.5, 0x7fd65a, { y: 0.6, sy: 1.1 }, 1),
    blob(0.56, 0x8fe06a, { y: 1.35, sx: 1.15 }, 1),
    blob(0.2, DARK, { x: -0.24, y: 1.42, z: -0.42, sy: 1.3 }),
    blob(0.2, DARK, { x: 0.24, y: 1.42, z: -0.42, sy: 1.3 }),
    box(0.2, 0.04, 0.05, DARK, { y: 1.1, z: -0.5 }),
    taper(0.03, 0.03, 0x5fb048, [-0.2, 1.8, 0], [-0.4, 2.2, 0], 4),
    taper(0.03, 0.03, 0x5fb048, [0.2, 1.8, 0], [0.4, 2.2, 0], 4),
    blob(0.09, 0xffd23f, { x: -0.4, y: 2.24 }),
    blob(0.09, 0xffd23f, { x: 0.4, y: 2.24 }),
    beam(0.12, 0x7fd65a, [-0.45, 0.8, 0], [-0.75, 0.45, -0.1]),
    beam(0.12, 0x7fd65a, [0.45, 0.8, 0], [0.75, 0.45, -0.1]),
    box(0.2, 0.14, 0.34, 0x5fb048, { x: -0.22, z: -0.06 }),
    box(0.2, 0.14, 0.34, 0x5fb048, { x: 0.22, z: -0.06 }),
  ]);

export const crate = () =>
  merge([
    box(1.4, 1.1, 1.4, HULL, { y: 0.06 }),
    box(1.46, 0.12, 1.46, STEEL, { y: 0 }),
    box(1.46, 0.12, 1.46, STEEL, { y: 1.1 }),
    box(1.42, 0.3, 1.42, GOLD, { y: 0.46 }),
    box(0.5, 0.5, 0.04, RED, { y: 0.36, z: -0.72 }),
    box(0.12, 1.2, 0.12, STEEL, { x: -0.68, z: -0.68 }),
    box(0.12, 1.2, 0.12, STEEL, { x: 0.68, z: -0.68 }),
    box(0.12, 1.2, 0.12, STEEL, { x: -0.68, z: 0.68 }),
    box(0.12, 1.2, 0.12, STEEL, { x: 0.68, z: 0.68 }),
  ]);

export const rover = () => {
  const parts: Parts = [
    box(1.0, 0.24, 1.6, HULL, { y: 0.42 }),
    box(0.9, 0.06, 1.3, GOLD, { y: 0.66 }),
    ...panel(0, 0.86, 0.25, 1.3, 0.9),
    cyl(0.04, 0.04, 0.8, STEEL, { x: 0.3, y: 0.66, z: -0.6 }, 5),
    box(0.3, 0.18, 0.2, DARK, { x: 0.3, y: 1.44, z: -0.62 }),
    box(0.1, 0.1, 0.06, GLOW, { x: 0.3, y: 1.48, z: -0.73 }),
    cone(0.26, 0.2, HULL, { x: -0.3, y: 0.9, z: -0.5, rx: PI }, 8),
  ];
  for (const z of [-0.6, 0, 0.6]) {
    for (const s of [-1, 1]) {
      parts.push(rodX(0.24, 0.16, DARK, s * 0.62, 0.24, z, 9));
      parts.push(rodX(0.12, 0.18, STEEL, s * 0.62, 0.24, z, 6));
    }
  }
  return merge(parts);
};

/** A mast with a dish. Also used, bigger, as the beacon. */
export const antenna = () =>
  merge([
    box(0.5, 0.12, 0.5, STEEL, {}),
    cyl(0.05, 0.08, 1.9, STEEL, { y: 0.1 }, 5),
    beam(0.03, STEEL, [0.2, 0.12, 0.2], [0, 1.0, 0]),
    beam(0.03, STEEL, [-0.2, 0.12, -0.2], [0, 1.0, 0]),
    spike(0.5, 0.26, HULL, [0, 1.55, -0.12], [0, 0.5, -1], 9),
    taper(0.02, 0.02, DARK, [0, 1.6, -0.2], [0, 1.78, -0.56], 4),
    blob(0.1, RED, { y: 2.06 }),
  ]);

// ------------------------------------------------------------------ people and craft
export const astronaut = () => {
  const parts: Parts = [
    blob(0.42, HULL, { y: 1.72 }, 1),
    blob(0.3, GOLD, { y: 1.72, z: -0.2, sx: 1.05, sy: 0.85 }, 1),
    box(0.74, 0.8, 0.46, HULL, { y: 0.66 }),
    box(0.6, 0.72, 0.3, 0xc9ced6, { y: 0.74, z: 0.36 }),
    box(0.34, 0.22, 0.06, STEEL, { y: 1.0, z: -0.26 }),
    box(0.08, 0.08, 0.07, RED, { x: -0.08, y: 1.08, z: -0.28 }),
    box(0.08, 0.08, 0.07, GLOW, { x: 0.08, y: 1.08, z: -0.28 }),
    box(0.76, 0.08, 0.48, RED, { y: 0.7 }),
  ];
  for (const s of [-1, 1]) {
    parts.push(beam(0.24, HULL, [s * 0.48, 1.36, 0], [s * 0.72, 0.8, -0.1]));
    parts.push(blob(0.16, 0xc9ced6, { x: s * 0.74, y: 0.74, z: -0.1 }));
    parts.push(box(0.3, 0.66, 0.34, HULL, { x: s * 0.2, y: 0.04 }));
    parts.push(box(0.32, 0.14, 0.44, 0xc9ced6, { x: s * 0.2, z: -0.04 }));
  }
  return merge(parts);
};

/** A classic rocket standing on its fins. `boosters` adds two strap-ons for the big ones. */
const rocketShape = (boosters: boolean) => {
  const parts: Parts = [
    cyl(0.3, 0.34, 1.1, 0xffffff, { y: 0.3 }, 10),
    cyl(0.31, 0.31, 0.16, RED, { y: 0.9 }, 10),
    cone(0.3, 0.6, RED, { y: 1.4 }, 10),
    cyl(0.2, 0.3, 0.2, DARK, { y: 0.1 }, 8),
    cone(0.16, 0.34, 0xff9a2a, { y: -0.04, rx: PI }, 6),
    blob(0.12, GLOW, { y: 1.12, z: -0.26 }),
    torus(0.13, 0.03, STEEL, { y: 1.12, z: -0.29, rx: PI / 2 }, 8, 4),
  ];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * PI) / 3 + 0.5;
    parts.push(beam(0.06, RED, [Math.cos(a) * 0.3, 0.75, Math.sin(a) * 0.3], [Math.cos(a) * 0.62, 0.02, Math.sin(a) * 0.62], 0.34));
  }
  if (boosters) {
    for (const s of [-1, 1]) {
      parts.push(cyl(0.15, 0.17, 0.9, 0xc9ced6, { x: s * 0.46, y: 0.2 }, 8), cone(0.15, 0.3, STEEL, { x: s * 0.46, y: 1.1 }, 8));
      parts.push(cone(0.1, 0.24, 0xff9a2a, { x: s * 0.46, y: -0.02, rx: PI }, 6));
    }
  }
  return merge(parts);
};
export const rocket = () => rocketShape(false);
export const bigRocket = () => rocketShape(true);

export const lander = () => {
  const parts: Parts = [
    cyl(0.62, 0.72, 0.5, GOLD, { y: 0.55 }, 8),
    cyl(0.5, 0.62, 0.16, STEEL, { y: 1.05 }, 8),
    box(0.74, 0.6, 0.74, HULL, { y: 1.2 }),
    box(0.3, 0.26, 0.05, DARK, { y: 1.42, z: -0.38 }),
    cone(0.3, 0.3, DARK, { y: 0.25 }, 8),
    spike(0.26, 0.16, HULL, [0.3, 1.82, 0.1], [0.4, 1, 0], 8),
    cyl(0.02, 0.02, 0.4, STEEL, { x: -0.25, y: 1.8 }, 4),
  ];
  for (let i = 0; i < 4; i++) {
    const a = (i * PI) / 2 + PI / 4;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    parts.push(beam(0.07, STEEL, [cx * 0.6, 0.8, cz * 0.6], [cx * 1.15, 0.06, cz * 1.15]));
    parts.push(beam(0.05, STEEL, [cx * 0.6, 0.55, cz * 0.6], [cx * 1.05, 0.3, cz * 1.05]));
    parts.push(cyl(0.2, 0.2, 0.06, GOLD, { x: cx * 1.15, z: cz * 1.15 }, 7));
  }
  return merge(parts);
};

/** Flying saucer. The body is white so the small "scout" version takes a tint. */
export const ufo = () => {
  const parts: Parts = [
    cyl(0.55, 1.0, 0.2, 0xffffff, { y: 0.9 }, 12),
    cyl(1.0, 0.6, 0.18, 0xc9ced6, { y: 0.72 }, 12),
    blob(0.5, GLOW, { y: 1.16, sy: 0.8 }, 1),
    cyl(0.3, 0.22, 0.14, DARK, { y: 0.6 }, 8),
    cone(0.5, 0.6, 0xd8fbff, { y: 0, rx: 0 }, 8),
  ];
  for (let i = 0; i < 8; i++) {
    const a = (i * PI) / 4;
    parts.push(blob(0.09, i % 2 ? 0xffd23f : RED, { x: Math.cos(a) * 0.86, y: 0.9, z: Math.sin(a) * 0.86 }));
  }
  return merge(parts);
};

export const satellite = () =>
  merge([
    box(0.6, 0.7, 0.6, GOLD, { y: 0.7 }),
    box(0.64, 0.1, 0.64, STEEL, { y: 0.66 }),
    box(0.64, 0.1, 0.64, STEEL, { y: 1.34 }),
    rodX(0.04, 2.0, STEEL, 0, 1.05, 0, 5),
    ...panel(-0.75, 1.03, 0, 0.8, 0.7),
    ...panel(0.75, 1.03, 0, 0.8, 0.7),
    spike(0.4, 0.22, HULL, [0, 1.42, -0.05], [0, 1, -0.5], 9),
    taper(0.02, 0.02, DARK, [0, 1.5, -0.1], [0, 1.85, -0.3], 4),
    cyl(0.05, 0.08, 0.66, STEEL, {}, 5),
    box(0.4, 0.06, 0.4, STEEL, {}),
  ]);

/** A tall dark monument with glowing seams. Nobody knows who left it. */
export const obelisk = () =>
  merge([
    box(0.6, 0.12, 0.6, 0x3a3f4b, {}),
    grade(frustum(0.42, 0.42, 0.24, 0.24, 1.7, 0xffffff, { y: 0.12 }), 0x1c2030, 0x3a4060),
    spike(0.2, 0.28, 0x3a4060, [0, 1.82, 0], [0, 1, 0], 4),
    box(0.44, 0.04, 0.44, GLOW, { y: 0.5 }),
    box(0.36, 0.04, 0.36, GLOW, { y: 1.0 }),
    box(0.3, 0.04, 0.3, GLOW, { y: 1.45 }),
    blob(0.1, GLOW, { y: 2.14 }),
  ]);

export const habitat = () =>
  merge([
    cyl(1.0, 1.0, 0.16, STEEL, {}, 12),
    blob(0.95, HULL, { y: 0.16, sy: 0.9 }, 1),
    torus(0.9, 0.06, STEEL, { y: 0.45 }, 12, 4),
    box(0.4, 0.5, 0.2, 0x3a3f4b, { y: 0.16, z: -0.92 }),
    box(0.3, 0.36, 0.06, GLOW, { y: 0.2, z: -1.04 }),
    // A tunnel to a smaller second dome.
    rodX(0.24, 0.9, 0xc9ced6, 1.2, 0.3, 0.2, 8),
    blob(0.5, HULL, { x: 1.75, y: 0.1, z: 0.2, sy: 0.85 }, 1),
    cyl(0.03, 0.03, 0.6, STEEL, { y: 0.98 }, 4),
    blob(0.08, RED, { y: 1.62 }),
    box(0.3, 0.2, 0.05, GLOW, { x: -0.5, y: 0.5, z: -0.72, ry: -0.6 }),
    box(0.3, 0.2, 0.05, GLOW, { x: 0.5, y: 0.5, z: -0.72, ry: 0.6 }),
  ]);

export const shuttle = () =>
  merge([
    cyl(0.3, 0.3, 1.6, 0xffffff, { y: 0.4 - 0.8, z: 0.1, rx: PI / 2 }, 8),
    spike(0.3, 0.5, DARK, [0, 0.4, -0.7], [0, -0.1, -1], 8),
    box(0.3, 0.14, 0.4, DARK, { y: 0.58, z: -0.55 }),
    // Delta wings, tail fin and three engine bells.
    frustum(1.9, 0.9, 0.5, 0.2, 0.08, 0xffffff, { y: 0.16, z: 0.5 }, 0, -0.3),
    box(1.92, 0.04, 0.2, DARK, { y: 0.14, z: 0.92 }),
    frustum(0.08, 0.6, 0.06, 0.26, 0.6, 0xffffff, { y: 0.66, z: 0.6 }, 0, 0.14),
    box(0.62, 0.06, 1.0, 0xc9ced6, { y: 0.68, z: 0.05 }),
    spike(0.14, 0.24, STEEL, [0, 0.52, 0.9], [0, 0, 1], 7),
    spike(0.12, 0.22, STEEL, [-0.17, 0.3, 0.9], [0, 0, 1], 7),
    spike(0.12, 0.22, STEEL, [0.17, 0.3, 0.9], [0, 0, 1], 7),
    box(0.1, 0.2, 0.6, DARK, { x: -0.3, y: 0, z: 0.2 }),
    box(0.1, 0.2, 0.6, DARK, { x: 0.3, y: 0, z: 0.2 }),
    box(0.08, 0.2, 0.3, DARK, { y: 0, z: -0.5 }),
  ]);

export const station = () => {
  const parts: Parts = [
    rodZ(0.26, 1.8, HULL, 0, 1.0, 0, 9),
    rodX(0.22, 1.5, 0xc9ced6, 0, 1.0, 0, 9),
    blob(0.4, HULL, { y: 1.0 }, 1),
    cyl(0.2, 0.2, 0.5, GOLD, { y: 1.2 }, 8),
    rodX(0.04, 2.6, STEEL, 0, 1.0, 0.6, 5),
    rodX(0.04, 2.6, STEEL, 0, 1.0, -0.6, 5),
    blob(0.12, GLOW, { y: 1.0, z: -0.95 }),
    torus(0.3, 0.05, STEEL, { y: 1.0, z: -0.9, rx: PI / 2 }, 9, 4),
    // Legs so it stands on the ground like everything else.
    beam(0.06, STEEL, [-0.4, 0.8, 0.5], [-0.7, 0.04, 0.8]),
    beam(0.06, STEEL, [0.4, 0.8, 0.5], [0.7, 0.04, 0.8]),
    beam(0.06, STEEL, [-0.4, 0.8, -0.5], [-0.7, 0.04, -0.8]),
    beam(0.06, STEEL, [0.4, 0.8, -0.5], [0.7, 0.04, -0.8]),
  ];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(...panel(sx * 1.05, 1.0, sz * 0.6, 0.5, 0.95));
  return merge(parts);
};

// ------------------------------------------------------------------ rocks and worlds
export const asteroid = () => {
  const parts: Parts = [
    speckle(blob(0.9, 0x7a7068, { y: 0.95, sx: 1.1, sy: 0.9 }, 1), 0.14, 1),
    speckle(blob(0.55, 0x8a8076, { x: 0.6, y: 0.6, z: 0.4 }, 1), 0.14, 2),
    speckle(blob(0.5, 0x6a6058, { x: -0.6, y: 1.2, z: -0.3 }, 1), 0.14, 3),
    spike(0.14, 0.5, GLOW, [0.3, 1.6, 0.2], [0.3, 1, 0.1], 5),
    spike(0.1, 0.36, 0xb8f4ff, [0.5, 1.5, 0.0], [0.8, 0.8, -0.2], 5),
  ];
  craters(parts, 0.84, 0.95, 0x4a443e, 5);
  return merge(parts);
};

/** A rock with a tail of ice streaming out behind it (+Z). Also plays Space's "snowplough". */
export const comet = () => {
  const parts: Parts = [speckle(blob(0.75, 0x9a9488, { y: 0.9 }, 1), 0.12, 1), blob(0.5, 0xd8f6ff, { y: 0.9, z: 0.35, sz: 1.2 }, 1)];
  craters(parts, 0.72, 0.9, 0x5a554c, 4);
  parts.push(spike(0.6, 2.2, 0x9fe6ff, [0, 0.9, 0.5], [0, 0.12, 1], 7));
  parts.push(spike(0.36, 1.6, 0xeafaff, [0.3, 1.1, 0.5], [0.25, 0.3, 1], 6));
  parts.push(spike(0.3, 1.4, 0xbfefff, [-0.3, 0.75, 0.5], [-0.3, 0.05, 1], 6));
  return merge(parts);
};

export const moon = () => {
  const parts: Parts = [speckle(blob(1.0, 0xc8ccd6, { y: 1.0 }, 2), 0.07)];
  craters(parts, 1.0, 1.0, 0x8a8e9a, 9);
  return merge(parts);
};

export const ringedPlanet = () =>
  merge([
    bands(blob(0.85, 0xffffff, { y: 1.0 }, 2), [0xc98a4a, 0xe8b070, 0xf2cf96, 0xd89a5a, 0xf2cf96, 0xe8b070, 0xc98a4a]),
    torus(1.25, 0.1, 0xe8d8b0, { y: 1.0, rz: 0.35, sy: 0.25 }, 22, 4),
    torus(1.5, 0.07, 0xb8a888, { y: 1.0, rz: 0.35, sy: 0.25 }, 22, 4),
  ]);

export const gasGiant = () =>
  merge([
    bands(blob(1.0, 0xffffff, { y: 1.0 }, 2), [0x3f6fb8, 0x5a8fd0, 0x8fb8e8, 0xcfe0f2, 0x6fa0dc, 0xe8f0fa, 0x5a8fd0, 0x3f6fb8]),
    blob(0.3, 0xe2734a, { x: 0.3, y: 0.85, z: -0.86, sz: 0.3, sy: 0.6 }, 1),
  ]);

export const star = () => {
  const parts: Parts = [bands(blob(0.86, 0xffffff, { y: 1.0 }, 2), [0xff9a1a, 0xffc23a, 0xffe680, 0xfff4b8, 0xffe680, 0xffc23a, 0xff9a1a])];
  // A corona of flames.
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const up = Math.sin(i * 1.3) * 0.85;
    const ring = Math.sqrt(1 - up * up);
    const dir: [number, number, number] = [Math.cos(a) * ring, up, Math.sin(a) * ring];
    parts.push(spike(0.22, 0.3 + (i % 3) * 0.1, i % 2 ? 0xff7a1a : 0xffb02a, [dir[0] * 0.8, 1.0 + dir[1] * 0.8, dir[2] * 0.8], dir, 5));
  }
  return merge(parts);
};

// ------------------------------------------------------------------ walls
// 18 units wide, about 2 tall, +Z towards the player.

export const junkWall = () => {
  const parts: Parts = [];
  const colors = [HULL, GOLD, STEEL, 0xc9ced6];
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    const h = 1.3 + ((i * 7) % 5) * 0.14;
    parts.push(box(1.44, h, 0.8, colors[i % 4], { x }));
    parts.push(box(1.48, 0.1, 0.84, DARK, { x, y: h * 0.5 }));
    if (i % 3 === 0) parts.push(...panel(x, h + 0.2, 0, 1.3, 0.7).map((g) => g));
    else if (i % 3 === 1) parts.push(spike(0.4, 0.22, HULL, [x, h + 0.02, 0], [0.2, 1, 0.3], 8));
    else parts.push(cyl(0.03, 0.03, 0.6, STEEL, { x, y: h }, 4), blob(0.09, RED, { x, y: h + 0.66 }));
  }
  return merge(parts);
};

export const rockWall = (a: number, b: number) => () => {
  const parts: Parts = [];
  for (let i = 0; i < 13; i++) {
    const x = -9 + i * 1.5;
    const s = 0.85 + ((i * 5) % 4) * 0.1;
    parts.push(speckle(blob(s, i % 2 ? a : b, { x, y: s * 0.85, sy: 1.05 + (i % 3) * 0.12 }, 1), 0.13, i + 1));
    if (i < 12) parts.push(speckle(blob(0.6, i % 2 ? b : a, { x: x + 0.75, y: 0.5, z: 0.25 }, 1), 0.13, i + 20));
  }
  return merge(parts);
};

export const laserWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3;
    parts.push(box(0.5, 0.2, 0.6, DARK, { x }));
    parts.push(cyl(0.14, 0.18, 1.9, STEEL, { x, y: 0.2 }, 7));
    parts.push(blob(0.2, RED, { x, y: 2.18 }, 1));
    for (const y of [0.55, 1.05, 1.55]) parts.push(box(0.34, 0.14, 0.34, 0x3a3f4b, { x, y: y - 0.07 }));
  }
  // The beams themselves.
  for (const y of [0.55, 1.05, 1.55]) {
    parts.push(rodX(0.06, 18, 0xff3b30, 0, y, 0, 5));
    parts.push(rodX(0.025, 18, 0xffc8c0, 0, y, 0.07, 4));
  }
  return merge(parts);
};

/** A row of crystal blocks with spikes: purple ice for the planetary rings. */
export const crystalWall = (deep: number, pale: number) => () => {
  const parts: Parts = [];
  for (let i = 0; i < 12; i++) {
    const h = 1.4 + ((i * 7) % 5) * 0.11;
    const x = -8.25 + i * 1.5;
    parts.push(grade(box(1.47, h, 0.85, 0xffffff, { x }), deep, pale));
    parts.push(grade(cone(0.4, 0.7, 0xffffff, { x: x - 0.3, y: h }, 4), pale, 0xffffff));
    parts.push(grade(cone(0.28, 0.5, 0xffffff, { x: x + 0.4, y: h, z: 0.15 }, 4), pale, 0xffffff));
  }
  return merge(parts);
};

/** The last wall of Space: a slab of nothing with a bright rim. */
export const voidWall = () => {
  const parts: Parts = [box(18, 1.9, 0.9, 0x08060f, {}), box(18.2, 0.12, 1.0, 0xb06aff, { y: 1.9 }), box(18.2, 0.1, 1.0, 0xb06aff, {})];
  for (let i = 0; i < 9; i++) {
    const x = -8 + i * 2;
    parts.push(torus(0.6, 0.06, i % 2 ? 0xb06aff : GLOW, { x, y: 0.95, z: 0.48, rx: PI / 2 }, 12, 4));
    parts.push(blob(0.16, 0xffffff, { x, y: 0.95, z: 0.5 }));
  }
  return merge(parts);
};
