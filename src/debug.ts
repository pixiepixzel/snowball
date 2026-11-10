/**
 * Playtest helpers. None of this affects a normal run.
 *
 * URL switches:
 *   ?debug        show fps / draw calls / ball size vs the size the scene expects
 *   ?autoplay     let the bot steer and jump (bot.ts)
 *   ?speed=4      run the simulation 4× faster
 *   ?seed=123     fixed world layout
 *   ?gallery      look at the models on their own (gallery.ts)
 *   ?demo=dam     jump to just before the dam and watch the bot go through it
 *   ?demo=candy   start in a later world: candy, lost, desert, sea, spooky, toys, sky or
 *                 space (the keys in worlds.ts). Add &at=0..6 for a scene, &manual to play
 *                 it yourself.
 *   ?demo=remix   start in the first made-up "remix" world after the hand-made ones (same
 *                 options, plus &n=2, &n=3 ... for the remix worlds after it)
 *
 * Console: `__snowball.simulate()` plays a whole run with the bot instantly and returns
 * how it ended and the time and size at each scene — the quickest way to see what a
 * config change does. `__snowball.CONFIG` and `__snowball.ZONES` are live and can be
 * edited between runs.
 */
import { CONFIG, ZONES } from './config';
import type { Game } from './game';
import { HAND_MADE_LAPS, lapOfWorld } from './worlds';
import { designRadius, gateNeed, lapStart } from './zones';

export function installDebug(game: Game): void {
  const params = new URLSearchParams(location.search);
  game.showDebug = params.has('debug');
  game.autoplay = params.has('autoplay');
  // A run the bot played is not the player's score.
  if (game.autoplay) game.keepScores = false;
  game.speedMult = Math.max(1, Math.min(16, parseInt(params.get('speed') ?? '1', 10) || 1));
  const seed = params.get('seed');
  if (seed !== null) game.seed = parseInt(seed, 10) || 1;

  /**
   * @param maxSeconds stop after this much game time (the run is endless, so a good
   *                   bot run ends here rather than by failing)
   */
  const simulate = (maxSeconds = 400, dt = 1 / 60, bot = true) => {
    const wasAuto = game.autoplay;
    game.autoplay = bot;
    game.keepScores = false;
    game.start();
    const samples: string[] = [];
    let t = 0;
    let next = 0;
    let stalled = 0;
    while (t < maxSeconds && game.state !== 'ended') {
      const d0 = game.ball.d;
      game.step(dt);
      t += dt;
      if (game.state === 'playing' && game.ball.d - d0 < game.ball.cruiseSpeed() * dt * 0.3) stalled += dt;
      if (game.state === 'playing' && t >= next) {
        next += 10;
        samples.push(`${t.toFixed(0)}s r=${game.ball.r.toFixed(2)} design=${designRadius(game.ball.d).toFixed(2)}`);
      }
    }
    game.autoplay = wasAuto;
    game.keepScores = true;
    const counts: Record<string, number> = {};
    game.counts.forEach((n, id) => (counts[id] = n));
    return {
      result: game.state === 'ended' ? game.endKind : 'timeout',
      seconds: +game.stats.time.toFixed(1),
      finalRadius: +game.ball.r.toFixed(2),
      walls: game.stats.walls,
      hits: game.stats.hits,
      /** Seconds spent well below cruising speed (bounces, slow-motion, or stuck). */
      stalled: +stalled.toFixed(1),
      absorbs: game.stats.absorbs,
      zones: game.stats.zoneLog.map((z) => `${z.zone}: t=${z.time.toFixed(1)}s r=${z.radius.toFixed(2)} (design ${z.design.toFixed(2)})`),
      samples,
      counts,
    };
  };

  (window as unknown as Record<string, unknown>).__snowball = { game, CONFIG, ZONES, simulate };

  // ?demo=<world key> / ?demo=remix — start at the beginning of a later world with
  // the bot playing, to look at them without rolling down the whole mountain first.
  // Add &at=3 to start at that world's fourth scene (0 = first ... 6 = last).
  const demo = params.get('demo');
  const demoLap = demo ? lapOfWorld(demo) : -1;
  if (demo === 'remix' || demoLap > 0) {
    game.autoplay = !params.has('manual');
    game.keepScores = false;
    // ?demo=remix is the first made-up world after the hand-made ones; &n=2 the one after that...
    const n = Math.max(1, Math.min(30, parseInt(params.get('n') ?? '1', 10) || 1));
    const lap = demo === 'remix' ? HAND_MADE_LAPS - 1 + n : demoLap;
    const scene = Math.max(0, Math.min(ZONES.length - 1, parseInt(params.get('at') ?? '0', 10) || 0));
    window.setTimeout(() => game.warp(lap, scene), 400);
  }

  // ?demo=dam — watch the end of the first mountain. The bot plays the run up to a few
  // seconds before the dam (instantly), then carries on at normal speed so you can see
  // the dam go and the Giant mountain begin. Reload the page to watch it again.
  if (params.get('demo') === 'dam') {
    game.autoplay = true;
    game.keepScores = false;
    const dam = lapStart(1);
    window.setTimeout(() => {
      for (let attempt = 0; attempt < 8; attempt++) {
        game.seed = (seed !== null ? game.seed ?? 1 : 37) + attempt;
        game.start();
        let frames = 0;
        while (game.state === 'playing' && game.ball.d < dam - 70 * game.ball.r && frames++ < 40000) game.step(1 / 60);
        if (game.state === 'playing') break; // the bot got there; otherwise try another layout
      }
      // Make sure the demo shows the smash rather than a near miss.
      const need = gateNeed(dam * 0.999999) * 1.06;
      if (game.ball.r < need) game.ball.r = need;
    }, 400);
  }
}
