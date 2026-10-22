// Тексты письма экспресс-аудита клиенту по языку (ru/de/en).
// Подсказки — те же, что на сайте (src/i18n/locales/*.json → pl.audit.hints); бэкенд на сервере живёт без src/,
// поэтому копия здесь — при правке подсказок на сайте обновлять и её. Telegram и копия на ящик заявок — всегда ru.

const LABELS = {
  ru: {
    status: 'Ответ сервера', responseTime: 'Время ответа', redirects: 'Цепочка редиректов', httpRedirect: 'Редирект http → https',
    indexable: 'Индексация', lang: 'Язык страницы', alt: 'Alt у картинок', viewport: 'Мобильный viewport', htmlSize: 'Вес HTML',
    pagespeed: 'PageSpeed (моб.)',
  },
  de: {
    status: 'Serverantwort', responseTime: 'Antwortzeit', redirects: 'Weiterleitungskette', httpRedirect: 'Weiterleitung http → https',
    indexable: 'Indexierung', lang: 'Seitensprache', alt: 'Alt-Texte', viewport: 'Mobiler Viewport', htmlSize: 'HTML-Größe',
    pagespeed: 'PageSpeed (mobil)',
  },
  en: {
    status: 'Server response', responseTime: 'Response time', redirects: 'Redirect chain', httpRedirect: 'http → https redirect',
    indexable: 'Indexing', lang: 'Page language', alt: 'Image alt text', viewport: 'Mobile viewport', htmlSize: 'HTML size',
    pagespeed: 'PageSpeed (mobile)',
  },
};
// Технические названия одинаковы во всех языках
const COMMON = {
  https: 'HTTPS', hsts: 'HSTS', xcto: 'X-Content-Type-Options', csp: 'Content-Security-Policy', referrer: 'Referrer-Policy',
  title: 'Title', description: 'Meta description', h1: 'H1', canonical: 'Canonical', og: 'Open Graph', schema: 'Schema.org',
  robots: 'robots.txt', sitemap: 'sitemap.xml',
};

const HINTS = {
  ru: {
    status: 'Главная должна отвечать 200', https: 'Сайт должен открываться по HTTPS', httpRedirect: 'http:// должен перенаправлять на https://',
    responseTime: 'Сервер должен отвечать быстрее 0,8 с', redirects: 'Лишние редиректы замедляют загрузку',
    hsts: 'Заголовок Strict-Transport-Security', xcto: 'Заголовок X-Content-Type-Options: nosniff', csp: 'Заголовок Content-Security-Policy',
    referrer: 'Заголовок Referrer-Policy', title: 'Title 10–70 символов', description: 'Meta description 70–170 символов',
    h1: 'Ровно один заголовок H1', canonical: 'Canonical-ссылка', indexable: 'Страница не должна быть закрыта noindex',
    lang: 'Атрибут lang у <html>', og: 'Open Graph (og:title, og:image) для соцсетей и мессенджеров',
    schema: 'Структурированные данные schema.org', alt: 'Alt-текст у всех картинок', viewport: 'Meta viewport для мобильных',
    htmlSize: 'HTML главной легче 300 КБ', robots: 'Файл robots.txt', sitemap: 'Карта сайта sitemap.xml', pagespeed: 'PageSpeed (мобильный) от 80',
  },
  de: {
    status: 'Startseite sollte mit 200 antworten', https: 'Website sollte per HTTPS erreichbar sein', httpRedirect: 'http:// sollte auf https:// weiterleiten',
    responseTime: 'Serverantwort unter 0,8 s', redirects: 'Unnötige Weiterleitungen verlangsamen das Laden',
    hsts: 'Header Strict-Transport-Security', xcto: 'Header X-Content-Type-Options: nosniff', csp: 'Header Content-Security-Policy',
    referrer: 'Header Referrer-Policy', title: 'Title mit 10–70 Zeichen', description: 'Meta-Description mit 70–170 Zeichen',
    h1: 'Genau eine H1-Überschrift', canonical: 'Canonical-Link', indexable: 'Seite sollte nicht auf noindex stehen',
    lang: 'lang-Attribut am <html>', og: 'Open Graph (og:title, og:image) für Social Media und Messenger',
    schema: 'Strukturierte Daten (schema.org)', alt: 'Alt-Text bei allen Bildern', viewport: 'Meta-Viewport für Mobilgeräte',
    htmlSize: 'HTML der Startseite unter 300 KB', robots: 'Datei robots.txt', sitemap: 'Sitemap sitemap.xml', pagespeed: 'PageSpeed (mobil) ab 80',
  },
  en: {
    status: 'Home page should return 200', https: 'Site should be served over HTTPS', httpRedirect: 'http:// should redirect to https://',
    responseTime: 'Server response under 0.8 s', redirects: 'Extra redirects slow down loading',
    hsts: 'Strict-Transport-Security header', xcto: 'X-Content-Type-Options: nosniff header', csp: 'Content-Security-Policy header',
    referrer: 'Referrer-Policy header', title: 'Title of 10–70 characters', description: 'Meta description of 70–170 characters',
    h1: 'Exactly one H1 heading', canonical: 'Canonical link', indexable: 'Page should not be set to noindex',
    lang: 'lang attribute on <html>', og: 'Open Graph (og:title, og:image) for social and messengers',
    schema: 'Structured data (schema.org)', alt: 'Alt text on all images', viewport: 'Mobile meta viewport',
    htmlSize: 'Home page HTML under 300 KB', robots: 'robots.txt file', sitemap: 'sitemap.xml', pagespeed: 'PageSpeed (mobile) of 80+',
  },
};

// site-audit.js пишет «есть/нет» в value — переводим
const WORDS = { de: { есть: 'vorhanden', нет: 'fehlt' }, en: { есть: 'present', нет: 'missing' } };

const COPY = {
  ru: {
    subject: (host) => `Экспресс-аудит ${host} — Innovativ Digitalbau`,
    head: (url) => `Экспресс-аудит ${url}`,
    score: (n) => `Итог: ${n}% проверок пройдено`,
    footer: 'Вопросы — ответьте на это письмо или напишите в Telegram @PavelLevdin.\nPavel Levdin · Innovativ Digitalbau · pavellevdin.ru',
  },
  de: {
    subject: (host) => `Schnell-Check ${host} — Innovativ Digitalbau`,
    head: (url) => `Schnell-Check ${url}`,
    score: (n) => `Ergebnis: ${n} % der Prüfungen bestanden`,
    footer: 'Fragen? Antworten Sie einfach auf diese E-Mail oder schreiben Sie mir auf Telegram: @PavelLevdin.\nPavel Levdin · Innovativ Digitalbau · pavellevdin.ru',
  },
  en: {
    subject: (host) => `Quick audit of ${host} — Innovativ Digitalbau`,
    head: (url) => `Quick audit of ${url}`,
    score: (n) => `Result: ${n}% of checks passed`,
    footer: 'Questions? Just reply to this email or message me on Telegram: @PavelLevdin.\nPavel Levdin · Innovativ Digitalbau · pavellevdin.ru',
  },
};

const mark = (ok) => (ok === true ? '✅' : ok === false ? '⚠️' : '—');
const pickLang = (lang) => (COPY[lang] ? lang : 'ru');

/** Текст отчёта на языке lang (ru — и для Telegram/ящика заявок). */
function reportText(r, lang = 'ru') {
  const l = pickLang(lang);
  const label = (id) => LABELS[l][id] || COMMON[id] || id;
  const value = (v) => (WORDS[l] && WORDS[l][v]) || v;
  const lines = r.checks.map((c) => {
    const hint = c.ok === false ? (HINTS[l][c.id] || c.hint) : '';
    return `${mark(c.ok)} ${label(c.id)}: ${value(c.value)}${hint ? ` — ${hint}` : ''}`;
  });
  return [COPY[l].head(r.url), COPY[l].score(r.score), '', ...lines].join('\n');
}

/** Письмо клиенту: тема и текст на его языке. */
function clientMail(r, lang) {
  const l = pickLang(lang);
  return { subject: COPY[l].subject(new URL(r.url).host), text: `${reportText(r, l)}\n\n${COPY[l].footer}` };
}

const labelRu = (id) => LABELS.ru[id] || COMMON[id] || id;

module.exports = { reportText, clientMail, labelRu };
