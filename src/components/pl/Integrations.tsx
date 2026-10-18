import { useTranslation } from 'react-i18next';

const NODES = [
  { key: 'site', x: 82, y: 130 },
  { key: 'crm', x: 316, y: 64 },
  { key: 'telegram', x: 316, y: 196 },
  { key: 'ai', x: 550, y: 130 },
] as const;

/** Одна спокойная схема объясняет связи между сервисами. */
export function Integrations() {
  const { t } = useTranslation();
  return (
    <div className="pl-integr">
      <div>
        <p className="pl-eyebrow" data-reveal="">{t('pl.integrations.eyebrow')}</p>
        <h2 className="pl-h2 pl-integr__title" data-reveal="">{t('pl.integrations.title')}</h2>
        <p className="pl-lead" data-reveal="">{t('pl.integrations.lead')}</p>
      </div>
      <svg className="pl-integr__svg" viewBox="0 0 632 260" role="img" aria-label={t('pl.integrations.imageAlt')} data-reveal="">
        <path d="M144 130H178Q198 130 198 110V84Q198 64 218 64H254 M144 130H178Q198 130 198 150V176Q198 196 218 196H254 M378 64H412Q432 64 432 84V110Q432 130 452 130H488 M378 196H412Q432 196 432 176V150Q432 130 452 130H488" className="pl-integr__line" />
        {NODES.map((n) => (
          <g key={n.key} transform={`translate(${n.x} ${n.y})`}>
            <rect x="-62" y="-28" width="124" height="56" rx="6" className="pl-integr__node" />
            <text textAnchor="middle" dy="5" className="pl-integr__label">{t(`pl.integrations.nodes.${n.key}`)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
