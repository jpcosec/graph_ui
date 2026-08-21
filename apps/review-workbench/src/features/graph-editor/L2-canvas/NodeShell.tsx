import { memo, useMemo, useState, type ComponentType } from 'react';

import { Handle, Position, useStore, type Node, type NodeProps, NodeToolbar } from '@xyflow/react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { resolveNodeStyle } from '@/features/graph-editor/L2-canvas/encoding/encoding-rules';
import { registry } from '@/schema/registry';
import type { NodePayload } from '@/stores/types';
import { useUIStore } from '@/stores/ui-store';
import type { ASTNode } from '@/stores/types';
import { LucideEdit2, LucideTrash2, LucideCopy, LucideFocus, LucideChevronDown, LucideChevronRight } from 'lucide-react';

type CanvasNode = Node<ASTNode['data'], string>;

const ZOOM_DETAIL = 0.9;
const ZOOM_LABEL = 0.4;

const zoomSelector = (state: { transform: [number, number, number] }) => state.transform[2];

function asPayloadRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function asDataRecord(data: ASTNode['data']): Record<string, unknown> {
  if (data && typeof data === 'object') {
    return data as Record<string, unknown>;
  }
  return {};
}

export function getNodeTitle(data: ASTNode['data']): string {
  // Handle direct JSON format: data.label
  const asJson = asDataRecord(data);
  if ('label' in asJson && typeof asJson.label === 'string' && asJson.label.trim().length > 0) {
    return asJson.label;
  }
  
  // Handle direct JSON format: data.name
  if ('name' in asJson && typeof asJson.name === 'string' && asJson.name.trim().length > 0) {
    return asJson.name;
  }

  // AST format: data.payload.value.name or data.payload.value.title
  const payload = asJson.payload as NodePayload | undefined;
  const payloadRecord = asPayloadRecord(payload?.value ?? {});
  const title = payloadRecord.name ?? payloadRecord.title;

  return typeof title === 'string' && title.trim().length > 0 ? title : 'Untitled';
}

export function getRenderTier(zoom: number): 'detail' | 'label' | 'dot' {
  if (zoom >= ZOOM_DETAIL) {
    return 'detail';
  }

  if (zoom >= ZOOM_LABEL) {
    return 'label';
  }

  return 'dot';
}

function renderNodeBody(data: ASTNode['data'], colorToken: string, zoom: number) {
  const asJson = asDataRecord(data);
  const typeId = asJson.typeId as string | undefined;
  
  const safeTypeId = typeId ?? 'entity';
  const definition = registry.get(safeTypeId);
  if (!definition) {
    return null;
  }

  const payload = asJson.payload as NodePayload | undefined;
  const payloadRecord = asPayloadRecord(payload?.value ?? {});
  const title = getNodeTitle(data);
  const tier = getRenderTier(zoom);

  // Get properties from direct JSON or AST format
  const properties = asJson.properties as Record<string, string> | undefined;

  if (tier === 'detail') {
    const DetailRenderer = definition.renderers.detail as ComponentType<Record<string, unknown>>;
    const detailProps = {
      ...payloadRecord,
      title,
      category: definition.label,
      properties,
      visualToken: asJson.visualToken as string | undefined,
      colorToken,
    };

    return <DetailRenderer {...detailProps} />;
  }

  if (tier === 'label') {
    const LabelRenderer = definition.renderers.label;
    return <LabelRenderer title={title} icon={definition.icon} />;
  }

  const DotRenderer = definition.renderers.dot;
  return <DotRenderer colorToken={colorToken} />;
}

export function getUnknownMessage(data: ASTNode['data']): string | null {
  const asJson = asDataRecord(data);
  if ('message' in asJson && typeof asJson.message === 'string' && asJson.message.trim().length > 0) {
    return asJson.message;
  }
  
  const payload = asJson.payload as NodePayload | undefined;
  const payloadRecord = asPayloadRecord(payload?.value ?? {});
  const message = payloadRecord.message;

  return typeof message === 'string' && message.trim().length > 0 ? message : null;
}

export const NodeShell = memo(function NodeShell(props: NodeProps<CanvasNode>) {
  const zoom = useStore(zoomSelector);
  const { data, selected, id } = props;

  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const asJson = asDataRecord(data);
  const typeId = asJson.typeId as string | undefined;
  const label = asJson.label as string | undefined;
  const name = asJson.name as string | undefined;
  const hasChildren = !!(asJson.childIds && Array.isArray(asJson.childIds) && (asJson.childIds as string[]).length > 0);

  const setFocusedNode = useUIStore((state) => state.setFocusedNode);
  const setFocusedEdge = useUIStore((state) => state.setFocusedEdge);
  const setEditorState = useUIStore((state) => state.setEditorState);
  const copyNode = useUIStore((state) => state.copyNode);
  const openDeleteConfirm = useUIStore((state) => state.openDeleteConfirm);
  const activeEncodingRules = useUIStore((state) => state.activeEncodingRules);

  const safeTypeId = typeId ?? '';
  const definition = registry.get(safeTypeId) ?? registry.get('entity');
  const colorToken = definition?.colorToken ?? 'token-surface-primary';

  const category = asJson.category as string | undefined;
  const { nodeColorToken: nodeBorderColor } = resolveNodeStyle(data, activeEncodingRules, colorToken);

  const nodeBody = useMemo(() => renderNodeBody(data, nodeBorderColor, zoom), [data, nodeBorderColor, zoom]);
  const isFormNode = category === 'concept';
  const isRoutineNode = category === 'routine-step';
  const isTraceNode = category === 'trace-event';
  const isOrganNode = category === 'organ';

  const toolbarVisible = selected || isHovered;

  const handleEdit = () => {
    setFocusedEdge(null);
    setFocusedNode(id);
    setEditorState('edit_node');
  };

  const handleFocusNeighborhood = () => {
    setFocusedEdge(null);
    setFocusedNode(id);
    setEditorState('focus');
  };

  const handleToggleExpand = () => {
    if (hasChildren) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleCopy = () => {
    copyNode(id, data);
  };

  const handleDelete = () => {
    const title = label ?? name ?? getNodeTitle(data) ?? 'Untitled';
    openDeleteConfirm({
      kind: 'node',
      title,
      description: `Delete node "${title}"?`,
    }, [id], []);
  };

  if (!definition) {
    const message = getUnknownMessage(data);
    return (
      <div
        data-testid={`node-${id}`}
        onDoubleClick={handleEdit}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <NodeToolbar isVisible={toolbarVisible} position={Position.Top} offset={8}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit} aria-label={`Edit ${getNodeTitle(data)}`}>
            <LucideEdit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFocusNeighborhood} aria-label={`Focus ${getNodeTitle(data)}`}>
            <LucideFocus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label={`Copy ${getNodeTitle(data)}`}>
            <LucideCopy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete} aria-label={`Delete ${getNodeTitle(data)}`}>
            <LucideTrash2 className="h-3 w-3" />
          </Button>
        </NodeToolbar>
        <ContextMenu>
          <ContextMenuTrigger disabled={selected}>
            <div className="min-w-[150px] rounded-lg border-2 border-red-500 bg-red-50 p-2">
              <span className="text-xs text-red-600">Unknown: {typeId ?? 'unknown'}</span>
              {message ? <p className="text-[10px] text-red-400">{message}</p> : null}
              <Handle type="target" position={Position.Top} />
              <Handle type="source" position={Position.Bottom} />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleEdit}>
              Edit <ContextMenuShortcut>Enter</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleFocusNeighborhood}>
              Focus Neighborhood
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleCopy}>
              Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDelete}>
              Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  }

  return (
    <div
      data-testid={`node-${id}`}
      onDoubleClick={handleEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeToolbar isVisible={toolbarVisible} position={Position.Top} offset={8}>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit} aria-label={`Edit ${getNodeTitle(data)}`}>
          <LucideEdit2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFocusNeighborhood} aria-label={`Focus ${getNodeTitle(data)}`}>
          <LucideFocus className="h-3 w-3" />
        </Button>
        {hasChildren && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggleExpand} aria-label={`${isOpen ? 'Collapse' : 'Expand'} children of ${getNodeTitle(data)}`}>
            {isOpen ? <LucideChevronDown className="h-3 w-3" /> : <LucideChevronRight className="h-3 w-3" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label={`Copy ${getNodeTitle(data)}`}>
          <LucideCopy className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete} aria-label={`Delete ${getNodeTitle(data)}`}>
          <LucideTrash2 className="h-3 w-3" />
        </Button>
      </NodeToolbar>
      <ContextMenu>
        <ContextMenuTrigger disabled={selected}>
          <div
            className={`rounded-lg border bg-card ${selected ? 'ring-2 ring-primary/30' : ''}`}
            style={{
              borderColor: isFormNode ? `${String(nodeBorderColor)}66` : nodeBorderColor,
              minWidth: definition.defaultSize.width,
              background: isFormNode
                ? 'linear-gradient(180deg, rgba(12,16,21,0.92), rgba(9,12,16,0.86))'
                : isRoutineNode
                  ? 'linear-gradient(180deg, rgba(11,27,18,0.96), rgba(7,16,12,0.88))'
                  : isTraceNode
                    ? 'linear-gradient(180deg, rgba(40,20,8,0.96), rgba(21,11,8,0.88))'
                    : isOrganNode
                      ? 'linear-gradient(180deg, rgba(10,15,20,0.98), rgba(9,12,17,0.92))'
                      : undefined,
              boxShadow: isFormNode ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
            }}
          >
            <Handle
              type="target"
              position={Position.Top}
              className="!border-muted-foreground !bg-muted-foreground"
            />

            {nodeBody}

            <Handle
              type="source"
              position={Position.Bottom}
              className="!border-muted-foreground !bg-muted-foreground"
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEdit}>
            Edit <ContextMenuShortcut>Enter</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleFocusNeighborhood}>
            Focus Neighborhood
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleCopy}>
            Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>
            Delete <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
});
