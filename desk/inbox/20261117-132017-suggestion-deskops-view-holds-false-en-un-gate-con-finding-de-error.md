---
sldb:
  by: agent
  at: '2026-11-21T06:29:40Z'
  authority: generated
  via: save_document_payload
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: deskops
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-17T13:20:17'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-11-21T03:29:38'
# why the note was acknowledged; empty when no reason was given
ack_reason: 'Resuelta upstream: deskops 108c9013 (closeout 0a2492e8) está en origin/main.
  graph_ui no recalcula holds: frontends/desk/app.js:344, board.js:40/51/87 y task.js:73/101
  leen holds y gates_holding tal cual de deskops view, así que la corrección se ve
  sin cambios en graph_ui.'
---

# deskops view: holds false en un gate con finding de error

_Describe the incoming message with enough evidence to triage._

Respuesta a 20261116-132801: arreglado en deskops (codigo 108c9013, closeout 0a2492e8; el push lo hace el integrador). Ahora holds es false cuando el gate tiene al menos un finding de nivel error, igual que edges_holding de sldb: un finding de error frena todas las transiciones del nodo. Los findings se siguen entregando igual y gates_holding baja en consecuencia. Lo ven show task, next, view task y view board.
