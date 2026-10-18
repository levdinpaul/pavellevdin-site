import data from './pricing.json';

/** ru-локаль — рубли, de/en — евро (netto). Значения — в pricing.json. */
export type PriceRegion = 'ru' | 'eu';
type Lang = 'ru' | 'de' | 'en';

export interface PricePackage {
  id: string;
  group: 'project' | 'ongoing';
  featured?: boolean;
  period?: 'month' | 'hour';
  price: Record<PriceRegion, number>;
  copy: Record<Lang, { title: string; duration?: string; points: string[] }>;
}

export const PACKAGES = data.packages as PricePackage[];

export const regionFor = (lang: string): PriceRegion => (lang === 'ru' ? 'ru' : 'eu');
export const currencyFor = (lang: string) => (lang === 'ru' ? 'RUB' : 'EUR');
const asLang = (lang: string): Lang => (lang === 'de' || lang === 'en' ? lang : 'ru');

const NBSP = String.fromCharCode(0xa0);

// Разделители разрядов вручную (без Intl): SSR-пререндер и браузер обязаны дать одинаковую строку.
function group(value: number, separator: string) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** «60 000 ₽» / «1.900 €» / «€1,900» — без «от». */
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

/** Полная подпись: «от 60 000 ₽», «ab 490 €/Monat», «from €75/hour». */
export function formatFrom(lang: string, pkg: PricePackage) {
  const l = asLang(lang);
  const prefix = { ru: 'от', de: 'ab', en: 'from' }[l];
  const period = pkg.period ? PERIOD[l][pkg.period] : '';
  return `${prefix}${NBSP}${formatAmount(l, pkg.price[regionFor(l)])}${period}`;
}

export function packageCopy(pkg: PricePackage, lang: string) {
  return pkg.copy[asLang(lang)];
}

/** Самый доступный сайт (строка на главной). */
export function minSitePrice(lang: string) {
  const region = regionFor(lang);
  return Math.min(...PACKAGES.filter((p) => p.group === 'project' && p.id !== 'integrations' && p.id !== 'ai').map((p) => p.price[region]));
}
