#!/usr/bin/env node
// Снимок одобренных отзывов для сборки: GET /api/reviews → src/data/reviews.json.
// Пререндер кладёт их в статический HTML. Если API недоступно — остаётся прежний снимок (сборка не падает).
// REVIEWS_URL — переопределить источник (по умолчанию прод).
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'src', 'data', 'reviews.json');
const url = process.env.REVIEWS_URL || 'https://pavellevdin.ru/api/reviews';

(async () => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { reviews } = await res.json();
    if (!Array.isArray(reviews)) throw new Error('нет массива reviews');
    fs.writeFileSync(out, JSON.stringify(reviews, null, 2) + '\n');
    console.log(`✓ Отзывы: ${reviews.length} одобренных → src/data/reviews.json`);
  } catch (e) {
    if (!fs.existsSync(out)) fs.writeFileSync(out, '[]\n');
    console.log(`⚠ Отзывы не обновлены (${e.message}) — оставлен прежний снимок`);
  }
})();
