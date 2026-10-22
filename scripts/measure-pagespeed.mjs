#!/usr/bin/env node
// Замер Lighthouse (performance, mobile + desktop) живых сайтов из портфолио → src/data/pagespeed.json.
// Запускается вручную (не в сборке): node scripts/measure-pagespeed.mjs [slug ...]. Медиана из 3 прогонов.
// Chrome — из puppeteer (devDependency); Lighthouse 12 — путь к CLI в LIGHTHOUSE_CLI (npm i lighthouse@12 где угодно).
// Сайты в статусе preview не меряются: цифры должны быть проверяемыми на pagespeed.web.dev.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
// puppeteer ≥ 24: executablePath() асинхронный — без await в --chrome-path попадал «[object Promise]»
// CHROME_PATH — свой Chrome (на Windows Chrome for Testing из puppeteer под Lighthouse 12 зависает — берите системный)
const chrome = process.env.CHROME_PATH || await require('puppeteer').executablePath();
const out = path.join(root, 'src', 'data', 'pagespeed.json');
const RUNS = 3;
const LH = process.env.LIGHTHOUSE_CLI;
if (!LH || !fs.existsSync(LH)) { console.error('Укажите LIGHTHOUSE_CLI=<путь>/node_modules/lighthouse/cli/index.js'); process.exit(1); }

const projects = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'portfolio.json'), 'utf8'));
const only = process.argv.slice(2);
const data = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
const tmp = path.join(os.tmpdir(), `lh-${process.pid}.json`);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

function measure(url, desktop) {
  const scores = [];
  for (let i = 0; i < RUNS; i++) {
    try {
      execFileSync(process.execPath, [LH, url, '--quiet', '--only-categories=performance', '--output=json', `--output-path=${tmp}`,
        `--chrome-path=${chrome}`, '--chrome-flags=--headless=new --no-sandbox', ...(desktop ? ['--preset=desktop'] : [])], { stdio: 'ignore', timeout: 180000 });
      scores.push(Math.round(JSON.parse(fs.readFileSync(tmp, 'utf8')).categories.performance.score * 100));
    } catch (e) {
      console.log(`  ⚠ ${url} ${desktop ? 'desktop' : 'mobile'}: ${e.message.slice(0, 80)}`);
    }
  }
  return scores.length ? median(scores) : null;
}

for (const p of projects) {
  if (p.status === 'preview' || (only.length && !only.includes(p.slug))) continue;
  const mobile = measure(p.url, false);
  const desktop = measure(p.url, true);
  if (mobile == null || desktop == null) { console.log(`✗ ${p.slug}: замер не удался, прежнее значение оставлено`); continue; }
  data[p.slug] = { ...(data[p.slug] || {}), url: p.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), mobile, desktop, date: new Date().toISOString().slice(0, 10) };
  console.log(`✓ ${p.slug}: mobile ${mobile}, desktop ${desktop}`);
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
}
fs.rmSync(tmp, { force: true });
