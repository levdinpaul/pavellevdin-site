import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useBuildReveal } from '@/components/BuildReveal';

/** Простая 404 сайта (рендерится внутри LangLayout → шапка/футер уже есть). */
export function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const lang = ['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru';
  const root = useRef<HTMLElement>(null);
  useBuildReveal(root, { firstScreen: true }); // 404 не пререндерится (PlatformRedirect → null в SSR) — собираем сразу
  return (
    <section ref={root} className="pl-section">
      <Helmet>
        <title>{t('pl.notFound.title')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="pl-container" style={{ minHeight: '50vh' }}>
        <p className="pl-eyebrow" data-build="" data-pl-build="tiles">404</p>
        <h1 data-build="" style={{ margin: '12px 0 16px', font: '600 clamp(32px, 5vw, 56px)/1.1 var(--font-display, var(--font-body))' }}>
          {t('pl.notFound.title')}
        </h1>
        <p className="pl-lead" style={{ marginBottom: 28 }} data-build="" data-pl-build="tiles">{t('pl.notFound.text')}</p>
        <Link to={`/${lang}`} className="pl-btn pl-btn--primary" data-build="" data-pl-build="tiles">{t('pl.notFound.home')}</Link>
      </div>
    </section>
  );
}
