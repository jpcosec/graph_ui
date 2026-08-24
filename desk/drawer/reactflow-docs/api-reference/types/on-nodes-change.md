---
source: https://reactflow.dev/api-reference/types/on-nodes-change
title: OnNodesChange
---

# OnNodesChange

This type is used for typing the
<a href="/api-reference/react-flow#on-nodes-change"><code dir="ltr">onNodesChange</code></a>
function.

```tsx
export type OnNodesChange<NodeType extends Node = Node> = (
  changes: NodeChange<NodeType>[],
) => void;
```

</div>

## Fields

**Parameters:**

| Name                                                                                                                                                                                                                                                                              | Type                     | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|---------|
| `changes` | `NodeChange<NodeType>[]` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>

## Usage

This type accepts a generic type argument of custom nodes types. See
this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const onNodesChange: OnNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  [setNodes],
);
```

</div>
