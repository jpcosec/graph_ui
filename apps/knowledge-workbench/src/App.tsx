import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, FileStack, Inbox, Activity, Atom as AtomIcon } from 'lucide-react';
import { useKnowledge, type ViewName } from '@/store/knowledge-store';
import { AtomView } from '@/pages/AtomView';
import { ReaderView } from '@/pages/ReaderView';
import { ComposerView } from '@/pages/ComposerView';
import { InboxView } from '@/pages/InboxView';
import { HealthView } from '@/pages/HealthView';
import { cn } from '@/utils/cn';
import './styles.css';

const NAV: { key: ViewName; icon: typeof AtomIcon; label: string }[] = [
  { key: 'reader', icon: BookOpen, label: 'Lector' },
  { key: 'atom', icon: AtomIcon, label: 'Hecho' },
  { key: 'composer', icon: FileStack, label: 'Compositor' },
  { key: 'inbox', icon: Inbox, label: 'Bandeja' },
  { key: 'health', icon: Activity, label: 'Salud' },
];

const VIEWS: Record<ViewName, () => JSX.Element> = {
  reader: ReaderView,
  atom: AtomView,
  composer: ComposerView,
  inbox: InboxView,
  health: HealthView,
};

function SourceSwitch() {
  const { source, useSource, loading, loadError, data } = useKnowledge();
  return (
    <div className="fixed right-5 top-4 z-50 flex items-center gap-2">
      {loadError && (
        <span className="max-w-md truncate rounded-lg bg-red-500/15 px-2.5 py-1 text-[11px] text-red-300">
          {loadError}
        </span>
      )}
      {!loadError && source === 'sldb' && (
        <span className="font-mono text-[10px] text-muted-foreground">
          {data.atoms.length} hechos del store
        </span>
      )}
      <div className="flex overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur">
        {(['mock', 'sldb'] as const).map((s) => (
          <button
            key={s}
            onClick={() => useSource(s)}
            disabled={loading}
            className={cn(
              'px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50',
              source === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-on-surface',
            )}
          >
            {s === 'mock' ? 'demo' : loading ? '…' : 'sldb'}
          </button>
        ))}
      </div>
    </div>
  );
}

function Shell() {
  const { view, setView } = useKnowledge();
  const Current = VIEWS[view];

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <SourceSwitch />
      <nav className="fixed left-4 top-4 z-50 flex h-[calc(100vh-2rem)] w-16 flex-col items-center gap-2 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-2 py-4 backdrop-blur">
        {NAV.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            title={label}
            className={cn(
              'group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors',
              view === key
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-on-surface',
            )}
          >
            <Icon size={17} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </button>
        ))}
      </nav>

      <main className="ml-24 flex-1 min-w-0">
        <Current />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
);
