---
source: https://reactflow.dev/api-reference/types/on-edges-change
title: OnEdgesChange
---

# OnEdgesChange

This type is used for typing the
<a href="/api-reference/react-flow#on-edges-change"><code dir="ltr">onEdgesChange</code></a>
function.

```tsx
export type OnEdgesChange<EdgeType extends Edge = Edge> = (
  changes: EdgeChange<EdgeType>[],
) => void;
```

</div>

## Fields

**Parameters:**

| Name                                                                                                                                                                                                                                                                              | Type                     | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|---------|
| `changes` | `EdgeChange<EdgeType>[]` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>

## Usage

This type accepts a generic type argument of custom edge types. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our Typescript guide</a>
for more information.

```tsx
const onEdgesChange: OnEdgesChange = useCallback(
  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  [setEdges],
);
```

</div>
