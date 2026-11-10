import * as THREE from 'three';

const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const WHITE = new THREE.Color(0xffffff);

/**
 * A fixed-capacity pool of instances drawn in one call. Slots are recycled and handles
 * stay stable. The draw count shrinks again when the highest slots are freed, so object
 * types left behind in earlier zones stop costing anything.
 */
export class InstancePool {
  readonly mesh: THREE.InstancedMesh;
  private free: number[] = [];
  private used: Uint8Array;
  private high = 0;
  private live = 0;
  private matrixDirty = false;
  private colorDirty = false;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, readonly capacity: number) {
    this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.used = new Uint8Array(capacity);
    for (let i = 0; i < capacity; i++) {
      this.mesh.setMatrixAt(i, ZERO);
      this.mesh.setColorAt(i, WHITE);
    }
  }

  /** Returns a slot index, or -1 when the pool is full. */
  alloc(): number {
    while (this.free.length > 0) {
      const slot = this.free.pop() as number;
      // Entries can go stale when the draw count shrank past them; skip those.
      if (slot < this.high && this.used[slot] === 0) {
        this.used[slot] = 1;
        this.live++;
        return slot;
      }
    }
    if (this.high < this.capacity) {
      const slot = this.high;
      this.used[slot] = 1;
      this.live++;
      this.mesh.count = ++this.high;
      return slot;
    }
    return -1;
  }

  release(slot: number): void {
    if (this.used[slot] === 0) return;
    this.used[slot] = 0;
    this.live--;
    this.mesh.setMatrixAt(slot, ZERO);
    this.matrixDirty = true;
    if (slot === this.high - 1) {
      while (this.high > 0 && this.used[this.high - 1] === 0) this.high--;
      this.mesh.count = this.high;
    } else {
      this.free.push(slot);
    }
  }

  setMatrix(slot: number, m: THREE.Matrix4): void {
    this.mesh.setMatrixAt(slot, m);
    this.matrixDirty = true;
  }

  /** Shrink one instance in place: move it by (0, offY, offZ), then scale everything by k. */
  shrink(slot: number, k: number, offY: number, offZ: number): void {
    const m = this.mesh.instanceMatrix.array as Float32Array;
    const o = slot * 16;
    for (let i = 0; i < 12; i++) m[o + i] *= k;
    m[o + 12] *= k;
    m[o + 13] = (m[o + 13] + offY) * k;
    m[o + 14] = (m[o + 14] + offZ) * k;
    this.matrixDirty = true;
  }

  setColor(slot: number, c: THREE.Color): void {
    this.mesh.setColorAt(slot, c);
    this.colorDirty = true;
  }

  /** Upload changes to the GPU. Call once per frame. */
  commit(): void {
    if (this.matrixDirty) {
      this.mesh.instanceMatrix.needsUpdate = true;
      this.matrixDirty = false;
    }
    if (this.colorDirty && this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
      this.colorDirty = false;
    }
  }

  reset(): void {
    for (let i = 0; i < this.high; i++) this.mesh.setMatrixAt(i, ZERO);
    this.used.fill(0);
    this.free.length = 0;
    this.high = 0;
    this.live = 0;
    this.mesh.count = 0;
    this.matrixDirty = true;
  }

  get active(): number {
    return this.live;
  }
}
