import { describe, expect, it } from 'vitest';

import { DEFAULT_LAYOUT_STRATEGY_NAME, LAYOUT_STRATEGIES, computeElkRingsLayout, getLayoutStrategy, strategyForLayout, ringDepths } from './layout-strategies';

const DEFAULT_NODE_CENTER_OFFSET = { x: 100, y: 40 };

function toCenter(position: { x: number; y: number }) {
  return {
    x: position.x + DEFAULT_NODE_CENTER_OFFSET.x,
    y: position.y + DEFAULT_NODE_CENTER_OFFSET.y,
  };
}

function radiusOf(position: { x: number; y: number }) {
  const center = toCenter(position);
  return Math.sqrt(center.x ** 2 + center.y ** 2);
}

describe('LAYOUT_STRATEGIES', () => {
  it('returns a strategy by name', () => {
    expect(LAYOUT_STRATEGIES['elk-rings']).toBeDefined();
    expect(getLayoutStrategy('elk-rings')).toBe(LAYOUT_STRATEGIES['elk-rings']);
  });

  it('falls back to elk-layered for unknown strategies', () => {
    expect(getLayoutStrategy('unknown-strategy')).toBe(LAYOUT_STRATEGIES[DEFAULT_LAYOUT_STRATEGY_NAME]);
  });

  it('elk-layered produces positions for nodes', async () => {
    const result = await LAYOUT_STRATEGIES['elk-layered'].computeLayout(
      [
        { id: 'root' },
        { id: 'child-a' },
        { id: 'child-b' },
      ],
      [
        { id: 'e1', source: 'root', target: 'child-a' },
        { id: 'e2', source: 'root', target: 'child-b' },
      ],
      { direction: 'TB' },
    );

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'root',
          position: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
        }),
      ]),
    );
  });

  it('elk-rings positions nodes in BFS-based rings', async () => {
    const result = await LAYOUT_STRATEGIES['elk-rings'].computeLayout(
      [
        { id: 'root' },
        { id: 'level-1-a' },
        { id: 'level-1-b' },
        { id: 'level-2-a' },
        { id: 'level-2-b' },
      ],
      [
        { id: 'e1', source: 'root', target: 'level-1-a' },
        { id: 'e2', source: 'root', target: 'level-1-b' },
        { id: 'e3', source: 'level-1-a', target: 'level-2-a' },
        { id: 'e4', source: 'level-1-b', target: 'level-2-b' },
      ],
      { center: { x: 0, y: 0 }, ringSpacing: 100 },
    );

    const positions = Object.fromEntries(result.map((entry) => [entry.id, entry.position]));

    expect(radiusOf(positions.root)).toBeCloseTo(0, 5);
    expect(radiusOf(positions['level-1-a'])).toBeCloseTo(100, 5);
    expect(radiusOf(positions['level-1-b'])).toBeCloseTo(100, 5);
    expect(radiusOf(positions['level-2-a'])).toBeCloseTo(200, 5);
    expect(radiusOf(positions['level-2-b'])).toBeCloseTo(200, 5);
  });

  it('elk-rings can restrict traversal to interface relations', () => {
    const result = computeElkRingsLayout(
      [
        { id: 'root' },
        { id: 'interface-child' },
        { id: 'non-interface-child' },
      ],
      [
        { id: 'e1', source: 'root', target: 'interface-child', data: { relationType: 'inherited' } },
        { id: 'e2', source: 'root', target: 'non-interface-child', data: { relationType: 'contains' } },
      ],
      { center: { x: 0, y: 0 }, ringSpacing: 100, interfacesOnly: true, interfaceRelationTypes: ['inherited'] },
    );

    const positions = Object.fromEntries(result.map((entry) => [entry.id, entry.position]));

    expect(radiusOf(positions['interface-child'])).toBeCloseTo(100, 5);
    expect(radiusOf(positions['non-interface-child'])).toBeCloseTo(200, 5);
  });
});

describe('strategyForLayout (architecture style -> layout)', () => {
  it('layered is the default and keeps the notation direction', () => {
    expect(strategyForLayout(undefined)).toEqual({ strategy: 'elk-layered', options: {} });
    expect(strategyForLayout({ style: 'layered', direction: 'LR' })).toEqual({ strategy: 'elk-layered', options: { direction: 'LR' } });
    expect(strategyForLayout({ direction: 'sideways' })).toEqual({ strategy: 'elk-layered', options: {} });
  });

  it('rings carries the ring field and the ring order', () => {
    expect(strategyForLayout({ style: 'rings', ring_field: 'kind', rings: ['core', 'boundary'] })).toEqual({
      strategy: 'elk-rings',
      options: { ringField: 'kind', rings: ['core', 'boundary'] },
    });
  });
});

describe('ringDepths and rings by field', () => {
  const nodes = [
    { id: 'a', ring: 'boundary' },
    { id: 'b', ring: 'core' },
    { id: 'c', ring: 'adapter' },
    { id: 'd' },
  ];

  it('orders listed rings first, the rest sorted, ringless nodes last', () => {
    expect(Object.fromEntries(ringDepths(nodes, ['core', 'boundary']))).toEqual({ a: 2, b: 1, c: 3, d: 4 });
  });

  it('puts every node of a ring at that ring radius', () => {
    const result = computeElkRingsLayout(
      [{ id: 'core-1', ring: 'core', width: 0, height: 0 }, { id: 'core-2', ring: 'core', width: 0, height: 0 },
        { id: 'edge-1', ring: 'boundary', width: 0, height: 0 }],
      [],
      { rings: ['core', 'boundary'], ringSpacing: 100 },
    );
    const radius = Object.fromEntries(result.map(({ id, position }) => [id, Math.round(Math.hypot(position.x, position.y))]));
    expect(radius).toEqual({ 'core-1': 100, 'core-2': 100, 'edge-1': 200 });
  });
});
