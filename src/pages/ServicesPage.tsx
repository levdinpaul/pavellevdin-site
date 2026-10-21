import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE, breadcrumbs } from '@/components/pl/seo';
import { ServicesGrid } from '@/components/pl/ServicesGrid';
import { Integrations } from '@/components/pl/Integrations';
import { useReveal } from '@/sections/scena/useReveal';
import { Pricing } from '@/components/pl/Pricing';
import { Title } from '@/components/pl/Title';
import { PACKAGES, currencyFor, packageCopy, priceFor } from '@/data/pricing';
import { useFxRate } from '@/data/fx';
import { FaqSection } from '@/components/pl/TrustSections';
import { AuditForm } from '@/components/pl/AuditForm';
import { LANDINGS, LANDING_SLUGS } from '@/pages/ServiceLandingPage';

type Item = { title: string; text: string };

/** Услуги: 8 направлений (раскрывающиеся карточки), схема интеграций, процесс 01–05, CTA. */
export function ServicesPage() {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const fx = useFxRate(lang);
  const services = t('pl.services.items', { returnObjects: true }) as Item[];
  const process = t('pl.aboutPage.process', { returnObjects: true }) as Item[];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('pl.servicesPage.title'),
      itemListElement: services.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Service', name: s.title, description: s.text, provider: { '@type': 'Person', name: 'Pavel Levdin', url: `${SITE}/${lang}/about` }, areaServed: ['Germany', 'Europe', 'Russia'] },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: t('pl.prices.title'),
      url: `${SITE}/${lang}/services#prices`,
      itemListElement: PACKAGES.map((p) => ({
        '@type': 'Offer',
        name: packageCopy(p, lang).title,
        seller: { '@type': 'Person', name: 'Pavel Levdin', url: `${SITE}/${lang}/about` },
        priceSpecification: {
          '@type': p.period ? 'UnitPriceSpecification' : 'PriceSpecification',
          minPrice: priceFor(lang, p.price.ru, fx),
          priceCurrency: currencyFor(lang),
          ...(p.period ? { unitText: p.period === 'month' ? 'MONTH' : 'HOUR' } : {}),
          ...(lang === 'ru' ? {} : { valueAddedTaxIncluded: false }),
        },
      })),
    },
    breadcrumbs(lang, [{ name: 'Innovativ Digitalbau', path: '' }, { name: t('pl.servicesPage.eyebrow'), path: '/services' }]),
  ];

  return (
    <>
      <PageMeta lang={lang} path="/services" title={t('pl.servicesPage.metaTitle')} description={t('pl.servicesPage.metaDescription')} jsonLd={jsonLd} />
      <div ref={root} className="pl-page">
        <section className="pl-container pl-page__head">
          <p className="pl-eyebrow">{t('pl.servicesPage.eyebrow')}</p>
          <h1 className="pl-page__title">{t('pl.servicesPage.title')}</h1>
          <p className="pl-lead">{t('pl.servicesPage.lead')}</p>
          <div className="pl-hero__actions pl-about-hero__actions">
            <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary">{t('pl.servicesPage.cta')}</Link>
          </div>
        </section>

        <section className="pl-container">
          <ServicesGrid micro />
        </section>

        <Pricing lang={lang} />

        <section className="pl-container pl-section">
          <Integrations />
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-svc-landings">
          <h2 id="pl-svc-landings" className="pl-landing__h" data-reveal="">{t('pl.landing.listTitle')}</h2>
          <ul className="pl-landing__other">
            {LANDING_SLUGS.map((s) => (
              <li key={s}><Link to={`/${lang}/services/${s}`} viewTransition>{LANDINGS[s][lang as 'ru' | 'de' | 'en'].h1}</Link></li>
            ))}
          </ul>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-svc-process">
          <p className="pl-eyebrow" data-reveal="">{t('pl.aboutPage.processEyebrow')}</p>
          <Title id="pl-svc-process" className="pl-h2 pl-mb" lines={[t('pl.aboutPage.processTitle')]} />
          <ol className="pl-process">
            {process.map((s, i) => (
              <li key={s.title} data-reveal="">
                <span className="pl-srv__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pl-srv__title">{s.title}</h3>
                <p className="pl-srv__text">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pl-container"><FaqSection lang={lang} full /></div>

        <div className="pl-container"><AuditForm lang={lang} /></div>

        <section className="pl-container pl-section">
          <div className="pl-cta-box" data-reveal="">
            <h2 className="pl-h2">{t('pl.servicesPage.systemTitle')}</h2>
            <p className="pl-lead">{t('pl.servicesPage.systemText')}</p>
            <div className="pl-cta__actions">
              <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary" data-magnetic="">{t('pl.servicesPage.cta')}<span aria-hidden="true">→</span></Link>
              <Link to={`/${lang}/contact`} className="pl-btn pl-btn--ghost">{t('pl.nav.contact')}</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
