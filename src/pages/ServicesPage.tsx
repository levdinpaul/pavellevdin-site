import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Globe2,
  KeyRound,
  LineChart,
  MapPinned,
  Megaphone,
  Search,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type ServicesPageCopy = {
  title: string;
  desc: string;
  h1: string;
  sub: string;
  cta: string;
  fullCycle: string;
  systemTitle: string;
  systemText: string;
  services: [string, string, LucideIcon][];
};

const copy: Record<'de' | 'en' | 'ru', ServicesPageCopy> = {
  de: {
    title: 'Leistungen | PL Innovativ Digitalbau',
    desc: 'Web Coding, SEO, AI Search, Google Business, Social Media, Analytics, API, CRM und Automatisierung.',
    h1: 'Digitale Leistungen von Strategie bis Wachstum.',
    sub: 'Ein Ansprechpartner fuer Design, Entwicklung, Sichtbarkeit, Tracking, API-Verbindungen und Automatisierung.',
    cta: 'Konfigurator ausfuellen',
    fullCycle: 'Full-cycle Umsetzung',
    systemTitle: 'Nicht nur eine Website, sondern eine komplette Online-Infrastruktur.',
    systemText: 'Positionierung, Website, Google Business, Social Media, SEO, AEO, Analytics, API-Keys, CRM und Promotion arbeiten zusammen.',
    services: [
      ['Web Coding', 'Saubere React/Next-Struktur, responsive UI, schnelle Ladezeit und wartbarer Code.', Code2],
      ['Websites & Landingpages', 'Premium Design, klare Conversion-Struktur, Mehrsprachigkeit, Blog und Formulare.', Globe2],
      ['SEO + AI Search', 'Keywords, technische Struktur, Schema.org, AEO und Inhalte fuer KI-Antworten.', Search],
      ['Google Business', 'Profil, Maps, Kategorien, Bewertungen, UTM und lokale Signale.', Megaphone],
      ['Yandex Business & Local', 'Regionale Sichtbarkeit, Karten, Business-Profile und lokale Landingpages.', MapPinned],
      ['Social Media Setup', 'Instagram, Facebook, Meta Suite, VK, Telegram und Content-Basis.', Megaphone],
      ['Analytics & Ads', 'GA4, Tag Manager, Pixel, Events, Ziele, Funnels und Kampagnenbasis.', LineChart],
      ['API, Keys & Integrationen', 'API-Zugriffe, Webhooks, Messenger, CRM, Mail und Automations sauber verbinden.', KeyRound],
      ['CRM & Automation', 'Leads erfassen, verteilen, beantworten und in Workflows ueberfuehren.', Workflow],
      ['Performance & Security', 'Core Web Vitals, optimierte Assets, HTTPS, Backups und Monitoring.', ShieldCheck],
    ],
  },
  en: {
    title: 'Services | PL Innovativ Digitalbau',
    desc: 'Web coding, SEO, AI Search, Google Business, social media, analytics, API, CRM and automation.',
    h1: 'Digital services from strategy to growth.',
    sub: 'One partner for design, development, visibility, tracking, API connections and automation.',
    cta: 'Open configurator',
    fullCycle: 'Full-cycle delivery',
    systemTitle: 'Not just a website, but a complete online business infrastructure.',
    systemText: 'Positioning, website, Google Business, social media, SEO, AEO, analytics, API keys, CRM and promotion work together.',
    services: [
      ['Web coding', 'Clean React/Next structure, responsive UI, fast loading and maintainable code.', Code2],
      ['Websites & landing pages', 'Premium design, clear conversion structure, multilingual pages, blog and forms.', Globe2],
      ['SEO + AI Search', 'Keywords, technical structure, Schema.org, AEO and content for AI answers.', Search],
      ['Google Business', 'Profile, Maps, categories, reviews, UTM and local signals.', Megaphone],
      ['Yandex Business & local', 'Regional visibility, maps, business profiles and local landing pages.', MapPinned],
      ['Social media setup', 'Instagram, Facebook, Meta Suite, VK, Telegram and content foundation.', Megaphone],
      ['Analytics & ads', 'GA4, Tag Manager, pixels, events, goals, funnels and campaign foundation.', LineChart],
      ['API, keys & integrations', 'API access, webhooks, messengers, CRM, mail and automations connected cleanly.', KeyRound],
      ['CRM & automation', 'Capture, route, answer and process leads through workflows.', Workflow],
      ['Performance & security', 'Core Web Vitals, optimized assets, HTTPS, backups and monitoring.', ShieldCheck],
    ],
  },
  ru: {
    title: 'Услуги | PL Innovativ Digitalbau',
    desc: 'Веб-кодинг, SEO, AI Search, Google Business, соцсети, аналитика, API, CRM и автоматизация.',
    h1: 'Цифровые услуги от стратегии до роста.',
    sub: 'Один исполнитель для дизайна, разработки, видимости, аналитики, API-подключений, соцсетей и автоматизации.',
    cta: 'Заполнить конфигуратор',
    fullCycle: 'Полный цикл запуска',
    systemTitle: 'Не просто сайт, а полная интернет-инфраструктура бизнеса.',
    systemText: 'Позиционирование, сайт, Google Business, Яндекс Бизнес, соцсети, SEO, AEO, аналитика, API-ключи, CRM и продвижение работают вместе.',
    services: [
      ['Веб-кодинг', 'Чистая структура React/Next, адаптивный интерфейс, быстрая загрузка и поддерживаемый код.', Code2],
      ['Сайты и лендинги', 'Премиальный дизайн, структура под заявки, мультиязычность, блог, портфолио и формы.', Globe2],
      ['SEO + AI Search', 'Ключевые запросы, техническая структура, Schema.org, AEO и контент для ИИ-ответов.', Search],
      ['Google Business', 'Профиль, карты, категории, отзывы, UTM и локальные сигналы.', Megaphone],
      ['Яндекс Бизнес и карты', 'Профиль, региональная выдача, карты, категории, отзывы и локальные страницы.', MapPinned],
      ['Настройка соцсетей', 'Instagram, Facebook, Meta Suite, VK, Telegram и база для контента.', Megaphone],
      ['Метрики и реклама', 'GA4, Google Tag Manager, пиксели, события, цели, воронки и база для рекламы.', LineChart],
      ['API, ключи и интеграции', 'Получение API-ключей, webhooks, CRM, почта, Telegram-боты и внешние сервисы.', KeyRound],
      ['CRM и автоматизация', 'Принимать, распределять, обрабатывать заявки и вести пайплайны автоматически.', Workflow],
      ['Скорость и безопасность', 'Core Web Vitals, оптимизация ассетов, HTTPS, резервные копии и мониторинг.', ShieldCheck],
    ],
  },
};

export function ServicesPage() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{text.title}</title>
        <meta name="description" content={text.desc} />
        <link rel="canonical" href={`https://pavellevdin.ru/${lang}/services`} />
      </Helmet>

      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,.16),transparent_30%),radial-gradient(circle_at_78%_34%,rgba(245,158,11,.12),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Bot className="h-4 w-4" />
                PL Innovativ Digitalbau
              </span>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">{text.h1}</h1>
              <p className="mt-5 text-lg leading-8 text-white/68">{text.sub}</p>
            </motion.div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {text.services.map(([title, description, Icon], index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.035 }}
                  className="group min-h-[245px] rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075]"
                >
                  <Icon className="mb-5 h-8 w-8 text-cyan-200" />
                  <h2 className="text-lg font-black">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/58">{description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                    <Check className="h-4 w-4" />
                    {text.fullCycle}
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-cyan-300/16 bg-white/[0.07] p-6 shadow-2xl backdrop-blur md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h2 className="text-2xl font-black md:text-3xl">{text.systemTitle}</h2>
                  <p className="mt-3 max-w-3xl text-white/62">{text.systemText}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to={`/${lang}/brief`}>
                    <Button size="lg" className="h-12 w-full rounded-xl bg-cyan-300 font-black text-slate-950 hover:bg-cyan-200 md:w-auto">
                      {text.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to={`/${lang}/business-card`}>
                    <Button size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/20 bg-white/[0.05] text-white hover:bg-white hover:text-slate-950 md:w-auto">
                      {lang === 'ru' ? 'Онлайн-визитка' : lang === 'de' ? 'Visitenkarte' : 'Business card'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
