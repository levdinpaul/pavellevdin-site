import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { CONTACTS } from '@/constants/contacts';
import { ProjectCard } from '@/components/pl/ProjectCard';
import { ServicesGrid } from '@/components/pl/ServicesGrid';
import { Integrations } from '@/components/pl/Integrations';
import { useReveal } from './useReveal';

/** Секции главной после сцены: Проекты (сразу после финала полёта) → Обо мне → Услуги → Интеграции → CTA. */
export function HomeSections({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const work = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <div ref={root} className="pl-main">
      <div className="pl-container">
        <section id="work" className="pl-section" aria-labelledby="pl-work-title">
          <div className="pl-section__head" data-reveal="">
            <h2 id="pl-work-title" className="pl-h2">{t('pl.work.title')}</h2>
            <Link to={`/${lang}/portfolio`} className="pl-link">{t('pl.work.all')}</Link>
          </div>
          <ul className="pl-work__grid">
            {work.map((p) => <li key={p.slug} data-reveal=""><ProjectCard project={p} lang={lang} /></li>)}
          </ul>
        </section>

        <section id="about" className="pl-section pl-about" aria-labelledby="pl-about-title">
          <figure className="pl-about__photo" data-reveal="">
            <picture>
              <source type="image/avif" srcSet="/about/photo-480.avif 480w, /about/photo-720.avif 720w" sizes="(max-width: 699px) 60vw, 320px" />
              <source type="image/webp" srcSet="/about/photo-480.webp 480w, /about/photo-720.webp 720w" sizes="(max-width: 699px) 60vw, 320px" />
              <img src="/about/photo-480.webp" width={480} height={665} alt={t('pl.aboutPage.photoAlt')} loading="lazy" decoding="async" />
            </picture>
          </figure>
          <div className="pl-about__text">
            <p className="pl-eyebrow" data-reveal="">{t('pl.about.eyebrow')}</p>
            <h2 id="pl-about-title" className="pl-h2 pl-about__title" data-reveal="">{t('pl.about.title')}</h2>
            <p className="pl-lead" data-reveal="">{t('pl.about.lead')}</p>
            <Link to={`/${lang}/about`} className="pl-link pl-about__more" data-reveal="">{t('pl.about.more')}</Link>
          </div>
        </section>

        <section id="services" className="pl-section" aria-labelledby="pl-services-title">
          <h2 id="pl-services-title" className="pl-h2" data-reveal="">{t('pl.services.title')}</h2>
          <p className="pl-lead pl-services__lead" data-reveal="">{t('pl.services.lead')}</p>
          <ServicesGrid />
          <Link to={`/${lang}/services`} className="pl-link pl-services__more">{t('pl.services.more')}</Link>
        </section>

        <section id="integrations" className="pl-section" aria-label={t('pl.integrations.eyebrow')}>
          <Integrations />
        </section>

        <section id="contact" className="pl-section" aria-labelledby="pl-cta-title">
          <div className="pl-cta-box" data-reveal="">
            <h2 id="pl-cta-title" className="pl-h2">{t('pl.cta.title')}</h2>
            <p className="pl-lead">{t('pl.cta.lead')}</p>
            <div className="pl-cta__actions">
              <a href={CONTACTS.telegram.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--primary">{t('pl.cta.telegram')} {CONTACTS.telegram.handle}</a>
              <a href={CONTACTS.whatsapp.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--ghost">{t('pl.cta.whatsapp')} {CONTACTS.whatsapp.phone}</a>
              <Link to={`/${lang}/brief`} className="pl-btn pl-btn--ghost">{t('pl.cta.brief')}</Link>
            </div>
            <p className="pl-cta__meta"><a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a> · {t('pl.footer.location')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
