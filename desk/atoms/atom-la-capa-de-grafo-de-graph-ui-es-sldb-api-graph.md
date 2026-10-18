---
id: atom-la-capa-de-grafo-de-graph-ui-es-sldb-api-graph
title: La capa de grafo de graph_ui es sldb.api.graph
five_wh_one_plus: where
tags:
- system:graph_ui
- system:sldb
- topic:graph
provenance: src/adapters/snapshot_adapter.py
---

# La capa de grafo de graph_ui es sldb.api.graph

## Answer

La capa de grafo tipado que graph_ui consume vive en sldb.api.graph (GraphSnapshot, KnowledgeNode, snapshot_save/snapshot_load, query_snapshot, StructuredQuery). kgdb ya no existe como proyecto: se integró a sldb en el merge 6deb222. El adaptador src/adapters/snapshot_adapter.py traduce un GraphSnapshot de sldb al contrato GraphData de la UI.
