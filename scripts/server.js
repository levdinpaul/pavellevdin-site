const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { reloadEnv, getEnv } = require('./lib/env');

// Load env on startup
reloadEnv();

const app = express();
const isProd = getEnv('NODE_ENV', 'development') === 'production';

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow localhost in dev and the production domain
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'https://pavellevdin.ru', 'http://pavellevdin.ru'];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Security headers (базовая защита без внешних зависимостей)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(express.json({ limit: '50mb' }));

// Routes
// Блог, кабинет и админка переехали на pl-platform (Next.js, тот же домен) — старый FTP/HostLand-пайплайн
// (auth/stats/articles/social/pipeline/publications/settings/buffer/media) удалён. Здесь остаются лиды и отзывы.
const leadRoutes = require('./routes/lead');
const reviewRoutes = require('./routes/reviews');
const fxRoutes = require('./routes/fx');

// Public routes
app.use('/api/lead', leadRoutes);
app.use('/api/fx', fxRoutes); // курс EUR/RUB ЦБ РФ для цен de/en (кэш сутки)
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
    app.use(express.static(staticDir, { redirect: false }));
    // SPA fallback. Известные маршруты SPA — 200, остальное — 404 (SPA покажет страницу «не найдено», без soft-404).
    const SPA_ROUTE = /^\/(?:review\/[^/]+|(?:ru|de|en)(?:\/(?:about|portfolio|services|brief|calculator|business-card|contact|imprint|privacy|review\/[^/]+))?)?\/?$/;
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
