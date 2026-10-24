// Минимальные типы qrcode — только create() для useQrMatrix (src/lib/qr.ts).
// @types/qrcode не ставим: он тянет типы Node, и setTimeout в браузерном коде начинает возвращать Timeout.
declare module 'qrcode' {
  interface QRCodeModules {
    size: number;
    data: Uint8Array;
  }
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
  const QRCode: {
    create(text: string, options?: QRCodeOptions): { modules: QRCodeModules };
  };
  export default QRCode;
}
