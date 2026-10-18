/* eslint-disable @typescript-eslint/no-explicit-any */
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from './App';
import { loadBlogListItems } from '@/hooks/useBlog';
import { loadBlogPostBySlug } from '@/data/blog-loader';
import { setServerBlogData, type BlogHydrationData } from '@/data/blog-hydration';
import i18n from './i18n';

export interface RenderResult {
  html: string;
  head: string;
  htmlAttributes: string;
  /** JSON для инъекции в window.__BLOG_DATA__ (клиентская гидратация блога); undefined для не-блог-маршрутов. */
  dehydrate?: string;
}

// Загружает данные блога для маршрута, кладёт в SSR-стор (чтобы useBlog/BlogPost отрендерились
// с данными) и возвращает JSON для window.__BLOG_DATA__. Для не-блог-маршрутов — null.
async function prepareBlogData(url: string, lang: string): Promise<string | null> {
  const isList = new RegExp(`^/${lang}/blog/?$`).test(url);
  const postMatch = new RegExp(`^/${lang}/blog/([^/]+)/?$`).exec(url);
  if (!isList && !postMatch) return null;

  const list = await loadBlogListItems(lang);
  const data: BlogHydrationData = { list: { [lang]: list } };
  if (postMatch) {
    const slug = postMatch[1];
    const loaded = await loadBlogPostBySlug(slug, lang);
    if (loaded) data.posts = { [`${lang}:${slug}`]: loaded as any };
  }
  setServerBlogData(data);
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * SSR-рендер одного маршрута в строку. В отличие от puppeteer-capture, отдаёт
 * React-канонический HTML → гидрация на клиенте проходит чисто (без regeneration),
 * поэтому LCP остаётся на первом paint пререндера, а не скачет на момент гидрации.
 *
 * Используем renderToPipeableStream + onAllReady (а не renderToString): он ДОЖИДАЕТСЯ
 * резолва React.lazy, поэтому ленивые под-страницы (services/portfolio/…) рендерятся
 * полностью, а не как Suspense-fallback. Рендерим тот же <AppRoutes>, что и клиент,
 * → структура совпадает → гидрация чистая.
 *
 * ВНИМАНИЕ: onAllReady ждёт только ленивый КОД, а не данные из useEffect —
 * страницы с async-данными (блог) требуют отдельной сериализации стейта.
 */
export async function render(url: string, lang: string): Promise<RenderResult> {
  await i18n.changeLanguage(lang);

  const dehydrate = await prepareBlogData(url, lang);

  const helmetContext: { helmet?: any } = {};
  const app = (
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary>
        <ThemeProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );

  const html: string = await new Promise((resolve, reject) => {
    let buf = '';
    const writable = new Writable({
      write(chunk, _enc, cb) { buf += chunk.toString(); cb(); },
      final(cb) { cb(); resolve(buf); },
    });
    const { pipe } = renderToPipeableStream(app, {
      // React 19.2 выносит крупные Suspense-границы в отдельные сегменты ($RC/$RB-скрипты) даже при onAllReady.
      // Для статичного пререндера нужен цельный HTML без стриминговых артефактов → без порога.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      onAllReady() { pipe(writable); },
      onError(err) { reject(err); },
    });
  });

  const h = helmetContext.helmet;
  const head = h
    ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()]
        .filter(Boolean)
        .join('\n    ')
    : '';
  const htmlAttributes = h ? h.htmlAttributes.toString() : '';

  // Сбрасываем стор, чтобы данные не «протекли» в следующий маршрут пререндер-цикла.
  setServerBlogData({});

  return { html, head, htmlAttributes, dehydrate: dehydrate ?? undefined };
}
