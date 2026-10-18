---
source: https://reactflow.dev/api-reference/types/z-index-mode
title: ZIndexMode
---

# ZIndexMode

The ZIndexMode type is used to define how z-indexing is calculated for
nodes and edges.

-   `auto` mode will automatically manage z-indexing for selections and
    sub flows.
-   `basic` mode will only manage z-indexing for selections.
-   `manual` mode does not apply any automatic z-indexing.

```tsx
export type ZIndexMode = 'auto' | 'basic' | 'manual';
```

</div>
