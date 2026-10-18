---
source: https://reactflow.dev/api-reference/types/on-connect-end
title: OnConnectEnd
---

# OnConnectEnd

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L89">Source on GitHub </a>

The `OnConnectEnd` type represents a callback function that is called
when finishing or canceling a connection attempt. It receives the mouse
or touch event and the final state of the connection attempt.

```tsx
type OnConnectEnd = (
  event: MouseEvent | TouchEvent,
  connectionState: FinalConnectionState,
) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                                              | Type                                               | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|---------|
| `event`                     | `MouseEvent | TouchEvent`                          |         |
| `connectionState` | `FinalConnectionState<InternalNodeBase<NodeType>>` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
