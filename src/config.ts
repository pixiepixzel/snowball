/**
 * SNOWBALL — every tuning number lives in this file.
 *
 * Naming: values ending in `_K` are multiples of a radius (the ball's, the camera's
 * smoothed radius, or the "design radius" the world expects at that distance), so the
 * game feels the same whether the ball is 50 cm or 100 m across.
 *
 * Units: metres and seconds. "Size" for an object is its effective radius.
 */
export const CONFIG = {
  // ---------------------------------------------------------------- Ball & growth
  /** Radius the ball starts with (m). */
  START_RADIUS: 0.25,
  /** An object sticks if its size < ball radius × this. */
  ABSORB_RATIO: 0.8,
  /** Multiplier on the volume gained from every absorbed object. Main growth dial. */
  VOLUME_GAIN: 0.6,
  /** Horizontal reach of the ball when touching things, as a fraction of its radius. */
  CONTACT_REACH: 0.85,
  /** Passive growth from rolling on plain snow: fraction of radius per second. */
  SNOW_GROWTH: 0.004,
  /** If the ball is smaller than designRadius × this, snow growth is boosted... */
  CATCHUP_BELOW: 0.6,
  /** ...by this factor. 1 = no help at all; 3 gives a run that has fallen behind a fighting chance. */
  CATCHUP_MULT: 3,
  /** Bonus growth (fraction of radius) for smashing through a wall. */
  GATE_BONUS: 0.04,
  /** Max objects drawn stuck to the ball. Oldest are dropped first. */
  MAX_STUCK: 150,
  /** How deep a stuck object is planted into the ball, as a fraction of its size. */
  STUCK_EMBED: 0.25,

  // ---------------------------------------------------------------- Obstacles
  /** Fraction of radius lost when hitting something too big. */
  HIT_RADIUS_LOSS: 0.16,
  /** How hard the ball is thrown back uphill (fraction of its normal speed). */
  HIT_BOUNCE: 0.55,
  /** Sideways knock on a hit (fraction of normal speed). */
  HIT_KNOCK: 0.55,
  /** Seconds of invulnerability after a hit. */
  HIT_INVULN: 0.9,
  /** Absolute smallest radius; knocked below this the ball shatters. */
  MIN_RADIUS: 0.1,
  /** Fraction of stuck objects knocked off on a hit. */
  HIT_KNOCK_OFF: 0.15,
  /** If the ball is wedged with no forward progress for this long (s), it rolls back to get free. */
  UNSTICK_TIME: 0.7,

  // ---------------------------------------------------------------- Movement
  /**
   * Forward speed = SPEED_K × radius ^ SPEED_POW (m/s). SPEED_K is roughly "ball radii
   * per second" at the start: 7 is a stroll, 14 is an endless-runner sprint.
   */
  SPEED_K: 14,
  SPEED_POW: 0.95,
  /** Extra speed gained over the whole run: 0.35 = 35 % faster at the bottom than the top. */
  SPEED_RAMP: 0.35,
  /** How quickly the ball reaches its target speed (1/s). */
  ACCEL_RATE: 3,
  /** Ball radii moved sideways per full screen-width of drag. */
  STEER_SENS: 10,
  /** Steering smoothing time (s). Higher = heavier, lower = twitchier. */
  STEER_SMOOTH: 0.12,
  /** Max sideways speed in radii per second. */
  STEER_MAX_SPEED: 14,
  /** How far (radii) the steering target may run ahead of the ball. */
  STEER_MAX_LEAD: 4.5,
  /** Keyboard steering speed in radii per second (desktop testing). */
  KEY_STEER_SPEED: 12,

  // ---------------------------------------------------------------- Camera
  /** Distance behind the ball, in radii. Bigger = ball looks smaller on screen. */
  CAM_DIST_K: 7.2,
  /**
   * Height above the snow, in radii. Higher looks down on the slope more, which spreads
   * the path ahead over more of the screen (easier to read at speed).
   */
  CAM_HEIGHT_K: 6.4,
  /** How far ahead of the ball the camera aims, in radii. Bigger = ball sits lower on screen. */
  CAM_LOOK_AHEAD_K: 10,
  /** How fast the camera zooms out to follow growth (1/s). Lower = longer, lazier zoom. */
  CAM_ZOOM_RATE: 1.2,
  /** Sideways follow speed (1/s) and how much of the ball's offset is followed. */
  CAM_X_RATE: 5,
  CAM_X_FOLLOW: 0.9,
  /** Forward follow speed (1/s); gives a little lag on bounces. */
  CAM_D_RATE: 9,
  /** Horizontal field of view in portrait, vertical field of view in landscape (deg). */
  CAM_PORTRAIT_HFOV: 47,
  CAM_LANDSCAPE_VFOV: 62,
  /** Extra field of view (deg) at full speed — the classic "rushing" stretch. */
  CAM_SPEED_FOV: 5,
  /** Camera bank when steering (radians at full sideways speed). */
  CAM_ROLL: 0.05,
  /** Shake decay (1/s) and overall strength (radii). */
  SHAKE_DECAY: 7,
  SHAKE_STRENGTH: 0.35,

  // ---------------------------------------------------------------- World
  /** Slope steepness: metres dropped per metre travelled. */
  SLOPE: 0.2,
  /** Lane half-width in design radii. */
  LANE_HALF_WIDTH_K: 7,
  /** Length of one terrain chunk in design radii, and pattern "beats" per chunk. */
  CHUNK_LEN_K: 34,
  BEATS_PER_CHUNK: 2,
  /** Ground mesh rows per chunk. */
  GROUND_ROWS: 6,
  /** Chunks are generated this far ahead / removed this far behind (camera radii). */
  SPAWN_AHEAD_K: 170,
  DESPAWN_BEHIND_K: 16,
  /** Fog start / end (camera radii). FOG_FAR_K must stay below SPAWN_AHEAD_K. */
  FOG_NEAR_K: 55,
  FOG_FAR_K: 150,
  /** No objects within this many start radii of the start line. */
  START_CLEAR_K: 5,

  // ---------------------------------------------------------------- Spawning
  /** Chance each edible object in a pattern is kept (>1 adds extra scatter). */
  SPAWN_DENSITY: 1.0,
  /** Chance each obstacle in a pattern is kept (>1 adds extra obstacles). */
  OBSTACLE_DENSITY: 1.0,
  /** Added to OBSTACLE_DENSITY by the bottom of the mountain, so the run keeps getting busier. */
  OBSTACLE_DENSITY_RAMP: 1.2,
  /**
   * Fairness: every beat keeps one straight line free of obstacles, wide enough for a
   * ball this many design radii across its reach. Lower = tighter squeezes, 0 = off.
   */
  CLEAR_LANE_K: 1.4,
  /** Decorative (non-colliding) objects on the banks per chunk. */
  SCENERY_PER_CHUNK: 7,
  /**
   * Objects are sorted into tiers by size ÷ design radius at the place they spawn:
   *   < TIER_MIN_Q        not spawned (too small to matter)
   *   ≤ TIER_CRUMB_MAX    crumb     (easy filler)
   *   ≤ TIER_FOOD_MAX     food      (solid growth)
   *   ≤ TIER_TARGET_MAX   target    ("almost absorbable" — worth aiming for)
   *   ≤ OBSTACLE_MAX_Q    obstacle  (dodge it)
   */
  TIER_MIN_Q: 0.1,
  TIER_CRUMB_MAX: 0.3,
  TIER_FOOD_MAX: 0.55,
  TIER_TARGET_MAX: 0.85,
  OBSTACLE_MAX_Q: 3.5,
  /**
   * Obstacles are at least this big compared with the design radius. The gap between
   * TIER_TARGET_MAX and this keeps "almost edible" obstacles off the slope, which stops
   * a ball that is slightly ahead from suddenly eating everything and running away.
   */
  OBSTACLE_MIN_Q: 1.3,
  /** Downhill speed of skiers, in their own sizes per second. */
  SKIER_SPEED: 4,

  // ---------------------------------------------------------------- Juice
  /** Pop scale-bounce: base kick plus extra per unit of (object size ÷ ball radius). */
  POP_BASE: 1.6,
  POP_PER_Q: 5.5,
  /** Spring stiffness and damping of the pop. */
  POP_STIFFNESS: 340,
  POP_DAMPING: 15,
  /** Absorbs with size ÷ radius above this get shake + floating text. */
  BIG_ABSORB_Q: 0.45,
  /** Minimum seconds between floating "+size" texts (the gain in between is added up). */
  FLOAT_TEXT_GAP: 0.7,
  /** Slow-motion on landmark absorbs: time scale and real-time duration (s). */
  SLOWMO_SCALE: 0.28,
  SLOWMO_TIME: 0.55,
  /** A landmark only counts if it is at least this big compared with the ball... */
  LANDMARK_MIN_Q: 0.4,
  /** ...and slow-motion can't trigger again for this many seconds, so it stays special. */
  SLOWMO_COOLDOWN: 2.5,
  /** Tiny freeze-frame when hitting an obstacle (s). */
  HITSTOP_TIME: 0.07,
  /** Seconds between absorbs that still count as a combo (raises the pop pitch). */
  COMBO_WINDOW: 0.6,
  /** Snow spray particles per second at full speed, and particle pool size. */
  SPRAY_RATE: 55,
  MAX_PARTICLES: 420,
  /** Wind streaks rushing past per second at full speed (0 = off). */
  SPEED_LINE_RATE: 16,
  /** Trail: ribbon sections kept, spacing (radii) and half-width (radii). */
  TRAIL_SECTIONS: 40,
  TRAIL_STEP_K: 0.5,
  TRAIL_HALF_WIDTH_K: 0.6,

  // ---------------------------------------------------------------- Endless laps
  /**
   * After the dam comes a new world (the Lost World, then Space — see worlds.ts), and
   * after those the game makes up a new "remix" world every lap, for ever. Every lap is
   * scaled up so the ball keeps growing, and each one is a little harder.
   */
  /** Walls need this much more of the expected size per lap (0.007 = +0.7 % each lap). */
  LAP_GATE_STEP: 0.007,
  /** Extra obstacle density per lap. */
  LAP_OBSTACLE_STEP: 0.06,
  /**
   * Walls and obstacles stop getting harder after this many laps, so the made-up worlds
   * stay playable for ever (9 = the first remix world, after the nine hand-made ones, is
   * as hard as it gets).
   */
  LAP_HARDER_UNTIL: 9,
  /** Extra speed per lap, and the most it can add in total (0.18 = stops rising after lap 9). */
  LAP_SPEED_STEP: 0.02,
  LAP_SPEED_MAX: 0.18,

  // ---------------------------------------------------------------- Coins
  /**
   * Coins earned by a run: COIN_PER_DOUBLING × (number of times the ball doubled in size)
   * raised to COIN_POWER. Reaching the dam is about 7.6 doublings, roughly 125 coins.
   */
  COIN_PER_DOUBLING: 9,
  COIN_POWER: 1.3,

  // ---------------------------------------------------------------- Secret objects
  /** Chance per beat that a secret object appears (about one a minute at 0.012). */
  SECRET_CHANCE: 0.012,
  /** How big they are, in design radii. They can always be absorbed, whatever the ball's size. */
  SECRET_SIZE_K: 0.9,
  /** Golden snowflake: coins added to the run. */
  SECRET_GOLD_COINS: 40,
  /** Yeti: seconds of smashing through anything, and how much snow each smash adds (ball radii). */
  YETI_RAGE_TIME: 7,
  YETI_SMASH_GROW_K: 0.35,
  /** UFO: seconds of tractor beam, how far it reaches and how fast it drags things in (ball radii). */
  UFO_BEAM_TIME: 9,
  UFO_BEAM_RANGE_K: 13,
  UFO_BEAM_PULL_K: 9,

  // ---------------------------------------------------------------- Jump
  /** Tap to hop. Apex height in ball radii, and gravity in radii per second². */
  JUMP_HEIGHT_K: 2.3,
  JUMP_GRAVITY_K: 42,
  /** Seconds before the ball can jump again after landing. */
  JUMP_COOLDOWN: 0.35,
  /** A press shorter than this (s) that moves less than this (fraction of screen width) is a tap. */
  TAP_MAX_TIME: 0.25,
  TAP_MAX_MOVE: 0.035,
  /** The ball sails over an object while its underside is above this fraction of the object's height. */
  JUMP_CLEAR_K: 0.75,

  // ---------------------------------------------------------------- Hazard: avalanche
  /** The avalanche starts this many seconds into the run... */
  AVALANCHE_DELAY: 8,
  /** ...and rolls at this fraction of the ball's own cruising speed. Above ~0.9 is brutal. */
  AVALANCHE_SPEED: 0.87,
  /** It never falls further behind than this many ball radii, so it is always a threat. */
  AVALANCHE_MAX_GAP_K: 27,
  /** Smashing a wall pushes it back to at least this gap (radii). */
  AVALANCHE_GATE_GAP_K: 24,
  /** Below this gap (radii) the warning overlay, rumble and camera pull-back fade in. */
  AVALANCHE_WARN_K: 16,

  // ---------------------------------------------------------------- Hazard: snowploughs
  /** Chance per beat (from the Ski Resort on), size in design radii, speed as a fraction of cruise speed. */
  PLOUGH_CHANCE: 0.11,
  PLOUGH_SIZE_K: 1.3,
  PLOUGH_SPEED: 0.45,
  /** Fraction of radius scraped off on contact. */
  PLOUGH_LOSS: 0.12,

  // ---------------------------------------------------------------- Hazard: rivers
  /** Scenes (0 = Summit ... 6 = City) that have a river, and how far through the scene it lies. */
  RIVER_ZONES: [1, 3, 4, 5],
  RIVER_AT: 0.55,
  /** River width along the slope, in design radii. Must be jumpable: keep below ~8. */
  RIVER_WIDTH_K: 5,
  /** Ball radius needed to freeze it, as a fraction of the design radius there. */
  RIVER_NEED_K: 0.85,
  /** Half-width of the bridge in design radii. */
  BRIDGE_HALF_K: 2.4,
  /** Growth bonus (fraction of radius) for freezing a river. */
  RIVER_BONUS: 0.04,

  // ---------------------------------------------------------------- Hazard: ramps
  /** Chance per beat (from the Forest on), size in design radii, and launch height in ball radii. */
  RAMP_CHANCE: 0.1,
  RAMP_SIZE_K: 1.6,
  RAMP_HEIGHT_K: 4.5,
  /** Landing with sideways speed below this fraction of max steering speed is "clean". */
  LANDING_CLEAN: 0.22,
  /**
   * Landing off a ramp slams the ground. Everything within this many ball radii is
   * absorbed if it is small enough, and smashed to bits if it is not. A clean landing
   * reaches further than a sloppy one.
   */
  SLAM_RADIUS_K: 5.5,
  SLAM_ROUGH_RADIUS_K: 3.5,
  /** Snow gained from each thing a slam smashes, as if it were this many ball radii across. */
  SLAM_GROW_K: 0.35,

  // ---------------------------------------------------------------- Audio
  MASTER_VOLUME: 0.8,
  /** How loud the music is next to the sound effects (0 = off, 1 = as loud as they are). */
  MUSIC_VOLUME: 0.5,
  /** How much the music speeds up when the chaser is right behind you (0.14 = up to 14 %). */
  MUSIC_URGENCY: 0.14,

  // ---------------------------------------------------------------- Rendering
  /**
   * Real cast shadows from the sun. The biggest single visual upgrade, and the first
   * thing switched off automatically if the device can't hold its frame rate.
   */
  SHADOWS: true,
  /** Shadow texture size (1024 is right for phones; 2048 is crisper on a desktop). */
  SHADOW_MAP_SIZE: 1024,
  /** How far around the ball shadows are drawn, in camera radii. */
  SHADOW_RANGE_K: 34,
  /** Overall brightness after tone mapping. */
  EXPOSURE: 1.05,
  /** Snowflakes drifting past the camera (0 = off). */
  SNOWFALL: 140,

  /** Cap on devicePixelRatio. 2 is a good balance for mid-range phones. */
  MAX_PIXEL_RATIO: 2,
  /**
   * Adaptive resolution: if frames take longer than SLOW_FRAME_MS for a while, the
   * render resolution steps down (never below MIN_PIXEL_RATIO) to hold the frame rate.
   */
  ADAPTIVE_RESOLUTION: true,
  MIN_PIXEL_RATIO: 1,
  SLOW_FRAME_MS: 21,
};

export interface ZoneConfig {
  name: string;
  /** Length of the scene in metres (about 20 s of rolling each). */
  length: number;
  /** Ball radius the scene is designed around at its start (m). */
  startRadius: number;
  /**
   * The wall at the end of the scene: which object it is (an id from objects.ts), what
   * to call it, and the ball radius needed to smash through. Smaller than that and the
   * run ends there. THIS IS THE MAIN DIFFICULTY DIAL: raise gateRadius to demand a
   * cleaner run, lower it to be forgiving.
   */
  gate: string;
  gateName: string;
  gateRadius: number;
  /** Sky colour overhead and at the horizon (the horizon colour is also the fog). */
  skyTop: number;
  horizon: number;
  /** Ground colours: the lane you roll on, the low and mid banks, and the high ridges. */
  lane: number;
  bankLow: number;
  bankMid: number;
  ridge: number;
  /** Sun colour and overall brightness (1 = midday). */
  sun: number;
  light: number;
}

/**
 * The run: seven scenes, each ending in a wall. The ball is expected to roughly double
 * in size per scene (startRadius → next scene's startRadius).
 */
export const ZONES: ZoneConfig[] = [
  {
    name: 'Summit', length: 95, startRadius: 0.25, gate: 'iceWall', gateName: 'ice wall', gateRadius: 0.33,
    skyTop: 0x4f9dff, horizon: 0xd8ecff, lane: 0xf5f9ff, bankLow: 0xe3ecf8, bankMid: 0xcfdcef, ridge: 0x8f9aaa, sun: 0xfff3dc, light: 1,
  },
  {
    name: 'Forest', length: 250, startRadius: 0.5, gate: 'logWall', gateName: 'log pile', gateRadius: 0.9,
    skyTop: 0x4c9fc0, horizon: 0xd2ecdc, lane: 0xf0f7ec, bankLow: 0xd9e8d2, bankMid: 0x7fa572, ridge: 0x486a48, sun: 0xfff6d8, light: 0.97,
  },
  {
    name: 'Frozen Lake', length: 550, startRadius: 1.1, gate: 'plankWall', gateName: 'fence', gateRadius: 1.9,
    skyTop: 0x2f86e6, horizon: 0xc6ecff, lane: 0x9fd6f2, bankLow: 0xeaf4fc, bankMid: 0xd4e5f5, ridge: 0x8ea3bd, sun: 0xffffff, light: 1.05,
  },
  {
    name: 'Ski Resort', length: 1180, startRadius: 2.4, gate: 'netWall', gateName: 'safety net', gateRadius: 3.2,
    skyTop: 0x3d86f0, horizon: 0xe9f1ff, lane: 0xffffff, bankLow: 0xeaf1fb, bankMid: 0xd5e0f0, ridge: 0x7d8898, sun: 0xfff0d0, light: 1.02,
  },
  {
    name: 'Village', length: 2400, startRadius: 5, gate: 'stoneWall', gateName: 'stone wall', gateRadius: 8,
    skyTop: 0x6f9be8, horizon: 0xffe2c0, lane: 0xf6ecdb, bankLow: 0xeadcc6, bankMid: 0xc6b294, ridge: 0x8a7860, sun: 0xffd296, light: 0.98,
  },
  {
    name: 'Town', length: 5100, startRadius: 10, gate: 'roadblock', gateName: 'roadblock', gateRadius: 17,
    skyTop: 0x6672cc, horizon: 0xffb892, lane: 0x8f97a6, bankLow: 0xead8d0, bankMid: 0xc7afaa, ridge: 0x7a6870, sun: 0xffb078, light: 0.93,
  },
  {
    name: 'City', length: 11200, startRadius: 22, gate: 'dam', gateName: 'dam', gateRadius: 38,
    skyTop: 0x2c2f72, horizon: 0xe58aa0, lane: 0x5f6678, bankLow: 0xb8b0c6, bankMid: 0x8d87a8, ridge: 0x5a567a, sun: 0xffa0b4, light: 0.86,
  },
];

/** Design radius at the very bottom of the mountain. */
export const END_RADIUS = 48;

// ---------------------------------------------------------------- First-time hints
/**
 * One-line tips, each shown once ever, the first time the thing it explains turns up
 * (game.ts `checkHints` decides when). Keep them short: they are read at speed.
 */
export const HINTS = {
  steer: 'Drag left or right to steer',
  absorb: 'Roll over small things to grow',
  ring: 'Red ring means too big. Go round!',
  wall: 'Fill the bar to smash the wall',
  chaser: 'Hitting things lets it catch up',
  riverSmall: 'Too small! Take the bridge or jump',
  riverBig: "You're big enough to freeze the river",
  ramp: 'Ramps launch you. Land to SLAM!',
  plough: 'Dodge it, or tap to jump over',
  secret: 'Gold disc: grab it for a power!',
};
export type HintId = keyof typeof HINTS;
/** The basics, which someone who has played before the hints existed already knows. */
export const BASIC_HINTS: HintId[] = ['steer', 'absorb', 'ring', 'wall'];
/** Seconds a hint stays up. */
export const HINT_TIME = 4.5;

// ---------------------------------------------------------------- Upgrades
/**
 * Permanent upgrades bought with coins between runs. Each has UPGRADE_LEVELS levels; level
 * n costs baseCost × costGrowth^n (rounded), and every level adds `perLevel` to its effect.
 * What each one changes is in perks.ts.
 */
export interface UpgradeDef {
  id: 'start' | 'sticky' | 'tough' | 'grip' | 'luck';
  name: string;
  /** One line for the shop. */
  blurb: string;
  baseCost: number;
  costGrowth: number;
  /** Effect per level, as a fraction (0.04 = 4 % per level). */
  perLevel: number;
  /** How the shop words the effect: "+12 % bigger", "-15 % lost". */
  effect: string;
}

export const UPGRADE_LEVELS = 10;

export const UPGRADES: UpgradeDef[] = [
  { id: 'start', name: 'Head start', blurb: 'Begin every run bigger', baseCost: 30, costGrowth: 1.5, perLevel: 0.04, effect: 'bigger at the start' },
  { id: 'sticky', name: 'Sticky snow', blurb: 'Grow more from everything you absorb', baseCost: 30, costGrowth: 1.5, perLevel: 0.03, effect: 'more growth' },
  { id: 'tough', name: 'Packed ice', blurb: 'Lose less size when you hit something', baseCost: 30, costGrowth: 1.5, perLevel: 0.05, effect: 'less size lost' },
  { id: 'grip', name: 'Grip', blurb: 'Steer quicker and tighter', baseCost: 30, costGrowth: 1.5, perLevel: 0.03, effect: 'quicker steering' },
  { id: 'luck', name: 'Lucky charm', blurb: 'Secret objects turn up more often', baseCost: 30, costGrowth: 1.5, perLevel: 0.12, effect: 'more secrets' },
];

// ---------------------------------------------------------------- Size milestones
/**
 * Things the ball outgrows. When its diameter passes one, the game says so: "Bigger than
 * a house!". Each entry is [size in metres, what it is]; keep them in order of size.
 */
export const MILESTONES: [number, string][] = [
  [1.8, 'a person'],
  [4.5, 'a car'],
  [10, 'a house'],
  [30, 'a blue whale'],
  [93, 'the Statue of Liberty'],
  [330, 'the Eiffel Tower'],
  [830, "the world's tallest building"],
  [8849, 'Mount Everest'],
  [40e3, 'a whole city'],
  [1000e3, 'a country'],
  [3474e3, 'the Moon'],
  [6779e3, 'Mars'],
  [12742e3, 'the Earth'],
  [139820e3, 'Jupiter'],
  [1.39e9, 'the Sun'],
  [3e11, "the Earth's orbit"],
  [9e12, 'the Solar System'],
  [9.461e15, 'a light year'],
  [1e21, 'the Milky Way'],
  [8.8e26, 'the whole universe'],
];

// ---------------------------------------------------------------- Twists
/**
 * A twist changes one rule for a whole world. The made-up "remix" worlds after Space get
 * one each (worlds.ts picks them, using every twist before repeating any); the three
 * hand-made worlds have none. Every number is a multiplier on the normal value from
 * CONFIG, except `wind`. Leave a field out to leave that rule alone.
 */
export interface Twist {
  /** Shown when the world begins and under the scene name: "Low gravity". */
  name: string;
  /** One line saying what it does. */
  hint: string;
  /** Rolling speed. */
  speed: number;
  /** Width of the lane (and the whole valley). */
  lane: number;
  /** Height of a tap-jump, and how hard gravity pulls the ball back down (jumps and ramps). */
  jump: number;
  gravity: number;
  /** How far you can see before the fog closes in. */
  fog: number;
  /** How often things charge up the slope at you, and how often there is a ramp. */
  plough: number;
  ramp: number;
  /** How sluggishly the ball answers the steering (bigger = more slide). */
  slide: number;
  /** Sideways wind, in ball radii per second at full strength. It swings left and right. */
  wind: number;
  /** Size the walls demand. Below 1 makes up for a twist that costs the player some growth. */
  wall: number;
}

const twist = (name: string, hint: string, change: Partial<Twist>): Twist => ({
  name,
  hint,
  speed: 1,
  lane: 1,
  jump: 1,
  gravity: 1,
  fog: 1,
  plough: 1,
  ramp: 1,
  slide: 1,
  wind: 0,
  wall: 1,
  ...change,
});

/** No twist: the normal rules. */
export const NO_TWIST = twist('', '', {});

/** The first remix worlds get these in this order; once all have been used the order is shuffled. */
export const TWISTS: Twist[] = [
  twist('Low gravity', 'Jumps float for ages', { jump: 1.6, gravity: 0.38, ramp: 2 }),
  twist('Canyon', 'The lane is narrow', { lane: 0.74 }),
  twist('Crosswind', 'The wind shoves you sideways', { wind: 2.0, wall: 0.92 }),
  twist('Turbo', 'Everything is faster', { speed: 1.14, wall: 0.96 }),
  twist('Fog', "You can't see far ahead", { fog: 0.4 }),
  twist('Ramp park', 'Ramps everywhere', { ramp: 3, wall: 0.92 }),
  twist('Black ice', 'The ball slides when you steer', { slide: 1.6, wall: 0.93 }),
  twist('Stampede', 'More things charge at you', { plough: 2.2, wall: 0.93 }),
];

/** Seconds for the crosswind to swing one way and back. */
export const WIND_PERIOD = 7;
