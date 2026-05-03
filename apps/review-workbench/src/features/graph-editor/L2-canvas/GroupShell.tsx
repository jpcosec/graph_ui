import { memo, useState } from 'react';

import { Handle, NodeResizer, NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';

import { useEdgeInheritance } from './hooks';
import type { ASTNode, NodePayload } from '@/stores/types';

type CanvasNode = Node<ASTNode['data'], string>;

export const COLLAPSED_KEY = '__collapsed';

function asPayloadRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function getGroupTitle(nodeData: ASTNode['data']): string {
  // Handle both AST format and direct JSON format
  const asJson = nodeData as Record<string, unknown>;
  
  // Direct JSON format: data.label
  if ('label' in asJson && typeof asJson.label === 'string') {
    return asJson.label;
  }
  
  // AST format: data.payload.value.name or data.payload.value.title
  const payload = asJson.payload as NodePayload | undefined;
  const payloadRecord = asPayloadRecord(payload?.value ?? {});
  const title = payloadRecord.name ?? payloadRecord.title;
  
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }

  return 'Group';
}

export function isCollapsed(nodeData: ASTNode['data']): boolean {
  // Handle both AST format and direct JSON format
  const asJson = nodeData as Record<string, unknown>;
  const props = asJson.properties as Record<string, string> | undefined;
  if (props && COLLAPSED_KEY in props) {
    return props[COLLAPSED_KEY] === 'true';
  }
  // Check if data has a collapsed property directly (new format)
  if ('collapsed' in asJson) {
    return Boolean(asJson.collapsed);
  }
  return false;
}

export function getNextCollapseProperties(
  properties: ASTNode['data']['properties'],
  collapsed: boolean,
): ASTNode['data']['properties'] {
  return {
    ...properties,
    [COLLAPSED_KEY]: String(!collapsed),
  };
}

export const GroupShell = memo(function GroupShell({ id, data, selected }: NodeProps<CanvasNode>) {
  const { collapseGroup, expandGroup } = useEdgeInheritance();
  const collapsed = isCollapsed(data);
  const [isHovered, setIsHovered] = useState(false);

  const asJson = data as Record<string, unknown>;
  const category = asJson.category as string | undefined;
  const label = asJson.label as string | undefined;
  const visualToken = asJson.visualToken as string | undefined;
  const properties = asJson.properties as Record<string, string> | undefined;
  const formCount = properties?.formCount;
  
  const categoryColors: Record<string, string> = {
    document: '#8b5cf6',
    section: '#3b82f6',
    folder: '#f59e0b',
  };
  
  const borderColor = visualToken 
    ? `var(--${visualToken})` 
    : category 
      ? categoryColors[category] ?? '#6b7280'
      : '#6b7280';

  const toggleCollapse = () => {
    if (collapsed) {
      expandGroup(id);
      return;
    }

    collapseGroup(id);
  };

    return (
    <div data-testid={`node-${id}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <NodeToolbar position={Position.Top} align="start" isVisible={selected || isHovered}>
        <div className="rounded-lg border border-white/10 bg-[rgba(8,12,16,0.9)] px-2.5 py-1 text-[10px] font-mono tracking-[0.08em] text-white/58 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
          {getGroupTitle(data)}
        </div>
      </NodeToolbar>

      <div
        className="relative h-full w-full overflow-hidden rounded-[1.1rem] border bg-[linear-gradient(180deg,rgba(12,16,21,0.78),rgba(10,13,18,0.34))]"
        style={{ borderColor }}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-white/8 bg-[linear-gradient(180deg,rgba(8,11,16,0.96),rgba(8,11,16,0.72))] px-3 py-2">
          <div className="min-w-0 pointer-events-none">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">lisp file</p>
            <p className="truncate text-[12px] font-semibold text-white/92">{label ?? getGroupTitle(data)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/62">
              {formCount ? `${formCount} forms` : 'file'}
            </div>
            <button
              onClick={toggleCollapse}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/72 transition hover:border-white/20 hover:bg-white/10"
              type="button"
              aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${getGroupTitle(data)}`}
              data-testid={`group-toggle-${id}`}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>
        <NodeResizer
          isVisible={selected && !collapsed}
          minWidth={160}
          minHeight={60}
          handleClassName="!bg-primary"
        />

        {!collapsed ? (
          <>
            <Handle
              type="target"
              position={Position.Top}
              className="!border-muted-foreground !bg-muted-foreground"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              className="!border-muted-foreground !bg-muted-foreground"
            />
          </>
        ) : null}
      </div>
    </div>
  );
});
