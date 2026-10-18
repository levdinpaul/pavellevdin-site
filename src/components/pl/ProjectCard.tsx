import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { isOnline, projectCopy, projectImages, type Project } from '@/data/projects';

/** Карточка проекта: скриншот, статус «онлайн/превью», стек. Ведёт на страницу кейса (View Transition). */
export function ProjectCard({ project, lang, eager = false }: { project: Project; lang: string; eager?: boolean }) {
  const { t } = useTranslation();
  const copy = projectCopy(project, lang);
  const img = projectImages(project.slug);
  const online = isOnline(project.slug);
  const status = project.status === 'preview' ? 'preview' : online ? 'live' : 'offline';

  return (
    <Link to={`/${lang}/portfolio/${project.slug}`} viewTransition className="pl-work__card" data-tilt="">
      <div className="pl-work__media">
        <img src={img.desktop} alt={`${t('pl.project.shotAlt')} ${project.title}`} width={1200} height={750} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        <span className="pl-status" data-status={status}>{t(`pl.portfolio.status.${status}`)}</span>
      </div>
      <div className="pl-work__body">
        <h3 className="pl-work__title">{project.title}</h3>
        <p className="pl-work__text">{copy.summary}</p>
        <ul className="pl-tags">{project.stack.slice(0, 3).map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </Link>
  );
}
