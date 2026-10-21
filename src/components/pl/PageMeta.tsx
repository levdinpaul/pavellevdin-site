import { Helmet } from 'react-helmet-async';

import { SITE } from './seo';
const LANGS = ['de', 'en', 'ru'] as const;

interface PageMetaProps {
  lang: string;
  /** путь без языкового префикса, например '/about' */
  path: string;
  title: string;
  description: string;
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

/** title/description/canonical + hreflang (de/en/ru, x-default → ru) + OG + JSON-LD для страниц «PL Сцена». */
/** OG-картинка бренда по языку (public/og-image*.jpg, исходники — brand/social). */
const defaultOg = (lang: string) => (lang === 'de' ? '/og-image-de.jpg' : lang === 'en' ? '/og-image-en.jpg' : '/og-image.jpg');

export function PageMeta({ lang, path, title, description, image, jsonLd, noindex }: PageMetaProps) {
  const url = `${SITE}/${lang}${path}`;
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {LANGS.map((l) => <link key={l} rel="alternate" hrefLang={l} href={`${SITE}/${l}${path}`} />)}
      <link rel="alternate" hrefLang="x-default" href={`${SITE}/ru${path}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={(() => { const img = image ?? defaultOg(lang); return img.startsWith('http') ? img : `${SITE}${img}`; })()} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {ld.map((o, i) => <script key={i} type="application/ld+json">{JSON.stringify(o)}</script>)}
    </Helmet>
  );
}

