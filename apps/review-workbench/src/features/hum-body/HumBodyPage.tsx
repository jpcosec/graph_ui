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

  const overlay = (
    <div className="pointer-events-auto hum-overlay-panel mt-2 flex w-full max-w-[940px] flex-col gap-3 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Embodied Modes</p>
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

        <div className="min-w-[220px] rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
          <div className="grid grid-cols-3 gap-3 text-on-surface">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">Files</div>
              <div className="mt-1 text-sm font-semibold">{summary.astFiles}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">Forms</div>
              <div className="mt-1 text-sm font-semibold">{summary.astForms}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">Mode</div>
              <div className="mt-1 text-sm font-semibold">{modeLabel(summary.mode)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-white/8 pt-3">
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
          {mode === 'structure' ? <p>Expand a file to inspect top-level forms; switch to `Body` only after you know where you are.</p> : null}
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
        eyebrow: 'Hum Body View',
        title: mode === 'structure' ? 'Load the Lisp tree and open the body as needed' : 'Inspect the body, route the routine, replay the trace',
        description:
          mode === 'structure'
            ? 'The whole HUM Lisp tree is projected as collapsible files and forms; use structure first, then switch to body or trace overlays.'
            : 'Packages become organs, tools become embodied capabilities, and traces become enacted motion through the shell.',
      }}
      workspace={{
        label: 'Projection',
        title: 'HUM anatomy studio',
        description: 'Body, routine, trace, and divergence overlays',
      }}
      topOverlay={overlay}
    />
  );
}
