#!/usr/bin/env node
// Тест SMTP сайта: npm run mail:test -- you@example.com  (на сервере: docker exec stack-pavellevdin-1 node scripts/mail-test.cjs you@example.com)
const { sendMail, mailConfigured } = require('./lib/mailer');

const to = process.argv[2];
if (!to) {
  console.error('Укажите адрес: npm run mail:test -- you@example.com');
  process.exit(2);
}
if (!mailConfigured()) {
  console.error('SMTP не настроен — впишите SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_SECURE в .env сайта');
  process.exit(1);
}
sendMail({ to, subject: 'Тест почты pavellevdin.ru', text: 'Если вы читаете это письмо, SMTP сайта работает.' })
  .then(() => console.log('Отправлено на', to))
  .catch((err) => {
    console.error('Ошибка SMTP:', err.message);
    process.exit(1);
  });
