/**
 * Пути, которые обслуживает отдельное приложение pl-platform (Next.js) на том же домене:
 * nginx отдаёт ему /(ru|de|en)/(blog|cabinet|admin|login|register|forgot-password|reset-password|set-password)…
 * Внутри SPA сайта на эти пути переходим ТОЛЬКО полной загрузкой документа.
 */
export const PLATFORM_SECTIONS = [
  'blog', 'cabinet', 'admin', 'login', 'register', 'forgot-password', 'reset-password', 'set-password',
] as const;

const PLATFORM_RE = new RegExp(`^/(ru|de|en)/(${PLATFORM_SECTIONS.join('|')})(/|$|[?#])`);

export function isPlatformPath(path: string): boolean {
  return PLATFORM_RE.test(path);
}
