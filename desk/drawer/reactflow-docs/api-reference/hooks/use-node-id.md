---
source: https://reactflow.dev/api-reference/hooks/use-node-id
title: useNodeId()
---

# useNodeId()

<a href="https://github.com/xyflow/xyflow/blob/v11/packages/core/src/contexts/NodeIdContext.ts/#L7">Source on Github </a>

You can use this hook to get the id of the node it is used inside. It is
useful if you need the node’s id deeper in the render tree but don’t
want to manually drill down the id as a prop.

```tsx
import { useNodeId } from '@xyflow/react';
 
export default function CustomNode() {
  return (
    <div>
      <span>This node has an id of </span>
      <NodeIdDisplay />
    </div>
  );
}
 
function NodeIdDisplay() {
  const nodeId = useNodeId();
 
  return <span>{nodeId}</span>;
}
```

</div>

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`string | null`

</div>

## Notes

-   This hook should only be used within a custom node or its children.
