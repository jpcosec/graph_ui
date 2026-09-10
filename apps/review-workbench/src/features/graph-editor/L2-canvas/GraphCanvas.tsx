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
import type { ASTEdge, ASTNode } from '@/stores/types';

import { GroupShell } from './GroupShell';
import { NodeShell } from './NodeShell';
import { ButtonEdge, FloatingEdge } from './edges';

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

export function GraphCanvas({ editable = true }: { editable?: boolean }) {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const selectedNode = useUIStore((state) => state.selectedNode);
  const selectedEdge = useUIStore((state) => state.selectedEdge);
  const hiddenRelationTypes = useUIStore((state) => state.filters.hiddenRelationTypes);

  const [nodesState, setNodesState] = useState<CanvasNode[]>([]);
  const [edgesState, setEdgesState] = useState<CanvasEdge[]>([]);

  useEffect(() => {
    const filtered = filterGraphByRelationTypes(nodes, edges, hiddenRelationTypes);
    setNodesState(filtered.nodes.map(asCanvasNode));
    setEdgesState(filtered.edges.map(asCanvasEdge));
  }, [edges, hiddenRelationTypes, nodes]);

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
