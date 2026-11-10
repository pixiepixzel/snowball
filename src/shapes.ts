/**
 * Tiny low-poly modelling kit. Every helper returns a flat-shaded, vertex-coloured
 * BufferGeometry; `merge` glues parts into one mesh so each object type is a single
 * instanced draw call.
 *
 * Convention for builders: 1 unit = the object's `size`. Models stand on y = 0 and are
 * about 2 units tall (or 2 units long for vehicles). Front faces -Z (downhill).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface Xf {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
}

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _c = new THREE.Color();

function finish(src: THREE.BufferGeometry, color: number, t: Xf, lift: number): THREE.BufferGeometry {
  const g = src.index ? src.toNonIndexed() : src;
  if (g !== src) src.dispose();
  if (g.getAttribute('uv')) g.deleteAttribute('uv');
  _e.set(t.rx ?? 0, t.ry ?? 0, t.rz ?? 0);
  _q.setFromEuler(_e);
  _s.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
  _p.set(t.x ?? 0, (t.y ?? 0) + lift * _s.y, t.z ?? 0);
  g.applyMatrix4(_m.compose(_p, _q, _s));
  g.computeVertexNormals(); // non-indexed, so this gives flat facets
  const n = g.getAttribute('position').count;
  const colors = new Float32Array(n * 3);
  _c.setHex(color);
  for (let i = 0; i < n; i++) {
    colors[i * 3] = _c.r;
    colors[i * 3 + 1] = _c.g;
    colors[i * 3 + 2] = _c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Box. `y` is the height of its underside. */
export function box(w: number, h: number, d: number, color: number, t: Xf = {}): THREE.BufferGeometry {
  return finish(new THREE.BoxGeometry(w, h, d), color, t, h / 2);
}

/** Cylinder / truncated cone. `y` is the height of its base. */
export function cyl(rTop: number, rBottom: number, h: number, color: number, t: Xf = {}, seg = 6): THREE.BufferGeometry {
  return finish(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1), color, t, h / 2);
}

/** Cone (use seg = 4 for a pyramid). `y` is the height of its base. */
export function cone(r: number, h: number, color: number, t: Xf = {}, seg = 6): THREE.BufferGeometry {
  return finish(new THREE.ConeGeometry(r, h, seg, 1), color, t, h / 2);
}

/** Faceted lump. `y` is the height of its centre. */
export function blob(r: number, color: number, t: Xf = {}, detail = 0): THREE.BufferGeometry {
  return finish(new THREE.IcosahedronGeometry(r, detail), color, t, 0);
}

/** Gable roof: triangular prism with its ridge along X. `y` is the height of its base. */
export function prism(w: number, h: number, d: number, color: number, t: Xf = {}): THREE.BufferGeometry {
  const x = w / 2;
  const z = d / 2;
  const A = [-x, 0, z];
  const B = [x, 0, z];
  const C = [x, 0, -z];
  const D = [-x, 0, -z];
  const E = [-x, h, 0];
  const F = [x, h, 0];
  const tris = [A, B, F, A, F, E, C, D, E, C, E, F, D, A, E, B, C, F, A, D, C, A, C, B];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
  return finish(g, color, t, 0);
}

/**
 * Tapered box: a rectangle `wb × db` at the bottom narrowing (or widening) to `wt × dt`
 * at height `h`. The top can be shifted sideways by (ox, oz) for slanted shapes such as
 * windscreens. `y` is the height of its base; rotations pivot about the base.
 */
export function frustum(wb: number, db: number, wt: number, dt: number, h: number, color: number, t: Xf = {}, ox = 0, oz = 0): THREE.BufferGeometry {
  const b = [
    [-wb / 2, 0, db / 2],
    [wb / 2, 0, db / 2],
    [wb / 2, 0, -db / 2],
    [-wb / 2, 0, -db / 2],
  ];
  const u = [
    [ox - wt / 2, h, oz + dt / 2],
    [ox + wt / 2, h, oz + dt / 2],
    [ox + wt / 2, h, oz - dt / 2],
    [ox - wt / 2, h, oz - dt / 2],
  ];
  const tris: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    tris.push(b[i], b[j], u[j], b[i], u[j], u[i]);
  }
  tris.push(u[0], u[1], u[2], u[0], u[2], u[3], b[0], b[3], b[2], b[0], b[2], b[1]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
  return finish(g, color, t, 0);
}

/** Ring (scarves, life rings, tyres seen side-on). Lies flat; `y` is the height of its centre. */
export function torus(radius: number, tube: number, color: number, t: Xf = {}, seg = 10, tubeSeg = 5): THREE.BufferGeometry {
  const g = new THREE.TorusGeometry(radius, tube, tubeSeg, seg);
  g.rotateX(Math.PI / 2);
  return finish(g, color, t, 0);
}

/** Recolour a part with a vertical gradient from `bottom` (lowest point) to `top`. */
export function grade(g: THREE.BufferGeometry, bottom: number, top: number): THREE.BufferGeometry {
  const pos = g.getAttribute('position');
  const col = g.getAttribute('color');
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    lo = Math.min(lo, pos.getY(i));
    hi = Math.max(hi, pos.getY(i));
  }
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  for (let i = 0; i < pos.count; i++) {
    _c.copy(a).lerp(b, (pos.getY(i) - lo) / Math.max(1e-6, hi - lo));
    col.setXYZ(i, _c.r, _c.g, _c.b);
  }
  return g;
}

/** Vary the shade of each facet by ±`amount` — makes foliage, stone and fur look less plastic. */
export function speckle(g: THREE.BufferGeometry, amount: number, seed = 1): THREE.BufferGeometry {
  const col = g.getAttribute('color');
  for (let f = 0; f < col.count / 3; f++) {
    const s = Math.sin((f + 1) * 12.9898 * seed) * 43758.5453;
    const k = 1 - amount + (s - Math.floor(s)) * amount * 2;
    for (let j = 0; j < 3; j++) {
      const i = f * 3 + j;
      col.setXYZ(i, Math.min(1, col.getX(i) * k), Math.min(1, col.getY(i) * k), Math.min(1, col.getZ(i) * k));
    }
  }
  return g;
}

/** Move / rotate / scale an already built part or merged model (pivot is the origin). */
export function move(g: THREE.BufferGeometry, t: Xf): THREE.BufferGeometry {
  _e.set(t.rx ?? 0, t.ry ?? 0, t.rz ?? 0);
  _q.setFromEuler(_e);
  _s.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
  _p.set(t.x ?? 0, t.y ?? 0, t.z ?? 0);
  g.applyMatrix4(_m.compose(_p, _q, _s));
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- point-to-point parts
// Creatures and machines are much easier to build from "a limb from here to there" than
// from boxes with hand-worked rotations. These three take positions directly.

export type V3 = [number, number, number];
const _up = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();

/** Turn geometry built along +Y so it runs from a to b, then colour it. */
function between(g: THREE.BufferGeometry, a: V3, b: V3, color: number): THREE.BufferGeometry {
  _dir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  _q.setFromUnitVectors(_up, _dir);
  g.applyQuaternion(_q);
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  return finish(g, color, {}, 0);
}

const span = (a: V3, b: V3): number => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

/** Round limb from a (radius r0) to b (radius r1): necks, tails, trunks, tubes. */
export function taper(r0: number, r1: number, color: number, a: V3, b: V3, seg = 6): THREE.BufferGeometry {
  return between(new THREE.CylinderGeometry(r1, r0, span(a, b), seg, 1), a, b, color);
}

/** Square limb from a to b: legs, arms, struts, bones. */
export function beam(thick: number, color: number, a: V3, b: V3, depth = thick): THREE.BufferGeometry {
  return between(new THREE.BoxGeometry(thick, span(a, b), depth), a, b, color);
}

/** Cone with its base centred on `base`, pointing along `dir`: horns, spikes, flames. */
export function spike(r: number, h: number, color: number, base: V3, dir: V3, seg = 5): THREE.BufferGeometry {
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const tip: V3 = [base[0] + (dir[0] / n) * h, base[1] + (dir[1] / n) * h, base[2] + (dir[2] / n) * h];
  return between(new THREE.ConeGeometry(r, h, seg, 1), base, tip, color);
}

/** Horizontal rod along X / along Z, centred on (x, y, z). */
export const rodX = (r: number, len: number, color: number, x: number, y: number, z: number, seg = 6): THREE.BufferGeometry =>
  taper(r, r, color, [x - len / 2, y, z], [x + len / 2, y, z], seg);
export const rodZ = (r: number, len: number, color: number, x: number, y: number, z: number, seg = 6): THREE.BufferGeometry =>
  taper(r, r, color, [x, y, z - len / 2], [x, y, z + len / 2], seg);

/** Recolour a part in horizontal bands from bottom to top (planet stripes, layered rock). */
export function bands(g: THREE.BufferGeometry, colors: number[]): THREE.BufferGeometry {
  const pos = g.getAttribute('position');
  const col = g.getAttribute('color');
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    lo = Math.min(lo, pos.getY(i));
    hi = Math.max(hi, pos.getY(i));
  }
  for (let f = 0; f < pos.count / 3; f++) {
    const y = (pos.getY(f * 3) + pos.getY(f * 3 + 1) + pos.getY(f * 3 + 2)) / 3;
    const k = Math.min(colors.length - 1, Math.floor(((y - lo) / Math.max(1e-6, hi - lo)) * colors.length));
    _c.setHex(colors[k]);
    for (let j = 0; j < 3; j++) col.setXYZ(f * 3 + j, _c.r, _c.g, _c.b);
  }
  return g;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!g) throw new Error('shape merge failed');
  return g;
}
