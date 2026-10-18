---
source: https://reactflow.dev/api-reference/hooks/use-nodes-initialized
title: useNodesInitialized()
---

# useNodesInitialized()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesInitialized.ts">Source on GitHub </a>

This hook tells you whether all the nodes in a flow have been measured
and given a width and height. When you add a node to the flow, this hook
will return `false` and then `true` again once the node has been
measured.

```tsx
import { useReactFlow, useNodesInitialized } from '@xyflow/react';
import { useEffect, useState } from 'react';
 
const options = {
  includeHiddenNodes: false,
};
 
export default function useLayout() {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized(options);
  const [layoutedNodes, setLayoutedNodes] = useState(getNodes());
 
  useEffect(() => {
    if (nodesInitialized) {
      setLayoutedNodes(yourLayoutingFunction(getNodes()));
    }
  }, [nodesInitialized]);
 
  return layoutedNodes;
}
```

</div>

## Signature

**Parameters:**

| Name                                                                                                                                                                                                                                                                                                                   | Type      | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------|
| `options.includeHiddenNodes` | `boolean` | `false` |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`boolean`

</div>

## Notes

-   This hook always returns `false` if the internal nodes array is
    empty.
