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
  youtube: 'https://www.youtube.com/@PaulLevdin',
  vk: '',
  dzen: '',
  github: '',
  rutube: '',
} as const;

export function getContacts(lang: string) {
  const email = getEmail(lang);
  return { ...CHANNELS, email, mailto: `mailto:${email}` };
}

export type SocialNetwork = 'telegram' | 'whatsapp' | 'youtube' | 'vk' | 'email';

/** Каналы для соц-панели в порядке показа; пустые пропускаются. */
export function getSocialLinks(lang: string): { network: SocialNetwork; label: string; url: string }[] {
  const c = getContacts(lang);
  const all: { network: SocialNetwork; label: string; url: string }[] = [
    { network: 'telegram', label: 'Telegram', url: c.telegram.url },
    { network: 'whatsapp', label: 'WhatsApp', url: c.whatsapp.url },
    { network: 'youtube', label: 'YouTube', url: c.youtube },
    { network: 'vk', label: 'VK', url: c.vk },
    { network: 'email', label: 'E-mail', url: c.mailto },
  ];
  return all.filter((x) => x.url);
}

/** Публичные профили для JSON-LD sameAs — только непустые (без мессенджера с номером и почты). */
export function getSameAs(): string[] {
  const { telegram, youtube, vk, dzen, github, rutube, instagram } = CHANNELS;
  return [telegram.url, youtube, vk, dzen, github, rutube, instagram].filter(Boolean) as string[];
}

export type Contacts = ReturnType<typeof getContacts>;
