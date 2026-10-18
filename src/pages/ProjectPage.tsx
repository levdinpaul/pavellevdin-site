import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { isOnline, projectCopy, projectImages, projects } from '@/data/projects';
import { PageMeta } from '@/components/pl/PageMeta';
import { SITE, breadcrumbs } from '@/components/pl/seo';
import { useReveal } from '@/sections/scena/useReveal';

/** Страница кейса /:lang/portfolio/:slug — скриншоты реального сайта, Задача → Решение → Что сделано. */
export function ProjectPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const root = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Параллакс скриншота + прогресс чтения — пишем transform напрямую (без ре-рендеров)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      // мягкий параллакс-zoom скриншота (без сдвига — не открывает пустую полосу под картинкой)
      if (!reduced && shot.current) shot.current.style.transform = `scale(${(1 + Math.min(window.scrollY, 600) * 0.0001).toFixed(4)})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [slug]);

  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return <Navigate to={`/${lang}/portfolio`} replace />;
  const p = projects[idx];
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const copy = projectCopy(p, lang);
  const img = projectImages(p.slug);
  const status = p.status === 'preview' ? 'preview' : isOnline(p.slug) ? 'live' : 'offline';
  const path = `/portfolio/${p.slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: p.title,
      description: copy.summary,
      url: `${SITE}/${lang}${path}`,
      image: `${SITE}${img.desktop}`,
      inLanguage: lang,
      keywords: p.stack.join(', '),
      creator: { '@type': 'Person', name: 'Pavel Levdin', url: `${SITE}/${lang}/about` },
      ...(status !== 'preview' ? { sameAs: p.url } : {}),
    },
    breadcrumbs(lang, [{ name: 'PL Innovativ Digitalbau', path: '' }, { name: t('pl.portfolio.title'), path: '/portfolio' }, { name: p.title, path }]),
  ];

  return (
    <>
      <PageMeta lang={lang} path={path} title={`${p.title} — ${t('pl.project.metaSuffix')}`} description={copy.summary} image={img.desktop} jsonLd={jsonLd} />
      <div className="pl-readbar" aria-hidden="true"><div ref={bar} /></div>

      <div ref={root} className="pl-page" style={{ viewTransitionName: 'pl-page' }}>
        <section className="pl-container pl-case-hero">
          <Link to={`/${lang}/portfolio`} className="pl-link pl-case-hero__back">{t('pl.project.back')}</Link>
          <p className="pl-eyebrow">{t(`pl.portfolio.filters.${p.category}`)}</p>
          <h1 className="pl-page__title">{p.title}</h1>
          <p className="pl-lead">{copy.summary}</p>
          <div className="pl-case-hero__meta">
            <span className="pl-status pl-status--inline" data-status={status}>{t(`pl.portfolio.status.${status}`)}</span>
            <a href={p.url} target="_blank" rel="noopener" className="pl-btn pl-btn--primary">{t('pl.project.open')} ↗</a>
          </div>
          {p.status === 'preview' && <p className="pl-note">{t('pl.project.previewNote')}</p>}
        </section>

        <section className="pl-container">
          <div className="pl-viewtoggle" role="group" aria-label={t('pl.project.gallery')}>
            <button type="button" className="pl-chip" aria-pressed={view === 'desktop'} onClick={() => setView('desktop')}>{t('pl.project.desktop')}</button>
            <button type="button" className="pl-chip" aria-pressed={view === 'mobile'} onClick={() => setView('mobile')}>{t('pl.project.mobile')}</button>
          </div>
          <div className="pl-case-shot" data-view={view}>
            <div ref={shot} className="pl-case-shot__inner">
              {view === 'desktop'
                ? <img src={img.desktop} width={1200} height={750} alt={`${t('pl.project.shotAlt')} ${p.title}`} fetchPriority="high" decoding="async" />
                : <img src={img.mobile} width={390} height={844} alt={`${t('pl.project.shotAlt')} ${p.title} — ${t('pl.project.mobile')}`} decoding="async" />}
            </div>
          </div>
        </section>

        <section className="pl-container pl-section pl-case-grid">
          <div className="pl-tile" data-reveal="">
            <p className="pl-eyebrow">{t('pl.project.task')}</p>
            <p className="pl-case-text">{copy.task}</p>
          </div>
          <div className="pl-tile" data-reveal="">
            <p className="pl-eyebrow">{t('pl.project.solution')}</p>
            <p className="pl-case-text">{copy.solution}</p>
          </div>
          <div className="pl-tile pl-case-grid__wide" data-reveal="">
            <p className="pl-eyebrow">{t('pl.project.done')}</p>
            <ul className="pl-checklist pl-checklist--cols">{copy.done.map((d) => <li key={d}>{d}</li>)}</ul>
            <p className="pl-eyebrow pl-case-stack">{t('pl.project.stack')}</p>
            <ul className="pl-tags">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </section>

        <section className="pl-container pl-section" aria-label={t('pl.project.gallery')}>
          <h2 className="pl-h2 pl-mb" data-reveal="">{t('pl.project.gallery')}</h2>
          <div className="pl-gallery">
            <figure className="pl-gallery__wide" data-reveal=""><img src={img.desktop2} width={1200} height={750} alt={`${t('pl.project.shotAlt')} ${p.title}`} loading="lazy" decoding="async" /></figure>
            <figure className="pl-gallery__phone" data-reveal=""><img src={img.mobile} width={390} height={844} alt={`${t('pl.project.shotAlt')} ${p.title} — ${t('pl.project.mobile')}`} loading="lazy" decoding="async" /></figure>
          </div>
        </section>

        <nav className="pl-container pl-section pl-case-nav" aria-label={t('pl.portfolio.title')}>
          <Link to={`/${lang}/portfolio/${prev.slug}`} viewTransition className="pl-tile pl-case-nav__link">
            <span className="pl-eyebrow">← {t('pl.project.prev')}</span><span className="pl-tile__title">{prev.title}</span>
          </Link>
          <Link to={`/${lang}/portfolio/${next.slug}`} viewTransition className="pl-tile pl-case-nav__link pl-case-nav__link--next">
            <span className="pl-eyebrow">{t('pl.project.next')} →</span><span className="pl-tile__title">{next.title}</span>
          </Link>
        </nav>

        <section className="pl-container pl-section">
          <div className="pl-cta-box" data-reveal="">
            <h2 className="pl-h2">{t('pl.project.ctaTitle')}</h2>
            <p className="pl-lead">{t('pl.project.ctaLead')}</p>
            <div className="pl-cta__actions">
              <Link to={`/${lang}/brief`} className="pl-btn pl-btn--primary">{t('pl.project.ctaButton')}</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
