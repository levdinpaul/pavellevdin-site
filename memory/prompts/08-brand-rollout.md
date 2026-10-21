# 08 — Бренд «Кладка PL» везде: сайт (выкладка) + платформа + письма + КП

Решение Pavel 2026-10-21: бренд — **Innovativ Digitalbau**, знак — «Кладка PL» (P из блоков, синие блоки внизу = L),
подпись — Pavel Levdin. Пакет и правила — `brand/README.md` (в репо) и `D:\Сайты\Портфолио\_design\brand\` (копия на ПК).
Без стоп-точек, деплой сам после зелёных проверок, бэкап и откат обязательны.

## 1. Сайт pavellevdin.ru — уже сделано в main (b03166c), нужно только выкатить
`git pull origin main` → в коде: `src/components/layout/BrandMark.tsx` (знак), шапка и футер со знаком, новые favicon.svg/ico,
apple-touch-icon, icon-96/192/512 + icon-maskable-512, site.webmanifest (тёмные цвета, maskable), OG по языку
(`og-image.jpg` ru, `og-image-de.jpg`, `og-image-en.jpg` через PageMeta). Проверить:
- шапка 1440/390: знак 32 px слева от «Innovativ Digitalbau», не ломает высоту шапки, на 375 px подпись скрыта как раньше;
- футер: знак + «Innovativ Digitalbau»;
- ⌘K-палитра / 404 / страницы платформы — нигде не осталось старого «PL» в кружке или текстового «PL ·»; grep старых упоминаний;
- index.html: og:image/twitter:image по умолчанию ведут на og-image.jpg (ru), а пререндер de/en подставляет свои (проверить в dist/de, dist/en);
- favicon во вкладке Chrome/Firefox/Safari, иконка «На экран Домой» (iOS/Android);
- JSON-LD Organization/LocalBusiness: `logo` = https://pavellevdin.ru/brand/logo-horizontal.svg (или PNG 4× из brand/png — Google требует растровый: положить public/brand/logo-1200.png из brand/png/logo-horizontal@4x.png), `image` = og-image.jpg.
Деплой: build:static → бэкап dist → выкладка → curl → медиана PageSpeed (как раньше) — не хуже.

## 2. Платформа pl-platform (кабинет, админка, вход, блог)
- Тот же знак в шапке/футере/на страницах входа и регистрации (перенести BrandMark как компонент), favicon/иконки/манифест — те же файлы.
- Письма (сброс пароля, magic-link, уведомления, КП по почте): шапка письма — `brand/png/logo-horizontal@2x.png` (тёмная плашка) или
  `logo-horizontal-light@2x.png` (светлая), хостить с https://pavellevdin.ru/brand/…; alt="Innovativ Digitalbau".
- PDF КП/Angebot: логотип `brand/svg/logo-horizontal-light.svg` в шапке (текст в кривых, шрифт не нужен), подпись «Pavel Levdin».
- OG-картинка блога по умолчанию — og-image по языку.

## 3. Прочее
- Telegram-бот уведомлений: аватар бота — `brand/social/avatar-1024.png` (если бот управляется через BotFather — шаги в отчёт для Pavel).
- README обоих репо: раздел «Бренд» со ссылкой на brand/README.md.
- LAST_SESSION / LEARNINGS обновить. Merge в main, тег v9-brand, push обоих репо. Отчёт на русском со скринами шапки, футера, входа, письма и PDF КП.
