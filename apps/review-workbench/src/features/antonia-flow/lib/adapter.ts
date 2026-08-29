import fixture from '../antonia-fixture.generated.json';

import { computeElkLayeredLayout } from '@/features/graph-editor/L2-canvas/layout/layout-strategies';
import { registerDefaultNodeTypes } from '@/schema/register-defaults';
import { registry } from '@/schema/registry';
import type { ASTEdge, ASTNode } from '@/stores/types';

type FixtureNode = (typeof fixture.nodes)[number];
type FixtureEdge = (typeof fixture.edges)[number];

const FALLBACK_SIZE = { width: 220, height: 100 };

function makeNode(node: FixtureNode, position: { x: number; y: number }): ASTNode {
  return {
    id: node.id,
    type: 'default',
    position,
    data: {
      typeId: 'conversation-step',
      label: node.properties.title,
      category: 'conversation',
      properties: node.properties,
      payload: {
        typeId: 'conversation-step',
        value: node.properties,
      },
    },
  };
}

function makeEdge(edge: FixtureEdge): ASTEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'floating',
    data: {
      relationType: 'flows_to',
      properties: {},
    },
  };
}

export async function buildAntoniaGraph(): Promise<{ nodes: ASTNode[]; edges: ASTEdge[] }> {
  registerDefaultNodeTypes();

  const nodeSize = registry.get('conversation-step')?.defaultSize ?? FALLBACK_SIZE;
  const nodes = fixture.nodes.map((node) => makeNode(node, { x: 0, y: 0 }));
  const edges = fixture.edges.map(makeEdge);

  const layout = await computeElkLayeredLayout(
    nodes.map((node) => ({
      id: node.id,
      width: nodeSize.width,
      height: nodeSize.height,
    })),
    edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
    { direction: 'LR' },
  );

  const positions = new Map(layout.map((item) => [item.id, item.position]));

  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
    edges,
  };
}
