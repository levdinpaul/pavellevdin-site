import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BuildSectionProps {
  id?: string;
  label?: string;
  children: ReactNode;
  style?: CSSProperties;
}

/** Секция, которая «строится» при попадании в зону скролла (GSAP ScrollTrigger → класс .built). */
export function BuildSection({ id, label, children, style }: BuildSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('built');
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => el.classList.add('built'),
    });
    return () => st.kill();
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
