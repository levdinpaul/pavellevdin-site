import { BrandMark } from './BrandMark';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { getContacts } from '@/constants/contacts';

/** Футер «PL Сцена»: бренд, страницы, контакты, документы (Реквизиты/Политика/cookie — обязательны). */
export function Footer() {
  const { t, i18n } = useTranslation();
  const lang = ['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru';
  const { reset } = useCookieConsent();
  const contacts = getContacts(lang);
  // Год фиксирован: SSR-пререндер и клиент должны отдать одинаковую разметку.
  const year = 2026;

  const pages = [
    { to: `/${lang}/about`, label: t('pl.footer.about') },
    { to: `/${lang}/services`, label: t('pl.nav.services') },
    { to: `/${lang}/portfolio`, label: t('pl.nav.portfolio') },
    // Блог и кабинет отдаёт pl-platform (nginx) → обычная ссылка, полная загрузка страницы.
    { to: `/${lang}/blog`, label: t('pl.footer.blog'), external: true },
    { to: `/${lang}/brief`, label: t('pl.footer.brief') },
    { to: `/${lang}/calculator`, label: t('pl.footer.calc') },
    { to: `/${lang}/business-card`, label: t('pl.footer.card') },
    { to: `/${lang}/cabinet`, label: t('pl.footer.cabinet'), external: true },
    { to: `/${lang}/review`, label: t('pl.clients.leave') },
  ];

  return (
    <footer className="pl-footer">
      <div className="pl-container">
        <div className="pl-footer__grid">
          <div className="pl-footer__brand">
            <span className="pl-footer__logo"><BrandMark className="pl-footer__mark" size={36} /><span className="pl-footer__name">Innovativ Digitalbau</span></span>
            <span className="pl-footer__sub">{t('pl.brandSub')}</span>
            <span className="pl-footer__sub">Pavel Levdin · {t('pl.footer.location')}</span>
          </div>

          <div>
            <p className="pl-footer__label">{t('pl.footer.pages')}</p>
            <ul className="pl-footer__list">
              {pages.map((p) => (
                <li key={p.to}>
                  {p.external ? <a href={p.to}>{p.label}</a> : <Link to={p.to} viewTransition>{p.label}</Link>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="pl-footer__label">{t('pl.footer.contact')}</p>
            <ul className="pl-footer__list">
              <li><a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer">Telegram {contacts.telegram.handle}</a></li>
              <li><a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href={contacts.telegramChannel} data-social="tgchannel" target="_blank" rel="noopener noreferrer">{t('pl.rail.tgChannel')}</a></li>
              <li><a href={contacts.mailto}>{contacts.email}</a></li>
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
          <span className="pl-footer__hint">{t('pl.footer.cmdHint')}</span>
          <span>© {year} Innovativ Digitalbau. {t('pl.footer.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
