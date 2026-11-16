---
sldb:
  by: agent
  at: '2026-11-16T03:44:59Z'
  authority: generated
  via: save_document_payload
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks:
- desk/tasks/task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento.md
- desk/tasks/task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia.md
- desk/tasks/task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com.md
- desk/tasks/task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables.md
- desk/tasks/task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot.md
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
# List of pill-xxx paths
pills: []
# List of ritual-xxx paths
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
# e.g., system:sldb, workspace:desk
tags:
- system:graph_ui
- workspace:desk
---

# Graph UI Tasks Board

## Purpose

_Explain what this board routes and why it exists._

Routes graph_ui delivery work. Phase A (tasks 001-006) resolved. Phase B built the graph_ui side of the projection grammar per desk/drawer/PROJECTION_GRAMMAR_SPEC.md and is closed. The live Antonia typed-editor arc (sldb serve + typed inspector + flow_editor bridge) is merged to master (dae5756). Cross-repo pieces (sldb store extraction, kgdb relation model, gemini lens) are delegated to their home repos via inbox, not executed here.

## Notes

_Add short operational notes about the current routed set._

DAG Knowledge Workspace UI: task-workspace-multiproyeccion integrada y cerrada. Tareas restantes en draft: task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento y task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia. Candidatos dependientes de contratos externos no cerrados (anclas CST Tree-sitter, adaptador remoto C2 y prueba integral multiagente E01) registrados en desk/drawer/tasks/.

## Task Details

_Generated from the task references above._

- Vista Changes: arbol de hashes, staleness e impacto en conocimiento [draft] - Añadir la vista/pestaña Changes en frontends/mindmap y la sección Integrity en el panel Context que consulten el estado real de verificación del store y crucen cada nodo o archivo mutado con sus dependientes a 1-2 hops en el grafo, señalando los artefactos potencialmente obsoletos (stale).
- Edicion contextual de relaciones y campos con control de concurrencia [draft] - Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.
- IR13: migrar graph_ui de spec2viz a sldb.api.notations (resolve_view, sync de specs, ViewDoc, pilotos como fixtures) [draft] - graph_ui deja de importar, instalar o invocar spec2viz: el código de producción usa `sldb.api.notations`, el store registra el ViewDoc de sldb, las pruebas sincronizan specs con `sldb notations sync --spec ... --store .sldb` sobre pilotos copiados como fixtures propios de graph_ui, y `specir retirement check` no lista nada de graph_ui.
- Vista Specs: dibujar paquetes UML de diagramas de clase como contenedores anidables [draft] - Un spec class con data.packages se ve en /specs/notation con cada paquete como contenedor con forma package (carpeta con pestaña UML y su título), con sus clases y subpaquetes adentro a cualquier profundidad, el relleno/trazo/ícono de node.style del paquete, y las mismas garantías de legibilidad que los otros diagramas (nada tapado, «Ver todo» entra en la ventana).
- Lector del workspace: render Markdown legible (citas, énfasis, código inline, enlaces estándar) con un motor real [draft] - En la pestaña de lectura del workspace (/workspace, componente RenderedDocument de frontends/mindmap/views/workspace/node/workspace-view.js) un documento Markdown se ve con citas, énfasis, negrita, código inline y enlaces estándar renderizados, conservando lo que ya funciona: los enlaces SLDB [[…]] y [pred:: [[…]]] con su resolución y estados, el foco por sección con data-line-start, y la fuente cruda (RawSource) literal e íntegra.
- Decisión de JP: ¿el workspace de graph_ui edita y ancla código (softfactory K03/K05/K12) o solo muestra el estado de los CodeAnchorDoc de sldb? [draft] - Una decisión escrita de JP, con una de tres opciones: (A) graph_ui solo muestra, en la vista inspect, los anclajes de código de un documento y su estado (intact/changed/lost) leyendo CodeAnchorDoc por la API de sldb, sin editar código; (B) además edita fragmentos de código anclados desde el workspace (K05), con escritura y reanclaje por sldb; (C) nada de código en graph_ui; el tema pasa a la UI de deskops o se descarta.
