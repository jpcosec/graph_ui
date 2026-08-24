---
source: https://reactflow.dev/api-reference/types/node-change
title: NodeChange
---

# NodeChange

<a href="https://github.com/xyflow/xyflow/blob/487b13c9ad8903789f56c6fcfd8222f9cb74b812/packages/system/src/types/changes.ts/#L47">Source on GitHub </a>

The
<a href="/api-reference/react-flow#on-nodes-change"><code dir="ltr">onNodesChange</code></a>
callback takes an array of `NodeChange` objects that you should use to
update your flow’s state. The `NodeChange` type is a union of six
different object types that represent that various ways an node can
change in a flow.

```tsx
export type NodeChange =
  | NodeDimensionChange
  | NodePositionChange
  | NodeSelectionChange
  | NodeRemoveChange
  | NodeAddChange
  | NodeReplaceChange;
```

</div>

## Variant types

### NodeDimensionChange

| Name                                                                                                                                                                                                                                                                                          | Type                           | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|---------|
| `id`                       | `string`                       |         |
| `type`                   | `"dimensions"`                 |         |
| `dimensions`       | `Dimensions`                   |         |
| `resizing`           | `boolean`                      |         |
| `setAttributes` | `boolean | "width" | "height"` |         |

### NodePositionChange

| Name                                                                                                                                                                                                                                                                                                | Type         | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `id`                             | `string`     |         |
| `type`                         | `"position"` |         |
| `position`                 | `XYPosition` |         |
| `positionAbsolute` | `XYPosition` |         |
| `dragging`                 | `boolean`    |         |

### NodeSelectionChange

| Name                                                                                                                                                                                                                                                                                | Type       | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `id`             | `string`   |         |
| `type`         | `"select"` |         |
| `selected` | `boolean`  |         |

### NodeRemoveChange

| Name                                                                                                                                                                                                                                                                        | Type       | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `id`     | `string`   |         |
| `type` | `"remove"` |         |

### NodeAddChange

| Name                                                                                                                                                                                                                                                                          | Type       | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| `item`   | `NodeType` |         |
| `type`   | `"add"`    |         |
| `index` | `number`   |         |

### NodeReplaceChange

| Name                                                                                                                                                                                                                                                                        | Type        | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------|
| `id`     | `string`    |         |
| `item` | `NodeType`  |         |
| `type` | `"replace"` |         |
