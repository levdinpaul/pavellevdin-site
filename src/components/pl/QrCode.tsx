import { BrandMark } from '@/components/layout/BrandMark';
import { QR_QUIET, qrLayout, type QrMatrix } from '@/lib/qr';

/** QR на белой плашке (тёмные модули на белом — сканируется на любом фоне и при печати) со знаком в центре. */
export function QrCode({ matrix, label }: { matrix: QrMatrix; label: string }) {
  const { logo, start, isDark } = qrLayout(matrix);
  const n = matrix.size + QR_QUIET * 2;
  let d = '';
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) if (isDark(x, y)) d += `M${x + QR_QUIET} ${y + QR_QUIET}h1v1h-1z`;
  }
  const s = start + QR_QUIET;
  const mark = logo * 0.72;
  return (
    <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} rx="1.5" fill="#fff" />
      <path d={d} fill="#060810" />
      <g transform={`translate(${s + (logo - (mark * 34) / 46) / 2} ${s + (logo - mark) / 2})`} style={{ color: '#060810' }}>
        <BrandMark size={mark} />
      </g>
    </svg>
  );
}
