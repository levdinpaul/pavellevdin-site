/**
 * Реальный стек Pavel — единственный источник для спирали на главной, SEO-списка и строки под hero.
 * key — основные технологии: крупнее и светлее в полёте, с акцентной точкой.
 */
export interface StackItem {
  name: string;
  key: boolean;
  /** Только для этих локалей (нет поля — для всех). */
  locales?: readonly string[];
}

/** Технологии рынка РФ: на de/en не показываются. */
const RU_ONLY = new Set(['Яндекс Метрика']);

const KEY = ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'nginx', 'REST API', 'Telegram Bot API', 'Claude API', 'MCP', 'SEO'];
const MORE = [
  'JavaScript', 'Vite', 'Strapi', 'PHP', 'Python', 'Express', 'MariaDB', 'MySQL', 'Tailwind CSS', 'three.js', 'GSAP', 'Linux',
  'Git', 'GitHub Actions', 'OpenAI API', 'GA4', 'Tag Manager', 'Яндекс Метрика', 'Schema.org', 'i18n', 'PWA', 'Playwright', 'HTML', 'CSS',
];

/** Порядок полёта: ключевые чередуются с остальными (1 ключевая на 2 прочих), чтобы в кадре всегда был «якорь». */
export const STACK: readonly StackItem[] = (() => {
  const out: StackItem[] = [];
  let m = 0;
  KEY.forEach((name) => {
    out.push({ name, key: true });
    for (let i = 0; i < 2 && m < MORE.length; i++) out.push(more(MORE[m++]));
  });
  while (m < MORE.length) out.push(more(MORE[m++]));
  return out;
})();

function more(name: string): StackItem {
  return RU_ONLY.has(name) ? { name, key: false, locales: ['ru'] } : { name, key: false };
}

/** Стек для конкретной локали (спираль, SEO-список, бегущая строка). */
export function stackFor(lang: string): readonly StackItem[] {
  return STACK.filter((item) => !item.locales || item.locales.includes(lang));
}
