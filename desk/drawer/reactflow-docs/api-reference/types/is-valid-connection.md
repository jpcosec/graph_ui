---
source: https://reactflow.dev/api-reference/types/is-valid-connection
title: IsValidConnection
---

# IsValidConnection

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L212">Source on GitHub </a>

The `IsValidConnection` type represents a function that validates
whether a connection between nodes is allowed. It receives a
<a href="/api-reference/types/connection"><code dir="ltr">Connection</code></a>
and returns a boolean indicating whether the connection is valid and
therefore should be created.

```tsx
type IsValidConnection = (edge: Edge | Connection) => boolean;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                        | Type                    | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------|
| `edge` | `EdgeType | Connection` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`boolean`

</div>
