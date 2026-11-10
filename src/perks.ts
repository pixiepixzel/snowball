/**
 * What the player's upgrades do. The shop (config.ts UPGRADES) sells levels of three
 * tracks; this turns the levels into the numbers the rest of the game reads from PERKS.
 * With no upgrades every value is its plain one, which is the game exactly as it is tuned
 * in config.ts.
 *
 * Each track gives a little more per level, and something new at levels 3, 6 and 10
 * (config.ts UPGRADE_EFFECTS):
 *   Snow    more growth from everything absorbed; then snow packs on faster as you roll,
 *           then walls grow you more when smashed, then a last lump of growth
 *   Armour  less size lost to a hit; then longer to recover after one, then a free shield
 *           every so often, then one more often
 *   Reach   absorb things from slightly further away; then small things drift towards
 *           you, from further and faster at each step
 */
import { CONFIG, LEVEL_LUCK, LEVEL_LUCK_MAX, UPGRADES, UPGRADE_EFFECTS, type UpgradeDef } from './config';

export const PERKS = {
  /** Starting radius (nothing changes this now; a Head start boost does it for one run). */
  start: 1,
  /** Volume gained from each object absorbed. */
  growth: 1,
  /** How fast plain snow packs on while rolling, and how much smashing a wall grows the ball. */
  pack: 1,
  gate: 1,
  /** Size lost to a hit (below 1 = less), and how long the ball can't be hurt again afterwards. */
  hitLoss: 1,
  invuln: 1,
  /** Seconds between free shields (0 = none). */
  shieldEvery: 0,
  /** How far the ball reaches for things it can absorb. */
  reach: 1,
  /** Small things drift towards the ball from this many radii away, this fast (0 = they don't). */
  pullRange: 0,
  pullPower: 0,
  /** Steering speed and tightness. */
  grip: 1,
  /** How often secret objects and rarer versions appear (grows with the player's level). */
  luck: 1,
};

const perLevel = (id: UpgradeDef['id']): number => UPGRADES.find((u) => u.id === id)?.perLevel ?? 0;

/** Recompute PERKS from the upgrade levels in the save, and the player's own level (which adds a little luck). */
export function applyUpgrades(levels: Record<string, number>, playerLevel = 1): void {
  const E = UPGRADE_EFFECTS;
  const snow = levels.snow ?? 0;
  const armour = levels.armour ?? 0;
  const reach = levels.reach ?? 0;

  PERKS.growth = 1 + snow * perLevel('snow') + (snow >= 10 ? E.snowBonus : 0);
  PERKS.pack = snow >= 3 ? E.snowPack : 1;
  PERKS.gate = snow >= 6 ? E.snowGate : 1;

  PERKS.hitLoss = 1 - armour * perLevel('armour');
  PERKS.invuln = armour >= 3 ? E.armourInvuln : 1;
  PERKS.shieldEvery = armour >= 10 ? E.armourShield[1] : armour >= 6 ? E.armourShield[0] : 0;

  PERKS.reach = 1 + reach * perLevel('reach');
  const pull = reach >= 10 ? E.reachPull[2] : reach >= 6 ? E.reachPull[1] : reach >= 3 ? E.reachPull[0] : [0, 0];
  PERKS.pullRange = pull[0];
  PERKS.pullPower = pull[1];

  PERKS.luck = 1 + Math.min(LEVEL_LUCK_MAX, (playerLevel - 1) * LEVEL_LUCK);
}

/** Price of the next level of an upgrade the player holds at `level`. */
export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.round((def.baseCost * Math.pow(def.costGrowth, level)) / 5) * 5;
}

/** Coins a run earns for finishing with a ball of this radius (metres, as shown to the player). */
export function coinsFor(radius: number): number {
  const doublings = Math.log2(Math.max(1, radius / CONFIG.START_RADIUS));
  return Math.round(CONFIG.COIN_PER_DOUBLING * Math.pow(doublings, CONFIG.COIN_POWER));
}
