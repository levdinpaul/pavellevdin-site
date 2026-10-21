# LEARNINGS — PL – Innovativ Digitalbau

Долгоживущие технические уроки проекта. Пополняется по сессиям.

## Два приложения на одном домене (04b, 2026-10-19)

- **SPA-ссылки на пути другого приложения ломаются молча**: React Router рисует `/ru/blog` внутри SPA (старый бандл),
  Next `Link` префетчит RSC с чужого сервера (`/ru?_rsc` → 404). Переходы между приложениями — только `<a>` / `location.assign`,
  а в SPA — маршрут-заглушка с полной перезагрузкой и защитой от цикла (сравнить URL текущего документа с navigation entry).
- **Публичные файлы Next с `assetPrefix` не префиксуются** — `/fonts/*`, `/og-image.jpg` улетают к соседнему приложению.
  Всё своё — под `public/_pl/`. `next/image` всегда ходит на `/_next/image` (без префикса) — маршрутизировать отдельно.
- **Оптимизатор картинок тянет абсолютный URL снаружи**: `https://домен/uploads/…` из контейнера идёт через внешний
  nginx (до переключения — к чужому приложению → 400). Надёжно: относительный `/uploads/…` + `rewrites` Next на Strapi.
- **Strapi 4 i18n**: локали в БД не создаются из `plugins.i18n.defaultLocale` — без bootstrap `POST locale=ru` даёт
  «This locale doesn't exist». uid-поле (slug) локализовано по умолчанию → разные slug на язык.
- **Strapi API-токен без UI**: `admin:create-user` → `POST /admin/login` → `POST /admin/api-tokens` (full-access).
- **Капча fail-closed в проде** (MP) без ключей блокирует регистрацию целиком — делать опциональной + rate-limit.
- Самоподписанный TLS между серверами: `proxy_ssl_verify on` + `proxy_ssl_trusted_certificate` (пин) +
  `proxy_ssl_name` = SAN сертификата (DNS-имя, не IP). На edge `allow <IP russh>; deny all;`.
- **Bash + `node -e` с бэктиками** выполняет их как подстановку команд — правки с шаблонными строками делать через Edit/файл-скрипт.

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
- **Пыль спирали — ShaderMaterial с «плавающим» окном глубины**: точки хранят смещение s, в шейдере
  d = mod(s − travel, DEPTH), z = camZ − d → мировая позиция фиксирована, но пыль всегда перед камерой (1600 точек хватает
  на весь полёт). Альфа sqrt(far) — без «вспышки» на точке переноса; размер clamp 1.3–2.5 px.
- **Playwright fullPage + content-visibility:auto** — секции вне вьюпорта не отрисовываются на полностраничном скрине
  (выглядит как «пустота»). Проверять секции скроллом во вьюпорт, а не fullPage.
- **JSON для React + .cjs-скриптов** (portfolio.json) — один источник для приложения, пререндера и sitemap.

## Доводка 04a (2026-10-18)

- **Vite читает корневой `.env` и берёт из него NODE_ENV.** `NODE_ENV=development` (нужен admin-серверу) молча
  переключал `vite build` на development-React (jsxDEV в vendor, ×2 Script Evaluation, mobile LH −15…20).
  Лечение — `envDir: 'env'` (только публичные VITE_*). Проверка: `grep -c jsxDEV dist/assets/vendor-*.js` = 0.
- **A/B перфа — только на одном сервере.** Прод vs локально расходятся на 5–15 баллов и шумят; база —
  git worktree с тегом до изменений + `serve-gz.cjs` на соседнем порту, прогоны чередовать.
- **content-visibility:auto = paint containment**: «взведённый» reveal-элемент внизу секции (translateY 26px)
  обрезается контейнером, и IntersectionObserver считает его невидимым навсегда. Запас: padding-bottom + равный
  отрицательный margin-bottom у секции.
- **html { scroll-behavior: smooth } делает window.scrollBy анимированным** — компенсация роста сцены «ехала»
  через 6000px, плюс Chrome scroll anchoring добавлял свою. Компенсация: overflow-anchor:none на один кадр
  и `scrollTo({ behavior: 'instant' })`.
- **getBoundingClientRect в эффектах счётчиков = forced layout на каждый Counter.** Исходное положение берём из
  первого колбэка IntersectionObserver.
- **Литеральные NBSP в TS ловит eslint (no-irregular-whitespace)**, а `' '` в Python/Write легко превращается
  в литерал — надёжнее `String.fromCharCode(0xa0)`. Разряды форматировать вручную, не Intl (SSR = клиент).
- **SMTP без зависимостей** (net/tls, STARTTLS, AUTH LOGIN) — 100 строк; так не трогаем scripts/node_modules на сервере.

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
