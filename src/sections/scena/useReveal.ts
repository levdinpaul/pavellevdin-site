import { useEffect, type RefObject } from 'react';

/** Шаг stagger для блоков, появившихся одновременно (карточки, услуги, цены, отзывы). */
const STAGGER_MS = 70;
const STAGGER_MAX = 8;

/**
 * Плавное появление [data-reveal] внутри контейнера при прокрутке.
 * В SSR-разметке элементы видимы; «взводятся» (прячутся) только те, что ниже экрана на момент
 * монтирования — поэтому без JS, при reduced-motion и до гидрации контент всегда на месте.
 * Элементы, вошедшие в экран одной пачкой, получают задержку 70 мс × порядковый номер.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const target = e.target as HTMLElement;
        target.style.setProperty('--reveal-delay', `${Math.min(order++, STAGGER_MAX) * STAGGER_MS}ms`);
        target.dataset.reveal = 'shown';
        io.unobserve(target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // сначала все чтения геометрии, потом записи — иначе каждая запись форсирует пересчёт layout
    const h = window.innerHeight;
    const below = items.filter((it) => it.getBoundingClientRect().top > h);
    below.forEach((it) => { it.dataset.reveal = 'armed'; io.observe(it); });
    return () => io.disconnect();
  }, [root]);
}
