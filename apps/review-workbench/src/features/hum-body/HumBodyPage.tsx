import { useEffect, useMemo, useRef, useState } from 'react';

import { GraphEditor } from '@/features/graph-editor/L2-canvas/GraphEditor';
import { registry } from '@/schema/registry';
import { useGraphStore } from '@/stores/graph-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { buildHumViewGraph, registerHumNodeTypes, summarizeHumSelection } from './lib/adapter';
import { humBodyModel } from './lib/mock-data';
import type { HumViewMode } from './lib/types';

const routines = humBodyModel.routines;
const traces = humBodyModel.traces;
const STORAGE_KEY = 'hum-body-view-drafts';

function modeLabel(mode: HumViewMode): string {
  return {
    structure: 'Structure',
    body: 'Body',
    routine: 'Routine',
    trace: 'Trace',
    compare: 'Compare',
  }[mode];
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

export function HumBodyPage() {
  const loadGraph = useGraphStore((state) => state.loadGraph);
  const markSaved = useGraphStore((state) => state.markSaved);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);

  const [mode, setMode] = useState<HumViewMode>('structure');
  const [routineId, setRoutineId] = useState<string>(routines[0]?.id ?? 'task-execution');
  const [traceId, setTraceId] = useState<string>(traces[0]?.id ?? 'trace-inspection-loop');
  const [draftGraphs, setDraftGraphs] = useState<Record<string, { nodes: typeof nodes; edges: typeof edges }>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Record<string, { nodes: typeof nodes; edges: typeof edges }> : {};
    } catch {
      return {};
    }
  });
  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    registerHumNodeTypes(registry);
  }, []);

  const selectedTrace = useMemo(
    () => traces.find((trace) => trace.id === traceId) ?? traces[0],
    [traceId],
  );
  const effectiveRoutineId = (mode === 'trace' || mode === 'compare') && selectedTrace
    ? selectedTrace.routineId
    : routineId;
  const currentKey = `${mode}|${effectiveRoutineId}|${traceId}`;

  const graph = useMemo(
    () => draftGraphs[currentKey] ?? buildHumViewGraph(mode, effectiveRoutineId, traceId),
    [currentKey, draftGraphs, effectiveRoutineId, mode, traceId],
  );
  const summary = useMemo(
    () => summarizeHumSelection(mode, effectiveRoutineId, traceId),
    [effectiveRoutineId, mode, traceId],
  );

  const availableTraces = useMemo(
    () => traces.filter((trace) => trace.routineId === effectiveRoutineId),
    [effectiveRoutineId],
  );

  useEffect(() => {
    if (selectedTrace && (mode === 'trace' || mode === 'compare') && selectedTrace.routineId !== routineId) {
      setRoutineId(selectedTrace.routineId);
    }
  }, [mode, routineId, selectedTrace]);

  useEffect(() => {
    if (availableTraces.length === 0) {
      return;
    }

    const hasCurrentTrace = availableTraces.some((trace) => trace.id === traceId);
    if (!hasCurrentTrace) {
      setTraceId(availableTraces[0].id);
    }
  }, [availableTraces, traceId]);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }

    setDraftGraphs((current) => {
      const nextGraph = { nodes, edges };
      const existing = current[currentKey];
      if (existing && JSON.stringify(existing) === JSON.stringify(nextGraph)) {
        return current;
      }
      return {
        ...current,
        [currentKey]: nextGraph,
      };
    });
  }, [currentKey, edges, nodes]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftGraphs));
  }, [draftGraphs]);

  useEffect(() => {
    if (loadedKeyRef.current === currentKey) {
      return;
    }

    loadedKeyRef.current = currentKey;
    loadGraph(graph.nodes, graph.edges);
  }, [currentKey, graph.edges, graph.nodes, loadGraph]);

  const handleSave = () => {
    const currentGraph = { nodes, edges };
    setDraftGraphs((current) => ({
      ...current,
      [currentKey]: currentGraph,
    }));
    markSaved();
  };

  const showRoutinePicker = mode !== 'structure';
  const showTracePicker = mode === 'trace' || mode === 'compare';
  const modeMeta = modeCopy[mode];
  const statTiles = mode === 'structure'
    ? [
        ['Files', summary.astFiles],
        ['Forms', summary.astForms],
        ['Mode', modeLabel(summary.mode)],
      ]
    : mode === 'body'
      ? [
          ['Organs', summary.organs],
          ['Capabilities', summary.capabilities],
          ['Artifacts', summary.artifacts],
        ]
      : mode === 'routine'
        ? [
            ['Steps', summary.routineSteps],
            ['Organs', summary.organs],
            ['Routine', summary.routineLabel],
          ]
        : mode === 'trace'
          ? [
              ['Events', summary.traceEvents],
              ['Routine', summary.routineLabel],
              ['Trace', summary.traceLabel],
            ]
          : [
              ['Steps', summary.routineSteps],
              ['Events', summary.traceEvents],
              ['Trace', summary.traceLabel],
            ];

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
              <div key={label}>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">{label}</div>
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
              {routines.map((routine) => (
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
              {availableTraces.map((trace) => (
                <SelectItem key={trace.id} value={trace.id}>
                  {trace.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> : null}

        <div className="min-w-[220px] flex-[1.2] text-xs text-muted-foreground">
          {mode !== 'structure' ? <p>{modeMeta.note}</p> : null}
          {showRoutinePicker ? <p><span className="font-mono uppercase tracking-[0.12em] text-white/55">Routine:</span> {summary.routineLabel}</p> : null}
          {showTracePicker ? <p className="mt-1"><span className="font-mono uppercase tracking-[0.12em] text-white/55">Trace:</span> {summary.traceLabel}</p> : null}
        </div>
      </div>
    </div>
  );

  return (
    <GraphEditor
      initialNodes={graph.nodes}
      initialEdges={graph.edges}
      onSave={handleSave}
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
