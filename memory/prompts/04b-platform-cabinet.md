# 04b — Платформа: личный кабинет клиента + админ-кабинет + блог с AI-агентами (порт с MP-Innovativbau)

Запускать ПОСЛЕ 04a. Большая задача — работать фазами, коммит в конце каждой фазы, деплой после фазы 5.
Источник: репозиторий levdinpaul/mp-innovativbau-next (Next 16.2 + next-intl + Strapi 4.25 + PostgreSQL, Docker) и
levdinpaul/mp-innovativbau-strapi. Клонировать оба в D:\Сайты\_src-mp\ (только чтение, MP не трогать).

## Архитектура (решение)
Публичный сайт остаётся как есть (Vite + SSR-пререндер, дизайн «PL Сцена», Lighthouse 86+) — НЕ мигрировать.
Рядом — новое приложение **pl-platform** (форк MP Next + Strapi + Postgres) на ТОМ ЖЕ домене через nginx-маршрутизацию:
- `/(ru|de|en)/(cabinet|admin|login|register|forgot-password|reset-password|set-password|blog)(/...)?` и `/api/(auth|cabinet|admin|agents|publish|scheduler|...)` → pl-platform
- всё остальное → текущий Vite/Express. Cookie одного домена — общая сессия, шапка/футер в платформе — те же (порт компонентов PL).
- Новый репо `levdinpaul/pl-platform` (приватный). Хостинг: сначала замерить RAM/CPU на russh (178.212.15.50). Нужно ~2 ГБ свободной
  под Next+Strapi+Postgres. Если не хватает — поднять на основном VPS 212.227.100.97 и проксировать с russh по HTTPS. Решение — в отчёт.

## Что переносим из MP и как переделываем под нас (PL Innovativ Digitalbau — веб-студия одного разработчика)
1. **Auth** — login/register/forgot/reset/set-password, роли (admin / team / client), magic-link по желанию. Письма — с info@pavellevdin.ru
   (ru) / info@pavellevdin.de (de/en, флаг DE_MAIL_READY).
2. **Кабинет клиента** `/cabinet` — мои заявки/проекты (статус, этапы, файлы, сообщения), бриф, счета/КП (PDF), настройки, удаление данных (DSGVO/152-ФЗ).
3. **Админ-кабинет** `/admin` — users, team, leads (CRM), crm-tasks, brief, angebot (КП/Angebot PDF под PL: реквизиты PL, цены из pricing.json),
   SEO, settings, notifications, отзывы (модерация — перенести из 04a), статистика.
   Перенести лиды: scripts/data/leads.jsonl → CRM (без потерь, с датами). /api/lead публичного сайта → пишет в CRM платформы.
4. **Блог + AI-агенты** — Strapi-контент + `src/lib/agents/*` (writer, reviewer, seo, translator, publisher, research, visual,
   social-content-creator, content-analyst, lead-nurturer, crm-advisor, conversion-optimizer, funnel-strategist, analyst, compliance),
   `src/lib/ai/*` (Claude + Gemini провайдеры, роутер), scheduler, publishing (strapi/telegram/social; GBP — выключить, пока нет профиля).
   Переписать промпты агентов с «Holzbau / строительство» на «веб-разработка, SEO, автоматизация, AI для малого бизнеса», ru + de + en.
   Публичный /blog рендерит платформа (SSR, SEO, hreflang). Старые 5 статей из src/content/blog — перенести в Strapi, старые URL — 301 на новые
   (если slug меняется). Старый FTP-пайплайн админки Vite — удалить после переноса.
   Блог «подключён к агентам»: в админке кнопки «Идея → Черновик → Ревью → Перевод → Публикация», расписание; всё в статусе draft
   до ручного «Опубликовать» Pavel (автопубликацию выключить по умолчанию).
5. **Claude-агенты разработки** `.claude/agents/mp-*.md` (24 шт.) → `pl-*.md` в репо портфолио и платформы:
   переписать под веб-студию (copywriter-de/ru, lektor-de, legal-de: Impressum/AGB/AVV для веб-услуг, market-analyst: рынок веб-разработки RU/DE,
   economist/financial-modeler: юнит-экономика фрилансера, lead-portals: Malt, freelancermap, Upwork, Kwork, FL.ru, Habr Freelance,
   local-citations: Hannover IT-каталоги, community-outreach, partner-pitch, pitch-deck, survey, document-formatter, chart, excel, risk,
   orchestrator). Неактуальные (foerderung Holzbau, location-scout, kleinanzeigen, holzbau-content, steuerberater-proxy) — адаптировать
   (foerderung → программы цифровизации для клиентов; holzbau-content → tech-content) или удалить с пометкой в отчёте.
   Обновить .claude/agents.md (маршрутизация).
6. **Удалить из форка** всё строительное: configurator, musterhaus, standorte, galerie, foerderung-страницы, room-map, pricing-config MP, бренд MP.

## Дизайн
Те же токены и шрифты, что на сайте (`src/index.css`, `src/styles/pl.css`): тёмный #060810, акцент #7AA2FF, Onest + JetBrains Mono.
Кабинеты — спокойные, плотные таблицы, без декоративных анимаций.

## Безопасность
Секреты только в .env на сервере; Strapi-админка не наружу (только через SSH-туннель, как в MP); rate-limit на auth и формах;
бэкапы Postgres ежедневно (скрипт из MP), хранить 10. Ключи AI (Claude/Gemini) — из .env, расходы — лимит в админке.

## Фазы
1. Форк и чистка → сборка зелёная локально. 2. Ребрендинг + дизайн PL. 3. Auth + кабинеты + перенос лидов. 4. Блог + агенты + перенос статей.
5. Деплой (поддомен-превью сначала, затем nginx-маршруты на pavellevdin.ru), проверки всех маршрутов сайта и платформы, формы, вход.
6. .claude/agents pl-*, документация (README, CLAUDE.md обоих репо, LAST_SESSION, LEARNINGS, BACKLOG).
Отчёт на русском после каждой фазы (коротко) и итоговый. Деплой сам после зелёных проверок; бэкап и откат обязательны.
