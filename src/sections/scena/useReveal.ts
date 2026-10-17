import { useEffect, type RefObject } from 'react';

/**
 * Плавное появление [data-reveal] внутри контейнера при прокрутке.
 * В SSR-разметке элементы видимы; «взводятся» (прячутся) только те, что ниже экрана на момент
 * монтирования — поэтому без JS, при reduced-motion и до гидрации контент всегда на месте.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).dataset.reveal = 'shown'; io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((it) => {
      if (it.getBoundingClientRect().top > window.innerHeight) { it.dataset.reveal = 'armed'; io.observe(it); }
    });
    return () => io.disconnect();
  }, [root]);
}
