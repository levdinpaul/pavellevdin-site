# PL: рынки, каналы лидов, партнёры, NAP

> Источник: бывшие проектные агенты `.claude/agents/pl-*` (перенесены в `.claude/_retired-agents/`, prompt-44). Роли теперь исполняют глобальные агенты `biz-*` (+ `rf-legal-biz`, `marketer`, `seo-specialist` и др.) и скиллы `biz-economist` / `biz-orchestrator`. Здесь только факты проекта. Пути `src/...`, `memory/...`, `public/...` - относительно репо сайта-портфолио (ПК: `D:\Сайты\Портфолио`, VPS-клон: `/home/claudeuser/cc-runs/work-23/pavellevdin-site`, GitHub: levdinpaul/pavellevdin-site).

## Рынок и конкуренты (biz-market-analyst)
Начинать с `memory/pricing-research.md` (vc.ru, kopfundstift.de, studiomeyer.io), обновлять, не дублировать. Выходы: `_business/research/market-ru.md`, `market-de.md`. Источники: Bitkom, Destatis, Рейтинг Рунета, vc.ru/Habr Карьера.
- РФ (фаза 1): цены лендинг / сайт 5-7 стр. / корпоративный / магазин / веб-приложение / поддержка / SEO / интеграции (Битрикс24, amoCRM, Telegram-боты), ставка ₽/ч; Москва/СПб vs регионы. Конкуренты: студии на Next.js/React, фрилансеры (Kwork, FL.ru, Habr Freelance), конструкторы (Tilda, Taplink) как ценовой "пол". Драйверы: импортозамещение, self-hosted, 152-ФЗ, AI-автоматизация.
- DE/ЕС (фаза 2): Onepager, kleine Website, Unternehmenswebsite, Shop, Portal; Freelancer vs Agentur €/h; Wartungs-/SEO-Pakete; Hannover/Niedersachsen: KMU/Handwerk, локальные агентства. Драйверы: BFSG с 2025, KI-Automatisierung, Relaunch старых WordPress, Fördermittel.
- Шкала в отчётах: фрилансер - студия - агентство - PL; маркировка [факт, источник] / [оценка].

## Площадки заказов (biz-lead-portals)
- РФ: Habr Freelance (профиль = портфолио + стек); FL.ru (PRO/отклики платные - только с согласия); Kwork (пакеты: лендинг, Telegram-бот, интеграция CRM, перенос на VPS; комиссия в цену); Авито Услуги (низкий приоритет).
- DE/ЕС: Malt (Tagessatz), freelancermap (€/h, агентства), Upwork (платные Connects, ниша Next.js + MCP/AI), Kleinanzeigen (Dienstleistungen EDV/IT, низкий приоритет; свежесть, город в заголовке, без дублей).
- Правила: не откликаться на "сайт за 5 000 ₽ / 200 €", без бюджета и ТЗ, "клон X за неделю". Отклик: задача клиента -> как сделаю -> кейс из portfolio.json -> срок/цена "от" -> 1-2 вопроса. Не уводить сделку в обход площадки, где запрещено; отзывы не накручивать. Не окупается за 2-3 месяца (затраты + часы на отклики x ставка) - пауза.

## Сообщества (biz-community-outreach)
- РФ: Telegram-чаты (предприниматели, маркетологи/таргетологи, онлайн-школы, no-code/AI, фрилансеры), vc.ru (кейсы, разборы), Habr (Next.js + Strapi, MCP, self-hosted).
- DE: LinkedIn (DE/EN), XING-Gruppen (Hannover, Mittelstand, Digitalisierung), Meetups и сети Hannover (IHK, hannoverimpuls - проверять актуальность), русскоязычные предприниматели в Германии (Telegram/Facebook).
- Реестр `_business/outreach/communities.md`; не больше 2-3 сообществ в день; посевы в РФ - маркировка 38-ФЗ (erid), согласовать с Pavel (связка rf-legal-biz); где реклама запрещена - полезные ответы без ссылок; не выдумывать кейсы и правила сообществ ("проверить при входе").

## Партнёры (biz-partner-pitch)
| Тип | Что важно | Что предлагает PL | Ask |
|---|---|---|---|
| Веб-/маркетинг-агентства | сроки, качество, white-label, NDA | разработка Next.js/CMS, интеграции, AI под их брендом | пилот, рамочные условия |
| Дизайнеры / студии | pixel-accurate вёрстка, анимации | реализация макета, CMS | рекомендации, совместные КП |
| SEO / контекст | быстрый чистый сайт | техн. SEO, скорость, schema, AI-поиск | взаимные рекомендации |
| CRM-интеграторы | формы/боты + CRM | формы -> CRM, боты, API | субподряд на веб-часть |
| Консультанты по цифровизации (DE) | исполнитель для клиентов с Förderung | проекты, документация | рекомендации |
Честная capacity соло; артефакты в `_business/partners/` (Pitch-*.md, Partner-Agreement-Eckpunkte.md, Outreach-Tracker.csv, Email-Templates.md); письмо 80-120 слов, follow-up через 7 дней; скидка партнёру/реферал % - предложение, утверждает Pavel; White-label кейсы в портфолио - только с согласия.

## NAP и каталоги (biz-local-citations)
Канон (источник `src/constants/contacts.ts`, менять только по команде Pavel): название "PL - Innovativ Digitalbau (Pavel Levdin)" (тире как в источнике), Hannover, Germany (улица/индекс НЕ публикуются), сайт RU https://pavellevdin.ru/, DE https://pavellevdin.dev/ (фаза 2), email RU info@pavellevdin.ru, DE info@pavellevdin.de, Telegram @PavelLevdin, телефон не публикуется.
- Режим без адреса/телефона: Service-Area-Business / работаю удалённо; если каталог требует адрес - не заводить, "требует решения Pavel".
- РФ: Яндекс Бизнес/Справочник (рубрики "Создание сайтов", "Продвижение сайтов", "IT-компания"), Яндекс Услуги, Рейтинг Рунета, Tagline, CMS Magazine, 2ГИС (только без адреса); платное - с согласия.
- DE: Bing Places, Apple Business Connect, Gelbe Seiten, Das Örtliche, 11880, Cylex, golocal, Agenturverzeichnisse, IHK-/Netzwerklisten, ProvenExpert; профили LinkedIn, XING, GitHub, Malt/freelancermap. При смене email/домена (.de) обновить все карточки синхронно; schema ProfessionalService/Person без улицы.
