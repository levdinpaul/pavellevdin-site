# BACKLOG — PL – Innovativ Digitalbau

Дальнейшие задачи. Приоритет сверху вниз внутри секций. Контекст сделанного — в `LAST_SESSION.md`.

---

## 0. Открытые решения (нужен ввод Pavel)
- [ ] **Git-гигиена перед коммитом.** Рабочее дерево содержит до-сессионные изменения: удалены `.gitignore`, `.env.example`, `AGENTS.md`, `avatar.png`, `create_image.py`, `autopost.log`; untracked `nul`, `dist/`, `node_modules/`, `scripts/node_modules/`. Решить: откатить/оставить/закоммитить. Затем мою работу — отдельным чистым коммитом на `main`.
- [ ] **Освободить RAM** перед Next-сборками (сейчас ~1 ГБ свободно из 7.5).
- [ ] **Картинки 2 карточек** — подключить playwright-MCP (снять скрины живых сайтов VL Innovativbau и KUB Perevozki) или дать готовые. В `src/data/projects.ts` у обоих `image: ''`.

---

## 1. ГЛАВНОЕ: Миграция Vite SPA → Next.js 15 (App Router, SSR/SSG)
**Решение принято Pavel.** Цель — разблокировать SEO/AEO (сейчас CSR невидим для AI-ботов) + сам факт Next = УТП против WordPress-конкурентов. Оценка ~18–27 чел-дней. Старый сайт на FTP живёт до cutover; работа на ветке `next-migration`, выкатка через staging-поддомен.

### Решения по развилкам (из плана @system-architect, Fable 5)
- **Next 15** (React 19), Tailwind остаётся 3.4 (не апгрейдить на v4 — палитра только что сделана).
- **i18n → next-intl** (не react-i18next): переводы в RSC + `generateMetadata` + hreflang. Конвертировать `{{var}}`→ICU `{var}`, `useTranslation`→`useTranslations`.
- **Блог:** оставить JSON+markdown, рендер в RSC (remark/rehype + shiki), SSG через `generateStaticParams`.
- **Админка:** Express оставить отдельным сервисом (multer/FTP/Tinify/Telegram/секреты); UI-страницы перенести как client; Nginx-прокси `/api/admin/*` → CORS исчезает.
- **Деплой:** VPS `212.227.100.97`, Docker, `output: 'standalone'`, Nginx+Certbot (НЕ static export — убьёт SSR).
- **Тема:** кастомный useTheme → **next-themes** (фикс FOUC/hydration), dark по умолчанию.
- **Cookie-consent:** переписать — баннер вместо гейта всего приложения; GA4/Metrika грузить ПОСЛЕ согласия (Consent Mode v2) — **заодно фикс текущего DSGVO-нарушения** (сейчас трекеры грузятся до согласия в index.html).

### Этапы
- [ ] **P0** Аудит, заморозка, скаффолд Next15 (ветка `next-migration`, перенос tsconfig paths, URL-карта old→new, чеклист i18n-ключей). 1–2 дня.
- [ ] **P1** Дизайн-система 1:1: `index.css`→`globals.css`, `tailwind.config.js`, шрифты→`next/font/local`, shadcn `ui/*` (+`'use client'`), next-themes. Пиксельная сверка. 2–3 дня.
- [ ] **P2** i18n-фундамент: middleware (de/en/ru, detect), конвертер локалей, `app/[locale]/layout.tsx`, влить ruPrivacy/ruImprint-костыли из `i18n/index.ts` в `ru.json`. Прогнать @i18n-qa. 2–3 дня.
- [ ] **P3** Маркетинг-страницы + SEO-ядро (самый крупный): `app/[locale]/(marketing)/*`, RSC/client-граница по секциям, `generateMetadata` per page/locale, **серверный JSON-LD** (LocalBusiness/Person/Service/FAQPage/Breadcrumb), новый cookie-consent. 4–6 дней.
- [ ] **P4** Блог SSG: список/[slug]/category/tag, `generateStaticParams`, shiki, BlogPosting schema. ISR + revalidate webhook из админки. 2–3 дня.
- [ ] **P5** SEO-инфра: `sitemap.ts` (alternates), `robots.ts` (allow GPTBot/ClaudeBot/PerplexityBot/Google-Extended, disallow admin/api), redirects. **Каркас под будущие лендинги** (локализованные pathnames). 1–2 дня.
- [ ] **P6** Админка: Express на VPS (убрать хардкод CORS pavellevdin.ru, убрать SPA-fallback), UI → `app/[locale]/admin/*` client, noindex. 3–5 дней (можно после cutover).
- [ ] **P7** Деплой-инфра: Dockerfile standalone, compose, Nginx vhost + проксирование admin-api, Certbot, CI (заменить `deploy-only.cjs`), staging-поддомен. 2–3 дня.
- [ ] **P8** Cutover: DNS → VPS (TTL 300 заранее), старый хостинг держать 2–4 нед как rollback, GSC переобход, валидация schema/GA4/Metrika/CWV. 1–2 дня + неделя наблюдения.

### Чеклист «не потерять» при миграции
Визуал (CSS-токены байт-в-байт, Geist/Geist Mono, dark по умолчанию) · i18n-ключи de/en/ru (0 потерь, ru-фоллбеки) · schema/meta (адрес Bremen, hreflang x-default=de, theme-color #060810) · аналитика GA4 `G-PFRYET1M4T` + Yandex Metrika `108284704` за consent-гейтом · DSGVO (баннер до трекеров) · redirects (slugs блога per-locale!, /→locale) · `.env`-секреты не в `NEXT_PUBLIC_*` · последний Vite-билд на VPS как rollback.

### Риски (топ)
Hydration mismatch (theme/consent/framer) → next-themes + consent в cookie + e2e-смоук. SEO-просадка при cutover → URL-карта + crawl-тест staging + GSC-мониторинг. CWV-регресс TTFB на VPS → SSG/ISR (TTFB=static). Двойная поддержка → контент-фриз на P3+.

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

## 3. Визуал P2 (wow-слой, на текущем сайте ИЛИ перенести в Next)
- [ ] Terminal-caret в Hero eyebrow (`caret-blink` уже в tailwind.config) — dev-signature.
- [ ] Count-up метрик (Hero/TechStack/Advantages) при useInView.
- [ ] Magnetic hover на 2 главных CTA (Hero + финальный).
- [ ] `useReducedMotion()` для всех framer-анимаций (сейчас только CSS media-query).
- [ ] Advantages: заменить «4 звезды»-заглушку на 3 крупных mono-числа (реальный proof).
- [ ] Hero cleanup: упростить hero-noise/hero-network (мельтешит) → статичный dot-grid (designer рекомендовал).
- [ ] Testimonials — проверить на новой палитре, причесать.

---

## Как продолжить
Следующий `/begin` подтянет этот файл. Рекомендованный порядок: (C) глянуть текущий результат `npm run dev` → решить git-гигиену (секция 0) → освободить RAM → **старт миграции P0** (секция 1). SEO-лендинги/блог (секция 2) удобнее делать уже на Next (P3+).
