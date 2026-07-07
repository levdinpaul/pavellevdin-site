#!/usr/bin/env node
// Разовый диагностический листинг структуры каталогов на FTP.
// Запуск: node scripts/ftp-list.cjs [путь1] [путь2] ...
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith('#')) return;
    const [key, ...vals] = line.split('=');
    if (key) env[key.trim()] = vals.join('=').trim().replace(/\r$/, '');
  });
  return env;
}

const env = loadEnv(path.join(__dirname, '..', '.env'));
const CONFIG = {
  host: env.FTP_HOST || 'ftp81.hostland.ru',
  user: env.FTP_USER || 'host1731061',
  password: env.FTP_PASSWORD || '',
  secure: false,
  port: parseInt(env.FTP_PORT || '21', 10),
};

const paths = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/pavellevdin.ru', '/pavellevdin.ru/app', '/pavellevdin.ru/htdocs', '/pavellevdin.ru/htdocs/www'];

(async () => {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(CONFIG);
    for (const dir of paths) {
      try {
        const list = await client.list(dir);
        console.log(`\n=== ${dir} (${list.length}) ===`);
        list.forEach((f) => console.log(`${f.isDirectory ? '[D]' : '   '} ${f.name}`));
      } catch (e) {
        console.log(`\n=== ${dir} === НЕТ / ошибка: ${e.message}`);
      }
    }
  } finally {
    client.close();
  }
})().catch((e) => {
  console.error('FTP error:', e.message);
  process.exit(1);
});
