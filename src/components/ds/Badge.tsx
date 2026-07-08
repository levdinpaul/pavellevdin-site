import type { CSSProperties, ReactNode } from 'react';

type Tone = 'accent' | 'neutral' | 'gold' | 'success';

const tones: Record<Tone, { color: string; border: string; bg: string }> = {
  accent: { color: 'var(--accent)', border: 'var(--accent-ring)', bg: 'var(--accent-ghost)' },
  neutral: { color: 'var(--ink-2)', border: 'var(--border-1)', bg: 'rgba(150,175,215,0.06)' },
  gold: { color: 'var(--gold)', border: 'rgba(201,168,118,0.35)', bg: 'var(--gold-ghost)' },
  success: { color: 'var(--success)', border: 'rgba(58,223,165,0.35)', bg: 'rgba(58,223,165,0.08)' },
};

interface BadgeProps {
  tone?: Tone;
  mono?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Badge({ tone = 'accent', mono = true, children, style }: BadgeProps) {
  const t = tones[tone] || tones.accent;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 'var(--radius-pill)',
        background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 11, fontWeight: 500,
        letterSpacing: mono ? '0.14em' : 0, textTransform: mono ? 'uppercase' : 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
