import { useState, type CSSProperties } from 'react';

interface ServiceCardProps {
  index?: string;
  title: string;
  description?: string;
  deliverables?: string[];
  style?: CSSProperties;
}

/** Карточка услуги — номер этапа; при наведении «достраивается» (пунктир → solid + glow). */
export function ServiceCard({ index, title, description, deliverables = [], style }: ServiceCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', padding: 28, borderRadius: 'var(--radius-lg)',
        background: hover ? 'var(--bg-2)' : 'transparent',
        border: hover ? '1px solid var(--accent-ring)' : '1px dashed var(--line-blueprint)',
        boxShadow: hover ? 'var(--shadow-glow-accent)' : 'none',
        transform: hover ? 'var(--lift-hover)' : 'none',
        transition: 'all var(--transition-base)', cursor: 'default',
        display: 'flex', flexDirection: 'column', gap: 14,
        ...style,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: hover ? 'var(--accent)' : 'var(--ink-3)', transition: 'color var(--transition-base)' }}>
        {index} <span style={{ fontWeight: 400 }}>/</span>
      </span>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink-1)' }}>{title}</h3>
      {description ? <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>{description}</p> : null}
      {deliverables.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {deliverables.map((d) => (
            <li key={d} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: hover ? 'var(--accent)' : 'var(--ink-3)', transition: 'color var(--transition-base)' }}>+</span>{d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
