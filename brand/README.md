# Бренд Innovativ Digitalbau — Pavel Levdin

Знак «Кладка PL»: буква P сложена из блоков, синие блоки в основании — L.
Бренд — Innovativ Digitalbau, подпись — Pavel Levdin.

## Цвета
| | Тёмный фон | Светлый фон |
|---|---|---|
| Основные блоки, текст | `#EEF1F8` | `#0A0E1A` |
| Серые блоки | тот же цвет, 55 % | тот же цвет, 45 % |
| Синий L (акцент) | `#7AA2FF` | `#4F74D9` |
| Фон | `#060810` / плитка `#0A0E1A` | `#F5F6F9` / белый |

Шрифты: Onest 600 (название), JetBrains Mono 500 (подпись, разрядка 0.14–0.16em).

## Файлы
- `svg/` — знак и логотип в кривых (текст переведён в контуры, шрифт не нужен):
  `mark.svg` (тёмный фон), `mark-light.svg` (светлый), `mark-mono-white.svg` / `mark-mono-black.svg` (одноцветные: печать, гравировка),
  `logo-horizontal.svg` / `logo-horizontal-light.svg` (знак + «Innovativ Digitalbau» + «PAVEL LEVDIN · WEB CODING · SEO · AI»).
- `png/` — те же знак и логотип в PNG 2× и 4× (прозрачный фон) — для писем, Word, презентаций.
- `favicon/` — фавиконки и иконки приложения: `favicon.svg`, `favicon.ico` (16/32/48), PNG 16–512, `apple-touch-icon.png` (180),
  `icon-maskable-512.png` (Android, знак в безопасной зоне).
- `social/` — для соцсетей, фон — спираль сайта:
  - `avatar-1024.png` — аватар везде: WhatsApp, Telegram, VK, Instagram, LinkedIn, Google, почта (знак внутри круга — круговая обрезка безопасна);
  - `cover-vk-1920x768.png` — обложка сообщества VK (RU);
  - `cover-youtube-2560x1440.png` — шапка YouTube (текст в безопасной зоне 1546×423) (RU);
  - `cover-linkedin-1584x396.png` — LinkedIn (DE), `cover-x-1500x500.png` — X (EN), `cover-facebook-851x315.png` — Facebook (DE):
    текст справа, т.к. слева снизу ложится аватар;
  - `og-ru|de|en-1200x630.png` — картинка-превью ссылки (на сайте: `public/og-image.jpg`, `og-image-de.jpg`, `og-image-en.jpg`).

## Правила
- Не менять пропорции и цвета блоков, не добавлять тени/обводки (кроме варианта для печати).
- Минимальный размер знака — 16 px (фавиконка); логотип с подписью — от 140 px ширины, иначе только знак + «Innovativ Digitalbau».
- Поля вокруг знака — не меньше одного блока.
- На сайте знак — компонент `src/components/layout/BrandMark.tsx` (единственный источник геометрии).

Исходники генерации — скрипты в сессии Claude (build_svg.py / build_social.py); пересобрать можно по запросу.
