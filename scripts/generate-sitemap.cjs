#!/usr/bin/env node
// Генерирует public/sitemap.xml: страницы × 3 языка с hreflang-альтернативами,
// кейсы портфолио (src/data/portfolio.json) и посты блога (src/content/blog, как в prerender.cjs).
// Запускается в npm run build:static перед vite build.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://pavellevdin.ru';
const LANGS = ['ru', 'de', 'en'];
const today = new Date().toISOString().slice(0, 10);

const pages = [
  ['', 'weekly', '1.0'],
  ['/about', 'monthly', '0.9'],
  ['/services', 'weekly', '0.95'],
  ['/portfolio', 'monthly', '0.9'],
  ['/brief', 'monthly', '0.85'],
  ['/calculator', 'monthly', '0.85'],
  ['/contact', 'monthly', '0.85'],
  ['/blog', 'weekly', '0.75'],
  // /business-card намеренно не в sitemap: на ней телефон, страница noindex (только для ссылки и QR)
];
const projects = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'portfolio.json'), 'utf8'));
for (const p of projects) pages.push([`/portfolio/${p.slug}`, 'monthly', '0.8']);
// Посадочные страницы услуг (src/data/services-landing.json)
const landings = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'services-landing.json'), 'utf8'));
for (const slug of Object.keys(landings)) pages.push([`/services/${slug}`, 'monthly', '0.8']);

const alternates = (p) =>
  LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${p}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/ru${p}"/>`;

const urls = [];
for (const [p, freq, prio] of pages) {
  for (const l of LANGS) {
    urls.push(`  <url>\n    <loc>${SITE}/${l}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n${alternates(p)}\n  </url>`);
  }
}

// Статьи блога здесь не перечисляем: их ведёт платформа в /ru/blog/sitemap.xml (Strapi, все языки, hreflang).
// Старый список из src/content/blog расходился со Strapi — при смене слага в sitemap попал бы 404.

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml);
console.log(`✅ sitemap.xml: ${urls.length} URL`);
