/**
 * Lights, shadows, sky, fog and the distant scenery. Each scene has its own sky, fog and
 * sunlight (see ZONES in config.ts); they change quickly just after a wall is smashed,
 * so every scene reads as a new place — crisp summit, misty forest, golden village, city
 * at dusk.
 *
 * Lighting recipe: a warm low sun that casts real shadows, plus a sky-coloured fill
 * light. Shadows are therefore tinted by the sky, which is what makes snow look like
 * snow rather than white plastic.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CONFIG, ZONES } from './config';
import { groundY, locate, previousSceneLook, sceneLook, worldAt } from './zones';
import { worldForLap, type Scenery } from './worlds';
import { hash2, lerp, smoothstep } from './util';

type Backdrop = Scenery['backdrop'];

const _top = new THREE.Color();
const _hor = new THREE.Color();
const _sun = new THREE.Color();
const _lane = new THREE.Color();
const _a = new THREE.Color();
const _b = new THREE.Color();
const WHITE = new THREE.Color(0xffffff);

const HEMI_INTENSITY = 2.1;
const SUN_INTENSITY = 3.7;
/** Direction towards the sun: behind the camera, to the left, about 45° up. */
const SUN_DIR = new THREE.Vector3(-0.75, 1, 0.65).normalize();

export class Environment {
  private fog: THREE.Fog;
  private sky: THREE.Mesh;
  private backdrop: THREE.Group;
  private skyY: Float32Array;
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private peakMaterial: THREE.MeshBasicMaterial;
  private cloudMaterial: THREE.MeshBasicMaterial;
  private clouds: THREE.Mesh;
  private stars: THREE.Points;
  /** The far scenery, one mesh per kind; only the current world's is shown. */
  private backdrops = new Map<Backdrop, THREE.Mesh>();

  constructor(private scene: THREE.Scene) {
    this.hemi = new THREE.HemisphereLight(0xdcecff, 0xf4f8ff, HEMI_INTENSITY);
    scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(ZONES[0].sun, SUN_INTENSITY);
    this.sun.castShadow = CONFIG.SHADOWS;
    this.sun.shadow.mapSize.set(CONFIG.SHADOW_MAP_SIZE, CONFIG.SHADOW_MAP_SIZE);
    this.sun.shadow.bias = -0.0006;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.fog = new THREE.Fog(ZONES[0].horizon, 10, 40);
    scene.fog = this.fog;
    scene.background = new THREE.Color(ZONES[0].horizon);

    // Sky dome: recoloured per frame from two colours, no shader needed.
    const dome = new THREE.SphereGeometry(1, 20, 12);
    const pos = dome.getAttribute('position');
    this.skyY = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) this.skyY[i] = pos.getY(i);
    dome.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
    this.sky = new THREE.Mesh(
      dome,
      new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthTest: false, depthWrite: false }),
    );
    this.sky.renderOrder = -4;
    this.sky.frustumCulled = false;

    this.backdrop = new THREE.Group();
    this.backdrop.add(this.sky);

    // Clouds: flattened faceted puffs scattered over the forward half of the sky.
    const puffs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const angle = -1.25 + (2.5 * i) / 8 + (hash2(i, 11) - 0.5) * 0.2;
      const height = 0.2 + hash2(i, 12) * 0.34;
      const dist = 1.15;
      const cx = Math.sin(angle) * dist;
      const cz = -Math.cos(angle) * dist;
      const scale = 0.07 + hash2(i, 13) * 0.07;
      const lumps = 3 + Math.floor(hash2(i, 14) * 3);
      for (let k = 0; k < lumps; k++) {
        const g = new THREE.IcosahedronGeometry(1, 1);
        const s = scale * (0.55 + hash2(i * 7 + k, 15) * 0.55);
        g.scale(s * 1.6, s * 0.6, s);
        // Shade by facing before moving it: bright tops, soft blue-grey undersides.
        g.computeVertexNormals();
        shadeByHeight(g);
        // Spread the lumps sideways along the sky, facing the camera.
        const off = (k - (lumps - 1) / 2) * scale * 0.95;
        g.translate(cx + Math.cos(angle) * off, height + (hash2(i * 5 + k, 16) - 0.5) * scale * 0.4, cz + Math.sin(angle) * off);
        puffs.push(g);
      }
    }
    this.cloudMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, depthTest: false, depthWrite: false });
    const cloudGeometry = mergeAll(puffs) ?? new THREE.BufferGeometry();
    this.clouds = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
    this.clouds.renderOrder = -3;
    this.clouds.frustumCulled = false;
    this.backdrop.add(this.clouds);

    // Stars for the Space world: points scattered over the upper sky.
    const starCount = 260;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const a = hash2(i, 31) * Math.PI * 2;
      const up = 0.02 + hash2(i, 32) * 0.95;
      const ring = Math.sqrt(1 - up * up);
      starPos[i * 3] = Math.cos(a) * ring * 0.98;
      starPos[i * 3 + 1] = up * 0.98;
      starPos[i * 3 + 2] = Math.sin(a) * ring * 0.98;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, depthTest: false, depthWrite: false, toneMapped: false }),
    );
    this.stars.renderOrder = -3;
    this.stars.frustumCulled = false;
    this.stars.visible = false;
    this.backdrop.add(this.stars);

    // The far scenery. Each world picks one kind (worlds.ts `scenery.backdrop`): snowy
    // peaks, sand dunes, round hills, iced scoops, dark spires or toy blocks. Every kind
    // is two ranges, a pale distant one and a nearer, stronger one in front. Drawn back to
    // front with no depth test, so the order here is the draw order.
    this.peakMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, depthTest: false, depthWrite: false });
    const BLOCK_COLORS = [0xe8402a, 0x2f7de0, 0xffd23f, 0x3fb85a, 0xff8a2a, 0x9a5ad6];
    const SCOOP_COLORS = [0xffb0d4, 0xbff0d0, 0xfff0b0, 0xd8c0ff];
    const build = (kind: Backdrop, far: [number, number], near: [number, number]): void => {
      const parts: THREE.BufferGeometry[] = [];
      /** @param gap leave this much of the middle empty (radians), so the valley opens onto the range behind */
      const range = (count: number, seed: number, dist: number, base: number, tall: number, wide: number, body: number, cap: number, gap: number): void => {
        for (let i = 0; i < count; i++) {
          const angle = -1.4 + (2.8 * i) / (count - 1) + (hash2(i, seed + 1) - 0.5) * 0.14;
          if (Math.abs(angle) < gap) continue;
          const h = tall * (0.55 + hash2(i, seed + 2) * 0.6);
          const w = wide * (0.7 + hash2(i, seed + 3) * 0.6);
          const d = dist * (1 + hash2(i, seed + 4) * 0.2);
          const x = Math.sin(angle) * d;
          const z = -Math.cos(angle) * d;
          const turn = hash2(i, seed + 5) * 3;
          /**
           * Add one piece. It is painted `color`, or `cap` above the height `above`, and
           * may sit a little to one side (`dx`) of the spot this item stands on.
           */
          const add = (g: THREE.BufferGeometry, y: number, color: number, vary: number, cap2?: number, above = Infinity, dx = 0): void => {
            const part = g.index ? g.toNonIndexed() : g;
            part.rotateY(turn);
            // Sideways as seen from the camera, which sits at the middle of the ring.
            part.translate(x + Math.cos(angle) * dx, y, z + Math.sin(angle) * dx);
            paint(part, color, vary, cap2, above);
            parts.push(part);
          };
          if (kind === 'peaks') {
            // A craggy mountain, with its cap wherever it is high enough.
            add(crag(w, h, 7, 0.36, seed + i), base + h / 2, body, 0.07, cap, base + h * (0.56 + hash2(i, seed + 6) * 0.1));
          } else if (kind === 'dunes') {
            // Long low humps, half buried.
            const dune = new THREE.IcosahedronGeometry(1, 1);
            dune.scale(w * 1.9, h * 0.55, w);
            add(dune, base + h * 0.05, body, 0.04);
          } else if (kind === 'hills') {
            const hill = new THREE.IcosahedronGeometry(1, 1);
            hill.scale(w * 1.15, h * 0.8, w * 1.15);
            add(hill, base + h * 0.1, body, 0.05);
          } else if (kind === 'scoops') {
            // A scoop of ice cream with sauce on top and a cherry; every third one is a double.
            const r = w * 0.7;
            const flavour = SCOOP_COLORS[(i + seed) % SCOOP_COLORS.length];
            let top = base + r * 1.25;
            add(new THREE.IcosahedronGeometry(r, 1), base + r * 0.35, flavour, 0.03);
            if (i % 3 === 0) {
              add(new THREE.IcosahedronGeometry(r * 0.72, 1), top + r * 0.2, SCOOP_COLORS[(i + seed + 1) % SCOOP_COLORS.length], 0.03);
              top += r * 0.82;
            }
            const sauce = new THREE.IcosahedronGeometry(1, 1);
            sauce.scale(r * 0.62, r * 0.26, r * 0.62);
            add(sauce, top, cap, 0.02);
            add(new THREE.IcosahedronGeometry(r * 0.15, 1), top + r * 0.3, 0xe2473c, 0.03);
          } else if (kind === 'spires') {
            // Jagged crags: a tall one with a shorter one in front of it.
            add(crag(w * 0.4, h * 1.5, 5, 0.32, seed + i), base + h * 0.75, body, 0.08);
            add(crag(w * 0.26, h * 0.85, 5, 0.32, seed + i + 50), base + h * 0.42, cap, 0.08, undefined, Infinity, w * 0.32);
          } else if (kind === 'reef') {
            // Sea stacks: a cluster of rounded rock columns with weed growing on top.
            const stacks: [number, number, number][] = [
              [-0.5, 1.15, 0.5],
              [0.45, 0.8, 0.44],
              [0.02, 0.5, 0.36],
            ];
            for (const [side, tall2, thick] of stacks) {
              const rr = w * thick;
              const hh = h * tall2;
              add(new THREE.CylinderGeometry(rr * 0.8, rr, hh, 7, 1, true), base + hh / 2, body, 0.06, undefined, Infinity, side * w);
              const dome = new THREE.IcosahedronGeometry(1, 1);
              dome.scale(rr * 0.86, rr * 0.5, rr * 0.86);
              add(dome, base + hh, cap, 0.05, undefined, Infinity, side * w);
            }
          } else if (kind === 'blocks') {
            // A stack of two or three toy blocks; some stacks end in a pointed roof.
            const layers = 2 + (i % 2);
            let y = base;
            let s = w;
            for (let k = 0; k < layers; k++) {
              s = w * (0.9 - k * 0.2);
              const bh = (h / layers) * 0.9;
              add(new THREE.BoxGeometry(s, bh, s), y + bh / 2, BLOCK_COLORS[(i + k * 2 + seed) % BLOCK_COLORS.length], 0.02);
              y += bh;
            }
            if (i % 3 === 1) add(new THREE.ConeGeometry(s * 0.72, s * 0.8, 4, 1, true), y + s * 0.4, BLOCK_COLORS[(i + seed + 3) % BLOCK_COLORS.length], 0.02);
          }
        }
      };
      range(13, 40, 1.5, -0.42, 0.62, 0.34, far[0], far[1], 0);
      range(11, 0, 1.0, -0.34, 0.42, 0.26, near[0], near[1], 0.2);
      const merged = mergeAll(parts);
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, this.peakMaterial);
      mesh.renderOrder = -2;
      mesh.frustumCulled = false;
      mesh.visible = kind === 'peaks';
      this.backdrop.add(mesh);
      this.backdrops.set(kind, mesh);
    };
    build('peaks', [0xc3d3ea, 0xf6f9ff], [0x9db6d8, 0xf2f7ff]);
    build('dunes', [0xf6e4b8, 0], [0xe8cc92, 0]);
    build('hills', [0xb4dcae, 0], [0x86c486, 0]);
    build('scoops', [0xffd0e6, 0xffffff], [0xffb0d4, 0xfff4d8]);
    build('spires', [0x97a3bc, 0x7a86a2], [0x6c7896, 0x525e7c]);
    build('reef', [0x9ab8d2, 0xa8e0d0], [0x6f94b8, 0x74d0b8]);
    build('blocks', [0, 0], [0, 0]);
    scene.add(this.backdrop);
  }

  /** Turn the sun's cast shadows on or off (used by the automatic quality control). */
  setShadows(on: boolean): void {
    this.sun.castShadow = on;
  }

  /** @param x, d  where the ball is: shadows and light are centred a little ahead of it */
  update(camera: THREE.PerspectiveCamera, camR: number, x: number, d: number): void {
    // Blend from the previous scene's look over the first stretch of the new scene.
    const place = locate(d);
    const lap = place.lap;
    const zone = place.zone;
    const first = lap === 0 && zone === 0;
    const t = first ? 1 : smoothstep(0, 0.14, place.t);
    const cur = sceneLook(d);
    const prev = previousSceneLook(d);
    // Space has stars instead of clouds, and every world has its own far scenery.
    const world = worldAt(d);
    const starry = world.stars;
    this.stars.visible = starry;
    this.clouds.visible = !starry;
    this.backdrops.forEach((mesh, kind) => (mesh.visible = kind === world.scenery.backdrop));
    _top.copy(_a.setHex(prev.skyTop)).lerp(_b.setHex(cur.skyTop), t);
    _hor.copy(_a.setHex(prev.horizon)).lerp(_b.setHex(cur.horizon), t);
    _sun.copy(_a.setHex(prev.sun)).lerp(_b.setHex(cur.sun), t);
    _lane.copy(_a.setHex(prev.lane)).lerp(_b.setHex(cur.lane), t);
    const light = lerp(prev.light, cur.light, t);

    this.sun.color.copy(_sun);
    this.sun.intensity = SUN_INTENSITY * light;
    // Fill light: sky colour from above, light bounced off the ground from below.
    this.hemi.intensity = HEMI_INTENSITY * light;
    this.hemi.color.copy(_top).lerp(WHITE, 0.5);
    this.hemi.groundColor.copy(_lane).lerp(WHITE, 0.4);

    // The far scenery sits in the same air as the scene.
    this.peakMaterial.color.copy(_hor).lerp(WHITE, 0.4);
    this.cloudMaterial.color.copy(_hor).lerp(WHITE, 0.6);

    // Some worlds are murkier (under the sea), and a "Fog" twist pulls the fog in close.
    // Either way it rolls in over the start of the world.
    const reachOf = (n: number): number => worldForLap(n).twist.fog * worldForLap(n).scenery.fog;
    const fogNow = reachOf(lap);
    const fogBefore = zone === 0 && lap > 0 ? reachOf(lap - 1) : fogNow;
    const reach = lerp(fogBefore, fogNow, t);
    this.fog.color.copy(_hor);
    this.fog.near = CONFIG.FOG_NEAR_K * camR * reach * reach;
    this.fog.far = CONFIG.FOG_FAR_K * camR * reach;
    (this.scene.background as THREE.Color).copy(_hor);

    const colors = this.sky.geometry.getAttribute('color') as THREE.BufferAttribute;
    const arr = colors.array as Float32Array;
    for (let v = 0; v < this.skyY.length; v++) {
      const y = this.skyY[v];
      const k = y <= 0.02 ? 0 : Math.pow(Math.min(1, (y - 0.02) * 1.5), 0.65);
      arr[v * 3] = _hor.r + (_top.r - _hor.r) * k;
      arr[v * 3 + 1] = _hor.g + (_top.g - _hor.g) * k;
      arr[v * 3 + 2] = _hor.b + (_top.b - _hor.b) * k;
    }
    colors.needsUpdate = true;

    // Keep the backdrop centred on the camera and inside the far plane.
    this.backdrop.position.copy(camera.position);
    this.backdrop.scale.setScalar(camR * 400);

    // The sun follows the ball, and its shadow box scales with the camera so shadows
    // stay equally sharp on screen whether the ball is 50 cm or 100 m across.
    const range = CONFIG.SHADOW_RANGE_K * camR;
    const fd = d + range * 0.45;
    const target = this.sun.target;
    target.position.set(x * 0.7, groundY(fd), -fd);
    target.updateMatrixWorld();
    this.sun.position.copy(target.position).addScaledVector(SUN_DIR, range * 2.4);
    if (this.sun.castShadow) {
      const cam = this.sun.shadow.camera;
      cam.left = -range;
      cam.right = range;
      cam.top = range;
      cam.bottom = -range;
      cam.near = range * 0.2;
      cam.far = range * 5;
      cam.updateProjectionMatrix();
      this.sun.shadow.normalBias = 0.04 * camR;
    }
  }
}

function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  for (const g of parts) if (g.getAttribute('uv')) g.deleteAttribute('uv');
  return mergeGeometries(parts, false);
}

/** Colour a cloud puff from its normals: white on top, cool grey underneath. */
function shadeByHeight(g: THREE.BufferGeometry): void {
  const normal = g.getAttribute('normal');
  const colors = new Float32Array(normal.count * 3);
  for (let i = 0; i < normal.count; i++) {
    const up = normal.getY(i) * 0.5 + 0.5;
    colors[i * 3] = 0.8 + 0.2 * up;
    colors[i * 3 + 1] = 0.85 + 0.15 * up;
    colors[i * 3 + 2] = 0.93 + 0.07 * up;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/**
 * A craggy cone for mountains and spires: `sides` faces round, in three tiers, with every
 * corner pushed in or out and up or down by up to `rough` so no two look alike. Open
 * underneath (the foot is always out of sight).
 */
function crag(w: number, h: number, sides: number, rough: number, seed: number): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(w, h, sides, 3, true).toNonIndexed();
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const tier = Math.round(((y + h / 2) / h) * 3);
    if (tier >= 3) continue; // the tip stays put
    // Keyed on where the corner is, so the facets that share it move together.
    const kx = Math.round((x / w) * 500) + seed * 13;
    const kz = Math.round((z / w) * 500) + tier * 77;
    const push = 1 + (hash2(kx, kz) - 0.5) * rough;
    const lift = tier === 0 ? 0 : (hash2(kz + 9, kx + 4) - 0.5) * rough * h * 0.3;
    p.setXYZ(i, x * push, y + lift, z * push);
  }
  return g;
}

/** Where the light on the far scenery comes from: the same side as the sun, high and to the left. */
const FAR_LIGHT = new THREE.Vector3(-0.6, 0.75, 0.3).normalize();
const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();

/**
 * Colour every facet of a non-indexed geometry. Each gets `hex` (or `cap`, if its middle
 * is above the height `above`), varied by ±`vary`, and lit by which way it faces: the far
 * scenery has no real lighting, so the light is painted on here, once. Without it a block
 * is a flat cut-out and a hill is a blob.
 */
function paint(g: THREE.BufferGeometry, hex: number, vary: number, cap?: number, above = Infinity): void {
  const body = new THREE.Color(hex);
  const top = new THREE.Color(cap ?? hex);
  const pos = g.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  for (let f = 0; f < pos.count / 3; f++) {
    _p0.fromBufferAttribute(pos, f * 3);
    _p1.fromBufferAttribute(pos, f * 3 + 1);
    _p2.fromBufferAttribute(pos, f * 3 + 2);
    const mid = (_p0.y + _p1.y + _p2.y) / 3;
    _p1.sub(_p0);
    _p2.sub(_p0);
    const facing = Math.max(0, _p1.cross(_p2).normalize().dot(FAR_LIGHT));
    const rnd = hash2(f, hex % 97);
    const c = mid > above + (rnd - 0.5) * 0.03 ? top : body;
    const shade = (0.72 + 0.3 * facing) * (1 - vary + rnd * vary * 2);
    for (let k = 0; k < 3; k++) {
      const o = (f * 3 + k) * 3;
      colors[o] = Math.min(1, c.r * shade);
      colors[o + 1] = Math.min(1, c.g * shade);
      colors[o + 2] = Math.min(1, c.b * shade);
    }
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}
