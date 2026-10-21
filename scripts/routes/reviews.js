const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sendTelegramMessage } = require('../lib/telegram');
const { createRateLimiter, clientIp } = require('../lib/rate-limit');
const { authMiddleware } = require('../middleware/auth');
const { isPlatformRequest } = require('../lib/platform');

// Отзывы хранятся на РФ-сервере рядом с лидами. Публично отдаются только одобренные (status: approved).
const DATA_DIR = path.join(__dirname, '..', 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
// Персональные ссылки /review/<token>: токен → проект. Файл — часть кода (scripts/), не данных.
const TOKENS_FILE = path.join(__dirname, '..', 'review-tokens.json');

const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 3 });
// Открытая форма (без личной ссылки) — не больше 3 отзывов в сутки с IP
const openLimiter = createRateLimiter({ windowMs: 24 * 60 * 60 * 1000, max: 3 });
const MIN_FILL_MS = 5000;
// Откуда отзыв: сайт (по ссылке), открытая форма, площадки (вносит Pavel из админки)
const SOURCES = ['site', 'open', 'kwork', 'flru', 'habr', 'google', 'yandex', 'other'];
const IMPORT_SOURCES = SOURCES.filter((x) => x !== 'site' && x !== 'open');

const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function readReviews() { return readJson(REVIEWS_FILE, []); }
function writeReviews(list) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${REVIEWS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, REVIEWS_FILE);
}
function readTokens() { return readJson(TOKENS_FILE, { tokens: [] }); }
function findToken(token) {
  return (readTokens().tokens || []).find((t) => t.token === token) || null;
}
/** Запись токенов — с бэкапом прежнего файла рядом (review-tokens.json.bak-<время>). */
function writeTokens(data) {
  if (fs.existsSync(TOKENS_FILE)) fs.copyFileSync(TOKENS_FILE, `${TOKENS_FILE}.bak-${Date.now()}`);
  const tmp = `${TOKENS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, TOKENS_FILE);
}
const newToken = () => crypto.randomBytes(12).toString('base64url');
const countLinks = (text) => (String(text).match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(ru|com|de|net|org|io)\b/gi) || []).length;

/** Публичное представление: без IP, контактов и служебных полей. */
function publicView(r) {
  return {
    id: r.id, project: r.project || '', name: r.name, role: r.role, company: r.company,
    text: r.text, rating: r.rating || null, lang: r.lang, verified: Boolean(r.verified), date: r.reviewDate || r.approvedAt || r.createdAt,
    source: r.source || (r.verified ? 'site' : 'open'), sourceUrl: r.sourceUrl || undefined,
  };
}

const publicRouter = express.Router();
const adminRouter = express.Router();

// GET /api/reviews — только одобренные (для сайта и сборки)
publicRouter.get('/reviews', (req, res) => {
  const list = readReviews().filter((r) => r.status === 'approved').map(publicView);
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({ reviews: list });
});

// GET /api/review-token/:token — проект для персональной ссылки
publicRouter.get('/review-token/:token', (req, res) => {
  const t = findToken(clip(req.params.token, 64));
  if (!t) return res.status(404).json({ error: 'Ссылка недействительна' });
  res.json({ project: t.project, title: t.title });
});

// POST /api/review — форма отзыва. Согласие на публикацию и на обработку ПДн обязательны.
// Без личной ссылки — дополнительный суточный лимит открытой формы
const reviewLimit = (req, res, next) => (req.body && req.body.token ? next() : openLimiter(req, res, next));

publicRouter.post('/review', limiter, reviewLimit, async (req, res) => {
  const b = req.body || {};
  if (b.company_website) return res.json({ ok: true }); // honeypot
  // Заполнено быстрее 5 с — бот; отвечаем ok, ничего не сохраняем
  if (Number(b.startedAt) && Date.now() - Number(b.startedAt) < MIN_FILL_MS) return res.json({ ok: true });
  if (!b.consentPublish || !b.consent) return res.status(400).json({ error: 'Требуется согласие на публикацию и обработку данных' });
  const name = clip(b.name, 120);
  const text = clip(b.text, 3000);
  if (!name || text.length < 20) return res.status(400).json({ error: 'Укажите имя и текст отзыва (от 20 символов)' });
  if (countLinks(text) > 1) return res.status(400).json({ error: 'links' });

  const token = b.token ? findToken(clip(b.token, 64)) : null;
  if (b.token && !token) return res.status(404).json({ error: 'Ссылка недействительна' });
  const rating = Number(b.rating);
  const review = {
    id: crypto.randomBytes(8).toString('hex'),
    status: 'pending',
    verified: Boolean(token),
    source: token ? 'site' : 'open',
    project: token ? token.project : clip(b.project, 80),
    name,
    role: clip(b.role, 120),
    company: clip(b.company, 160),
    text,
    rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null,
    contact: clip(b.contact, 200),
    lang: clip(b.lang, 5) || 'ru',
    consentPublish: true,
    consent: true,
    ip: clientIp(req),
    createdAt: new Date().toISOString(),
  };

  try {
    const list = readReviews();
    list.push(review);
    writeReviews(list);
  } catch (err) {
    console.error('Не удалось сохранить отзыв:', err.message);
    return res.status(500).json({ error: 'Не удалось сохранить отзыв' });
  }

  try {
    await sendTelegramMessage([
      `⭐ <b>Новый отзыв на модерации</b> — ${review.verified ? 'по личной ссылке (проверенный клиент)' : 'открытая форма'}`,
      `👤 ${esc(review.name)}${review.company ? ` · ${esc(review.company)}` : ''}`,
      review.project && `📁 ${esc(review.project)}`,
      `📝 ${esc(review.text.slice(0, 600))}`,
    ].filter(Boolean).join('\n'));
  } catch (err) {
    console.error('Не удалось отправить отзыв в Telegram:', err.message);
  }
  res.json({ ok: true });
});

// ── Модерация (админка) ──
// Старая админка (JWT) или сервер платформы (модерация в /ru/admin/reviews pl-platform)
adminRouter.use((req, res, next) => (isPlatformRequest(req) ? next() : authMiddleware(req, res, next)));

adminRouter.get('/', (req, res) => {
  const reviews = readReviews();
  // К каждой ссылке — сколько отзывов по проекту и когда ссылку последний раз копировали для клиента
  const tokens = (readTokens().tokens || []).map((t) => ({
    ...t,
    received: reviews.filter((r) => r.project === t.project).length,
    approved: reviews.filter((r) => r.project === t.project && r.status === 'approved').length,
  }));
  res.json({ reviews: reviews.slice().reverse(), tokens });
});

// POST /tokens/:project/sent — «Скопировать ссылку» в админке: дата последней отправки
adminRouter.post('/tokens/:project/sent', (req, res) => {
  const data = readTokens();
  const t = (data.tokens || []).find((x) => x.project === req.params.project);
  if (!t) return res.status(404).json({ error: 'Нет ссылки для проекта' });
  t.lastSentAt = new Date().toISOString();
  writeTokens(data);
  res.json({ token: t });
});

// POST /tokens/:project/rotate — перевыпуск: старая ссылка перестаёт работать. Нет записи — создаётся (проект вне портфолио).
adminRouter.post('/tokens/:project/rotate', (req, res) => {
  const project = clip(req.params.project, 80).replace(/[^a-z0-9-]/gi, '');
  if (!project) return res.status(400).json({ error: 'project' });
  const data = readTokens();
  data.tokens = data.tokens || [];
  let t = data.tokens.find((x) => x.project === project);
  if (!t) { t = { project, title: clip(req.body && req.body.title, 120) || project }; data.tokens.push(t); }
  t.token = newToken();
  t.createdAt = new Date().toISOString().slice(0, 10);
  delete t.lastSentAt;
  writeTokens(data);
  res.json({ token: t });
});

// POST /import — отзыв с площадки (Kwork, FL.ru, Google…): вносит Pavel, сразу опубликован, без бейджа «проверенный клиент»
adminRouter.post('/import', (req, res) => {
  const b = req.body || {};
  const source = IMPORT_SOURCES.includes(b.source) ? b.source : null;
  const name = clip(b.name, 120);
  const text = clip(b.text, 3000);
  const sourceUrl = /^https:\/\//.test(String(b.sourceUrl || '')) ? clip(b.sourceUrl, 500) : '';
  if (!source || !name || text.length < 10) return res.status(400).json({ error: 'source, name, text' });
  const rating = Number(b.rating);
  const now = new Date().toISOString();
  const date = /^\d{4}-\d{2}-\d{2}/.test(String(b.date || '')) ? String(b.date).slice(0, 10) : now.slice(0, 10);
  const review = {
    id: crypto.randomBytes(8).toString('hex'), status: 'approved', verified: false, source, sourceUrl,
    project: clip(b.project, 80), name, role: clip(b.role, 120), company: clip(b.company, 160), text,
    rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null, lang: clip(b.lang, 5) || 'ru',
    reviewDate: date, createdAt: now, approvedAt: now,
  };
  const list = readReviews();
  list.push(review);
  writeReviews(list);
  res.json({ review });
});

adminRouter.patch('/:id', (req, res) => {
  const list = readReviews();
  const review = list.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
  const b = req.body || {};
  if (['pending', 'approved', 'rejected'].includes(b.status)) {
    review.status = b.status;
    if (b.status === 'approved') review.approvedAt = new Date().toISOString();
  }
  for (const [key, max] of [['name', 120], ['role', 120], ['company', 160], ['text', 3000], ['project', 80], ['sourceUrl', 500]]) {
    if (typeof b[key] === 'string') review[key] = clip(b[key], max);
  }
  review.updatedAt = new Date().toISOString();
  writeReviews(list);
  res.json({ review });
});

adminRouter.delete('/:id', (req, res) => {
  const list = readReviews();
  const next = list.filter((r) => r.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: 'Отзыв не найден' });
  writeReviews(next);
  res.json({ ok: true });
});

module.exports = { publicRouter, adminRouter };
