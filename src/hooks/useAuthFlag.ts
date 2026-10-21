import { useSyncExternalStore } from 'react';

/**
 * Вошёл ли пользователь на платформе (pl-platform на том же домене).
 * Платформа при входе ставит не-httpOnly cookie-флаг `pl_auth=1` (без данных), при выходе удаляет; JWT — httpOnly, сайт его не видит.
 * На сервере (пререндер) всегда false → SSR-разметка «Войти»; после гидрации переключается.
 */
function getSnapshot(): boolean {
  return /(?:^|;\s*)pl_auth=1(?:;|$)/.test(document.cookie);
}

function getServerSnapshot(): boolean {
  return false;
}

// Флаг меняется только на страницах платформы — перечитываем при возврате на вкладку (вход в соседней вкладке, bfcache).
function subscribe(callback: () => void) {
  const onVisible = () => { if (document.visibilityState === 'visible') callback(); };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('pageshow', callback);
  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('pageshow', callback);
  };
}

export function useAuthFlag(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
