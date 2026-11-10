/**
 * Where things are on the mountain.
 *
 * The run is endless: the seven scenes in ZONES make one lap, and after the last one the
 * lap repeats scaled up by LAP_GROWTH (the ball is ~190× bigger by then, so everything
 * else has to be too). Each lap is a different world (worlds.ts). All the functions here
 * take a distance `d` in metres from the start line and work for any lap.
 */
import { CONFIG, END_RADIUS, ZONES, type Twist } from './config';
import { worldForLap, type SceneLook, type WorldConfig } from './worlds';

/** Distance at which each scene starts, within the first lap. */
export const ZONE_START: number[] = [];
let acc = 0;
for (const z of ZONES) {
  ZONE_START.push(acc);
  acc += z.length;
}

/** Length of the first lap in metres. */
export const LAP_LENGTH = acc;
/** How much bigger each lap is than the one before. */
export const LAP_GROWTH = END_RADIUS / ZONES[0].startRadius;

/**
 * Keeping the numbers small. Every lap is 192× bigger than the last, and after about
 * eight of them the sizes overflow what a graphics card can hold (everything turns
 * black). So once the ball is past lap REBASE_LAP the game shrinks the whole world down
 * by one lap (Game.rebase) and adds one to `lapBase` instead. Nothing looks different:
 * the lap number that picks the world and the difficulty is `lap + lapBase`, and sizes
 * shown to the player are multiplied back up by displayScale().
 */
export const REBASE_LAP = 3;
let lapBase = 0;

export function setLapBase(n: number): void {
  lapBase = Math.max(0, Math.floor(n));
}

/** How many laps the world has been shrunk by so far. */
export function getLapBase(): number {
  return lapBase;
}

/** What to multiply a size in the game's own numbers by to get the size it stands for. */
export function displayScale(): number {
  return Math.pow(LAP_GROWTH, lapBase);
}

/** Where distance d ends up when the world is shrunk by one lap. Sizes are divided by LAP_GROWTH. */
export function rebaseD(d: number): number {
  return (d - LAP_LENGTH) / LAP_GROWTH;
}

/** True once d is far enough down that the world should be shrunk by a lap. */
export function needsRebase(d: number): boolean {
  return d >= lapStart(REBASE_LAP + 1);
}

export interface Place {
  /** 0 for the first mountain, 1 for the next world, ... (counts laps shrunk away too). */
  lap: number;
  /** World scale here: 1, LAP_GROWTH, LAP_GROWTH², ... (not counting laps shrunk away). */
  scale: number;
  /** Scene index within the lap (an index into ZONES). */
  zone: number;
  /** Progress through the scene, 0..1. */
  t: number;
  /** Scene coordinate within the lap: zone + t. Object spans are compared against this. */
  g: number;
  /** Where the scene starts and ends (its wall), in metres from the start line. */
  zoneStart: number;
  zoneEnd: number;
}

/** Distance at which lap n starts (n not counting laps shrunk away). */
export function lapStart(n: number): number {
  return (LAP_LENGTH * (Math.pow(LAP_GROWTH, n) - 1)) / (LAP_GROWTH - 1);
}

const _place: Place = { lap: 0, scale: 1, zone: 0, t: 0, g: 0, zoneStart: 0, zoneEnd: ZONES[0].length };

/**
 * Work out which lap and scene distance d falls in. Returns a shared object unless you
 * pass your own `out`, so copy any field you need to keep.
 */
export function locate(d: number, out: Place = _place): Place {
  const dd = Math.max(0, d);
  let lap = Math.floor(Math.log((dd * (LAP_GROWTH - 1)) / LAP_LENGTH + 1) / Math.log(LAP_GROWTH));
  // Guard against rounding right at a lap boundary.
  while (lap > 0 && dd < lapStart(lap)) lap--;
  while (dd >= lapStart(lap + 1)) lap++;
  const scale = Math.pow(LAP_GROWTH, lap);
  const start = lapStart(lap);
  const local = (dd - start) / scale;
  let zone = ZONES.length - 1;
  while (zone > 0 && local < ZONE_START[zone]) zone--;
  const t = Math.min(0.999999, (local - ZONE_START[zone]) / ZONES[zone].length);
  out.lap = lap + lapBase;
  out.scale = scale;
  out.zone = zone;
  out.t = t;
  out.g = zone + t;
  out.zoneStart = start + ZONE_START[zone] * scale;
  out.zoneEnd = start + (ZONE_START[zone] + ZONES[zone].length) * scale;
  return out;
}

/** A single number that goes up by one every scene, across laps. */
export function zoneIndexAt(d: number): number {
  const p = locate(d);
  return p.lap * ZONES.length + p.zone;
}

/** Scene coordinate within the current lap (0 .. ZONES.length). */
export function zoneCoord(d: number): number {
  return locate(d).g;
}

/** The ball radius the world is built for at distance d. */
export function designRadius(d: number): number {
  const p = locate(d);
  const r0 = ZONES[p.zone].startRadius;
  const r1 = p.zone + 1 < ZONES.length ? ZONES[p.zone + 1].startRadius : END_RADIUS;
  return (r0 + (r1 - r0) * p.t) * p.scale;
}

/** Ball radius needed to smash the wall at the end of the scene containing d. */
export function gateNeed(d: number): number {
  const p = locate(d);
  const harder = 1 + CONFIG.LAP_GATE_STEP * Math.min(p.lap, CONFIG.LAP_HARDER_UNTIL);
  return ZONES[p.zone].gateRadius * p.scale * harder * worldForLap(p.lap).twist.wall;
}

/** The world that distance d is in (hand-made ones first, then remixes for ever). */
export function worldAt(d: number): WorldConfig {
  return worldForLap(locate(d).lap);
}

/** How the scene containing d looks: its name, colours and wall. */
export function sceneLook(d: number): SceneLook {
  const p = locate(d);
  return worldForLap(p.lap).scenes[p.zone];
}

/** How the scene before the one containing d looks (for blending between scenes). */
export function previousSceneLook(d: number): SceneLook {
  const p = locate(d);
  if (p.zone > 0) return worldForLap(p.lap).scenes[p.zone - 1];
  if (p.lap === 0) return worldForLap(0).scenes[0];
  const scenes = worldForLap(p.lap - 1).scenes;
  return scenes[scenes.length - 1];
}

/** Display name of the scene containing d. */
export function sceneName(d: number): string {
  return sceneLook(d).name;
}

/** The rule change in force at distance d (NO_TWIST in the hand-made worlds). */
export function twistAt(d: number): Twist {
  return worldForLap(locate(d).lap).twist;
}

export function laneHalfWidth(d: number): number {
  return CONFIG.LANE_HALF_WIDTH_K * designRadius(d) * twistAt(d).lane;
}

/** Height of the snow surface at distance d. World Z is -d, so the slope falls away ahead. */
export function groundY(d: number): number {
  return -d * CONFIG.SLOPE;
}
