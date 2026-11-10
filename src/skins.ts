/**
 * Ball skins: colouring the ball's facets from a skin's pattern (config.ts SKINS), and
 * drawing the little round picture of each one for the shop.
 */
import * as THREE from 'three';
import type { SkinDef } from './config';
import { hash2 } from './util';

const TAU = Math.PI * 2;
/** The golden angle: stepping round by this spreads points evenly over a sphere. */
const GOLDEN = 2.39996323;
const _c = new THREE.Color();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _d = new THREE.Vector3();
const _n = new THREE.Vector3();
const _tilt = new THREE.Quaternion();

/**
 * The colour of one facet.
 * @param x,y,z the middle of the facet as a direction from the ball's centre (length 1)
 * @param f     the facet's number, for anything random
 */
export function facetColor(skin: SkinDef, x: number, y: number, z: number, f: number, out: THREE.Color): THREE.Color {
  const cols = skin.colors;
  const k = hash2(f * 1.31, 7.7);
  const count = skin.count ?? cols.length;
  switch (skin.pattern) {
    case 'wedges': {
      if (skin.cap !== undefined && Math.abs(y) > 0.9) return out.setHex(skin.cap);
      const round = Math.atan2(z, x) / TAU + 0.5;
      return out.setHex(cols[Math.min(count - 1, Math.floor(round * count)) % cols.length]);
    }
    case 'bands':
      return out.setHex(cols[Math.min(count - 1, Math.floor((y * 0.5 + 0.5) * count)) % cols.length]);
    case 'patches': {
      const reach = Math.cos(skin.spread ?? 0.35);
      for (let i = 0; i < count; i++) {
        const py = 1 - (2 * (i + 0.5)) / count;
        const pr = Math.sqrt(1 - py * py);
        if (x * Math.cos(i * GOLDEN) * pr + y * py + z * Math.sin(i * GOLDEN) * pr > reach) return out.setHex(cols[1]);
      }
      return out.setHex(cols[0]);
    }
    case 'planet': {
      if (Math.abs(y) > 0.84) return out.setHex(cols[4]);
      // A few overlapping waves make blobs that pass for continents.
      const land = Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 + 0.4) + Math.sin(z * 3.7 + 2.1) * 0.8 + Math.sin((x + z) * 5.3) * 0.35;
      return out.setHex(cols[(land > 0 ? 2 : 0) + (k < 0.4 ? 1 : 0)]);
    }
    case 'rainbow': {
      const hue = Math.atan2(z, x) / TAU + 0.5 + y * 0.35;
      return out.setHSL(hue - Math.floor(hue), 0.9, 0.56);
    }
    default: {
      // speckle: a random pick, in the proportions the skin asks for.
      let sum = 0;
      for (let i = 0; i < cols.length; i++) {
        sum += skin.weights?.[i] ?? 1 / cols.length;
        if (k < sum) return out.setHex(cols[i]);
      }
      return out.setHex(cols[cols.length - 1]);
    }
  }
}

/** Colour every facet of the ball's geometry (three corners per facet, not shared). */
export function paintSkin(geometry: THREE.BufferGeometry, skin: SkinDef): void {
  const pos = geometry.getAttribute('position');
  let color = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
  if (!color) {
    color = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
    geometry.setAttribute('color', color);
  }
  for (let f = 0; f < pos.count / 3; f++) {
    _a.fromBufferAttribute(pos, f * 3);
    _b.fromBufferAttribute(pos, f * 3 + 1);
    _d.fromBufferAttribute(pos, f * 3 + 2);
    _n.copy(_a).add(_b).add(_d).normalize();
    facetColor(skin, _n.x, _n.y, _n.z, f, _c);
    for (let j = 0; j < 3; j++) color.setXYZ(f * 3 + j, _c.r, _c.g, _c.b);
  }
  color.needsUpdate = true;
}

/**
 * A small picture of the ball wearing a skin, as an image URL: the same facets, seen from
 * the front with one end tipped towards the viewer and a little shading.
 */
export function skinSwatch(geometry: THREE.BufferGeometry, skin: SkinDef, px = 96): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const pos = geometry.getAttribute('position');
  const half = px / 2;
  const radius = half * 0.93;
  _tilt.setFromEuler(new THREE.Euler(0.75, 0.5, 0.2));
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  for (let f = 0; f < pos.count / 3; f++) {
    _a.fromBufferAttribute(pos, f * 3);
    _b.fromBufferAttribute(pos, f * 3 + 1);
    _d.fromBufferAttribute(pos, f * 3 + 2);
    _n.copy(_a).add(_b).add(_d).normalize();
    facetColor(skin, _n.x, _n.y, _n.z, f, _c);
    _n.applyQuaternion(_tilt);
    if (_n.z <= 0) continue; // facing away
    _a.applyQuaternion(_tilt);
    _b.applyQuaternion(_tilt);
    _d.applyQuaternion(_tilt);
    // Lit from the upper left, like the sun in the game.
    const light = 0.62 + 0.38 * Math.max(0, _n.x * -0.45 + _n.y * 0.65 + _n.z * 0.6);
    const hex = _c.getHex();
    const style = `rgb(${Math.round(((hex >> 16) & 255) * light)},${Math.round(((hex >> 8) & 255) * light)},${Math.round((hex & 255) * light)})`;
    ctx.fillStyle = style;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(half + _a.x * radius, half - _a.y * radius);
    ctx.lineTo(half + _b.x * radius, half - _b.y * radius);
    ctx.lineTo(half + _d.x * radius, half - _d.y * radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  return canvas.toDataURL();
}
