import { useEffect, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './xy-theme.css';

import { registry } from '@/schema/registry';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import type { FilterState } from '@/stores/ui-store';
import type { ASTEdge, ASTNode } from '@/stores/types';
import { resolveNodeTitle } from '@/features/graph-editor/lib/node-title';

import { GroupShell } from './GroupShell';
import { NodeShell } from './NodeShell';
import { ButtonEdge, FloatingEdge } from './edges';
import { payloadValue } from '@/features/graph-editor/lib/node-data';

type CanvasNode = Node<ASTNode['data'], string>;
type CanvasEdgeData = NonNullable<ASTEdge['data']>;
type CanvasEdge = Edge<CanvasEdgeData, string>;

const nodeTypes = {
  default: NodeShell,
  group: GroupShell,
};

const edgeTypes = {
  floating: FloatingEdge,
  button: ButtonEdge,
};

function asCanvasNode(node: ASTNode): CanvasNode {
  return {
    id: node.id,
    type: node.type === 'group' ? 'group' : 'default',
    position: node.position,
    data: node.data,
    parentId: node.parentId,
    extent: node.extent as 'parent' | undefined,
    style: node.style,
    hidden: node.hidden,
    selected: node.selected,
  };
}

function asCanvasEdge(edge: ASTEdge): CanvasEdge {
  return {
    ...edge,
    data: edge.data ?? { relationType: 'linked', properties: {} },
    type: edge.type === 'button' ? 'button' : 'floating',
  };
}

export function filterGraphByRelationTypes(
  nodes: ASTNode[],
  edges: ASTEdge[],
  hiddenRelationTypes: string[],
): { nodes: ASTNode[]; edges: ASTEdge[] } {
  if (hiddenRelationTypes.length === 0) {
    return { nodes, edges };
  }

  const hiddenSet = new Set(hiddenRelationTypes);
  const visibleEdges = edges.filter((edge) => !hiddenSet.has(edge.data?.relationType ?? 'linked'));
  const visibleNodeIds = new Set<string>();

  visibleEdges.forEach((edge) => {
    visibleNodeIds.add(edge.source);
    visibleNodeIds.add(edge.target);
  });

  nodes.forEach((node) => {
    const hasAnyIncidentEdge = edges.some((edge) => edge.source === node.id || edge.target === node.id);
    if (!hasAnyIncidentEdge) {
      visibleNodeIds.add(node.id);
    }
  });

  return {
    nodes: nodes.filter((node) => visibleNodeIds.has(node.id)),
    edges: visibleEdges,
  };
}

function nodeAttributes(node: ASTNode): Record<string, unknown> {
  return { ...payloadValue(node.data), ...(node.data.properties ?? {}) };
}

function contains(haystack: unknown, needle: string): boolean {
  if (haystack === null || haystack === undefined) {
    return false;
  }
  const text = typeof haystack === 'string' ? haystack : JSON.stringify(haystack);
  return text.toLowerCase().includes(needle.toLowerCase());
}

function matchesAttribute(node: ASTNode, filter: { key: string; value: string }): boolean {
  const attributes = nodeAttributes(node);
  const key = filter.key.trim();
  const value = filter.value.trim();
  if (key) {
    return key in attributes && (!value || contains(attributes[key], value));
  }
  return !value || Object.values(attributes).some((attribute) => contains(attribute, value));
}

function keepEdgesBetween(nodes: ASTNode[], edges: ASTEdge[]): ASTEdge[] {
  const ids = new Set(nodes.map((node) => node.id));
  return edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
}

export interface CanvasFilterContext {
  filters: FilterState;
  /** Focus mode is an editor state, not just a focused node: double click also sets focusedNodeId to open the inspector. */
  focusedNodeId: string | null;
  focusMode: boolean;
}

/**
 * Everything the sidebar filters, applied in order: hidden relation types, the
 * text filter (title or id contains, case-insensitive), the attribute filter
 * (exact key over properties and payload.value, value "contains"), and focus
 * mode (the focused node plus its neighbours over the edges still visible).
 * An edge survives only when both its endpoints do.
 */
export function applyCanvasFilters(
  nodes: ASTNode[],
  edges: ASTEdge[],
  { filters, focusedNodeId, focusMode }: CanvasFilterContext,
): { nodes: ASTNode[]; edges: ASTEdge[] } {
  let visible = filterGraphByRelationTypes(nodes, edges, filters.hiddenRelationTypes);

  const text = filters.filterText.trim();
  if (text) {
    const kept = visible.nodes.filter((node) => contains(resolveNodeTitle(node.data, ''), text) || contains(node.id, text));
    visible = { nodes: kept, edges: keepEdgesBetween(kept, visible.edges) };
  }

  const attributeFilter = filters.attributeFilter;
  if (attributeFilter && (attributeFilter.key.trim() || attributeFilter.value.trim())) {
    const kept = visible.nodes.filter((node) => matchesAttribute(node, attributeFilter));
    visible = { nodes: kept, edges: keepEdgesBetween(kept, visible.edges) };
  }

  if (focusMode && filters.hideNonNeighbors && focusedNodeId && visible.nodes.some((node) => node.id === focusedNodeId)) {
    const neighbourhood = new Set([focusedNodeId]);
    visible.edges.forEach((edge) => {
      if (edge.source === focusedNodeId) neighbourhood.add(edge.target);
      if (edge.target === focusedNodeId) neighbourhood.add(edge.source);
    });
    const kept = visible.nodes.filter((node) => neighbourhood.has(node.id));
    visible = { nodes: kept, edges: keepEdgesBetween(kept, visible.edges) };
  }

  return visible;
}

export function GraphCanvas({ editable = true, onNodeDoubleClick }: { editable?: boolean; onNodeDoubleClick?: (nodeId: string) => void }) {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const selectedNode = useUIStore((state) => state.selectedNode);
  const selectedEdge = useUIStore((state) => state.selectedEdge);
  const filters = useUIStore((state) => state.filters);
  const focusedNodeId = useUIStore((state) => state.focusedNodeId);
  const focusMode = useUIStore((state) => state.editorState === 'focus');

  const [nodesState, setNodesState] = useState<CanvasNode[]>([]);
  const [edgesState, setEdgesState] = useState<CanvasEdge[]>([]);

  useEffect(() => {
    const filtered = applyCanvasFilters(nodes, edges, { filters, focusedNodeId, focusMode });
    setNodesState(filtered.nodes.map(asCanvasNode));
    setEdgesState(filtered.edges.map(asCanvasEdge));
  }, [edges, filters, focusMode, focusedNodeId, nodes]);

  void registry;
  void selectedNode;
  void selectedEdge;

  return (
    <ReactFlow
      nodes={nodesState}
      edges={edgesState}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDoubleClick={(_event, node) => onNodeDoubleClick?.(node.id)}
      nodesDraggable={editable}
      nodesConnectable={editable}
      edgesReconnectable={editable}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{ type: 'floating' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} size={1} color="rgba(148, 163, 184, 0.18)" />
      <Controls showInteractive={editable} />
      <MiniMap
        nodeColor={(node) => (node.selected ? '#d4a574' : '#9aa7bd')}
        maskColor="rgba(10, 10, 15, 0.55)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}
