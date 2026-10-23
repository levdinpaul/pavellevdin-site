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

export function YouTubeIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8L10 9.2Z" fill="currentColor" />
    </svg>
  );
}

export function VkIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.8 18C6.4 18 2.7 13.6 2.5 6.3h3.2c.1 5.4 2.5 7.6 4.4 8.1V6.3h3v4.6c1.9-.2 3.8-2.3 4.5-4.6h3c-.5 2.8-2.6 4.9-4.1 5.8 1.5.7 3.9 2.6 4.8 5.9h-3.3c-.7-2.2-2.5-3.9-4.9-4.2V18h-.3Z" />
    </svg>
  );
}

export function MailIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

// Человек — «Кабинет» в шапке.
export function UserIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
