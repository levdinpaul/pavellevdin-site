// Единый источник контактов для шапки, футера, страниц и JSON-LD.
// Телефон текстом не публикуется нигде: WhatsApp — только ссылкой-кнопкой.
// Пустая строка = канала нет, иконка/ссылка не выводится.

/** Почта .de включается флагом VITE_DE_MAIL_READY=true после регистрации домена pavellevdin.de. */
export const DE_MAIL_READY = import.meta.env.VITE_DE_MAIL_READY === 'true';

export const EMAILS = {
  ru: 'info@pavellevdin.ru',
  eu: 'info@pavellevdin.de',
} as const;

/** ru → info@pavellevdin.ru; de/en → info@pavellevdin.de (пока домена нет — тоже .ru). */
export function getEmail(lang: string): string {
  return lang !== 'ru' && DE_MAIL_READY ? EMAILS.eu : EMAILS.ru;
}

const CHANNELS = {
  telegram: { url: 'https://t.me/PavelLevdin', handle: '@PavelLevdin' },
  whatsapp: { url: 'https://wa.me/4917643141306' },
  instagram: '',
} as const;

export function getContacts(lang: string) {
  const email = getEmail(lang);
  return { ...CHANNELS, email, mailto: `mailto:${email}` };
}

export type Contacts = ReturnType<typeof getContacts>;
