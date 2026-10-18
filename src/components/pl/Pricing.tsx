import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Title } from './Title';
import { formatFrom, formatFxDate, minSitePrice, formatAmount, packageCopy, PACKAGES } from '@/data/pricing';
import { useFxRate } from '@/data/fx';

/** Блок «Стоимость» на /services: пакеты «от …» + сопровождение. ru — ₽, de/en — те же цены в € по курсу ЦБ РФ. */
export function Pricing({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const fx = useFxRate(lang);
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
              <p className="pl-price__value">{formatFrom(lang, p, fx)}</p>
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
                <dd>{formatFrom(lang, p, fx)}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <p className="pl-prices__note" data-reveal="">
        {t('pl.prices.note')}
        {lang !== 'ru' && <> <span className="pl-prices__fx">{t('pl.prices.fxNote', { date: formatFxDate(lang, fx.date) })}</span></>}
        {vatNote && <> <span className="pl-prices__vat">{vatNote}</span></>}
      </p>
    </section>
  );
}

/** Одна строка на главной: «Сайты от 45 000 ₽» → /services#prices (de/en — в € по курсу ЦБ РФ). */
export function PriceLine({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const fx = useFxRate(lang);
  return (
    <p className="pl-price-line" data-reveal="">
      {t('pl.prices.homeLine', { price: formatAmount(lang, minSitePrice(lang, fx)) })}
      <Link to={`/${lang}/services#prices`} className="pl-link">{t('pl.prices.homeLink')}</Link>
      {lang !== 'ru' && <span className="pl-price-line__fx">{t('pl.prices.fxNote', { date: formatFxDate(lang, fx.date) })}</span>}
    </p>
  );
}
