/**
 * Ball vs world. Everything is a circle on the slope plane:
 *   - object smaller than radius × ABSORB_RATIO  → absorbed
 *   - anything else                               → solid: the ball is pushed out and
 *                                                   the game decides if it hurts
 * While the ball is in the air it sails over anything its underside clears, going by how
 * tall the model really is (see JUMP_CLEAR_K), and what it has jumped over can't hurt it.
 *
 * The special cases are the hazards: walls (smash or stop), rivers (freeze, bridge,
 * jump or sink), ramps (launch) and snowploughs (scrape).
 */
import { CONFIG } from './config';
import { PERKS } from './perks';
import type { Ball } from './ball';
import type { World, WorldObject } from './world';

export interface CollisionHandlers {
  /** `index` is the object's position in world.objects; the handler must remove it. */
  onAbsorb(o: WorldObject, index: number): void;
  /** (nx, nd) is the unit vector from the obstacle to the ball. */
  onHit(o: WorldObject, nx: number, nd: number): void;
  /** The ball reached a wall. If `smash`, the handler must remove it. */
  onGate(o: WorldObject, index: number, smash: boolean): void;
  /** The ball is in a river: big enough to freeze it, or small enough to sink. */
  onRiver(o: WorldObject, freeze: boolean): void;
  /** The ball rolled onto a ramp. */
  onRamp(o: WorldObject): void;
  /** A snowplough too big to absorb scraped past. `side` is +1 if the ball is to its right. */
  onPlough(o: WorldObject, side: number): void;
  /** The ball touched a secret object. The handler must remove it. */
  onSecret(o: WorldObject, index: number): void;
  /** During a yeti rage the ball hit something too big to absorb. The handler must remove it. */
  onSmash(o: WorldObject, index: number): void;
}

export function collide(ball: Ball, world: World, h: CollisionHandlers): void {
  const C = CONFIG;
  const objs = world.objects;
  for (let i = objs.length - 1; i >= 0; i--) {
    const o = objs[i];
    if (o === undefined || o.scenery) continue;
    const special = o.def.special;
    if (special === 'bridge') continue;
    const reachR = ball.r * C.CONTACT_REACH;
    const dd = o.d - ball.d;
    const dx = o.x - ball.x;

    if (special === 'gate') {
      const face = o.d - o.size * 0.45;
      if (dd > -o.size && ball.d + reachR >= face) {
        const smash = ball.r >= o.need;
        if (!smash) ball.d = face - reachR;
        h.onGate(o, i, smash);
      }
      continue;
    }

    if (special === 'river') {
      // In the water = centre over the band and not high enough in the air.
      if (o.state === 0 && Math.abs(dd) < o.fp && ball.h < ball.r * 0.5) {
        if (ball.r >= o.need) h.onRiver(o, true);
        else if (Math.abs(ball.x - o.aux) > o.aux2) h.onRiver(o, false);
      }
      continue;
    }

    if (special === 'ramp') {
      // Only a ball that fits on it gets launched; a huge one just rolls over the top.
      if (!ball.airborne && ball.r < o.size * 1.6 && Math.abs(dx) < o.size && dd > -o.size * 0.3 && dd < o.size * 0.9) {
        h.onRamp(o);
      }
      continue;
    }

    // The Reach upgrade stretches how far the ball reaches for what it can absorb (never for what can hurt it).
    const reach = reachR * (o.size < ball.r * C.ABSORB_RATIO ? PERKS.reach : 1) + o.fp;
    if (dd > reach || dd < -reach) continue;
    if (dx > reach || dx < -reach) continue;
    const dist2 = dx * dx + dd * dd;
    if (dist2 >= reach * reach) continue;
    // Secret objects are always collected, whatever the ball's size and even mid-jump.
    if (special === 'secret') {
      h.onSecret(o, i);
      continue;
    }
    // In the air: does the ball really touch it? The ball is round, so over the top of
    // something it only touches what its underside reaches. Anything it gets over is
    // marked cleared, and can't hurt it on the way down the far side.
    if (ball.airborne) {
      const top = o.top * C.JUMP_CLEAR_K;
      const centre = ball.h + ball.r;
      let over = ball.h >= top;
      if (!over && centre > top) {
        // The ball's middle is above it: only the part of the ball below the top counts.
        const rise = centre - top;
        const under = Math.sqrt(Math.max(0, ball.r * ball.r - rise * rise)) * C.CONTACT_REACH + o.fp;
        over = dist2 >= under * under;
      }
      if (over) {
        o.cleared = true;
        continue;
      }
    }

    if (o.size < ball.r * C.ABSORB_RATIO) {
      h.onAbsorb(o, i);
    } else if (o.cleared) {
      // Jumped over: it rolls off the back of it unharmed.
      continue;
    } else if (ball.smashing) {
      h.onSmash(o, i);
    } else if (special === 'plough') {
      h.onPlough(o, dx > 0 ? -1 : 1);
    } else {
      const dist = Math.sqrt(dist2);
      let nx = 0;
      let nd = -1;
      if (dist > 1e-5) {
        nx = -dx / dist;
        nd = -dd / dist;
      }
      const push = reach - dist;
      ball.x += nx * push;
      ball.d += nd * push;
      // Carry the steering target along so it doesn't pull the ball back into the object.
      ball.targetX += nx * push;
      h.onHit(o, nx, nd);
    }
  }
}
