import { useState, type CSSProperties } from 'react';
import { IconButton } from './IconButton';

export interface NavItem {
  id: string;
  label: string;
}

interface NavPillProps {
  items?: NavItem[];
  activeId?: string | null;
  onNavigate?: (id: string) => void;
  onMenuOpen?: () => void;
  onSearchOpen?: () => void;
  lang?: string;
  onLangChange?: () => void;
  cta?: string;
  onCta?: () => void;
  style?: CSSProperties;
}

/** Плавающая стеклянная навигационная «пилюля» — вместо классического меню. */
export function NavPill({
  items = [], activeId, onNavigate, onMenuOpen, onSearchOpen,
  lang = 'RU', onLangChange, cta = 'Контакт', onCta, style,
}: NavPillProps) {
  const [hoverCta, setHoverCta] = useState(false);
  return (
    <nav
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: 6, borderRadius: 'var(--radius-pill)',
        /* Плотный полупрозрачный фон вместо backdrop-blur: пилюля всегда на первом экране,
           а blur пересчитывался бы каждый кадр (дорогой paint на мобиле). Стекло сохраняем
           через плотность фона + бордер + тень. */
        background: 'linear-gradient(180deg, rgba(20,25,38,0.94), rgba(12,16,26,0.94))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-overlay)',
        ...style,
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink-1)', padding: '0 12px 0 14px', whiteSpace: 'nowrap' }}>
        PL<span style={{ color: 'var(--accent)' }}>·</span>D
      </span>
      <span style={{ width: 1, height: 20, background: 'var(--border-1)' }} />
      <div style={{ display: 'flex', gap: 2, padding: '0 4px' }} className="navpill-links">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNavigate && onNavigate(it.id)}
            style={{
              padding: '9px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
              background: it.id === activeId ? 'var(--accent-ghost)' : 'transparent',
              color: it.id === activeId ? 'var(--accent)' : 'var(--ink-2)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
      <span style={{ width: 1, height: 20, background: 'var(--border-1)' }} className="navpill-sep" />
      <IconButton label="Поиск (⌘K)" size={36} onClick={onSearchOpen} style={{ borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>⌘K</IconButton>
      <IconButton label={`Язык: ${lang}`} size={36} onClick={onLangChange} style={{ borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{lang}</IconButton>
      <button
        onClick={onCta}
        onMouseEnter={() => setHoverCta(true)}
        onMouseLeave={() => setHoverCta(false)}
        className="navpill-cta"
        style={{
          padding: '9px 18px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
          background: hoverCta ? 'var(--accent-strong)' : 'var(--accent)', color: 'var(--ink-inverse)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          boxShadow: hoverCta ? 'var(--shadow-glow-accent)' : 'none',
          transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
        }}
      >
        {cta}
      </button>
      <IconButton label="Меню" size={36} onClick={onMenuOpen} style={{ borderRadius: 'var(--radius-pill)' }}>☰</IconButton>
    </nav>
  );
}
