# LAST_SESSION — PL – Innovativ Digitalbau (портфолио)

## Сессия 2026-10-18 (вечер) — доводка hero (промпты 03 + 03b), задеплоено
- **Hero**: «Создаю сайты. / Соединяю системы.», подпись, лид, одна кнопка + текстовая ссылка. Шрифт **Onest**
  (self-host, вместо Golos Text), JetBrains Mono — только технологии и мелкие метки. Заголовки 500 / −0.04em.
- **Спираль**: 36 технологий из `src/data/stack.ts` (единственный источник; 12 key — Onest светлые с акцентной точкой,
  остальные — mono приглушённые), золотой угол, 3–4 в кадре. Пыль вдоль 2 рукавов (1600/700 точек, ShaderMaterial,
  мерцание, тихое вращение в покое — рендер только пока секция видна). Финал «Весь стек / Один разработчик. Полный цикл.»
  ~10% прокрутки → сразу «Работы». WebGL по первому взаимодействию / 8 с, prerender вырезает modulepreload scene-gl.
- **Шапка**: без плашек — лого-текст, RU / DE / EN текстом, CTA-ссылка с акцентным подчёркиванием, без прогресс-бара,
  без соц-колонки на главной. **Главная**: Работы сразу после сцены, «Обо мне» = фото + H2 + лид + ссылка.
- Удалены все сгенерированные картинки (public/images/{scene,services,site}) и GenImage, PointerFX, Sparkle.
  OG перерисован кодом (`_design/og/og.html`, пыль спирали + H1).
- Проверки: tsc ✓, build:static 25/25, lint 19 (все старые), формы → /api/lead ✓, reduced-motion / no-JS / no-WebGL ✓,
  Lighthouse локально (gzip) mobile 76–78 / desktop 98–99, CLS ≤ 0.003. Тег `v4-hero`, бэкап `dist.bak-2026-10-18-prehero2`.

## Сессия 2026-10-18 — редизайн «PL Сцена» (промпты 02 + 02b), задеплоено
Ветка `redesign-scena` (тег до начала `pre-scena`), после деплоя смержена в main, тег `v3-scena`.

### Что сделано
- **Дизайн «PL Сцена»**: палитра #060810 / #7AA2FF, Golos Text (self-host), новые шапка/футер на всех страницах,
  главная = hero + sticky-сцена 7 шагов (380vh вместо 640vh, карточки читаемые) + WebGL (three 0.186.1, лениво).
- **Картинки**: 17 сгенерированных иллюстраций в одном светлом стиле (7 шагов, 8 услуг, интеграции, 2 для About)
  + OG 1200×630 (фон-генерация, текст кодом). Исходники — `_design/generated/`.
- **Портфолио**: 11 проектов по инвентарю (`src/data/portfolio.json`), страницы кейсов /portfolio/<slug>, фильтр,
  live-статус (build-time), реальные скриншоты desktop/mobile, честные описания ru/de/en.
- **Обо мне** /about: реальное фото (`npm run photo`), count-up, навыки, процесс, бегущая строка стека, принципы, JSON-LD.
- **Услуги**: 8 направлений по навыкам, раскрывающиеся карточки, схема «сайт ↔ CRM ↔ Telegram ↔ AI».
- **Адрес инкогнито**: улица/индекс удалены отовсюду, только Hannover. Title главной «Web Coding Hannover | …».
- **SEO**: пререндер 25 маршрутов (+/ru/about, 11 кейсов), sitemap 61 URL с hreflang, PageMeta (canonical/hreflang/OG/JSON-LD).
- **Перф**: favicon 534 КБ → 0,6 КБ; гидрация в startTransition; WebGL по первому взаимодействию; content-visibility.

### Проверки (все зелёные перед деплоем)
tsc ✓ · lint — 19 ошибок, все старые (было 21, новых 0) · build:static ✓ (25/25) · 25+ маршрутов прямой загрузкой без
ошибок консоли/гидрации · формы contact/brief → /api/lead ✓ · grep Dobben|28211|Bremen = 0 · three.js не в initial ·
агент-верификатор (скрины 1440/390) — блокеры найдены и исправлены (дубли пререндера, переполнение на мобайле, split-text).
**Lighthouse по живому проду**: /ru mobile 61–79 / desktop 95; /ru/about 64–83 / 98; кейс 78 / 97; CLS 0.

### Деплой
russh: бэкап `backup-2026-10-18-prescena.tgz`, старый dist → `projects/app/dist.bak-2026-10-18-prescena`,
restart `pavellevdin`; все маршруты 200, лиды/.env на месте, логи без ошибок. scripts/ на сервере не менялся.

### Решения, принятые самостоятельно — см. итоговый отчёт сессии и BACKLOG 1c.

## Сессия 2026-10-17/18 — чистка и синхронизация перед редизайном
Промпт: `memory/prompts/01-cleanup-sync.md`. Дизайн/функционал НЕ трогались.

### Итог
- **Бэкап:** `D:\Backups\portfolio-2026-10-17.bundle` (git --all), `D:\Backups\portfolio-src-2026-10-17.zip`
  (без node_modules/dist), на сервере `/srv/sites/pavellevdin.ru/backup-2026-10-17.tgz` (dist+scripts вкл. data+src).
- **Мусор:** `sardar-copy/` + `.tar.gz` (чужой проект) → `D:\Сайты\_sardar-copy\`; удалены `nul`, Design System .zip,
  копия package-lock, `tlvT6.png`, `info.md` (не использовались), пустые `.agents/.codex/.qoder`.
- **Прод ↔ репо:** по md5 контент блога (5 статей), картинки и `scripts/` на сервере = репо (кроме более нового
  локального `prerender.cjs`). Server-only контента нет, переносить было нечего.
- **CI:** `.github/workflows/deploy.yml` (GitHub Pages на каждый push в main) → `ci.yml` (npm ci + build:static, без публикации).
  GitHub Pages в репо **всё ещё включены** — выключить в Settings → Pages.
- **Git:** main fast-forward = redesign-digitalbau; теги `pre-merge-2026-10` (старый main b02e68aa), `v2-ssr-baseline`.
  Push: у `levdinpaul` нет write в `levdinking/Code-Craft` (403) → 2026-10-18 origin перенесён в новый приватный `levdinpaul/pavellevdin-site` (вся история + теги), старый remote переименован в `old-levdinking`.
- **Деплой** (через `ssh russh`, root): новый `dist` (SSR-пререндер 13 маршрутов) залит atomic mv, старый →
  `projects/app/dist.bak-2026-10-18`; `docker compose restart pavellevdin` (контейнер `stack-pavellevdin-1`).
  Проверено: все /ru-маршруты, /de/, /en/, /admin, sitemap, turbo.rss → 200; `#root` с SSR-контентом;
  `/api/health` ok; leads.jsonl и .env на месте. `scripts/` на сервере не обновлялся (не было изменений).
- **Проверки:** tsc зелёный, build:static зелёный; lint — 21 error / 7 warn в НЕтронутых файлах (в BACKLOG).

### Найдено (в BACKLOG)
- Блог-пайплайн админки (publish) после build делает `uploadDistToFTP` на HostLand → без FTP_* env падает 500
  (dist при этом уже обновлён). Картинки/медиа/видео пайплайна тоже льются на FTP.
- Legacy: `deploy-only.cjs`, `restart-passenger.cjs`, `ftp-list.cjs`, `add-article.cjs`, корневой `server.js`
  (точка входа Passenger), fallback на `htdocs/www` в `scripts/server.js`, `tmp/restart.txt`.
- Статья Tailwind: в `ru/de/en.json` нет `slug`/`published` → не пререндерится; старый URL
  `/ru/blog/tailwind-css-2026-architecture/` теперь уходит в SPA-fallback.
- `/images/projects/socialhub.png` (портфолио) — файла нет ни в репо, ни на проде.
- В origin чужая ветка `что-делать-тут-a15a8` (отдельная история) — не трогалась.

## Сессия 2026-07-09 — React SSR-пререндер всей /ru-выдачи

### Контекст (что изменилось с 2026-06-13)
Прод-домен теперь **pavellevdin.ru**, основной язык **ru** (фаза 1 — РФ/Яндекс, см. auto-memory
`portfolio-target-market-ru`). Миграция на Next.js (план прошлой сессии) **НЕ делалась** — вместо неё
на текущем React 19 + Vite внедрён честный **React SSR-пререндер**. Главная — новый blueprint-дизайн
(`sections/digitalbau/HomeScene`), под-страницы пока в старом стиле (но SSR-чистые).

### Что сделано (5 коммитов на ветке redesign-digitalbau, билд зелёный)
1. **`5b6d2b65` главная** — корень тормозов был не дизайн, а сломанная гидрация. Фиксы: i18n
   `initImmediate:false`+`useSuspense:false` (убрал Suspense-fallback при гидрации); настоящий SSR
   (`src/entry-server.tsx` renderToPipeableStream) вместо puppeteer-capture; `prerender.cjs` подменяет
   тело `#root`. Результат: гидрация чистая, **mobile 30→61 / desktop 64→86, TBT 2400→220ms, CLS 0**.
2. **`54143c99` services+portfolio** — renderToPipeableStream+onAllReady резолвит React.lazy.
3. **`891e9510` блог** — dehydrate/hydrate: prerender грузит данные, инжектит `window.__BLOG_DATA__`,
   `useBlog`/`BlogPost` берут из него начальный стейт. TOC переписан на изоморфный regex (был DOMParser).
4. **`b716bb2b` contact+brief** — формы неконтролируемые (FormData + fetch в onSubmit), SSR трогает
   только разметку. Лид-захват проверен отправкой обеих форм (перехват `/api/lead`) — работает.
5. **`8014387` imprint+privacy+business-card** — статичные страницы. Итог: **10/10 /ru-маршрутов чисто**.

### Проверка
Мерить перф/гидрацию через `npm run preview:static` (порт 4188, мимикрия Apache DirectoryIndex),
НЕ `vite preview` (он отдаёт пустой SPA-shell). Все 10 маршрутов — прямая загрузка = чистая гидрация,
0 ошибок в консоли. Визуал (скрины) и функционал (nav/⌘K/формы/блог) — без регрессий.

### Что осталось (follow-up, в BACKLOG)
- Lantern (движок PageSpeed) занижает mobile LCP (12s против реальных 4.7s applied / 1.7s observed) —
  привязывает LCP к JS SPA. Для фазы-1 полевой перф важнее лаб-числа.
- Пререндерятся только `/ru/*`. Фаза 2 (DE/EN на pavellevdin.dev) — добавить /de,/en в SSR_ROUTES/prerender.
- Blog `category/*` и `tag/*` не SSR-ятся (не в списке пререндер-маршрутов) — при желании добавить.
- Технические детали — в `LEARNINGS.md`.

## Сессия 2026-06-13

### Контекст проекта
Личный сайт-портфолио веб-разработчика Pavel Levdin (Бремен, DE). Цель — лиды.
Бренд переименован: ~~PL WebInnovativbau~~ → **PL – Innovativ Digitalbau**.
Стек (сейчас): React 19 + Vite 7 + TS + Tailwind 3.4 + shadcn/ui + framer-motion + react-i18next (de/en/ru, дефолт de) + react-router 7. Прод-домен `pavellevdin.dev`. Адрес для schema: Am Dobben 102A, 28211 Bremen. Email levdin.pavel@yandex.ru, Telegram t.me/PavelLevdin.
Полный операционный бриф — в `.claude/CLAUDE.md`, маршрутизация агентов — в `.claude/agents.md`.

### Что сделано (внедрено, билд зелёный)
1. **Заведён `.claude/`** в проекте (CLAUDE.md + agents.md). vl-* агенты тут НЕ применяются.
2. **Иерархия моделей оркестратора** (глобально, mega-brain + ~/.claude): Fable 5 — топ (архитектура/критичное) · Opus — сложный код/review/дизайн · Sonnet — реализация · Haiku — механика. Пины `model:` на dev-агентах (system-architect/planner=fable, reviewer/code-analyzer/designer/critic=opus, coder/tester=sonnet). Правки в `PROTOCOL.md` §6 и `orchestrator.md` §301.
3. **Hero fit-to-screen:** высота `100dvh`, flex-центр, H1 на `clamp()` (~56px вместо 72px), плотнее отступы.
4. **Визуальная переработка (P0+P1)** по дизайн-ревью:
   - Единая dark-палитра, один бренд-акцент **cyan `#16E0F2`**; токены `surface/surface-2/faint/signal`; cyan-glow тени; dot-grid фон. Dark — тема по умолчанию (тоггл рабочий).
   - Убрана «радуга» teal→amber→blue (Advantages/Services/About/Hero).
   - Scroll-progress бар; CTA full-width border → 48px cyan hairline (DNA-вето); DigitalEcosystem teal→primary + mono-нумерация; Hero showcase → Geist Mono; убраны debug console.log из Layout.
   - Файлы: `src/index.css`, `tailwind.config.js`, `src/hooks/useTheme.tsx`, секции Hero/About/Services/Advantages/DigitalEcosystem/CTA, `components/layout/{Layout,Header,Footer}`, `components/ui-custom/ScrollProgress.tsx`.
5. **Новая секция `src/sections/TechStack.tsx`** («возможности/стек», трёхъязычно, mono-акценты) — в Home после About.
6. **Переименование** во всех файлах → PL – Innovativ Digitalbau; Header/Footer wordmark = «PL» cyan + остальное `text-foreground` (контраст-безопасно в обеих темах).
7. **SEO quick wins:** город в title («Webentwickler Bremen…»), OG/Twitter EN→DE, расширен JSON-LD (адрес Bremen, Person+knowsAbout, areaServed) в `index.html`; title в `Home.tsx`.
8. Шрифты Geist/Geist Mono — уже стояли. Диск C: почищен (7.96→17.97 ГБ) — разблокировал сборку (был OOM при ~1 ГБ RAM).

### Ключевое решение
- **Next.js миграция ПОДТВЕРЖДЕНА Pavel** (полный переход, App Router, SSR/SSG). Причина: сейчас CSR/Vite SPA → AI-краулеры видят пустой `<div id=root>`, слабо для Google/AEO. План (8 этапов) — в `BACKLOG.md`.

### НЕ закоммичено
Ничего не коммитил. Рабочее дерево содержит и до-сессионные неясные изменения (удалённые `.gitignore`/`.env.example`/`avatar.png`/`create_image.py`, файл `nul`, untracked node_modules). **Перед коммитом — ревью Pavel:** что делать с этими чужими удалениями; мою работу коммитить отдельным чистым коммитом.

### Незавершённость окружения
RAM ~1 ГБ свободно (другие приложения держат ~6 ГБ из 7.5). Vite-сборка проходит на pagefile, но Next-сборки тяжелее — перед миграцией освободить RAM. playwright-MCP в сессии НЕ подключён (нужен для скриншотов карточек).
