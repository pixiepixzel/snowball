/**
 * The three rare secret objects. They can turn up in any world.
 * Same conventions as objects.ts: 1 unit = the object's size, standing on y = 0, about
 * 2 units tall, front facing -Z.
 */
import type { BufferGeometry } from 'three';
import { beam, blob, box, cone, cyl, grade, merge, speckle, spike, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;

const FUR = 0xd6e8ff;
const FUR_SHADE = 0xa8c4ea;
const ICE = 0x6ac8f0;
const GOLD = 0xffc92e;
const PALE_GOLD = 0xfff0a0;
const DEEP_GOLD = 0xe0981a;
const SAUCER = 0xb8c2d2;
const BEAM = 0x8affb0;

/** A yeti, arms up and roaring. Absorb it for a rage that smashes through anything. */
export const yeti = () =>
  merge([
    speckle(blob(0.62, FUR, { y: 0.86, sy: 1.15 }, 1), 0.05),
    speckle(blob(0.44, FUR, { y: 1.62 }, 1), 0.05, 2),
    // Face: an icy blue mask with eyes, brows and a roaring mouth.
    blob(0.3, ICE, { y: 1.58, z: -0.26, sx: 1.1, sy: 0.95 }, 1),
    blob(0.06, 0x16222e, { x: -0.13, y: 1.66, z: -0.52 }),
    blob(0.06, 0x16222e, { x: 0.13, y: 1.66, z: -0.52 }),
    beam(0.05, 0x16222e, [-0.26, 1.8, -0.5], [-0.06, 1.72, -0.54]),
    beam(0.05, 0x16222e, [0.26, 1.8, -0.5], [0.06, 1.72, -0.54]),
    box(0.26, 0.14, 0.06, 0x16222e, { y: 1.38, z: -0.5 }),
    spike(0.04, 0.1, FUR, [-0.08, 1.5, -0.54], [0, -1, 0], 3),
    spike(0.04, 0.1, FUR, [0.08, 1.5, -0.54], [0, -1, 0], 3),
    // Horns.
    spike(0.09, 0.34, ICE, [-0.3, 1.9, 0], [-0.5, 1, 0], 5),
    spike(0.09, 0.34, ICE, [0.3, 1.9, 0], [0.5, 1, 0], 5),
    // Arms raised, with big paws.
    beam(0.26, FUR_SHADE, [-0.5, 1.3, 0], [-0.98, 1.86, -0.1]),
    beam(0.26, FUR_SHADE, [0.5, 1.3, 0], [0.98, 1.86, -0.1]),
    blob(0.24, FUR, { x: -1.02, y: 1.98, z: -0.12 }, 1),
    blob(0.24, FUR, { x: 1.02, y: 1.98, z: -0.12 }, 1),
    // Legs and feet.
    box(0.36, 0.5, 0.4, FUR_SHADE, { x: -0.28 }),
    box(0.36, 0.5, 0.4, FUR_SHADE, { x: 0.28 }),
    box(0.44, 0.16, 0.6, ICE, { x: -0.28, z: -0.1 }),
    box(0.44, 0.16, 0.6, ICE, { x: 0.28, z: -0.1 }),
    blob(0.36, FUR, { y: 0.8, z: -0.36, sy: 1.2 }, 1),
  ]);

/** A golden snowflake. Absorb it for a pile of coins. */
export const goldenSnowflake = () => {
  const parts: Parts = [blob(0.3, PALE_GOLD, { y: 1.0 }, 1)];
  for (let i = 0; i < 6; i++) {
    const a = (i * PI) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // One arm in the plane facing the player, with two barbs and a jewel at the tip.
    parts.push(beam(0.13, i % 2 ? GOLD : DEEP_GOLD, [0, 1.0, 0], [c * 0.95, 1.0 + s * 0.95, 0], 0.16));
    for (const side of [-1, 1]) {
      const b = a + side * 0.9;
      parts.push(beam(0.09, GOLD, [c * 0.55, 1.0 + s * 0.55, 0], [c * 0.55 + Math.cos(b) * 0.34, 1.0 + s * 0.55 + Math.sin(b) * 0.34, 0], 0.12));
    }
    parts.push(blob(0.12, PALE_GOLD, { x: c * 0.98, y: 1.0 + s * 0.98 }));
  }
  parts.push(torus(0.42, 0.05, PALE_GOLD, { y: 1.0, rx: PI / 2 }, 12, 4));
  return merge(parts);
};

/** A flying saucer with its beam on. Absorb it and the beam drags everything small to you. */
export const secretUfo = () => {
  const parts: Parts = [
    // The beam: a pale green cone from the saucer down to the ground.
    grade(cone(0.7, 1.2, 0xffffff, {}, 9), 0xd8ffe4, BEAM),
    blob(1.0, SAUCER, { y: 1.42, sy: 0.24 }, 1),
    cyl(0.5, 0.86, 0.14, 0x8a94a6, { y: 1.5 }, 12),
    blob(0.46, 0x9af0ff, { y: 1.66, sy: 0.8 }, 1),
    cyl(0.5, 0.3, 0.12, 0x6a7486, { y: 1.22 }, 10),
    torus(0.98, 0.05, 0x6a7486, { y: 1.42 }, 14, 4),
    blob(0.1, 0x3fb85a, { y: 1.74, z: -0.3 }),
  ];
  for (let i = 0; i < 8; i++) {
    const a = (i * PI) / 4;
    parts.push(blob(0.09, i % 2 ? 0xffe23a : 0xff5a5a, { x: Math.cos(a) * 0.86, y: 1.4, z: Math.sin(a) * 0.86 }));
  }
  return merge(parts);
};
