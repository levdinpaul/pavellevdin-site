// SEO-хелперы для страниц «PL Сцена» (без JSX — отдельно от компонентов).
export const SITE = 'https://pavellevdin.ru';

export function breadcrumbs(lang: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}/${lang}${it.path}` })),
  };
}
