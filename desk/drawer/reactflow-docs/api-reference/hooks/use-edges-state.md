---
source: https://reactflow.dev/api-reference/hooks/use-edges-state
title: useEdgesState()
---

# useEdgesState()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts">Source on GitHub </a>

This hook makes it easy to prototype a controlled flow where you manage
the state of nodes and edges outside the `ReactFlowInstance`. You can
think of it like React’s `useState` hook with an additional helper
callback.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
 
const initialNodes = [];
const initialEdges = [];
 
export default function () {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
}
```

</div>

## Signature

**Parameters:**

| Name                                                                                                                                                                                                                                                                                        | Type         | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `initialEdges` | `EdgeType[]` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`[edges: EdgeType[], setEdges: Dispatch<SetStateAction<EdgeType[]>>, onEdgesChange: OnEdgesChange<EdgeType>]`

</div>

## TypeScript

This hook accepts a generic type argument of custom edge types. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const nodes = useEdgesState<CustomEdgeType>();
```

</div>

## Notes

-   This hook was created to make prototyping easier and our
    documentation examples clearer. Although it is OK to use this hook
    in production, in practice you may want to use a more sophisticated
    state management solution like
    <a href="/docs/guides/state-management">Zustand</a>
    instead.
