import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Layers3, Lightbulb, Rocket, Target, User, type LucideIcon } from 'lucide-react';

type AboutCopy = {
  badge: string;
  title: string;
  text: string;
  photoAlt: string;
  exp: string;
  features: [string, string, LucideIcon][];
};

const copy: Record<'de' | 'en' | 'ru', AboutCopy> = {
  de: {
    badge: 'Über mich',
    title: 'Ich verbinde Design, Code und Business-Logik.',
    text: 'Ich entwickle nicht nur schöne Seiten. Ich baue digitale Systeme: klare Positionierung, schnelle Frontends, SEO-Struktur, Analytics, Social-Integrationen und Automatisierung, damit ein Projekt nach dem Launch weiter arbeitet.',
    photoAlt: 'Pavel Levdin, founder of PL – Innovativ Digitalbau',
    exp: '10+ Jahre',
    features: [
      ['Business-first', 'Jede Seite bekommt eine Aufgabe: Vertrauen, Anfrage, Kauf oder Automatisierung.', Target],
      ['Visuell stark', 'Premium Look, klare Hierarchie, Animationen und Interface-Details mit Sinn.', Lightbulb],
      ['Technisch sauber', 'Performance, SEO, Schema, Analytics und skalierbare Architektur.', Layers3],
    ],
  },
  en: {
    badge: 'About',
    title: 'I connect design, code and business logic.',
    text: 'I do not just build pretty pages. I create digital systems: clear positioning, fast frontends, SEO structure, analytics, social integrations and automation that keep working after launch.',
    photoAlt: 'Pavel Levdin, founder of PL – Innovativ Digitalbau',
    exp: '10+ years',
    features: [
      ['Business-first', 'Every page has a job: trust, lead, sale or automation.', Target],
      ['Visual impact', 'Premium look, clear hierarchy, meaningful animations and interface details.', Lightbulb],
      ['Technical depth', 'Performance, SEO, schema, analytics and scalable architecture.', Layers3],
    ],
  },
  ru: {
    badge: 'Обо мне',
    title: 'Я соединяю дизайн, код и бизнес-логику.',
    text: 'Я делаю не просто красивые страницы. Я собираю цифровые системы: позиционирование, быстрый frontend, SEO-структуру, аналитику, соцсети и автоматизацию, чтобы проект работал после запуска.',
    photoAlt: 'Павел Левдин, основатель PL – Innovativ Digitalbau',
    exp: '10+ лет',
    features: [
      ['Через бизнес', 'У каждой страницы есть задача: доверие, заявка, продажа или автоматизация.', Target],
      ['Сильный визуал', 'Премиальный вид, понятная иерархия, анимации и аккуратные детали интерфейса.', Lightbulb],
      ['Техническая база', 'Скорость, SEO, schema, аналитика и масштабируемая архитектура.', Layers3],
    ],
  },
};

export function About() {
  const { i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  return (
    <section id="about" className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/25 to-background" />
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-md lg:mx-0"
          >
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/18 via-primary/5 to-transparent blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
              <img src="/about/photo.webp" alt={text.photoAlt} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-5 -right-3 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black">{text.exp}</p>
                  <p className="text-xs text-muted-foreground">PL – Innovativ Digitalbau</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <User className="h-4 w-4" />
              {text.badge}
            </span>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">{text.title}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{text.text}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {text.features.map(([title, description, Icon], index) => (
                <motion.div
                  key={String(title)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
                  className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur"
                >
                  <Icon className="mb-4 h-7 w-7 text-primary" />
                  <h3 className="font-bold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(description)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
