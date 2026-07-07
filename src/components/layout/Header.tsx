import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, Contact, FileCheck2, Home, Layers3, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui-custom/ThemeToggle';
import { LanguageSwitcher } from '../ui-custom/LanguageSwitcher';
import { Button } from '@/components/ui/button';

const labels = {
  de: {
    home: 'Start',
    services: 'Leistungen',
    portfolio: 'Projekte',
    brief: 'Konfigurator',
    card: 'Visitenkarte',
    contact: 'Kontakt',
    cta: 'Projekt starten',
  },
  en: {
    home: 'Home',
    services: 'Services',
    portfolio: 'Work',
    brief: 'Configurator',
    card: 'Business card',
    contact: 'Contact',
    cta: 'Start project',
  },
  ru: {
    home: 'Главная',
    services: 'Услуги',
    portfolio: 'Портфолио',
    brief: 'Конфигуратор',
    card: 'Онлайн-визитка',
    contact: 'Контакты',
    cta: 'Запустить проект',
  },
};

export function Header() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof labels;
  const text = labels[lang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: `/${lang}`, label: text.home, icon: Home },
    { path: `/${lang}/services`, label: text.services, icon: Layers3 },
    { path: `/${lang}/portfolio`, label: text.portfolio, icon: BriefcaseBusiness },
    { path: `/${lang}/brief`, label: text.brief, icon: FileCheck2 },
    { path: `/${lang}/business-card`, label: text.card, icon: Contact },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-3 pt-3 transition-all duration-300 ${
        isScrolled ? 'translate-y-0' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto max-w-7xl rounded-2xl border border-black/10 bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82 dark:shadow-black/30">
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-4 lg:h-[68px] lg:px-5">
          <Link to={`/${lang}`} className="flex min-w-0 items-center gap-3">
            <img
              src="/icon-96x96.png"
              alt="PL Innovativ Digitalbau"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-xl shadow-glow-sm"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black leading-tight text-slate-900 sm:text-base dark:text-white">
                Innovativ Digitalbau
              </span>
              <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-cyan-100/60">
                Web Coding · SEO · AI · Automation
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-black/5 hover:text-slate-900 dark:text-white/68 dark:hover:bg-white/[0.08] dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-cyan-300"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to={`/${lang}/contact`}>
              <Button className="h-10 rounded-xl bg-cyan-300 px-4 font-bold text-slate-950 hover:bg-cyan-200">
                {text.cta}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-700 hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-black/10 lg:hidden dark:border-white/10"
            >
              <nav className="grid gap-2 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold ${
                        isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-black/5 dark:text-white/72 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link to={`/${lang}/contact`}>
                  <Button className="mt-2 h-12 w-full rounded-xl bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200">
                    {text.cta}
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
