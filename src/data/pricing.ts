import data from './pricing.json';
import { BUILD_FX, type FxRate } from './fx';

/**
 * Единый прайс в рублях (pricing.json → price.ru). ru-локаль — ₽, de/en — те же цены в € по курсу ЦБ РФ
 * (fx-rate.json из сборки; после гидрации — свежий курс с /api/fx, см. useFxRate). Округление до 10 €.
 */
type Lang = 'ru' | 'de' | 'en';

export interface PricePackage {
  id: string;
  group: 'project' | 'ongoing';
  featured?: boolean;
  period?: 'month' | 'hour';
  price: { ru: number };
  copy: Record<Lang, { title: string; duration?: string; points: string[] }>;
}

export const PACKAGES = data.packages as PricePackage[];

export const currencyFor = (lang: string) => (lang === 'ru' ? 'RUB' : 'EUR');
const asLang = (lang: string): Lang => (lang === 'de' || lang === 'en' ? lang : 'ru');

const NBSP = String.fromCharCode(0xa0);

// Разделители разрядов вручную (без Intl): SSR-пререндер и браузер обязаны дать одинаковую строку.
function group(value: number, separator: string) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** Рубли → евро по курсу ЦБ, округление до 10 € (минимум 10 €). */
export function rubToEur(rub: number, fx: FxRate = BUILD_FX) {
  return Math.max(10, Math.round(rub / fx.eurRub / 10) * 10);
}

/** Цена пакета в валюте локали: ru — ₽ из прайса, de/en — пересчёт в €. */
export function priceFor(lang: string, rub: number, fx: FxRate = BUILD_FX) {
  return asLang(lang) === 'ru' ? rub : rubToEur(rub, fx);
}

/** «60 000 ₽» / «1.900 €» / «€1,900» — без «от». value — уже в валюте локали. */
export function formatAmount(lang: string, value: number) {
  if (lang === 'ru') return `${group(value, NBSP)}${NBSP}₽`;
  if (lang === 'de') return `${group(value, '.')}${NBSP}€`;
  return `€${group(value, ',')}`;
}

const PERIOD: Record<Lang, Record<'month' | 'hour', string>> = {
  ru: { month: '/мес', hour: '/час' },
  de: { month: '/Monat', hour: '/Std.' },
  en: { month: '/month', hour: '/hour' },
};

/** Полная подпись: «от 45 000 ₽», «ab 270 €/Monat», «from €20/hour». */
export function formatFrom(lang: string, pkg: PricePackage, fx: FxRate = BUILD_FX) {
  const l = asLang(lang);
  const prefix = { ru: 'от', de: 'ab', en: 'from' }[l];
  const period = pkg.period ? PERIOD[l][pkg.period] : '';
  return `${prefix}${NBSP}${formatAmount(l, priceFor(l, pkg.price.ru, fx))}${period}`;
}

export function packageCopy(pkg: PricePackage, lang: string) {
  return pkg.copy[asLang(lang)];
}

/** Самый доступный сайт (строка на главной) — в валюте локали. */
export function minSitePrice(lang: string, fx: FxRate = BUILD_FX) {
  const rub = Math.min(...PACKAGES.filter((p) => p.group === 'project' && p.id !== 'integrations' && p.id !== 'ai').map((p) => p.price.ru));
  return priceFor(lang, rub, fx);
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Дата курса без Intl (одинаково на сервере и в браузере): ru/de «17.10.2026», en «17 Oct 2026». */
export function formatFxDate(lang: string, isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  if (asLang(lang) === 'en') return `${Number(d)} ${MONTHS_EN[Number(m) - 1] ?? m} ${y}`;
  return `${d}.${m}.${y}`;
}

/** Границы бюджета для формы /contact (pricing.json → budgets.ru), в валюте локали. */
export function budgetBounds(lang: string, fx: FxRate = BUILD_FX): [number, number] {
  const [lo, hi] = data.budgets.ru;
  return [priceFor(lang, lo, fx), priceFor(lang, hi, fx)];
}
