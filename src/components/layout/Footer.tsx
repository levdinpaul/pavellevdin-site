import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Send } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const labels = {
  de: {
    pages: 'Seiten',
    contact: 'Kontakt',
    legal: 'Rechtliches',
    home: 'Start',
    services: 'Leistungen',
    portfolio: 'Projekte',
    brief: 'Konfigurator',
    card: 'Online-Visitenkarte',
    blog: 'Blog',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    cookies: 'Cookie-Einstellungen',
    tagline: 'Web Coding, SEO, AI Search, Google Business, Social Media, Analytics und Automatisierung fuer Unternehmen.',
    rights: 'Alle Rechte vorbehalten.',
  },
  en: {
    pages: 'Pages',
    contact: 'Contact',
    legal: 'Legal',
    home: 'Home',
    services: 'Services',
    portfolio: 'Work',
    brief: 'Configurator',
    card: 'Online business card',
    blog: 'Blog',
    imprint: 'Imprint',
    privacy: 'Privacy',
    cookies: 'Cookie settings',
    tagline: 'Web coding, SEO, AI Search, Google Business, social media, analytics and automation for businesses.',
    rights: 'All rights reserved.',
  },
  ru: {
    pages: 'Страницы',
    contact: 'Контакты',
    legal: 'Документы',
    home: 'Главная',
    services: 'Услуги',
    portfolio: 'Портфолио',
    brief: 'Конфигуратор',
    card: 'Онлайн-визитка',
    blog: 'Блог',
    imprint: 'Реквизиты',
    privacy: 'Политика конфиденциальности',
    cookies: 'Настройки cookie',
    tagline: 'Веб-кодинг, SEO, AI Search, Google Business, соцсети, аналитика и автоматизация для бизнеса.',
    rights: 'Все права защищены.',
  },
};

function VKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.673 4 8.231c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
  );
}

export function Footer() {
  const { i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as keyof typeof labels;
  const text = labels[lang];
  const { reset } = useCookieConsent();

  const navLinks = [
    { path: `/${lang}`, label: text.home },
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
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr_.8fr_.8fr]">
          <div>
            <Link to={`/${lang}`} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/12 font-black text-cyan-100">
                PL
              </span>
              <span>
                <span className="block font-black">Innovativ Digitalbau</span>
                <span className="block text-xs text-cyan-100/58">Web Coding · SEO · Automation</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">{text.tagline}</p>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white/66 transition hover:border-cyan-300/30 hover:text-cyan-100"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white/82">{text.pages}</h3>
            <ul className="mt-4 grid gap-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-white/56 transition hover:text-cyan-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white/82">{text.contact}</h3>
            <ul className="mt-4 grid gap-2 text-sm text-white/56">
              <li><a className="hover:text-cyan-100" href="https://t.me/PavelLevdin" target="_blank" rel="noopener noreferrer">Telegram: @PavelLevdin</a></li>
              <li><a className="hover:text-cyan-100" href="https://wa.me/4917643141306" target="_blank" rel="noopener noreferrer">WhatsApp: +49 176 43141306</a></li>
              <li><a className="hover:text-cyan-100" href="mailto:levdin.pavel@yandex.ru">levdin.pavel@yandex.ru</a></li>
              <li>Bremen, Germany</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white/82">{text.legal}</h3>
            <ul className="mt-4 grid gap-2">
              <li><Link to={`/${lang}/imprint`} className="text-sm text-white/56 hover:text-cyan-100">{text.imprint}</Link></li>
              <li><Link to={`/${lang}/privacy`} className="text-sm text-white/56 hover:text-cyan-100">{text.privacy}</Link></li>
              <li><button type="button" onClick={reset} className="text-left text-sm text-white/56 transition hover:text-cyan-100">{text.cookies}</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} PL Innovativ Digitalbau. {text.rights}</p>
          <Link to={`/${lang}/admin`} className="text-white/18 hover:text-white/30" aria-hidden="true">.</Link>
        </div>
      </div>
    </footer>
  );
}
