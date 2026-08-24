---
source: https://reactflow.dev/api-reference/hooks/use-internal-node
title: useInternalNode()
---

# useInternalNode()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useInternalNode.ts">Source on GitHub </a>

This hook returns the internal representation of a specific node.
Components that use this hook will re-render **whenever any node
changes**, including when a node is selected or moved.

```tsx
import { useInternalNode } from '@xyflow/react';
 
export default function () {
  const internalNode = useInternalNode('node-1');
  const absolutePosition = internalNode.internals.positionAbsolute;
 
  return (
    <div>
      The absolute position of the node is at:
      <p>x: {absolutePosition.x}</p>
      <p>y: {absolutePosition.y}</p>
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
<tr id="id">
<td><code dir="ltr">id</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The ID of a node you want to observe.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`InternalNode<NodeType> | undefined`

</div>

## TypeScript

This hook accepts a generic type argument of custom node types. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const internalNode = useInternalNode<CustomNodeType>();
```

</div>
