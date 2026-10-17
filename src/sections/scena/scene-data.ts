// Данные главной, не зависящие от языка (тексты — в i18n pl.*).

/** Картинки шагов сцены: public/images/scene/<name>-{960,480}.webp. null — картинки пока нет. */
export const STEP_IMAGES: (string | null)[] = [
  'step-1-positioning',
  'step-2-website',
  null,
  null,
  null,
  null,
  null,
];

/** Проекты блока «Последние проекты» — id из src/data/projects.ts. */
export const HOME_WORK_IDS = ['vlinnovativbau', 'kubperevozki', 'fithilf', 'peristeen', 'delimes', 'mpinnovativ'];

/** Тайминг сцены в долях прогресса прокрутки (0…1). */
export const SCENE = {
  heroEnd: 0.07, // hero растворяется к этой точке
  stepsStart: 0.07, // первый шаг входит здесь
  overlap: 0.18, // доля окна шага на вход/выход (кроссфейд с соседним)
};

/** Сцена «живая» только на десктопе без reduced-motion; иначе — статичный список (см. pl.css). */
export const SCENE_MEDIA = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
