import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createScene2D, type Scene2D } from './scene-2d';
import { stackFor } from '@/data/stack';
import { clamp, FINALE, FLIGHT, HERO_END, smoothstep, staticDustPaths } from './scene-model';
import './scene.css';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
/** .pl-tech is set at twice its median size; scaling down keeps near labels sharp. */
const LABEL_SCALE = 0.5;
/** Frame interval of the quiet spin at rest: ~30 fps, phones ~24 fps (scroll-driven frames are not limited). */
const IDLE_FRAME_MS = 33;
const IDLE_FRAME_MS_MOBILE = 42;
/** The opening frame of the dust, rendered into the HTML so the first screen has the spiral before any JS. */
const STATIC_DUST = staticDustPaths();

/**
 * Native scrolling drives one shared camera for the canvas dust and HTML type.
 * The section becomes tall right after hydration once the 2D canvas is up. SSR, reduced motion
 * and canvas failures therefore retain a compact, useful hero and working links.
 */
export function SceneSection({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const stack = stackFor(lang);
  const labelCount = stack.length;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const labels = labelsRef.current;
    const controls = controlsRef.current;
    const finale = finaleRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !hero || !labels || !controls || !finale || !canvas) return;

    const media = window.matchMedia(MOTION_QUERY);
    const labelElements = Array.from(labels.children) as HTMLElement[];
    let graphics: Scene2D | null = null;
    let disposed = false;
    let frame = 0;
    // No layout reads during hydration: the observer corrects this before the second frame.
    let visible = true;
    let pendingMeasure = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastTime = 0;
    let overlayProgress = -1;
    let lastPaint = 0;
    let idleSpin = false;
    let idleHandle = 0;
    let initFrame = 0;
    let initHandle = 0;
    let labelsReady = false;
    const idleFrameMs = window.innerWidth < 768 ? IDLE_FRAME_MS_MOBILE : IDLE_FRAME_MS;

    const measureProgress = () => {
      const bounds = section.getBoundingClientRect();
      const range = bounds.height - stage.clientHeight;
      // On very short screens, let the whole opening frame scroll into view
      // before starting the flight. Viewport size never disables the animation.
      const introScroll = Math.max(0, stage.clientHeight - window.innerHeight);
      targetProgress = range > 0 ? clamp((-bounds.top - introScroll) / range) : 0;
    };

    const cancelInit = () => {
      cancelAnimationFrame(initFrame);
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(initHandle);
      clearTimeout(initHandle);
      initFrame = 0;
      initHandle = 0;
    };

    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      cancelInit();
      labelsReady = false;
      graphics = null;
      delete canvas.dataset.ready;
      delete document.documentElement.dataset.scene;
      hero.removeAttribute('style');
      hero.inert = false;
      controls.removeAttribute('style');
      controls.inert = true;
      finale.removeAttribute('style');
      overlayProgress = -1;
      lastPaint = 0;
      labelElements.forEach((element) => element.removeAttribute('style'));
    };

    const draw = (time: number) => {
      frame = 0;
      if (!graphics || !visible || document.hidden || disposed) return;
      const elapsed = Math.min(64, Math.max(1, time - (lastTime || time - 16)));
      lastTime = time;
      if (pendingMeasure) {
        // Measured inside the frame, where layout is computed anyway, not in the hydration task.
        pendingMeasure = false;
        graphics.resize();
        measureProgress();
        currentProgress = targetProgress;
      }
      // Soft follow (≈ lerp 0.06 per 60 Hz frame): the flight trails the scroll a little instead of jumping.
      currentProgress += (targetProgress - currentProgress) * (1 - Math.exp(-elapsed / 260));
      if (Math.abs(targetProgress - currentProgress) < 0.00015) currentProgress = targetProgress;

      // While the reader scrolls every frame is drawn. At rest the quiet spin runs at ~30 fps and only once
      // the page has settled after load, so it never competes with hydration and the first paint.
      if (currentProgress === targetProgress && currentProgress === overlayProgress && lastPaint) {
        if (!idleSpin) return;
        if (time - lastPaint < idleFrameMs) {
          frame = requestAnimationFrame(draw);
          return;
        }
      }
      lastPaint = time;

      // Overlay copy only changes with progress: in the idle spin it is not touched at all.
      if (currentProgress !== overlayProgress) {
        overlayProgress = currentProgress;
        const heroOpacity = 1 - smoothstep(0.01, HERO_END, currentProgress);
        hero.style.opacity = heroOpacity.toFixed(3);
        hero.style.transform = `translate3d(0, ${(-28 * (1 - heroOpacity)).toFixed(2)}px, 0)`;
        hero.style.visibility = heroOpacity < 0.01 ? 'hidden' : 'visible';
        hero.inert = heroOpacity < 0.08;
        const controlsOpacity = smoothstep(HERO_END, 0.15, currentProgress) * (1 - smoothstep(FLIGHT[1] - 0.025, FLIGHT[1], currentProgress));
        controls.style.opacity = controlsOpacity.toFixed(3);
        controls.style.visibility = controlsOpacity < 0.01 ? 'hidden' : 'visible';
        controls.inert = controlsOpacity < 0.5;
        const finaleOpacity = smoothstep(FINALE[0], FINALE[1], currentProgress);
        finale.style.opacity = finaleOpacity.toFixed(3);
        finale.style.transform = `scale(${(0.96 + 0.04 * finaleOpacity).toFixed(4)})`;
        finale.style.visibility = finaleOpacity < 0.01 ? 'hidden' : 'visible';
      }

      // The first frame is dust only; the names join from the next one.
      const positions = graphics.render(currentProgress, time / 1000, labelsReady);
      if (!labelsReady) {
        labelsReady = true;
        frame = requestAnimationFrame(draw);
        return;
      }
      positions.forEach(({ x, y, scale, opacity }, index) => {
        const element = labelElements[index];
        if (opacity < 0.01 && element.style.visibility === 'hidden') return;
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(scale * LABEL_SCALE).toFixed(4)})`;
        element.style.opacity = opacity.toFixed(3);
        element.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
      });

      // Keep drawing while the section is on screen (paused when hidden or scrolled away).
      frame = requestAnimationFrame(draw);
    };

    const schedule = () => {
      if (!graphics || !visible || document.hidden || disposed || frame) return;
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      if (!graphics) return;
      measureProgress();
      schedule();
    };

    const onResize = () => {
      if (!graphics) return;
      graphics.resize();
      measureProgress();
      schedule();
    };

    const activate = () => {
      if (disposed || graphics || initFrame || initHandle || !media.matches) return;
      // The canvas is created after the first paint, in an idle slot (at most 300 ms later), so hydration stays short.
      initFrame = requestAnimationFrame(() => {
        initFrame = 0;
        initHandle = typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(start, { timeout: 300 })
          : window.setTimeout(start, 50);
      });
    };

    const start = () => {
      initHandle = 0;
      if (disposed || graphics || !media.matches) return;
      graphics = createScene2D(canvas, labelCount);
      if (!graphics) return;
      // The tall scroll geometry is normally switched on by the inline script in index.html before the first
      // paint, so going live changes no layout. Otherwise (reduced motion turned off later) the section grows here:
      // if the reader has already scrolled past the compact hero, keep the content they are looking at in place.
      // Scroll anchoring is off for this one jump and the jump is instant (html has smooth scrolling),
      // otherwise the browser and this code both compensate, or the compensation animates across the page.
      const root = document.documentElement;
      if (root.dataset.scene !== 'live') {
        const before = section.getBoundingClientRect();
        const pastHero = -before.top > before.height - window.innerHeight;
        if (pastHero) root.style.overflowAnchor = 'none';
        root.dataset.scene = 'live';
        if (pastHero) {
          window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().height - before.height, behavior: 'instant' });
          requestAnimationFrame(() => root.style.removeProperty('overflow-anchor'));
        }
      }
      pendingMeasure = true;
      schedule();
    };

    const onMotionChange = () => {
      reset();
      activate();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      } else {
        onScroll();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        onScroll();
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '80px 0px' });
    observer.observe(section);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(stage);
    controls.inert = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    media.addEventListener('change', onMotionChange);
    // Starts right after hydration (next frame + idle slot ≤ 300 ms): no waiting for interaction.
    activate();
    const startIdleSpin = () => {
      idleSpin = true;
      schedule();
    };
    const whenSettled = () => {
      // Safari has no requestIdleCallback.
      idleHandle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(startIdleSpin, { timeout: 1500 })
        : setTimeout(startIdleSpin, 600);
    };
    if (document.readyState === 'complete') whenSettled();
    else window.addEventListener('load', whenSettled, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', whenSettled);
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle);
      clearTimeout(idleHandle);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      media.removeEventListener('change', onMotionChange);
      reset();
    };
  }, [labelCount]);

  return (
    <section ref={sectionRef} className="pl-scene" aria-labelledby="pl-hero-title">
      <div ref={stageRef} className="pl-stage">
        <div className="pl-scene__atmosphere" aria-hidden="true" />
        <div className="pl-scene__fallback" aria-hidden="true">
          <svg viewBox="-1800 -1800 3600 3600" fill="none">
            {STATIC_DUST.map(({ opacity, d }) => (
              <path key={opacity} d={d} stroke="currentColor" strokeOpacity={opacity} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </div>
        <canvas ref={canvasRef} className="pl-gl" aria-hidden="true" />
        <div className="pl-scene__vignette" aria-hidden="true" />

        <div ref={heroRef} className="pl-hero">
          <div className="pl-hero__copy">
            <p className="pl-hero__eyebrow">{t('pl.hero.eyebrow')}</p>
            <h1 id="pl-hero-title" className="pl-hero__title">
              <span>{t('pl.hero.titleLine1')}</span>{' '}
              <span>{t('pl.hero.titleLine2')}</span>
            </h1>
            <p className="pl-hero__lead">{t('pl.hero.lead')}</p>
            <div className="pl-hero__actions">
              <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary" data-magnetic="">{t('pl.hero.primary')}<span aria-hidden="true">↗</span></Link>
              <a href="#work" className="pl-hero__secondary">{t('pl.hero.secondary')}<span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <p className="pl-hero__scroll" aria-hidden="true"><span />{t('pl.hero.scroll')}</p>
          <ul className="pl-tech-fallback" aria-hidden="true">
            {stack.filter((item) => item.key).map((item) => <li key={item.name}>{item.name}</li>)}
          </ul>
          <ul className="pl-visually-hidden" aria-label={t('pl.scene.label')}>
            {stack.map((item) => <li key={item.name}>{item.name}</li>)}
          </ul>
        </div>

        <div ref={labelsRef} className="pl-tech-cloud" aria-hidden="true">
          {stack.map((item) => (
            <span key={item.name} className="pl-tech" data-key={item.key ? 'true' : undefined}>{item.name}</span>
          ))}
        </div>
        <div ref={finaleRef} className="pl-scene__finale">
          <p>{t('pl.scene.finaleLabel')}</p>
          <h2 className="pl-scene__finale-title">{t('pl.scene.finaleA')} <span>{t('pl.scene.finaleB')}</span></h2>
        </div>
        <div ref={controlsRef} className="pl-scene__controls">
          <p>{t('pl.scene.label')}</p>
          <a href="#work">{t('pl.scene.skip')}<span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}
