# BACKLOG — PL – Innovativ Digitalbau

Дальнейшие задачи. Приоритет сверху вниз внутри секций. Контекст сделанного — в `LAST_SESSION.md`.
Почищено 2026-10-22 (аудит 10): закрытые пункты удалены — история в git (`git show v10-trust:memory/BACKLOG.md`).

---

## 0. Ждут решения / действий Pavel (НЕ выдумывать)
- [ ] **Ссылки соцсетей** Дзен / GitHub / RuTube — прислать; вписать в `CHANNELS` (`src/constants/contacts.ts`), панель
  и `sameAs` подхватят сами. Сейчас в панели: Telegram, WhatsApp, YouTube, VK, почта.
- [ ] **Визитка (12) после деплоя — проверить с телефона**: импорт .vcf на iOS и Android (имя, компания, телефон, почта, сайт,
  ссылки соцсетей), tel:/mailto:, QR камерой, «Поделиться»; `curl -s https://pavellevdin.ru/ru/business-card | grep robots` → noindex;
  тестовая заявка с /contact доходит в CRM и Telegram.
- [ ] Визитка: номер в пререндеренном HTML /business-card (noindex защищает от поиска, не от парсеров). Если станет проблемой —
  выводить номер только на клиенте (после гидрации). Решение Pavel.
- [ ] de-локаль: город на /contact и визитке — «Hannover, Germany» (дословно по промпту 12); лектор советует «Hannover, Deutschland».
- [ ] FAQ de: «die nächste Phase zahlen Sie erst, wenn Sie mit der vorherigen zufrieden sind» — лектор советует для DE (фаза 2)
  юридически безопаснее «…erst nach Abnahme der vorherigen» (UWG: «zufrieden» читается как гарантия). Решить до запуска .de.
- [ ] Фаза 2 (DE): Impressum ссылается на § 5 DDG, а он требует ladungsfähige Anschrift — с решением «адрес инкогнито»
  несовместимо. До запуска .de — c/o-адрес/Impressum-Service или решение юриста (pl-legal-de).
- [ ] **USt-Hinweis** для de/en цен: ключ `pl.prices.vatNote` («Umsatzsteuer-Hinweis folgt» — заглушка), статус налога (Kleinunternehmer §19?).
- [ ] **Почта info@pavellevdin.ru**: MX — HostLand; ящик создаётся в панели HostLand. Отправка писем (лиды, аудит, отзывы)
  готова в коде (`scripts/lib/mailer.js`), выключена, пока в серверном `.env` нет `SMTP_HOST` (+ `SMTP_PORT`, `SMTP_FROM`,
  `SMTP_USER/SMTP_PASS`). То же — `.env` платформы (письма кабинета и просьбы об отзыве).
- [ ] **Telegram-бот**: токен/чат — в `.env` сайта и платформы. Транспорт готов: ретранслятор (README, «Telegram через ретранслятор»).
- [ ] **VK ID**: приложение на id.vk.com, redirect `https://pavellevdin.ru/api/auth/vk/callback` → VK_CLIENT_ID/SECRET в .env платформы.
- [ ] **pavellevdin.de** — после регистрации: `env/.env` → `VITE_DE_MAIL_READY=true`, серверный `.env` → `DE_MAIL_READY=true`, ящик info@.
- [ ] Реквизиты КП и режим налога — админка платформы → Настройки → «Настройки студии».
- [ ] Цены: магазин (100 000) дешевле корпоративного (120 000) — медианы; при желании поднять (`src/data/pricing.json` + копия в pl-platform).
- [ ] **Освободить RAM** на ПК — сборки/Lighthouse/npm ci убиваются при нехватке памяти.

## 1. Сайт — открытые задачи
- [ ] **PDF-отчёт экспресс-аудита** (сейчас клиенту уходит текстовое письмо на его языке) — отложено в аудите 10.
- [ ] **CSP → enforce**: сейчас `Content-Security-Policy-Report-Only` + `/api/csp-report` (лог `[csp]`). Через 1–2 недели
  без нарушений в логах — переключить на `Content-Security-Policy`.
- [ ] Факты PageSpeed на кейсах — `src/data/pagespeed.json`, перемер раз в квартал (`scripts/measure-pagespeed.mjs`, README).
- [ ] Легаси на сервере: Passenger-`server.js` в корне app, `tmp/restart.txt`, fallback `htdocs/www` в `scripts/server.js`,
  старые файлы удалённых маршрутов в `scripts/routes|lib`, `/srv/sites/pavellevdin.ru/htdocs/www` (не трогать без решения Pavel).
- [ ] Удалить на сервере старые `dist.bak-*` и `scripts/*.bak-*`, когда релиз стабилен.
- [ ] Скрипт деплоя сайта (сейчас — ручная последовательность из CLAUDE.md).
- [ ] Отзывы: снимок одобренных попадает в статический HTML только при сборке (`scripts/fetch-reviews.cjs`);
  новые одобренные видны сразу через /api/reviews.
- [ ] Если до старта сцены идёт программный smooth-scroll к секции ниже, цель может оказаться внутри выросшей сцены.

## 2. Портфолио — проекты клиентов (не код сайта)
- [ ] Polaris: публично только экран входа — скриншоты из авторизованной сессии или лендинг.
- [ ] Opora Life (vestoralife.de): на скриншоте в hero ещё «Vestora Life» — привести бренд к одному.
- [ ] med-agency (превью): `index, follow` — поставить noindex.
- [ ] kub-perevozki: на мобайле `.sticky-cta` и cookie-баннер шире экрана (~590px). delimes: кнопка «Как это работает» белым по белому.

## 3. pl-platform
- [ ] Капча (Yandex SmartCaptcha), cron scheduler-tick/watchdog/sysadmin, enum content-topic.category, SEO-компонент blog-post.
- [ ] Ключ Claude (`ANTHROPIC_API_KEY`) — нет; агенты на Gemini.
- [ ] Статья Next.js 15 — в CMS обложка «Astro 5».
- [ ] Telegram-бот: аватар через BotFather `/setuserpic` — `brand/social/avatar-1024.png`.

## 4. SEO / GEO (фаза 1 — Яндекс, РФ; фаза 2 — DE, Hannover)
- [ ] Яндекс Бизнес / Вебмастер / Турбо — проверить индексацию после 09 (посадочные услуг, FAQ).
- [ ] Кейсы с измеримыми цифрами роста (позиции, заявки) — только с данными клиента, не выдумывать.
- [ ] Контент-план блога (платформа): цены на сайт 2026, Next.js vs WordPress, Core Web Vitals, AEO/GEO,
  152-ФЗ/DSGVO-чек-лист, автоматизация, сроки разработки, мультиязычность — answer-first, FAQ, ссылка на посадочную.
- [ ] Фаза 2: немецкие посадочные под Hannover, Google Business Profile, NAP (без адреса и телефона).
