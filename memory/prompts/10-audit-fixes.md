# 10 — Исправления по аудиту 01–09b (сайт + pl-platform)

[Задача]
Закрыть всё, что аудит 2026-10-21 нашёл недоделанным или сломанным. Новых фич нет — только доводка, чистка, зелёные сборки/тесты.
Два репозитория: `pavellevdin-site` (ветка `audit-10`) и `pl-platform` (ветка `audit-10`). Сначала план по пунктам, потом правки.

## A. Сайт (pavellevdin-site)

A1. **Сборка на чистой машине (CI сейчас красный).**
   - `scripts/prerender.cjs:12` требует `puppeteer`, а его нет в package.json/lock → добавить в devDependencies
     (либо перевести prerender на `playwright`, если он уже есть — выбрать то, что меньше весит, и обосновать).
   - `npm run build` (tsc -b) падает без `src/data/fx-rate.json` и `projects-status.json` (они в .gitignore) →
     `prebuild`-скрипт, который создаёт их с безопасными значениями по умолчанию, если файлов нет (не перезаписывать существующие).
   - Проверка: свежий клон в отдельную папку → `npm ci && npm run build && npm run build:static` — зелёные. CI на GitHub зелёный.
   - `public/sitemap.xml` в git устарел (64 URL vs 91 после сборки) → либо генерировать в dist и убрать из git, либо обновлять — выбрать одно.

A2. **OG главных страниц.** `src/pages/Home.tsx:63` использует Helmet напрямую: на /ru /de /en `og:image=/og-image.png` (618 КБ, русский текст),
   `twitter:image` всегда ru, дубли keywords/author. → Перевести на `PageMeta` (OG по языку: og-image.jpg / -de / -en, 1200×630),
   убрать дубли. `og-image.png` удалить, если больше нигде не нужен. Проверить в `dist/{ru,de,en}/index.html`.

A3. **`stats.html` (rollup-visualizer) в прод-сборке** — я уже удалил его с прода руками; в конфиге Vite включать visualizer
   только при `ANALYZE=1`, чтобы он не попадал в dist.

A4. **Факты PageSpeed на кейсах** не выводятся: `src/data/pagespeed.json = {}`. Прогнать `scripts/measure-pagespeed.mjs`
   (локальный Lighthouse через LIGHTHOUSE_CLI, PSI-ключа нет) по 11 сайтам портфолио, закоммитить реальные цифры с датой замера.
   Никаких придуманных значений — если сайт не измерился, у него просто нет блока.

A5. **Мелочи UX/аналитики:**
   - цель аналитики на успешную отправку формы `/contact` (`/api/lead`) — как у brief/calc/audit;
   - в мобильное меню добавить «Оставить отзыв» (как в футере);
   - на кейсе — ссылка на соответствующую посадочную услугу (обратная перелинковка «кейс → услуга»);
   - пыль спирали на мобильном: `sceneDust(500)` → 700 (`src/sections/scena/scene-2d.ts:33`), проверить FPS на 390px с троттлингом CPU ×4;
   - экспресс-аудит: тема и текст письма клиенту по языку (ru/de/en), сейчас только ru. PDF-отчёт — НЕ делать сейчас, записать в BACKLOG.

A6. **Мусор и мёртвый код:** `public/about/photo-800.avif`, CSS `.pl-gen-frame` / `.pl-integr__media`, неиспользуемые i18n-ключи верхнего уровня
   (`hero`, `about`, `advantages`, `portfolio.socialhub`, `testimonials` и т.п. — удалять только то, что grep не находит в src, во всех трёх локалях),
   зависимость `gsap` (не импортируется), устаревшие `public/manifest.json` (#2F8E92, lang de) и `browserconfig.xml` (бирюзовый) —
   удалить или привести к бренду «Кладка PL» (#060810 / #7AA2FF), ссылки на них в index.html — синхронно.

A7. **`scripts/data/` в git.** 6 файлов старого пайплайна, включая `api-keys-config.json`, лежат в репозитории.
   → `git rm --cached`, добавить `scripts/data/` в .gitignore (на сервере файлы НЕ трогать — там рабочие данные).
   Если в истории есть реальные ключи — НЕ выводить их, а сообщить Pavel, какие сервисы перевыпустить.

A8. **Документация:** запись о сессии 06 в LAST_SESSION; почистить BACKLOG от закрытых пунктов
   («Lint 21 error», socialhub.png, projects.ts image '', SEO-план с Bremen и т.п.); добавить открытые: PDF аудита, USt-Hinweis, CSP enforce.

## B. Платформа (pl-platform)

B1. **`npm ci` в web падает** — lock рассинхронизирован (`@swc/helpers`). Пересобрать lock (`npm install` → закоммитить), `npm ci` зелёный.

B2. **vitest: 3 файла падают** — тесты ждут MP-бренд:
   `lib/brief/pdf/__tests__/generate.test.ts:25-29`, `lib/email/__tests__/branded.test.ts` (icon-192.png, «MP-Innovativbau», COMPANY.phone),
   `lib/cabinet/__tests__/client-request.test.ts` (импорт `server-only` — замокать). Привести к PL, `npm run test` — зелёный.

B3. **Остатки форка MP:**
   - `hooks/useAdminSettings.ts:44` — дефолт `contactPhone: '+49 176 21 457 584'` и tagline «Innovative Baulösungen» → убрать телефон, tagline PL;
   - `messages/de.json:1307` studioTopicPlaceholder «Holzbau nachhaltig planen» → тема про веб/SEO (во всех трёх локалях согласованно);
   - `name` в `web/package.json` и `cms/package.json` → `pl-platform-web` / `pl-platform-cms`, description PL;
   - комментарии про Langenhagen/Vitali Maier (BriefPdfTemplate.tsx:9,13);
   - классы `font-sora` (portal, datenwiderruf, admin/team, BlogNewsletterCTA) → шрифты PL (Onest);
   - маршрут `api/data-deletion/facebook` — удалить, если Facebook-логина нет;
   - идентификаторы `MP_*` можно оставить, если переименование рискованно — но отметить в README.

B4. **Админка по-русски:** захардкоженные немецкие строки (`admin/users/page.tsx:59,333,347`, `admin/brief/*` «Fehler»,
   `[locale]/portal/page.tsx` «Kundenbereich…») → через i18n (ru/de/en), Pavel читает админку на ru.

B5. **Lint web: 31 error** → 0 errors (any → типы; set-state-in-effect → правильные паттерны; `no-html-link-for-pages` — для ссылок на сайт
   оставить `<a>` с точечным eslint-disable и комментарием «путь сайта, не Next»).

B6. **Прочее:**
   - `<link rel="manifest">` в layout платформы (тот же бренд, что у сайта);
   - мёртвый путь `/{lang}/set-password`: nginx и `lib/platform-paths.ts` сайта отправляют его на платформу, а там только `/cabinet/set-password` → 404.
     Сделать redirect `/{lang}/set-password` → `/{lang}/cabinet/set-password` в платформе (nginx-конфиг в репо не менять без нужды);
   - в настройках кабинета — пункт «Удалить мои данные» (ведёт на существующий флоу datenwiderruf / запрос удаления);
   - `AI_MONTHLY_REQUEST_LIMIT` сейчас только показывается → реально блокировать вызовы агентов при превышении (понятная ошибка в админке);
   - вход через Google сейчас выключен, но создаёт аккаунт без согласия ПДн — если включат, должен вести на тот же шаг согласия, что VK complete;
   - README: строка crontab для `review-requests-cron.sh` (на russh я её уже установил: ежедневно 10:15).

## C. Telegram с российского сервера (оба репо) — ВАЖНО
С russh `api.telegram.org` недоступен (curl → таймаут, `fetch failed` из pl-web; google.com при этом 200). Значит уведомления
сайта и платформы в Telegram не дойдут, даже когда токен вписан. Решение — ретранслятор на немецком VPS (его поднимает Claude в claude.ai),
код должен уметь слать через него:
- единая переменная `TELEGRAM_API_BASE` (по умолчанию `https://api.telegram.org`); все вызовы `https://api.telegram.org/bot…`
  заменить на `${TELEGRAM_API_BASE}/bot…`. Сайт: `scripts/notify-telegram.js`, `scripts/lib/telegram.js`, `scripts/welcome-post.js`.
  Платформа: `web/src/app/api/cron/scheduler-tick`, `pipeline-watchdog`, `api/contact`, `api/data-deletion`, `lib/sysadmin/checks/engagement.ts`,
  `lib/notifications/{admin,support}-telegram.ts`, `lib/publishing/telegram-publisher.ts` — лучше через один хелпер `telegramApiUrl(method)`;
- опционально заголовок `X-Relay-Key` из `TELEGRAM_RELAY_KEY` (если задан) — ретранслятор пускает только с ним;
- таймаут 10 с и понятная ошибка в лог (без токена в тексте ошибки);
- `.env.example` / README обоих репо — описать переменные.

## Пункты, которые ждут Pavel (НЕ выдумывать)
- FAQ «Оплата и договор» — `TODO(Pavel)`, на главной из-за этого 5 вопросов вместо 6. Оставить скрытым, пока Pavel не даст текст.
- USt-Hinweis в de — заглушка «Umsatzsteuer-Hinweis folgt», ждёт решения по налогу.
- VK ID ключи, SMTP (ящик info@pavellevdin.ru на HostLand), Telegram-бот — Pavel делает сам.

[Контекст]
- Аудит 2026-10-21: по коду ❌ почти нет, но CI/тесты красные и есть хвосты. Платформа p7 (коммит 5933157 + 94ed54b favicon) уже на проде —
  собирал и выкатывал Claude в claude.ai (VPS → russh), сайт 07–09b выкатывал ты.
- На проде уже сделано руками: удалён `dist/stats.html`; установлен cron авто-просьб об отзывах; старая фиолетовая
  `web/src/app/favicon.ico` заменена на «Кладку PL» (коммит 94ed54b — сделай `git pull` в pl-platform перед работой).
- Правила проекта — `.claude/CLAUDE.md` обоих репо; телефон нигде не публикуется (только wa.me), адрес — только Hannover.

[Файлы]
Сайт: package.json, scripts/prerender.cjs, vite.config.ts, src/pages/Home.tsx, src/components/pl/PageMeta.tsx, src/data/pagespeed.json,
scripts/measure-pagespeed.mjs, src/components/layout/SiteHeader.tsx, src/pages/Project*.tsx, src/sections/scena/scene-2d.ts,
scripts/routes/audit.js, src/i18n/locales/*.json, src/styles/pl.css, public/*, .gitignore, memory/LAST_SESSION.md, memory/BACKLOG.md.
Платформа: web/package*.json, cms/package.json, web/src/hooks/useAdminSettings.ts, web/messages/*.json, web/src/**/__tests__/*,
web/src/app/[locale]/(admin)/admin/**, web/src/app/[locale]/portal/page.tsx, web/src/app/layout.tsx, web/src/lib/agents/**, README.md.

[Агенты]
- frontend/a11y-проверка — по своему роутингу из `agents.md`;
- `pl-copywriter-ru` + `pl-lektor-de` — для новых строк i18n (B3, B4, A5-письмо);
- code-review перед мержем.

[Готово когда]
- Сайт: свежий клон → `npm ci && npm run build && npm run build:static && npm run lint` зелёные; GitHub CI зелёный.
- Платформа: `npm ci && npx tsc --noEmit && npm run lint && npm run test` в web — 0 ошибок, все тесты зелёные.
- `grep -riE 'mp-innovativbau|Holzbau|Langenhagen|Maier|21 457 584|font-sora' web/src cms/src web/messages` → пусто (кроме docs/mp-origin).
- dist: /ru /de /en — свой og:image по языку; `stats.html` нет; на 11 кейсах есть блок PageSpeed (где замер удался).
- i18n три локали синхронны в обоих репо.
- Сайт: деплой на russh по процессу из CLAUDE.md (бэкап dist → замена → restart → curl всех /ru-маршрутов + /de /en).
- Платформа: только `git push` ветки и merge в main — **сборку и выкатку платформы делает Claude в claude.ai** (VPS → russh), не ты.
- Обновлены LAST_SESSION и LEARNINGS, отчёт Pavel: что сделано по каждому пункту A1–A8, B1–B6, C.

[Правила]
- Сначала план, потом правки; маленькие коммиты conventional commits; теги `v11-audit` (сайт) и `v11-audit` (платформа) после мержа.
- Не трогать на сервере: `scripts/data/`, `.env`, `/srv/stack/*` (кроме restart pavellevdin), другие сайты.
- Не выдумывать тексты отзывов, цифры, факты; секреты в чат не выводить.
- Версии Next/Strapi — смотреть в package.json, не по памяти.
