---
source: https://reactflow.dev/api-reference/hooks/use-nodes
title: useNodes()
---

# useNodes()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodes.ts">Source on GitHub </a>

This hook returns an array of the current nodes. Components that use
this hook will re-render **whenever any node changes**, including when a
node is selected or moved.

```tsx
import { useNodes } from '@xyflow/react';
 
export default function () {
  const nodes = useNodes();
 
  return <div>There are currently {nodes.length} nodes!</div>;
}
```

</div>

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`NodeType[]`

</div>

## TypeScript

This hook accepts a generic type argument of custom node types. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const nodes = useNodes<CustomNodeType>();
```

</div>

## Notes

-   Relying on `useNodes` unnecessarily can be a common cause of
    performance issues. Whenever any node changes, this hook will cause
    the component to re-render. Often we actually care about something
    more specific, like when the *number* of nodes changes: where
    possible try to use
    <a href="/api-reference/hooks/use-store"><code dir="ltr">useStore</code></a>
    instead.
