const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sendTelegramMessage } = require('../lib/telegram');
const { createRateLimiter, clientIp } = require('../lib/rate-limit');
const { authMiddleware } = require('../middleware/auth');

// Отзывы хранятся на РФ-сервере рядом с лидами. Публично отдаются только одобренные (status: approved).
const DATA_DIR = path.join(__dirname, '..', 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
// Персональные ссылки /review/<token>: токен → проект. Файл — часть кода (scripts/), не данных.
const TOKENS_FILE = path.join(__dirname, '..', 'review-tokens.json');

const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 3 });

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
function findToken(token) {
  const { tokens = [] } = readJson(TOKENS_FILE, {});
  return tokens.find((t) => t.token === token) || null;
}

/** Публичное представление: без IP, контактов и служебных полей. */
function publicView(r) {
  return {
    id: r.id, project: r.project || '', name: r.name, role: r.role, company: r.company,
    text: r.text, rating: r.rating || null, lang: r.lang, verified: Boolean(r.verified), date: r.approvedAt || r.createdAt,
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
publicRouter.post('/review', limiter, async (req, res) => {
  const b = req.body || {};
  if (b.company_website) return res.json({ ok: true }); // honeypot
  if (!b.consentPublish || !b.consent) return res.status(400).json({ error: 'Требуется согласие на публикацию и обработку данных' });
  const name = clip(b.name, 120);
  const text = clip(b.text, 3000);
  if (!name || text.length < 20) return res.status(400).json({ error: 'Укажите имя и текст отзыва (от 20 символов)' });

  const token = b.token ? findToken(clip(b.token, 64)) : null;
  const rating = Number(b.rating);
  const review = {
    id: crypto.randomBytes(8).toString('hex'),
    status: 'pending',
    verified: Boolean(token),
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
      `⭐ <b>Новый отзыв на модерации</b>${review.verified ? ' (проверенный клиент)' : ''}`,
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
adminRouter.use(authMiddleware);

adminRouter.get('/', (req, res) => {
  const { tokens = [] } = readJson(TOKENS_FILE, {});
  res.json({ reviews: readReviews().slice().reverse(), tokens });
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
  for (const [key, max] of [['name', 120], ['role', 120], ['company', 160], ['text', 3000], ['project', 80]]) {
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
