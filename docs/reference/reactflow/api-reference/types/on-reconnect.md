---
source: https://reactflow.dev/api-reference/types/on-reconnect
title: OnReconnect
---

# OnReconnect

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L83">Source on GitHub </a>

The `OnReconnect` type represents a callback function that is called
when an existing edge is reconnected to a different node or handle. It
receives the old edge and the new connection details.

```tsx
type OnReconnect<EdgeType extends EdgeBase = EdgeBase> = (
  oldEdge: EdgeType,
  newConnection: Connection,
) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                                          | Type         | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `oldEdge`             | `EdgeType`   |         |
| `newConnection` | `Connection` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
