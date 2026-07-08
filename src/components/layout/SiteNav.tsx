import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavPill } from '@/components/ds/NavPill';
import { CommandMenu, type CommandLabels } from '@/components/ds/CommandMenu';

const LANGS = ['ru', 'de', 'en'] as const;
type Lang = (typeof LANGS)[number];

const NAV: Record<Lang, {
  services: string; portfolio: string; blog: string; contact: string;
  ctaNav: string; brief: string;
  placeholder: string; sections: string; actions: string; navigate: string; open: string; notFound: string;
}> = {
  ru: {
    services: 'Услуги', portfolio: 'Портфолио', blog: 'Блог', contact: 'Контакт',
    ctaNav: 'Рассчитать', brief: 'Рассчитать проект',
    placeholder: 'Куда? Поиск или команда…', sections: 'Разделы', actions: 'Действия',
    navigate: '↑↓ НАВИГАЦИЯ', open: '↵ ОТКРЫТЬ', notFound: '// ничего не найдено — 404',
  },
  de: {
    services: 'Leistungen', portfolio: 'Projekte', blog: 'Blog', contact: 'Kontakt',
    ctaNav: 'Konfigurieren', brief: 'Projekt konfigurieren',
    placeholder: 'Wohin? Suchen oder Befehl…', sections: 'Sektionen', actions: 'Aktionen',
    navigate: '↑↓ NAVIGIEREN', open: '↵ ÖFFNEN', notFound: '// nichts gefunden — 404',
  },
  en: {
    services: 'Services', portfolio: 'Work', blog: 'Blog', contact: 'Contact',
    ctaNav: 'Configure', brief: 'Configure project',
    placeholder: 'Where to? Search or command…', sections: 'Sections', actions: 'Actions',
    navigate: '↑↓ NAVIGATE', open: '↵ OPEN', notFound: '// nothing found — 404',
  },
};

/** Глобальная навигация: NavPill (плавающая пилюля) + CommandMenu (⌘K) + прогресс-рейл. */
export function SiteNav() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = (LANGS.includes(i18n.language as Lang) ? i18n.language : 'ru') as Lang;
  const t = NAV[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setMenuOpen((o) => !o); }
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const go = (path: string) => navigate(`/${lang}${path}`);
  const cycleLang = () => {
    const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    i18n.changeLanguage(next);
    const rest = location.pathname.replace(/^\/(ru|de|en)(?=\/|$)/, '');
    navigate(`/${next}${rest || ''}`);
  };

  const items = [
    { id: '/services', label: t.services },
    { id: '/portfolio', label: t.portfolio },
    { id: '/blog', label: t.blog },
  ];
  const activeId = items.find((it) => location.pathname.startsWith(`/${lang}${it.id}`))?.id ?? null;

  const sections = [
    { id: '/services', label: t.services, hint: '01–05' },
    { id: '/portfolio', label: t.portfolio },
    { id: '/blog', label: t.blog },
    { id: '/contact', label: t.contact },
  ];
  const actions = [
    { label: t.brief, glyph: '▦', kbd: 'B', onSelect: () => go('/brief') },
    { label: 'DE / EN / RU', glyph: '⇄', onSelect: cycleLang },
  ];
  const labels: CommandLabels = {
    placeholder: t.placeholder, sections: t.sections, actions: t.actions,
    navigate: t.navigate, open: t.open, notFound: t.notFound,
  };

  return (
    <>
      {/* Construction progress rail */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60, pointerEvents: 'none' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-ring)', transition: 'width 100ms linear' }} />
      </div>
      <div style={{ position: 'fixed', bottom: 16, left: 18, zIndex: 40, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', pointerEvents: 'none' }}>
        BAU {Math.round(progress * 100)}%
      </div>

      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50, maxWidth: 'calc(100vw - 20px)' }}>
        <NavPill
          items={items}
          activeId={activeId}
          onNavigate={go}
          onMenuOpen={() => setMenuOpen(true)}
          onSearchOpen={() => setMenuOpen(true)}
          lang={lang.toUpperCase()}
          onLangChange={cycleLang}
          cta={t.ctaNav}
          onCta={() => go('/brief')}
        />
      </div>

      <CommandMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sections={sections}
        actions={actions}
        lang={lang.toUpperCase()}
        onNavigate={go}
        labels={labels}
      />
    </>
  );
}
