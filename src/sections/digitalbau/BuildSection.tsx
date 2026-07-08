import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';

interface BuildSectionProps {
  id?: string;
  label?: string;
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Секция, которая «строится» при попадании в зону скролла (класс .built → CSS-переход).
 * Детектор — нативный IntersectionObserver: он не читает layout пачкой и на порядок дешевле
 * GSAP ScrollTrigger по main-thread нагрузке (критично для TBT/Style&Layout на мобиле).
 */
export function BuildSection({ id, label, children, style }: BuildSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      el.classList.add('built');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('built');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      data-screen-label={label}
      className="build-section"
      style={{ position: 'relative', padding: 'var(--section-padding-y) var(--section-padding-x)', ...style }}
    >
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>{children}</div>
    </section>
  );
}
