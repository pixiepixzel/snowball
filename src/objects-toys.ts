/**
 * Models for the Toy Room: blocks, wind-up toys and a very big teddy bear.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, merge, prism, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const RED = 0xe8402a;
const BLUE = 0x2f7de0;
const YELLOW = 0xffd23f;
const GREEN = 0x3fb85a;
const ORANGE = 0xff8a2a;
const PURPLE = 0x9a5ad6;
const WOOD = 0xd8a868;
const DARK_WOOD = 0x9a6a3a;
const WHITE = 0xf4f4f4;
const BLACK = 0x26262e;
const STEEL = 0xa8b0bc;
const TEDDY = 0xb8824a;
const PRIMARY = [RED, BLUE, YELLOW, GREEN, ORANGE, PURPLE];

/** A toy wheel on the X axis, centred on (x, r, z). */
const wheel = (x: number, z: number, r: number, hub = YELLOW): Parts => [rodX(r, 0.16, BLACK, x, r, z, 10), rodX(r * 0.45, 0.2, hub, x, r, z, 7)];

/** A wind-up key sticking out of the back of a toy at (y, z). */
const key = (y: number, z: number): Parts => [rodZ(0.04, 0.3, STEEL, 0, y, z + 0.15, 5), torus(0.14, 0.04, STEEL, { x: -0.14, y, z: z + 0.32, rz: PI / 2 }, 7, 3), torus(0.14, 0.04, STEEL, { x: 0.14, y, z: z + 0.32, rz: PI / 2 }, 7, 3)];

/** A wooden block with a coloured face on every side. */
const block = (x: number, y: number, z: number, s: number, color: number, ry = 0): Parts => [
  box(s, s, s, WOOD, { x, y, z, ry }),
  box(s * 0.74, s * 0.74, s * 1.03, color, { x, y: y + s * 0.13, z, ry }),
  box(s * 1.03, s * 0.74, s * 0.74, color, { x, y: y + s * 0.13, z, ry }),
];

// ------------------------------------------------------------------ small things
export const jack = () => {
  const parts: Parts = [blob(0.2, STEEL, { y: 0.8 })];
  const axes: [number, number, number][] = [
    [1, 0.4, 0],
    [-0.3, 0.4, 1],
    [0, 1, -0.3],
  ];
  for (const [x, y, z] of axes) {
    const n = Math.hypot(x, y, z);
    const d: [number, number, number] = [(x / n) * 0.75, (y / n) * 0.75, (z / n) * 0.75];
    parts.push(taper(0.07, 0.07, STEEL, [-d[0], 0.8 - d[1], -d[2]], [d[0], 0.8 + d[1], d[2]], 5));
    parts.push(blob(0.16, RED, { x: d[0], y: 0.8 + d[1], z: d[2] }), blob(0.16, RED, { x: -d[0], y: 0.8 - d[1], z: -d[2] }));
  }
  return merge(parts);
};

export const button = () => {
  const parts: Parts = [cyl(0.9, 0.9, 0.2, BLUE, {}, 14), torus(0.78, 0.1, 0x4f9df0, { y: 0.2 }, 14, 4)];
  for (const [x, z] of [
    [-0.2, -0.2],
    [0.2, -0.2],
    [-0.2, 0.2],
    [0.2, 0.2],
  ])
    parts.push(cyl(0.1, 0.1, 0.22, 0x1a4a9a, { x, z }, 6));
  parts.push(beam(0.05, WHITE, [-0.2, 0.24, -0.2], [0.2, 0.24, 0.2]), beam(0.05, WHITE, [0.2, 0.24, -0.2], [-0.2, 0.24, 0.2]));
  return merge(parts);
};

export const dice = () => {
  const parts: Parts = [box(1.3, 1.3, 1.3, WHITE, { ry: 0.3 })];
  const dot = (x: number, y: number, z: number): void => {
    parts.push(blob(0.11, BLACK, { x: x * Math.cos(0.3) + z * Math.sin(0.3), y, z: -x * Math.sin(0.3) + z * Math.cos(0.3) }));
  };
  for (const [x, z] of [
    [-0.34, -0.34],
    [0, 0],
    [0.34, 0.34],
  ])
    dot(x, 1.3, z);
  for (const [x, y] of [
    [-0.3, 0.35],
    [0.3, 0.35],
    [-0.3, 0.95],
    [0.3, 0.95],
    [0, 0.65],
  ])
    dot(x, y, -0.65);
  return merge(parts);
};

export const crayon = () =>
  merge([
    rodZ(0.2, 1.5, GREEN, 0, 0.2, 0.1, 8),
    rodZ(0.21, 0.8, 0x2f9a48, 0, 0.2, 0.2, 8),
    rodZ(0.215, 0.08, BLACK, 0, 0.2, -0.2, 8),
    rodZ(0.215, 0.08, BLACK, 0, 0.2, 0.6, 8),
    spike(0.2, 0.4, GREEN, [0, 0.2, -0.65], [0, 0, -1], 8),
  ]);

/** The Toy Room's early hazard: a drawing pin, point up. */
export const pushpin = () =>
  merge([
    cyl(0.6, 0.66, 0.18, RED, {}, 10),
    cyl(0.3, 0.44, 0.5, 0xc82a1a, { y: 0.18 }, 9),
    cyl(0.44, 0.3, 0.14, RED, { y: 0.68 }, 9),
    spike(0.07, 1.3, STEEL, [0, 0.8, 0], [0, 1, 0], 5),
  ]);

export const windupMouse = () =>
  merge([
    blob(0.5, 0x9aa4b0, { y: 0.5, sz: 1.5, sy: 0.9 }, 1),
    spike(0.22, 0.5, 0x9aa4b0, [0, 0.46, -0.7], [0, -0.1, -1], 6),
    blob(0.07, 0xff7ab8, { y: 0.42, z: -1.2 }),
    rodZ(0.2, 0.06, 0xffa8c8, -0.26, 0.92, -0.4, 8),
    rodZ(0.2, 0.06, 0xffa8c8, 0.26, 0.92, -0.4, 8),
    blob(0.05, BLACK, { x: -0.18, y: 0.66, z: -0.86 }),
    blob(0.05, BLACK, { x: 0.18, y: 0.66, z: -0.86 }),
    taper(0.04, 0.02, 0xffa8c8, [0, 0.4, 0.7], [0.3, 0.2, 1.4], 4),
    ...wheel(-0.36, 0.2, 0.2, RED),
    ...wheel(0.36, 0.2, 0.2, RED),
    ...key(0.9, 0.2),
  ]);

export const rubberBall = () => merge([bands(blob(0.85, 0xffffff, { y: 0.85 }, 2), [RED, WHITE, BLUE, WHITE, YELLOW, WHITE, RED]), blob(0.16, WHITE, { x: -0.3, y: 1.4, z: -0.5 })]);

export const skateboard = () =>
  merge([
    box(0.7, 0.08, 2.0, ORANGE, { y: 0.3 }),
    box(0.5, 0.09, 1.3, YELLOW, { y: 0.3 }),
    frustum(0.7, 0.3, 0.6, 0.2, 0.16, ORANGE, { y: 0.3, z: -1.1 }, 0, -0.14),
    frustum(0.7, 0.3, 0.6, 0.2, 0.16, ORANGE, { y: 0.3, z: 1.1 }, 0, 0.14),
    box(0.6, 0.08, 0.14, STEEL, { y: 0.2, z: -0.7 }),
    box(0.6, 0.08, 0.14, STEEL, { y: 0.2, z: 0.7 }),
    ...[-0.7, 0.7].flatMap((z) => [rodX(0.14, 0.14, WHITE, -0.34, 0.14, z, 8), rodX(0.14, 0.14, WHITE, 0.34, 0.14, z, 8)]),
  ]);

export const domino = () => {
  const parts: Parts = [box(0.9, 0.2, 1.9, BLACK, {}), box(0.8, 0.22, 0.05, WHITE, { z: 0 })];
  for (const [x, z] of [
    [-0.22, -0.7],
    [0.22, -0.3],
    [0, -0.5],
    [-0.22, 0.3],
    [0.22, 0.3],
    [-0.22, 0.7],
    [0.22, 0.7],
  ])
    parts.push(blob(0.09, WHITE, { x, y: 0.2, z, sy: 0.5 }));
  return merge(parts);
};

export const stackRings = () => {
  const parts: Parts = [cyl(0.8, 0.86, 0.14, WOOD, {}, 12), cyl(0.07, 0.09, 1.9, WOOD, {}, 6), blob(0.16, RED, { y: 1.96 })];
  for (let i = 0; i < 5; i++) parts.push(torus(0.56 - i * 0.09, 0.17 - i * 0.012, PRIMARY[i], { y: 0.32 + i * 0.3 }, 12, 6));
  return merge(parts);
};

export const toyTree = () =>
  merge([
    cyl(0.5, 0.56, 0.12, DARK_WOOD, {}, 10),
    cyl(0.12, 0.14, 0.5, DARK_WOOD, { y: 0.12 }, 6),
    cone(0.74, 0.7, GREEN, { y: 0.5 }, 8),
    cone(0.58, 0.64, 0x4ac866, { y: 0.96 }, 8),
    cone(0.4, 0.6, GREEN, { y: 1.38 }, 8),
    blob(0.08, RED, { x: 0.4, y: 0.7, z: -0.4 }),
    blob(0.08, YELLOW, { x: -0.36, y: 1.06, z: -0.3 }),
    blob(0.08, BLUE, { x: 0.2, y: 1.5, z: -0.24 }),
  ]);

export const teddy = () =>
  merge([
    speckle(blob(0.6, TEDDY, { y: 0.7, sy: 1.1 }, 1), 0.06),
    speckle(blob(0.46, TEDDY, { y: 1.56 }, 1), 0.06, 2),
    blob(0.18, TEDDY, { x: -0.36, y: 1.94 }),
    blob(0.18, TEDDY, { x: 0.36, y: 1.94 }),
    blob(0.1, 0xe8c090, { x: -0.36, y: 1.94, z: -0.1 }),
    blob(0.1, 0xe8c090, { x: 0.36, y: 1.94, z: -0.1 }),
    blob(0.22, 0xe8c090, { y: 1.46, z: -0.36 }, 1),
    blob(0.06, BLACK, { y: 1.52, z: -0.56 }),
    blob(0.05, BLACK, { x: -0.16, y: 1.68, z: -0.4 }),
    blob(0.05, BLACK, { x: 0.16, y: 1.68, z: -0.4 }),
    blob(0.36, 0xe8c090, { y: 0.72, z: -0.4, sy: 1.1 }, 1),
    blob(0.22, TEDDY, { x: -0.62, y: 1.0, z: -0.16 }, 1),
    blob(0.22, TEDDY, { x: 0.62, y: 1.0, z: -0.16 }, 1),
    blob(0.26, TEDDY, { x: -0.36, y: 0.24, z: -0.4 }, 1),
    blob(0.26, TEDDY, { x: 0.36, y: 0.24, z: -0.4 }, 1),
    box(0.4, 0.14, 0.06, RED, { y: 1.14, z: -0.42 }),
  ]);

export const jackInBox = () =>
  merge([
    ...block(0, 0, 0, 1.3, RED),
    box(1.34, 0.08, 1.34, YELLOW, { y: 1.3, z: 0.6, rx: -1.1 }),
    ...[0, 1, 2, 3].map((i) => torus(0.26, 0.06, STEEL, { y: 1.36 + i * 0.1, rz: i % 2 ? 0.2 : -0.2 }, 8, 3)),
    blob(0.3, 0xffe0c0, { y: 1.96 }, 1),
    blob(0.08, RED, { y: 1.94, z: -0.3 }),
    cone(0.26, 0.4, BLUE, { y: 2.16 }, 6),
    blob(0.08, YELLOW, { y: 2.58 }),
    rodX(0.04, 0.3, STEEL, 0.8, 0.7, 0, 4),
    blob(0.09, BLACK, { x: 0.96, y: 0.7 }),
  ]);

export const toyBoat = () =>
  merge([
    frustum(0.5, 1.6, 0.9, 2.0, 0.5, RED, {}),
    box(0.94, 0.08, 2.0, WHITE, { y: 0.48 }),
    box(0.5, 0.36, 0.6, WHITE, { y: 0.54, z: 0.3 }),
    box(0.54, 0.08, 0.64, BLUE, { y: 0.9, z: 0.3 }),
    cyl(0.14, 0.14, 0.5, YELLOW, { y: 0.98, z: 0.3 }, 7),
    cyl(0.15, 0.15, 0.1, RED, { y: 1.38, z: 0.3 }, 7),
    cyl(0.03, 0.03, 0.5, WOOD, { y: 0.54, z: -0.6 }, 4),
    box(0.3, 0.2, 0.02, YELLOW, { x: 0.16, y: 0.84, z: -0.6 }),
  ]);

/** A tin robot. The body is white so the game can tint it. */
export const robot = () =>
  merge([
    box(0.8, 0.8, 0.5, 0xffffff, { y: 0.6 }),
    box(0.56, 0.46, 0.44, 0xffffff, { y: 1.46 }),
    cyl(0.1, 0.1, 0.1, STEEL, { y: 1.4 }, 6),
    box(0.14, 0.14, 0.05, YELLOW, { x: -0.13, y: 1.66, z: -0.23 }),
    box(0.14, 0.14, 0.05, YELLOW, { x: 0.13, y: 1.66, z: -0.23 }),
    box(0.3, 0.06, 0.05, BLACK, { y: 1.52, z: -0.23 }),
    cyl(0.02, 0.02, 0.24, STEEL, { y: 1.92 }, 4),
    blob(0.07, RED, { y: 2.2 }),
    box(0.4, 0.3, 0.05, BLACK, { y: 0.9, z: -0.26 }),
    blob(0.06, RED, { x: -0.1, y: 1.04, z: -0.3 }),
    blob(0.06, GREEN, { x: 0.1, y: 1.04, z: -0.3 }),
    beam(0.16, STEEL, [-0.5, 1.3, 0], [-0.66, 0.7, -0.2]),
    beam(0.16, STEEL, [0.5, 1.3, 0], [0.66, 0.7, -0.2]),
    box(0.26, 0.6, 0.3, STEEL, { x: -0.22 }),
    box(0.26, 0.6, 0.3, STEEL, { x: 0.22 }),
    ...key(0.9, 0.24),
  ]);

export const pinwheel = () => {
  // A thick striped stick and four big sails, each a different colour.
  const parts: Parts = [cyl(0.2, 0.26, 0.12, DARK_WOOD, {}, 7), bands(cyl(0.08, 0.09, 1.5, 0xffffff, { y: 0.1 }, 6), [RED, WHITE, RED, WHITE, RED, WHITE]), blob(0.15, YELLOW, { y: 1.5, z: -0.2 }, 1)];
  for (let i = 0; i < 4; i++) {
    const a = (i * PI) / 2 + 0.3;
    parts.push(spike(0.4, 0.95, PRIMARY[i], [0, 1.5, -0.12], [Math.cos(a), Math.sin(a), 0], 3));
    parts.push(spike(0.24, 0.6, WHITE, [Math.cos(a) * 0.1, 1.5 + Math.sin(a) * 0.1, -0.16], [Math.cos(a + 0.8), Math.sin(a + 0.8), 0], 3));
  }
  return merge(parts);
};

/** A wind-up toy car. Also the thing that charges up the slope at you. */
export const toyCar = (body: number) => () =>
  merge([
    box(0.9, 0.36, 1.9, body, { y: 0.2 }),
    frustum(0.84, 1.0, 0.7, 0.6, 0.36, body, { y: 0.56, z: 0.1 }),
    box(0.6, 0.24, 0.05, 0xbfeaff, { y: 0.6, z: -0.36, rx: 0.4 }),
    box(0.72, 0.2, 0.5, 0xbfeaff, { y: 0.62, z: 0.1 }),
    blob(0.1, YELLOW, { x: -0.3, y: 0.42, z: -0.96 }),
    blob(0.1, YELLOW, { x: 0.3, y: 0.42, z: -0.96 }),
    box(0.94, 0.1, 0.1, STEEL, { y: 0.2, z: -0.96 }),
    box(0.3, 0.05, 1.9, WHITE, { y: 0.56 }),
    ...wheel(-0.48, -0.6, 0.26),
    ...wheel(0.48, -0.6, 0.26),
    ...wheel(-0.48, 0.6, 0.26),
    ...wheel(0.48, 0.6, 0.26),
    ...key(0.56, 0.95),
  ]);

export const pencil = () =>
  merge([
    cyl(0.15, 0.15, 0.16, 0xff8aa8, {}, 6),
    cyl(0.155, 0.155, 0.14, STEEL, { y: 0.16 }, 6),
    cyl(0.15, 0.15, 1.3, YELLOW, { y: 0.3 }, 6),
    cone(0.15, 0.3, 0xe8c898, { y: 1.6 }, 6),
    cone(0.05, 0.1, BLACK, { y: 1.9 }, 6),
  ]);

export const blockHouse = () =>
  merge([
    ...block(-0.42, 0, 0, 0.84, BLUE),
    ...block(0.42, 0, 0, 0.84, YELLOW),
    prism(1.0, 0.7, 1.78, RED, { y: 0.84, ry: PI / 2 }),
    box(0.26, 0.44, 0.04, GREEN, { x: 0.42, z: -0.44 }),
    box(0.24, 0.24, 0.04, WHITE, { x: -0.42, y: 0.36, z: -0.44 }),
    cyl(0.12, 0.12, 0.4, GREEN, { x: -0.3, y: 1.1, z: 0.2 }, 7),
  ]);

export const toyTruck = () =>
  merge([
    box(0.9, 0.2, 1.9, BLACK, { y: 0.24 }),
    box(0.84, 0.6, 0.6, RED, { y: 0.44, z: -0.6 }),
    box(0.7, 0.24, 0.05, 0xbfeaff, { y: 0.72, z: -0.92 }),
    frustum(0.84, 1.1, 0.96, 1.2, 0.5, YELLOW, { y: 0.44, z: 0.34 }),
    blob(0.3, 0xb8824a, { y: 0.9, z: 0.2, sy: 0.6 }, 1),
    blob(0.26, 0x9a6a3a, { x: 0.14, y: 0.92, z: 0.56, sy: 0.6 }, 1),
    blob(0.09, YELLOW, { x: -0.3, y: 0.5, z: -0.92 }),
    blob(0.09, YELLOW, { x: 0.3, y: 0.5, z: -0.92 }),
    ...wheel(-0.5, -0.6, 0.28, WHITE),
    ...wheel(0.5, -0.6, 0.28, WHITE),
    ...wheel(-0.5, 0.5, 0.28, WHITE),
    ...wheel(0.5, 0.5, 0.28, WHITE),
  ]);

export const drum = () => {
  const parts: Parts = [cyl(0.85, 0.85, 1.0, RED, { y: 0.1 }, 12), cyl(0.9, 0.9, 0.12, YELLOW, {}, 12), cyl(0.9, 0.9, 0.12, YELLOW, { y: 1.06 }, 12), cyl(0.8, 0.8, 0.04, WHITE, { y: 1.16 }, 12)];
  for (let i = 0; i < 8; i++) {
    const a0 = (i * PI) / 4;
    const a1 = a0 + PI / 8;
    parts.push(beam(0.04, WHITE, [Math.cos(a0) * 0.87, 0.12, Math.sin(a0) * 0.87], [Math.cos(a1) * 0.87, 1.06, Math.sin(a1) * 0.87]));
    parts.push(beam(0.04, WHITE, [Math.cos(a1) * 0.87, 1.06, Math.sin(a1) * 0.87], [Math.cos(a0 + PI / 4) * 0.87, 0.12, Math.sin(a0 + PI / 4) * 0.87]));
  }
  parts.push(taper(0.04, 0.04, WOOD, [-0.3, 1.24, 0.2], [0.5, 1.4, -0.5], 4), blob(0.1, WOOD, { x: 0.52, y: 1.42, z: -0.52 }));
  parts.push(taper(0.04, 0.04, WOOD, [0.3, 1.24, 0.3], [-0.5, 1.36, -0.4], 4), blob(0.1, WOOD, { x: -0.52, y: 1.38, z: -0.42 }));
  return merge(parts);
};

export const dollhouse = () => {
  const parts: Parts = [
    box(1.7, 1.2, 1.2, 0xffc0d8, {}),
    prism(1.4, 0.7, 1.9, 0x9a5ad6, { y: 1.2, ry: PI / 2 }),
    box(1.74, 0.06, 1.24, WHITE, { y: 0.58 }),
    box(1.74, 0.06, 1.24, WHITE, { y: 1.16 }),
    box(0.3, 0.5, 0.05, 0x9a5ad6, { z: -0.6 }),
    box(0.3, 0.36, 0.3, 0xffc0d8, { x: 0.4, y: 1.5, z: 0.2 }),
  ];
  for (const x of [-0.56, 0.56]) for (const y of [0.16, 0.74]) parts.push(box(0.3, 0.3, 0.05, 0xbfeaff, { x, y, z: -0.6 }), box(0.34, 0.04, 0.06, WHITE, { x, y: y + 0.13, z: -0.6 }), box(0.04, 0.3, 0.06, WHITE, { x, y, z: -0.6 }));
  parts.push(box(0.3, 0.3, 0.05, 0xbfeaff, { y: 0.74, z: -0.6 }), blob(0.2, 0xbfeaff, { y: 1.5, z: -0.5 }));
  return merge(parts);
};

/** A toy fort. Colours make it a wooden fort or a plastic castle. */
export const fort = (wall: number, roof: number, flag: number) => () => {
  const parts: Parts = [box(1.4, 0.8, 1.2, wall, {}), box(0.36, 0.5, 0.05, DARK_WOOD, { z: -0.6 }), rodZ(0.18, 0.05, DARK_WOOD, 0, 0.5, -0.6, 8)];
  for (let i = 0; i < 5; i++) parts.push(box(0.16, 0.18, 1.2, wall, { x: -0.6 + i * 0.3, y: 0.8 }));
  for (const [x, z] of [
    [-0.74, -0.6],
    [0.74, -0.6],
    [-0.74, 0.6],
    [0.74, 0.6],
  ]) {
    parts.push(cyl(0.26, 0.28, 1.3, wall, { x, z }, 8), cone(0.36, 0.5, roof, { x, y: 1.3, z }, 8));
    parts.push(cyl(0.015, 0.015, 0.3, STEEL, { x, y: 1.78, z }, 4), box(0.2, 0.12, 0.02, flag, { x: x + 0.11, y: 1.94, z }));
  }
  return merge(parts);
};

export const toyTrain = () =>
  merge([
    box(0.84, 0.16, 2.0, BLACK, { y: 0.24 }),
    rodZ(0.36, 1.0, RED, 0, 0.78, -0.4, 10),
    box(0.8, 0.9, 0.7, BLUE, { y: 0.4, z: 0.55 }),
    box(0.9, 0.08, 0.8, YELLOW, { y: 1.3, z: 0.55 }),
    box(0.5, 0.3, 0.05, 0xbfeaff, { y: 0.9, z: 0.18 }),
    cyl(0.16, 0.12, 0.4, BLACK, { y: 1.1, z: -0.64 }, 7),
    cyl(0.2, 0.16, 0.08, YELLOW, { y: 1.5, z: -0.64 }, 7),
    blob(0.14, YELLOW, { y: 1.18, z: -0.2 }),
    blob(0.12, YELLOW, { y: 0.8, z: -0.92 }),
    frustum(0.8, 0.1, 0.6, 0.3, 0.3, YELLOW, { y: 0.1, z: -1.06 }, 0, -0.1),
    ...wheel(-0.46, -0.6, 0.24, RED),
    ...wheel(0.46, -0.6, 0.24, RED),
    ...wheel(-0.46, 0, 0.24, RED),
    ...wheel(0.46, 0, 0.24, RED),
    ...wheel(-0.46, 0.66, 0.3, RED),
    ...wheel(0.46, 0.66, 0.3, RED),
  ]);

export const blockTower = () =>
  merge([
    ...block(0, 0, 0, 0.72, RED, 0.2),
    ...block(0.05, 0.72, 0, 0.66, BLUE, -0.3),
    ...block(-0.04, 1.38, 0.02, 0.6, YELLOW, 0.5),
    cyl(0.26, 0.26, 0.3, GREEN, { y: 1.98 }, 8),
    cone(0.3, 0.36, RED, { y: 2.28 }, 8),
  ]);

export const toyRocket = () =>
  merge([
    cyl(0.34, 0.4, 1.3, WHITE, { y: 0.3 }, 9),
    cone(0.34, 0.6, RED, { y: 1.6 }, 9),
    cyl(0.41, 0.41, 0.14, BLUE, { y: 0.8 }, 9),
    blob(0.14, 0xbfeaff, { y: 1.26, z: -0.32 }),
    torus(0.16, 0.04, YELLOW, { y: 1.26, z: -0.34, rx: PI / 2 }, 8, 3),
    cyl(0.2, 0.3, 0.3, STEEL, {}, 8),
    ...[0, 1, 2].map((i) => frustum(0.06, 0.5, 0.06, 0.2, 0.7, RED, { x: Math.cos((i * 2 * PI) / 3) * 0.44, z: Math.sin((i * 2 * PI) / 3) * 0.44, ry: -(i * 2 * PI) / 3 + PI / 2 }, 0, 0.2)),
  ]);

export const giantRobot = () =>
  merge([
    box(0.5, 0.7, 0.5, STEEL, { x: -0.34 }),
    box(0.5, 0.7, 0.5, STEEL, { x: 0.34 }),
    box(0.6, 0.14, 0.7, BLACK, { x: -0.34, z: -0.06 }),
    box(0.6, 0.14, 0.7, BLACK, { x: 0.34, z: -0.06 }),
    box(1.3, 0.8, 0.7, RED, { y: 0.7 }),
    box(0.7, 0.4, 0.05, BLACK, { y: 0.9, z: -0.36 }),
    blob(0.07, YELLOW, { x: -0.2, y: 1.1, z: -0.4 }),
    blob(0.07, GREEN, { x: 0, y: 1.1, z: -0.4 }),
    blob(0.07, BLUE, { x: 0.2, y: 1.1, z: -0.4 }),
    box(0.3, 0.3, 0.3, STEEL, { x: -0.84, y: 1.16 }),
    box(0.3, 0.3, 0.3, STEEL, { x: 0.84, y: 1.16 }),
    beam(0.24, RED, [-0.86, 1.2, 0], [-0.96, 0.6, -0.2]),
    beam(0.24, RED, [0.86, 1.2, 0], [0.96, 0.6, -0.2]),
    box(0.3, 0.2, 0.3, BLACK, { x: -0.98, y: 0.4, z: -0.24 }),
    box(0.3, 0.2, 0.3, BLACK, { x: 0.98, y: 0.4, z: -0.24 }),
    box(0.7, 0.5, 0.6, STEEL, { y: 1.56 }),
    box(0.5, 0.16, 0.05, YELLOW, { y: 1.8, z: -0.31 }),
    box(0.3, 0.06, 0.05, BLACK, { y: 1.64, z: -0.31 }),
    cyl(0.03, 0.03, 0.2, STEEL, { x: -0.2, y: 2.06 }, 4),
    cyl(0.03, 0.03, 0.2, STEEL, { x: 0.2, y: 2.06 }, 4),
    blob(0.07, RED, { x: -0.2, y: 2.3 }),
    blob(0.07, RED, { x: 0.2, y: 2.3 }),
  ]);

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
export const abcWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 18; i++) parts.push(...block(-8.5 + i, 0, 0, 1.0, PRIMARY[i % 6]));
  for (let i = 0; i < 17; i++) parts.push(...block(-8 + i, 1.0, 0, 0.9, PRIMARY[(i + 3) % 6], (i % 3) * 0.12 - 0.12));
  return merge(parts);
};

export const dominoWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 15; i++) {
    const x = -8.4 + i * 1.2;
    parts.push(box(1.0, 1.95, 0.4, BLACK, { x }), box(0.9, 0.05, 0.42, WHITE, { x, y: 0.96 }));
    const dots = (i % 6) + 1;
    for (let k = 0; k < dots; k++) parts.push(blob(0.1, WHITE, { x: x - 0.26 + (k % 3) * 0.26, y: 1.3 + Math.floor(k / 3) * 0.34, z: -0.2 }));
    for (let k = 0; k < 6 - (i % 6); k++) parts.push(blob(0.1, WHITE, { x: x - 0.26 + (k % 3) * 0.26, y: 0.3 + Math.floor(k / 3) * 0.34, z: -0.2 }));
  }
  return merge(parts);
};

export const pencilWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 26; i++) {
    const x = -8.75 + i * 0.7;
    const c = PRIMARY[i % 6];
    const h = 1.3 + ((i * 5) % 4) * 0.08;
    parts.push(cyl(0.33, 0.33, h, c, { x }, 6), cone(0.33, 0.44, 0xe8c898, { x, y: h }, 6), cone(0.12, 0.16, c, { x, y: h + 0.28 }, 6));
  }
  parts.push(box(18.4, 0.2, 0.8, 0x9a5ad6, { y: 0.5 }));
  return merge(parts);
};

export const bookWall = () => {
  const parts: Parts = [];
  let x = -9;
  for (let i = 0; x < 9; i++) {
    const w = 0.5 + ((i * 7) % 4) * 0.14;
    const h = 1.5 + ((i * 5) % 5) * 0.11;
    const c = PRIMARY[(i * 5) % 6];
    parts.push(box(w, h, 0.9, c, { x: x + w / 2 }), box(w * 0.86, h - 0.1, 0.92, WHITE, { x: x + w / 2 + 0.02, y: 0.05, z: 0.02 }));
    parts.push(box(w, 0.1, 0.05, YELLOW, { x: x + w / 2, y: h * 0.72, z: -0.45 }), box(w, 0.1, 0.05, YELLOW, { x: x + w / 2, y: h * 0.2, z: -0.45 }));
    x += w + 0.02;
  }
  return merge(parts);
};

/** The last wall of the Toy Room: a heap of pillows and cushions. */
export const pillowWall = () => {
  const parts: Parts = [];
  const tones = [0xffc0d8, 0xbfe0ff, 0xfff0a8, 0xc8f0c0, 0xe0c8ff, WHITE];
  for (let i = 0; i < 10; i++) {
    const x = -8.1 + i * 1.8;
    parts.push(speckle(blob(1.0, tones[i % 6], { x, y: 0.6, sy: 0.58, sz: 0.6 }, 1), 0.03, i + 1));
    parts.push(blob(0.08, 0x9a9aa8, { x, y: 0.62, z: -0.6 }));
  }
  for (let i = 0; i < 9; i++) {
    const x = -7.2 + i * 1.8;
    parts.push(speckle(blob(1.0, tones[(i + 3) % 6], { x, y: 1.44, sy: 0.54, sz: 0.56, rz: (i % 3) * 0.1 - 0.1 }, 1), 0.03, i + 20));
  }
  return merge(parts);
};
