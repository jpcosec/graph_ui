import { useEffect, useMemo, useState } from 'react';

import { GraphEditor } from '@/features/graph-editor/L2-canvas/GraphEditor';
import { sldbProvider } from '@/features/graph-editor/lib/sldb-provider';
import { registerDefaultNodeTypes } from '@/schema/register-defaults';
import { useGraphStore } from '@/stores/graph-store';

import { buildAntoniaGraph, buildAntoniaGraphFromDocuments } from './lib/adapter';
import { registerModelsFromSchema } from './lib/schema-to-registry';

type LoadState =
  | { status: 'loading'; source: 'live' | 'fixture' }
  | { status: 'ready'; source: 'live' | 'fixture' }
  | { status: 'error'; source: 'live' | 'fixture'; message: string };

let fixtureGraphPromise: Promise<Awaited<ReturnType<typeof buildAntoniaGraph>>> | null = null;
let liveGraphPromise: Promise<Awaited<ReturnType<typeof buildAntoniaGraphFromDocuments>>> | null = null;

function getSource(): 'live' | 'fixture' {
  if (typeof window === 'undefined') {
    return 'live';
  }

  return new URLSearchParams(window.location.search).get('src') === 'fixture' ? 'fixture' : 'live';
}

function loadFixtureGraph() {
  registerDefaultNodeTypes();

  if (!fixtureGraphPromise) {
    fixtureGraphPromise = buildAntoniaGraph();
  }

  return fixtureGraphPromise;
}

function loadLiveGraph() {
  registerDefaultNodeTypes();

  if (!liveGraphPromise) {
    liveGraphPromise = (async () => {
      const schema = await sldbProvider.getSchema();
      registerModelsFromSchema(schema);
      const { documents } = await sldbProvider.getGraph();
      return buildAntoniaGraphFromDocuments(documents);
    })();
  }

  return liveGraphPromise;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_18px_40px_rgba(120,0,0,0.25)]">
      <div className="font-medium">sldb serve not reachable at /sldb — start it</div>
      <div className="mt-1 text-red-100/80">{message}</div>
    </div>
  );
}

export function AntoniaFlowPage() {
  const loadGraph = useGraphStore((state) => state.loadGraph);
  const source = useMemo(() => getSource(), []);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading', source });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadState({ status: 'loading', source });

      try {
        const graph = source === 'fixture'
          ? await loadFixtureGraph()
          : await loadLiveGraph();

        if (cancelled) {
          return;
        }

        loadGraph(graph.nodes, graph.edges);
        setLoadState({ status: 'ready', source });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        setLoadState({ status: 'error', source, message });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadGraph, source]);

  if (loadState.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center px-6">
        <div className="glass-panel w-full max-w-xl rounded-[2rem] p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">Conversation Flow</p>
          <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface">Loading Antonia flow</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {loadState.source === 'live' ? 'Fetching schema and live ConversationStep documents from sldb serve…' : 'Loading the fixture fallback…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <GraphEditor
      initialNodes={[]}
      initialEdges={[]}
      onSave={() => {}}
      hero={{
        eyebrow: 'Conversation Flow',
        title: 'Antonia — real ConversationStep atoms',
        description: loadState.source === 'live'
          ? 'Live ConversationStep documents and schema pulled from sldb serve'
          : 'Fixture ConversationStep documents for offline review',
      }}
      workspace={{
        label: loadState.source === 'live' ? 'Live store' : 'Fixture store',
        title: 'Antonia flow',
        description: loadState.source === 'live'
          ? 'Schema-driven rendering of the live conversation model'
          : 'Fixture rendering of the conversation model',
      }}
      topOverlay={loadState.status === 'error' ? <ErrorBanner message={loadState.message} /> : undefined}
      shellVariant="compact"
      contentTopInset={116}
      overlayPlacement="canvas"
    />
  );
}
