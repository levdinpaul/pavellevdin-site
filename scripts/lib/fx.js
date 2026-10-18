/**
 * Курс EUR/RUB ЦБ РФ через зеркало cbr-xml-daily.ru (официальный курс, JSON).
 * Общий модуль: сборка (scripts/fetch-cbr-rate.cjs) и бэкенд (routes/fx.js → GET /api/fx).
 * Без внешних зависимостей — глобальный fetch (Node 18+).
 */
const CBR_URL = process.env.CBR_URL || 'https://www.cbr-xml-daily.ru/daily_json.js';

/** { eurRub, date: 'YYYY-MM-DD', fetchedAt: ISO } — валидный ли объект курса. */
function isFxRate(x) {
  return Boolean(
    x &&
      typeof x.eurRub === 'number' &&
      Number.isFinite(x.eurRub) &&
      x.eurRub > 10 &&
      x.eurRub < 1000 &&
      typeof x.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(x.date),
  );
}

/** Запрос свежего курса. Бросает ошибку, если сеть/ответ невалидны — фолбэк решает вызывающий. */
async function fetchCbrEur({ timeoutMs = 8000 } = {}) {
  const res = await fetch(CBR_URL, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const eur = json && json.Valute && json.Valute.EUR;
  if (!eur || !eur.Value || !eur.Nominal) throw new Error('нет EUR в ответе');
  const rate = {
    eurRub: Math.round((eur.Value / eur.Nominal) * 10000) / 10000,
    date: String(json.Date || '').slice(0, 10),
    fetchedAt: new Date().toISOString(),
  };
  if (!isFxRate(rate)) throw new Error('невалидный курс');
  return rate;
}

module.exports = { CBR_URL, isFxRate, fetchCbrEur };
