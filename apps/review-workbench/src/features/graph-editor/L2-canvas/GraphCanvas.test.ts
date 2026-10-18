import { describe, expect, it } from 'vitest';

import { applyCanvasFilters, type CanvasFilterContext } from './GraphCanvas';
import type { ASTEdge, ASTNode } from '@/stores/types';
import type { FilterState } from '@/stores/ui-store';

function node(id: string, value: Record<string, unknown>, properties: Record<string, string> = {}): ASTNode {
  return { id, type: 'doc', position: { x: 0, y: 0 }, data: { payload: { typeId: 'doc', value }, properties } };
}

function edge(source: string, target: string, relationType = 'linked'): ASTEdge {
  return { id: `${source}-${target}`, source, target, type: 'button', data: { relationType } };
}

const nodes = [
  node('a', { name: 'Alpha', status: 'open' }),
  node('b', { name: 'Beta', status: 'closed' }, { owner: 'ada' }),
  node('c', { name: 'Gamma', status: 'open' }),
  node('d', { name: 'Delta' }),
];
const edges = [edge('a', 'b'), edge('b', 'c', 'depends_on'), edge('c', 'd')];

const noFilters: FilterState = { hiddenRelationTypes: [], filterText: '', attributeFilter: null, hideNonNeighbors: true };

function run(filters: Partial<FilterState>, context: Partial<CanvasFilterContext> = {}) {
  const result = applyCanvasFilters(nodes, edges, {
    filters: { ...noFilters, ...filters },
    focusedNodeId: null,
    focusMode: false,
    ...context,
  });
  return { nodes: result.nodes.map((n) => n.id), edges: result.edges.map((e) => e.id) };
}

describe('applyCanvasFilters', () => {
  it('leaves the graph untouched with no active filter', () => {
    expect(run({})).toEqual({ nodes: ['a', 'b', 'c', 'd'], edges: ['a-b', 'b-c', 'c-d'] });
  });

  it('filters nodes by title or id, case-insensitively, and drops dangling edges', () => {
    expect(run({ filterText: 'ALP' })).toEqual({ nodes: ['a'], edges: [] });
    expect(run({ filterText: 'ta' })).toEqual({ nodes: ['b', 'd'], edges: [] });
    expect(run({ filterText: 'd' })).toEqual({ nodes: ['d'], edges: [] });
  });

  it('filters by attribute key, by value, or by both, over payload and properties', () => {
    expect(run({ attributeFilter: { key: 'status', value: 'open' } })).toEqual({ nodes: ['a', 'c'], edges: [] });
    expect(run({ attributeFilter: { key: 'owner', value: '' } })).toEqual({ nodes: ['b'], edges: [] });
    expect(run({ attributeFilter: { key: '', value: 'clos' } })).toEqual({ nodes: ['b'], edges: [] });
    expect(run({ attributeFilter: { key: '  ', value: ' ' } }).nodes).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps only the focused node and its neighbours in focus mode', () => {
    expect(run({}, { focusMode: true, focusedNodeId: 'b' })).toEqual({ nodes: ['a', 'b', 'c'], edges: ['a-b', 'b-c'] });
  });

  it('does not hide anything when a node is merely focused (the inspector is open) outside focus mode', () => {
    expect(run({}, { focusMode: false, focusedNodeId: 'b' }).nodes).toEqual(['a', 'b', 'c', 'd']);
  });

  it('respects hideNonNeighbors off in focus mode', () => {
    expect(run({ hideNonNeighbors: false }, { focusMode: true, focusedNodeId: 'b' }).nodes).toEqual(['a', 'b', 'c', 'd']);
  });

  it('composes: neighbours are computed over the edges the other filters left', () => {
    expect(run({ hiddenRelationTypes: ['depends_on'] }, { focusMode: true, focusedNodeId: 'b' })).toEqual({
      nodes: ['a', 'b'],
      edges: ['a-b'],
    });
  });
});
