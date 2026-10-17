/**
 * LECTOR — anchoring over raw text.
 *
 * The source is evidence: never edited. Selecting a span and naming it turns it
 * into a fact, carrying provenance automatically (DESIGN.md §5.1).
 */
import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Link2 } from 'lucide-react';
import { useKnowledge } from '@/store/knowledge-store';
import { anchoredRatio, segmentSource } from '@/lib/queries';
import { similarAtoms } from '@/lib/analysis';
import { cn } from '@/utils/cn';

interface Selection {
  text: string;
  start: number;
  end: number;
  line: number;
}

export function ReaderView() {
  const { data, selectedSourceId, openAtom, anchorSelection } = useKnowledge();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const source = data.sources.find((s) => s.id === selectedSourceId) ?? data.sources[0];
  const segments = useMemo(() => (source ? segmentSource(source) : []), [source]);
  const similar = useMemo(
    () => (selection ? similarAtoms(data, selection.text) : []),
    [data, selection],
  );
  const knownTags = useMemo(
    () => [...new Set(data.atoms.flatMap((a) => a.tags))].sort(),
    [data.atoms],
  );

  if (!source) {
    // SLDB has no notion of a raw source yet: anchoring is the gap this view
    // exists to close (DESIGN.md §8).
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-muted-foreground">
          El store no tiene textos crudos: SLDB todavía no modela fuentes.
        </p>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground/70">
          Anclar es justamente el hueco que falta. En <span className="font-mono">demo</span> se ve
          el gesto completo.
        </p>
      </div>
    );
  }
  const ratio = anchoredRatio(source);

  /** Map a DOM selection back to offsets in the original text. */
  const captureSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !hostRef.current) return;
    const text = sel.toString().trim();
    if (text.length < 8) return;
    const start = source.text.indexOf(text);
    if (start < 0) return;
    setSelection({
      text,
      start,
      end: start + text.length,
      line: source.text.slice(0, start).split('\n').length,
    });
    setTitle(text.length > 60 ? `${text.slice(0, 57)}…` : text);
    setTags([]);
  };

  const commit = () => {
    if (!selection || !title.trim()) return;
    anchorSelection({
      sourceId: source.id,
      span: { start: selection.start, end: selection.end, line: selection.line },
      title: title.trim(),
      answer: selection.text,
      tags,
    });
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-4 border-b border-white/10 px-8 py-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-on-surface">{source.title}</div>
          <div className="truncate font-mono text-[10px] text-muted-foreground">{source.path}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-primary" style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {Math.round(ratio * 100)}% anclado
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div
          ref={hostRef}
          onMouseUp={captureSelection}
          className="flex-1 overflow-auto px-8 py-6 text-[15px] leading-[1.9] selection:bg-primary/30"
        >
          <div className="mx-auto max-w-2xl whitespace-pre-wrap">
            {segments.map((seg, i) =>
              seg.atomId ? (
                <span
                  key={i}
                  onClick={() => openAtom(seg.atomId!)}
                  title={seg.atomId}
                  className="cursor-pointer rounded border-b-2 border-primary/50 bg-primary/10 hover:bg-primary/20"
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </div>
        </div>

        <aside className="w-96 shrink-0 overflow-auto border-l border-white/10 px-5 py-6">
          {!selection ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seleccioná un tramo de texto para convertirlo en un hecho.
              <br />
              <br />
              Lo resaltado ya es conocimiento. Lo demás está sin extraer.
            </p>
          ) : (
            <>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Selección · línea {selection.line}
              </div>
              <blockquote className="mb-5 rounded-lg border border-white/10 bg-black/25 p-3 text-xs italic leading-relaxed">
                {selection.text}
              </blockquote>

              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                título
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-sm outline-none focus:border-primary/50"
              />

              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                tags
              </label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary"
                  >
                    {t} ×
                  </button>
                ))}
              </div>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {knownTags
                  .filter((t) => !tags.includes(t))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t}
                      onClick={() => setTags([...tags, t])}
                      className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-primary/40 hover:text-primary"
                    >
                      ◇ {t}
                    </button>
                  ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={commit}
                  disabled={!title.trim()}
                  className="rounded-lg bg-primary/20 px-4 py-1.5 text-sm text-primary hover:bg-primary/30 disabled:opacity-40"
                >
                  anclar
                </button>
                <button
                  onClick={() => setSelection(null)}
                  className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-on-surface"
                >
                  cancelar
                </button>
              </div>

              {similar.length > 0 && (
                <div className="mt-6 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-300/90">
                    <AlertTriangle size={12} /> parecido a un hecho que ya existe
                  </div>
                  {similar.map(({ atom, score }) => (
                    <button
                      key={atom.id}
                      onClick={() => openAtom(atom.id)}
                      className="mb-1 flex w-full items-start gap-1.5 text-left text-xs text-on-surface/80 hover:text-primary"
                    >
                      <Link2 size={11} className="mt-0.5 shrink-0" />
                      <span className="flex-1">{atom.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {Math.round(score * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
