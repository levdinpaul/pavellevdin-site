import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE } from '@/components/pl/seo';
import { QrCode } from '@/components/pl/QrCode';
import { BrandMark } from '@/components/layout/BrandMark';
import { GlobeIcon, MailIcon, PhoneIcon, PinIcon, TelegramIcon, VkIcon, WhatsAppIcon, YouTubeIcon } from '@/components/layout/social-icons';
import { PHONE, getContacts, getSameAs, getSocialLinks, type SocialNetwork } from '@/constants/contacts';
import { useQrMatrix } from '@/lib/qr';
import { buildVcard, downloadBlob, fetchBase64 } from '@/lib/vcard';
import { useBuildReveal } from '@/components/BuildReveal';

const SOCIAL_ICONS: Partial<Record<SocialNetwork, ReactNode>> = {
  telegram: <TelegramIcon size={20} />,
  tgchannel: <TelegramIcon size={20} />,
  whatsapp: <WhatsAppIcon size={20} />,
  youtube: <YouTubeIcon size={20} />,
  vk: <VkIcon size={20} />,
};
// Тип профиля для X-SOCIALPROFILE в .vcf
const VCARD_TYPES: Partial<Record<SocialNetwork, string>> = { telegram: 'telegram', tgchannel: 'telegram', whatsapp: 'whatsapp', youtube: 'youtube', vk: 'vkontakte' };

const noopSubscribe = () => () => {};

/**
 * Цифровая визитка. Единственная страница, где телефон показан текстом (решение Pavel 2026-10-24),
 * поэтому noindex, нет в sitemap, в JSON-LD телефона нет. QR, .vcf и PNG собираются в браузере.
 */
export function BusinessCardPage() {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const c = (key: string) => t(`pl.cardPage.${key}`);
  const contacts = getContacts(lang);
  const pageUrl = `${SITE}/${lang}/business-card`;
  const siteUrl = `${SITE}/${lang}`;
  const social = getSocialLinks(lang)
    .filter((s) => SOCIAL_ICONS[s.network])
    .map((s) => (s.labelKey ? { ...s, label: t(s.labelKey) } : s));
  const qr = useQrMatrix(pageUrl);
  const cardRef = useRef<HTMLElement>(null);
  // Появление (prompt-9844): слой каркаса/курсоров хук кладёт в document.body, а не в cardRef; PNG рисуется
  // из данных (renderCardImage), .vcf — из строк, QR — из матрицы. Артефакты сборки в экспорт не попадают.
  const buildRoot = useRef<HTMLDivElement>(null);
  useBuildReveal(buildRoot);
  const canShare = useSyncExternalStore(noopSubscribe, () => typeof navigator.share === 'function', () => false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'' | 'vcf' | 'image'>('');
  // фото для .vcf грузим заранее: клик → скачивание без долгого await (iOS не теряет жест пользователя)
  const photo = useRef<Promise<string | undefined> | null>(null);
  useEffect(() => { photo.current = fetchBase64('/about/photo-vcard.jpg'); }, []);

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3000);
  };

  const rows = [
    { key: 'phone', icon: <PhoneIcon />, label: c('phone'), value: PHONE.display, href: `tel:${PHONE.tel}` },
    { key: 'whatsapp', icon: <WhatsAppIcon />, label: 'WhatsApp', value: c('whatsappValue'), href: contacts.whatsapp.url },
    { key: 'telegram', icon: <TelegramIcon />, label: 'Telegram', value: contacts.telegram.handle, href: contacts.telegram.url },
    { key: 'email', icon: <MailIcon />, label: c('email'), value: contacts.email, href: contacts.mailto },
    { key: 'site', icon: <GlobeIcon />, label: c('site'), value: 'pavellevdin.ru', href: siteUrl },
    { key: 'city', icon: <PinIcon />, label: c('city'), value: c('cityValue'), href: null },
  ];

  const saveContact = async () => {
    if (busy) return;
    setBusy('vcf');
    const vcf = buildVcard({
      title: c('role'),
      tel: PHONE.tel,
      email: contacts.email,
      site: siteUrl,
      social: social.filter((s) => VCARD_TYPES[s.network]).map((s) => ({ label: s.label, type: VCARD_TYPES[s.network]!, url: s.url })),
      photoBase64: await (photo.current ?? fetchBase64('/about/photo-vcard.jpg')),
    });
    downloadBlob(new Blob([vcf], { type: 'text/vcard;charset=utf-8' }), 'pavel-levdin.vcf');
    setBusy('');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      flash(c('copied'));
    } catch {
      flash(c('copyError'));
    }
  };

  const share = async () => {
    if (!canShare) return copyLink();
    try {
      await navigator.share({ title: c('title'), text: c('shareText'), url: pageUrl });
    } catch (e) {
      // закрытое окно «Поделиться» — не ошибка; остальные сбои → копируем ссылку
      if ((e as Error).name !== 'AbortError') await copyLink();
    }
  };

  const downloadImage = async () => {
    const card = cardRef.current;
    if (!card || busy) return;
    setBusy('image');
    try {
      const svg = (sel: string) => card.querySelector(`${sel} svg`)?.outerHTML ?? '';
      const { renderCardImage } = await import('@/lib/card-image');
      const blob = await renderCardImage({
        name: 'Pavel Levdin',
        company: 'Innovativ Digitalbau',
        role: c('role'),
        mark: svg('.pl-vcard__mark'),
        // тот же набор, что на странице (промпт 12b); на картинке ссылок нет — у WhatsApp показываем сам номер
        rows: rows.map((r) => ({ icon: svg(`[data-row="${r.key}"] .pl-vcard__icon`), label: r.label, value: r.key === 'whatsapp' ? PHONE.display : r.value })),
        social: social.map((s) => svg(`[data-social="${s.network}"]`)),
        photo: '/about/photo-720.webp',
        qr,
        qrHint: c('qrHint'),
        qrUrl: pageUrl.replace('https://', ''),
      });
      downloadBlob(blob, 'pavel-levdin-card.png');
    } catch {
      flash(c('imageError'));
    } finally {
      setBusy('');
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Pavel Levdin',
    jobTitle: c('role'),
    url: siteUrl,
    image: `${SITE}/about/photo-720.webp`,
    worksFor: { '@type': 'Organization', name: 'Innovativ Digitalbau', url: SITE },
    address: { '@type': 'PostalAddress', addressLocality: 'Hannover', addressCountry: 'DE' },
    sameAs: [SITE, ...getSameAs()],
  };

  return (
    <>
      <PageMeta lang={lang} path="/business-card" title={c('title')} description={c('desc')} image="/og/about.jpg" jsonLd={jsonLd} noindex />

      <div ref={buildRoot} className="pl-page pl-vcard-page">
        <section className="pl-container pl-vcard">
          <p className="pl-eyebrow pl-vcard__eyebrow" data-build="">{c('eyebrow')}</p>

          <article ref={cardRef} className="pl-vcard__card" aria-labelledby="vc-name" data-build="" data-pl-build="outline-draw">
            <div className="pl-vcard__top">
              <picture className="pl-vcard__photo">
                <source type="image/avif" srcSet="/about/photo-480.avif" />
                <img src="/about/photo-480.webp" width={480} height={666} alt={c('photoAlt')} decoding="async" />
              </picture>
              <span className="pl-vcard__mark"><BrandMark size={44} /></span>
            </div>
            <h1 id="vc-name" className="pl-vcard__name">Pavel Levdin</h1>
            <p className="pl-vcard__company">Innovativ Digitalbau</p>
            <p className="pl-vcard__role">{c('role')}</p>

            <ul className="pl-vcard__rows">
              {rows.map((r) => {
                const body = (
                  <>
                    <span className="pl-vcard__icon">{r.icon}</span>
                    <span className="pl-vcard__label">{r.label}</span>
                    <span className="pl-vcard__value">{r.value}</span>
                  </>
                );
                return (
                  <li key={r.key} data-row={r.key}>
                    {r.href ? (
                      <a href={r.href} {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{body}</a>
                    ) : (
                      <div>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <ul className="pl-vcard__social" aria-label={c('social')}>
              {social.map((s) => (
                <li key={s.network}>
                  <a href={s.url} data-social={s.network} aria-label={s.label} title={s.label} target="_blank" rel="noopener noreferrer">
                    {SOCIAL_ICONS[s.network]}
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <aside className="pl-vcard__side" data-build="" data-pl-build="typewriter">
            <figure className="pl-vcard__qr">
              <div className="pl-vcard__qr-box">{qr && <QrCode matrix={qr} label={c('qrAlt')} />}</div>
              <figcaption>{c('qrHint')}</figcaption>
            </figure>
            <div className="pl-vcard__actions">
              <button type="button" className="pl-btn pl-btn--primary" onClick={saveContact} disabled={busy === 'vcf'}>{c('save')}</button>
              <button type="button" className="pl-btn pl-btn--ghost" onClick={share}>{canShare ? c('share') : c('copy')}</button>
              {canShare && <button type="button" className="pl-btn pl-btn--ghost" onClick={copyLink}>{c('copy')}</button>}
              <button type="button" className="pl-btn pl-btn--ghost" onClick={downloadImage} disabled={busy === 'image' || !qr} aria-busy={busy === 'image'}>
                {busy === 'image' ? c('imageBusy') : c('image')}
              </button>
              <p className="pl-vcard__copied" role="status" aria-live="polite">{notice}</p>
            </div>
            <Link to={`/${lang}/contact`} className="pl-link pl-vcard__project">{c('project')} →</Link>
          </aside>
        </section>
      </div>
    </>
  );
}
