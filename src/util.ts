export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Frame-rate independent smoothing factor: `x += (target - x) * damp(rate, dt)`. */
export const damp = (rate: number, dt: number): number => 1 - Math.exp(-rate * dt);

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Small fast seeded random generator. */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 0..1 hash of two numbers. */
export function hash2(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Metres in each unit bigger than a metre, smallest first. A light year is 9.46e15 m. */
const SIZE_UNITS: [number, string][] = [
  [1e3, 'km'],
  [1e9, 'million km'],
  [1e12, 'billion km'],
  [9.461e15, 'light years'],
  [9.461e21, 'million light years'],
  [9.461e24, 'billion light years'],
  // The observable universe is about 93 billion light years across.
  [8.8e26, 'universes'],
  [8.8e32, 'million universes'],
  [8.8e35, 'billion universes'],
  [8.8e38, 'trillion universes'],
];

/**
 * Ball size as shown to the player: its diameter, as [number, unit]. Switches to
 * kilometres (and beyond) once the endless laps make the ball enormous.
 */
export function sizeParts(radius: number): [string, string] {
  const metres = radius * 2;
  let d = metres;
  let unit = 'm';
  for (const [size, name] of SIZE_UNITS) {
    if (metres < size) break;
    unit = name;
    d = metres / size;
  }
  // Past the last unit the number just keeps growing; show it as a power of ten.
  // Decimals only while they mean something: two under 1, one under 10, none from 10 up.
  const text = d < 1 ? d.toFixed(2) : d < 10 ? d.toFixed(1) : d < 1e7 ? Math.round(d).toLocaleString('en-US') : `10^${Math.floor(Math.log10(d))}`;
  return [text, unit];
}

/** Ball size as one string, e.g. "3.80 m" or "12.4 km". */
export function sizeLabel(radius: number): string {
  const [text, unit] = sizeParts(radius);
  return `${text} ${unit}`;
}
