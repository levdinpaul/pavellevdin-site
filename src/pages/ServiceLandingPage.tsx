import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE, breadcrumbs } from '@/components/pl/seo';
import { ProjectCard } from '@/components/pl/ProjectCard';
import { useBuildReveal } from '@/components/BuildReveal';
import { projects } from '@/data/projects';
import { PACKAGES, currencyFor, formatFrom, priceFor } from '@/data/pricing';
import { useFxRate } from '@/data/fx';
import landings from '@/data/services-landing.json';
import posts from '@/data/posts.json';

type Lang = 'ru' | 'de' | 'en';
interface Copy { title: string; description: string; h1: string; lead: string; forWhom: string[]; includes: string[]; process: string[]; timeline: string; faq: { q: string; a: string }[] }
interface Landing { pricingKey: string | null; relatedProjects: string[]; ru: Copy; de: Copy; en: Copy }
interface Post { slug: string; title: string; excerpt: string }

export const LANDINGS = landings as Record<string, Landing>;
export const LANDING_SLUGS = Object.keys(LANDINGS);

// Статьи блога по теме услуги — по ключевым словам в slug (снимок posts.json; новых статей код не знает)
const POST_TOPICS: Record<string, RegExp> = {
  'nextjs-website': /nextjs|lighthouse/, 'web-app': /nextjs|typescript/, seo: /lighthouse|seo/, landing: /lighthouse|sayt|website/,
  'online-shop': /shop|magazin|lighthouse/, support: /lighthouse/, 'ai-automation': /ai|mcp/, 'telegram-bot': /telegram|bot/, 'crm-integration': /crm/,
};

/** Посадочная страница услуги /:lang/services/:slug — тексты из services-landing.json, цена «от» из pricing.json. */
export function ServiceLandingPage() {
  const { slug = '' } = useParams();
  const { t, i18n } = useTranslation();
  const lang = (['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru') as Lang;
  const root = useRef<HTMLDivElement>(null);
  useBuildReveal(root);
  const fx = useFxRate(lang);
  const data = LANDINGS[slug];
  if (!data) return <Navigate to={`/${lang}/services`} replace />;

  const c = data[lang];
  const pkg = data.pricingKey ? PACKAGES.find((p) => p.id === data.pricingKey) : undefined;
  const related = data.relatedProjects.map((s) => projects.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const topic = POST_TOPICS[slug];
  const relatedPosts = topic ? ((posts as Record<string, Post[]>)[lang] ?? []).filter((p) => topic.test(p.slug)).slice(0, 2) : [];
  const path = `/services/${slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: c.h1,
      description: c.description,
      url: `${SITE}/${lang}${path}`,
      provider: { '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'Innovativ Digitalbau' },
      areaServed: ['Russia', 'Germany', 'Europe'],
      ...(pkg ? {
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': pkg.period ? 'UnitPriceSpecification' : 'PriceSpecification',
            minPrice: priceFor(lang, pkg.price.ru, fx),
            priceCurrency: currencyFor(lang),
            ...(pkg.period ? { unitText: pkg.period === 'month' ? 'MONTH' : 'HOUR' } : {}),
          },
        },
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
    },
    breadcrumbs(lang, [{ name: 'Innovativ Digitalbau', path: '' }, { name: t('pl.servicesPage.eyebrow'), path: '/services' }, { name: c.h1, path }]),
  ];

  return (
    <>
      <PageMeta lang={lang} path={path} title={c.title} description={c.description} jsonLd={jsonLd} />
      <div ref={root} className="pl-page">
        <section className="pl-container pl-page__head">
          <nav className="pl-crumbs" aria-label={t('pl.landing.crumbs')}>
            <Link to={`/${lang}/services`} viewTransition>{t('pl.servicesPage.eyebrow')}</Link>
          </nav>
          <h1 className="pl-page__title">{c.h1}</h1>
          <p className="pl-lead">{c.lead}</p>
          <dl className="pl-landing__facts">
            {pkg && <div><dt>{t('pl.landing.price')}</dt><dd>{formatFrom(lang, pkg, fx)}</dd></div>}
            <div><dt>{t('pl.landing.timeline')}</dt><dd>{c.timeline}</dd></div>
          </dl>
          <div className="pl-hero__actions">
            <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary" data-magnetic="">{t('pl.landing.cta')}</Link>
            <Link to={`/${lang}/calculator`} className="pl-btn pl-btn--ghost">{t('pl.nav.calc')}</Link>
          </div>
        </section>

        <section className="pl-container pl-section pl-landing__cols" aria-label={c.h1}>
          <div data-reveal="">
            <h2 className="pl-landing__h">{t('pl.landing.forWhom')}</h2>
            <ul className="pl-landing__list">{c.forWhom.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div data-reveal="">
            <h2 className="pl-landing__h">{t('pl.landing.includes')}</h2>
            <ul className="pl-landing__list">{c.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-landing-process">
          <h2 id="pl-landing-process" className="pl-landing__h" data-reveal="">{t('pl.landing.process')}</h2>
          <ol className="pl-steps">
            {c.process.map((x, i) => (
              <li key={x} data-reveal=""><span className="pl-srv__num">{String(i + 1).padStart(2, '0')}</span><p className="pl-srv__text">{x}</p></li>
            ))}
          </ol>
        </section>

        {related.length > 0 && (
          <section className="pl-container pl-section" aria-labelledby="pl-landing-cases">
            <div className="pl-section__head">
              <h2 id="pl-landing-cases" className="pl-landing__h" data-reveal="">{t('pl.landing.cases')}</h2>
              <Link to={`/${lang}/portfolio`} viewTransition className="pl-link">{t('pl.work.all')}</Link>
            </div>
            <ul className="pl-work__grid">
              {related.map((p) => <li key={p.slug} data-reveal=""><ProjectCard project={p} lang={lang} /></li>)}
            </ul>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="pl-container pl-section" aria-labelledby="pl-landing-posts">
            <h2 id="pl-landing-posts" className="pl-landing__h" data-reveal="">{t('pl.landing.posts')}</h2>
            <ul className="pl-landing__posts">
              {relatedPosts.map((p) => <li key={p.slug} data-reveal=""><a href={`/${lang}/blog/${p.slug}`}><strong>{p.title}</strong><span>{p.excerpt}</span></a></li>)}
            </ul>
          </section>
        )}

        <section className="pl-container pl-section" aria-labelledby="pl-landing-faq">
          <h2 id="pl-landing-faq" className="pl-landing__h" data-reveal="">{t('pl.faq.title')}</h2>
          <div className="pl-faq">
            {c.faq.map((x) => (
              <details key={x.q} className="pl-faq__item" data-reveal=""><summary>{x.q}</summary><p>{x.a}</p></details>
            ))}
          </div>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-landing-more">
          <h2 id="pl-landing-more" className="pl-landing__h" data-reveal="">{t('pl.landing.other')}</h2>
          <ul className="pl-landing__other">
            {LANDING_SLUGS.filter((s) => s !== slug).map((s) => (
              <li key={s}><Link to={`/${lang}/services/${s}`} viewTransition>{LANDINGS[s][lang].h1}</Link></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
