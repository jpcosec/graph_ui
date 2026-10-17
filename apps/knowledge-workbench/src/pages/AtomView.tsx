/**
 * ATOM — the fact in focus. The center of the model: every path leads here.
 *
 * Three tabs answer three questions (DESIGN.md §5.2):
 *   Origin     is this true, where did it come from
 *   Relations  what does it hang off
 *   Usages     what breaks if I change it
 */
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import { useKnowledge } from '@/store/knowledge-store';
import { incidentRelations, sourceById, usagesOf } from '@/lib/queries';
import { RELATION_LABEL } from '@/schema/knowledge';
import { InlineEdit } from '@/components/InlineEdit';
import { AtomPicker } from '@/components/AtomPicker';
import { cn } from '@/utils/cn';

type Tab = 'origin' | 'relations' | 'usages';

export function AtomView() {
  return (
    <div className="flex h-screen">
      <AtomPicker />
      <div className="min-w-0 flex-1 overflow-auto">
        <AtomDetail />
      </div>
    </div>
  );
}

function AtomDetail() {
  const { data, selectedAtomId, openAtom, openReader, updateAtom, updateRelationMotive } = useKnowledge();
  const [tab, setTab] = useState<Tab>('origin');

  const atom = data.atoms.find((a) => a.id === selectedAtomId);
  if (!atom) return <div className="p-8 text-muted-foreground">Ningún hecho seleccionado.</div>;

  const incidents = incidentRelations(data, atom.id);
  const usages = usagesOf(data, atom.id);
  const source = atom.provenance ? sourceById(data, atom.provenance.sourceId) : undefined;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'origin', label: 'Origen' },
    { key: 'relations', label: `Relaciones (${incidents.length})` },
    { key: 'usages', label: `Usos (${usages.length})` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {atom.id}
      </div>

      <InlineEdit
        value={atom.title}
        onCommit={(title) => updateAtom(atom.id, { title })}
        className="text-2xl font-semibold text-on-surface"
      />
      <div className="my-4 h-px bg-white/10" />
      <InlineEdit
        value={atom.answer}
        onCommit={(answer) => updateAtom(atom.id, { answer })}
        multiline
        className="leading-relaxed text-on-surface/85"
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {atom.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors',
                tab === t.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-on-surface',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'origin' &&
            (atom.provenance && source ? (
              <>
                <div className="mb-3 font-mono text-[11px] text-muted-foreground">
                  {source.title} · línea {atom.provenance.span.line}
                </div>
                <blockquote className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed">
                  <mark className="bg-primary/25 text-on-surface">
                    {source.text.slice(atom.provenance.span.start, atom.provenance.span.end)}
                  </mark>
                </blockquote>
                <button
                  onClick={() => openReader(source.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <BookOpen size={13} /> abrir en el Lector
                </button>
              </>
            ) : (
              <div className="flex items-start gap-2 text-sm text-amber-300/90">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>
                  Sin origen. No se puede auditar de dónde salió — es opinión, no conocimiento.
                </span>
              </div>
            ))}

          {tab === 'relations' && (
            <div className="space-y-4">
              {incidents.length === 0 && (
                <p className="text-sm text-muted-foreground">Aislado: no se relaciona con nada.</p>
              )}
              {incidents.map(({ relation, direction, other }) => (
                <div key={relation.id} className="border-l-2 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 text-sm">
                    {direction === 'in' && <ArrowLeft size={13} className="text-primary shrink-0" />}
                    <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
                      {RELATION_LABEL[relation.type]}
                    </span>
                    {direction === 'out' && <ArrowRight size={13} className="text-primary shrink-0" />}
                    <button
                      onClick={() => other && openAtom(other.id)}
                      className="text-left text-on-surface hover:underline"
                    >
                      {other?.title ?? relation.to}
                    </button>
                  </div>
                  <InlineEdit
                    value={relation.motive}
                    onCommit={(motive) => updateRelationMotive(relation.id, motive)}
                    placeholder="sin motivo — por qué existe esta relación"
                    className="mt-1 text-xs italic text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'usages' && (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Este hecho aparece en {usages.length} {usages.length === 1 ? 'documento' : 'documentos'}:
              </p>
              <ul className="space-y-2">
                {usages.map((u) => (
                  <li key={`${u.doc.id}/${u.sectionId}`} className="flex items-center gap-2 text-sm">
                    <span className="text-on-surface">{u.doc.title}</span>
                    <span className="text-muted-foreground">→ {u.heading}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase',
                        u.via === 'query'
                          ? 'bg-secondary/15 text-secondary'
                          : 'bg-white/[0.06] text-muted-foreground',
                      )}
                    >
                      {u.via === 'query' ? 'por consulta' : 'por lista'}
                    </span>
                  </li>
                ))}
              </ul>
              {usages.length > 1 && (
                <div className="mt-4 flex items-start gap-2 text-xs text-amber-300/90">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  editarlo cambia los {usages.length}.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
