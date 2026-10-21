import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { getContacts } from '@/constants/contacts';
import { TelegramIcon, WhatsAppIcon } from '@/components/layout/social-icons';

/**
 * Плавающая кнопка связи: Telegram / WhatsApp / форма. На главной скрыта, пока виден hero (первый экран);
 * не показывается на страницах с формой (контакты, бриф) и прячется, когда в кадре CTA-блок (#contact).
 */
export function ContactFab({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const contacts = getContacts(lang);
  const onFormPage = /\/(contact|brief|review)(\/|$)/.test(location.pathname);

  // Видимость пишем в data-атрибут напрямую — без ре-рендеров на скролл
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isHome = /^\/(ru|de|en)\/?$/.test(location.pathname);
    let ctaVisible = false;
    const cta = document.getElementById('contact');
    const io = cta ? new IntersectionObserver(([e]) => { ctaVisible = e.isIntersecting; update(); }, { threshold: 0.1 }) : null;
    if (cta && io) io.observe(cta);
    function update() {
      const pastHero = !isHome || window.scrollY > window.innerHeight * 0.9;
      el!.dataset.visible = String(pastHero && !ctaVisible);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', update); io?.disconnect(); };
  }, [location.pathname]);

  // Смена маршрута закрывает меню
  const [prev, setPrev] = useState(location.pathname);
  if (prev !== location.pathname) { setPrev(location.pathname); setOpen(false); }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open]);

  if (onFormPage) return null;

  return (
    <div ref={ref} className="pl-fab" data-visible="false">
      <ul id="pl-fab-list" className="pl-fab__list" hidden={!open}>
        <li><a href={contacts.telegram.url} target="_blank" rel="noopener noreferrer"><TelegramIcon />{t('pl.fab.telegram')}</a></li>
        <li><a href={contacts.whatsapp.url} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{t('pl.fab.whatsapp')}</a></li>
        <li><Link to={`/${lang}/contact`}><span aria-hidden="true">✉</span>{t('pl.fab.form')}</Link></li>
      </ul>
      <button type="button" className="pl-fab__btn" aria-label={open ? t('pl.fab.close') : t('pl.fab.open')} aria-expanded={open} aria-controls="pl-fab-list" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">{open ? '×' : '✆'}</span>
        <span className="pl-fab__label">{open ? t('pl.fab.close') : t('pl.fab.open')}</span>
      </button>
    </div>
  );
}
