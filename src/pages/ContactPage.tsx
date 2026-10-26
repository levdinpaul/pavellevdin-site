import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageMeta } from '@/components/pl/PageMeta';
import { MailIcon, TelegramIcon, WhatsAppIcon } from '@/components/layout/social-icons';
import { getContacts } from '@/constants/contacts';
import { budgetBounds, formatAmount } from '@/data/pricing';
import { useFxRate } from '@/data/fx';
import { track } from '@/lib/analytics';

// Относительный путь: в dev идёт через vite-прокси на localhost:3001, в prod — same-origin.
// Для отдельного API-хоста задайте VITE_API_URL.
const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';
const LEAD_ENDPOINT = `${API_BASE}/api/lead`;

// Почта, @ник Telegram, ссылка t.me / wa.me / vk.com или номер (≥ 7 цифр) — то, куда можно ответить.
const CONTACT_RE = [
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  /^@[A-Za-z][A-Za-z0-9_]{4,31}$/,
  /^(https?:\/\/)?(t\.me|wa\.me|vk\.com)\/\S+$/i,
  /^\+?[\d\s()-]{7,20}$/,
];
const isPhoneLike = (v: string) => /^\+?[\d\s()-]+$/.test(v);
const isContact = (v: string) => CONTACT_RE.some((re) => re.test(v)) && (!isPhoneLike(v) || v.replace(/\D/g, '').length >= 7);

// Сообщения ошибок — ключи pl.contactPage.errors.*, переводятся при выводе.
const schema = z.object({
  name: z.string().trim().min(1, 'nameRequired').min(2, 'nameShort').max(200),
  contact: z.string().trim().min(1, 'contactRequired').max(200).refine(isContact, 'contactInvalid'),
  message: z.string().trim().min(1, 'messageRequired').min(10, 'messageShort').max(5000),
  budget: z.enum(['', 'low', 'mid', 'high', 'unknown']),
  consent: z.boolean().refine((v) => v, 'consentRequired'),
  company_website: z.string(),
});
type FormValues = z.infer<typeof schema>;
type Field = 'name' | 'contact' | 'message' | 'consent';

const EMPTY: FormValues = { name: '', contact: '', message: '', budget: '', consent: false, company_website: '' };

/** «Контакты»: обращение + прямые каналы слева, заявка справа (на мобильном — заявка сразу после заголовка). */
export function ContactPage() {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const c = (key: string, opts?: Record<string, string>) => t(`pl.contactPage.${key}`, opts);
  const contacts = getContacts(lang);
  const fx = useFxRate(lang);
  const [lo, hi] = budgetBounds(lang, fx);
  const budgets = {
    low: c('budgetLow', { v: formatAmount(lang, lo) }),
    mid: c('budgetMid', { lo: formatAmount(lang, lo), hi: formatAmount(lang, hi) }),
    high: c('budgetHigh', { v: formatAmount(lang, hi) }),
    unknown: c('budgetUnknown'),
  };

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const successRef = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: EMPTY,
  });

  // фокус: на заголовок успеха, а после «Написать ещё» — обратно в первое поле
  const wasSuccess = useRef(false);
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    else if (status === 'idle' && wasSuccess.current) setFocus('name');
    wasSuccess.current = status === 'success';
  }, [status, setFocus]);

  const onSubmit = handleSubmit(async (v) => {
    setStatus('sending');
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          page: 'contact',
          name: v.name,
          contact: v.contact,
          message: v.message,
          budget: v.budget ? budgets[v.budget] : '',
          language: lang,
          consent: v.consent,
          company_website: v.company_website,
        }),
      });
      if (!response.ok) throw new Error('Form submit failed');
      reset(EMPTY);
      setStatus('success');
      track('contact_submit');
    } catch {
      setStatus('error');
    }
  });

  // label + aria-invalid + aria-describedby на ошибке — одинаково для всех полей
  const a11y = (field: Field) => ({
    id: `cf-${field}`,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `cf-${field}-err` : undefined,
  });
  const fieldError = (field: Field) =>
    errors[field]?.message ? <p id={`cf-${field}-err`} className="pl-field__error">{c(`errors.${errors[field]?.message}`)}</p> : null;

  const channels = [
    { key: 'telegram', icon: <TelegramIcon size={18} />, label: 'Telegram', value: contacts.telegram.handle, href: contacts.telegram.url },
    { key: 'whatsapp', icon: <WhatsAppIcon size={18} />, label: 'WhatsApp', value: c('whatsapp'), href: contacts.whatsapp.url },
    { key: 'email', icon: <MailIcon size={18} />, label: c('email'), value: contacts.email, href: contacts.mailto },
    { key: 'tgchannel', icon: <TelegramIcon size={18} />, label: t('pl.rail.tgChannel'), value: '@levdin_blog', href: contacts.telegramChannel },
  ];

  return (
    <>
      <PageMeta lang={lang} path="/contact" title={c('title')} description={c('desc')} />

      <div className="pl-page">
        <section className="pl-container pl-contact" aria-labelledby="cf-title">
          <header className="pl-contact__intro">
            <p className="pl-eyebrow">{c('eyebrow')}</p>
            <h1 id="cf-title" className="pl-page__title">{c('h1')}</h1>
            <p className="pl-lead">{c('lead')}</p>
          </header>

          <div className="pl-contact__panel">
            {status === 'success' ? (
              <div className="pl-contact__done" role="status">
                <span className="pl-contact__done-mark" aria-hidden="true">✓</span>
                <h2 ref={successRef} tabIndex={-1} className="pl-contact__panel-title">{c('successTitle')}</h2>
                <p>{c('successText')}</p>
                <button type="button" className="pl-btn pl-btn--ghost" onClick={() => setStatus('idle')}>{c('again')}</button>
              </div>
            ) : (
              <form className="pl-form" onSubmit={onSubmit} noValidate aria-labelledby="cf-form-title">
                <h2 id="cf-form-title" className="pl-contact__panel-title">{c('formTitle')}</h2>
                <div className="pl-field">
                  <label htmlFor="cf-name">{c('name')}</label>
                  <input {...register('name')} {...a11y('name')} aria-required="true" autoComplete="name" maxLength={200} placeholder={c('namePh')} />
                  {fieldError('name')}
                </div>
                <div className="pl-field">
                  <label htmlFor="cf-contact">{c('contact')}</label>
                  <input {...register('contact')} {...a11y('contact')} aria-required="true" autoComplete="email" maxLength={200} placeholder={c('contactPh')} />
                  {fieldError('contact')}
                </div>
                <div className="pl-field">
                  <label htmlFor="cf-message">{c('message')}</label>
                  <textarea {...register('message')} {...a11y('message')} aria-required="true" rows={6} maxLength={5000} placeholder={c('messagePh')} />
                  {fieldError('message')}
                </div>
                <div className="pl-field">
                  <label htmlFor="cf-budget">{c('budget')} <span className="pl-field__opt">— {c('optional')}</span></label>
                  <select id="cf-budget" {...register('budget')}>
                    <option value="">{c('budgetNone')}</option>
                    {(Object.keys(budgets) as (keyof typeof budgets)[]).map((k) => <option key={k} value={k}>{budgets[k]}</option>)}
                  </select>
                </div>
                {/* honeypot против спам-ботов */}
                <input type="text" {...register('company_website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="pl-hp" />
                <div>
                  <label className="pl-check" htmlFor="cf-consent">
                    <input type="checkbox" {...register('consent')} {...a11y('consent')} aria-required="true" />
                    <span>{c('consent')} <Link to={`/${lang}/privacy`} className="pl-link">{t('pl.footer.privacy')}</Link></span>
                  </label>
                  {fieldError('consent')}
                </div>
                <button type="submit" className="pl-btn pl-btn--primary pl-contact__submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                  {status === 'sending' ? c('sending') : c('send')}
                </button>
                {status === 'error' && (
                  <div className="pl-contact__error" role="alert">
                    <p><strong>{c('errorTitle')}.</strong> {c('errorText')}</p>
                    <div className="pl-contact__error-actions">
                      <button type="button" className="pl-btn pl-btn--ghost" onClick={() => onSubmit()}>{c('retry')}</button>
                      <a className="pl-link" href={contacts.telegram.url} target="_blank" rel="noopener noreferrer">{c('telegram')}</a>
                    </div>
                  </div>
                )}
              </form>
            )}
            <p className="pl-contact__brief">{c('briefHint')} <Link to={`/${lang}/brief`} className="pl-link">{c('briefLink')}</Link></p>
          </div>

          <aside className="pl-contact__aside" aria-label={c('direct')}>
            <figure className="pl-contact__photo">
              <picture>
                <source type="image/avif" srcSet="/about/photo-480.avif" />
                <img src="/about/photo-480.webp" width={480} height={666} alt={t('pl.aboutPage.photoAlt')} loading="lazy" decoding="async" />
              </picture>
            </figure>
            <div className="pl-contact__direct">
              <p className="pl-contact__label">{c('direct')}</p>
              <ul className="pl-contact__channels">
                {channels.map((ch) => (
                  <li key={ch.key}>
                    <a href={ch.href} data-social={ch.key} {...(ch.key === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
                      <span className="pl-contact__icon">{ch.icon}</span>
                      <span><span className="pl-contact__ch-label">{ch.label}</span><span className="pl-contact__ch-value">{ch.value}</span></span>
                    </a>
                  </li>
                ))}
                <li>
                  <Link to={`/${lang}/business-card`} data-social="card">
                    <span className="pl-contact__icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" /></svg>
                    </span>
                    <span><span className="pl-contact__ch-label">{c('cardHint')}</span><span className="pl-contact__ch-value">{c('cardTitle')}</span></span>
                  </Link>
                </li>
              </ul>
              <p className="pl-contact__meta"><span className="pl-contact__dot" aria-hidden="true" /><span>{c('reply')} ·</span><span>{c('city')}</span></p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
