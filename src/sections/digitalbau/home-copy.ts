// PL Digitalbau — тексты главной (3 языка). Основа — копирайт из Claude Design export
// (builder-метафора «Ich baue digitale Systeme»), выбор по i18n.language.

export interface ServiceCopy { index: string; title: string; description: string; deliverables: string[] }
export interface ProcessCopy { num: string; title: string; text: string }
export interface PostCopy { date: string; title: string }

export interface HomeCopy {
  heroLine1: string; heroLine2: string; heroLine3: string; heroLead: string;
  heroCta: string; heroCta2: string; scrollHint: string;
  aboutEyebrow: string; aboutTitle: string; aboutLead: string; aboutText: string;
  servicesEyebrow: string; servicesTitle: string; servicesLead: string; services: ServiceCopy[];
  workEyebrow: string; workTitle: string; workLead: string;
  project1: string; project2: string; project3: string; workCta: string;
  stackEyebrow: string; stackTitle: string;
  processEyebrow: string; processTitle: string; process: ProcessCopy[];
  counterYears: string; counterLangs: string;
  blogTitle: string; posts: PostCopy[];
  ctaEyebrow: string; ctaTitle: string; ctaText: string; ctaButton: string;
  footerBuilding: string; footerDone: string;
}

export const HOME_COPY: Record<'de' | 'en' | 'ru', HomeCopy> = {
  de: {
    heroLine1: 'Ich baue', heroLine2: 'digitale', heroLine3: 'Systeme.',
    heroLead: 'Komplette Startsysteme für Ihr Geschäft: Website, Sichtbarkeit in Google & KI-Suche, Kanäle, Analytics und Automatisierung — aus einer Hand.',
    heroCta: 'Projekt konfigurieren', heroCta2: 'Portfolio ansehen', scrollHint: 'Scrollen — die Seite baut sich selbst',
    aboutEyebrow: 'Positionierung', aboutTitle: 'Ein Entwickler. Das ganze System.',
    aboutLead: 'Kein Agentur-Overhead, keine Übergabeverluste — Strategie, Code und Wachstum aus einer Hand.',
    aboutText: 'PL Innovativ Digitalbau ist das Ein-Personen-Studio von Pavel Levdin, Full-Stack-Entwickler in Bremen. Diese Seite ist selbst das Portfolio: Wenn mein eigener Auftritt so aussieht — stellen Sie sich vor, was ich für Ihr Geschäft baue.',
    servicesEyebrow: 'Leistungen', servicesTitle: 'Vom Bauplan zum laufenden System.',
    servicesLead: 'Fünf Baustufen — jede einzeln buchbar, zusammen ein komplettes Startsystem.',
    services: [
      { index: '01', title: 'Positionierung & Strategie', description: 'Zielgruppen, Angebot, Struktur — der Bauplan vor der ersten Zeile Code.', deliverables: ['Markt & Wettbewerb', 'Seitenarchitektur', 'Content-Plan DE/EN/RU'] },
      { index: '02', title: 'Website & Web-Apps', description: 'Hochperformante Websites und Anwendungen. Lighthouse 100, dreisprachig.', deliverables: ['React / Next.js', 'CMS & i18n', 'Performance-Budget'] },
      { index: '03', title: 'SEO / AEO & KI-Suche', description: 'Sichtbar in Google — und in ChatGPT, Perplexity & Co.', deliverables: ['Technisches SEO', 'AEO / llms.txt', 'Structured Data'] },
      { index: '04', title: 'Kanäle & Analytics', description: 'Google Business, Social Media, Tracking — alle Kanäle verdrahtet.', deliverables: ['Google Business Profile', 'Social Setup', 'GA4 / Metrika'] },
      { index: '05', title: 'Leads, CRM & Automatisierung', description: 'Anfragen fließen automatisch ins CRM, Workflows arbeiten nachts weiter.', deliverables: ['CRM-Anbindung', 'Automatisierung', 'API-Integrationen'] },
    ],
    workEyebrow: 'Portfolio', workTitle: 'Gebaut. Geliefert. Live.',
    workLead: 'Ausgewählte Projekte — vom Bauplan bis zum messbaren Ergebnis.',
    project1: 'Premium-Website und digitale Präsenz für ein deutsches Bauunternehmen — Next.js, Strapi, SEO, Automatisierung.',
    project2: 'Corporate-Website für eine Digital-Agentur.',
    project3: 'Service-Website für Kranvermietung mit lokalem SEO-Fokus.',
    workCta: 'Alle Projekte',
    stackEyebrow: 'Tech-Stack', stackTitle: 'Werkzeuge, verdrahtet zu einem System.',
    processEyebrow: 'Prozess', processTitle: 'Fünf Schritte. Ein Bauplan.',
    process: [
      { num: '01', title: 'Analyse', text: 'Ziele, Zielgruppen, Ist-Zustand — vermessen wie ein Grundstück.' },
      { num: '02', title: 'Bauplan', text: 'Architektur, Wireframes, Content-Struktur in drei Sprachen.' },
      { num: '03', title: 'Konstruktion', text: 'Entwicklung mit Performance-Budget. Jede Woche sichtbarer Fortschritt.' },
      { num: '04', title: 'Launch', text: 'Go-Live mit SEO, Analytics, Google Business — alles verdrahtet.' },
      { num: '05', title: 'Wachstum', text: 'Messung, Iteration, Automatisierung. Das System arbeitet weiter.' },
    ],
    counterYears: 'Jahre Erfahrung', counterLangs: 'Sprachen · DE EN RU',
    blogTitle: 'Notizen aus der Werkstatt.',
    posts: [
      { date: '2026-06', title: 'AEO: Wie Ihre Website in ChatGPT auftaucht' },
      { date: '2026-05', title: 'Lighthouse 100 — was es wirklich kostet' },
      { date: '2026-04', title: 'Dreisprachige Websites ohne Chaos' },
    ],
    ctaEyebrow: 'Nächstes Projekt', ctaTitle: 'Bauen wir Ihr System.',
    ctaText: 'Kostenloses Erstgespräch — 30 Minuten, konkreter Bauplan-Vorschlag, keine Verpflichtung.',
    ctaButton: 'Projekt konfigurieren',
    footerBuilding: 'System im Aufbau…', footerDone: 'System vollständig — bereit für Anfragen',
  },
  en: {
    heroLine1: 'I build', heroLine2: 'digital', heroLine3: 'systems.',
    heroLead: 'Complete launch systems for your business: website, visibility in Google & AI search, channels, analytics and automation — from one pair of hands.',
    heroCta: 'Configure project', heroCta2: 'View portfolio', scrollHint: 'Scroll — the site builds itself',
    aboutEyebrow: 'Positioning', aboutTitle: 'One developer. The whole system.',
    aboutLead: 'No agency overhead, no hand-off losses — strategy, code and growth from one source.',
    aboutText: 'PL Innovativ Digitalbau is the one-person studio of Pavel Levdin, full-stack developer in Bremen. This site is the portfolio itself: if my own site looks like this — imagine what I build for your business.',
    servicesEyebrow: 'Services', servicesTitle: 'From blueprint to running system.',
    servicesLead: 'Five construction stages — bookable individually, together a complete launch system.',
    services: [
      { index: '01', title: 'Positioning & Strategy', description: 'Audiences, offer, structure — the blueprint before the first line of code.', deliverables: ['Market & competition', 'Site architecture', 'Content plan DE/EN/RU'] },
      { index: '02', title: 'Websites & Web Apps', description: 'High-performance websites and applications. Lighthouse 100, trilingual.', deliverables: ['React / Next.js', 'CMS & i18n', 'Performance budget'] },
      { index: '03', title: 'SEO / AEO & AI Search', description: 'Visible in Google — and in ChatGPT, Perplexity & co.', deliverables: ['Technical SEO', 'AEO / llms.txt', 'Structured data'] },
      { index: '04', title: 'Channels & Analytics', description: 'Google Business, social media, tracking — every channel wired up.', deliverables: ['Google Business Profile', 'Social setup', 'GA4 / Metrika'] },
      { index: '05', title: 'Leads, CRM & Automation', description: 'Enquiries flow into the CRM automatically; workflows keep working at night.', deliverables: ['CRM integration', 'Automation', 'API integrations'] },
    ],
    workEyebrow: 'Portfolio', workTitle: 'Built. Shipped. Live.',
    workLead: 'Selected projects — from blueprint to measurable results.',
    project1: 'Premium website and digital presence for a German construction company — Next.js, Strapi, SEO, automation.',
    project2: 'Corporate website for a digital agency.',
    project3: 'Crane-rental service website with a local SEO focus.',
    workCta: 'All projects',
    stackEyebrow: 'Tech stack', stackTitle: 'Tools, wired into one system.',
    processEyebrow: 'Process', processTitle: 'Five steps. One blueprint.',
    process: [
      { num: '01', title: 'Analysis', text: 'Goals, audiences, status quo — surveyed like a building plot.' },
      { num: '02', title: 'Blueprint', text: 'Architecture, wireframes, content structure in three languages.' },
      { num: '03', title: 'Construction', text: 'Development with a performance budget. Visible progress every week.' },
      { num: '04', title: 'Launch', text: 'Go-live with SEO, analytics, Google Business — all wired.' },
      { num: '05', title: 'Growth', text: 'Measurement, iteration, automation. The system keeps working.' },
    ],
    counterYears: 'Years of experience', counterLangs: 'Languages · DE EN RU',
    blogTitle: 'Notes from the workshop.',
    posts: [
      { date: '2026-06', title: 'AEO: how your website shows up in ChatGPT' },
      { date: '2026-05', title: 'Lighthouse 100 — what it really costs' },
      { date: '2026-04', title: 'Trilingual websites without the chaos' },
    ],
    ctaEyebrow: 'Next project', ctaTitle: "Let's build your system.",
    ctaText: 'Free intro call — 30 minutes, a concrete blueprint proposal, no obligation.',
    ctaButton: 'Configure project',
    footerBuilding: 'System under construction…', footerDone: 'System complete — ready for enquiries',
  },
  ru: {
    heroLine1: 'Я строю', heroLine2: 'цифровые', heroLine3: 'системы.',
    heroLead: 'Полные стартовые системы для бизнеса: сайт, видимость в Google и ИИ-поиске, каналы, аналитика и автоматизация — из одних рук.',
    heroCta: 'Рассчитать проект', heroCta2: 'Портфолио', scrollHint: 'Листайте — сайт строит себя сам',
    aboutEyebrow: 'Позиционирование', aboutTitle: 'Один разработчик. Вся система.',
    aboutLead: 'Без агентских накладных и потерь на передаче — стратегия, код и рост из одних рук.',
    aboutText: 'PL Innovativ Digitalbau — студия одного человека, Павла Левдина, full-stack-разработчика из Бремена. Этот сайт — само портфолио: если мой сайт выглядит так — представьте, что я построю для вашего бизнеса.',
    servicesEyebrow: 'Услуги', servicesTitle: 'От чертежа до работающей системы.',
    servicesLead: 'Пять этапов строительства — по отдельности или как полная стартовая система.',
    services: [
      { index: '01', title: 'Позиционирование и стратегия', description: 'Аудитории, оффер, структура — чертёж до первой строки кода.', deliverables: ['Рынок и конкуренты', 'Архитектура сайта', 'Контент-план DE/EN/RU'] },
      { index: '02', title: 'Сайты и веб-приложения', description: 'Высокопроизводительные сайты. Lighthouse 100, три языка.', deliverables: ['React / Next.js', 'CMS и i18n', 'Бюджет производительности'] },
      { index: '03', title: 'SEO / AEO и ИИ-поиск', description: 'Видимость в Google — и в ChatGPT, Perplexity и др.', deliverables: ['Техническое SEO', 'AEO / llms.txt', 'Структурированные данные'] },
      { index: '04', title: 'Каналы и аналитика', description: 'Google Business, соцсети, трекинг — все каналы подключены.', deliverables: ['Google Business Profile', 'Соцсети', 'GA4 / Метрика'] },
      { index: '05', title: 'Лиды, CRM и автоматизация', description: 'Заявки автоматически попадают в CRM, воркфлоу работают ночью.', deliverables: ['Интеграция CRM', 'Автоматизация', 'API-интеграции'] },
    ],
    workEyebrow: 'Портфолио', workTitle: 'Построено. Сдано. Live.',
    workLead: 'Избранные проекты — от чертежа до измеримого результата.',
    project1: 'Премиальный сайт и цифровое присутствие для немецкой строительной компании — Next.js, Strapi, SEO, автоматизация.',
    project2: 'Корпоративный сайт для digital-агентства.',
    project3: 'Сайт услуг аренды манипулятора с локальным SEO.',
    workCta: 'Все проекты',
    stackEyebrow: 'Стек', stackTitle: 'Инструменты, собранные в систему.',
    processEyebrow: 'Процесс', processTitle: 'Пять шагов. Один чертёж.',
    process: [
      { num: '01', title: 'Анализ', text: 'Цели, аудитории, текущее состояние — замер как у участка.' },
      { num: '02', title: 'Чертёж', text: 'Архитектура, вайрфреймы, структура контента на трёх языках.' },
      { num: '03', title: 'Стройка', text: 'Разработка с бюджетом производительности. Прогресс каждую неделю.' },
      { num: '04', title: 'Запуск', text: 'Go-live с SEO, аналитикой, Google Business — всё подключено.' },
      { num: '05', title: 'Рост', text: 'Измерение, итерации, автоматизация. Система работает дальше.' },
    ],
    counterYears: 'Лет опыта', counterLangs: 'Языка · DE EN RU',
    blogTitle: 'Заметки из мастерской.',
    posts: [
      { date: '2026-06', title: 'AEO: как ваш сайт попадает в ChatGPT' },
      { date: '2026-05', title: 'Lighthouse 100 — сколько это стоит на самом деле' },
      { date: '2026-04', title: 'Трёхъязычные сайты без хаоса' },
    ],
    ctaEyebrow: 'Следующий проект', ctaTitle: 'Построим вашу систему.',
    ctaText: 'Бесплатная первая консультация — 30 минут, конкретное предложение-чертёж, без обязательств.',
    ctaButton: 'Рассчитать проект',
    footerBuilding: 'Система строится…', footerDone: 'Система готова — принимаю заявки',
  },
};
