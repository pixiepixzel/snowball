/**
 * Spawn patterns. The slope is cut into "beats" (about 1.5 s of rolling each) and every
 * beat is filled by one hand-designed pattern, so the player is always reading a small
 * decision — a trail to follow, a gap to thread, a prize guarded by something nasty —
 * rather than wading through random clutter.
 *
 * Patterns never name objects. They ask for a tier and the world picks whatever fits the
 * zone at that spot:
 *   crumb    easy filler            food     solid growth
 *   target   "almost absorbable"    obstacle too big, dodge it
 *
 * Coordinates: u is across the lane (-1 = left edge, +1 = right edge), v is along the
 * beat (0 = start, 1 = end). `putAt` takes x in metres from the lane centre instead of u.
 */
import type { ObjectDef } from './objects';
import { clamp, smoothstep } from './util';

export type Tier = 'crumb' | 'food' | 'target' | 'obstacle';

export interface Choice {
  def: ObjectDef;
  size: number;
  /** Footprint radius in metres. */
  fp: number;
  tier: Tier;
}

export interface Placed {
  x: number;
  d: number;
  fp: number;
  obstacle: boolean;
  /** A kept-clear circle rather than an object: obstacles may not be placed in it. */
  reserved?: boolean;
}

export interface Beat {
  /** Design ball radius here (m). Use it as the unit for spacing. */
  R: number;
  /** Lane half-width (m). */
  hw: number;
  /** Beat length (m). */
  len: number;
  rng: () => number;
  pick(tier: Tier): Choice | null;
  spawn(choice: Choice, x: number, v: number): Placed | null;
  put(tier: Tier, u: number, v: number): Placed | null;
  putAt(tier: Tier, x: number, v: number): Placed | null;
  /** Keep a circle (x in metres, radius in metres) free of obstacles, so a route stays open. */
  reserve(x: number, v: number, radius: number): void;
}

type PatternFn = (b: Beat) => void;

const rnd = (b: Beat, lo: number, hi: number) => lo + (hi - lo) * b.rng();
const sign = (b: Beat) => (b.rng() < 0.5 ? -1 : 1);

/** Opening beats: a straight breadcrumb line so the first seconds teach the game. */
const intro: PatternFn = (b) => {
  const drift = rnd(b, -0.35, 0.35);
  for (let i = 0; i < 6; i++) b.put('crumb', (drift * i) / 5, 0.12 + i * 0.14);
  b.put('food', drift, 0.97);
  b.put('crumb', -drift - 0.4, 0.5);
  b.put('crumb', -drift + 0.45, 0.75);
};

/** A curving trail of snacks that leads to a prize, with trouble beside the path. */
const trail: PatternFn = (b) => {
  const u0 = rnd(b, -0.75, 0.75);
  let u1 = rnd(b, -0.75, 0.75);
  if (Math.abs(u1 - u0) < 0.4) u1 = clamp(u0 + 0.65 * sign(b), -0.8, 0.8);
  const at = (v: number) => u0 + (u1 - u0) * smoothstep(0, 0.85, v);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const v = 0.04 + (0.76 * i) / (n - 1);
    b.put(i % 3 === 2 ? 'food' : 'crumb', at(v), v);
  }
  b.put('target', u1, 0.95);
  const k = b.rng() < 0.55 ? 2 : 1;
  for (let j = 0; j < k; j++) {
    const v = rnd(b, 0.2, 0.8);
    b.put('obstacle', clamp(at(v) + sign(b) * rnd(b, 0.4, 0.7), -1, 1), v);
  }
};

/** A wall across the slope with one gap; the good stuff sits in and behind the gap. */
const gate: PatternFn = (b) => {
  const { R, hw } = b;
  const v = 0.55;
  const gapHalf = R * rnd(b, 2.0, 2.7);
  const gx = rnd(b, -0.65, 0.65) * Math.max(0, hw - gapHalf);
  b.reserve(gx, v, gapHalf);
  b.reserve(gx, v - 0.2, gapHalf);
  b.reserve(gx, v + 0.2, gapHalf);
  let x = -hw + b.rng() * R;
  let count = 0;
  // Wall pieces stay modest: a ball too fat for the gap is then big enough to eat them,
  // so a gate can never be a dead end.
  const wallPiece = () => {
    for (let i = 0; i < 6; i++) {
      const c = b.pick('obstacle');
      if (c && c.size <= 2.2 * R) return c;
    }
    return null;
  };
  while (x < hw && count < 7) {
    const c = wallPiece();
    if (!c) break;
    const cx = x + c.fp;
    if (cx + c.fp > gx - gapHalf && x < gx + gapHalf) {
      x = gx + gapHalf;
      continue;
    }
    if (cx > hw) break;
    b.spawn(c, cx, v + rnd(b, -0.04, 0.04));
    count++;
    x = cx + c.fp + R * rnd(b, 0.3, 1.3);
  }
  b.putAt('crumb', gx, 0.12);
  b.putAt('food', gx, 0.3);
  b.putAt('food', gx, v);
  b.putAt('crumb', gx, 0.74);
  b.putAt('target', gx + rnd(b, -1, 1) * R, 0.93);
};

/** Left, right, left: obstacles on alternating sides with food on the open side. */
const slalom: PatternFn = (b) => {
  const s = sign(b);
  const vs = [0.1, 0.44, 0.78];
  vs.forEach((v, i) => {
    const side = i % 2 === 0 ? s : -s;
    b.put('obstacle', side * rnd(b, 0.15, 0.4), v);
    b.put('food', -side * rnd(b, 0.3, 0.55), v);
    b.put('crumb', -side * 0.1, v + 0.17);
  });
  b.put('target', -s * 0.15, 0.99);
};

/** Little heaps of food. One heap hides a prize but has a guard just uphill of it. */
const clusters: PatternFn = (b) => {
  const { R, hw, len } = b;
  const n = b.rng() < 0.4 ? 3 : 2;
  const guarded = Math.floor(b.rng() * n);
  for (let i = 0; i < n; i++) {
    const cv = 0.14 + (0.72 * (i + 0.5)) / n;
    const cx = rnd(b, -0.8, 0.8) * Math.max(0, hw - 3 * R);
    const centre = b.putAt(i === guarded ? 'target' : 'food', cx, cv);
    const ring = 1.5 * R + (centre ? centre.fp : 0);
    const k = 4 + Math.floor(b.rng() * 2);
    const a0 = b.rng() * 6.283;
    for (let j = 0; j < k; j++) {
      const a = a0 + (j * 6.283) / k;
      b.putAt(b.rng() < 0.3 ? 'food' : 'crumb', cx + Math.cos(a) * ring, cv + (Math.sin(a) * ring) / len);
    }
    if (i === guarded) {
      const c = b.pick('obstacle');
      if (c) b.spawn(c, cx + sign(b) * rnd(b, 0.3, 1.2) * R, cv - (ring + c.fp + 1.4 * R) / len);
    }
  }
};

/** A divider down the middle: a safe side of crumbs or a risky side of prizes. */
const fork: PatternFn = (b) => {
  const s = sign(b);
  for (const v of [0.18, 0.45, 0.72]) b.put('obstacle', rnd(b, -0.08, 0.08), v);
  for (let i = 0; i < 6; i++) b.put('crumb', -s * rnd(b, 0.42, 0.72), 0.08 + i * 0.16);
  b.put('target', s * 0.5, 0.3);
  b.put('food', s * 0.38, 0.52);
  b.put('target', s * 0.6, 0.76);
  b.put('obstacle', s * 0.88, 0.55);
};

/** Thread the needle: a prize standing between two obstacles. */
const prize: PatternFn = (b) => {
  const { R, hw } = b;
  const x0 = rnd(b, -0.55, 0.55) * Math.max(0, hw - 4 * R);
  b.putAt('crumb', x0, 0.14);
  b.putAt('crumb', x0, 0.28);
  b.putAt('food', x0, 0.42);
  b.putAt('target', x0, 0.64);
  for (const side of [-1, 1]) {
    const c = b.pick('obstacle');
    if (c) b.spawn(c, x0 + side * (c.fp + R * rnd(b, 1.7, 2.1)), 0.64 + rnd(b, -0.04, 0.04));
  }
  b.reserve(x0, 0.64, 1.6 * R);
  b.reserve(x0, 0.4, 1.6 * R);
  const far = x0 > 0 ? -1 : 1;
  b.put('food', far * 0.8, 0.35);
  b.put('crumb', far * 0.7, 0.55);
  b.put('crumb', far * 0.85, 0.75);
};

/** A slanted wall that funnels the ball to one side, with a crumb line showing the way. */
const diagonal: PatternFn = (b) => {
  const s = sign(b);
  for (let i = 0; i < 4; i++) {
    const u = s * (-0.85 + 0.4 * i);
    const v = 0.15 + i * 0.19;
    b.put('obstacle', u, v);
    b.put(i % 2 ? 'food' : 'crumb', clamp(u + s * 0.42, -1, 1), v + 0.02);
  }
  b.put('target', s * 0.75, 0.95);
  b.put('food', -s * 0.7, 0.9);
};

/** A breather: loose mix with a little of everything. */
const scatter: PatternFn = (b) => {
  for (let i = 0; i < 9; i++) {
    const t = b.rng();
    const tier: Tier = t < 0.45 ? 'crumb' : t < 0.75 ? 'food' : t < 0.88 ? 'target' : 'obstacle';
    b.put(tier, rnd(b, -1, 1), rnd(b, 0.02, 0.98));
  }
};

/** A reward: a field of food and no danger. Also opens every new zone. */
const feast: PatternFn = (b) => {
  for (let row = 0; row < 5; row++) {
    const v = 0.08 + row * 0.2;
    const off = row % 2 ? 0.25 : 0;
    for (let col = 0; col < 3; col++) {
      const u = -0.5 + col * 0.5 + off - 0.12;
      b.put(b.rng() < 0.45 ? 'food' : 'crumb', u + rnd(b, -0.08, 0.08), v + rnd(b, -0.04, 0.04));
    }
  }
  b.put('target', rnd(b, -0.3, 0.3), 0.55);
};

interface PatternDef {
  name: string;
  weight: number;
  fn: PatternFn;
}

/** Relative frequency of each pattern. Raise a weight to see more of it. */
export const PATTERNS: PatternDef[] = [
  { name: 'trail', weight: 2.5, fn: trail },
  { name: 'clusters', weight: 2, fn: clusters },
  { name: 'prize', weight: 2.5, fn: prize },
  { name: 'scatter', weight: 1, fn: scatter },
  { name: 'slalom', weight: 3, fn: slalom },
  { name: 'gate', weight: 3, fn: gate },
  { name: 'fork', weight: 2, fn: fork },
  { name: 'diagonal', weight: 2.5, fn: diagonal },
  { name: 'feast', weight: 0.4, fn: feast },
];

export const INTRO_PATTERN: PatternDef = { name: 'intro', weight: 0, fn: intro };
export const FEAST_PATTERN: PatternDef = PATTERNS[PATTERNS.length - 1];

/** Weighted random pattern, never the same one twice in a row. */
export function pickPattern(rng: () => number, previous: string): PatternDef {
  let total = 0;
  for (const p of PATTERNS) if (p.name !== previous) total += p.weight;
  let t = rng() * total;
  for (const p of PATTERNS) {
    if (p.name === previous) continue;
    t -= p.weight;
    if (t <= 0) return p;
  }
  return PATTERNS[0];
}
