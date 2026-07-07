import { useState, type CSSProperties, type ReactNode, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
  style?: CSSProperties;
}

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '10px 20px', fontSize: 13 },
  md: { padding: '14px 28px', fontSize: 14 },
  lg: { padding: '18px 36px', fontSize: 15 },
};

/** Кнопка дизайн-системы PL Digitalbau (primary/secondary/ghost). */
export function Button({ variant = 'primary', size = 'md', disabled = false, children, style, ...rest }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = sizes[size] || sizes.md;

  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: hover ? 'var(--accent-strong)' : 'var(--accent)',
      color: 'var(--ink-inverse)',
      border: '1px solid transparent',
      boxShadow: hover ? 'var(--shadow-glow-accent)' : 'none',
    },
    secondary: {
      background: hover ? 'var(--accent-ghost)' : 'transparent',
      color: hover ? 'var(--accent-strong)' : 'var(--ink-1)',
      border: `1px solid ${hover ? 'var(--accent-ring)' : 'var(--border-2)'}`,
      boxShadow: 'none',
    },
    ghost: {
      background: hover ? 'rgba(150,175,215,0.08)' : 'transparent',
      color: hover ? 'var(--ink-1)' : 'var(--ink-2)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  };

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: s.fontSize,
        padding: s.padding, borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, minHeight: 44,
        transform: press ? 'translateY(0)' : hover ? 'translateY(-1px)' : 'none',
        transition: 'all var(--transition-base)',
        ...(disabled ? { ...variants[variant], boxShadow: 'none' } : variants[variant]),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
