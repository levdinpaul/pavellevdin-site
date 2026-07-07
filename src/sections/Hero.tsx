import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Braces,
  Gauge,
  Layers3,
  LineChart,
  MonitorSmartphone,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const copy = {
  de: {
    badge: 'Websites, SEO, AI Search, Automation',
    eyebrow: 'PL – Innovativ Digitalbau',
    title: 'Nicht nur eine Website — ein fertiges System, das Ihnen Kunden bringt.',
    subtitle:
      'Ich entwickle Websites, Shops, Web-Apps, SEO-Strukturen, Google Business, Social Setup, Analytics und Automatisierung aus einer Hand.',
    primary: 'Projekt konfigurieren',
    secondary: 'Portfolio ansehen',
    scroll: 'Mehr sehen',
    live: 'Live Launch System',
    stats: [
      ['100/100', 'Performance-Ziel'],
      ['SEO+AEO', 'Google & AI Search'],
      ['Full Stack', 'Design bis Automation'],
    ],
    chips: ['React', 'Next.js', 'SEO', 'GA4', 'CRM', 'Meta', 'Google Business', 'Automation'],
  },
  en: {
    badge: 'Websites, SEO, AI Search, Automation',
    eyebrow: 'PL – Innovativ Digitalbau',
    title: 'Not just a website — a ready system that brings you clients.',
    subtitle:
      'I build websites, shops, web apps, SEO structures, Google Business, social setup, analytics and automation in one complete launch.',
    primary: 'Configure project',
    secondary: 'View portfolio',
    scroll: 'See more',
    live: 'What you get',
    stats: [
      ['100/100', 'performance target'],
      ['SEO+AEO', 'Google & AI Search'],
      ['Full Stack', 'design to automation'],
    ],
    chips: ['React', 'Next.js', 'SEO', 'GA4', 'CRM', 'Meta', 'Google Business', 'Automation'],
  },
  ru: {
    badge: 'Цифровой запуск бизнеса под ключ',
    eyebrow: 'PL – Innovativ Digitalbau',
    title: 'Не просто сайт — готовая система, которая приводит вам клиентов.',
    subtitle:
      'Сайт, продвижение в Google и Яндексе, аналитика и — при наличии нужного обеспечения — автоматизация процессов и CRM. Всё под ключ, из одних рук. Результат — заявки и клиенты, а не просто красивая страница.',
    primary: 'Собрать проект',
    secondary: 'Смотреть работы',
    scroll: 'Смотреть ниже',
    live: 'Что вы получаете',
    stats: [
      ['100/100', 'цель скорости'],
      ['SEO+AEO', 'Google и AI-поиск'],
      ['Full Stack', 'от дизайна до CRM'],
    ],
    chips: ['Сайт под ключ', 'SEO и Яндекс', 'Google/Яндекс Бизнес', 'Соцсети', 'Аналитика', 'CRM и автоматизация'],
  },
};

const showcase = [
  [Gauge, 'Быстрый сайт', '100/100'],
  [Search, 'Клиенты из поиска', 'ТОП'],
  [LineChart, 'Аналитика заявок', 'ROI'],
  [Bot, 'Автоматизация', 'CRM'],
];

export function Hero() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-cinematic relative flex min-h-[100dvh] flex-col overflow-hidden bg-slate-950 pt-20 text-white">
      <img
        src="/images/hero/pl-webinnovativbau-hero.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[62%_50%] opacity-80"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.96)_0%,rgba(2,6,23,.88)_31%,rgba(2,6,23,.42)_63%,rgba(2,6,23,.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(22,224,242,.22),transparent_32%)]" />
      <div className="absolute inset-0 hero-noise" />
      <div className="absolute inset-0 hero-network" />

      <motion.div
        className="absolute left-[8%] top-[18%] h-64 w-64 rounded-full border border-cyan-300/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute right-[10%] top-[20%] h-96 w-96 rounded-full border border-cyan-300/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex w-full flex-1 items-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-0">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-4 py-2 text-sm font-medium text-cyan-100 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-200" />
              <span className="truncate">{text.badge}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06 }}
              className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-cyan-100/[0.65]"
            >
              {text.eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-4xl text-[clamp(1.9rem,1.1rem+2.4vw,3.5rem)] font-black leading-[1.06] text-white drop-shadow-2xl"
            >
              {text.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.18 }}
              className="mt-5 max-w-2xl text-base leading-7 text-slate-200/[0.78] sm:text-[1.05rem]"
            >
              {text.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link to={`/${lang}/brief`}>
                <Button size="lg" className="h-12 w-full bg-primary px-7 text-base font-bold text-primary-foreground shadow-2xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-glow sm:w-auto">
                  {text.primary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={`/${lang}/portfolio`}>
                <Button variant="outline" size="lg" className="h-12 w-full border-white/25 bg-white/[0.08] px-7 text-base text-white backdrop-blur-xl hover:bg-white hover:text-slate-950 sm:w-auto">
                  {text.secondary}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.34 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {text.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-100/80 backdrop-blur">
                  {chip}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18 }}
            className="relative mx-auto hidden w-full max-w-2xl lg:block"
          >
            <motion.div
              className="absolute -left-10 top-14 z-20 rounded-2xl border border-white/[0.12] bg-slate-950/[0.68] p-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
                <MonitorSmartphone className="h-4 w-4" />
                {text.live}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {showcase.map(([Icon, label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                    <Icon className="mb-2 h-4 w-4 text-amber-200" />
                    <p className="text-[11px] text-slate-300/75">{String(label)}</p>
                    <p className="mt-1 font-mono text-sm font-bold tabular-nums text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-4 bottom-24 z-20 w-64 rounded-2xl border border-cyan-200/[0.15] bg-slate-950/[0.72] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Braces className="h-4 w-4 text-cyan-200" />
                Под ключ
              </div>
              <div className="space-y-2 text-xs text-slate-300/80">
                {['Сайт и дизайн', 'Продвижение в поиске', 'Заявки и CRM'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2">
                    <span>{item}</span>
                    <span className="text-cyan-200">готово</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative ml-auto aspect-[1.05/1] max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-sm">
              <div className="absolute inset-6 rounded-[1.5rem] border border-cyan-200/[0.15] bg-gradient-to-br from-cyan-300/[0.12] via-transparent to-amber-200/10" />
              <motion.div
                className="absolute inset-10 rounded-full border border-cyan-200/20"
                animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.85, 0.45] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-300/15 shadow-[0_0_80px_rgba(34,211,238,.35)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              >
                <Layers3 className="h-16 w-16 text-cyan-100" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={scrollToAbout}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-slate-300/70 transition hover:text-white"
      >
        <span>{text.scroll}</span>
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <ArrowDown className="h-5 w-5" />
        </motion.span>
      </motion.button>
    </section>
  );
}
