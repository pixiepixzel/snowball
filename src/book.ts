/**
 * The collection book's pages: one per hand-made world, in the order the worlds are
 * played, then a page for the secret objects. Walls, rivers, ramps and ploughs are not in
 * it: the book is for things the ball can absorb.
 */
import { BOOK_PAGE_REWARD, BOOK_SECRETS_REWARD } from './config';
import { OBJECT_DEFS, type ObjectDef } from './objects';
import { WORLDS, WORLD_ORDER } from './worlds';

export interface BookPage {
  /** The world's key, or 'secrets'. Saved once the page's reward has been paid. */
  key: string;
  name: string;
  /** Coins for finding everything on the page. */
  reward: number;
  /** What is on the page, smallest first. */
  defs: ObjectDef[];
}

/** Smallest first, and each ordinary thing followed straight away by its rarer versions. */
function inOrder(defs: ObjectDef[]): ObjectDef[] {
  const ordinary = defs.filter((d) => !d.variantOf).sort((a, b) => a.size - b.size);
  return ordinary.flatMap((d) => [d, ...defs.filter((v) => v.variantOf === d.id)]);
}

export const BOOK_PAGES: BookPage[] = [
  ...WORLD_ORDER.map((key): BookPage => {
    // An object's `world` number is the world's place in WORLDS.
    const index = WORLDS.findIndex((w) => w.key === key);
    return {
      key,
      name: WORLDS[index].name,
      reward: BOOK_PAGE_REWARD,
      defs: inOrder(OBJECT_DEFS.filter((d) => !d.special && (d.world ?? 0) === index)),
    };
  }),
  { key: 'secrets', name: 'Secrets', reward: BOOK_SECRETS_REWARD, defs: OBJECT_DEFS.filter((d) => d.special === 'secret') },
];

/** How many different things there are to find. */
export const BOOK_TOTAL = BOOK_PAGES.reduce((sum, page) => sum + page.defs.length, 0);
