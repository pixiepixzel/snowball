/**
 * Player input. Touch and mouse both arrive as pointer events:
 *   - press and drag left / right anywhere to steer
 *   - swipe up to jump (a quick flick upwards; the finger can stay down and keep steering)
 * Drag is reported as a fraction of the screen width, so it behaves the same on every
 * screen size. On desktop, arrow keys / A-D steer and Space / Up / W jumps.
 *
 * Smoothing is applied by the ball (see STEER_SMOOTH), not here — this is raw input.
 */
import { CONFIG } from './config';

export class Input {
  private pointerId: number | null = null;
  private lastX = 0;
  private dragged = 0;
  private left = false;
  private right = false;
  /** Where and when the upward swipe being watched for began. */
  private swipeX = 0;
  private swipeY = 0;
  private swipeAt = 0;
  /** Where the finger was at the last move, to tell which way it is going now. */
  private lastY = 0;
  private lastSwipeX = 0;
  /** True once a swipe has made its jump, until the finger stops going up. */
  private swipeSpent = false;
  private jumpQueued = false;

  constructor(private el: HTMLElement) {
    el.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onCancel);
    window.addEventListener('blur', () => {
      this.pointerId = null;
      this.left = this.right = false;
    });
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    // Stop the browser from scrolling, zooming or opening menus mid-run.
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    // (Except over a card: the end screen, shop and book have to scroll under a finger.)
    el.addEventListener(
      'touchmove',
      (e) => {
        if (!(e.target instanceof Element && e.target.closest('.card'))) e.preventDefault();
      },
      { passive: false },
    );
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  private onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.lastX = e.clientX;
    this.swipeSpent = false;
    this.swipeFrom(e);
  };

  /** Start watching for an upward swipe from where the finger is now. */
  private swipeFrom(e: PointerEvent): void {
    this.swipeX = e.clientX;
    this.swipeY = e.clientY;
    this.swipeAt = performance.now();
    this.lastY = e.clientY;
    this.lastSwipeX = e.clientX;
  }

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const step = (e.clientX - this.lastX) / Math.max(1, this.el.clientWidth);
    this.dragged += step;
    this.lastX = e.clientX;

    // A swipe up is a jump: far enough, fast enough, and more up than sideways. If the
    // finger dawdles or drops back down, the watch starts again from where it is, so a
    // slow drift upwards while steering never adds up to one.
    // The same goes for a stretch of steering: a flick up straight after a sideways drag
    // is measured from where the flick began, not from where the finger first went down.
    const up = this.swipeY - e.clientY;
    const stepUp = this.lastY - e.clientY;
    const stepAcross = Math.abs(e.clientX - this.lastSwipeX);
    this.lastY = e.clientY;
    this.lastSwipeX = e.clientX;
    const sideways = stepAcross > Math.max(stepUp, 2) * 2;
    // One swipe is one jump, however long it is: the finger has to stop going up (pause,
    // come back down, or steer) before another flick counts. It needn't lift.
    if (stepUp <= 0 || sideways) this.swipeSpent = false;
    if (up < 0 || stepUp < 0 || sideways || performance.now() - this.swipeAt > CONFIG.SWIPE_MAX_TIME * 1000) {
      this.swipeFrom(e);
    } else if (up >= CONFIG.SWIPE_UP_MIN * Math.max(1, this.el.clientHeight) && up > Math.abs(e.clientX - this.swipeX) * CONFIG.SWIPE_UP_RATIO) {
      if (!this.swipeSpent) this.jumpQueued = true;
      this.swipeSpent = true;
      this.swipeFrom(e);
    }
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
  };

  private onCancel = (e: PointerEvent): void => {
    if (e.pointerId === this.pointerId) this.pointerId = null;
  };

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = down;
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = down;
    else if (down && !e.repeat && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) this.jumpQueued = true;
  }

  /** Drag since the last call, in screen widths (positive = right). */
  consumeDrag(): number {
    const d = this.dragged;
    this.dragged = 0;
    return d;
  }

  /** True once for each swipe up / jump key press. */
  consumeJump(): boolean {
    const j = this.jumpQueued;
    this.jumpQueued = false;
    return j;
  }

  /** -1, 0 or +1 from the keyboard. */
  get keyAxis(): number {
    return (this.right ? 1 : 0) - (this.left ? 1 : 0);
  }
}
