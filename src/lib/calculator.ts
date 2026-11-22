/**
 * Калькулятор стоимости проекта — ОБЩИЙ модуль сайта и платформы.
 *
 * ДЕРЖАТЬ В СИНХРОНЕ (файлы побайтно одинаковые):
 *   - сайт      D:\Сайты\Портфолио\src\lib\calculator.ts   + src/data/pricing.json
 *   - платформа D:\Сайты\pl-platform\web\src\lib\calculator.ts + web/src/data/pricing.json
 *
 * Прайс — только pricing.json (секция `calculator` + цены пакетов `packages[].price.ru`), всё в рублях.
 * Модель: «от» = цена позиции, «до» = цена × spread; позиции округляются до roundTo ₽;
 * срочность — надбавка (factor − 1) к сумме позиций и сжатие срока (weeksFactor).
 * € для de/en — convertToEur() по курсу ЦБ РФ (та же формула, что rubToEur сайта: округление до 10 €).
 * Сервер платформы ПЕРЕСЧИТЫВАЕТ результат сам по входу (parseCalcInput → calculate), цифрам браузера не верит.
 * Чистый модуль: без I/O, без React — работает в браузере, SSR и Node.
 */
import pricing from '@/data/pricing.json';

export type CalcLang = 'ru' | 'de' | 'en';
export type CalcLabel = Record<CalcLang, string>;
export type CalcUnit = 'flat' | 'page' | 'language' | 'percent';

interface RawPackage {
  id: string;
  price: { ru: number };
  copy: Record<CalcLang, { title: string; duration?: string }>;
}
interface RawProject {
  id: string;
  package: string;
  pagesIncluded: number;
  pagesMax: number;
  extraPage: number;
  weeks: number[];
  includes: string[];
}
interface RawOption {
  id: string;
  unit?: string;
  package?: string;
  price: number;
  max?: number;
  weeks: number;
  label: CalcLabel;
  hint: CalcLabel;
}
interface RawCalculator {
  spread: number;
  roundTo: number;
  extraPagesPerWeek: number;
  projects: RawProject[];
  options: RawOption[];
  urgent: { factor: number; weeksFactor: number; label: CalcLabel; hint: CalcLabel };
  labels: { extraPages: CalcLabel; extraScreens: CalcLabel };
}

const RAW = pricing as unknown as { packages: RawPackage[]; calculator: RawCalculator };
const CFG = RAW.calculator;

export interface CalcProject {
  id: string;
  label: CalcLabel;
  duration: CalcLabel;
  /** База «от», ₽ — цена пакета из packages[]. */
  base: number;
  pagesIncluded: number;
  pagesMax: number;
  /** ₽ за страницу/экран сверх включённых. */
  extraPage: number;
  weeks: [number, number];
  /** Опции, уже входящие в базу (цена 0). */
  includes: string[];
}

export interface CalcOption {
  id: string;
  /** language — количественная опция (0..max), остальные — да/нет. */
  unit: 'flat' | 'language';
  price: number;
  max: number;
  weeks: number;
  label: CalcLabel;
  hint: CalcLabel;
}

const pkg = (id: string) => RAW.packages.find((p) => p.id === id);
const copyField = (p: RawPackage | undefined, field: 'title' | 'duration', fallback: string): CalcLabel => ({
  ru: p?.copy.ru?.[field] ?? fallback,
  de: p?.copy.de?.[field] ?? p?.copy.ru?.[field] ?? fallback,
  en: p?.copy.en?.[field] ?? p?.copy.ru?.[field] ?? fallback,
});

export const CALC_PROJECTS: readonly CalcProject[] = CFG.projects.map((p) => {
  const pk = pkg(p.package);
  return {
    id: p.id,
    label: copyField(pk, 'title', p.id),
    duration: copyField(pk, 'duration', ''),
    base: pk?.price.ru ?? 0,
    pagesIncluded: p.pagesIncluded,
    pagesMax: Math.max(p.pagesIncluded, p.pagesMax),
    extraPage: p.extraPage,
    weeks: [p.weeks[0] ?? 1, p.weeks[1] ?? p.weeks[0] ?? 1],
    includes: p.includes ?? [],
  };
});

export const CALC_OPTIONS: readonly CalcOption[] = CFG.options.map((o) => ({
  id: o.id,
  unit: o.unit === 'language' ? 'language' : 'flat',
  price: (o.package ? pkg(o.package)?.price.ru : undefined) ?? o.price,
  max: o.unit === 'language' ? Math.max(1, o.max ?? 1) : 1,
  weeks: o.weeks,
  label: o.label,
  hint: o.hint,
}));

export const CALC_URGENT = CFG.urgent;
export const CALC_SPREAD = CFG.spread;

export const calcLang = (lang: unknown): CalcLang => (lang === 'de' || lang === 'en' ? lang : 'ru');
export const calcText = (label: CalcLabel, lang: unknown) => label[calcLang(lang)] || label.ru;
export const getCalcProject = (id: string) => CALC_PROJECTS.find((p) => p.id === id);

/** Вход калькулятора (то, что выбирает клиент). Цифр нет — только выбор. */
export interface CalcInput {
  project: string;
  /** Всего страниц (экранов для web-app). */
  pages: number;
  /** Дополнительных языков, 0..max. */
  languages: number;
  /** id опций «да/нет»: cms, blog, crm, telegram, ai, seo. */
  options: string[];
  urgent: boolean;
}

export interface CalcLine {
  key: string;
  label: CalcLabel;
  qty: number;
  unit: CalcUnit;
  priceMin: number;
  priceMax: number;
  /** Входит в базу проекта — 0 ₽. */
  included?: boolean;
}

export interface CalcResult {
  input: CalcInput;
  currency: 'RUB' | 'EUR';
  /** Курс ЦБ, если пересчитано в € (convertToEur). */
  fx?: { eurRub: number; date: string };
  min: number;
  max: number;
  weeksMin: number;
  weeksMax: number;
  breakdown: CalcLine[];
}

const clampInt = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

/** Разбор недоверенного входа (браузер, localStorage, API). null — неизвестный тип проекта. */
export function parseCalcInput(raw: unknown): CalcInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const project = getCalcProject(String(r.project ?? ''));
  if (!project) return null;
  const langOpt = CALC_OPTIONS.find((o) => o.unit === 'language');
  const flagIds = new Set(CALC_OPTIONS.filter((o) => o.unit === 'flat').map((o) => o.id));
  const options = Array.isArray(r.options)
    ? Array.from(new Set(r.options.map(String).filter((id) => flagIds.has(id)))).sort()
    : [];
  return {
    project: project.id,
    pages: clampInt(r.pages, project.pagesIncluded, project.pagesMax, project.pagesIncluded),
    languages: langOpt ? clampInt(r.languages, 0, langOpt.max, 0) : 0,
    options,
    urgent: r.urgent === true,
  };
}

/** Стартовый вход для типа проекта (опции, входящие в пакет, отмечены). */
export function defaultCalcInput(projectId: string = CALC_PROJECTS[0]?.id ?? 'landing'): CalcInput {
  const includes = getCalcProject(projectId)?.includes ?? [];
  return parseCalcInput({ project: projectId, options: includes }) ?? { project: projectId, pages: 1, languages: 0, options: [], urgent: false };
}

function roundTo(v: number) {
  const step = CFG.roundTo > 0 ? CFG.roundTo : 1;
  return Math.round(v / step) * step;
}

/** Расчёт в рублях. Вход нормализуется (parseCalcInput); неизвестный тип → null. */
export function calculate(rawInput: unknown): CalcResult | null {
  const input = parseCalcInput(rawInput);
  if (!input) return null;
  const project = getCalcProject(input.project)!;
  const lines: CalcLine[] = [];
  const line = (key: string, label: CalcLabel, qty: number, unit: CalcUnit, priceRub: number, included = false) =>
    lines.push({
      key,
      label,
      qty,
      unit,
      priceMin: included ? 0 : roundTo(priceRub),
      priceMax: included ? 0 : roundTo(priceRub * CFG.spread),
      ...(included ? { included: true } : {}),
    });

  let weeksMin = project.weeks[0];
  let weeksMax = project.weeks[1];

  line(`project:${project.id}`, project.label, 1, 'flat', project.base);

  const extraPages = Math.max(0, input.pages - project.pagesIncluded);
  if (extraPages > 0 && project.extraPage > 0) {
    const label = (project.id === 'web-app' || project.id === 'mobile-app' || project.id === 'pwa') ? CFG.labels.extraScreens : CFG.labels.extraPages;
    line('pages', label, extraPages, 'page', extraPages * project.extraPage);
    const w = Math.ceil(extraPages / Math.max(1, CFG.extraPagesPerWeek));
    weeksMin += w;
    weeksMax += w;
  }

  for (const opt of CALC_OPTIONS) {
    if (opt.unit === 'language') {
      if (input.languages > 0) {
        line(`option:${opt.id}`, opt.label, input.languages, 'language', input.languages * opt.price);
        weeksMin += opt.weeks * input.languages;
        weeksMax += opt.weeks * input.languages;
      }
      continue;
    }
    if (!input.options.includes(opt.id)) continue;
    const included = project.includes.includes(opt.id);
    line(`option:${opt.id}`, opt.label, 1, 'flat', opt.price, included);
    if (!included) {
      weeksMin += opt.weeks;
      weeksMax += opt.weeks;
    }
  }

  const subMin = lines.reduce((s, l) => s + l.priceMin, 0);
  const subMax = lines.reduce((s, l) => s + l.priceMax, 0);
  if (input.urgent) {
    const k = Math.max(0, CFG.urgent.factor - 1);
    lines.push({
      key: 'urgent',
      label: CFG.urgent.label,
      qty: Math.round(k * 100),
      unit: 'percent',
      priceMin: roundTo(subMin * k),
      priceMax: roundTo(subMax * k),
    });
    weeksMin *= CFG.urgent.weeksFactor;
    weeksMax *= CFG.urgent.weeksFactor;
  }

  const wMin = Math.max(1, Math.round(weeksMin));
  const wMax = Math.max(wMin, Math.ceil(weeksMax - 1e-9));
  return {
    input,
    currency: 'RUB',
    min: lines.reduce((s, l) => s + l.priceMin, 0),
    max: lines.reduce((s, l) => s + l.priceMax, 0),
    weeksMin: wMin,
    weeksMax: wMax,
    breakdown: lines,
  };
}

/** ₽ → € по курсу ЦБ, округление до 10 € (минимум 10 €; 0 остаётся 0). Формула = rubToEur сайта. */
export function rubToEurAt(rub: number, eurRub: number) {
  if (!rub) return 0;
  return Math.max(10, Math.round(rub / eurRub / 10) * 10);
}

/** Пересчёт рублёвого результата в € (каждая позиция отдельно, итог = сумма позиций). */
export function convertToEur(result: CalcResult, fx: { eurRub: number; date: string }): CalcResult {
  if (result.currency === 'EUR') return result;
  const breakdown = result.breakdown.map((l) => ({
    ...l,
    priceMin: rubToEurAt(l.priceMin, fx.eurRub),
    priceMax: rubToEurAt(l.priceMax, fx.eurRub),
  }));
  return {
    ...result,
    currency: 'EUR',
    fx: { eurRub: fx.eurRub, date: fx.date },
    breakdown,
    min: breakdown.reduce((s, l) => s + l.priceMin, 0),
    max: breakdown.reduce((s, l) => s + l.priceMax, 0),
  };
}

/** Расчёт в валюте языка: ru — ₽, de/en — € по курсу. */
export function calculateFor(lang: unknown, rawInput: unknown, fx: { eurRub: number; date: string }): CalcResult | null {
  const rub = calculate(rawInput);
  if (!rub) return null;
  return calcLang(lang) === 'ru' ? rub : convertToEur(rub, fx);
}
