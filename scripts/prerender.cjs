#!/usr/bin/env node
// Пререндер ключевых маршрутов SPA в статический HTML (после vite build).
// Отдаёт реальный HTML Яндексу, Google и AI-краулерам (которые не исполняют JS).
// .htaccess уже делает SPA-fallback; если для маршрута существует свой index.html —
// Apache отдаёт его напрямую (DirectoryIndex), поэтому кладём dist/<route>/index.html.
// Запуск: node scripts/prerender.cjs

const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const projectRoot = path.join(__dirname, '..');
const dist = path.join(projectRoot, 'dist');
const PORT = 5055;

// Маршруты, для которых тело #root берём из НАСТОЯЩЕГО React SSR (renderToString),
// а не из puppeteer-capture. SSR даёт React-канонический HTML → гидрация на клиенте
// проходит без regeneration → LCP не скачет на момент гидрации (см. src/entry-server.tsx).
// head (title/canonical/og/JSON-LD) по-прежнему берём из puppeteer (Helmet на клиенте).
// Какие маршруты рендерим настоящим React SSR (renderToPipeableStream резолвит React.lazy).
// Блог использует dehydrate/hydrate (данные грузятся на сервере и сериализуются в window.__BLOG_DATA__).
// Формы (contact/brief) — пока на puppeteer (отдельный осторожный шаг).
function ssrLangForRoute(route) {
  if (['/ru', '/ru/services', '/ru/portfolio', '/ru/blog'].includes(route)) return 'ru';
  if (/^\/ru\/blog\/[^/]+$/.test(route)) return 'ru'; // отдельные посты (один сегмент, не category/tag)
  return null;
}

// Вставляет инлайн-скрипт с дегидрированными данными ПЕРЕД модульным скриптом гидрации,
// чтобы window.__BLOG_DATA__ был доступен до первого клиентского рендера.
function injectDehydrate(html, json) {
  const tag = `<script>window.__BLOG_DATA__=${json}</script>`;
  const rootIdx = html.indexOf('<div id="root">');
  const scriptIdx = html.indexOf('<script', rootIdx === -1 ? 0 : rootIdx);
  if (scriptIdx === -1) return html.replace('</body>', `${tag}</body>`);
  return html.slice(0, scriptIdx) + tag + '\n    ' + html.slice(scriptIdx);
}

// Заменяет внутренность <div id="root">…</div> на SSR-разметку, не трогая head и скрипты.
function swapRootBody(html, bodyHtml) {
  const openTag = '<div id="root">';
  const openIdx = html.indexOf(openTag);
  if (openIdx === -1) return html;
  const afterOpen = openIdx + openTag.length;
  const scriptIdx = html.indexOf('<script', afterOpen);
  const closeIdx = html.lastIndexOf('</div>', scriptIdx === -1 ? html.length : scriptIdx);
  if (closeIdx === -1 || closeIdx < afterOpen) return html;
  return html.slice(0, afterOpen) + bodyHtml + html.slice(closeIdx);
}

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

  // Загружаем SSR-рендер (ESM-бандл) для маршрутов из SSR_ROUTES
  let ssrRender = null;
  const ssrEntry = path.join(projectRoot, 'dist-server', 'entry-server.js');
  if (fs.existsSync(ssrEntry)) {
    try {
      ({ render: ssrRender } = await import(pathToFileURL(ssrEntry).href));
    } catch (e) {
      console.log(`  ⚠ SSR-модуль не загружен (fallback на puppeteer-body): ${e.message}`);
    }
  } else {
    console.log('  ⚠ dist-server/entry-server.js нет — запустите vite build --ssr. Body через puppeteer.');
  }

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

      // Для SSR-маршрутов подменяем тело #root на React-канонический HTML (чистая гидрация)
      const ssrLang = ssrLangForRoute(route);
      if (ssrRender && ssrLang) {
        try {
          const { html: ssrBody, dehydrate } = await ssrRender(route, ssrLang);
          if (ssrBody && ssrBody.length > 500) {
            html = swapRootBody(html, ssrBody);
            if (dehydrate) html = injectDehydrate(html, dehydrate);
            console.log(`    ↳ SSR body (${ssrBody.length} симв.)${dehydrate ? ' + dehydrate' : ''}`);
          }
        } catch (e) {
          console.log(`  ⚠ SSR-рендер ${route} не удался, оставляю puppeteer-body: ${e.message}`);
        }
      }

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
