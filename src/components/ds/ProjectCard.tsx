import { useState, useRef, type CSSProperties } from 'react';
import { Badge } from './Badge';

interface ProjectCardProps {
  title: string;
  category?: string;
  image?: string;
  description?: string;
  tags?: string[];
  stat?: string;
  href?: string;
  style?: CSSProperties;
}

/** Иммерсивная карточка проекта — крупная картинка, 3D-tilt, раскрытие футера, теги. */
export function ProjectCard({ title, category, image, description, tags = [], stat, href, style }: ProjectCardProps) {
  const [hover, setHover] = useState(false);
  const [tf, setTf] = useState('');
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTf(`perspective(1100px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`);
  };

  return (
    <a
      href={href || '#'}
      ref={ref}
      target={href && href.startsWith('http') ? '_blank' : undefined}
      rel={href && href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTf(''); }}
      onMouseMove={onMove}
      style={{
        display: 'block', position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--radius-xl)', textDecoration: 'none',
        border: `1px solid ${hover ? 'var(--accent-ring)' : 'var(--border-1)'}`,
        boxShadow: hover ? 'var(--shadow-glow-accent)' : 'var(--shadow-card)',
        transform: tf || 'none', willChange: 'transform',
        transition: 'box-shadow var(--transition-base), border-color var(--transition-base)',
        aspectRatio: '4 / 3', background: 'var(--bg-2)',
        ...style,
      }}
    >
      {image ? (
        <img src={image} alt={title} loading="lazy" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: hover ? 'scale(1.04)' : 'scale(1)', transition: 'transform 600ms var(--ease-out)',
          filter: hover ? 'saturate(1.05)' : 'saturate(0.92)',
        }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--bg-grid)', backgroundSize: '32px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--ink-3)' }}>BILD FOLGT</div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-protect)' }} />
      {stat ? (
        <span style={{ position: 'absolute', top: 16, right: 16, padding: '6px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--glass-fill)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{stat}</span>
      ) : null}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {category ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>{category}</span> : null}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-1)', lineHeight: 1.1 }}>
          {title} <span style={{ display: 'inline-block', transform: hover ? 'translate(4px, -2px)' : 'none', transition: 'transform var(--transition-fast)', color: 'var(--accent)' }}>↗</span>
        </span>
        <div style={{
          overflow: 'hidden', maxHeight: hover ? 120 : 0, opacity: hover ? 1 : 0,
          transition: 'max-height 400ms var(--ease-out), opacity 300ms var(--ease-out)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {description ? <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>{description}</span> : null}
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map((tg) => <Badge key={tg} tone="neutral" style={{ background: 'var(--glass-fill)' }}>{tg}</Badge>)}
          </span>
        </div>
      </div>
    </a>
  );
}
