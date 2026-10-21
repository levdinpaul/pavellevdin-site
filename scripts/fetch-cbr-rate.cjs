#!/usr/bin/env node
// Курс EUR/RUB ЦБ РФ для сборки: cbr-xml-daily.ru → src/data/fx-rate.json ({ eurRub, date, fetchedAt }).
// Пререндер и клиент читают один и тот же json → HTML de/en одинаков при SSR и гидрации.
// Если сеть недоступна — остаётся прежний файл (фолбэк = последний сохранённый курс), сборка не падает.
const fs = require('fs');
const path = require('path');
const { fetchCbrEur, isFxRate } = require('./lib/fx.js');

const out = path.join(__dirname, '..', 'src', 'data', 'fx-rate.json');

function readPrev() {
  try {
    const prev = JSON.parse(fs.readFileSync(out, 'utf8'));
    return isFxRate(prev) ? prev : null;
  } catch {
    return null;
  }
}

(async () => {
  const prev = readPrev();
  try {
    const rate = await fetchCbrEur();
    fs.writeFileSync(out, JSON.stringify(rate, null, 2) + '\n');
    console.log(`✓ Курс ЦБ: 1 € = ${rate.eurRub} ₽ на ${rate.date} → src/data/fx-rate.json`);
  } catch (e) {
    if (prev) {
      console.log(`⚠ Курс ЦБ не обновлён (${e.message}) — оставлен прежний: ${prev.eurRub} ₽ на ${prev.date}`);
    } else {
      console.error(`✗ Курс ЦБ недоступен (${e.message}) и сохранённого курса нет — нужен src/data/fx-rate.json`);
      process.exit(1);
    }
  }
})();
