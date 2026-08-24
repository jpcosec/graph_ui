---
source: https://reactflow.dev/api-reference/types/connection-state
title: ConnectionState
---

# ConnectionState

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L148-L174">Source on GitHub </a>

The `ConnectionState` type bundles all information about an ongoing
connection. It is returned by the
<a href="/api-reference/hooks/use-connection"><code dir="ltr">useConnection</code></a>
hook.

```tsx
type NoConnection = {
  inProgress: false;
  isValid: null;
  from: null;
  fromHandle: null;
  fromPosition: null;
  fromNode: null;
  to: null;
  toHandle: null;
  toPosition: null;
  toNode: null;
};
type ConnectionInProgress = {
  inProgress: true;
  isValid: boolean | null;
  from: XYPosition;
  fromHandle: Handle;
  fromPosition: Position;
  fromNode: NodeBase;
  to: XYPosition;
  toHandle: Handle | null;
  toPosition: Position;
  toNode: NodeBase | null;
};
 
type ConnectionState = ConnectionInProgress | NoConnection;
```

</div>

## Fields

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
<tr id="inprogress">
<td><code dir="ltr">inProgress</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Indicates whether a connection is currently in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="isvalid">
<td><code dir="ltr">isValid</code></td>
<td><code dir="ltr">boolean | null</code>
<div>
<p>If an ongoing connection is above a handle or inside the connection radius, this will be <code dir="ltr">true</code> or <code dir="ltr">false</code>, otherwise <code dir="ltr">null</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="from">
<td><code dir="ltr">from</code></td>
<td><code dir="ltr">XYPosition | null</code>
<div>
<p>Returns the xy start position or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="fromhandle">
<td><code dir="ltr">fromHandle</code></td>
<td><code dir="ltr">Handle | null</code>
<div>
<p>Returns the start handle or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="fromposition">
<td><code dir="ltr">fromPosition</code></td>
<td><code dir="ltr">Position | null</code>
<div>
<p>Returns the side (called position) of the start handle or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="fromnode">
<td><code dir="ltr">fromNode</code></td>
<td><code dir="ltr">NodeType | null</code>
<div>
<p>Returns the start node or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="to">
<td><code dir="ltr">to</code></td>
<td><code dir="ltr">XYPosition | null</code>
<div>
<p>Returns the xy end position or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="tohandle">
<td><code dir="ltr">toHandle</code></td>
<td><code dir="ltr">Handle | null</code>
<div>
<p>Returns the end handle or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="toposition">
<td><code dir="ltr">toPosition</code></td>
<td><code dir="ltr">Position | null</code>
<div>
<p>Returns the side (called position) of the end handle or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="tonode">
<td><code dir="ltr">toNode</code></td>
<td><code dir="ltr">NodeType | null</code>
<div>
<p>Returns the end node or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
<tr id="pointer">
<td><code dir="ltr">pointer</code></td>
<td><code dir="ltr">XYPosition | null</code>
<div>
<p>Returns the pointer position or <code dir="ltr">null</code> if no connection is in progress.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>
