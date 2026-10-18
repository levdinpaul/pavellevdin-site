/**
 * Реальный стек Pavel — единственный источник для спирали на главной, SEO-списка и строки под hero.
 * key — основные технологии: крупнее и светлее в полёте, с акцентной точкой.
 */
export interface StackItem {
  name: string;
  key: boolean;
}

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
    for (let i = 0; i < 2 && m < MORE.length; i++) out.push({ name: MORE[m++], key: false });
  });
  while (m < MORE.length) out.push({ name: MORE[m++], key: false });
  return out;
})();
