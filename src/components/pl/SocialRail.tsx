import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getSocialLinks, type SocialLink, type SocialNetwork } from '@/constants/contacts';
import { MailIcon, TelegramIcon, VkIcon, WhatsAppIcon, YouTubeIcon } from '@/components/layout/social-icons';

const ICONS: Record<SocialNetwork, ReactNode> = {
  telegram: <TelegramIcon size={20} />,
  tgchannel: <TelegramIcon size={20} />,
  whatsapp: <WhatsAppIcon size={20} />,
  youtube: <YouTubeIcon size={20} />,
  vk: <VkIcon size={20} />,
  email: <MailIcon size={20} />,
};

/** Каналы «Для связи» (личный контакт); остальное — публичные соцсети. Телефон текстом не выводится (только /business-card). */
const CONTACT_NETWORKS: SocialNetwork[] = ['telegram', 'whatsapp', 'email'];

/**
 * Боковая панель: фиксирована справа по центру, только на desktop (≥1024 px; на мобильном — ContactFab).
 * Два раздельных блока одного стиля: сверху «Для связи» (Telegram, WhatsApp, e-mail), ниже — соцсети (TG-канал, YouTube, VK).
 * Ссылки — из contacts.ts (e-mail по локали), пустые каналы не выводятся. Цель social_click вешает bindContactClickGoals по data-social.
 */
export function SocialRail({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const links = getSocialLinks(lang);
  const contact = links.filter((x) => CONTACT_NETWORKS.includes(x.network));
  const social = links.filter((x) => !CONTACT_NETWORKS.includes(x.network));

  const list = (items: SocialLink[]) => (
    <ul>
      {items.map((x) => {
        const label = x.labelKey ? t(x.labelKey) : x.label;
        return (
          <li key={x.network}>
            <a
              href={x.url}
              data-social={x.network}
              aria-label={label}
              title={label}
              {...(x.network === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {ICONS[x.network]}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="pl-rail">
      {contact.length > 0 && <nav className="pl-rail__group pl-rail__group--contact" aria-label={t('pl.rail.contactLabel')}>{list(contact)}</nav>}
      {social.length > 0 && <nav className="pl-rail__group pl-rail__group--social" aria-label={t('pl.rail.label')}>{list(social)}</nav>}
    </div>
  );
}
