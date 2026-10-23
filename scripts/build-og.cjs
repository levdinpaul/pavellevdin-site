#!/usr/bin/env node
/**
 * npm run og — OG-картинки 1200×630 jpg (соцсети и мессенджеры режут нестандартные пропорции).
 *
 * Кейсы: public/images/portfolio/<slug>/desktop.webp → public/og/<slug>.jpg (кадр сверху, первый экран сайта).
 * «Обо мне»: public/about/photo-720.webp → public/og/about.jpg (фото справа, слева логотип на фоне бренда #060810).
 * Запускать после добавления проекта в portfolio.json или замены фото (`npm run photo`); результат коммитится.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'og');
const W = 1200;
const H = 630;
const BG = '#060810';

const jpg = (img) => img.jpeg({ quality: 82, mozjpeg: true });

async function cases() {
  const dir = path.join(root, 'public', 'images', 'portfolio');
  const slugs = fs.readdirSync(dir).filter((s) => fs.existsSync(path.join(dir, s, 'desktop.webp')));
  for (const slug of slugs) {
    const out = path.join(outDir, `${slug}.jpg`);
    await jpg(sharp(path.join(dir, slug, 'desktop.webp')).resize(W, H, { fit: 'cover', position: 'top' })).toFile(out);
    console.log('✓', path.relative(root, out));
  }
}

async function about() {
  const src = path.join(root, 'public', 'about', 'photo-720.webp');
  const photo = await sharp(src).resize({ height: H }).toBuffer();
  const { width } = await sharp(photo).metadata();
  // Тонкая акцентная линия слева от фото — в цвет --accent
  const line = Buffer.from(`<svg width="${W}" height="${H}"><rect x="${W - width - 1}" y="0" width="1" height="${H}" fill="#7AA2FF" fill-opacity="0.5"/></svg>`);
  // Слева — горизонтальный логотип (светлый на тёмном), по центру свободной части
  const logoW = Math.min(600, W - width - 2 * 64);
  const logo = await sharp(path.join(root, 'public', 'brand', 'logo-horizontal@2x.png')).resize({ width: logoW }).toBuffer();
  const { height: logoH } = await sharp(logo).metadata();
  const out = path.join(outDir, 'about.jpg');
  await jpg(
    sharp({ create: { width: W, height: H, channels: 3, background: BG } })
      .composite([
        { input: photo, left: W - width, top: 0 },
        { input: line, left: 0, top: 0 },
        { input: logo, left: Math.round((W - width - logoW) / 2), top: Math.round((H - logoH) / 2) },
      ]),
  ).toFile(out);
  console.log('✓', path.relative(root, out));
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  await cases();
  await about();
})().catch((e) => { console.error(e); process.exit(1); });
