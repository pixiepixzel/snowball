/**
 * All sound is synthesised with the Web Audio API — no audio files.
 * Call `start()` from a tap/click handler (browsers only allow audio after a gesture).
 */
import { CONFIG } from './config';
import { Music, type MusicStyle } from './music';
import { clamp } from './util';

type Ctx = AudioContext;

export class AudioEngine {
  private ctx: Ctx | null = null;
  private master!: GainNode;
  private noise!: AudioBuffer;
  private rollSrc!: AudioBufferSourceNode;
  private rollFilter!: BiquadFilterNode;
  private rollGain!: GainNode;
  private rumble!: OscillatorNode;
  private rumbleGain!: GainNode;
  private roarGain: GainNode | null = null;
  private muted = false;
  private music = new Music();

  /** Which tune to play (worlds.ts). `seed` picks the melody: the same seed, the same tune. */
  setMusic(style: MusicStyle, seed: number): void {
    this.music.setStyle(style, seed);
  }

  /** The music switch. */
  setMusicOn(on: boolean): void {
    this.music.setEnabled(on);
  }

  /** 0..1: how close the chaser is. The music speeds up a little as it nears. */
  setMusicUrgency(level: number): void {
    this.music.setUrgency(level);
  }

  /** The sound switch. Works before the first tap too: it is applied when audio starts. */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : CONFIG.MASTER_VOLUME, this.ctx.currentTime, 0.03);
  }

  /** Create (or resume) the audio context. Safe to call repeatedly. */
  start(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch {
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : CONFIG.MASTER_VOLUME;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.ratio.value = 8;
    this.master.connect(limiter).connect(ctx.destination);

    // Plain white noise for bursts.
    const sr = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, sr, sr);
    const white = this.noise.getChannelData(0);
    for (let i = 0; i < white.length; i++) white[i] = Math.random() * 2 - 1;

    // Rolling loop: soft brown rumble plus random crackles, like snow being crushed.
    const loop = ctx.createBuffer(1, sr * 2, sr);
    const data = loop.getChannelData(0);
    let brown = 0;
    let env = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      brown = (brown + 0.03 * w) / 1.03;
      if (Math.random() < 55 / sr) env = 0.35 + Math.random() * 0.65;
      env *= 0.9982;
      data[i] = brown * 2.6 + w * env * 0.5;
    }
    const fade = Math.floor(sr * 0.01);
    for (let i = 0; i < fade; i++) {
      data[i] *= i / fade;
      data[data.length - 1 - i] *= i / fade;
    }

    this.rollSrc = ctx.createBufferSource();
    this.rollSrc.buffer = loop;
    this.rollSrc.loop = true;
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'lowpass';
    this.rollFilter.frequency.value = 2400;
    this.rollFilter.Q.value = 0.7;
    this.rollGain = ctx.createGain();
    this.rollGain.gain.value = 0;
    this.rollSrc.connect(this.rollFilter).connect(this.rollGain).connect(this.master);
    this.rollSrc.start();

    // A low hum that fades in as the ball becomes enormous.
    this.rumble = ctx.createOscillator();
    this.rumble.type = 'triangle';
    this.rumble.frequency.value = 70;
    this.rumbleGain = ctx.createGain();
    this.rumbleGain.gain.value = 0;
    this.rumble.connect(this.rumbleGain).connect(this.master);
    this.rumble.start();

    // Music goes round the master volume, so the Sound switch (which mutes the master)
    // silences the effects only and the Music switch looks after the music.
    this.music.attach(ctx, limiter);
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** 0 for a 25 cm ball, 1 for a 50 m one (log scale). */
  private sizeNorm(radius: number): number {
    return clamp(Math.log(radius / 0.25) / Math.log(200), 0, 1);
  }

  /** Continuous rolling noise. Bigger ball = deeper, heavier crunch. */
  setRoll(speedFrac: number, radius: number, timeScale: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = this.sizeNorm(radius);
    const now = ctx.currentTime;
    const s = clamp(speedFrac, 0, 1.2);
    this.rollFilter.frequency.setTargetAtTime(2600 * Math.pow(0.085, t), now, 0.1);
    this.rollSrc.playbackRate.setTargetAtTime(1.35 * Math.pow(0.3, t) * (0.6 + 0.4 * timeScale), now, 0.08);
    this.rollGain.gain.setTargetAtTime(0.3 * s * (0.75 + 0.6 * t), now, 0.08);
    this.rumble.frequency.setTargetAtTime(78 - 34 * t, now, 0.2);
    this.rumbleGain.gain.setTargetAtTime(0.11 * t * s, now, 0.15);
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur * 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private burstNoise(filter: BiquadFilterType, f0: number, f1: number, dur: number, vol: number, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  }

  /**
   * Absorb pop.
   * @param q      object size ÷ ball radius (bigger mouthfuls sound fuller)
   * @param combo  consecutive quick absorbs — each one steps the pitch up
   */
  pop(q: number, combo: number, radius: number): void {
    const t = this.sizeNorm(radius);
    const step = Math.min(combo, 12);
    const base = 500 * Math.pow(0.5, t) * Math.pow(2, step / 12) * (1.15 - 0.4 * clamp(q, 0, 1));
    this.tone('triangle', base, base * 1.9, 0.13, 0.22 + 0.2 * clamp(q, 0, 1));
    this.burstNoise('highpass', 2200, 1200, 0.05, 0.1);
  }

  /** Extra "whoomp" under the pop for big and landmark absorbs. */
  bigAbsorb(radius: number): void {
    const t = this.sizeNorm(radius);
    this.tone('sine', 230 - 90 * t, 55, 0.5, 0.6);
    this.burstNoise('lowpass', 1400, 200, 0.35, 0.3);
    this.tone('triangle', 660 - 260 * t, 990 - 380 * t, 0.3, 0.16, 0.06);
  }

  /** Hitting something too big. */
  thud(radius: number): void {
    const t = this.sizeNorm(radius);
    this.tone('sine', 170 - 70 * t, 42, 0.32, 0.9);
    this.burstNoise('lowpass', 700 - 300 * t, 120, 0.2, 0.55);
  }

  shatter(): void {
    this.burstNoise('bandpass', 5000, 500, 0.7, 0.8);
    this.burstNoise('highpass', 3000, 1500, 0.25, 0.4, 0.05);
    this.tone('sine', 180, 40, 0.5, 0.8);
  }

  /** Tap-jump (a quick upward blip) or a bigger whoosh off a ramp. */
  jump(big: boolean): void {
    this.tone('triangle', big ? 260 : 340, big ? 720 : 620, big ? 0.3 : 0.16, 0.16);
    if (big) this.burstNoise('bandpass', 500, 2400, 0.35, 0.18);
  }

  /** Touching down after a jump. */
  land(radius: number, clean: boolean): void {
    const t = this.sizeNorm(radius);
    this.tone('sine', 150 - 60 * t, 50, 0.2, 0.5);
    this.burstNoise('lowpass', 900, 200, 0.16, 0.3);
    if (clean) this.tone('triangle', 784, 1175, 0.22, 0.14, 0.05);
  }

  /** Falling into a river. */
  splash(): void {
    this.burstNoise('bandpass', 1800, 300, 0.7, 0.7);
    this.tone('sine', 300, 60, 0.6, 0.5);
  }

  /** Freezing a river: a bright crackle. */
  freeze(): void {
    this.burstNoise('highpass', 5000, 2500, 0.3, 0.3);
    this.tone('triangle', 1175, 1568, 0.3, 0.16);
    this.tone('triangle', 1568, 2093, 0.3, 0.12, 0.08);
  }

  /** The avalanche's roar: 0 = far away, 1 = on top of you. */
  setAvalanche(level: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (!this.roarGain) {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      src.playbackRate.value = 0.5;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      this.roarGain = ctx.createGain();
      this.roarGain.gain.value = 0;
      src.connect(f).connect(this.roarGain).connect(this.master);
      src.start();
    }
    this.roarGain.gain.setTargetAtTime(0.05 + 0.75 * level * level, ctx.currentTime, 0.15);
  }

  /** Silence the avalanche (between runs). */
  stopAvalanche(): void {
    if (this.ctx && this.roarGain) this.roarGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
  }

  /** Entering a new zone. */
  chime(): void {
    this.tone('triangle', 660, 660, 0.25, 0.14);
    this.tone('triangle', 880, 880, 0.35, 0.14, 0.11);
  }

  /** Reaching the bottom. */
  fanfare(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.4, 0.18, i * 0.11));
  }
}
