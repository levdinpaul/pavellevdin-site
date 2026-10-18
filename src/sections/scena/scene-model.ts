/** Shared, deterministic scene data; importing this file does not load Three.js. */

/** Scroll timeline of the section (0…1): hero leaves, the flight passes the stack, the finale holds ~10%. */
export const HERO_END = 0.15;
export const FLIGHT = [0.12, 0.84] as const;
export const FINALE = [0.84, 0.9] as const;

export const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function smoothstep(start: number, end: number, value: number) {
  const fraction = clamp((value - start) / (end - start));
  return fraction * fraction * (3 - 2 * fraction);
}

/** A calm, real SVG spiral is available in server-rendered HTML before WebGL. */
export function fallbackSpiral(phase: number) {
  return Array.from({ length: 241 }, (_, index) => {
    const fraction = index / 240;
    const angle = fraction * Math.PI * 6 + phase;
    const radius = 12 + Math.pow(fraction, 2.4) * 720;
    const x = 1020 + Math.cos(angle) * radius;
    const y = 450 + Math.sin(angle) * radius * 0.74;
    return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}
