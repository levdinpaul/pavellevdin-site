import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SceneSection } from './SceneSection';
import { HomeSections } from './HomeSections';

/** Главная «PL Сцена»: hero + спиральная сцена → Обо мне → Проекты → Услуги → CTA. */
export function HomeScena() {
  const { i18n } = useTranslation();
  const { hash } = useLocation();
  const lang = ['ru', 'de', 'en'].includes(i18n.language) ? i18n.language : 'ru';

  // Якоря из шапки (/ru#about, #work): прокрутка к секции после монтирования/смены hash.
  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(id);
  }, [hash]);

  // Suspense-границы делят гидрацию на отдельные задачи (React уступает поток между ними) — меньше TBT.
  return (
    <>
      <Suspense fallback={null}><SceneSection lang={lang} /></Suspense>
      <Suspense fallback={null}><HomeSections lang={lang} /></Suspense>
    </>
  );
}
