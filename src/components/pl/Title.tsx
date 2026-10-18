import type { ReactNode } from 'react';

interface TitleProps {
  /** Первая строка — основная, вторая (необязательная) — приглушённая, появляется на 120 мс позже. */
  lines: [ReactNode] | [ReactNode, ReactNode];
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
}

/**
 * Заголовок с line-mask reveal: каждая строка выезжает из-под маски (только transform).
 * Анимация срабатывает, когда useReveal переводит data-reveal в «shown»; в SSR и без JS текст виден сразу.
 */
export function Title({ lines, as: Tag = 'h2', id, className = 'pl-h2' }: TitleProps) {
  return (
    <Tag id={id} className={`${className} pl-title`} data-reveal="">
      {lines.map((line, index) => (
        <span key={index} className="pl-title__mask" data-muted={index > 0 || undefined}>
          <span className="pl-title__line">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
