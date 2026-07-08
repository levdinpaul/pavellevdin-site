import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface CounterProps {
  value: number;
  suffix?: string;
  label?: string;
  duration?: number;
  size?: number;
  style?: CSSProperties;
}

/** Счётчик с анимацией по скроллу (mono): «10+», «100/100», «3». */
export function Counter({ value, suffix = '', label, duration = 1400, size = 56, style }: CounterProps) {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { setDisplay(value); setDone(true); return; }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(value * eased));
        if (p < 1) requestAnimationFrame(tick); else setDone(true);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: size, lineHeight: 1,
        color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums',
        textShadow: done ? '0 0 24px var(--accent-ring)' : 'none',
        transition: 'text-shadow 400ms var(--ease-out)',
      }}>
        {display}<span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </span>
      {label ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-annotation)', fontWeight: 500, letterSpacing: 'var(--tracking-annotation)', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</span> : null}
    </div>
  );
}
