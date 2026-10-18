# Агенты проекта PL – Innovativ Digitalbau

Релевантный набор для этого репозитория. Агенты — **глобальные** (из mega-brain), здесь —
только маршрутизация «задача → агент» под специфику проекта. `vl-*` бизнес-агенты НЕ применяются.

## Таблица маршрутизации

| Зона | Триггеры задачи | Агент(ы) |
|---|---|---|
| **Код / фичи** | написать/починить компонент, секцию, хук, страницу | `@coder` |
| **Архитектура** | структура модуля, выбор подхода, рефактор-план | `@system-architect`, `@planner` |
| **Анализ кода** | разобраться в существующем коде, зависимости | `@code-analyzer`, `@Explore` |
| **Ревью** | проверка кода, безопасность (admin-сервер, FTP, auth, multer) | `@reviewer` |
| **Тесты** | покрытие, e2e форм/админки, edge cases | `@tester` |
| **Дизайн** | UI/UX, редизайн секций, «сделай красиво» | `@designer` (читает `pavel-dna`) → `@critic` (revision loop) |
| **Принципы дизайна** | композиция, типографика, теория | `@design-master` |
| **Доступность** | WCAG 2.2 AA, **BFSG/EAA** (ЕС обяз.), контраст, клавиатура, формы | `@a11y-auditor` |
| **Производительность** | Core Web Vitals, Lighthouse, размер бандла (Vite), картинки/шрифты | `@performance-engineer` |
| **i18n** | синхрон de/en/ru, непереведённые строки, длина в layout | `@i18n-qa` |
| **Комплаенс** | DSGVO/GDPR, cookie-consent, Impressum, Datenschutz, обработка лид-форм | `@gdpr-dsgvo-auditor` |
| **SEO / GEO** | мета, structured data, hreflang, sitemap, цитируемость AI, блог | `@seo-specialist` |
| **Конверсия** | воронка лида, CTA, формы, trust-сигналы, A/B, трекинг | `@cro-analytics` |
| **Маркетинг** | копирайтинг, контент-стратегия, креатив | `@marketer` |
| **Соцсети** | контент-план, посты IG/FB/Telegram (под админку соц-публикаций) | `@smm-manager` |
| **Локальное** | Google Business, отзывы, локальный поиск (Hannover) | `@google-business-local` |
| **Инфра / деплой** | FTP-деплой, admin Express-сервер, Node, сборка, «упало» | `@devops-engineer` |
| **Решение / совет** | «sovet», «стоит ли», пресс-тест идеи | `/sovet` (llm-council) |

## Заметки по проекту
- **Русский — первичный язык (фаза 1, рынок РФ).** Тексты сайта и блога пишутся на русском, de/en — переводы; держать ru/de/en синхронными.
- **Фаза 1 — 152-ФЗ (согласие на обработку ПДн у форм); фаза 2 (DE/ЕС) — a11y + DSGVO.** Лид-формы проверять `@a11y-auditor`; для DE-версий — ещё `@gdpr-dsgvo-auditor`.
- **Дизайн** обязательно прогоняется через `@critic` и проверяется глазами (playwright-mcp).
- **Безопасность бэкенда:** admin Express-сервер с auth, FTP-кредами, multer-загрузками, Tinify/Telegram
  токенами — изменения там ревьюит `@reviewer` (секреты только в `.env`, не в коде).
- **Параллельность:** независимые подзадачи — несколько `Task` в одном сообщении; зависимые — цепочкой.

## Бизнес-агенты студии `pl-*` (проектные, `.claude/agents/`)

Свой набор для бизнеса PL – Innovativ Digitalbau (адаптирован из архива MP, без строительного контекста).
Вход для многошаговой бизнес-задачи — `@pl-orchestrator` (сам маршрутизирует по `pl-*` и общим агентам).
Тот же набор лежит в `D:\Сайты\pl-platform\.claude\agents\` — при правке агента обновлять обе копии.

| Зона | Триггеры задачи | Агент |
|---|---|---|
| **Оркестрация** | многошаговая бизнес-задача, «с чего начать», план по студии | `@pl-orchestrator` |
| **Экономика** | ставка/час, эффективная ставка пакета, загрузка, маржа, ретейнеры, CPL/CAC, «поднять цены / субподряд / DE-рынок» | `@pl-economist` (суб-оркестратор анализа) |
| **Финмодель** | P&L, cash flow, break-even, сценарии, «сколько нужно клиентов» | `@pl-financial-modeler` |
| **Excel** | живой .xlsx с формулами, калькулятор КП, таблица-трекер | `@pl-excel-modeler` |
| **Рынок** | рынок веб-разработки RU/DE, цены конкурентов, фрилансер vs студия vs агентство, Hannover | `@pl-market-analyst` |
| **Риски** | матрица рисков, санкции ЕС/платежи из РФ, bus factor, зависимость от клиента/площадки | `@pl-risk-analyst` |
| **Графики** | диаграммы для КП, плана, дека, SEO-отчёта клиента | `@pl-chart-generator` |
| **Опросы** | NPS/CSAT после сдачи, WTP (Van Westendorp), валидация услуги | `@pl-survey-designer` |
| **Бизнес-план** | Businessplan DE (Gründungszuschuss, банк), план развития студии RU | `@pl-business-plan-writer` |
| **Презентации** | КП-дек клиенту, партнёрский дек, дек к бизнес-плану | `@pl-pitch-deck-designer` |
| **PDF** | собрать КП/Angebot, ТЗ, SEO-отчёт, план в PDF | `@pl-document-formatter` (последним) |
| **Тексты RU** | лендинг, оффер, Яндекс Директ, Kwork/FL.ru-профиль, 38-ФЗ | `@pl-copywriter-ru` |
| **Тексты DE** | de-локаль, Malt/freelancermap-профиль, Google Ads, письма, UWG | `@pl-copywriter-de` → `@pl-lektor-de` |
| **Вычитка DE** | «звучит ли по-немецки», Duden, калька, терминология | `@pl-lektor-de` |
| **Техконтент** | статья в блог, кейс, FAQ, точность версий/фактов (ru/de/en) | `@pl-tech-content` (+ копирайтер для тона) |
| **Право DE** | Impressum, Datenschutz, AGB, Werk-/Dienstvertrag, AVV/TOM, BFSG-чек-лист, санкции ЕС (Entwürfe, не замена юриста) | `@pl-legal-de` |
| **Förderung** | субсидии на цифровизацию для КЛИЕНТОВ (Digitalbonus.Niedersachsen, KfW, RU — «Мой бизнес»; статус проверять каждый раз) | `@pl-digital-foerderung` |
| **Биржи** | Kwork, FL.ru, Habr Freelance, Malt, freelancermap, Upwork — профиль, отклики, CPL | `@pl-lead-portals` |
| **Каталоги / NAP** | Яндекс Бизнес, 2ГИС (только без адреса), Bing Places, Hannover-Verzeichnisse | `@pl-local-citations` (GBP — `@google-business-local`) |
| **Сообщества** | Telegram-чаты, vc.ru, Habr, LinkedIn/XING, Meetups Hannover | `@pl-community-outreach` |
| **Партнёры** | агентства, дизайнеры, SEO-специалисты, white-label, субподряд | `@pl-partner-pitch` |

Цепочки:
- Бизнес-вопрос: `pl-market-analyst + pl-economist (параллельно) → pl-risk-analyst → pl-financial-modeler → (pl-excel-modeler) → pl-chart-generator → решение Pavel`.
- Новый канал лидов: `pl-market-analyst → pl-economist (CPL) → pl-lead-portals / pl-community-outreach / pl-local-citations → pl-copywriter-ru|de → @cro-analytics (UTM)`.
- Документ клиенту: `контент (копирайтер / pl-legal-de / pl-tech-content) → pl-chart-generator → pl-document-formatter | pl-pitch-deck-designer`.

Правила для `pl-*`: канон контактов/NAP — `src/constants/contacts.ts` (телефон не публикуется, адрес — только «Hannover, Germany»);
цены — только `src/data/pricing.json`; факты о Pavel — только из репо; бизнес-артефакты — в `_business/` (финданные не коммитить);
налогового агента нет намеренно — налоговые вопросы DE формулируются списком для Steuerberater Pavel.

**Не перенесены из MP:** `mp-location-scout` (подбор участка/помещения — студии не нужен), `mp-kleinanzeigen-manager`
(отдельный агент не нужен; Kleinanzeigen упомянут строкой как низкоприоритетная доска в `pl-lead-portals`),
`mp-steuerberater-proxy` (налоги — только живой Steuerberater). `mp-holzbau-content` → `pl-tech-content`,
`mp-foerderung-application` → `pl-digital-foerderung`, `mp-market-de` влит в `pl-market-analyst`.

## Что НЕ применяется здесь
`vl-economist` и весь набор `vl-*` (market/financial/foerderung/legal/steuerberater/pitch и т.д.) —
это домен vl-innovativbau (стройкомпания), к портфолио отношения не имеют. То же для `mp-*` (архив MP в
`pl-platform/docs/mp-origin/` — только образец, не использовать напрямую).
