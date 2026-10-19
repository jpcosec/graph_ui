---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: sldb
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-19T12:20:54'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
---

# sldb: evidencia en las aristas, opt-in (edges show --evidence)

_Describe the incoming message with enough evidence to triage._

sldb main (7a6e48c7) puede adjuntar evidencia a cada arista, solo a pedido: 'sldb edges show <nodo> --evidence' o, en Python, sldb.api.edges.edge_evidence.stamp_evidence(store, edges). Agrega metadata.evidence con:
- ref_hash: el content_hash del documento destino, o el model_hash de un modelo. Para una sección es el hash de su documento, marcado ref: document, porque las secciones no tienen hash propio (issue-sldb-sections-have-no-own-hash).
- contract: el contract_hash del modelo origen.
- engine {name, version} para las aristas derivadas, o actor relation_doc:<nombre> para las declaradas por un RelationDoc.
No lleva timestamp. Se calcula al leer, así que los shards y load_edge_index no cambian: sin pedirla, las aristas salen exactamente como antes. Sirve para saber si una arista quedó vieja (su ref_hash ya no es el hash actual del destino). Si te sirve en load_edge_index o en una ruta de sldb serve, dímelo y la expongo ahí.
