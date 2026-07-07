#!/usr/bin/env node
// Пререндер ключевых маршрутов SPA в статический HTML (после vite build).
// Отдаёт реальный HTML Яндексу, Google и AI-краулерам (которые не исполняют JS).
// .htaccess уже делает SPA-fallback; если для маршрута существует свой index.html —
// Apache отдаёт его напрямую (DirectoryIndex), поэтому кладём dist/<route>/index.html.
// Запуск: node scripts/prerender.cjs

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const projectRoot = path.join(__dirname, '..');
const dist = path.join(projectRoot, 'dist');
const PORT = 5055;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain',
};

function startServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(dist, urlPath);
    if (filePath.startsWith(dist) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback — как на боевом .htaccess
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(dist, 'index.html')).pipe(res);
    }
  }).listen(PORT);
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// react-helmet-async в связке с React 19 оставляет по нескольку <title>/<canonical>/<description>
// (три уровня Helmet: App → Layout → страница). Оставляем по одному авторитетному тегу.
function dedupHead(html, meta) {
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n    <title>${esc(meta.title)}</title>`);

  html = html.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  if (meta.canonical) {
    html = html.replace(/<\/head>/i, `    <link rel="canonical" href="${esc(meta.canonical)}" />\n  </head>`);
  }

  html = html.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  if (meta.description) {
    html = html.replace(/<\/head>/i, `    <meta name="description" content="${esc(meta.description)}" />\n  </head>`);
  }
  return html;
}

function getBlogSlugs() {
  const blogDir = path.join(projectRoot, 'src', 'content', 'blog');
  const slugs = [];
  if (!fs.existsSync(blogDir)) return slugs;
  for (const dir of fs.readdirSync(blogDir)) {
    const f = path.join(blogDir, dir, 'ru.json');
    if (!fs.existsSync(f)) continue;
    try {
      const a = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
      if (a.published && (a.slug || a.id)) slugs.push(a.slug || a.id);
    } catch { /* пропускаем битый JSON */ }
  }
  return slugs;
}

async function run() {
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    console.error('❌ dist/index.html не найден. Сначала запустите vite build.');
    process.exit(1);
  }

  // Русские маршруты — приоритет фазы 1
  const routes = [
    '/ru', '/ru/services', '/ru/portfolio', '/ru/contact',
    '/ru/brief', '/ru/business-card', '/ru/imprint', '/ru/privacy', '/ru/blog',
  ];
  for (const slug of getBlogSlugs()) routes.push(`/ru/blog/${slug}`);

  const server = startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  let ok = 0;
  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForSelector('#root > *', { timeout: 15000 }).catch(() => {});
      // дать react-helmet и анимациям осесть
      await new Promise((r) => setTimeout(r, 500));

      // Авторитетные SEO-теги (document.title + последние canonical/description от Helmet)
      const meta = await page.evaluate(() => {
        const canon = [...document.querySelectorAll('link[rel="canonical"]')].pop();
        const desc = [...document.querySelectorAll('meta[name="description"]')].pop();
        return {
          title: document.title,
          canonical: canon ? canon.href : null,
          description: desc ? desc.getAttribute('content') : null,
        };
      });

      let html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
      html = dedupHead(html, meta);
      // Заменяем origin пререндер-сервера на боевой домен (утечки в canonical/og:url и т.п.)
      html = html.split(`http://localhost:${PORT}`).join('https://pavellevdin.ru');

      const outDir = path.join(dist, route.replace(/^\//, ''));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
      console.log(`  ✓ ${route}`);
      ok += 1;
    } catch (e) {
      console.log(`  ✗ ${route}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`✅ Prerender: ${ok}/${routes.length} маршрутов сохранено в dist/`);
}

run().catch((e) => {
  console.error('❌ Prerender упал:', e.message);
  process.exit(1);
});
