/**
 * What the game remembers between visits: best size, coins and upgrade levels.
 *
 * It is one JSON object in localStorage with a `version` number. If the shape ever
 * changes, bump SAVE_VERSION and teach `migrate` to read the old shape, so nobody loses
 * their progress. Anything unreadable falls back to a fresh save rather than breaking
 * the game, and every access is wrapped because storage can be blocked or full.
 */
import { CONFIG, UPGRADES, UPGRADE_LEVELS } from './config';
import { LAP_GROWTH } from './zones';

const SAVE_KEY = 'snowball.save';
/** Before there was a save file the best size lived on its own under this key. */
const OLD_BEST_KEY = 'snowball.best';

/**
 * Version 2 added the sound and vibration switches, version 3 the furthest world reached,
 * version 4 the music switch.
 */
export const SAVE_VERSION = 4;

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
}

const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback);

function fresh(): SaveData {
  const upgrades: Record<string, number> = {};
  for (const u of UPGRADES) upgrades[u.id] = 0;
  return { version: SAVE_VERSION, best: 0, coins: 0, upgrades, sound: true, music: true, vibration: true, reached: 0 };
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
  save.best = num(data.best);
  save.coins = Math.floor(num(data.coins));
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
