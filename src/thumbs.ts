/**
 * Small pictures of the game's objects, for the collection book. Each one is the real
 * model, drawn once with the game's own renderer into an off-screen image, read back and
 * kept as an image URL. They are only made when a page of the book is opened.
 */
import * as THREE from 'three';
import type { ObjectDef } from './objects';

/** Drawn at this many pixels square, then halved for smooth edges. */
const DRAW = 224;
const OUT = DRAW / 2;

const _p = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _centre = new THREE.Vector3();
const _clear = new THREE.Color();
const _box = new THREE.Box3();
/** Where the camera sits relative to the model: in front (models face -Z), a little to one side and above. */
const VIEW = new THREE.Vector3(-0.62, 0.5, -1).normalize();

export class Thumbs {
  private target = new THREE.WebGLRenderTarget(DRAW, DRAW);
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private pixels = new Uint8Array(DRAW * DRAW * 4);
  private big = document.createElement('canvas');
  private small = document.createElement('canvas');
  private cache = new Map<string, string>();

  constructor(private renderer: THREE.WebGLRenderer) {
    // A plain shader of its own: the model's colours, lit from the upper left, written
    // out ready to show. (The game's materials leave that last step to the screen.)
    this.material = new THREE.ShaderMaterial({
      vertexColors: true,
      uniforms: { tint: { value: new THREE.Color(0xffffff) } },
      vertexShader: `
        varying vec3 vColor;
        varying vec3 vNormal;
        void main() {
          vColor = color;
          vNormal = normalMatrix * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 tint;
        varying vec3 vColor;
        varying vec3 vNormal;
        void main() {
          float lit = max(dot(normalize(vNormal), normalize(vec3(-0.45, 0.75, 0.5))), 0.0);
          vec3 c = vColor * tint * (0.5 + 0.62 * lit);
          gl_FragColor = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.big.width = this.big.height = DRAW;
    this.small.width = this.small.height = OUT;
  }

  /** The picture of one object, as an image URL (empty if it could not be drawn). */
  get(def: ObjectDef): string {
    const have = this.cache.get(def.id);
    if (have !== undefined) return have;
    let url = '';
    try {
      url = this.draw(def);
    } catch {
      // No picture is better than a broken book.
    }
    this.cache.set(def.id, url);
    return url;
  }

  private draw(def: ObjectDef): string {
    const geometry = def.build();
    const pos = geometry.getAttribute('position');
    geometry.computeBoundingBox();
    _box.copy(geometry.boundingBox as THREE.Box3).getCenter(_centre);

    // Aim the camera, then fit its frame to exactly what the model covers from there.
    const cam = this.camera;
    cam.position.copy(_centre).addScaledVector(VIEW, 40);
    cam.lookAt(_centre);
    cam.updateMatrixWorld();
    _right.setFromMatrixColumn(cam.matrixWorld, 0);
    _up.setFromMatrixColumn(cam.matrixWorld, 1);
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      _p.fromBufferAttribute(pos, i).sub(_centre);
      const x = _p.dot(_right);
      const y = _p.dot(_up);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    const half = (Math.max(x1 - x0, y1 - y0) / 2) * 1.06 || 1;
    cam.position.addScaledVector(_right, (x0 + x1) / 2).addScaledVector(_up, (y0 + y1) / 2);
    cam.left = cam.bottom = -half;
    cam.right = cam.top = half;
    cam.far = 100;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    this.mesh.geometry = geometry;
    (this.material.uniforms.tint.value as THREE.Color).setHex(def.tints ? def.tints[0] : 0xffffff);

    // Draw onto a see-through background, then put the renderer back as it was.
    const r = this.renderer;
    const alpha = r.getClearAlpha();
    r.getClearColor(_clear);
    r.setClearColor(0x000000, 0);
    r.setRenderTarget(this.target);
    r.clear();
    r.render(this.scene, cam);
    r.readRenderTargetPixels(this.target, 0, 0, DRAW, DRAW, this.pixels);
    r.setRenderTarget(null);
    r.setClearColor(_clear, alpha);
    geometry.dispose();

    const big = this.big.getContext('2d');
    const small = this.small.getContext('2d');
    if (!big || !small) return '';
    // What comes back is upside down: copy it a row at a time, bottom row first.
    const image = big.createImageData(DRAW, DRAW);
    const row = DRAW * 4;
    for (let y = 0; y < DRAW; y++) image.data.set(this.pixels.subarray((DRAW - 1 - y) * row, (DRAW - y) * row), y * row);
    big.putImageData(image, 0, 0);
    small.clearRect(0, 0, OUT, OUT);
    small.imageSmoothingQuality = 'high';
    small.drawImage(this.big, 0, 0, OUT, OUT);
    return this.small.toDataURL();
  }
}
