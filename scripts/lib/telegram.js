const axios = require('axios');
const { getEnv } = require('./env');

/**
 * Telegram Bot API. С russh api.telegram.org недоступен — запросы идут через ретранслятор на немецком VPS:
 *   TELEGRAM_API_BASE  — база API (по умолчанию https://api.telegram.org; на проде http://tg-relay:18081);
 *   TELEGRAM_RELAY_KEY — если задан, уходит заголовком X-Relay-Key (ретранслятор пускает только с ним).
 * Схема — README, раздел «Telegram через ретранслятор».
 */
const DEFAULT_API_BASE = 'https://api.telegram.org';
const TIMEOUT_MS = 10000;

function telegramApiUrl(method, token = getEnv('TELEGRAM_TOKEN', '')) {
  const base = (getEnv('TELEGRAM_API_BASE', '') || DEFAULT_API_BASE).replace(/\/+$/, '');
  return `${base}/bot${token}/${method}`;
}

function telegramHeaders() {
  const key = getEnv('TELEGRAM_RELAY_KEY', '');
  return key ? { 'X-Relay-Key': key } : {};
}

/** POST к методу Bot API (таймаут 10 с). Ошибка — без токена и URL в тексте: «Telegram sendMessage: HTTP 403 — …». */
async function telegramCall(method, payload, { token = getEnv('TELEGRAM_TOKEN', ''), headers = {} } = {}) {
  try {
    const res = await axios.post(telegramApiUrl(method, token), payload, {
      timeout: TIMEOUT_MS,
      headers: { ...telegramHeaders(), ...headers },
    });
    return res.data;
  } catch (err) {
    const status = err.response && err.response.status;
    const desc = err.response && err.response.data && err.response.data.description;
    const reason = status
      ? `HTTP ${status}${desc ? ` — ${desc}` : ''}`
      : err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' ? `таймаут ${TIMEOUT_MS / 1000} с` : err.code || 'сетевая ошибка';
    const msg = `Telegram ${method}: ${reason}`;
    throw new Error(token ? msg.split(token).join('***') : msg);
  }
}

/**
 * Отправка простого HTML-сообщения в Telegram.
 * Отдельный лёгкий хелпер (notify-telegram.js — самозапускающийся скрипт автопостинга,
 * его нельзя require без побочных эффектов).
 */
async function sendTelegramMessage(text) {
  const token = getEnv('TELEGRAM_TOKEN', '');
  const chatId = getEnv('TELEGRAM_CHAT_ID', '');
  if (!token || !chatId) {
    throw new Error('Telegram не настроен (нет TELEGRAM_TOKEN / TELEGRAM_CHAT_ID)');
  }
  return telegramCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }, { token });
}

module.exports = { sendTelegramMessage, telegramCall, telegramApiUrl, telegramHeaders };
