import { beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { ProjectionViewStore, type StorageLike } from '@/features/graph-editor/lib/projection-view-store';
import { useUIStore } from '@/stores/ui-store';

import {
  ViewsSection,
  applyProjectionView,
  buildProjectionView,
  createViewIdFromLabel,
} from './ViewsSection';

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

beforeEach(() => {
  useUIStore.setState(useUIStore.getInitialState(), true);
});

describe('ViewsSection', () => {
  it('renders the saved-view selector and save action', () => {
    const store = new ProjectionViewStore(createStorage());
    const markup = renderToStaticMarkup(<ViewsSection store={store} />);

    expect(markup).toContain('Saved views');
    expect(markup).toContain('Save current as view');
    expect(markup).toContain('Default View');
  });

  it('builds a stable view id from the requested label', () => {
    expect(createViewIdFromLabel(' Imports View ')).toBe('view-imports-view');
  });

  it('saves and applies a view through the ui store', () => {
    const store = new ProjectionViewStore(createStorage());
    useUIStore.getState().setActiveLayoutStrategy('elk-rings');
    useUIStore.getState().setActiveEncodingRules([
      { when: { relationType: 'imports' }, style: { strokeColor: '#ffffff', strokeStyle: 'dashed' } },
    ]);

    const draftView = buildProjectionView('Imports View');
    const savedView = store.save(draftView);
    applyProjectionView(savedView);

    const uiState = useUIStore.getState();
    expect(savedView.view_id).toBe('view-imports-view');
    expect(store.load(savedView.view_id)).toMatchObject({ label: 'Imports View' });
    expect(uiState.activeViewId).toBe(savedView.view_id);
    expect(uiState.activeLayoutStrategy).toBe('elk-rings');
    expect(uiState.activeEncodingRules).toEqual(savedView.encoding);
  });
});
