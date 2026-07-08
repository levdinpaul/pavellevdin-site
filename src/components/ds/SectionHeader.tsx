import type { CSSProperties, ReactNode } from 'react';

interface SectionHeaderProps {
  index?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  style?: CSSProperties;
}

/** Заголовок секции: mono-нумерованный eyebrow + display-заголовок + опциональный lead. */
export function SectionHeader({ index, eyebrow, title, lead, align = 'left', style }: SectionHeaderProps) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, ...style }}>
      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-annotation)', fontWeight: 500, letterSpacing: 'var(--tracking-annotation)', textTransform: 'uppercase', color: 'var(--accent)' }}>
        {index ? <span>{'//'} {index}</span> : null}
        <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--line-blueprint)' }} />
        {eyebrow}
      </p>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', fontWeight: 700, letterSpacing: 'var(--tracking-heading)', lineHeight: 'var(--leading-heading)', color: 'var(--ink-1)', maxWidth: '18ch' }}>
        {title}
      </h2>
      {lead ? <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-body)', color: 'var(--ink-2)', maxWidth: '52ch' }}>{lead}</p> : null}
    </header>
  );
}
