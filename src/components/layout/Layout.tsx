// src/components/layout/Layout.tsx

import { Helmet } from 'react-helmet-async';
import { SiteHeader } from './SiteHeader';
import { Footer } from './Footer';
import { Children, isValidElement, type ReactElement } from 'react';

export interface LayoutProps {
  pageTitle?: string;
  pageDescription?: string;
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

export function Layout({ pageTitle, pageDescription, children }: LayoutProps) {
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

  const baseTitle = 'PL·Digitalbau — Pavel Levdin';
  const title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
  const description = pageDescription || 'Professional web developer specializing in modern websites and web applications.';

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </>
  );
}