/**
 * Rarer versions of every ordinary object, made from the object's own model and dressed in
 * the theme of the world it belongs to. On the Snowy Mountain that is: snowy (snow lying
 * on top), frozen (turned to ice), Christmas (strung with lights, a star on top) and
 * golden. Each world has its own four in THEMES below. The shape underneath is always the
 * ordinary object, so a rare cabin is still plainly a cabin, and it still belongs.
 *
 * (A few objects have rarer versions modelled by hand instead: objects-variants.ts.)
 */
import { Color, Vector3, type BufferGeometry } from 'three';
import type { RarityId } from './config';
import type { Variant } from './objects-variants';
import { blob, cyl, merge, spike, torus } from './shapes';

type Parts = BufferGeometry[];
const PI = Math.PI;
const TAU = PI * 2;
const GOLD = 0xf2c230;
const GOLD_DARK = 0xd9920a;
const GOLD_PALE = 0xffe07a;

type Topper = 'star' | 'cherry' | 'flower' | 'gem' | 'pearl' | 'pumpkin' | 'bow' | 'ring';

interface Theme {
  /** Uncommon: a coat of this lying on everything that faces up (one colour, or several mixed). */
  coat: { word: string; colors: number[] };
  /** Rare: the whole thing made of another material, this colour at the foot and this at the top. */
  made: { word: string; low: number; high: number; rainbow?: boolean };
  /** Super rare: dotted with these, and something on top. */
  party: { word: string; dots: number[]; top: Topper };
}

/** One per world, in the order the worlds are numbered (an object's `world`). */
const THEMES: Theme[] = [
  // 0 Snowy Mountain
  { coat: { word: 'snowy', colors: [0xf4f8fc] }, made: { word: 'frozen', low: 0x5aa8e8, high: 0xe6f8ff }, party: { word: 'Christmas', dots: [0xe2473c, 0xffd23f, 0x3f8ae8, 0x3fb85a], top: 'star' } },
  // 1 Lost World
  { coat: { word: 'mossy', colors: [0x4a9a3a, 0x6fbf5a] }, made: { word: 'fossil', low: 0xa89878, high: 0xf2ead2 }, party: { word: 'blooming', dots: [0xff7ab8, 0xfdfdfd, 0xffd23f], top: 'flower' } },
  // 2 Space
  { coat: { word: 'moon-dusted', colors: [0xc8ccd6, 0xaab0bc] }, made: { word: 'chrome', low: 0x6a7383, high: 0xf0f4fa }, party: { word: 'neon', dots: [0x5ae0ff, 0xff5ad8, 0xb8ff5a], top: 'ring' } },
  // 3 Candy World
  { coat: { word: 'iced', colors: [0xffc0dc, 0xfff0f6] }, made: { word: 'chocolate', low: 0x4a2a16, high: 0x8a5a36 }, party: { word: 'birthday', dots: [0xff5a9a, 0x5ad0ff, 0xffd23f, 0xfdfdfd], top: 'cherry' } },
  // 4 Ancient Desert
  { coat: { word: 'sandy', colors: [0xe8cf9a, 0xd8ba82] }, made: { word: 'sandstone', low: 0xa8864e, high: 0xe8d0a0 }, party: { word: 'jewelled', dots: [0x2aa6c8, 0xc8402a, 0xf2c230], top: 'gem' } },
  // 5 Under the Sea
  { coat: { word: 'weedy', colors: [0x3fae9a, 0x2f8a4a] }, made: { word: 'coral', low: 0xff6a5a, high: 0xffc8b8 }, party: { word: 'pearly', dots: [0xfdfdfd, 0xffd9e6, 0xd8f6ff], top: 'pearl' } },
  // 6 Spooky Hollow
  { coat: { word: 'cobwebbed', colors: [0xd0d0dc, 0xb8b8c8] }, made: { word: 'ghostly', low: 0x7ad8a8, high: 0xf0fff6 }, party: { word: 'haunted', dots: [0xff8a1a, 0x9a5ad6, 0x8ae04a], top: 'pumpkin' } },
  // 7 Toy Room
  { coat: { word: 'painted', colors: [0xe8402a, 0x2f7de0, 0xffd23f, 0x3fb85a] }, made: { word: 'wooden', low: 0x8a5a2a, high: 0xe0b070 }, party: { word: 'gift-wrapped', dots: [0xe8402a, 0xfdfdfd, 0x3fb85a], top: 'bow' } },
  // 8 Sky Kingdom
  { coat: { word: 'cloudy', colors: [0xf4f8ff] }, made: { word: 'rainbow', low: 0, high: 0, rainbow: true }, party: { word: 'starry', dots: [0xffd23f, 0xfdfdfd, 0x8ac8ff], top: 'star' } },
];

const _c = new Color();
const _k = new Color();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _n = new Vector3();

/** A steady pseudo-random number in 0..1 from two whole numbers. */
function rand(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Recolour every facet of a model. `paint` is given the facet's colour to change, which
 * way it faces (1 = straight up), how high it is (0 at the foot, 1 at the top) and its number.
 */
function repaint(g: BufferGeometry, paint: (c: Color, up: number, height: number, f: number) => void): void {
  const pos = g.getAttribute('position');
  const col = g.getAttribute('color');
  g.computeBoundingBox();
  const lo = g.boundingBox?.min.y ?? 0;
  const span = Math.max(1e-6, (g.boundingBox?.max.y ?? 2) - lo);
  for (let f = 0; f < pos.count / 3; f++) {
    _p0.fromBufferAttribute(pos, f * 3);
    _p1.fromBufferAttribute(pos, f * 3 + 1);
    _p2.fromBufferAttribute(pos, f * 3 + 2);
    const height = ((_p0.y + _p1.y + _p2.y) / 3 - lo) / span;
    _n.copy(_p1).sub(_p0).cross(_p2.sub(_p0)).normalize();
    for (let k = 0; k < 3; k++) {
      _c.fromBufferAttribute(col, f * 3 + k);
      paint(_c, _n.y, height, f);
      col.setXYZ(f * 3 + k, _c.r, _c.g, _c.b);
    }
  }
}

/** How light a colour is, 0..1: used to keep a model's shading when its material is swapped. */
const lightness = (c: Color): number => 0.3 * c.r + 0.5 * c.g + 0.2 * c.b;

/** Spots on the outside of a model, well spread out, each with the way the surface faces there. */
function surfaceSpots(g: BufferGeometry, want: number, gap: number): { at: Vector3; out: Vector3 }[] {
  const pos = g.getAttribute('position');
  const faces = pos.count / 3;
  const spots: { at: Vector3; out: Vector3 }[] = [];
  for (let i = 0; i < faces * 2 && spots.length < want; i++) {
    const f = Math.floor(rand(i, 7) * faces);
    _p0.fromBufferAttribute(pos, f * 3);
    _p1.fromBufferAttribute(pos, f * 3 + 1);
    _p2.fromBufferAttribute(pos, f * 3 + 2);
    const at = new Vector3().add(_p0).add(_p1).add(_p2).divideScalar(3);
    const out = new Vector3().copy(_p1).sub(_p0).cross(_p2.sub(_p0));
    if (out.lengthSq() < 1e-8) continue;
    out.normalize();
    // Not underneath, not on the ground, and not on top of another spot.
    if (out.y < -0.3 || at.y < 0.12 || spots.some((s) => s.at.distanceTo(at) < gap)) continue;
    spots.push({ at, out });
  }
  return spots;
}

/** Where the very top of a model is. */
function topOf(g: BufferGeometry): Vector3 {
  const pos = g.getAttribute('position');
  const top = new Vector3(0, -Infinity, 0);
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > top.y) top.fromBufferAttribute(pos, i);
  return top;
}

/** How big to make decorations for a model: in step with its overall size. */
function scaleOf(g: BufferGeometry): number {
  g.computeBoundingBox();
  const b = g.boundingBox;
  if (!b) return 1;
  return Math.max(0.5, Math.min(1.4, Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) / 2));
}

/** A five-pointed star standing upright with its middle at (x, y, z). */
function star(x: number, y: number, z: number, r: number, color: number): Parts {
  const parts: Parts = [blob(r * 0.6, color, { x, y, z, sz: 0.6 })];
  for (let i = 0; i < 5; i++) {
    const a = PI / 2 + (i / 5) * TAU;
    parts.push(spike(r * 0.42, r * 1.1, color, [x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, z], [Math.cos(a), Math.sin(a), 0], 4));
  }
  return parts;
}

/** What goes on top of a "party" version: `at` is the top of the model, `s` its scale. */
function topper(kind: Topper, at: Vector3, s: number): Parts {
  const { x, y, z } = at;
  switch (kind) {
    case 'star':
      return star(x, y + 0.2 * s, z, 0.2 * s, GOLD);
    case 'cherry':
      return [blob(0.13 * s, 0xe2473c, { x, y: y + 0.12 * s, z }, 1), cyl(0.012 * s, 0.012 * s, 0.14 * s, 0x3fb85a, { x, y: y + 0.22 * s, z }, 4)];
    case 'flower':
      return [
        blob(0.09 * s, 0xffd23f, { x, y: y + 0.1 * s, z }),
        ...[0, 1, 2, 3, 4].map((i) => blob(0.09 * s, 0xff7ab8, { x: x + Math.cos(i * 1.257) * 0.13 * s, y: y + 0.08 * s, z: z + Math.sin(i * 1.257) * 0.13 * s, sy: 0.5 })),
      ];
    case 'gem':
      return [blob(0.14 * s, 0x2aa6c8, { x, y: y + 0.16 * s, z, sy: 1.4 }), torus(0.1 * s, 0.03 * s, GOLD, { x, y: y + 0.04 * s, z }, 8, 4)];
    case 'pearl':
      return [blob(0.14 * s, 0xfdfdfd, { x, y: y + 0.12 * s, z }, 1), blob(0.16 * s, 0xffb0c8, { x, y: y + 0.02 * s, z, sy: 0.3 })];
    case 'pumpkin':
      return [blob(0.15 * s, 0xff8a1a, { x, y: y + 0.11 * s, z, sy: 0.8 }, 1), cyl(0.02 * s, 0.03 * s, 0.07 * s, 0x3f8a2a, { x, y: y + 0.22 * s, z }, 4)];
    case 'bow':
      return [
        blob(0.07 * s, 0xe8402a, { x, y: y + 0.08 * s, z }),
        blob(0.12 * s, 0xe8402a, { x: x - 0.14 * s, y: y + 0.1 * s, z, sy: 0.7 }),
        blob(0.12 * s, 0xe8402a, { x: x + 0.14 * s, y: y + 0.1 * s, z, sy: 0.7 }),
      ];
    default:
      return [torus(0.2 * s, 0.035 * s, 0x5ae0ff, { x, y: y + 0.12 * s, z }, 12, 4), blob(0.07 * s, 0xff5ad8, { x, y: y + 0.12 * s, z })];
  }
}

/** The four rarer versions of an ordinary object, in the theme of its world. */
export function themedVariants(base: { id: string; name: string; plural: string; build: () => BufferGeometry }, world: number): Variant[] {
  const theme = THEMES[world] ?? THEMES[0];
  const named = (rarity: RarityId, tag: string, word: string, color: number, build: () => BufferGeometry): Variant => ({
    rarity,
    id: `${base.id}_${tag}`,
    // ("extra-haunted house" reads better than "haunted haunted house".)
    name: base.name.toLowerCase().startsWith(word.toLowerCase()) ? `extra-${base.name}` : `${word} ${base.name}`,
    plural: base.plural.toLowerCase().startsWith(word.toLowerCase()) ? `extra-${base.plural}` : `${word} ${base.plural}`,
    color,
    build,
  });

  const coated = (): BufferGeometry => {
    const g = base.build();
    const coats = theme.coat.colors.map((hex) => new Color(hex));
    repaint(g, (c, up, _height, f) => {
      if (up > 0.45) c.lerp(coats[Math.floor(rand(f, 3) * coats.length) % coats.length], 0.88);
    });
    return g;
  };

  const remade = (low: number, high: number, rainbow = false): BufferGeometry => {
    const g = base.build();
    const a = new Color(low);
    const b = new Color(high);
    repaint(g, (c, _up, height) => {
      // Keep the model's own light and dark, so its details still show in the new material.
      const shade = 0.72 + 0.4 * lightness(c);
      if (rainbow) _k.setHSL(0.78 * (1 - height), 0.75, 0.6);
      else _k.copy(a).lerp(b, height);
      c.copy(_k).multiplyScalar(shade);
    });
    return g;
  };

  const partied = (): BufferGeometry => {
    const g = base.build();
    const s = scaleOf(g);
    const extra: Parts = [];
    surfaceSpots(g, 12, 0.3 * s).forEach((spot, i) => {
      const at = spot.at.addScaledVector(spot.out, 0.04 * s);
      extra.push(blob(0.065 * s, theme.party.dots[i % theme.party.dots.length], { x: at.x, y: at.y, z: at.z }));
    });
    extra.push(...topper(theme.party.top, topOf(g), s));
    return merge([g, ...extra]);
  };

  const golden = (): BufferGeometry => {
    const g = remade(GOLD_DARK, GOLD_PALE);
    const s = scaleOf(g);
    const top = topOf(g);
    const extra: Parts = star(top.x, top.y + 0.2 * s, top.z, 0.16 * s, 0xffffff);
    for (const spot of surfaceSpots(g, 5, 0.5 * s)) {
      const at = spot.at.addScaledVector(spot.out, 0.05 * s);
      extra.push(blob(0.05 * s, 0xffffff, { x: at.x, y: at.y, z: at.z }));
    }
    return merge([g, ...extra]);
  };

  return [
    named('uncommon', 'u', theme.coat.word, theme.coat.colors[0], coated),
    named('rare', 'r', theme.made.word, theme.made.rainbow ? 0xb05fd6 : theme.made.high, () => remade(theme.made.low, theme.made.high, theme.made.rainbow)),
    named('superRare', 's', theme.party.word, theme.party.dots[0], partied),
    named('mythic', 'm', 'golden', GOLD, golden),
  ];
}
