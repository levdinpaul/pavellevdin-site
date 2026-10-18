import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/** Простая 404 сайта (рендерится внутри LangLayout → шапка/футер уже есть). */
export function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const lang = ['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru';
  return (
    <section className="pl-section">
      <Helmet>
        <title>{t('pl.notFound.title')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="pl-container" style={{ minHeight: '50vh' }}>
        <p className="pl-eyebrow">404</p>
        <h1 style={{ margin: '12px 0 16px', font: '600 clamp(32px, 5vw, 56px)/1.1 var(--font-display, var(--font-body))' }}>
          {t('pl.notFound.title')}
        </h1>
        <p className="pl-lead" style={{ marginBottom: 28 }}>{t('pl.notFound.text')}</p>
        <Link to={`/${lang}`} className="pl-btn pl-btn--primary">{t('pl.notFound.home')}</Link>
      </div>
    </section>
  );
}
