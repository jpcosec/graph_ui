---
source: https://reactflow.dev/api-reference/hooks/use-store-api
title: useStoreApi()
---

# useStoreApi()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts">Source on GitHub </a>

In some cases, you might need to access the store directly. This hook
returns the store object which can be used on demand to access the state
or dispatch actions.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Note**

This hook should only be used if there is no other way to access the
internal state. For many of the common use cases, there are dedicated
hooks available such as
<a href="/api-reference/hooks/use-react-flow"><code dir="ltr">useReactFlow</code></a>,
<a href="/api-reference/hooks/use-viewport"><code dir="ltr">useViewport</code></a>,
etc.

</div>

</div>

```tsx
import { useState, useCallback } from 'react';
import { ReactFlow, useStoreApi } from '@xyflow/react';
 
const NodesLengthDisplay = () => {
  const [nodesLength, setNodesLength] = useState(0);
  const store = useStoreApi();
 
  const onClick = useCallback(() => {
    const { nodes } = store.getState();
    const length = nodes.length || 0;
 
    setNodesLength(length);
  }, [store]);
 
  return (
    <div>
      <p>The current number of nodes is: {nodesLength}</p>
      <button onClick={onClick}>Update node length.</button>
    </div>
  );
};
 
function Flow() {
  return (
    <ReactFlow nodes={nodes}>
      <NodesLengthDisplay />
    </ReactFlow>
  );
}
```

</div>

This example computes the number of nodes in the flow *on-demand*. This
is in contrast to the example in the
<a href="/api-reference/hooks/use-store"><code dir="ltr">useStore</code></a>
hook that re-renders the component whenever the number of nodes changes.

Choosing whether to calculate values on-demand or to subscribe to
changes as they happen is a bit of a balancing act. On the one hand,
putting too many heavy calculations in an event handler can make your
app feel sluggish or unresponsive. On the other hand, computing values
eagerly can lead to slow or unnecessary re-renders.

We make both this hook and
<a href="/api-reference/hooks/use-store"><code dir="ltr">useStore</code></a>
available so that you can choose the approach that works best for your
use-case.

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

| Name                                                                                                                                                                                                                                                                                  | Type                                                                                                                                                                                                        |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `getState`   | `() => ReactFlowState<NodeType, EdgeType>`                                                                                                                                                                  |
| `setState`   | `(partial: ReactFlowState<NodeType, EdgeType> | Partial<ReactFlowState<NodeType, EdgeType>> | ((state: ReactFlowState<...>) => ReactFlowState<...> | Partial<...>), replace?: boolean | undefined) => void` |
| `subscribe` | `(listener: (state: ReactFlowState<NodeType, EdgeType>, prevState: ReactFlowState<NodeType, EdgeType>) => void) => () => void`                                                                              |

## TypeScript

This hook accepts a generic type argument of custom node & edge types.
See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const store = useStoreApi<CustomNodeType, CustomEdgeType>();
```

</div>
