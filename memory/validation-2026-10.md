# Валидация сайта — 2026-10-21 (промпты 07 + 08)

Объём: 63 маршрута сайта (ru/de/en × главная, about, services, portfolio, contact, brief, calculator, business-card,
imprint, privacy, 11 кейсов) + sitemap + платформа (блог/вход — ссылки и заголовки). «Было» — прод до выкладки 07
(де/en тогда отдавали SPA-оболочку), «стало» — прод после выкладки (dist.bak-2026-10-21-1504-pre07 — откат).
Скрипты прогонов — в отчёте сессии (scratchpad): W3C Nu (validator.w3.org), axe-core 4 (puppeteer, 1440 px +
открытые «Ещё» и мобильное меню 390 px), schema.org validator, linkinator, puppeteer 375/390/768, локальный Lighthouse 12.

| Проверка | Было | Стало |
|---|---|---|
| W3C HTML, ошибки | 338 на 50 проверенных страницах (13–22 на страницу: `<title>/<meta>/<link>` внутри body, 3 title, 2 description, вложенный `<main>`, `aria-label` на div, `<button>` в `<a>`, inline `view-transition-name`) | **0** на 46 страницах ru/de; en — W3C ограничил частоту запросов (те же шаблоны) |
| W3C, предупреждения | 24 | 50 (информационные: «Section lacks heading» у декоративных секций, trailing slash у void-элементов из SSR) |
| axe serious/critical (узлы) | 73 serious (label-content-name-mismatch ×67, color-contrast ×3, link-in-text-block ×3) | **0** |
| axe moderate | 106 (region, landmark-unique, два `<main>`, main не верхнего уровня, heading-order) | **0** |
| `<title>` в HTML-документе | 4–5 (head + копии в теле) | **1** |
| canonical / description | 2 / 3 на странице | **1 / 1** |
| de/en: свои title, canonical, hreflang, lang | нет (оболочка с canonical на `/`) | **да** — пререндер всех 63 маршрутов |
| URL без слэша | 301 → `/x/` (canonical указывал на редирект) | **200**; `/x/` → 301 на `/x` |
| Несуществующие URL | 200 (soft-404) | **404** |
| og:url / twitter:* | статичные с главной на contact/brief/визитке/imprint/privacy | **по странице** |
| JSON-LD (schema.org validator) | — | **0 ошибок, 0 предупреждений** (было 147 предупреждений `serviceType` у ProfessionalService → `knowsAbout`) |
| sitemap: URL не 200 | 0 (но 54 URL отвечали 301) | **0**, все 64 URL — 200 без редиректа |
| Ссылки (linkinator, 347) | — | сайт: **0 битых**; платформа: 27 hreflang/переключатель языка статей на чужой slug (404) — исправление в pl-platform trust-09, 14× facebook sharer 400 (Facebook режет ботов, ложное) |
| Мобильные 375/390/768 | — | горизонтального скролла **нет** (189 комбинаций) |
| i18n | 505/503/505 ключей, 19–21 рассинхрон (мёртвые legacy-ключи), немецкий без умляутов на /contact | **442/442/442**, синхронно; умляуты исправлены |
| HSTS (сайт) | нет | `max-age=63072000; includeSubDomains; preload` |
| CSP | нет | **Report-Only** (отчёты → лог контейнера `[csp]`) |
| CORS чужого Origin | 500 на статику | без CORS-заголовков, 200 |

## Lighthouse (локальный, медиана 3, Chrome headless) — см. таблицу в отчёте сессии
PSI API без ключа исчерпал суточную квоту — замер локальным Lighthouse 12, одинаково до/после.

## Осталось (решение Pavel)
- **CSP**: перевести из Report-Only в строгий режим после 1–2 недель логов (`docker logs stack-pavellevdin-1 | grep '\[csp\]'`).
- **OG у кейсов и «Обо мне»** — скриншоты 1200×750 и фото 720×998 (webp). Для превью в мессенджерах лучше jpg 1200×630 на кейс.
- **title > 70** у /ru/services (73), description > 170 у калькулятора (183–189), короткие title/description у imprint.
- **Формы**: отправка лида/брифа/отзыва проверена валидацией полей и согласием 152-ФЗ; живую отправку на проде не делал
  (не засорять CRM/Telegram) — проверить одной тестовой заявкой.
- **Платформа**: флаг `pl_auth`, бренд, письма и PDF — в ветках pl-platform (`auth-flag-07`, `trust-09`), не выкачены:
  сборку образа на VPS авто-режим Claude не разрешил — нужна команда Pavel (README платформы «Сборка и деплой»).
- PageSpeed: нужен `PSI_API_KEY` (Google Cloud, бесплатно) — для честных цифр PSI и для экспресс-аудита.
