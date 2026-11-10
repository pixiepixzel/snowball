/**
 * Model gallery — a development page for looking at the objects on their own.
 * Open the game with `?gallery` (nine models per page: `&page=1`, `&page=2`, ...).
 * Add `&turn=90` to view them from another side; without it they slowly rotate.
 */
import * as THREE from 'three';
import { OBJECT_DEFS } from './objects';

export function runGallery(canvas: HTMLCanvasElement, frame: HTMLElement): void {
  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') ?? '0', 10) || 0;
  const fixedTurn = params.has('turn') ? (parseFloat(params.get('turn') ?? '0') * Math.PI) / 180 : null;
  const perPage = 9;
  const defs = OBJECT_DEFS.slice(page * perPage, page * perPage + perPage);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfe6ff);
  scene.add(new THREE.HemisphereLight(0xa9cdfa, 0xf6f8fc, 2.1));
  const sun = new THREE.DirectionalLight(0xfff3dc, 3.7);
  sun.position.set(-7, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -8;
  sc.right = sc.top = 8;
  sc.near = 1;
  sc.far = 40;
  sc.updateProjectionMatrix();
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: 0xf2f6fc }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const meshes: THREE.Mesh[] = [];
  const labels: string[] = [];
  defs.forEach((def, i) => {
    const mesh = new THREE.Mesh(def.build(), material);
    // Gates are 18 units wide: shrink them to fit a cell.
    mesh.scale.setScalar(def.special ? 0.17 : 1);
    mesh.position.set(((i % 3) - 1) * 3.3, 0, (Math.floor(i / 3) - 1) * 3.5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshes.push(mesh);
    const tris = mesh.geometry.getAttribute('position').count / 3;
    labels.push(`${def.id} (${tris})`);
  });

  const note = document.createElement('div');
  note.style.cssText =
    'position:absolute;left:8px;top:8px;right:8px;font:12px/1.5 ui-monospace,Consolas,monospace;color:#17365c;white-space:pre-wrap;pointer-events:none';
  note.textContent = `page ${page} — back row to front row, left to right (triangles):\n` + labels.join('  ·  ');
  frame.appendChild(note);
  document.querySelectorAll('#ui').forEach((el) => ((el as HTMLElement).style.display = 'none'));

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const resize = () => {
    const w = Math.max(1, frame.clientWidth);
    const h = Math.max(1, frame.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back further on narrow screens so all three columns fit.
    const dist = camera.aspect < 1 ? 19 / camera.aspect : 17;
    camera.position.set(0, dist * 0.62, dist * 0.82);
    camera.lookAt(0, 0.7, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(frame);
  resize();

  const tick = (now: number) => {
    requestAnimationFrame(tick);
    // Fronts face -Z, so start half a turn round to show them to the camera.
    const turn = fixedTurn ?? now * 0.0005;
    for (const m of meshes) m.rotation.y = Math.PI + turn;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(tick);
}
