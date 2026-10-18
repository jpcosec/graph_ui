import type { NodeData } from '@/stores/types';

import { payloadValue } from './node-data';

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * The one rule for a node's display title, shared by the canvas (NodeShell,
 * GroupShell), the inspector and the domain translation.
 *
 * A node carries its title either directly (`data.label`, `data.name`, the
 * plain JSON shape) or inside its document payload (`data.payload.value.name`
 * or `.title`, the AST shape). The first non-blank string wins, in that order;
 * otherwise the caller's fallback, since each surface names "no title"
 * differently ('Untitled', 'Group', or an empty draft field).
 */

export function resolveNodeTitle(data: NodeData | undefined, fallback: string): string {
  const payload = payloadValue(data);
  const candidates = [data?.label, data?.name, payload.name, payload.title];
  return candidates.find(nonBlank) ?? fallback;
}
