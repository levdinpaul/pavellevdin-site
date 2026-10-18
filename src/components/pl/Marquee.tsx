/** Бегущая строка технологий (текстом, без логотипов). Вторая копия — только для бесшовной петли. */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const row = (hidden: boolean) => (
    <ul className="pl-marquee__row" aria-hidden={hidden || undefined}>
      {items.map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
  return (
    <div className="pl-marquee" role="region" aria-label={label}>
      <div className="pl-marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

