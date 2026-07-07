#!/usr/bin/env node
// Генератор Turbo RSS-фида Яндекса из статей блога (src/content/blog/<id>/ru.json).
// Турбо-страницы решают проблему индексации CSR-контента в Яндексе (значок молнии + кэш Яндекса).
// Запуск: node scripts/generate-turbo-feed.cjs [outPath]
// По умолчанию пишет в dist/turbo.rss (заливается на FTP вместе с dist).

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://pavellevdin.ru';
const METRIKA_ID = '108284704';
const AUTHOR = 'Pavel Levdin';
const CHANNEL_TITLE = 'Delimes — блог';
const CHANNEL_DESC = 'Статьи о веб-разработке, SEO и автоматизации.';

// Разрешённые в Турбо теги (остальные блок-обёртки разворачиваем, атрибуты вырезаем)
const UNWRAP_TAGS = ['div', 'section', 'article', 'span', 'header', 'footer', 'aside', 'nav', 'main'];

function xmlEscape(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absolutize(html) {
  return html
    .replace(/(\ssrc=")\/(?!\/)/g, `$1${SITE_URL}/`)
    .replace(/(\shref=")\/(?!\/)/g, `$1${SITE_URL}/`);
}

// Приводим авторский HTML к допустимому для Турбо подмножеству
function cleanTurboHtml(raw = '') {
  let html = String(raw);

  // 1. Убираем скрипты, стили, комментарии, iframe
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Разворачиваем блок-обёртки (убираем сам тег, содержимое оставляем)
  UNWRAP_TAGS.forEach((tag) => {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
    html = html.replace(new RegExp(`</${tag}>`, 'gi'), '');
  });

  // 3. Вырезаем недопустимые атрибуты (class/style/id/data-*/on*/target/rel)
  html = html.replace(/\s(?:class|style|id|target|rel)="[^"]*"/gi, '');
  html = html.replace(/\sdata-[\w-]+="[^"]*"/gi, '');
  html = html.replace(/\son[a-z]+="[^"]*"/gi, '');

  // 4. Абсолютные URL для картинок и ссылок
  html = absolutize(html);

  // 5. Чистим лишние пробелы между тегами
  html = html.replace(/>\s+</g, '>\n<').trim();

  return html;
}

function toRfc822(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function buildItem(article) {
  const slug = article.slug || article.id;
  const url = `${SITE_URL}/ru/blog/${slug}`;
  const title = article.title || '';
  const excerpt = article.excerpt || '';
  let image = (article.meta && article.meta.ogImage) || article.image || '';
  if (image && !image.startsWith('http')) image = `${SITE_URL}${image}`;

  const body = cleanTurboHtml(article.content || '');
  const figure = image ? `<figure><img src="${image}"/><figcaption>${xmlEscape(title)}</figcaption></figure>` : '';

  // CTA обратно на сайт (конверсия из Турбо-трафика) + кнопки шаринга
  const cta = `<div data-block="button"><a href="${SITE_URL}/ru/brief">Обсудить проект</a></div>`;
  const share = `<div data-block="share" data-network="telegram,vkontakte,whatsapp"></div>`;

  // CDATA не должна содержать "]]>"
  const contentHtml = [
    `<header><h1>${xmlEscape(title)}</h1></header>`,
    excerpt ? `<p><strong>${xmlEscape(excerpt)}</strong></p>` : '',
    figure,
    body,
    cta,
    share,
  ].join('\n').replace(/]]>/g, ']] >');

  return [
    '    <item turbo="true">',
    `      <link>${url}</link>`,
    `      <turbo:source>${url}</turbo:source>`,
    `      <turbo:topic>${xmlEscape(title)}</turbo:topic>`,
    `      <pubDate>${toRfc822(article.date)}</pubDate>`,
    `      <author>${AUTHOR}</author>`,
    '      <turbo:content>',
    `        <![CDATA[\n${contentHtml}\n]]>`,
    '      </turbo:content>',
    '    </item>',
  ].join('\n');
}

function generateTurboFeed(projectRoot, outPath) {
  const blogDir = path.join(projectRoot, 'src', 'content', 'blog');
  if (!fs.existsSync(blogDir)) {
    console.log('⚠️  Каталог блога не найден:', blogDir);
    return null;
  }

  const dirs = fs.readdirSync(blogDir).filter((d) => fs.statSync(path.join(blogDir, d)).isDirectory());
  const items = [];

  for (const dir of dirs) {
    const file = path.join(blogDir, dir, 'ru.json');
    if (!fs.existsSync(file)) continue;
    let article;
    try {
      article = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
    } catch {
      console.log('❌ Ошибка JSON:', dir);
      continue;
    }
    if (!article.published) continue;
    if (!article.title || !(article.slug || article.id)) continue;
    items.push(buildItem(article));
  }

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">',
    '  <channel>',
    `    <title>${xmlEscape(CHANNEL_TITLE)}</title>`,
    `    <link>${SITE_URL}/ru/blog</link>`,
    `    <description>${xmlEscape(CHANNEL_DESC)}</description>`,
    '    <language>ru</language>',
    `    <turbo:analytics type="Yandex" id="${METRIKA_ID}"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  const target = outPath || path.join(projectRoot, 'dist', 'turbo.rss');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, feed, 'utf8');
  console.log(`✅ Turbo RSS: ${items.length} статей → ${target}`);
  return target;
}

module.exports = { generateTurboFeed };

// Запуск напрямую
if (require.main === module) {
  const projectRoot = path.join(__dirname, '..');
  const out = process.argv[2] ? path.resolve(process.argv[2]) : null;
  generateTurboFeed(projectRoot, out);
}
