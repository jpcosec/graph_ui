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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function resolveNodeTitle(data: unknown, fallback: string): string {
  const record = asRecord(data);
  const payloadValue = asRecord(asRecord(record.payload).value);
  const candidates = [record.label, record.name, payloadValue.name, payloadValue.title];
  return candidates.find(nonBlank) ?? fallback;
}
