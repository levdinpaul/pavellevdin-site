const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { reloadEnv, getEnv } = require('./lib/env');

// Load env on startup
reloadEnv();

const app = express();
// Не раскрываем стек в заголовках (аудит): без X-Powered-By: Express
app.disable('x-powered-by');
const isProd = getEnv('NODE_ENV', 'development') === 'production';

// sha256 — инлайн-скрипт сцены в index.html (data-scene); при правке скрипта пересчитать.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'sha256-qY1jbOnafSaXD5lmQh/1RaTB1LOJbkCSfzCkM5Q3Zg0=' https://mc.yandex.ru https://yastatic.net https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  'frame-src https://mc.yandex.ru https://mc.yandex.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'report-uri /api/csp-report',
].join('; ');

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow localhost in dev and the production domain
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'https://pavellevdin.ru', 'http://pavellevdin.ru'];
    if (allowed.includes(origin)) return callback(null, true);
    // Чужой origin — просто без CORS-заголовков (браузер сам заблокирует чтение ответа); не 500, иначе ломается статика
    callback(null, false);
  },
  credentials: true,
}));

// Security headers (базовая защита без внешних зависимостей)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // HSTS — как у платформы на том же домене (TLS терминирует nginx)
  if (isProd) res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // CSP пока Report-Only: нарушения копятся в логе контейнера (/api/csp-report), после проверки — включить строгий режим
  res.setHeader('Content-Security-Policy-Report-Only', CSP);
  next();
});

// CSP-отчёты браузеров → лог (без ПДн: только директива и источник), не чаще 200 записей в час
let cspBudget = 200;
setInterval(() => { cspBudget = 200; }, 60 * 60 * 1000).unref();
app.post('/api/csp-report', express.json({ type: ['application/csp-report', 'application/reports+json', 'application/json'], limit: '20kb' }), (req, res) => {
  if (cspBudget > 0) {
    cspBudget -= 1;
    const items = Array.isArray(req.body) ? req.body.map((r) => r.body || {}) : [req.body?.['csp-report'] || {}];
    for (const r of items) {
      const directive = r['violated-directive'] || r.effectiveDirective || r['effective-directive'];
      const blocked = r['blocked-uri'] || r.blockedURL;
      const page = String(r['document-uri'] || r.documentURL || '').replace(/[?#].*$/, '');
      console.warn('[csp]', directive, blocked, page);
    }
  }
  res.status(204).end();
});

app.use(express.json({ limit: '50mb' }));

// Routes
// Блог, кабинет и админка переехали на pl-platform (Next.js, тот же домен) — старый FTP/HostLand-пайплайн
// (auth/stats/articles/social/pipeline/publications/settings/buffer/media) удалён. Здесь остаются лиды и отзывы.
const leadRoutes = require('./routes/lead');
const reviewRoutes = require('./routes/reviews');
const fxRoutes = require('./routes/fx');
const auditRoutes = require('./routes/audit');

// Public routes
app.use('/api/lead', leadRoutes);
app.use('/api/fx', fxRoutes); // курс EUR/RUB ЦБ РФ для цен de/en (кэш сутки)
app.use('/api/audit', auditRoutes); // бесплатный экспресс-аудит сайта (выключить: AUDIT_ENABLED=false)
app.use('/api', reviewRoutes.publicRouter);
app.use('/api/admin/reviews', reviewRoutes.adminRouter);
// Тот же роутер под путём, который nginx оставляет сайту (/api/admin/* уходит платформе)
app.use('/api/site-admin/reviews', reviewRoutes.adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Продакшн: раздача статических файлов и SPA fallback
if (isProd) {
  // Устойчивый поиск папки статики: env → dist рядом с приложением → htdocs/www домена.
  // Берём первый кандидат, где реально есть index.html (чтобы рестарт не уронил сайт).
  const candidates = [
    getEnv('STATIC_DIR', ''),
    path.join(__dirname, '..', 'dist'),                        // project/app/dist
    path.join(__dirname, '..', '..', '..', 'htdocs', 'www'),   // <домен>/htdocs/www
  ].filter(Boolean);
  const staticDir = candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

  if (staticDir) {
    // Канонические URL — без слэша (canonical, hreflang, sitemap): /ru/about/ → 301 /ru/about,
    // а /ru/about отдаём пререндером dist/ru/about/index.html напрямую (express.static сам слал 301 на слэш).
    app.get(/^\/(ru|de|en)(\/.*)?\/$/, (req, res) => {
      const q = req.url.slice(req.path.length);
      res.redirect(301, req.path.replace(/\/+$/, '') + q);
    });
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (path.extname(req.path)) return next();
      const file = path.join(staticDir, req.path, 'index.html');
      if (file.startsWith(staticDir + path.sep) && fs.existsSync(file)) return res.sendFile(file);
      next();
    });
    // RFC 8615: /.well-known/* (security.txt). Общий static игнорирует dot-папки (dotfiles: 'ignore') —
    // монтируем только эту папку; внутри неё dot-файлы по-прежнему скрыты, остальные dot-файлы dist не открываются.
    app.use('/.well-known', express.static(path.join(staticDir, '.well-known'), { redirect: false }));
    app.use(express.static(staticDir, { redirect: false }));
    // SPA fallback. Известные маршруты SPA — 200, остальное — 404 (SPA покажет страницу «не найдено», без soft-404).
    const SPA_ROUTE = /^\/(?:review\/[^/]+|(?:ru|de|en)(?:\/(?:about|portfolio|services|brief|calculator|business-card|contact|imprint|privacy|review(?:\/[^/]+)?))?)?\/?$/;
    app.get('*', (req, res) => {
      const known = SPA_ROUTE.test(req.path);
      res.status(known ? 200 : 404).sendFile(path.join(staticDir, 'index.html'));
    });
    console.log(`Serving static files from: ${staticDir}`);
  } else {
    console.warn('⚠️ Папка статики не найдена. Проверены:', candidates);
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = parseInt(getEnv('ADMIN_PORT', '3001'), 10);
app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProd ? 'production' : 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
