/**
 * Models for the Sky Kingdom: clouds, balloons, flying machines and floating islands.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { bands, beam, blob, box, cone, cyl, frustum, grade, merge, prism, rodX, rodZ, speckle, spike, taper, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const CLOUD = 0xffffff;
const SHADE = 0xdce8f6;
const STORM = 0x5a6478;
const BOLT = 0xffe23a;
const RED = 0xe8402a;
const BLUE = 0x3f8ae8;
const YELLOW = 0xffd23f;
const GREEN = 0x4ab85a;
const ORANGE = 0xff8a2a;
const PURPLE = 0x9a5ad6;
const WOOD = 0x9a6a3a;
const STEEL = 0xb0bac8;
const DARK = 0x2a3040;
const GOLD = 0xf2c230;
const MARBLE = 0xf0f0f6;
const RAINBOW = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE];

/** A puffy cloud: lumps of radius ~r spread over width w, centred on (x, y, z). */
const puffs = (x: number, y: number, z: number, w: number, r: number, color = CLOUD, shade = SHADE): Parts => {
  const parts: Parts = [];
  const n = Math.max(3, Math.round(w / (r * 0.8)));
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const rr = r * (1 - Math.abs(t) * 0.7) * (0.9 + (i % 2) * 0.2);
    parts.push(blob(rr, i % 3 ? color : shade, { x: x + t * w, y: y + rr * 0.3, z: z + (i % 2 ? 0.12 : -0.12) * r }, 1));
  }
  parts.push(blob(r * 0.8, shade, { x, y: y - r * 0.1, z, sx: (w / r) * 0.5, sy: 0.4 }, 1));
  return parts;
};

/** A zigzag lightning bolt from (x, top) down to (x, bottom). */
const bolt = (x: number, top: number, bottom: number, z = 0, w = 0.2): Parts => {
  const mid = (top + bottom) / 2;
  return [beam(w, BOLT, [x + w, top, z], [x - w, mid, z], w * 0.4), beam(w, BOLT, [x - w, mid, z], [x + w * 1.2, mid + (top - bottom) * 0.08, z], w * 0.4), beam(w * 0.8, BOLT, [x + w * 1.2, mid + (top - bottom) * 0.08, z], [x - w * 0.4, bottom, z], w * 0.3)];
};

// ------------------------------------------------------------------ small things
export const feather = () => {
  const parts: Parts = [taper(0.04, 0.02, MARBLE, [0, 0.2, 0.9], [0, 0.9, -0.9], 4)];
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const p: [number, number, number] = [0, 0.4 + t * 0.5, 0.5 - t * 1.3];
    parts.push(spike(0.12, 0.5 - t * 0.2, i % 2 ? 0x8ac8ff : 0xbfe0ff, p, [1, 0.3, -0.5], 3), spike(0.12, 0.5 - t * 0.2, i % 2 ? 0xbfe0ff : 0x8ac8ff, p, [-1, 0.3, -0.5], 3));
  }
  return merge(parts);
};

export const paperPlane = () =>
  merge([
    // A flat dart pointing downhill, with a keel underneath and a fold line on top.
    cone(0.85, 1.9, 0xbcd8ff, { y: 0.5 - 0.95, rx: -PI / 2, sz: 0.14 }, 3),
    cone(0.3, 1.7, 0x8ab4ee, { y: 0.34 - 0.85, z: 0.05, rx: -PI / 2, sx: 0.2, sz: 0.9 }, 3),
    box(0.05, 0.04, 1.5, BLUE, { y: 0.55, z: 0.1 }),
    box(1.0, 0.04, 0.08, RED, { y: 0.55, z: 0.6 }),
  ]);

/** A cloud. `w` is how wide, `r` how plump. */
export const cloud = (w: number, r: number) => () =>
  merge([
    // Strong blue shading and a grey-blue underside, so it shows up on white ground.
    ...puffs(0, r * 0.55, 0, w, r, 0xffffff, 0xc6d9f4),
    blob(r * 0.8, 0x9fbce6, { y: r * 0.3, sx: (w / r) * 0.55, sy: 0.3 }, 1),
  ]);

export const kite = () =>
  merge([
    cone(1.0, 0.08, RED, { y: 0.1, ry: PI / 4, sz: 1.3, sx: 0.8 }, 4),
    box(0.06, 0.1, 2.0, WOOD, { y: 0.1 }),
    box(1.5, 0.1, 0.06, WOOD, { y: 0.1, z: -0.2 }),
    cone(0.5, 0.1, YELLOW, { y: 0.12, z: -0.3, ry: PI / 4, sz: 1.3, sx: 0.8 }, 4),
    taper(0.02, 0.02, DARK, [0, 0.12, 1.2], [0.3, 0.1, 1.8], 3),
    box(0.2, 0.04, 0.1, BLUE, { x: 0.12, y: 0.1, z: 1.44 }),
    box(0.2, 0.04, 0.1, GREEN, { x: 0.26, y: 0.1, z: 1.72 }),
  ]);

/** The sky's early hazard: a lightning bolt stuck in the ground. */
export const thunderbolt = () => merge([...bolt(0, 2.2, 0.1, 0, 0.34), blob(0.4, 0xfff4a0, { y: 0.14, sy: 0.3 }, 1), spike(0.1, 0.4, BOLT, [0.3, 0.1, 0.1], [1, 1, 0.3], 3), spike(0.1, 0.36, BOLT, [-0.3, 0.1, -0.1], [-1, 1, -0.2], 3)]);

export const bird = () =>
  merge([
    blob(0.44, 0x4a9ae8, { y: 0.64, sz: 1.2 }, 1),
    blob(0.3, 0x4a9ae8, { y: 1.08, z: -0.36 }, 1),
    blob(0.3, MARBLE, { y: 0.54, z: -0.2, sy: 0.8 }, 1),
    spike(0.1, 0.26, ORANGE, [0, 1.06, -0.62], [0, -0.1, -1], 4),
    blob(0.05, DARK, { x: -0.14, y: 1.16, z: -0.56 }),
    blob(0.05, DARK, { x: 0.14, y: 1.16, z: -0.56 }),
    box(0.1, 0.4, 0.6, 0x2f7ad0, { x: -0.44, y: 0.5, rz: 0.2 }),
    box(0.1, 0.4, 0.6, 0x2f7ad0, { x: 0.44, y: 0.5, rz: -0.2 }),
    spike(0.2, 0.5, 0x2f7ad0, [0, 0.6, 0.5], [0, 0.3, 1], 3),
    cyl(0.03, 0.03, 0.26, ORANGE, { x: -0.14 }, 4),
    cyl(0.03, 0.03, 0.26, ORANGE, { x: 0.14 }, 4),
    spike(0.1, 0.26, 0x2f7ad0, [0, 1.32, -0.3], [0, 1, 0.6], 3),
  ]);

export const hangGlider = () =>
  merge([
    frustum(2.0, 0.1, 0.1, 0.04, 0.06, YELLOW, { y: 0.5, z: 0.5 }, 0, -1.3),
    box(0.05, 0.05, 1.5, STEEL, { y: 0.48, z: -0.1 }),
    box(0.5, 0.05, 0.5, RED, { y: 0.52, z: 0.3 }),
    beam(0.03, STEEL, [-0.3, 0.48, 0], [0, 0.04, -0.1]),
    beam(0.03, STEEL, [0.3, 0.48, 0], [0, 0.04, -0.1]),
    rodX(0.03, 0.6, STEEL, 0, 0.06, -0.1, 4),
  ]);

export const rainbow = () => {
  const parts: Parts = [...puffs(-0.86, 0.1, 0, 0.7, 0.3), ...puffs(0.86, 0.1, 0, 0.7, 0.3)];
  for (let band = 0; band < 6; band++) {
    const r = 0.96 - band * 0.09;
    for (let i = 0; i < 8; i++) {
      const a0 = (i * PI) / 8;
      const a1 = ((i + 1) * PI) / 8;
      parts.push(beam(0.1, RAINBOW[band], [Math.cos(a0) * r, 0.2 + Math.sin(a0) * r, 0], [Math.cos(a1) * r, 0.2 + Math.sin(a1) * r, 0], 0.26));
    }
  }
  return merge(parts);
};

/** One balloon on a string. */
export const balloon = (color: number) => () =>
  merge([
    cyl(0.14, 0.18, 0.1, WOOD, {}, 6),
    taper(0.015, 0.015, DARK, [0, 0.1, 0], [0.06, 1.1, 0], 3),
    blob(0.56, color, { x: 0.06, y: 1.6, sy: 1.2 }, 1),
    cone(0.1, 0.12, color, { x: 0.06, y: 0.96, rx: PI }, 5),
    blob(0.12, 0xffffff, { x: -0.14, y: 1.86, z: -0.36 }),
  ]);

export const balloonBunch = () => {
  const parts: Parts = [cyl(0.2, 0.26, 0.14, WOOD, {}, 6)];
  const at: [number, number, number][] = [
    [0, 1.7, 0],
    [-0.44, 1.4, 0.1],
    [0.44, 1.44, -0.1],
    [-0.2, 1.3, -0.4],
    [0.22, 1.24, 0.4],
    [0, 1.1, 0],
  ];
  at.forEach(([x, y, z], i) => {
    parts.push(taper(0.012, 0.012, DARK, [0, 0.14, 0], [x, y - 0.3, z], 3));
    parts.push(blob(0.36, RAINBOW[i], { x, y, z, sy: 1.2 }, 1));
  });
  return merge(parts);
};

export const windsock = () =>
  merge([
    cyl(0.05, 0.07, 2.0, STEEL, {}, 5),
    box(0.4, 0.1, 0.4, STEEL, {}),
    torus(0.2, 0.03, STEEL, { x: 0.22, y: 1.8, rz: PI / 2 }, 8, 3),
    ...[0, 1, 2, 3, 4].map((i) => taper(0.2 - i * 0.03, 0.17 - i * 0.03, i % 2 ? MARBLE : ORANGE, [0.22 + i * 0.26, 1.8 - i * 0.03, 0], [0.48 + i * 0.26, 1.77 - i * 0.03, 0], 7)),
  ]);

export const hotAirBalloon = () =>
  merge([
    bands(blob(0.85, 0xffffff, { y: 1.3, sy: 1.1 }, 2), [RED, YELLOW, RED, YELLOW, RED, YELLOW, RED]),
    cyl(0.4, 0.2, 0.3, 0xc82a1a, { y: 0.3 }, 8),
    box(0.44, 0.3, 0.44, WOOD, {}),
    box(0.48, 0.05, 0.48, 0x7a5232, { y: 0.28 }),
    beam(0.02, DARK, [-0.2, 0.3, -0.2], [-0.3, 0.6, -0.3]),
    beam(0.02, DARK, [0.2, 0.3, -0.2], [0.3, 0.6, -0.3]),
    beam(0.02, DARK, [-0.2, 0.3, 0.2], [-0.3, 0.6, 0.3]),
    beam(0.02, DARK, [0.2, 0.3, 0.2], [0.3, 0.6, 0.3]),
  ]);

/** An airship. Colours make it a small blimp or a grand airship. */
export const blimp = (hull: number, stripe: number, big: boolean) => () => {
  const parts: Parts = [
    blob(0.6, hull, { y: 1.1, sz: 1.75, sx: 0.95 }, 2),
    cyl(0.585, 0.585, 0.16, stripe, { y: 1.1 - 0.08, z: -0.1, rx: PI / 2 }, 12),
    box(0.4, 0.26, 0.8, DARK, { y: 0.3, z: -0.1 }),
    box(0.36, 0.1, 0.7, 0xbfeaff, { y: 0.4, z: -0.12 }),
    beam(0.03, STEEL, [-0.16, 0.56, -0.3], [-0.2, 0.7, -0.3]),
    beam(0.03, STEEL, [0.16, 0.56, 0.2], [0.2, 0.7, 0.2]),
    cyl(0.04, 0.04, 0.3, STEEL, { y: 0 }, 4),
    frustum(0.05, 0.5, 0.05, 0.2, 0.5, stripe, { y: 1.3, z: 0.85 }, 0, 0.2),
    frustum(0.05, 0.5, 0.05, 0.2, 0.5, stripe, { y: 0.9, z: 0.85, rx: PI }, 0, -0.2),
    box(1.0, 0.05, 0.36, stripe, { y: 1.08, z: 0.9 }),
  ];
  if (big) parts.push(rodZ(0.14, 0.3, STEEL, -0.5, 0.5, 0.1, 6), rodZ(0.14, 0.3, STEEL, 0.5, 0.5, 0.1, 6), box(0.03, 0.5, 0.03, GOLD, { y: 1.68, z: -0.4 }), box(0.3, 0.18, 0.02, GOLD, { y: 2.0, z: -0.24, ry: PI / 2 }));
  return merge(parts);
};

/** A parachutist. The canopy is white so the game can tint it. */
export const parachutist = () => {
  const parts: Parts = [blob(0.9, 0xffffff, { y: 1.6, sy: 0.5 }, 1), cyl(0.86, 0.9, 0.1, 0xffffff, { y: 1.5 }, 10), box(0.3, 0.44, 0.22, 0x3a4a6a, { y: 0.3 }), blob(0.18, 0xe8b890, { y: 0.92 }), box(0.12, 0.34, 0.14, 0x2a3040, { x: -0.09 }), box(0.12, 0.34, 0.14, 0x2a3040, { x: 0.09 })];
  for (let i = 0; i < 6; i++) {
    const a = (i * PI) / 3;
    parts.push(beam(0.015, DARK, [Math.cos(a) * 0.8, 1.52, Math.sin(a) * 0.8], [Math.sign(Math.cos(a)) * 0.14, 0.7, 0]));
  }
  return merge(parts);
};

export const weatherVane = () =>
  merge([
    // A little roof ridge to stand on, a thick post, compass arms and a big gold arrow
    // with a rooster on top.
    prism(0.9, 0.34, 0.8, 0xb84a3a, {}),
    cyl(0.08, 0.1, 1.5, DARK, { y: 0.3 }, 6),
    rodX(0.05, 1.2, DARK, 0, 1.0, 0, 5),
    rodZ(0.05, 1.2, DARK, 0, 1.0, 0, 5),
    ...[
      [0.62, 0],
      [-0.62, 0],
      [0, 0.62],
      [0, -0.62],
    ].map(([x, z]) => blob(0.12, GOLD, { x, y: 1.0, z })),
    rodX(0.07, 1.5, GOLD, 0, 1.56, 0, 5),
    spike(0.22, 0.44, GOLD, [0.7, 1.56, 0], [1, 0, 0], 4),
    box(0.44, 0.44, 0.06, GOLD, { x: -0.74, y: 1.34 }),
    blob(0.28, RED, { y: 1.94, sz: 0.5 }, 1),
    blob(0.16, RED, { x: 0.26, y: 2.14, sz: 0.5 }),
    spike(0.07, 0.18, GOLD, [0.4, 2.12, 0], [1, -0.1, 0], 3),
    spike(0.16, 0.34, 0xc82a1a, [-0.22, 1.98, 0], [-1, 0.8, 0], 3),
    spike(0.07, 0.16, 0xc82a1a, [0.26, 2.26, 0], [0, 1, 0], 3),
  ]);

export const biplane = () =>
  merge([
    rodZ(0.26, 1.5, RED, 0, 0.7, 0, 8),
    spike(0.26, 0.5, RED, [0, 0.7, 0.75], [0, 0.1, 1], 8),
    cyl(0.28, 0.28, 0.12, DARK, { y: 0.7 - 0.06, z: -0.8, rx: PI / 2 }, 8),
    box(1.3, 0.05, 0.1, WOOD, { y: 0.68, z: -0.92, rz: 0.5 }),
    box(2.0, 0.06, 0.5, YELLOW, { y: 0.5, z: -0.2 }),
    box(2.0, 0.06, 0.5, YELLOW, { y: 1.14, z: -0.2 }),
    ...[-0.7, 0.7].flatMap((x) => [beam(0.03, WOOD, [x, 0.54, -0.36], [x, 1.14, -0.36]), beam(0.03, WOOD, [x, 0.54, -0.04], [x, 1.14, -0.04])]),
    box(0.8, 0.05, 0.3, YELLOW, { y: 0.74, z: 1.0 }),
    frustum(0.05, 0.36, 0.05, 0.14, 0.4, YELLOW, { y: 0.76, z: 1.0 }, 0, 0.1),
    blob(0.16, 0xe8b890, { y: 1.02, z: 0.16 }),
    beam(0.04, DARK, [-0.3, 0.5, -0.3], [-0.36, 0.14, -0.4]),
    beam(0.04, DARK, [0.3, 0.5, -0.3], [0.36, 0.14, -0.4]),
    rodX(0.16, 0.08, DARK, -0.38, 0.16, -0.4, 8),
    rodX(0.16, 0.08, DARK, 0.38, 0.16, -0.4, 8),
  ]);

export const windTurbine = () => {
  // A sturdy tower and three broad blades, so it doesn't vanish at a distance.
  const parts: Parts = [
    cyl(0.34, 0.42, 0.14, STEEL, {}, 8),
    taper(0.2, 0.1, MARBLE, [0, 0.14, 0], [0, 1.42, 0], 8),
    bands(cyl(0.13, 0.16, 0.24, 0xffffff, { y: 0.6 }, 8), [RED, MARBLE, RED]),
    rodZ(0.15, 0.5, 0xdce4f0, 0, 1.44, 0, 7),
    blob(0.15, RED, { y: 1.44, z: -0.32 }, 1),
  ];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * PI) / 3 + 0.4;
    const tip: [number, number, number] = [Math.cos(a) * 0.86, 1.44 + Math.sin(a) * 0.86, -0.26];
    parts.push(beam(0.2, MARBLE, [0, 1.44, -0.26], tip, 0.05));
    parts.push(blob(0.1, 0xdce4f0, { x: tip[0], y: tip[1], z: tip[2], sz: 0.4 }));
  }
  return merge(parts);
};

export const cloudHouse = () =>
  merge([
    ...puffs(0, 0.16, 0, 2.0, 0.5),
    box(1.0, 0.8, 0.9, 0xfff0c8, { y: 0.56 }),
    prism(1.1, 0.6, 1.2, BLUE, { y: 1.36, ry: PI / 2 }),
    box(0.26, 0.44, 0.05, RED, { y: 0.56, z: -0.45 }),
    box(0.22, 0.22, 0.05, 0xbfeaff, { x: -0.3, y: 0.9, z: -0.45 }),
    box(0.22, 0.22, 0.05, 0xbfeaff, { x: 0.3, y: 0.9, z: -0.45 }),
    box(0.16, 0.36, 0.16, RED, { x: 0.28, y: 1.5, z: 0.2 }),
    blob(0.13, CLOUD, { x: 0.3, y: 2.0, z: 0.2 }),
  ]);

export const helicopter = () =>
  merge([
    blob(0.5, GREEN, { y: 0.72, sz: 1.3 }, 1),
    blob(0.4, 0xbfeaff, { y: 0.76, z: -0.4, sz: 1.0 }, 1),
    taper(0.16, 0.07, GREEN, [0, 0.8, 0.5], [0, 0.96, 1.4], 6),
    frustum(0.04, 0.3, 0.04, 0.16, 0.4, GREEN, { y: 0.96, z: 1.36 }, 0, 0.1),
    rodX(0.2, 0.04, DARK, 0.1, 1.1, 1.4, 8),
    cyl(0.05, 0.05, 0.26, STEEL, { y: 1.2 }, 5),
    box(2.2, 0.03, 0.14, DARK, { y: 1.46 }),
    box(0.14, 0.03, 2.2, DARK, { y: 1.46 }),
    beam(0.04, STEEL, [-0.3, 0.4, -0.2], [-0.4, 0.06, -0.2]),
    beam(0.04, STEEL, [0.3, 0.4, -0.2], [0.4, 0.06, -0.2]),
    beam(0.04, STEEL, [-0.3, 0.4, 0.3], [-0.4, 0.06, 0.3]),
    beam(0.04, STEEL, [0.3, 0.4, 0.3], [0.4, 0.06, 0.3]),
    rodZ(0.04, 1.3, STEEL, -0.4, 0.05, 0, 4),
    rodZ(0.04, 1.3, STEEL, 0.4, 0.05, 0, 4),
  ]);

/** A storm cloud with a bolt of lightning. `angry` gives it a face: that one charges at you. */
export const thundercloud = (angry: boolean) => () => {
  const parts: Parts = [...puffs(0, 1.1, 0, 1.9, 0.62, STORM, 0x444c5e), ...bolt(0.1, 0.9, 0.0, 0, 0.16)];
  if (angry) {
    parts.push(blob(0.12, BOLT, { x: -0.3, y: 1.3, z: -0.56 }), blob(0.12, BOLT, { x: 0.3, y: 1.3, z: -0.56 }));
    parts.push(beam(0.07, DARK, [-0.5, 1.56, -0.56], [-0.16, 1.42, -0.6]), beam(0.07, DARK, [0.5, 1.56, -0.56], [0.16, 1.42, -0.6]));
    parts.push(box(0.4, 0.07, 0.05, DARK, { y: 1.02, z: -0.6 }), ...bolt(-0.6, 0.8, 0.1, 0.1, 0.12));
  }
  return merge(parts);
};

export const floatingIsland = () =>
  merge([
    speckle(cone(1.0, 1.0, 0x8a6a4a, { y: 0.0, rx: PI }, 7), 0.1),
    speckle(cyl(1.0, 1.0, 0.2, 0x5aa84a, { y: 1.0 }, 7), 0.07, 2),
    spike(0.2, 0.5, 0x7a5a3e, [0.4, 0.2, 0.2], [0.2, -1, 0.1], 5),
    cyl(0.07, 0.09, 0.4, WOOD, { x: -0.4, y: 1.2 }, 5),
    blob(0.3, GREEN, { x: -0.4, y: 1.76 }, 1),
    box(0.44, 0.34, 0.4, 0xfff0c8, { x: 0.3, y: 1.2 }),
    prism(0.5, 0.26, 0.56, RED, { x: 0.3, y: 1.54, ry: PI / 2 }),
    taper(0.05, 0.02, 0xbfeaff, [0.9, 1.1, 0], [0.96, 0.2, 0], 4),
    ...puffs(0, 0.06, 0, 1.6, 0.26),
  ]);

export const airliner = () =>
  merge([
    cyl(0.04, 0.04, 0.3, STEEL, { z: 0.1 }, 4),
    rodZ(0.3, 1.7, MARBLE, 0, 0.62, 0, 9),
    blob(0.3, MARBLE, { y: 0.62, z: -0.86, sz: 1.3 }, 1),
    spike(0.3, 0.6, MARBLE, [0, 0.62, 0.85], [0, 0.25, 1], 9),
    box(0.4, 0.1, 0.24, DARK, { y: 0.72, z: -1.0 }),
    box(0.62, 0.05, 1.5, BLUE, { y: 0.62 }),
    frustum(2.4, 0.5, 0.6, 0.2, 0.06, MARBLE, { y: 0.5, z: 0.1 }, 0, 0.3),
    frustum(0.9, 0.3, 0.3, 0.1, 0.05, MARBLE, { y: 0.74, z: 1.1 }, 0, 0.14),
    frustum(0.06, 0.5, 0.06, 0.2, 0.56, BLUE, { y: 0.84, z: 1.06 }, 0, 0.2),
    rodZ(0.11, 0.36, STEEL, -0.6, 0.4, 0.0, 7),
    rodZ(0.11, 0.36, STEEL, 0.6, 0.4, 0.0, 7),
  ]);

export const skyTower = () =>
  merge([
    ...puffs(0, 0.1, 0, 1.6, 0.42),
    cyl(0.34, 0.4, 1.3, MARBLE, { y: 0.3 }, 9),
    torus(0.42, 0.06, GOLD, { y: 0.9 }, 10, 4),
    cyl(0.46, 0.4, 0.14, MARBLE, { y: 1.6 }, 9),
    cone(0.44, 0.5, BLUE, { y: 1.74 }, 9),
    blob(0.07, GOLD, { y: 2.26 }),
    box(0.16, 0.3, 0.05, 0xbfeaff, { y: 1.1, z: -0.36 }),
    box(0.16, 0.3, 0.05, 0xbfeaff, { y: 0.5, z: -0.4 }),
  ]);

export const beanstalk = () => {
  const parts: Parts = [];
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 10; i++) pts.push([Math.sin(i * 1.2) * 0.14, i * 0.19, Math.cos(i * 1.2) * 0.14]);
  for (let i = 0; i < 10; i++) {
    parts.push(taper(0.16 - i * 0.008, 0.15 - i * 0.008, i % 2 ? GREEN : 0x3fa84c, pts[i], pts[i + 1], 6));
    if (i % 2 === 0) parts.push(spike(0.2, 0.5, 0x5ac866, pts[i + 1], [Math.cos(i * 1.9), 0.2, Math.sin(i * 1.9)], 3));
  }
  parts.push(...puffs(0, 1.86, 0, 1.2, 0.3));
  return merge(parts);
};

export const skyTemple = () => {
  const parts: Parts = [...puffs(0, 0.1, 0, 2.2, 0.44), box(1.8, 0.14, 1.4, MARBLE, { y: 0.4 }), box(1.6, 0.12, 1.2, 0xe0e0ea, { y: 0.54 })];
  for (let i = 0; i < 5; i++) parts.push(cyl(0.09, 0.11, 0.8, MARBLE, { x: -0.68 + i * 0.34, y: 0.66, z: -0.5 }, 7), cyl(0.09, 0.11, 0.8, MARBLE, { x: -0.68 + i * 0.34, y: 0.66, z: 0.5 }, 7));
  parts.push(box(1.7, 0.14, 1.3, MARBLE, { y: 1.46 }), prism(1.3, 0.4, 1.7, GOLD, { y: 1.6, ry: PI / 2 }), blob(0.2, BOLT, { y: 0.9 }, 1));
  return merge(parts);
};

export const cloudPalace = () => {
  const parts: Parts = [...puffs(0, 0.1, 0, 2.2, 0.5), box(1.2, 0.7, 0.9, MARBLE, { y: 0.4 }), box(0.3, 0.44, 0.05, GOLD, { y: 0.4, z: -0.45 })];
  const spire = (x: number, z: number, h: number, r: number, roof: number): void => {
    parts.push(grade(cyl(r * 0.9, r, h, 0xffffff, { x, y: 0.4, z }, 8), 0xdce8f6, 0xffffff), cone(r * 1.4, r * 3.2, roof, { x, y: 0.4 + h, z }, 8), blob(r * 0.3, GOLD, { x, y: 0.4 + h + r * 3.3, z }));
  };
  spire(-0.6, -0.3, 0.9, 0.2, BLUE);
  spire(0.6, -0.3, 0.9, 0.2, BLUE);
  spire(0, 0.1, 1.2, 0.28, 0xff7ab8);
  spire(-0.4, 0.4, 0.7, 0.16, PURPLE);
  spire(0.4, 0.4, 0.7, 0.16, PURPLE);
  return merge(parts);
};

// ------------------------------------------------------------------ walls (18 wide, 2 tall)
/** A bank of cloud. `storm` makes it dark and adds lightning. */
export const cloudWall = (storm: boolean) => () => {
  const parts: Parts = [];
  const a = storm ? STORM : CLOUD;
  const b = storm ? 0x444c5e : SHADE;
  for (let i = 0; i < 12; i++) {
    const x = -8.25 + i * 1.5;
    parts.push(blob(1.0, i % 2 ? a : b, { x, y: 0.8, sy: 0.85, sz: 0.6 }, 1), blob(0.74, i % 2 ? b : a, { x: x + 0.7, y: 1.46, z: 0.1, sz: 0.6 }, 1));
    if (storm && i % 2 === 0) parts.push(...bolt(x + 0.4, 1.0, 0.0, -0.5, 0.16));
  }
  return merge(parts);
};

export const buntingWall = () => {
  const parts: Parts = [];
  for (let i = 0; i < 7; i++) parts.push(cyl(0.12, 0.16, 2.0, WOOD, { x: -9 + i * 3 }, 6), blob(0.2, GOLD, { x: -9 + i * 3, y: 2.1 }, 1));
  for (const y of [1.9, 1.25, 0.6]) {
    parts.push(rodX(0.04, 18, MARBLE, 0, y, 0, 4));
    for (let i = 0; i < 30; i++) parts.push(spike(0.26, 0.5, RAINBOW[(i + Math.round(y * 3)) % 6], [-8.7 + i * 0.6, y, 0], [0, -1, 0], 3));
  }
  return merge(parts);
};

export const balloonWall = () => {
  const parts: Parts = [box(18.2, 0.2, 0.7, WOOD, {})];
  for (let i = 0; i < 18; i++) {
    const x = -8.5 + i;
    const y = 1.0 + (i % 3) * 0.3;
    parts.push(taper(0.02, 0.02, DARK, [x, 0.2, 0], [x, y - 0.4, 0], 3), blob(0.52, RAINBOW[i % 6], { x, y, sy: 1.15 }, 1), blob(0.1, 0xffffff, { x: x - 0.16, y: y + 0.24, z: -0.36 }));
  }
  return merge(parts);
};

export const rainbowWall = () => {
  const parts: Parts = [];
  for (let band = 0; band < 6; band++) parts.push(box(18.2, 0.3, 0.8 - band * 0.04, RAINBOW[5 - band], { y: band * 0.3 }));
  for (let i = 0; i < 7; i++) parts.push(...puffs(-9 + i * 3, 0.0, -0.3, 1.6, 0.4), ...puffs(-7.5 + i * 3, 1.8, 0, 1.2, 0.3));
  return merge(parts);
};
