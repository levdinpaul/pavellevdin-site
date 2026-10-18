import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Title } from './Title';
import { formatFrom, minSitePrice, formatAmount, packageCopy, PACKAGES } from '@/data/pricing';

/** Блок «Стоимость» на /services: пакеты «от …» + сопровождение. ru — ₽, de/en — € netto. */
export function Pricing({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const projects = PACKAGES.filter((p) => p.group === 'project');
  const ongoing = PACKAGES.filter((p) => p.group === 'ongoing');
  const vatNote = t('pl.prices.vatNote');

  return (
    <section id="prices" className="pl-container pl-section pl-prices" aria-labelledby="pl-prices-title">
      <p className="pl-eyebrow" data-reveal="">{t('pl.prices.eyebrow')}</p>
      <Title id="pl-prices-title" lines={[t('pl.prices.title')]} />
      <p className="pl-lead pl-prices__lead" data-reveal="">{t('pl.prices.lead')}</p>

      <ul className="pl-prices__grid">
        {projects.map((p) => {
          const copy = packageCopy(p, lang);
          return (
            <li key={p.id} className="pl-price" data-featured={p.featured || undefined} data-reveal="">
              <h3 className="pl-price__title">{copy.title}</h3>
              <p className="pl-price__value">{formatFrom(lang, p)}</p>
              <ul className="pl-price__points">{copy.points.map((point) => <li key={point}>{point}</li>)}</ul>
              <p className="pl-price__meta"><span>{t('pl.prices.duration')}</span> {copy.duration}</p>
              <Link to={`/${lang}/brief`} className="pl-price__cta">{t('pl.prices.discuss')}<span aria-hidden="true">→</span></Link>
            </li>
          );
        })}
      </ul>

      <div className="pl-prices__ongoing" data-reveal="">
        <h3 className="pl-prices__subtitle">{t('pl.prices.ongoing')}</h3>
        <dl>
          {ongoing.map((p) => {
            const copy = packageCopy(p, lang);
            return (
              <div key={p.id}>
                <dt>{copy.title}<span>{copy.points[0]}</span></dt>
                <dd>{formatFrom(lang, p)}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <p className="pl-prices__note" data-reveal="">
        {t('pl.prices.note')}
        {vatNote && <> <span className="pl-prices__vat">{vatNote}</span></>}
      </p>
    </section>
  );
}

/** Одна строка на главной: «Сайты от 60 000 ₽» → /services#prices. */
export function PriceLine({ lang }: { lang: string }) {
  const { t } = useTranslation();
  return (
    <p className="pl-price-line" data-reveal="">
      {t('pl.prices.homeLine', { price: formatAmount(lang, minSitePrice(lang)) })}
      <Link to={`/${lang}/services#prices`} className="pl-link">{t('pl.prices.homeLink')}</Link>
    </p>
  );
}
