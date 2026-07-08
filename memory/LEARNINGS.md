# LEARNINGS — PL – Innovativ Digitalbau

Долгоживущие технические уроки проекта. Пополняется по сессиям.

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
