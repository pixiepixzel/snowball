/**
 * Player input. Touch and mouse both arrive as pointer events:
 *   - press and drag left / right anywhere to steer
 *   - a quick tap (press and release without moving) to jump
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
  private downAt = 0;
  private travelled = 0;
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
    el.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }

  private onDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.lastX = e.clientX;
    this.downAt = performance.now();
    this.travelled = 0;
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const step = (e.clientX - this.lastX) / Math.max(1, this.el.clientWidth);
    this.dragged += step;
    this.travelled += Math.abs(step);
    this.lastX = e.clientX;
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    const quick = performance.now() - this.downAt < CONFIG.TAP_MAX_TIME * 1000;
    if (quick && this.travelled < CONFIG.TAP_MAX_MOVE) this.jumpQueued = true;
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

  /** True once for each tap / jump key press. */
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
