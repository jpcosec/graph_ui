import type { NodeData } from '@/stores/types';

/**
 * The node's document payload as a record. `payload.value` is typed `unknown`
 * on purpose: it is the document itself and its shape depends on the model.
 * This is the one place that turns it into something indexable; anything that
 * is not a plain object yields an empty record.
 */
export function payloadValue(data: NodeData | undefined): Record<string, unknown> {
  const value = data?.payload?.value;
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
