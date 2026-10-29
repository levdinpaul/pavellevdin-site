# PL: оркестрация и экономика студии (бывшие pl-orchestrator / pl-economist)

> Источник: бывшие проектные агенты `.claude/agents/pl-*` (перенесены в `.claude/_retired-agents/`, prompt-44). Роли теперь исполняют глобальные агенты `biz-*` (+ `rf-legal-biz`, `marketer`, `seo-specialist` и др.) и скиллы `biz-economist` / `biz-orchestrator`. Здесь только факты проекта. Пути `src/...`, `memory/...`, `public/...` - относительно репо сайта-портфолио (ПК: `D:\Сайты\Портфолио`, VPS-клон: `/home/claudeuser/cc-runs/work-23/pavellevdin-site`, GitHub: levdinpaul/pavellevdin-site).

Роли: дирижёр - скилл `biz-orchestrator`, экономист - скилл `biz-economist` (главная сессия сама зовёт агентов, параллельно; субагенты субагентов не зовут). Агенты vl-* и mp-* - чужие проекты (стройкомпании), здесь не применяются. Репозитории: сайт-портфолио (React 19 + Vite + SSR-пререндер, источник правды) и платформа pl-platform (Next + Strapi: кабинет клиента, админка/CRM, блог с AI-агентами; `web/`, `cms/`, `infra/`).

## Алгоритм
1. Прочитать `.claude/CLAUDE.md` (если есть) и `memory/LAST_SESSION.md`.
2. Определить РЫНОК задачи (RU / DE / оба): от него зависят язык, право, валюта, каналы и выбор агентов.
3. ПЛАН (файлы, риски low/med/high) до правок, ждать "ок". Правки сайта: build/lint зелёные, UI проверить глазами (playwright), три локали синхронны.

## Маршруты (фраза -> исполнитель)
| Фраза | Исполнитель |
|---|---|
| экономика студии, ставка/час, загрузка, маржа пакетов, ретейнеры, окупается ли канал, цены пакетов | скилл biz-economist |
| финмодель, P&L, cash flow, break-even; xlsx, калькулятор КП | biz-financial-modeler; biz-excel-modeler |
| рынок веб-разработки RU/DE, цены конкурентов | biz-market-analyst |
| риски, санкции/платежи RU | biz-risk-analyst |
| графики для КП/плана/дека | biz-chart-generator |
| бизнес-план, Gründungszuschuss; PDF КП/бриф; дек | biz-business-plan-writer; biz-document-formatter; biz-pitch-deck-designer |
| субсидии на цифровизацию клиентам | biz-foerderung-application (см. foerderung-digital.md) |
| Impressum, AGB, AVV, Datenschutz, BFSG, договор DE | biz-legal-de; РФ-право (152-ФЗ, оферта, 38-ФЗ) - rf-legal-biz |
| налоги DE (Kleinunternehmer, USt, Gewerbe/Freiberuf) | налогового агента нет намеренно: только список вопросов к Steuerberater Pavel |
| продающий текст RU/DE, Яндекс-объявление | marketing-copywriting / marketer (RU), biz-copywriter-de; вычитка - biz-lektor-de |
| статья, техконтент, FAQ, кейс | biz-industry-content (блок IT/веб) + копирайтер |
| биржи (Kwork, FL.ru, Habr Freelance, Upwork, Malt, freelancermap) | biz-lead-portals |
| каталоги, NAP, Яндекс Бизнес, Bing Places | biz-local-citations (GBP - google-business-local) |
| Telegram-чаты, vc.ru/Habr, нетворкинг | biz-community-outreach |
| партнёрства с агентствами, white-label, субподряд | biz-partner-pitch |
| опрос клиентов, NPS, WTP | biz-survey-designer |
| код / Strapi / БД / деплой | coder / dev-backend-api / db-admin / devops-engineer |
| дизайн; SEO/GEO, Яндекс Вебмастер; реклама; конверсия | designer -> critic; seo-specialist; paid-ads-manager; cro-analytics |
| DSGVO / a11y (BFSG) / i18n | gdpr-dsgvo-auditor / a11y-auditor / i18n-qa |

Шаблоны: бизнес-вопрос - Рынок + Экономика (параллельно) -> Риски -> Модель -> решение Pavel. Новый канал лидов - market-analyst -> economist (CPL/окупаемость) -> канальный агент -> копирайтер -> cro-analytics (UTM/цели).

## Экономика студии (разд. для biz-economist)
Считать явно: (1) эффективная ставка пакета = цена / реальные часы (коммуникация, правки, деплой, гарантия) vs номинал; (2) загрузка: доступные минус непродаваемые (продажи, контент, обучение, админка), реалистично соло 50-70% [бенчмарк, проверить]; (3) целевой доход -> требуемая ставка (доход + налоги/взносы + расходы ПО/хостинг/AI-подписки/страховки + отпуск) / продаваемые часы; (4) ретейнеры (seo-care, care): MRR, отток, часы на клиента, доля MRR; (5) каналы: CPL -> заявка -> бриф -> КП -> сделка -> чек -> маржа -> CAC payback; (6) cash flow: предоплата/этапы 50/50 или 30/40/30 [гипотеза], лаги, курс, платёжные риски RU; Vorauszahlungen только от Pavel/Steuerberater; (7) решения роста: цены vs клиенты, субподряд, white-label, продуктовые пакеты.
Пайплайн: Analysis (market-analyst, risk-analyst, `_business/finance/unit-economics.md`) -> Validation (survey; пауза: нужны реальные часы по 3-5 последним проектам, выручка, источники заявок) -> Model -> Documents -> `_business/ANALYSIS.md`. Три сценария, пометки факт / бенчмарк / гипотеза.

## Жёсткие правила
- Не выдумывать факты о Pavel; телефон и адрес не публиковать. Цены только из pricing.json, изменение цен - решение Pavel (агент лишь предлагает).
- Платные тарифы бирж/рекламы - только с согласия Pavel. `git push` и деплой - только Pavel. Не трогать `scripts/data/` и `.env`.
- Блог платформы: автопубликация выключена, всё готовое ждёт ручного "Опубликовать" Pavel.
