import { useTranslation } from 'react-i18next';
import { HomeScena } from '@/sections/scena/HomeScena';
import { PageMeta } from '@/components/pl/PageMeta';

export function Home() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as 'de' | 'en' | 'ru';
  const baseUrl = 'https://pavellevdin.ru';

  const titles = {
    en: 'Web Coding Hannover — websites, SEO, AI search | Innovativ Digitalbau',
    ru: 'Web Coding Hannover — сайты, SEO, AI-поиск | Innovativ Digitalbau',
    de: 'Web Coding Hannover — Websites, SEO, KI-Suche | Innovativ Digitalbau',
  };

  const descriptions = {
    en: 'Full digital launch for businesses: fast websites, web apps, SEO, AEO for AI search, Google Business, social setup, analytics and automation.',
    ru: 'Полный запуск бизнеса в интернете: быстрые сайты, веб-приложения, SEO, AEO для AI-поиска, Google Business, соцсети, аналитика и автоматизация.',
    de: 'Kompletter digitaler Business-Start: schnelle Websites, Web-Apps, SEO, AEO für AI Search, Google Business, Social Setup, Analytics und Automatisierung.',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${baseUrl}/#business`,
    name: 'Innovativ Digitalbau',
    founder: { '@type': 'Person', name: 'Pavel Levdin' },
    url: `${baseUrl}/${lang}`,
    image: `${baseUrl}${lang === 'de' ? '/og-image-de.jpg' : lang === 'en' ? '/og-image-en.jpg' : '/og-image.jpg'}`,
    logo: `${baseUrl}/brand/logo-1200.png`,
    areaServed: ['Germany', 'Europe', 'Russia'],
    knowsAbout: [
      'Web development',
      'Web coding',
      'SEO',
      'AI search optimization',
      'Google Business Profile setup',
      ...(lang === 'ru' ? ['Yandex Business setup'] : []),
      'Social media setup',
      'Analytics',
      'CRM automation',
      'API integrations',
    ],
    sameAs: ['https://t.me/PavelLevdin'],
  };

  return (
    <>
      {/* OG/twitter-картинка по языку, canonical и hreflang — из PageMeta; keywords/author — в index.html */}
      <PageMeta lang={lang} path="" title={titles[lang]} description={descriptions[lang]} jsonLd={jsonLd} />

      <HomeScena />
    </>
  );
}
