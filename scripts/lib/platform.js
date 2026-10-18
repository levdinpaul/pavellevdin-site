// Связь сайта с pl-platform (CRM, кабинеты, блог). Конфиг — scripts/platform.json (не в git):
//   { "leadUrl": "https://pavellevdin.ru/api/platform/lead", "token": "<PL_INGEST_TOKEN платформы>" }
// Нет файла — пересылка выключена, сайт работает как раньше (лиды остаются в data/leads.jsonl).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_FILE = path.join(__dirname, '..', 'platform.json');

function readConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return cfg && typeof cfg.token === 'string' && cfg.token.length >= 24 ? cfg : null;
  } catch {
    return null;
  }
}

/** Та же формула, что в pl-platform/infra/import-leads.mjs — повторная пересылка не создаёт дубль. */
function legacyId(lead) {
  return crypto.createHash('sha1').update(`${lead.ts}|${lead.name}|${lead.contact}`).digest('hex');
}

const SOURCE = { contact: 'contact_form', brief: 'brief' };

/** Отправить лид в CRM платформы (best-effort, 8 с). Возвращает true при успехе. */
async function forwardLead(lead) {
  const cfg = readConfig();
  if (!cfg || !cfg.leadUrl) return false;
  const payload = {
    legacy_id: legacyId(lead),
    submitted_at: lead.ts,
    name: lead.name,
    contact: lead.contact,
    message: lead.message,
    business: lead.business,
    budget: lead.budget,
    deadline: lead.deadline,
    service: lead.services,
    language: lead.language,
    page: lead.page,
    ip: lead.ip,
    source: SOURCE[lead.type] || 'website',
    utm_source: 'site',
    raw: lead,
  };
  const res = await fetch(cfg.leadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-pl-ingest-token': cfg.token },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`platform HTTP ${res.status}`);
  return true;
}

/** Серверные запросы платформы (модерация отзывов из её админки) — заголовок x-pl-ingest-token. */
function isPlatformRequest(req) {
  const cfg = readConfig();
  const got = req.headers['x-pl-ingest-token'];
  if (!cfg || typeof got !== 'string' || got.length !== cfg.token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(cfg.token));
}

module.exports = { forwardLead, isPlatformRequest, legacyId };
