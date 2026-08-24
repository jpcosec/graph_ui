---
# atom-xxx, unique identifier
id: atom-graph-ui-must-actually-edit-and-persist-not-render-read-only
# Short, descriptive title
title: graph_ui must actually edit and persist, not render read-only
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: why
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- topic:intent
- topic:editing
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# graph_ui must actually edit and persist, not render read-only

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

graph_ui is an editor: its reason to exist is letting an operator change graph data (create, edit, delete nodes and edges; edit typed attributes; save) and have those changes persist. Today the save path is a no-op (graphDataProvider.saveGraph returns {ok:true} without writing), and the mounted HumBody view builds draft graphs in memory only. That makes it a viewer, not an editor. Required end state: edits round-trip to the backing data store so a reload shows persisted changes made by the operator, not just localStorage-scoped named views.
