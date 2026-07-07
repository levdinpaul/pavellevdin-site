import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bot, Building2, Check, Facebook, LineChart, MapPinned, MessageCircle, Search, Share2, type LucideIcon } from 'lucide-react';

type EcosystemCopy = {
  badge: string;
  title: string;
  subtitle: string;
  steps: [string, string, string][];
};

const copy: Record<'de' | 'en' | 'ru', EcosystemCopy> = {
  de: {
    badge: 'Kompletter Online-Start',
    title: 'Ich verbinde Website, Suche, Social Media und Vertrieb zu einem System.',
    subtitle: 'Damit Kunden dich nicht nur finden, sondern sofort verstehen, vertrauen und Kontakt aufnehmen.',
    steps: [
      ['01', 'Positionierung', 'Angebot, Zielgruppe, Struktur, starke Botschaft'],
      ['02', 'Website', 'Design, Entwicklung, Ladezeit, mobile UX'],
      ['03', 'Sichtbarkeit', 'SEO, AEO, Google Business, Maps, Schema.org'],
      ['04', 'Kanäle', 'Meta, Instagram, Facebook, VK, Pixel und Events'],
      ['05', 'Leads', 'Formulare, Messenger, CRM, Automatisierung'],
    ],
  },
  en: {
    badge: 'Complete online launch',
    title: 'I connect website, search, social channels and sales into one system.',
    subtitle: 'So customers can find you, understand you, trust you and contact you immediately.',
    steps: [
      ['01', 'Positioning', 'Offer, audience, structure and strong message'],
      ['02', 'Website', 'Design, development, speed and mobile UX'],
      ['03', 'Visibility', 'SEO, AEO, Google Business, Maps, Schema.org'],
      ['04', 'Channels', 'Meta, Instagram, Facebook, VK, pixels and events'],
      ['05', 'Leads', 'Forms, messengers, CRM and automation'],
    ],
  },
  ru: {
    badge: 'Полный запуск бизнеса онлайн',
    title: 'Я соединяю сайт, поиск, соцсети и заявки в одну рабочую систему.',
    subtitle: 'Чтобы клиент не просто увидел тебя, а понял ценность, доверился и оставил заявку.',
    steps: [
      ['01', 'Позиционирование', 'Оффер, аудитория, структура и сильное сообщение'],
      ['02', 'Сайт', 'Дизайн, разработка, скорость и мобильная UX'],
      ['03', 'Видимость', 'SEO, AEO, Google Business, Карты, Schema.org'],
      ['04', 'Каналы', 'Meta, Instagram, Facebook, VK, пиксели и события'],
      ['05', 'Заявки', 'Формы, мессенджеры, CRM и автоматизация'],
    ],
  },
};

const icons: LucideIcon[] = [Building2, Search, MapPinned, Share2, MessageCircle];

export function DigitalEcosystem() {
  const { i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,.22),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,.18),transparent_28%)]" />
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-7xl text-white">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-end"
          >
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Bot className="h-4 w-4" />
                {text.badge}
              </span>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">{text.title}</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">{text.subtitle}</p>
            </div>

            <div className="grid gap-3">
              {text.steps.map(([num, title, description], index) => {
                const Icon = icons[index] || Check;
                return (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, x: 28 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.08]"
                  >
                    <div className="font-mono text-sm font-bold tabular-nums text-white/35">{num}</div>
                    <div>
                      <h3 className="font-bold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [LineChart, 'Analytics', 'GA4, GTM, pixels, events'],
              [Facebook, 'Social', 'Meta, Instagram, Facebook, VK'],
              [Bot, 'AI-ready', 'Structured content for AI answers'],
            ].map(([Icon, title, description]) => (
              <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <Icon className="mb-4 h-6 w-6 text-amber-200" />
                <p className="font-bold">{String(title)}</p>
                <p className="mt-1 text-sm text-white/55">{String(description)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
