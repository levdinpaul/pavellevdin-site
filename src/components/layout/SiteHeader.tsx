import { BrandMark } from './BrandMark';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CommandMenu, type CommandLabels } from '@/components/ds/CommandMenu';
import { startPointerEffects } from '@/lib/pointer-effects';
import { bindContactClickGoals } from '@/lib/analytics';
import { setLanguage } from '@/i18n';
import { useAuthFlag } from '@/hooks/useAuthFlag';
import { isPlatformPath } from '@/lib/platform-paths';
import { UserIcon } from './social-icons';

const LANGS = ['ru', 'de', 'en'] as const;
type Lang = (typeof LANGS)[number];

// Подписи ⌘K-меню (перенесены из прежнего SiteNav без изменений).
const CMD: Record<Lang, CommandLabels & { brief: string }> = {
  ru: { placeholder: 'Куда? Поиск или команда…', sections: 'Разделы', actions: 'Действия', navigate: '↑↓ НАВИГАЦИЯ', open: '↵ ОТКРЫТЬ', notFound: '// ничего не найдено — 404', brief: 'Рассчитать проект' },
  de: { placeholder: 'Wohin? Suchen oder Befehl…', sections: 'Sektionen', actions: 'Aktionen', navigate: '↑↓ NAVIGIEREN', open: '↵ ÖFFNEN', notFound: '// nichts gefunden — 404', brief: 'Projekt konfigurieren' },
  en: { placeholder: 'Where to? Search or command…', sections: 'Sections', actions: 'Actions', navigate: '↑↓ NAVIGATE', open: '↵ OPEN', notFound: '// nothing found — 404', brief: 'Configure project' },
};

interface NavItem { to: string; label: string; match: string; className?: string }

/** Ссылка меню: страницы платформы (блог, вход, кабинет) — обычный <a> с полной загрузкой, остальное — SPA-Link. */
function NavLink({ item, current }: { item: NavItem; current?: boolean }) {
  const ariaCurrent = current ? 'page' as const : undefined;
  if (isPlatformPath(item.to)) return <a href={item.to} className={item.className} aria-current={ariaCurrent}>{item.label}</a>;
  return <Link to={item.to} viewTransition className={item.className} aria-current={ariaCurrent}>{item.label}</Link>;
}

/**
 * Шапка «PL Сцена» без плашек: лого-текст, меню (страницы футера; редкие — в «Ещё ▾»), RU / DE / EN текстом,
 * «Войти» ↔ «Кабинет» (cookie-флаг платформы), CTA-ссылка, «···»-меню на узких экранах. Связь — плавающая кнопка (ContactFab).
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
  const [moreOpen, setMoreOpen] = useState(false);
  const topRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const authed = useAuthFlag();

  // Наклон карточек и магнит CTA — один делегированный слушатель на весь сайт
  useEffect(() => { startPointerEffects(); bindContactClickGoals(); }, []);

  // Кнопка «наверх» — пишем в DOM напрямую, без ре-рендеров
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (topRef.current) topRef.current.dataset.visible = String(window.scrollY > window.innerHeight * 1.5);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) return;
    // десктоп: сцена — шапка прозрачна весь первый экран; мобайл/reduced-motion: обычный поток — фон почти сразу
    const live = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const onScroll = () => setScrolled(window.scrollY > (live.matches ? window.innerHeight * 0.6 : 24));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setMenuOpen(false);
        // «Ещё»: Esc закрывает и возвращает фокус на кнопку, если он был внутри выпадашки
        if (moreRef.current?.contains(document.activeElement)) moreRef.current.querySelector('button')?.focus();
        setMoreOpen(false);
      }
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
    setMoreOpen(false);
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

  // «Ещё ▾» закрывается кликом мимо и уходом фокуса из выпадашки (Tab дальше по шапке)
  useEffect(() => {
    if (!moreOpen) return;
    const onOutside = (e: Event) => { if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false); };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('focusin', onOutside);
    return () => { document.removeEventListener('pointerdown', onOutside); document.removeEventListener('focusin', onOutside); };
  }, [moreOpen]);

  const switchLang = async (next: Lang) => {
    if (next === lang) return;
    await setLanguage(next);
    const rest = location.pathname.replace(/^\/(ru|de|en)(?=\/|$)/, '');
    navigate(`/${next}${rest || ''}${location.hash}`);
  };
  const cycleLang = () => switchLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);

  const about: NavItem = { to: `/${lang}/about`, label: t('pl.nav.about'), match: '/about' };
  const portfolio: NavItem = { to: `/${lang}/portfolio`, label: t('pl.nav.portfolio'), match: '/portfolio' };
  const services: NavItem = { to: `/${lang}/services`, label: t('pl.nav.services'), match: '/services' };
  const blog: NavItem = { to: `/${lang}/blog`, label: t('pl.nav.blog'), match: '/blog' };
  const calc: NavItem = { to: `/${lang}/calculator`, label: t('pl.nav.calc'), match: '/calculator' };
  const contact: NavItem = { to: `/${lang}/contact`, label: t('pl.nav.contact'), match: '/contact' };
  const brief: NavItem = { to: `/${lang}/brief`, label: t('pl.nav.brief'), match: '/brief' };
  const card: NavItem = { to: `/${lang}/business-card`, label: t('pl.nav.card'), match: '/business-card' };
  const review: NavItem = { to: `/${lang}/review`, label: t('pl.clients.leave'), match: '/review' };
  // Калькулятор в основной строке с 1360px, уже — в «Ещё» (переключение в pl.css)
  const primary: NavItem[] = [about, portfolio, services, blog, { ...calc, className: 'pl-nav__wide' }, contact];
  const more: NavItem[] = [{ ...calc, className: 'pl-more__narrow' }, brief, card];
  // Мобильное меню — все страницы футера (кабинет — кнопкой «Войти/Кабинет» вверху)
  const mobile: NavItem[] = [about, services, portfolio, blog, brief, calc, card, contact, review];
  const isActive = (match: string | null) => match !== null && location.pathname.startsWith(`/${lang}${match}`);
  const moreActive = more.some((l) => isActive(l.match));

  const account: NavItem = authed
    ? { to: `/${lang}/cabinet`, label: t('pl.nav.cabinet'), match: '/cabinet' }
    : { to: `/${lang}/login`, label: t('pl.nav.login'), match: '/login' };
  // Обе подписи лежат в одной ячейке grid — ширина не меняется при переключении после гидрации (CLS 0)
  const accountInner = (
    <>
      <UserIcon />
      <span className="pl-login__labels">
        <span aria-hidden={authed}>{t('pl.nav.login')}</span>
        <span aria-hidden={!authed}>{t('pl.nav.cabinet')}</span>
      </span>
    </>
  );


  const cmd = CMD[lang];
  // Блог/кабинет живут на платформе (pl-platform) — туда только полной загрузкой страницы, не через SPA-роутер.
  const go = (path: string) => {
    const to = `/${lang}${path}`;
    if (isPlatformPath(to)) window.location.assign(to);
    else navigate(to);
  };

  return (
    <>
      <header className="pl-header" data-solid={!isHome || scrolled || menuOpen}>
        <div className="pl-header__inner">
          <Link to={`/${lang}`} viewTransition className="pl-logo">
            <BrandMark className="pl-logo__mark" size={32} />
            <span className="pl-logo__text">
              <span className="pl-logo__name">Innovativ Digitalbau</span>
              <span className="pl-logo__sub">{t('pl.brandSub')}</span>
            </span>
          </Link>

          <nav className="pl-nav" aria-label={t('pl.nav.menu')}>
            {primary.map((l) => <NavLink key={l.to} item={l} current={isActive(l.match)} />)}
            <div className="pl-more" ref={moreRef}>
              <button
                type="button"
                className="pl-more__btn"
                aria-expanded={moreOpen}
                aria-controls="pl-more-list"
                data-active={moreActive || undefined}
                onClick={() => setMoreOpen((o) => !o)}
              >
                {t('pl.nav.more')}<span aria-hidden="true" className="pl-more__caret">▾</span>
              </button>
              <ul id="pl-more-list" className="pl-more__list" hidden={!moreOpen}>
                {more.map((l) => (
                  <li key={l.to} className={l.className}><NavLink item={{ ...l, className: undefined }} current={isActive(l.match)} /></li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="pl-header__actions">
            <span className="pl-langs" role="group" aria-label={t('pl.nav.lang')}>
              {LANGS.map((l) => (
                <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => switchLang(l)}>{l.toUpperCase()}</button>
              ))}
            </span>
            <a href={account.to} className="pl-login" data-auth={authed}>{accountInner}</a>
            <Link to={`/${lang}/brief`} viewTransition className="pl-header__cta">{t('pl.nav.cta')}</Link>
            <button
              type="button"
              className="pl-burger"
              aria-label={t('pl.nav.menu')}
              aria-expanded={menuOpen}
              aria-controls="pl-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >···</button>
          </div>
        </div>
      </header>

      <button ref={topRef} type="button" className="pl-chip pl-totop" data-visible="false" aria-label={t('pl.nav.top')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      {/* Меню всегда в DOM (aria-controls у «···» должен указывать на существующий элемент), закрытое — hidden */}
      <nav id="pl-menu" className="pl-menu" aria-label={t('pl.nav.menu')} hidden={!menuOpen}>
        <a href={account.to} className="pl-login pl-menu__login" data-auth={authed}>{accountInner}</a>
        {mobile.map((l) => <NavLink key={l.to} item={l} current={isActive(l.match)} />)}
        <Link to={`/${lang}/brief`} className="pl-menu__cta">{t('pl.nav.cta')}</Link>
        <span className="pl-langs pl-menu__langs" role="group" aria-label={t('pl.nav.lang')}>
          {LANGS.map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => switchLang(l)}>{l.toUpperCase()}</button>
          ))}
        </span>
      </nav>

      <CommandMenu
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        sections={[
          { id: '/about', label: about.label },
          { id: '/portfolio', label: portfolio.label },
          { id: '/services', label: services.label, hint: '01–08' },
          { id: '/blog', label: blog.label },
          { id: '/calculator', label: calc.label },
          { id: '/contact', label: contact.label },
          { id: '/business-card', label: card.label },
        ]}
        actions={[
          { label: account.label, glyph: '◉', onSelect: () => go(account.match) },
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
