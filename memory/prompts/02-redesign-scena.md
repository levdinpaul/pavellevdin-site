[Задача]
Перенести дизайн «PL Сцена» (Claude Design) на pavellevdin.ru: новая главная со звёздной WebGL-сценой и спиральной прокруткой + общий визуальный язык (токены, шапка, футер) для всех страниц. Сохранить SSR-пререндер, формы, блог и админку.

⚠️ Начинать ТОЛЬКО после того, как задача 01-cleanup-sync полностью закрыта (main == origin/main, прод задеплоен, рабочее дерево чистое).

[Контекст]
- Референс: _design/scena/src/PL Сцена.dc.html (+ _ds/…/tokens/*.css, support.js). Остальные файлы архива (ICC Сцена*, SAVDO*, savdo/) — ЧУЖИЕ проекты, игнорировать.
- Чтобы увидеть референс: `cd _design/scena/src && npx serve .` → открыть «PL Сцена.dc.html» (грузит React 18 / three 0.149 / Babel с unpkg). Снять скриншоты 1440×900 и 390×844 по всей высоте — это эталон для сверки.
- Структура дизайна:
  1. Fixed-шапка: лого PL + «Innovativ Digitalbau / Web Coding · SEO · AI · Automation», меню (Обо мне, Портфолио, Услуги, Контакты), RU, CTA «Запустить проект», справа фикс-колонка Telegram/WhatsApp/Instagram. Мобайл — меню «···».
  2. Hero по центру: бейдж «Цифровой запуск бизнеса под ключ», H1 «Не просто сайт — готовая система, которая приводит клиентов.», 2 кнопки.
  3. Спиральная сцена (~640vh, three.js, fixed canvas): 7 шагов — Позиционирование, Сайт, Видимость, Каналы, Аналитика, Заявки и CRM, Поддержка и рост.
  4. Обо мне: 3 карточки + 4 цифры. 5. Последние проекты (6 карточек). 6. Услуги 01–08. 7. CTA «Готовы начать проект?». 8. Футер.
- Палитра/шрифт: bg #060810, accent #7AA2FF, accent-2 #B9CDFF, text #EEF1F8, text-2 #B7BFD1, muted #7B8499, шрифт Golos Text.
- Текущий проект: React 19 + Vite 7 + TS + Tailwind 3.4 + SSR-пререндер (src/entry-server.tsx, scripts/prerender.cjs). Текущая главная — src/sections/digitalbau/HomeScene. Тексты — react-i18next (ru/de/en). Данные проектов — src/data/projects.ts.

[Найденные проблемы референса — исправить при переносе, не копировать 1:1]
1. Спираль слишком длинная (640vh) с пустыми участками, карточки шагов в фокусе полупрозрачные и под наклоном → плохо читаются. Сократить до ~350–400vh, карточка в фокусе — opacity ≥ 0.95, без наклона; все 7 шагов имеют карточку одного вида.
2. Прозрачная fixed-шапка налезает на контент (портфолио под меню). После первого экрана — фон + backdrop-blur + нижняя граница.
3. В карточках портфолио заглушки «Скриншот проекта». Взять реальные изображения из src/data/projects.ts / public. Где нет — снять скрин живого сайта (playwright, 1440×900 → webp ≤ 120 КБ) и сохранить в public/images/portfolio/.
4. Шрифт с Google Fonts → self-host Golos Text (woff2, latin+cyrillic, font-display: swap, preload) — требование DSGVO.
5. three.js из CDN → npm-пакет `three` (новая зависимость, точная версия без ^), импорт только `import()` после гидрации/idle.

[Локация: Bremen → Hannover] (решение Pavel 2026-10-18)
Город везде меняется на Hannover. Сделать отдельным коммитом `chore(location): Bremen → Hannover`.
- Уровень ГОРОДА — менять сразу:
  - index.html + src/pages/Home.tsx: title/og/twitter «Web Coding Bremen» → «Web Coding Hannover»; keywords «Bremen web developer» → «Hannover web developer».
  - JSON-LD (index.html): addressLocality → "Hannover", addressRegion → "Niedersachsen", areaServed City → "Hannover".
  - Футер, бейджи сцены, home-copy.ts («Full-Stack-Entwickler in Bremen» и т.п.), BusinessCardPage `location` → Hannover; координаты-декор «53.07°N» → «52.37°N».
  - .claude/agents.md: локальный поиск (Bremen) → (Hannover).
- Уровень ЮРИДИЧЕСКОГО АДРЕСА (Am Dobben 102A, 28211 Bremen): Impressum/Datenschutz/Политика (i18n *.json addressLine1/2, privacy.text, src/i18n/index.ts, PrivacyPage.tsx), vCard ADR в BusinessCardPage, JSON-LD streetAddress/postalCode.
  - Новый адрес НЕ выдумывать. Взять из .claude/CLAUDE.md (строка «Контакты»). Если там всё ещё «адрес — уточняется» → эти места НЕ трогать, вывести их списком на стоп-точке и спросить адрес у Pavel.
  - Если адрес есть — заменить во всех местах одной правкой, проверить grep'ом `Bremen|Dobben|28211` = 0 вне memory/.

[Файлы]
src/pages/Home.tsx, src/sections/digitalbau/**, src/sections/*.tsx, src/components/layout/** (Header/Footer), src/components/ds/**, src/index.css, tailwind.config.js, src/i18n/locales/{ru,de,en}.json, src/data/projects.ts, src/entry-server.tsx, scripts/prerender.cjs, index.html, public/fonts/, public/images/portfolio/

[Агенты]
- Explore: карта текущих секций/компонентов главной, токенов Tailwind, i18n-ключей, что переиспользовать, что удалить.
- Plan: архитектура переноса сцены (SSR-безопасный статический фон → ленивый WebGL-слой; синхронизация скролла со шагами; mobile/reduced-motion фолбэк). План показать до кода.
- general-purpose (i18n): новые ключи ru → переводы de/en, единый стиль.
- Отдельный агент-верификатор (не видевший код): сверка скриншотов прода-превью с эталоном на 1440 и 390, список расхождений.

[План]
0. Новая ветка `redesign-scena` от свежего main. Тег `pre-scena`.
1. Эталонные скриншоты референса (см. Контекст) → _design/scena/shots/.
2. Токены: палитра и типографика дизайна → tailwind.config.js + CSS-переменные в index.css (dark-only, как сейчас). Self-host Golos Text.
3. Шапка и футер по дизайну — общие для всех страниц (+ фикс п.2 проблем). Соц-колонка справа: на мобайле скрыть.
4. Главная: Hero → Сцена → Обо мне → Проекты → Услуги → CTA → футер. Все тексты через i18n, контакты — из существующих констант, не хардкодить.
5. Сцена:
   - SSR/первый кадр: статический фон (radial-gradient + лёгкий SVG/CSS-звёзды), контент шагов в HTML (SEO, без JS тоже читается).
   - WebGL: dynamic import three после гидрации + requestIdleCallback; DPR ≤ 1.5; пауза при visibilitychange/вне вьюпорта; resize с debounce.
   - prefers-reduced-motion и мобайл < 768px: без WebGL-спирали, шаги вертикальным списком с лёгким reveal.
   - Сокращённая длина и читаемые карточки (п.1 проблем).
6. Под-страницы (services, portfolio, blog, contact, brief, imprint, privacy, business-card): только новые токены/шапка/футер, вёрстку внутри не перерабатывать (отдельная задача).
7. Проверки:
   - `npx tsc -b && npm run lint && npm run build:static` — зелёное.
   - `npm run preview:static` (порт 4188): все 10 /ru-маршрутов — прямая загрузка, чистая гидрация, 0 ошибок в консоли.
   - Формы contact/brief — отправка доходит до /api/lead (перехват запроса).
   - Lighthouse mobile ≥ 60 (сейчас 61, не хуже), desktop ≥ 85, CLS < 0.05, TBT ≤ 300 мс. three.js НЕ в initial-чанке (проверить dist/stats.html).
   - Агент-верификатор: скрины 1440/390 vs эталон.
8. 🛑 СТОП-ТОЧКА: показать Pavel скриншоты главной (desktop + mobile), цифры Lighthouse, список расхождений с эталоном. Ждать «деплой».
9. Деплой — по той же процедуре, что в 01-cleanup-sync (бэкап dist → atomic mv → restart pavellevdin → curl всех маршрутов → откат при ошибке). Merge redesign-scena → main, тег `v3-scena`, push.
10. LAST_SESSION / LEARNINGS / BACKLOG (под-страницы в новом стиле, DE/EN-пререндер — следующие задачи).

[Готово когда]
- Главная визуально соответствует эталону с исправленными п.1–5, на мобайле аккуратный фолбэк.
- Все страницы в новых токенах/шапке/футере, 10/10 /ru-маршрутов с чистой гидрацией.
- Перф не хуже текущего, three.js грузится лениво.
- Формы, блог, админка работают как раньше.
- Задеплоено после «деплой», документы обновлены.

[Правила]
- Логические коммиты (tokens, fonts, layout, home-hero, home-scene, home-sections, subpages-skin, i18n, perf).
- Существующие версии зависимостей не менять; новая — только `three` (точная версия).
- Не трогать: scripts/ (бэкенд), scripts/data/, .env, админку, логику блога и форм.
- Без force-push. Деплой только после «деплой».
- Отчёт на русском.
