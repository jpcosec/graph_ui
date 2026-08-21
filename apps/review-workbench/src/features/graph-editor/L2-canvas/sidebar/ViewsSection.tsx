import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGraphLayout } from '@/features/graph-editor/L2-canvas/hooks';
import {
  projectionViewStore,
  type ProjectionView,
  type ProjectionViewStore,
} from '@/features/graph-editor/lib/projection-view-store';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';

export function createViewIdFromLabel(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug ? `view-${slug}` : `view-${Date.now()}`;
}

export function applyProjectionView(view: ProjectionView): void {
  const { setActiveEncodingRules, setActiveLayoutStrategy, setActiveViewId } = useUIStore.getState();
  setActiveEncodingRules(view.encoding);
  setActiveLayoutStrategy(view.layout_strategy);
  setActiveViewId(view.view_id);
}

export function buildProjectionView(label: string): ProjectionView {
  const { activeEncodingRules, activeLayoutStrategy } = useUIStore.getState();
  return {
    view_id: createViewIdFromLabel(label),
    label: label.trim(),
    encoding: activeEncodingRules,
    layout_strategy: activeLayoutStrategy,
    created_by: 'review-workbench',
  };
}

interface ViewsSectionProps {
  store?: ProjectionViewStore;
}

export function ViewsSection({ store = projectionViewStore }: ViewsSectionProps) {
  const { layout } = useGraphLayout();
  const activeViewId = useUIStore((state) => state.activeViewId);
  const activeLayoutStrategy = useUIStore((state) => state.activeLayoutStrategy);
  const [views, setViews] = useState<ProjectionView[]>(() => store.list());
  const [selectedViewId, setSelectedViewId] = useState<string>(() => activeViewId ?? store.list()[0]?.view_id ?? '');
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    const nextViews = store.list();
    setViews(nextViews);
    if (!selectedViewId && nextViews[0]) {
      setSelectedViewId(nextViews[0].view_id);
    }
  }, [selectedViewId, store]);

  useEffect(() => {
    if (activeViewId) {
      setSelectedViewId(activeViewId);
    }
  }, [activeViewId]);

  const selectedView = useMemo(
    () => views.find((view) => view.view_id === selectedViewId) ?? null,
    [selectedViewId, views],
  );

  const handleApplySelectedView = async (nextViewId: string) => {
    const view = store.load(nextViewId);
    if (!view) {
      toast.error('Saved view not found');
      return;
    }

    applyProjectionView(view);
    setSelectedViewId(view.view_id);
    await layout();
    toast.success(`Applied view "${view.label}"`);
  };

  const handleSaveCurrentView = () => {
    const label = viewName.trim();
    if (!label) {
      toast.error('Name the view before saving');
      return;
    }

    try {
      const savedView = store.save(buildProjectionView(label));
      const nextViews = store.list();
      setViews(nextViews);
      setSelectedViewId(savedView.view_id);
      setViewName('');
      applyProjectionView(savedView);
      toast.success(`Saved view "${savedView.label}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save view');
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
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
          value={selectedViewId}
          onChange={(event) => {
            const nextViewId = event.target.value;
            setSelectedViewId(nextViewId);
            void handleApplySelectedView(nextViewId);
          }}
        >
          {views.map((view) => (
            <option key={view.view_id} value={view.view_id}>
              {view.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">
          Active layout strategy: <span className="font-medium text-on-surface">{activeLayoutStrategy}</span>
          {selectedView ? ` · ${selectedView.encoding.length} encoding rules` : ''}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 p-3">
        <Input
          aria-label="View name"
          placeholder="View name"
          value={viewName}
          onChange={(event) => setViewName(event.target.value)}
        />
        <Button type="button" size="sm" className="w-full" onClick={handleSaveCurrentView}>
          Save current as view
        </Button>
      </div>
    </div>
  );
}
