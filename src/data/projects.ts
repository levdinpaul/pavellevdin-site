// Портфолио: данные — в portfolio.json (его же читают scripts/prerender.cjs и scripts/generate-sitemap.cjs),
// статус доступности — projects-status.json (пишет scripts/check-projects.cjs на этапе сборки).
import portfolio from './portfolio.json';
import status from './projects-status.json';

export type ProjectCategory = 'clients-de' | 'clients-ru' | 'products' | 'landings';
export type ProjectLang = 'ru' | 'de' | 'en';

export interface ProjectCopy {
  summary: string;
  task: string;
  solution: string;
  done: string[];
}

export interface Project {
  slug: string;
  title: string;
  url: string;
  category: ProjectCategory;
  /** live — рабочий сайт; preview — в разработке, открыт превью-доступ */
  status: 'live' | 'preview';
  featured: boolean;
  stack: string[];
  copy: Partial<Record<ProjectLang, ProjectCopy>>;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = ['clients-de', 'clients-ru', 'products', 'landings'];

export const projects = portfolio as Project[];

/** Онлайн ли сайт по результату проверки при сборке (нет данных → считаем онлайн). */
export function isOnline(slug: string): boolean {
  const s = (status as Record<string, { online: boolean }>)[slug];
  return s ? s.online : true;
}

export function projectCopy(p: Project, lang: string): ProjectCopy {
  return p.copy[lang as ProjectLang] ?? p.copy.ru ?? { summary: '', task: '', solution: '', done: [] };
}

/** Скриншоты реальных сайтов: public/images/portfolio/<slug>/{desktop,desktop-2,mobile}.webp */
export function projectImages(slug: string) {
  const base = `/images/portfolio/${slug}`;
  return { desktop: `${base}/desktop.webp`, desktop2: `${base}/desktop-2.webp`, mobile: `${base}/mobile.webp` };
}
