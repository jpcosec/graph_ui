import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useKnowledge } from '@/store/knowledge-store';
import { cn } from '@/utils/cn';

/** Atom list with filter. With 60 facts in a store, the list IS the navigation. */
export function AtomPicker() {
  const { data, selectedAtomId, openAtom } = useKnowledge();
  const [q, setQ] = useState('');

  const atoms = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data.atoms;
    return data.atoms.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.answer.toLowerCase().includes(needle) ||
        a.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [data.atoms, q]);

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-white/10">
      <div className="border-b border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="filtrar hechos…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-2 font-mono text-[10px] text-muted-foreground">
          {atoms.length} de {data.atoms.length}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {atoms.map((atom) => (
          <button
            key={atom.id}
            onClick={() => openAtom(atom.id)}
            className={cn(
              'mb-1 block w-full rounded-lg px-2.5 py-2 text-left transition-colors',
              atom.id === selectedAtomId
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-white/[0.04] hover:text-on-surface',
            )}
          >
            <div className="truncate text-xs">{atom.title}</div>
            {!atom.provenance && (
              <div className="mt-0.5 font-mono text-[9px] text-amber-400/50">sin origen</div>
            )}
          </button>
        ))}
        {atoms.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">Nada coincide.</p>
        )}
      </div>
    </aside>
  );
}
