import { useCallback } from 'react';

import { useGraphStore } from '@/stores/graph-store';
import type { ASTEdge, ASTNode } from '@/stores/types';

const COLLAPSED_KEY = '__collapsed';
const EXPANDED_HEIGHT_KEY = '__expandedHeight';
const COLLAPSED_GROUP_HEIGHT = 52;
const INHERITED_RELATION_TYPE = 'inherited';

function readStyleHeight(node: ASTNode): number | undefined {
  const h = node.style?.height;
  if (typeof h === 'number') return h;
  if (typeof h === 'string') {
    const parsed = Number.parseFloat(h);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

type UpdateNode = (nodeId: string, patch: Partial<ASTNode>, options?: { isVisualOnly?: boolean }) => void;
type UpdateEdge = (edgeId: string, patch: Partial<ASTEdge>, options?: { isVisualOnly?: boolean }) => void;

export interface EdgeInheritanceState {
  nodes: ASTNode[];
  edges: ASTEdge[];
  updateNode: UpdateNode;
  updateEdge: UpdateEdge;
}

function withCollapsedState(
  data: ASTNode['data'],
  collapsed: boolean,
): ASTNode['data'] {
  return {
    ...data,
    properties: {
      ...data.properties,
      [COLLAPSED_KEY]: String(collapsed),
    },
  };
}

export interface UseEdgeInheritanceResult {
  collapseGroup: (groupId: string) => void;
  expandGroup: (groupId: string) => void;
}

export function collapseGroupEdges(groupId: string, state: EdgeInheritanceState): void {
  const { nodes, edges, updateNode, updateEdge } = state;

  const childNodes = nodes.filter((node) => node.parentId === groupId);
  const childIds = new Set(childNodes.map((node) => node.id));

  childNodes.forEach((node) => {
    updateNode(node.id, { hidden: true }, { isVisualOnly: true });
  });

  edges
    .filter((edge) => childIds.has(edge.source) || childIds.has(edge.target))
    .forEach((edge) => {
      const nextSource = childIds.has(edge.source) ? groupId : edge.source;
      const nextTarget = childIds.has(edge.target) ? groupId : edge.target;

      if (nextSource === nextTarget) {
        return;
      }

      const originalRelationType = edge.data?._originalRelationType ?? edge.data?.relationType ?? 'linked';

      updateEdge(
        edge.id,
        {
          source: nextSource,
          target: nextTarget,
          hidden: edge.hidden,
          data: {
            relationType: INHERITED_RELATION_TYPE,
            properties: edge.data?.properties ?? {},
            _originalSource: edge.data?._originalSource ?? edge.source,
            _originalTarget: edge.data?._originalTarget ?? edge.target,
            _originalRelationType: originalRelationType,
          },
        },
        { isVisualOnly: true },
      );
    });

  const groupNode = nodes.find((node) => node.id === groupId);
  if (!groupNode) {
    return;
  }

  // Shrink the group box to just its header, remembering the expanded height so
  // expandGroup can restore it. Without this the collapsed group stays a tall
  // empty box.
  const expandedHeight = readStyleHeight(groupNode);
  const nextData = withCollapsedState(groupNode.data, true);
  if (expandedHeight !== undefined) {
    nextData.properties = {
      ...nextData.properties,
      [EXPANDED_HEIGHT_KEY]: String(expandedHeight),
    };
  }

  updateNode(
    groupId,
    {
      data: nextData,
      style: { ...groupNode.style, height: COLLAPSED_GROUP_HEIGHT },
    },
    { isVisualOnly: true },
  );
}

export function expandGroupEdges(groupId: string, state: EdgeInheritanceState): void {
  const { nodes, edges, updateNode, updateEdge } = state;

  const childNodes = nodes.filter((node) => node.parentId === groupId);
  const childIds = new Set(childNodes.map((node) => node.id));

  childNodes.forEach((node) => {
    updateNode(node.id, { hidden: false }, { isVisualOnly: true });
  });

  edges
    .filter((edge) => {
      const hasOriginal = edge.data?._originalSource || edge.data?._originalTarget;
      if (!hasOriginal) {
        return false;
      }

      return (
        edge.source === groupId ||
        edge.target === groupId ||
        childIds.has(edge.data?._originalSource ?? '') ||
        childIds.has(edge.data?._originalTarget ?? '')
      );
    })
    .forEach((edge) => {
      updateEdge(
        edge.id,
        {
          source: edge.data?._originalSource ?? edge.source,
          target: edge.data?._originalTarget ?? edge.target,
          hidden: edge.hidden,
          data: {
            relationType: edge.data?._originalRelationType ?? edge.data?.relationType ?? 'linked',
            properties: edge.data?.properties ?? {},
            _originalSource: undefined,
            _originalTarget: undefined,
            _originalRelationType: undefined,
          },
        },
        { isVisualOnly: true },
      );
    });

  const groupNode = nodes.find((node) => node.id === groupId);
  if (!groupNode) {
    return;
  }

  // Restore the remembered expanded height.
  const remembered = groupNode.data.properties?.[EXPANDED_HEIGHT_KEY];
  const restoredHeight = remembered ? Number.parseFloat(remembered) : undefined;
  const nextData = withCollapsedState(groupNode.data, false);
  if (nextData.properties && EXPANDED_HEIGHT_KEY in nextData.properties) {
    const { [EXPANDED_HEIGHT_KEY]: _drop, ...rest } = nextData.properties;
    nextData.properties = rest;
  }

  updateNode(
    groupId,
    {
      data: nextData,
      style: {
        ...groupNode.style,
        height: Number.isFinite(restoredHeight) ? restoredHeight : groupNode.style?.height,
      },
    },
    { isVisualOnly: true },
  );
}

export function useEdgeInheritance(): UseEdgeInheritanceResult {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const updateNode = useGraphStore((state) => state.updateNode);
  const updateEdge = useGraphStore((state) => state.updateEdge);

  const collapseGroup = useCallback(
    (groupId: string) => {
      collapseGroupEdges(groupId, { nodes, edges, updateNode, updateEdge });
    },
    [edges, nodes, updateEdge, updateNode],
  );

  const expandGroup = useCallback(
    (groupId: string) => {
      expandGroupEdges(groupId, { nodes, edges, updateNode, updateEdge });
    },
    [edges, nodes, updateEdge, updateNode],
  );

  return { collapseGroup, expandGroup };
}
