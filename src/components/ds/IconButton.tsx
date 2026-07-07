import { useState, type CSSProperties, type ReactNode, type ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Квадратная icon-кнопка дизайн-системы (навигация, ⌘K, язык). */
export function IconButton({ label, active = false, size = 40, children, style, ...rest }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      aria-label={label}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 'var(--radius-md)',
        background: active ? 'var(--accent-ghost)' : hover ? 'rgba(150,175,215,0.08)' : 'transparent',
        color: active ? 'var(--accent)' : hover ? 'var(--ink-1)' : 'var(--ink-2)',
        border: `1px solid ${active ? 'var(--accent-ring)' : 'transparent'}`,
        cursor: 'pointer', transition: 'all var(--transition-fast)',
        fontSize: 16, fontFamily: 'var(--font-body)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
