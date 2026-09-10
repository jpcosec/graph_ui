import { useEffect, useMemo, useState } from 'react';

import { GraphEditor } from '@/features/graph-editor/L2-canvas/GraphEditor';
import { sldbProvider } from '@/features/graph-editor/lib/sldb-provider';
import { registry } from '@/schema/registry';
import { useGraphStore } from '@/stores/graph-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { buildHumModelFromDocuments, buildHumViewGraph, registerHumNodeTypes, summarizeHumSelection } from './lib/adapter';
import type { HumViewMode } from './lib/types';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

function modeLabel(mode: HumViewMode): string {
  return {
    structure: 'Structure',
    body: 'Body',
    routine: 'Routine',
    trace: 'Trace',
    compare: 'Compare',
  }[mode];
}

function hasModeData(model: ReturnType<typeof buildHumModelFromDocuments>, mode: HumViewMode): boolean {
  if (mode === 'structure') {
    return model.astFiles.length > 0 || model.astForms.length > 0;
  }
  if (mode === 'body') {
    return model.organs.length > 0 || model.capabilities.length > 0 || model.artifacts.length > 0;
  }
  if (mode === 'routine') {
    return model.routines.length > 0;
  }
  if (mode === 'trace') {
    return model.traces.length > 0;
  }
  return model.routines.length > 0 && model.traces.length > 0;
}

const modeCopy: Record<HumViewMode, { eyebrow: string; title: string; description: string; accentClass: string; lens: string; note: string }> = {
  structure: {
    eyebrow: 'Source Topology',
    title: 'Read the Lisp organism as a calm expandable archive',
    description: 'Files become containers, top-level forms become rows, and structural links stay quiet until you need them.',
    accentClass: 'hum-mode-structure',
    lens: 'Topological lens',
    note: 'Start here when you need location and provenance before meaning.',
  },
  body: {
    eyebrow: 'Embodied View',
    title: 'See the shell as organs, capabilities, and memory tissue',
    description: 'Packages are anatomy, tools are embodied actuators, and state artifacts remain peripheral but legible.',
    accentClass: 'hum-mode-body',
    lens: 'Anatomical lens',
    note: 'Use this to understand what HUM is, not what it just did.',
  },
  routine: {
    eyebrow: 'Normative Flow',
    title: 'Trace the intended pathway through the body',
    description: 'Canonical steps align across organs so the expected choreography reads before the concrete execution.',
    accentClass: 'hum-mode-routine',
    lens: 'Routine lens',
    note: 'Routine mode should answer what ought to happen.',
  },
  trace: {
    eyebrow: 'Observed Run',
    title: 'Replay an actual path and inspect its pressure points',
    description: 'Events become the foreground and the body fades into the support structure behind them.',
    accentClass: 'hum-mode-trace',
    lens: 'Forensic lens',
    note: 'Use this when debugging a concrete execution.',
  },
  compare: {
    eyebrow: 'Divergence View',
    title: 'Compare the intended routine against what the trace really did',
    description: 'Routine and trace sit in tension so loops, skips, and substitutions become immediately visible.',
    accentClass: 'hum-mode-compare',
    lens: 'Deviation lens',
    note: 'Compare mode is the diagnosis surface.',
  },
};

const emptyStateDescriptions: Record<HumViewMode, { title: string; description: string }> = {
  structure: {
    title: 'No source topology data',
    description: 'sldb serve returned no file or form documents. Structure view requires AST file and form data to render the Lisp archive.',
  },
  body: {
    title: 'No anatomical data',
    description: 'sldb serve returned no organ, capability, or artifact documents. Body view needs at least one organ to render the HUM anatomy.',
  },
  routine: {
    title: 'No routine data',
    description: 'sldb serve returned no routine documents. Routine view requires at least one routine to render the normative flow.',
  },
  trace: {
    title: 'No trace data',
    description: 'sldb serve returned no trace documents. Trace view requires at least one trace to render the observed execution.',
  },
  compare: {
    title: 'No routine or trace data',
    description: 'sldb serve returned no routine or trace documents. Compare view needs both a routine and a trace to show divergence.',
  },
};

function LoadingState() {
  return (
    <div className="flex h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-xl rounded-[2rem] p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">HUM Body</p>
        <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface">Loading HUM body</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Fetching schema and live Hum documents from sldb serve…
        </p>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_18px_40px_rgba(120,0,0,0.25)]">
      <div className="font-medium">sldb serve not reachable at /sldb — start it</div>
      <div className="mt-1 text-red-100/80">{message}</div>
    </div>
  );
}

function EmptyOverlay({ title, description }: { title: string; description: string }) {
  return (
    <div data-testid="hum-empty-state" className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">No data</p>
      <h2 className="mt-2 font-headline text-xl font-bold text-on-surface">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function HumBodyPage() {
  const loadGraph = useGraphStore((state) => state.loadGraph);

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [model, setModel] = useState<ReturnType<typeof buildHumModelFromDocuments> | null>(null);

  const [mode, setMode] = useState<HumViewMode>('structure');
  const [routineId, setRoutineId] = useState<string>('');
  const [traceId, setTraceId] = useState<string>('');
  // Load live model on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadState({ status: 'loading' });

      try {
        registerHumNodeTypes(registry);
        const { documents } = await sldbProvider.getGraph();
        const built = buildHumModelFromDocuments(documents);

        if (cancelled) {
          return;
        }

        setModel(built);

        // Initialise selectors from the live model
        if (built.routines.length > 0 && !routineId) {
          setRoutineId(built.routines[0].id);
        }
        if (built.traces.length > 0 && !traceId) {
          setTraceId(built.traces[0].id);
        }

        setLoadState({ status: 'ready' });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        setLoadState({ status: 'error', message });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveRoutineId = useMemo(() => {
    if (!model) {
      return '';
    }

    if (mode === 'trace' || mode === 'compare') {
      const trace = model.traces.find((t) => t.id === traceId) ?? model.traces[0];
      return trace?.routineId ?? routineId;
    }

    return routineId;
  }, [model, mode, routineId, traceId]);

  const graph = useMemo(() => {
    if (!model || !hasModeData(model, mode)) {
      return { nodes: [], edges: [] };
    }

    return buildHumViewGraph(mode, effectiveRoutineId, traceId, model);
  }, [effectiveRoutineId, mode, model, traceId]);

  const summary = useMemo(() => {
    if (!model) {
      return null;
    }

    return summarizeHumSelection(mode, effectiveRoutineId, traceId, model);
  }, [effectiveRoutineId, mode, traceId, model]);

  const availableTraces = useMemo(() => {
    if (!model) {
      return [];
    }

    return model.traces.filter((trace) => trace.routineId === effectiveRoutineId);
  }, [effectiveRoutineId, model]);

  // Sync trace picker when mode changes
  useEffect(() => {
    if (!model) {
      return;
    }

    const trace = model.traces.find((t) => t.id === traceId);
    if (trace && (mode === 'trace' || mode === 'compare') && trace.routineId !== routineId) {
      setRoutineId(trace.routineId);
    }
  }, [model, mode, routineId, traceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Constrain trace selection to available traces
  useEffect(() => {
    if (!model || availableTraces.length === 0) {
      return;
    }

    const hasCurrentTrace = availableTraces.some((t) => t.id === traceId);
    if (!hasCurrentTrace) {
      setTraceId(availableTraces[0].id);
    }
  }, [availableTraces, model, traceId]);

  // Keep the canvas as a projection of the current live model and lens.
  useEffect(() => {
    loadGraph(graph.nodes, graph.edges);
  }, [graph.edges, graph.nodes, loadGraph]);

  if (loadState.status === 'loading') {
    return <LoadingState />;
  }

  if (loadState.status === 'error') {
    return (
      <GraphEditor
        initialNodes={[]}
        initialEdges={[]}
        editable={false}
        hero={{
          eyebrow: 'HUM Body',
          title: 'HUM body observatory',
          description: 'Live Hum documents from sldb serve',
        }}
        workspace={{
          label: 'Live store',
          title: 'HUM body',
          description: 'Schema-driven rendering of live Hum model documents',
        }}
        topOverlay={<ErrorBanner message={loadState.message} />}
        shellVariant="compact"
        contentTopInset={116}
        overlayPlacement="canvas"
      />
    );
  }

  // ── Ready state ──

  const showRoutinePicker = mode !== 'structure' && model !== null && model.routines.length > 0;
  const showTracePicker = (mode === 'trace' || mode === 'compare') && model !== null && model.traces.length > 0;
  const modeMeta = modeCopy[mode];

  // Determine if the current view mode has no data
  const hasNoData = model === null || !hasModeData(model, mode);

  if (hasNoData) {
    const empty = emptyStateDescriptions[mode];
    const emptyOverlay = (
      <div className={`pointer-events-auto hum-overlay-panel ${modeMeta.accentClass} flex w-full flex-col gap-3 rounded-2xl px-4 py-3`}>
        <Tabs value={mode} onValueChange={(value) => setMode(value as HumViewMode)}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-white/5 p-1">
            <TabsTrigger value="structure" data-testid="mode-tab-structure">Structure</TabsTrigger>
            <TabsTrigger value="body" data-testid="mode-tab-body">Body</TabsTrigger>
            <TabsTrigger value="routine" data-testid="mode-tab-routine">Routine</TabsTrigger>
            <TabsTrigger value="trace" data-testid="mode-tab-trace">Trace</TabsTrigger>
            <TabsTrigger value="compare" data-testid="mode-tab-compare">Compare</TabsTrigger>
          </TabsList>
        </Tabs>
        <EmptyOverlay title={empty.title} description={empty.description} />
      </div>
    );

    return (
      <GraphEditor
        initialNodes={[]}
        initialEdges={[]}
        editable={false}
        hero={{
          eyebrow: modeMeta.eyebrow,
          title: modeMeta.title,
          description: modeMeta.description,
        }}
        workspace={{
          label: modeMeta.lens,
          title: 'HUM observatory',
          description: 'Projection tuned to the active lens',
        }}
        topOverlay={emptyOverlay}
        shellVariant={mode === 'structure' ? 'compact' : 'default'}
        contentTopInset={mode === 'structure' ? 0 : 154}
        overlayPlacement={mode === 'structure' ? 'sidebar' : 'canvas'}
      />
    );
  }

  const statTiles = mode === 'structure' && summary
    ? [
        ['Files', summary.astFiles],
        ['Forms', summary.astForms],
        ['Mode', modeLabel(summary.mode)],
      ]
    : mode === 'body' && summary
      ? [
          ['Organs', summary.organs],
          ['Capabilities', summary.capabilities],
          ['Artifacts', summary.artifacts],
        ]
      : mode === 'routine' && summary
        ? [
            ['Steps', summary.routineSteps],
            ['Organs', summary.organs],
            ['Routine', summary.routineLabel],
          ]
        : mode === 'trace' && summary
          ? [
              ['Events', summary.traceEvents],
              ['Routine', summary.routineLabel],
              ['Trace', summary.traceLabel],
            ]
          : summary
            ? [
                ['Steps', summary.routineSteps],
                ['Events', summary.traceEvents],
                ['Trace', summary.traceLabel],
              ]
            : [['', ''], ['', ''], ['', '']];

  const overlay = (
    <div className={`pointer-events-auto hum-overlay-panel ${modeMeta.accentClass} flex w-full ${mode === 'structure' ? 'max-w-full' : 'max-w-[920px]'} flex-col gap-2 rounded-2xl px-4 py-3`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">{modeMeta.eyebrow}</p>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">{modeMeta.lens}</span>
          </div>
          {mode !== 'structure' ? <div className="mt-2 max-w-[36rem]">
            <h2 className="text-[1.05rem] font-semibold leading-tight text-white/94">{modeMeta.title}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-white/58">{modeMeta.description}</p>
          </div> : null}
          {mode === 'structure' ? <p className="mt-2 max-w-[34rem] text-[12px] leading-relaxed text-white/58">Expand files, scan forms, then switch lenses once you know the terrain.</p> : null}
          <Tabs value={mode} onValueChange={(value) => setMode(value as HumViewMode)} className="mt-2">
            <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-white/5 p-1">
              <TabsTrigger value="structure" data-testid="mode-tab-structure">Structure</TabsTrigger>
              <TabsTrigger value="body" data-testid="mode-tab-body">Body</TabsTrigger>
              <TabsTrigger value="routine" data-testid="mode-tab-routine">Routine</TabsTrigger>
              <TabsTrigger value="trace" data-testid="mode-tab-trace">Trace</TabsTrigger>
              <TabsTrigger value="compare" data-testid="mode-tab-compare">Compare</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="min-w-[210px] rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
          <div className="grid grid-cols-3 gap-3 text-on-surface">
            {statTiles.map(([label, value]) => (
              <div key={label as string}>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">{label as string}</div>
                <div className="mt-1 text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-white/8 pt-2.5">
        {showRoutinePicker ? <div className="min-w-[240px] flex-1">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Routine</p>
          <Select value={routineId} onValueChange={setRoutineId}>
            <SelectTrigger className="h-10 border-white/10 bg-white/5 text-on-surface" data-testid="routine-select-trigger">
              <SelectValue placeholder="Select routine" />
            </SelectTrigger>
            <SelectContent>
              {(model?.routines ?? []).map((routine) => (
                <SelectItem key={routine.id} value={routine.id}>
                  {routine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> : null}

        {showTracePicker ? <div className="min-w-[240px] flex-1">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trace</p>
          <Select value={traceId} onValueChange={setTraceId}>
            <SelectTrigger className="h-10 border-white/10 bg-white/5 text-on-surface" data-testid="trace-select-trigger">
              <SelectValue placeholder="Select trace" />
            </SelectTrigger>
            <SelectContent>
              {(model?.traces ?? []).filter((trace) => trace.routineId === effectiveRoutineId).map((trace) => (
                <SelectItem key={trace.id} value={trace.id}>
                  {trace.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> : null}

        {summary ? <div className="min-w-[220px] flex-[1.2] text-xs text-muted-foreground">
          {mode !== 'structure' ? <p>{modeMeta.note}</p> : null}
          {showRoutinePicker ? <p><span className="font-mono uppercase tracking-[0.12em] text-white/55">Routine:</span> {summary.routineLabel}</p> : null}
          {showTracePicker ? <p className="mt-1"><span className="font-mono uppercase tracking-[0.12em] text-white/55">Trace:</span> {summary.traceLabel}</p> : null}
        </div> : null}
      </div>
    </div>
  );

  return (
    <GraphEditor
      initialNodes={graph.nodes}
      initialEdges={graph.edges}
      editable={false}
      hero={{
        eyebrow: modeMeta.eyebrow,
        title: modeMeta.title,
        description: modeMeta.description,
      }}
      workspace={{
        label: modeMeta.lens,
        title: 'HUM observatory',
        description: mode === 'structure' ? 'Source-first reading surface' : 'Projection tuned to the active lens',
      }}
      topOverlay={overlay}
      shellVariant={mode === 'structure' ? 'compact' : 'default'}
      contentTopInset={mode === 'structure' ? 0 : 154}
      overlayPlacement={mode === 'structure' ? 'sidebar' : 'canvas'}
    />
  );
}
