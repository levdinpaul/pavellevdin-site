import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkle } from '@/components/layout/social-icons';
import { SCENE, SCENE_MEDIA, STEP_IMAGES } from './scene-data';
import type { SceneGL } from './scene-gl';

type Step = { title: string; text: string };

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Слова заголовка по отдельности — поэтапный «въезд» (только transform, см. .pl-word). Пробелы сохраняются. */
function Words({ text, from, className }: { text: string; from: number; className?: string }) {
  return (
    <>
      {text.split(/(s+)/).map((w, i) => (/^s+$/.test(w) || !w
        ? w
        : <span key={i} className={className ? `pl-word ${className}` : 'pl-word'} style={{ animationDelay: `${(from + i / 2) * 70}ms` }}>{w}</span>))}
    </>
  );
}

/**
 * Hero + «спиральная» сцена из 7 шагов.
 * SSR: статичный CSS-фон и весь текст шагов в HTML (читается без JS, индексируется).
 * Десктоп: sticky-кадр, скролл-драйвер пишет opacity/transform прямо в DOM (без ре-рендеров),
 * WebGL подгружается import()-ом после гидрации и idle. Мобайл/reduced-motion — статичный список (pl.css).
 */
export function SceneSection({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const steps = t('pl.scene.steps', { returnObjects: true }) as Step[];
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLOListElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);

  // Скролл-драйвер (только в «живом» режиме)
  useEffect(() => {
    const section = sectionRef.current, hero = heroRef.current, head = headRef.current, dots = dotsRef.current, list = stepsRef.current;
    if (!section || !hero || !head || !dots || !list) return;
    const mq = window.matchMedia(SCENE_MEDIA);
    const cards = Array.from(list.children) as HTMLElement[];
    const dotEls = Array.from(dots.children) as HTMLElement[];
    const span = (1 - SCENE.stepsStart) / cards.length;
    const ov = SCENE.overlap;
    let raf = 0;

    const reset = () => {
      [hero, head, dots, ...cards].forEach((el) => { el.style.opacity = ''; el.style.transform = ''; el.style.pointerEvents = ''; el.style.visibility = ''; });
    };

    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const p = range > 0 ? clamp(-r.top / range) : 0;
      progress.current = p;

      const f = clamp(p / SCENE.heroEnd);
      hero.style.opacity = String(1 - f);
      hero.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
      hero.style.visibility = f >= 1 ? 'hidden' : '';
      hero.style.pointerEvents = f > 0.4 ? 'none' : '';

      const h = clamp((p - SCENE.stepsStart + 0.02) / 0.04);
      head.style.opacity = String(h);
      dots.style.opacity = String(h);

      let active = -1;
      cards.forEach((el, i) => {
        const u = (p - (SCENE.stepsStart + i * span)) / span; // 0…1 — «своё» окно шага
        const last = i === cards.length - 1;
        let o = 0, y = 48, s = 0.96;
        if (u >= -ov && u < ov) { const k = (u + ov) / (2 * ov); o = k; y = 48 * (1 - k); s = 0.96 + 0.04 * k; }
        else if (u >= ov && (u <= 1 - ov || last)) { o = 1; y = 0; s = 1; }
        else if (u > 1 - ov && u <= 1 + ov) { const k = (u - (1 - ov)) / (2 * ov); o = 1 - k; y = -48 * k; s = 1; }
        if (u >= 0 && (u < 1 || last)) active = i;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, calc(-50% + ${y.toFixed(1)}px), 0) scale(${s.toFixed(3)})`;
        el.style.visibility = o < 0.01 ? 'hidden' : '';
      });
      dotEls.forEach((d, i) => { d.dataset.active = String(i === active); });
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const attach = () => {
      if (mq.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        reset();
      }
    };
    attach();
    mq.addEventListener('change', attach);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      mq.removeEventListener('change', attach);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // WebGL — лениво и только в «живом» режиме: по первому взаимодействию (скролл/мышь/касание/клавиша)
  // или через 8 с простоя. До этого первый кадр — статичный CSS-фон; загрузку не блокирует (TBT).
  useEffect(() => {
    const canvas = canvasRef.current, section = sectionRef.current;
    if (!canvas || !section || !window.matchMedia(SCENE_MEDIA).matches) return;
    let gl: SceneGL | null = null, cancelled = false, started = false;
    const events = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    const start = () => {
      if (started) return;
      started = true;
      events.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      import('./scene-gl').then((m) => {
        if (!cancelled) gl = m.createSceneGL(canvas, section, () => progress.current);
      }).catch(() => { /* без WebGL остаётся CSS-фон */ });
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 }); else start();
    }, 8000);
    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      gl?.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="pl-scene" aria-labelledby="pl-hero-title">
      <div className="pl-stage">
        <div className="pl-stars" aria-hidden="true" />
        <canvas ref={canvasRef} className="pl-gl" aria-hidden="true" />
        <div className="pl-glow" aria-hidden="true" />
        <div className="pl-fade" aria-hidden="true" />

        <div ref={heroRef} className="pl-hero">
          <span className="pl-badge"><span className="pl-badge__dot" aria-hidden="true" />{t('pl.hero.badge')}</span>
          <p className="pl-eyebrow pl-hero__eyebrow">{t('pl.hero.eyebrow')}</p>
          <h1 id="pl-hero-title" className="pl-hero__title">
            <Words text={t('pl.hero.titleA')} from={0} />
            <Words text={t('pl.hero.titleAccent')} from={4} className="pl-accent" />
            <Words text={t('pl.hero.titleB')} from={7} />
          </h1>
          <p className="pl-hero__lead">{t('pl.hero.lead')}</p>
          <div className="pl-hero__actions">
            <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary">{t('pl.hero.primary')}</Link>
            <Link to={`/${lang}#work`} className="pl-btn pl-btn--ghost">{t('pl.hero.secondary')}</Link>
          </div>
          <p className="pl-hero__scroll" aria-hidden="true">{t('pl.hero.scroll')}</p>
        </div>

        <div ref={headRef} className="pl-scene__head">
          <p className="pl-eyebrow">{t('pl.scene.eyebrow')}</p>
          <h2 className="pl-scene__title">{t('pl.scene.title')}</h2>
        </div>

        <ol ref={stepsRef} className="pl-steps">
          {steps.map((s, i) => {
            const img = STEP_IMAGES[i];
            return (
              <li key={s.title} className="pl-step">
                <div className="pl-step__head">
                  <Sparkle />
                  <span className="pl-step__num">{String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
                </div>
                <article className="pl-step__card">
                  {img && (
                    <div className="pl-step__media">
                      <img
                        src={`/images/scene/${img}-960.webp`}
                        srcSet={`/images/scene/${img}-480.webp 480w, /images/scene/${img}-960.webp 960w`}
                        sizes="(max-width: 767px) calc(100vw - 60px), 400px"
                        width={960}
                        height={540}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="pl-step__body">
                    <h3 className="pl-step__title">{s.title}</h3>
                    <p className="pl-step__text">{s.text}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <ol ref={dotsRef} className="pl-dots" aria-hidden="true">
          {steps.map((s) => <li key={s.title} data-active="false" />)}
        </ol>
      </div>
    </section>
  );
}
