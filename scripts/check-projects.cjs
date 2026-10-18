#!/usr/bin/env node
// Build-time проверка доступности сайтов портфолио → src/data/projects-status.json
// (зелёная точка «онлайн» на карточках). Браузер ничего не запрашивает.
// Сбой сети не ломает сборку: при ошибке сохраняется прежний статус.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'portfolio.json'), 'utf8'));
const outFile = path.join(root, 'src', 'data', 'projects-status.json');
const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'pavellevdin.ru build check' } });
    return res.status < 500 && res.status !== 404;
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  const out = {};
  await Promise.all(projects.map(async (p) => {
    try {
      out[p.slug] = { online: await check(p.url), checkedAt: new Date().toISOString().slice(0, 10) };
    } catch {
      out[p.slug] = prev[p.slug] ?? { online: true, checkedAt: null };
    }
  }));
  const sorted = Object.fromEntries(projects.map((p) => [p.slug, out[p.slug]]));
  fs.writeFileSync(outFile, JSON.stringify(sorted, null, 2) + '\n');
  const off = projects.filter((p) => !out[p.slug].online).map((p) => p.slug);
  console.log(`✅ Статус проектов: ${projects.length - off.length}/${projects.length} онлайн${off.length ? ` (недоступны: ${off.join(', ')})` : ''}`);
})();
