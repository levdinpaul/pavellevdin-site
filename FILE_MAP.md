# FILE_MAP — pavellevdin-site (pavellevdin.ru, SPA + SSR-пререндер)
Карта «тема -> путь». Порядок работы: эта карта -> Grep/Glob -> точечный Read (файлы >200 строк — offset/limit).
Обновлено: 2026-10-27 (prompt-31). Новое место в коде -> добавить строку сюда.

## Где что
- Формы/лиды -> `src/pages/ContactPage.tsx`, `src/pages/BriefPage.tsx`, `src/components/pl/AuditForm.tsx`; бэкенд `scripts/routes/lead.js`
- Передача лида в CRM платформы -> `scripts/lib/platform.js`, Telegram `scripts/lib/telegram.js`, почта `scripts/lib/mailer.js`
- Конфигуратор -> нет в проекте; калькулятор цены -> `src/pages/CalculatorPage.tsx`, `src/lib/calculator.ts`, `src/data/pricing.json`
- Дизайн-токены/стили -> `tailwind.config.js`, `src/index.css`, `src/styles/`, сцена `src/sections/scena/scene.css`
- Главная («PL Сцена») -> `src/sections/scena/` (HomeScena.tsx, HomeSections.tsx)
- UI-компоненты -> `src/components/ui/` (shadcn), `src/components/pl/`, шапка/подвал `src/components/layout/`
- Переводы/тексты -> `src/i18n/locales/{ru,de,en}.json` (ключи `pl.*`), `src/i18n/index.ts`
- Страницы/роутинг -> `src/App.tsx`, `src/pages/`, SSR-вход `src/entry-server.tsx`, `src/main.tsx`
- API/эндпойнты (Express) -> `scripts/server.js`, `scripts/routes/` (lead, reviews, fx, audit), `scripts/middleware/`
- Данные портфолио/цены/отзывы -> `src/data/` (portfolio.json, pricing.json, reviews.json, pagespeed.json)
- Контакты -> `src/constants/contacts.ts`
- Блог -> `src/content/blog/`, сборка ленты `scripts/fetch-posts.cjs`, `src/components/pl/BlogSection.tsx`
- Отзывы -> `src/pages/ReviewPage.tsx`, `scripts/routes/reviews.js`, `scripts/fetch-reviews.cjs`
- Сборка/пререндер -> `package.json` (`build:static`), `scripts/prerender.cjs`, `scripts/ensure-build-data.cjs`, `vite.config.ts`
- SEO/sitemap -> `scripts/generate-sitemap.cjs`, `public/robots.txt`, `public/llms.txt`, `src/components/pl/seo.ts`, `src/components/pl/PageMeta.tsx`
- Бренд/ассеты -> `brand/` (svg, png, favicon, social), OG `public/og/`, скрипт `scripts/build-og.cjs`
- Env -> `.env.example`; `env/` — отслеживаемый файл окружения (значения не читать и не копировать)
- CI -> `.github/workflows/ci.yml`
- Деплой -> нет deploy.sh здесь; прод-зеркало `~/sites/pavellevdin.ru` (projects/app, deploy.sh)
- Тесты -> нет в проекте (только `npm run lint`, `eslint.config.js`)
- Память проекта -> `memory/` (LAST_SESSION.md, LEARNINGS.md, BACKLOG.md, prompts/)
- Документация -> `README.md`, `brand/README.md`

## Куда НЕ ходить
- `node_modules/`, `scripts/node_modules/`, `dist/`, `dist-ssr/`, `dist-server/`
- `env/`, `.env*` (секреты), `scripts/data/` (лиды, ПДн), `scripts/review-tokens.json`
- `public/images/portfolio/`, `public/blog-images/`, `brand/png/` (бинарники), `package-lock.json`, `*.log`
