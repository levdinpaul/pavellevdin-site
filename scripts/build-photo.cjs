#!/usr/bin/env node
/**
 * npm run photo — пересобирает фото «Обо мне» из исходника.
 *
 * Исходник: _design/photo-source.(jpg|jpeg|png|webp|avif) — вне git (папка _design в .gitignore).
 * Чтобы заменить фото: положить новый файл как _design/photo-source.<ext> и запустить `npm run photo`.
 * Результат: public/about/photo-{480,720}.{avif,webp}, каждый файл ≤ 90 КБ
 * (качество подбирается автоматически). Ч/б исходник кодируется в оттенках серого (вид тот же, вес меньше).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, '_design');
const outDir = path.join(root, 'public', 'about');
const MAX_BYTES = 90 * 1024;
const WIDTHS = [480, 720];

const src = fs.readdirSync(srcDir).find((f) => /^photo-source\.(jpe?g|png|webp|avif)$/i.test(f));
if (!src) {
  console.error('❌ Нет исходника: положите фото в _design/photo-source.jpg|png|webp|avif');
  process.exit(1);
}

async function encode(width, format, gray) {
  for (let q = format === 'avif' ? 60 : 82; q >= 20; q -= 6) {
    let img = sharp(path.join(srcDir, src)).resize({ width, withoutEnlargement: true });
    if (gray) img = img.grayscale();
    const buf = await img[format]({ quality: q, effort: 6 }).toBuffer();
    if (buf.length <= MAX_BYTES) return { buf, q };
  }
  throw new Error(`не удалось ужать ${width}w ${format} до ${MAX_BYTES / 1024} КБ`);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const meta = await sharp(path.join(srcDir, src)).metadata();
  const { channels } = await sharp(path.join(srcDir, src)).stats();
  const gray = channels.length >= 3 && Math.max(Math.abs(channels[0].mean - channels[1].mean), Math.abs(channels[1].mean - channels[2].mean)) < 2;
  console.log(`📷 ${src}: ${meta.width}×${meta.height}${gray ? ' (ч/б)' : ''}`);
  for (const w of WIDTHS) {
    for (const fmt of ['avif', 'webp']) {
      const { buf, q } = await encode(w, fmt, gray);
      const file = path.join(outDir, `photo-${w}.${fmt}`);
      fs.writeFileSync(file, buf);
      console.log(`  ✓ ${path.relative(root, file)}  q=${q}  ${(buf.length / 1024).toFixed(0)} КБ`);
    }
  }
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
