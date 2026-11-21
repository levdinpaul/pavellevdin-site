import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PROJECT_CATEGORIES, projects, type ProjectCategory } from '@/data/projects';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE, breadcrumbs } from '@/components/pl/seo';
import { ProjectCard } from '@/components/pl/ProjectCard';
import { useBuildReveal } from '@/components/BuildReveal';

/** Портфолио: 11 проектов с фильтром по категориям. SSR отдаёт полный список («Все»). */
export function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const [cat, setCat] = useState<ProjectCategory | 'all'>('all');
  const root = useRef<HTMLDivElement>(null);
  useBuildReveal(root);

  const list = cat === 'all' ? projects : projects.filter((p) => p.category === cat);
  const filters: (ProjectCategory | 'all')[] = ['all', ...PROJECT_CATEGORIES];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('pl.portfolio.metaTitle'),
      url: `${SITE}/${lang}/portfolio`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/${lang}/portfolio/${p.slug}`, name: p.title })),
      },
    },
    breadcrumbs(lang, [{ name: 'Innovativ Digitalbau', path: '' }, { name: t('pl.portfolio.title'), path: '/portfolio' }]),
  ];

  return (
    <>
      <PageMeta lang={lang} path="/portfolio" title={t('pl.portfolio.metaTitle')} description={t('pl.portfolio.metaDescription')} jsonLd={jsonLd} />
      <div ref={root} className="pl-page">
        <section className="pl-container pl-page__head">
          <p className="pl-eyebrow">{t('pl.portfolio.eyebrow')}</p>
          <h1 className="pl-page__title">{t('pl.portfolio.title')} <span className="pl-page__count">{projects.length}</span></h1>
          <p className="pl-lead">{t('pl.portfolio.lead')}</p>
          <div className="pl-filters" role="group" aria-label={t('pl.portfolio.filterLabel')}>
            {filters.map((f) => (
              <button key={f} type="button" className="pl-chip" aria-pressed={cat === f} onClick={() => setCat(f)}>
                {t(`pl.portfolio.filters.${f}`)}
                <span className="pl-chip__count">{f === 'all' ? projects.length : projects.filter((p) => p.category === f).length}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="pl-container">
          <ul className="pl-work__grid">
            {list.map((p, i) => <li key={p.slug} data-reveal=""><ProjectCard project={p} lang={lang} eager={i < 3} headingLevel={2} /></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
