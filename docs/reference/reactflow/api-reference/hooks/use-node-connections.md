---
source: https://reactflow.dev/api-reference/hooks/use-node-connections
title: useNodeConnections()
---

# useNodeConnections()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodeConnections.ts">Source on GitHub </a>

This hook returns an array of connections on a specific node, handle
type (‘source’, ‘target’) or handle ID.

```tsx
import { useNodeConnections } from '@xyflow/react';
 
export default function () {
  const connections = useNodeConnections({
    handleType: 'target',
    handleId: 'my-handle',
  });
 
  return (
    <div>There are currently {connections.length} incoming connections!</div>
  );
}
```

</div>

## Signature

**Parameters:**

| Name                                                                                                                                                                                                                                                                      | Type                       | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|---------|
| `__0` | `UseNodeConnectionsParams` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`NodeConnection[]`

</div>
