import { Toaster } from '@/components/ui/sonner';
import type { ReactNode } from 'react';

import type { ASTEdge, ASTNode } from '@/stores/types';

/** L2: Main editor container - canvas + sidebar + panels */
import { GraphCanvas } from './GraphCanvas';
import { useKeyboard } from './hooks/use-keyboard';
import { DeleteConfirm } from './components/DeleteConfirm';
import { CommandMenu } from './components/CommandMenu';
import { EdgeInspector } from './panels/EdgeInspector';
import { NodeInspector } from './panels/NodeInspector';
import { CanvasSidebar } from './sidebar/CanvasSidebar';
import { useUIStore } from '@/stores/ui-store';
import { useGraphStore } from '@/stores/graph-store';
import { toast } from 'sonner';

interface GraphEditorProps {
  initialNodes: ASTNode[];
  initialEdges: ASTEdge[];
  onSave?: () => void;
  editable?: boolean;
  hero?: {
    eyebrow: string;
    title: string;
    description: string;
  };
  workspace?: {
    label: string;
    title: string;
    description: string;
  };
  topOverlay?: ReactNode;
  shellVariant?: 'default' | 'compact';
  contentTopInset?: number;
  overlayPlacement?: 'canvas' | 'sidebar';
}

export function GraphEditor({ initialNodes, initialEdges, onSave, editable = true, hero, workspace, topOverlay, shellVariant = 'default', contentTopInset = 0, overlayPlacement = 'canvas' }: GraphEditorProps) {
  useKeyboard(editable);

  void initialNodes;
  void initialEdges;

  const deleteConfirmOpen = useUIStore((state) => state.deleteConfirmOpen);
  const deleteTarget = useUIStore((state) => state.deleteTarget);
  const closeDeleteConfirm = useUIStore((state) => state.closeDeleteConfirm);
  const executePendingDelete = useUIStore((state) => state.executePendingDelete);
  const commandDialogOpen = useUIStore((state) => state.commandDialogOpen);
  const closeCommandDialog = useUIStore((state) => state.closeCommandDialog);
  const removeElements = useGraphStore((state) => state.removeElements);

  const heroCopy = hero ?? {
    eyebrow: 'Graph Studio',
    title: 'Command your review topology',
    description: 'Shape nodes, wire relationships, and keep the whole system legible at a glance.',
  };
  const workspaceCopy = workspace ?? {
    label: 'Workspace',
    title: 'Live canvas',
    description: 'Save, inspect, and refactor visually',
  };

  const handleConfirm = () => {
    executePendingDelete(removeElements);
    toast.success('Selection deleted');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden px-4 pb-4 pt-4">
      <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/8 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-6 py-4">
          <div className={`glass-panel ${shellVariant === 'compact' ? 'max-w-[23rem] rounded-[1.4rem] px-3.5 py-2.5' : 'max-w-[29rem] rounded-2xl px-4 py-3'}`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary">{heroCopy.eyebrow}</p>
            <h1 className={`font-headline font-bold leading-tight text-on-surface ${shellVariant === 'compact' ? 'mt-1 text-[1.3rem]' : 'mt-1.5 text-[1.65rem]'}`}>{heroCopy.title}</h1>
            <p className={`leading-relaxed text-muted-foreground ${shellVariant === 'compact' ? 'mt-1 text-[12px]' : 'mt-1 text-[13px]'}`}>{heroCopy.description}</p>
          </div>

          <div className={`glass-panel text-right ${shellVariant === 'compact' ? 'rounded-[1.3rem] px-3.5 py-2.5 opacity-85' : 'rounded-2xl px-4 py-3'}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{workspaceCopy.label}</p>
            <p className="mt-1 text-sm font-medium text-on-surface">{workspaceCopy.title}</p>
            <p className="text-xs text-muted-foreground">{workspaceCopy.description}</p>
          </div>
        </div>

        {topOverlay && overlayPlacement === 'canvas' ? <div className={`pointer-events-none absolute left-6 z-10 ${shellVariant === 'compact' ? 'top-[6.25rem]' : 'top-[8.5rem]'}`}>{topOverlay}</div> : null}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,165,116,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(230,168,92,0.08),transparent_24%)]" />
        <div className="relative h-full" style={{ paddingTop: contentTopInset ? `${contentTopInset}px` : undefined }}>
          <GraphCanvas editable={editable} />
        </div>
      </div>
      <CanvasSidebar
        onSave={onSave}
        editable={editable}
        variant={shellVariant === 'compact' ? 'compact' : 'default'}
        topPanel={topOverlay && overlayPlacement === 'sidebar' ? topOverlay : undefined}
      />
      {editable ? <NodeInspector /> : null}
      {editable ? <EdgeInspector /> : null}
      {editable ? <DeleteConfirm
        open={deleteConfirmOpen}
        onOpenChange={(open) => !open && closeDeleteConfirm()}
        target={deleteTarget}
        onConfirm={handleConfirm}
      /> : null}
      {editable && onSave ? <CommandMenu open={commandDialogOpen} onOpenChange={closeCommandDialog} onSave={onSave} /> : null}
      <Toaster />
    </div>
  );
}
