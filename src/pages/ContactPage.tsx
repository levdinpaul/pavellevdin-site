import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/pl/PageMeta';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Send, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getContacts } from '@/constants/contacts';
import { track } from '@/lib/analytics';

// Относительный путь: в dev идёт через vite-прокси на localhost:3001, в prod — same-origin.
// Для отдельного API-хоста задайте VITE_API_URL.
const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';
const LEAD_ENDPOINT = `${API_BASE}/api/lead`;


const copy = {
  de: {
    title: 'Kontakt | Pavel Levdin',
    desc: 'Kontakt für Websites, SEO, Google Business, Social Media, Analytics, API und Automatisierung.',
    badge: 'Antwort normalerweise innerhalb von 24 Stunden',
    h1: 'Lass uns dein digitales System planen.',
    sub: 'Schreib kurz, was du brauchst. Für größere Projekte kannst du direkt den Konfigurator nutzen.',
    name: 'Name',
    contact: 'Email, Telegram oder WhatsApp',
    message: 'Nachricht',
    send: 'Nachricht senden',
    brief: 'Konfigurator öffnen',
    success: 'Danke. Deine Nachricht ist angekommen.',
    error: 'Senden fehlgeschlagen. Schreib mir direkt in Telegram: @PavelLevdin',
    consent: 'Ich stimme der Verarbeitung meiner Daten zur Bearbeitung der Anfrage zu.',
    consentLink: 'Datenschutz',
    whatsapp: 'Nachricht in WhatsApp',
  },
  en: {
    title: 'Contact | Pavel Levdin',
    desc: 'Contact for websites, SEO, Google Business, social media, analytics, API and automation.',
    badge: 'Usually replies within 24 hours',
    h1: 'Let us plan your digital system.',
    sub: 'Send a short message. For larger projects, use the configurator.',
    name: 'Name',
    contact: 'Email, Telegram or WhatsApp',
    message: 'Message',
    send: 'Send message',
    brief: 'Open configurator',
    success: 'Thank you. Your message has arrived.',
    error: 'Sending failed. Message me directly on Telegram: @PavelLevdin',
    consent: 'I agree to the processing of my data to handle this request.',
    consentLink: 'Privacy Policy',
    whatsapp: 'Message on WhatsApp',
  },
  ru: {
    title: 'Контакты | Павел Левдин',
    desc: 'Контакты для заказа сайта, SEO, Google Business, соцсетей, аналитики, API и автоматизации.',
    badge: 'Обычно отвечаю в течение 24 часов',
    h1: 'Давайте спланируем вашу цифровую систему.',
    sub: 'Напишите коротко, что нужно. Для большого проекта лучше сразу заполнить конфигуратор.',
    name: 'Имя',
    contact: 'Email, Telegram или WhatsApp',
    message: 'Сообщение',
    send: 'Отправить сообщение',
    brief: 'Открыть конфигуратор',
    success: 'Спасибо. Сообщение отправлено.',
    error: 'Не удалось отправить. Напишите мне в Telegram: @PavelLevdin',
    consent: 'Я согласен на обработку персональных данных для обработки заявки.',
    consentLink: 'Политика конфиденциальности',
    whatsapp: 'Написать в WhatsApp',
  },
};

export function ContactPage() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as keyof typeof copy;
  const text = copy[lang];
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const contacts = getContacts(lang);
  const contactRows: [LucideIcon, string, string, string][] = [
    [Send, 'Telegram', contacts.telegram.handle, contacts.telegram.url],
    [MessageCircle, 'WhatsApp', text.whatsapp, contacts.whatsapp.url],
    [Mail, 'Email', contacts.email, contacts.mailto],
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          page: 'contact',
          name: data.get('name'),
          contact: data.get('contact'),
          message: data.get('message'),
          language: lang,
          consent: data.get('consent') === 'on',
          company_website: data.get('company_website') || '',
        }),
      });
      if (!response.ok) throw new Error('Form submit failed');
      form.reset();
      setStatus('success');
      track('contact_submit');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <PageMeta lang={lang} path="/contact" title={text.title} description={text.desc} />

      <div className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">

                {text.badge}
              </span>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">{text.h1}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/66">{text.sub}</p>

              <div className="mt-8 grid gap-3">
                {contactRows.map(([Icon, label, value, href]) => (
                  <a
                    key={String(label)}
                    href={String(href)}
                    target={String(href).startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-1 hover:bg-white/[0.08]"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-white/42">{String(label)}</span>
                      <span className="font-bold text-white/82">{String(value)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl md:p-8"
            >
              <div className="grid gap-5">
                <div>
                  <Label htmlFor="name">{text.name}</Label>
                  <Input id="name" name="name" required className="mt-2 border-white/10 bg-slate-950/50 text-white" />
                </div>
                <div>
                  <Label htmlFor="contact">{text.contact}</Label>
                  <Input id="contact" name="contact" required className="mt-2 border-white/10 bg-slate-950/50 text-white" />
                </div>
                <div>
                  <Label htmlFor="message">{text.message}</Label>
                  <Textarea id="message" name="message" rows={8} required className="mt-2 border-white/10 bg-slate-950/50 text-white" />
                </div>
                {/* honeypot против спам-ботов */}
                <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <label className="flex items-start gap-3 text-sm text-white/60">
                  <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-cyan-300" />
                  <span>
                    {text.consent}{' '}
                    <Link to={`/${lang}/privacy`} className="text-cyan-200 underline">{text.consentLink}</Link>
                  </span>
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button disabled={status === 'sending'} className="h-12 rounded-xl bg-cyan-300 font-black text-slate-950 hover:bg-cyan-200">
                    {text.send}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/20 bg-white/[0.05] text-white hover:bg-white hover:text-slate-950">
                    <Link to={`/${lang}/brief`}>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {text.brief}
                    </Link>
                  </Button>
                </div>
                {status === 'success' && <p role="status" className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">{text.success}</p>}
                {status === 'error' && <p role="alert" className="rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{text.error}</p>}
              </div>
            </motion.form>
          </div>
        </section>
      </div>
    </>
  );
}
