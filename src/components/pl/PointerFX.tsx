import { useEffect, useRef } from 'react';

/**
 * Десктоп-эффекты (только pointer:fine и без reduced-motion), через делегирование — без обработчиков на каждом элементе:
 *  - мягкое свечение-курсор;
 *  - магнитные кнопки: .pl-btn--primary;
 *  - 3D-tilt + блик: [data-tilt].
 * Только transform/opacity и CSS-переменные.
 */
export function PointerFX() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const g = glow.current;
    let raf = 0, x = 0, y = 0;
    let magnet: HTMLElement | null = null, tilt: HTMLElement | null = null;

    const paint = () => {
      raf = 0;
      if (g) g.style.transform = `translate3d(${x - 200}px, ${y - 200}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (g) g.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(paint);
      const el = e.target as HTMLElement;

      const m = el.closest<HTMLElement>('.pl-btn--primary');
      if (magnet && magnet !== m) { magnet.style.transform = ''; magnet = null; }
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate3d(${((x - r.left - r.width / 2) * 0.25).toFixed(1)}px, ${((y - r.top - r.height / 2) * 0.3).toFixed(1)}px, 0)`;
        magnet = m;
      }

      const tl = el.closest<HTMLElement>('[data-tilt]');
      if (tilt && tilt !== tl) { tilt.style.transform = ''; tilt.style.removeProperty('--gx'); tilt = null; }
      if (tl) {
        const r = tl.getBoundingClientRect(), px = (x - r.left) / r.width, py = (y - r.top) / r.height;
        tl.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 6).toFixed(2)}deg) rotateY(${((px - 0.5) * 8).toFixed(2)}deg) translateY(-4px)`;
        tl.style.setProperty('--gx', `${(px * 100).toFixed(0)}%`);
        tl.style.setProperty('--gy', `${(py * 100).toFixed(0)}%`);
        tilt = tl;
      }
    };
    const onLeave = () => {
      if (g) g.style.opacity = '0';
      if (magnet) { magnet.style.transform = ''; magnet = null; }
      if (tilt) { tilt.style.transform = ''; tilt = null; }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={glow} className="pl-cursor-glow" aria-hidden="true" />;
}
