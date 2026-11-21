import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { getContacts } from '@/constants/contacts';
import { Integrations } from '@/components/pl/Integrations';
import { PriceLine } from '@/components/pl/Pricing';
import { Counter } from '@/components/pl/Counter';
import { MicroUI } from '@/components/pl/MicroUI';
import { SERVICE_MICRO } from '@/components/pl/micro-kinds';
import { Title } from '@/components/pl/Title';
import { Reviews } from '@/components/pl/Reviews';
import { BlogSection } from '@/components/pl/BlogSection';
import { ProcessSection, FaqSection, ClientsSection } from '@/components/pl/TrustSections';
import { AuditForm } from '@/components/pl/AuditForm';
import { useReveal } from './useReveal';
import { WorkSection } from './WorkSection';

type Service = { title: string; text: string };

/** Секции главной после сцены: Проекты → Отзывы (или «С кем работаю») → Обо мне → Услуги → Блог → Как я работаю → Интеграции → FAQ → Аудит → CTA. */
export function HomeSections({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const contacts = getContacts(lang);
  const work = projects.filter((p) => p.featured).slice(0, 6);
  const services = (t('pl.services.items', { returnObjects: true }) as Service[]).slice(0, 4);

  return (
    <div ref={root} className="pl-main">
      <div className="pl-container">
        <WorkSection lang={lang} work={work} />

        <Reviews lang={lang} fallback={<ClientsSection lang={lang} />} />

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
            <Title id="pl-about-title" className="pl-h2 pl-about__title" lines={[t('pl.about.title')]} />
            <p className="pl-lead" data-reveal="">{t('pl.about.lead')}</p>
            <dl className="pl-facts" data-reveal="">
              <div><dt><Counter value={10} suffix="+" /></dt><dd>{t('pl.about.facts.years')}</dd></div>
              <div><dt><Counter value={projects.length} /></dt><dd>{t('pl.about.facts.projects')}</dd></div>
              <div><dt><Counter value={3} /></dt><dd>{t('pl.about.facts.langs')}</dd></div>
            </dl>
            <Link to={`/${lang}/about`} viewTransition className="pl-link pl-about__more" data-reveal="">{t('pl.about.more')}</Link>
          </div>
        </section>

        <section id="services" className="pl-section" aria-labelledby="pl-services-title">
          <p className="pl-eyebrow" data-reveal="">{t('pl.services.eyebrow')}</p>
          <Title id="pl-services-title" lines={[t('pl.services.title')]} />
          <p className="pl-lead pl-services__lead" data-reveal="">{t('pl.services.lead')}</p>
          <ol className="pl-do">
            {services.map((s, i) => (
              <li key={s.title} data-reveal="">
                <MicroUI kind={SERVICE_MICRO[i] ?? 'browser'} />
                <h3 className="pl-srv__title">{s.title}</h3>
                <p className="pl-srv__text">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="pl-services__foot">
            <PriceLine lang={lang} />
            <Link to={`/${lang}/services`} viewTransition className="pl-link pl-services__more" data-reveal="">{t('pl.services.more')}</Link>
          </div>
        </section>

        <BlogSection lang={lang} />

        <ProcessSection />

        <section id="integrations" className="pl-section" aria-label={t('pl.integrations.eyebrow')}>
          <Integrations />
        </section>

        <FaqSection lang={lang} />

        <AuditForm lang={lang} />

        <section id="contact" className="pl-section" aria-labelledby="pl-cta-title">
          <div className="pl-cta-box" data-reveal="">
            <h2 id="pl-cta-title" className="pl-h2">{t('pl.cta.title')}</h2>
            <p className="pl-lead">{t('pl.cta.lead')}</p>
            <div className="pl-cta__actions">
              <a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--primary" data-magnetic="">{t('pl.cta.telegram')} {contacts.telegram.handle}<span aria-hidden="true">↗</span></a>
              <a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn--ghost">{t('pl.cta.whatsapp')}</a>
              <a href={contacts.mailto} className="pl-btn pl-btn--ghost">{t('pl.cta.email')}</a>
              <Link to={`/${lang}/brief`} className="pl-btn pl-btn--ghost">{t('pl.cta.brief')}</Link>
            </div>
            <p className="pl-cta__meta"><a href={contacts.mailto}>{contacts.email}</a> · {t('pl.footer.location')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
