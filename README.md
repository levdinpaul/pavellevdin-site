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

## Визуал

Сгенерированных картинок на сайте нет (с hero v4). Главный визуал — спираль на главной: WebGL-пыль и названия
технологий из `src/data/stack.ts` (список стека правится только там). OG-изображение рисуется кодом:
`_design/og/og.html` → скриншот 1200×630 → `public/og-image.{png,jpg}`.
Старые генерации лежат в `_design/generated/` (вне git). Скриншоты реальных проектов и фото Павла не заменяются.

## Бренд

Бренд — **Innovativ Digitalbau**, знак «Кладка PL», подпись — Pavel Levdin. Правила, цвета и все файлы
(SVG в кривых, PNG, фавиконки, обложки соцсетей, OG) — [`brand/README.md`](brand/README.md).
На сайте знак рисует `src/components/layout/BrandMark.tsx` (тот же компонент — в pl-platform), логотипы для писем
и Google — `public/brand/` (`logo-horizontal@2x.png`, `logo-1200.png`), OG по языку — `public/og-image{,-de,-en}.jpg`.

## Деплой

Прод — сервер russh, docker-сервис `pavellevdin`. Процедура (бэкап → atomic `mv dist` → restart → проверка → откат)
описана в `.claude/CLAUDE.md`, раздел «Деплой».

## Telegram через ретранслятор

С russh `api.telegram.org` недоступен (таймаут), поэтому уведомления о лидах, отзывах и аудитах уходят через
ретранслятор на немецком VPS:

```
stack-pavellevdin-1 ──http──▶ tg-relay:18081 (контейнер pl-tg-tunnel на russh, SSH-туннель;
                                              ключ ограничен permitopen="127.0.0.1:18081")
                     ──ssh──▶ VPS: pl-tg-relay (nginx 127.0.0.1:18081, пускает только с X-Relay-Key)
                     ──https─▶ api.telegram.org
```

- Код: все вызовы Bot API — через `scripts/lib/telegram.js` (`telegramApiUrl(method)`, `telegramCall()`), таймаут 10 с,
  в тексте ошибки нет токена.
- Переменные (`.env`, образец — `.env.example`): `TELEGRAM_API_BASE` (по умолчанию `https://api.telegram.org`;
  на проде `http://tg-relay:18081`), `TELEGRAM_RELAY_KEY` (если задан — заголовок `X-Relay-Key`).
- Файлы туннеля и шаблон конфига ретранслятора лежат в репозитории pl-platform: `infra/russh/`, `infra/vps/tg-relay.conf.example`.
- Проверка с сервера: `docker exec stack-pavellevdin-1 node -e "…getMe…"` → 200 и имя бота.
