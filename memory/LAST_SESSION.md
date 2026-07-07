# LAST_SESSION — PL – Innovativ Digitalbau (портфолио)

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
