/**
 * The worlds. Each lap of the endless run is one world: seven scenes ending in seven
 * walls. The numbers (how long a scene is, how big the ball should be, how big it must be
 * for the wall) are the same for every world and live in ZONES in config.ts. What changes
 * is everything you see: scene names, ground, sky, light, walls, objects, and the thing
 * chasing you.
 *
 * To add a world: add an entry here, give it objects in objects.ts with `world` set to
 * its index (the `themed` helper copies the balance from a mountain object), and walls
 * for each scene.
 *
 * WORLD_ORDER (below the list) says what order they are played in.
 *
 * After the last hand-made world the game makes its own: "remix" worlds, one per lap, for
 * ever. A remix takes each of its seven scenes from a random hand-made world, repaints
 * them all in one colour style ("Neon", "Frozen", "Lava"...), and mixes the objects of
 * two or three worlds, so you get a Neon Swamp with rockets in it, or a Frozen Moon full
 * of dinosaurs. Each remix also changes one rule (a "twist": low gravity, fog, a narrow
 * lane... see TWISTS in config.ts). See REMIX_STYLES and buildRemix below.
 */
import { Color, SRGBColorSpace } from 'three';
import { NO_TWIST, TWISTS, ZONES, type Twist, type ZoneConfig } from './config';
import type { MusicStyle } from './music';
import { mulberry32 } from './util';

// Scales, as semitones above the key note.
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const LYDIAN = [0, 2, 4, 6, 7, 9, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10];
/** The "snake charmer" scale. */
const PHRYGIAN_DOMINANT = [0, 1, 4, 5, 7, 8, 10];

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];

/** A world's tune. Anything left out takes the plain default below. */
const tune = (style: Partial<MusicStyle> & Pick<MusicStyle, 'bpm' | 'root' | 'scale' | 'chords' | 'lead'>): MusicStyle => ({
  beats: 4,
  octave: 0,
  busy: 0.6,
  hold: 1,
  bass: 'sub',
  bassLine: 'roots',
  comp: 'harp',
  compLine: 'broken',
  pad: false,
  drums: 'none',
  extra: 'none',
  echo: 0.2,
  level: 1,
  ...style,
});

/** How one scene looks. */
export type SceneLook = Pick<ZoneConfig, 'name' | 'gate' | 'gateName' | 'skyTop' | 'horizon' | 'lane' | 'bankLow' | 'bankMid' | 'ridge' | 'sun' | 'light'>;

export type ChaseStyle = 'tumble' | 'flood' | 'cloud' | 'swarm';

/** Specks drifting past the camera: snow, sand, bubbles, fireflies. */
export interface Weather {
  color: number;
  /** Size of each speck (1 = a snowflake). */
  size: number;
  /** How fast they fall (negative = they rise, like bubbles). */
  fall: number;
  /** Steady sideways drift, as in blowing sand. */
  blow: number;
}

export interface Scenery {
  /**
   * The far scenery on the horizon:
   *   'peaks' snowy mountains, 'dunes' low sand hills, 'hills' round green hills,
   *   'scoops' round hills with icing on top, 'spires' thin dark spikes,
   *   'blocks' stacks of toy blocks, 'none' open sky.
   */
  backdrop: 'peaks' | 'dunes' | 'hills' | 'scoops' | 'spires' | 'blocks' | 'none';
  /** White caps on the ridges beside the lane (snow, icing, cloud tops). */
  caps: boolean;
  /** Pattern on the ground: 'snow' drifts and glints, 'sand' ripples, 'soft' mottled, 'tiles' a play mat. */
  ground: 'snow' | 'sand' | 'soft' | 'tiles';
  /** What drifts through the air, or null for nothing. */
  weather: Weather | null;
  /** How far you can see (1 = normal, lower = murkier). */
  fog: number;
}

export interface WorldConfig {
  /** Short name used in WORLD_ORDER and in the ?demo= links. */
  key: string;
  name: string;
  /** One entry per scene, in order (same count as ZONES). */
  scenes: SceneLook[];
  /** River colour while flowing, and once the ball has frozen it. */
  water: number;
  ice: number;
  /** Object id of this world's "snowplough" (the thing that charges up the slope at you). */
  plough: string;
  /** Object ids of this world's ramp and of the bridge over its rivers. */
  ramp: string;
  bridge: string;
  /** A wash of colour over every object in the world (remix worlds only; none if left out). */
  tint?: number;
  /**
   * The thing chasing the ball: its name on the meter, its colours, and how it moves.
   *   'tumble'  boulders rolling and bouncing (avalanche)
   *   'flood'   a low, wide, rolling wave (lava, chocolate, water)
   *   'cloud'   a tall bank of big puffs (sandstorm, thunderstorm)
   *   'swarm'   thin shapes hovering and darting (ghosts)
   */
  chase: { label: string; color: number; glow: number; style: ChaseStyle };
  /** Everything around the lane that isn't an object: far scenery, weather, ground. */
  scenery: Scenery;
  /** The world's tune: tempo, key, chords and sounds (music.ts makes the notes up from these). */
  music: MusicStyle;
  /** Starry sky instead of clouds. */
  stars: boolean;
  /**
   * Which hand-made worlds (indices into WORLDS) its objects come from. A hand-made world
   * names only itself; a remix names two or three, and `mixSeed` decides which of them
   * each kind of object is taken from.
   */
  sources: number[];
  mixSeed: number;
  /** The rule this world changes (see TWISTS in config.ts). NO_TWIST for the hand-made worlds. */
  twist: Twist;
}

const look = (
  name: string,
  gate: string,
  gateName: string,
  skyTop: number,
  horizon: number,
  lane: number,
  bankLow: number,
  bankMid: number,
  ridge: number,
  sun: number,
  light: number,
): SceneLook => ({ name, gate, gateName, skyTop, horizon, lane, bankLow, bankMid, ridge, sun, light });

export const WORLDS: WorldConfig[] = [
  {
    key: 'mountain',
    name: 'Snowy Mountain',
    scenes: ZONES,
    water: 0x2f86e0,
    ice: 0xeaf6ff,
    plough: 'plough',
    ramp: 'ramp',
    bridge: 'bridge',
    chase: { label: 'Avalanche', color: 0xffffff, glow: 0x55617a, style: 'tumble' },
    scenery: { backdrop: 'peaks', caps: true, ground: 'snow', weather: { color: 0xffffff, size: 1, fall: 1.6, blow: 0 }, fog: 1 },
    // A sleigh ride: glockenspiel tune, plucked bass bouncing along, sleigh bells jingling.
    music: tune({ bpm: 116, root: 60, scale: MAJOR, chords: [0, 4, 5, 3], lead: 'bell', octave: 1, bass: 'pizz', bassLine: 'bounce', comp: 'harp', compLine: 'broken', drums: 'sleigh', echo: 0.18, level: 2.3 }),
    stars: false,
    sources: [0],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'lost',
    name: 'Lost World',
    scenes: [
      look('Jungle', 'bambooWall', 'bamboo fence', 0x3aa0d8, 0xd8f0c8, 0x86c96a, 0x6fb558, 0x3f8f4a, 0x2d6a3a, 0xfff2c0, 1.0),
      look('Fern Valley', 'logWall', 'fallen trunks', 0x4ab0c8, 0xc8f0e0, 0x9ad88a, 0x7cc474, 0x4a9a5a, 0x356f48, 0xfff6d8, 1.0),
      look('Swamp', 'vineWall', 'vine wall', 0x5a9a8a, 0xb8d8b0, 0x7a9a5a, 0x66864c, 0x4a6a3c, 0x34503a, 0xe8f0c0, 0.94),
      look('Nesting Grounds', 'boneWall', 'bone fence', 0x58a8e0, 0xf8e8c0, 0xd8c088, 0xc8ac74, 0xa88a58, 0x7a6644, 0xffe0a0, 1.0),
      look('Bone Desert', 'redRockWall', 'rock slide', 0x6aa0e8, 0xffe0b0, 0xe8d0a0, 0xd8b888, 0xb89060, 0x8a6a48, 0xffd890, 1.04),
      look('Volcano', 'ashWall', 'ash heap', 0x7a5a78, 0xff9a6a, 0x7a6a66, 0x645452, 0x4e3e3e, 0x38282a, 0xff9060, 0.94),
      look('Lava Field', 'lavaWall', 'lava wall', 0x3a2030, 0xff6a3a, 0x5a484a, 0x46363a, 0x8a321c, 0x2a1a1e, 0xff7040, 0.92),
    ],
    water: 0x2aa6b8,
    ice: 0xeaf6ff,
    plough: 'stampede',
    ramp: 'rampLost',
    bridge: 'bridgeLost',
    chase: { label: 'Lava flow', color: 0xff7a2a, glow: 0xaa2a00, style: 'flood' },
    scenery: { backdrop: 'hills', caps: false, ground: 'soft', weather: { color: 0xeaf2a0, size: 0.7, fall: 0.25, blow: 0.3 }, fog: 1 },
    // The jungle: a pan flute over a marimba pattern, low drums and a shaker.
    music: tune({ bpm: 100, root: 57, scale: MINOR_PENTATONIC, chords: [0, 0, 3, 2], lead: 'flute', octave: 1, busy: 0.5, comp: 'marimba', compLine: 'ostinato', drums: 'toms', echo: 0.22 }),
    stars: false,
    sources: [1],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'space',
    name: 'Space',
    scenes: [
      look('Low Orbit', 'junkWall', 'space junk', 0x05061a, 0x2a4a9a, 0x4a5a7c, 0x3c4a68, 0x2e3a54, 0x1e2840, 0xffffff, 1.05),
      look('The Moon', 'moonWall', 'crater rim', 0x02030a, 0x23263a, 0xb8bcc8, 0x9a9eaa, 0x7a7e8c, 0x5a5e6c, 0xfff8e8, 1.05),
      look('Asteroid Belt', 'laserWall', 'laser fence', 0x08051a, 0x34205a, 0x7a6a8a, 0x645674, 0x4e4260, 0x362e48, 0xe8d8ff, 1.02),
      look('Red Planet', 'marsWall', 'canyon wall', 0x1a0a14, 0xd8744a, 0xc8683a, 0xb05830, 0x8a4226, 0x60301e, 0xffc8a0, 1.0),
      look('Planet Rings', 'ringWall', 'ice ring', 0x0a1030, 0x4ab0c8, 0x5a8aaa, 0x487694, 0x38607c, 0x28465e, 0xc8f0ff, 1.02),
      look('The Sun', 'plasmaWall', 'solar flare', 0x3a1000, 0xffb030, 0xd88a2a, 0xc0721e, 0x9a5014, 0x70340c, 0xfff0a0, 1.08),
      look('Deep Space', 'voidWall', 'event horizon', 0x000004, 0x3a1a6a, 0x3a2e5e, 0x2e2450, 0x4a348a, 0x1a1436, 0xd0c0ff, 1.0),
    ],
    water: 0xc040e0,
    ice: 0xf6e4ff,
    plough: 'meteor',
    ramp: 'rampSpace',
    bridge: 'bridgeSpace',
    chase: { label: 'Black hole', color: 0x3a2466, glow: 0x6a2ad0, style: 'cloud' },
    scenery: { backdrop: 'none', caps: false, ground: 'soft', weather: null, fog: 1 },
    // Deep space: a held drone and strings, a quiet computer arpeggio, and a few far-off
    // pings that echo away. No drums.
    music: tune({ bpm: 90, root: 57, scale: DORIAN, chords: [0, 3, 0, 6], lead: 'bell', octave: 1, busy: 0.3, hold: 2, bassLine: 'drone', comp: 'chip', compLine: 'arp', pad: true, echo: 0.45 }),
    stars: true,
    sources: [2],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'candy',
    name: 'Candy World',
    scenes: [
      look('Sprinkle Hills', 'caneWall', 'candy cane fence', 0x6ac8ff, 0xffe0f0, 0xfff0f6, 0xffd8e8, 0xffb0d0, 0xd870a8, 0xfff6e8, 1.03),
      look('Lollipop Woods', 'waferWall', 'wafer wall', 0x5ab8f0, 0xe8f8e0, 0xe8f8d8, 0xc8eeb8, 0x8ad890, 0x4aa86a, 0xfff6e8, 1.0),
      look('Soda Lake', 'jellyWall', 'jelly wall', 0x4aa8f0, 0xd0f0ff, 0xa8e8f0, 0xe8f8ff, 0xffc0dc, 0xb080c8, 0xffffff, 1.03),
      look('Cookie Village', 'cookieWall', 'cookie wall', 0x7ab0f0, 0xffecc8, 0xf8e4c0, 0xecd0a0, 0xd0a870, 0x9a6a40, 0xfff0d0, 1.0),
      look('Gingerbread Town', 'gingerWall', 'gingerbread wall', 0x8a90e0, 0xffd0b0, 0xf0d0a8, 0xd8a878, 0xb8743a, 0x7a4a2a, 0xffd8a0, 0.98),
      look('Chocolate Canyon', 'chocWall', 'chocolate wall', 0x7a5a90, 0xffb890, 0xa87850, 0x8a5a36, 0x6a3e22, 0x4a2a16, 0xffc890, 0.96),
      look('Cake Castle', 'cakeWall', 'giant cake', 0xb070c8, 0xffc0e0, 0xffe0f0, 0xffc0dc, 0xff8ac0, 0xb04a90, 0xfff0f6, 1.0),
    ],
    water: 0xff8ac0,
    ice: 0xfff0f6,
    plough: 'gobstopper',
    ramp: 'rampCandy',
    bridge: 'bridgeCandy',
    chase: { label: 'Chocolate flood', color: 0x7a4a2a, glow: 0x3a1e0e, style: 'flood' },
    scenery: { backdrop: 'scoops', caps: true, ground: 'soft', weather: { color: 0xffa8d4, size: 0.9, fall: 0.9, blow: 0 }, fog: 1 },
    // Bubblegum arcade music: a quick chirpy tune, a busy arpeggio, a bouncing bass and claps.
    music: tune({ bpm: 138, root: 65, scale: MAJOR, chords: [0, 3, 4, 0], lead: 'chip', octave: 1, busy: 0.8, hold: 0.5, bassLine: 'bounce', comp: 'chip', compLine: 'arp', drums: 'bounce', echo: 0.08 }),
    stars: false,
    sources: [3],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'desert',
    name: 'Ancient Desert',
    scenes: [
      look('Dunes', 'stakeWall', 'stake fence', 0x4aa0e8, 0xffe8b8, 0xf0d8a0, 0xe8c888, 0xd8b070, 0xb0844a, 0xfff0c0, 1.05),
      look('Oasis', 'mudWall', 'mud-brick wall', 0x3a98e0, 0xd8f0d0, 0xe8dca8, 0xc8d890, 0x7ab85a, 0x4a8a44, 0xfff6d8, 1.02),
      look('Caravan Trail', 'sandRockWall', 'rock fall', 0x5aa8e8, 0xffdca0, 0xe8c890, 0xd8b074, 0xc0905a, 0x8a6238, 0xffe8b0, 1.03),
      look('Bazaar', 'columnWall', 'colonnade', 0x6a9ae0, 0xffd0a0, 0xe0c498, 0xd0a878, 0xc87a4a, 0x8a5a3a, 0xffdca0, 1.0),
      look('Valley of Kings', 'tombWall', 'tomb wall', 0x7a80d0, 0xffb880, 0xd8b080, 0xc09060, 0xa87048, 0x70482e, 0xffc080, 0.97),
      look('Sphinx Road', 'obeliskWall', 'row of obelisks', 0x5a5ab0, 0xff9a70, 0xc8a070, 0xb08050, 0x906040, 0x5a3a2a, 0xffb070, 0.94),
      look('Great Pyramids', 'pyramidWall', 'pyramid wall', 0x2a2a6a, 0xf08a78, 0xb89068, 0x9a7450, 0x7a5a48, 0x4a3438, 0xffa890, 0.9),
    ],
    water: 0x2aa6c8,
    ice: 0xeaf6ff,
    plough: 'chariotCharge',
    ramp: 'rampDesert',
    bridge: 'bridgeDesert',
    chase: { label: 'Sandstorm', color: 0xe0b878, glow: 0x8a6238, style: 'cloud' },
    scenery: { backdrop: 'dunes', caps: false, ground: 'sand', weather: { color: 0xecd096, size: 0.8, fall: 0.15, blow: 2.4 }, fog: 1 },
    // The bazaar: a reed pipe in the snake-charmer scale over a drone, a plucked lute and
    // hand drums.
    music: tune({ bpm: 96, root: 62, scale: PHRYGIAN_DOMINANT, chords: [0, 1, 0, 6], lead: 'reed', hold: 0.9, bassLine: 'drone', comp: 'pluck', compLine: 'ostinato', drums: 'darbuka' }),
    stars: false,
    sources: [4],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'sea',
    name: 'Under the Sea',
    scenes: [
      look('Shallows', 'coralWall', 'coral reef', 0x2a9ad8, 0xa8f0f0, 0xe8e0b0, 0xd8d49a, 0x7ad0c0, 0x3a9aa8, 0xeaffff, 1.03),
      look('Coral Reef', 'kelpWall', 'kelp curtain', 0x1e88d0, 0x80e0e8, 0xd8d8a8, 0xffb0a8, 0xff7a6a, 0xb04a6a, 0xeaffff, 1.02),
      look('Kelp Forest', 'fishNet', 'fishing net', 0x1a78b8, 0x6ad0c0, 0xb8d0a0, 0x8ac08a, 0x3f9a5a, 0x246a48, 0xd8fff0, 1.0),
      look('Shipwreck Bay', 'hullWall', 'wrecked hull', 0x1668a8, 0x58b8d0, 0xa8c0b0, 0x88a8a0, 0x5a8090, 0x385a70, 0xd8f4ff, 1.0),
      look('The Deep', 'chainWall', 'anchor chains', 0x0e3a78, 0x2a78b0, 0x6a90a8, 0x507890, 0x3a5a80, 0x243a60, 0xc8e8ff, 0.98),
      look('The Trench', 'trenchWall', 'trench rocks', 0x061a40, 0x1a4a88, 0x486a88, 0x3a5470, 0x2a3e5e, 0x18243e, 0xa8d0ff, 0.98),
      look('Atlantis', 'atlantisWall', 'crystal gate', 0x0a2a5a, 0x2ab0b8, 0x5aa0a8, 0x4a8a98, 0x2a7a8a, 0x1a4a68, 0xb8fff4, 1.02),
    ],
    water: 0x1a4a9a,
    ice: 0xd8f6ff,
    plough: 'sharkAttack',
    ramp: 'rampSea',
    bridge: 'bridgeSea',
    chase: { label: 'Tidal wave', color: 0x2a7ad0, glow: 0x0e3a78, style: 'flood' },
    scenery: { backdrop: 'spires', caps: false, ground: 'sand', weather: { color: 0xd0f4ff, size: 1.4, fall: -1.3, blow: 0 }, fog: 0.6 },
    // Under water: a slow rocking three-time, a harp rippling up and down, soft strings,
    // glassy bell notes that hang, and bubbles.
    music: tune({ bpm: 88, beats: 3, root: 63, scale: LYDIAN, chords: [0, 1, 0, 4], lead: 'bell', busy: 0.4, hold: 1.6, bassLine: 'oompah', comp: 'harp', compLine: 'ripple', pad: true, extra: 'bubbles', echo: 0.35 }),
    stars: false,
    sources: [5],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'spooky',
    name: 'Spooky Hollow',
    scenes: [
      look('Pumpkin Patch', 'pumpkinWall', 'row of pumpkins', 0x3a2a6a, 0xff9a5a, 0x7a8a52, 0x6a7a48, 0x4a5a3a, 0x2e3430, 0xffc890, 0.97),
      look('Graveyard', 'graveWall', 'row of tombstones', 0x241e4a, 0x7a6aa8, 0x6a7868, 0x586658, 0x464e52, 0x2c2e3c, 0xc8d0ff, 0.96),
      look('Dead Woods', 'thornWall', 'thorn hedge', 0x1e1a3a, 0x6a5a8a, 0x6a6258, 0x58504a, 0x443a3a, 0x2a2428, 0xd0c8f0, 0.96),
      look('Haunted Village', 'ironFence', 'iron fence', 0x2a1e4a, 0x8a5a9a, 0x6e6a7a, 0x5a5668, 0x484258, 0x2c283c, 0xe0c8ff, 0.96),
      look("Witch's Swamp", 'mossWall', 'mossy stones', 0x1a2a2a, 0x5a9a5a, 0x5a7a4a, 0x48663e, 0x34503a, 0x1e3028, 0xc8ffb0, 0.96),
      look('Haunted Manor', 'cryptWall', 'crypt wall', 0x1a1430, 0x7a4a8a, 0x5e5a6c, 0x4c485c, 0x5a3a8a, 0x241e36, 0xd8c0ff, 0.95),
      look('Vampire Castle', 'castleWall', 'castle wall', 0x12081e, 0xa8202a, 0x5a4e5a, 0x483e4a, 0x6a2030, 0x221420, 0xffa0a0, 0.94),
    ],
    water: 0x5ac83a,
    ice: 0xd8ffd0,
    plough: 'ghoul',
    ramp: 'rampSpooky',
    bridge: 'bridgeSpooky',
    chase: { label: 'Ghost swarm', color: 0xd8ffe8, glow: 0x5a9a7a, style: 'swarm' },
    scenery: { backdrop: 'spires', caps: false, ground: 'soft', weather: { color: 0xc8ff8a, size: 0.8, fall: 0.05, blow: 0.25 }, fog: 0.85 },
    // A haunted house: a wailing theremin over church-organ chords, a kettledrum and a
    // tolling bell.
    music: tune({ bpm: 84, root: 60, scale: HARMONIC_MINOR, chords: [0, 5, 3, 4], lead: 'theremin', octave: 1, busy: 0.4, hold: 1.2, bass: 'organ', comp: 'organ', compLine: 'chords', drums: 'timpani', extra: 'toll', echo: 0.3 }),
    stars: true,
    sources: [6],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'toys',
    name: 'Toy Room',
    scenes: [
      look('Play Mat', 'abcWall', 'alphabet blocks', 0x8ac8ff, 0xfff4d8, 0xa8e0a0, 0x90d090, 0xffd23f, 0xe8402a, 0xfff6e0, 1.04),
      look('Block City', 'dominoWall', 'row of dominoes', 0x7ab8f8, 0xffecd0, 0xf0e0c0, 0xe0c898, 0x2f7de0, 0x1a4a9a, 0xfff6e0, 1.03),
      look('Train Set', 'pencilWall', 'pencil fence', 0x6ab0f0, 0xfff0e0, 0xe8d0a8, 0xd8b888, 0x3fb85a, 0x2a8a44, 0xfff6e0, 1.02),
      look('Dollhouse Row', 'bookWall', 'row of books', 0x9aa8f0, 0xffe0f0, 0xffe0ec, 0xffc8dc, 0x9a5ad6, 0x6a3aa8, 0xfff0f6, 1.02),
      look('Race Track', 'raceWall', 'crash barrier', 0x6a90e0, 0xffd8b0, 0x8a8e98, 0xd8d8d8, 0xe8402a, 0x8a2a1a, 0xffe8c0, 1.0),
      look('Toy Chest', 'brickWall', 'brick wall', 0x5a6ac0, 0xffc8a0, 0xd8a868, 0xc09050, 0x9a6a3a, 0x6a4424, 0xffd8a0, 0.98),
      look('Bedtime', 'pillowWall', 'pillow fort', 0x1e2a6a, 0x8a7ad0, 0xb8c0e8, 0x98a0d8, 0x6a70c0, 0x3a3e8a, 0xd8dcff, 0.95),
    ],
    water: 0x4a9af0,
    ice: 0xeaf6ff,
    plough: 'windupCar',
    ramp: 'rampToys',
    bridge: 'bridgeToys',
    chase: { label: 'Dust bunnies', color: 0xb8b4c0, glow: 0x4a4658, style: 'tumble' },
    scenery: { backdrop: 'blocks', caps: false, ground: 'tiles', weather: null, fog: 1 },
    // A music-box waltz: tinkling tune, oom-pah-pah underneath, nothing else.
    music: tune({ bpm: 132, beats: 3, root: 67, scale: MAJOR, chords: [0, 3, 4, 0], lead: 'musicbox', octave: 1, busy: 0.85, bass: 'pizz', bassLine: 'oompah', comp: 'musicbox', compLine: 'offbeat', echo: 0.15, level: 2.6 }),
    stars: false,
    sources: [7],
    mixSeed: 0,
    twist: NO_TWIST,
  },
  {
    key: 'sky',
    name: 'Sky Kingdom',
    scenes: [
      look('Hilltops', 'buntingWall', 'bunting', 0x3a9af8, 0xd8f0ff, 0xa8e090, 0x90d080, 0x6ab868, 0x4a8a5a, 0xfff8e0, 1.05),
      look('Cloud Bank', 'cloudWall', 'cloud bank', 0x3a90f0, 0xe8f6ff, 0xffffff, 0xeef4fc, 0xd8e6f6, 0xa8c0e0, 0xffffff, 1.04),
      look('Balloon Fair', 'balloonWall', 'wall of balloons', 0x4a98f0, 0xfff0d8, 0xfdf8f0, 0xf0e8dc, 0xffc0a0, 0xd08a70, 0xfff4e0, 1.03),
      look('Rainbow Road', 'rainbowWall', 'rainbow', 0x5a90f0, 0xffe0f8, 0xf6f0ff, 0xe8dcff, 0xc8b0f0, 0x8a78d0, 0xfff0ff, 1.03),
      look('Storm Front', 'stormWall', 'thundercloud', 0x2a3450, 0x7a88a0, 0xa8b0c0, 0x8a94a8, 0x5a6478, 0x3a4254, 0xd8e0f0, 0.93),
      look('Floating Isles', 'isleWall', 'floating rocks', 0x3a80e8, 0xffd8b8, 0xf8f0e8, 0xe8dcd0, 0x8ac87a, 0x6a8a5a, 0xffe0b0, 1.0),
      look('Stratosphere', 'auroraWall', 'aurora', 0x0a1040, 0x4a8ae0, 0xd8e4ff, 0xb8c8f0, 0x7ae0c0, 0x3a5aa8, 0xe8f0ff, 1.02),
    ],
    water: 0x6ab8ff,
    ice: 0xffffff,
    plough: 'thunderhead',
    ramp: 'rampSky',
    bridge: 'bridgeSky',
    chase: { label: 'Thunderstorm', color: 0x5a6478, glow: 0x2a3040, style: 'cloud' },
    scenery: { backdrop: 'none', caps: true, ground: 'soft', weather: null, fog: 1 },
    // Flying: a soaring whistle with long notes, a harp, soft strings and a light brush.
    music: tune({ bpm: 104, root: 62, scale: MAJOR_PENTATONIC, chords: [0, 3, 2, 4], lead: 'whistle', octave: 1, busy: 0.45, hold: 1.3, comp: 'harp', compLine: 'ripple', pad: true, drums: 'brush', echo: 0.3 }),
    stars: false,
    sources: [8],
    mixSeed: 0,
    twist: NO_TWIST,
  },
];

/**
 * The order the hand-made worlds are played in (their `key`s). The list above is in the
 * order they were made, and objects.ts refers to a world by its position there, so add new
 * worlds to the end of that list and slot them in wherever you like here.
 */
export const WORLD_ORDER = ['mountain', 'candy', 'lost', 'desert', 'sea', 'spooky', 'toys', 'sky', 'space'];

const ORDERED: WorldConfig[] = WORLD_ORDER.map((key) => {
  const world = WORLDS.find((w) => w.key === key);
  if (!world) throw new Error(`WORLD_ORDER: no world called "${key}"`);
  return world;
});

/** Which lap a hand-made world is played on (0 = first), or -1 if it isn't in WORLD_ORDER. */
export function lapOfWorld(key: string): number {
  return WORLD_ORDER.indexOf(key);
}

/** How many laps are hand-made worlds; the remix worlds start after these. */
export const HAND_MADE_LAPS = ORDERED.length;

// ------------------------------------------------------------------ Remix worlds

/** A colour to pull towards: [hue 0..1, saturation 0..1, lightness 0..1]. */
type Tone = [number, number, number];

/**
 * One colour style for a remix world. Every scene's own colours are pulled most of the
 * way to these, so the whole world reads as one place but its scenes still differ a bit.
 */
interface RemixStyle {
  /** Goes in front of the scene names: "Neon Swamp". */
  adj: string;
  sky: Tone;
  horizon: Tone;
  /** The ground you roll on, the banks beside it, and the far ridges. */
  lane: Tone;
  bank: Tone;
  ridge: Tone;
  /** Sunlight colour and brightness. */
  sun: number;
  light: number;
  /** A wash of colour over every object, so things borrowed from other worlds look like they belong here. */
  tint: number;
  stars: boolean;
}

export const REMIX_STYLES: RemixStyle[] = [
  { adj: 'Neon', sky: [0.74, 0.8, 0.07], horizon: [0.88, 0.85, 0.4], lane: [0.76, 0.55, 0.3], bank: [0.5, 0.9, 0.42], ridge: [0.85, 0.7, 0.25], sun: 0xffd8ff, light: 1.05, tint: 0xf0b0ff, stars: true },
  { adj: 'Frozen', sky: [0.58, 0.75, 0.55], horizon: [0.55, 0.6, 0.88], lane: [0.57, 0.45, 0.9], bank: [0.58, 0.4, 0.75], ridge: [0.6, 0.25, 0.55], sun: 0xeaf6ff, light: 1.02, tint: 0xbfe4ff, stars: false },
  { adj: 'Lava', sky: [0.98, 0.6, 0.1], horizon: [0.05, 0.95, 0.55], lane: [0.03, 0.1, 0.2], bank: [0.04, 0.85, 0.34], ridge: [0.0, 0.25, 0.14], sun: 0xffb890, light: 0.96, tint: 0xffc8a0, stars: false },
  { adj: 'Bubblegum', sky: [0.55, 0.8, 0.72], horizon: [0.92, 0.9, 0.88], lane: [0.93, 0.75, 0.85], bank: [0.47, 0.6, 0.72], ridge: [0.8, 0.45, 0.6], sun: 0xfff0f6, light: 1.03, tint: 0xffc4e4, stars: false },
  { adj: 'Midnight', sky: [0.66, 0.7, 0.05], horizon: [0.62, 0.55, 0.22], lane: [0.62, 0.35, 0.38], bank: [0.64, 0.4, 0.28], ridge: [0.66, 0.4, 0.18], sun: 0xc8d8ff, light: 1.0, tint: 0xb8c4ff, stars: true },
  { adj: 'Golden', sky: [0.07, 0.75, 0.55], horizon: [0.11, 0.95, 0.78], lane: [0.12, 0.7, 0.72], bank: [0.09, 0.65, 0.55], ridge: [0.06, 0.5, 0.36], sun: 0xffe2a0, light: 1.03, tint: 0xffe08a, stars: false },
  { adj: 'Toxic', sky: [0.78, 0.55, 0.16], horizon: [0.25, 0.75, 0.45], lane: [0.24, 0.6, 0.42], bank: [0.3, 0.7, 0.3], ridge: [0.78, 0.4, 0.22], sun: 0xe8ffb0, light: 1.0, tint: 0xd0ff9a, stars: false },
  { adj: 'Drowned', sky: [0.56, 0.8, 0.2], horizon: [0.5, 0.7, 0.5], lane: [0.48, 0.5, 0.55], bank: [0.45, 0.6, 0.38], ridge: [0.6, 0.5, 0.25], sun: 0xc8fff0, light: 1.0, tint: 0xa8f0e0, stars: false },
  { adj: 'Crystal', sky: [0.72, 0.6, 0.35], horizon: [0.8, 0.7, 0.8], lane: [0.74, 0.5, 0.82], bank: [0.55, 0.6, 0.7], ridge: [0.7, 0.45, 0.5], sun: 0xf0e8ff, light: 1.03, tint: 0xe0ccff, stars: true },
  { adj: 'Storm', sky: [0.6, 0.15, 0.25], horizon: [0.58, 0.12, 0.6], lane: [0.58, 0.1, 0.62], bank: [0.6, 0.12, 0.45], ridge: [0.6, 0.14, 0.28], sun: 0xdfe6f0, light: 0.94, tint: 0xc8d0dc, stars: false },
];

/** The second half of a remix world's name: "Neon Frontier", "Candy Kingdom". */
const REMIX_PLACES = ['Frontier', 'Kingdom', 'Wilds', 'Realm', 'Expanse', 'Dimension', 'Reach', 'Wastes', 'Galaxy', 'Maze'];

/** Scene names that read badly with a word in front get a shorter one in a remix. */
const REMIX_SCENE_NAMES: Record<string, string> = {
  'Frozen Lake': 'Lake',
  'Ski Resort': 'Resort',
  'Fern Valley': 'Valley',
  'Nesting Grounds': 'Nests',
  'Bone Desert': 'Desert',
  'Lava Field': 'Badlands',
  'Low Orbit': 'Orbit',
  'The Moon': 'Moon',
  'Asteroid Belt': 'Asteroids',
  'Red Planet': 'Planet',
  'Planet Rings': 'Rings',
  'The Sun': 'Sun',
  'Deep Space': 'Void',
  'Sprinkle Hills': 'Hills',
  'Lollipop Woods': 'Lollipops',
  'Soda Lake': 'Lagoon',
  'Cookie Village': 'Bakery',
  'Gingerbread Town': 'Gingerbread',
  'Chocolate Canyon': 'Canyon',
  'Cake Castle': 'Cake',
  'Caravan Trail': 'Trail',
  'Valley of Kings': 'Tombs',
  'Sphinx Road': 'Sphinx',
  'Great Pyramids': 'Pyramids',
  'Coral Reef': 'Reef',
  'Kelp Forest': 'Kelp',
  'Shipwreck Bay': 'Shipwreck',
  'The Deep': 'Depths',
  'The Trench': 'Trench',
  'Pumpkin Patch': 'Pumpkins',
  'Dead Woods': 'Woods',
  'Haunted Village': 'Hamlet',
  "Witch's Swamp": 'Bog',
  'Haunted Manor': 'Manor',
  'Vampire Castle': 'Castle',
  'Play Mat': 'Playroom',
  'Block City': 'Blocks',
  'Train Set': 'Railway',
  'Dollhouse Row': 'Dollhouses',
  'Race Track': 'Racetrack',
  'Toy Chest': 'Toybox',
  Bedtime: 'Bedroom',
  'Cloud Bank': 'Clouds',
  'Balloon Fair': 'Balloons',
  'Rainbow Road': 'Rainbow',
  'Storm Front': 'Thunder',
  'Floating Isles': 'Isles',
};

/** How far a scene's own hue, saturation and lightness are pulled to the style's. */
const REMIX_PULL = { h: 0.88, s: 0.8, l: 0.72 };

const _c = new Color();
const _hsl = { h: 0, s: 0, l: 0 };

/** Pull a colour towards a tone. `drift` nudges the hue so scenes in one world differ. */
function restyle(hex: number, tone: Tone, drift: number): number {
  _c.setHex(hex).getHSL(_hsl, SRGBColorSpace);
  // Hue is a circle: go the short way round. A grey source has no hue worth keeping.
  let dh = tone[0] + drift - _hsl.h;
  dh -= Math.round(dh);
  const pullH = _hsl.s < 0.08 ? 1 : REMIX_PULL.h;
  const h = (((_hsl.h + dh * pullH) % 1) + 1) % 1;
  const s = _hsl.s + (tone[1] - _hsl.s) * REMIX_PULL.s;
  const l = _hsl.l + (tone[2] - _hsl.l) * REMIX_PULL.l;
  return _c.setHSL(h, s, l, SRGBColorSpace).getHex();
}

const mix = (a: number, b: number, t: number): number => _c.setHex(a).lerp(new Color(b), t).getHex();

/**
 * The i-th pick from 0..n-1 in a shuffled order that uses every one before repeating any,
 * then reshuffles. So ten remix worlds in a row have ten different styles.
 */
function shuffledPick(n: number, i: number, salt: number): number {
  const order = (round: number): number[] => {
    const rng = mulberry32(round * 9973 + salt);
    const list = Array.from({ length: n }, (_, k) => k);
    for (let k = n - 1; k > 0; k--) {
      const j = Math.floor(rng() * (k + 1));
      [list[k], list[j]] = [list[j], list[k]];
    }
    return list;
  };
  const round = Math.floor(i / n);
  const list = order(round);
  // Don't open a round with the pick that closed the last one.
  if (round > 0 && list[0] === order(round - 1)[n - 1]) [list[0], list[1]] = [list[1], list[0]];
  return list[i % n];
}

const faster = (m: MusicStyle): MusicStyle => ({ ...m, bpm: Math.round(m.bpm * 1.08) });

function buildRemix(lap: number): WorldConfig {
  const rng = mulberry32(lap * 104729 + 71);
  const pick = <T>(list: T[]): T => list[Math.floor(rng() * list.length)];
  const nth = lap - HAND_MADE_LAPS;
  const style = REMIX_STYLES[shuffledPick(REMIX_STYLES.length, nth, 11)];

  const scenes: SceneLook[] = [];
  for (let i = 0; i < ZONES.length; i++) {
    const from = pick(WORLDS).scenes[i];
    const drift = (rng() - 0.5) * 0.07;
    const lane = restyle(from.lane, style.lane, drift);
    const bankMid = restyle(from.bankMid, style.bank, drift);
    const base = REMIX_SCENE_NAMES[from.name] ?? from.name;
    scenes.push({
      name: base.toLowerCase().includes(style.adj.toLowerCase()) ? base : `${style.adj} ${base}`,
      gate: from.gate,
      gateName: from.gateName,
      skyTop: restyle(from.skyTop, style.sky, drift),
      horizon: restyle(from.horizon, style.horizon, drift),
      lane,
      bankLow: mix(lane, bankMid, 0.4),
      bankMid,
      ridge: restyle(from.ridge, style.ridge, drift),
      sun: mix(from.sun, style.sun, 0.6),
      light: style.light,
    });
  }

  // Objects from two or three of the hand-made worlds.
  const pool = WORLDS.map((_, i) => i);
  const sources: number[] = [];
  const count = rng() < 0.5 ? 2 : 3;
  while (sources.length < count) sources.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);

  let hazards: WorldConfig;
  return {
    key: `remix${nth + 1}`,
    name: `${style.adj} ${REMIX_PLACES[shuffledPick(REMIX_PLACES.length, nth, 29)]}`,
    scenes,
    water: pick(WORLDS).water,
    ice: pick(WORLDS).ice,
    // The charging hazard, the ramp and the bridge all come from one world, so they match.
    plough: (hazards = pick(WORLDS)).plough,
    ramp: hazards.ramp,
    bridge: hazards.bridge,
    chase: pick(WORLDS).chase,
    scenery: pick(WORLDS).scenery,
    // A borrowed tune, a little faster: remix worlds are the late game.
    music: faster(pick(WORLDS).music),
    stars: style.stars,
    tint: style.tint,
    sources,
    mixSeed: Math.floor(rng() * 100000) + 1,
    twist: nth < TWISTS.length ? TWISTS[nth] : TWISTS[shuffledPick(TWISTS.length, nth, 47)],
  };
}

const remixCache = new Map<number, WorldConfig>();

/** The world for a lap: the hand-made ones in order, then a new remix every lap. */
export function worldForLap(lap: number): WorldConfig {
  if (lap < HAND_MADE_LAPS) return ORDERED[Math.max(0, lap)];
  let world = remixCache.get(lap);
  if (!world) {
    world = buildRemix(lap);
    remixCache.set(lap, world);
  }
  return world;
}

/**
 * Which hand-made world a remix takes one kind of object from. `slot` identifies the
 * kind: every world has one object per slot (the small tree, the raptor and the rocket
 * share one), so a remix always has exactly one of each and stays balanced.
 */
export function objectSource(world: WorldConfig, slot: number): number {
  const n = world.sources.length;
  if (n === 1) return world.sources[0];
  let picks = sourceCache.get(world);
  if (!picks) {
    picks = [];
    sourceCache.set(world, picks);
  }
  if (picks[slot] === undefined) picks[slot] = world.sources[Math.floor(mulberry32(world.mixSeed * 131 + slot * 17)() * n)];
  return picks[slot];
}

const sourceCache = new Map<WorldConfig, number[]>();
