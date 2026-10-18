---
source: https://reactflow.dev/api-reference/types/on-connect
title: OnConnect
---

# OnConnect

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L80">Source on GitHub </a>

The `OnConnect` type represents a callback function that is called when
a new connection is created between nodes. It receives a
<a href="/api-reference/types/connection"><code dir="ltr">Connection</code></a>
containing the source and target node IDs and their respective handle
IDs.

```tsx
type OnConnect = (connection: Connection) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                                    | Type         | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `connection` | `Connection` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
