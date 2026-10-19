import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApplyView } from '@/features/graph-editor/L2-canvas/hooks';
import type { ViewDirection } from '@/features/graph-editor/lib/views-provider';
import { useViewStore } from '@/stores/view-store';
import { toast } from 'sonner';

/** `uses, inherits ,` -> ['uses', 'inherits']. */
export function parseRelations(text: string): string[] {
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * The view's query, evaluated by the graph_ui server with sldb.api.graph: which documents
 * (model + `where`, united) and which relation types between them. Apply redraws the canvas.
 */
export function ViewQuery() {
  const applyView = useApplyView();
  const draft = useViewStore((state) => state.draft);
  const setNodeFilters = useViewStore((state) => state.setNodeFilters);
  const setRelations = useViewStore((state) => state.setRelations);
  const setDirection = useViewStore((state) => state.setDirection);

  const updateEntry = (index: number, patch: Partial<{ model: string; where: string }>) => {
    setNodeFilters(draft.nodes.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const handleApply = async () => {
    try {
      const view = { ...draft, nodes: draft.nodes.filter((entry) => entry.model.trim()) };
      const result = await applyView(view, useViewStore.getState().activeRef);
      toast.success(`View: ${result.nodes.length} nodes, ${result.edges.length} edges`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not evaluate the view');
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 p-3" data-testid="view-query">
      <p className="text-xs text-muted-foreground">Documents (model + where; none = all)</p>
      {draft.nodes.map((entry, index) => (
        <div key={index} className="space-y-1">
          <div className="flex gap-1">
            <Input aria-label={`Model ${index + 1}`} data-testid={`view-model-${index}`} placeholder="Model"
              value={entry.model} onChange={(event) => updateEntry(index, { model: event.target.value })} />
            <Button type="button" size="sm" variant="outline" aria-label={`Remove model ${index + 1}`}
              onClick={() => setNodeFilters(draft.nodes.filter((_, i) => i !== index))}>×</Button>
          </div>
          <Input aria-label={`Where ${index + 1}`} data-testid={`view-where-${index}`} placeholder='where, e.g. kind = "core"'
            value={entry.where} onChange={(event) => updateEntry(index, { where: event.target.value })} />
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" className="w-full" data-testid="view-add-model"
        onClick={() => setNodeFilters([...draft.nodes, { model: '', where: '' }])}>
        Add model
      </Button>
      <Input aria-label="Relation types" data-testid="view-relations" placeholder="Relation types, comma separated (none = all)"
        defaultValue={draft.relations.join(', ')} key={draft.relations.join(',')}
        onBlur={(event) => setRelations(parseRelations(event.target.value))} />
      <select aria-label="Direction" data-testid="view-direction" value={draft.direction}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        onChange={(event) => setDirection(event.target.value as ViewDirection)}>
        <option value="both">both</option>
        <option value="outgoing">outgoing</option>
        <option value="incoming">incoming</option>
      </select>
      <Button type="button" size="sm" className="w-full" data-testid="view-apply" onClick={() => void handleApply()}>
        Apply view
      </Button>
    </div>
  );
}
