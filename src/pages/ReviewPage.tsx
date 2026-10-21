import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageMeta } from '@/components/pl/PageMeta';
import { projects } from '@/data/projects';
import { track } from '@/lib/analytics';

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';

/**
 * Отзыв: /:lang/review/:token — персональная ссылка клиента (токен → проект, «проверенный клиент»);
 * /:lang/review — открытая форма (проект из списка, без бейджа). Всё уходит на модерацию, страница не индексируется.
 */
export function ReviewPage() {
  const { token = '' } = useParams();
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';
  const [project, setProject] = useState<{ project: string; title: string } | null | 'invalid'>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'links'>('idle');
  const startedAt = useRef(0);
  const open = !token;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/review-token/${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProject)
      .catch(() => setProject('invalid'));
  }, [token]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token: token || undefined,
          project: open ? data.get('project') : undefined,
          startedAt: startedAt.current,
          name: data.get('name'),
          role: data.get('role'),
          company: data.get('company'),
          text: data.get('text'),
          rating: data.get('rating'),
          contact: data.get('contact'),
          lang,
          consentPublish: data.get('consentPublish') === 'on',
          consent: data.get('consent') === 'on',
          company_website: data.get('company_website') || '',
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === 'links') { setStatus('links'); return; }
        throw new Error('submit failed');
      }
      form.reset();
      setStatus('success');
      track('review_submit', { open });
    } catch {
      setStatus('error');
    }
  };

  const title = project && project !== 'invalid' ? project.title : '';

  return (
    <>
      <PageMeta lang={lang} path={token ? `/review/${token}` : '/review'} title={t('pl.reviews.form.metaTitle')} description={t('pl.reviews.form.lead')} noindex />
      <div className="pl-page">
        <section className="pl-container pl-review-form">
          <div className="pl-page__head">
            <p className="pl-eyebrow">{t('pl.reviews.eyebrow')}</p>
            <h1 className="pl-page__title">{t('pl.reviews.form.title')}</h1>
            <p className="pl-lead">{title ? t('pl.reviews.form.leadProject', { project: title }) : t('pl.reviews.form.lead')}</p>
          </div>

          {project === 'invalid' && <p className="pl-form__msg" data-tone="error">{t('pl.reviews.form.invalid')}</p>}

          {status === 'success' ? (
            <div className="pl-form__msg" data-tone="ok" role="status">
              <p>{t('pl.reviews.form.success')}</p>
              <Link to={`/${lang}`} className="pl-link">{t('pl.reviews.form.home')}</Link>
            </div>
          ) : (
            <form className="pl-form" onSubmit={submit} onFocus={() => { if (!startedAt.current) startedAt.current = Date.now(); }}>
              <div className="pl-form__row">
                <label className="pl-field"><span>{t('pl.reviews.form.name')} *</span><input name="name" required maxLength={120} autoComplete="name" /></label>
                <label className="pl-field"><span>{t('pl.reviews.form.role')}</span><input name="role" maxLength={120} autoComplete="organization-title" /></label>
              </div>
              <label className="pl-field"><span>{t('pl.reviews.form.company')}</span><input name="company" maxLength={160} autoComplete="organization" /></label>
              {open && (
                <label className="pl-field">
                  <span>{t('pl.reviewOpen.project')}</span>
                  <select name="project" defaultValue="">
                    <option value="">{t('pl.reviewOpen.projectOther')}</option>
                    {projects.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                  </select>
                </label>
              )}
              <label className="pl-field"><span>{t('pl.reviews.form.text')} *</span><textarea name="text" required minLength={20} maxLength={3000} rows={7} /></label>
              <fieldset className="pl-field pl-rating">
                <legend>{t('pl.reviews.form.rating')}</legend>
                {[5, 4, 3, 2, 1].map((n) => (
                  <label key={n}><input type="radio" name="rating" value={n} defaultChecked={n === 5} /><span>{'★'.repeat(n)}</span></label>
                ))}
              </fieldset>
              <label className="pl-field"><span>{open ? t('pl.reviewOpen.contact') : t('pl.reviews.form.contact')}</span><input name="contact" type={open ? 'email' : 'text'} maxLength={200} autoComplete="email" /></label>
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pl-hp" />
              <label className="pl-check"><input type="checkbox" name="consentPublish" required /><span>{t('pl.reviews.form.consentPublish')}</span></label>
              <label className="pl-check">
                <input type="checkbox" name="consent" required />
                <span>{t('pl.reviews.form.consent')} <Link to={`/${lang}/privacy`} className="pl-link">{t('pl.footer.privacy')}</Link></span>
              </label>
              <button type="submit" className="pl-btn pl-btn--primary" disabled={status === 'sending' || project === 'invalid'}>{t('pl.reviews.form.send')}</button>
              {status === 'error' && <p className="pl-form__msg" data-tone="error" role="alert">{t('pl.reviews.form.error')}</p>}
              {status === 'links' && <p className="pl-form__msg" data-tone="error" role="alert">{t('pl.reviewOpen.links')}</p>}
            </form>
          )}
        </section>
      </div>
    </>
  );
}
