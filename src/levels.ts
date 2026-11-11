/**
 * XP and levels. XP is earned for getting far and playing well (config.ts XP_FOR), which
 * is not the same as coins: coins pay for growth. It is never spent. Levels come from the
 * total, each needing a little more than the last, and bring a title, a chest of coins,
 * a touch more luck, and now and then a ball skin that can't be bought.
 */
import { LEVEL_COIN_BASE, LEVEL_COIN_STEP, LEVEL_XP_BASE, LEVEL_XP_GROWTH, TITLES } from './config';

/** XP needed to go from `level` to the next. */
export const xpToNext = (level: number): number => Math.round(LEVEL_XP_BASE * Math.pow(LEVEL_XP_GROWTH, level - 1));

/** The level a total of XP makes, how far into it, and how much the next one needs. */
export function levelOf(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let left = Math.max(0, xp);
  // (Capped so a nonsense save can't spin here for ever.)
  while (level < 999 && left >= xpToNext(level)) {
    left -= xpToNext(level);
    level++;
  }
  return { level, into: left, need: xpToNext(level) };
}

/** The title that goes with a level: the last one in TITLES it has reached. */
/** Which title a level has earned, as a position in TITLES (and so in RANK_COLOURS). */
export function rankFor(level: number): number {
  let rank = 0;
  TITLES.forEach(([from], i) => {
    if (level >= from) rank = i;
  });
  return rank;
}

export function titleFor(level: number): string {
  let title = TITLES[0][1];
  for (const [from, name] of TITLES) if (level >= from) title = name;
  return title;
}

/** Coins in the chest for reaching `level`. */
export const levelCoins = (level: number): number => LEVEL_COIN_BASE + LEVEL_COIN_STEP * level;
