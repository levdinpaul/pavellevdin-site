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
// Блог больше не на сайте — его отдаёт pl-platform (nginx), здесь не пререндерится.
function ssrLangForRoute(route) {
  // Формы (contact/brief) безопасны: неконтролируемые нативные <form>, отправка через fetch
  // в клиентском onSubmit (после гидрации) — SSR трогает только разметку, не код заявки.
  const m = route.match(/^\/(ru|de|en)(\/|$)/);
  return m ? m[1] : null;
}

// Заменяет внутренность <div id="root">…</div> на SSR-разметку, не трогая head и скрипты.
// Парный </div> ищем счётом вложенности (содержимое <script> пропускаем): эвристика «последний </div>
// перед первым <script>» ломалась, когда внутри #root есть <script> (JSON-LD) — хвост страницы дублировался.
function findRootClose(html, from) {
  const re = /<script\b[\s\S]*?<\/script>|<div\b[^>]*>|<\/div>/gi;
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    if (tag[1] === 's' || tag[1] === 'S') continue;
    if (tag[1] === '/') { if (--depth === 0) return m.index; } else if (!tag.endsWith('/>')) depth++;
  }
  return -1;
}
function swapRootBody(html, bodyHtml) {
  const openTag = '<div id="root">';
  const openIdx = html.indexOf(openTag);
  if (openIdx === -1) return html;
  const afterOpen = openIdx + openTag.length;
  const closeIdx = findRootClose(html, afterOpen);
  if (closeIdx === -1) return html;
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
  return dedupHeadKeys(html);
}

// og:/twitter:/robots, hreflang и JSON-LD: статичные из index.html + Helmet дают по 2–3 копии — оставляем последнюю (страничную).
function dedupHeadKeys(html) {
  const headEnd = html.search(/<\/head>/i);
  if (headEnd === -1) return html;
  let head = html.slice(0, headEnd);
  const keyOf = (tag) => {
    const attr = (n) => (tag.match(new RegExp(`\\s${n}="([^"]*)"`, 'i')) || [])[1];
    if (/^<meta/i.test(tag)) { const k = attr('property') || attr('name'); return k && /^(og:|twitter:|robots$)/.test(k) ? `meta:${k}` : null; }
    if (/^<link/i.test(tag) && attr('rel') === 'alternate') { const h = attr('hreflang'); return h ? `alt:${h.toLowerCase()}` : null; }
    if (/^<script/i.test(tag)) return `ld:${tag}`;
    return null;
  };
  const re = /<meta\b[^>]*>|<link\b[^>]*>|<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi;
  const tags = head.match(re) || [];
  const last = new Map();
  tags.forEach((t, i) => { const k = keyOf(t); if (k) last.set(k, i); });
  let i = -1;
  head = head.replace(re, (t) => { i += 1; const k = keyOf(t); return k && last.get(k) !== i ? '' : t; });
  // og:image страницы (фото, скриншот) — не 1200×630: размеры оставляем только у фирменных og-image*.jpg
  if (!/property="og:image" content="[^"]*\/og-image(-de|-en)?\.(jpg|png)"/.test(head)) head = head.replace(/<meta property="og:image:(width|height)"[^>]*>/g, '');
  return head.replace(/\n\s*\n(\s*\n)+/g, '\n') + html.slice(headEnd);
}

// React 19 оставляет <title>/<meta>/<link> от Helmet прямо в SSR-теле. В head они уже есть (из puppeteer) —
// из тела убираем (это hoistable-элементы, гидрация их не сверяет), иначе по 2–3 title/description/canonical.
// JSON-LD <script> не hoistable: остаётся в теле (там он валиден и нужен гидрации), а его копию в head снимаем.
function stripHoistables(body) {
  return body
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, (t, off) => (body.lastIndexOf('<svg', off) > body.lastIndexOf('</svg>', off) ? t : ''))
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*rel="(canonical|alternate)"[^>]*>/gi, '');
}
function dropHeadLdPresentInBody(html) {
  const headEnd = html.search(/<\/head>/i);
  const body = html.slice(headEnd);
  const head = html.slice(0, headEnd)
    .replace(/\s*<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi, (t, json) => (body.includes(json) ? '' : t));
  return head + body;
}

// Посадочные страницы услуг — src/data/services-landing.json
function getServiceSlugs() {
  const f = path.join(projectRoot, 'src', 'data', 'services-landing.json');
  return fs.existsSync(f) ? Object.keys(JSON.parse(fs.readFileSync(f, 'utf8'))) : [];
}

// Слаги кейсов портфолио — из того же JSON, что читает React (src/data/portfolio.json)
function getProjectSlugs() {
  const f = path.join(projectRoot, 'src', 'data', 'portfolio.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).map((p) => p.slug) : [];
}

async function run() {
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    console.error('❌ dist/index.html не найден. Сначала запустите vite build.');
    process.exit(1);
  }

  // Все локали: ru — фаза 1, de/en — тоже отдаём готовым HTML (свои title/canonical/hreflang вместо оболочки index.html)
  const pages = ['', '/about', '/services', '/portfolio', '/contact', '/brief', '/calculator', '/business-card', '/imprint', '/privacy'];
  for (const slug of getProjectSlugs()) pages.push(`/portfolio/${slug}`);
  for (const slug of getServiceSlugs()) pages.push(`/services/${slug}`);
  const routes = ['ru', 'de', 'en'].flatMap((l) => pages.map((p) => `/${l}${p}`));

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
      // data-scene ставит inline-скрипт в браузере пререндера; в статике его выставит тот же скрипт у посетителя.
      html = html.replace(/(<html[^>]*?)\s+data-scene="live"/, '$1');
      // Заменяем origin пререндер-сервера на боевой домен (утечки в canonical/og:url и т.п.)
      html = html.split(`http://localhost:${PORT}`).join('https://pavellevdin.ru');

      // Для SSR-маршрутов подменяем тело #root на React-канонический HTML (чистая гидрация)
      const ssrLang = ssrLangForRoute(route);
      if (ssrRender && ssrLang) {
        try {
          const { html: ssrBody } = await ssrRender(route, ssrLang);
          if (ssrBody && ssrBody.length > 500) {
            html = dropHeadLdPresentInBody(swapRootBody(html, stripHoistables(ssrBody)));
            console.log(`    ↳ SSR body (${ssrBody.length} симв.)`);
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
