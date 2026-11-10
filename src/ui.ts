/**
 * DOM overlay: title screen, in-run HUD, zone banner, floating "+size" text and the end
 * screen. Plain HTML/CSS on top of the canvas keeps text crisp and costs no draw calls.
 */
export interface EndData {
  title: string;
  subtitle: string;
  /** Final size split into number and unit, e.g. "3.80" and "m". */
  size: string;
  unit: string;
  /** Best size as a full label, e.g. "12.4 km". */
  best: string;
  isBest: boolean;
  /** `fresh` marks something absorbed for the first time ever. */
  items: { label: string; color: string; fresh: boolean }[];
  /** A line about the collection book ("3 new in your collection"), or empty. */
  bookNote: string;
  /** Coins this run earned, or null for a run that doesn't count (a demo or the bot). */
  coins: number | null;
  totalCoins: number;
}

/** One upgrade as the shop shows it. */
export interface ShopRow {
  id: string;
  name: string;
  blurb: string;
  level: number;
  levels: number;
  /** What it adds up to so far, e.g. "12% more growth"; empty at level 0. */
  effect: string;
  cost: number;
  maxed: boolean;
  affordable: boolean;
}

/** One page of the collection book. */
export interface BookView {
  /** Different things found so far, out of how many there are, over the whole book. */
  found: number;
  total: number;
  /** The page's name: a world, or "Secrets". */
  name: string;
  /** Coins for finding everything on this page, and whether that has been paid. */
  reward: number;
  paid: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  /** `count` is how many have been absorbed over every run; 0 means not found yet. */
  /** `rarity` is empty for an ordinary thing, otherwise its rarity ("Rare") and that rarity's colour. */
  items: { name: string; picture: string; count: number; rarity: string; rarityColor: string }[];
}

/** One ball skin as the shop shows it. */
export interface SkinRow {
  id: string;
  name: string;
  /** A small picture of the ball in this skin, as an image URL. */
  picture: string;
  price: number;
  owned: boolean;
  /** The one the ball is wearing. */
  selected: boolean;
  affordable: boolean;
}

/** One mission as the title screen, pause menu and end screen list it. */
export interface MissionRow {
  text: string;
  /** How far along it is, e.g. "40/100"; empty when there is nothing to show yet. */
  progress: string;
  reward: number;
  done: boolean;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} missing from index.html`);
  return node as T;
}

export class UI {
  onStart: () => void = () => {};
  onRestart: () => void = () => {};
  /** The player opened the upgrade shop; the game answers with openShop(). */
  onShop: () => void = () => {};
  onBuy: (id: string) => void = () => {};
  /** A skin was tapped in the shop: buy it, or put it on if it is already owned. */
  onSkin: (id: string) => void = () => {};
  /** The player opened the collection book; the game answers with openBook(). */
  onBook: () => void = () => {};
  /** An arrow in the book: -1 or +1 page. */
  onBookStep: (step: number) => void = () => {};
  /** The player pressed an arrow on the world picker: -1 or +1. */
  onWorldStep: (step: number) => void = () => {};
  /** "Change world" on the end screen: back to the title. */
  onMenu: () => void = () => {};
  onPause: () => void = () => {};
  onResume: () => void = () => {};
  /** "End run" on the pause menu. */
  onQuit: () => void = () => {};
  onToggleSound: () => void = () => {};
  onToggleMusic: () => void = () => {};
  onToggleVibration: () => void = () => {};

  private hud = el('hud');
  private sizeBox = el('size');
  private sizeValue = el('size-value');
  private zone = el('zone');
  private twist = el('twist');
  private lastTwist = '';
  private progress = el('progress-fill');
  private bannerEl = el('banner');
  private milestoneEl = el('milestone');
  private milestoneText = el('milestone-text');
  private hintEl = el('hint');
  private hintText = el('hint-text');
  private floaters = el('floaters');
  private flashEl = el('flash');
  private titleScreen = el('title');
  private endScreen = el('end');
  private shopScreen = el('shop');
  private pauseScreen = el('pause');
  private shopList = el('shop-list');
  private skinList = el('skin-list');
  private bookScreen = el('book');
  private bookList = el('book-list');
  private powerBox = el('power');
  private powerLabel = el('power-label');
  private powerFill = el('power-fill');
  private lastPower = '';
  private lastPowerPct = -1;
  private debugEl = el('debug');
  private floaterPool: HTMLDivElement[] = [];
  private floaterNext = 0;
  private lastSize = '';
  private lastProgress = -1;
  private fragile = false;
  private gateBox = el('gate');
  private gateLabel = el('gate-label');
  private gateFill = el('gate-fill');
  private lastGateText = '';
  private lastGatePct = -1;
  private lastGateState = '';
  private sizeUnit = el('size-unit');
  private avalancheBox = el('avalanche');
  private avalancheFill = el('avalanche-fill');
  private whiteout = el('whiteout');
  private avalancheOn = false;
  private lastThreat = -1;

  constructor() {
    el('start-btn').addEventListener('click', () => this.onStart());
    el('again-btn').addEventListener('click', () => this.onRestart());
    el('shop-btn').addEventListener('click', () => this.onShop());
    el('end-shop-btn').addEventListener('click', () => this.onShop());
    el('shop-close').addEventListener('click', () => this.shopScreen.classList.add('hidden'));
    this.shopList.addEventListener('click', (e) => {
      const button = (e.target as HTMLElement).closest('button[data-id]') as HTMLButtonElement | null;
      if (button && !button.disabled) this.onBuy(button.dataset.id ?? '');
    });
    this.skinList.addEventListener('click', (e) => {
      const tile = (e.target as HTMLElement).closest('button[data-skin]') as HTMLButtonElement | null;
      if (tile && !tile.disabled) this.onSkin(tile.dataset.skin ?? '');
    });
    for (const id of ['book-btn', 'end-book-btn']) el(id).addEventListener('click', () => this.onBook());
    el('book-prev').addEventListener('click', () => this.onBookStep(-1));
    el('book-next').addEventListener('click', () => this.onBookStep(1));
    el('book-close').addEventListener('click', () => this.bookScreen.classList.add('hidden'));
    el('tab-upgrades').addEventListener('click', () => this.setShopTab('upgrades'));
    el('tab-skins').addEventListener('click', () => this.setShopTab('skins'));
    el('world-prev').addEventListener('click', () => this.onWorldStep(-1));
    el('world-next').addEventListener('click', () => this.onWorldStep(1));
    el('menu-btn').addEventListener('click', () => this.onMenu());
    const pauseBtn = el('pause-btn');
    // Keep the press away from the steering, or pausing would also count as a tap to jump.
    pauseBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    pauseBtn.addEventListener('click', () => this.onPause());
    el('resume-btn').addEventListener('click', () => this.onResume());
    el('quit-btn').addEventListener('click', () => this.onQuit());
    for (const id of ['sound-btn', 'title-sound-btn']) el(id).addEventListener('click', () => this.onToggleSound());
    for (const id of ['music-btn', 'title-music-btn']) el(id).addEventListener('click', () => this.onToggleMusic());
    for (const id of ['vibration-btn', 'title-vibration-btn']) el(id).addEventListener('click', () => this.onToggleVibration());
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Enter' && e.code !== 'Space') return;
      if (!this.shopScreen.classList.contains('hidden') || !this.pauseScreen.classList.contains('hidden')) return;
      if (!this.bookScreen.classList.contains('hidden')) return;
      if (!this.titleScreen.classList.contains('hidden')) this.onStart();
      else if (!this.endScreen.classList.contains('hidden')) this.onRestart();
    });
    for (let i = 0; i < 8; i++) {
      const d = document.createElement('div');
      d.className = 'floater';
      this.floaters.appendChild(d);
      this.floaterPool.push(d);
    }
  }

  /** @param best the best size so far as a label such as "12.4 m", or null if none */
  showTitle(best: string | null, coins: number): void {
    this.titleScreen.classList.remove('hidden');
    this.endScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.bookScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.setAvalanche(false, 0);
    el('title-best').textContent = best ? `Best ${best}` : '';
    this.setCoins(coins);
  }

  /**
   * The world picker on the title screen. A locked world can be looked at but not started:
   * the start button is switched off and the note says how to unlock it.
   */
  setWorldPick(pick: { name: string; index: number; count: number; locked: boolean; hasPrev: boolean; hasNext: boolean }): void {
    el('world-name').textContent = pick.name;
    el('world-note').textContent = pick.locked ? 'Locked: roll this far to start here' : `World ${pick.index} of ${pick.count}`;
    el('world-pick').classList.toggle('locked', pick.locked);
    (el('world-prev') as HTMLButtonElement).disabled = !pick.hasPrev;
    (el('world-next') as HTMLButtonElement).disabled = !pick.hasNext;
    const start = el('start-btn') as HTMLButtonElement;
    start.disabled = pick.locked;
    start.textContent = pick.locked ? 'Locked' : 'Tap to roll';
  }

  /** Show or hide the pause menu. */
  setPaused(paused: boolean): void {
    this.pauseScreen.classList.toggle('hidden', !paused);
  }

  /** Update the sound, music and vibration switches (on the title screen and the pause menu). */
  setSettings(sound: boolean, music: boolean, vibration: boolean): void {
    const show = (ids: string[], label: string, on: boolean): void => {
      for (const id of ids) {
        const b = el(id);
        b.textContent = `${label}: ${on ? 'on' : 'off'}`;
        b.classList.toggle('off', !on);
        b.setAttribute('aria-pressed', String(on));
      }
    };
    show(['sound-btn', 'title-sound-btn'], 'Sound', sound);
    show(['music-btn', 'title-music-btn'], 'Music', music);
    show(['vibration-btn', 'title-vibration-btn'], 'Vibration', vibration);
  }

  /**
   * The three missions, wherever they are listed (title screen, pause menu, end screen).
   * Only one of those is on screen at a time, so they all show the same rows.
   */
  setMissions(rows: MissionRow[]): void {
    for (const list of document.querySelectorAll('.missions')) {
      list.innerHTML = '';
      for (const row of rows) {
        const item = document.createElement('div');
        item.className = row.done ? 'mission done' : 'mission';
        const tick = document.createElement('i');
        tick.className = 'tick';
        const what = document.createElement('span');
        what.className = 'what';
        what.textContent = row.text;
        if (row.progress) {
          const so = document.createElement('em');
          so.textContent = row.progress;
          what.appendChild(so);
        }
        const reward = document.createElement('span');
        reward.className = 'coins';
        const amount = document.createElement('b');
        amount.textContent = `${row.done ? '+' : ''}${row.reward}`;
        reward.append(document.createElement('i'), amount);
        item.append(tick, what, reward);
        list.appendChild(item);
      }
    }
  }

  /** The coin balance shown on the Upgrades buttons. */
  setCoins(coins: number): void {
    const text = coins.toLocaleString('en-US');
    el('title-coins').textContent = text;
    el('end-total').textContent = text;
  }

  /** How much of the collection book is filled in, on the buttons that open it. */
  setBook(found: number, total: number): void {
    el('title-book').textContent = `${found}/${total}`;
  }

  /** Show (or turn the page of) the collection book, on top of whichever screen opened it. */
  openBook(view: BookView): void {
    el('book-total').textContent = `${view.found} of ${view.total} found`;
    el('book-name').textContent = view.name;
    // The page's reward is for the ordinary things; the rarer versions are a bonus.
    const ordinary = view.items.filter((item) => !item.rarity);
    const have = ordinary.filter((item) => item.count > 0).length;
    const note = el('book-note');
    note.textContent = '';
    if (view.paid) {
      note.textContent = `All ${ordinary.length} found!`;
    } else {
      const coin = document.createElement('span');
      coin.className = 'coins';
      const amount = document.createElement('b');
      amount.textContent = view.reward.toLocaleString('en-US');
      coin.append(document.createElement('i'), amount);
      note.append(document.createTextNode(`${have}/${ordinary.length} · find all for `), coin);
    }
    (el('book-prev') as HTMLButtonElement).disabled = !view.hasPrev;
    (el('book-next') as HTMLButtonElement).disabled = !view.hasNext;
    this.bookList.innerHTML = '';
    for (const item of view.items) {
      const found = item.count > 0;
      const tile = document.createElement('div');
      tile.className = found ? 'thing' : 'thing unknown';
      if (item.rarity) {
        const tag = document.createElement('span');
        tag.className = 'rarity';
        tag.textContent = item.rarity;
        tag.style.background = item.rarityColor;
        tile.appendChild(tag);
      }
      // The picture may arrive a moment later (setBookPicture); its space is kept meanwhile.
      const picture = document.createElement('img');
      picture.alt = '';
      if (item.picture) picture.src = item.picture;
      tile.appendChild(picture);
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = found ? item.name : '???';
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = found ? `×${item.count.toLocaleString('en-US')}` : '';
      tile.append(name, count);
      this.bookList.appendChild(tile);
    }
    this.bookList.scrollTop = 0;
    this.bookScreen.classList.remove('hidden');
  }

  /** True while the collection book is on screen. */
  get bookOpen(): boolean {
    return !this.bookScreen.classList.contains('hidden');
  }

  /** Put a picture that has just been drawn into its place on the open page (by position). */
  setBookPicture(index: number, url: string): void {
    const picture = this.bookList.children[index]?.querySelector('img');
    if (picture && url) picture.src = url;
  }

  /** The shop has two pages, upgrades and ball skins; this shows one of them. */
  private setShopTab(tab: 'upgrades' | 'skins'): void {
    el('tab-upgrades').classList.toggle('on', tab === 'upgrades');
    el('tab-skins').classList.toggle('on', tab === 'skins');
    this.shopList.hidden = tab !== 'upgrades';
    this.skinList.hidden = tab !== 'skins';
  }

  /** Fill the skins page of the shop: a tile each, with what a tap on it will do. */
  private fillSkins(skins: SkinRow[]): void {
    this.skinList.innerHTML = '';
    for (const skin of skins) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = skin.selected ? 'skin on' : skin.owned ? 'skin owned' : 'skin';
      tile.dataset.skin = skin.id;
      tile.disabled = skin.selected || !skin.affordable;
      const picture = document.createElement('img');
      picture.src = skin.picture;
      picture.alt = '';
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = skin.name;
      const state = document.createElement('span');
      state.className = 'state';
      if (skin.selected) state.textContent = 'In use';
      else if (skin.owned) state.textContent = 'Use';
      else state.append(document.createElement('i'), document.createTextNode(skin.price.toLocaleString('en-US')));
      tile.append(picture, name, state);
      this.skinList.appendChild(tile);
    }
  }

  /** Show (or refresh) the shop on top of whichever screen opened it. It stays on the page it was on. */
  openShop(coins: number, rows: ShopRow[], skins: SkinRow[]): void {
    el('shop-coins').textContent = coins.toLocaleString('en-US');
    this.fillSkins(skins);
    this.shopList.innerHTML = '';
    for (const row of rows) {
      const item = document.createElement('div');
      item.className = 'upgrade';
      const info = document.createElement('div');
      info.className = 'info';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = row.name;
      const blurb = document.createElement('div');
      blurb.className = 'blurb';
      blurb.textContent = row.effect || row.blurb;
      const pips = document.createElement('div');
      pips.className = 'pips';
      pips.setAttribute('aria-label', `Level ${row.level} of ${row.levels}`);
      for (let i = 0; i < row.levels; i++) {
        const pip = document.createElement('i');
        if (i < row.level) pip.className = 'on';
        pips.appendChild(pip);
      }
      info.append(name, blurb, pips);
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'buy';
      buy.dataset.id = row.id;
      buy.disabled = row.maxed || !row.affordable;
      if (row.maxed) {
        buy.textContent = 'Max';
        buy.classList.add('max');
      } else {
        const coin = document.createElement('i');
        buy.append(coin, document.createTextNode(row.cost.toLocaleString('en-US')));
      }
      item.append(info, buy);
      this.shopList.appendChild(item);
    }
    this.shopScreen.classList.remove('hidden');
  }

  /**
   * The countdown for a secret object's power ("Yeti rage"), under the wall meter.
   * @param fraction how much time is left, 1 → 0. An empty label hides it.
   */
  setPower(label: string, fraction: number): void {
    if (label !== this.lastPower) {
      this.lastPower = label;
      this.powerLabel.textContent = label;
      this.powerBox.classList.toggle('hidden', label === '');
    }
    const pct = Math.round(fraction * 100);
    if (pct !== this.lastPowerPct) {
      this.lastPowerPct = pct;
      this.powerFill.style.width = `${pct}%`;
    }
  }

  showHud(): void {
    this.titleScreen.classList.add('hidden');
    this.endScreen.classList.add('hidden');
    this.shopScreen.classList.add('hidden');
    this.bookScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.setFragile(false);
    this.setAvalanche(false, 0);
  }

  setSize(text: string, unit: string): void {
    const both = text + unit;
    if (both === this.lastSize) return;
    this.lastSize = both;
    this.sizeValue.textContent = text;
    this.sizeUnit.textContent = unit;
  }

  /** Name and colour of the thing chasing the ball in this world (avalanche, lava flow, black hole). */
  setChase(label: string, color: number): void {
    el('avalanche-label').textContent = label;
    const rgb = `${(color >> 16) & 255} ${(color >> 8) & 255} ${color & 255}`;
    this.whiteout.style.setProperty('--chase', rgb);
  }

  /**
   * The avalanche meter at the bottom of the screen and the white-out that rises as it
   * closes in. `threat` is 0 (as far back as it gets) to 1 (about to bury the ball).
   */
  setAvalanche(active: boolean, threat: number): void {
    if (active !== this.avalancheOn) {
      this.avalancheOn = active;
      this.avalancheBox.classList.toggle('hidden', !active);
    }
    const level = active ? Math.round(threat * 100) : 0;
    if (level === this.lastThreat) return;
    this.lastThreat = level;
    this.avalancheFill.style.width = `${level}%`;
    this.avalancheBox.classList.toggle('close', level > 55);
    // The white-out only starts once it is properly close.
    this.whiteout.style.opacity = `${Math.max(0, (level - 50) / 50) * 0.9}`;
  }

  /** Little bump on the size readout when something big is absorbed. */
  bumpSize(): void {
    this.sizeBox.classList.remove('bump');
    void this.sizeBox.offsetWidth;
    this.sizeBox.classList.add('bump');
  }

  setZone(name: string): void {
    this.zone.textContent = name;
  }

  /** The rule this world changes ("Low gravity"), shown under the scene name. Empty for none. */
  setTwist(name: string): void {
    if (name === this.lastTwist) return;
    this.lastTwist = name;
    this.twist.textContent = name;
    this.twist.classList.toggle('hidden', name === '');
  }

  /** p in 0..1 */
  setProgress(p: number): void {
    const v = Math.round(p * 1000) / 10;
    if (v === this.lastProgress) return;
    this.lastProgress = v;
    this.progress.style.width = `${v}%`;
  }

  /** Draw one tick per scene boundary on the run progress bar. */
  setStages(count: number): void {
    const bar = el('progress');
    bar.querySelectorAll('i').forEach((t) => t.remove());
    for (let i = 1; i < count; i++) {
      const tick = document.createElement('i');
      tick.style.left = `${(100 * i) / count}%`;
      bar.appendChild(tick);
    }
  }

  /**
   * The wall meter under the size readout.
   * @param fraction 0..1 of the way from the scene's starting size to the size needed
   * @param ready    big enough to smash the wall
   * @param urgent   the wall is close and the ball is still too small
   */
  setGate(label: string, fraction: number, ready: boolean, urgent: boolean): void {
    const text = ready ? `${label} · ready!` : label;
    if (text !== this.lastGateText) {
      this.lastGateText = text;
      this.gateLabel.textContent = text;
    }
    const pct = Math.round(fraction * 100);
    if (pct !== this.lastGatePct) {
      this.lastGatePct = pct;
      this.gateFill.style.width = `${pct}%`;
    }
    const state = ready ? 'ready' : urgent ? 'urgent' : '';
    if (state !== this.lastGateState) {
      this.lastGateState = state;
      this.gateBox.className = state;
    }
  }

  /** Red pulsing readout: the next hit will shatter the ball. */
  setFragile(on: boolean): void {
    if (on === this.fragile) return;
    this.fragile = on;
    this.sizeBox.classList.toggle('fragile', on);
  }

  banner(text: string, sub = ''): void {
    this.bannerEl.innerHTML = '';
    const main = document.createElement('div');
    main.className = 'banner-main';
    main.textContent = text;
    this.bannerEl.appendChild(main);
    if (sub) {
      const s = document.createElement('div');
      s.className = 'banner-sub';
      s.textContent = sub;
      this.bannerEl.appendChild(s);
    }
    this.bannerEl.classList.remove('go');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('go');
  }

  /** A first-time hint: one line in a dark card near the bottom, for a few seconds. */
  hint(text: string): void {
    this.hintText.textContent = text;
    this.hintEl.classList.remove('go');
    void this.hintEl.offsetWidth;
    this.hintEl.classList.add('go');
  }

  /** A gold tag that pops up under the banner: "Bigger than a house!". */
  milestone(text: string): void {
    this.milestoneText.textContent = text;
    this.milestoneEl.classList.remove('go');
    void this.milestoneEl.offsetWidth;
    this.milestoneEl.classList.add('go');
  }

  /** Floating text at a screen position (CSS pixels inside the game frame). */
  floatText(text: string, x: number, y: number, big: boolean): void {
    const d = this.floaterPool[this.floaterNext];
    this.floaterNext = (this.floaterNext + 1) % this.floaterPool.length;
    d.textContent = text;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.className = big ? 'floater big' : 'floater';
    void d.offsetWidth;
    d.classList.add('go');
  }

  /** Full-screen flash: 'hit' is a red vignette, 'big' a soft white bloom. */
  flash(kind: 'hit' | 'big'): void {
    this.flashEl.className = '';
    void this.flashEl.offsetWidth;
    this.flashEl.className = kind;
  }

  /** Drop any floating text, banner or flash still animating. */
  clearTransient(): void {
    for (const d of this.floaterPool) d.className = 'floater';
    this.bannerEl.classList.remove('go');
    this.milestoneEl.classList.remove('go');
    this.hintEl.classList.remove('go');
    this.flashEl.className = '';
  }

  showEnd(data: EndData): void {
    this.clearTransient();
    el('end-title').textContent = data.title;
    el('end-sub').textContent = data.subtitle;
    el('end-size').textContent = data.size;
    el('end-unit').textContent = data.unit;
    this.setAvalanche(false, 0);
    const best = el('end-best');
    best.textContent = data.isBest ? 'New best!' : `Best ${data.best}`;
    best.classList.toggle('new', data.isBest);
    el('end-coins').textContent = data.coins === null ? 'Practice run: no coins' : `+${data.coins.toLocaleString('en-US')} coins`;
    this.setCoins(data.totalCoins);
    const bookNote = el('end-book');
    bookNote.textContent = data.bookNote;
    bookNote.hidden = data.bookNote === '';
    this.setPower('', 0);
    const list = el('end-list');
    list.innerHTML = '';
    if (data.items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Just snow.';
      list.appendChild(empty);
    }
    for (const item of data.items) {
      const chip = document.createElement('div');
      chip.className = item.fresh ? 'chip new' : 'chip';
      const dot = document.createElement('i');
      dot.style.background = item.color;
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(item.label));
      list.appendChild(chip);
    }
    this.hud.classList.add('hidden');
    this.endScreen.classList.remove('hidden');
  }

  setDebug(text: string | null): void {
    if (text === null) {
      this.debugEl.classList.add('hidden');
      return;
    }
    this.debugEl.classList.remove('hidden');
    this.debugEl.textContent = text;
  }
}
