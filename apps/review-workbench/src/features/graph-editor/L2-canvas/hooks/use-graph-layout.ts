import { useCallback } from 'react';

import {
  DEFAULT_LAYOUT_STRATEGY_NAME,
  getLayoutStrategy,
  type LayoutOptions,
  type LayoutResult,
} from '@/features/graph-editor/L2-canvas/layout/layout-strategies';
import { useGraphStore } from '@/stores/graph-store';

type UpdateNode = (
  id: string,
  updates: { position: { x: number; y: number } },
  options: { isVisualOnly: true },
) => void;

export interface UseGraphLayoutResult {
  layout: (options?: LayoutOptions) => Promise<LayoutResult>;
}

export function useGraphLayout(): UseGraphLayoutResult {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const updateNode = useGraphStore((state) => state.updateNode);

  const layout = useCallback(
    async (options: LayoutOptions = {}): Promise<LayoutResult> => {
      const nodesInput = nodes.map((node) => ({
        id: node.id,
        width: typeof node.width === 'number' ? node.width : undefined,
        height: typeof node.height === 'number' ? node.height : undefined,
      }));

      const edgesInput = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          relationType: edge.data?.relationType,
        },
      }));

      const strategy = getLayoutStrategy(DEFAULT_LAYOUT_STRATEGY_NAME);
      const result = await strategy.computeLayout(nodesInput, edgesInput, options);

      result.forEach(({ id, position }) => {
        updateNode(id, { position }, { isVisualOnly: true });
      });

      return result;
    },
    [edges, nodes, updateNode],
  );

  return { layout };
}
