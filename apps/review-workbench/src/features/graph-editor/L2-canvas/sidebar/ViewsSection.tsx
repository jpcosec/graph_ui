import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApplyView } from '@/features/graph-editor/L2-canvas/hooks';
import { viewsProvider, type StoredView } from '@/features/graph-editor/lib/views-provider';
import { useViewStore } from '@/stores/view-store';
import { toast } from 'sonner';

import { ViewLegend } from '../ViewLegend';

/** `My View!` -> `my-view`: the ViewDoc name a label saves under. */
export function viewNameFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Saved views are `ViewDoc`s of the store (spec2viz's model), listed, evaluated and saved through
 * the graph_ui server. The store field points them at any other `.sldb`.
 */
export function ViewsSection() {
  const applyView = useApplyView();
  const activeRef = useViewStore((state) => state.activeRef);
  const storePath = useViewStore((state) => state.storePath);
  const setStorePath = useViewStore((state) => state.setStorePath);
  const [views, setViews] = useState<StoredView[]>([]);
  const [viewName, setViewName] = useState('');

  const refresh = useCallback(async () => {
    try {
      setViews(await viewsProvider.list(storePath));
    } catch (error) {
      setViews([]);
      toast.error(error instanceof Error ? error.message : 'Could not list views');
    }
  }, [storePath]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLoad = async (ref: string) => {
    if (!ref) {
      return;
    }
    try {
      const result = await applyView(ref);
      toast.success(`Loaded ${ref}: ${result.nodes.length} nodes, ${result.edges.length} edges`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load the view');
    }
  };

  const handleSave = async () => {
    const name = viewNameFromLabel(viewName);
    if (!name) {
      toast.error('Name the view before saving');
      return;
    }
    try {
      const { draft } = useViewStore.getState();
      const saved = await viewsProvider.save(name, { ...draft, title: viewName.trim() }, storePath);
      useViewStore.getState().setDraft(saved.view, saved.ref);
      setViewName('');
      await refresh();
      toast.success(`Saved ${saved.ref}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the view');
    }
  };

  return (
    <div className="space-y-3 px-3 pb-3" data-testid="views-section">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground" htmlFor="saved-view-select">
          Saved views
        </label>
        <select
          id="saved-view-select"
          aria-label="Saved views"
          data-testid="saved-view-select"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
          value={activeRef ?? ''}
          onChange={(event) => void handleLoad(event.target.value)}
        >
          <option value="">{views.length ? 'Choose a view…' : 'No views in this store'}</option>
          {views.map((view) => (
            <option key={view.ref} value={view.ref}>
              {view.payload.title || view.ref}
            </option>
          ))}
        </select>
        <Input
          aria-label="Store"
          data-testid="view-store-path"
          placeholder="Store (.sldb path; empty = this server's)"
          value={storePath}
          onChange={(event) => setStorePath(event.target.value)}
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 p-3">
        <Input
          aria-label="View name"
          data-testid="view-name"
          placeholder="View name"
          value={viewName}
          onChange={(event) => setViewName(event.target.value)}
        />
        <Button type="button" size="sm" className="w-full" data-testid="view-save" onClick={() => void handleSave()}>
          Save current as view
        </Button>
      </div>

      <ViewLegend />
    </div>
  );
}
