---
id: atom-graph-ui-must-actually-edit-and-persist-not-render-read-only
title: graph_ui must actually edit and persist, not render read-only
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:intent
- topic:editing
---

# graph_ui must actually edit and persist, not render read-only

## Answer

graph_ui is an editor: its reason to exist is letting an operator change graph data (create, edit, delete nodes and edges; edit typed attributes; save) and have those changes persist to the backing store. The mindmap (frontends/mindmap/source/documents.js) already performs real mutations (save, exportMap, undo/redo) against the real .sldb store. In apps/review-workbench the mounted page is AntoniaFlowPage over live sldb data: NodeInspector persists a document through sldbProvider.saveDoc (POST /sldb/save), but sldbProvider.saveGraph is still a no-op returning {ok:true} and AntoniaFlowPage passes onSave={() => {}}, so whole-graph edits (create/delete/connect) do not persist there. Required end state: edits round-trip to the store so a reload shows the operator's changes.
