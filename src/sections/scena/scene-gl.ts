// WebGL-слой сцены (звёзды + спираль). Грузится динамическим import() после гидрации и idle,
// поэтому three.js не попадает в initial-чанк. Логика перенесена из макета «PL Сцена»
// (узлы-подписи убраны — их заменили HTML-карточки шагов).
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, FogExp2, Line,
  LineBasicMaterial, LineSegments, PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';

export interface SceneGL { dispose(): void }

const MAX_DPR = 1.5;

// Детерминированный ГПСЧ (mulberry32) — одинаковое небо при каждой загрузке.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.28, 'rgba(255,255,255,.75)');
  rg.addColorStop(0.6, 'rgba(255,255,255,.16)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.beginPath(); g.arc(32, 32, 32, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(32, 6); g.lineTo(32, 58); g.moveTo(6, 32); g.lineTo(58, 32); g.stroke();
  return new CanvasTexture(c);
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const tri = (p: number, a: number, b: number) => { const s = (b - a) * 0.26; return clamp(Math.min((p - a) / s, (b - p) / s)); };

/**
 * @param canvas    холст внутри sticky-сцены
 * @param host      секция сцены — вне вьюпорта рендер ставится на паузу
 * @param progress  текущий прогресс прокрутки сцены 0…1
 * @returns null, если WebGL недоступен (остаётся статичный CSS-фон)
 */
export function createSceneGL(canvas: HTMLCanvasElement, host: HTMLElement, progress: () => number): SceneGL | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  renderer.setClearColor(0x060810, 1);
  const rand = rng(20261018);
  const scene = new Scene();
  scene.fog = new FogExp2(0x060810, 0.04);
  const camera = new PerspectiveCamera(54, 1, 0.1, 150);
  const tex = starTexture();
  const disposables: { dispose(): void }[] = [tex];
  const add = <T extends Points | Line | LineSegments>(o: T) => {
    scene.add(o);
    disposables.push(o.geometry, o.material as { dispose(): void });
    return o;
  };
  const points = (pos: Float32Array, color: number, size: number, opacity: number) => {
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pos, 3));
    return add(new Points(g, new PointsMaterial({ map: tex, color, size, transparent: true, opacity, depthWrite: false, blending: AdditiveBlending })));
  };

  // пыль
  const nP = 380, pos = new Float32Array(nP * 3);
  for (let i = 0; i < nP; i++) { pos[i * 3] = (rand() - 0.5) * 32; pos[i * 3 + 1] = (rand() - 0.5) * 16 + 0.4; pos[i * 3 + 2] = 8 - rand() * 84; }
  const dust = points(pos, 0xe8edff, 0.26, 0.62);

  // спирали
  const helix = (rad: number, turn: number, phase: number, yScale: number) => {
    const pts: Vector3[] = [];
    for (let s = 0; s <= 320; s++) { const z = 9 - s * 0.28, a = s * turn + phase; pts.push(new Vector3(Math.cos(a) * rad, Math.sin(a) * rad * yScale - 0.3, z)); }
    return new BufferGeometry().setFromPoints(new CatmullRomCurve3(pts).getPoints(700));
  };
  const spirals = ([[2.5, 0.075, 0, 0.62, 0.32, 0x7aa2ff], [2.5, 0.075, Math.PI, 0.62, 0.18, 0xffffff], [5.4, 0.052, 1.1, 0.5, 0.1, 0x7aa2ff], [8.6, 0.036, 2.4, 0.42, 0.06, 0xb7bfd1]] as const)
    .map((h) => add(new Line(helix(h[0], h[1], h[2], h[3]), new LineBasicMaterial({ color: h[5], transparent: true, opacity: h[4], depthWrite: false }))));

  // звёзды вдоль спирали
  const nS = 190, sp = new Float32Array(nS * 3);
  for (let i = 0; i < nS; i++) {
    const s = rand() * 320, a = s * 0.075 + (rand() < 0.5 ? 0 : Math.PI), r = 2.5 + (rand() - 0.5) * 0.7;
    sp[i * 3] = Math.cos(a) * r; sp[i * 3 + 1] = Math.sin(a) * r * 0.62 - 0.3; sp[i * 3 + 2] = 9 - s * 0.28;
  }
  const spiralDots = points(sp, 0x7aa2ff, 0.34, 0.6);

  // дальнее скопление
  const nM = 170, mp = new Float32Array(nM * 3);
  for (let i = 0; i < nM; i++) { const a = rand() * Math.PI * 2, r = Math.pow(rand(), 0.6) * 11; mp[i * 3] = Math.cos(a) * r * 1.3; mp[i * 3 + 1] = Math.sin(a) * r * 0.5 - 1.5; mp[i * 3 + 2] = -52 - rand() * 16; }
  const mass = points(mp, 0x3b5fb0, 1.5, 0.2);

  // маяки
  const beacons = points(new Float32Array([-4.2, 1.0, -8.5, 4.4, 1.6, -14, -2.0, -1.8, -20]), 0xffffff, 1.1, 0.9);

  // ветви
  const branchMat = new LineBasicMaterial({ color: 0x7aa2ff, transparent: true, opacity: 0, depthWrite: false });
  for (const d of [[-1, 0.9], [1, 1.5], [0.2, -1.4]]) {
    const pts: Vector3[] = [];
    for (let s = 0; s <= 40; s++) pts.push(new Vector3(d[0] * s * 0.16 + Math.sin(s * 0.12) * 0.5, 0.2 + d[1] * s * 0.055, -6 - s * 0.62));
    add(new Line(new BufferGeometry().setFromPoints(new CatmullRomCurve3(pts).getPoints(120)), branchMat));
  }

  // топо-сетка
  const gp: Vector3[] = [], N = 22, step = 2.6, y = (i: number, j: number) => -3.6 + Math.sin(i * 0.6 + j * 0.4) * 0.5;
  for (let i = 0; i <= N; i++) for (let j = 0; j < N; j++) {
    const x1 = -N * step / 2 + i * step, z1 = -18 - j * step;
    gp.push(new Vector3(x1, y(i, j), z1), new Vector3(x1, y(i, j + 1), z1 - step));
    gp.push(new Vector3(x1, y(i, j), z1), new Vector3(x1 + step, y(i + 1, j), z1));
  }
  const topoMat = new LineBasicMaterial({ color: 0x5b84e0, transparent: true, opacity: 0, depthWrite: false });
  add(new LineSegments(new BufferGeometry().setFromPoints(gp), topoMat));

  // состояние
  let p = progress(), mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0, visible = true, dead = false, firstFrame = true;

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  resize();

  const frame = (t: number) => {
    p += (progress() - p) * 0.055;
    mx += (tmx - mx) * 0.03; my += (tmy - my) * 0.03;
    const a = p * Math.PI * 2 * 2.6, R = 2.15;
    camera.position.set(Math.sin(a) * R + mx * 0.4, 0.9 + Math.cos(a) * R * 0.45 + my * 0.12, 7 - p * 48);
    const a2 = a + 0.6;
    camera.lookAt(Math.sin(a2) * R * 0.5, 0.5 + Math.cos(a2) * R * 0.22 - 0.4, camera.position.z - 10);
    camera.rotation.z += Math.sin(a) * 0.07;
    branchMat.opacity = 0.45 * tri(p, 0.1, 0.46);
    topoMat.opacity = 0.16 * tri(p, 0.44, 0.9);
    mass.material.opacity = 0.22 + 0.14 * Math.sin(t * 0.0004);
    dust.material.opacity = 0.5 + 0.14 * Math.sin(t * 0.0009);
    beacons.material.opacity = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.0011));
    spiralDots.material.opacity = 0.6 - 0.22 * clamp((p - 0.75) / 0.25);
    spirals.forEach((l, i) => { l.rotation.z = t * 0.00022 * (i % 2 ? -1 : 1) * (1 + i * 0.35); l.position.z = (t * 0.0022 * (1 + i * 0.2)) % 9; });
    spiralDots.rotation.z = t * 0.00016; spiralDots.position.z = (t * 0.0026) % 9;
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; canvas.dataset.ready = 'true'; }
  };

  const loop = (t: number) => {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    frame(t);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && !dead && visible && !document.hidden) raf = requestAnimationFrame(loop); };

  const onMove = (e: PointerEvent) => { tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2; };
  let resizeTimer = 0;
  const onResize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 150); };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; kick(); });
  io.observe(host);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', kick);
  kick();

  return {
    dispose() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', kick);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
