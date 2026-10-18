---
source: https://reactflow.dev/api-reference/hooks/use-react-flow
title: useReactFlow()
---

# useReactFlow()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useReactFlow.ts">Source on GitHub </a>

This hook returns a
<a href="/api-reference/types/react-flow-instance"><code dir="ltr">ReactFlowInstance</code></a>
that can be used to update nodes and edges, manipulate the viewport, or
query the current state of the flow.

```tsx
import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
 
export function NodeCounter() {
  const reactFlow = useReactFlow();
  const [count, setCount] = useState(0);
  const countNodes = useCallback(() => {
    setCount(reactFlow.getNodes().length);
    // you need to pass it as a dependency if you are using it with useEffect or useCallback
    // because at the first render, it's not initialized yet and some functions might not work.
  }, [reactFlow]);
 
  return (
    <div>
      <button onClick={countNodes}>Update count</button>
      <p>There are {count} nodes in the flow.</p>
    </div>
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

`ReactFlowInstance<NodeType, EdgeType>`

</div>

## TypeScript

This hook accepts a generic type argument of custom node & edge types.
See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const reactFlow = useReactFlow<CustomNodeType, CustomEdgeType>();
```

</div>

## Notes

-   This hook can only be used in a component that is a child of a
    <a href="/api-reference/react-flow-provider"><code dir="ltr"><ReactFlowProvider /></code></a>
    or a
    <a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
    component.
-   Unlike
    <a href="/api-reference/hooks/use-nodes"><code dir="ltr">useNodes</code></a>
    or
    <a href="/api-reference/hooks/use-edges"><code dir="ltr">useEdges</code></a>,
    this hook won’t cause your component to re-render when state
    changes. Instead, you can query the state when you need it by using
    methods on the
    <a href="/api-reference/types/react-flow-instance"><code dir="ltr">ReactFlowInstance</code></a>
    this hook returns.
