/** Shared, deterministic scene data and projection: the canvas layer and the server-rendered dust use the same math. */

/**
 * Scroll timeline of the section (0…1): hero leaves, the flight passes the stack, the finale holds.
 * The live section is 405svh tall (mobile 320svh) — a third shorter than 610/480svh; every phase keeps its share.
 */
export const HERO_END = 0.095;
export const FLIGHT = [0.075, 0.9] as const;
export const FINALE = [0.9, 0.9375] as const;

export const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function smoothstep(start: number, end: number, value: number) {
  const fraction = clamp((value - start) / (end - start));
  return fraction * fraction * (3 - 2 * fraction);
}

const TAU = Math.PI * 2;
const HELIX_PITCH = 0.24;
const HELIX_RADIUS = 3.7;
/** Dust lives in a moving depth window in front of the camera and wraps around. */
const DUST_DEPTH = 90;
/** Vertical field of view 52°: focal length in units of the viewport height. */
export const FOCAL = 0.5 / Math.tan((26 * Math.PI) / 180);
const CAMERA_START_Z = 12;

function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SceneDust {
  count: number;
  depth: Float32Array;
  offset: Float32Array;
  radius: Float32Array;
  size: Float32Array;
  phase: Float32Array;
}

/** Fine dust along the two spiral arms. The arms are drawn by point density alone — no lines. */
export function sceneDust(count: number): SceneDust {
  const rand = random(20261018);
  const dust: SceneDust = {
    count,
    depth: new Float32Array(count),
    offset: new Float32Array(count),
    radius: new Float32Array(count),
    size: new Float32Array(count),
    phase: new Float32Array(count),
  };
  for (let index = 0; index < count; index++) {
    const tight = rand() < 0.9;
    const spread = rand() - 0.5;
    const jitter = rand();
    const big = rand() < 0.08;
    dust.depth[index] = rand() * DUST_DEPTH;
    dust.offset[index] = (index % 2) * Math.PI + spread * (tight ? 0.42 : 2.4);
    dust.radius[index] = tight ? HELIX_RADIUS + (jitter - 0.5) * 0.75 : 1.2 + jitter * 7;
    dust.size[index] = big ? 2 : 1 + rand() * 0.6;
    dust.phase[index] = rand() * TAU;
  }
  return dust;
}

export interface SceneCamera {
  x: number;
  y: number;
  z: number;
  roll: number;
  /** cos/sin of the roll, computed once per frame instead of once per point. */
  cosRoll: number;
  sinRoll: number;
  /** Focal length in px. */
  focal: number;
  /** Screen position of the spiral axis. */
  cx: number;
  cy: number;
  spin: number;
  travel: number;
}

interface CameraInput {
  width: number;
  height: number;
  mobile: boolean;
  progress: number;
  flight: number;
  travel: number;
  time: number;
}

interface ScreenPoint { x: number; y: number; depth: number }

/** Allocation-free projection helpers (called per point per frame). */
export const projectScene = {
  camera(camera: SceneCamera, { width, height, mobile, progress, flight, travel, time }: CameraInput) {
    const orbit = flight * TAU * 1.15;
    // The first frame leaves clear space for the title; the tunnel then opens to the whole viewport.
    const introduction = 1 - smoothstep(0.0125, 0.175, progress);
    camera.x = Math.sin(orbit) * 0.85;
    camera.y = Math.cos(orbit) * 0.45;
    camera.z = CAMERA_START_Z - travel;
    camera.roll = Math.sin(orbit) * 0.055;
    camera.cosRoll = Math.cos(camera.roll);
    camera.sinRoll = Math.sin(camera.roll);
    camera.focal = FOCAL * height;
    camera.cx = width * (0.5 + (mobile ? 0 : 0.24 * introduction));
    camera.cy = height * (0.5 + (mobile ? 0.24 : 0.015) * introduction);
    camera.spin = time * 0.035 + flight * 2.4;
    camera.travel = travel;
  },
  world(camera: SceneCamera, x: number, y: number, z: number, out: ScreenPoint) {
    const depth = camera.z - z;
    const dx = x - camera.x;
    const dy = y - camera.y;
    const cos = camera.cosRoll;
    const sin = camera.sinRoll;
    const scale = camera.focal / Math.max(depth, 0.1);
    out.x = camera.cx + (cos * dx + sin * dy) * scale;
    out.y = camera.cy - (-sin * dx + cos * dy) * scale;
    out.depth = depth;
    return depth > 0.1;
  },
  dust(camera: SceneCamera, dust: SceneDust, index: number, out: ScreenPoint) {
    const d = (((dust.depth[index] - camera.travel) % DUST_DEPTH) + DUST_DEPTH) % DUST_DEPTH;
    const z = camera.z - d;
    const angle = -z * HELIX_PITCH + dust.offset[index] + camera.spin;
    const radius = dust.radius[index];
    return projectScene.world(camera, Math.cos(angle) * radius, Math.sin(angle) * radius, z, out);
  },
  /** twinkleTime null — steady dust (phones: no shimmer, fewer Math.sin per frame). */
  dustAlpha(dust: SceneDust, index: number, depth: number, twinkleTime: number | null) {
    const far = 1 - depth / DUST_DEPTH;
    // Near-fade: points right at the camera dissolve instead of growing into grey squares.
    const near = smoothstep(2, 9, depth);
    const twinkle = twinkleTime === null ? 0.875 : 0.75 + 0.25 * Math.sin(twinkleTime + dust.phase[index]);
    return Math.sqrt(Math.max(far, 0)) * near * twinkle;
  },
  dustSize(dust: SceneDust, index: number, depth: number) {
    const near = smoothstep(2, 9, depth);
    return Math.max(1.3, Math.min(1.6 + 0.9 * near, (dust.size[index] * 24) / Math.max(depth, 0.1)));
  },
};

/** Half-size of the server-rendered dust frame, in focal units around the spiral axis. */
export const STATIC_DUST_EXTENT = 1.8;

/**
 * The opening frame (progress 0, time 0) as SVG dot paths, grouped by brightness. Coordinates are
 * thousandths of the focal length around the spiral axis, so CSS can place and size it for any viewport.
 */
export function staticDustPaths(count = 600): { opacity: number; d: string }[] {
  const dust = sceneDust(count);
  const camera: SceneCamera = { x: 0, y: 0, z: 0, roll: 0, cosRoll: 1, sinRoll: 0, focal: 1000, cx: 0, cy: 0, spin: 0, travel: 0 };
  projectScene.camera(camera, { width: 0, height: 1000 / FOCAL, mobile: true, progress: 0, flight: 0, travel: 0, time: 0 });
  camera.cx = 0;
  camera.cy = 0;
  const buckets = [0.25, 0.5, 0.75, 1].map((opacity) => ({ opacity, d: '' }));
  const point = { x: 0, y: 0, depth: 0 };
  const limit = STATIC_DUST_EXTENT * 1000;
  for (let index = 0; index < count; index++) {
    if (!projectScene.dust(camera, dust, index, point)) continue;
    if (Math.abs(point.x) > limit || Math.abs(point.y) > 760) continue;
    const alpha = projectScene.dustAlpha(dust, index, point.depth, 0);
    if (alpha < 0.12) continue;
    const bucket = buckets[Math.min(3, Math.floor(alpha * 4))];
    bucket.d += `M${Math.round(point.x)} ${Math.round(point.y)}h0`;
  }
  return buckets.filter((bucket) => bucket.d);
}
