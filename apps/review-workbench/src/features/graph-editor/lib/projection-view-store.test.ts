import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_VIEW_ID,
  ProjectionViewStore,
  type StorageLike,
} from './projection-view-store';

function createStorage(): StorageLike {
  const state = new Map<string, string>();
  return {
    getItem(key) {
      return state.get(key) ?? null;
    },
    setItem(key, value) {
      state.set(key, value);
    },
    removeItem(key) {
      state.delete(key);
    },
  };
}

describe('ProjectionViewStore', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    warnSpy.mockClear();
  });

  afterEach(() => {
    warnSpy.mockClear();
  });

  it('round-trips saved views through list and load', () => {
    const store = new ProjectionViewStore(createStorage());
    const savedView = store.save({
      view_id: 'view-imports',
      label: 'Imports',
      encoding: [{ when: { relationType: 'imports' }, style: { strokeColor: '#fff', strokeWidth: 2 } }],
      layout_strategy: 'elk-layered',
      created_by: 'test',
    });

    const loadedView = store.load('view-imports');
    const listedViewIds = store.list().map((view) => view.view_id);

    expect(savedView.created_at).toBeTruthy();
    expect(loadedView).toMatchObject({ view_id: 'view-imports', label: 'Imports' });
    expect(listedViewIds).toEqual([DEFAULT_VIEW_ID, 'view-imports']);
  });

  it('deletes non-default views without removing the seeded default view', () => {
    const store = new ProjectionViewStore(createStorage());
    store.save({
      view_id: 'view-calls',
      label: 'Calls',
      encoding: [{ when: { relationType: 'calls' }, style: { strokeStyle: 'dashed' } }],
      layout_strategy: 'elk-rings',
    });

    store.delete('view-calls');
    store.delete(DEFAULT_VIEW_ID);

    expect(store.load('view-calls')).toBeNull();
    expect(store.load(DEFAULT_VIEW_ID)).toMatchObject({ label: 'Default View' });
    expect(store.list()).toHaveLength(1);
  });

  it('seeds a default view that matches the default encoding and layout', () => {
    const store = new ProjectionViewStore(createStorage());
    const [defaultView] = store.list();

    expect(defaultView).toMatchObject({
      view_id: DEFAULT_VIEW_ID,
      label: 'Default View',
      layout_strategy: 'elk-layered',
    });
    expect(defaultView.encoding.length).toBeGreaterThan(0);
  });

  it('rejects encoding rules that reference literal node ids', () => {
    const store = new ProjectionViewStore(createStorage());

    expect(() =>
      store.save({
        view_id: 'view-invalid',
        label: 'Invalid',
        encoding: [{ when: { nodeFacet: 'category', facetValue: 'n-autos' }, style: { nodeColorToken: '#ff0' } }],
        layout_strategy: 'elk-layered',
      }),
    ).toThrow('Projection views must not reference literal node IDs in encoding rules.');

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(store.load('view-invalid')).toBeNull();
  });
});
