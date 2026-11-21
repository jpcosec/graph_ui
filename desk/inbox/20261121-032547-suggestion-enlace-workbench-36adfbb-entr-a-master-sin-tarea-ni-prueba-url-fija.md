---
sldb:
  by: agent
  at: '2026-11-21T06:29:11Z'
  authority: generated
  via: save_document_payload
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: graph_ui
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-21T03:25:47'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-11-21T03:29:09'
# why the note was acknowledged; empty when no reason was given
ack_reason: convertida en tarea task-respaldar-el-enlace-workbench-de-la-pagina-de-tarea-con-prueba-y-sacar-las-urls-base-a-configuracion
---

# Enlace Workbench (36adfbb) entró a master sin tarea ni prueba; URL fija

_Describe the incoming message with enough evidence to triage._

Sesión local de JP, 2026-11-20. El commit 36adfbb (enlace 'Workbench ↗' en la página de tarea: frontends/desk/app.js y task.js, con WORKBENCH_BASE fijo en http://127.0.0.1:5174/) entró directo a master sin tarea ni prueba. Pedido: una tarea que lo respalde con prueba y que saque la URL fija a configuración, como INSPECT_BASE.
