// Сгенерированные иллюстрации: public/images/<dir>/<name>-{480,960}.webp (см. memory/LEARNINGS — процесс генерации).
interface GenImageProps {
  dir: 'scene' | 'services' | 'site';
  name: string;
  alt?: string;
  /** соотношение сторон источника — резервирует место (CLS 0) */
  ratio: '16/9' | '4/3';
  sizes: string;
  eager?: boolean;
  className?: string;
}

export function GenImage({ dir, name, alt = '', ratio, sizes, eager = false, className }: GenImageProps) {
  const base = `/images/${dir}/${name}`;
  const [w, h] = ratio === '16/9' ? [960, 540] : [960, 720];
  return (
    <img
      className={className}
      src={`${base}-960.webp`}
      srcSet={`${base}-480.webp 480w, ${base}-960.webp 960w`}
      sizes={sizes}
      width={w}
      height={h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ aspectRatio: ratio.replace('/', ' / ') }}
    />
  );
}
