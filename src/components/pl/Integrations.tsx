import { useTranslation } from 'react-i18next';
import { GenImage } from './GenImage';

// Узлы схемы «сайт ↔ CRM ↔ Telegram ↔ AI» в координатах viewBox 640×260.
const NODES = [
  { key: 'site', x: 80, y: 130 },
  { key: 'crm', x: 320, y: 50 },
  { key: 'telegram', x: 320, y: 210 },
  { key: 'ai', x: 560, y: 130 },
] as const;
const LINKS: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2]];

/** Блок «API и интеграции»: SVG-схема с бегущими по линиям точками (stroke-dashoffset, только CSS) + иллюстрация. */
export function Integrations() {
  const { t } = useTranslation();
  return (
    <div className="pl-integr">
      <div>
        <p className="pl-eyebrow" data-reveal="">{t('pl.integrations.eyebrow')}</p>
        <h2 className="pl-h2 pl-integr__title" data-reveal="">{t('pl.integrations.title')}</h2>
        <p className="pl-lead" data-reveal="">{t('pl.integrations.lead')}</p>
        <svg className="pl-integr__svg" viewBox="0 0 640 260" role="img" aria-label={NODES.map((n) => t(`pl.integrations.nodes.${n.key}`)).join(' ↔ ')} data-reveal="">
          {LINKS.map(([a, b], i) => {
            const d = `M${NODES[a].x} ${NODES[a].y} L${NODES[b].x} ${NODES[b].y}`;
            return (
              <g key={d}>
                <path d={d} className="pl-integr__line" />
                <path d={d} className="pl-integr__flow" style={{ animationDelay: `${i * -0.7}s` }} />
              </g>
            );
          })}
          {NODES.map((n) => (
            <g key={n.key} transform={`translate(${n.x} ${n.y})`}>
              <circle r="34" className="pl-integr__node" />
              <text textAnchor="middle" dy="5" className="pl-integr__label">{t(`pl.integrations.nodes.${n.key}`)}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="pl-integr__media" data-reveal="">
        <GenImage dir="site" name="api-integrations" ratio="16/9" alt={t('pl.integrations.imageAlt')} sizes="(max-width: 899px) calc(100vw - 40px), 520px" />
      </div>
    </div>
  );
}
