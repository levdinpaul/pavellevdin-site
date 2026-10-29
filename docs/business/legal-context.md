# PL: юридический контекст (бывшие pl-legal-de, pl-risk-analyst)

> Источник: бывшие проектные агенты `.claude/agents/pl-*` (перенесены в `.claude/_retired-agents/`, prompt-44). Роли теперь исполняют глобальные агенты `biz-*` (+ `rf-legal-biz`, `marketer`, `seo-specialist` и др.) и скиллы `biz-economist` / `biz-orchestrator`. Здесь только факты проекта. Пути `src/...`, `memory/...`, `public/...` - относительно репо сайта-портфолио (ПК: `D:\Сайты\Портфолио`, VPS-клон: `/home/claudeuser/cc-runs/work-23/pavellevdin-site`, GitHub: levdinpaul/pavellevdin-site).

Исполнители: `biz-legal-de` (Entwürfe DE), `rf-legal-biz` (РФ: 152-ФЗ, оферта, 38-ФЗ, договор), `gdpr-dsgvo-auditor`, `a11y-auditor`. Каждый документ - "ENTWURF - Anwaltsprüfung erforderlich" (RDG). Выходы - `_business/legal/de/`.

## Открытый вопрос Pavel: адрес инкогнито vs Impressumspflicht
Решение Pavel: улицу и индекс нигде не публиковать. §5 DDG требует ladungsfähige Anschrift для geschäftsmäßige Telemedien. Самостоятельно не решать: давать опции с рисками (Geschäftsadresse / Coworking; Impressum-Service или virtuelles Büro - не всякий признаётся; публикация домашнего адреса).

## Документы DE
Impressum (§5 DDG, при необходимости §18 MStV, Verbraucherschlichtung §36 VSBG, email info@pavellevdin.de); Datenschutzerklärung сайта (хостинг и страна - сверять с разделом "Деплой" `.claude/CLAUDE.md`, EU-хостинг или Drittlandtransfer-Grundlage; формы Kontakt/Brief; Telegram-Benachrichtigung = Drittland; Yandex Metrika для DE критична); AGB für Webentwicklung (Abnahme §640 BGB, Change Requests, Nutzungsrechte после полной оплаты, Open-Source, Gewährleistung, Haftungsbegrenzung, Referenz-Opt-out, B2B-фокус); Projektvertrag (Werk) и Dienstvertrag (SEO-Betreuung, консалтинг); Wartungs- und Hostingvertrag (SLA без нереальных гарантий); AVV Art. 28 DSGVO + TOM-Anlage (хостинг/поддержка клиентских сайтов, кабинет и CRM pl-platform); BFSG-Checkliste (B2C-Dienstleistungen, исключение Kleinstunternehmen для услуг, WCAG 2.2 AA / EN 301 549, Barrierefreiheitserklärung); Compliance-Checkliste (Gewerbeanmeldung vs Freiberuf - вопросы к Steuerberater, IT-Haftpflicht, UWG, согласие на референсы, OSS-лицензии).
Файлы: Impressum-Entwurf.md, Projektvertrag-Entwurf.md, Dienstvertrag-SEO-Betreuung-Entwurf.md, Wartungsvertrag-Entwurf.md, AVV-Entwurf.md, TOM-Anlage.md, BFSG-Checkliste.md. Для анализа читать `src/pages/Imprint*`, `Privacy*`, `Contact*`, `Brief*`, `scripts/server.js` (куда уходят данные).

## РФ (фаза 1)
152-ФЗ (Политика обработки ПДн, отдельное Согласие у каждой формы, локализация ПДн россиян в РФ, уведомление Роскомнадзора), 38-ФЗ (реклама, маркировка erid) - через `rf-legal-biz`.

## Риски-факты (biz-risk-analyst)
- Санкционные/платёжные: ЕС-резидент с клиентами в РФ (Verordnung (EU) 833/2014 - оказание IT-услуг юрлицам РФ проверять), банковские ограничения, переводы.
- Платформенные (бан биржи, алгоритмы поиска), концентрация на клиенте (>30-40%), bus factor = 1, рост цен AI-API.
- Налоги DE (Kleinunternehmer, USt, Reverse Charge, Gewerbe/Freiberuf, Vorauszahlungen): налогового агента нет намеренно - только вопросы к Steuerberater. Hinweis §19 UStG в Angebot - только формулировкой, подтверждённой Pavel/Steuerberater.
