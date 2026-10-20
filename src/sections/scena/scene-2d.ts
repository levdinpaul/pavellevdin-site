// Canvas 2D layer: dust along two spiral arms and the projected technology positions share one camera.
// No dependencies; the caller owns the frame loop and only runs it while the section is visible.
import { clamp, FLIGHT, projectScene, smoothstep, sceneDust, type SceneCamera } from './scene-model';

export interface ProjectedTechnology {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface Scene2D {
  /** Reads the canvas size; call before the first render. */
  resize(): void;
  /** progress — 0…1 scroll through the section, time — seconds (drives the quiet idle spin and twinkle). */
  render(progress: number, time: number): readonly ProjectedTechnology[];
}

const MAX_DPR = 1.5;
const GOLDEN_ANGLE = 2.39996;
/** Depth spacing between technologies: with the visible depth window this keeps 3–4 names on screen. */
const LABEL_SPACING = 4.5;
const LABEL_START = -4;

export function createScene2D(canvas: HTMLCanvasElement, labelCount: number): Scene2D | null {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;

  const mobileDust = window.innerWidth < 768;
  const dust = sceneDust(mobileDust ? 850 : 2000);
  const travelLength = 5 + Math.max(0, labelCount - 1) * LABEL_SPACING;

  // Technologies: one per depth step, spread evenly around the axis by the golden angle.
  const labels = Array.from({ length: labelCount }, (_, index) => ({
    z: LABEL_START - index * LABEL_SPACING,
    angle: index * GOLDEN_ANGLE + 0.5,
    radius: 2.2 + ((index * 37) % 10) / 10 * 0.9,
  }));
  const projected: ProjectedTechnology[] = labels.map(() => ({ x: 0, y: 0, scale: 1, opacity: 0 }));
  const camera: SceneCamera = { x: 0, y: 0, z: 12, roll: 0, focal: 1, cx: 0, cy: 0, spin: 0, travel: 0 };
  const point = { x: 0, y: 0, depth: 0 };
  let width = 1;
  let height = 1;
  let ratio = 1;

  const resize = () => {
    width = Math.max(canvas.clientWidth, 1);
    height = Math.max(canvas.clientHeight, 1);
    ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  };

  return {
    resize,
    render(progress, time) {
      const mobile = width < 768;
      const flight = smoothstep(FLIGHT[0], FLIGHT[1], progress);
      const travel = flight * travelLength;
      projectScene.camera(camera, { width, height, mobile, progress, flight, travel, time });

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#d6e0ff';
      const twinkleTime = time * 1.6;
      for (let index = 0; index < dust.count; index++) {
        if (!projectScene.dust(camera, dust, index, point)) continue;
        if (point.x < -4 || point.x > width + 4 || point.y < -4 || point.y > height + 4) continue;
        const alpha = projectScene.dustAlpha(dust, index, point.depth, twinkleTime);
        if (alpha < 0.02) continue;
        const size = projectScene.dustSize(dust, index, point.depth);
        context.globalAlpha = alpha;
        context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      }
      context.globalAlpha = 1;

      const labelVisibility = smoothstep(FLIGHT[0] + 0.02, FLIGHT[0] + 0.05, progress) * (1 - smoothstep(FLIGHT[1] - 0.025, FLIGHT[1], progress));
      labels.forEach((label, index) => {
        const target = projected[index];
        const angle = label.angle + camera.spin * 0.6;
        const visible = projectScene.world(camera, Math.cos(angle) * label.radius, Math.sin(angle) * label.radius, label.z, point);
        const depth = point.depth;
        const nx = (point.x - width / 2) / (width / 2);
        const ny = (point.y - height / 2) / (height / 2);
        const opacity = labelVisibility
          * smoothstep(3.5, 7, depth)
          * (1 - smoothstep(14, 20, depth))
          * (1 - smoothstep(0.8, 1.1, Math.abs(nx)))
          * (1 - smoothstep(0.78, 1.05, Math.abs(ny)));
        target.x = point.x;
        target.y = point.y;
        target.scale = Math.max(0.3, Math.min(2.8, (mobile ? 13 : 19) / Math.max(depth, 0.1)));
        target.opacity = visible ? clamp(opacity) : 0;
      });

      canvas.dataset.ready = 'true';
      return projected;
    },
  };
}
