# LEARNINGS — PL – Innovativ Digitalbau

Долгоживущие технические уроки проекта. Пополняется по сессиям.

## Выкатка 15 (2026-10-26)

- **ПРАВИЛО ПАВЛА (постоянное): сделано и проверено → СРАЗУ на прод.** Не останавливаться на «жду решения», если откат
  возможен (бэкап .env/конфига + старый образ). Решение за Павлом — только для необратимого или чужих систем.
- **`outputFileTracingExcludes` Next матчит glob с `contains: true`** (collect-build-traces.js): `"src/**/*"` и даже
  `"./src/**/*"` выкидывают `node_modules/<pkg>/src/**` → в p12 не было `@asamuzakjp/generational-cache/src` → jsdom не грузился →
  500 на ВСЕХ статьях блога (ленты 200!). Исключения по src/ не задавать. В p11 это скрывал полный `npm install` в runner.
- **Smoke образа платформы = рендер статей с реальным Strapi**: `docker run -e STRAPI_INTERNAL_URL=https://pavellevdin.ru pl-web:pN`
  (публичный /api/blog-posts проксируется) → curl всех `/blog/*` из sitemap. Проверка только лент/логина пропустила 500 у статей.
- **`docker compose up -d web` пересоздаёт и strapi**, если менялся `.env` (оба на `env_file: .env`) — деплой web делать `--no-deps`.
- **На russh могут работать параллельные сессии** (26.10 15:15 кто-то правил SMTP в том же `.env` и пересоздавал стек) —
  перед правкой `.env` смотреть свежие `.env.bak-*`, только дописывать ключи.
- **Gemini через ретранслятор**: `tg-relay:18081/gemini/v1beta` (туннель pl-tg-tunnel → VPS pl-tg-relay). 152-ФЗ: через ЕС —
  только контент-агенты (`GEMINI_RELAY_ALLOWED_AGENTS`, дефолт в `ai/relay-policy.ts`); вызов AI без `options.agent` при
  включённом ретрансляторе блокируется — новый агент добавлять в список осознанно.
- **Gemini 503 «high demand» бывает часами** у 3.8/3.7-flash (и из ЕС) — 5xx после повторов → следующая модель цепочки.

## Аудит-фиксы 14 (2026-10-26)

- **Перед деплоем платформы сверять main с образом прода**: `docker exec pl-web tar c -C /app src …` → `diff -r --strip-trailing-cr`
  (образы собирались из Windows-копии, CRLF). Так нашлись незакоммиченные хотфиксы p10/p11.
- **Google Gemini API из РФ закрыт** (`400 FAILED_PRECONDITION: User location is not supported`, даже ListModels). Ошибка
  «model … no longer available» пришла раньше гео-проверки и маскировала её. Проверять модели — с VPS в ЕС.
  Ключ API передавать заголовком `x-goog-api-key`, не `?key=` (не попадает в логи прокси).
- **Модели Gemini снимают для новых пользователей** (2.5-flash → 404). Имя модели — только из env с дефолтом, цепочка запасных;
  404 модели → следующая модель, а не следующий ключ.
- **Express `static` скрывает dot-папки** (`dotfiles: 'ignore'`) → `/.well-known/security.txt` = 404. Монтировать отдельный
  `express.static(dist/.well-known)` до общего.
- **Next standalone трассирует `serverExternalPackages` неполно** (puppeteer-core без debug/chromium-bidi) — раньше это скрывал
  `npm install` в runner, который ставил ВСЕ зависимости (+1,18 ГБ). Ставить пакет отдельно в builder и проверять `require`/`import` при сборке.
- **Chromium на Alpine ≈ 800 МБ** (llvm/mesa/gtk) — образ Next с PDF через Chromium < 500 МБ не ужать; путь — отдельный сервис рендера.
- **Метаданные `robots` в `layout` наследуются дочерними страницами** — noindex ленты держать в `page.tsx`.

## Админка pl-platform (13/13b, 2026-10-24)

- **mail-guard без SMTP делает `email.send` no-op** — всё, что после send помечает «отправлено», врёт. Проверять `SMTP_HOST`
  до отправки и отвечать отдельным кодом (503 `SMTP_NOT_CONFIGURED`), чтобы UI сказал «скачайте PDF», а запись осталась черновиком.
- **Статусы без миграции**: группировать enum в UI (new / in_work / closed) и фильтровать через `filters[status][$in]`;
  при смене писать «опорное» значение группы. Старые значения отображаются корректно.
- **`server-only` в цепочке импортов ломает vitest** — модуль с fs (шрифты PDF) подгружать динамически внутри функции генерации,
  тогда чистый HTML-рендер остаётся тестируемым.
- **eslint react-hooks `set-state-in-effect`**: `setLoading(true)` в начале функции, вызываемой из эффекта, — ошибка. Начальное
  состояние «загрузка» по умолчанию, а `setLoading(true)` — в обработчике кнопки обновления.
- **Скрипты правок через heredoc + node**: `\\d` в шаблонной строке теряет обратный слэш — регулярки править через Edit.

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

## Валидация и SEO-head (07, 2026-10-21)

- **React 19 + react-helmet-async 3**: Helmet рендерит нативные `<title>/<meta>/<link>`, React их «поднимает» в head —
  каждый уровень Helmet (App → Layout → страница) даёт СВОЙ title. Держать title/description/canonical только на уровне
  страницы (PageMeta). В `renderToPipeableStream` без полного документа эти теги остаются внутри `#root` — пререндер
  вырезает их из SSR-тела (hoistable, гидрация их не сверяет), а JSON-LD `<script>` оставляет (он не hoistable → иначе mismatch).
- **express.static на каталоге шлёт 301 на слэш** — canonical без слэша при этом указывает на редирект. Отдавать
  `dir/index.html` своим middleware, `/x/ → 301 /x`, `redirect: false`; неизвестные пути — 404 c SPA-оболочкой (не soft-404).
- **cors() с `callback(new Error)` даёт 500 на статику**, когда браузер шлёт Origin (module-скрипты, шрифты crossorigin):
  чужой origin — `callback(null, false)`.
- **Порт 4190 — «unsafe port»** у fetch (undici) и Chrome (`bad port` / ERR_UNSAFE_PORT). Локальные прогоны — на 4191.
- **validator.w3.org** отдаёт Cloudflare-челлендж node-fetch (429), curl проходит; при ~100 запросах подряд режет и curl —
  темп ≥ 2,5 с, партиями. PSI API без ключа — общая суточная квота, быстро кончается: для замеров нужен PSI_API_KEY или
  локальный Lighthouse (одинаковые условия до/после; параллельная сборка/тесты занижают балл).
- axe-core `region`/`landmark-unique`: `aria-label` на `<div>` без роли — ошибка W3C и a11y; соц-колонку делать `<nav>`,
  `<Link><Button>` → `<Button asChild><Link>` (кнопка внутри ссылки — ошибка W3C).

## Аудит 10 (2026-10-22)
- **CI на чистой машине**: зависимость, которая лежит только в `scripts/node_modules` (puppeteer), локально «работает» —
  Node ищет модули вверх от файла скрипта; в CI её нет. Проверять сборку свежим клоном / CI, а не рабочей копией.
- Файлы из .gitignore, которые импортирует TS (`fx-rate.json`, `projects-status.json`), ломают `tsc -b` на чистой машине →
  `prebuild`/`predev` (`scripts/ensure-build-data.cjs`) создаёт безопасные значения, существующие не трогает.
- puppeteer ≥ 24: `executablePath()` асинхронный — без `await` в аргумент уходит «[object Promise]», и Lighthouse молча
  берёт другой Chrome или висит. Chrome for Testing 150 под Lighthouse 12 на Windows виснет → `CHROME_PATH` к системному Chrome.
- Lighthouse на ПК с < 1,5 ГБ свободной памяти: прогоны по 3 мин и выше, фоновые задачи снимаются Claude Code.
  Замер по 10 сайтам — отдельно от сборок/агентов; цифры зависят от машины (mobile ниже, чем на PSI).
- JSON-импорт в Vite с `json.stringify: true` не тришейкается: общий большой JSON (посадочные услуг, ~23 КБ gzip) в
  нескольких чанках → лёгкий индекс, генерируемый при сборке (`services-landing-index.json`).
- С russh `api.telegram.org` недоступен: Bot API — только через `TELEGRAM_API_BASE` (ретранслятор, `X-Relay-Key`).
  Проверка из контейнера: `docker exec -w /home/host1731061/pavellevdin.ru/projects/app stack-pavellevdin-1 node -e …getMe…`.
- Python-heredoc в Git Bash: `\n` внутри `"""…"""` легко превращается в реальный перевод строки в JS-строке —
  многострочный код писать Write/Edit, не через heredoc-replace.

## Промпт 16 (2026-10-26)
- Strapi v4: поле `uid` (slug) уникально по ВСЕМ локалям, даже с `i18n.localized: true` → у локализаций должен быть свой slug,
  иначе `POST /localizations` падает «This attribute must be unique», а публикатор молча оставляет только базовую локаль.
- Cleanup после публикации удаляет пайплайн вместе с переводами (content_de/en) — восстановить нечего (логи обрезаны до 2000 символов,
  дамп БД ночной). Перед ручными экспериментами с публикацией — снимать JSON пайплайна.
- `NEXT_PUBLIC_*` в server-коде инлайнится при сборке (`https://pavellevdin.ru`) — файлы своего Strapi качать изнутри через `STRAPI_INTERNAL_URL`.
- Снаружи pavellevdin.ru не проксирует `/api/cron/*` (404) — cron-роуты проверять изнутри `docker exec pl-web node -e fetch(localhost:3000…)`.
- Обложки: Chromium в pl-web + шрифты woff2 data-URL дают кириллицу Onest без системных шрифтов; sharp/librsvg — запасной вариант (Liberation).
- Клиентские EJS-сайты (anapa, kub) в production кешируют шаблоны → после правки `docker restart stack-<site>-1`. В kub `server.js` CRLF — не нормализовать.

## Промпт 17 (2026-10-26) — полоса разработчика на чужих сайтах
- Павлу нужна ЗАМЕТНАЯ подпись: отдельная полоса под футером в фирменном цвете сайта, не серая строка в ©. Не fixed/sticky.
- SPA/SSG с гидрацией (Vite, Vike): вставлять ВНЕ `#root`, после него. Для пустого до JS `#root` — `#root:empty + .pl-devband{display:none}`, иначе CLS (было 0.148 на delimes).
- Если строка рендерится из React (peristeen), убирать в HTML и в JS-чанке одновременно, иначе hydration mismatch; чанки immutable — страховочное CSS-правило.
- Lighthouse score при параллельных агентах скачет на ±0.05 — сравнивать CLS и main-thread breakdown, а не score.

## Промпт 20 (2026-10-26)
- **Telegram не скачивает файлы с russh по URL** (`sendPhoto` → «Bad Request: failed to get HTTP URL content»), хотя из ЕС картинка 200:
  блокировка в обе стороны, как и api.telegram.org с russh. Фото/видео в Bot API — только загрузкой файла (multipart) через ретранслятор
  (`telegramFetchForm`, client_max_body_size ретранслятора 20m). `sendVideo` по URL (telegram-publisher) — та же проблема, не исправлялась.
- Старый publisher при «фото не ушло» молча слал текст без фото — success=true. Проверять результат глазами: `curl https://t.me/s/<канал>`
  (публичный веб-просмотр видит фото/кнопки).
- Подпись к фото — 1024 видимых символа; длинный AI-текст раньше разбивался на 2 сообщения (фото + текст с кнопками). Теперь сокращение по абзацам.
- Бот-не-админ канала: `getChatMember`/`getChatAdministrators` → «member list is inaccessible» (а не status=left). Права могут появиться в ходе
  сессии — проверять прямо перед отправкой (backfill делает это сам).
- Пост бота в канале удаляется `deleteMessage` (бот-админ); записи журнала в `published-contents` с title «[telegram] …» удалять вместе с постом.

