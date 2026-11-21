import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { animate, motion, useInView, type Variants } from 'framer-motion';
import type { Project } from '@/data/projects';
import { ProjectCard } from '@/components/pl/ProjectCard';

/**
 * Секция «Проекты» на главной с scroll-build анимацией (пилот, prompt-9836):
 * заголовок печатается как код с мигающим курсором, карточки каскадом раскрываются
 * из тонкой линии (clip-path inset) с fade + сдвигом вверх, рамка карточки прорисовывается (SVG pathLength).
 *
 * Фазы: 'static' — SSR/без JS/reduced-motion/секция уже на экране при монтировании: всё видно, без анимации;
 * 'armed' — секция ниже экрана, контент спрятан до входа в экран; 'play' — проигрывается один раз.
 * Разметка и классы — как были (pl-section__head, pl-title, pl-work__grid), визуал после анимации тот же.
 */
type Phase = 'static' | 'armed' | 'play';

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD_RADIUS = 12; // = border-radius .pl-work__card
const TYPE_MS_PER_CHAR = 55;

const STAGGER_S = 0.11; // каскад внутри ряда сетки: delay = колонка × шаг
const card: Variants = {
  // в ожидании — только прозрачность: clip-path цели Chrome учитывает в IntersectionObserver,
  // и «линия» в 3px срабатывала бы слишком поздно; линия — первый кадр раскрытия
  hidden: { opacity: 0, y: 18, transition: { duration: 0 } },
  shown: (delay: number) => ({
    opacity: 1, y: 0, clipPath: [`inset(49.5% 0% 49.5% 0% round ${CARD_RADIUS}px)`, `inset(0% 0% 0% 0% round ${CARD_RADIUS}px)`],
    transition: { duration: 0.75, ease: EASE, delay, opacity: { duration: 0.35, delay } },
    // после раскрытия снимаем clip-path и transform, чтобы hover-подъём карточки не обрезался
    transitionEnd: { clipPath: 'none', transform: 'none' },
  }),
};
const frame: Variants = {
  hidden: { pathLength: 0, opacity: 0, transition: { duration: 0 } },
  shown: (delay: number) => ({
    pathLength: 1, opacity: [0, 1, 1, 0],
    transition: { pathLength: { duration: 0.9, ease: 'easeInOut', delay: delay + 0.2 }, opacity: { duration: 1.6, times: [0, 0.1, 0.75, 1], delay: delay + 0.2 } },
  }),
};
const fade: Variants = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  shown: (delay: number) => ({ opacity: 1, transition: { duration: 0.5, ease: EASE, delay } }),
};

export function WorkSection({ lang, work }: { lang: string; work: Project[] }) {
  const { t } = useTranslation();
  const title = t('pl.work.title');
  const ref = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const [cols, setCols] = useState(3);
  const [armed, setArmed] = useState(false);
  const [typed, setTyped] = useState<number | null>(null); // null = заголовок целиком
  const [cursorOff, setCursorOff] = useState(false);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const phase: Phase = !armed ? 'static' : inView ? 'play' : 'armed';

  // «Взвод» только если секция ниже экрана и движение разрешено — иначе контент остаётся как в SSR.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const raf = requestAnimationFrame(() => {
      if (el.getBoundingClientRect().top <= window.innerHeight) return;
      const tpl = gridRef.current ? getComputedStyle(gridRef.current).gridTemplateColumns : '';
      setCols(Math.max(1, tpl.split(' ').filter(Boolean).length));
      setTyped(0);
      setArmed(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // typewriter: число символов анимирует framer-motion animate(), курсор мигает и гаснет после печати
  useEffect(() => {
    if (phase !== 'play') return;
    let hide: number | undefined;
    const controls = animate(0, title.length, {
      duration: (title.length * TYPE_MS_PER_CHAR) / 1000,
      ease: 'linear',
      onUpdate: (v) => setTyped(Math.round(v)),
      onComplete: () => { setTyped(null); hide = window.setTimeout(() => setCursorOff(true), 1800); },
    });
    return () => { controls.stop(); window.clearTimeout(hide); };
  }, [phase, title.length]);

  const state = phase === 'static' ? undefined : phase === 'armed' ? 'hidden' : 'shown';
  const shownChars = typed === null ? title.length : Math.min(typed, title.length);
  const cursor = phase === 'play' && !cursorOff;

  return (
    <section ref={ref} id="work" className="pl-section" aria-labelledby="pl-work-title">
      <div className="pl-section__head">
        <h2 id="pl-work-title" className="pl-h2 pl-title" aria-label={phase === 'static' ? undefined : title}>
          <span className="pl-title__mask">
            <span className="pl-title__line" aria-hidden={phase === 'static' ? undefined : true}>
              {phase === 'static' ? title : (
                <>
                  {title.slice(0, shownChars)}
                  {cursor && (
                    <motion.span
                      style={{ display: 'inline-block', width: '0.06em', height: '0.9em', marginRight: '-0.06em', verticalAlign: '-0.08em', background: 'var(--accent)' }}
                      animate={{ opacity: [1, 1, 0, 0] }}
                      transition={{ duration: 0.9, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  <span style={{ visibility: 'hidden' }}>{title.slice(shownChars)}</span>
                </>
              )}
            </span>
          </span>
        </h2>
        <motion.span initial={false} animate={state} variants={fade} custom={(title.length * TYPE_MS_PER_CHAR) / 1000}>
          <Link to={`/${lang}/portfolio`} viewTransition className="pl-link">{t('pl.work.all')}</Link>
        </motion.span>
      </div>
      <ul ref={gridRef} className="pl-work__grid">
        {work.map((p, i) => (
          <WorkCard key={p.slug} armed={armed} delay={(i % cols) * STAGGER_S + 0.1}>
            <ProjectCard project={p} lang={lang} />
          </WorkCard>
        ))}
      </ul>
    </section>
  );
}

/** Карточка: раскрывается из тонкой линии, когда сама входит в экран (на мобильном — по одной, на десктопе — рядом с каскадом). */
function WorkCard({ armed, delay, children }: { armed: boolean; delay: number; children: ReactNode }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const state = !armed ? undefined : inView ? 'shown' : 'hidden';
  return (
    <motion.li ref={ref} initial={false} animate={state} variants={card} custom={delay} style={{ position: 'relative' }}>
      {children}
      {armed && (
        <svg aria-hidden="true" width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <motion.rect width="100%" height="100%" rx={CARD_RADIUS} fill="none" stroke="var(--line-acc)" strokeWidth={1} variants={frame} custom={delay} />
        </svg>
      )}
    </motion.li>
  );
}
