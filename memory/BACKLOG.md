# BACKLOG — PL – Innovativ Digitalbau

Дальнейшие задачи. Приоритет сверху вниз внутри секций. Контекст сделанного — в `LAST_SESSION.md`.

---

## 0. Открытые решения (нужен ввод Pavel)
- [x] **Git-гигиена** — закрыто 2026-10-18: мусор убран, main = redesign-digitalbau (ff), теги `pre-merge-2026-10`/`v2-ssr-baseline`.
- [ ] **Освободить RAM** — сборки/npm ci на ПК убиваются при нехватке памяти.
- [ ] **Картинки 2 карточек** — подключить playwright-MCP (снять скрины живых сайтов VL Innovativbau и KUB Perevozki) или дать готовые. В `src/data/projects.ts` у обоих `image: ''`.

---

## 1. ~~Миграция Vite SPA → Next.js 15~~ — ОТМЕНЕНО (2026-07-09)
Решено остаться на **React 19 + Vite + собственный SSR-пререндер** (`src/entry-server.tsx` + `scripts/prerender.cjs`,
`npm run build:static`): проблема «CSR невидим для ботов» закрыта — /ru-выдача отдаётся готовым HTML.
Полный план P0–P8 — в истории git (`git show v2-ssr-baseline:memory/BACKLOG.md`).

## 1a. Легаси HostLand/FTP (из аудита 2026-10-18)
- [x] Блог-пайплайн/FTP старой админки — удалён в 04b (блог и агенты теперь в pl-platform).
- [ ] Остатки legacy: Passenger-`server.js` в корне app, `tmp/restart.txt`, fallback `htdocs/www` в `scripts/server.js`,
  зависимости `basic-ftp`, `multer`, `tinify` (не менять без решения Pavel); на сервере — старые файлы удалённых
  маршрутов в `scripts/routes|lib` (не подключены) и `/srv/sites/pavellevdin.ru/htdocs/www`.

## 1d. pl-platform (после 04b, 2026-10-19) — репо levdinpaul/pl-platform
- [ ] **Почта**: создать ящик info@pavellevdin.ru (HostLand) и вписать SMTP_* в `~/pl-platform/prod/.env` и `.env` сайта —
  без этого не уходят письма (сброс пароля, уведомления, КП по почте).
- [ ] **Ключ Claude** (`ANTHROPIC_API_KEY`) — на VPS не найден; агенты работают на Gemini (ключ из pochva-bot).
- [ ] **Telegram** платформы (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) — пусто; уведомления о лидах шлёт сайт.
- [ ] **152-ФЗ**: копия лидов уходит на сервер в Германии → уведомить РКН о трансграничной передаче (первичная запись — в РФ).
- [ ] Реквизиты для КП (`PL_STEUERNUMMER`, `PL_IBAN`…) и формулировка `VAT_NOTE` (§ 19 UStG / «НДС не облагается»).
- [ ] Капча: Yandex SmartCaptcha для форм входа/регистрации (сейчас только rate-limit + honeypot).
- [ ] Cron платформы (scheduler-tick, watchdog, sysadmin) не настроен — пайплайн запускается вручную из «Команды».
- [ ] cms: enum `content-topic.category` (tips/news/reviews/care) → категории блога; React #418 на /admin/team.
- [ ] Блог: компонент SEO (meta title/description) в blog-post; кнопка «разослать в соцсети» после ручной публикации.
- [ ] Скрипт деплоя на russh (scp + atomic mv + restart) вместо ручных шагов; удалить `dist.bak-*` после стабилизации.

## 1c. После редизайна «PL Сцена» (2026-10-18)
- [ ] Пререндер /de и /en (сейчас SPA, только /ru в HTML) — фаза 2; hreflang уже указывает на de/en.
- [ ] Две `<title>` внутри `#root` в пререндере (React 19 + Helmet в SSR) — было и до редизайна; убрать из SSR-тела.
- [ ] Polaris: публично только экран входа — снять скриншоты из авторизованной сессии или сделать лендинг.
- [ ] Opora Life (vestoralife.de): на скриншоте приложения в hero ещё «Vestora Life» — привести бренд к одному.
- [ ] med-agency (превью): стоит `index, follow` — поставить noindex; языки RU/EN/TG.
- [ ] kub-perevozki: на мобайле `.sticky-cta` и cookie-баннер шире экрана (~590px). delimes (GermanyShop): кнопка
  «Как это работает» белым по белому. — баги на сайтах клиентов/своих, не в портфолио.
- [ ] Вложенные <main> (и footer в imprint) внутри старых под-страниц contact/brief/business-card/imprint — семантика.
- [ ] Ленивая подгрузка de/en локалей (≈15 КБ gzip из initial-чанка) — если понадобится ещё перф.
- [ ] Под-страницы contact / brief / business-card / imprint / privacy / blog — внутренняя вёрстка в новом стиле
  (сейчас только токены/шапка/футер; amber-акценты в brief/contact остались).
- [ ] Удалить неиспользуемые i18n-ключи старой главной (hero/about/advantages/…) и зависимость gsap.
- [ ] GitHub Pages репо levdinking/Code-Craft больше не используется (origin → levdinpaul/pavellevdin-site).
- [x] (03b→04a) micro-UI вместо картинок — сделано в 04a (главная «Что я делаю» + /services).
- [x] (03b→04a) Ключи pl.about.cards / pl.about.stats удалены.
- [ ] (03b) Удалить на сервере dist.bak-2026-10-18*, когда hero v4 стабилен.

## 1d. После доводки 04a (2026-10-18)
- [ ] **Почта info@pavellevdin.ru**: MX домена — HostLand (mail.pavellevdin.ru → sendmail.hostland.ru), не russh.
  Ящик/алиас info@ создаётся в панели HostLand (доступа нет). Отправка писем о лидах готова в коде
  (`scripts/lib/mailer.js`), но выключена, пока в серверном `.env` нет `SMTP_HOST` (+ `SMTP_PORT`, `SMTP_FROM`,
  при необходимости `SMTP_USER/SMTP_PASS`). Варианты: SMTP HostLand с логином ящика (SPF уже include:_spf.hostland.ru)
  или Postfix russh 172.19.0.1:587 (тогда добавить pavellevdin.ru в submission_senders и russh-IP в SPF).
- [ ] **pavellevdin.de** — после регистрации: `env/.env` → `VITE_DE_MAIL_READY=true`, серверный `.env` → `DE_MAIL_READY=true`, ящик info@.
- [ ] **USt-Hinweis** для de/en цен: ключ `pl.prices.vatNote` («Umsatzsteuer-Hinweis folgt» — заглушка), уточнить статус (Kleinunternehmer §19?).
- [ ] Цены — `src/data/pricing.json` (предложение по рынку, Pavel правит без кода).
- [ ] Отзывы: снимок одобренных попадает в статический HTML только при сборке (`scripts/fetch-reviews.cjs`);
  новые одобренные видны сразу через /api/reviews. Новые персональные ссылки — `scripts/review-tokens.json`.
- [ ] Если до загрузки WebGL идёт плавный программный скролл (scrollIntoView smooth) к секции ниже сцены, цель может
  оказаться внутри выросшей сцены (браузерный smooth-scroll не знает о росте). Якоря/hash-переходы работают (top = 72).

## 1b. Найденные дефекты (2026-10-18)
- [ ] Статья `tailwind-css-2026-architecture`: в `ru/de/en.json` нет `slug`/`published` → не пререндерится;
  старый URL `/ru/blog/tailwind-css-2026-architecture/` (был заглушкой) — решить: 301 на новый slug.
- [ ] `/images/projects/socialhub.png` (`src/data/projects.ts:90`) — файла нет.
- [ ] Lint: 21 error (react-hooks/set-state-in-effect в Header/SiteNav/CommandMenu/useAdmin/usePipelinePolling/PlatformPreview;
  no-unused-expressions CommandMenu:87,114; only-export-components в shadcn ui + useTheme; purity sidebar:611;
  no-unused-vars ApiKeyManager:36; no-explicit-any в `PL Digitalbau Design System/` — добавить в eslint ignores). CI lint не гоняет.

---

## 2. SEO / GEO роадмап (из @seo-specialist; часть закрывается миграцией)
**Quick wins (часть сделана):** ✅ город в title, ✅ OG→DE, ✅ schema расширена. Осталось:
- [ ] robots.txt + sitemap с allow AI-ботов (делается в P5).
- [ ] FAQ-блоки с FAQPage schema на Home (5-6 вопросов, answer-first ≤60 слов).
- [ ] Google Business Profile (Бремен) + NAP-консистентность → @google-business-local.

**P1 структура/доверие:**
- [ ] Отдельные SEO-лендинги под топ-ключи: `/webentwicklung-bremen`, `/webdesign-bremen`, `/onlineshop-erstellen-bremen`, `/seo-bremen`, `/next-js-entwickler`, `/automatisierung-kmu` (H1 «[Leistung] in Bremen — [Nutzen]», 600-1000 слов, FAQ, кейс, Service schema).
- [ ] Страница цен `/preise` (прозрачность = отстройка; «ab»-цены + 4-шаговый процесс).
- [ ] Локальная страница `/standort-bremen` (NAP, районы, LocalBusiness schema).
- [ ] Кейсы с измеримыми цифрами (Lighthouse, % роста) + Review schema.
- [ ] Внутренняя перелинковка hub-and-spoke.

**Контент-план блога (первые 8, под информационные ключи + AEO):**
1. Was kostet eine Website 2026? (Bremen) · 2. React/Next.js vs WordPress · 3. Core Web Vitals → Lighthouse 100/100 · 4. Was ist AEO/GEO? · 5. DSGVO-konforme Website Checkliste · 6. Geschäftsprozesse automatisieren (KMU) · 7. Wie lange dauert eine Website? · 8. Mehrsprachige Website (i18n). Каждая: answer-first, таблица/цифры, FAQ-блок, BlogPosting+FAQPage schema, ссылка на коммерческий лендинг.

**Конкуренты (слабые места = наши ниши):** jannisbrandt/vibit/webdesign-bremen (WordPress, нет блога/schema/FAQ/кейсов с цифрами), exovia/sf-harbour (не местные, размытая гео). Свободно: современный стек+локальность Bremen+контент, прозрачные цены, GEO/AEO-ниша.

---

## 3. Визуал P2 (wow-слой)
- [ ] Terminal-caret в Hero eyebrow (`caret-blink` уже в tailwind.config) — dev-signature.
- [ ] Count-up метрик (Hero/TechStack/Advantages) при useInView.
- [ ] Magnetic hover на 2 главных CTA (Hero + финальный).
- [ ] `useReducedMotion()` для всех framer-анимаций (сейчас только CSS media-query).
- [ ] Advantages: заменить «4 звезды»-заглушку на 3 крупных mono-числа (реальный proof).
- [ ] Hero cleanup: упростить hero-noise/hero-network (мельтешит) → статичный dot-grid (designer рекомендовал).
- [ ] Testimonials — проверить на новой палитре, причесать.

---

## Как продолжить
Следующий `/begin` подтянет этот файл. Рекомендованный порядок: редизайн (отдельная задача) → легаси FTP-пайплайн (1a) → дефекты (1b) → SEO (2).
