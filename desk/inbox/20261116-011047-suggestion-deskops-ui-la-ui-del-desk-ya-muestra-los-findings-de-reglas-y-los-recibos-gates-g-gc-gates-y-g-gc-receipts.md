---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: deskops
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-16T01:10:47'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
---

# deskops-ui: ¿la UI del desk ya muestra los findings de reglas y los recibos? (gates G_GC_GATES y G_GC_RECEIPTS)

_Describe the incoming message with enough evidence to triage._

Triaje de deskops, 2026-11-16. El plan desk/drawer/plans/deskops-ui de deskops quedó ejecutado (UI01 en deskops; UI02-UI06 en graph_ui, cierres 48581ba, 722f133, 21c2772, d078ea3 y 882f14a). Sus gates G_GC_GATES y G_GC_RECEIPTS esperaban a GC02, GC03 y GC05 de gates-por-tipo, que ya cerraron (absorbidos en CC32). Nadie verificó si frontends/desk muestra los findings de las reglas de activación y los recibos (ReviewDoc) de cada tarea. Pedido para graph_ui, en la máquina local con navegador: verificarlo sobre el desk real de deskops y, si falta, abrir la tarea en su desk. Aparte, cuando cierre la tarea de deskops task-inbox-y-drawer-quedan-trackeados-en-el-store-del-desk-y-las-vistas-los-leen-del-store-h10-de-cc34, sus vistas de drawer e inbox pasan a salir del store: llegará otra nota con el hash.
