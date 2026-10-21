import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import snapshot from '@/data/reviews.json';
import { projects } from '@/data/projects';
import { SITE } from './seo';
import { Title } from './Title';

export interface Review {
  id: string;
  project: string;
  name: string;
  role?: string;
  company?: string;
  text: string;
  rating: number | null;
  lang?: string;
  verified: boolean;
  date: string;
}

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';

/**
 * Отзывы клиентов (только одобренные в админке). Секция скрыта, пока нет ни одного.
 * Первый рендер — снимок сборки (src/data/reviews.json, попадает в пререндер);
 * после загрузки страницы подтягиваются свежие одобренные отзывы из /api/reviews.
 * JSON-LD Review/AggregateRating — только при ≥ 3 отзывах с оценкой.
 */
export function Reviews({ lang, project }: { lang: string; project?: string }) {
  const { t } = useTranslation();
  const [all, setAll] = useState<Review[]>(snapshot as Review[]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/reviews`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data && Array.isArray(data.reviews)) setAll(data.reviews); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const list = project ? all.filter((r) => r.project === project) : all;
  if (!list.length) return null;

  const rated = list.filter((r) => typeof r.rating === 'number');
  const jsonLd = rated.length >= 3 ? {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#business`,
    name: 'Innovativ Digitalbau',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length).toFixed(1),
      reviewCount: rated.length,
    },
    review: rated.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewBody: r.text,
      datePublished: r.date.slice(0, 10),
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  } : null;

  return (
    <section id="reviews" className="pl-section pl-reviews" aria-labelledby="pl-reviews-title">
      {jsonLd && <Helmet><script type="application/ld+json">{JSON.stringify(jsonLd)}</script></Helmet>}
      <p className="pl-eyebrow" data-reveal="">{t('pl.reviews.eyebrow')}</p>
      <Title id="pl-reviews-title" lines={[t('pl.reviews.title')]} />
      <ul className="pl-reviews__grid">
        {list.map((r) => {
          const caseStudy = projects.find((p) => p.slug === r.project);
          return (
            <li key={r.id} className="pl-review" data-reveal="">
              <figure>
                <blockquote className="pl-review__text">{r.text}</blockquote>
                <figcaption className="pl-review__who">
                  <strong>{r.name}</strong>
                  <span>{[r.role, r.company].filter(Boolean).join(', ')}</span>
                </figcaption>
              </figure>
              <div className="pl-review__meta">
                {r.verified && <span className="pl-review__badge">{t('pl.reviews.verified')}</span>}
                {caseStudy && !project && <Link to={`/${lang}/portfolio/${caseStudy.slug}`} viewTransition className="pl-link">{t('pl.reviews.case')} {caseStudy.title} →</Link>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
