/* eslint-disable @typescript-eslint/no-explicit-any */
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from './App';
import i18n from './i18n';

export interface RenderResult {
  html: string;
  head: string;
  htmlAttributes: string;
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

  return { html, head, htmlAttributes };
}
