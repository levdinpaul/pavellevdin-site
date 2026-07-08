/* eslint-disable @typescript-eslint/no-explicit-any */
// Дегидратация/гидратация данных блога для SSR-пререндера.
// Проблема: useBlog/BlogPost грузят данные в useEffect (async import контента) → на сервере
// useEffect не бежит, и SSR отрендерил бы пустой/loading-стейт, а клиент при прямой загрузке
// стартовал бы тоже пустым — но puppeteer-HTML был с данными → hydration mismatch.
// Решение: prerender грузит данные, кладёт их в стор (сервер) и инжектит window.__BLOG_DATA__
// (клиент). И useBlog, и BlogPost берут ИЗ стора начальный стейт → SSR и первый клиентский
// рендер совпадают → чистая гидрация. Если стора нет (обычная SPA-навигация) — fallback на
// прежний async-fetch, блог работает как раньше.

import type { BlogPostListItem } from '@/hooks/useBlog';
import type { LoadedBlogPost } from '@/data/blog-loader';

export interface BlogHydrationData {
  list?: Record<string, BlogPostListItem[]>;   // ключ — язык
  posts?: Record<string, LoadedBlogPost>;       // ключ — `${lang}:${slug}`
}

// Сервер: prerender ставит данные перед renderToPipeableStream.
let serverData: BlogHydrationData = {};
export function setServerBlogData(d: BlogHydrationData): void {
  serverData = d || {};
}

function store(): BlogHydrationData {
  if (typeof window !== 'undefined') return (window as any).__BLOG_DATA__ || {};
  return serverData;
}

export function getInitialBlogList(lang: string): BlogPostListItem[] {
  return store().list?.[lang] ?? [];
}

export function getInitialBlogPost(slug: string | undefined, lang: string): LoadedBlogPost | null {
  if (!slug) return null;
  return store().posts?.[`${lang}:${slug}`] ?? null;
}
