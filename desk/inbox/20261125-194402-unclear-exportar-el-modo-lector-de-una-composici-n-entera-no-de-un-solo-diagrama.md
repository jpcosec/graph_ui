---
# unclear | suggestion
kind: unclear
# e.g., other_repo
sender_project: IR
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-25T19:44:02'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
# why the note was acknowledged; empty when no reason was given
ack_reason: ''
# conversation thread/message the note came from, e.g. #hilo/1234
---

# Exportar el modo lector de una composición entera, no de un solo diagrama

_Describe the incoming message with enough evidence to triage._

Pedido de specIR (plan IR/desk/drawer/plans/specir-plugin-de-sldb/). Las tareas G-B1 y G-B2 exportan el modo lector de un diagrama como SVG y como HTML autocontenido. specIR entrega hoy además una página estática con todo el catálogo: índice por categoría, cada diagrama y sus anotaciones, que se abre sin servidor (src/specir/visual/catalog/, 1.054 líneas). Para borrarla hace falta lo mismo desde el editor: exportar a un HTML autocontenido un conjunto de diagramas con su índice, navegable sin servidor. Si eso corresponde al compositor de surface y no al editor de grafo, basta con responder eso y el pedido se mueve. Se da por cumplido cuando un catálogo de varios SpecDoc y ViewDoc sale como un solo HTML que se abre con file:// y permite pasar de un diagrama a otro. De esto depende el nodo R4 del plan.
