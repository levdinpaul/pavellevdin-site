// Lazy WebGL layer. The caller owns the frame loop and only runs it while the section is visible.
import {
  BufferAttribute, BufferGeometry, FogExp2, Line, LineBasicMaterial, PerspectiveCamera, Points,
  Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three';
import { clamp, FLIGHT, smoothstep } from './scene-model';

export interface ProjectedTechnology {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface SceneGL {
  resize(): void;
  /** progress — 0…1 scroll through the section, time — seconds (drives the quiet idle spin and twinkle). */
  render(progress: number, time: number): readonly ProjectedTechnology[];
  dispose(): void;
}

const MAX_DPR = 1.5;
const TAU = Math.PI * 2;
const HELIX_PITCH = 0.24;
const HELIX_RADIUS = 3.7;
const GOLDEN_ANGLE = 2.39996;
/** Depth spacing between technologies: with the visible depth window this keeps 3–4 names on screen. */
const LABEL_SPACING = 4.5;
const LABEL_START = -4;
/** Dust lives in a moving depth window in front of the camera and wraps around. */
const DUST_DEPTH = 90;

function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Fine dust along the two spiral arms: 1–2.5 px points, no sprites, halos or bloom.
const DUST_VERTEX = /* glsl */ `
  attribute float aOffset;
  attribute float aRadius;
  attribute float aSize;
  attribute float aPhase;
  uniform float uTravel;
  uniform float uCamZ;
  uniform float uSpin;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    float d = mod(position.z - uTravel, ${DUST_DEPTH.toFixed(1)});
    float z = uCamZ - d;
    float angle = -z * ${HELIX_PITCH.toFixed(3)} + aOffset + uSpin;
    vec4 mv = modelViewMatrix * vec4(cos(angle) * aRadius, sin(angle) * aRadius, z, 1.0);
    gl_Position = projectionMatrix * mv;
    float far = 1.0 - d / ${DUST_DEPTH.toFixed(1)};
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.6 + aPhase);
    vAlpha = sqrt(far) * smoothstep(0.5, 4.0, d) * twinkle;
    gl_PointSize = clamp(aSize * 24.0 / max(d, 0.1), 1.3, 2.5) * uPixelRatio;
  }
`;
const DUST_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    gl_FragColor = vec4(0.839, 0.878, 1.0, vAlpha * uOpacity);
  }
`;

/** The labels, filaments and dust share the same camera, world coordinates and scroll progress. */
export function createSceneGL(canvas: HTMLCanvasElement, labelCount: number, onContextLost: () => void): SceneGL | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  renderer.setClearColor(0x060810, 0);
  const scene = new Scene();
  scene.fog = new FogExp2(0x060810, 0.018);
  const camera = new PerspectiveCamera(52, 1, 0.1, 150);
  const disposable: { dispose(): void }[] = [];

  const travelLength = 5 + Math.max(0, labelCount - 1) * LABEL_SPACING;
  const tailZ = 12 - travelLength - 40;

  // Two quiet filaments; the dust carries the form.
  const filaments = [
    { phase: 0, opacity: 0.13, color: 0x8aaeff },
    { phase: Math.PI, opacity: 0.05, color: 0xadc1ee },
  ].map(({ phase, opacity, color }) => {
    const coordinates: Vector3[] = [];
    for (let z = 16; z >= tailZ; z -= 0.13) {
      const angle = -z * HELIX_PITCH + phase;
      coordinates.push(new Vector3(Math.cos(angle) * HELIX_RADIUS, Math.sin(angle) * HELIX_RADIUS, z));
    }
    const geometry = new BufferGeometry().setFromPoints(coordinates);
    const material = new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    const line = new Line(geometry, material);
    scene.add(line);
    disposable.push(geometry, material);
    return { line, opacity };
  });

  const rand = random(20261018);
  const dustCount = canvas.clientWidth < 768 ? 700 : 1600;
  const base = new Float32Array(dustCount * 3);
  const offsets = new Float32Array(dustCount);
  const radii = new Float32Array(dustCount);
  const sizes = new Float32Array(dustCount);
  const phases = new Float32Array(dustCount);
  for (let index = 0; index < dustCount; index++) {
    const tight = rand() < 0.85;
    base[index * 3 + 2] = rand() * DUST_DEPTH;
    offsets[index] = (index % 2) * Math.PI + (rand() - 0.5) * (tight ? 0.5 : 2.4);
    radii[index] = tight ? HELIX_RADIUS + (rand() - 0.5) * 0.9 : 1.2 + rand() * 7;
    sizes[index] = rand() < 0.08 ? 2 : 1 + rand() * 0.6;
    phases[index] = rand() * TAU;
  }
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new BufferAttribute(base, 3));
  dustGeometry.setAttribute('aOffset', new BufferAttribute(offsets, 1));
  dustGeometry.setAttribute('aRadius', new BufferAttribute(radii, 1));
  dustGeometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  dustGeometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
  const dustMaterial = new ShaderMaterial({
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTravel: { value: 0 }, uCamZ: { value: 12 }, uSpin: { value: 0 }, uTime: { value: 0 },
      uPixelRatio: { value: 1 }, uOpacity: { value: 1 },
    },
  });
  const dust = new Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  scene.add(dust);
  disposable.push(dustGeometry, dustMaterial);

  // Technologies: one per depth step, spread evenly around the axis by the golden angle.
  const labels = Array.from({ length: labelCount }, (_, index) => ({
    z: LABEL_START - index * LABEL_SPACING,
    angle: index * GOLDEN_ANGLE + 0.5,
    radius: 2.2 + ((index * 37) % 10) / 10 * 0.9,
  }));
  const projected: ProjectedTechnology[] = labels.map(() => ({ x: 0, y: 0, scale: 1, opacity: 0 }));
  const world = new Vector3();
  const viewPosition = new Vector3();
  const screenPosition = new Vector3();
  let width = 1;
  let height = 1;
  let dead = false;

  const resize = () => {
    width = Math.max(canvas.clientWidth, 1);
    height = Math.max(canvas.clientHeight, 1);
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    dustMaterial.uniforms.uPixelRatio.value = ratio;
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
    render(progress, time) {
      if (dead) return projected;
      const mobile = width < 768;
      const flight = smoothstep(FLIGHT[0], FLIGHT[1], progress);
      const orbit = flight * TAU * 1.15;
      const introduction = 1 - smoothstep(0.02, 0.28, progress);
      const travel = flight * travelLength;
      const cameraZ = 12 - travel;
      const spin = time * 0.035 + flight * 2.4;
      camera.position.set(Math.sin(orbit) * 0.85, Math.cos(orbit) * 0.45, cameraZ);
      camera.lookAt(0, 0, cameraZ - 24);
      camera.rotation.z += Math.sin(orbit) * 0.055;
      // The first frame leaves clear space for the title; the tunnel then opens to the whole viewport.
      camera.setViewOffset(width, height, mobile ? 0 : -width * 0.24 * introduction, -height * (mobile ? 0.24 : 0.015) * introduction, width, height);
      camera.updateMatrixWorld();
      filaments.forEach(({ line, opacity }) => { line.rotation.z = spin; line.material.opacity = opacity; });
      const uniforms = dustMaterial.uniforms;
      uniforms.uTravel.value = travel;
      uniforms.uCamZ.value = cameraZ;
      uniforms.uSpin.value = spin;
      uniforms.uTime.value = time;

      const labelVisibility = smoothstep(FLIGHT[0] + 0.03, FLIGHT[0] + 0.08, progress) * (1 - smoothstep(FLIGHT[1] - 0.02, FLIGHT[1] + 0.02, progress));
      labels.forEach((label, index) => {
        const angle = label.angle + spin * 0.6;
        world.set(Math.cos(angle) * label.radius, Math.sin(angle) * label.radius, label.z);
        viewPosition.copy(world).applyMatrix4(camera.matrixWorldInverse);
        const depth = -viewPosition.z;
        screenPosition.copy(world).project(camera);
        const opacity = labelVisibility
          * smoothstep(3.5, 7, depth)
          * (1 - smoothstep(14, 20, depth))
          * (1 - smoothstep(0.8, 1.1, Math.abs(screenPosition.x)))
          * (1 - smoothstep(0.78, 1.05, Math.abs(screenPosition.y)));
        const target = projected[index];
        target.x = (screenPosition.x * 0.5 + 0.5) * width;
        target.y = (-screenPosition.y * 0.5 + 0.5) * height;
        target.scale = Math.max(0.3, Math.min(2.8, (mobile ? 13 : 19) / Math.max(depth, 0.1)));
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
