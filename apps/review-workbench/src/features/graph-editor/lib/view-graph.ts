import { registry } from '@/schema/registry';
import type { ASTEdge, ASTNode } from '@/stores/types';

import type { EvaluatedView } from './views-provider';

const DOCUMENT_PREFIX = 'sldb://document/';

/** `sldb://document/Model:name` -> `Model:name`, the doc ref sldb serve's /save accepts. */
export function docRef(nodeId: string): string {
  return nodeId.startsWith(DOCUMENT_PREFIX) ? nodeId.slice(DOCUMENT_PREFIX.length) : nodeId;
}

export function modelTypeId(model: string): string {
  const slug = model
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return registry.get(slug) ? slug : 'simple';
}

function properties(payload: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]),
  );
}

/** An evaluated view as canvas nodes and edges; positions come from the layout strategy. */
export function viewResultToGraph(result: EvaluatedView): { nodes: ASTNode[]; edges: ASTEdge[] } {
  const nodes: ASTNode[] = result.nodes.map((node) => {
    const typeId = modelTypeId(node.model);
    return {
      id: docRef(node.id),
      type: 'default',
      position: { x: 0, y: 0 },
      data: {
        typeId,
        label: node.title,
        category: node.model,
        properties: properties(node.payload),
        payload: { typeId, value: node.payload },
      },
    };
  });
  const edges: ASTEdge[] = result.edges.map((edge, index) => ({
    id: `view-edge-${index}-${edge.relation_type}`,
    source: docRef(edge.source),
    target: docRef(edge.target),
    type: 'floating',
    data: { relationType: edge.relation_type, properties: {} },
  }));
  return { nodes, edges };
}
