/**
 * What the game remembers between visits: best size, coins and upgrade levels.
 *
 * It is one JSON object in localStorage with a `version` number. If the shape ever
 * changes, bump SAVE_VERSION and teach `migrate` to read the old shape, so nobody loses
 * their progress. Anything unreadable falls back to a fresh save rather than breaking
 * the game, and every access is wrapped because storage can be blocked or full.
 */
import { BASIC_HINTS, CONFIG, HINTS, MISSIONS, MISSION_SLOTS, SKINS, UPGRADES, UPGRADE_LEVELS } from './config';
import { LAP_GROWTH } from './zones';

const SAVE_KEY = 'snowball.save';
/** Before there was a save file the best size lived on its own under this key. */
const OLD_BEST_KEY = 'snowball.best';

/**
 * Version 2 added the sound and vibration switches, version 3 the furthest world reached,
 * version 4 the music switch, version 5 which first-time hints have been shown,
 * version 6 the missions, version 7 the ball skins, version 8 the collection book,
 * version 9 the daily reward, version 10 XP and where the best run ended.
 */
export const SAVE_VERSION = 10;

/** One of the active missions. */
export interface MissionState {
  /** Which mission (config.ts MISSIONS). */
  id: string;
  /** For missions that add up over runs: how far along it was when the last run ended. */
  progress: number;
  /** Finished and paid; it is swapped for a new one when the run ends. */
  done: boolean;
}

export interface SaveData {
  version: number;
  /** Best ball radius ever, in metres. */
  best: number;
  coins: number;
  /** Level bought of each upgrade (0 .. UPGRADE_LEVELS), by upgrade id. */
  upgrades: Record<string, number>;
  /** Settings: sound effects on, music on, vibration on. */
  sound: boolean;
  music: boolean;
  vibration: boolean;
  /**
   * The furthest world the player has rolled into, as a lap number (0 = the first world).
   * A run can start in any world up to this one.
   */
  reached: number;
  /** Ids of the first-time hints already shown (config.ts HINTS). */
  hints: string[];
  /** The active missions, and how many have been handed out so far (which picks the next). */
  missions: MissionState[];
  missionNext: number;
  /** Ids of the ball skins bought (config.ts SKINS; the free one is always here), and the one in use. */
  skins: string[];
  skin: string;
  /**
   * The collection book: how many of each object have been absorbed over every run, by
   * object id, and the pages (world keys) whose reward for finding everything has been paid.
   */
  book: Record<string, number>;
  bookPaid: string[];
  /**
   * The daily reward: the day it was last paid (a count of days, by the player's own
   * calendar; 0 = never) and how many days in a row that made.
   */
  daily: { day: number; streak: number };
  /** All the XP ever earned. The level is worked out from it (levels.ts). */
  xp: number;
  /** Where the run that got furthest ended: which world (lap), which scene, and how far through it (0..1). */
  bestAt: { lap: number; zone: number; t: number } | null;
}

const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback);

/** A new player's missions: the first few on the list. */
const firstMissions = (): MissionState[] => MISSIONS.slice(0, MISSION_SLOTS).map((m) => ({ id: m.id, progress: 0, done: false }));

function fresh(): SaveData {
  const upgrades: Record<string, number> = {};
  for (const u of UPGRADES) upgrades[u.id] = 0;
  return { version: SAVE_VERSION, best: 0, coins: 0, upgrades, sound: true, music: true, vibration: true, reached: 0, hints: [], missions: firstMissions(), missionNext: MISSION_SLOTS, skins: [SKINS[0].id], skin: SKINS[0].id, book: {}, bookPaid: [], daily: { day: 0, streak: 0 }, xp: 0, bestAt: null };
}

/** Turn whatever was stored into a valid save of the current version. */
function migrate(raw: unknown): SaveData {
  const save = fresh();
  if (typeof raw !== 'object' || raw === null) return save;
  const data = raw as Record<string, unknown>;
  // Version 1 had no settings: a save without them gets both switched on, which is what
  // `!== false` does. Later versions add their own steps here.
  save.sound = data.sound !== false;
  save.music = data.music !== false;
  save.vibration = data.vibration !== false;
  save.best = num(data.best);
  // Before version 3 the furthest world wasn't recorded. Work it out from the best size
  // instead: a ball as big as a world's starting size has been in that world.
  save.reached =
    typeof data.reached === 'number'
      ? Math.floor(num(data.reached))
      : Math.max(0, Math.floor(Math.log(Math.max(1, save.best / CONFIG.START_RADIUS)) / Math.log(LAP_GROWTH) + 1e-9));
  save.coins = Math.floor(num(data.coins));
  // Before version 5 there were no hints. Someone who has already played knows the basics,
  // so those are marked as seen; the tips for rivers, ramps and the rest still appear once.
  // (Hints that no longer exist are dropped, so the count of hints left to show stays right.)
  if (Array.isArray(data.hints)) save.hints = data.hints.filter((id): id is string => typeof id === 'string' && id in HINTS);
  else if (save.best > 0) save.hints = [...BASIC_HINTS];
  // Before version 6 there were no missions: `fresh()` has already dealt the first three.
  // Otherwise keep the stored ones that still exist, and top up to a full set.
  if (Array.isArray(data.missions)) {
    const known = (data.missions as unknown[])
      .filter((m): m is Record<string, unknown> => typeof m === 'object' && m !== null)
      .filter((m) => MISSIONS.some((def) => def.id === m.id))
      .map((m) => ({ id: m.id as string, progress: num(m.progress), done: m.done === true }));
    save.missionNext = Math.max(MISSION_SLOTS, Math.floor(num(data.missionNext, MISSION_SLOTS)));
    for (const m of firstMissions()) if (known.length < MISSION_SLOTS && !known.some((k) => k.id === m.id)) known.push(m);
    save.missions = known.slice(0, MISSION_SLOTS);
  }
  // Before version 7 there were no skins: `fresh()` has given the free one. Skins that no
  // longer exist are dropped, and the one in use has to be one that is owned.
  if (Array.isArray(data.skins)) {
    for (const def of SKINS) if (data.skins.includes(def.id) && !save.skins.includes(def.id)) save.skins.push(def.id);
    // (A skin earned by level isn't in the list of bought ones; picking it checks the level.)
    if (typeof data.skin === 'string' && (save.skins.includes(data.skin) || SKINS.some((s) => s.id === data.skin && s.level))) save.skin = data.skin;
  }
  // Before version 8 nothing absorbed was remembered, so the book starts empty.
  if (typeof data.book === 'object' && data.book !== null) {
    for (const [id, n] of Object.entries(data.book as Record<string, unknown>)) {
      const count = Math.floor(num(n));
      if (count > 0) save.book[id] = count;
    }
  }
  if (Array.isArray(data.bookPaid)) save.bookPaid = data.bookPaid.filter((key): key is string => typeof key === 'string');
  // Before version 9 there was no daily reward: it starts as never paid.
  if (typeof data.daily === 'object' && data.daily !== null) {
    const daily = data.daily as Record<string, unknown>;
    save.daily = { day: Math.floor(num(daily.day)), streak: Math.floor(num(daily.streak)) };
  }
  // Before version 10 there was no XP: everyone starts at level 1.
  save.xp = Math.floor(num(data.xp));
  if (typeof data.bestAt === 'object' && data.bestAt !== null) {
    const at = data.bestAt as Record<string, unknown>;
    save.bestAt = { lap: Math.floor(num(at.lap)), zone: Math.floor(num(at.zone)), t: Math.min(1, num(at.t)) };
  }
  const levels = (typeof data.upgrades === 'object' && data.upgrades !== null ? data.upgrades : {}) as Record<string, unknown>;
  for (const u of UPGRADES) save.upgrades[u.id] = Math.min(UPGRADE_LEVELS, Math.floor(num(levels[u.id])));
  return save;
}

export function loadSave(): SaveData {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (text) return migrate(JSON.parse(text));
    // First run with the save file: carry over the old stand-alone best size.
    return migrate({ best: num(parseFloat(localStorage.getItem(OLD_BEST_KEY) ?? '0')) });
  } catch {
    return fresh();
  }
}

export function writeSave(save: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Private mode, storage full or blocked: progress just won't persist.
  }
}
