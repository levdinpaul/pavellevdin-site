// Единый источник контактов для шапки, футера и главной.
// Пустая строка = канала нет, иконка/ссылка не выводится.
export const CONTACTS = {
  telegram: { url: 'https://t.me/PavelLevdin', handle: '@PavelLevdin' },
  whatsapp: { url: 'https://wa.me/4917643141306', phone: '+49 176 43141306' },
  email: 'levdin.pavel@yandex.ru',
  instagram: '',
} as const;
