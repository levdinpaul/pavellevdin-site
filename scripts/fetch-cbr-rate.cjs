#!/usr/bin/env node
// Курс EUR/RUB ЦБ РФ для сборки → src/data/fx-rate.json ({ eurRub, date, fetchedAt }).
// Пререндер и клиент читают один и тот же json → HTML de/en одинаков при SSR и гидрации.
// Сборка не падает без сети. Источники по порядку:
//   1) свежий курс cbr-xml-daily.ru (сохраняется и в кэш);
//   2) последний сохранённый курс — кэш вне git: .cache/fx-rate.json (FX_CACHE — другой путь);
//   3) зашитый резервный курс FALLBACK_FX из lib/fx.js (с датой) — обновлять изредка.
// В лог пишется, какой источник использован.
const fs = require('fs');
const path = require('path');
const { fetchCbrEur, isFxRate, FALLBACK_FX } = require('./lib/fx.js');

const root = path.join(__dirname, '..');
const out = path.join(root, 'src', 'data', 'fx-rate.json');
const cacheFile = process.env.FX_CACHE ? path.resolve(process.env.FX_CACHE) : path.join(root, '.cache', 'fx-rate.json');

function readRate(file) {
  try {
    const rate = JSON.parse(fs.readFileSync(file, 'utf8'));
    return isFxRate(rate) ? rate : null;
  } catch {
    return null;
  }
}

function write(file, rate) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(rate, null, 2) + '\n');
}

(async () => {
  try {
    const rate = await fetchCbrEur();
    write(out, rate);
    write(cacheFile, rate);
    console.log(`✓ Курс ЦБ (свежий): 1 € = ${rate.eurRub} ₽ на ${rate.date} → src/data/fx-rate.json`);
    return;
  } catch (e) {
    // Кэш, затем прежний src/data/fx-rate.json (если остался от прошлой сборки), затем зашитый курс.
    const candidates = [
      [readRate(cacheFile), `кэш ${path.relative(root, cacheFile)}`],
      [readRate(out), 'прежний src/data/fx-rate.json'],
    ].filter(([rate]) => rate);
    candidates.sort((a, b) => b[0].date.localeCompare(a[0].date));
    const [rate, source] = candidates[0] ?? [FALLBACK_FX, 'зашитый резервный курс (scripts/lib/fx.js)'];
    write(out, rate);
    console.warn(`⚠ Курс ЦБ недоступен (${e.message}) — использован ${source}: 1 € = ${rate.eurRub} ₽ на ${rate.date}`);
  }
})();
