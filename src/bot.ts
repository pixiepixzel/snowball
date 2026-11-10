/**
 * A simple autopilot used for playtesting and balancing (add `?autoplay` to the URL).
 * It looks a few seconds ahead, scores a handful of lanes by what the ball would eat or
 * hit on the way there, and steers for the best one. It also knows the hazards: it heads
 * for the bridge (or jumps) when too small for a river, and hops snowploughs. It plays like a careful human, so how far it gets is a good
 * reference point when tuning config.ts.
 */
import { CONFIG } from './config';
import { laneHalfWidth } from './zones';
import type { Ball } from './ball';
import type { World, WorldObject } from './world';

export interface BotControl {
  /** Where to steer. */
  x: number;
  /** Tap to jump this frame. */
  jump: boolean;
}

const LANES = 21;
let lastTarget = 0;
let escapeSide = 0;
const control: BotControl = { x: 0, jump: false };

/** The world was shrunk by a factor k (see REBASE_LAP in zones.ts): so is what the bot remembers. */
export function rebaseBot(k: number): void {
  lastTarget *= k;
}

/** Things the ball bounces off: ordinary objects too big to absorb. */
const solid = (o: WorldObject, absorbMax: number): boolean => !o.scenery && !o.def.special && o.size >= absorbMax;

/** If something solid is right in front of the ball, find the nearest way round it. */
function escape(ball: Ball, world: World, lim: number, absorbMax: number): number | null {
  const r = ball.r;
  const blockers: WorldObject[] = [];
  let blocked = false;
  for (const o of world.objects) {
    if (!solid(o, absorbMax)) continue;
    const dd = o.d - ball.d;
    const reach = r * CONFIG.CONTACT_REACH + o.fp;
    if (dd < -reach || dd > reach + 4 * r) continue;
    blockers.push(o);
    if (dd > 0 && dd < reach + 0.6 * r && Math.abs(o.x - ball.x) < reach) blocked = true;
  }
  if (!blocked) {
    escapeSide = 0;
    return null;
  }
  const route = (side: number): number | null => {
    let x = ball.x;
    for (let pass = 0; pass < 6; pass++) {
      let moved = false;
      for (const o of blockers) {
        const clear = r * CONFIG.CONTACT_REACH + o.fp + 0.25 * r;
        if (Math.abs(o.x - x) < clear) {
          x = o.x + side * clear;
          moved = true;
        }
      }
      if (!moved) break;
    }
    return Math.abs(x) <= lim ? x : null;
  };
  const right = route(1);
  const left = route(-1);
  // Stick with a side once chosen so the bot doesn't dither.
  if (escapeSide > 0 && right !== null) return right;
  if (escapeSide < 0 && left !== null) return left;
  if (right === null && left === null) return null;
  if (left === null || (right !== null && Math.abs(right - ball.x) <= Math.abs(left - ball.x))) {
    escapeSide = 1;
    return right;
  }
  escapeSide = -1;
  return left;
}

export function botControl(ball: Ball, world: World): BotControl {
  const C = CONFIG;
  const r = ball.r;
  const look = 34 * r;
  const speed = Math.max(0.1, ball.cruiseSpeed());
  const lim = Math.max(0, laneHalfWidth(ball.d) - r);
  const absorbMax = r * C.ABSORB_RATIO * 0.97;
  const lateral = C.STEER_MAX_SPEED * r * 0.55;
  control.jump = false;

  // --- Hazards that need a decision of their own.
  let riverTarget: number | null = null;
  for (const o of world.objects) {
    const special = o.def.special;
    const dd = o.d - ball.d;
    if (special === 'river' && o.state === 0 && r < o.need && dd > -o.fp && dd < 20 * r) {
      // Too small to freeze it: make for the bridge...
      riverTarget = o.aux;
      // ...and if we are not going to make it, jump at the bank.
      const toBank = dd - o.fp;
      if (Math.abs(ball.x - o.aux) > o.aux2 * 0.85 && toBank < speed * 0.06 && toBank > -r) control.jump = true;
    } else if (special === 'plough' && o.size >= absorbMax && dd > 0) {
      // A plough closing in on our line: hop it.
      const closing = speed + o.speed;
      const reach = r * C.CONTACT_REACH + o.fp;
      if (Math.abs(o.x - ball.x) < reach && dd - reach < closing * 0.16) control.jump = true;
    }
  }
  if (riverTarget !== null) {
    lastTarget = riverTarget;
    control.x = riverTarget;
    return control;
  }

  const way = escape(ball, world, lim, absorbMax);
  if (way !== null) {
    lastTarget = way;
    control.x = way;
    return control;
  }

  let best = ball.x;
  let bestScore = -Infinity;
  for (let k = 0; k < LANES; k++) {
    const cx = -lim + (2 * lim * k) / (LANES - 1);
    const shift = cx - ball.x;
    // Small cost for moving, small bonus for staying with the previous decision.
    let score = -Math.abs(shift / r) * 0.12 - Math.min(1, Math.abs(cx - lastTarget) / r) * 0.6;
    for (const o of world.objects) {
      if (o.scenery) continue;
      const special = o.def.special;
      if (special && special !== 'plough') continue;
      const dd = o.d - ball.d;
      if (dd < -r || dd > look) continue;
      const t = Math.max(0, dd) / (speed + o.speed);
      // Where the ball would actually be by the time it gets there.
      const reach = lateral * t + 0.3 * r;
      const at = Math.abs(shift) <= reach ? cx : ball.x + Math.sign(shift) * reach;
      const off = Math.abs(o.x - at);
      const w = 1 / (0.4 + t);
      if (o.size < absorbMax) {
        if (off < r * 0.8 + o.fp) score += w * (Math.pow(o.size / r, 3) * 14 + 0.05);
      } else if (off < r * 0.95 + o.fp + 0.4 * r) {
        score -= w * 9;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = cx;
    }
  }
  lastTarget = best;
  control.x = best;
  return control;
}
