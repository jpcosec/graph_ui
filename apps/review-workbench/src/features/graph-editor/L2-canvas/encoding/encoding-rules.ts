import type { EdgeProps } from '@xyflow/react';

import type { ASTNode } from '@/stores/types';

export interface EncodingRule {
  when: { relationType?: string; nodeFacet?: string; facetValue?: unknown };
  style: {
    strokeColor?: string;
    strokeStyle?: 'solid' | 'dashed';
    strokeWidth?: number;
    nodeColorToken?: string;
  };
}

export type ResolvedEdgeStyle = NonNullable<EdgeProps['style']>;

export type ResolvedNodeStyle = {
  nodeColorToken: string;
};

const DEFAULT_EDGE_STYLE: ResolvedEdgeStyle = {
  stroke: 'rgba(148,163,184,0.22)',
  strokeWidth: 1,
  opacity: 0.24,
};

const CATEGORY_NODE_COLORS: Record<string, string> = {
  entry: '#22c55e',
  concept: '#3b82f6',
  section: '#8b5cf6',
  document: '#f59e0b',
};

const DEFAULT_NODE_RULES: EncodingRule[] = Object.entries(CATEGORY_NODE_COLORS).map(
  ([facetValue, nodeColorToken]) => ({
    when: { nodeFacet: 'category', facetValue },
    style: { nodeColorToken },
  }),
);

const DEFAULT_EDGE_RULES: EncodingRule[] = [
  {
    when: { relationType: 'calls' },
    style: { strokeColor: 'rgba(96,165,250,0.44)', strokeWidth: 1.35, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'writes' },
    style: { strokeColor: 'rgba(248,250,252,0.28)', strokeWidth: 1.05, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'reads' },
    style: { strokeColor: 'rgba(244,191,36,0.3)', strokeWidth: 1.05, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'commits' },
    style: { strokeColor: 'rgba(34,197,94,0.44)', strokeWidth: 1.4, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'declares' },
    style: { strokeColor: 'rgba(148,163,184,0.18)', strokeWidth: 0.9, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'contains' },
    style: { strokeColor: 'rgba(148,163,184,0.18)', strokeWidth: 0.9, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'instantiates' },
    style: { strokeColor: 'rgba(249,115,22,0.44)', strokeWidth: 1.3, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'deviates-from' },
    style: { strokeColor: 'rgba(249,115,22,0.44)', strokeWidth: 1.3, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'flows-to' },
    style: { strokeColor: 'rgba(34,197,94,0.28)', strokeWidth: 1, strokeStyle: 'solid' },
  },
  {
    when: { relationType: 'inherited' },
    style: { strokeColor: 'rgba(116, 117, 120, 0.7)', strokeWidth: 1, strokeStyle: 'dashed' },
  },
];

const DEFAULT_EDGE_OPACITY_BY_RELATION: Record<string, number> = {
  calls: 0.42,
  writes: 0.34,
  reads: 0.32,
  commits: 0.44,
  declares: 0.18,
  contains: 0.18,
  instantiates: 0.42,
  'deviates-from': 0.42,
  'flows-to': 0.28,
  inherited: 0.34,
};

export const DEFAULT_ENCODING_RULES: EncodingRule[] = [...DEFAULT_EDGE_RULES, ...DEFAULT_NODE_RULES];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readNodeFacetValue(data: ASTNode['data'], nodeFacet: string): unknown {
  const nodeRecord = asRecord(data);
  if (nodeFacet in nodeRecord) {
    return nodeRecord[nodeFacet];
  }

  const payload = asRecord(nodeRecord.payload);
  const payloadValue = asRecord(payload.value);
  return payloadValue[nodeFacet];
}

function matchesRelationRule(rule: EncodingRule, relationType: string | undefined): boolean {
  return !!rule.when.relationType && rule.when.relationType === relationType;
}

function matchesNodeRule(rule: EncodingRule, data: ASTNode['data']): boolean {
  if (!rule.when.nodeFacet) {
    return false;
  }

  const facetValue = readNodeFacetValue(data, rule.when.nodeFacet);
  if (typeof rule.when.facetValue === 'undefined') {
    return typeof facetValue !== 'undefined';
  }

  return facetValue === rule.when.facetValue;
}

export function resolveEdgeStyle(
  relationType: string | undefined,
  rules: EncodingRule[] = DEFAULT_ENCODING_RULES,
): ResolvedEdgeStyle {
  const matchedRule = rules.find((rule) => matchesRelationRule(rule, relationType));
  if (!matchedRule) {
    return DEFAULT_EDGE_STYLE;
  }

  return {
    stroke: matchedRule.style.strokeColor ?? DEFAULT_EDGE_STYLE.stroke,
    strokeWidth: matchedRule.style.strokeWidth ?? DEFAULT_EDGE_STYLE.strokeWidth,
    strokeDasharray: matchedRule.style.strokeStyle === 'dashed' ? '3 5' : undefined,
    opacity:
      relationType && relationType in DEFAULT_EDGE_OPACITY_BY_RELATION
        ? DEFAULT_EDGE_OPACITY_BY_RELATION[relationType]
        : DEFAULT_EDGE_STYLE.opacity,
  };
}

export function resolveNodeStyle(
  data: ASTNode['data'],
  rules: EncodingRule[] = DEFAULT_ENCODING_RULES,
  fallbackNodeColorToken = 'token-surface-primary',
): ResolvedNodeStyle {
  const matchedRule = rules.find((rule) => matchesNodeRule(rule, data) && !!rule.style.nodeColorToken);
  return {
    nodeColorToken: matchedRule?.style.nodeColorToken ?? fallbackNodeColorToken,
  };
}
