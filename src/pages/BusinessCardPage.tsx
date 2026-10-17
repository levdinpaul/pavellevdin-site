import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Globe2, Mail, MapPin, Phone, Send, Share2, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const copy = {
  de: {
    title: 'Online-Visitenkarte | Pavel Levdin',
    desc: 'Online-Visitenkarte von Pavel Levdin: Webentwicklung, SEO, Google Business, Social Media und Automation.',
    role: 'Web Coding, SEO, AI Search und digitale Business-Systeme',
    h1: 'Pavel Levdin',
    sub: 'Ich baue schnelle Websites, Web-Apps und komplette Online-Infrastrukturen fuer Unternehmen: Google Business, Social Media, Analytics, APIs, CRM und Automatisierung.',
    project: 'Projekt starten',
    brief: 'Konfigurator',
    save: 'Kontakt speichern',
    location: 'Hannover, Deutschland',
  },
  en: {
    title: 'Online Business Card | Pavel Levdin',
    desc: 'Online business card of Pavel Levdin: web development, SEO, Google Business, social media and automation.',
    role: 'Web coding, SEO, AI Search and digital business systems',
    h1: 'Pavel Levdin',
    sub: 'I build fast websites, web apps and complete online infrastructure for businesses: Google Business, social media, analytics, APIs, CRM and automation.',
    project: 'Start project',
    brief: 'Configurator',
    save: 'Save contact',
    location: 'Hannover, Germany',
  },
  ru: {
    title: 'Онлайн-визитка | Павел Левдин',
    desc: 'Онлайн-визитка Павла Левдина: веб-разработка, SEO, Google Business, соцсети и автоматизация.',
    role: 'Веб-кодинг, SEO, AI Search и цифровые системы для бизнеса',
    h1: 'Павел Левдин',
    sub: 'Создаю быстрые сайты, веб-приложения и полную онлайн-инфраструктуру для бизнеса: Google Business, соцсети, аналитику, API, CRM и автоматизацию.',
    project: 'Запустить проект',
    brief: 'Конфигуратор',
    save: 'Сохранить контакт',
    location: 'Ганновер, Германия',
  },
};

const vcard = `BEGIN:VCARD
VERSION:3.0
N:Levdin;Pavel;;;
FN:Pavel Levdin
ORG:PL Innovativ Digitalbau
TITLE:Web Developer / Digital Business Systems
TEL;TYPE=CELL:+4917643141306
EMAIL:levdin.pavel@yandex.ru
URL:https://pavellevdin.ru/ru
ADR;TYPE=WORK:;;Am Dobben 102A;Bremen;;28211;Germany
END:VCARD`;

const contactRows: [LucideIcon, string, string, string | null][] = [
  [Send, 'Telegram', '@PavelLevdin', 'https://t.me/PavelLevdin'],
  [Phone, 'WhatsApp', '+49 176 43141306', 'https://wa.me/4917643141306'],
  [Mail, 'Email', 'levdin.pavel@yandex.ru', 'mailto:levdin.pavel@yandex.ru'],
  [Globe2, 'Website', 'pavellevdin.ru', null],
  [MapPin, 'Location', '', null],
];

export function BusinessCardPage() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as keyof typeof copy;
  const text = copy[lang];

  const downloadVcard = () => {
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pavel-levdin.vcf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareCard = async () => {
    const shareData = {
      title: text.title,
      text: text.sub,
      url: `https://pavellevdin.ru/${lang}/business-card`,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{text.title}</title>
        <meta name="description" content={text.desc} />
        <link rel="canonical" href={`https://pavellevdin.ru/${lang}/business-card`} />
      </Helmet>

      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(34,211,238,.22),transparent_32%),radial-gradient(circle_at_78%_68%,rgba(245,158,11,.14),transparent_28%)]" />
          <div className="absolute inset-0 bg-dot-grid opacity-25" />

          <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Sparkles className="h-4 w-4" />
                PL Innovativ Digitalbau
              </span>
              <h1 className="text-5xl font-black leading-none md:text-7xl">{text.h1}</h1>
              <p className="mt-4 text-xl font-semibold text-cyan-100/82">{text.role}</p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">{text.sub}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={`/${lang}/contact`}>
                  <Button className="h-12 w-full rounded-xl bg-cyan-300 px-6 font-black text-slate-950 hover:bg-cyan-200 sm:w-auto">
                    {text.project}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to={`/${lang}/brief`}>
                  <Button variant="outline" className="h-12 w-full rounded-xl border-white/18 bg-white/[0.06] px-6 font-bold text-white hover:bg-white hover:text-slate-950 sm:w-auto">
                    {text.brief}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div className="rounded-[1.5rem] border border-cyan-300/16 bg-slate-950/70 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/12 text-2xl font-black text-cyan-100">
                      PL
                    </div>
                    <h2 className="mt-5 text-3xl font-black">Pavel Levdin</h2>
                    <p className="mt-1 text-cyan-100/70">PL Innovativ Digitalbau</p>
                  </div>
                  <button onClick={shareCard} className="rounded-xl border border-white/10 bg-white/[0.08] p-3 text-white/70 transition hover:bg-white/[0.12] hover:text-white" aria-label="Share">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-7 grid gap-3">
                  {contactRows.map(([Icon, label, rawValue, rawHref]) => {
                    const value = label === 'Location' ? text.location : rawValue;
                    const href = label === 'Website' ? `https://pavellevdin.ru/${lang}` : rawHref;
                    const content = (
                      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.07]">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-xs uppercase tracking-wide text-white/38">{String(label)}</span>
                          <span className="block font-semibold text-white/82">{String(value)}</span>
                        </span>
                      </div>
                    );
                    return href ? (
                      <a key={String(label)} href={String(href)} target={String(href).startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                        {content}
                      </a>
                    ) : (
                      <div key={String(label)}>{content}</div>
                    );
                  })}
                </div>

                <Button onClick={downloadVcard} className="mt-5 h-12 w-full rounded-xl bg-white font-black text-slate-950 hover:bg-cyan-100">
                  <Download className="mr-2 h-5 w-5" />
                  {text.save}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
