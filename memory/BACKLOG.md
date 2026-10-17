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
- [ ] **Блог-пайплайн админки сломан на russh:** `POST /api/articles/publish/:id` (`scripts/routes/articles.js:212-234`)
  после `npm run build` + static-html вызывает `uploadDistToFTP` → без `FTP_HOST/USER/PASSWORD` падает 500.
  Также FTP: `image-generator.js`, `media-manager.js`, `video-generator.js` (uploadSingleFile, локальный файл удаляется!),
  тест «ftp» в `routes/settings.js`. Перевести на локальную запись в dist/public + `build:static`.
- [ ] Publish-роут собирает `npm run build`, а не `build:static` → после публикации статьи с админки пропадёт SSR-пререндер.
- [ ] Удалить legacy после замены: `deploy-only.cjs`, `restart-passenger.cjs`, `ftp-list.cjs`, `add-article.cjs`,
  `lib/ftp-upload.js`, Passenger-`server.js` в корне app, `tmp/restart.txt`, fallback `htdocs/www` в `scripts/server.js`,
  зависимость `basic-ftp`; `/srv/sites/pavellevdin.ru/htdocs/www` на сервере.
- [ ] Скрипт деплоя на russh (scp + atomic mv + restart) вместо ручных шагов; удалить `dist.bak-*` после стабилизации.

## 1b. Найденные дефекты (2026-10-18)
- [ ] Статья `tailwind-css-2026-architecture`: в `ru/de/en.json` нет `slug`/`published` → не пререндерится;
  старый URL `/ru/blog/tailwind-css-2026-architecture/` (был заглушкой) — решить: 301 на новый slug.
- [ ] `/images/projects/socialhub.png` (`src/data/projects.ts:90`) — файла нет.
- [ ] Lint: 21 error (react-hooks/set-state-in-effect в Header/SiteNav/CommandMenu/useAdmin/usePipelinePolling/PlatformPreview;
  no-unused-expressions CommandMenu:87,114; only-export-components в shadcn ui + useTheme; purity sidebar:611;
  no-unused-vars ApiKeyManager:36; no-explicit-any в `PL Digitalbau Design System/` — добавить в eslint ignores). CI lint не гоняет.
- [ ] Выключить GitHub Pages в репо (Settings → Pages) — workflow уже не публикует.

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
