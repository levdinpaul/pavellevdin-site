/** Бегущая строка технологий (текстом, без логотипов). Вторая копия — только для бесшовной петли. */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const row = (hidden: boolean) => (
    <ul className="pl-marquee__row" aria-hidden={hidden || undefined}>
      {items.map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
  return (
    <div className="pl-marquee" role="region" aria-label={label}>
      <div className="pl-marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/** Технологии для бегущей строки — названия не переводятся. */
export const STACK = [
  'Next.js', 'React 19', 'Vite', 'TypeScript', 'Tailwind CSS', 'Strapi', 'PostgreSQL', 'MariaDB', 'PHP', 'Node.js',
  'Express', 'Docker', 'nginx', "Let's Encrypt", 'GA4', 'GTM', 'Yandex Metrika', 'Schema.org', 'three.js',
  'Telegram Bot API', 'OpenRouter', 'MCP', 'Claude Code', 'PWA',
];
