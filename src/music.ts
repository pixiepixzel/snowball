/**
 * Background music, made up on the spot with the Web Audio API — no audio files.
 *
 * Each world has a MusicStyle (worlds.ts) that says what its band is and how it plays:
 * which instrument carries the tune, what the bass and the accompaniment do, which drums,
 * whether it is in four or in waltz time, and so on. From that this writes an eight-bar
 * tune once (always the same tune for the same world, because the random numbers are
 * seeded) and loops it. So the mountain gets a glockenspiel over sleigh bells, the desert
 * a reed pipe over a drone and hand drums, the Toy Room a music-box waltz.
 *
 * The instruments are small recipes of oscillators and filters (see `voice`). Timing
 * follows the usual Web Audio pattern: a timer wakes up often and schedules the notes for
 * the next fraction of a second against the audio clock, so the beat stays steady even
 * when the frame rate doesn't.
 */
import { CONFIG } from './config';
import { mulberry32 } from './util';

/** The instruments. */
export type Voice =
  | 'bell' // glockenspiel: bright, rings on
  | 'musicbox' // tiny, high, short
  | 'chip' // old video-game square wave
  | 'flute' // breathy pan flute
  | 'whistle' // pure, with a gentle wobble
  | 'reed' // nasal desert pipe
  | 'theremin' // eerie, slides between notes
  | 'organ' // church organ
  | 'strings' // slow, soft, wide
  | 'pluck' // twangy lute
  | 'harp'
  | 'marimba'
  | 'pizz' // plucked string, very short
  | 'sub'; // plain round bass

export interface MusicStyle {
  /** Beats per minute, and beats in a bar (3 = a waltz). */
  bpm: number;
  beats: 3 | 4;
  /** The key: MIDI number of its root note (60 = middle C), and the scale as semitones above it. */
  root: number;
  scale: number[];
  /** The chord for each of the four bars, as a step of the scale (0 = the root). */
  chords: number[];
  /** The tune: instrument, octaves up, how busy (0..1), and how long notes ring (1 = until the next). */
  lead: Voice;
  octave: number;
  busy: number;
  hold: number;
  /**
   * The bass: 'roots' on the main beats, 'bounce' root and fifth on every beat, 'oompah'
   * one note at the start of the bar, 'drone' a held root and fifth.
   */
  bass: Voice;
  bassLine: 'roots' | 'bounce' | 'oompah' | 'drone';
  /**
   * The accompaniment: 'broken' a chord note on each off-beat, 'arp' a running arpeggio,
   * 'ripple' up and down like a harp, 'ostinato' a repeating syncopated figure,
   * 'offbeat' chords on the weak beats (oom-PAH-PAH), 'chords' one held chord a bar.
   */
  comp: Voice;
  compLine: 'none' | 'broken' | 'arp' | 'ripple' | 'ostinato' | 'offbeat' | 'chords';
  /** A soft held chord of strings underneath everything. */
  pad: boolean;
  /** The percussion. */
  drums: 'none' | 'soft' | 'sleigh' | 'bounce' | 'toms' | 'darbuka' | 'timpani' | 'brush';
  /** A sound effect woven in: rising bubbles, or a tolling bell. */
  extra: 'none' | 'bubbles' | 'toll';
  /** How much echo, 0..0.5. */
  echo: number;
  /**
   * Volume trim. Bands of short, tinkling notes come out much quieter than bands with
   * held ones, so they are turned up to match (1 = no change).
   */
  level: number;
}

const BARS = 8;
/** How far ahead of the audio clock notes are scheduled, and how often the timer runs. */
const LOOKAHEAD = 0.25;
const TICK_MS = 60;
/** The music is mixed in beside the effects, at MUSIC_VOLUME of their level. */
const VOLUME = CONFIG.MUSIC_VOLUME * CONFIG.MASTER_VOLUME;

const midiToHz = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
/** Sixteenth-note steps in a bar. */
const stepsPerBar = (style: MusicStyle): number => style.beats * 4;

export class Music {
  private ctx: BaseAudioContext | null = null;
  private bus!: GainNode;
  private echoDelay!: DelayNode;
  private echoWet!: GainNode;
  private noise!: AudioBuffer;
  private timer = 0;
  private enabled = true;
  private style: MusicStyle | null = null;
  private seed = 1;
  /** A style waiting to take over at the next bar line. */
  private next: { style: MusicStyle; seed: number } | null = null;
  /** The melody: one entry per half-beat over eight bars, a scale step or null for a rest. */
  private melody: (number | null)[] = [];
  private step = 0;
  private stepTime = 0;
  private urgency = 0;
  /** The theremin slides from the last note it played. */
  private glideHz = 0;

  /** Connect to the audio graph. Call once, after the audio context exists. */
  attach(ctx: BaseAudioContext, destination: AudioNode): void {
    this.ctx = ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = this.enabled ? VOLUME : 0;
    // Take the edge off the brighter instruments, and add an echo for a sense of space.
    const soften = ctx.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = 4200;
    this.echoDelay = ctx.createDelay(1.5);
    this.echoDelay.delayTime.value = 0.32;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    this.echoWet = ctx.createGain();
    this.echoWet.gain.value = 0.2;
    this.bus.connect(soften);
    soften.connect(destination);
    soften.connect(this.echoDelay);
    this.echoDelay.connect(feedback).connect(this.echoDelay);
    this.echoDelay.connect(this.echoWet).connect(destination);

    const sr = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, Math.floor(sr * 0.5), sr);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    if (this.next) this.adopt(this.next.style, this.next.seed);
    this.next = null;
    this.stepTime = ctx.currentTime + 0.15;
    if (this.enabled) this.run();
  }

  /** Switch tune. If music is already playing, the change waits for the next bar line. */
  setStyle(style: MusicStyle, seed: number): void {
    if (style === this.style && seed === this.seed) {
      this.next = null;
      return;
    }
    if (!this.ctx || !this.style) {
      if (this.ctx) this.adopt(style, seed);
      else this.next = { style, seed };
      return;
    }
    this.next = { style, seed };
  }

  /** The music switch. */
  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!this.ctx) return;
    this.bus.gain.setTargetAtTime(on ? VOLUME * (this.style?.level ?? 1) : 0, this.ctx.currentTime, 0.05);
    if (on) {
      this.stepTime = Math.max(this.stepTime, this.ctx.currentTime + 0.1);
      this.run();
    } else {
      window.clearInterval(this.timer);
      this.timer = 0;
    }
  }

  /** 0 = calm, 1 = the chaser is about to catch you: the tune speeds up a little. */
  setUrgency(level: number): void {
    this.urgency = Math.max(0, Math.min(1, level));
  }

  private run(): void {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.schedule(), TICK_MS);
  }

  /** Queue every note that starts before `until` seconds on the audio clock. */
  schedule(until = (this.ctx?.currentTime ?? 0) + LOOKAHEAD): void {
    const ctx = this.ctx;
    if (!ctx || !this.style) return;
    // After a pause or a hidden tab the clock may have run on: pick up from now, not then.
    if (this.stepTime < ctx.currentTime - 0.05) this.stepTime = ctx.currentTime + 0.05;
    while (this.stepTime < until) {
      if (this.next && this.step % stepsPerBar(this.style) === 0) {
        this.adopt(this.next.style, this.next.seed);
        this.next = null;
      }
      const style = this.style;
      const stepDur = 60 / style.bpm / 4 / (1 + CONFIG.MUSIC_URGENCY * this.urgency);
      this.playStep(style, this.step, this.stepTime, stepDur);
      this.step = (this.step + 1) % (stepsPerBar(style) * BARS);
      this.stepTime += stepDur;
    }
  }

  private adopt(style: MusicStyle, seed: number): void {
    this.style = style;
    this.seed = seed;
    this.melody = compose(style, seed);
    this.step = 0;
    this.glideHz = 0;
    if (this.ctx) {
      // The echo repeats three sixteenths later, which keeps it in time with the tune.
      const now = this.ctx.currentTime;
      this.echoDelay.delayTime.setTargetAtTime(Math.min(1.4, (60 / style.bpm / 4) * 3), now, 0.05);
      this.echoWet.gain.setTargetAtTime(style.echo, now, 0.1);
      if (this.enabled) this.bus.gain.setTargetAtTime(VOLUME * style.level, now, 0.1);
    }
  }

  /** The note `degree` steps up the scale from the root (negative = below it). */
  private pitch(style: MusicStyle, degree: number, octave: number): number {
    const n = style.scale.length;
    const within = ((degree % n) + n) % n;
    return midiToHz(style.root + 12 * (Math.floor(degree / n) + octave) + style.scale[within]);
  }

  // ------------------------------------------------------------------ the arrangement

  private playStep(style: MusicStyle, step: number, t: number, stepDur: number): void {
    const spb = stepsPerBar(style);
    const barNo = Math.floor(step / spb);
    const chord = style.chords[barNo % style.chords.length];
    const pos = step % spb;
    const beat = Math.floor(pos / 4);
    const sub = pos % 4;
    const bar = stepDur * spb;

    // --- the tune, on the half-beats
    if (step % 2 === 0) {
      const at = step / 2;
      const degree = this.melody[at];
      if (degree !== null && degree !== undefined) {
        // Ring until the next melody note, up to two beats.
        let gap = 1;
        while (gap < 4 && this.melody[(at + gap) % this.melody.length] === null) gap++;
        this.voice(style.lead, this.pitch(style, degree, style.octave), t, stepDur * 2 * gap * style.hold, 0.17);
      }
    }

    // --- bass
    const low = (degree: number): number => this.pitch(style, degree, -1);
    if (style.bassLine === 'roots') {
      if (pos === 0 || (style.beats === 4 && pos === 8)) this.voice(style.bass, low(chord), t, stepDur * 6, 0.2);
    } else if (style.bassLine === 'bounce') {
      // Root, fifth, root, fifth: a march or a polka.
      if (sub === 0) this.voice(style.bass, low(beat % 2 ? chord + 4 : chord), t, stepDur * 2.4, 0.2);
      else if (sub === 2 && style.busy > 0.7) this.voice(style.bass, this.pitch(style, chord, 0), t, stepDur * 1.2, 0.09);
    } else if (style.bassLine === 'oompah') {
      if (pos === 0) this.voice(style.bass, low(chord), t, stepDur * 4, 0.22);
    } else if (pos === 0) {
      // A drone: root and fifth held for the whole bar.
      this.voice(style.bass, low(chord), t, bar, 0.16);
      this.voice(style.bass, low(chord + 4), t, bar, 0.08);
    }

    // --- accompaniment
    const mid = (degree: number, octave = 0): number => this.pitch(style, degree, octave);
    const n = style.scale.length;
    if (style.compLine === 'broken') {
      if (sub === 2) this.voice(style.comp, mid(chord + [0, 2, 4, 2][beat]), t, stepDur * 3, 0.07);
    } else if (style.compLine === 'arp') {
      // A running arpeggio: sixteenths if the style is busy, otherwise eighths.
      const every = style.busy > 0.7 ? 1 : 2;
      if (pos % every === 0) {
        const tone = [0, 2, 4, n, 4, 2][(pos / every) % 6];
        this.voice(style.comp, mid(chord + tone), t, stepDur * every * 0.9, 0.055);
      }
    } else if (style.compLine === 'ripple') {
      // Up and back down over nearly two octaves, like a hand across a harp.
      if (pos % 2 === 0) {
        const shape = [0, 2, 4, n, n + 2, n + 4, n + 2, n];
        this.voice(style.comp, mid(chord + shape[(pos / 2) % shape.length], -1), t, stepDur * 5, 0.065);
      }
    } else if (style.compLine === 'ostinato') {
      // The same syncopated figure every bar.
      const hits = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0];
      if (hits[pos % 16]) this.voice(style.comp, mid(chord + (pos % 3 === 0 ? 0 : pos % 3 === 1 ? 4 : 2)), t, stepDur * 2, 0.08);
    } else if (style.compLine === 'offbeat') {
      // Oom-PAH-PAH (or oom-PAH in four): the chord on the weak beats.
      const weak = style.beats === 3 ? beat > 0 : beat % 2 === 1;
      if (sub === 0 && weak) for (const tone of [0, 2, 4]) this.voice(style.comp, mid(chord + tone), t, stepDur * 2.2, 0.05);
    } else if (style.compLine === 'chords') {
      if (pos === 0) for (const tone of [0, 2, 4]) this.voice(style.comp, mid(chord + tone, -1), t, bar * 0.98, 0.06);
    }

    if (style.pad && pos === 0) for (const tone of [0, 2, 4]) this.voice('strings', mid(chord + tone), t, bar, 0.05);

    // --- percussion
    this.drums(style, pos, beat, sub, barNo, t, stepDur);

    // --- extras
    if (style.extra === 'bubbles') {
      // A few bubbles at fixed places in the loop.
      if (step % 23 === 9 || step % 37 === 20) this.blip(t, 500 + (step % 7) * 90, 2.4, 0.09, 0.05);
    } else if (style.extra === 'toll' && pos === 0 && barNo % 4 === 0) {
      // A distant church bell at the top of each four bars.
      this.voice('bell', this.pitch(style, 0, -1), t, bar * 2, 0.16);
    }
  }

  private drums(style: MusicStyle, pos: number, beat: number, sub: number, barNo: number, t: number, stepDur: number): void {
    switch (style.drums) {
      case 'soft':
        if (pos === 0 || pos === 8) this.thump(t, 150, 60, 0.16, 0.2);
        if (sub === 2) this.hiss(t, 6500, 0.05, 0.035);
        break;
      case 'brush':
        // Barely there: a soft swish on the off-beats.
        if (sub === 2) this.hiss(t, 5000, 0.09, 0.022);
        break;
      case 'sleigh':
        // Sleigh bells jingling on every half-beat, a soft thud on one and three.
        if (pos % 2 === 0) this.jingle(t, sub === 0 ? 0.05 : 0.032);
        if (pos === 0 || pos === 8) this.thump(t, 140, 60, 0.14, 0.14);
        break;
      case 'bounce':
        // Kick on one and three, a clap on two and four, hats in between.
        if (sub === 0) {
          if (beat % 2 === 0) this.thump(t, 170, 55, 0.15, 0.24);
          else this.clap(t, 0.11);
        }
        if (sub === 2) this.hiss(t, 7500, 0.04, 0.04);
        break;
      case 'toms':
        // Low drums and a shaker.
        if (pos === 0 || pos === 6 || pos === 8) this.thump(t, 190, 100, 0.2, 0.2);
        if (pos === 12 || pos === 14) this.thump(t, 260, 150, 0.14, 0.15);
        if (pos % 2 === 0) this.hiss(t, 4500, 0.04, pos % 4 === 0 ? 0.03 : 0.018);
        break;
      case 'darbuka':
        // The "maqsum" hand-drum rhythm: DUM tek . tek DUM . tek .
        if (pos === 0 || pos === 8) this.thump(t, 200, 85, 0.18, 0.24);
        if (pos === 2 || pos === 6 || pos === 12) this.tek(t, 0.12);
        if (pos === 14 && barNo % 2 === 1) this.tek(t, 0.08);
        break;
      case 'timpani':
        // A slow, distant kettledrum.
        if (pos === 0 && barNo % 2 === 0) this.thump(t, 95, 68, 0.7, 0.26);
        if (pos === 12 && barNo % 4 === 3) this.thump(t, 110, 80, 0.4, 0.16);
        break;
      default:
        break;
    }
    void stepDur;
  }

  // ------------------------------------------------------------------ instruments

  /** Play one note on one of the instruments. */
  private voice(kind: Voice, hz: number, t: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const bus = this.bus;

    /** A gain that rises quickly and dies away: struck and plucked sounds. */
    const struck = (peak: number, length: number, attack = 0.004): GainNode => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + length);
      return g;
    };
    /** A gain that rises, holds for the note, and lets go: blown and bowed sounds. */
    const held = (peak: number, attack: number, release: number): GainNode => {
      const g = ctx.createGain();
      const end = Math.max(t + attack + 0.01, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.setValueAtTime(peak, end);
      g.gain.linearRampToValueAtTime(0.0001, end + release);
      return g;
    };
    const tone = (type: OscillatorType, f: number, stop: number, detune = 0): OscillatorNode => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      o.detune.value = detune;
      o.start(t);
      o.stop(stop + 0.03);
      return o;
    };
    /** A slow wobble in pitch. */
    const vibrato = (target: OscillatorNode, rate: number, depth: number, stop: number): void => {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const amount = ctx.createGain();
      amount.gain.value = hz * depth;
      lfo.connect(amount).connect(target.frequency);
      lfo.start(t);
      lfo.stop(stop + 0.03);
    };

    switch (kind) {
      case 'bell': {
        // A struck bar: the note plus two out-of-tune overtones that die away faster.
        const length = Math.max(dur, 0.9);
        tone('sine', hz, t + length).connect(struck(vol, length)).connect(bus);
        tone('sine', hz * 2.76, t + length * 0.5).connect(struck(vol * 0.3, length * 0.5)).connect(bus);
        tone('sine', hz * 5.4, t + length * 0.2).connect(struck(vol * 0.12, length * 0.2)).connect(bus);
        break;
      }
      case 'musicbox': {
        const length = 0.75;
        tone('sine', hz, t + length).connect(struck(vol * 0.9, length)).connect(bus);
        tone('sine', hz * 3, t + 0.2).connect(struck(vol * 0.22, 0.2)).connect(bus);
        tone('triangle', hz * 2, t + 0.35).connect(struck(vol * 0.12, 0.35)).connect(bus);
        break;
      }
      case 'chip': {
        tone('square', hz, t + dur + 0.04).connect(held(vol * 0.36, 0.004, 0.03)).connect(bus);
        break;
      }
      case 'flute': {
        // A breathy pipe: a soft tone with a puff of air at the start.
        const end = t + dur + 0.1;
        const o = tone('sine', hz, end);
        vibrato(o, 5, 0.005, end);
        o.connect(held(vol, 0.05, 0.09)).connect(bus);
        tone('triangle', hz * 2, end).connect(held(vol * 0.12, 0.05, 0.09)).connect(bus);
        this.hiss(t, Math.min(6000, hz * 3), 0.07, vol * 0.25, 'bandpass');
        break;
      }
      case 'whistle': {
        const end = t + dur + 0.12;
        const o = tone('sine', hz, end);
        vibrato(o, 5.5, 0.007, end);
        o.connect(held(vol * 0.9, 0.03, 0.11)).connect(bus);
        break;
      }
      case 'reed': {
        // A nasal pipe: a buzzy wave squeezed through a narrow filter.
        const end = t + dur + 0.08;
        const o = tone('sawtooth', hz, end);
        vibrato(o, 6, 0.009, end);
        const nose = ctx.createBiquadFilter();
        nose.type = 'bandpass';
        nose.frequency.value = 1350;
        nose.Q.value = 1.4;
        o.connect(nose).connect(held(vol * 1.1, 0.025, 0.06)).connect(bus);
        break;
      }
      case 'theremin': {
        // Slides from the previous note, with a wide wobble.
        const end = t + dur + 0.18;
        const o = tone('sine', this.glideHz || hz, end);
        o.frequency.exponentialRampToValueAtTime(hz, t + 0.1);
        vibrato(o, 5.5, 0.012, end);
        o.connect(held(vol * 0.95, 0.08, 0.16)).connect(bus);
        this.glideHz = hz;
        break;
      }
      case 'organ': {
        // Pipes at the note, the octave and above, all held.
        const end = t + dur + 0.1;
        const g = held(vol * 0.5, 0.025, 0.09);
        g.connect(bus);
        const stops: [number, number][] = [
          [1, 1],
          [2, 0.5],
          [3, 0.25],
          [4, 0.12],
        ];
        for (const [times, level] of stops) {
          const pipe = ctx.createGain();
          pipe.gain.value = level;
          tone('sine', hz * times, end).connect(pipe).connect(g);
        }
        break;
      }
      case 'strings': {
        // Two slightly out-of-tune saws through a soft filter, fading in slowly.
        const attack = Math.min(0.35, dur * 0.3);
        const end = t + dur + 0.45;
        const soft = ctx.createBiquadFilter();
        soft.type = 'lowpass';
        soft.frequency.value = Math.min(2600, 900 + hz);
        const g = held(vol * 0.36, attack, 0.4);
        soft.connect(g).connect(bus);
        tone('sawtooth', hz, end, -7).connect(soft);
        tone('sawtooth', hz, end, 7).connect(soft);
        break;
      }
      case 'pluck': {
        // A twang: bright at the instant it is plucked, dull a moment later.
        const length = 0.6;
        const twang = ctx.createBiquadFilter();
        twang.type = 'lowpass';
        twang.frequency.setValueAtTime(3800, t);
        twang.frequency.exponentialRampToValueAtTime(500, t + 0.22);
        tone('sawtooth', hz, t + length).connect(twang).connect(struck(vol * 0.65, length)).connect(bus);
        break;
      }
      case 'harp': {
        const length = Math.max(dur, 0.85);
        tone('triangle', hz, t + length).connect(struck(vol, length)).connect(bus);
        tone('sine', hz * 2, t + length * 0.4).connect(struck(vol * 0.2, length * 0.4)).connect(bus);
        break;
      }
      case 'marimba': {
        tone('sine', hz, t + 0.32).connect(struck(vol * 1.1, 0.32)).connect(bus);
        tone('sine', hz * 4, t + 0.06).connect(struck(vol * 0.4, 0.06)).connect(bus);
        break;
      }
      case 'pizz': {
        tone('triangle', hz, t + 0.22).connect(struck(vol * 1.1, 0.22)).connect(bus);
        break;
      }
      default: {
        // 'sub': a round bass, with an octave on top so small phone speakers can carry it.
        const end = t + dur + 0.07;
        tone('sine', hz, end).connect(held(vol, 0.012, 0.06)).connect(bus);
        tone('triangle', hz * 2, end).connect(held(vol * 0.3, 0.012, 0.06)).connect(bus);
        break;
      }
    }
  }

  // ------------------------------------------------------------------ percussion and effects

  /** A drum: a sine that drops quickly in pitch. */
  private thump(t: number, from: number, to: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** A burst of filtered noise: hats, shakers, brushes, breath. */
  private hiss(t: number, hz: number, dur: number, vol: number, type: BiquadFilterType = 'highpass'): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = hz;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.bus);
    src.start(t, Math.random() * 0.3);
    src.stop(t + dur + 0.02);
  }

  /** Sleigh bells: two very quick, very high shakes. */
  private jingle(t: number, vol: number): void {
    this.hiss(t, 8500, 0.035, vol);
    this.hiss(t + 0.03, 9500, 0.05, vol * 0.7);
  }

  /** A hand clap: three quick bursts of mid-range noise. */
  private clap(t: number, vol: number): void {
    for (let i = 0; i < 3; i++) this.hiss(t + i * 0.011, 1700, i === 2 ? 0.09 : 0.02, vol, 'bandpass');
  }

  /** The sharp rim stroke of a hand drum. */
  private tek(t: number, vol: number): void {
    this.hiss(t, 2800, 0.045, vol, 'bandpass');
    this.thump(t, 520, 380, 0.04, vol * 0.5);
  }

  /** A bubble: a short tone that rises. */
  private blip(t: number, hz: number, rise: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * rise, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}

/**
 * Write the melody: eight bars of half-beats. It wanders up and down the scale a step or
 * two at a time, lands on a note of the bar's chord on the strong beats, and rests more
 * the less busy the style is. Bars five to eight repeat bars one to four so it sounds
 * like a tune, except the last bar, which winds down to the key note.
 */
export function compose(style: MusicStyle, seed: number): (number | null)[] {
  const rng = mulberry32(seed);
  const perBar = style.beats * 2;
  const phrase = perBar * style.chords.length;
  const notes: (number | null)[] = new Array(perBar * BARS).fill(null);
  const steps = [-2, -1, -1, 0, 1, 1, 2];
  const n = style.scale.length;
  /** Nearest note of the chord to `degree`. */
  const chordTone = (degree: number, chord: number): number => {
    let best = degree;
    let bestGap = Infinity;
    for (let octave = -1; octave <= 1; octave++) {
      for (const tone of [0, 2, 4]) {
        const candidate = chord + tone + octave * n;
        const gap = Math.abs(candidate - degree);
        if (gap < bestGap) {
          bestGap = gap;
          best = candidate;
        }
      }
    }
    return best;
  };

  let repeats = 0;
  let degree = style.chords[0] + [0, 2, 4][Math.floor(rng() * 3)];
  for (let i = 0; i < phrase; i++) {
    const chord = style.chords[Math.floor(i / perBar)];
    const pos = i % perBar;
    // In four the strong beats are one and three; in a waltz, just one.
    const strong = style.beats === 3 ? pos === 0 : pos % 4 === 0;
    const chance = strong ? 0.92 : pos % 2 === 0 ? 0.35 + style.busy * 0.55 : style.busy * 0.6;
    if (rng() >= chance) continue;
    let move = steps[Math.floor(rng() * steps.length)];
    // Keep it singable: turn back when it strays far from the middle of the scale, and
    // don't sit on one note three times running.
    if (degree >= n) move = -Math.max(1, Math.abs(move));
    else if (degree <= 0) move = Math.max(1, Math.abs(move));
    else if (move === 0 && repeats >= 1) move = rng() < 0.5 ? 1 : -1;
    repeats = move === 0 ? repeats + 1 : 0;
    degree += move;
    if (strong) degree = chordTone(degree, chord);
    degree = Math.max(-2, Math.min(n + 2, degree));
    notes[i] = degree;
  }
  // Second half: the same again, with a last bar that comes home.
  for (let i = 0; i < phrase; i++) notes[phrase + i] = notes[i];
  const last = phrase * 2 - perBar;
  for (let i = 0; i < perBar; i++) notes[last + i] = null;
  const home = style.chords[style.chords.length - 1];
  notes[last] = chordTone(degree, home);
  notes[last + 2] = chordTone(degree, home) - 1;
  notes[last + 4] = Math.abs(degree - n) < Math.abs(degree) ? n : 0;
  return notes;
}
