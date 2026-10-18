import { useTranslation } from 'react-i18next';

type Service = { title: string; text: string; points: string[] };

// Небольшие линейные иконки помогают различать направления услуг.
const ICONS: string[][] = [
  ['M3 5h18v12H3z', 'M8 21h8', 'M12 17v4'],
  ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M15.5 15.5 21 21'],
  ['M8 3v5', 'M16 3v5', 'M5 8h14v4a7 7 0 0 1-14 0z', 'M12 19v2'],
  ['M12 2 20 7v10l-8 5-8-5V7z', 'M12 22V12', 'M20 7l-8 5-8-5'],
  ['M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M11 18h2'],
  ['M3 11 21 3l-6 18-4-7z', 'M11 14l10-11'],
  ['M4 4h16v6H4z', 'M4 14h16v6H4z', 'M8 7h.01', 'M8 17h.01'],
  ['M12 20V9', 'M6 13l6-6 6 6', 'M5 4h14'],
];

export function ServicesGrid() {
  const { t } = useTranslation();
  const items = t('pl.services.items', { returnObjects: true }) as Service[];
  return (
    <ol className="pl-svc-grid">
      {items.map((s, i) => (
        <li key={s.title} data-reveal="">
          <details className="pl-svc">
            <summary>
              <span className="pl-svc__head">
                <svg className="pl-svc__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[i].map((d) => <path key={d} d={d} pathLength={1} />)}
                </svg>
              </span>
              <span className="pl-srv__title">{s.title}</span>
              <span className="pl-srv__text">{s.text}</span>
              <span className="pl-svc__more" aria-hidden="true">{t('pl.services.open')} <span className="pl-svc__chev">+</span></span>
            </summary>
            <ul className="pl-svc__points">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </details>
        </li>
      ))}
    </ol>
  );
}
