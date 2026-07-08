import { useMemo } from 'react';
import { List } from 'lucide-react';

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

export default function TableOfContents({ content }: { content: string }) {
  const items = useMemo(() => {
    // Изоморфный разбор regex-ом вместо DOMParser: на сервере (SSR) DOMParser недоступен,
    // а один и тот же алгоритм на сервере и клиенте гарантирует совпадение → чистая гидрация.
    const seen = new Set<string>();
    const result: { id: string; text: string; level: number }[] = [];
    const re = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    let m: RegExpExecArray | null;
    let index = 0;
    while ((m = re.exec(content)) !== null) {
      const level = parseInt(m[1], 10);
      const attrs = m[2] || '';
      const text = decodeEntities((m[3] || '').replace(/<[^>]+>/g, '')).trim();

      const idAttr = /\bid=["']([^"']+)["']/.exec(attrs);
      let baseId = idAttr
        ? idAttr[1]
        : text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]+/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
      if (!baseId) baseId = `heading-${index}`;

      let id = baseId;
      let counter = 1;
      while (seen.has(id)) { id = `${baseId}-${counter}`; counter++; }
      seen.add(id);

      if (text) result.push({ id, text, level });
      index++;
    }
    return result;
  }, [content]);
  
  if (items.length === 0) return null;
  
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <List className="w-5 h-5 text-primary" />
        Содержание
      </h3>
      <nav className="space-y-1">
        {items.map((item, index) => (
          <a 
            key={`${item.id}-${index}`}  // гарантированно уникальный ключ
            href={`#${item.id}`} 
            className={`block text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors ${
              item.level === 3 ? 'pl-6 text-muted-foreground' : 'text-foreground font-medium'
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}