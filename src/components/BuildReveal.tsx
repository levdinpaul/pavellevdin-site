import { useEffect, useLayoutEffect, type RefObject } from 'react';

/**
 * Scroll-build: страница «собирается» на глазах, как будто её параллельно верстают несколько агентов
 * (prompt-9843; механизм prompt-9842, пилот prompt-9836). Один механизм на главную и страницы — правки только здесь
 * (+ классы .pl-build-* в src/styles/pl-extra.css). Вызовы `useBuildReveal(ref)` не менялись.
 *
 * ПАТТЕРНЫ (у каждого свой каркас фазы 1 и своё раскрытие контента в фазе 2):
 * - typewriter    — каркас «печатается» слева-направо (steps), заголовки печатаются с кареткой, блок проявляется полосами;
 * - outline-draw  — сплошная рамка обводится по периметру, затем контент проявляется;
 * - unfold-up     — блок разворачивается снизу вверх из тонкой линии (линия-«ручка» едет вверх);
 * - grid-stagger  — сетка карточек: ячейки по диагонали, карточки шахматно (сверху/снизу) с отскоком; одну «тащат» на место;
 * - slide-columns — две половины каркаса съезжаются с разных сторон, колонки контента выезжают слева/справа и стыкуются;
 * - tiles         — мозаика: плитки собираются в блок, затем разлетаются и открывают контент.
 *
 * НАЗНАЧЕНИЕ — детерминированное (без случайности): блоки страницы в порядке документа делятся на юниты
 * (заголовок h1/h2 · одиночный блок · группа ≥3 соседей одного родителя = сетка карточек). Заголовки → typewriter,
 * одиночные и группы — по своей ротации со сдвигом от хэша пути (без языкового префикса, т.е. одинаково для ru/en/de);
 * соседние юниты никогда не получают один паттерн. Переопределение: `data-pl-build="<паттерн>"` на блоке или на секции.
 * `data-build-flat` на корне — не делить на юниты по <section> (PrivacyPage: секции политики — это блоки-маркеры).
 *
 * МУЛЬТИ-КУРСОРЫ: пул «агентов» (цвет + подпись роли). На пачку блоков — по задаче на видимый блок (её тип зависит
 * от паттерна: обводит, печатает, тянет линию, двигает карточку, толкает колонку, кладёт плитки) + вспомогательные
 * (resize за угол, выделение строки), пока не заполнен лимит одновременных: 5 (desktop) / 3 (<768px) / 0 (слабое
 * устройство, Save-Data). Все курсоры влетают одновременно с разных краёв экрана и работают параллельно ~1 с.
 *
 * Правила (LEARNINGS prompt-9836/9842):
 * - контент по умолчанию видим (SSR/пререндер/без JS); прячем только WAAPI-«удержанием» (fill: forwards) — без inline-стилей
 *   на контенте; раскрытие — WAAPI fill: backwards; отмена анимации = контент на месте;
 * - prefers-reduced-motion: reduce, нет IntersectionObserver/WAAPI, headless-пререндер → ничего не делаем, всё статично;
 * - первая загрузка: «взводятся» только блоки ниже экрана; после SPA-перехода — и первый экран;
 * - один IntersectionObserver на страницу, once; после сборки слой (каркас, курсоры, плитки) удаляется — постоянных
 *   циклов нет, всё на WAAPI (никаких rAF).
 */

const PATTERNS = ['typewriter', 'outline-draw', 'unfold-up', 'grid-stagger', 'slide-columns', 'tiles'] as const;
export type BuildPattern = (typeof PATTERNS)[number];
const SINGLE_ROT: BuildPattern[] = ['outline-draw', 'unfold-up', 'slide-columns', 'tiles', 'typewriter'];
const GROUP_ROT: BuildPattern[] = ['grid-stagger', 'slide-columns', 'tiles', 'outline-draw', 'unfold-up'];

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_BACK = 'cubic-bezier(0.34, 1.45, 0.64, 1)';
const LEAD = 0.25; // от старта блока до начала «работы» (курсоры успевают долететь)
const T2 = 1.05; // старт фазы 2 (после каркаса и паузы)
const TYPE_PER_CHAR = 0.034;
const MAX_IN_BATCH = 14;

let booted = false; // первый монтаж = загрузка страницы; дальнейшие = навигация внутри SPA

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * `firstScreen: true` — собирать и первый экран при первой загрузке. Только для страниц, которые НЕ пререндерятся
 * (рендер createRoot, а не гидрация: эффект успевает до первой отрисовки, мигания нет) — NotFoundPage.
 */
export function useBuildReveal(root: RefObject<HTMLElement | null>, opts?: { firstScreen?: boolean }) {
  const firstScreen = !!opts?.firstScreen;
  useIsoLayoutEffect(() => {
    const nav = booted;
    booted = true;
    const el = root.current;
    if (!el || !canAnimate()) return;
    return startBuild(el, nav || firstScreen);
  }, [root, firstScreen]);
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
  // data-build-flat на корне: <section> внутри — смысловые части текста (политика), а не юниты; блоки = data-build-маркеры корня
  const sections = root.hasAttribute('data-build-flat') ? [] : topmost(Array.from(root.querySelectorAll<HTMLElement>('section')));
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

/** Колонки блока для slide-columns: 2–6 видимых детей, разнесённых по горизонтали. */
function columnsOf(b: HTMLElement): HTMLElement[] {
  const kids = Array.from(b.children).filter((c) => c instanceof HTMLElement && c.offsetHeight > 8) as HTMLElement[];
  if (kids.length < 2 || kids.length > 6) return [];
  const lefts = kids.map((k) => k.getBoundingClientRect().left);
  return Math.max(...lefts) - Math.min(...lefts) > 40 ? kids : [];
}

/** Цвет фона под блоком (для непрозрачных плиток мозаики). */
function bgOf(b: HTMLElement): string {
  for (let el = b.parentElement; el; el = el.parentElement) {
    const c = getComputedStyle(el).backgroundColor;
    if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
  }
  return 'var(--bg-0)';
}

// ── назначение паттернов ─────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function isPattern(v: string | null | undefined): v is BuildPattern {
  return !!v && (PATTERNS as readonly string[]).includes(v);
}

type Meta = { p: BuildPattern; unit: number; gi: number; group: number };

function assignPatterns(root: HTMLElement, blocks: HTMLElement[], rects: DOMRect[], noTiles: boolean): Map<HTMLElement, Meta> {
  const ordered = [...blocks].sort((a, c) => (a === c ? 0 : a.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const isHead = (b: HTMLElement) => b.matches('h1,h2');
  // сетка = ≥3 соседа одного родителя, разложенных минимум в 2 колонки (вертикальная стопка — это одиночные блоки)
  const cols = new Map<Element, Set<number>>();
  blocks.forEach((b, i) => {
    if (isHead(b) || !b.parentElement) return;
    const set = cols.get(b.parentElement) ?? new Set<number>();
    set.add(Math.round(rects[i].left / 8));
    cols.set(b.parentElement, set);
  });
  const siblings = new Map<Element, number>();
  for (const b of ordered) {
    const par = b.parentElement;
    if (!isHead(b) && par && (cols.get(par)?.size ?? 0) >= 2) siblings.set(par, (siblings.get(par) ?? 0) + 1);
  }

  type Unit = { bs: HTMLElement[]; kind: 'head' | 'single' | 'group' };
  const units: Unit[] = [];
  for (const b of ordered) {
    const par = b.parentElement;
    const grouped = !isHead(b) && !!par && (siblings.get(par) ?? 0) >= 3;
    const last = units[units.length - 1];
    if (grouped && last?.kind === 'group' && last.bs[0].parentElement === par) last.bs.push(b);
    else units.push({ bs: [b], kind: isHead(b) ? 'head' : grouped ? 'group' : 'single' });
  }

  const override = (b: HTMLElement): BuildPattern | null => {
    const host = b.closest<HTMLElement>('[data-pl-build]');
    const v = host && (host === root || root.contains(host)) ? host.dataset.plBuild : null;
    return isPattern(v) ? v : null;
  };

  const seed = hash(location.pathname.replace(/^\/(ru|en|de)(?=\/|$)/, '') || '/');
  const counters = { single: seed % SINGLE_ROT.length, group: seed % GROUP_ROT.length };
  const out = new Map<HTMLElement, Meta>();
  let prev: BuildPattern | null = null;
  units.forEach((u, ui) => {
    let p: BuildPattern | null = override(u.bs[0]);
    if (!p && u.kind === 'head') p = 'typewriter';
    if (!p) {
      const key = u.kind === 'group' ? 'group' : 'single';
      const rot = key === 'group' ? GROUP_ROT : SINGLE_ROT;
      const nextHead = units[ui + 1]?.kind === 'head';
      let c = counters[key];
      p = rot[c % rot.length];
      for (let tries = 0; tries < rot.length; tries++, c++) {
        p = rot[c % rot.length];
        if (p !== prev && !(p === 'typewriter' && nextHead) && !(noTiles && p === 'tiles')) break;
      }
      counters[key] = c + 1;
    }
    if (noTiles && p === 'tiles') p = prev === 'unfold-up' ? 'outline-draw' : 'unfold-up';
    const pat: BuildPattern = p;
    // в сетке (кроме grid-stagger, который собирает её целиком по диагонали) карточки чередуют два паттерна шахматно
    const mate = u.kind === 'group' && pat !== 'grid-stagger'
      ? GROUP_ROT.find((x) => x !== pat && x !== 'grid-stagger' && x !== prev && !(noTiles && x === 'tiles')) ?? pat
      : pat;
    const rectOf = (b: HTMLElement) => rects[blocks.indexOf(b)];
    const xs = [...new Set(u.bs.map((b) => Math.round(rectOf(b).left / 8)))].sort((a, c) => a - c);
    const ys = [...new Set(u.bs.map((b) => Math.round(rectOf(b).top / 8)))].sort((a, c) => a - c);
    u.bs.forEach((b, gi) => {
      const r = rectOf(b);
      // свой data-pl-build у блока сильнее паттерна группы (визитка: карточка и блок QR рядом с подписью)
      const own = (b.hasAttribute('data-pl-build') ? override(b) : null)
        ?? ((xs.indexOf(Math.round(r.left / 8)) + ys.indexOf(Math.round(r.top / 8))) % 2 ? mate : pat);
      out.set(b, { p: own, unit: ui, gi, group: u.kind === 'group' ? ui : -1 });
      prev = own;
    });
  });
  return out;
}

// ── слой каркаса ─────────────────────────────────────────────────────────────

function div(cls: string, parent: HTMLElement): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  parent.appendChild(d);
  return d;
}

type Box = { left: number; top: number; width: number; height: number };

function place(el: HTMLElement, r: Box, sx: number, sy: number) {
  el.style.left = `${r.left + sx}px`;
  el.style.top = `${r.top + sy}px`;
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;
}

/** WAAPI на узлах слоя (сек → мс). Узлы одноразовые — fill 'both' по умолчанию. */
function wa(el: Element, kf: Keyframe[], dur: number, delay = 0, easing = 'ease-out', fill: FillMode = 'both'): Animation {
  return el.animate(kf, { duration: Math.max(dur * 1000, 1), delay: delay * 1000, easing, fill });
}

const CURSOR_SVG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 2.5 19.5 13l-7 1.2-3.6 6.3L4 2.5Z" fill="var(--c, var(--accent))" stroke="var(--ink-inverse)" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const AGENT_COLORS = ['#7AA2FF', '#5EEAD4', '#F5B971', '#C4A7FF', '#FF8FA3'];
const FLY_EASE = ['cubic-bezier(.55,0,.25,1)', 'cubic-bezier(.3,.75,.25,1)', 'cubic-bezier(.65,.05,.35,1)', 'cubic-bezier(.4,.9,.3,1)', 'ease-in-out'];
// откуда влетают «агенты»: разные края экрана (доли ширины/высоты вьюпорта)
const STARTS: Array<[number, number]> = [[0.9, 0.95], [0.06, 1.02], [1.03, 0.42], [-0.03, 0.3], [0.52, 1.06]];

type JobKind = 'type' | 'trace' | 'pull' | 'move' | 'push' | 'paint' | 'corner' | 'sweep';
const PRIMARY: Record<BuildPattern, JobKind> = {
  'typewriter': 'type', 'outline-draw': 'trace', 'unfold-up': 'pull', 'grid-stagger': 'move', 'slide-columns': 'push', 'tiles': 'paint',
};
const TAG: Record<JobKind, string> = {
  type: 'type', trace: 'stroke', pull: 'unfold', move: 'drag', push: 'columns', paint: 'tiles', corner: 'resize', sweep: 'select',
};

type Item = Meta & {
  b: HTMLElement; r: DOMRect; radius: number; lines: Line[]; isHead: boolean;
  wr: Box; d1: number; d2: number; diag: number; side: number;
  cols: HTMLElement[]; bg: string; drag: [number, number] | null;
  sched: Array<{ l: Line; t: number; dur: number }>;
};

function startBuild(root: HTMLElement, nav: boolean): () => void {
  const held = new Map<HTMLElement, Animation>();
  const content: Animation[] = [];
  const timers: number[] = [];
  const layers: HTMLElement[] = [];
  const weak = weakDevice();
  let cursorEnds: number[] = []; // время окончания активных курсоров (performance.now, мс)

  // все чтения геометрии — до записей
  const vh = window.innerHeight;
  const blocks = collectBlocks(root);
  const rects = blocks.map((b) => b.getBoundingClientRect());
  const toHold = blocks.filter((_, i) => (nav ? rects[i].bottom > 0 : rects[i].top > vh));
  if (!toHold.length) return () => {};
  const meta = assignPatterns(root, blocks, rects, weak);

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
    const docH = document.documentElement.scrollHeight;
    const mobile = vw < 768;
    const maxCursors = weak ? 0 : mobile ? 3 : 5;

    // ── чтения ──
    const items: Item[] = batch.map((b) => {
      const m = meta.get(b) ?? { p: 'unfold-up' as BuildPattern, unit: 0, gi: 0, group: -1 };
      const isHead = b.matches('h1,h2');
      return {
        ...m, b, isHead, r: b.getBoundingClientRect(), radius: radiusOf(b),
        lines: m.p === 'typewriter' ? headingLines(b) : [],
        cols: m.p === 'slide-columns' ? columnsOf(b) : [],
        bg: m.p === 'tiles' ? bgOf(b) : '',
        wr: { left: 0, top: 0, width: 0, height: 0 }, d1: 0, d2: 0, diag: 0, side: (m.unit + m.gi) % 2 ? 1 : -1, drag: null, sched: [],
      };
    }).sort((a, c) => a.r.top - c.r.top || a.r.left - c.r.left);

    // ── тайминги ──
    const n = Math.min(items.length, MAX_IN_BATCH);
    const st1 = Math.min(0.08, 0.4 / n);
    const st2 = Math.min(0.09, 0.45 / n);
    const gridStart = new Map<number, number>();
    const grids = new Map<number, Item[]>();
    items.forEach((it) => { if (it.p === 'grid-stagger' && it.group >= 0) grids.set(it.group, [...(grids.get(it.group) ?? []), it]); });
    grids.forEach((list) => {
      const xs = [...new Set(list.map((it) => Math.round(it.r.left / 8)))].sort((a, c) => a - c);
      const ys = [...new Set(list.map((it) => Math.round(it.r.top / 8)))].sort((a, c) => a - c);
      list.forEach((it) => { it.diag = Math.min(xs.indexOf(Math.round(it.r.left / 8)) + ys.indexOf(Math.round(it.r.top / 8)), 8); });
    });
    items.forEach((it, idx) => {
      const i = Math.min(idx, n - 1);
      if (it.p === 'grid-stagger' && it.group >= 0) {
        if (!gridStart.has(it.group)) gridStart.set(it.group, i);
        const g = gridStart.get(it.group) ?? i;
        it.d1 = g * st1 + it.diag * 0.06;
        it.d2 = T2 + g * st2 + it.diag * 0.11;
      } else {
        it.d1 = i * st1;
        it.d2 = T2 + i * st2;
      }
      const { r, lines, isHead } = it;
      const box = isHead && lines.length
        ? lines.reduce((a, l) => ({ left: Math.min(a.left, l.text.left), top: Math.min(a.top, l.text.top), right: Math.max(a.right, l.text.right), bottom: Math.max(a.bottom, l.text.bottom) }),
          { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })
        : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      it.wr = { left: box.left - (isHead ? 6 : 0), top: box.top - (isHead ? 4 : 0), width: box.right - box.left + (isHead ? 12 : 0), height: box.bottom - box.top + (isHead ? 8 : 0) };
      let t = it.d2 + (isHead ? 0 : 0.18);
      for (const l of lines) {
        const dur = Math.min(Math.max(l.chars * TYPE_PER_CHAR, 0.4), 0.9);
        it.sched.push({ l, t, dur });
        t += dur + 0.08;
      }
    });

    // ── пул курсоров: задачи на видимые блоки, не больше свободных слотов ──
    const now = performance.now();
    cursorEnds = cursorEnds.filter((e) => e > now);
    const free = Math.max(0, maxCursors - cursorEnds.length);
    const visible = items
      .filter((it) => it.wr.width >= 40 && it.wr.height >= 14 && it.r.top >= -10 && it.r.top < vhNow - 40)
      .sort((a, c) => c.wr.width * c.wr.height - a.wr.width * a.wr.height);
    const jobs: Array<{ it: Item; kind: JobKind }> = [];
    const dragged = new Set<number>();
    const used = new Map<JobKind, number>();
    const alt: JobKind[] = ['corner', 'sweep', 'trace', 'paint'];
    const leastUsed = () => alt.reduce((a, c) => ((used.get(c) ?? 0) < (used.get(a) ?? 0) ? c : a));
    for (const it of visible) {
      if (jobs.length >= free) break;
      let kind = PRIMARY[it.p];
      if (kind === 'move') {
        if (dragged.has(it.group) || it.wr.width < 80) kind = 'corner';
        else { dragged.add(it.group); it.drag = mobile ? [-40, 34] : [-72, 52]; }
      }
      // одна роль — один агент: повторы в пачке (карточки одной сетки) получают другие роли
      if (used.has(kind)) kind = leastUsed();
      used.set(kind, (used.get(kind) ?? 0) + 1);
      jobs.push({ it, kind });
    }
    // вспомогательные агенты на крупные блоки, чтобы в кадре работали 3–5 курсоров параллельно
    const big = visible.filter((it) => it.wr.width >= 120 && it.wr.height >= 36);
    for (let e = 0; jobs.length < free && big.length && e < big.length * 2; e++) {
      const kind = leastUsed();
      used.set(kind, (used.get(kind) ?? 0) + 1);
      jobs.push({ it: big[e % big.length], kind });
    }

    const layer = div('pl-build-layer', document.body);
    layer.setAttribute('aria-hidden', 'true');
    layer.style.height = `${docH}px`;
    layers.push(layer);
    let end = 0;
    const X = (x: number) => x + sx;
    const Y = (y: number) => y + sy;
    const reveal = (el: HTMLElement, kf: Keyframe[], dur: number, delay: number, easing = EASE_OUT) => {
      content.push(el.animate(kf, { duration: Math.max(dur * 1000, 1), delay: delay * 1000, easing, fill: 'backwards' }));
    };

    const fadeOut = (el: Element, at: number, dur = 0.6, from = 1) => { wa(el, [{ opacity: from }, { opacity: 0 }], dur, at, 'ease-out', 'forwards'); };

    // ── отрисовка блоков по паттернам ──
    items.forEach((it) => {
      const { b, r, radius, isHead, wr, d1, d2, p } = it;
      const R = `${radius}px`;
      const A = d1 + LEAD;
      held.get(b)?.cancel();
      held.delete(b);
      markShown(b, d2 * 1000);

      const mkWire = (cls = '') => {
        const w = div(`pl-build-wire${isHead ? ' pl-build-wire--text' : ''}${cls}`, layer);
        w.dataset.p = p; // имя паттерна — для отладки/проверки (слой aria-hidden, удаляется после сборки)
        place(w, wr, sx, sy);
        w.style.borderRadius = isHead ? '6px' : R;
        return w;
      };
      const bars = (w: HTMLElement, at: number, typed = false) => {
        if (isHead || wr.height <= 72) return;
        ['38%', '82%', '64%'].forEach((width, j) => {
          const bar = div('pl-build-bar', w);
          bar.style.width = width;
          wa(bar, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], typed ? 0.3 : 0.35, at + j * 0.08, typed ? 'steps(7, end)' : 'ease-out');
        });
      };

      if (p === 'typewriter') {
        const w = mkWire();
        wa(w, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 0.5, A, 'steps(12, end)');
        bars(w, A + 0.35, true);
        fadeOut(w, d2 + 0.2);
        if (isHead) reveal(b, [{ opacity: 0 }, { opacity: 1 }], 0.001, d2);
        else reveal(b, [{ clipPath: `inset(0 100% 0 0 round ${R})` }, { clipPath: `inset(0 0% 0 0 round ${R})` }], 0.65, d2, 'steps(14, end)');
        for (const { l, t, dur } of it.sched) {
          content.push(l.el.animate([
            { clipPath: `inset(-20% ${l.R0}px -20% ${l.L}px)` },
            { clipPath: `inset(-20% ${l.R1}px -20% ${l.L}px)` },
          ], { duration: dur * 1000, delay: t * 1000, easing: `steps(${l.chars}, end)`, fill: 'backwards' }));
          const caret = div('pl-build-caret', layer);
          const ch = Math.min(l.lineH, l.text.height) * 0.78;
          caret.style.left = `${X(l.text.left)}px`;
          caret.style.top = `${Y(l.text.top) + (Math.min(l.lineH, l.text.height) - ch) / 2}px`;
          caret.style.height = `${ch}px`;
          wa(caret, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 1, transform: `translateX(${l.text.width + 2}px)` }], dur, t, `steps(${l.chars}, end)`);
          wa(caret, [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], 0.9, t + dur, 'steps(1, end)', 'forwards');
          end = Math.max(end, t + dur + 1);
        }
        end = Math.max(end, d2 + 0.9);
      } else if (p === 'outline-draw') {
        const w = mkWire();
        wa(w, [{ opacity: 0 }, { opacity: 0.55 }], 0.3, d1);
        fadeOut(w, d2, 0.4, 0.55);
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
        wa(rect, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 0.7, A, 'linear');
        fadeOut(svg, d2 + 0.35, 0.5);
        reveal(b, [{ opacity: 0, transform: 'scale(0.975)' }, { opacity: 1, transform: 'scale(1)' }], 0.55, d2);
        end = Math.max(end, d2 + 0.9);
      } else if (p === 'unfold-up') {
        const w = mkWire();
        wa(w, [{ clipPath: 'inset(calc(100% - 1px) 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 0.55, A, EASE_OUT);
        wa(w, [{ opacity: 0 }, { opacity: 1 }], 0.15, A - 0.1);
        bars(w, A + 0.45);
        fadeOut(w, d2 + 0.25);
        const edge = div('pl-build-edge', layer);
        place(edge, { left: wr.left, top: wr.top, width: wr.width, height: 2 }, sx, sy);
        wa(edge, [{ transform: `translateY(${wr.height}px)`, opacity: 0 }, { transform: `translateY(${wr.height}px)`, opacity: 1, offset: 0.15 }, { transform: 'translateY(0)', opacity: 1, offset: 0.85 }, { transform: 'translateY(0)', opacity: 0 }], 0.75, A - 0.1);
        reveal(b, [{ opacity: 0, transform: 'translateY(14px)', clipPath: `inset(100% 0 0 0 round ${R})` }, { opacity: 1, transform: 'translateY(0)', clipPath: `inset(0 0 0 0 round ${R})` }], 0.7, d2);
        end = Math.max(end, d2 + 1);
      } else if (p === 'grid-stagger') {
        const w = mkWire();
        if (it.drag) {
          const [dx, dy] = it.drag;
          ['tl', 'tr', 'bl', 'br'].forEach((h) => div(`pl-build-handle pl-build-handle--${h}`, w));
          wa(w, [
            { opacity: 0, transform: `translate(${dx}px, ${dy}px) rotate(-2deg)` },
            { opacity: 1, transform: `translate(${dx}px, ${dy}px) rotate(-2deg)`, offset: 0.3, easing: 'cubic-bezier(.45,0,.2,1)' },
            { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' },
          ], 0.8, A - 0.25);
        } else {
          wa(w, [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: 'scale(1)' }], 0.4, d1 + 0.2, EASE_BACK);
        }
        bars(w, A + 0.3);
        fadeOut(w, d2 + 0.15, 0.45);
        const sign = it.diag % 2 ? 1 : -1;
        reveal(b, it.drag
          ? [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'scale(1)' }]
          : [{ opacity: 0, transform: `translateY(${sign * 20}px) scale(0.94)` }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 0.55, d2, EASE_BACK);
        end = Math.max(end, d2 + 0.8);
      } else if (p === 'slide-columns') {
        const off = Math.min(wr.width * 0.25, mobile ? 40 : 90);
        [-1, 1].forEach((s) => {
          const h = div('pl-build-wire pl-build-half', layer);
          h.dataset.p = p;
          place(h, { left: s < 0 ? wr.left : wr.left + wr.width / 2, top: wr.top, width: wr.width / 2, height: wr.height }, sx, sy);
          h.style.borderRadius = s < 0 ? `${R} 0 0 ${R}` : `0 ${R} ${R} 0`;
          wa(h, [{ opacity: 0, transform: `translateX(${s * off}px)` }, { opacity: 1, transform: 'translateX(0)' }], 0.5, A, 'cubic-bezier(.5,0,.2,1)');
          fadeOut(h, d2 + 0.2);
        });
        if (it.cols.length) {
          reveal(b, [{ opacity: 0 }, { opacity: 1 }], 0.12, d2);
          it.cols.forEach((c, k) => {
            const s = k % 2 ? 1 : -1;
            reveal(c, [{ opacity: 0, transform: `translateX(${s * (mobile ? 28 : 56)}px)` }, { opacity: 1, transform: 'translateX(0)' }], 0.6, d2 + k * 0.07);
          });
        } else {
          reveal(b, [{ opacity: 0, transform: `translateX(${it.side * (mobile ? 28 : 60)}px)` }, { opacity: 1, transform: 'translateX(0)' }], 0.6, d2);
        }
        end = Math.max(end, d2 + 1);
      } else { // tiles
        const cols = Math.max(2, Math.min(Math.round(r.width / 100), mobile ? 4 : 8));
        const rows = Math.max(1, Math.min(Math.round(r.height / 80), mobile ? 4 : 5));
        const tiles = div('pl-build-tiles', layer);
        tiles.dataset.p = p;
        place(tiles, r, sx, sy);
        tiles.style.borderRadius = R;
        tiles.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        tiles.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        tiles.style.setProperty('--tile-bg', it.bg);
        const N = cols * rows;
        // детерминированный «случайный» порядок плиток (LCG от индекса юнита)
        const order = Array.from({ length: N }, (_, k) => k);
        let s = (it.unit * 7919 + it.gi * 104729 + 1) >>> 0;
        for (let k = N - 1; k > 0; k--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (k + 1); [order[k], order[j]] = [order[j], order[k]]; }
        for (let k = 0; k < N; k++) {
          const tile = div('pl-build-tile', tiles);
          const o = order[k];
          wa(tile, [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }], 0.22, A + (o / N) * 0.5, EASE_BACK);
          wa(tile, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.5)' }], 0.26, d2 + ((N - 1 - o) / N) * 0.45, 'ease-in', 'forwards');
        }
        reveal(b, [{ opacity: 0 }, { opacity: 1 }], 0.05, d2);
        end = Math.max(end, d2 + 0.8);
      }
    });

    // ── курсоры: стартуют вместе, работают параллельно в разных зонах ──
    type CP = { x: number; y: number; t: number; s?: number; o?: number; e?: string };
    jobs.forEach(({ it, kind }, k) => {
      const { wr, d1 } = it;
      const A = d1 + LEAD;
      const x0 = X(wr.left), y0 = Y(wr.top), W = wr.width, H = wr.height;
      const G = 0.82; // «захват»
      let act: CP[] = [];
      if (kind === 'type') {
        // e — easing сегмента, начинающегося в этой точке
        const y = y0 + Math.min(H / 2, 28);
        act = [{ x: x0, y, t: 0, e: 'steps(12, end)' }, { x: x0 + W, y, t: 0.5 }];
        it.sched.slice(0, 2).forEach(({ l, t, dur }) => {
          const lx = X(l.text.left), ly = Y(l.text.top) + Math.min(l.lineH, l.text.height) * 0.75;
          const last = act[act.length - 1];
          const t0 = Math.max(t - A, last.t + 0.05);
          if (t0 - 0.14 > last.t) act.push({ x: last.x, y: last.y, t: t0 - 0.14 });
          act.push({ x: lx, y: ly, t: t0, e: `steps(${l.chars}, end)` });
          act.push({ x: lx + l.text.width, y: ly, t: t0 + dur });
        });
      } else if (kind === 'trace') {
        const per = 2 * (W + H), D = 0.7;
        act = [
          { x: x0, y: y0, t: 0, e: 'linear' },
          { x: x0 + W, y: y0, t: (W / per) * D, e: 'linear' },
          { x: x0 + W, y: y0 + H, t: ((W + H) / per) * D, e: 'linear' },
          { x: x0, y: y0 + H, t: ((2 * W + H) / per) * D, e: 'linear' },
          { x: x0, y: y0, t: D },
        ];
      } else if (kind === 'pull') {
        const cx = x0 + W / 2;
        act = [{ x: cx, y: y0 + H, t: 0 }, { x: cx, y: y0 + H, t: 0.06, s: G, e: EASE_OUT }, { x: cx, y: y0, t: 0.6, s: G }, { x: cx, y: y0, t: 0.7 }];
      } else if (kind === 'move') {
        const [dx, dy] = it.drag ?? [0, 0];
        const gx = x0 + Math.min(W * 0.4, 90), gy = y0 + Math.min(H * 0.3, 40);
        act = [{ x: gx + dx, y: gy + dy, t: 0 }, { x: gx + dx, y: gy + dy, t: 0.05, s: G, e: 'cubic-bezier(.45,0,.2,1)' }, { x: gx, y: gy, t: 0.55, s: G }, { x: gx, y: gy, t: 0.65 }];
      } else if (kind === 'push') {
        const off = Math.min(W * 0.25, mobile ? 40 : 90), y = y0 + H / 2;
        act = [{ x: x0 - off, y, t: 0 }, { x: x0 - off, y, t: 0.04, s: G, e: 'cubic-bezier(.5,0,.2,1)' }, { x: x0, y, t: 0.5, s: G }, { x: x0, y, t: 0.6 }];
      } else if (kind === 'paint') {
        act = [
          { x: x0 + 8, y: y0 + 8, t: 0 },
          { x: x0 + W - 12, y: y0 + H * 0.33, t: 0.17 },
          { x: x0 + 8, y: y0 + H * 0.66, t: 0.34 },
          { x: x0 + W - 12, y: y0 + H - 10, t: 0.5 },
        ];
      } else if (kind === 'corner') {
        const cx = x0 + W, cy = y0 + H, gx = mobile ? 12 : 24, gy = mobile ? 8 : 16;
        const handle = div('pl-build-handle', layer);
        handle.style.left = `${cx - 4}px`; handle.style.top = `${cy - 4}px`;
        const ghost = div('pl-build-ghost', layer);
        place(ghost, wr, sx, sy);
        const hk: Keyframe[] = [
          { opacity: 0, transform: 'translate(0, 0)' }, { opacity: 1, transform: 'translate(0, 0)', offset: 0.15 },
          { opacity: 1, transform: `translate(${gx}px, ${gy}px)`, offset: 0.55 }, { opacity: 1, transform: 'translate(0, 0)', offset: 0.9 }, { opacity: 0, transform: 'translate(0, 0)' },
        ];
        wa(handle, hk, 0.7, A - 0.05, 'ease-in-out');
        wa(ghost, [
          { opacity: 0, transform: 'scale(1, 1)' }, { opacity: 0.8, transform: 'scale(1, 1)', offset: 0.15 },
          { opacity: 0.8, transform: `scale(${(W + gx) / W}, ${(H + gy) / H})`, offset: 0.55 }, { opacity: 0.6, transform: 'scale(1, 1)', offset: 0.9 }, { opacity: 0, transform: 'scale(1, 1)' },
        ], 0.7, A - 0.05, 'ease-in-out');
        act = [{ x: cx, y: cy, t: 0 }, { x: cx, y: cy, t: 0.06, s: G }, { x: cx + gx, y: cy + gy, t: 0.34, s: G }, { x: cx, y: cy, t: 0.58, s: G }, { x: cx, y: cy, t: 0.66 }];
      } else { // sweep — выделение строки
        const sh = Math.min(16, H - 4), y = y0 + Math.max(Math.min(H * 0.5, 44) - sh / 2, 2);
        const sel = div('pl-build-sel', layer);
        place(sel, { left: wr.left + 8, top: y - sy, width: Math.max(W - 16, 8), height: sh }, sx, sy);
        wa(sel, [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 0.5, A + 0.05, 'cubic-bezier(.4,0,.2,1)');
        fadeOut(sel, A + 0.75, 0.3);
        act = [{ x: x0 + 8, y: y + sh / 2, t: 0 }, { x: x0 + 8, y: y + sh / 2, t: 0.05, s: G, e: 'cubic-bezier(.4,0,.2,1)' }, { x: x0 + W - 8, y: y + sh / 2, t: 0.55, s: G }, { x: x0 + W - 8, y: y + sh / 2, t: 0.62 }];
      }
      runCursor(k, TAG[kind], A, act);
    });

    function runCursor(k: number, tag: string, A: number, act: CP[]) {
      if (!act.length) return;
      const fly = 0.2 + (k % 3) * 0.015;
      const delay = Math.max(0, A - fly);
      const f = A - delay;
      const [fx, fy] = STARTS[k % STARTS.length];
      const last = act[act.length - 1];
      const pts: CP[] = [
        { x: sx + vw * fx, y: sy + vhNow * fy, t: 0, o: 0, e: FLY_EASE[k % FLY_EASE.length] },
        ...act.map((p) => ({ ...p, t: p.t + f })),
        { x: last.x + 16, y: last.y + 12, t: last.t + f + 0.22, o: 0 },
      ];
      const total = pts[pts.length - 1].t;
      const el = div('pl-build-cursor', layer);
      el.dataset.job = tag;
      el.innerHTML = `${CURSOR_SVG}<span class="pl-build-cursor__tag">${tag}</span>`;
      el.style.setProperty('--c', AGENT_COLORS[k % AGENT_COLORS.length]);
      let prevOff = 0;
      wa(el, pts.map((p, i) => {
        prevOff = i === pts.length - 1 ? 1 : Math.min(Math.max(p.t / total, prevOff), 1);
        return { transform: `translate(${p.x}px, ${p.y}px) scale(${p.s ?? 1})`, opacity: p.o ?? 1, offset: prevOff, easing: p.e ?? 'ease-in-out' };
      }), total, delay, 'linear');
      cursorEnds.push(performance.now() + (delay + total) * 1000);
      end = Math.max(end, delay + total);
    }

    // после сборки — слой удаляется целиком, ничего не крутится
    timers.push(window.setTimeout(() => { layer.remove(); }, (end + 0.25) * 1000));
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
