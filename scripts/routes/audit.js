const express = require('express');
const fs = require('fs');
const path = require('path');
const { sendTelegramMessage } = require('../lib/telegram');
const { createRateLimiter, clientIp } = require('../lib/rate-limit');
const { sendMail, leadMailbox, mailConfigured } = require('../lib/mailer');
const { reportText, clientMail, labelRu } = require('../lib/audit-i18n');
const { forwardLead } = require('../lib/platform');
const { auditSite } = require('../lib/site-audit');
const { getEnv } = require('../lib/env');

const router = express.Router();

// Заявки на аудит — рядом с лидами, на РФ-сервере (152-ФЗ)
const DATA_DIR = path.join(__dirname, '..', 'data');
const AUDITS_FILE = path.join(DATA_DIR, 'audits.jsonl');

// Не больше 3 аудитов в сутки с одного IP
const limiter = createRateLimiter({ windowMs: 24 * 60 * 60 * 1000, max: 3 });
const MIN_FILL_MS = 4000;

// Включён по умолчанию; аварийно выключить — AUDIT_ENABLED=false в .env
const enabled = () => getEnv('AUDIT_ENABLED', 'true') !== 'false';
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// GET /api/audit/status — включён ли аудит (форма на сайте показывается только при true)
router.get('/status', (req, res) => res.json({ enabled: enabled() }));

// POST /api/audit — { url, contact, consent, lang, startedAt, company_website (honeypot) }
router.post('/', limiter, async (req, res) => {
  if (!enabled()) return res.status(503).json({ error: 'disabled' });
  const b = req.body || {};
  if (b.company_website) return res.json({ ok: true });
  if (Number(b.startedAt) && Date.now() - Number(b.startedAt) < MIN_FILL_MS) return res.json({ ok: true });
  if (!b.consent) return res.status(400).json({ error: 'consent' });

  const contact = clip(b.contact, 200);
  const lang = ['ru', 'de', 'en'].includes(b.lang) ? b.lang : 'ru';
  if (!contact) return res.status(400).json({ error: 'contact' });

  let report;
  try {
    report = await auditSite(clip(b.url, 300));
  } catch (err) {
    return res.status(400).json({ error: 'url', detail: err.message });
  }

  const lead = {
    ts: new Date().toISOString(),
    type: 'audit',
    name: contact,
    contact,
    message: reportText(report),
    business: report.url,
    language: lang,
    page: 'audit',
    ip: clientIp(req),
    consent: true,
  };

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(AUDITS_FILE, JSON.stringify({ ...lead, report }) + '\n');
  } catch (err) {
    console.error('Не удалось записать аудит:', err.message);
  }

  const failed = report.checks.filter((c) => c.ok === false).map((c) => labelRu(c.id));
  try {
    await sendTelegramMessage([
      `🔎 <b>Заявка на аудит</b> — ${esc(report.url)}`,
      `📞 ${esc(contact)}`,
      `📊 ${report.score}% · ${report.psi ? `PSI ${report.psi.score}` : 'PSI — нет ключа'}`,
      failed.length ? `⚠️ ${esc(failed.join(', '))}` : '✅ замечаний нет',
      `🌐 ${lang} · ${esc(lead.ip)}`,
    ].join('\n'));
  } catch (err) {
    console.error('Аудит → Telegram:', err.message);
  }

  // Отчёт клиенту — если оставил email и почта настроена; копия — на ящик заявок
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  try {
    if (mailConfigured()) {
      // Клиенту — на языке формы (ru/de/en); копия на ящик заявок — ru
      if (isEmail) await sendMail({ to: contact, ...clientMail(report, lang), replyTo: leadMailbox(lang) });
      await sendMail({ to: leadMailbox(lang), subject: `Аудит: ${report.url}`, text: `${contact}\n\n${reportText(report)}`, replyTo: isEmail ? contact : undefined });
    }
  } catch (err) {
    console.error('Аудит → почта:', err.message);
  }

  try { await forwardLead(lead); } catch (err) { console.error('Аудит → CRM:', err.message); }

  res.json({ ok: true, report });
});

module.exports = router;
