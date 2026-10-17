// Иконки мессенджеров для шапки/футера (inline SVG, без зависимостей).
type IconProps = { size?: number };

export function TelegramIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.7 3.5 2.9 10.8c-1.1.4-1.1 1.1-.2 1.4l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.2-.5-1.8-1.2-1.5ZM8.9 14l9.3-5.9c.4-.3.8-.1.5.2l-7.9 7.2-.3 3.2L8.9 14Z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.3-3.8A8 8 0 1 1 8.2 19L4 20Z" />
      <path d="M9.5 9.5c0 3 2 5 5 5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2-1 1.5Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Четырёхлучевая звезда — фирменный акцент сцены. */
export function Sparkle({ size = 13, className = 'pl-sparkle' }: IconProps & { className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.5 6.4 5.1 11 11.5 11.5C17.1 12 12.5 16.6 12 23c-.5-6.4-5.1-11-11.5-11.5C6.9 11 11.5 6.4 12 0Z" fill="#7AA2FF" />
    </svg>
  );
}
