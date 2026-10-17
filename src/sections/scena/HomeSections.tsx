import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { CONTACTS } from '@/constants/contacts';
import { Sparkle } from '@/components/layout/social-icons';
import { HOME_WORK_IDS } from './scene-data';
import { useReveal } from './useReveal';

type Item = { title: string; text: string };
type Stat = { value: string; label: string };

/** Секции главной после сцены: Обо мне → Проекты → Услуги → CTA. */
export function HomeSections({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const aboutCards = t('pl.about.cards', { returnObjects: true }) as Item[];
  const stats = t('pl.about.stats', { returnObjects: true }) as Stat[];
  const services = t('pl.services.items', { returnObjects: true }) as Item[];
  const work = HOME_WORK_IDS.map((id) => projects.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <div ref={root} className="pl-main">
      <div className="pl-container">
        <section id="about" className="pl-section" aria-labelledby="pl-about-title">
          <p className="pl-eyebrow" data-reveal="">{t('pl.about.eyebrow')}</p>
          <h2 id="pl-about-title" className="pl-h2 pl-about__title" data-reveal="">{t('pl.about.title')}</h2>
          <p className="pl-lead" data-reveal="">{t('pl.about.lead')}</p>
          <div className="pl-about__grid" data-reveal="">
            {aboutCards.map((c) => (
              <div key={c.title} className="pl-tile">
                <h3 className="pl-tile__title">{c.title}</h3>
                <p className="pl-tile__text">{c.text}</p>
              </div>
            ))}
          </div>
          <ul className="pl-stats" data-reveal="">
            {stats.map((s) => <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>)}
          </ul>
        </section>

        <section id="work" className="pl-section" aria-labelledby="pl-work-title">
          <div className="pl-section__head" data-reveal="">
            <h2 id="pl-work-title" className="pl-h2">{t('pl.work.title')}</h2>
            <Link to={`/${lang}/portfolio`} className="pl-link">{t('pl.work.all')}</Link>
          </div>
          <ul className="pl-work__grid">
            {work.map((p) => (
              <li key={p.id} data-reveal="">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="pl-work__card">
                  <div className="pl-work__media">
                    {p.image && <img src={p.image} alt={p.title} width={800} height={500} loading="lazy" decoding="async" />}
                  </div>
                  <div className="pl-work__body">
                    <h3 className="pl-work__title">{p.title}</h3>
                    <p className="pl-work__text">{t(`pl.work.items.${p.id}`, { defaultValue: p.description })}</p>
                    <ul className="pl-tags">{p.technologies.slice(0, 3).map((tech) => <li key={tech}>{tech}</li>)}</ul>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="services" className="pl-section" aria-labelledby="pl-services-title">
          <h2 id="pl-services-title" className="pl-h2" data-reveal="">{t('pl.services.title')}</h2>
          <p className="pl-lead pl-services__lead" data-reveal="">{t('pl.services.lead')}</p>
          <ol className="pl-srv">
            {services.map((s, i) => (
              <li key={s.title} data-reveal="">
                <span className="pl-srv__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pl-srv__title">{s.title}</h3>
                <p className="pl-srv__text">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link to={`/${lang}/services`} className="pl-link pl-services__more">{t('pl.services.more')}</Link>
        </section>

        <section id="contact" className="pl-section" aria-labelledby="pl-cta-title">
          <div className="pl-cta-box" data-reveal="">
            <Sparkle size={15} />
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
