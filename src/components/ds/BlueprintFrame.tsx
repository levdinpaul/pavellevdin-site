import type { CSSProperties, ReactNode } from 'react';

interface BlueprintFrameProps {
  label?: string;
  coords?: string;
  children?: ReactNode;
  padding?: number;
  style?: CSSProperties;
}

/** Пунктирная blueprint-рамка с угловыми засечками и подписью-«листом». */
export function BlueprintFrame({ label, coords, children, padding = 24, style }: BlueprintFrameProps) {
  const tick = (pos: CSSProperties): CSSProperties => ({
    position: 'absolute', width: 10, height: 10,
    borderLeft: '1.5px solid var(--accent)', borderTop: '1.5px solid var(--accent)',
    ...pos,
  });
  return (
    <div style={{ position: 'relative', border: '1px dashed var(--line-blueprint)', borderRadius: 'var(--radius-xs)', padding, ...style }}>
      <span style={tick({ top: -1, left: -1 })} />
      <span style={tick({ top: -1, right: -1, transform: 'rotate(90deg)' })} />
      <span style={tick({ bottom: -1, right: -1, transform: 'rotate(180deg)' })} />
      <span style={tick({ bottom: -1, left: -1, transform: 'rotate(270deg)' })} />
      {label ? (
        <span style={{ position: 'absolute', top: -8, left: 16, background: 'var(--bg-0)', padding: '0 8px', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>{label}</span>
      ) : null}
      {coords ? (
        <span style={{ position: 'absolute', bottom: -7, right: 16, background: 'var(--bg-0)', padding: '0 8px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{coords}</span>
      ) : null}
      {children}
    </div>
  );
}
