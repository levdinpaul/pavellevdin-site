import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { HomeScena } from '@/sections/scena/HomeScena';

export function Home() {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'de') as 'de' | 'en' | 'ru';
  const baseUrl = 'https://pavellevdin.ru';

  const titles = {
    en: 'Web Coding Hannover | Websites, SEO, AI Search, Google Business | PL Innovativ Digitalbau',
    ru: 'Веб-кодинг и сайты под ключ | SEO, AI Search, Google Business | PL Innovativ Digitalbau',
    de: 'Web Coding Hannover | Websites, SEO, AI Search, Google Business | PL Innovativ Digitalbau',
  };

  const descriptions = {
    en: 'Full digital launch for businesses: fast websites, web apps, SEO, AEO for AI search, Google Business, social setup, analytics and automation.',
    ru: 'Полный запуск бизнеса в интернете: быстрые сайты, веб-приложения, SEO, AEO для AI-поиска, Google Business, соцсети, аналитика и автоматизация.',
    de: 'Kompletter digitaler Business-Start: schnelle Websites, Web-Apps, SEO, AEO für AI Search, Google Business, Social Setup, Analytics und Automatisierung.',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'PL Innovativ Digitalbau',
    founder: 'Pavel Levdin',
    url: `${baseUrl}/${lang}`,
    image: `${baseUrl}/og-image.png`,
    areaServed: ['Germany', 'Europe', 'Russia'],
    serviceType: [
      'Web development',
      'Web coding',
      'SEO',
      'AI search optimization',
      'Google Business Profile setup',
      'Yandex Business setup',
      'Social media setup',
      'Analytics',
      'CRM automation',
      'API integrations',
    ],
    sameAs: ['https://t.me/PavelLevdin'],
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{titles[lang]}</title>
        <meta name="description" content={descriptions[lang]} />
        <meta
          name="keywords"
          content="PL – Innovativ Digitalbau, web development, SEO, AEO, AI search optimization, Google Business Profile, React developer, Hannover web developer, автоматизация бизнеса, разработка сайтов"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Pavel Levdin" />
        <meta property="og:title" content={titles[lang]} />
        <meta property="og:description" content={descriptions[lang]} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/${lang}`} />
        <meta property="og:image" content={`${baseUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titles[lang]} />
        <meta name="twitter:description" content={descriptions[lang]} />
        <link rel="canonical" href={`${baseUrl}/${lang}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <HomeScena />
    </>
  );
}
