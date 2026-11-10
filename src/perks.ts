/**
 * What the player's upgrades do. The shop (config.ts UPGRADES) sells levels; this turns
 * the levels into the multipliers the rest of the game reads from PERKS. With no upgrades
 * every value is 1, which is the game exactly as it is tuned in config.ts.
 */
import { CONFIG, UPGRADES, type UpgradeDef } from './config';

export const PERKS = {
  /** Starting radius. */
  start: 1,
  /** Volume gained from each object absorbed. */
  growth: 1,
  /** Size lost to a hit or a scrape (below 1 = less). */
  hitLoss: 1,
  /** Steering speed and tightness. */
  grip: 1,
  /** How often secret objects appear. */
  luck: 1,
};

const bonus = (levels: Record<string, number>, id: UpgradeDef['id']): number => {
  const def = UPGRADES.find((u) => u.id === id);
  return def ? (levels[id] ?? 0) * def.perLevel : 0;
};

/** Recompute PERKS from the levels in the save. */
export function applyUpgrades(levels: Record<string, number>): void {
  PERKS.start = 1 + bonus(levels, 'start');
  PERKS.growth = 1 + bonus(levels, 'sticky');
  PERKS.hitLoss = 1 - bonus(levels, 'tough');
  PERKS.grip = 1 + bonus(levels, 'grip');
  PERKS.luck = 1 + bonus(levels, 'luck');
}

/** Price of the next level of an upgrade the player holds at `level`. */
export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.round(def.baseCost * Math.pow(def.costGrowth, level));
}

/** Coins a run earns for finishing with a ball of this radius (metres, as shown to the player). */
export function coinsFor(radius: number): number {
  const doublings = Math.log2(Math.max(1, radius / CONFIG.START_RADIUS));
  return Math.round(CONFIG.COIN_PER_DOUBLING * Math.pow(doublings, CONFIG.COIN_POWER));
}
