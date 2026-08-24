---
title: HUM body projection is driven by static fixtures and hardcoded geometry
severity: high
category: data-coupling
---
# HUM body projection is driven by static fixtures and hardcoded geometry
## What
The current editor experience is baked around static HUM fixtures: generated AST files, in-repo mock body data, hardcoded node positions, hardcoded overlay coordinates, and label-based edge inference. The app is effectively a curated demo projection, not a data-driven editor surface.

## Where
- `apps/review-workbench/src/features/hum-body/lib/generated-hum-ast.ts:3-16`
- `apps/review-workbench/src/features/hum-body/lib/mock-data.ts:4-15`
- `apps/review-workbench/src/features/hum-body/lib/mock-data.ts:81-120`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:222-307`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:317-339`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:405-428`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:468-552`

## Why it's a threat
Static geometry and hand-authored semantic links make the projection expensive to evolve and impossible to trust as a general architecture. Every new source file, organ, capability, routine, or trace requires code edits instead of data derivation. This also hides what the real stable contract should be between source data and rendered graph.

## Evidence
The AST is generated into a huge checked-in fixture with baked positions and sizes:

```ts
export const generatedHumAstFiles: HumAstFile[] = [
  {
    "id": "ast-main",
    "label": "main.lisp",
    ...
    "position": {
      "x": 72,
      "y": 250
    },
    "size": {
      "width": 372,
      "height": 636
    }
  },
```

The HUM body model hardcodes positions for domain concepts:

```ts
{
  id: 'organ-core',
  ...
  position: { x: 360, y: 120 },
}
```

The adapter also hardcodes layout geometry and infers edges by string matching labels:

```ts
const COLUMNS = 3;
const COL_WIDTH = 372;
const GAP_X = 76;
const GAP_Y = 28;
const START_X = 72;
const START_Y = 160;
```

```ts
const callMap: Array<[string | undefined, string | undefined, string]> = [
  [findFormId((label) => label.includes('consulta-llm')), findFormId((label) => label.includes('run-system-command')), 'calls'],
  ...
];
```

Routine and trace overlays are also positioned with fixed coordinates:

```ts
const startX = 1360;
const stepY = 90;
```

## Suggested direction
Define a real projection contract and derive layout/input data from it. Keep generated source data separate from editorial view state, and move from hand-positioned fixtures toward computed layouts plus explicit metadata where necessary.