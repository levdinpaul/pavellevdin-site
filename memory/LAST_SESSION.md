# LAST_SESSION — PL – Innovativ Digitalbau (портфолио)

## Сессия 2026-10-26 — промпт 20 «YouTube @pvellevdin + Telegram-канал блога» (ВСЁ НА ПРОДЕ)
- **YouTube** @PaulLevdin → @pvellevdin (тот же канал UCcGySRAK4LS5UJ7aZum2TVA): `src/constants/contacts.ts`, `index.html` (sameAs), `public/llms.txt`.
  peristeenplussystem.ru — sed по www (8 HTML + 14 JS-чанков), бэкап `backups-p20-20261027-005427.tgz`.
- **Ссылка на канал** https://t.me/levdin_blog («Telegram-канал / Telegram-Kanal / Telegram channel», ключ `pl.rail.tgChannel`): SocialRail,
  Footer, ContactPage, BusinessCardPage (+ .vcf), JSON-LD sameAs. Клик по каналу — только `social_click`, не цель `click_telegram`.
  Сайт: ветка fix-20-youtube-tg → main, тег v20-telegram; dist выкачен, бэкап `dist.bak-2026-10-26-pre20`.
- **Платформа pl-web:p17** (pl-platform main c1eb544, тег v20-telegram; откат TAG=p16): `AUTO_PUBLISH_TELEGRAM=true` → автопост ru-статьи
  в канал @levdin_blog (-1003835251621) после реальной публикации; обложка — **файлом** (multipart) через ретранслятор; одно сообщение
  (подпись ≤1024 по абзацам); кнопки «Читать статью» (utm_source=telegram), «Обсудить проект», «Написать Павлу» (t.me/pavellevdin), «Сайт».
  Журнал постов (защита от дублей) — Strapi `published-contents` (`lib/publishing/telegram-ledger.ts`), схема CMS не менялась.
  `POST /api/cron/telegram-backfill` (CRON_SECRET; dry-run по умолчанию, `?send=1`, `?id=`, `?limit=`; предпроверка прав бота → 409).
- **Backfill:** 7 ru-статей отправлены в канал, message_id 30–36 (пробные 17–25 удалены вместе с записями журнала).
- .env платформы: добавлены TELEGRAM_CHANNEL_BOT_TOKEN/ID/LINK, AUTO_PUBLISH_TELEGRAM (бэкап `.env.bak-2026-10-26-pre-p17`).
- Отчёт: `/home/claudeuser/cc-runs/prompt-20-REPORT.md` (VPS).

## Сессия 2026-10-26 — промпт 17 «полоса разработчика под футером» (ВСЁ НА ПРОДЕ)
- Серая подпись p16 заменена на отдельную полосу `<aside class="pl-devband">` сразу после `</footer>` на 5 RU-сайтах: anapa, kub, domusman, delimes, peristeen.
  В каждой: знак «Кладка PL» (inline SVG, currentColor) + «Сайт разработал Павел Левдин — сайты, SEO и автоматизация» + кнопка «pavellevdin.ru →» (/ru/).
- Цвета: anapa — янтарь #ff8a1f, kub — золотой градиент, domusman — дуб #8A6236, delimes — золото #D4A017, peristeen — #0077B6. Контраст ≥ 4.87:1, CLS 0.
- peristeen: старая ссылка убрана из HTML и 4 JS-чанков. delimes/peristeen: исходников на сервере нет — при пересборке перенести полосу вручную (сниппет в ~/cc-runs/work-17/scripts/).
- Не сделано (вне рамок): kub `.site-header::before right:-200px` → страница шире экрана на 200px, cookie-баннер на мобильном недоступен; фикс `.site-header{overflow-x:clip}`.
- Отчёт: `/home/claudeuser/cc-runs/prompt-17-REPORT.md` (VPS).

## Сессия 2026-10-26 — промпт 16 «автопубликация блога + безопасность /api + подписи + Метрика kub» (ВСЁ НА ПРОДЕ)
- **Платформа на russh `pl-web:p16`** (main 8b1e4a9, тег v16-p16); откат — TAG=p14 (есть p11/p13/p14/p15). `.env`: `AUTO_PUBLISH=true` (бэкап `.env.bak-2026-10-26-pre-p15`).
- **Автопубликация:** пайплайны agents-weekly после `ready` → только Strapi, если review ≥ 70 (`AUTO_PUBLISH_MIN_SCORE`), compliance без critical,
  есть ru+de+en и обложка (`lib/pipeline/quality-gate.ts`); иначе ready + причина в Telegram. О каждой опубликованной статье — Telegram со ссылками.
  `POST /api/cron/autopublish` (CRON_SECRET): догнать ready (`?id=N`), `?run=N` — продолжить застрявший пайплайн, `?translatePost=ID` — перевести ru-статью и добавить de/en.
- **Обложка:** `lib/images/branded-cover.ts` — 1200×630, Chromium + Onest, логотип «Кладка PL» (`web/public/_pl/brand/logo-horizontal.svg`), запасной рендер sharp.
- **Баг найден и исправлен:** de/en-локализации создавались с тем же slug → Strapi «must be unique» → публиковалась только ru. Теперь slug локали из её заголовка.
- **Опубликованы:** №2 «Заявка с сайта потерялась…» (id 16 + de/en, переводы сделаны заново) и №1 «Как не терять заявки… вечером и в выходные» (id 19, review 82, compliance 92).
- **Безопасность:** `/api/pipeline/[id]/retry` и GET `/api/cron/sys-admin-check` закрыты; аудит 148 route.ts — прочие уже защищены. Скрипт: `~/cc-runs/work-16/curl-auth-check.sh`.
- **Подписи «Разработка сайта — Павел Левдин»:** anapa, kub, domusman (новая строка ©), peristeen (уже была). **kub:** второй счётчик Метрики 113808027.
- Отчёт: `/home/claudeuser/cc-runs/prompt-16-REPORT.md` (VPS).

## Сессия 2026-10-26 — промпт 15 «выкатка + ретранслятор Gemini + FitHilf» (ВСЁ НА ПРОДЕ)
- **Новое правило Павла:** сделано и проверено → сразу на прод (см. LEARNINGS).
- **Платформа:** fix-audit-14 → main, тег v14-audit-fixes; затем p13 (152-ФЗ-политика ретранслятора, 5xx → следующая модель)
  и p14 (таймаут Gemini 180 с, таймаут → следующая модель). **На russh `pl-web:p14`** (main e953477 + docs c2819a9, тег v15-p14);
  для отката `pl-web:p11` и p13. Первая выкатка p13 дала 500 на всех статьях блога (excludes `src/**` выкинул
  node_modules/*/src → jsdom) — откат на p11 за ~3 мин, исправлено, smoke статей с реальным Strapi до выкатки.
- **Ретранслятор Gemini:** VPS `~/pl-tg-relay/relay.conf` + `location /gemini/` (X-Relay-Key, SNI, 300 с); на russh
  `GEMINI_MODEL=gemini-3.8-flash`, `GEMINI_API_BASE=http://tg-relay:18081/gemini/v1beta`. Агенты с ПДн через него не ходят
  (`GEMINI_RELAY_ALLOWED_AGENTS`, дефолт в `web/src/lib/ai/relay-policy.ts`).
- **Проверки:** 88/88 sitemap 200, /ru/admin 307, /api/health 200, PDF письма через API 200 (%PDF, тестовое письмо удалено),
  agents-weekly?force=1 → 202 started, пайплайн №2 → `ready` (черновик ru/de/en, без картинки — visual fallback), №1 failed (таймаут, до p14).
- **Strapi:** title статей 13/14/15 сокращены через REST (slug не менялся), видны в `<title>`.
- **russh уборка:** dist.bak-* — остался только dist.bak-2026-10-26-pre14.
- **FitHilf:** данные старого fithilf.ru перенесены в новый (VL), база host1731061_fithilf на russh удалена (дампы в /srv/archive);
  nginx fithilf-web — resolver 127.0.0.11 + `$php_upstream`.
- Параллельно в тот же день другая сессия правила SMTP/метрику в `.env` платформы и пересоздавала стек — учитывать.
- Отчёт: `/home/claudeuser/cc-runs/prompt-15-REPORT.md` (VPS).

## Сессия 2026-10-26 — промпт 14 «аудит-фиксы» (ветки fix-audit-14 в обоих репо; сайт → main, тег v14-audit-fixes, ВЫКАЧЕН; платформа НЕ выкачена)
- **Предпроверка:** исходники из работающих образов russh сравнены с main pl-platform (`diff -r --strip-trailing-cr`, в образах CRLF).
  В `pl-web:p11` есть хотфикс, которого не было в main (`api/admin/leads/route.ts` — фолбэк `STRAPI_INTERNAL_URL`), в `pl-cms:p10` —
  зависимости `react/react-dom/react-router-dom/styled-components` в cms/package.json. **main отставал от прода → по правилу промпта
  платформа НЕ деплоилась и в main НЕ сливалась.** Хотфиксы перенесены первым коммитом ветки (683cf98).
- **Сайт (выкачено 2026-10-26):** `app.disable('x-powered-by')`; `/.well-known` — отдельный `express.static` (общий скрывает
  dot-папки → было бы 404); alt обложек статей в блоке «Блог» на главной (`pl.blog.coverAlt`, ru/de/en); `public/llms.txt`;
  `public/.well-known/security.txt` (Expires 2027-10-26). Сборка `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome npm run build:static`
  на VPS (90/90). Бэкап: `dist.bak-2026-10-26-pre14`, `scripts/server.js.bak-2026-10-26-pre14`; файлы верификации
  Bing/Google/Яндекс перенесены в новый dist. Проверено: 88/88 URL sitemap = 200, нет x-powered-by, оба файла 200 text/plain, все img с alt.
- **Платформа (ветка fix-audit-14 @ c7be532, образ `pl-web:p12` 1,51 ГБ на VPS, на russh НЕ перенесён):**
  `GEMINI_MODEL` (дефолт gemini-3.8-flash, сверено ListModels), `GEMINI_FALLBACK_MODELS`, `GEMINI_IMAGE_MODEL`, `GEMINI_API_BASE`
  + X-Relay-Key; failover при снятой модели / запрете региона / сбое сети → NVIDIA → Claude (если ключи есть); блог: уникальные
  title лент, noindex пустой ленты, title статей ≤ 65; Dockerfile без `npm install` в runner (3,08 → 1,51 ГБ), без poppler; poweredByHeader:false.
- **Главное открытие:** с russh Gemini API отвечает `400 User location is not supported` — агенты не заработают от одной смены модели,
  нужен ретранслятор Gemini через VPS (как tg-relay). NVIDIA_API_KEY/ANTHROPIC_API_KEY на проде не заданы. Подробности и команды —
  `/home/claudeuser/cc-runs/prompt-14-REPORT.md` на VPS.
- hreflang на блоге уже был (аудит ошибся); title статьи sozdanie-sovremennogo-sayta-2026 лучше поправить в Strapi (предложения в отчёте).

## Сессия 2026-10-24 — промпты 13 + 13b «упростить админку pl-platform, письма на бланке PL» (pl-platform, ветка admin-simplify-13, НЕ смержено, образ НЕ собран)
- **Меню (7):** Обзор, Заявки, КП, Письма, Блог, Отзывы, Настройки (`AdminShell.tsx`). Проекты / CRM-задачи / Пользователи / Команда
  остались по прямой ссылке (данные и маршруты не тронуты), `/admin/seo` → редирект на `/admin`. Колокольчик убран — уведомления
  шли только по проектам; о новых заявках говорит счётчик у «Заявок». `CRMTasksBlock` нигде не подключён — скрывать было нечего.
- **Заявки:** колонки Имя / Контакт / Сообщение (80 симв.) / Источник / Дата / Статус; 3 статуса поверх enum без миграции
  (new · contacted+qualified = «В работе» · closed_won+closed_lost = «Закрыта»; пишется new/contacted/closed_won); API понимает
  группы `status=new|in_work|closed` и `id=`. Корзина в каждой строке + AlertDialog «Удалить заявку навсегда?» (DELETE /api/admin/leads),
  фильтр по умолчанию «Все» (раньше меню добавляло `?status=new`). Кнопка «Сделать КП» → `/admin/angebot/new?lead=<id>`
  (есть проект у заявки → выбирается он, нет → клиент из заявки с `lead_id`).
- **Отзывы:** вкладки Ожидают/Опубликованы/Отклонены, «Скопировать ссылку для клиента» → `https://pavellevdin.ru/{lang}/review`
  (открытая форма сайта, без токена), импорт свёрнут в «Добавить отзыв вручную». UI токенов убран, API/cron токенов не тронуты.
- **Обзор:** `/api/admin/overview` (новые заявки, заявки за 30 дн., отзывы на модерации — с сайта, КП в работе draft/ready/sent/viewed;
  график по дням, источники) + `/api/admin/traffic` (`src/lib/traffic`, кэш 10 мин): Метрика (YANDEX_METRIKA_TOKEN + _COUNTER_ID,
  визиты/посетители/цели), Вебмастер (YANDEX_WEBMASTER_TOKEN), GSC (сервисный аккаунт), Bing (BING_WEBMASTER_API_KEY).
  На проде ни одного ключа нет (проверено по именам в .env) → везде «не подключено» + памятка «Как подключить ключи». GA4/Buffer/GBP скрыты, код цел.
- **КП:** колонки №/клиент/предмет/итого/статус/дата, подсказка «КП создаётся из заявки…». Терминов Holzbau/MP в КП не было.
- **Письма (13b):** бланк «Pavel Levdin · Innovativ Digitalbau» (`BriefPdfTemplate`, стили `.lt-*` в `angebot/pdf/document.ts`,
  Onest + JetBrains Mono base64), только «Hannover, Germany», телефон — только при «Показывать телефон на бланке» в Настройках
  (studio-setting `letter_show_phone` + `letter_phone`), реквизиты в подвале только заполненные (новое поле `inn` + прежние),
  «1 / N». Язык письма ru/de/en (поле `language` у brief-document): дата «Ганновер, 24 октября 2026» / «Hannover, 24. Oktober 2026» /
  «Hannover, 24 October 2026», должность, прощание; прощание из текста распознаётся на 3 языках. «Из шаблона»: 4 × 3
  (`lib/brief/templates.ts`, de вычитан pl-lektor-de), суммы/сроки — поля формы, пусто → «______». MP_TOKENS/gold удалены,
  `COMPANY.ceo` → `owner`, `legalName` и «Inhaber» убраны.
- **SMTP:** без `SMTP_HOST` Strapi раньше «отправлял» письмо в никуда и помечал его отправленным — теперь `sendBriefEmail` отвечает 503
  `SMTP_NOT_CONFIGURED`, админка пишет «Почта не подключена: скачайте PDF и отправьте сами». Из резервного тела письма в cms убраны «Tel. ·» и «Inhaber».
- **cms-схемы:** только новые необязательные поля (brief-document.language; studio-setting.inn / letter_show_phone / letter_phone) —
  Strapi добавит колонки при старте, данные не трогаются. Нужен новый образ cms.
- Проверено: `tsc --noEmit` web и cms — 0; vitest web 79/79 (тесты бланка переписаны); eslint web — 0 ошибок; ключи ru/de/en синхронны;
  PDF писем ru/de/en сгенерированы локально (системный Chrome) и осмотрены. **Не сделано:** сборка образов на VPS (авто-режим
  блокирует удалённую запись) и скриншоты админки 1440/390 (нужен живой Strapi + вход администратора; локально 1 ГБ свободной RAM).

## Сессия 2026-10-24 — промпт 12 «форма контактов + цифровая визитка» (ветка contact-card-12 → main, тег v13-contact-card), ВЫКАЧЕНО 2026-10-24 вечером
- **ДЕПЛОЙ 2026-10-24** (по «деплой» Pavel): main @ c55a331 (+ de «Hannover, Deutschland»), build:static в контейнере claude.ai
  (`PUPPETEER_SKIP_DOWNLOAD=1 PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), 90/90 маршрутов,
  доставка tar → временная ветка → VPS → russh. Бэкап прода: `dist.bak-2026-10-24-v13`. Файлы верификации Яндекс/Google/Bing сохранены.
  Проверено curl: все /ru,/de,/en из sitemap = 200, /business-card noindex и вне sitemap, tel: только на визитке, POST /api/lead → 400 (валидация согласия).
  Не проверено (нужен телефон): импорт .vcf iOS/Android, tel:, QR камерой, «Поделиться», реальная доставка заявки в Telegram.
  Временные ветки deploy-* удалены. Из песочницы russh-MCP нельзя `chown`/`cp -p`/docker — рестарт сервиса только через `ssh russh` с VPS.
- **A. /contact** переписан на классы PL (`.pl-contact*` в pl-extra.css, блок «12»), строки — `pl.contactPage` (3 локали).
  RHF + Zod v4 (`mode: onTouched`), ошибки — ключи `pl.contactPage.errors.*`; поле «контакт» = почта / @ник ≥5 / t.me·wa.me·vk.com /
  номер ≥7 цифр. Бюджет — `pricing.json → budgets.ru [100000, 300000]` + `budgetBounds()` (de/en → € по курсу ЦБ), уходит в лид строкой.
  Экран успеха (фокус на заголовок, «Написать ещё» → фокус в «Имя»), ошибка сети — «Повторить» + Telegram. Согласие ПДн,
  honeypot, `contact_submit`, `/api/lead` — как были. Фото — `/about/photo-480` 4:5. Мобильный порядок: заголовок → форма → контакты.
- **B. /business-card**: телефон показан ТОЛЬКО здесь — `PHONE` в contacts.ts строится из единственной `MOBILE` (из неё же wa.me).
  `noindex` (PageMeta), убрана из sitemap (88 URL), JSON-LD Person без телефона, sameAs = сайт + Telegram + YouTube + VK.
  `vk: https://vk.com/pavellevdin` заполнен → иконка VK появилась и в SocialRail. QR — `qrcode` (ленивый чанк), `src/lib/qr.ts`,
  уровень H, тихая зона 4, знак в центре 9×9 модулей; декодирован jsQR со страницы и с PNG. .vcf — `src/lib/vcard.ts` (CRLF,
  X-SOCIALPROFILE + itemN.URL для Android, PHOTO base64 из нового `public/about/photo-vcard.jpg` 256², 7 КБ — его делает `npm run photo`).
  PNG 1080×1920 — `src/lib/card-image.ts` (canvas, иконки/знак сняты с DOM карточки; набор строк как на странице по 12b, у WhatsApp — номер).
  Share → navigator.share, иначе «Скопировать ссылку»; печать — @media print, A4 на одну страницу, светлая.
  `@types/qrcode` НЕ ставить: тянет Node-типы и ломает `setTimeout` (SceneSection) — свои типы в `src/types/qrcode.d.ts`.
- **Фото**: в git лежало старое ч/б, на проде — новый цветной портрет; `public/about/photo-{480,720}.{avif,webp}` взяты с прода побайтно и закоммичены.
- Проверено: npm ci, build, build:static 90/90, lint; puppeteer 1440/768/390 (ошибки, успех, сбой сети, de-бюджет), PDF печати,
  .vcf (структура), QR. Ревью (reviewer) — блокеров нет, находки исправлены; de-строки вычитаны. **Не проверено на реальных
  iOS/Android** (импорт .vcf, tel:, камера) и доставка лида в CRM/Telegram — нужен прод/телефон.

## Сессия 2026-10-24 — промпт 11 «соц-панель, FAQ оплаты, SEO-хвосты» (ветка social-faq-11 → main, тег v12-social), НЕ выкачено
- **A. Соц-панель** `components/pl/SocialRail.tsx` + `.pl-rail` (pl.css; мёртвый `.pl-social` удалён): fixed справа по центру, ≥1024 px;
  на 1024–1279 поле `.pl-container` 68 px, чтобы панель не наезжала. ContactFab теперь только <1024 px. Каналы — `CHANNELS` в
  `contacts.ts` (+youtube @PaulLevdin; vk/dzen/github/rutube пустые → не выводятся), `getSocialLinks`/`getSameAs`;
  sameAs главной и About = Telegram + YouTube. Цель `social_click {network}` (data-social / youtube / vk) в `bindContactClickGoals`.
- **B. FAQ** «Оплата и договор» — текст Pavel (ru), de вычитан pl-lektor-de (Ich-Form, «Phasen», «ordnungsgemäße Rechnung»), en — в Ich-Form;
  фильтр TODO снят → 6 вопросов на главной и в FAQPage (ru/de/en проверено в пререндере).
- **C.** title /ru/services 57; description калькулятора ≤160 (ru/de/en); описание реквизитов расширено; § 5 TMG → § 5 DDG.
  Ленивые локали: de/en — отдельные чанки (`ensureLocale`/`setLanguage` в `i18n/index.ts`), main.tsx ждёт локаль пути до гидрации,
  entry-server ждёт setLanguage; гонки/вход через «/» исправлены по code-review. OG: `npm run og` (scripts/build-og.cjs) →
  `public/og/<slug>.jpg` + `about.jpg` 1200×630, check-projects падает без OG кейса. W3C: 30/30 en-страниц — 0 ошибок (validator.w3.org).
  Метрика 108284704 не тронута.
- Проверено: npm ci, build, build:static 90/90, lint — зелёные; puppeteer 1024/1280/1440/1920 + 390: панель не пересекает контент,
  консоль чистая, переключение RU/EN/DE и «/» → /en, /de на нужном языке.
- `src/data/posts.json` в рабочей копии меняет fetch-posts при сборке — не коммитился.

## Сессия 2026-10-22 — промпт 10 «исправления по аудиту 01–09b», сайт выкачен (тег v11-audit в обоих репо)
- **Выкачено на сайт** (бэкап `dist.bak-2026-10-22-1911-pre10` + `scripts/{lib/telegram,routes/audit,lib/fx,notify-telegram,welcome-post}.js.bak-2026-10-22-1911-pre10`;
  `scripts/lib/audit-i18n.js` новый): 90/90 маршрутов 200, OG главной по языку, stats.html/og-image.png/manifest.json → 404, sitemap 91 URL,
  getMe через ретранслятор из контейнера → `PL_Innovativbau_bot`.
- **Сайт (A1–A8, C)**: puppeteer в devDependencies, prebuild `ensure-build-data.cjs`, sitemap не в git, CI = npm ci + lint + build + build:static
  (зелёный); главная через PageMeta; visualizer только ANALYZE=1; gsap/ThemeToggle/мёртвый CSS/старые i18n-ключи (−150 ключей)/manifest.json/
  browserconfig.xml/photo-800 удалены; `scripts/data/` вне git; цель `contact_submit`; «Оставить отзыв» в мобильном меню; кейс → посадочные услуги
  (индекс `services-landing-index.json`, /services больше не тянет полный JSON); пыль 700 (×4 CPU: 60/58 fps); письмо аудита на ru/de/en;
  PageSpeed на 5 кейсах (vl 52/77, mp 35/58, vestora 44/89, kub 59/89, fithilf 95/98 — 2026-10-22, локальный Lighthouse при нехватке RAM;
  polaris, peristeen, delimes, domusman, anapa не измерены — замер снят по памяти); Telegram — `scripts/lib/telegram.js` (TELEGRAM_API_BASE, X-Relay-Key, 10 с).
- **Платформа (B1–B6, C)** — merge 298cf03, тег v11-audit, НЕ собрана/выкачена (делает Claude в claude.ai): lock, тесты 73/73, lint 0 errors,
  остатки MP, i18n админки, manifest, /set-password → кабинет, «Удалить мои данные», лимит AI (по умолчанию 2000/мес — проверить счётчик
  pipeline-logs до выкатки), Google-вход через согласие ПДн, Telegram-хелпер (web + cms → нужен ребилд Strapi), infra/russh + infra/vps.

## Сессия 2026-10-21 — анимация интеграций, 07 «меню + валидация», 08 «бренд», 09/09b «доверие и лиды»
- **Выкачено на сайт** (бэкап `dist.bak-2026-10-21-1504-pre07`, `scripts/server.js.bak-2026-10-21-1504-pre07`; теги v8-menu-validate, v9-brand):
  анимация схемы интеграций; меню = страницы футера + «Ещё ▾» (калькулятор в строке с 1360 px), «Войти» ↔ «Кабинет» по cookie
  `pl_auth=1` (ширина не меняется, CLS 0), skip-link, один `<main>`/`<title>`; пререндер всех 63 маршрутов ru/de/en;
  URL без слэша (200), `/x/` → 301, мусор — 404; HSTS + CSP Report-Only (`[csp]` в логе контейнера); CORS без 500;
  бренд «Кладка PL» везде, имя «Innovativ Digitalbau», JSON-LD logo `/brand/logo-1200.png`. Итоги — memory/validation-2026-10.md.
- **pl-platform (не выкачено — сборку на VPS авто-режим не пустил)**: ветка `auth-flag-07` — флаг `pl_auth` в session.ts +
  бренд (знак, иконки, письма с `/brand/logo-horizontal@2x.png` вместо битого `/icon-192.png`, PDF КП/писем с логотипом,
  OG по языку); ветка `trust-09` — редизайн блога в стиле PL, админка отзывов (ссылки, импорт), авто-просьба об отзыве.
- **09/09b (ветка trust-09 сайта)**: блог на главной (`scripts/fetch-posts.cjs` → `src/data/posts.json`), «С кем работаю» пока нет
  отзывов, процесс + условия, FAQ (FAQPage), экспресс-аудит (`/api/audit`, `scripts/lib/site-audit.js`, лимит 3/сутки, SSRF-защита,
  выкл. `AUDIT_ENABLED=false`), плавающая кнопка связи, 9 посадочных `/:lang/services/<slug>`, открытая форма `/:lang/review`,
  токены отзывов для 11 проектов, импорт отзывов с площадок (API), факты PageSpeed на кейсах (`scripts/measure-pagespeed.mjs`).

## Сессия 2026-10-21 (утро) — промпт 06 «hero: короче, без линий, сразу и на телефоне», задеплоено (тег v7-hero-2d)
- Жалобы Pavel 2026-10-20: полёт длинный, видна линия спирали, анимация стартует не сразу, на телефоне сцену «проматывают».
- **Сцена переписана на canvas 2D без three.js** (−≈500 КБ): `scene-2d.ts` (пыль спирали + проекция названий технологий),
  `scene-model.ts` (камера, пыль, статичный SVG-кадр для SSR); полёт короче на треть, линий спирали нет — только пыль и подписи.
- Старт сразу после гидрации (canvas после первого кадра, rAF → idle ≤ 300 мс), пыль уже в SSR (600 точек) — нет «пустого» hero.
- Телефон: 500 точек без мерцания, 24 fps в покое (в аудите 10 пыль поднята до 700). CLAUDE.md обновлён (three.js удалён).
- Ветка `site-05` → main (fe9b6889). Следом — анимация схемы интеграций (6a4c9f8f), выкачена вместе с 07.

## Сессия 2026-10-19 — промпт 05 «доводка», задеплоено
- **Платформа переехала в РФ** (152-ФЗ): russh `/srv/sites/pavellevdin.ru/platform` (compose pl-prod, pl-web в сети stack_web),
  дамп → restore, количество записей во всех таблицах совпало, 30 файлов медиа; стек на VPS удалён, архив
  `~/archive/pl-platform-2026-10-19` на VPS. Бэкап 03:20 на russh. Лиды всех языков снова идут в CRM. «TEST live» удалён.
- **Цены**: региональные медианы РФ (27 источников, memory/pricing-research-regions.md), € = ₽ по курсу ЦБ РФ.
- **Калькулятор** /:lang/calculator → сохранить/отправить через кабинет (вход с возвратом), заявка + лид с разбивкой,
  «Сделать КП из расчёта», Telegram.
- **Вход**: пароль, магическая ссылка (15 мин), VK ID (скрыт без ключей), согласие ПДн с датой.
- SMTP-переменные + mail:test (сайт и платформа), Telegram-уведомления платформы, cron агентов пн/чт 07:00 (draft),
  раздел «Блог» в админке (ручная публикация), налоговая строка/реквизиты КП в настройках, #418 исправлена,
  с сайта удалены basic-ftp/multer/tinify, lint 0.

## Сессия 2026-10-19 (ночь) — промпт 04b «платформа», задеплоено (тег v6-platform-04b; репо levdinpaul/pl-platform)
- **pl-platform** (форк MP: Next 16 + Strapi 4.25 + Postgres) — кабинет клиента, админка (лиды, «Проекты», КП, письма,
  «Отзывы», CRM-задачи, SEO, пользователи, настройки студии, «Команда» AI-агентов), блог. Прод — VPS 212.227.100.97
  (`~/pl-platform/prod`, compose `pl-prod`), наружу только edge :8443 (TLS + пин, только russh). На pavellevdin.ru nginx russh
  отдаёт платформе `/(ru|de|en)/(login|register|…|cabinet|admin|blog|portal|datenwiderruf)`, её `/api/*`, `/_pl/`, `/_next/`,
  `/uploads/`; всё остальное — сайту. Бэкап конфига: `/srv/stack/nginx/pavellevdin.ru.conf.bak-2026-10-19-pre04b`.
- **Блог**: 5 статей перенесены в Strapi с ТЕМИ ЖЕ slug (старые URL живы без 301; Tailwind-статья — черновиком, как была),
  sitemap `/ru/blog/sitemap.xml` (в robots.txt), x-default → ru; category/tag → 301 на ленту.
- **Лиды**: сайт пишет в `scripts/data/leads.jsonl` (РФ), затем копия в CRM (`scripts/lib/platform.js`, конфиг
  `scripts/platform.json` вне git). Старый файл перенесён (1 строка, тестовая), не менялся (md5 сверен).
- **Отзывы**: модерация — /ru/admin/reviews платформы (через `/api/site-admin/reviews` сайта по токену).
- **Сайт**: удалены старый блог и старая админка Vite с FTP/HostLand-пайплайном; пути платформы открываются полной
  загрузкой (`PlatformRedirect`, защита от цикла), «Личный кабинет» в футере. Бэкапы: `backup-2026-10-19-pre04b.tgz`,
  `dist.bak-2026-10-19-pre04b`, `*.bak-2026-10-19-pre04b` у server.js / lead.js / reviews.js.
- **Агенты**: AI-агенты блога — веб/SEO/автоматизация, ru — источник, публикация только черновиками (`AUTO_PUBLISH=false`);
  Claude-агенты `pl-*` (21) в `.claude/agents` обоих репо.
- Админ платформы: info@pavellevdin.ru (ссылка установки пароля — `~/pl-platform/prod/admin-reset-link.secret` на VPS).

## Сессия 2026-10-18 (ночь) — промпт 04a «доводка сайта», задеплоено (тег v5-site-fixes)
- **Спираль медленнее**: сцена 610svh (mobile 480svh, ×1.6), таймлайн HERO_END 0.095 / FLIGHT [0.075, 0.9] /
  FINALE [0.9, 0.9375] — hero и финал по абсолютной прокрутке как раньше, полёт длиннее; следование за скроллом
  мягче (τ 260 мс ≈ lerp 0.06); near-fade пыли у камеры (альфа и размер), без «квадратов».
- **Контакты**: `getContacts(lang)` / `getEmail(lang)` в `src/constants/contacts.ts` — ru → info@pavellevdin.ru,
  de/en → info@pavellevdin.de при `VITE_DE_MAIL_READY=true` (пока .ru). Телефон удалён отовсюду (тексты, i18n, визитка,
  vCard, Impressum, JSON-LD); WhatsApp — только кнопкой wa.me. levdin.pavel@yandex.ru удалён из кода.
  Лиды → письмо на ящик своей локали (`scripts/lib/mailer.js`, SMTP без зависимостей, включается `SMTP_HOST` в .env).
- **Цены**: `src/data/pricing.json` (ru ₽ / eu € netto), блок «Стоимость» на /services#prices + OfferCatalog JSON-LD,
  строка «Сайты от 60 000 ₽ / ab 1.900 € netto» на главной.
- **DE/EN без Яндекса**: Метрика грузится только на /ru (GA4 — везде после согласия); тексты de/en, portfolio.json,
  cookie-баннер, Datenschutz/Privacy (→ GA4), JSON-LD index.html — без Yandex; «Яндекс Метрика» в спирали только ru.
- **Анимации**: line-mask reveal заголовков (Title), stagger 70 мс, 3D-tilt ≤ 4° + блик карточек (pointer:fine),
  магнит главных CTA, подчёркивание меню, View Transitions, count-up «10+ / 11 / 3» на главной; micro-UI
  (Lighthouse 100, сниппет+JSON-LD, лог API, чат с MCP, Telegram, контейнеры, пост) — главная «Что я делаю» + /services.
- **Отзывы**: `scripts/routes/reviews.js` (POST /api/review, GET /api/reviews, админ /api/admin/reviews),
  хранение `scripts/data/reviews.json`, токены `scripts/review-tokens.json`, страница /:lang/review/:token,
  модерация «Отзывы» в админке, секция скрыта без одобренных, JSON-LD AggregateRating при ≥ 3.
- **Найдено и исправлено**: прод-сборка шла с development-React — Vite читал корневой `.env` (NODE_ENV=development
  для admin-сервера). Теперь `envDir: env/` (только VITE_*). Mobile Lighthouse локально 65 → 80–83.
- Скролл-компенсация при росте сцены: мгновенная, без scroll anchoring (hash /ru/#about встаёт ровно).

## Сессия 2026-10-18 (вечер) — доводка hero (промпты 03 + 03b), задеплоено
- **Hero**: «Создаю сайты. / Соединяю системы.», подпись, лид, одна кнопка + текстовая ссылка. Шрифт **Onest**
  (self-host, вместо Golos Text), JetBrains Mono — только технологии и мелкие метки. Заголовки 500 / −0.04em.
- **Спираль**: 36 технологий из `src/data/stack.ts` (единственный источник; 12 key — Onest светлые с акцентной точкой,
  остальные — mono приглушённые), золотой угол, 3–4 в кадре. Пыль вдоль 2 рукавов (1600/700 точек, ShaderMaterial,
  мерцание, тихое вращение в покое — рендер только пока секция видна). Финал «Весь стек / Один разработчик. Полный цикл.»
  ~10% прокрутки → сразу «Работы». WebGL по первому взаимодействию / 8 с, prerender вырезает modulepreload scene-gl.
- **Шапка**: без плашек — лого-текст, RU / DE / EN текстом, CTA-ссылка с акцентным подчёркиванием, без прогресс-бара,
  без соц-колонки на главной. **Главная**: Работы сразу после сцены, «Обо мне» = фото + H2 + лид + ссылка.
- Удалены все сгенерированные картинки (public/images/{scene,services,site}) и GenImage, PointerFX, Sparkle.
  OG перерисован кодом (`_design/og/og.html`, пыль спирали + H1).
- Проверки: tsc ✓, build:static 25/25, lint 19 (все старые), формы → /api/lead ✓, reduced-motion / no-JS / no-WebGL ✓,
  Lighthouse локально (gzip) mobile 76–78 / desktop 98–99, CLS ≤ 0.003. Тег `v4-hero`, бэкап `dist.bak-2026-10-18-prehero2`.

## Сессия 2026-10-18 — редизайн «PL Сцена» (промпты 02 + 02b), задеплоено
Ветка `redesign-scena` (тег до начала `pre-scena`), после деплоя смержена в main, тег `v3-scena`.

### Что сделано
- **Дизайн «PL Сцена»**: палитра #060810 / #7AA2FF, Golos Text (self-host), новые шапка/футер на всех страницах,
  главная = hero + sticky-сцена 7 шагов (380vh вместо 640vh, карточки читаемые) + WebGL (three 0.186.1, лениво).
- **Картинки**: 17 сгенерированных иллюстраций в одном светлом стиле (7 шагов, 8 услуг, интеграции, 2 для About)
  + OG 1200×630 (фон-генерация, текст кодом). Исходники — `_design/generated/`.
- **Портфолио**: 11 проектов по инвентарю (`src/data/portfolio.json`), страницы кейсов /portfolio/<slug>, фильтр,
  live-статус (build-time), реальные скриншоты desktop/mobile, честные описания ru/de/en.
- **Обо мне** /about: реальное фото (`npm run photo`), count-up, навыки, процесс, бегущая строка стека, принципы, JSON-LD.
- **Услуги**: 8 направлений по навыкам, раскрывающиеся карточки, схема «сайт ↔ CRM ↔ Telegram ↔ AI».
- **Адрес инкогнито**: улица/индекс удалены отовсюду, только Hannover. Title главной «Web Coding Hannover | …».
- **SEO**: пререндер 25 маршрутов (+/ru/about, 11 кейсов), sitemap 61 URL с hreflang, PageMeta (canonical/hreflang/OG/JSON-LD).
- **Перф**: favicon 534 КБ → 0,6 КБ; гидрация в startTransition; WebGL по первому взаимодействию; content-visibility.

### Проверки (все зелёные перед деплоем)
tsc ✓ · lint — 19 ошибок, все старые (было 21, новых 0) · build:static ✓ (25/25) · 25+ маршрутов прямой загрузкой без
ошибок консоли/гидрации · формы contact/brief → /api/lead ✓ · grep Dobben|28211|Bremen = 0 · three.js не в initial ·
агент-верификатор (скрины 1440/390) — блокеры найдены и исправлены (дубли пререндера, переполнение на мобайле, split-text).
**Lighthouse по живому проду**: /ru mobile 61–79 / desktop 95; /ru/about 64–83 / 98; кейс 78 / 97; CLS 0.

### Деплой
russh: бэкап `backup-2026-10-18-prescena.tgz`, старый dist → `projects/app/dist.bak-2026-10-18-prescena`,
restart `pavellevdin`; все маршруты 200, лиды/.env на месте, логи без ошибок. scripts/ на сервере не менялся.

### Решения, принятые самостоятельно — см. итоговый отчёт сессии и BACKLOG 1c.

## Сессия 2026-10-17/18 — чистка и синхронизация перед редизайном
Промпт: `memory/prompts/01-cleanup-sync.md`. Дизайн/функционал НЕ трогались.

### Итог
- **Бэкап:** `D:\Backups\portfolio-2026-10-17.bundle` (git --all), `D:\Backups\portfolio-src-2026-10-17.zip`
  (без node_modules/dist), на сервере `/srv/sites/pavellevdin.ru/backup-2026-10-17.tgz` (dist+scripts вкл. data+src).
- **Мусор:** `sardar-copy/` + `.tar.gz` (чужой проект) → `D:\Сайты\_sardar-copy\`; удалены `nul`, Design System .zip,
  копия package-lock, `tlvT6.png`, `info.md` (не использовались), пустые `.agents/.codex/.qoder`.
- **Прод ↔ репо:** по md5 контент блога (5 статей), картинки и `scripts/` на сервере = репо (кроме более нового
  локального `prerender.cjs`). Server-only контента нет, переносить было нечего.
- **CI:** `.github/workflows/deploy.yml` (GitHub Pages на каждый push в main) → `ci.yml` (npm ci + build:static, без публикации).
  GitHub Pages в репо **всё ещё включены** — выключить в Settings → Pages.
- **Git:** main fast-forward = redesign-digitalbau; теги `pre-merge-2026-10` (старый main b02e68aa), `v2-ssr-baseline`.
  Push: у `levdinpaul` нет write в `levdinking/Code-Craft` (403) → 2026-10-18 origin перенесён в новый приватный `levdinpaul/pavellevdin-site` (вся история + теги), старый remote переименован в `old-levdinking`.
- **Деплой** (через `ssh russh`, root): новый `dist` (SSR-пререндер 13 маршрутов) залит atomic mv, старый →
  `projects/app/dist.bak-2026-10-18`; `docker compose restart pavellevdin` (контейнер `stack-pavellevdin-1`).
  Проверено: все /ru-маршруты, /de/, /en/, /admin, sitemap, turbo.rss → 200; `#root` с SSR-контентом;
  `/api/health` ok; leads.jsonl и .env на месте. `scripts/` на сервере не обновлялся (не было изменений).
- **Проверки:** tsc зелёный, build:static зелёный; lint — 21 error / 7 warn в НЕтронутых файлах (в BACKLOG).

### Найдено (в BACKLOG)
- Блог-пайплайн админки (publish) после build делает `uploadDistToFTP` на HostLand → без FTP_* env падает 500
  (dist при этом уже обновлён). Картинки/медиа/видео пайплайна тоже льются на FTP.
- Legacy: `deploy-only.cjs`, `restart-passenger.cjs`, `ftp-list.cjs`, `add-article.cjs`, корневой `server.js`
  (точка входа Passenger), fallback на `htdocs/www` в `scripts/server.js`, `tmp/restart.txt`.
- Статья Tailwind: в `ru/de/en.json` нет `slug`/`published` → не пререндерится; старый URL
  `/ru/blog/tailwind-css-2026-architecture/` теперь уходит в SPA-fallback.
- `/images/projects/socialhub.png` (портфолио) — файла нет ни в репо, ни на проде.
- В origin чужая ветка `что-делать-тут-a15a8` (отдельная история) — не трогалась.

## Сессия 2026-07-09 — React SSR-пререндер всей /ru-выдачи

### Контекст (что изменилось с 2026-06-13)
Прод-домен теперь **pavellevdin.ru**, основной язык **ru** (фаза 1 — РФ/Яндекс, см. auto-memory
`portfolio-target-market-ru`). Миграция на Next.js (план прошлой сессии) **НЕ делалась** — вместо неё
на текущем React 19 + Vite внедрён честный **React SSR-пререндер**. Главная — новый blueprint-дизайн
(`sections/digitalbau/HomeScene`), под-страницы пока в старом стиле (но SSR-чистые).

### Что сделано (5 коммитов на ветке redesign-digitalbau, билд зелёный)
1. **`5b6d2b65` главная** — корень тормозов был не дизайн, а сломанная гидрация. Фиксы: i18n
   `initImmediate:false`+`useSuspense:false` (убрал Suspense-fallback при гидрации); настоящий SSR
   (`src/entry-server.tsx` renderToPipeableStream) вместо puppeteer-capture; `prerender.cjs` подменяет
   тело `#root`. Результат: гидрация чистая, **mobile 30→61 / desktop 64→86, TBT 2400→220ms, CLS 0**.
2. **`54143c99` services+portfolio** — renderToPipeableStream+onAllReady резолвит React.lazy.
3. **`891e9510` блог** — dehydrate/hydrate: prerender грузит данные, инжектит `window.__BLOG_DATA__`,
   `useBlog`/`BlogPost` берут из него начальный стейт. TOC переписан на изоморфный regex (был DOMParser).
4. **`b716bb2b` contact+brief** — формы неконтролируемые (FormData + fetch в onSubmit), SSR трогает
   только разметку. Лид-захват проверен отправкой обеих форм (перехват `/api/lead`) — работает.
5. **`8014387` imprint+privacy+business-card** — статичные страницы. Итог: **10/10 /ru-маршрутов чисто**.

### Проверка
Мерить перф/гидрацию через `npm run preview:static` (порт 4188, мимикрия Apache DirectoryIndex),
НЕ `vite preview` (он отдаёт пустой SPA-shell). Все 10 маршрутов — прямая загрузка = чистая гидрация,
0 ошибок в консоли. Визуал (скрины) и функционал (nav/⌘K/формы/блог) — без регрессий.

### Что осталось (follow-up, в BACKLOG)
- Lantern (движок PageSpeed) занижает mobile LCP (12s против реальных 4.7s applied / 1.7s observed) —
  привязывает LCP к JS SPA. Для фазы-1 полевой перф важнее лаб-числа.
- Пререндерятся только `/ru/*`. Фаза 2 (DE/EN на pavellevdin.dev) — добавить /de,/en в SSR_ROUTES/prerender.
- Blog `category/*` и `tag/*` не SSR-ятся (не в списке пререндер-маршрутов) — при желании добавить.
- Технические детали — в `LEARNINGS.md`.

## Сессия 2026-06-13

### Контекст проекта
Личный сайт-портфолио веб-разработчика Pavel Levdin (Бремен, DE). Цель — лиды.
Бренд переименован: ~~PL WebInnovativbau~~ → **PL – Innovativ Digitalbau**.
Стек (сейчас): React 19 + Vite 7 + TS + Tailwind 3.4 + shadcn/ui + framer-motion + react-i18next (de/en/ru, дефолт de) + react-router 7. Прод-домен `pavellevdin.dev`. Адрес для schema: Am Dobben 102A, 28211 Bremen. Email levdin.pavel@yandex.ru, Telegram t.me/PavelLevdin.
Полный операционный бриф — в `.claude/CLAUDE.md`, маршрутизация агентов — в `.claude/agents.md`.

### Что сделано (внедрено, билд зелёный)
1. **Заведён `.claude/`** в проекте (CLAUDE.md + agents.md). vl-* агенты тут НЕ применяются.
2. **Иерархия моделей оркестратора** (глобально, mega-brain + ~/.claude): Fable 5 — топ (архитектура/критичное) · Opus — сложный код/review/дизайн · Sonnet — реализация · Haiku — механика. Пины `model:` на dev-агентах (system-architect/planner=fable, reviewer/code-analyzer/designer/critic=opus, coder/tester=sonnet). Правки в `PROTOCOL.md` §6 и `orchestrator.md` §301.
3. **Hero fit-to-screen:** высота `100dvh`, flex-центр, H1 на `clamp()` (~56px вместо 72px), плотнее отступы.
4. **Визуальная переработка (P0+P1)** по дизайн-ревью:
   - Единая dark-палитра, один бренд-акцент **cyan `#16E0F2`**; токены `surface/surface-2/faint/signal`; cyan-glow тени; dot-grid фон. Dark — тема по умолчанию (тоггл рабочий).
   - Убрана «радуга» teal→amber→blue (Advantages/Services/About/Hero).
   - Scroll-progress бар; CTA full-width border → 48px cyan hairline (DNA-вето); DigitalEcosystem teal→primary + mono-нумерация; Hero showcase → Geist Mono; убраны debug console.log из Layout.
   - Файлы: `src/index.css`, `tailwind.config.js`, `src/hooks/useTheme.tsx`, секции Hero/About/Services/Advantages/DigitalEcosystem/CTA, `components/layout/{Layout,Header,Footer}`, `components/ui-custom/ScrollProgress.tsx`.
5. **Новая секция `src/sections/TechStack.tsx`** («возможности/стек», трёхъязычно, mono-акценты) — в Home после About.
6. **Переименование** во всех файлах → PL – Innovativ Digitalbau; Header/Footer wordmark = «PL» cyan + остальное `text-foreground` (контраст-безопасно в обеих темах).
7. **SEO quick wins:** город в title («Webentwickler Bremen…»), OG/Twitter EN→DE, расширен JSON-LD (адрес Bremen, Person+knowsAbout, areaServed) в `index.html`; title в `Home.tsx`.
8. Шрифты Geist/Geist Mono — уже стояли. Диск C: почищен (7.96→17.97 ГБ) — разблокировал сборку (был OOM при ~1 ГБ RAM).

### Ключевое решение
- **Next.js миграция ПОДТВЕРЖДЕНА Pavel** (полный переход, App Router, SSR/SSG). Причина: сейчас CSR/Vite SPA → AI-краулеры видят пустой `<div id=root>`, слабо для Google/AEO. План (8 этапов) — в `BACKLOG.md`.

### НЕ закоммичено
Ничего не коммитил. Рабочее дерево содержит и до-сессионные неясные изменения (удалённые `.gitignore`/`.env.example`/`avatar.png`/`create_image.py`, файл `nul`, untracked node_modules). **Перед коммитом — ревью Pavel:** что делать с этими чужими удалениями; мою работу коммитить отдельным чистым коммитом.

### Незавершённость окружения
RAM ~1 ГБ свободно (другие приложения держат ~6 ГБ из 7.5). Vite-сборка проходит на pagefile, но Next-сборки тяжелее — перед миграцией освободить RAM. playwright-MCP в сессии НЕ подключён (нужен для скриншотов карточек).
