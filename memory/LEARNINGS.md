# LEARNINGS — PL – Innovativ Digitalbau

Долгоживущие технические уроки проекта. Пополняется по сессиям.

## Редизайн «PL Сцена» — производительность и SSR (2026-10-18)

- **favicon.svg на 534 КБ (PNG внутри SVG) убивал mobile-LCP в Lantern**: симулированный LCP 7,9 с → 3,5 с после
  замены на SVG-знак 0,6 КБ. Всегда смотреть `total-byte-weight` — тяжёлые «служебные» файлы крадут полосу.
- **Мерить «как на проде» — с gzip.** `serve-static.cjs` отдаёт без сжатия → баллы занижены; прод (nginx) отдаёт gzip.
  Для сравнения «до/после» — одинаковые условия (локально: старый dist на соседнем порту), для абсолютных цифр — gzip.
  Mobile шумит (TBT 300–1600 мс между прогонами) — минимум 3 прогона, медиана.
- **`startTransition(() => hydrateRoot(...))`** (приём Next.js) режет первичную гидрацию на кусочки ≤ 5 мс:
  длинная задача 1,4 с → ≤ 260 мс. Без transition Suspense-границы поток НЕ уступают.
- **Гонка: эффекты родителя срабатывают раньше гидрации вложенных Suspense-границ.** Эффект, меняющий DOM детей
  (data-reveal), даёт «attributes didn't match». Не класть Suspense внутрь компонента, чей эффект трогает DOM потомков.
- **Layout thrash в reveal-хуке**: getBoundingClientRect + запись атрибута в одном цикле = пересчёт на каждой итерации.
  Сначала все чтения, потом все записи.
- **three.js (≈530 КБ) по первому взаимодействию**, а не по idle: init на idle попадал в TBT (desktop 770 мс → 10–130).
- **Бесконечные CSS-анимации + backdrop-filter + drop-shadow на мобайле** = непрерывный paint → TBT. На мобайле выключены.
- **Не собирать, пока агент пишет файлы-источники** (локали): сборка взяла de.json без новых ключей → de/en показали ru.
- **Пререндер фиксирует runtime-`modulepreload`**: если ленивый `import()` срабатывает во время puppeteer-захвата,
  Vite-хелпер вставляет `<link rel="modulepreload">` в head, и он попадает в статический HTML → чанк three
  грузится на каждом заходе. prerender.cjs вырезает preload `scene-gl`; WebGL запускать только по взаимодействию/8 с.
- **HTML-подписи, масштабируемые transform + will-change, мылятся** при scale > 1 (растр берётся с базового размера).
  Базовый font-size — максимальный, драйвер только уменьшает (LABEL_SCALE в SceneSection).
- **JSON для React + .cjs-скриптов** (portfolio.json) — один источник для приложения, пререндера и sitemap.

## Инфраструктура и деплой (2026-10-18)

- **Workflow GitHub Pages был миной:** `deploy.yml` публиковал `main` на levdinking.github.io при каждом push
  (репо публичный). Заменён на `ci.yml` без публикации. Перед первым push в main всегда смотреть `.github/workflows/`.
- **Прод = russh, без git.** `/srv/sites/pavellevdin.ru/projects/app` — просто копия файлов. Контейнер
  `stack-pavellevdin-1` монтирует `/srv/sites/pavellevdin.ru` в `/home/host1731061/pavellevdin.ru` — старый
  HostLand-путь только ВНУТРИ контейнера, снаружи это та же папка. Деплой — `scp` архива + atomic `mv dist`.
- **MCP russh-песочница не видит docker.sock** и не может писать куда угодно — restart/логи через `ssh russh`.
  Имя контейнера `stack-pavellevdin-1`, а не `pavellevdin` (для `docker logs`).
- **Контент блога мог жить только на сервере** (админка пишет в `src/content/blog` и `dist/` на проде) — перед
  заменой dist сверять md5 сервер↔репо. В 2026-10 расхождений не было, но проверка обязательна.
- **express.static отдаёт 301 на слэш** для `/ru/services` → `/ru/services/` — это норма, не ошибка.
- **`git checkout main` блокируется чужими незакоммиченными правками** — ff-перемотка без переключения:
  `git fetch . redesign-digitalbau:main` (разрешает только fast-forward).
- **Git-bash tar путает `C:/…` с удалённым хостом** — писать архив через stdout: `tar czf - -C dist . > file.tgz`.

## SSR-пререндер React 19 + Vite (2026-07-09)

- **Мерить пререндер через `npm run preview:static` (`scripts/serve-static.cjs`, :4188), НЕ `vite preview`.**
  Vite preview для `/ru` отдаёт SPA-fallback (пустой `dist/index.html`), а не пререндер-файл
  `dist/ru/index.html`. Все замеры через preview врут — это стоило половины сессии диагностики.

- **puppeteer-capture ≠ React-канонический HTML → hydration mismatch.** Старый `prerender.cjs` сохранял
  `document.documentElement.outerHTML` (браузер нормализует стили: `top:0px`, kebab-case). React при
  гидрации сравнивает со своим vdom (`top:0`) → «server rendered text didn't match» → **регенерация всего
  дерева** → LCP скачет на момент гидрации. Лечится настоящим `renderToString`/`renderToPipeableStream`.

- **react-i18next по умолчанию Suspense-ит при async-init.** При гидрации `useTranslation()` подвисал →
  клиент рендерил Suspense-fallback (спиннер) вместо контента → mismatch. Фикс: в i18n init
  `initImmediate:false` + `react:{useSuspense:false}` (ресурсы инлайн, backend async не нужен).

- **`renderToPipeableStream` + `onAllReady` резолвит `React.lazy`**, а `renderToString` — нет (рендерит
  fallback). Поэтому ленивые под-страницы SSR-ятся через pipeable stream, собирая поток в строку через
  `Writable`. entry-server рендерит тот же `<AppRoutes>`, что и клиент → структура совпадает.

- **Lantern (simulated throttling, движок PageSpeed) пессимистичен к SPA:** привязывает LCP к JS-задаче
  даже при чистой гидрации. `--throttling-method=devtools` (applied) и observed куда ближе к реальности
  (LCP 12s Lantern vs 4.7s applied vs 1.7s observed). Не гнаться за лаб-числом в ущерб реальному перфу.

- **`DOMParser` недоступен на сервере.** Для парсинга HTML при SSR (напр. TOC из тела статьи) — изоморфный
  regex, одинаковый на сервере и клиенте (иначе TOC на сервере ≠ клиенте → mismatch). См.
  `pages/blog/components/TableOfContents.tsx`.

- **dehydrate/hydrate для async-стейта (useEffect-данные).** Блог грузит контент в useEffect → на сервере
  не бежит. Решение: prerender грузит данные, кладёт в стор (`data/blog-hydration.ts`) + инжектит
  `<script>window.__BLOG_DATA__=…</script>` ПЕРЕД модульным скриптом; хуки берут начальный стейт из стора
  → SSR и первый клиентский рендер совпадают. Fallback: если стора нет (SPA-навигация) — обычный fetch.

- **Float-координаты в SVG-атрибутах → mismatch.** `Math.cos(-90°)≈6e-15` → координата в научной нотации,
  которую SSR и браузерный DOM сериализуют по-разному. Округлять (`Math.round(x*100)/100`).

- **Неконтролируемые нативные `<form>` (FormData + fetch в onSubmit) безопасны для SSR** — обработчик
  submit клиентский, срабатывает после гидрации; SSR трогает только разметку. Контролируемые инпуты с
  value из window/Date были бы риском.

- **Гидрацию можно отложить** (`requestIdleCallback` в `main.tsx`) для снижения TBT — но только если она
  ЧИСТАЯ; при mismatch отложенная гидрация лишь отодвигает регенерацию (и LCP) на потом.

- `entry-server.tsx` — серверный (node:stream), исключён из `tsconfig.app.json`, собирается
  `vite build --ssr` (`npm run build:ssr`). react-helmet-async@3 (форк) НЕ наполняет SSR-контекст под
  React 19 → head берём из puppeteer (Helmet на клиенте), тело `#root` — из SSR.
