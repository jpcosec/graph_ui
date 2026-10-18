---
source: https://reactflow.dev/api-reference/types/on-connect-start
title: OnConnectStart
---

# OnConnectStart

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L79">Source on GitHub </a>

The `OnConnectStart` type represents a callback function that is called
when starting to create a connection between nodes. It receives the
mouse or touch event and information about the source node and handle.

```tsx
type OnConnectStart = (
  event: MouseEvent | TouchEvent,
  params: OnConnectStartParams,
) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                            | Type                      | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------|
| `event`   | `MouseEvent | TouchEvent` |         |
| `params` | `OnConnectStartParams`    |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
