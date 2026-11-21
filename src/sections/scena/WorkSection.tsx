import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Project } from '@/data/projects';
import { ProjectCard } from '@/components/pl/ProjectCard';

/**
 * Секция «Проекты» на главной — эталон scroll-build (пилот prompt-9836, общий механизм prompt-9842).
 * Анимацию делает общий хук useBuildReveal (src/components/BuildReveal.tsx), подключённый в HomeSections:
 * блоки секции помечены data-build — заголовок печатается (строка .pl-title__line), ссылка и карточки
 * сначала появляются каркасом (пунктир + курсор растягивает рамку), затем раскрываются из линии.
 * Разметка и классы — прежние (pl-section__head, pl-title, pl-work__grid); SSR/reduce — всё видно статично.
 */
export function WorkSection({ lang, work }: { lang: string; work: Project[] }) {
  const { t } = useTranslation();
  return (
    <section id="work" className="pl-section" aria-labelledby="pl-work-title">
      <div className="pl-section__head">
        <h2 id="pl-work-title" className="pl-h2 pl-title" data-build="">
          <span className="pl-title__mask">
            <span className="pl-title__line">{t('pl.work.title')}</span>
          </span>
        </h2>
        <span data-build="">
          <Link to={`/${lang}/portfolio`} viewTransition className="pl-link">{t('pl.work.all')}</Link>
        </span>
      </div>
      <ul className="pl-work__grid">
        {work.map((p) => (
          <li key={p.slug} data-build="">
            <ProjectCard project={p} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}
