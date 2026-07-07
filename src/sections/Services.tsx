import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  AppWindow,
  BarChart3,
  Bot,
  Briefcase,
  CheckCircle2,
  Globe,
  Megaphone,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

type ServiceItem = [string, string, string, LucideIcon, string[]];
type ServicesCopy = {
  badge: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
};

const copy: Record<'de' | 'en' | 'ru', ServicesCopy> = {
  de: {
    badge: 'Leistungen',
    title: 'Alles, was ein Business online stark macht.',
    subtitle: 'Von der ersten Idee bis zu Tracking, SEO, Social Media, Automatisierung und laufender Optimierung.',
    items: [
      ['websites', 'Websites & Landingpages', 'Schnelle, responsive Websites mit starker visueller Identität.', Globe, ['UX/UI', 'React/Next', 'Mobile first']],
      ['shops', 'Shops & Web-Apps', 'Skalierbare Plattformen, Formulare, Dashboards und Kundenbereiche.', ShoppingCart, ['Payments', 'APIs', 'Admin panels']],
      ['seo', 'SEO + AI Search', 'Technisches SEO, strukturierte Daten und Inhalte für Google und AI-Chats.', Search, ['Schema.org', 'AEO', 'Core Web Vitals']],
      ['business', 'Business Setup', 'Google Business Profile, Maps, Meta, Instagram, Facebook und VK sauber verbinden.', Megaphone, ['Google', 'Meta', 'VK']],
      ['analytics', 'Analytics & Ads', 'GA4, Tag Manager, Pixel, Events, Funnels und Conversion-Messung.', BarChart3, ['GA4', 'GTM', 'Pixels']],
      ['automation', 'CRM & Automatisierung', 'Leads, Benachrichtigungen, Workflows, Content-Pipelines und Integrationen.', Bot, ['CRM', 'Forms', 'Workflows']],
      ['security', 'Performance & Sicherheit', 'Optimierte Assets, saubere Builds, HTTPS, Backups und Monitoring.', ShieldCheck, ['Speed', 'Security', 'Monitoring']],
      ['support', 'Support & Wachstum', 'Updates, neue Seiten, Kampagnen, Content und laufende Verbesserung.', Settings, ['Care', 'Content', 'Growth']],
    ],
  },
  en: {
    badge: 'Services',
    title: 'Everything a business needs to win online.',
    subtitle: 'From the first idea to tracking, SEO, social channels, automation and continuous optimization.',
    items: [
      ['websites', 'Websites & landing pages', 'Fast responsive websites with a memorable visual identity.', Globe, ['UX/UI', 'React/Next', 'Mobile first']],
      ['shops', 'Shops & web apps', 'Scalable platforms, forms, dashboards and customer portals.', ShoppingCart, ['Payments', 'APIs', 'Admin panels']],
      ['seo', 'SEO + AI Search', 'Technical SEO, structured data and content for Google and AI chats.', Search, ['Schema.org', 'AEO', 'Core Web Vitals']],
      ['business', 'Business setup', 'Google Business Profile, Maps, Meta, Instagram, Facebook and VK.', Megaphone, ['Google', 'Meta', 'VK']],
      ['analytics', 'Analytics & ads', 'GA4, Tag Manager, pixels, events, funnels and conversion tracking.', BarChart3, ['GA4', 'GTM', 'Pixels']],
      ['automation', 'CRM & automation', 'Leads, notifications, workflows, content pipelines and integrations.', Bot, ['CRM', 'Forms', 'Workflows']],
      ['security', 'Performance & security', 'Optimized assets, clean builds, HTTPS, backups and monitoring.', ShieldCheck, ['Speed', 'Security', 'Monitoring']],
      ['support', 'Support & growth', 'Updates, new pages, campaigns, content and ongoing improvement.', Settings, ['Care', 'Content', 'Growth']],
    ],
  },
  ru: {
    badge: 'Услуги',
    title: 'Все, что нужно бизнесу для сильного запуска в интернете.',
    subtitle: 'От идеи и дизайна до SEO, AI-поиска, соцсетей, аналитики, CRM и автоматизации.',
    items: [
      ['websites', 'Сайты и лендинги', 'Быстрые адаптивные сайты с заметным визуальным стилем.', Globe, ['UX/UI', 'React/Next', 'Mobile first']],
      ['shops', 'Магазины и веб-приложения', 'Платформы, формы, кабинеты, админки и клиентские сценарии.', ShoppingCart, ['Payments', 'APIs', 'Admin panels']],
      ['seo', 'SEO + AI Search', 'Техническое SEO, schema.org и контент для Google и AI-чатов.', Search, ['Schema.org', 'AEO', 'Core Web Vitals']],
      ['business', 'Подключение бизнеса', 'Google Business Profile, Карты, Meta, Instagram, Facebook и VK.', Megaphone, ['Google', 'Meta', 'VK']],
      ['analytics', 'Аналитика и реклама', 'GA4, Tag Manager, пиксели, события, воронки и конверсии.', BarChart3, ['GA4', 'GTM', 'Pixels']],
      ['automation', 'CRM и автоматизация', 'Заявки, уведомления, пайплайны, контент и интеграции.', Bot, ['CRM', 'Forms', 'Workflows']],
      ['security', 'Скорость и безопасность', 'Оптимизация ассетов, сборки, HTTPS, бэкапы и мониторинг.', ShieldCheck, ['Speed', 'Security', 'Monitoring']],
      ['support', 'Поддержка и рост', 'Обновления, новые страницы, кампании, контент и улучшения.', Settings, ['Care', 'Content', 'Growth']],
    ],
  },
};

export function Services() {
  const { i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  return (
    <section id="services" className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/25 to-background" />
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-14 max-w-3xl"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Briefcase className="h-4 w-4" />
              {text.badge}
            </span>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">{text.title}</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{text.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {text.items.map(([key, title, description, Icon, features], index) => (
              <motion.article
                key={String(key)}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="service-card group relative min-h-[300px] overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-sm"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{String(title)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{String(description)}</p>
                <div className="mt-6 space-y-2">
                  {(features as string[]).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 grid gap-5 rounded-2xl border border-primary/20 bg-surface-2 p-6 text-foreground shadow-2xl md:grid-cols-[1fr_auto] md:items-center md:p-8"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-mono text-primary">
                <Sparkles className="h-4 w-4" />
                PL – Innovativ Digitalbau · Launch System
              </div>
              <h3 className="text-2xl font-black md:text-3xl">
                {lang === 'ru' ? 'Не просто сайт, а полная интернет-инфраструктура бизнеса.' : lang === 'de' ? 'Nicht nur eine Website, sondern eine komplette Online-Infrastruktur.' : 'Not just a website, but a complete online business infrastructure.'}
              </h3>
            </div>
            <AppWindow className="hidden h-20 w-20 text-primary md:block" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
