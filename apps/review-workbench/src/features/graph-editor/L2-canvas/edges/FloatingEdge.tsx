import { memo, useState } from 'react';

import { BaseEdge, EdgeLabelRenderer, getBezierPath, useStore, type EdgeProps } from '@xyflow/react';

import { useUIStore } from '@/stores/ui-store';

import { resolveEdgeStyle } from '../encoding/encoding-rules';
import { getEdgeParams } from './edge-helpers';

function readRelationType(data: EdgeProps['data']): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const relationType = (data as { relationType?: unknown }).relationType;
  return typeof relationType === 'string' ? relationType : undefined;
}

export const FloatingEdge = memo(function FloatingEdge({
  id,
  source,
  target,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const sourceNode = useStore((store) => store.nodeLookup.get(source));
  const targetNode = useStore((store) => store.nodeLookup.get(target));
  const activeEncodingRules = useUIStore((state) => state.activeEncodingRules);
  const [isHovered, setIsHovered] = useState(false);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const relationType = readRelationType(data);

  const params = getEdgeParams(sourceNode, targetNode);
  const [path, labelX, labelY] = getBezierPath({
    sourceX: params.sx,
    sourceY: params.sy,
    sourcePosition: params.sourcePosition,
    targetX: params.tx,
    targetY: params.ty,
    targetPosition: params.targetPosition,
  });

  const isInherited = relationType === 'inherited';

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{ ...resolveEdgeStyle(relationType, activeEncodingRules), ...style }}
        markerEnd={isInherited ? undefined : markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-1.5 py-0.5 text-[10px] rounded-full bg-[rgba(7,12,17,0.92)] border border-white/8 font-mono uppercase tracking-[0.12em] text-white/52 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {relationType || 'linked'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
