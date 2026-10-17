import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { SectionHeader } from '@/components/ds/SectionHeader';
import { ServiceCard } from '@/components/ds/ServiceCard';
import { ProjectCard } from '@/components/ds/ProjectCard';
import { Counter } from '@/components/ds/Counter';
import { BlueprintFrame } from '@/components/ds/BlueprintFrame';
import { BuildSection } from './BuildSection';
import { HOME_COPY, type HomeCopy } from './home-copy';

/* Self-assembling wireframe (SVG draw-in) */
function HeroWireframe() {
  return (
    <svg viewBox="0 0 460 360" style={{ width: '100%', maxWidth: 520, display: 'block' }} aria-hidden="true">
      <rect x="10" y="10" width="440" height="340" rx="10" className="wf-draw" style={{ animationDelay: '0.1s' }} />
      <line x1="10" y1="46" x2="450" y2="46" className="wf-draw" style={{ animationDelay: '0.5s' }} />
      <circle cx="30" cy="28" r="4" className="wf-dot" style={{ animationDelay: '0.7s' }} />
      <circle cx="46" cy="28" r="4" className="wf-dot" style={{ animationDelay: '0.8s' }} />
      <circle cx="62" cy="28" r="4" className="wf-dot" style={{ animationDelay: '0.9s' }} />
      <rect x="150" y="18" width="160" height="20" rx="10" className="wf-draw" style={{ animationDelay: '1.0s' }} />
      <rect x="34" y="70" width="230" height="16" rx="3" className="wf-fill" style={{ animationDelay: '1.3s' }} />
      <rect x="34" y="94" width="180" height="16" rx="3" className="wf-fill" style={{ animationDelay: '1.45s' }} />
      <rect x="34" y="122" width="120" height="10" rx="3" className="wf-draw" style={{ animationDelay: '1.6s' }} />
      <rect x="34" y="146" width="72" height="24" rx="6" className="wf-accent" style={{ animationDelay: '1.8s' }} />
      <rect x="116" y="146" width="72" height="24" rx="6" className="wf-draw" style={{ animationDelay: '1.9s' }} />
      <rect x="290" y="70" width="136" height="100" rx="8" className="wf-draw" style={{ animationDelay: '1.5s' }} />
      <line x1="290" y1="170" x2="426" y2="70" className="wf-draw" style={{ animationDelay: '1.7s' }} />
      <rect x="34" y="196" width="120" height="80" rx="8" className="wf-draw" style={{ animationDelay: '2.0s' }} />
      <rect x="170" y="196" width="120" height="80" rx="8" className="wf-draw" style={{ animationDelay: '2.15s' }} />
      <rect x="306" y="196" width="120" height="80" rx="8" className="wf-glow" style={{ animationDelay: '2.3s' }} />
      <line x1="34" y1="300" x2="426" y2="300" className="wf-draw" style={{ animationDelay: '2.5s' }} />
      <rect x="34" y="314" width="90" height="8" rx="3" className="wf-fill" style={{ animationDelay: '2.65s' }} />
      <text x="34" y="62" className="wf-label" style={{ animationDelay: '2.8s' }}>HERO · 1280×640</text>
      <text x="306" y="290" className="wf-label" style={{ animationDelay: '3.0s' }}>CARD · LIT</text>
    </svg>
  );
}

function Hero({ copy, go }: { copy: HomeCopy; go: (p: string) => void }) {
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const onMove = (e: React.MouseEvent) => {
    setMx((e.clientX / window.innerWidth - 0.5) * 2);
    setMy((e.clientY / window.innerHeight - 0.5) * 2);
  };
  return (
    <section
      id="hero"
      onMouseMove={onMove}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
        padding: '120px var(--section-padding-x) 80px',
        backgroundImage: 'var(--bg-grid)', backgroundSize: 'var(--grid-size) var(--grid-size)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--bg-0) 18%, rgba(6,8,16,0.55) 55%, rgba(6,8,16,0.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 68% 45%, rgba(69,196,255,0.07), transparent 65%)' }} />
      <div className="hero-grid" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="rise" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge>Hannover · DE EN RU</Badge>
            <Badge tone="neutral">Bauplan Rev. 2.0</Badge>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: 'var(--ink-1)', margin: 0 }}>
            {copy.heroLine1}<br />
            <span className="hero-outline">{copy.heroLine2}</span><br />
            <span style={{ color: 'var(--accent)' }}>{copy.heroLine3}</span>
          </h1>
          <p className="rise" style={{ margin: 0, fontSize: 'var(--text-lg)', lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: '46ch' }}>{copy.heroLead}</p>
          <div className="rise" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => go('/brief')}>{copy.heroCta} →</Button>
            <Button variant="secondary" onClick={() => go('/portfolio')}>{copy.heroCta2}</Button>
          </div>
          <p className="rise" style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            ↓ {copy.scrollHint} <span style={{ color: 'var(--accent)' }}>0% → 100%</span>
          </p>
        </div>
        <div className="hero-wireframe" style={{ transform: `translate(${mx * -10}px, ${my * -8}px)`, transition: 'transform 400ms var(--ease-out)' }}>
          <HeroWireframe />
        </div>
      </div>
    </section>
  );
}

const STACK_NODES = [
  { label: 'Next.js', a: -90, r: 150 }, { label: 'React', a: -38, r: 170 },
  { label: 'TypeScript', a: 12, r: 155 }, { label: 'Tailwind', a: 58, r: 175 },
  { label: 'GSAP', a: 105, r: 150 }, { label: 'Node.js', a: 150, r: 172 },
  { label: 'PostgreSQL', a: 196, r: 158 }, { label: 'Automation', a: 232, r: 178 },
];

export function HomeScene() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as 'de' | 'en' | 'ru';
  const copy = HOME_COPY[lang];
  const go = (p: string) => navigate(`/${lang}${p}`);

  const projects = [
    { title: 'MP Innovativbau', category: 'Corporate · Konfigurator', image: '/images/projects/mpinnovativ.webp', stat: 'Next.js', description: copy.project1, tags: ['Next.js', 'Strapi', 'SEO'], href: 'https://mp-innovativbau.de', span: true },
    { title: 'Delimes', category: 'Corporate · Agentur', image: '/images/projects/delimes.webp', stat: 'Live', description: copy.project2, tags: ['React', 'TypeScript'], href: 'https://delimes.ru', span: false },
    { title: 'Anapa Manipulator', category: 'Landing · SEO', image: '/images/projects/manipulator.webp', stat: 'SEO', description: copy.project3, tags: ['SEO/AEO', 'Analytics'], href: 'https://anapa-manipulyator.ru', span: false },
  ];

  return (
    <>
      <Hero copy={copy} go={go} />

      {/* 01 — About / Positioning */}
      <BuildSection id="about" label={copy.aboutEyebrow}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <SectionHeader index="01" eyebrow={copy.aboutEyebrow} title={copy.aboutTitle} lead={copy.aboutLead} />
          <BlueprintFrame label="Profil · P-01" coords="Hannover · 52.37°N" padding={28}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>{copy.aboutText}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Badge tone="neutral">Full-Stack</Badge>
                <Badge tone="neutral">1 Ansprechpartner</Badge>
                <Badge>Lighthouse 100</Badge>
              </div>
            </div>
          </BlueprintFrame>
        </div>
      </BuildSection>

      {/* 02 — Services */}
      <BuildSection id="services" label={copy.servicesEyebrow} style={{ background: 'var(--bg-1)' }}>
        <SectionHeader index="02" eyebrow={copy.servicesEyebrow} title={copy.servicesTitle} lead={copy.servicesLead} style={{ marginBottom: 48 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {copy.services.map((s) => (
            <ServiceCard key={s.index} index={s.index} title={s.title} description={s.description} deliverables={s.deliverables} />
          ))}
        </div>
      </BuildSection>

      {/* 03 — Portfolio */}
      <BuildSection id="work" label={copy.workEyebrow}>
        <SectionHeader index="03" eyebrow={copy.workEyebrow} title={copy.workTitle} lead={copy.workLead} style={{ marginBottom: 48 }} />
        <div className="work-grid" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 22 }}>
          {projects.map((p) => (
            <ProjectCard
              key={p.title}
              title={p.title} category={p.category} image={p.image} stat={p.stat}
              description={p.description} tags={p.tags} href={p.href}
              style={p.span ? { gridRow: 'span 2', aspectRatio: 'auto' } : undefined}
            />
          ))}
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => go('/portfolio')}>{copy.workCta} →</Button>
        </div>
      </BuildSection>

      {/* 04 — Tech stack: orbiting nodes */}
      <BuildSection id="stack" label={copy.stackEyebrow} style={{ background: 'var(--bg-1)' }}>
        <SectionHeader index="04" eyebrow={copy.stackEyebrow} title={copy.stackTitle} align="center" style={{ marginBottom: 24, alignItems: 'center' }} />
        <div style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="-240 -240 480 480" style={{ position: 'absolute', width: 480, height: 480, maxWidth: '100%' }} aria-hidden="true">
            <circle cx="0" cy="0" r="160" fill="none" stroke="var(--line-blueprint-faint)" strokeDasharray="3 6" />
            <circle cx="0" cy="0" r="120" fill="none" stroke="var(--line-blueprint-faint)" strokeDasharray="3 6" />
            {STACK_NODES.map((n) => {
              // Округляем: Math.cos(-90°)≈6e-15 → координата в научной нотации, которую
              // SSR и браузерный DOM сериализуют по-разному → hydration attribute mismatch.
              const x = Math.round(Math.cos((n.a * Math.PI) / 180) * n.r * 100) / 100;
              const y = Math.round(Math.sin((n.a * Math.PI) / 180) * n.r * 100) / 100;
              return <line key={n.label} x1="0" y1="0" x2={x} y2={y} stroke="var(--line-blueprint-faint)" />;
            })}
          </svg>
          <div className="orbit" style={{ position: 'absolute', width: 480, height: 480, maxWidth: '100%' }}>
            {STACK_NODES.map((n) => {
              const x = Math.round(Math.cos((n.a * Math.PI) / 180) * n.r * 100) / 100;
              const y = Math.round(Math.sin((n.a * Math.PI) / 180) * n.r * 100) / 100;
              return (
                <span key={n.label} className="orbit-counter" style={{ position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}>
                  <Badge tone="neutral" style={{ background: 'var(--bg-2)', boxShadow: 'var(--shadow-card)' }}>{n.label}</Badge>
                </span>
              );
            })}
          </div>
          <div style={{ position: 'relative', width: 108, height: 108, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--accent-ring)', boxShadow: 'var(--shadow-glow-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ink-1)' }}>PL<span style={{ color: 'var(--accent)' }}>·</span>D</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', color: 'var(--ink-3)' }}>FULL-STACK</span>
          </div>
        </div>
      </BuildSection>

      {/* 05 — Process 01–05 + counters */}
      <BuildSection id="process" label={copy.processEyebrow}>
        <SectionHeader index="05" eyebrow={copy.processEyebrow} title={copy.processTitle} style={{ marginBottom: 48 }} />
        <ol className="process-grid" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: '1px solid var(--border-1)' }}>
          {copy.process.map((p, i) => (
            <li key={p.num} style={{ padding: '28px 20px 8px 0', borderRight: i < 4 ? '1px dashed var(--line-blueprint-faint)' : 'none', paddingLeft: i > 0 ? 20 : 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{p.num}</span>
              <h3 style={{ margin: '10px 0 8px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink-1)' }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-3)' }}>{p.text}</p>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', gap: 'clamp(32px, 8vw, 96px)', marginTop: 72, paddingTop: 40, borderTop: '1px solid var(--border-1)', flexWrap: 'wrap' }}>
          <Counter value={10} suffix="+" label={copy.counterYears} />
          <Counter value={100} suffix="/100" label="Lighthouse Performance" />
          <Counter value={3} label={copy.counterLangs} />
        </div>
      </BuildSection>

      {/* 06 — Blog + CTA */}
      <BuildSection id="blog" label="Blog & CTA" style={{ background: 'var(--bg-1)' }}>
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <SectionHeader index="06" eyebrow="Blog" title={copy.blogTitle} style={{ marginBottom: 28 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {copy.posts.map((post) => (
                <button key={post.title} onClick={() => go('/blog')} className="post-row" style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '16px 4px', borderBottom: '1px solid var(--border-1)', background: 'transparent', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border-1)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{post.date}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500, color: 'var(--ink-1)' }}>{post.title}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>→</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center', padding: 36, borderRadius: 'var(--radius-xl)', background: 'var(--bg-2)', border: '1px solid var(--accent-ring)', boxShadow: 'var(--shadow-glow-accent)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>// {copy.ctaEyebrow}</span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-h2)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-1)' }}>{copy.ctaTitle}</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--ink-2)' }}>{copy.ctaText}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => go('/brief')}>{copy.ctaButton} →</Button>
              <a href="https://t.me/PavelLevdin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="ghost">@PavelLevdin</Button>
              </a>
            </div>
          </div>
        </div>
      </BuildSection>
    </>
  );
}
