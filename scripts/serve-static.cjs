#!/usr/bin/env node
// Статическая раздача dist/ с семантикой боевого Apache DirectoryIndex:
//   GET /ru  ->  dist/ru/index.html  (пререндер-файл, если существует)
// В отличие от `vite preview`, который для /ru отдаёт SPA-fallback (пустой dist/index.html),
// этот сервер отдаёт реальный пререндер — то, что видят пользователи и краулеры в проде.
// Нужен для честного замера Lighthouse. Запуск: node scripts/serve-static.cjs [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const PORT = Number(process.argv[2]) || 4188;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain',
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const fp = path.join(dist, urlPath);
  if (fp.startsWith(dist) && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    return fs.createReadStream(fp).pipe(res);
  }
  // DirectoryIndex: <path>/index.html (пререндер-файл маршрута)
  const idx = path.join(dist, urlPath, 'index.html');
  if (idx.startsWith(dist) && fs.existsSync(idx)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return fs.createReadStream(idx).pipe(res);
  }
  // SPA fallback (как .htaccess)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(dist, 'index.html')).pipe(res);
}).listen(PORT, () => console.log(`serve-static (Apache-like DirectoryIndex) → http://localhost:${PORT}`));
