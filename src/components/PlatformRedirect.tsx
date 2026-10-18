import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Блог/кабинет/админка/вход живут на pl-platform (Next.js) на том же домене — nginx отдаёт ему эти пути.
 * Если SPA сайта всё же отрисовала такой маршрут (клиентский переход), перезагружаем документ, чтобы
 * запрос ушёл на сервер → платформу.
 * Защита от цикла: если текущий документ УЖЕ был загружен по этому URL, значит сервер платформу
 * не отдал (nginx ещё не переключён) — показываем 404 сайта вместо бесконечной перезагрузки.
 */
// Текущий документ уже загружен сервером именно по этому URL? (без #fragment)
function documentWasLoadedAtCurrentUrl(): boolean {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const loaded = nav?.name ? nav.name.split('#')[0] : '';
  return loaded !== '' && loaded === window.location.href.split('#')[0];
}

export function PlatformRedirect() {
  const { pathname, search, hash } = useLocation();
  // Решение считаем при рендере (детерминировано в рамках документа; маршрут не пререндерится → без гидрации).
  const isSsr = typeof window === 'undefined';
  const serverMissedPlatform = !isSsr && documentWasLoadedAtCurrentUrl();

  useEffect(() => {
    if (serverMissedPlatform) return;
    window.location.replace(pathname + search + hash);
  }, [serverMissedPlatform, pathname, search, hash]);

  // SSR и момент перед перезагрузкой — ничего не рендерим (без мигания 404).
  if (isSsr || !serverMissedPlatform) return null;
  return <NotFoundPage />;
}
