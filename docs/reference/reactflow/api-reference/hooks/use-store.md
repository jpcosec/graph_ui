---
source: https://reactflow.dev/api-reference/hooks/use-store
title: useStore()
---

# useStore()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts">Source on GitHub </a>

This hook can be used to subscribe to internal state changes of the
React Flow component. The `useStore` hook is re-exported from the
<a href="https://github.com/pmndrs/zustand">Zustand </a>
state management library, so you should check out their docs for more
details.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

This hook should only be used if there is no other way to access the
internal state. For many of the common use cases, there are dedicated
hooks available such as
<a href="/api-reference/hooks/use-react-flow"><code dir="ltr">useReactFlow</code></a>,
<a href="/api-reference/hooks/use-viewport"><code dir="ltr">useViewport</code></a>,
etc.

</div>

</div>

```tsx
import { ReactFlow, useStore } from '@xyflow/react';
 
const nodesLengthSelector = (state) =>
  state.nodes.length || 0;
 
const NodesLengthDisplay = () => {
  const nodesLength = useStore(nodesLengthSelector);
 
  return <div>The current number of nodes is: {nodesLength}</div>;
};
 
function Flow() {
  return (
    <ReactFlow nodes={[...]}>
      <NodesLengthDisplay />
    </ReactFlow>
  );
}
```

</div>

This example computes the number of nodes eagerly. Whenever the number
of nodes in the flow changes, the `<NodesLengthDisplay />` component
will re-render. This is in contrast to the example in the
<a href="/api-reference/hooks/use-store-api"><code dir="ltr">useStoreApi</code></a>
hook that only computes the number of nodes when a button is clicked.

Choosing whether to calculate values on-demand or to subscribe to
changes as they happen is a bit of a balancing act. On the one hand,
putting too many heavy calculations in an event handler can make your
app feel sluggish or unresponsive. On the other hand, computing values
eagerly can lead to slow or unnecessary re-renders.

We make both this hook and
<a href="/api-reference/hooks/use-store-api"><code dir="ltr">useStoreApi</code></a>
available so that you can choose the approach that works best for your
use-case.

## Signature

**Parameters:**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr id="selector">
<td><code dir="ltr">selector</code></td>
<td><code dir="ltr">(state: ReactFlowState) => StateSlice</code>
<div>
<p>A selector function that returns a slice of the flow’s internal state. Extracting or transforming just the state you need is a good practice to avoid unnecessary re-renders.</p>
</div></td>
<td></td>
</tr>
<tr id="equalityfn">
<td><code dir="ltr">equalityFn</code></td>
<td><code dir="ltr">(a: StateSlice, b: StateSlice) => boolean</code>
<div>
<p>A function to compare the previous and next value. This is incredibly useful for preventing unnecessary re-renders. Good sensible defaults are using <code dir="ltr">Object.is</code> or importing <code dir="ltr">zustand/shallow</code>, but you can be as granular as you like.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`StateSlice`

</div>

## Examples

### Triggering store actions

You can manipulate the internal React Flow state by triggering internal
actions through the `useStore` hook. These actions are already used
internally throughout the library, but you can also use them to
implement custom functionality.

```tsx
import { useStore } from '@xyflow/react';
 
const setMinZoomSelector = (state) => state.setMinZoom;
 
function MinZoomSetter() {
  const setMinZoom = useStore(setMinZoomSelector);
 
  return <button onClick={() => setMinZoom(6)}>set min zoom</button>;
}
```

</div>

## TypeScript

This hook can be typed by typing the selector function. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const nodes = useStore((s: ReactFlowState<CustomNodeType>) => s.nodes);
```

</div>
