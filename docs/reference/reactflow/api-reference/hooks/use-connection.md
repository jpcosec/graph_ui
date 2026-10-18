---
source: https://reactflow.dev/api-reference/hooks/use-connection
title: useConnection()
---

# useConnection()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useConnection.ts">Source on GitHub </a>

The `useConnection` hook returns the current connection state when there
is an active connection interaction. If no connection interaction is
active, it returns `null` for every property. A typical use case for
this hook is to colorize handles based on a certain condition (e.g. if
the connection is valid or not).

```tsx
import { useConnection } from '@xyflow/react';
 
export default function App() {
  const connection = useConnection();
 
  return (
    <div>
      {connection ? `Someone is trying to make a connection from ${connection.fromNode} to this one.` : 'There are currently no incoming connections!'}
    </div>
  );
}
```

</div>

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
<tr id="connectionselector">
<td><code dir="ltr">connectionSelector</code></td>
<td><code dir="ltr">(connection: ConnectionState<InternalNode<NodeType>>) => SelectorReturn</code>
<div>
<p>An optional selector function used to extract a slice of the <code dir="ltr">ConnectionState</code> data. Using a selector can prevent component re-renders where data you don’t otherwise care about might change. If a selector is not provided, the entire <code dir="ltr">ConnectionState</code> object is returned unchanged.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`SelectorReturn`

</div>
