/**
 * BANDEJA — what you wrote down without knowing where it goes.
 *
 * Suggestions are not magic: similarity for look-alikes, neighbourhood for the
 * destination (DESIGN.md §5.4).
 */
import { useMemo, useState } from 'react';
import { Trash2, ArrowRight, Link2 } from 'lucide-react';
import { useKnowledge } from '@/store/knowledge-store';
import { similarAtoms, suggestHomes } from '@/lib/analysis';

export function InboxView() {
  const { data, addDraft, discardDraft, promoteDraft, openAtom } = useKnowledge();
  const [text, setText] = useState('');

  const enriched = useMemo(
    () =>
      data.drafts.map((draft) => ({
        draft,
        similar: similarAtoms(data, draft.text),
        homes: suggestHomes(data, draft.text),
      })),
    [data],
  );

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Bandeja</h1>
        <span className="font-mono text-[11px] text-muted-foreground">
          {data.drafts.length} sin ubicar
        </span>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Anotá algo sin pensar dónde va…"
          rows={2}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!text.trim()) return;
              addDraft(text.trim());
              setText('');
            }}
            disabled={!text.trim()}
            className="rounded-lg bg-primary/20 px-3 py-1 text-xs text-primary hover:bg-primary/30 disabled:opacity-40"
          >
            anotar
          </button>
        </div>
      </div>

      {enriched.length === 0 && (
        <p className="text-sm text-muted-foreground">Nada pendiente. Todo es conocimiento.</p>
      )}

      <div className="space-y-4">
        {enriched.map(({ draft, similar, homes }) => (
          <article key={draft.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start gap-3 p-4">
              <p className="flex-1 text-sm leading-relaxed text-on-surface/90">{draft.text}</p>
              <button
                onClick={() => discardDraft(draft.id)}
                title="descartar"
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="border-t border-white/[0.06] px-4 py-3">
              {similar.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    se parece a
                  </div>
                  {similar.map(({ atom, score }) => (
                    <button
                      key={atom.id}
                      onClick={() => openAtom(atom.id)}
                      className="mb-1 flex w-full items-center gap-2 text-left text-xs text-on-surface/80 hover:text-primary"
                    >
                      <Link2 size={11} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{atom.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {Math.round(score * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {homes.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    iría en
                  </div>
                  {homes.map((home) => (
                    <div key={`${home.docId}/${home.sectionId}`} className="mb-1 flex items-center gap-2 text-xs">
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">
                        {home.docTitle} › {home.heading}
                      </span>
                      <button
                        onClick={() => promoteDraft(draft.id, { docId: home.docId, sectionId: home.sectionId })}
                        className="shrink-0 rounded px-2 py-0.5 text-[10px] text-primary hover:bg-primary/10"
                      >
                        ubicar acá
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {similar.length === 0 && homes.length === 0 && (
                <p className="mb-3 text-xs text-muted-foreground">sin parecidos · sin destino claro</p>
              )}

              <button
                onClick={() => promoteDraft(draft.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1 text-xs text-primary hover:bg-primary/25"
              >
                convertir en hecho <ArrowRight size={12} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
