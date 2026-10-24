/**
 * Файл контакта (.vcf, vCard 3.0) для /business-card. Строки — CRLF, длинные (PHOTO) свёрнуты по 75 символов.
 * Телефон — только здесь и на карточке (решение Pavel 2026-10-24). Адрес — только город.
 * Соцсети: X-SOCIALPROFILE (iOS) + подписанные URL (Android показывает их как сайты).
 */
export interface VcardData {
  title: string;
  tel: string;
  email: string;
  site: string;
  social: { label: string; type: string; url: string }[];
  photoBase64?: string;
}

// Экранирование TEXT-значений по RFC 2426: \ , ; и перевод строки
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const fold = (line: string) => (line.length <= 75 ? line : (line.match(/.{1,74}/g) ?? []).join('\r\n '));

export function buildVcard(v: VcardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Levdin;Pavel;;;',
    'FN:Pavel Levdin',
    'ORG:Innovativ Digitalbau',
    `TITLE:${esc(v.title)}`,
    `TEL;TYPE=CELL,VOICE:${v.tel}`,
    `EMAIL;TYPE=INTERNET,WORK:${v.email}`,
    `URL;TYPE=WORK:${v.site}`,
    'ADR;TYPE=WORK:;;;Hannover;;;Germany',
    ...v.social.map((s) => `X-SOCIALPROFILE;TYPE=${s.type}:${s.url}`),
    ...v.social.flatMap((s, i) => [`item${i + 1}.URL:${s.url}`, `item${i + 1}.X-ABLabel:${esc(s.label)}`]),
    ...(v.photoBase64 ? [fold(`PHOTO;ENCODING=b;TYPE=JPEG:${v.photoBase64}`)] : []),
    'END:VCARD',
  ];
  return lines.join('\r\n') + '\r\n';
}

/** Картинка → base64 без префикса data:. Нет сети — контакт сохранится без фото. */
export async function fetchBase64(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
