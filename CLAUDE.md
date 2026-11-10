# pavellevdin-site — pavellevdin.ru (портфолио Павла Левдина, «PL Сцена»)

Карта кода — `FILE_MAP.md` (первой → Grep/Glob → точечный Read). Команды и данные — `README.md`. Что сделано — KB `/opt/knowledge-base/Projects/pavellevdin.ru/` и `memory/{LAST_SESSION,LEARNINGS,BACKLOG}.md` (head/tail, grep).
Бизнес-контекст — docs/business/ (агенты pl-* заменены глобальными biz-*, см. prompt-44)

## Стек (из package.json)
Vite ^7.2.4, React ^19.2.0, TypeScript ~5.9.3, Tailwind ^3.4.19, react-router-dom ^7.13.1, react-i18next ^16.5.8 (ru/de/en), собственный SSR-пререндер.

## Команды
`npm run build:static` (прод: проверка проектов → sitemap → tsc → vite → SSR → turbo-feed → пререндер) · `npm run preview:static` (порт 4188) · `npm run dev` · `npm run lint` · `npm run photo`/`og`/`fx`.
Данные портфолио — `src/data/portfolio.json`. Тест-раннера нет.

## Прод и деплой
- Прод: https://pavellevdin.ru (russh 178.212.15.50, docker-сервис в `/srv/stack`). Репо: `levdinpaul/pavellevdin-site` (main); источник правды — эта папка.
- Деплой — по README репо: бэкап, atomic `mv dist`, restart; общая цель `~/bin/deploy pavellevdin.ru` относится к каталогу платформы (проверить перед использованием).
- Не деплоить без проверки `build:static`; runtime-данные (отзывы, лиды) не удалять.

Агентов и скиллы в проект не класть — только канон mega-brain; знания проекта — docs/.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
