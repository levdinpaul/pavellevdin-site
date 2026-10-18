import { useEffect, useRef } from 'react';

/**
 * Count-up при появлении. SSR и первый клиентский рендер — финальное значение (SEO, без JS, чистая гидрация);
 * анимация пишет текст напрямую в DOM, только если число ниже экрана на момент монтирования.
 */
export function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let first = true;
    // Первый колбэк IO сообщает исходное положение без принудительного layout (вместо getBoundingClientRect).
    const io = new IntersectionObserver(([e]) => {
      if (first) {
        first = false;
        if (e.isIntersecting || e.boundingClientRect.top < 0) { io.disconnect(); return; }
        el.textContent = `0${suffix}`;
        return;
      }
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1200;
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = `${Math.round(value * eased)}${suffix}`;
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, suffix]);

  return <span ref={ref}>{value}{suffix}</span>;
}
