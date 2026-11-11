/**
 * The writing on the distance posts (and BEST on the best-run flag).
 *
 * Each sign is a small flat panel standing just in front of its board, inside the 3D
 * scene, with the words painted on it. Because it is part of the scene, anything in front
 * of the post hides it, the fog fades it, and it moves exactly with its board.
 */
import * as THREE from 'three';

/** One sign to show this frame: where the middle of its board is, which way it is turned and how big it is. */
export interface PostSign {
  x: number;
  y: number;
  z: number;
  /** The post's turn about the upright (radians). */
  rot: number;
  /** The panel's width and height, and how far in front of the board's middle it stands. */
  w: number;
  h: number;
  depth: number;
  text: string;
  gold: boolean;
}

/** The painted panel, in pixels. Its shape matches the board's (about 2.6 to 1). */
const PX_W = 256;
const PX_H = 98;
/** How many signs can show at once. */
const MAX_SIGNS = 10;

interface Sign {
  mesh: THREE.Mesh;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  text: string;
  gold: boolean;
}

export class PostLabels {
  private signs: Sign[] = [];
  private font: string;

  constructor(private scene: THREE.Scene) {
    this.font = getComputedStyle(document.body).fontFamily || 'sans-serif';
  }

  private make(): Sign {
    const canvas = document.createElement('canvas');
    canvas.width = PX_W;
    canvas.height = PX_H;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    this.scene.add(mesh);
    const sign: Sign = { mesh, ctx: canvas.getContext('2d') as CanvasRenderingContext2D, texture, text: '', gold: false };
    this.signs.push(sign);
    return sign;
  }

  /** The biggest type size, from `start` down, at which `text` is no wider than `width`. */
  private fit(ctx: CanvasRenderingContext2D, text: string, width: number, start: number): number {
    let size = start;
    for (; size > 10; size -= 2) {
      ctx.font = `900 ${size}px ${this.font}`;
      if (ctx.measureText(text).width <= width) break;
    }
    return size;
  }

  /**
   * Paint the words. A short distance goes on one line. A long one ("123 million km")
   * goes on two, the number above its unit, each shrunk as far as it needs to fit the board.
   */
  private paint(sign: Sign): void {
    const ctx = sign.ctx;
    ctx.clearRect(0, 0, PX_W, PX_H);
    ctx.fillStyle = sign.gold ? '#7a4a00' : '#17365c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const room = PX_W * 0.92;
    const space = sign.text.indexOf(' ');
    ctx.font = `900 64px ${this.font}`;
    if (space < 0 || ctx.measureText(sign.text).width <= room) {
      this.fit(ctx, sign.text, room, 64);
      ctx.fillText(sign.text, PX_W / 2, PX_H * 0.54);
    } else {
      const number = sign.text.slice(0, space);
      const unit = sign.text.slice(space + 1);
      this.fit(ctx, number, room, 54);
      ctx.fillText(number, PX_W / 2, PX_H * 0.33);
      this.fit(ctx, unit, room, 36);
      ctx.fillText(unit, PX_W / 2, PX_H * 0.77);
    }
    sign.texture.needsUpdate = true;
  }

  /** Show these signs (the nearest MAX_SIGNS of them, if there are more) and hide the rest. */
  update(list: PostSign[], camera: THREE.Camera): void {
    const n = Math.min(list.length, MAX_SIGNS);
    for (let i = 0; i < n; i++) {
      const item = list[i];
      const sign = this.signs[i] ?? this.make();
      if (sign.text !== item.text || sign.gold !== item.gold) {
        sign.text = item.text;
        sign.gold = item.gold;
        this.paint(sign);
      }
      // The board has two faces: the panel stands in front of whichever one faces the camera.
      let nx = Math.sin(item.rot);
      let nz = Math.cos(item.rot);
      let turn = item.rot;
      if (nx * (camera.position.x - item.x) + nz * (camera.position.z - item.z) < 0) {
        nx = -nx;
        nz = -nz;
        turn += Math.PI;
      }
      const mesh = sign.mesh;
      mesh.position.set(item.x + nx * item.depth, item.y, item.z + nz * item.depth);
      mesh.rotation.set(0, turn, 0);
      mesh.scale.set(item.w, item.h, 1);
      mesh.visible = true;
    }
    for (let i = n; i < this.signs.length; i++) this.signs[i].mesh.visible = false;
  }
}
