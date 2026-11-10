/**
 * Third-person chase camera. Every distance is a multiple of a smoothed copy of the
 * ball's radius (`camR`), so the ball keeps the same share of the screen while the
 * world visibly shrinks around it. The lag between the ball growing and `camR` catching
 * up is the zoom-out: the ball swells, then the camera breathes back.
 */
import * as THREE from 'three';
import { CONFIG } from './config';
import { LAP_GROWTH, groundY, rebaseD } from './zones';
import { clamp, damp, lerp } from './util';
import type { Ball } from './ball';

const _look = new THREE.Vector3();

export class CameraRig {
  readonly camera = new THREE.PerspectiveCamera(60, 0.5, 0.1, 500);
  /** Smoothed radius that drives all camera distances, fog and draw range. */
  camR = CONFIG.START_RADIUS;
  /** 1 = close title-screen framing, 0 = gameplay framing. */
  intro = 1;
  /** 0..1: how close the avalanche is. Set by the game each frame. */
  threat = 0;
  /** How far down the slope the camera itself is (m). */
  eyeD = 0;
  private pull = 0;
  camX = 0;
  private camD = 0;
  private baseFov = 60;
  private shakeAmp = 0;
  private fovKick = 0;
  private speedFov = 0;
  private roll = 0;
  private t = 0;

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    if (aspect < 1) {
      const h = THREE.MathUtils.degToRad(CONFIG.CAM_PORTRAIT_HFOV);
      this.baseFov = clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(h / 2) / aspect)), 40, 95);
    } else {
      this.baseFov = CONFIG.CAM_LANDSCAPE_VFOV;
    }
  }

  /** Jump straight to the ball (after a reset). */
  snap(ball: Ball): void {
    this.camR = ball.r;
    this.camX = ball.x;
    this.camD = ball.d;
    this.shakeAmp = 0;
    this.fovKick = 0;
    this.roll = 0;
    this.threat = 0;
    this.pull = 0;
  }

  /** Shrink by one lap along with the rest of the world (see REBASE_LAP in zones.ts). */
  rebase(): void {
    this.camR /= LAP_GROWTH;
    this.camX /= LAP_GROWTH;
    this.camD = rebaseD(this.camD);
    this.eyeD = rebaseD(this.eyeD);
  }

  /** amount ≈ 0.2 for a nudge, 1 for a big impact. */
  shake(amount: number): void {
    this.shakeAmp = Math.min(1.4, Math.max(this.shakeAmp, amount));
  }

  /** Brief widening of the field of view, in degrees. */
  kick(degrees: number): void {
    this.fovKick = Math.max(this.fovKick, degrees);
  }

  update(dt: number, ball: Ball, playing: boolean): void {
    const C = CONFIG;
    this.t += dt;
    this.intro += ((playing ? 0 : 1) - this.intro) * damp(playing ? 1.8 : 3, dt);
    this.camR += (ball.r - this.camR) * damp(C.CAM_ZOOM_RATE, dt);
    this.camD += (ball.d - this.camD) * damp(C.CAM_D_RATE, dt);
    this.camX += (ball.x * C.CAM_X_FOLLOW - this.camX) * damp(C.CAM_X_RATE, dt);

    const R = this.camR;
    const k = this.intro;
    // When the avalanche is close the camera eases back a touch — only a touch, because
    // it must stay ahead of the avalanche or the snow would hide the ball.
    this.pull += (this.threat - this.pull) * damp(2.5, dt);
    const dist = C.CAM_DIST_K * R * (1 - 0.5 * k) * (1 + 0.1 * this.pull);
    const height = C.CAM_HEIGHT_K * R * (1 - 0.55 * k) * (1 + 0.06 * this.pull);
    const cd = this.camD - dist;
    this.eyeD = cd;
    const cam = this.camera;
    cam.position.set(this.camX + k * R * 3.2, groundY(cd) + height, -cd);

    const ahead = this.camD + C.CAM_LOOK_AHEAD_K * R * (1 - 0.85 * k) * (1 - 0.2 * this.pull);
    _look.set(lerp(this.camX, ball.x, 0.35), groundY(ahead) + R * (1 + k), -ahead);

    if (this.shakeAmp > 0.001) {
      const a = this.shakeAmp * C.SHAKE_STRENGTH * R;
      cam.position.x += Math.sin(this.t * 71) * a;
      cam.position.y += Math.sin(this.t * 93 + 1.3) * a * 0.8;
      _look.x += Math.sin(this.t * 57 + 2.1) * a * 0.6;
      this.shakeAmp *= Math.exp(-C.SHAKE_DECAY * dt);
    }

    cam.lookAt(_look);
    const cruise = Math.max(0.001, ball.cruiseSpeed());
    const bank = clamp((ball.vx + ball.knock) / cruise, -1.2, 1.2) * -C.CAM_ROLL;
    this.roll += (bank - this.roll) * damp(6, dt);
    cam.rotateZ(this.roll);

    this.fovKick *= Math.exp(-5 * dt);
    const rush = clamp(ball.speed / cruise, 0, 1) * C.CAM_SPEED_FOV;
    this.speedFov += (rush - this.speedFov) * damp(2, dt);
    cam.fov = this.baseFov + this.fovKick + this.speedFov;
    cam.near = 0.25 * R;
    cam.far = 900 * R;
    cam.updateProjectionMatrix();
  }
}
