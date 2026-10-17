/**
 * COMPOSITOR — build a document without writing it.
 *
 * A section declares what to show. Two ways (DESIGN.md §5.3):
 *   list   I pick the facts. Stays put.
 *   query  the system picks. Grows on its own — this is why docs do not age.
 */
import { useState } from 'react';
import { ChevronUp, ChevronDown, X, GripVertical, ListTree, Search } from 'lucide-react';
import { useKnowledge } from '@/store/knowledge-store';
import { resolveBinding } from '@/lib/queries';
import { cn } from '@/utils/cn';

export function ComposerView() {
  const { data, selectedDocId, selectDoc, openAtom, setBinding, removeFromSection, moveInSection } =
    useKnowledge();
  const [adding, setAdding] = useState<string | null>(null);

  const doc = data.docs.find((d) => d.id === selectedDocId) ?? data.docs[0];
  if (!doc) {
    // Query-driven composition is the second open gap: SLDB's `source_field`
    // demands an explicit path list (DESIGN.md §8).
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-muted-foreground">
          El store no tiene documentos compuestos.
        </p>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground/70">
          La composición por consulta no está implementada en SLDB. En{' '}
          <span className="font-mono">demo</span> se ve la diferencia entre lista y consulta.
        </p>
      </div>
    );
  }

  const allTags = [...new Set(data.atoms.flatMap((a) => a.tags.map((t) => `${t.split(':')[0]}:`)))].sort();

  return (
    <div className="flex h-screen">
      <aside className="w-64 shrink-0 overflow-auto border-r border-white/10 px-4 py-6">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          documentos
        </div>
        {data.docs.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDoc(d.id)}
            className={cn(
              'mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              d.id === doc.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-on-surface',
            )}
          >
            {d.title}
          </button>
        ))}
      </aside>

      <div className="flex-1 overflow-auto px-8 py-6">
        <h1 className="mb-6 text-xl font-semibold">{doc.title}</h1>

        {doc.sections.map((section) => {
          const atoms = resolveBinding(data, section.binding);
          const isQuery = section.binding.kind === 'query';

          return (
            <section key={section.id} className="mb-9">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-base text-on-surface">## {section.heading}</h2>
                <div className="flex overflow-hidden rounded-lg border border-white/10">
                  <button
                    onClick={() =>
                      setBinding(doc.id, section.id, { kind: 'list', atomIds: atoms.map((a) => a.id) })
                    }
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase',
                      !isQuery ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-on-surface',
                    )}
                  >
                    <ListTree size={11} /> lista
                  </button>
                  <button
                    onClick={() => setBinding(doc.id, section.id, { kind: 'query', tags: [], relatedTo: null })}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase',
                      isQuery ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground hover:text-on-surface',
                    )}
                  >
                    <Search size={11} /> consulta
                  </button>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{atoms.length}</span>
              </div>

              {isQuery && section.binding.kind === 'query' && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-secondary/30 bg-secondary/[0.04] px-3 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground">tags:</span>
                  {allTags.map((t) => {
                    const on = section.binding.kind === 'query' && section.binding.tags.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          if (section.binding.kind !== 'query') return;
                          const tags = on
                            ? section.binding.tags.filter((x) => x !== t)
                            : [...section.binding.tags, t];
                          setBinding(doc.id, section.id, { ...section.binding, tags });
                        }}
                        className={cn(
                          'rounded-full px-2 py-0.5 font-mono text-[10px]',
                          on
                            ? 'bg-secondary/25 text-secondary'
                            : 'border border-white/10 text-muted-foreground hover:text-on-surface',
                        )}
                      >
                        {t}*
                      </button>
                    );
                  })}
                  <span className="ml-auto font-mono text-[10px] text-secondary">se actualiza solo</span>
                </div>
              )}

              <div className="space-y-2">
                {atoms.map((atom, i) => (
                  <div
                    key={atom.id}
                    className={cn(
                      'group flex items-start gap-2 rounded-xl border px-3 py-2.5',
                      isQuery
                        ? 'border-dashed border-secondary/25 bg-secondary/[0.03]'
                        : 'border-white/10 bg-white/[0.02]',
                    )}
                  >
                    {!isQuery && (
                      <div className="flex flex-col opacity-0 transition-opacity group-hover:opacity-60">
                        <button onClick={() => moveInSection(doc.id, section.id, i, i - 1)} title="subir">
                          <ChevronUp size={13} />
                        </button>
                        <button onClick={() => moveInSection(doc.id, section.id, i, i + 1)} title="bajar">
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    )}
                    {isQuery && <GripVertical size={13} className="mt-0.5 opacity-20" />}

                    <button onClick={() => openAtom(atom.id)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm text-on-surface">{atom.title}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {atom.answer}
                      </div>
                    </button>

                    {!isQuery && (
                      <button
                        onClick={() => removeFromSection(doc.id, section.id, atom.id)}
                        title="sacar del documento — no borra el hecho"
                        className="opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-60"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {atoms.length === 0 && (
                  <p className="px-1 text-xs text-muted-foreground">
                    {isQuery ? 'Ningún hecho coincide con la consulta.' : 'Sección vacía.'}
                  </p>
                )}
              </div>

              {!isQuery && section.binding.kind === 'list' && (
                <div className="mt-2">
                  {adding === section.id ? (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                      {data.atoms
                        .filter((a) => !atoms.some((x) => x.id === a.id))
                        .map((a) => (
                          <button
                            key={a.id}
                            onClick={() => {
                              if (section.binding.kind !== 'list') return;
                              setBinding(doc.id, section.id, {
                                ...section.binding,
                                atomIds: [...section.binding.atomIds, a.id],
                              });
                              setAdding(null);
                            }}
                            className="block w-full truncate rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-white/5 hover:text-on-surface"
                          >
                            + {a.title}
                          </button>
                        ))}
                      <button
                        onClick={() => setAdding(null)}
                        className="mt-1 px-2 text-[10px] text-muted-foreground hover:text-on-surface"
                      >
                        cerrar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAdding(section.id)}
                      className="px-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      + agregar hecho
                    </button>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
