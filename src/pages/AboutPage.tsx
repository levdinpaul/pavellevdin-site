import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { getContacts } from '@/constants/contacts';
import { Counter } from '@/components/pl/Counter';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE } from '@/components/pl/seo';
import { Marquee } from '@/components/pl/Marquee';
import { stackFor } from '@/data/stack';
import { ProjectCard } from '@/components/pl/ProjectCard';
import { TelegramIcon, WhatsAppIcon } from '@/components/layout/social-icons';
import { useReveal } from '@/sections/scena/useReveal';
import { Title } from '@/components/pl/Title';

type Group = { title: string; points: string[] };
type Item = { title: string; text: string };

/** Страница «Обо мне». Фото — реальное (npm run photo), биография — без выдуманных фактов. */
export function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const skills = t('pl.aboutPage.skills', { returnObjects: true }) as Group[];
  const process = t('pl.aboutPage.process', { returnObjects: true }) as Item[];
  const principles = t('pl.aboutPage.principles', { returnObjects: true }) as Item[];
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const url = `${SITE}/${lang}/about`;
  const contacts = getContacts(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    name: t('pl.aboutPage.metaTitle'),
    inLanguage: lang,
    mainEntity: {
      '@type': 'Person',
      name: 'Pavel Levdin',
      alternateName: 'Павел Левдин',
      jobTitle: 'Web Developer',
      image: `${SITE}/about/photo-720.webp`,
      email: contacts.mailto,
      address: { '@type': 'PostalAddress', addressLocality: 'Hannover', addressCountry: 'DE' },
      sameAs: [contacts.telegram.url],
      worksFor: { '@type': 'Organization', name: 'PL Innovativ Digitalbau', url: SITE },
    },
  };

  return (
    <>
      <PageMeta lang={lang} path="/about" title={t('pl.aboutPage.metaTitle')} description={t('pl.aboutPage.metaDescription')} image="/about/photo-720.webp" jsonLd={jsonLd} />

      <div ref={root} className="pl-page">
        <section className="pl-container pl-about-hero">
          <div className="pl-about-hero__text">
            <p className="pl-eyebrow">{t('pl.aboutPage.eyebrow')}</p>
            <h1 className="pl-page__title">{t('pl.aboutPage.title')}</h1>
            <p className="pl-lead">{t('pl.aboutPage.lead')}</p>
            <div className="pl-hero__actions pl-about-hero__actions">
              <Link to={`/${lang}/contact`} className="pl-btn pl-btn--primary">{t('pl.aboutPage.primary')}</Link>
              <Link to={`/${lang}/portfolio`} className="pl-btn pl-btn--ghost">{t('pl.aboutPage.secondary')}</Link>
            </div>
          </div>
          <figure className="pl-photo">
            <picture>
              <source type="image/avif" srcSet="/about/photo-480.avif 480w, /about/photo-720.avif 720w" sizes="(max-width: 899px) 80vw, 420px" />
              <source type="image/webp" srcSet="/about/photo-480.webp 480w, /about/photo-720.webp 720w" sizes="(max-width: 899px) 80vw, 420px" />
              <img src="/about/photo-720.webp" width={720} height={998} alt={t('pl.aboutPage.photoAlt')} fetchPriority="high" decoding="async" />
            </picture>
          </figure>
        </section>

        <section className="pl-container">
          <ul className="pl-stats pl-stats--big" data-reveal="">
            <li><strong><Counter value={10} suffix="+" /></strong><span>{t('pl.aboutPage.stats.years')}</span></li>
            <li><strong><Counter value={projects.length} /></strong><span>{t('pl.aboutPage.stats.projects')}</span></li>
            <li><strong><Counter value={3} /></strong><span>{t('pl.aboutPage.stats.servers')}</span></li>
            <li><strong><Counter value={3} /></strong><span>{t('pl.aboutPage.stats.langs')}</span></li>
          </ul>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-skills-title">
          <div className="pl-split">
            <div>
              <p className="pl-eyebrow" data-reveal="">{t('pl.aboutPage.skillsEyebrow')}</p>
              <Title id="pl-skills-title" className="pl-h2" lines={[t('pl.aboutPage.skillsTitle')]} />
            </div>
          </div>
          <ul className="pl-skills">
            {skills.map((g) => (
              <li key={g.title} className="pl-tile" data-reveal="">
                <h3 className="pl-tile__title">{g.title}</h3>
                <ul className="pl-checklist">{g.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-process-title">
          <div className="pl-split">
            <div>
              <p className="pl-eyebrow" data-reveal="">{t('pl.aboutPage.processEyebrow')}</p>
              <Title id="pl-process-title" className="pl-h2" lines={[t('pl.aboutPage.processTitle')]} />
            </div>
          </div>
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

        <section className="pl-section" aria-label={t('pl.aboutPage.stackTitle')}>
          <div className="pl-container"><Title className="pl-h2 pl-stack__title" lines={[t('pl.aboutPage.stackTitle')]} /></div>
          <Marquee items={stackFor(lang).map((item) => item.name)} label={t('pl.aboutPage.stackTitle')} />
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-featured-title">
          <div className="pl-section__head" data-reveal="">
            <h2 id="pl-featured-title" className="pl-h2">{t('pl.aboutPage.featuredTitle')}</h2>
            <Link to={`/${lang}/portfolio`} className="pl-link">{t('pl.work.all')}</Link>
          </div>
          <ul className="pl-work__grid">
            {featured.map((p) => <li key={p.slug} data-reveal=""><ProjectCard project={p} lang={lang} /></li>)}
          </ul>
        </section>

        <section className="pl-container pl-section" aria-labelledby="pl-principles-title">
          <p className="pl-eyebrow" data-reveal="">{t('pl.aboutPage.principlesEyebrow')}</p>
          <Title id="pl-principles-title" className="pl-h2 pl-mb" lines={[t('pl.aboutPage.principlesTitle')]} />
          <ul className="pl-principles">
            {principles.map((p, i) => (
              <li key={p.title} className="pl-tile" data-reveal="">
                <span className="pl-srv__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pl-tile__title">{p.title}</h3>
                <p className="pl-tile__text">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pl-container pl-section">
          <div className="pl-cta-box" data-reveal="">
            <h2 className="pl-h2">{t('pl.aboutPage.ctaTitle')}</h2>
            <p className="pl-lead">{t('pl.aboutPage.ctaLead')}</p>
            <div className="pl-cta__actions">
              <a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--primary"><TelegramIcon /> {contacts.telegram.handle}</a>
              <a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--ghost"><WhatsAppIcon /> {t('pl.cta.whatsapp')}</a>
              <a href={contacts.mailto} className="pl-btn pl-btn--ghost">{t('pl.cta.email')}</a>
            </div>
            <p className="pl-cta__meta"><a href={contacts.mailto}>{contacts.email}</a> · {t('pl.footer.location')}</p>
          </div>
        </section>
      </div>
    </>
  );
}
