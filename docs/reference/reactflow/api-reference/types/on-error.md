---
source: https://reactflow.dev/api-reference/types/on-error
title: OnError
---

# OnError

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L233">Source on GitHub </a>

The `OnError` type defines the callback function that is called when an
error occurs. This callback receives an error id and the error message
as its argument.

```tsx
type OnError = (id: string, error: string) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                              | Type     | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `id`           | `string` |         |
| `message` | `string` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
