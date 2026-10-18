/**
 * Минимальный SMTP-клиент без внешних зависимостей (scripts/node_modules на сервере не трогаем).
 * Настройки — из .env: SMTP_HOST (пусто = письма выключены), SMTP_PORT (587), SMTP_SECURE=true для 465,
 * SMTP_USER / SMTP_PASS (AUTH LOGIN, необязательно), SMTP_FROM (no-reply@pavellevdin.ru).
 * STARTTLS включается сам, если сервер его предлагает (SMTP_STARTTLS=false — выключить).
 */
const net = require('net');
const tls = require('tls');
const os = require('os');
const { getEnv } = require('./env');

const EMAILS = { ru: 'info@pavellevdin.ru', eu: 'info@pavellevdin.de' };

/** Ящик для заявок по языку: ru → .ru; de/en → .de (пока DE_MAIL_READY не true — тоже .ru). */
function leadMailbox(lang) {
  const deReady = getEnv('DE_MAIL_READY', 'false') === 'true';
  if (lang !== 'ru' && deReady) return getEnv('LEAD_MAIL_EU', EMAILS.eu);
  return getEnv('LEAD_MAIL_RU', EMAILS.ru);
}

function mailConfigured() {
  return Boolean(getEnv('SMTP_HOST', ''));
}

function encodeHeader(value) {
  return /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function buildMessage({ from, to, subject, text, replyTo }) {
  const headers = [
    `From: PL Innovativ Digitalbau <${from}>`,
    `To: <${to}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@${from.split('@')[1] || 'localhost'}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  if (replyTo) headers.push(`Reply-To: <${replyTo}>`);
  const body = Buffer.from(text, 'utf8').toString('base64').replace(/.{1,76}/g, '$&\r\n');
  return `${headers.join('\r\n')}\r\n\r\n${body}`;
}

/** Диалог SMTP: читает ответы построчно, ждёт финальную строку «NNN » и проверяет код. */
function session(socket) {
  let buffer = '';
  let waiter = null;
  const onData = (chunk) => {
    buffer += chunk.toString('utf8');
    flush();
  };
  const flush = () => {
    if (!waiter) return;
    const lines = buffer.split('\r\n');
    const done = lines.findIndex((line) => /^\d{3} /.test(line));
    if (done === -1) return;
    const reply = lines.slice(0, done + 1).join('\n');
    buffer = lines.slice(done + 1).join('\r\n');
    const { resolve, reject, expect } = waiter;
    waiter = null;
    const code = Number(reply.slice(0, 3));
    if (expect.includes(code)) resolve(reply); else reject(new Error(`SMTP ${reply}`));
  };
  const attach = (s) => s.on('data', onData);
  attach(socket);
  return {
    attach,
    read(expect) {
      return new Promise((resolve, reject) => { waiter = { resolve, reject, expect }; flush(); });
    },
  };
}

async function sendMail({ to, subject, text, replyTo }) {
  const host = getEnv('SMTP_HOST', '');
  if (!host) return { skipped: true };
  const port = Number(getEnv('SMTP_PORT', '587'));
  const secure = getEnv('SMTP_SECURE', port === 465 ? 'true' : 'false') === 'true';
  const from = getEnv('SMTP_FROM', 'no-reply@pavellevdin.ru');
  const user = getEnv('SMTP_USER', '');
  const pass = getEnv('SMTP_PASS', '');
  const name = os.hostname() || 'localhost';

  let socket = await new Promise((resolve, reject) => {
    const s = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
    s.once(secure ? 'secureConnect' : 'connect', () => resolve(s));
    s.once('error', reject);
  });
  socket.setTimeout(15000, () => socket.destroy(new Error('SMTP timeout')));
  const smtp = session(socket);
  const cmd = (line, expect) => { socket.write(`${line}\r\n`); return smtp.read(expect); };

  try {
    await smtp.read([220]);
    let ehlo = await cmd(`EHLO ${name}`, [250]);
    if (!secure && /STARTTLS/i.test(ehlo) && getEnv('SMTP_STARTTLS', 'true') !== 'false') {
      await cmd('STARTTLS', [220]);
      socket.removeAllListeners('data');
      socket = await new Promise((resolve, reject) => {
        const s = tls.connect({ socket, servername: host, rejectUnauthorized: getEnv('SMTP_TLS_STRICT', 'false') === 'true' });
        s.once('secureConnect', () => resolve(s));
        s.once('error', reject);
      });
      smtp.attach(socket);
      ehlo = await cmd(`EHLO ${name}`, [250]);
    }
    if (user && pass) {
      await cmd('AUTH LOGIN', [334]);
      await cmd(Buffer.from(user).toString('base64'), [334]);
      await cmd(Buffer.from(pass).toString('base64'), [235]);
    }
    await cmd(`MAIL FROM:<${from}>`, [250]);
    await cmd(`RCPT TO:<${to}>`, [250, 251]);
    await cmd('DATA', [354]);
    const message = buildMessage({ from, to, subject, text, replyTo }).replace(/\r\n\./g, '\r\n..');
    await cmd(`${message}\r\n.`, [250]);
    await cmd('QUIT', [221]).catch(() => {});
    return { sent: true };
  } finally {
    socket.end();
  }
}

module.exports = { sendMail, leadMailbox, mailConfigured, EMAILS };
