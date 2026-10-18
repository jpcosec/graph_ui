---
source: https://reactflow.dev/api-reference/types/on-init
title: OnInit
---

# OnInit

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L113">Source on GitHub </a>

The `OnInit` type defines the callback function that is called when the
ReactFlow instance is initialized. This callback receives the ReactFlow
instance as its argument.

```tsx
type OnInit = (reactFlowInstance: ReactFlowInstance) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                                                  | Type                                    | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|---------|
| `reactFlowInstance` | `ReactFlowInstance<NodeType, EdgeType>` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
