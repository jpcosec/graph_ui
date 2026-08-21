import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ENCODING_RULES,
  resolveEdgeStyle,
  resolveNodeStyle,
  type EncodingRule,
} from './encoding-rules';
import type { ASTNode } from '@/stores/types';

function makeNodeData(overrides: Partial<ASTNode['data']> = {}): ASTNode['data'] {
  return {
    typeId: 'entity',
    payload: { typeId: 'entity', value: {} },
    properties: {},
    ...overrides,
  };
}

describe('encoding rules', () => {
  it('prefers a matching edge rule over the default fallback', () => {
    const rules: EncodingRule[] = [
      {
        when: { relationType: 'custom-link' },
        style: { strokeColor: 'rgb(1,2,3)', strokeWidth: 2.5, strokeStyle: 'dashed' },
      },
    ];

    expect(resolveEdgeStyle('custom-link', rules)).toEqual({
      stroke: 'rgb(1,2,3)',
      strokeWidth: 2.5,
      strokeDasharray: '3 5',
      opacity: 0.24,
    });
  });

  it('falls back when no edge rule matches', () => {
    expect(resolveEdgeStyle('unknown-relation', [])).toEqual({
      stroke: 'rgba(148,163,184,0.22)',
      strokeWidth: 1,
      strokeDasharray: undefined,
      opacity: 0.24,
    });
  });

  it('reproduces the default calls edge style through the default rule set', () => {
    expect(resolveEdgeStyle('calls', DEFAULT_ENCODING_RULES)).toEqual({
      stroke: 'rgba(96,165,250,0.44)',
      strokeWidth: 1.35,
      strokeDasharray: undefined,
      opacity: 0.42,
    });
  });

  it('prefers a matching node rule over the fallback color token', () => {
    const rules: EncodingRule[] = [
      {
        when: { nodeFacet: 'category', facetValue: 'special' },
        style: { nodeColorToken: '#ff00aa' },
      },
    ];

    expect(resolveNodeStyle(makeNodeData({ category: 'special' }), rules, 'token-person')).toEqual({
      nodeColorToken: '#ff00aa',
    });
  });

  it('uses the fallback node color token when no node rule matches', () => {
    expect(resolveNodeStyle(makeNodeData({ category: 'routine-step' }), [], 'token-project')).toEqual({
      nodeColorToken: 'token-project',
    });
  });
});
