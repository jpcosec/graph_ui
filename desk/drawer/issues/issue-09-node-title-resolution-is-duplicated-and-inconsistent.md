---
title: Node title resolution is duplicated and inconsistent
severity: medium
category: coupling
---
# Node title resolution is duplicated and inconsistent
## What
Node title extraction and writing logic is duplicated across the editor, and the implementations do not agree on the data shape. `NodeShell` can resolve titles from `payload.value`, but `NodeInspector` cannot read that shape even though it writes back into it.

## Where
- `apps/review-workbench/src/features/graph-editor/L2-canvas/NodeShell.tsx:42-60`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GroupShell.tsx:19-37`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/panels/NodeInspector.tsx:37-57`
- `apps/review-workbench/src/features/graph-editor/lib/graph-to-domain.ts:9-31`

## Why it's a threat
Duplicated decoding logic guarantees drift. Here that drift is already visible: the inspector can open an AST-backed node with an empty title because it ignores `payload.value.name/title`, then save back a different key shape through `setNodeTitle`. That is both a maintainability problem and a correctness risk.

## Evidence
`NodeShell` correctly falls back to `payload.value`:

```tsx
const payload = asJson.payload as NodePayload | undefined;
const payloadRecord = asPayloadRecord(payload?.value ?? {});
const title = payloadRecord.name ?? payloadRecord.title;

return typeof title === 'string' && title.trim().length > 0 ? title : 'Untitled';
```

`NodeInspector` does not read that same shape:

```tsx
function getNodeTitle(data: Record<string, unknown>): string {
  if ('label' in data && typeof data.label === 'string') {
    return data.label;
  }
  if ('name' in data && typeof data.name === 'string') {
    return data.name;
  }
  // AST format: payload.name or payload.title
  const title = data.name ?? data.title;
  return typeof title === 'string' ? title : '';
}
```

Yet on save it writes into `payload.value`:

```tsx
const newPayload: NodePayload = {
  typeId: safeTypeId || 'unknown',
  value: setNodeTitle(payloadRecord, draft.title),
};
```

## Suggested direction
Centralize title semantics in one shared adapter/helper with a single canonical write path. The same function should be used by shells, inspectors, serializers, and delete dialogs so editor behavior does not depend on which component touched the node last.