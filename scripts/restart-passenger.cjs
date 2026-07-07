#!/usr/bin/env node
// Триггерит рестарт Phusion Passenger: заливает tmp/restart.txt в каталог приложения.
// Нужно после деплоя серверных файлов, иначе Passenger крутит старый код.
// Запуск: node scripts/restart-passenger.cjs

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
const SERVER_ROOT = env.FTP_SERVER_ROOT || '/pavellevdin.ru/projects/app/';

(async () => {
  const client = new ftp.Client();
  try {
    await client.access(CONFIG);
    await client.ensureDir(SERVER_ROOT + 'tmp/');
    const tmp = path.join(__dirname, '..', '.restart.tmp');
    fs.writeFileSync(tmp, new Date().toISOString());
    await client.uploadFrom(tmp, 'restart.txt');
    fs.unlinkSync(tmp);
    console.log('✅ Passenger restart triggered (tmp/restart.txt)');
  } catch (err) {
    console.error('❌ Restart failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.close();
  }
})();
