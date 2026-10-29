# PL - Innovativ Digitalbau: профиль студии

> Источник: бывшие проектные агенты `.claude/agents/pl-*` (перенесены в `.claude/_retired-agents/`, prompt-44). Роли теперь исполняют глобальные агенты `biz-*` (+ `rf-legal-biz`, `marketer`, `seo-specialist` и др.) и скиллы `biz-economist` / `biz-orchestrator`. Здесь только факты проекта. Пути `src/...`, `memory/...`, `public/...` - относительно репо сайта-портфолио (ПК: `D:\Сайты\Портфолио`, VPS-клон: `/home/claudeuser/cc-runs/work-23/pavellevdin-site`, GitHub: levdinpaul/pavellevdin-site).

## Бизнес
- Бренд: **PL - Innovativ Digitalbau**, Pavel Levdin, соло-разработчик, Hannover (Germany). Адрес инкогнито: улицу/индекс нигде не публиковать; телефон не публикуется.
- Услуги: сайты и веб-приложения (Next.js/React, Strapi, PostgreSQL), SEO + AI-поиск (AEO/GEO), интеграции (CRM, Telegram-боты, API), AI-автоматизация/MCP, инфраструктура (Docker, nginx, VPS). Языки: RU/DE/EN.
- Рынки: фаза 1 - РФ (pavellevdin.ru, русский, Яндекс, 152-ФЗ, ₽); фаза 2 - DE/ЕС (pavellevdin.dev / .de, немецкий, DSGVO, BFSG, Impressum, €). Валюты не смешивать; курс - с датой и источником.
- Источники правды в репо: цены `src/data/pricing.json` (ru ₽ / eu € netto, "от"/"ab"; group project / ongoing; hour: 2 500 ₽ / 75 €) + `memory/pricing-research.md`; кейсы `src/data/portfolio.json` (11 проектов); стек `src/data/stack.ts`; контакты `src/constants/contacts.ts` (email RU info@pavellevdin.ru, DE info@pavellevdin.de после регистрации домена, Telegram @PavelLevdin); отзывы - только реальные из `src/data/reviews.json`.
- Допустимый факт о стаже: "более 10 лет в веб-разработке" / "mehr als 10 Jahre Webentwicklung". Других цифр (клиенты, выручка, годы, отзывы) не выдумывать. Реальных финансовых данных в репо нет: всё, чего нет, - [гипотеза], запрашивать у Pavel.
- Проектный бриф: `.claude/CLAUDE.md`; сессии: `memory/LAST_SESSION.md`, `memory/BACKLOG.md`. Бизнес-артефакты агентов - `_business/` (финданные и цены клиентов не коммитить; нет в .gitignore - предупредить Pavel).
- Позиционирование (pricing-research): опытный фрилансер, середина рынка, не демпинг и не агентство; Next.js/React + headless CMS, SEO и автоматизация в комплекте.

## Параметры по ролям
### Финмодель / Excel (biz-financial-modeler, biz-excel-modeler)
- Выручка: проекты по пакетам (landing, small-site, business-site, shop, web-app, integrations, ai) + MRR (seo-care, care) + почасовые; RU и DE раздельно. Допущения: доступные часы, загрузка, часы на пакет, микс пакетов, доля RU/DE, курс, воронка, CPL по каналам, ретейнеры.
- Стресс-тесты: -30% заявок, -20% загрузки, отток ретейнеров, срыв оплаты крупного RU-клиента, курс ±20%, рост цен AI-API.
- Файлы: `_business/finance/financial-model.md` + CSV (источник правды), `financial-model.xlsx`, `model-summary.md`, `unit-economics.md`; калькулятор КП `_business/output/kp-calculator.xlsx` (пакет из pricing.json + часы x ставка + скидка по решению Pavel + этапы оплаты). Форматы: RU `#,##0 "₽"`, DE `#,##0 "€"`, даты ДД.ММ.ГГГГ; курс - отдельная ячейка с датой и источником. Скрипты `_business/<папка>/build_<имя>.py`.
### Графики (biz-chart-generator)
- Токены из `src/index.css` (:root): акцент #7AA2FF, фон "PL Сцена" #060810; для печати светлый фон + акцент + графит. 1600x900, dpi 150, + SVG; подписи на языке документа; разделители по локали (`1 500 000 ₽` / `1.500 €`).
- Набор: revenue-by-package (проекты + MRR + часы), effective-rate (эффективная ставка vs номинальная), price-positioning-ru/de (шкала фрилансер - студия - агентство), risk-heatmap и др. в `_business/charts/`.
### Документы / дек (biz-document-formatter, biz-pitch-deck-designer, biz-business-plan-writer)
- Шрифт Onest (self-host; Glob `**/*Onest*`; нет - Inter), embedded, кириллица и умлауты проверить; цвета из `src/index.css`; для печати светлый фон, акцент #7AA2FF / графит. PDF <10 МБ, метаданные.
- Документы в `_business/output/`: KP-<клиент>-<дата>.pdf / Angebot-<Kunde>-<Datum>.pdf и др.; шаблон `_template.typ` или `_metadata.yaml`.
- Дек: Marp, тёмная "PL Сцена" (#060810, #7AA2FF, Onest) / светлая для печати; 16:9, <=30 слов на слайд; footer "PL - Innovativ Digitalbau | Seite X/Y" (DE) / "стр. X/Y" (RU); в `_business/pitch/`; цена - из pricing.json.
- Businessplan: `_business/Businessplan.md` (DE) или `_business/plan-razvitiya.md` (RU); разделы Leistungsangebot (Ablauf Brief -> Angebot -> Umsetzung -> Launch -> Betreuung), Markt (KMU, Handwerk, Startups, агентства-партнёры), SWOT, риски.
### Тексты (biz-copywriter-de, biz-copywriter-ru/marketer, biz-lektor-de)
- Тексты DE: `src/i18n/locales/de.json`, `pricing.json` (поле `copy.de`), блог `src/content/blog/<slug>/de.json`; платформа - next-intl локали `web/messages`, статьи в Strapi `cms/`. Цены "ab 1.900 € netto", сроки "2-3 Wochen"; "PL - Innovativ Digitalbau" и "Pavel Levdin" одинаково везде. RU: `ru.json`, `pricing.json copy.ru`. Перенос в локали - с i18n-qa; три локали синхронны. Стиль сайта - "PL Сцена", минимализм (pavel-dna).
### Опросы / риски (biz-survey-designer, biz-risk-analyst)
- Опросы в `_business/research/surveys/`: Van Westendorp на 1-2 пакета, доплата за CMS/мультиязычность/SEO/AI-поиск/поддержку/сроки (RU в ₽, DE в €), понятность цен и брифа (`src/pages/Brief*`), интерес к ретейнерам и AI/MCP -> cro-analytics.
- Риски (`_business/research/risks.md`): неоплата и разрыв этапов, курс ₽/€, международные платежи из РФ, рост цен AI-API, санкционные ограничения, зависимость от одного клиента, bus factor = 1; триггеры -> последствия в ₽/€ или днях -> митигация -> контроль.
