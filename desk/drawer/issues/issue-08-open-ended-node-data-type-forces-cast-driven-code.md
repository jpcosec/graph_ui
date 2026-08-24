---
title: Open-ended node data type forces cast-driven code
severity: high
category: type-safety
---
# Open-ended node data type forces cast-driven code
## What
`NodeData` is intentionally open-ended (`[key: string]: unknown`) and `payload.value` is `unknown`. That forces the editor to treat node data as an untyped bag, repeatedly cast it to `Record<string, unknown>`, and branch on ad-hoc runtime shape checks.

## Where
- `apps/review-workbench/src/stores/types.ts:2-15`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/NodeShell.tsx:28-38`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/NodeShell.tsx:74-100`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GroupShell.tsx:19-31`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/panels/NodeInspector.tsx:23-35`
- `apps/review-workbench/src/features/graph-editor/lib/graph-to-domain.ts:3-22`

## Why it's a threat
This weakens TypeScript precisely where the architecture most needs help: at the boundary between raw graph data, typed node definitions, and UI renderers. The result is duplicated defensive code, more room for silent shape drift, and fewer compile-time guarantees when evolving node formats.

## Evidence
The core type is open-ended:

```ts
export type NodePayload = {
  typeId?: string;
  value?: unknown;
};

export type NodeData = {
  typeId?: string;
  payload?: NodePayload;
  properties?: Record<string, string>;
  visualToken?: string;
  label?: string;
  name?: string;
  [key: string]: unknown;
};
```

The canvas shell has to cast and re-cast data:

```tsx
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
```

The same pattern is repeated in `NodeInspector` and `graph-to-domain`:

```tsx
function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}
```

## Suggested direction
Replace the bag-of-unknowns model with explicit graph node variants or a well-defined adapter output type. Keep the raw-input boundary narrow, then convert once into a typed editor shape so downstream L2/L3 code stops re-parsing `unknown`.