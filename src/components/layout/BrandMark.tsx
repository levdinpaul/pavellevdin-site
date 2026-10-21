/**
 * Знак бренда «Кладка PL» (Innovativ Digitalbau): P сложена из блоков, синий L в основании.
 * Единственный источник геометрии на сайте; файлы для печати/соцсетей — brand/ и public/brand/.
 * Цвета: currentColor (белые блоки), тот же цвет с прозрачностью 55 % (серые), --accent (синие).
 */
const WHITE = [[14, 8], [26, 8], [14, 20], [14, 32], [14, 44]] as const;
const MUTED = [[38, 20], [26, 32]] as const;
const BLUE = [[26, 44], [38, 44]] as const;

export function BrandMark({ className, size = 30 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={(size * 34) / 46}
      height={size}
      viewBox="14 8 34 46"
      aria-hidden="true"
      focusable="false"
    >
      {WHITE.map(([x, y]) => <rect key={`w${x}-${y}`} x={x} y={y} width="10" height="10" rx="2" fill="currentColor" />)}
      {MUTED.map(([x, y]) => <rect key={`m${x}-${y}`} x={x} y={y} width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.55" />)}
      {BLUE.map(([x, y]) => <rect key={`b${x}-${y}`} x={x} y={y} width="10" height="10" rx="2" fill="var(--accent, #7AA2FF)" />)}
    </svg>
  );
}
