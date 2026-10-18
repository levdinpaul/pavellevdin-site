const express = require('express');
const fs = require('fs');
const path = require('path');
const { sendTelegramMessage } = require('../lib/telegram');
const { createRateLimiter, clientIp } = require('../lib/rate-limit');
const { sendMail, leadMailbox } = require('../lib/mailer');
const { forwardLead } = require('../lib/platform');

const router = express.Router();

// Локальное хранилище лидов на РФ-сервере (152-ФЗ: сначала пишем в РФ)
const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

// Не больше 5 заявок за 10 минут с одного IP
const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function clip(v, n) {
  return String(v == null ? '' : v).trim().slice(0, n);
}

// POST /api/lead — публичный приём заявок с форм (Contact + Brief)
router.post('/', limiter, async (req, res) => {
  const b = req.body || {};

  // Honeypot-поле: если заполнено — это бот, тихо отвечаем ok
  if (b.company_website) return res.json({ ok: true });

  // Согласие на обработку ПДн обязательно (152-ФЗ)
  if (!b.consent) return res.status(400).json({ error: 'Требуется согласие на обработку персональных данных' });

  const name = clip(b.name, 200);
  const contact = clip(b.contact, 200);
  if (!name || !contact) {
    return res.status(400).json({ error: 'Укажите имя и контакт' });
  }

  const lead = {
    ts: new Date().toISOString(),
    type: clip(b.type, 20) || 'contact',
    name,
    contact,
    message: clip(b.message || b.details, 5000),
    business: clip(b.business, 200),
    budget: clip(b.budget, 100),
    deadline: clip(b.deadline, 100),
    services: clip(b.selectedServices || b.services, 500),
    language: clip(b.language, 5),
    page: clip(b.page, 40),
    ip: clientIp(req),
    consent: true,
  };

  // 1) Сохраняем локально на РФ-сервере (локализация ПДн)
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(LEADS_FILE, JSON.stringify(lead) + '\n');
  } catch (err) {
    console.error('Не удалось записать лид в файл:', err.message);
  }

  // 2) Уведомление в Telegram (best-effort — не валим запрос, если упало)
  const parts = [
    `🎯 <b>Новая заявка</b> (${esc(lead.type)})`,
    `👤 ${esc(lead.name)}`,
    `📞 ${esc(lead.contact)}`,
    lead.business && `🏢 ${esc(lead.business)}`,
    lead.budget && `💰 ${esc(lead.budget)}`,
    lead.deadline && `📅 ${esc(lead.deadline)}`,
    lead.services && `🧩 ${esc(lead.services)}`,
    lead.message && `📝 ${esc(lead.message)}`,
    `🌐 ${esc(lead.language)} · ${esc(lead.page)} · ${esc(lead.ip)}`,
  ].filter(Boolean);

  try {
    await sendTelegramMessage(parts.join('\n'));
  } catch (err) {
    console.error('Не удалось отправить лид в Telegram:', err.message);
  }

  // 3) Письмо на ящик своей локали (ru → info@pavellevdin.ru, de/en → info@pavellevdin.de при DE_MAIL_READY)
  try {
    const text = parts.join('\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.contact) ? lead.contact : undefined;
    await sendMail({ to: leadMailbox(lead.language), subject: `Новая заявка (${lead.type}) — ${lead.name}`, text, replyTo });
  } catch (err) {
    console.error('Не удалось отправить лид на почту:', err.message);
  }

  // 4) Копия в CRM платформы (pl-platform) — только de/en (152-ФЗ: ru остаются в РФ); без scripts/platform.json выключено
  try {
    await forwardLead(lead);
  } catch (err) {
    console.error('Не удалось передать лид в CRM платформы:', err.message);
  }

  res.json({ ok: true });
});

module.exports = router;
