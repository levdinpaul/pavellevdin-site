#!/usr/bin/env node
// Снимок последних статей блога (pl-platform / Strapi) для секции «Блог» на главной: → src/data/posts.json.
// По 3 опубликованные статьи на язык. Если API недоступно — остаётся прежний снимок, сборка не падает; без снимка — [] (секция скрыта).
// POSTS_URL — переопределить источник (по умолчанию публичный API на проде).
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'src', 'data', 'posts.json');
const base = (process.env.POSTS_URL || 'https://pavellevdin.ru').replace(/\/$/, '');
const LANGS = ['ru', 'de', 'en'];
const WORDS_PER_MIN = 180;

const strip = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const firstSentence = (text) => {
  const s = text.slice(0, 220);
  const end = s.search(/[.!?](\s|$)/);
  return (end > 40 ? s.slice(0, end + 1) : s.replace(/\s\S*$/, '') + '…').trim();
};
const abs = (u) => (!u ? null : u.startsWith('http') ? u : `${base}${u}`);

async function fetchLang(lang) {
  const q = `locale=${lang}&populate=featured_image&sort=publishedAt:desc&pagination[pageSize]=3&publicationState=live`;
  const res = await fetch(`${base}/api/blog-posts?${q}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${lang}: HTTP ${res.status}`);
  const { data } = await res.json();
  if (!Array.isArray(data)) throw new Error(`${lang}: нет массива data`);
  return data.map(({ attributes: a }) => {
    const text = strip(a.content);
    const img = a.featured_image?.data?.attributes;
    return {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ? strip(a.excerpt) : firstSentence(text),
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      readMinutes: Math.max(1, Math.round(text.split(' ').length / WORDS_PER_MIN)),
      image: img ? abs(img.formats?.medium?.url || img.url) : null,
    };
  });
}

(async () => {
  try {
    const result = {};
    for (const lang of LANGS) result[lang] = await fetchLang(lang);
    fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
    console.log(`✓ Блог: ${LANGS.map((l) => `${l} ${result[l].length}`).join(', ')} → src/data/posts.json`);
  } catch (e) {
    if (!fs.existsSync(out)) fs.writeFileSync(out, JSON.stringify({ ru: [], de: [], en: [] }, null, 2) + '\n');
    console.log(`⚠ Блог не обновлён (${e.message}) — оставлен прежний снимок`);
  }
})();
