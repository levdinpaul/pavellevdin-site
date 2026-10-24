import { useEffect, useState } from 'react';

/**
 * QR-матрица генерируется локально (пакет qrcode, ленивый импорт) — без сторонних сервисов.
 * Уровень коррекции H: в центре лежит знак бренда, H восстанавливает до 30 % модулей.
 */
export interface QrMatrix {
  size: number;
  dark: boolean[];
}

export function useQrMatrix(text: string): QrMatrix | null {
  const [matrix, setMatrix] = useState<QrMatrix | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then(({ default: QR }) => {
        const { modules } = QR.create(text, { errorCorrectionLevel: 'H' });
        if (alive) setMatrix({ size: modules.size, dark: Array.from(modules.data, Boolean) });
      })
      .catch(() => { /* без QR визитка работает */ });
    return () => { alive = false; };
  }, [text]);
  return matrix;
}

/** Тихая зона по краям — 4 модуля по ISO/IEC 18004 и квадрат под знак в центре (~25 % стороны, ≈ 7 % площади). */
export const QR_QUIET = 4;

export function qrLayout(m: QrMatrix) {
  let logo = Math.round(m.size * 0.25);
  if (logo % 2 === 0) logo += 1; // размер QR всегда нечётный — так квадрат встаёт ровно по центру
  const start = (m.size - logo) / 2;
  const inLogo = (x: number, y: number) => x >= start && x < start + logo && y >= start && y < start + logo;
  return { logo, start, isDark: (x: number, y: number) => m.dark[y * m.size + x] && !inLogo(x, y) };
}
