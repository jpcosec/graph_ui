import { describe, expect, it } from 'vitest';

import { docRef, viewResultToGraph } from './view-graph';
import type { EvaluatedView } from './views-provider';

const result: EvaluatedView = {
  ok: true,
  store: '/tmp/s/.sldb',
  view: { nodes: [{ model: 'SpecNodeDoc', where: '' }], relations: ['inherits'], direction: 'both' },
  nodes: [
    { id: 'sldb://document/SpecNodeDoc:a', model: 'SpecNodeDoc', name: 'a', title: 'Alpha', payload: { kind: 'core', tags: ['x'] } },
    { id: 'sldb://document/SpecNodeDoc:b', model: 'SpecNodeDoc', name: 'b', title: 'Beta', payload: { kind: 'boundary' } },
  ],
  edges: [{ source: 'sldb://document/SpecNodeDoc:a', target: 'sldb://document/SpecNodeDoc:b', relation_type: 'inherits' }],
  layout: {},
};

describe('viewResultToGraph', () => {
  it('turns evaluated documents into nodes keyed by their doc ref, and keeps the relation type', () => {
    const graph = viewResultToGraph(result);
    expect(graph.nodes.map((node) => node.id)).toEqual(['SpecNodeDoc:a', 'SpecNodeDoc:b']);
    expect(graph.nodes[0]?.data).toMatchObject({ label: 'Alpha', category: 'SpecNodeDoc', properties: { kind: 'core', tags: '["x"]' } });
    expect(graph.nodes[0]?.data.payload?.value).toEqual({ kind: 'core', tags: ['x'] });
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({ source: 'SpecNodeDoc:a', target: 'SpecNodeDoc:b', data: { relationType: 'inherits' } });
  });

  it('maps an unregistered model to the generic simple node type', () => {
    expect(viewResultToGraph(result).nodes[0]?.data.typeId).toBe('simple');
  });

  it('strips only the sldb document prefix', () => {
    expect(docRef('sldb://document/ViewDoc:x')).toBe('ViewDoc:x');
    expect(docRef('ViewDoc:x')).toBe('ViewDoc:x');
  });

  it('carries the notation the server applied: each node its glyph and style, each edge its link', () => {
    const styled: EvaluatedView = {
      ...result,
      notation: {
        notation: 'NotationDoc:infra',
        ink: { light: '#1f2328', dark: '#e6edf3' },
        nodes: { 'sldb://document/SpecNodeDoc:a': { glyph: 'GlyphDoc:infra.hot', shape: 'box', style: { fill: { light: '#fff1c2', dark: '#fff1c2' }, icon: 'workflow' } } },
        edges: [{ link: 'LinkDoc:infra.reads', line: 'dashed', color: { light: '#0072b2', dark: '#0072b2' } }],
        legend: { glyphs: [], links: [], kinds: [] },
      },
    };
    const graph = viewResultToGraph(styled);
    expect(graph.nodes[0]?.data.notation).toMatchObject({ glyph: 'GlyphDoc:infra.hot', style: { icon: 'workflow' } });
    expect(graph.nodes[0]?.data.ink).toEqual({ light: '#1f2328', dark: '#e6edf3' });
    expect(graph.nodes[1]?.data.notation).toBeUndefined();
    expect(graph.edges[0]?.data?.notation).toMatchObject({ line: 'dashed' });
  });
});
