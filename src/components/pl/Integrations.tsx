import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from './Title';

const NODES = [
  { key: 'site', x: 82, y: 130 },
  { key: 'crm', x: 316, y: 64 },
  { key: 'telegram', x: 316, y: 196 },
  { key: 'ai', x: 550, y: 130 },
] as const;

/** Рёбра схемы: сайт → CRM / Telegram → AI. Один цикл ≈ 5 с (тайминги — в pl.css, .pl-integr__*). */
const EDGES = [
  { key: 'site-crm', d: 'M144 130H178Q198 130 198 110V84Q198 64 218 64H254' },
  { key: 'site-tg', d: 'M144 130H178Q198 130 198 150V176Q198 196 218 196H254' },
  { key: 'crm-ai', d: 'M378 64H412Q432 64 432 84V110Q432 130 452 130H488' },
  { key: 'tg-ai', d: 'M378 196H412Q432 196 432 176V150Q432 130 452 130H488' },
] as const;

/**
 * Схема интеграций с «живым» потоком: заявка уходит с сайта в CRM и Telegram, оттуда в AI, AI отвечает волной.
 * Только SVG + CSS (transform/opacity/stroke-dashoffset), без JS-анимации. Цикл крутится, пока схема видна
 * (IntersectionObserver ставит data-live); prefers-reduced-motion — статичная схема.
 */
export function Integrations() {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => { el.dataset.live = entry.isIntersecting ? 'true' : 'false'; },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="pl-integr">
      <div>
        <p className="pl-eyebrow" data-reveal="">{t('pl.integrations.eyebrow')}</p>
        <Title className="pl-h2 pl-integr__title" lines={[t('pl.integrations.title')]} />
        <p className="pl-lead" data-reveal="">{t('pl.integrations.lead')}</p>
      </div>
      <svg
        ref={svgRef}
        className="pl-integr__svg"
        viewBox="0 0 632 260"
        role="img"
        aria-label={t('pl.integrations.imageAlt')}
        data-reveal=""
        data-live="false"
      >
        <defs>
          <radialGradient id="pl-integr-ai-glow">
            <stop offset="0" stopColor="#7AA2FF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#7AA2FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Базовые линии */}
        {EDGES.map((e) => (
          <path key={e.key} d={e.d} className="pl-integr__line" />
        ))}

        {/* Импульсы-кометы поверх линий */}
        {EDGES.map((e) => (
          <path
            key={`p-${e.key}`}
            d={e.d}
            pathLength={100}
            className={`pl-integr__pulse pl-integr__pulse--${e.key}`}
            aria-hidden="true"
          />
        ))}

        {/* Свечение и волны вокруг AI */}
        <g transform="translate(550 130)" aria-hidden="true">
          <circle r="96" fill="url(#pl-integr-ai-glow)" className="pl-integr__aiglow" />
          <rect x="-62" y="-28" width="124" height="56" rx="6" className="pl-integr__ring pl-integr__ring--1" />
          <rect x="-62" y="-28" width="124" height="56" rx="6" className="pl-integr__ring pl-integr__ring--2" />
        </g>

        {/* Узлы */}
        {NODES.map((n) => (
          <g key={n.key} transform={`translate(${n.x} ${n.y})`} className={`pl-integr__n pl-integr__n--${n.key}`}>
            <rect x="-62" y="-28" width="124" height="56" rx="6" className="pl-integr__node" />
            <text textAnchor="middle" dy="5" className="pl-integr__label">{t(`pl.integrations.nodes.${n.key}`)}</text>
          </g>
        ))}

        {/* Маленькие события: «+1» в CRM, точка-уведомление в Telegram */}
        <g transform="translate(372 38)" aria-hidden="true">
          <g className="pl-integr__badge pl-integr__badge--crm">
            <rect x="-17" y="-11" width="34" height="22" rx="11" />
            <text textAnchor="middle" dy="4.5">+1</text>
          </g>
        </g>
        <circle cx="374" cy="172" r="5" className="pl-integr__dot" aria-hidden="true" />
      </svg>
    </div>
  );
}
