/**
 * Экспресс-аудит чужого сайта для формы «Бесплатный аудит»: HTTPS и заголовки, базовое SEO, мобильная вёрстка,
 * robots/sitemap, структурированные данные; PageSpeed — только при PSI_API_KEY (без ключа квота общая и быстро кончается).
 * Защита от SSRF: только http(s) на 80/443, имя должно резолвиться в публичный адрес, редиректы проверяются заново.
 */
const dns = require('dns').promises;
const net = require('net');
const { getEnv } = require('./env');

const TIMEOUT = 10000;
const MAX_HTML = 1.5 * 1024 * 1024;
const UA = 'Mozilla/5.0 (compatible; InnovativDigitalbau-Audit/1.0; +https://pavellevdin.ru)';

function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:');
}

/** Нормализует ввод пользователя в URL и проверяет, что он смотрит в публичный интернет. */
async function safeUrl(input) {
  let raw = String(input || '').trim();
  if (!raw) throw new Error('empty');
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('protocol');
  if (u.port && !['80', '443'].includes(u.port)) throw new Error('port');
  if (u.username || u.password) throw new Error('credentials');
  if (!u.hostname.includes('.') || net.isIP(u.hostname)) throw new Error('host');
  const addrs = await dns.lookup(u.hostname, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error('private');
  return u;
}

/** GET с ручными редиректами (каждый шаг — через safeUrl). */
async function fetchSafe(url, { maxRedirects = 5, method = 'GET' } = {}) {
  let current = await safeUrl(url);
  const chain = [];
  for (let i = 0; i <= maxRedirects; i++) {
    const started = Date.now();
    const res = await fetch(current, { method, redirect: 'manual', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(TIMEOUT) });
    const ms = Date.now() - started;
    chain.push({ url: current.href, status: res.status, ms });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      current = await safeUrl(new URL(loc, current).href);
      continue;
    }
    let body = '';
    if (method === 'GET') {
      const buf = Buffer.from(await res.arrayBuffer());
      body = buf.subarray(0, MAX_HTML).toString('utf8');
    }
    return { res, body, chain, finalUrl: current };
  }
  throw new Error('redirects');
}

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };
const count = (html, re) => (html.match(re) || []).length;
const decode = (s) => (s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function psi(url) {
  const key = getEnv('PSI_API_KEY', '');
  if (!key) return null;
  const q = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
  try {
    const j = await (await fetch(q, { signal: AbortSignal.timeout(60000) })).json();
    const lh = j.lighthouseResult;
    if (!lh) return null;
    return {
      score: Math.round(lh.categories.performance.score * 100),
      lcp: Math.round(lh.audits['largest-contentful-paint'].numericValue),
      cls: +lh.audits['cumulative-layout-shift'].numericValue.toFixed(3),
      tbt: Math.round(lh.audits['total-blocking-time'].numericValue),
    };
  } catch {
    return null;
  }
}

/**
 * Возвращает { url, checks: [{ id, ok, value, hint }], score, psi }.
 * ok: true / false / null (не применимо). score — доля пройденных проверок, %.
 */
async function auditSite(input) {
  const { res, body: html, chain, finalUrl } = await fetchSafe(input);
  const origin = `${finalUrl.protocol}//${finalUrl.host}`;
  const h = (n) => res.headers.get(n);
  const checks = [];
  const add = (id, ok, value = '', hint = '') => checks.push({ id, ok, value: String(value ?? ''), hint });

  // Доступность и HTTPS
  add('status', res.status === 200, `HTTP ${res.status}`, 'Главная должна отвечать 200');
  add('https', finalUrl.protocol === 'https:', finalUrl.protocol.replace(':', ''), 'Сайт должен открываться по HTTPS');
  try {
    const http = await fetchSafe(`http://${finalUrl.host}/`, { method: 'HEAD', maxRedirects: 3 });
    add('httpRedirect', http.finalUrl.protocol === 'https:', http.chain.map((c) => c.status).join('→'), 'http:// должен перенаправлять на https://');
  } catch { add('httpRedirect', null, '—'); }
  const ttfb = chain[chain.length - 1].ms;
  add('responseTime', ttfb < 800, `${ttfb} мс`, 'Сервер должен отвечать быстрее 0,8 с');
  add('redirects', chain.length <= 2, `${chain.length - 1}`, 'Лишние редиректы замедляют загрузку');

  // Заголовки безопасности
  add('hsts', Boolean(h('strict-transport-security')), h('strict-transport-security') ? 'есть' : 'нет', 'Strict-Transport-Security');
  add('xcto', (h('x-content-type-options') || '').toLowerCase() === 'nosniff', h('x-content-type-options') || 'нет', 'X-Content-Type-Options: nosniff');
  add('csp', Boolean(h('content-security-policy') || h('content-security-policy-report-only')), h('content-security-policy') ? 'есть' : 'нет', 'Content-Security-Policy');
  add('referrer', Boolean(h('referrer-policy')), h('referrer-policy') || 'нет', 'Referrer-Policy');

  // SEO
  const title = decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  add('title', Boolean(title) && title.length >= 10 && title.length <= 70, title ? `${title.length} симв.` : 'нет', 'Title 10–70 символов, уникальный для страницы');
  const desc = decode(pick(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i));
  add('description', Boolean(desc) && desc.length >= 70 && desc.length <= 170, desc ? `${desc.length} симв.` : 'нет', 'Meta description 70–170 символов');
  const h1 = count(html, /<h1[\s>]/gi);
  add('h1', h1 === 1, `${h1}`, 'Ровно один заголовок H1');
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || pick(html, /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  add('canonical', Boolean(canonical), canonical || 'нет', 'Canonical-ссылка');
  const robotsMeta = pick(html, /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i) || '';
  add('indexable', !/noindex/i.test(robotsMeta), robotsMeta || 'index', 'Страница не должна быть закрыта noindex');
  add('lang', /<html[^>]+lang=["'][a-z]{2}/i.test(html), pick(html, /<html[^>]+lang=["']([^"']+)["']/i) || 'нет', 'Атрибут lang у <html>');
  add('og', /property=["']og:title["']/i.test(html) && /property=["']og:image["']/i.test(html), /og:image/i.test(html) ? 'есть' : 'нет', 'Open Graph: og:title и og:image для соцсетей и мессенджеров');
  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const ldTypes = ld.flatMap((j) => { try { const o = JSON.parse(j); return [].concat(o['@graph'] || o).map((x) => x && x['@type']).filter(Boolean); } catch { return ['ошибка JSON']; } });
  add('schema', ldTypes.length > 0 && !ldTypes.includes('ошибка JSON'), ldTypes.join(', ') || 'нет', 'Структурированные данные schema.org (Organization/LocalBusiness)');
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=/i.test(t)).length;
  add('alt', noAlt === 0, `${noAlt} из ${imgs.length} без alt`, 'У картинок должен быть alt');

  // Мобильная версия
  add('viewport', /<meta[^>]+name=["']viewport["'][^>]*width=device-width/i.test(html), /name=["']viewport/i.test(html) ? 'есть' : 'нет', 'Meta viewport width=device-width');
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  add('htmlSize', kb < 300, `${kb} КБ`, 'HTML главной легче 300 КБ');

  // robots.txt / sitemap
  let sitemapUrl = `${origin}/sitemap.xml`;
  try {
    const r = await fetchSafe(`${origin}/robots.txt`, { maxRedirects: 3 });
    const ok = r.res.status === 200 && /user-agent/i.test(r.body);
    add('robots', ok, `HTTP ${r.res.status}`, 'Файл robots.txt');
    const sm = r.body.match(/^\s*sitemap:\s*(\S+)/im);
    if (sm) sitemapUrl = sm[1];
  } catch { add('robots', false, 'нет', 'Файл robots.txt'); }
  try {
    const s = await fetchSafe(sitemapUrl, { maxRedirects: 3 });
    add('sitemap', s.res.status === 200 && /<(urlset|sitemapindex)/i.test(s.body), `HTTP ${s.res.status}`, 'Карта сайта sitemap.xml');
  } catch { add('sitemap', false, 'нет', 'Карта сайта sitemap.xml'); }

  const speed = await psi(finalUrl.href);
  if (speed) add('pagespeed', speed.score >= 80, `${speed.score}/100 (LCP ${(speed.lcp / 1000).toFixed(1)} с)`, 'PageSpeed (мобильный) от 80');

  const rated = checks.filter((c) => c.ok !== null);
  const score = Math.round((rated.filter((c) => c.ok).length / rated.length) * 100);
  return { url: finalUrl.href, checkedAt: new Date().toISOString(), checks, score, psi: speed };
}

module.exports = { auditSite, safeUrl };
