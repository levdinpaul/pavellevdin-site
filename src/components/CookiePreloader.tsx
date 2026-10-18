import { Check, Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

const fallback = {
  de: {
    title: 'Cookies & Analyse',
    desc: 'Notwendige Cookies sind immer aktiv. Mit „Akzeptieren“ stimmen Sie zusätzlich der Web-Analyse (Yandex.Metrica, Google Analytics) zu. Bei „Ablehnen“ bleiben nur notwendige Cookies.',
    accept: 'Akzeptieren',
    decline: 'Ablehnen',
  },
  en: {
    title: 'Cookies & analytics',
    desc: 'Necessary cookies are always on. Click “Accept” to also allow web analytics (Yandex.Metrica, Google Analytics). Choose “Decline” to keep only necessary cookies.',
    accept: 'Accept',
    decline: 'Decline',
  },
  ru: {
    title: 'Cookies и аналитика',
    desc: 'Необходимые cookies работают всегда. Нажимая «Принять», вы соглашаетесь также на веб-аналитику (Яндекс.Метрика, Google Analytics). «Отклонить» — останутся только необходимые.',
    accept: 'Принять',
    decline: 'Отклонить',
  },
};

export function CookiePreloader({ onAccept, onDecline }: CookieConsentProps) {
  const { i18n } = useTranslation();
  const lang = (['de', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'ru') as keyof typeof fallback;
  const text = fallback[lang];

  return (
    <aside
      className="rise fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0E121E]/95 p-4 text-[#EEF1F8] shadow-2xl backdrop-blur-2xl"
    >
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#7AA2FF]/10 text-[#B9CDFF]">
          <Cookie className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-black">{text.title}</h2>
          <p className="mt-1 text-sm leading-6 text-white/62">{text.desc}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAccept} className="h-10 rounded-full bg-[#7AA2FF] px-5 font-semibold text-[#061022] hover:bg-[#B9CDFF]">
            <Check className="mr-2 h-4 w-4" />
            {text.accept}
          </Button>
          <Button onClick={onDecline} variant="outline" className="h-10 rounded-full border-white/20 bg-white/[0.04] px-5 font-semibold text-[#EEF1F8] hover:bg-white hover:text-[#0A0E1A]">
            {text.decline}
          </Button>
        </div>
      </div>
    </aside>
  );
}
