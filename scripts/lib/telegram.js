const axios = require('axios');
const { getEnv } = require('./env');

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
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  return axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

module.exports = { sendTelegramMessage };
