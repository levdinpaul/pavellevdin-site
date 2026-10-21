// src/components/layout/Layout.tsx

import { useTranslation } from 'react-i18next';
import { SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { ContactFab } from '@/components/pl/ContactFab';
import { Children, Suspense, isValidElement, type ReactElement } from 'react';

export interface LayoutProps {
  children?: React.ReactNode;
}

// Тип для React элемента с props
interface ReactElementWithProps extends ReactElement {
  props: {
    children?: React.ReactNode;
    [key: string]: unknown;
  };
}

// Проверка на рекурсию Layout в children
function hasLayoutInChildren(children: React.ReactNode): boolean {
  let found = false;
  
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    
    const element = child as ReactElementWithProps;
    
    // Проверяем сам элемент
    if (element.type === Layout || (typeof element.type === 'function' && element.type.name === 'Layout')) {
      found = true;
    }
    
    // Рекурсивно проверяем children
    if (element.props?.children && hasLayoutInChildren(element.props.children)) {
      found = true;
    }
  });
  
  return found;
}

export function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';

  // Проверка на рекурсию
  if (children && hasLayoutInChildren(children)) {
    console.error('Layout recursion detected: Layout cannot contain another Layout');
    return (
      <div style={{ color: 'red', padding: 50, textAlign: 'center' }}>
        <h1>Layout Recursion Error</h1>
        <p>Layout cannot contain another Layout</p>
      </div>
    );
  }

  // title/description задаёт страница (PageMeta) — второй уровень Helmet давал дубли <title>
  return (
    <>
      <a href="#main" className="pl-skip">{t('pl.nav.skip')}</a>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 flex flex-col">{children}</main>
        <Suspense fallback={null}><Footer /></Suspense>
      </div>
      <ContactFab lang={lang} />
    </>
  );
}