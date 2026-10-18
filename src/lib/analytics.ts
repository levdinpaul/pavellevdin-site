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
