// Lazy WebGL layer. The caller drives rendering; there is no autonomous animation loop.
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, FogExp2, Line,
  LineBasicMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, Vector3, WebGLRenderer,
} from 'three';
import { clamp, smoothstep, TECHNOLOGIES } from './scene-model';

export interface ProjectedTechnology {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface SceneGL {
  resize(): void;
  render(progress: number): readonly ProjectedTechnology[];
  dispose(): void;
}

const MAX_DPR = 1.5;
const TAU = Math.PI * 2;
const HELIX_PITCH = 0.24;

function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function lightTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,.8)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,.15)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return new CanvasTexture(canvas);
}

/** The labels and light trails share the same camera, world coordinates and scroll progress. */
export function createSceneGL(canvas: HTMLCanvasElement, onContextLost: () => void): SceneGL | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  const texture = lightTexture();
  if (!texture) {
    renderer.dispose();
    return null;
  }

  renderer.setClearColor(0x060810, 0);
  const scene = new Scene();
  scene.fog = new FogExp2(0x060810, 0.018);
  const camera = new PerspectiveCamera(52, 1, 0.1, 150);
  const disposable: { dispose(): void }[] = [texture];

  // Two restrained filaments make the spiral readable without filling the frame.
  const filaments = [
    { radius: 3.7, phase: 0, opacity: 0.25, color: 0x8aaeff },
    { radius: 4.1, phase: Math.PI, opacity: 0.09, color: 0xadc1ee },
  ].map(({ radius, phase, opacity, color }) => {
    const coordinates: Vector3[] = [];
    for (let index = 0; index <= 900; index++) {
      const z = 16 - index * 0.13;
      const angle = -z * HELIX_PITCH + phase;
      coordinates.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
    }
    const geometry = new BufferGeometry().setFromPoints(coordinates);
    const material = new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    const line = new Line(geometry, material);
    scene.add(line);
    disposable.push(geometry, material);
    return { line, opacity };
  });

  // Sparse soft points, with no crosses, beacons, blinking or dense particle clouds.
  const rand = random(20261018);
  const positions = new Float32Array(138 * 3);
  for (let index = 0; index < positions.length / 3; index++) {
    const angle = rand() * TAU;
    const radius = 3.5 + rand() * 10;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius;
    positions[index * 3 + 2] = 10 - rand() * 112;
  }
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new BufferAttribute(positions, 3));
  const pointMaterial = new PointsMaterial({
    map: texture, color: 0xb8cbf8, size: 0.095, sizeAttenuation: true,
    transparent: true, opacity: 0.62, depthWrite: false, blending: AdditiveBlending,
  });
  scene.add(new Points(pointGeometry, pointMaterial));
  disposable.push(pointGeometry, pointMaterial);

  const labels = TECHNOLOGIES.map((_, index) => {
    const z = -9 - index * 8;
    const angle = -z * HELIX_PITCH + 0.5;
    return new Vector3(Math.cos(angle) * 2.9, Math.sin(angle) * 2.9, z);
  });
  const projected: ProjectedTechnology[] = labels.map(() => ({ x: 0, y: 0, scale: 1, opacity: 0 }));
  const viewPosition = new Vector3();
  const screenPosition = new Vector3();
  let width = 1;
  let height = 1;
  let dead = false;

  const resize = () => {
    width = Math.max(canvas.clientWidth, 1);
    height = Math.max(canvas.clientHeight, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);

  return {
    resize,
    render(progress) {
      if (dead) return projected;
      const mobile = width < 768;
      const orbit = progress * TAU * 1.15;
      const introduction = 1 - smoothstep(0.02, 0.28, progress);
      const endFade = 1 - smoothstep(0.92, 1, progress);
      const cameraZ = 12 - progress * 62;
      camera.position.set(Math.sin(orbit) * 0.85, Math.cos(orbit) * 0.45, cameraZ);
      camera.lookAt(0, 0, cameraZ - 24);
      camera.rotation.z += Math.sin(orbit) * 0.055;
      // The first frame leaves clear space for the title; the tunnel then opens to the whole viewport.
      camera.setViewOffset(width, height, mobile ? 0 : -width * 0.24 * introduction, -height * (mobile ? 0.24 : 0.015) * introduction, width, height);
      camera.updateMatrixWorld();
      filaments.forEach(({ line, opacity }) => { line.material.opacity = opacity * (0.65 + 0.35 * endFade); });
      pointMaterial.opacity = 0.58 * (0.5 + 0.5 * endFade);

      const labelVisibility = smoothstep(0.15, 0.21, progress) * endFade;
      labels.forEach((position, index) => {
        viewPosition.copy(position).applyMatrix4(camera.matrixWorldInverse);
        const depth = -viewPosition.z;
        screenPosition.copy(position).project(camera);
        const opacity = labelVisibility
          * smoothstep(3, 7, depth)
          * (1 - smoothstep(22, 30, depth))
          * (1 - smoothstep(0.76, 1.15, Math.abs(screenPosition.x)))
          * (1 - smoothstep(0.73, 1.1, Math.abs(screenPosition.y)));
        const target = projected[index];
        target.x = (screenPosition.x * 0.5 + 0.5) * width;
        target.y = (-screenPosition.y * 0.5 + 0.5) * height;
        target.scale = Math.max(0.3, Math.min(2.8, (mobile ? 15 : 19) / Math.max(depth, 0.1)));
        target.opacity = depth > 0 ? clamp(opacity) : 0;
      });

      renderer.render(scene, camera);
      canvas.dataset.ready = 'true';
      return projected;
    },
    dispose() {
      if (dead) return;
      dead = true;
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      disposable.forEach((resource) => resource.dispose());
      renderer.dispose();
      delete canvas.dataset.ready;
    },
  };
}
