/**
 * Делегированные эффекты указателя для всего сайта (один набор слушателей на document):
 * — карточки проектов `.pl-work__card`: 3D-наклон ≤ 4° и блик;
 * — `[data-magnetic]` (главные CTA): кнопка слегка тянется к курсору.
 * Только pointer:fine и без prefers-reduced-motion; пишутся лишь CSS-переменные (transform в CSS).
 */
const TILT_MAX = 4;
const MAGNET_PULL = 0.22;
const MAGNET_MAX = 8;

let started = false;

export function startPointerEffects() {
  if (started || typeof window === 'undefined') return;
  const fine = window.matchMedia('(pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches) return;
  started = true;

  let card: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;
  let frame = 0;
  let last: PointerEvent | null = null;

  const clear = (el: HTMLElement | null, props: string[]) => {
    if (!el) return;
    props.forEach((p) => el.style.removeProperty(p));
    delete el.dataset.pointer;
  };

  const apply = () => {
    frame = 0;
    const e = last;
    if (!e || reduce.matches) return;
    const target = e.target instanceof Element ? e.target : null;

    const nextCard = target?.closest<HTMLElement>('.pl-work__card') ?? null;
    if (nextCard !== card) { clear(card, ['--rx', '--ry', '--gx', '--gy']); card = nextCard; }
    if (card) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * TILT_MAX * 2).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * TILT_MAX * 2).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      card.dataset.pointer = 'on';
    }

    const nextMagnet = target?.closest<HTMLElement>('[data-magnetic]') ?? null;
    if (nextMagnet !== magnet) { clear(magnet, ['--mx', '--my']); magnet = nextMagnet; }
    if (magnet) {
      const r = magnet.getBoundingClientRect();
      const dx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (e.clientX - (r.left + r.width / 2)) * MAGNET_PULL));
      const dy = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, (e.clientY - (r.top + r.height / 2)) * MAGNET_PULL));
      magnet.style.setProperty('--mx', `${dx.toFixed(1)}px`);
      magnet.style.setProperty('--my', `${dy.toFixed(1)}px`);
      magnet.dataset.pointer = 'on';
    }
  };

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    last = e;
    if (!frame) frame = requestAnimationFrame(apply);
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    clear(card, ['--rx', '--ry', '--gx', '--gy']);
    clear(magnet, ['--mx', '--my']);
    card = magnet = null;
  });
}
