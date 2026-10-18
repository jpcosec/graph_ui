import { useCallback } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';

import {
  DEFAULT_LAYOUT_STRATEGY_NAME,
  getLayoutStrategy,
  type LayoutOptions,
  type LayoutResult,
} from '@/features/graph-editor/L2-canvas/layout/layout-strategies';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';

type UpdateNode = (
  id: string,
  updates: { position: { x: number; y: number } },
  options: { isVisualOnly: true },
) => void;

export interface UseGraphLayoutResult {
  layout: (options?: LayoutOptions) => Promise<LayoutResult>;
  /** False until React Flow has measured the nodes; a layout before that would use fallback sizes. */
  ready: boolean;
}

type SizedNode = { style?: { width?: unknown; height?: unknown } };
type Measured = { width?: number; height?: number } | undefined;

/**
 * The size the layout should reserve for a node: what React Flow measured,
 * else an explicit numeric style size, else undefined (the strategy's fallback).
 */
export function layoutNodeSize(node: SizedNode, measured: Measured): { width?: number; height?: number } {
  const pick = (measuredValue: number | undefined, styleValue: unknown) =>
    typeof measuredValue === 'number' && measuredValue > 0
      ? measuredValue
      : typeof styleValue === 'number'
        ? styleValue
        : undefined;
  return { width: pick(measured?.width, node.style?.width), height: pick(measured?.height, node.style?.height) };
}

export type { LayoutOptions };

/** True once React Flow has measured every node it holds (and holds at least one). */
export function everyNodeMeasured(internalNodes: Iterable<{ measured?: Measured }>): boolean {
  let any = false;
  for (const node of internalNodes) {
    any = true;
    if (!(node.measured?.width && node.measured?.height)) {
      return false;
    }
  }
  return any;
}

export function useGraphLayout(): UseGraphLayoutResult {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const updateNode = useGraphStore((state) => state.updateNode);
  const activeLayoutStrategy = useUIStore((state) => state.activeLayoutStrategy);
  const { getInternalNode } = useReactFlow();
  // Not useNodesInitialized(): GraphCanvas rebuilds its controlled nodes from the graph store
  // without `measured`, so React Flow never flags them initialized. Its internal nodes do keep
  // the measured size, which is what the layout reads.
  const ready = useStore((state) => everyNodeMeasured(state.nodeLookup.values()));

  const layout = useCallback(
    async (options: LayoutOptions = {}): Promise<LayoutResult> => {
      const nodesInput = nodes.map((node) => ({
        id: node.id,
        ...layoutNodeSize(node, getInternalNode(node.id)?.measured),
      }));

      const edgesInput = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          relationType: edge.data?.relationType,
        },
      }));

      const strategy = getLayoutStrategy(activeLayoutStrategy ?? DEFAULT_LAYOUT_STRATEGY_NAME);
      const result = await strategy.computeLayout(nodesInput, edgesInput, options);

      result.forEach(({ id, position }) => {
        updateNode(id, { position }, { isVisualOnly: true });
      });

      return result;
    },
    [activeLayoutStrategy, edges, getInternalNode, nodes, updateNode],
  );

  return { layout, ready };
}
