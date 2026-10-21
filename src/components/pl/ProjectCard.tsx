import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { isOnline, projectCopy, projectImages, type Project } from '@/data/projects';

/** Карточка проекта: скриншот, статус «онлайн/превью», стек. Ведёт на страницу кейса (View Transition). */
/** headingLevel: 3 — внутри секции с h2 (главная, «Обо мне»); 2 — сразу под h1 страницы (/portfolio). */
export function ProjectCard({ project, lang, eager = false, headingLevel = 3 }: { project: Project; lang: string; eager?: boolean; headingLevel?: 2 | 3 }) {
  const { t } = useTranslation();
  const copy = projectCopy(project, lang);
  const img = projectImages(project.slug);
  const online = isOnline(project.slug);
  const status = project.status === 'preview' ? 'preview' : online ? 'live' : 'offline';
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <Link to={`/${lang}/portfolio/${project.slug}`} viewTransition className="pl-work__card">
      <div className="pl-work__media">
        <img src={img.desktop} alt={`${t('pl.project.shotAlt')} ${project.title}`} width={1200} height={750} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        <span className="pl-status" data-status={status}>{t(`pl.portfolio.status.${status}`)}</span>
      </div>
      <div className="pl-work__body">
        <Heading className="pl-work__title">{project.title}</Heading>
        <p className="pl-work__text">{copy.summary}</p>
        <ul className="pl-tags">{project.stack.slice(0, 3).map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </Link>
  );
}
