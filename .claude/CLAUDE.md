# CLAUDE.md — PL – Innovativ Digitalbau (портфолио Pavel Levdin)

Project-brief. Читается при работе в этом репозитории. Это **отдельный проект**, не vl-innovativbau —
бизнес-агенты `vl-*` (экономика / Förderung / право) здесь **не применяются**.

## Что это
Личный сайт-портфолио Павла Левдина. Услуги: **веб-разработка, SEO, автоматизация**.
Цель сайта — **лиды** (заявки на разработку).

### Стратегия рынков (двухфазная)
- **Фаза 1 — СЕЙЧАС: рынок РФ / Яндекс / русский домен.**
  - Прод-домен: `https://pavellevdin.ru` (бренд Delimes). Все canonical/OG/CORS/JSON-LD — на него, это **правильно**.
  - **Основной язык — русский** (`<html lang="ru">`, `x-default → /ru`). en / de — вторичны, но поддерживаются.
  - Правовая рамка — **152-ФЗ (Роскомнадзор)**: Политика конфиденциальности + Согласие на обработку ПДн (checkbox
    у форм), локализация ПДн россиян на серверах в РФ (ст. 18 → лиды принимать своим backend на .ru, **не Formspree/US**).
  - SEO — под **Яндекс**: Вебмастер, региональность, Турбо-страницы (решают CSR-индексацию), ИКС, Яндекс Бизнес.
    Yandex Metrika + webvisor, Yandex-email, Telegram-уведомления — уместны.
- **Фаза 2 — ПОТОМ: та же схема под рынок Германия/ЕС на немецком домене.**
  - Домен `https://pavellevdin.dev`, основной язык немецкий, рынок DE/ЕС → снова актуальны **BFSG/EAA** (a11y)
    и **DSGVO/GDPR** (Impressum, Datenschutz, cookie-opt-in).
  - **Поэтому трёхъязычную i18n (de/en/ru) и DSGVO-заготовки НЕ выпиливать** — это активы фазы 2.
    Архитектуру держать мульти-рынок / мульти-домен ready (домен — через env-константу, а не хардкод).

- Контакты: Telegram + email по локали — `getContacts(lang)` в `src/constants/contacts.ts` (ru → info@pavellevdin.ru,
  de/en → info@pavellevdin.de при `VITE_DE_MAIL_READY=true` в `env/.env`). **Телефон нигде не публикуется** (WhatsApp — только кнопкой wa.me). Город: **Hannover** (с 2026-10-18; прежний город больше не используется).
  Адрес — ИНКОГНИТО (решение Pavel 2026-10-18): улицу/индекс не публиковать нигде, только «Hannover, Germany».

## Стек
- **Фронт:** React 19 + Vite 7 + TypeScript 5 + Tailwind 3.4 + shadcn/ui (Radix) + framer-motion +
  react-router-dom 7 + react-i18next (de/en/ru) + recharts + RHF + Zod v4 + react-helmet-async. Сцена главной — canvas 2D без зависимостей (three.js удалён в 06).
- **Дизайн «PL Сцена»** (с 2026-10-18): тёмная палитра #060810 / акцент #7AA2FF, шрифт Onest (self-host).
  Токены — `src/index.css` (:root), классы `pl-*` — `src/styles/pl.css`.
- **Бэкенд сайта:** Node + Express (`scripts/server.js`) — только лиды (`routes/lead.js`), отзывы (`routes/reviews.js`),
  раздача статики. Уведомления в **Telegram**. CORS бэка завязан на `pavellevdin.ru`.
- **Блог, кабинет, админка, вход/регистрация** — отдельное приложение **pl-platform** (Next.js + Strapi) на том же домене:
  nginx отдаёт ему `/(ru|de|en)/(blog|cabinet|admin|login|register|…-password)`. В SPA сайта эти пути ловит
  `components/PlatformRedirect` (полная перезагрузка; ссылки — обычный `<a href>`, список — `lib/platform-paths.ts`).
  Старый блог/админка и FTP/HostLand-пайплайн удалены (2026-10-18).

## Структура (src/)
- `sections/scena/` — главная: SceneSection (минималистичный hero + спиральный полёт с названиями технологий), scene-2d.ts (canvas 2D: пыль спирали + проекция названий),
  scene-model.ts (камера, пыль, статичный SVG-кадр для SSR), scene.css (изолированные стили сцены),
  HomeSections (Обо мне / Проекты / Услуги / Интеграции / CTA), useReveal.
- `pages/` — Home, About, Services, Portfolio, Project (кейс /portfolio/:slug), Contact, Brief, Imprint, Privacy;
  NotFound (404).
- `components/` — `layout/` (SiteHeader, Footer, Layout), `pl/` (ProjectCard, ServicesGrid, Integrations, Counter,
  Marquee, PageMeta+seo), `ds/CommandMenu` (⌘K), `ui/` (shadcn), `PlatformRedirect`.
- `data/` — **pricing.json** (единый прайс ₽ — региональные медианы, см. memory/pricing-research-regions.md; de/en — пересчёт в € по курсу ЦБ РФ: fx-rate.json при сборке + /api/fx раз в сутки; секция calculator — калькулятор /:lang/calculator; копия в pl-platform — держать в синхроне) + **reviews.json** (снимок одобренных отзывов, пишет `scripts/fetch-reviews.cjs` при сборке) + **stack.ts** (реальный стек: спираль, SEO-список, бегущая строка About; поле `locales`) + **portfolio.json** (11 проектов; читают React, prerender, sitemap) + projects.ts, projects-status.json,
  testimonials.ts.
- `constants/contacts.ts` — единый источник контактов.
- `i18n/locales/` — de.json / en.json / ru.json (держать синхронными).
- `content/blog/` — снимок статей блога (сам блог — на pl-platform); читают только `generate-sitemap` и `generate-turbo-feed`.
- `scripts/` — Express-сервер (лиды/отзывы), prerender.cjs (SSR), check-projects, generate-sitemap, generate-turbo-feed,
  fetch-reviews, build-photo, notify-telegram, serve-static.

## Команды
- `npm run dev` — Vite dev (НЕ запускать без запроса Pavel).
- `npm run build` — `tsc -b && vite build` (без пререндера).
- `npm run build:static` — **прод-сборка**: vite build + SSR build + turbo-feed + `prerender.cjs` (/ru-маршруты в HTML).
  Vite читает env только из `env/` (`envDir`): корневой `.env` — admin-сервера (NODE_ENV=development → dev-React в бандле!).
- `npm run preview:static` — проверка пререндера (:4188), НЕ `vite preview`.
- `npm run photo` — **замена фото «Обо мне» в одно действие**: положить файл как `_design/photo-source.<jpg|png|webp|avif>`
  и запустить — соберутся `public/about/photo-{480,720}.{avif,webp}` (≤ 90 КБ). Подробно — README.
- Картинки сайта: генерировать по правилам глобального CLAUDE.md в едином стиле (см. README «Иллюстрации»);
  исходники — `_design/generated/` (вне git). Скриншоты проектов и фото Pavel НЕ заменять генерацией.
- `npm run lint` — eslint.
- `npm run admin-server` — Node-бэкенд сайта (лиды, отзывы, статика).

## Деплой (прод)
- Сервер **russh** (`ssh russh`, root; hostname host1890270-1). Git на сервере нет — только копия файлов.
- Путь: `/srv/sites/pavellevdin.ru/projects/app` → `dist/` (статика), `scripts/` (Express), `server.js` (entry).
- Docker: сервис `pavellevdin` в `/srv/stack/docker-compose.yml` (node:24, `node server.js`, :3001, контейнер
  `stack-pavellevdin-1`), nginx → proxy_pass. Внутри контейнера путь `/home/host1731061/pavellevdin.ru` = та же папка.
- Процесс: `npm run build:static` → `tar czf - -C dist . > dist.tgz` → `scp` → распаковать в `dist.new`, `chown ubuntu:ubuntu`
  → `mv dist dist.bak-<дата> && mv dist.new dist` → `cd /srv/stack && docker compose restart pavellevdin` → curl всех /ru-маршрутов.
  Откат: `mv dist.bak-<дата> dist` + restart. Перед заменой dist — бэкап и сверка контента блога сервер↔репо (md5).
- Бэкенд-файлы (`scripts/*.js`, `scripts/routes`, `scripts/lib`, `scripts/review-tokens.json`) — по одному, с бэкапом `*.bak-<дата>`;
  отзывы — `scripts/data/reviews.json` (пишет приложение), модерация — админка → «Отзывы».
- **НЕ трогать:** `scripts/data/` (лиды, api-keys, публикации), `.env`, `scripts/node_modules`, `/srv/stack/*` (кроме restart
  pavellevdin), другие сайты в `/srv/sites`. `htdocs/www` — старая копия HostLand (fallback в server.js).
- GitHub (`levdinpaul/pavellevdin-site`, приватный; старый `levdinking/Code-Craft` заморожен на 05.04.2026, remote `old-levdinking`): `.github/workflows/ci.yml` только собирает, НЕ деплоит. Деплой — только с явного «деплой» Pavel.

## Маршрутизация агентов — см. `./agents.md`

## Проверка перед «готово»
build / lint зелёные; для UI — глазами через playwright-mcp; для форм/лидов (фаза 1) — согласие на
обработку ПДн по 152-ФЗ; a11y + DSGVO — критичны для фазы 2 (DE). i18n — три локали синхронны.
Не рапортовать «готово» без проверки.
