import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SceneGL } from './scene-gl';
import { stackFor } from '@/data/stack';
import { clamp, fallbackSpiral, FINALE, FLIGHT, HERO_END, smoothstep } from './scene-model';
import './scene.css';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
/** .pl-tech is set at twice its median size; scaling down keeps near labels sharp. */
const LABEL_SCALE = 0.5;
const SPIRAL_PATH = fallbackSpiral(0);
const SECONDARY_PATH = fallbackSpiral(Math.PI);

/**
 * Native scrolling drives one shared camera for the filaments and HTML type.
 * The section becomes tall only after WebGL succeeds. SSR, reduced motion and
 * graphics failures therefore retain a compact, useful hero and working links.
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
    let graphics: SceneGL | null = null;
    let disposed = false;
    let armed = false;
    let loading = false;
    let generation = 0;
    let frame = 0;
    const initialBounds = section.getBoundingClientRect();
    let visible = initialBounds.top < window.innerHeight && initialBounds.bottom > 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastTime = 0;

    const measureProgress = () => {
      const bounds = section.getBoundingClientRect();
      const range = bounds.height - stage.clientHeight;
      // On very short screens, let the whole opening frame scroll into view
      // before starting the flight. Viewport size never disables the animation.
      const introScroll = Math.max(0, stage.clientHeight - window.innerHeight);
      targetProgress = range > 0 ? clamp((-bounds.top - introScroll) / range) : 0;
    };

    const reset = () => {
      generation += 1;
      loading = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      graphics?.dispose();
      graphics = null;
      delete section.dataset.motion;
      hero.removeAttribute('style');
      hero.inert = false;
      controls.removeAttribute('style');
      controls.inert = true;
      finale.removeAttribute('style');
      labelElements.forEach((element) => element.removeAttribute('style'));
    };

    const draw = (time: number) => {
      frame = 0;
      if (!graphics || !visible || document.hidden || disposed) return;
      const elapsed = Math.min(64, Math.max(1, time - (lastTime || time - 16)));
      lastTime = time;
      // Soft follow (≈ lerp 0.06 per 60 Hz frame): the flight trails the scroll a little instead of jumping.
      currentProgress += (targetProgress - currentProgress) * (1 - Math.exp(-elapsed / 260));
      if (Math.abs(targetProgress - currentProgress) < 0.00015) currentProgress = targetProgress;

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

      const positions = graphics.render(currentProgress, time / 1000);
      positions.forEach(({ x, y, scale, opacity }, index) => {
        const element = labelElements[index];
        if (opacity < 0.01 && element.style.visibility === 'hidden') return;
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(scale * LABEL_SCALE).toFixed(4)})`;
        element.style.opacity = opacity.toFixed(3);
        element.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
      });

      // Quiet idle spin: keep drawing while the section is on screen (paused when hidden or scrolled away).
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

    const activate = async () => {
      if (disposed || !armed || loading || graphics || !media.matches || !visible) return;
      loading = true;
      const request = ++generation;
      try {
        const module = await import('./scene-gl');
        if (disposed || request !== generation || !media.matches) return;
        graphics = module.createSceneGL(canvas, labelCount, reset);
        if (!graphics) return;
        // The section grows when it goes live. If the reader has already scrolled past the
        // compact hero, keep the content they are looking at in place.
        // Scroll anchoring is off for this one jump and the jump is instant (html has smooth scrolling),
        // otherwise the browser and this code both compensate, or the compensation animates across the page.
        const before = section.getBoundingClientRect();
        const pastHero = -before.top > before.height - window.innerHeight;
        const root = document.documentElement;
        if (pastHero) root.style.overflowAnchor = 'none';
        section.dataset.motion = 'live';
        if (pastHero) {
          window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().height - before.height, behavior: 'instant' });
          requestAnimationFrame(() => root.style.removeProperty('overflow-anchor'));
        }
        graphics.resize();
        measureProgress();
        currentProgress = targetProgress;
        schedule();
      } catch {
        // The default server-rendered hero remains fully useful if the chunk or GPU fails.
        if (request === generation) reset();
      } finally {
        if (request === generation) loading = false;
      }
    };

    const onMotionChange = () => {
      reset();
      if (media.matches) void activate();
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
        if (!graphics) void activate();
        else onScroll();
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '80px 0px' });
    observer.observe(section);

    // Three.js (~500 KB) waits for the first interaction or 8 s of quiet, so it never
    // competes with the first paint and hydration. Until then the SVG spiral is shown.
    const wakeEvents = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchstart', 'keydown'] as const;
    let wakeTimer = 0;
    const arm = () => {
      if (armed) return;
      armed = true;
      wakeEvents.forEach((name) => window.removeEventListener(name, arm));
      window.clearTimeout(wakeTimer);
      void activate();
    };
    wakeEvents.forEach((name) => window.addEventListener(name, arm, { passive: true }));
    wakeTimer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(arm, { timeout: 2000 }); else arm();
    }, 8000);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(stage);
    controls.inert = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    media.addEventListener('change', onMotionChange);

    return () => {
      disposed = true;
      wakeEvents.forEach((name) => window.removeEventListener(name, arm));
      window.clearTimeout(wakeTimer);
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
        <svg className="pl-scene__fallback" viewBox="0 0 1440 900" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <path d={SPIRAL_PATH} stroke="currentColor" strokeWidth="1" />
          <path d={SECONDARY_PATH} stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
        </svg>
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
