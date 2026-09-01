import fixture from '../antonia-fixture.generated.json';

import type { SldbDocument } from '@/features/graph-editor/lib/data-provider';
import { computeElkLayeredLayout } from '@/features/graph-editor/L2-canvas/layout/layout-strategies';
import { registerDefaultNodeTypes } from '@/schema/register-defaults';
import { registry } from '@/schema/registry';
import type { ASTEdge, ASTNode } from '@/stores/types';

type FixtureNode = (typeof fixture.nodes)[number];
type FixtureEdge = (typeof fixture.edges)[number];

type ConversationDocument = Pick<SldbDocument, 'id' | 'payload'>;

const FALLBACK_SIZE = { width: 220, height: 100 };

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function toProperties(payload: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).flatMap(([key, value]) => {
      if (value === undefined || value === null) {
        return [];
      }

      if (Array.isArray(value)) {
        return [[key, value.map((item) => String(item)).join('\n')]];
      }

      if (typeof value === 'object') {
        return [[key, JSON.stringify(value)]];
      }

      return [[key, String(value)]];
    }),
  );
}

function makeNode(id: string, payload: Record<string, unknown>, position: { x: number; y: number }): ASTNode {
  const labelCandidate = payload.title ?? payload.id ?? id;
  const label = typeof labelCandidate === 'string' && labelCandidate.trim().length > 0 ? labelCandidate : id;

  return {
    id,
    type: 'default',
    position,
    data: {
      typeId: 'conversation-step',
      label,
      category: 'conversation',
      visualToken: 'token-conversation',
      properties: toProperties(payload),
      payload: {
        typeId: 'conversation-step',
        value: payload,
      },
    },
  };
}

function makeEdge(edgeId: string, source: string, target: string, relationType = 'flows_to'): ASTEdge {
  return {
    id: edgeId,
    source,
    target,
    type: 'floating',
    data: {
      relationType,
      properties: {},
    },
  };
}

// Authored-relation layer (RELATION_MODEL_LAYER_SPEC): edges are their own
// content-blind documents (RelationDoc), not text fields inside content. This
// mirrors kgdb's pure assembler `assemble_authored_graph`: route each authored
// edge onto its source node, and validate referential integrity (drop orphans).
const RELATION_INSTANCE_TAG = 'type.relation.instance';

function isRelationDoc(document: SldbDocument): boolean {
  return (
    document.model_name === 'RelationDoc' ||
    (document.semantic_tags ?? []).includes(RELATION_INSTANCE_TAG)
  );
}

export function buildEdgesFromAuthoredRelations(
  relationDocs: SldbDocument[],
  nodeIds: Set<string>,
): { edges: ASTEdge[]; dropped: string[] } {
  const edges: ASTEdge[] = [];
  const dropped: string[] = [];

  relationDocs.forEach((document) => {
    const payload = asRecord(document.payload);
    const source = typeof payload.source_id === 'string' ? payload.source_id : '';
    const target = typeof payload.target_id === 'string' ? payload.target_id : '';
    const relationType =
      typeof payload.relation_type === 'string' && payload.relation_type.trim().length > 0
        ? payload.relation_type
        : 'flows_to';

    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      dropped.push(document.id);
      return;
    }

    edges.push(makeEdge(`${source}__to__${target}`, source, target, relationType));
  });

  return { edges, dropped };
}

function getLayoutedGraph(nodes: ASTNode[], edges: ASTEdge[]): Promise<{ nodes: ASTNode[]; edges: ASTEdge[] }> {
  const nodeSize = registry.get('conversation-step')?.defaultSize ?? FALLBACK_SIZE;

  return computeElkLayeredLayout(
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
  ).then((layout) => {
    const positions = new Map(layout.map((item) => [item.id, item.position]));

    return {
      nodes: nodes.map((node) => ({
        ...node,
        position: positions.get(node.id) ?? node.position,
      })),
      edges,
    };
  });
}

function shortIdFromReference(value: string): string {
  const trimmed = value.trim();
  const lastDot = trimmed.split('.').pop() ?? trimmed;
  const lastColon = lastDot.split(':').pop() ?? lastDot;
  return lastColon.trim();
}

function shortIdFromNodeId(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('step-antonia-')) {
    return trimmed.replace(/^step-antonia-/, '');
  }
  return trimmed;
}

// Transition refs use underscores (conversation:steps.registro_estado) while doc
// ids use hyphens (step-antonia-registro-estado). Canonicalize both to hyphens so
// multi-word steps resolve.
function canonicalKey(value: string): string {
  return value.trim().replace(/_/g, '-').toLowerCase();
}

function buildAliasMap(documents: ConversationDocument[]): Map<string, string> {
  const aliases = new Map<string, string>();

  documents.forEach((document) => {
    const payload = asRecord(document.payload);
    const payloadId = typeof payload.id === 'string' ? payload.id : '';
    const candidates = [document.id, shortIdFromNodeId(document.id), payloadId, shortIdFromReference(payloadId)];

    candidates
      .map((candidate) => candidate.trim())
      .filter((candidate) => candidate.length > 0)
      .forEach((candidate) => {
        aliases.set(candidate, document.id);
        aliases.set(canonicalKey(candidate), document.id);
      });
  });

  return aliases;
}

function buildEdgesFromDocuments(documents: ConversationDocument[]): ASTEdge[] {
  const aliases = buildAliasMap(documents);
  const edges: ASTEdge[] = [];

  documents.forEach((document) => {
    const payload = asRecord(document.payload);
    const transitions = typeof payload.allowed_transitions === 'string' ? payload.allowed_transitions : '';

    transitions
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && !entry.toLowerCase().startsWith('ninguna'))
      .forEach((entry) => {
        const targetId =
          aliases.get(entry) ??
          aliases.get(shortIdFromReference(entry)) ??
          aliases.get(canonicalKey(shortIdFromReference(entry)));
        if (!targetId) {
          return;
        }

        edges.push(makeEdge(`${document.id}__to__${targetId}`, document.id, targetId));
      });
  });

  return edges;
}

export function buildAntoniaGraphFromDocuments(documents: SldbDocument[]): Promise<{ nodes: ASTNode[]; edges: ASTEdge[] }> {
  const conversationDocs = documents.filter((document) => document.model_name === 'ConversationStep');
  const nodes = conversationDocs.map((document) => makeNode(document.id, asRecord(document.payload), { x: 0, y: 0 }));

  // Prefer authored relations when present (relation layer); otherwise fall
  // back to the legacy allowed_transitions text field. Same result either way.
  const relationDocs = documents.filter(isRelationDoc);
  let edges: ASTEdge[];
  if (relationDocs.length > 0) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    edges = buildEdgesFromAuthoredRelations(relationDocs, nodeIds).edges;
  } else {
    edges = buildEdgesFromDocuments(conversationDocs);
  }

  return getLayoutedGraph(nodes, edges);
}

export async function buildAntoniaGraph(): Promise<{ nodes: ASTNode[]; edges: ASTEdge[] }> {
  registerDefaultNodeTypes();

  const nodes = fixture.nodes.map((node: FixtureNode) => makeNode(node.id, node.properties, { x: 0, y: 0 }));
  const edges = fixture.edges.map((edge: FixtureEdge) => makeEdge(edge.id, edge.source, edge.target));

  return getLayoutedGraph(nodes, edges);
}
