# pavellevdin.ru — PL Innovativ Digitalbau

Сайт-портфолио Павла Левдина (веб-разработка, SEO, интеграции, AI-автоматизация). Дизайн «PL Сцена».
React 19 + Vite 7 + TypeScript + Tailwind 3.4 + react-i18next (ru / de / en) + собственный SSR-пререндер.

## Команды

| Команда | Что делает |
|---|---|
| `npm run build:static` | **Прод-сборка**: проверка доступности проектов → sitemap → `tsc` → vite build → SSR build → turbo-feed → пререндер `/ru/*` |
| `npm run preview:static` | Локальная раздача `dist/` как на проде (порт 4188). Для замеров — **не** `vite preview` |
| `npm run photo` | Пересобрать фото «Обо мне» из исходника (см. ниже) |
| `npm run lint` | ESLint |
| `npm run dev` | Vite dev-сервер |

## Данные

- **Портфолио** — `src/data/portfolio.json` (11 проектов: ссылка, категория, статус, featured, стек, тексты ru/de/en).
  Его читают React, `scripts/prerender.cjs` (страницы кейсов) и `scripts/generate-sitemap.cjs`.
  Скриншоты реальных сайтов: `public/images/portfolio/<slug>/{desktop,desktop-2,mobile}.webp`.
- **Статус «онлайн»** — `src/data/projects-status.json`, пишет `scripts/check-projects.cjs` при сборке.
- **Тексты** — `src/i18n/locales/{ru,de,en}.json`, ключи нового дизайна под `pl.*` (структура одинакова во всех локалях).
- **Контакты** — единый источник `src/constants/contacts.ts`.

## Фото «Обо мне» — замена в одно действие

1. Положить новое фото как `_design/photo-source.jpg` (или `.png` / `.webp` / `.avif`; папка `_design/` вне git).
2. Выполнить `npm run photo`.

Скрипт `scripts/build-photo.cjs` соберёт `public/about/photo-{480,720}.{avif,webp}` (каждый файл ≤ 90 КБ,
качество подбирается автоматически; ч/б фото кодируется в оттенках серого). Код страницы менять не нужно.

## Иллюстрации

Сгенерированы gpt-image через Codex в едином стиле (изометрия, матовая керамика + стекло, пастельный фон
#B9CDFF → лаванда → персик, акцент #7AA2FF; без текста, людей и логотипов). Исходники PNG — `_design/generated/`
(вне git), на сайте — webp 960w/480w в `public/images/{scene,services,site}/`.
Скриншоты реальных проектов и фото Павла сгенерированными картинками не заменяются.

## Деплой

Прод — сервер russh, docker-сервис `pavellevdin`. Процедура (бэкап → atomic `mv dist` → restart → проверка → откат)
описана в `.claude/CLAUDE.md`, раздел «Деплой».
