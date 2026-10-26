/* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */
// Веб-аналитика грузится ТОЛЬКО после согласия пользователя (152-ФЗ / cookie-consent).
// Скрипты вынесены из index.html, чтобы ничего не срабатывало до согласия.
// Яндекс.Метрика — только на /ru; на /de и /en — только GA4.

const GA_ID = 'G-PFRYET1M4T';
const YM_ID = 108284704;

let gaLoaded = false;
let ymLoaded = false;

export function loadAnalytics({ yandex }: { yandex: boolean }) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (!gaLoaded) {
    gaLoaded = true;
    loadGoogle(w);
  }
  if (yandex && !ymLoaded) {
    ymLoaded = true;
    loadYandex(w);
  }
}

function loadGoogle(w: any) {
  // Google Analytics 4
  const ga = document.createElement('script');
  ga.async = true;
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(ga);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID, { anonymize_ip: true });
}

function loadYandex(w: any) {
  // Яндекс.Метрика
  (function (m: any, e: any, t: any, r: any, i: any) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * (new Date() as any);
    for (let j = 0; j < e.scripts.length; j += 1) {
      if (e.scripts[j].src === r) return;
    }
    const k = e.createElement(t);
    const a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(w, document, 'script', `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`, 'ym');

  w.ym(YM_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

/** Цель аналитики: уходит в Метрику/GA4, только если они уже загружены (после согласия). Ошибки не пробрасываются. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  try {
    if (typeof w.ym === 'function') w.ym(YM_ID, 'reachGoal', event, params);
    if (typeof w.gtag === 'function') w.gtag('event', event, params);
  } catch { /* аналитика не должна ломать интерфейс */ }
}

let clicksBound = false;
/** Клики по Telegram / WhatsApp / почте в любом месте сайта — один делегированный слушатель.
 *  Ссылки соц-панели (data-social) и YouTube/VK дополнительно дают social_click { network }. */
export function bindContactClickGoals() {
  if (clicksBound || typeof document === 'undefined') return;
  clicksBound = true;
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const network = a.dataset.social
      || (/^https:\/\/(www\.)?youtube\.com\//.test(href) ? 'youtube' : /^https:\/\/(www\.)?vk\.com\//.test(href) ? 'vk' : '');
    if (network) track('social_click', { network });
    // Telegram-канал блога — не канал связи: только social_click, без цели click_telegram
    if (network === 'tgchannel') return;
    if (/^https:\/\/t\.me\//.test(href)) track('click_telegram');
    else if (/^https:\/\/wa\.me\//.test(href)) track('click_whatsapp');
    else if (href.startsWith('mailto:')) track('click_email');
  }, { capture: true });
}
