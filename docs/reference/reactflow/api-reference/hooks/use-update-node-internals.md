---
source: https://reactflow.dev/api-reference/hooks/use-update-node-internals
title: useUpdateNodeInternals()
---

# useUpdateNodeInternals()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useUpdateNodeInternals.ts">Source on GitHub </a>

When you programmatically add or remove handles to a node or update a
node’s handle position, you need to let React Flow know about it using
this hook. This will update the internal dimensions of the node and
properly reposition handles on the canvas if necessary.

```tsx
import { useCallback, useState } from 'react';
import { Handle, useUpdateNodeInternals } from '@xyflow/react';
 
export default function RandomHandleNode({ id }) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [handleCount, setHandleCount] = useState(0);
  const randomizeHandleCount = useCallback(() => {
    setHandleCount(Math.floor(Math.random() * 10));
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);
 
  return (
    <>
      {Array.from({ length: handleCount }).map((_, index) => (
        <Handle
          key={index}
          type="target"
          position="left"
          id={`handle-${index}`}
        />
      ))}
 
      <div>
        <button onClick={randomizeHandleCount}>Randomize handle count</button>
        <p>There are {handleCount} handles on this node.</p>
      </div>
    </>
  );
}
```

</div>

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`UpdateNodeInternals`

</div>

## Notes

-   This hook can only be used in a component that is a child of a
    <a href="/api-reference/react-flow-provider"><code dir="ltr"><ReactFlowProvider /></code></a>
    or a
    <a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
    component.
