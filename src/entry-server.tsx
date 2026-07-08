
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
/* eslint-disable @typescript-eslint/no-explicit-any */
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
 * ВНИМАНИЕ: renderToString синхронен и НЕ резолвит React.lazy/async-data —
 * поэтому пригоден для НЕ-lazy маршрутов (главная). Ленивые под-страницы
 * по-прежнему пререндерятся через puppeteer.
 */
export async function render(url: string, lang: string): Promise<RenderResult> {
  await i18n.changeLanguage(lang);

  const helmetContext: { helmet?: any } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary>
        <ThemeProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>,
  );

  const h = helmetContext.helmet;
  const head = h
    ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()]
        .filter(Boolean)
        .join('\n    ')
    : '';
  const htmlAttributes = h ? h.htmlAttributes.toString() : '';

  return { html, head, htmlAttributes };
}
