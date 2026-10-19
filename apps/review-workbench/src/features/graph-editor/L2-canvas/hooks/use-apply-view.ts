import { useCallback, useEffect, useState } from 'react';

import { viewResultToGraph } from '@/features/graph-editor/lib/view-graph';
import { viewsProvider, type ProjectionViewDoc } from '@/features/graph-editor/lib/views-provider';
import { useGraphStore } from '@/stores/graph-store';
import { useViewStore } from '@/stores/view-store';

import { useGraphLayout } from './use-graph-layout';

/**
 * Evaluate a view on the graph_ui server (by ref or as the sidebar's draft), load its nodes and
 * edges into the graph store, and lay them out once React Flow has measured them.
 */
export function useApplyView() {
  const loadGraph = useGraphStore((state) => state.loadGraph);
  const { layout, ready } = useGraphLayout();
  const [pendingLayout, setPendingLayout] = useState(false);

  useEffect(() => {
    if (pendingLayout && ready) {
      setPendingLayout(false);
      void layout();
    }
  }, [layout, pendingLayout, ready]);

  return useCallback(
    async (view: ProjectionViewDoc | string, ref: string | null = typeof view === 'string' ? view : null) => {
      const { storePath, setDraft } = useViewStore.getState();
      const result = await viewsProvider.evaluate(view, storePath);
      const graph = viewResultToGraph(result);
      setDraft(result.view, ref);
      loadGraph(graph.nodes, graph.edges);
      setPendingLayout(true);
      return result;
    },
    [loadGraph],
  );
}
