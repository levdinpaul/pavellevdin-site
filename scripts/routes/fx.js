/**
 * GET /api/fx — курс EUR/RUB ЦБ РФ для пересчёта цен на de/en без пересборки сайта.
 * Обновление не чаще раза в сутки; кэш в памяти + scripts/fx-cache.json (НЕ scripts/data/).
 * Фолбэк: если ЦБ недоступен — отдаём последний сохранённый курс; повторная попытка не чаще раза в час.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { fetchCbrEur, isFxRate } = require('../lib/fx.js');

const router = express.Router();
const CACHE_FILE = path.join(__dirname, '..', 'fx-cache.json');
const DAY = 24 * 60 * 60 * 1000;
const RETRY = 60 * 60 * 1000;

function readCache() {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    return isFxRate(data) ? data : null;
  } catch {
    return null;
  }
}

let current = readCache();
let lastAttempt = 0;
let inflight = null;

function isFresh(rate) {
  const ts = rate && Date.parse(rate.fetchedAt);
  return Boolean(ts) && Date.now() - ts < DAY;
}

async function getRate() {
  if (isFresh(current) || Date.now() - lastAttempt < RETRY) return current;
  if (!inflight) {
    lastAttempt = Date.now();
    inflight = fetchCbrEur()
      .then((rate) => {
        current = rate;
        try {
          fs.writeFileSync(CACHE_FILE, JSON.stringify(rate, null, 2) + '\n');
        } catch (e) {
          console.warn('fx: не удалось записать кэш —', e.message);
        }
        return rate;
      })
      .catch((e) => {
        console.warn('fx: курс ЦБ не обновлён —', e.message);
        return current;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

router.get('/', async (req, res) => {
  const rate = await getRate();
  if (!rate) return res.status(503).json({ error: 'Курс временно недоступен' });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({ eurRub: rate.eurRub, date: rate.date, fetchedAt: rate.fetchedAt });
});

module.exports = router;
