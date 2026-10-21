import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { track } from '@/lib/analytics';
import { Link, useSearchParams } from 'react-router-dom';
import { PageMeta } from '@/components/pl/PageMeta';
import { breadcrumbs } from '@/components/pl/seo';
import { formatAmount, formatFxDate } from '@/data/pricing';
import { useFxRate } from '@/data/fx';
import {
  CALC_OPTIONS,
  CALC_PROJECTS,
  CALC_URGENT,
  calcText,
  calculateFor,
  defaultCalcInput,
  getCalcProject,
  parseCalcInput,
  type CalcInput,
  type CalcLine,
} from '@/lib/calculator';

/**
 * Калькулятор стоимости /{lang}/calculator: тип → страницы → опции → итог «от–до» + срок + разбивка.
 * Расчёт — общий модуль src/lib/calculator.ts (тот же файл в pl-platform), цены — src/data/pricing.json.
 * Черновик — localStorage `pl-calc-draft` (до входа). «Сохранить» / «Отправить» — API платформы
 * (/api/calculator/save|submit, cookie pl_auth_token на общем домене); без входа — /{lang}/login?redirect=…?resume=1.
 */
const DRAFT_KEY = 'pl-calc-draft';
const STEPS = 4;

type Lang = 'ru' | 'de' | 'en';
type Action = 'save' | 'submit';
interface Draft { input: CalcInput; step: number; comment?: string; pending?: Action | null }
type Status =
  | { kind: 'idle' }
  | { kind: 'busy'; action: Action }
  | { kind: 'saved' }
  | { kind: 'submitted'; nr: string; id: number }
  | { kind: 'error'; message: string };

function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Draft>;
    const input = parseCalcInput(d.input);
    if (!input) return null;
    return {
      input,
      step: Math.min(STEPS - 1, Math.max(0, Number(d.step) || 0)),
      comment: typeof d.comment === 'string' ? d.comment.slice(0, 2000) : '',
      pending: d.pending === 'save' || d.pending === 'submit' ? d.pending : null,
    };
  } catch {
    return null;
  }
}

function writeDraft(d: Draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* приватный режим / квота — расчёт просто не переживёт перезагрузку */
  }
}


async function isLoggedIn(): Promise<boolean> {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } });
    if (!r.ok) return false;
    const j = (await r.json()) as { user?: unknown };
    return Boolean(j?.user);
  } catch {
    return false;
  }
}

export function CalculatorPage() {
  const { t, i18n } = useTranslation();
  const lang = (['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru') as Lang;
  const fx = useFxRate(lang);
  const [params] = useSearchParams();
  const resume = params.get('resume') === '1';

  const [input, setInput] = useState<CalcInput>(() => defaultCalcInput('business-site'));
  const [step, setStep] = useState(0);
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState<Action | null>(null);
  const [resumed, setResumed] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [hydrated, setHydrated] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  // Черновик восстанавливаем только после гидрации (SSR-разметка — всегда с дефолтом).
  useEffect(() => {
    const d = readDraft();
    if (d) {
      setInput(d.input);
      setComment(d.comment ?? '');
      setStep(resume ? STEPS - 1 : d.step);
      if (resume) {
        setPending(d.pending ?? null);
        setResumed(true);
      }
    } else if (resume) {
      setStep(STEPS - 1);
    }
    setHydrated(true);
  }, [resume]);

  useEffect(() => {
    if (hydrated) writeDraft({ input, step, comment, pending });
  }, [hydrated, input, step, comment, pending]);

  const project = getCalcProject(input.project) ?? CALC_PROJECTS[0];
  const result = useMemo(() => calculateFor(lang, input, fx), [lang, input, fx]);
  const money = (v: number) => formatAmount(lang, v);
  const weeks = (a: number, b: number) => (a === b ? t('pl.calc.weeksOne', { n: a }) : t('pl.calc.weeks', { min: a, max: b }));
  const pagesFixed = project.pagesMax <= project.pagesIncluded;
  const isApp = project.id === 'web-app';
  const extraPagePrice = calculateFor(lang, { ...input, pages: project.pagesIncluded + 1 }, fx);
  const extraLine = extraPagePrice?.breakdown.find((l) => l.key === 'pages');

  const go = (to: number) => {
    setStep(Math.min(STEPS - 1, Math.max(0, to)));
    setStatus((s) => (s.kind === 'error' ? { kind: 'idle' } : s));
    requestAnimationFrame(() => headRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    track('calc_step', { step: to });
  };

  const pickProject = (id: string) => {
    const p = getCalcProject(id);
    if (!p) return;
    const keep = input.options.filter((o) => !getCalcProject(input.project)?.includes.includes(o));
    const next = parseCalcInput({ ...input, project: id, pages: Math.max(p.pagesIncluded, Math.min(input.pages, p.pagesMax)), options: [...keep, ...p.includes] });
    if (next) setInput(next);
    track('calc_project', { project: id });
    go(p.pagesMax <= p.pagesIncluded ? 2 : 1);
  };

  const setPages = (n: number) => {
    const next = parseCalcInput({ ...input, pages: n });
    if (next) setInput(next);
  };
  const toggle = (id: string) => {
    if (project.includes.includes(id)) return;
    const options = input.options.includes(id) ? input.options.filter((o) => o !== id) : [...input.options, id];
    const next = parseCalcInput({ ...input, options });
    if (next) setInput(next);
  };
  const setLanguages = (n: number) => {
    const next = parseCalcInput({ ...input, languages: n });
    if (next) setInput(next);
  };

  const act = async (action: Action) => {
    setStatus({ kind: 'busy', action });
    track(action === 'save' ? 'calc_save' : 'calc_submit', { project: input.project });
    if (!(await isLoggedIn())) {
      // Расчёт уже в localStorage; после входа вернёмся сюда с ?resume=1.
      writeDraft({ input, step: STEPS - 1, comment, pending: action });
      const back = `/${lang}/calculator?resume=1`;
      window.location.assign(`/${lang}/login?redirect=${encodeURIComponent(back)}`);
      return;
    }
    try {
      const r = await fetch(`/api/calculator/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ input, language: lang, ...(action === 'submit' && comment.trim() ? { comment: comment.trim() } : {}) }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string; id?: number; request_number?: string };
      if (r.status === 401) {
        writeDraft({ input, step: STEPS - 1, comment, pending: action });
        window.location.assign(`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/calculator?resume=1`)}`);
        return;
      }
      if (!r.ok) throw new Error(r.status === 429 ? t('pl.calc.rateLimited') : t('pl.calc.error'));
      setPending(null);
      if (action === 'save') setStatus({ kind: 'saved' });
      else setStatus({ kind: 'submitted', nr: j.request_number ?? '', id: Number(j.id) || 0 });
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : t('pl.calc.error') });
    }
  };

  const reset = () => {
    setInput(defaultCalcInput('business-site'));
    setComment('');
    setPending(null);
    setResumed(false);
    setStatus({ kind: 'idle' });
    go(0);
  };

  const stepTitles = t('pl.calc.steps', { returnObjects: true }) as string[];
  const unitText = (l: CalcLine) => {
    if (l.unit === 'page') return `${l.qty} ${isApp ? t('pl.calc.unitScreen') : t('pl.calc.unitPage')}`;
    if (l.unit === 'language') return `${l.qty} ${t('pl.calc.unitLanguage')}`;
    if (l.unit === 'percent') return `+${l.qty} %`;
    return '';
  };
  const busy = status.kind === 'busy';
  const jsonLd = breadcrumbs(lang, [{ name: 'Innovativ Digitalbau', path: '' }, { name: t('pl.calc.eyebrow'), path: '/calculator' }]);

  return (
    <>
      <PageMeta lang={lang} path="/calculator" title={t('pl.calc.metaTitle')} description={t('pl.calc.metaDescription')} jsonLd={jsonLd} />
      <div className="pl-page pl-calc">
        <section className="pl-container pl-page__head">
          <p className="pl-eyebrow">{t('pl.calc.eyebrow')}</p>
          <h1 className="pl-page__title">{t('pl.calc.title')}</h1>
          <p className="pl-lead">{t('pl.calc.lead')}</p>
        </section>

        <section className="pl-container pl-calc__layout">
          <div className="pl-calc__main">
            <ol className="pl-calc__steps" aria-label={t('pl.calc.stepsLabel')}>
              {stepTitles.map((title, i) => (
                <li key={title}>
                  <button
                    type="button"
                    className="pl-calc__step"
                    aria-current={i === step ? 'step' : undefined}
                    data-done={i < step || undefined}
                    disabled={i === 1 && pagesFixed}
                    onClick={() => go(i)}
                  >
                    <span className="pl-calc__step-num">{String(i + 1).padStart(2, '0')}</span>
                    {title}
                  </button>
                </li>
              ))}
            </ol>

            <h2 ref={headRef} className="pl-calc__h" tabIndex={-1}>
              {step === 1 && isApp ? t('pl.calc.screensTitle') : [t('pl.calc.typeTitle'), t('pl.calc.pagesTitle'), t('pl.calc.optionsTitle'), t('pl.calc.resultTitle')][step]}
            </h2>

            {step === 0 && (
              <div className="pl-calc__grid" role="radiogroup" aria-label={t('pl.calc.typeTitle')}>
                {CALC_PROJECTS.map((p) => {
                  const from = calculateFor(lang, { project: p.id }, fx);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={input.project === p.id}
                      className="pl-calc__card"
                      onClick={() => pickProject(p.id)}
                    >
                      <span className="pl-calc__card-title">{calcText(p.label, lang)}</span>
                      <span className="pl-calc__card-meta">
                        {t('pl.calc.from')} {money(from?.min ?? 0)} · {calcText(p.duration, lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="pl-calc__pages">
                {pagesFixed ? (
                  <p className="pl-note">{t('pl.calc.pagesFixed')}</p>
                ) : (
                  <>
                    <div className="pl-calc__counter">
                      <button type="button" className="pl-chip" onClick={() => setPages(input.pages - 1)} disabled={input.pages <= project.pagesIncluded} aria-label={t('pl.calc.less')}>−</button>
                      <span className="pl-calc__count" aria-live="polite">
                        <span className="pl-calc__count-num">{input.pages}</span>
                        <span className="pl-calc__count-label">{isApp ? t('pl.calc.screensLabel') : t('pl.calc.pagesLabel')}</span>
                      </span>
                      <button type="button" className="pl-chip" onClick={() => setPages(input.pages + 1)} disabled={input.pages >= project.pagesMax} aria-label={t('pl.calc.more')}>+</button>
                    </div>
                    <input
                      type="range"
                      className="pl-calc__range"
                      min={project.pagesIncluded}
                      max={project.pagesMax}
                      value={input.pages}
                      onChange={(e) => setPages(Number(e.target.value))}
                      aria-label={isApp ? t('pl.calc.screensLabel') : t('pl.calc.pagesLabel')}
                    />
                    <p className="pl-note">
                      {t('pl.calc.pagesIncluded', { n: project.pagesIncluded, price: money(extraLine?.priceMin ?? 0) })}
                    </p>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <ul className="pl-calc__options">
                {CALC_OPTIONS.map((o) => {
                  const included = project.includes.includes(o.id);
                  const one = calculateFor(lang, { project: input.project, pages: input.pages, options: o.unit === 'flat' ? [o.id] : [], languages: o.unit === 'language' ? 1 : 0 }, fx);
                  const price = one?.breakdown.find((l) => l.key === `option:${o.id}`)?.priceMin ?? 0;
                  if (o.unit === 'language') {
                    return (
                      <li key={o.id} className="pl-calc__option" data-on={input.languages > 0 || undefined}>
                        <div className="pl-calc__option-text">
                          <span className="pl-calc__option-title">{calcText(o.label, lang)}</span>
                          <span className="pl-calc__option-hint">{calcText(o.hint, lang)}</span>
                        </div>
                        <div className="pl-calc__option-side">
                          <span className="pl-calc__option-price">{t('pl.calc.from')} {money(price)} {t('pl.calc.perLanguage')}</span>
                          <div className="pl-calc__counter pl-calc__counter--sm">
                            <button type="button" className="pl-chip" onClick={() => setLanguages(input.languages - 1)} disabled={input.languages <= 0} aria-label={t('pl.calc.less')}>−</button>
                            <span className="pl-calc__count-num" aria-live="polite">{input.languages}</span>
                            <button type="button" className="pl-chip" onClick={() => setLanguages(input.languages + 1)} disabled={input.languages >= o.max} aria-label={t('pl.calc.more')}>+</button>
                          </div>
                        </div>
                      </li>
                    );
                  }
                  const on = included || input.options.includes(o.id);
                  return (
                    <li key={o.id} className="pl-calc__option" data-on={on || undefined}>
                      <label className="pl-calc__option-label">
                        <input type="checkbox" checked={on} disabled={included} onChange={() => toggle(o.id)} />
                        <span className="pl-calc__option-text">
                          <span className="pl-calc__option-title">{calcText(o.label, lang)}</span>
                          <span className="pl-calc__option-hint">{calcText(o.hint, lang)}</span>
                        </span>
                        <span className="pl-calc__option-price">{included ? t('pl.calc.included') : `${t('pl.calc.from')} ${money(price)}`}</span>
                      </label>
                    </li>
                  );
                })}
                <li className="pl-calc__option" data-on={input.urgent || undefined}>
                  <label className="pl-calc__option-label">
                    <input type="checkbox" checked={input.urgent} onChange={() => setInput({ ...input, urgent: !input.urgent })} />
                    <span className="pl-calc__option-text">
                      <span className="pl-calc__option-title">{calcText(CALC_URGENT.label, lang)}</span>
                      <span className="pl-calc__option-hint">{calcText(CALC_URGENT.hint, lang)}</span>
                    </span>
                  </label>
                </li>
              </ul>
            )}

            {step === 3 && result && (
              <div className="pl-calc__result">
                <table className="pl-calc__table">
                  <caption className="pl-calc__caption">{t('pl.calc.breakdown')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('pl.calc.colItem')}</th>
                      <th scope="col" className="pl-calc__num">{t('pl.calc.colPrice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((l) => (
                      <tr key={l.key}>
                        <td>
                          {calcText(l.label, lang)}
                          {unitText(l) && <span className="pl-calc__qty"> · {unitText(l)}</span>}
                        </td>
                        <td className="pl-calc__num">{l.included ? t('pl.calc.includedShort') : `${money(l.priceMin)} – ${money(l.priceMax)}`}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">{t('pl.calc.summary')}</th>
                      <td className="pl-calc__num">{money(result.min)} – {money(result.max)}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t('pl.calc.term')}</th>
                      <td className="pl-calc__num">{weeks(result.weeksMin, result.weeksMax)}</td>
                    </tr>
                  </tfoot>
                </table>

                {status.kind === 'submitted' ? (
                  <div className="pl-calc__done" role="status">
                    <p>{t('pl.calc.submitted', { nr: status.nr })}</p>
                    <a className="pl-btn pl-btn--primary" href={status.id ? `/${lang}/cabinet/requests/${status.id}` : `/${lang}/cabinet/requests`}>{t('pl.calc.submittedLink')}</a>
                  </div>
                ) : (
                  <>
                    {resumed && <p className="pl-calc__notice" role="status">{t('pl.calc.resumed')}</p>}
                    <label className="pl-calc__comment">
                      <span>{t('pl.calc.comment')}</span>
                      <textarea value={comment} maxLength={2000} rows={3} placeholder={t('pl.calc.commentPh')} onChange={(e) => setComment(e.target.value)} />
                    </label>
                    <div className="pl-cta__actions">
                      <button type="button" className="pl-btn pl-btn--primary" data-pending={pending === 'submit' || undefined} disabled={busy} onClick={() => act('submit')}>
                        {status.kind === 'busy' && status.action === 'submit' ? t('pl.calc.sending') : t('pl.calc.submit')}
                        <span aria-hidden="true">→</span>
                      </button>
                      <button type="button" className="pl-btn pl-btn--ghost" data-pending={pending === 'save' || undefined} disabled={busy} onClick={() => act('save')}>
                        {status.kind === 'busy' && status.action === 'save' ? t('pl.calc.saving') : t('pl.calc.save')}
                      </button>
                    </div>
                    {status.kind === 'saved' && (
                      <p className="pl-calc__notice" role="status">
                        {t('pl.calc.saved')} <a className="pl-link" href={`/${lang}/cabinet/requests`}>{t('pl.calc.savedLink')}</a>
                      </p>
                    )}
                    {status.kind === 'error' && <p className="pl-calc__error" role="alert">{status.message}</p>}
                    {!resumed && <p className="pl-note">{t('pl.calc.authHint')}</p>}
                  </>
                )}
              </div>
            )}

            <div className="pl-calc__nav">
              {step > 0 && (
                <button type="button" className="pl-btn pl-btn--ghost" onClick={() => go(step === 2 && pagesFixed ? 0 : step - 1)}>
                  <span aria-hidden="true">←</span> {t('pl.calc.back')}
                </button>
              )}
              {step > 0 && step < STEPS - 1 && (
                <button type="button" className="pl-btn pl-btn--primary" onClick={() => go(step + 1)}>
                  {step === STEPS - 2 ? t('pl.calc.toResult') : t('pl.calc.next')} <span aria-hidden="true">→</span>
                </button>
              )}
              {step === STEPS - 1 && (
                <button type="button" className="pl-btn pl-btn--ghost" onClick={reset}>{t('pl.calc.reset')}</button>
              )}
            </div>
          </div>

          <aside className="pl-calc__summary" aria-live="polite">
            <p className="pl-eyebrow">{calcText(project.label, lang)}</p>
            <p className="pl-calc__total">
              {result ? `${money(result.min)} – ${money(result.max)}` : '—'}
            </p>
            <p className="pl-calc__term">
              {t('pl.calc.term')}: {result ? weeks(result.weeksMin, result.weeksMax) : '—'}
            </p>
            <p className="pl-note">
              {t('pl.calc.note')}
              {lang !== 'ru' && <> {t('pl.prices.fxNote', { date: formatFxDate(lang, fx.date) })}</>}
            </p>
            {step < STEPS - 1 && (
              <button type="button" className="pl-btn pl-btn--light" onClick={() => go(STEPS - 1)}>{t('pl.calc.toResult')}</button>
            )}
            <p className="pl-note">
              <Link to={`/${lang}/brief`} className="pl-link">{t('pl.calc.briefLink')}</Link>
            </p>
          </aside>
        </section>
      </div>
    </>
  );
}
