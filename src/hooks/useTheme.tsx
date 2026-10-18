import { useEffect, type ReactNode } from 'react';
import { ThemeContext } from './theme-context';

/** Тема зафиксирована тёмной — дизайн PL Digitalbau задуман dark-only (#060810). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    try {
      localStorage.setItem('theme', 'dark');
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
