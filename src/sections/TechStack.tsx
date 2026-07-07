import { useTranslation } from 'react-i18next';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import {
  Boxes,
  Bot,
  Code2,
  Cpu,
  Gauge,
  Globe,
  Server,
  type LucideIcon,
} from 'lucide-react';

type Group = { label: string; icon: LucideIcon; items: string[] };
type Metric = [string, string];
type TechCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  groups: Group[];
  metrics: Metric[];
};

const stackGroups = (labels: string[]): Group[] => [
  { label: labels[0], icon: Code2, items: ['React 19', 'Next.js', 'TypeScript', 'Tailwind', 'shadcn/ui', 'Framer Motion', 'GSAP', 'Vite'] },
  { label: labels[1], icon: Server, items: ['Node.js', 'Express', 'Strapi', 'PostgreSQL', 'REST APIs', 'Auth', 'Webhooks'] },
  { label: labels[2], icon: Gauge, items: ['Technical SEO', 'Schema.org', 'AEO / GEO', 'Core Web Vitals', 'GA4', 'GTM', 'Search Console'] },
  { label: labels[3], icon: Bot, items: ['CRM', 'Telegram-Bots', 'Social Publishing', 'KI-Orchestrierung', 'Content-Pipelines', 'Integrationen'] },
  { label: labels[4], icon: Server, items: ['Docker', 'Nginx', 'Ubuntu VPS', 'CI/CD', 'FTP-Deploy', 'Backups', 'Monitoring'] },
  { label: labels[5], icon: Globe, items: ['DE / EN / RU', 'i18n-Architektur', 'DSGVO', 'Hosting in der EU'] },
];

const copy: Record<'de' | 'en' | 'ru', TechCopy> = {
  de: {
    eyebrow: 'Stack & Fähigkeiten',
    title: 'Voller Stack — von der ersten Zeile bis zum laufenden System.',
    subtitle: 'Ein Ansprechpartner für Design, Code, SEO, Infrastruktur und Automatisierung. Kein Agentur-Overhead, keine Schnittstellen-Verluste.',
    groups: stackGroups(['Frontend', 'Backend', 'SEO & Analytics', 'Automatisierung & KI', 'Infra & DevOps', 'Sprachen & Recht']),
    metrics: [['10+', 'Jahre Erfahrung'], ['100/100', 'Lighthouse-Ziel'], ['3', 'Sprachen DE/EN/RU'], ['1', 'Ansprechpartner']],
  },
  en: {
    eyebrow: 'Stack & capabilities',
    title: 'Full stack — from the first line to a system that keeps running.',
    subtitle: 'One contact for design, code, SEO, infrastructure and automation. No agency overhead, no hand-off losses.',
    groups: stackGroups(['Frontend', 'Backend', 'SEO & Analytics', 'Automation & AI', 'Infra & DevOps', 'Languages & Law']),
    metrics: [['10+', 'years experience'], ['100/100', 'Lighthouse target'], ['3', 'languages DE/EN/RU'], ['1', 'point of contact']],
  },
  ru: {
    eyebrow: 'Стек и возможности',
    title: 'Полный стек — от первой строки до работающей системы.',
    subtitle: 'Один человек для дизайна, кода, SEO, инфраструктуры и автоматизации. Без накладных расходов агентства и потерь на стыках.',
    groups: stackGroups(['Frontend', 'Backend', 'SEO и аналитика', 'Автоматизация и AI', 'Infra & DevOps', 'Языки и право']),
    metrics: [['10+', 'лет опыта'], ['100/100', 'цель Lighthouse'], ['3', 'языка DE/EN/RU'], ['1', 'контакт для всего']],
  },
};

export function TechStack() {
  const { i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const reduce = useReducedMotion();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  return (
    <section id="stack" className="relative overflow-hidden bg-background py-20 md:py-28">
      <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_72%)]" />
      <div className="absolute right-[8%] top-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            ref={ref}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="mb-12 max-w-3xl"
          >
            <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.28em] text-faint">
              <Cpu className="h-4 w-4 text-primary" />
              {text.eyebrow}
            </p>
            <div className="mb-5 h-px w-12 bg-primary/70" />
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-5xl">{text.title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{text.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {text.groups.map((group, index) => (
              <motion.div
                key={group.label}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="group rounded-xl border border-border bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:scale-110">
                    <group.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">{group.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted-foreground transition group-hover:border-primary/25 group-hover:text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-primary/15 bg-surface-2 p-6 md:grid-cols-4 md:p-8"
          >
            {text.metrics.map(([value, label]) => (
              <div key={label}>
                <Boxes className="mb-2 hidden h-4 w-4 text-primary md:block" />
                <p className="font-mono text-2xl font-bold tabular-nums text-primary md:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
