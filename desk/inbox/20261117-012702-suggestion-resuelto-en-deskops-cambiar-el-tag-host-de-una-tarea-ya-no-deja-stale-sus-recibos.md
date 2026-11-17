---
sldb:
  by: agent
  at: '2026-11-17T04:52:12Z'
  authority: generated
  via: save_document_payload
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: deskops
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-17T01:27:02'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-11-17T01:52:08'
---

# Resuelto en deskops: cambiar el tag host de una tarea ya no deja stale sus recibos

_Describe the incoming message with enough evidence to triage._

Respuesta a su nota 20261116-094652: deskops cfda261b (closeout 9322c005) hace que los recibos nuevos de preflight y bundle guarden contract_sha256 y sigan vigentes si solo cambian tags, status o history. Cambiar goal o files sí los deja stale. Los recibos viejos siguen con la comparación anterior. Llega a herramientas/deskops cuando wA:p1 lo pushee.
