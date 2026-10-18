import { useTranslation } from 'react-i18next';
import { Counter } from './Counter';
import type { MicroKind } from './micro-kinds';


/**
 * Тематичные micro-UI на HTML/CSS вместо картинок: монохром + акцент, рамка 1px, mono внутри.
 * Анимация проигрывается один раз, когда родитель с data-reveal становится «shown»
 * (только transform/opacity); в SSR, без JS и при reduced-motion — финальное статичное состояние.
 * Тексты — обезличенные примеры, без данных клиентов.
 */
export function MicroUI({ kind }: { kind: MicroKind }) {
  const { t } = useTranslation();
  return (
    <div className="pl-mui" data-kind={kind} aria-hidden="true">
      {kind === 'browser' && (
        <>
          <div className="pl-mui__bar"><i /><i /><i /><span>example.com</span></div>
          <div className="pl-mui__page">
            <span className="pl-mui__sk pl-mui__sk--title" />
            <span className="pl-mui__sk" />
            <span className="pl-mui__sk pl-mui__sk--short" />
          </div>
          <ul className="pl-mui__scores">
            {['Performance', 'Accessibility', 'Best Practices', 'SEO'].map((label) => (
              <li key={label} className="pl-mui__step">
                <span className="pl-mui__ring"><Counter value={100} /></span>
                <span className="pl-mui__label">{label}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {kind === 'serp' && (
        <>
          <div className="pl-mui__snippet pl-mui__step">
            <span className="pl-mui__url">example.com › services</span>
            <span className="pl-mui__serp-title">{t('pl.mui.serpTitle')}</span>
            <span className="pl-mui__stars">★★★★★ <em>rich result</em></span>
          </div>
          <pre className="pl-mui__code">
            <span className="pl-mui__step">{'"@type": "LocalBusiness",'}</span>
            <span className="pl-mui__step">{'"aggregateRating": { … },'}</span>
            <span className="pl-mui__step">{'"areaServed": "Hannover"'}</span>
          </pre>
        </>
      )}

      {kind === 'log' && (
        <pre className="pl-mui__code pl-mui__log">
          <span className="pl-mui__step"><b>POST</b> /api/lead <em className="ok">201</em></span>
          <span className="pl-mui__step">→ telegram.sendMessage <em className="ok">✓</em></span>
          <span className="pl-mui__step">→ mail.send <em className="ok">✓</em></span>
          <span className="pl-mui__step">→ crm.createDeal <em className="ok">✓</em></span>
          <span className="pl-mui__step pl-mui__cursor">_</span>
        </pre>
      )}

      {kind === 'chat' && (
        <div className="pl-mui__chat">
          <p className="pl-mui__bubble pl-mui__bubble--user pl-mui__step">{t('pl.mui.chatQ')}</p>
          <span className="pl-mui__chip pl-mui__step">MCP · crm.search_leads()</span>
          <p className="pl-mui__bubble pl-mui__step">{t('pl.mui.chatA')}</p>
        </div>
      )}

      {kind === 'telegram' && (
        <div className="pl-mui__notice pl-mui__step">
          <span className="pl-mui__avatar">PL</span>
          <span>
            <strong>{t('pl.mui.tgTitle')}</strong>
            <span className="pl-mui__muted">{t('pl.mui.tgText')}</span>
          </span>
          <time>09:41</time>
        </div>
      )}

      {kind === 'containers' && (
        <ul className="pl-mui__list">
          {['next', 'strapi', 'postgres', 'nginx'].map((name) => (
            <li key={name} className="pl-mui__step"><span className="pl-mui__dot" />{name}<em>up</em></li>
          ))}
        </ul>
      )}

      {kind === 'social' && (
        <div className="pl-mui__post pl-mui__step">
          <span className="pl-mui__muted">{t('pl.mui.postWhen')}</span>
          <span className="pl-mui__sk" />
          <span className="pl-mui__sk pl-mui__sk--short" />
          <span className="pl-mui__channels"><i /><i /><i /></span>
        </div>
      )}
    </div>
  );
}
