---
source: https://reactflow.dev/api-reference/hooks/use-on-selection-change
title: useOnSelectionChange()
---

# useOnSelectionChange()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnSelectionChange.ts">Source on GitHub </a>

This hook lets you listen for changes to both node and edge selection.
As the name implies, the callback you provide will be called whenever
the selection of *either* nodes or edges changes.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-yellow-50 x:dark:bg-yellow-700/30 x:text-yellow-700 x:dark:text-yellow-500 x:border-yellow-700">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Warning**

You need to memoize the passed `onChange` handler, otherwise the hook
will not work correctly.

</div>

</div>

```tsx
import { useState } from 'react';
import { ReactFlow, useOnSelectionChange } from '@xyflow/react';
 
function SelectionDisplay() {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
 
  // the passed handler has to be memoized, otherwise the hook will not work correctly
  const onChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id));
    setSelectedEdges(edges.map((edge) => edge.id));
  }, []);
 
  useOnSelectionChange({
    onChange,
  });
 
  return (
    <div>
      <p>Selected nodes: {selectedNodes.join(', ')}</p>
      <p>Selected edges: {selectedEdges.join(', ')}</p>
    </div>
  );
}
```

</div>

## Signature

**Parameters:**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr id="0onchange">
<td><code dir="ltr">[0].onChange</code></td>
<td><code dir="ltr">OnSelectionChangeFunc<NodeType, EdgeType></code>
<div>
<p>The handler to register.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>

## Notes

-   This hook can only be used in a component that is a child of a
    <a href="/api-reference/react-flow-provider"><code dir="ltr"><ReactFlowProvider /></code></a>
    or a
    <a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
    component.
