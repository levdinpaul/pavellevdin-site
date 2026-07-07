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

- Контакты: Telegram + email `levdin.pavel@yandex.ru`, Am Dobben 102A, 28211 Bremen.

## Стек
- **Фронт:** React 19 + Vite 7 + TypeScript 5 + Tailwind 3.4 + shadcn/ui (Radix) + framer-motion +
  react-router-dom 7 + react-i18next (de/en/ru) + recharts + RHF + Zod v4 + react-helmet-async.
- **Бэкенд (админка):** Node + Express (`scripts/server.js`) — auth, stats, публикации.
  Хранилище/деплой через **FTP** (`basic-ftp`), сжатие картинок **Tinify**, загрузки `multer`,
  уведомления в **Telegram** (`notify-telegram.js`). CORS бэка завязан на `pavellevdin.ru`.

## Структура (src/)
- `sections/` — маркетинг-блоки: Hero, About, Services, Portfolio, Testimonials, Advantages, CTA,
  DigitalEcosystem, LatestArticles.
- `pages/` — Home, Services, Portfolio, Contact, Imprint, Privacy; `pages/blog/*`; `pages/admin/*`.
- `components/` — `ui/` (shadcn), `ui-custom/`, `layout/`, `admin/`, `blog/`.
- `data/` — projects.ts, testimonials.ts, blog-index/loader.
- `i18n/locales/` — de.json / en.json / ru.json (держать синхронными).
- `content/blog/` — статьи блога.
- `scripts/` — admin Express-сервер, deploy-only (FTP), add-article, notify-telegram.

## Команды
- `npm run dev` — Vite dev (НЕ запускать без запроса Pavel).
- `npm run build` — `tsc -b && vite build`.
- `npm run lint` — eslint.
- `npm run admin-server` — Node admin-бэкенд.
- `node scripts/deploy-only.cjs` — FTP-деплой.

## Маршрутизация агентов — см. `./agents.md`

## Проверка перед «готово»
build / lint зелёные; для UI — глазами через playwright-mcp; для форм/лидов (фаза 1) — согласие на
обработку ПДн по 152-ФЗ; a11y + DSGVO — критичны для фазы 2 (DE). i18n — три локали синхронны.
Не рапортовать «готово» без проверки.
