# Инвентарь портфолио — собран 2026-10-18 со всех 3 серверов

Источник: nginx server_name + docker на всех серверах, HTTP-проверка каждого домена (curl, 18.10.2026 01:40).
Текущий src/data/projects.ts УСТАРЕЛ: часть описаний и стеков неверны (например, delimes.ru — не «digital-агентство»,
MP Innovativ Bau — не WordPress). Переписать по этому списку и по реальному содержимому сайтов.

## Серверы
| Сервер | IP | Что крутится |
|---|---|---|
| main (claudeuser) | 212.227.100.97 | vl-next/vl-strapi, opora-core, polaris-core, fithilf-*, med-agency-* |
| mp-vps | 212.227.205.20 | mp-next, mp-strapi, mp-nginx, mp-postgres |
| russh | 178.212.15.50 | статические/Node-сайты в /srv/sites + pavellevdin.ru |

## Проекты для портфолио
| slug | Домен (ссылка) | HTTP | Что это (title сайта) | Стек (подтверждено) | Категория | Примечание |
|---|---|---|---|---|---|---|
| vl-innovativbau | https://vl-innovativbau.de | 200 | Fenster & Türen in Hannover | Next.js + Strapi + PostgreSQL, Docker | Клиент DE | клиент VL-Innovativbau GmbH |
| mp-innovativbau | https://mp-innovativbau.de | 200 | Holzbau & Ausbau in der Region Hannover | Next.js + Strapi + PostgreSQL, Docker (отдельный VPS) | Клиент DE | клиент MP-Innovativbau (Holzbau) |
| kub-perevozki | https://kub-perevozki.ru | 200 | Грузоперевозки и переезды по России | Node/Express (^5.2.1) | Клиент RU | |
| anapa-manipulyator | https://anapa-manipulyator.ru | 200 | Кран-манипулятор в Анапе от 2500 ₽/час | Node/Express (^4.21.2) | Клиент RU | |
| peristeen | https://peristeenplussystem.delimes.ru | 200 | Peristeen Plus System — оригинал из Германии | статический HTML + блог | Клиент/продукт RU | медицинский продукт (Coloplast) — проверить формулировку |
| delimes | https://delimes.ru | 200 | Выкуп и доставка товаров из Германии | статический HTML | Свой проект RU | НЕ digital-агентство — переписать описание |
| vestora-life | https://vestoralife.de | 200 | Opora Life — alle Fristen an einem Ort | Next.js + PostgreSQL (RLS, мульти-тенант), PWA, MCP, Telegram-бот, i18n DE/RU/EN | Свой продукт | личный life-tracker → SaaS |
| polaris | https://polaris.delimes.ru | 200 | Polaris — играй в свою жизнь | Next.js | Свой продукт | |
| fithilf | https://fithilf.vl-innovativbau.de | 200 | FitHilf — твоё тело в цифрах, прогресс под контролем | PHP + MariaDB + очереди/scheduler (Docker) | Свой продукт | ссылка ТОЛЬКО на новую версию (fithilf.ru старая, будет заменена) |
| med-agency | https://med-preview.vl-innovativbau.de | 200 | Med Agency — Сопровождение лечения в Германии | Next.js 16 (App Router) + Strapi 5 + PostgreSQL 16, i18n 3 языка, роли и кабинеты | Клиент (мед. туризм) | Basic Auth снят 2026-10-18; noindex сохранён (staging); помечать «в разработке / превью» |
| domusman | https://domusman.ru | 200 | Дом 87,2 м² в Новой Усмани — лендинг продажи | статический сайт + PHP-форма заявок, staging-версия | Лендинг RU | кейс «лендинг недвижимости» |

## Не включать / решить с Pavel
| Домен | Причина |
|---|---|
| socialhub.delimes.ru | 404 — сайта нет. Убрать из projects.ts (и битую socialhub.png) |
| gruzanapa.ru | не отвечает (404/000) — не публиковать, пока не оживёт |
| my.delimes.ru | копия самого портфолио — не проект |
| api./mcp./mx./d. поддомены | техническая инфраструктура, не проекты |

## РЕШЕНИЯ PAVEL 2026-10-18 (приоритет над промптом 02)
- Разрешения клиентов на ссылки есть — ставить прямые переходы на все живые сайты.
- СТОП-ТОЧКИ НЕ ДЕЛАТЬ: работать до конца без вопросов. Деплой выполнить самому после того, как ВСЕ проверки
  зелёные (build, tsc, 10+ маршрутов, гидрация, формы, Lighthouse-бюджет). Бэкап + откат — обязательны.
  Спорные решения принимать самому и перечислить в итоговом отчёте.
- Адрес — ИНКОГНИТО: улицу и индекс нигде не публиковать. Везде (Impressum/Datenschutz/Политика/vCard/JSON-LD/футер)
  только «Hannover, Deutschland / Hannover, Germany / Ганновер, Германия». Am Dobben 102A и 28211 убрать полностью.
- FitHilf → только новая версия. med-agency и domusman — включить.

## ЧТО PAVEL УМЕЕТ (собрано по серверам) — внедрить в услуги, «Обо мне» и страницы проектов
Не выдумывать сверх этого списка; формулировать как услуги для клиента.
- Сайты и веб-приложения: Next.js (App Router, SSR/SSG), React 19 + Vite, headless CMS Strapi, PostgreSQL/MariaDB, PHP.
- Инфраструктура: собственные VPS (3 сервера), Docker Compose, nginx reverse proxy, Let's Encrypt, бэкапы, мониторинг,
  перенос сайтов с shared-хостинга на VPS, собственный почтовый сервер (mx).
- API и интеграции: REST/Strapi API, формы заявок → свой backend + Telegram-уведомления, Google Search Console API,
  GA4/GTM (события, конверсии), Yandex Метрика, magic-link авторизация, мульти-тенант с RLS.
- AI-автоматизация: AI-роутер моделей с учётом расходов, AI-пайплайн статей (генерация, картинки, публикация),
  генерация PDF-коммерческих предложений, распознавание чеков, BYOK OpenRouter, собственные MCP-серверы
  (подключение данных бизнеса к AI-ассистентам), агентная разработка с Claude Code.
- Соцсети и маркетинг: автопостинг в соцсети (social-poster), генерация видео/контента под соцсети, пиксели и события,
  Google Business Profile, Яндекс Бизнес, локальное SEO, AEO (оптимизация под AI-поиск), schema.org.
- Боты: Telegram-боты (уведомления, личный ассистент).
- PWA и мультиязычность (DE/RU/EN), DSGVO / 152-ФЗ.

## АНИМАЦИИ И «ФИШКИ» — чтобы сайт запоминался (в рамках перф-бюджета, всё с prefers-reduced-motion)
- Текст hero: поэтапное появление слов/строк (split-text reveal), подсветка «готовая система».
- Магнитные кнопки CTA + мягкое свечение-курсор (только desktop, pointer:fine).
- Счётчики «10+ лет / 3 языка / N проектов» — count-up при появлении (N = реальное число проектов из данных).
- Бегущая строка технологий (marquee) — названия текстом, без чужих логотипов.
- Карточки проектов: 3D-tilt + блик при наведении, плавный переход в страницу проекта (View Transitions API, фолбэк fade).
- Live-статус проектов: зелёная точка «онлайн», проверка доступности на этапе сборки (build-time, не из браузера).
- Страница проекта: параллакс скриншота, desktop↔mobile переключатель превью, прогресс-бар чтения.
- Услуги: раскрывающиеся карточки с иконкой-анимацией обводки; блок «API и интеграции» — схема «сайт ↔ CRM ↔ Telegram ↔ AI»
  с бегущими по линиям точками (SVG, лёгкая).
- Скролл-прогресс в шапке, плавный якорный скролл, кнопка «наверх».
- Easter egg: ⌘K / Ctrl+K командная палитра (уже есть — оформить в новом стиле и упомянуть подсказкой в футере).
- Бюджет: mobile Lighthouse ≥ 60, CLS < 0.05, вся анимация на transform/opacity, тяжёлое — lazy.
