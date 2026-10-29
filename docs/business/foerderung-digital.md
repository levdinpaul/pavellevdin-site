# PL: субсидии на цифровизацию для клиентов (бывший pl-digital-foerderung)

> Источник: бывшие проектные агенты `.claude/agents/pl-*` (перенесены в `.claude/_retired-agents/`, prompt-44). Роли теперь исполняют глобальные агенты `biz-*` (+ `rf-legal-biz`, `marketer`, `seo-specialist` и др.) и скиллы `biz-economist` / `biz-orchestrator`. Здесь только факты проекта. Пути `src/...`, `memory/...`, `public/...` - относительно репо сайта-портфолио (ПК: `D:\Сайты\Портфолио`, VPS-клон: `/home/claudeuser/cc-runs/work-23/pavellevdin-site`, GitHub: levdinpaul/pavellevdin-site).

Исполнитель: `biz-foerderung-application` (направление "субсидии клиентам на цифровизацию"). Цель: снизить клиенту стоимость проекта и использовать это в продажах/контенте. Финансирование самой студии (Gründungszuschuss) - `biz-business-plan-writer`.

## Правило №1: статус программы проверяется КАЖДЫЙ раз
Перед упоминанием - WebFetch официального сайта, фиксировать дату и URL. Часть известных программ завершена (напр. go-digital, Digital Jetzt - подтвердить статус, закрытые не рекламировать). Нет подтверждения - [статус не подтверждён], клиенту не предлагать. Ни одной суммы/ставки без даты и URL; "vorbehaltlich Förderzusage". Не подавать заявки за клиента, не консультировать юридически.

## Дисклеймер в каждом артефакте
DE: "Förderprogramme ändern sich häufig, werden ausgesetzt oder beendet; Budgets sind oft vorzeitig erschöpft. Alle Angaben ohne Gewähr, Stand: <дата>, Quelle: <URL>. Maßgeblich sind ausschließlich die aktuellen Richtlinien des Fördergebers. Keine Förderberatung im rechtlichen Sinne." RU: программы часто меняются и закрываются; информация - ориентир на дату проверки, не гарантия.

## Кандидаты (проверять)
- DE (фаза 2): Digitalbonus.Niedersachsen (NBank; открыт ли приём, заявители, суммы, подача ДО заказа), KfW (кредиты на Digitalisierung/Innovation Mittelstand), Mittelstand-Digital Zentren (бесплатные консультации - источник клиентов и партнёров), BAFA / программы Länder (Unternehmensberatung), Region Hannover / hannoverimpuls, IHK Hannover. De-minimis: учитывать ранее полученное.
- РФ (фаза 1): центры "Мой бизнес" и региональные фонды поддержки МСП (сильно зависит от региона и года, только официальные сайты региона с датой), льготные кредиты Корпорации МСП. IT-льготы аккредитованных IT-компаний - не про клиента и не про Pavel как нерезидента, не утверждать.

## Артефакты (`_business/foerderung/`)
programme-de.md, programme-ru.md (таблица: программа x для кого x покрытие x сумма/доля x порядок подачи x статус с датой и URL); чек-лист клиента (применимость -> заявка ДО договора, если требуется -> документы исполнителя); контент для сайта/КП ("Ihr Projekt ist ggf. förderfähig" без сумм); шаблон КП/Angebot, пригодный для подачи (разбивка по позициям, сроки, цель цифровизации).
