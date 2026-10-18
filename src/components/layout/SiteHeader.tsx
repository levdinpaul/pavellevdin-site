import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CommandMenu, type CommandLabels } from '@/components/ds/CommandMenu';
import { CONTACTS } from '@/constants/contacts';
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from './social-icons';

const LANGS = ['ru', 'de', 'en'] as const;
type Lang = (typeof LANGS)[number];

// Подписи ⌘K-меню (перенесены из прежнего SiteNav без изменений).
const CMD: Record<Lang, CommandLabels & { blog: string; brief: string }> = {
  ru: { placeholder: 'Куда? Поиск или команда…', sections: 'Разделы', actions: 'Действия', navigate: '↑↓ НАВИГАЦИЯ', open: '↵ ОТКРЫТЬ', notFound: '// ничего не найдено — 404', blog: 'Блог', brief: 'Рассчитать проект' },
  de: { placeholder: 'Wohin? Suchen oder Befehl…', sections: 'Sektionen', actions: 'Aktionen', navigate: '↑↓ NAVIGIEREN', open: '↵ ÖFFNEN', notFound: '// nichts gefunden — 404', blog: 'Blog', brief: 'Projekt konfigurieren' },
  en: { placeholder: 'Where to? Search or command…', sections: 'Sections', actions: 'Actions', navigate: '↑↓ NAVIGATE', open: '↵ OPEN', notFound: '// nothing found — 404', blog: 'Blog', brief: 'Configure project' },
};

/**
 * Шапка «PL Сцена»: лого, меню, язык, CTA, «···»-меню на узких экранах, соц-колонка справа.
 * На главной прозрачная поверх hero, после первого экрана — фон + blur + граница.
 * На остальных страницах фон сразу (решается по pathname — одинаково на сервере и клиенте).
 */
export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = (LANGS.includes(i18n.language as Lang) ? i18n.language : 'ru') as Lang;
  const isHome = /^\/(ru|de|en)\/?$/.test(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLButtonElement>(null);

  // Скролл-прогресс в шапке и кнопка «наверх» — пишем в DOM напрямую, без ре-рендеров
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const k = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${k.toFixed(4)})`;
      if (topRef.current) topRef.current.dataset.visible = String(window.scrollY > window.innerHeight * 1.5);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === 'Escape') { setCmdOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Смена маршрута закрывает меню (сброс состояния во время рендера, без лишнего эффекта).
  const routeKey = location.pathname + location.hash;
  const [prevRoute, setPrevRoute] = useState(routeKey);
  if (prevRoute !== routeKey) {
    setPrevRoute(routeKey);
    setMenuOpen(false);
    setCmdOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.pl-menu') && !el.closest('.pl-burger')) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  const cycleLang = () => {
    const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    i18n.changeLanguage(next);
    const rest = location.pathname.replace(/^\/(ru|de|en)(?=\/|$)/, '');
    navigate(`/${next}${rest || ''}${location.hash}`);
  };

  const links = [
    { to: `/${lang}/about`, label: t('pl.nav.about'), match: '/about' },
    { to: `/${lang}/portfolio`, label: t('pl.nav.portfolio'), match: '/portfolio' },
    { to: `/${lang}/services`, label: t('pl.nav.services'), match: '/services' },
    { to: `/${lang}/contact`, label: t('pl.nav.contact'), match: '/contact' },
  ];
  const isActive = (match: string | null) => match !== null && location.pathname.startsWith(`/${lang}${match}`);

  const social = [
    { href: CONTACTS.telegram.url, label: 'Telegram', icon: <TelegramIcon /> },
    { href: CONTACTS.whatsapp.url, label: 'WhatsApp', icon: <WhatsAppIcon /> },
    { href: CONTACTS.instagram, label: 'Instagram', icon: <InstagramIcon /> },
  ].filter((s) => s.href);

  const cmd = CMD[lang];
  const go = (path: string) => navigate(`/${lang}${path}`);

  return (
    <>
      <header className="pl-header" data-solid={!isHome || scrolled || menuOpen}>
        <div className="pl-header__inner">
          <Link to={`/${lang}`} className="pl-logo" aria-label={t('pl.nav.home')}>
            <span className="pl-logo__mark">PL</span>
            <span className="pl-logo__text">
              <span className="pl-logo__name">Innovativ Digitalbau</span>
              <span className="pl-logo__sub">{t('pl.brandSub')}</span>
            </span>
          </Link>

          <nav className="pl-nav" aria-label={t('pl.nav.menu')}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} aria-current={isActive(l.match) ? 'page' : undefined}>{l.label}</Link>
            ))}
          </nav>

          <div className="pl-header__actions">
            <button type="button" className="pl-chip" onClick={cycleLang} aria-label={t('pl.nav.lang')}>{lang.toUpperCase()}</button>
            <Link to={`/${lang}/brief`} className="pl-btn pl-btn--light pl-header__cta">{t('pl.nav.cta')}</Link>
            <button
              type="button"
              className="pl-chip pl-burger"
              aria-label={t('pl.nav.menu')}
              aria-expanded={menuOpen}
              aria-controls="pl-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >···</button>
          </div>
        </div>
        <div className="pl-progress" aria-hidden="true"><div ref={progressRef} /></div>
      </header>

      <button ref={topRef} type="button" className="pl-chip pl-totop" data-visible="false" aria-label={t('pl.nav.top')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      {menuOpen && (
        <nav id="pl-menu" className="pl-menu" aria-label={t('pl.nav.menu')}>
          {links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          <Link to={`/${lang}/brief`} className="pl-menu__cta">{t('pl.nav.cta')}</Link>
        </nav>
      )}

      <div className="pl-social" aria-label={t('pl.nav.social')}>
        {social.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{s.icon}</a>
        ))}
      </div>

      <CommandMenu
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        sections={[
          { id: '/services', label: t('pl.nav.services'), hint: '01–08' },
          { id: '/portfolio', label: t('pl.nav.portfolio') },
          { id: '/blog', label: cmd.blog },
          { id: '/contact', label: t('pl.nav.contact') },
        ]}
        actions={[
          { label: cmd.brief, glyph: '▦', kbd: 'B', onSelect: () => go('/brief') },
          { label: 'DE / EN / RU', glyph: '⇄', onSelect: cycleLang },
        ]}
        lang={lang.toUpperCase()}
        onNavigate={go}
        labels={cmd}
      />
    </>
  );
}
