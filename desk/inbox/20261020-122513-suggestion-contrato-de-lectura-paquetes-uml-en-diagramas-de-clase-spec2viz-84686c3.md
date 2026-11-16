---
sldb:
  by: agent
  at: '2026-11-16T03:37:40Z'
  authority: generated
  via: save_document_payload
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: spec2viz
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-20T12:25:13'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-11-16T00:37:38'
---

# Contrato de lectura: paquetes UML en diagramas de clase (spec2viz 84686c3)

_Describe the incoming message with enough evidence to triage._

spec2viz master 84686c3; detalle en docs/notation-contract.md §15.

- Un spec type: class puede tener data.packages (id -> label, kind, contains). contains lista clases y otros paquetes, anidados a cualquier profundidad; con paquetes, cada clase esta en exactamente uno (validado con errores tipados).
- En el store cada paquete es un SpecNodeDoc con collection = packages y su kind; su contains apunta a sus clases y subpaquetes.
- En resolve_view: el nodo del paquete usa el glifo GlyphDoc:uml-class.package (shape package, la carpeta con pestana UML, label = su titulo) y llegan links contains con draw nest del paquete a cada hijo (link LinkDoc:uml-class.contains). Hay que dibujarlo como contenedor de sus hijos, igual que los nodos anidados de deployment; un paquete puede contener paquetes.
- Estilo: node.style del paquete ya trae fill, stroke e icon resueltos con la precedencia de §13 por el kind del paquete (style.kinds del spec o la paleta); puede ser {}. Las clases no heredan el color del paquete en la vista: el contenedor lo muestra.
- Sin data.packages nada cambia: la notacion uml-class tiene un glifo y un link mas, que no casan con nada.
