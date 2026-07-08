import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Send } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const labels = {
  de: {
    ready: 'System vollständig — bereit für Anfragen',
    pages: 'Seiten', contact: 'Kontakt', legal: 'Rechtliches',
    services: 'Leistungen', portfolio: 'Projekte', brief: 'Konfigurator', card: 'Visitenkarte', blog: 'Blog',
    imprint: 'Impressum', privacy: 'Datenschutz', cookies: 'Cookie-Einstellungen', rights: 'Alle Rechte vorbehalten.',
  },
  en: {
    ready: 'System complete — ready for enquiries',
    pages: 'Pages', contact: 'Contact', legal: 'Legal',
    services: 'Services', portfolio: 'Work', brief: 'Configurator', card: 'Business card', blog: 'Blog',
    imprint: 'Imprint', privacy: 'Privacy', cookies: 'Cookie settings', rights: 'All rights reserved.',
  },
  ru: {
    ready: 'Система готова — принимаю заявки',
    pages: 'Страницы', contact: 'Контакты', legal: 'Документы',
    services: 'Услуги', portfolio: 'Портфолио', brief: 'Конфигуратор', card: 'Онлайн-визитка', blog: 'Блог',
    imprint: 'Реквизиты', privacy: 'Политика', cookies: 'Настройки cookie', rights: 'Все права защищены.',
  },
};

function VKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.673 4 8.231c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
  );
}

const linkStyle: React.CSSProperties = { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', textDecoration: 'none', transition: 'color var(--transition-fast)' };
const colLabelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 16px' };

export function Footer() {
  const { i18n } = useTranslation();
  const currentYear = 2026;
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as keyof typeof labels;
  const text = labels[lang];
  const { reset } = useCookieConsent();

  const navLinks = [
    { path: `/${lang}/services`, label: text.services },
    { path: `/${lang}/portfolio`, label: text.portfolio },
    { path: `/${lang}/brief`, label: text.brief },
    { path: `/${lang}/business-card`, label: text.card },
    { path: `/${lang}/blog`, label: text.blog },
  ];
  const socialLinks = [
    { icon: Send, href: 'https://t.me/PavelLevdin', label: 'Telegram' },
    { icon: Instagram, href: 'https://instagram.com/', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/', label: 'Facebook' },
    { icon: VKIcon, href: 'https://vk.com/', label: 'VKontakte' },
    { icon: Mail, href: 'mailto:levdin.pavel@yandex.ru', label: 'Email' },
  ];

  return (
    <footer style={{ position: 'relative', borderTop: '1px solid var(--border-1)', background: 'var(--bg-0)', padding: '80px var(--section-padding-x) 40px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--success)' }}>● {text.ready}</span>
          <Link to={`/${lang}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(38px, 5.2vw, 68px)', letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink-1)', textShadow: '0 0 48px var(--accent-ring)', textDecoration: 'none' }}>
            PL<span style={{ color: 'var(--accent)' }}>·</span>Digitalbau
          </Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--ink-3)' }}>PAVEL LEVDIN · BREMEN · DE EN RU</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, paddingTop: 40, borderTop: '1px solid var(--border-1)' }}>
          <div>
            <p style={colLabelStyle}>{text.pages}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navLinks.map((l) => (
                <li key={l.path}><Link to={l.path} style={linkStyle} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p style={colLabelStyle}>{text.contact}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="https://t.me/PavelLevdin" target="_blank" rel="noopener noreferrer" style={linkStyle} className="footer-link">Telegram: @PavelLevdin</a></li>
              <li><a href="https://wa.me/4917643141306" target="_blank" rel="noopener noreferrer" style={linkStyle} className="footer-link">WhatsApp: +49 176 43141306</a></li>
              <li><a href="mailto:levdin.pavel@yandex.ru" style={linkStyle} className="footer-link">levdin.pavel@yandex.ru</a></li>
              <li style={{ ...linkStyle, color: 'var(--ink-3)' }}>Bremen, Germany</li>
            </ul>
          </div>
          <div>
            <p style={colLabelStyle}>{text.legal}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link to={`/${lang}/imprint`} style={linkStyle} className="footer-link">{text.imprint}</Link></li>
              <li><Link to={`/${lang}/privacy`} style={linkStyle} className="footer-link">{text.privacy}</Link></li>
              <li><button type="button" onClick={reset} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }} className="footer-link">{text.cookies}</button></li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-1)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>© {currentYear} PL Innovativ Digitalbau. {text.rights}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.label} className="footer-social" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-1)', color: 'var(--ink-3)', transition: 'all var(--transition-fast)' }}>
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
