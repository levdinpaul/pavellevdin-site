// Индекс посадочных услуг: slug → заголовок по языкам и связанные кейсы.
// Генерируется из services-landing.json (scripts/ensure-build-data.cjs) — чтобы ссылки на услуги
// со /services и со страниц кейсов не тянули полные тексты посадочных в свой чанк.
import index from './services-landing-index.json';

type Lang = 'ru' | 'de' | 'en';
interface LandingRef { relatedProjects: string[]; h1: Record<Lang, string> }

export const LANDING_INDEX = index as Record<string, LandingRef>;
export const LANDING_SLUGS = Object.keys(LANDING_INDEX);

/** Посадочные услуги, где кейс указан примером (обратная перелинковка «кейс → услуга»). */
export const landingsForProject = (projectSlug: string) =>
  LANDING_SLUGS.filter((s) => LANDING_INDEX[s].relatedProjects.includes(projectSlug));
