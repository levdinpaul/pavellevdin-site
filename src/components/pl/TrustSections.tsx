import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { projects } from '@/data/projects';
import { Title } from './Title';

type Step = { title: string; text: string };
type Qa = { q: string; a: string };

/** «Как я работаю»: 5 шагов + условия работы (только то, что реально делается — без обещаний результата). */
export function ProcessSection() {
  const { t } = useTranslation();
  const steps = t('pl.process.steps', { returnObjects: true }) as Step[];
  const terms = t('pl.guarantees.items', { returnObjects: true }) as Step[];
  return (
    <section id="process" className="pl-section" aria-labelledby="pl-process-title">
      <p className="pl-eyebrow" data-reveal="">{t('pl.process.eyebrow')}</p>
      <Title id="pl-process-title" lines={[t('pl.process.title')]} />
      <ol className="pl-steps">
        {steps.map((s, i) => (
          <li key={s.title} data-reveal="">
            <span className="pl-srv__num">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="pl-srv__title">{s.title}</h3>
            <p className="pl-srv__text">{s.text}</p>
          </li>
        ))}
      </ol>
      <h3 className="pl-terms__title" data-reveal="">{t('pl.guarantees.title')}</h3>
      <ul className="pl-terms">
        {terms.map((g) => (
          <li key={g.title} data-reveal="">
            <strong>{g.title}</strong>
            <span>{g.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Ответы-заглушки «TODO(Pavel)…» не показываем и не отдаём в FAQPage, пока Pavel их не заполнит. */
const filled = (q: Qa) => !q.a.startsWith('TODO');

/** FAQ: на главной 6 вопросов (short), на /services — все. JSON-LD FAQPage — по показанным вопросам. */
export function FaqSection({ lang, full = false }: { lang: string; full?: boolean }) {
  const { t } = useTranslation();
  const base = t('pl.faq.items', { returnObjects: true }) as Qa[];
  const extra = full ? (t('pl.faq.extra', { returnObjects: true }) as Qa[]) : [];
  const items = [...base, ...extra].filter(filled);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  };
  return (
    <section id="faq" className="pl-section" aria-labelledby="pl-faq-title">
      <Helmet><script type="application/ld+json">{JSON.stringify(jsonLd)}</script></Helmet>
      <p className="pl-eyebrow" data-reveal="">{t('pl.faq.eyebrow')}</p>
      <Title id="pl-faq-title" lines={[t('pl.faq.title')]} />
      <div className="pl-faq">
        {items.map((x) => (
          <details key={x.q} className="pl-faq__item" data-reveal="">
            <summary>{x.q}</summary>
            <p>{x.a}</p>
          </details>
        ))}
      </div>
      {!full && <Link to={`/${lang}/services#faq`} viewTransition className="pl-link pl-faq__more" data-reveal="">{t('pl.faq.more')}</Link>}
    </section>
  );
}

const GROUPS = [
  { key: 'ru', categories: ['clients-ru', 'landings'] },
  { key: 'de', categories: ['clients-de'] },
  { key: 'products', categories: ['products'] },
] as const;

/** Пока одобренных отзывов нет: «С кем работаю» — реальные проекты из portfolio.json со ссылками на кейсы + «Оставить отзыв». */
export function ClientsSection({ lang }: { lang: string }) {
  const { t } = useTranslation();
  return (
    <section id="clients" className="pl-section" aria-labelledby="pl-clients-title">
      <p className="pl-eyebrow" data-reveal="">{t('pl.clients.eyebrow')}</p>
      <Title id="pl-clients-title" lines={[t('pl.clients.title')]} />
      <p className="pl-lead" data-reveal="">{t('pl.clients.lead')}</p>
      <div className="pl-clients">
        {GROUPS.map((g) => {
          const list = projects.filter((p) => (g.categories as readonly string[]).includes(p.category));
          if (!list.length) return null;
          return (
            <div key={g.key} className="pl-clients__group" data-reveal="">
              <h3 className="pl-clients__label">{t(`pl.clients.${g.key}`)}</h3>
              <ul>
                {list.map((p) => (
                  <li key={p.slug}><Link to={`/${lang}/portfolio/${p.slug}`} viewTransition>{p.title}</Link></li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Link to={`/${lang}/review`} className="pl-btn pl-btn--ghost pl-clients__review" data-reveal="">{t('pl.clients.leave')}</Link>
    </section>
  );
}
