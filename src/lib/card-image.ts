import { QR_QUIET, qrLayout, type QrMatrix } from './qr';

/**
 * PNG цифровой визитки 1080×1920 (сторис/мессенджеры) — рисуется на canvas в браузере, без зависимостей.
 * Иконки и знак — разметка SVG, снятая с уже отрисованной карточки (одна геометрия на сайте и в картинке).
 */
export interface CardImageData {
  name: string;
  company: string;
  role: string;
  mark: string;
  rows: { icon: string; label: string; value: string }[];
  social: string[];
  photo: string;
  qr: QrMatrix | null;
  qrHint: string;
  qrUrl: string;
}

const W = 1080;
const H = 1920;
const P = 96;
const C = { bg: '#060810', ink1: '#EEF1F8', ink2: '#B7BFD1', ink3: '#7B8499', accent: '#7AA2FF', line: 'rgba(255,255,255,0.14)' };
const FONT = "Onest, system-ui, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** SVG-разметка → картинка нужного размера: currentColor и var(--accent) заменяются на цвета. Пустая/битая разметка → null. */
async function svgImage(markup: string, color: string, height: number) {
  if (!markup) return null;
  const src = markup
    .replace(/currentColor/g, color)
    .replace(/var\(--accent[^)]*\)/g, C.accent)
    .replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.nodeName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
  const w0 = Number(svg.getAttribute('width')) || 24;
  const h0 = Number(svg.getAttribute('height')) || 24;
  const width = Math.round((height * w0) / h0);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  const xml = new XMLSerializer().serializeToString(svg);
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`).catch(() => null);
  return img && { img, width, height };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderCardImage(d: CardImageData): Promise<Blob> {
  const sample = `${d.name}${d.company}${d.role}${d.rows.map((r) => r.label + r.value).join('')}${d.qrHint}`;
  await Promise.all(['400 30px', '500 34px', '600 88px'].map((f) => document.fonts.load(`${f} Onest`, sample).catch(() => [])));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d unavailable');

  // фон «PL Сцена»: #060810 + мягкое синее свечение сверху справа
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, W * 1.1);
  glow.addColorStop(0, 'rgba(122,162,255,0.20)');
  glow.addColorStop(1, 'rgba(122,162,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // фото — круг 320 px, кадр по верхней части портрета
  const photo = await loadImage(d.photo);
  const R = 160;
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, 120 + R, R, 0, Math.PI * 2);
  ctx.clip();
  const side = photo.naturalWidth;
  ctx.drawImage(photo, 0, photo.naturalHeight * 0.04, side, side, W / 2 - R, 120, R * 2, R * 2);
  ctx.restore();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, 120 + R, R + 1, 0, Math.PI * 2);
  ctx.stroke();

  const mark = await svgImage(d.mark, C.ink1, 64);
  if (mark) ctx.drawImage(mark.img, (W - mark.width) / 2, 480, mark.width, mark.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink1;
  ctx.font = `600 88px ${FONT}`;
  ctx.fillText(d.name, W / 2, 640);
  ctx.fillStyle = C.accent;
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText(d.company, W / 2, 700);
  ctx.fillStyle = C.ink2;
  ctx.font = `400 30px ${FONT}`;
  let y = 760;
  for (const line of wrap(ctx, d.role, W - P * 2.4)) {
    ctx.fillText(line, W / 2, y);
    y += 42;
  }

  // контакты: иконка · подпись слева, значение справа
  y += 8;
  ctx.fillStyle = C.line;
  ctx.fillRect(P, y, W - P * 2, 2);
  for (const row of d.rows) {
    const icon = await svgImage(row.icon, C.accent, 36);
    if (icon) ctx.drawImage(icon.img, P, y + 22, icon.width, icon.height);
    ctx.textAlign = 'left';
    ctx.fillStyle = C.ink3;
    ctx.font = `400 26px ${FONT}`;
    ctx.fillText(row.label, P + 60, y + 50);
    ctx.textAlign = 'right';
    ctx.fillStyle = C.ink1;
    ctx.font = `500 32px ${FONT}`;
    ctx.fillText(row.value, W - P, y + 51);
    y += 80;
    ctx.fillStyle = C.line;
    ctx.fillRect(P, y, W - P * 2, 2);
  }

  // соцсети — круглые кнопки в ряд
  const D = 76;
  const gap = 28;
  let x = (W - (d.social.length * D + (d.social.length - 1) * gap)) / 2;
  y += 44;
  for (const markup of d.social) {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.arc(x + D / 2, y + D / 2, D / 2, 0, Math.PI * 2);
    ctx.stroke();
    const icon = await svgImage(markup, C.ink1, 34);
    if (icon) ctx.drawImage(icon.img, x + (D - icon.width) / 2, y + (D - icon.height) / 2, icon.width, icon.height);
    x += D + gap;
  }

  // QR внизу слева + подпись справа
  if (d.qr) {
    const S = 260;
    const qx = P;
    const qy = H - P - S;
    const n = d.qr.size + QR_QUIET * 2;
    const m = S / n;
    const { logo, start, isDark } = qrLayout(d.qr);
    ctx.fillStyle = '#fff';
    roundRect(ctx, qx, qy, S, S, 14);
    ctx.fill();
    ctx.fillStyle = C.bg;
    for (let my = 0; my < d.qr.size; my++) {
      for (let mx = 0; mx < d.qr.size; mx++) {
        if (isDark(mx, my)) ctx.fillRect(qx + (mx + QR_QUIET) * m, qy + (my + QR_QUIET) * m, Math.ceil(m), Math.ceil(m));
      }
    }
    const qm = await svgImage(d.mark, C.bg, logo * m * 0.72);
    if (qm) ctx.drawImage(qm.img, qx + (start + QR_QUIET) * m + (logo * m - qm.width) / 2, qy + (start + QR_QUIET) * m + (logo * m - qm.height) / 2, qm.width, qm.height);

    ctx.textAlign = 'left';
    ctx.fillStyle = C.ink1;
    ctx.font = `500 34px ${FONT}`;
    let ty = qy + 90;
    for (const line of wrap(ctx, d.qrHint, W - P - (qx + S + 44))) {
      ctx.fillText(line, qx + S + 44, ty);
      ty += 46;
    }
    ctx.fillStyle = C.ink3;
    ctx.font = `400 26px ${FONT}`;
    ctx.fillText(d.qrUrl, qx + S + 44, ty + 14);
  }

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}
