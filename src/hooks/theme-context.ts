// Контекст и хук темы вынесены из useTheme.tsx (react-refresh/only-export-components).
import { createContext, useContext } from 'react';

export interface ThemeContextType {
  theme: 'dark';
  resolvedTheme: 'dark';
  setTheme: (theme?: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
