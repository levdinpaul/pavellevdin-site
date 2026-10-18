import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Pencil, Trash2, X } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';

interface AdminReview {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  project: string;
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number | null;
  contact: string;
  lang: string;
  createdAt: string;
}
interface ReviewToken { token: string; project: string; title: string }

const STATUS_LABEL = { pending: 'На модерации', approved: 'Опубликован', rejected: 'Отклонён' } as const;

/** Модерация отзывов: одобрить / отклонить / поправить текст. На сайт попадают только «Опубликован». */
export function AdminReviews() {
  const { get, request, del } = useAdminApi();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [tokens, setTokens] = useState<ReviewToken[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AdminReview>>({});
  const [error, setError] = useState('');

  const load = useCallback(() => {
    get<{ reviews: AdminReview[]; tokens: ReviewToken[] }>('/api/admin/reviews')
      .then((d) => { setReviews(d.reviews); setTokens(d.tokens); })
      .catch((e: Error) => setError(e.message));
  }, [get]);
  useEffect(load, [load]);

  const patch = async (id: string, body: Partial<AdminReview>) => {
    try {
      await request(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setEditing(null);
      load();
    } catch (e) { setError((e as Error).message); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Удалить отзыв безвозвратно?')) return;
    try { await del(`/api/admin/reviews/${id}`); load(); } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Отзывы</h1>
        <p className="text-sm text-muted-foreground">На сайте видны только опубликованные. Пересборка не нужна: сайт подтягивает их из /api/reviews; в статический HTML они попадут при следующей сборке.</p>
      </div>
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <section className="space-y-2">
        <h2 className="font-semibold">Персональные ссылки для клиентов</h2>
        <ul className="space-y-1 text-sm">
          {tokens.map((t) => {
            const url = `https://pavellevdin.ru/ru/review/${t.token}`;
            return (
              <li key={t.token} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{t.title}</span>
                <code className="rounded bg-muted px-2 py-0.5">{url}</code>
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(url)} aria-label="Копировать ссылку"><Copy className="h-4 w-4" /></Button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">Новая ссылка — запись в scripts/review-tokens.json. Для немецких клиентов замените /ru/ на /de/.</p>
      </section>

      <section className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-muted-foreground">Отзывов пока нет.</p>}
        {reviews.map((r) => (
          <article key={r.id} className="rounded-xl border border-border bg-card p-4">
            <header className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{r.name}</span>
              <span className="text-muted-foreground">{[r.role, r.company].filter(Boolean).join(', ')}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{STATUS_LABEL[r.status]}</span>
              {r.verified && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">проверенный · {r.project}</span>}
              {r.rating && <span className="text-xs">{'★'.repeat(r.rating)}</span>}
              <span className="ml-auto text-xs text-muted-foreground">{r.createdAt.slice(0, 16).replace('T', ' ')} · {r.lang}{r.contact ? ` · ${r.contact}` : ''}</span>
            </header>

            {editing === r.id ? (
              <div className="grid gap-2">
                {(['name', 'role', 'company'] as const).map((k) => (
                  <input key={k} className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={String(draft[k] ?? '')} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} placeholder={k} />
                ))}
                <textarea className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-sm" value={String(draft.text ?? '')} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => patch(r.id, draft)}>Сохранить</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Отмена</Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line text-sm">{r.text}</p>
            )}

            <footer className="mt-3 flex flex-wrap gap-2">
              {r.status !== 'approved' && <Button size="sm" onClick={() => patch(r.id, { status: 'approved' })}><Check className="mr-1 h-4 w-4" />Опубликовать</Button>}
              {r.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => patch(r.id, { status: 'rejected' })}><X className="mr-1 h-4 w-4" />Отклонить</Button>}
              <Button size="sm" variant="ghost" onClick={() => { setEditing(r.id); setDraft({ name: r.name, role: r.role, company: r.company, text: r.text }); }}><Pencil className="mr-1 h-4 w-4" />Править</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="mr-1 h-4 w-4" />Удалить</Button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}
