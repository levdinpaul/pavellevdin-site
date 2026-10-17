[Задача]
Подготовить проект pavellevdin.ru к редизайну: зачистить мусор, синхронизировать git (локально ↔ GitHub ↔ прод-сервер), задеплоить незадеплоенные SSR-коммиты и привести документацию в актуальное состояние. Новый дизайн НЕ трогать — только гигиена и синхронизация.

[Контекст]
- Исходники: D:\Сайты\Портфолио, git origin = github.com/levdinking/Code-Craft
- Активная ветка redesign-digitalbau: +14 коммитов к main, НЕ смержена. main и origin/main стоят на b02e68aa (05.04.2026). Ветка redesign-digitalbau в origin, скорее всего, отсутствует.
- Стек (из package.json): React 19.2 + Vite 7.2 + TS 5.9 + Tailwind 3.4 + shadcn/Radix + framer-motion 12 + GSAP 3.15 + react-i18next + react-router 7. Свой SSR-пререндер: src/entry-server.tsx + scripts/prerender.cjs, сборка `npm run build:static`.
- Прод: сервер russh (hostname host1890270-1), /srv/sites/pavellevdin.ru/projects/app
  - dist/ — сборка от 07.07.2026, т.е. ДО SSR-коммитов 08–09.07 (5b6d2b65…80143873).
  - scripts/ — Express-бэкенд (админка, блог-пайплайн, /api/lead), отдаёт dist через express.static.
  - scripts/data/ — ЛИДЫ (leads.jsonl), api-keys-config.json, публикации, uploads. НЕ в git, НЕ трогать.
  - .env — секреты, НЕ трогать.
  - Docker: сервис `pavellevdin` в /srv/stack/docker-compose.yml (node 24, `node server.js`, порт 3001), nginx → proxy_pass.
  - /srv/sites/pavellevdin.ru/htdocs/www — старая копия с HostLand (fallback в server.js). tmp/restart.txt — наследие Passenger.
- Мусор в корне: sardar-copy/ + sardar-copy-package.tar.gz (41 МБ, ЧУЖОЙ проект xcapital), файл `nul` (вывод taskkill, зарезервированное имя Windows), «package-lock (копия с компьютера PADLEV).json», «PL Digitalbau Design System.zip» (папка-распаковка остаётся), tlvT6.png, пустые .agents/ .codex/ .qoder/, info.md.
- .github/workflows/deploy.yml деплоит main на GitHub Pages при каждом push — ОПАСНО: мерж в main опубликует сайт на GH Pages.
- memory/BACKLOG.md содержит устаревший план «миграция на Next.js 15», хотя в LAST_SESSION решено остаться на Vite + SSR-пререндер.

[Файлы]
.gitignore, .github/workflows/deploy.yml, .claude/CLAUDE.md, .claude/agents.md, memory/LAST_SESSION.md, memory/LEARNINGS.md, memory/BACKLOG.md, scripts/lib/ftp-upload.js, scripts/lib/publish-orchestrator.js, scripts/lib/static-html-generator.js, scripts/deploy-only.cjs, scripts/restart-passenger.cjs, scripts/ftp-list.cjs, src/content/blog/**, src/data/blog-index.ts

[Агенты]
- Explore: аудит ссылок на удаляемые файлы (tlvT6.png, info.md и т.п.) и на FTP/Passenger/HostLand в scripts/ и src/.
- general-purpose: сравнение прод-сервера с локальной сборкой (контент блога, scripts/).
Деплой и git-операции с main — только сам, без агентов.

[План — выполнять по шагам, после каждого шага коротко отчитаться]
0. БЭКАП (до любых изменений):
   - `git bundle create D:\Backups\portfolio-<дата>.bundle --all`
   - zip рабочей папки без node_modules/dist/dist-server → D:\Backups\portfolio-src-<дата>.zip
   - на сервере: `tar czf /srv/sites/pavellevdin.ru/backup-<дата>.tgz -C /srv/sites/pavellevdin.ru/projects/app dist scripts --exclude=scripts/node_modules` (scripts/data входит в бэкап).
1. МУСОР (локально):
   - sardar-copy/ и sardar-copy-package.tar.gz → ПЕРЕНЕСТИ в D:\Сайты\_sardar-copy\ (не удалять).
   - Удалить: `nul` (через `cmd /c del \\?\D:\Сайты\Портфолио\nul` или git-bash rm), копию package-lock, PL Digitalbau Design System.zip, пустые .agents/.codex/.qoder.
   - tlvT6.png, info.md — удалить только если Explore подтвердил, что нигде не используются; иначе оставить и указать в отчёте.
   - .gitignore: добавить sardar-copy*, *.tar.gz, backup-*.tgz.
2. ПРОД → ЛОКАЛЬНО (подтянуть то, что живёт только на сервере):
   - Сравнить статьи блога на сервере (dist/ru/blog, dist/blog-images, данные публикаций) с src/content/blog + public/. Статьи/картинки, опубликованные через админку после 07.07 и отсутствующие локально, — перенести в репозиторий.
   - `diff -r` scripts/ (без node_modules и data) сервер vs локально. Расхождения — в отчёт, серверные правки перенести в репо.
3. АУДИТ ЛЕГАСИ (только отчёт, код не переписывать):
   - Публикует ли блог-пайплайн статьи через FTP на HostLand (ftp-upload.js)? Если HostLand больше не используется — пайплайн сломан: зафиксировать в BACKLOG как задачу.
   - restart-passenger.cjs, deploy-only.cjs, ftp-list.cjs — пометить как legacy в отчёте.
4. GIT:
   - Закоммитить шаги 1–2 на redesign-digitalbau логическими коммитами (chore(cleanup), chore(sync-prod-content)).
   - .github/workflows/deploy.yml: убрать деплой на GitHub Pages, заменить на CI-проверку (npm ci + npm run build:static, без публикации). Перед этим `gh api repos/levdinking/Code-Craft/pages` — если Pages включены, в отчёт (выключит Pavel).
   - `npm ci && npx tsc -b && npm run lint && npm run build:static` — всё зелёное. Ошибки lint исправлять только если они в изменённых файлах; остальные — в отчёт.
   - Поставить тег `pre-merge-2026-10` на текущий main.
   - Merge redesign-digitalbau → main (должен быть fast-forward), тег `v2-ssr-baseline`, push main + ветки + теги в origin.
5. 🛑 СТОП-ТОЧКА. Показать: что будет залито на прод, diff по контенту блога, список файлов к замене. Ждать от Pavel слово «деплой».
6. ДЕПЛОЙ (только после «деплой»):
   - Залить новый dist в /srv/sites/pavellevdin.ru/projects/app/dist (через dist.new → atomic mv, старый → dist.bak-<дата>).
   - scripts/ обновлять ТОЛЬКО если в шаге 2 были изменения и они проверены; scripts/data/, .env, scripts/node_modules — исключить.
   - `cd /srv/stack && docker compose restart pavellevdin`
   - Проверка curl: все /ru-маршруты (/, /ru/, /ru/services, /ru/portfolio, /ru/blog, /ru/contact, /ru/brief, /ru/imprint, /ru/privacy, /ru/business-card) → 200; в HTML /ru/ есть пререндеренный контент (не пустой #root); /de/ и /en/ → 200; `docker logs pavellevdin --tail 30` без ошибок; админка открывается.
   - Откат при любой ошибке: mv dist.bak-<дата> dist + restart.
7. ДОКУМЕНТАЦИЯ:
   - LAST_SESSION.md — сессия «чистка и синхронизация» с итогом.
   - LEARNINGS.md — новые уроки (GH Pages workflow, server-only контент блога и т.п.).
   - BACKLOG.md — убрать/пометить «Отменено» миграцию на Next.js 15 (решено: Vite + SSR); закрыть «Git-гигиена»; добавить задачи из шага 3.
   - .claude/CLAUDE.md — актуальный раздел «Деплой»: сервер russh, путь, docker-сервис, что нельзя трогать.
   - Закоммитить docs, push.

[Готово когда]
- В корне нет мусора, sardar-copy лежит отдельно в D:\Сайты\_sardar-copy\.
- main == redesign-digitalbau == origin/main, рабочее дерево чистое (`git status` пусто), теги запушены.
- GitHub Actions больше не публикует на Pages, CI-сборка зелёная.
- Прод отдаёт сборку с SSR-коммитами, все маршруты 200, лиды/секреты/статьи на месте, бэкап на сервере и локально.
- LAST_SESSION / LEARNINGS / BACKLOG / CLAUDE.md обновлены.

[Правила]
- Ничего не удалять без бэкапа; чужие проекты — только переносить.
- НИКОГДА не трогать на сервере: scripts/data/, .env, /srv/stack/* кроме restart сервиса pavellevdin, другие сайты в /srv/sites.
- Никаких изменений дизайна и функционала — это отдельная следующая задача.
- Без force-push. Без смены версий зависимостей.
- Деплой — только после явного «деплой» от Pavel.
- Итоговый отчёт на русском: что сделано, что найдено, что осталось Pavel.
