import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getSocialLinks, type SocialNetwork } from '@/constants/contacts';
import { MailIcon, TelegramIcon, VkIcon, WhatsAppIcon, YouTubeIcon } from '@/components/layout/social-icons';

const ICONS: Record<SocialNetwork, ReactNode> = {
  telegram: <TelegramIcon size={20} />,
  whatsapp: <WhatsAppIcon size={20} />,
  youtube: <YouTubeIcon size={20} />,
  vk: <VkIcon size={20} />,
  email: <MailIcon size={20} />,
};

/**
 * Соц-панель: фиксирована справа по центру, только на desktop (≥1024 px; на мобильном — ContactFab).
 * Ссылки — из contacts.ts, пустые каналы не выводятся. Цель social_click вешает bindContactClickGoals по data-social.
 */
export function SocialRail({ lang }: { lang: string }) {
  const { t } = useTranslation();
  return (
    <nav className="pl-rail" aria-label={t('pl.rail.label')}>
      <ul>
        {getSocialLinks(lang).map((x) => (
          <li key={x.network}>
            <a
              href={x.url}
              data-social={x.network}
              aria-label={x.label}
              title={x.label}
              {...(x.network === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {ICONS[x.network]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
