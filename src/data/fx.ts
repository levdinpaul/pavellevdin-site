import { useEffect, useState } from 'react';
import buildFx from './fx-rate.json';

/**
 * Курс EUR/RUB ЦБ РФ для пересчёта цен на de/en.
 * Первая отрисовка (SSR-пререндер и гидрация) — всегда по fx-rate.json из сборки (scripts/fetch-cbr-rate.cjs),
 * чтобы HTML совпадал. После гидрации на de/en подтягиваем свежий курс с бэкенда (GET /api/fx, кэш сутки).
 * Нет сети / нет бэкенда (dev, preview:static) — остаётся курс сборки.
 */
export interface FxRate {
  eurRub: number;
  date: string; // YYYY-MM-DD — дата курса ЦБ
  fetchedAt?: string;
}

export const BUILD_FX: FxRate = buildFx;

function isFxRate(x: unknown): x is FxRate {
  const r = x as FxRate | null;
  return Boolean(r && typeof r.eurRub === 'number' && r.eurRub > 10 && r.eurRub < 1000 && typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
}

let pending: Promise<FxRate | null> | null = null;

/** Один запрос на вкладку; невалидный/старее сборки ответ игнорируется. */
function loadFreshFx(): Promise<FxRate | null> {
  pending ??= fetch('/api/fx', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: unknown) => (isFxRate(j) && j.date >= BUILD_FX.date ? j : null))
    .catch(() => null);
  return pending;
}

export function useFxRate(lang: string): FxRate {
  const [fx, setFx] = useState<FxRate>(BUILD_FX);
  useEffect(() => {
    if (lang === 'ru') return;
    let alive = true;
    loadFreshFx().then((fresh) => {
      if (alive && fresh && (fresh.eurRub !== BUILD_FX.eurRub || fresh.date !== BUILD_FX.date)) setFx(fresh);
    });
    return () => {
      alive = false;
    };
  }, [lang]);
  return fx;
}
