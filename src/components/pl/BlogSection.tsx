import { useTranslation } from 'react-i18next';
import posts from '@/data/posts.json';
import { BrandMark } from '@/components/layout/BrandMark';
import { Title } from './Title';

interface Post { slug: string; title: string; excerpt: string; publishedAt: string; updatedAt?: string; readMinutes: number; image: string | null }

const LOCALE = { ru: 'ru-RU', de: 'de-DE', en: 'en-GB' } as const;

/** Секция «Блог» на главной: 3 последние статьи из снимка сборки (scripts/fetch-posts.cjs). Пустой снимок — секции нет. */
export function BlogSection({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const list = ((posts as Record<string, Post[]>)[lang] ?? []).slice(0, 3);
  if (!list.length) return null;
  const fmt = new Intl.DateTimeFormat(LOCALE[lang as keyof typeof LOCALE] ?? 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <section id="blog" className="pl-section" aria-labelledby="pl-blog-title">
      <div className="pl-section__head">
        <div>
          <p className="pl-eyebrow" data-reveal="">{t('pl.blog.eyebrow')}</p>
          <Title id="pl-blog-title" lines={t('pl.blog.title', { returnObjects: true }) as [string, string]} />
        </div>
        {/* Блог отдаёт платформа — обычная ссылка, полная загрузка */}
        <a href={`/${lang}/blog`} className="pl-link" data-reveal="">{t('pl.blog.all')}</a>
      </div>
      <ul className="pl-blog__grid">
        {list.map((p) => (
          <li key={p.slug} data-reveal="">
            <a href={`/${lang}/blog/${p.slug}`} className="pl-blog__card">
              <div className="pl-blog__media">
                {p.image
                  ? <img src={p.image} alt="" width={750} height={422} loading="lazy" decoding="async" />
                  : (
                    // Обложки нет — рисуем кодом в стиле OG: знак + заголовок
                    <div className="pl-blog__cover" aria-hidden="true">
                      <BrandMark size={28} />
                      <span>{p.title}</span>
                    </div>
                  )}
              </div>
              <div className="pl-blog__body">
                <p className="pl-blog__meta">
                  <time dateTime={p.publishedAt}>{fmt.format(new Date(p.publishedAt))}</time>
                  <span aria-hidden="true"> · </span>
                  {t('pl.blog.read', { count: p.readMinutes })}
                </p>
                <h3 className="pl-blog__title">{p.title}</h3>
                <p className="pl-blog__text">{p.excerpt}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
