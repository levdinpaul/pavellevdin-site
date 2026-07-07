import { useState, useEffect, useMemo } from 'react';

export interface CommandSection { id: string; label: string; hint?: string; }
export interface CommandAction { label: string; glyph?: string; kbd?: string; onSelect?: () => void; }
export interface CommandLabels {
  placeholder: string; sections: string; actions: string;
  navigate: string; open: string; notFound: string;
}

interface CommandMenuProps {
  open?: boolean;
  onClose?: () => void;
  sections?: CommandSection[];
  actions?: CommandAction[];
  lang?: string;
  onNavigate?: (id: string) => void;
  labels?: Partial<CommandLabels>;
}

const DEFAULT_LABELS: CommandLabels = {
  placeholder: 'Куда? Поиск или команда…',
  sections: 'Разделы',
  actions: 'Действия',
  navigate: '↑↓ НАВИГАЦИЯ',
  open: '↵ ОТКРЫТЬ',
  notFound: '// ничего не найдено — 404',
};

/** Полноэкранное command-palette меню (⌘K): крупная типографика + поиск действий. */
export function CommandMenu({
  open = false, onClose, sections = [], actions = [], lang = 'RU', onNavigate, labels,
}: CommandMenuProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [query, setQuery] = useState('');
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const filteredActions = useMemo(() => {
    if (!query) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [query, actions]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(6, 8, 16, 0.72)',
        backdropFilter: 'blur(var(--glass-blur))', WebkitBackdropFilter: 'blur(var(--glass-blur))',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(48px, 10vh, 120px) 24px 24px',
        backgroundImage: 'var(--bg-grid)', backgroundSize: 'var(--grid-size) var(--grid-size)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 100%)', borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-overlay)', border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-overlay)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: '80vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: '1px solid var(--border-1)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>&gt;_</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L.placeholder}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink-1)', fontFamily: 'var(--font-body)', fontSize: 16 }}
          />
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', border: '1px solid var(--border-1)', borderRadius: 6, padding: '3px 7px' }}>ESC</kbd>
        </div>
        <div style={{ overflowY: 'auto', padding: '18px 22px 22px' }}>
          {!query && sections.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{L.sections}</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sections.map((sec, i) => (
                  <button
                    key={sec.id}
                    onClick={() => { onNavigate && onNavigate(sec.id); onClose && onClose(); }}
                    onMouseEnter={() => setHoverId(sec.id)}
                    onMouseLeave={() => setHoverId(null)}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: 16, textAlign: 'left',
                      background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 8px',
                      borderBottom: '1px solid var(--border-1)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: hoverId === sec.id ? 'var(--accent)' : 'var(--ink-3)', width: 26 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em',
                      fontSize: 'clamp(24px, 3.4vw, 38px)', lineHeight: 1.15,
                      color: hoverId === sec.id ? 'var(--accent-strong)' : 'var(--ink-1)',
                      transform: hoverId === sec.id ? 'translateX(6px)' : 'none',
                      transition: 'all var(--transition-fast)', display: 'inline-block',
                    }}>{sec.label}</span>
                    {sec.hint ? <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{sec.hint}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{L.actions}</p>
          {filteredActions.map((a) => (
            <button
              key={a.label}
              onClick={() => { a.onSelect && a.onSelect(); onClose && onClose(); }}
              onMouseEnter={() => setHoverId(a.label)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                background: hoverId === a.label ? 'var(--accent-ghost)' : 'transparent',
                border: 'none', cursor: 'pointer', padding: '11px 10px', borderRadius: 'var(--radius-sm)',
                color: hoverId === a.label ? 'var(--ink-1)' : 'var(--ink-2)',
                fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{a.glyph || '→'}</span>
              {a.label}
              {a.kbd ? <kbd style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', border: '1px solid var(--border-1)', borderRadius: 6, padding: '2px 6px' }}>{a.kbd}</kbd> : null}
            </button>
          ))}
          {query && filteredActions.length === 0 && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', padding: '10px 8px' }}>{L.notFound}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, padding: '12px 22px', borderTop: '1px solid var(--border-1)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
          <span>{L.navigate}</span><span>{L.open}</span><span style={{ marginLeft: 'auto' }}>{lang} · DE / EN / RU</span>
        </div>
      </div>
    </div>
  );
}
