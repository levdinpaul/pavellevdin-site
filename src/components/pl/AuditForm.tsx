import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { track } from '@/lib/analytics';

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';

interface Check { id: string; ok: boolean | null; value: string; hint: string }
interface Report { url: string; score: number; checks: Check[] }

/**
 * Бесплатный экспресс-аудит: адрес сайта + контакт → /api/audit (scripts/routes/audit.js).
 * Итог показывается сразу; подробный разбор уходит Pavel (Telegram/почта/CRM). Антиспам — honeypot + время заполнения.
 */
export function AuditForm({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error' | 'limit'>('idle');
  const [report, setReport] = useState<Report | null>(null);
  const startedAt = useRef(0);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          url: data.get('url'), contact: data.get('contact'), consent: data.get('consent') === 'on', lang,
          startedAt: startedAt.current, company_website: data.get('company_website') || '',
        }),
      });
      if (res.status === 429) { setStatus('limit'); return; }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'failed');
      setReport(json.report || null);
      setStatus('done');
      track('audit_submit', { score: json.report?.score });
    } catch {
      setStatus('error');
    }
  };

  const issues = report?.checks.filter((c) => c.ok === false) ?? [];

  return (
    <section id="audit" className="pl-section" aria-labelledby="pl-audit-title">
      <div className="pl-audit" data-reveal="">
        <div>
          <p className="pl-eyebrow">{t('pl.audit.eyebrow')}</p>
          <h2 id="pl-audit-title" className="pl-h2">{t('pl.audit.title')}</h2>
          <p className="pl-lead">{t('pl.audit.lead')}</p>
        </div>
        {status === 'done' && report ? (
          <div className="pl-audit__result" role="status">
            <p className="pl-audit__score">{t('pl.audit.done', { score: report.score })}</p>
            {issues.length ? (
              <>
                <p>{t('pl.audit.issues')}</p>
                <ul>{issues.map((c) => <li key={c.id}>{c.hint} <span className="pl-audit__val">({c.value})</span></li>)}</ul>
              </>
            ) : <p>{t('pl.audit.clean')}</p>}
            <p className="pl-audit__note">{t('pl.audit.contactSoon')}</p>
          </div>
        ) : (
          <form className="pl-form pl-audit__form" onSubmit={submit} onFocus={() => { if (!startedAt.current) startedAt.current = Date.now(); }}>
            <label className="pl-field"><span>{t('pl.audit.url')} *</span><input name="url" required maxLength={300} inputMode="url" placeholder={t('pl.audit.urlPh')} autoComplete="url" /></label>
            <label className="pl-field"><span>{t('pl.audit.contact')} *</span><input name="contact" required maxLength={200} autoComplete="email" /></label>
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pl-hp" />
            <label className="pl-check">
              <input type="checkbox" name="consent" required />
              <span>{t('pl.audit.consent')} <Link to={`/${lang}/privacy`} className="pl-link">{t('pl.footer.privacy')}</Link></span>
            </label>
            <button type="submit" className="pl-btn pl-btn--primary" disabled={status === 'sending'}>{status === 'sending' ? t('pl.audit.sending') : t('pl.audit.send')}</button>
            {status === 'error' && <p className="pl-form__msg" data-tone="error" role="alert">{t('pl.audit.error')}</p>}
            {status === 'limit' && <p className="pl-form__msg" data-tone="error" role="alert">{t('pl.audit.limit')}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
