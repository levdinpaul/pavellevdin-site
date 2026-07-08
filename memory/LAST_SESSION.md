# LAST_SESSION — PL – Innovativ Digitalbau (портфолио)

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
