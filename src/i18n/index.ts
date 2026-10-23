/* eslint-disable @typescript-eslint/no-explicit-any */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ru (фаза 1, fallback) — в стартовом бандле; de/en подгружаются отдельными чанками через ensureLocale().
import ruTranslations from './locales/ru.json';

// Русские тексты для privacy и imprint (если их нет в ru.json)
const ruPrivacy = {
  seo: {
    title: "Политика конфиденциальности | Павел Левдин",
    description: "Информация о защите данных и обработке персональных данных."
  },
  title: "Политика конфиденциальности",
  section1: {
    title: "Оператор данных",
    text: "Оператором данных является Павел Левдин, Ганновер, Германия. По вопросам защиты данных вы можете связаться с нами в любое время."
  },
  section2: {
    title: "Сбор данных",
    text: "Мы собираем только те данные, которые необходимы для предоставления наших услуг. Это включает технические данные (IP-адрес, тип браузера) и добровольные запросы."
  },
  section3: {
    title: "Безопасность данных",
    text: "Мы применяем технические и организационные меры для защиты ваших данных от потери, манипуляций и несанкционированного доступа. Все передачи данных осуществляются в зашифрованном виде."
  },
  section4: {
    title: "Cookies и отслеживание",
    text: "Наш сайт использует только необходимые cookies. Сторонние сервисы отслеживания не используются. Вы можете отключить cookies в настройках браузера."
  },
  contact: "Контакт по вопросам конфиденциальности",
  lastUpdated: "Последнее обновление"
};

const ruImprint = {
  seo: {
    title: "Контакты и реквизиты | Павел Левдин",
    description: "Юридическая информация и контакты."
  },
  title: "Контакты и реквизиты",
  owner: "Владелец сайта",
  ownerName: "Павел Левдин",
  address: "Адрес",
  addressLine1: "Hannover",
  addressLine2: "Германия",
  country: "Германия",
  email: "Email",
  lastUpdated: "Последнее обновление"
};

const ruWithPrivacy = {
  ...ruTranslations,
  privacy: (ruTranslations as any).privacy || ruPrivacy,
  imprint: (ruTranslations as any).imprint || ruImprint
};

const resources = {
  ru: { translation: ruWithPrivacy },
} as any;

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  de: () => import('./locales/de.json'),
  en: () => import('./locales/en.json'),
};

/** Догружает ресурсы языка (de/en), если их ещё нет. Вызывать ДО гидрации/рендера и до changeLanguage. */
export async function ensureLocale(lang: string): Promise<void> {
  const load = loaders[lang];
  if (!load || i18n.hasResourceBundle(lang, 'translation')) return;
  const mod = await load();
  i18n.addResourceBundle(lang, 'translation', mod.default, true, true);
}

/** Смена языка с предварительной загрузкой ресурсов — без кадра с fallback-текстами. */
export async function setLanguage(lang: string): Promise<void> {
  await ensureLocale(lang);
  if (i18n.language !== lang) await i18n.changeLanguage(lang);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: false,
    // Ресурсы ru заданы инлайн (без async-backend), поэтому инициализируем СИНХРОННО
    // и БЕЗ Suspense. Иначе при гидрации пререндера useTranslation() успевал «подвиснуть»
    // на async-init → клиент рендерил Suspense-fallback (спиннер) вместо контента →
    // hydration mismatch → React перерисовывал всё дерево → LCP скакал на момент гидрации
    // (~12.6s на мобиле). Синхронный init без Suspense убирает рассинхрон.
    // de/en: main.tsx и entry-server ждут ensureLocale() до рендера — разметка совпадает с пререндером.
    initImmediate: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
  });

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];
