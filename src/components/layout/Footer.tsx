import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CONTACTS } from '@/constants/contacts';

/** Футер «PL Сцена»: бренд, страницы, контакты, документы (Реквизиты/Политика/cookie — обязательны). */
export function Footer() {
  const { t, i18n } = useTranslation();
  const lang = ['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru';
  const { reset } = useCookieConsent();
  // Год фиксирован: SSR-пререндер и клиент должны отдать одинаковую разметку.
  const year = 2026;

  const pages = [
    { to: `/${lang}/services`, label: t('pl.nav.services') },
    { to: `/${lang}/portfolio`, label: t('pl.nav.portfolio') },
    { to: `/${lang}/blog`, label: t('pl.footer.blog') },
    { to: `/${lang}/brief`, label: t('pl.footer.brief') },
    { to: `/${lang}/business-card`, label: t('pl.footer.card') },
  ];

  return (
    <footer className="pl-footer">
      <div className="pl-container">
        <div className="pl-footer__grid">
          <div className="pl-footer__brand">
            <span className="pl-footer__name">PL · Innovativ Digitalbau</span>
            <span className="pl-footer__sub">{t('pl.brandSub')}</span>
            <span className="pl-footer__sub">Pavel Levdin · {t('pl.footer.location')}</span>
          </div>

          <div>
            <p className="pl-footer__label">{t('pl.footer.pages')}</p>
            <ul className="pl-footer__list">
              {pages.map((p) => <li key={p.to}><Link to={p.to}>{p.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <p className="pl-footer__label">{t('pl.footer.contact')}</p>
            <ul className="pl-footer__list">
              <li><a href={CONTACTS.telegram.url} target="_blank" rel="noopener noreferrer">Telegram {CONTACTS.telegram.handle}</a></li>
              <li><a href={CONTACTS.whatsapp.url} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACTS.whatsapp.phone}</a></li>
              <li><a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a></li>
            </ul>
          </div>

          <div>
            <p className="pl-footer__label">{t('pl.footer.legal')}</p>
            <ul className="pl-footer__list">
              <li><Link to={`/${lang}/imprint`}>{t('pl.footer.imprint')}</Link></li>
              <li><Link to={`/${lang}/privacy`}>{t('pl.footer.privacy')}</Link></li>
              <li><button type="button" onClick={reset}>{t('pl.footer.cookies')}</button></li>
            </ul>
          </div>
        </div>

        <div className="pl-footer__bottom">
          <span>{t('pl.brandSub')}</span>
          <span>© {year} PL Innovativ Digitalbau. {t('pl.footer.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
