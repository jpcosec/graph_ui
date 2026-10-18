---
source: https://reactflow.dev/api-reference/types/on-move
title: OnMove
---

# OnMove

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L16">Source on GitHub </a>

The `OnMove` type is a callback that fires whenever the viewport is
moved, either by user interaction or programmatically. It receives the
triggering event and the new viewport state.

```tsx
type OnMove = (event: MouseEvent | TouchEvent | null, viewport: Viewport) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                                | Type                      | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------|
| `event`       | `MouseEvent | TouchEvent` |         |
| `viewport` | `Viewport`                |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
