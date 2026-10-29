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
