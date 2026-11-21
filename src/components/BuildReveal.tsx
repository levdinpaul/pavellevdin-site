import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { animate } from 'framer-motion/dom/mini';

/**
 * Scroll-build: страница «собирается» на глазах, как будто её верстает агент (prompt-9842, развитие пилота prompt-9836).
 * Один механизм на главную и страницы — правки только здесь (+ классы .pl-build-* в src/styles/pl-extra.css).
 *
 * Фаза 1 «разметка» (~0–1.1 с): над блоками проявляется каркас — пунктирные рамки рисуются линией (сначала верх, потом вниз),
 *   внутри скелет-полоски; 1–2 курсора подлетают к углу крупного блока и «растягивают» его рамку за собой, потом исчезают.
 * Пауза ~0.25 с.
 * Фаза 2 «блоки» (~1.2–2.4 с): каркас заполняется контентом — блок раскрывается из линии (clip-path), заголовки h1/h2
 *   печатаются (clip-path steps + курсор-каретка), сплошная рамка дорисовывается по контуру и гаснет вместе с каркасом.
 *
 * Правила (см. LEARNINGS prompt-9836):
 * - контент по умолчанию видим (SSR/пререндер/без JS); прячем только через WAAPI-«удержание» (fill: forwards) — без записи
 *   inline-стилей и без clip-path в ожидании (иначе IntersectionObserver видит лишь «линию»); отмена анимации = контент на месте;
 * - prefers-reduced-motion: reduce, нет IntersectionObserver/WAAPI, headless-пререндер → ничего не делаем, всё статично;
 * - первая загрузка: «взводятся» только блоки ниже экрана (без мигания LCP); переход внутри SPA — и блоки первого экрана;
 * - один IntersectionObserver на страницу, once: блок проигрывается один раз; после сборки слой с каркасом удаляется,
 *   постоянных циклов нет; курсоры — не чаще раза в 1.5 с и не на слабых устройствах / Save-Data.
 *
 * Блоки: внутри каждой <section> — элементы с [data-reveal] / [data-build] (+ h1/h2 вне них); если разметки нет —
 * дочерние элементы секции (обёртки с одним ребёнком пропускаются).
 */

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const P1_DRAW = 0.6; // прорисовка каркаса
const CURSOR_D = 1.05; // подлёт → захват → растяжение → отпускание
const PAUSE = 0.2; // пауза между фазами
const P2_DUR = 0.7; // раскрытие блока
const TYPE_PER_CHAR = 0.034;
const MAX_IN_BATCH = 14;

let booted = false; // первый монтаж = загрузка страницы; дальнейшие = навигация внутри SPA

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useBuildReveal(root: RefObject<HTMLElement | null>) {
  useIsoLayoutEffect(() => {
    const nav = booted;
    booted = true;
    const el = root.current;
    if (!el || !canAnimate()) return;
    return startBuild(el, nav);
  }, [root]);
}

function canAnimate(): boolean {
  return typeof IntersectionObserver !== 'undefined'
    && typeof Element.prototype.animate === 'function'
    && !navigator.webdriver // пререндер (puppeteer) снимает чистый DOM
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function weakDevice(): boolean {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (n.deviceMemory ?? 8) <= 2 || (n.hardwareConcurrency ?? 8) <= 2 || n.connection?.saveData === true;
}

// ── выбор блоков ─────────────────────────────────────────────────────────────

function topmost(list: HTMLElement[]): HTMLElement[] {
  return list.filter((el) => !list.some((o) => o !== el && o.contains(el)));
}

function skip(el: Element): boolean {
  if (!(el instanceof HTMLElement) || /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/.test(el.tagName)) return true;
  if (el.getAttribute('aria-hidden') === 'true' || el.offsetHeight < 8) return true;
  const cs = getComputedStyle(el);
  return cs.position === 'absolute' || cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden';
}

function collectBlocks(root: HTMLElement): HTMLElement[] {
  const sections = topmost(Array.from(root.querySelectorAll<HTMLElement>('section')));
  const out: HTMLElement[] = [];
  for (const unit of sections.length ? sections : [root]) {
    const marked = topmost(Array.from(unit.querySelectorAll<HTMLElement>('[data-reveal],[data-build]')));
    if (marked.length) {
      out.push(...marked);
      unit.querySelectorAll<HTMLElement>('h1,h2').forEach((h) => { if (!marked.some((m) => m.contains(h))) out.push(h); });
      continue;
    }
    let el: Element = unit;
    for (let k = 0; k < 4 && el.children.length === 1; k++) el = el.children[0];
    const kids = Array.from(el.children).filter((c) => !skip(c)) as HTMLElement[];
    out.push(...(kids.length ? kids : [el as HTMLElement]));
  }
  return topmost(out.filter((b) => !skip(b)));
}

function radiusOf(el: HTMLElement): number {
  const own = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  if (own || !el.firstElementChild) return Math.min(own, 24);
  return Math.min(parseFloat(getComputedStyle(el.firstElementChild).borderTopLeftRadius) || 0, 24);
}

type Line = { el: HTMLElement; chars: number; L: number; R0: number; R1: number; text: DOMRect; lineH: number };

/** Строки заголовков блока: .pl-title__line или сам h1/h2; L/R — inset clip-path по реальной ширине текста (Range). */
function headingLines(b: HTMLElement): Line[] {
  const heads = b.matches('h1,h2') ? [b] : Array.from(b.querySelectorAll<HTMLElement>('h1,h2')).slice(0, 2);
  const lines: Line[] = [];
  for (const h of heads) {
    const targets = h.querySelectorAll<HTMLElement>('.pl-title__line');
    for (const el of targets.length ? Array.from(targets) : [h]) {
      const chars = (el.textContent ?? '').trim().length;
      if (!chars) continue;
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const first = range.getClientRects()[0] ?? text;
      const r = el.getBoundingClientRect();
      if (!text.width || !r.width) continue;
      const L = text.left - r.left;
      lines.push({ el, chars, L: L - 4, R0: r.right - text.left, R1: Math.max(r.right - text.right, 0) - 6, text, lineH: first.height });
    }
  }
  return lines;
}

// ── слой каркаса ─────────────────────────────────────────────────────────────

function div(cls: string, parent: HTMLElement): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  parent.appendChild(d);
  return d;
}

function place(el: HTMLElement, r: { left: number; top: number; width: number; height: number }, sx: number, sy: number) {
  el.style.left = `${r.left + sx}px`;
  el.style.top = `${r.top + sy}px`;
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;
}

const CURSOR_SVG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 2.5 19.5 13l-7 1.2-3.6 6.3L4 2.5Z" fill="var(--accent)" stroke="var(--ink-inverse)" stroke-width="1.4" stroke-linejoin="round"/></svg>';

function startBuild(root: HTMLElement, nav: boolean): () => void {
  const held = new Map<HTMLElement, Animation>();
  const content: Animation[] = [];
  const timers: number[] = [];
  const layers: HTMLElement[] = [];
  const cursorsOk = !weakDevice();
  let lastCursorAt = -Infinity;

  // все чтения геометрии — до записей
  const vh = window.innerHeight;
  const blocks = collectBlocks(root);
  const rects = blocks.map((b) => b.getBoundingClientRect());
  const toHold = blocks.filter((_, i) => (nav ? rects[i].bottom > 0 : rects[i].top > vh));
  if (!toHold.length) return () => {};

  for (const b of toHold) held.set(b, b.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }));

  const markShown = (b: HTMLElement, delayMs: number) => {
    // micro-UI (.pl-mui__*) запускается от data-reveal='shown' — даём ему тот же момент, что и блоку
    [b, ...Array.from(b.querySelectorAll<HTMLElement>('[data-reveal]'))].forEach((x) => {
      if (!x.hasAttribute('data-reveal')) return;
      x.style.setProperty('--reveal-delay', `${Math.round(delayMs)}ms`);
      x.dataset.reveal = 'shown';
    });
  };
  const release = (b: HTMLElement) => { held.get(b)?.cancel(); held.delete(b); io.unobserve(b); markShown(b, 0); };

  let queue: HTMLElement[] = [];
  let flushT = 0;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const b = e.target as HTMLElement;
      if (!held.has(b)) continue;
      if (e.isIntersecting) { io.unobserve(b); queue.push(b); }
      else if (e.boundingClientRect.bottom < 0) release(b); // уже выше экрана (восстановление прокрутки) — просто показать
    }
    if (queue.length && !flushT) flushT = window.setTimeout(flush, 60);
  }, { rootMargin: '0px 0px -10% 0px' });
  held.forEach((_, b) => io.observe(b));

  // клавиатура: фокус внутри ещё не собранного блока — показать сразу
  const onFocus = (e: FocusEvent) => { held.forEach((_, b) => { if (b.contains(e.target as Node)) release(b); }); };
  root.addEventListener('focusin', onFocus);

  function flush() {
    flushT = 0;
    const batch = queue.filter((b) => held.has(b) && b.isConnected);
    queue = [];
    if (batch.length) playBatch(batch);
  }

  function playBatch(batch: HTMLElement[]) {
    const sx = window.scrollX, sy = window.scrollY, vw = window.innerWidth, vhNow = window.innerHeight;
    const items = batch
      .map((b) => ({ b, r: b.getBoundingClientRect(), radius: radiusOf(b), lines: headingLines(b), isHead: b.matches('h1,h2') }))
      .sort((a, c) => a.r.top - c.r.top || a.r.left - c.r.left);
    const n = Math.min(items.length, MAX_IN_BATCH);
    const st1 = Math.min(0.08, 0.4 / n);
    const st2 = Math.min(0.09, 0.45 / n);

    // курсоры: 1 (узкий экран / один блок) или 2 — к самым крупным видимым блокам
    const now = performance.now();
    let targets: typeof items = [];
    if (cursorsOk && now - lastCursorAt > 1500) {
      targets = items
        .filter((it) => !it.isHead && it.r.width >= 120 && it.r.height >= 70 && it.r.top >= 0 && it.r.top < vhNow - 60)
        .sort((a, c) => c.r.width * c.r.height - a.r.width * a.r.height)
        .slice(0, vw < 768 || items.length === 1 ? 1 : 2);
      if (targets.length) lastCursorAt = now;
    }
    const t2 = (targets.length ? 0.2 + CURSOR_D : P1_DRAW + 0.35) + PAUSE; // старт фазы 2

    const layer = div('pl-build-layer', document.body);
    layer.setAttribute('aria-hidden', 'true');
    layers.push(layer);
    let end = 0;

    items.forEach((it, idx) => {
      const i = Math.min(idx, n - 1);
      const { b, r, radius, lines, isHead } = it;
      const d1 = i * st1;
      const d2 = t2 + i * st2;
      const R = `${radius}px`;

      // ── фаза 1: каркас ──
      const box = isHead && lines.length
        ? lines.reduce((a, l) => ({ left: Math.min(a.left, l.text.left), top: Math.min(a.top, l.text.top), right: Math.max(a.right, l.text.right), bottom: Math.max(a.bottom, l.text.bottom) }),
          { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })
        : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      const wr = { left: box.left - (isHead ? 6 : 0), top: box.top - (isHead ? 4 : 0), width: box.right - box.left + (isHead ? 12 : 0), height: box.bottom - box.top + (isHead ? 8 : 0) };
      const wire = div(isHead ? 'pl-build-wire pl-build-wire--text' : 'pl-build-wire', layer);
      place(wire, wr, sx, sy);
      wire.style.borderRadius = isHead ? '6px' : R;
      if (!isHead && wr.height > 72) {
        ['38%', '82%', '64%'].forEach((w) => { const bar = div('pl-build-bar', wire); bar.style.width = w; });
      }
      const target = targets.indexOf(it);
      if (target >= 0) {
        // курсор подлетает к левому верхнему углу и тянет рамку до правого нижнего
        const k = target;
        const c0 = 0.2 + k * 0.22;
        const x0 = wr.left + sx - 3, y0 = wr.top + sy - 2;
        const x1 = x0 + wr.width, y1 = y0 + wr.height;
        const startX = sx + (k ? vw * 0.12 : vw * 0.86), startY = sy + vhNow * (k ? 0.96 : 0.9);
        const cursor = div('pl-build-cursor', layer);
        cursor.innerHTML = CURSOR_SVG;
        const times = [0, 0.3, 0.4, 0.86, 1];
        cursor.style.opacity = '0';
        animate(cursor, {
          transform: [`translate(${startX}px, ${startY}px)`, `translate(${x0}px, ${y0}px)`, `translate(${x0}px, ${y0}px) scale(0.82)`, `translate(${x1}px, ${y1}px) scale(0.82)`, `translate(${x1 + 10}px, ${y1 + 8}px) scale(1)`],
          opacity: [0, 1, 1, 1, 0],
        }, { duration: CURSOR_D, delay: c0 + k * 0.05, times, ease: 'easeInOut' });
        ['tl', 'tr', 'bl', 'br'].forEach((p) => div(`pl-build-handle pl-build-handle--${p}`, wire));
        wire.style.opacity = '0';
        wire.style.width = '14px';
        wire.style.height = '10px';
        animate(wire, {
          width: ['14px', '14px', '14px', `${wr.width}px`, `${wr.width}px`],
          height: ['10px', '10px', '10px', `${wr.height}px`, `${wr.height}px`],
          opacity: [0, 0, 1, 1, 1],
        }, { duration: CURSOR_D, delay: c0 + k * 0.05, times, ease: 'easeInOut' });
      } else {
        wire.style.clipPath = 'inset(0 100% calc(100% - 1px) 0)';
        animate(wire, { clipPath: ['inset(0 100% calc(100% - 1px) 0)', 'inset(0 0% calc(100% - 1px) 0)', 'inset(0 0% 0% 0)'] }, { duration: P1_DRAW, delay: d1, times: [0, 0.45, 1], ease: 'easeOut' });
      }
      wire.querySelectorAll<HTMLElement>('.pl-build-bar').forEach((bar, j) => {
        bar.style.opacity = '0';
        animate(bar, { opacity: [0, 1], transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 0.35, delay: (target >= 0 ? 0.2 + CURSOR_D * 0.86 : d1 + P1_DRAW * 0.6) + j * 0.07, ease: 'easeOut' });
      });

      // ── фаза 2: контент ──
      held.get(b)?.cancel();
      held.delete(b);
      const reveal = isHead
        ? b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: d2 * 1000, fill: 'backwards' })
        : b.animate([
          { opacity: 0, transform: 'translateY(12px)', clipPath: `inset(49.5% 0% 49.5% 0% round ${R})` },
          { opacity: 1, transform: 'translateY(0)', clipPath: `inset(0% 0% 0% 0% round ${R})` },
        ], { duration: P2_DUR * 1000, delay: d2 * 1000, easing: EASE_OUT, fill: 'backwards' });
      content.push(reveal);
      markShown(b, d2 * 1000);

      // заголовки печатаются: clip-path по шагам + каретка
      let t = d2 + (isHead ? 0 : 0.18);
      for (const l of lines) {
        const dur = Math.min(Math.max(l.chars * TYPE_PER_CHAR, 0.4), 0.9);
        content.push(l.el.animate([
          { clipPath: `inset(-20% ${l.R0}px -20% ${l.L}px)` },
          { clipPath: `inset(-20% ${l.R1}px -20% ${l.L}px)` },
        ], { duration: dur * 1000, delay: t * 1000, easing: `steps(${l.chars}, end)`, fill: 'backwards' }));
        const caret = div('pl-build-caret', layer);
        const ch = Math.min(l.lineH, l.text.height) * 0.78;
        caret.style.left = `${l.text.left + sx}px`;
        caret.style.top = `${l.text.top + sy + (Math.min(l.lineH, l.text.height) - ch) / 2}px`;
        caret.style.height = `${ch}px`;
        caret.style.opacity = '0';
        const firstW = l.text.width;
        caret.animate([
          { opacity: 1, transform: 'translateX(0)' },
          { opacity: 1, transform: `translateX(${firstW + 2}px)` },
        ], { duration: dur * 1000, delay: t * 1000, easing: `steps(${l.chars}, end)`, fill: 'forwards' });
        caret.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 900, delay: (t + dur) * 1000, easing: 'steps(1, end)', fill: 'forwards', iterations: 1 });
        t += dur + 0.08;
        end = Math.max(end, t + 0.95);
      }

      // рамка дорисовывается сплошной линией и гаснет вместе с каркасом
      if (!isHead) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'pl-build-frame');
        place(svg as unknown as HTMLElement, r, sx, sy);
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', '0.5'); rect.setAttribute('y', '0.5');
        rect.setAttribute('width', String(Math.max(r.width - 1, 0))); rect.setAttribute('height', String(Math.max(r.height - 1, 0)));
        rect.setAttribute('rx', String(radius)); rect.setAttribute('pathLength', '1');
        svg.appendChild(rect);
        layer.appendChild(svg);
        rect.style.strokeDashoffset = '1';
        animate(rect, { strokeDashoffset: [1, 0], opacity: [1, 1, 0] }, { duration: 1.1, delay: d2, times: [0, 0.6, 1], ease: 'easeInOut' });
      }
      animate(wire, { opacity: [1, 1, 0] }, { duration: 0.7, delay: d2, times: [0, 0.3, 1], ease: 'easeOut' });
      end = Math.max(end, d2 + 1.2);
    });

    // после сборки — слой удаляется целиком, ничего не крутится
    timers.push(window.setTimeout(() => { layer.remove(); }, (end + 0.2) * 1000));
  }

  return () => {
    io.disconnect();
    root.removeEventListener('focusin', onFocus);
    window.clearTimeout(flushT);
    timers.forEach((t) => window.clearTimeout(t));
    held.forEach((a) => a.cancel());
    content.forEach((a) => a.cancel());
    layers.forEach((l) => l.remove());
  };
}
