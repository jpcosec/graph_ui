---
source: https://reactflow.dev/api-reference/types/edge-change
title: EdgeChange
---

# EdgeChange

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/changes.ts/#L68-L72">Source on GitHub </a>

The
<a href="/api-reference/react-flow#on-edges-change"><code dir="ltr">onEdgesChange</code></a>
callback takes an array of `EdgeChange` objects that you should use to
update your flow’s state. The `EdgeChange` type is a union of four
different object types that represent that various ways an edge can
change in a flow.

```tsx
export type EdgeChange =
  | EdgeAddChange
  | EdgeRemoveChange
  | EdgeReplaceChange
  | EdgeSelectionChange;
```

</div>

## Variants

### EdgeAddChange

| Name                                                                                                                                                                                                                                                                          | Type       | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `item`   | `EdgeType` |         |
| `type`   | `"add"`    |         |
| `index` | `number`   |         |

### EdgeRemoveChange

| Name                                                                                                                                                                                                                                                                        | Type       | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `id`     | `string`   |         |
| `type` | `"remove"` |         |

### EdgeReplaceChange

| Name                                                                                                                                                                                                                                                                        | Type        | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------|
| `id`     | `string`    |         |
| `item` | `EdgeType`  |         |
| `type` | `"replace"` |         |

### EdgeSelectionChange

| Name                                                                                                                                                                                                                                                                                | Type       | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `id`             | `string`   |         |
| `type`         | `"select"` |         |
| `selected` | `boolean`  |         |
