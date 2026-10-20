import { useCallback, useEffect, useState } from 'react';

import { strategyForLayout, type LayoutOptions } from '@/features/graph-editor/L2-canvas/layout/layout-strategies';
import { viewResultToGraph } from '@/features/graph-editor/lib/view-graph';
import { viewsProvider, type ProjectionViewDoc } from '@/features/graph-editor/lib/views-provider';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { useViewStore } from '@/stores/view-store';

import { useGraphLayout } from './use-graph-layout';

/**
 * Evaluate a view on the graph_ui server (by ref or as the sidebar's draft), load its nodes and
 * edges into the graph store, and lay them out once React Flow has measured them, with the
 * strategy the view's layout style asks for (`strategyForLayout`).
 */
export function useApplyView() {
  const loadGraph = useGraphStore((state) => state.loadGraph);
  const { layout, ready } = useGraphLayout();
  const [pendingLayout, setPendingLayout] = useState<LayoutOptions | null>(null);

  useEffect(() => {
    if (pendingLayout && ready) {
      setPendingLayout(null);
      void layout(pendingLayout);
    }
  }, [layout, pendingLayout, ready]);

  return useCallback(
    async (view: ProjectionViewDoc | string, ref: string | null = typeof view === 'string' ? view : null) => {
      const { storePath, setDraft, setNotation } = useViewStore.getState();
      const result = await viewsProvider.evaluate(view, storePath);
      const graph = viewResultToGraph(result);
      setDraft(result.view, ref);
      setNotation(result.notation ?? null);
      const { strategy, options } = strategyForLayout(result.layout);
      useUIStore.getState().setActiveLayoutStrategy(strategy);
      loadGraph(graph.nodes, graph.edges);
      setPendingLayout(options);
      return result;
    },
    [loadGraph],
  );
}
