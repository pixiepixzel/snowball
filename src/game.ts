/**
 * Game loop and rules glue: owns every system, advances them each frame, and turns
 * collisions and hazards into growth, damage, juice and the end of the run.
 */
import * as THREE from 'three';
import {
  CONFIG,
  DAILY_REWARDS,
  HINTS,
  HINT_TIME,
  MILESTONES,
  MISSIONS,
  MISSION_LOOP_FROM,
  NO_TWIST,
  SKINS,
  UPGRADES,
  UPGRADE_LEVELS,
  WIND_PERIOD,
  ZONES,
  type HintId,
  type MissionDef,
  type Twist,
} from './config';
import { AudioEngine } from './audio';
import { Ball } from './ball';
import { BOOK_PAGES, BOOK_TOTAL } from './book';
import { botControl, rebaseBot } from './bot';
import { CameraRig } from './camera';
import { collide, type CollisionHandlers } from './collision';
import { Effects } from './effects';
import { Environment } from './environment';
import { Input } from './input';
import { OBJECT_DEFS } from './objects';
import { PERKS, applyUpgrades, coinsFor, upgradeCost } from './perks';
import { loadSave, writeSave, type MissionState, type SaveData } from './save';
import { Thumbs } from './thumbs';
import { UI, type MissionRow, type ShopRow, type SkinRow } from './ui';
import { clamp, lerp, sizeLabel, sizeParts } from './util';
import { World, type WorldObject } from './world';
import { HAND_MADE_LAPS, worldForLap } from './worlds';
import {
  LAP_GROWTH,
  REBASE_LAP,
  designRadius,
  displayScale,
  gateNeed,
  getLapBase,
  groundY,
  laneHalfWidth,
  lapStart,
  locate,
  needsRebase,
  rebaseD,
  sceneLook,
  sceneName,
  setLapBase,
  worldAt,
  zoneCoord,
  zoneIndexAt,
} from './zones';

export type GameState = 'title' | 'playing' | 'dying' | 'finishing' | 'ended';
/**
 * How a run ended: shattered (knocked to nothing), gate (too small for a wall), buried
 * (caught by the avalanche), sunk (fell in a river) or quit (ended from the pause menu).
 */
export type EndKind = 'shattered' | 'gate' | 'buried' | 'sunk' | 'quit';

/** What this run has done so far towards each kind of mission (config.ts MISSIONS). */
type Tally = Record<MissionDef['kind'], number>;
const newTally = (): Tally => ({ walls: 0, streak: 0, slams: 0, absorb: 0, secrets: 0, freeze: 0, time: 0, worlds: 0, grow: 0 });
/** Seconds one gold tag ("Mission done!") stays up before the next may replace it. */
const TOAST_GAP = 2.3;

export interface RunStats {
  /** Seconds of play (real time). */
  time: number;
  hits: number;
  absorbs: number;
  /** Walls smashed so far. */
  walls: number;
  /** Time and size on entering each scene — handy when balancing. */
  zoneLog: { zone: string; time: number; radius: number; design: number }[];
}

/** The scene the ball is in: its name and the wall at the end of it. */
interface Stage {
  name: string;
  /** Name of the world the scene belongs to ("Lost World", "Space"...). */
  world: string;
  /** The rule this world changes (NO_TWIST in the hand-made worlds). */
  twist: Twist;
  gateName: string;
  /** Ball radius needed to smash the wall. */
  need: number;
  /** Where the wall stands (m). */
  end: number;
}

/** Glow on the ball while a secret object's power is running: [r, g, b]. */
const RAGE_GLOW = [0.1, 0.34, 0.62];
const BEAM_GLOW = [0.1, 0.5, 0.22];
const _v = new THREE.Vector3();

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig = new CameraRig();
  readonly env: Environment;
  readonly world: World;
  readonly ball: Ball;
  readonly effects: Effects;
  readonly audio = new AudioEngine();
  readonly ui = new UI();
  readonly input: Input;

  state: GameState = 'title';
  /** True while a run is frozen behind the pause menu. */
  paused = false;
  endKind: EndKind = 'shattered';
  stats: RunStats = { time: 0, hits: 0, absorbs: 0, walls: 0, zoneLog: [] };
  readonly counts = new Map<string, number>();

  // Playtest switches (see debug.ts).
  autoplay = false;
  speedMult = 1;
  showDebug = false;
  seed: number | null = null;
  /** False during bot simulations, so they can never overwrite the player's best. */
  keepScores = true;

  private time = 0;
  private last = 0;
  private slowmo = 0;
  private hitstop = 0;
  private combo = 0;
  private comboTimer = 0;
  private endTimer = 0;
  private zoneIdx = 0;
  /** How many size milestones have been announced this run. */
  private milestone = 0;
  private stage: Stage = { name: '', world: '', twist: NO_TWIST, gateName: '', need: 0, end: 0 };
  /** Ball radius on entering the current scene (the wall meter starts from here). */
  private stageStartR = 0;
  private lastHitObj: WorldObject | null = null;
  private lastHitTime = -10;
  private lastD = 0;
  private pinned = 0;
  private unstickCount = 0;
  private lastUnstickD = -1e9;
  private lastSlowmo = -10;
  private lastFloat = -10;
  private pendingGain = 0;
  /** Avalanche: whether it has started, its lead in ball radii, where its front is (m), and 0..1 how close. */
  private avalancheOn = false;
  private avalancheGap = 0;
  private avalancheD = 0;
  private threat = 0;
  private pixelRatio = 1;
  private shadowsOn = false;
  private qualityLocked = false;
  private frameMsSum = 0;
  private frameMsCount = 0;
  private windowMs = 0;
  private trialFrom = 0;
  private trialAvg = 0;
  /** Best size, coins and upgrade levels (save.ts). */
  private save: SaveData = loadSave();
  /** Seconds left of the yeti's rage and of the saucer's tractor beam. */
  private rage = 0;
  private beam = 0;
  /** Coins picked up during this run (golden snowflakes), on top of the coins for size. */
  private runCoins = 0;
  /** Seconds until another first-time hint may go up, and until the next look for one. */
  private hintWait = 0;
  private hintScan = 0;
  /** Mission progress made in this run, and walls smashed since the last hit. */
  private tally: Tally = newTally();
  private streak = 0;
  /** Draws the collection book's pictures, and the page of the book last looked at. */
  private thumbs: Thumbs;
  private bookPage = 0;
  /** Gold tags waiting their turn, so one never wipes out another. */
  private toasts: string[] = [];
  private toastWait = 0;
  /** Which world the next run starts in (a lap number), picked on the title screen. */
  private startLap = 0;
  /** The ball's size when this run began, as shown to the player. Coins are paid for growth since then. */
  private runStartR: number = CONFIG.START_RADIUS;
  private fps = 60;
  private handlers: CollisionHandlers;

  constructor(
    canvas: HTMLCanvasElement,
    private frameEl: HTMLElement,
  ) {
    // On high-density screens the pixels are small enough that MSAA isn't worth its cost.
    const antialias = (window.devicePixelRatio || 1) < 2;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias, powerPreference: 'high-performance' });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_PIXEL_RATIO);
    // Tone mapping rolls bright snow off gently instead of clipping it to flat white.
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = CONFIG.EXPOSURE;
    this.renderer.shadowMap.enabled = CONFIG.SHADOWS;
    this.shadowsOn = CONFIG.SHADOWS;
    this.env = new Environment(this.scene);
    this.world = new World(this.scene);
    this.ball = new Ball(this.scene);
    this.effects = new Effects(this.scene);
    this.input = new Input(frameEl);
    this.ball.setBlobShadow(!this.shadowsOn);

    this.handlers = {
      onAbsorb: (o, i) => this.onAbsorb(o, i),
      onHit: (o, nx, nd) => this.onHit(o, nx, nd),
      onGate: (o, i, smash) => this.onGate(o, i, smash),
      onRiver: (o, freeze) => this.onRiver(o, freeze),
      onRamp: () => this.onRamp(),
      onPlough: (o, side) => this.onPlough(o, side),
      onSecret: (o, i) => this.onSecret(o, i),
      onSmash: (o, i) => this.onSmash(o, i),
    };

    this.ui.onStart = () => this.start();
    this.ui.onRestart = () => this.start();
    this.ui.onShop = () => this.showShop();
    this.ui.onBuy = (id) => this.buy(id);
    this.ui.onSkin = (id) => this.pickSkin(id);
    this.thumbs = new Thumbs(this.renderer);
    this.ui.onBook = () => this.openBook();
    this.ui.onBookStep = (step) => this.showBook(step);
    this.ui.onWorldStep = (step) => this.pickWorld(step);
    this.ui.onMenu = () => this.toTitle();
    this.ui.onPause = () => this.pause();
    this.ui.onResume = () => this.resume();
    this.ui.onQuit = () => this.quit();
    this.ui.onToggleSound = () => this.setSetting('sound', !this.save.sound);
    this.ui.onToggleMusic = () => this.setSetting('music', !this.save.music);
    this.ui.onToggleVibration = () => this.setSetting('vibration', !this.save.vibration);
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape' && e.code !== 'KeyP') return;
      if (this.paused) this.resume();
      else this.pause();
    });
    applyUpgrades(this.save.upgrades);
    this.ball.setSkin(SKINS.find((s) => s.id === this.save.skin) ?? SKINS[0]);
    this.audio.setMuted(!this.save.sound);
    this.audio.setMusicOn(this.save.music);
    this.ui.setSettings(this.save.sound, this.save.music, this.save.vibration);

    new ResizeObserver(() => this.resize()).observe(frameEl);
    window.addEventListener('orientationchange', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // A call, a notification, another app: pause rather than lose the run.
        this.pause();
        this.audio.suspend();
      } else {
        if (!this.paused) this.audio.resume();
        this.last = performance.now();
      }
    });

    this.resize();
    this.reset();
    this.ui.setStages(ZONES.length);
    // A mission finished in a run that was never ended (the page was closed) is swapped now.
    this.dealMissions();
    this.ui.setMissions(this.missionRows());
    this.ui.setBook(this.bookFound(), BOOK_TOTAL);
    this.ui.showTitle(this.save.best > 0 ? sizeLabel(this.save.best) : null, this.save.coins);
    this.showPick();
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  // ------------------------------------------------------------------ lifecycle

  /** Freeze a run in progress and show the pause menu. Does nothing outside a run. */
  pause(): void {
    if (this.paused || this.state !== 'playing') return;
    this.paused = true;
    this.audio.suspend();
    this.ui.setMissions(this.missionRows());
    this.ui.setPaused(true);
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.audio.resume();
    this.ui.setPaused(false);
    // Whatever was tapped or dragged while paused is not steering.
    this.input.consumeJump();
    this.input.consumeDrag();
    this.last = performance.now();
  }

  /** "End run" on the pause menu: stop here and go to the end screen, coins and all. */
  private quit(): void {
    if (!this.paused) return;
    this.paused = false;
    this.audio.resume();
    this.ui.setPaused(false);
    this.endKind = 'quit';
    this.finish();
  }

  /** Flip the sound, music or vibration switch and remember it. */
  private setSetting(key: 'sound' | 'music' | 'vibration', on: boolean): void {
    this.save[key] = on;
    writeSave(this.save);
    // Tapping a switch is a gesture, so the audio can start here: the music then answers
    // straight away on the title screen instead of waiting for the first run.
    if (!this.paused) this.audio.start();
    this.audio.setMuted(!this.save.sound);
    this.audio.setMusicOn(this.save.music);
    this.ui.setSettings(this.save.sound, this.save.music, this.save.vibration);
    if (key === 'vibration' && on) this.vibrate(30);
  }

  /** Begin a run (from the title screen or the end screen). */
  start(): void {
    this.paused = false;
    this.ui.setPaused(false);
    this.audio.start();
    if (this.startLap > this.save.reached) return; // a world not unlocked yet
    if (this.state !== 'title') {
      const from = this.startPoint(this.startLap);
      this.reset(from.d, from.base);
    }
    this.state = 'playing';
    this.ball.rolling = true;
    // Throw away the tap that pressed the button, so it doesn't count as a jump.
    this.input.consumeJump();
    this.input.consumeDrag();
    this.ui.clearTransient();
    this.ui.showHud();
    this.ui.setSize(...sizeParts(this.shown(this.ball.r)));
    this.ui.setProgress(0);
    this.ui.setZone(this.stage.name);
    this.ui.banner(this.stage.name, `Reach ${sizeLabel(this.shown(this.stage.need))} to smash the ${this.stage.gateName}`);
    this.stats.zoneLog.push({ zone: this.stage.name, time: 0, radius: this.ball.r, design: ZONES[0].startRadius });
  }

  private reset(startD = 0, lapBase = 0): void {
    setLapBase(lapBase);
    this.ball.reset();
    if (startD > 0) {
      this.ball.d = startD;
      // A later world: the size it expects, plus the Head start upgrade.
      this.ball.r = designRadius(startD) * PERKS.start;
    } else {
      this.ball.r = CONFIG.START_RADIUS * PERKS.start;
    }
    this.ball.syncTransform();
    this.runStartR = this.shown(this.ball.r);
    this.rage = 0;
    this.beam = 0;
    this.hintWait = 0;
    this.hintScan = 0;
    this.tally = newTally();
    this.streak = 0;
    this.toasts.length = 0;
    this.toastWait = 0;
    this.runCoins = 0;
    this.ui.setPower('', 0);
    this.world.reset(this.seed ?? (Math.random() * 0x7fffffff) | 0, startD);
    this.effects.reset();
    this.counts.clear();
    this.stats = { time: 0, hits: 0, absorbs: 0, walls: 0, zoneLog: [] };
    this.zoneIdx = zoneIndexAt(startD);
    this.enterStage(startD);
    // Anything the ball is already bigger than (when a demo skips ahead) is not announced.
    this.milestone = this.milestonesPassed(this.ball.r);
    this.combo = 0;
    this.comboTimer = 0;
    this.slowmo = 0;
    this.hitstop = 0;
    this.lastHitObj = null;
    this.lastHitTime = -10;
    this.lastD = startD;
    this.pinned = 0;
    this.unstickCount = 0;
    this.lastUnstickD = -1e9;
    this.lastSlowmo = -10;
    this.lastFloat = -10;
    this.pendingGain = 0;
    this.avalancheOn = false;
    this.avalancheGap = CONFIG.AVALANCHE_MAX_GAP_K;
    this.avalancheD = 0;
    this.threat = 0;
    this.audio.stopAvalanche();
    this.rig.snap(this.ball);
    this.world.update(this.ball.d, this.ball.r, this.ball.r, 0, 0, 0);
  }

  /**
   * Shrink the whole world by one lap, so the numbers never grow too big for the graphics
   * card however far the run goes (see REBASE_LAP in zones.ts). Everything moves together,
   * so nothing changes on screen; sizes shown to the player are scaled back up by `shown`.
   */
  private rebase(): void {
    const k = 1 / LAP_GROWTH;
    setLapBase(getLapBase() + 1);
    this.ball.rebase();
    this.world.rebase(this.time);
    this.effects.rebase();
    this.rig.rebase();
    rebaseBot(k);
    this.lastD = rebaseD(this.lastD);
    this.lastUnstickD = rebaseD(this.lastUnstickD);
    this.avalancheD = rebaseD(this.avalancheD);
    this.stage.end = rebaseD(this.stage.end);
    this.stage.need *= k;
    this.stageStartR *= k;
    this.pendingGain *= k;
  }

  /** How many of the size milestones (config.ts) a ball of radius r has outgrown. */
  private milestonesPassed(r: number): number {
    const diameter = this.shown(r) * 2;
    let n = 0;
    while (n < MILESTONES.length && diameter >= MILESTONES[n][0]) n++;
    return n;
  }

  /** A size in the game's own numbers, as the size it stands for (see displayScale). */
  private shown(r: number): number {
    return r * displayScale();
  }

  /** Note the scene at distance d: its name, its wall, and the ball's size on arrival. */
  private enterStage(d: number): void {
    const end = locate(d).zoneEnd;
    const look = sceneLook(d);
    const world = worldAt(d);
    this.stage = { name: sceneName(d), gateName: look.gateName, need: gateNeed(d), end, world: world.name, twist: world.twist };
    this.stageStartR = this.ball.r;
    this.ui.setTwist(world.twist.name);
    this.ball.setGroundColor(look.lane);
    // Each world has its own thing chasing the ball.
    this.effects.setChaseColors(world.chase.color, world.chase.glow, world.chase.style);
    this.effects.setWeather(world.scenery.weather);
    // Each world has its own tune; the seed (from its name) fixes the melody.
    let seed = 7;
    for (let i = 0; i < world.key.length; i++) seed = (seed * 31 + world.key.charCodeAt(i)) | 0;
    this.audio.setMusic(world.music, seed);
    this.ui.setChase(world.chase.label, world.chase.color);
  }

  /**
   * Skip straight to a later world with a ball of the size it expects. Used by the demos
   * (debug.ts) to look at later worlds without playing through the earlier ones.
   * @param lap    which world: 0 the mountain, 1 the Lost World, 2 Space, 3+ the remixes
   * @param scene  which of its scenes to start in (0 = first)
   */
  warp(lap: number, scene = 0): void {
    // Far-off laps are reached the same way the game gets there: shrunk down (zones.ts).
    const local = Math.min(lap, REBASE_LAP);
    let offset = 0;
    for (let i = 0; i < Math.min(scene, ZONES.length - 1); i++) offset += ZONES[i].length;
    const d = (lapStart(local) + offset * Math.pow(LAP_GROWTH, local)) * 1.0000001 + 1e-6;
    this.audio.start();
    this.paused = false;
    this.ui.setPaused(false);
    this.reset(d, lap - local);
    this.state = 'playing';
    this.ball.rolling = true;
    this.avalancheOn = true;
    this.input.consumeJump();
    this.input.consumeDrag();
    this.ui.clearTransient();
    this.ui.showHud();
    this.ui.setZone(this.stage.name);
    this.announceWorld();
  }

  /** The big banner for arriving in a world: its name, and its twist if it has one. */
  private announceWorld(): void {
    const twist = this.stage.twist;
    const sub = twist.name ? `${twist.name} · ${twist.hint}` : `Next: ${this.stage.gateName} · ${sizeLabel(this.shown(this.stage.need))}`;
    this.ui.banner(this.stage.world, sub);
  }

  private resize(): void {
    const w = Math.max(1, this.frameEl.clientWidth);
    const h = Math.max(1, this.frameEl.clientHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h, false);
    this.rig.setAspect(w / h);
  }

  /**
   * Adaptive resolution. Watches real frame times in 1.5 s windows; when they run slow
   * it drops the pixel ratio a notch. If a drop doesn't actually help (e.g. the browser
   * is capping the frame rate, as iOS low-power mode does), it is undone and left alone.
   */
  private watchFrameTime(ms: number): void {
    const C = CONFIG;
    if (!C.ADAPTIVE_RESOLUTION || this.qualityLocked || document.hidden || ms > 250) return;
    this.frameMsSum += ms;
    this.frameMsCount++;
    this.windowMs += ms;
    if (this.windowMs < 1500) return;
    const avg = this.frameMsSum / this.frameMsCount;
    this.frameMsSum = 0;
    this.frameMsCount = 0;
    this.windowMs = 0;

    if (this.trialFrom > 0) {
      // We lowered the resolution last window: did it buy anything?
      if (avg > this.trialAvg * 0.9) {
        this.pixelRatio = this.trialFrom;
        this.qualityLocked = true;
        this.resize();
      }
      this.trialFrom = 0;
      return;
    }
    if (avg > C.SLOW_FRAME_MS && this.shadowsOn && this.pixelRatio <= 1.5) {
      // Already at reduced resolution and still slow: fall back to cheap blob shadows.
      this.shadowsOn = false;
      this.env.setShadows(false);
      this.world.setRealShadows(false);
      this.ball.setBlobShadow(true);
      return;
    }
    if (avg > C.SLOW_FRAME_MS && this.pixelRatio > C.MIN_PIXEL_RATIO) {
      this.trialFrom = this.pixelRatio;
      this.trialAvg = avg;
      this.pixelRatio = Math.max(C.MIN_PIXEL_RATIO, this.pixelRatio - 0.25);
      this.resize();
    }
  }

  // ------------------------------------------------------------------ loop

  private frame = (now: number): void => {
    requestAnimationFrame(this.frame);
    this.watchFrameTime(now - this.last);
    const dt = clamp((now - this.last) / 1000, 0.001, 0.05);
    this.last = now;
    this.fps = lerp(this.fps, 1 / dt, 0.05);
    if (!this.paused) for (let i = 0; i < this.speedMult; i++) this.step(dt);
    this.render();
  };

  /** Advance the whole game by `realDt` seconds of wall-clock time. */
  step(realDt: number): void {
    const C = CONFIG;

    // Slow-motion and hit-stop scale game time; camera and timers stay in real time.
    let scale = 1;
    if (this.hitstop > 0) {
      this.hitstop -= realDt;
      scale = 0.03;
    } else if (this.slowmo > 0) {
      this.slowmo -= realDt;
      scale = lerp(1, C.SLOWMO_SCALE, clamp(this.slowmo / 0.25, 0, 1));
    }
    const dt = realDt * scale;
    this.time += dt;

    const ball = this.ball;
    if (needsRebase(ball.d)) this.rebase();
    const playing = this.state === 'playing';
    const active = playing || this.state === 'finishing';

    // A crosswind twist swings from one side to the other and back.
    const gust = this.stage.twist.wind;
    ball.wind = playing && gust !== 0 ? gust * Math.sin((this.time * Math.PI * 2) / WIND_PERIOD) : 0;

    const drag = this.input.consumeDrag();
    let jump = this.input.consumeJump();
    if (this.state !== 'dying') {
      if (playing) {
        if (this.autoplay) {
          const bot = botControl(ball, this.world);
          ball.targetX = bot.x;
          jump = bot.jump;
        }
        if (jump && ball.jump()) this.audio.jump(false);
      }
      ball.update(dt, playing ? drag : 0, playing ? this.input.keyAxis : 0);
      if (ball.landed) this.onLanding();
    }

    // Secret-object powers: the yeti's rage and the saucer's tractor beam.
    const raging = playing && this.rage > 0;
    const beaming = playing && this.beam > 0;
    ball.smashing = raging;
    const glow = raging ? RAGE_GLOW : beaming ? BEAM_GLOW : null;
    const pulse = 0.75 + 0.25 * Math.sin(this.time * 12);
    for (let i = 0; i < 3; i++) ball.glow[i] = glow ? glow[i] * pulse : 0;

    this.world.update(ball.d, ball.r, this.rig.camR, this.rig.camX, dt, this.time, raging);
    if (beaming) this.world.pull(ball.x, ball.d, ball.r, CONFIG.UFO_BEAM_RANGE_K * ball.r, CONFIG.UFO_BEAM_PULL_K * ball.r * dt, this.time);

    if (active) {
      collide(ball, this.world, this.handlers);
      ball.syncTransform();
    }
    if (this.state === 'playing') this.updateRun(realDt, dt);

    if (this.state === 'dying' || this.state === 'finishing') {
      this.endTimer -= realDt;
      if (this.endTimer <= 0) this.finish();
    }

    ball.syncStuck(dt);
    this.effects.update(dt, ball);
    this.rig.threat = this.state === 'playing' ? this.threat : 0;
    this.rig.update(realDt, ball, this.state !== 'title');
    this.effects.updateAvalanche(this.avalancheOn && this.state !== 'ended', this.avalancheD, laneHalfWidth(ball.d), this.rig.camR, this.time, this.rig.eyeD);
    this.env.update(this.rig.camera, this.rig.camR, ball.x, ball.d);
    this.effects.updateSnowfall(realDt, this.rig.camera, this.rig.camR, Math.max(0, ball.speed) * scale, ball.wind * scale);

    const moving = this.state !== 'dying' && ball.speed > 0 && !ball.airborne ? ball.speed / ball.cruiseSpeed() : 0;
    this.audio.setRoll(moving, ball.r, scale);
  }

  private updateRun(realDt: number, dt: number): void {
    const C = CONFIG;
    const ball = this.ball;
    this.stats.time += realDt;
    if (this.comboTimer > 0) this.comboTimer -= realDt;
    if (this.hintWait > 0) this.hintWait -= realDt;
    this.hintScan -= realDt;
    if (this.hintScan <= 0) {
      this.hintScan = 0.2;
      this.checkHints();
      // Missions that tick up by themselves: time survived, and how much the ball has grown.
      this.tally.time = this.stats.time;
      this.tally.grow = Math.max(this.tally.grow, this.shown(ball.r) / this.runStartR);
      this.checkMissions();
    }
    if (this.toastWait > 0) this.toastWait -= realDt;
    else if (this.toasts.length > 0) {
      this.ui.milestone(this.toasts.shift() as string);
      this.toastWait = TOAST_GAP;
    }

    // Un-stick: if the ball is pushing forward but something keeps shoving it back
    // (wedged between obstacles, or against one near the bank), roll it back uphill a
    // little so there is room to steer out. Guarantees the run can never dead-end.
    const cruise = ball.cruiseSpeed();
    const advanced = ball.d - this.lastD;
    this.lastD = ball.d;
    if (ball.speed > cruise * 0.5 && advanced < cruise * dt * 0.25) this.pinned += realDt;
    else this.pinned = Math.max(0, this.pinned - realDt * 2);
    if (this.pinned > C.UNSTICK_TIME) {
      this.pinned = 0;
      this.unstickCount = ball.d - this.lastUnstickD < 3 * ball.r ? this.unstickCount + 1 : 1;
      this.lastUnstickD = ball.d;
      if (this.unstickCount >= 2) {
        // Rolling back didn't help: whatever is in the way gives up and crumbles.
        this.unstickCount = 0;
        this.crumbleBlockers();
      } else {
        const want = ball.targetX - ball.x;
        const side = Math.abs(want) > ball.r * 0.1 ? Math.sign(want) : ball.x > 0 ? -1 : 1;
        ball.speed = -cruise * 0.7;
        ball.knock = side * cruise * 0.5;
      }
    }

    // --- new scene?
    const zone = zoneIndexAt(ball.d);
    if (zone !== this.zoneIdx) {
      this.zoneIdx = zone;
      const oldWorld = this.stage.world;
      this.enterStage(ball.d);
      this.ui.setZone(this.stage.name);
      // Reaching a world for the first time unlocks it as a place to start from.
      const lap = locate(ball.d).lap;
      if (this.keepScores && lap > this.save.reached) {
        this.save.reached = lap;
        writeSave(this.save);
        this.toasts.push('New world unlocked!');
      }
      // Arriving in a new world gets a bigger announcement than a new scene.
      if (this.stage.world !== oldWorld) {
        this.announceWorld();
        this.audio.fanfare();
      } else {
        this.ui.banner(this.stage.name, `Next: ${this.stage.gateName} · ${sizeLabel(this.shown(this.stage.need))}`);
        this.audio.chime();
      }
      this.stats.zoneLog.push({ zone: this.stage.name, time: this.stats.time, radius: ball.r, design: designRadius(ball.d) });
    }

    // --- the avalanche.
    // Its lead is tracked in ball radii, not metres: it gains whenever the ball rolls
    // slower than the avalanche does, and a growth spurt neither helps nor hurts.
    if (!this.avalancheOn) {
      if (this.stats.time >= C.AVALANCHE_DELAY) {
        this.avalancheOn = true;
        this.avalancheGap = C.AVALANCHE_MAX_GAP_K;
        this.ui.banner(`${worldAt(ball.d).chase.label}!`, "Don't slow down");
        this.rig.shake(0.8);
      }
    } else {
      this.avalancheGap += ((ball.speed - C.AVALANCHE_SPEED * cruise) * dt) / ball.r;
      this.avalancheGap = Math.min(this.avalancheGap, C.AVALANCHE_MAX_GAP_K);
      const gap = this.avalancheGap;
      this.threat = clamp(1 - (gap - 1.5) / (C.AVALANCHE_WARN_K - 1.5), 0, 1);
      if (this.threat > 0.6) this.rig.shake(0.12 + 0.3 * (this.threat - 0.6));
      if (gap < 0.6) {
        this.die('buried');
        return;
      }
    }
    this.avalancheD = ball.d - this.avalancheGap * ball.r;
    this.ui.setAvalanche(this.avalancheOn, this.threat);
    this.audio.setAvalanche(this.avalancheOn ? this.threat : 0);
    this.audio.setMusicUrgency(this.avalancheOn ? this.threat : 0);

    // --- the wall meter: how close the ball is to the size the next wall demands.
    const need = this.stage.need;
    const ready = ball.r >= need;
    const span = Math.max(1e-9, need - this.stageStartR);
    const eta = (this.stage.end - ball.d) / Math.max(0.1, cruise);
    this.ui.setGate(
      `${this.stage.gateName} · ${sizeLabel(this.shown(need))}`,
      ready ? 1 : clamp((ball.r - this.stageStartR) / span, 0, 1),
      ready,
      !ready && eta < 6,
    );

    this.ui.setSize(...sizeParts(this.shown(ball.r)));
    this.ui.setProgress(zoneCoord(ball.d) / ZONES.length);

    // --- outgrown something? Each milestone is announced once per run.
    const passed = this.milestonesPassed(ball.r);
    if (passed > this.milestone) {
      this.milestone = passed;
      this.toasts.push(`Bigger than ${MILESTONES[passed - 1][1]}!`);
      this.ui.bumpSize();
      this.audio.chime();
    }
    this.ui.setFragile(ball.r * (1 - C.HIT_RADIUS_LOSS * PERKS.hitLoss) < C.MIN_RADIUS);

    // --- secret-object powers count down.
    if (this.rage > 0) {
      this.rage = Math.max(0, this.rage - dt);
      this.ui.setPower('Yeti rage', this.rage / C.YETI_RAGE_TIME);
    } else if (this.beam > 0) {
      this.beam = Math.max(0, this.beam - dt);
      this.ui.setPower('Tractor beam', this.beam / C.UFO_BEAM_TIME);
    } else {
      this.ui.setPower('', 0);
    }
  }

  private render(): void {
    this.world.commit();
    this.renderer.render(this.scene, this.rig.camera);
    if (this.showDebug) {
      const info = this.renderer.info.render;
      const w = this.world.stats;
      const b = this.ball;
      const gap = this.avalancheOn ? this.avalancheGap.toFixed(1) : '-';
      this.ui.setDebug(
        `${this.fps.toFixed(0)} fps  ${info.calls} calls  ${(info.triangles / 1000).toFixed(1)}k tris  x${this.pixelRatio}${this.shadowsOn ? ' shadows' : ''}\n` +
          `${w.objects} objects  ${w.chunks} chunks  ${b.stuckCount} stuck\n` +
          `r ${b.r.toFixed(2)}  design ${designRadius(b.d).toFixed(2)}  d ${b.d.toFixed(0)}  lap ${locate(b.d).lap}\n` +
          `t ${this.stats.time.toFixed(1)}s  hits ${this.stats.hits}  eats ${this.stats.absorbs}  walls ${this.stats.walls}  avalanche ${gap}`,
      );
    }
  }

  /** Last-resort escape: break up the obstacles the ball is wedged against. */
  private crumbleBlockers(): void {
    const ball = this.ball;
    const objs = this.world.objects;
    const absorbMax = ball.r * CONFIG.ABSORB_RATIO;
    let any = false;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      if (o.scenery || o.def.special || o.size < absorbMax) continue;
      const reach = ball.r * CONFIG.CONTACT_REACH + o.fp;
      const dd = o.d - ball.d;
      if (dd < -0.3 * reach || dd > reach + 1.5 * ball.r || Math.abs(o.x - ball.x) > reach + 0.6 * ball.r) continue;
      this.effects.burst(o.x, groundY(o.d) + o.size * 0.6, -o.d, o.size, 30, 1, 0);
      this.world.remove(i);
      any = true;
    }
    if (any) {
      this.audio.thud(ball.r);
      this.rig.shake(0.5);
    }
  }

  // ------------------------------------------------------------------ rules

  private onAbsorb(o: WorldObject, index: number): void {
    const C = CONFIG;
    const ball = this.ball;
    const def = o.def;
    const size = o.size;
    const q = size / ball.r;
    const before = ball.r;

    this.world.take(index);
    ball.absorb(o, this.world.poolOf(def));
    const ox = o.x;
    const od = o.d;
    this.world.recycle(o);

    this.counts.set(def.id, (this.counts.get(def.id) ?? 0) + 1);
    this.stats.absorbs++;
    this.tally.absorb++;
    this.combo = this.comboTimer > 0 ? this.combo + 1 : 0;
    this.comboTimer = C.COMBO_WINDOW;

    // Pop: the ball swells for a moment, more for bigger mouthfuls.
    ball.popVel += C.POP_BASE + C.POP_PER_Q * Math.min(q, 0.8);
    this.audio.pop(q, this.combo, ball.r);
    this.effects.burst(ox, groundY(od) + size * 0.6, -od, Math.max(size, ball.r * 0.3), 4 + Math.floor(q * 14), 0.8, ball.speed * 0.5);

    const landmark = !!def.landmark && q > C.LANDMARK_MIN_Q && this.stats.time - this.lastSlowmo > C.SLOWMO_COOLDOWN;
    const big = q >= C.BIG_ABSORB_Q;
    if (landmark) {
      this.lastSlowmo = this.stats.time;
      this.slowmo = C.SLOWMO_TIME;
      this.rig.shake(0.75);
      this.rig.kick(6);
      this.audio.bigAbsorb(ball.r);
      this.ui.flash('big');
      this.vibrate(18);
    } else if (big) {
      this.rig.shake(0.2 + q * 0.3);
      this.rig.kick(2.5);
      if (q > 0.6) this.audio.bigAbsorb(ball.r);
    }
    // Floating "+size": always for landmarks, otherwise rate-limited so they don't pile up.
    this.pendingGain += ball.r - before;
    if (landmark || (big && this.stats.time - this.lastFloat > C.FLOAT_TEXT_GAP)) {
      const gain = `+${sizeLabel(this.shown(this.pendingGain))}`;
      this.floatAtBall(landmark ? `${def.name.toUpperCase()}! ${gain}` : gain, landmark);
      this.ui.bumpSize();
      this.lastFloat = this.stats.time;
      this.pendingGain = 0;
    }
  }

  /** A secret object: absorb it like anything else, then switch on its power. */
  private onSecret(o: WorldObject, index: number): void {
    if (this.state !== 'playing') return;
    const C = CONFIG;
    const id = o.def.id;
    this.onAbsorb(o, index);
    this.tally.secrets++;
    this.checkMissions();
    this.rig.shake(0.5);
    this.rig.kick(5);
    this.ui.flash('big');
    this.ui.bumpSize();
    this.audio.fanfare();
    this.vibrate(30);
    if (id === 'goldenSnowflake') {
      this.runCoins += C.SECRET_GOLD_COINS;
      this.floatAtBall(`+${C.SECRET_GOLD_COINS} COINS!`, true);
      this.toasts.push('Golden snowflake!');
    } else if (id === 'yeti') {
      this.rage = C.YETI_RAGE_TIME;
      this.beam = 0;
      this.ui.banner('Yeti rage!', 'Smash through everything');
    } else {
      this.beam = C.UFO_BEAM_TIME;
      this.rage = 0;
      this.ui.banner('Tractor beam!', 'Everything small flies to you');
    }
  }

  /** Yeti rage: something too big to absorb is in the way, so it is smashed to bits. */
  private onSmash(o: WorldObject, index: number): void {
    if (this.state !== 'playing') return;
    const ball = this.ball;
    this.effects.burst(o.x, groundY(o.d) + o.size * 0.6, -o.d, Math.max(o.size, ball.r), 34, 1.3, ball.speed * 0.5);
    this.world.remove(index);
    ball.grow(ball.r * CONFIG.YETI_SMASH_GROW_K);
    ball.popVel += 3;
    this.rig.shake(0.45);
    this.audio.thud(ball.r);
    this.vibrate(15);
  }

  private onHit(o: WorldObject, nx: number, nd: number): void {
    const ball = this.ball;
    if (this.state !== 'playing') return;
    // Still leaning on the thing that just hit us: no second punishment.
    const leaning = o === this.lastHitObj && this.time - this.lastHitTime < 0.6;
    if (o === this.lastHitObj) this.lastHitTime = this.time;
    if (ball.invuln > 0 || leaning) {
      // Dead-centre contact would stall the ball; ease it round the side the player is
      // steering towards (or the nearer side), unless the bank is in the way.
      if (Math.abs(nx) < 0.4) {
        const want = ball.targetX - ball.x;
        let side = Math.abs(want) > ball.r * 0.1 ? Math.sign(want) : ball.x >= o.x ? 1 : -1;
        const lim = laneHalfWidth(ball.d) - ball.r;
        if (side * ball.x > lim - ball.r * 0.5) side = -side;
        const slide = ball.cruiseSpeed() * 0.4;
        if (Math.abs(ball.knock) < slide) ball.knock = side * slide;
      }
      return;
    }
    this.lastHitObj = o;
    this.lastHitTime = this.time;

    const lostFrom = ball.r;
    ball.hit(nx, nd, o.x);
    this.hurt(lostFrom, CONFIG.HITSTOP_TIME);
    const p = ball.position;
    this.effects.burst(p.x - nx * ball.r * 0.6, p.y, p.z + nd * ball.r * 0.6, ball.r, 26, 1.1, 0);
  }

  /** Shared feedback for anything that knocks snow off the ball. */
  private hurt(radiusBefore: number, hitstop: number): void {
    const ball = this.ball;
    this.stats.hits++;
    this.streak = 0;
    this.combo = 0;
    this.hitstop = hitstop;
    this.rig.shake(0.9);
    this.audio.thud(ball.r);
    this.ui.flash('hit');
    this.vibrate(40);
    this.floatAtBall(`-${sizeLabel(this.shown(radiusBefore - ball.r))}`, false);
    if (ball.r < CONFIG.MIN_RADIUS) this.die('shattered');
  }

  /** A snowplough scraped past: it takes snow and momentum but doesn't stop the ball. */
  private onPlough(o: WorldObject, side: number): void {
    const C = CONFIG;
    const ball = this.ball;
    if (this.state !== 'playing' || ball.invuln > 0) return;
    const lostFrom = ball.r;
    ball.r *= 1 - C.PLOUGH_LOSS * PERKS.hitLoss;
    ball.invuln = C.HIT_INVULN;
    ball.speed *= 0.6;
    ball.knock = side * ball.cruiseSpeed() * 0.6;
    ball.popVel -= 5;
    this.hurt(lostFrom, C.HITSTOP_TIME);
    this.effects.burst(o.x, groundY(o.d) + o.size * 0.5, -o.d + o.size, ball.r, 30, 1.2, -o.speed);
  }

  /** The ball reached the wall at the end of a scene. */
  private onGate(o: WorldObject, index: number, smash: boolean): void {
    if (this.state !== 'playing') return;
    const C = CONFIG;
    const ball = this.ball;
    const p = ball.position;
    const dam = o.def.zone >= ZONES.length - 1;
    if (smash) {
      // Big enough: straight through, rubble everywhere, next scene.
      const half = o.size * 8;
      for (let k = -3; k <= 3; k++) {
        this.effects.burst(ball.x + (k / 3) * Math.min(half, ball.r * 9), groundY(o.d) + o.size, -o.d, Math.max(o.size, ball.r * 0.7), 16, 1.3, ball.speed * 0.5);
      }
      this.world.remove(index);
      this.stats.walls++;
      this.tally.walls++;
      this.tally.streak = Math.max(this.tally.streak, ++this.streak);
      if (dam) this.tally.worlds++;
      this.checkMissions();
      ball.r *= 1 + C.GATE_BONUS;
      ball.popVel += 6;
      this.slowmo = dam ? 1.0 : 0.45;
      this.lastSlowmo = this.stats.time;
      this.rig.shake(1.1);
      this.rig.kick(dam ? 10 : 7);
      this.audio.bigAbsorb(ball.r);
      if (dam) this.audio.fanfare();
      this.ui.flash('big');
      this.ui.bumpSize();
      this.vibrate(40);
      // The last wall of a world gets named: "DAM BUSTED!", "LAVA WALL BUSTED!"...
      this.floatAtBall(dam ? `${this.stage.gateName.toUpperCase()} BUSTED!` : 'SMASH!', true);
      // Breaking through buys some breathing room from the avalanche.
      if (this.avalancheOn) this.avalancheGap = Math.max(this.avalancheGap, C.AVALANCHE_GATE_GAP_K);
    } else {
      // Too small: the wall holds and the run ends here.
      this.state = 'finishing';
      this.endKind = 'gate';
      this.endTimer = 1.6;
      ball.rolling = false;
      ball.speed = -ball.cruiseSpeed() * 0.3;
      ball.popVel -= 6;
      this.hitstop = 0.1;
      this.rig.shake(1.2);
      this.audio.thud(ball.r);
      this.ui.flash('hit');
      this.ui.setFragile(false);
      this.vibrate(80);
      this.effects.burst(p.x, p.y, p.z - ball.r * 0.7, ball.r, 60, 1.2, 0);
      this.floatAtBall('TOO SMALL!', false);
    }
  }

  /** In a river: a big ball freezes it solid, a small one off the bridge goes under. */
  private onRiver(o: WorldObject, freeze: boolean): void {
    if (this.state !== 'playing') return;
    const ball = this.ball;
    const p = ball.position;
    if (freeze) {
      this.world.freeze(o);
      this.tally.freeze++;
      this.checkMissions();
      ball.r *= 1 + CONFIG.RIVER_BONUS;
      ball.popVel += 4;
      this.audio.freeze();
      this.rig.kick(4);
      this.ui.bumpSize();
      for (let k = -2; k <= 2; k++) this.effects.burst(ball.x + k * ball.r * 2.5, groundY(o.d) + ball.r * 0.3, -o.d, ball.r * 0.8, 10, 0.9, ball.speed * 0.4);
      this.floatAtBall('FROZEN!', true);
    } else {
      this.effects.burst(p.x, groundY(ball.d), p.z, ball.r * 1.4, 90, 1.4, ball.speed * 0.3);
      this.audio.splash();
      this.die('sunk');
    }
  }

  /** Rolled onto a ramp: up we go. */
  private onRamp(): void {
    if (this.state !== 'playing') return;
    if (this.ball.jump(CONFIG.RAMP_HEIGHT_K, true)) {
      this.audio.jump(true);
      this.rig.kick(5);
    }
  }

  /**
   * Touchdown after a jump. Coming down off a ramp slams the ground: everything around
   * the landing spot is absorbed or smashed, further out if the ball lands straight.
   */
  private onLanding(): void {
    const C = CONFIG;
    const ball = this.ball;
    ball.landed = false;
    if (this.state !== 'playing') return;
    const p = ball.position;
    this.effects.burst(p.x, p.y - ball.r * 0.9, p.z, ball.r * 0.7, ball.rampFlight ? 22 : 8, 0.8, ball.speed * 0.6);
    if (!ball.rampFlight) {
      this.audio.land(ball.r, false);
      return;
    }
    const clean = ball.landingSlide < C.LANDING_CLEAN;
    const radius = (clean ? C.SLAM_RADIUS_K : C.SLAM_ROUGH_RADIUS_K) * ball.r;
    const absorbMax = ball.r * C.ABSORB_RATIO;
    const ground = groundY(ball.d);

    let smashed = 0;
    const objs = this.world.objects;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      // Walls, rivers, other ramps and secret objects are left alone.
      if (o === undefined || o.scenery || (o.def.special && o.def.special !== 'plough')) continue;
      const reach = radius + o.fp;
      const dx = o.x - ball.x;
      const dd = o.d - ball.d;
      if (dx * dx + dd * dd > reach * reach) continue;
      if (o.size < absorbMax) {
        this.onAbsorb(o, i);
      } else {
        this.effects.burst(o.x, groundY(o.d) + o.size * 0.6, -o.d, Math.max(o.size, ball.r), 30, 1.3, ball.speed * 0.4);
        this.world.remove(i);
        ball.grow(ball.r * C.SLAM_GROW_K);
        smashed++;
      }
    }

    // The shock wave: a ring of snow thrown up around the landing spot.
    for (let k = 0; k < 14; k++) {
      const a = (k * Math.PI) / 7;
      this.effects.burst(ball.x + Math.cos(a) * radius * 0.7, ground + ball.r * 0.2, -(ball.d + Math.sin(a) * radius * 0.7), ball.r * 0.8, 7, 1.2, ball.speed * 0.5);
    }
    ball.popVel += 6;
    this.hitstop = 0.05;
    this.rig.shake(clean ? 1.0 : 0.7);
    this.rig.kick(clean ? 7 : 4);
    this.audio.land(ball.r, clean);
    this.audio.thud(ball.r);
    this.ui.bumpSize();
    this.vibrate(35);
    if (smashed > 0) this.ui.flash('big');
    this.floatAtBall(smashed > 1 ? `SLAM! ×${smashed}` : 'SLAM!', true);
    this.tally.slams++;
    this.checkMissions();
  }

  /** The ball is destroyed: burst it, then show the end screen after a moment. */
  private die(kind: EndKind): void {
    if (this.state !== 'playing') return;
    const ball = this.ball;
    this.state = 'dying';
    this.endKind = kind;
    this.endTimer = 1.5;
    ball.rolling = false;
    ball.speed = 0;
    ball.shed();
    ball.setVisible(false);
    const p = ball.position;
    this.effects.burst(p.x, p.y - ball.r * 0.5, p.z, ball.r * 1.7, 110, 1.3, 0);
    if (kind !== 'sunk') this.audio.shatter();
    this.rig.shake(1.3);
    this.ui.setFragile(false);
    if (kind === 'buried') this.ui.setAvalanche(true, 1);
    this.vibrate(120);
  }

  /** Show the end screen and record the score. */
  private finish(): void {
    this.state = 'ended';
    this.ball.rolling = false;
    this.audio.stopAvalanche();
    const r = this.shown(this.ball.r);
    // Bot runs and demos (keepScores off) earn nothing and never touch the save.
    const isBest = this.keepScores && r > this.save.best;
    // Coins are for growth during the run, so starting in a later world isn't free money.
    const coins = this.keepScores ? Math.max(0, coinsFor(r) - coinsFor(this.runStartR)) + this.runCoins : 0;
    // The end screen shows the missions as this run left them; finished ones are swapped
    // for new ones afterwards, ready for the next run.
    this.checkMissions();
    this.claimDaily();
    this.ui.setMissions(this.missionRows());
    this.bankMissions();
    const book = this.recordBook();
    if (this.keepScores) {
      if (isBest) this.save.best = r;
      this.save.coins += coins;
      writeSave(this.save);
    }
    this.ui.setBook(this.bookFound(), BOOK_TOTAL);
    const items: { label: string; color: string; fresh: boolean }[] = [];
    for (const def of OBJECT_DEFS) {
      const n = this.counts.get(def.id) ?? 0;
      if (n > 0) items.push({ label: `${n} ${n === 1 ? def.name : def.plural}`, color: `#${def.color.toString(16).padStart(6, '0')}`, fresh: book.fresh.has(def.id) });
    }
    const where = this.stage.name;
    const walls = `${this.stats.walls} wall${this.stats.walls === 1 ? '' : 's'} smashed.`;
    const text = {
      shattered: { title: 'Shattered!', subtitle: `Smashed to powder in the ${where}. ${walls}` },
      gate: { title: 'Too small!', subtitle: `You needed ${sizeLabel(this.shown(this.stage.need))} to smash the ${this.stage.gateName}. ${walls}` },
      buried: { title: 'Buried!', subtitle: `The avalanche caught you in the ${where}. ${walls}` },
      sunk: { title: 'Sunk!', subtitle: `Too small to freeze the river in the ${where}. ${walls}` },
      quit: { title: 'Run ended', subtitle: `You stopped in the ${where}. ${walls}` },
    }[this.endKind];
    const [size, unit] = sizeParts(r);
    this.ui.showEnd({ ...text, size, unit, best: sizeLabel(this.save.best), isBest, items, bookNote: book.note, coins: this.keepScores ? coins : null, totalCoins: this.save.coins });
  }

  // ------------------------------------------------------------------ missions

  /** Bot runs and demos don't count towards missions, like everything else they do. */
  private get missionsOn(): boolean {
    return this.keepScores && !this.autoplay;
  }

  /** How far along a mission is: what this run has done, plus earlier runs if it adds up. */
  private missionValue(m: MissionState, def: MissionDef): number {
    const run = this.missionsOn ? this.tally[def.kind] : 0;
    return def.scope === 'total' ? m.progress + run : run;
  }

  /** Pay out any mission this run has just finished. Its place is refilled when the run ends. */
  private checkMissions(): void {
    if (!this.missionsOn) return;
    let paid = false;
    for (const m of this.save.missions) {
      if (m.done) continue;
      const def = MISSIONS.find((d) => d.id === m.id);
      if (!def || this.missionValue(m, def) < def.target) continue;
      m.done = true;
      this.save.coins += def.reward;
      paid = true;
      this.toasts.push(`Mission done! +${def.reward} coins`);
      this.audio.chime();
    }
    if (paid) writeSave(this.save);
  }

  /** The run is over: keep what counts towards missions that add up, and deal new ones. */
  private bankMissions(): void {
    if (!this.missionsOn) return;
    for (const m of this.save.missions) {
      const def = MISSIONS.find((d) => d.id === m.id);
      if (def && !m.done && def.scope === 'total') m.progress += this.tally[def.kind];
    }
    this.tally = newTally();
    this.dealMissions();
    writeSave(this.save);
  }

  /** Swap every finished mission for the next one on the list. */
  private dealMissions(): void {
    const active = this.save.missions;
    const loop = MISSIONS.length - MISSION_LOOP_FROM;
    let changed = false;
    for (let i = 0; i < active.length; i++) {
      if (!active[i].done) continue;
      // Easy first, in order; after the last one they come round again without the beginner ones.
      for (let tries = 0; tries < MISSIONS.length; tries++) {
        const n = this.save.missionNext++;
        const def = MISSIONS[n < MISSIONS.length ? n : MISSION_LOOP_FROM + ((n - MISSIONS.length) % loop)];
        if (active.some((m) => m.id === def.id)) continue;
        active[i] = { id: def.id, progress: 0, done: false };
        break;
      }
      changed = true;
    }
    if (changed) writeSave(this.save);
  }

  /**
   * Where the daily reward stands: whether today's has been paid, which day in a row
   * today is (or would be), and what that day pays. Days are counted on the player's own
   * calendar, so a new one starts at their midnight.
   */
  private daily(): { today: number; claimed: boolean; streak: number; reward: number } {
    const now = new Date();
    const today = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const last = this.save.daily;
    const claimed = last.day >= today;
    const streak = Math.max(1, claimed ? last.streak : last.day === today - 1 ? last.streak + 1 : 1);
    return { today, claimed, streak, reward: DAILY_REWARDS[Math.min(streak, DAILY_REWARDS.length) - 1] };
  }

  /** The first run of the day has ended: pay the daily reward. Bot runs and demos don't count. */
  private claimDaily(): void {
    if (!this.missionsOn) return;
    const daily = this.daily();
    if (daily.claimed) return;
    this.save.daily = { day: daily.today, streak: daily.streak };
    this.save.coins += daily.reward;
    writeSave(this.save);
  }

  /** The daily reward and the active missions, as the title screen, pause menu and end screen list them. */
  private missionRows(): MissionRow[] {
    const daily = this.daily();
    const rows: MissionRow[] = [
      daily.claimed
        ? { text: 'Daily reward', progress: 'back tomorrow', reward: daily.reward, done: true }
        : { text: 'Daily: finish a run', progress: daily.streak > 1 ? `day ${daily.streak}` : '', reward: daily.reward, done: false },
    ];
    for (const m of this.save.missions) {
      const def = MISSIONS.find((d) => d.id === m.id);
      if (!def) continue;
      const value = Math.min(def.target, Math.floor(this.missionValue(m, def)));
      rows.push({ text: def.text, progress: m.done || value <= 0 || def.target <= 1 ? '' : `${value}/${def.target}`, reward: def.reward, done: m.done });
    }
    return rows;
  }

  // ------------------------------------------------------------------ collection book

  /** How many different things have been absorbed at least once. */
  private bookFound(): number {
    let found = 0;
    for (const page of BOOK_PAGES) for (const def of page.defs) if (this.save.book[def.id]) found++;
    return found;
  }

  /**
   * The run is over: add what it absorbed to the book, and pay for any page that is now
   * complete. Returns what was absorbed for the first time and a line for the end screen.
   * Bot runs and demos add nothing.
   */
  private recordBook(): { fresh: Set<string>; note: string } {
    const fresh = new Set<string>();
    if (!this.keepScores) return { fresh, note: '' };
    for (const [id, n] of this.counts) {
      if (n <= 0) continue;
      if (!this.save.book[id]) fresh.add(id);
      this.save.book[id] = (this.save.book[id] ?? 0) + n;
    }
    const done: string[] = [];
    for (const page of BOOK_PAGES) {
      if (this.save.bookPaid.includes(page.key) || !page.defs.every((def) => this.save.book[def.id])) continue;
      this.save.bookPaid.push(page.key);
      this.save.coins += page.reward;
      done.push(`${page.name} page complete! +${page.reward} coins`);
    }
    const note = done.length > 0 ? done.join(' · ') : fresh.size > 0 ? `${fresh.size} new in your collection` : '';
    return { fresh, note };
  }

  /** Open the book at the world being played (or picked on the title screen). */
  private openBook(): void {
    const lap = this.state === 'title' ? this.startLap : locate(this.ball.d).lap;
    if (lap < HAND_MADE_LAPS) this.bookPage = lap;
    this.showBook(0);
  }

  /** Show a page of the book: the one it is on, or the next (+1) or previous (-1). */
  private showBook(step: number): void {
    this.bookPage = clamp(this.bookPage + step, 0, BOOK_PAGES.length - 1);
    const page = BOOK_PAGES[this.bookPage];
    const items = page.defs.map((def) => ({
      name: def.name,
      picture: this.thumbs.get(def),
      count: this.save.book[def.id] ?? 0,
    }));
    this.ui.openBook({
      found: this.bookFound(),
      total: BOOK_TOTAL,
      name: page.name,
      reward: page.reward,
      paid: this.save.bookPaid.includes(page.key),
      hasPrev: this.bookPage > 0,
      hasNext: this.bookPage < BOOK_PAGES.length - 1,
      items,
    });
  }

  // ------------------------------------------------------------------ first-time hints

  /**
   * Show a hint if it has never been shown and no other hint is up. Bot runs and demos
   * get none, and don't use them up.
   */
  private tryHint(id: HintId): boolean {
    if (!this.keepScores || this.autoplay || this.hintWait > 0 || this.save.hints.includes(id)) return false;
    this.save.hints.push(id);
    writeSave(this.save);
    this.ui.hint(HINTS[id]);
    this.hintWait = HINT_TIME + 0.6;
    return true;
  }

  /**
   * Look for the first appearance of each thing a hint explains. Called a few times a
   * second while playing; at most one hint goes up at a time, so the order is a priority.
   */
  private checkHints(): void {
    if (this.hintWait > 0 || this.save.hints.length >= Object.keys(HINTS).length) return;
    const ball = this.ball;
    const r = ball.r;
    const time = this.stats.time;
    if (time > 0.8 && this.tryHint('steer')) return;
    if (time > 5 && this.tryHint('absorb')) return;
    if (this.threat > 0.45 && this.tryHint('chaser')) return;

    const absorbMax = r * CONFIG.ABSORB_RATIO;
    for (const o of this.world.objects) {
      if (o.scenery) continue;
      const ahead = o.d - ball.d;
      if (ahead <= 0 || ahead > 28 * r) continue;
      const aside = Math.abs(o.x - ball.x);
      const special = o.def.special;
      if (special === 'river') {
        if (o.state === 0 && this.tryHint(ball.r >= o.need ? 'riverBig' : 'riverSmall')) return;
      } else if (special === 'ramp') {
        if (ahead < 18 * r && aside < 7 * r && this.tryHint('ramp')) return;
      } else if (special === 'plough') {
        if (o.size >= absorbMax && this.tryHint('plough')) return;
      } else if (special === 'secret') {
        if (ahead < 20 * r && this.tryHint('secret')) return;
      } else if (!special && o.danger && ahead < 12 * r && aside < 3.5 * r) {
        if (this.tryHint('ring')) return;
      }
    }
    // Part-way down the first scene: what the bar under the size is for.
    const place = locate(ball.d);
    if (place.lap === 0 && place.zone === 0 && place.t > 0.35) this.tryHint('wall');
  }

  // ------------------------------------------------------------------ world picker

  /** Where a run that starts in the given world begins: a distance, and how many laps to shrink by. */
  private startPoint(lap: number): { d: number; base: number } {
    if (lap <= 0) return { d: 0, base: 0 };
    // Far-off laps are reached the same way the game gets there: shrunk down (zones.ts).
    const local = Math.min(lap, REBASE_LAP);
    return { d: lapStart(local) * 1.0000001 + 1e-6, base: lap - local };
  }

  /** The picker on the title screen: every hand-made world, then the remix worlds. */
  private showPick(): void {
    const lap = this.startLap;
    this.ui.setWorldPick({
      name: lap < HAND_MADE_LAPS ? worldForLap(lap).name : 'Remix worlds',
      index: lap + 1,
      count: HAND_MADE_LAPS + 1,
      locked: lap > this.save.reached,
      hasPrev: lap > 0,
      hasNext: lap < HAND_MADE_LAPS,
    });
  }

  /** Step the picker to the next or previous world, and show that world behind the title. */
  private pickWorld(step: number): void {
    const lap = clamp(this.startLap + step, 0, HAND_MADE_LAPS);
    if (lap === this.startLap) return;
    this.startLap = lap;
    if (this.state === 'title') {
      const from = this.startPoint(lap);
      this.reset(from.d, from.base);
    }
    this.showPick();
  }

  /** Back to the title screen from the end screen, to pick a different world. */
  private toTitle(): void {
    if (this.state !== 'ended') return;
    this.state = 'title';
    const from = this.startPoint(this.startLap);
    this.reset(from.d, from.base);
    this.ui.clearTransient();
    this.ui.setMissions(this.missionRows());
    this.ui.setBook(this.bookFound(), BOOK_TOTAL);
    this.ui.showTitle(this.save.best > 0 ? sizeLabel(this.save.best) : null, this.save.coins);
    this.showPick();
  }

  // ------------------------------------------------------------------ upgrade shop

  /** One row per upgrade for the shop screen: level, effect so far, and the next price. */
  private shopRows(): ShopRow[] {
    return UPGRADES.map((def) => {
      const level = this.save.upgrades[def.id] ?? 0;
      const maxed = level >= UPGRADE_LEVELS;
      const cost = maxed ? 0 : upgradeCost(def, level);
      const percent = Math.round(level * def.perLevel * 100);
      return {
        id: def.id,
        name: def.name,
        blurb: def.blurb,
        level,
        levels: UPGRADE_LEVELS,
        effect: level > 0 ? `${percent}% ${def.effect}` : '',
        cost,
        maxed,
        affordable: !maxed && this.save.coins >= cost,
      };
    });
  }

  /** Buy the next level of an upgrade, if there are enough coins. */
  private buy(id: string): void {
    const def = UPGRADES.find((u) => u.id === id);
    if (!def) return;
    const level = this.save.upgrades[def.id] ?? 0;
    if (level >= UPGRADE_LEVELS) return;
    const cost = upgradeCost(def, level);
    if (this.save.coins < cost) return;
    this.save.coins -= cost;
    this.save.upgrades[def.id] = level + 1;
    writeSave(this.save);
    applyUpgrades(this.save.upgrades);
    this.audio.chime();
    // A bigger start shows straight away on the ball waiting on the title screen.
    if (this.state === 'title') {
      const from = this.startPoint(this.startLap);
      this.reset(from.d, from.base);
    }
    this.showShop();
    this.ui.setCoins(this.save.coins);
  }

  /** Open the shop, or redraw it after something was bought. */
  private showShop(): void {
    this.ui.openShop(this.save.coins, this.shopRows(), this.skinRows());
  }

  /** One tile per ball skin for the shop: its picture, price and whether it is owned or in use. */
  private skinRows(): SkinRow[] {
    return SKINS.map((def) => {
      const owned = this.save.skins.includes(def.id);
      return {
        id: def.id,
        name: def.name,
        picture: this.ball.swatch(def),
        price: def.price,
        owned,
        selected: this.save.skin === def.id,
        affordable: owned || this.save.coins >= def.price,
      };
    });
  }

  /** A skin was tapped in the shop: buy it if it isn't owned yet, then put it on the ball. */
  private pickSkin(id: string): void {
    const def = SKINS.find((s) => s.id === id);
    if (!def || this.save.skin === id) return;
    if (!this.save.skins.includes(id)) {
      if (this.save.coins < def.price) return;
      this.save.coins -= def.price;
      this.save.skins.push(id);
    }
    this.save.skin = id;
    writeSave(this.save);
    this.ball.setSkin(def);
    this.audio.chime();
    this.showShop();
    this.ui.setCoins(this.save.coins);
  }

  // ------------------------------------------------------------------ helpers

  private floatAtBall(text: string, big: boolean): void {
    _v.copy(this.ball.position);
    _v.y += this.ball.r * 1.5;
    _v.project(this.rig.camera);
    const w = this.frameEl.clientWidth;
    const h = this.frameEl.clientHeight;
    // Keep the whole text on screen: longer text needs a wider margin.
    const margin = Math.min(w / 2, 24 + text.length * (big ? 9 : 6.5));
    this.ui.floatText(text, clamp((_v.x * 0.5 + 0.5) * w, margin, w - margin), (-_v.y * 0.5 + 0.5) * h, big);
  }

  private vibrate(ms: number): void {
    if (!this.save.vibration) return;
    try {
      // Browsers only allow vibration after the player has touched the page.
      const active = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
      if ('vibrate' in navigator && (!active || active.hasBeenActive)) navigator.vibrate(ms);
    } catch {
      // not supported — ignore
    }
  }
}
