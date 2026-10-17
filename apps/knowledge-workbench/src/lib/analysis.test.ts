import { describe, it, expect } from 'vitest';
import { loadKnowledge } from '@/mock/client';
import { containment, findCycles, similarAtoms, similarity, suggestHomes, unusedAtoms } from './analysis';

const k = loadKnowledge();

describe('similarity', () => {
  it('is 1 for identical text and 0 for disjoint', () => {
    expect(similarity('conexión directa a SAP', 'conexión directa a SAP')).toBe(1);
    expect(similarity('bananas tropicales', 'ferrocarril subterráneo')).toBe(0);
  });

  it('ignores stopwords and accents', () => {
    expect(similarity('la conexion con SAP', 'conexión SAP')).toBeGreaterThan(0.5);
  });
});

describe('similarAtoms', () => {
  it('finds the existing fact behind a raw quote', () => {
    const found = similarAtoms(k, 'no será posible una conexión directa a SAP ni RPA');
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].atom.id).toContain('sap');
  });

  it('excludes the atom itself', () => {
    const atom = k.atoms[0];
    const found = similarAtoms(k, atom.answer, atom.id);
    expect(found.every((f) => f.atom.id !== atom.id)).toBe(true);
  });

  it('returns nothing for unrelated text', () => {
    expect(similarAtoms(k, 'recetas de cocina peruana')).toEqual([]);
  });
});

describe('suggestHomes', () => {
  it('proposes a section for a loose note', () => {
    const homes = suggestHomes(k, 'el plazo de aceptación de la orden vence en 48 horas');
    expect(homes.length).toBeGreaterThan(0);
    expect(homes[0].heading).toBeTruthy();
  });

  it('ranks best first', () => {
    const homes = suggestHomes(k, 'aceptación de órdenes en Mercado Público y SLA');
    const scores = homes.map((h) => h.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});

describe('findCycles', () => {
  it('reports none in the fixture', () => {
    expect(findCycles(k)).toEqual([]);
  });

  it('detects an introduced cycle', () => {
    const looped = {
      ...k,
      relations: [
        ...k.relations,
        { id: 'loop', type: 'flows_to' as const, from: 'atom-no-sap-direct-integration-constraint', to: 'atom-mepu-architecture-file-based-no-sap-connection', motive: '' },
      ],
    };
    expect(findCycles(looped).length).toBeGreaterThan(0);
  });
});

describe('unusedAtoms', () => {
  it('lists atoms no document shows', () => {
    const unused = unusedAtoms(k);
    expect(Array.isArray(unused)).toBe(true);
    for (const atom of unused) {
      expect(k.docs.some((d) => d.sections.some((s) => s.binding.kind === 'list' && s.binding.atomIds.includes(atom.id)))).toBe(false);
    }
  });
});

describe('containment vs jaccard', () => {
  it('jaccard collapses when a short quote meets a long atom', () => {
    const quote = 'no será posible una conexión directa a SAP';
    const atom = k.atoms.find((a) => a.id === 'atom-no-sap-direct-integration-constraint')!;
    const long = `${atom.title} ${atom.answer}`;
    expect(similarity(quote, long)).toBeLessThan(containment(quote, long));
  });
});
