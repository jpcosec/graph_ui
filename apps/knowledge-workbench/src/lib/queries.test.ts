import { describe, it, expect } from 'vitest';
import { loadKnowledge } from '@/mock/client';
import {
  anchoredRatio,
  atomById,
  atomsWithoutProvenance,
  incidentRelations,
  isolatedAtoms,
  resolveBinding,
  segmentSource,
  usagesOf,
} from './queries';

const k = loadKnowledge();

describe('fixture', () => {
  it('validates against the schema', () => {
    expect(k.atoms).toHaveLength(6);
    expect(k.relations).toHaveLength(4);
    expect(k.sources).toHaveLength(1);
  });
});

describe('segmentSource', () => {
  const source = k.sources[0];

  it('reconstructs the original text exactly', () => {
    expect(segmentSource(source).map((s) => s.text).join('')).toBe(source.text);
  });

  it('marks anchored spans with their atom', () => {
    const anchored = segmentSource(source).filter((s) => s.atomId);
    expect(anchored).toHaveLength(source.anchored.length);
    expect(anchored[0].text).toContain('no será posible una conexión directa');
  });

  it('reports how much is still unextracted', () => {
    const ratio = anchoredRatio(source);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });
});

describe('incidentRelations', () => {
  it('finds edges in both directions', () => {
    const inc = incidentRelations(k, 'atom-no-sap-direct-integration-constraint');
    expect(inc.length).toBe(2);
    expect(inc.map((i) => i.direction).sort()).toEqual(['in', 'out']);
  });

  it('resolves the other end', () => {
    const inc = incidentRelations(k, 'atom-mepu-architecture-file-based-no-sap-connection');
    expect(inc[0].other?.title).toBeTruthy();
    expect(inc[0].relation.motive).not.toBe('');
  });
});

describe('resolveBinding', () => {
  it('list keeps the declared order', () => {
    const ids = ['atom-purchase-order-acceptance-sla', 'atom-no-sap-direct-integration-constraint'];
    expect(resolveBinding(k, { kind: 'list', atomIds: ids }).map((a) => a.id)).toEqual(ids);
  });

  it('query matches by tag prefix', () => {
    const got = resolveBinding(k, { kind: 'query', tags: ['constraint:'], relatedTo: null });
    expect(got.length).toBeGreaterThan(1);
    expect(got.every((a) => a.tags.some((t) => t.startsWith('constraint:')))).toBe(true);
  });

  it('query picks up a NEW atom with no edit to the doc — this is why docs do not age', () => {
    const before = resolveBinding(k, { kind: 'query', tags: ['constraint:'], relatedTo: null }).length;
    const grown = {
      ...k,
      atoms: [...k.atoms, { id: 'atom-nuevo', title: 'Nuevo', answer: '…', tags: ['constraint:otro'], provenance: null }],
    };
    expect(resolveBinding(grown, { kind: 'query', tags: ['constraint:'], relatedTo: null }).length).toBe(before + 1);
  });

  it('ignores an unknown id instead of crashing', () => {
    expect(resolveBinding(k, { kind: 'list', atomIds: ['nope'] })).toEqual([]);
  });
});

describe('usagesOf', () => {
  it('reports every document showing a fact', () => {
    const usages = usagesOf(k, 'atom-no-sap-direct-integration-constraint');
    expect(usages.length).toBeGreaterThanOrEqual(2);
  });

  it('distinguishes list from query usage', () => {
    const kinds = new Set(usagesOf(k, 'atom-no-sap-direct-integration-constraint').map((u) => u.via));
    expect(kinds.has('list')).toBe(true);
    expect(kinds.has('query')).toBe(true);
  });
});

describe('health', () => {
  it('finds the atom missing provenance', () => {
    expect(atomsWithoutProvenance(k)).toHaveLength(1);
  });

  it('finds no isolated atoms in this fixture', () => {
    expect(isolatedAtoms(k).map((a) => a.id)).toEqual([]);
  });
});

describe('atomById', () => {
  it('returns undefined for an unknown id', () => {
    expect(atomById(k, 'nope')).toBeUndefined();
  });
});
