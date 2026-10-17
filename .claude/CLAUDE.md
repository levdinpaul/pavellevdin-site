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

- Контакты: Telegram + email `levdin.pavel@yandex.ru`. Город: **Hannover** (с 2026-10-18; Bremen больше не используется).
  Юридический адрес для Impressum/Datenschutz/vCard/JSON-LD — уточняется (старый Am Dobben 102A, 28211 Bremen неактуален; не выдумывать).

## Стек
- **Фронт:** React 19 + Vite 7 + TypeScript 5 + Tailwind 3.4 + shadcn/ui (Radix) + framer-motion +
  react-router-dom 7 + react-i18next (de/en/ru) + recharts + RHF + Zod v4 + react-helmet-async.
- **Бэкенд (админка):** Node + Express (`scripts/server.js`) — auth, stats, публикации.
  В коде ещё легаси **FTP/HostLand** (`basic-ftp`, см. BACKLOG 1a), сжатие картинок **Tinify**, загрузки `multer`,
  уведомления в **Telegram** (`notify-telegram.js`). CORS бэка завязан на `pavellevdin.ru`.

## Структура (src/)
- `sections/` — маркетинг-блоки: Hero, About, Services, Portfolio, Testimonials, Advantages, CTA,
  DigitalEcosystem, LatestArticles.
- `pages/` — Home, Services, Portfolio, Contact, Imprint, Privacy; `pages/blog/*`; `pages/admin/*`.
- `components/` — `ui/` (shadcn), `ui-custom/`, `layout/`, `admin/`, `blog/`.
- `data/` — projects.ts, testimonials.ts, blog-index/loader.
- `i18n/locales/` — de.json / en.json / ru.json (держать синхронными).
- `content/blog/` — статьи блога.
- `scripts/` — admin Express-сервер, prerender.cjs (SSR), notify-telegram; legacy FTP: deploy-only, add-article, restart-passenger, ftp-list.

## Команды
- `npm run dev` — Vite dev (НЕ запускать без запроса Pavel).
- `npm run build` — `tsc -b && vite build` (без пререндера).
- `npm run build:static` — **прод-сборка**: vite build + SSR build + turbo-feed + `prerender.cjs` (/ru-маршруты в HTML).
- `npm run preview:static` — проверка пререндера (:4188), НЕ `vite preview`.
- `npm run lint` — eslint.
- `npm run admin-server` — Node admin-бэкенд.
- ~~`node scripts/deploy-only.cjs`~~ — legacy FTP-деплой на HostLand, НЕ использовать.

## Деплой (прод)
- Сервер **russh** (`ssh russh`, root; hostname host1890270-1). Git на сервере нет — только копия файлов.
- Путь: `/srv/sites/pavellevdin.ru/projects/app` → `dist/` (статика), `scripts/` (Express), `server.js` (entry).
- Docker: сервис `pavellevdin` в `/srv/stack/docker-compose.yml` (node:24, `node server.js`, :3001, контейнер
  `stack-pavellevdin-1`), nginx → proxy_pass. Внутри контейнера путь `/home/host1731061/pavellevdin.ru` = та же папка.
- Процесс: `npm run build:static` → `tar czf - -C dist . > dist.tgz` → `scp` → распаковать в `dist.new`, `chown ubuntu:ubuntu`
  → `mv dist dist.bak-<дата> && mv dist.new dist` → `cd /srv/stack && docker compose restart pavellevdin` → curl всех /ru-маршрутов.
  Откат: `mv dist.bak-<дата> dist` + restart. Перед заменой dist — бэкап и сверка контента блога сервер↔репо (md5).
- **НЕ трогать:** `scripts/data/` (лиды, api-keys, публикации), `.env`, `scripts/node_modules`, `/srv/stack/*` (кроме restart
  pavellevdin), другие сайты в `/srv/sites`. `htdocs/www` — старая копия HostLand (fallback в server.js).
- GitHub (`levdinpaul/pavellevdin-site`, приватный; старый `levdinking/Code-Craft` заморожен на 05.04.2026, remote `old-levdinking`): `.github/workflows/ci.yml` только собирает, НЕ деплоит. Деплой — только с явного «деплой» Pavel.

## Маршрутизация агентов — см. `./agents.md`

## Проверка перед «готово»
build / lint зелёные; для UI — глазами через playwright-mcp; для форм/лидов (фаза 1) — согласие на
обработку ПДн по 152-ФЗ; a11y + DSGVO — критичны для фазы 2 (DE). i18n — три локали синхронны.
Не рапортовать «готово» без проверки.
