import { memo, useState } from 'react';

import { BaseEdge, EdgeLabelRenderer, getBezierPath, useStore, type EdgeProps } from '@xyflow/react';

import { getEdgeParams } from './edge-helpers';

function readRelationType(data: EdgeProps['data']): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const relationType = (data as { relationType?: unknown }).relationType;
  return typeof relationType === 'string' ? relationType : undefined;
}

function getInheritedStyle(
  style: EdgeProps['style'],
  relationType: string | undefined,
): EdgeProps['style'] {
  if (relationType !== 'inherited') {
    return style;
  }

  return {
    ...style,
    strokeDasharray: '3 5',
    opacity: 0.34,
    stroke: style?.stroke ?? 'rgba(116, 117, 120, 0.7)',
  };
}

function getRelationStyle(relationType: string | undefined): EdgeProps['style'] {
  switch (relationType) {
    case 'calls':
      return { stroke: 'rgba(96,165,250,0.44)', strokeWidth: 1.35, opacity: 0.42 };
    case 'writes':
      return { stroke: 'rgba(248,250,252,0.28)', strokeWidth: 1.05, opacity: 0.34 };
    case 'reads':
      return { stroke: 'rgba(244,191,36,0.3)', strokeWidth: 1.05, opacity: 0.32 };
    case 'commits':
      return { stroke: 'rgba(34,197,94,0.44)', strokeWidth: 1.4, opacity: 0.44 };
    case 'declares':
    case 'contains':
      return { stroke: 'rgba(148,163,184,0.18)', strokeWidth: 0.9, opacity: 0.18 };
    case 'instantiates':
    case 'deviates-from':
      return { stroke: 'rgba(249,115,22,0.44)', strokeWidth: 1.3, opacity: 0.42 };
    case 'flows-to':
      return { stroke: 'rgba(34,197,94,0.28)', strokeWidth: 1.0, opacity: 0.28 };
    default:
      return { stroke: 'rgba(148,163,184,0.22)', strokeWidth: 1, opacity: 0.24 };
  }
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
        style={getInheritedStyle({ ...getRelationStyle(relationType), ...style }, relationType)}
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
