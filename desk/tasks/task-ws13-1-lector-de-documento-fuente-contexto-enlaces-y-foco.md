---
id: task-ws13-1-lector-de-documento-fuente-contexto-enlaces-y-foco
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-1-lector/review-source.md
- runs/subagents/20261102-ws13-1-lector/suplemento-8090.md
- runs/subagents/workspace-documental-acceptance/ws13-1-g-ui-read.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion-aprobacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/operaciones.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/operaciones-aprobacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/dag.yaml
- ../../deskops/desk/drawer/plans/workspace-documental/borradores/vistas.md
- ../../deskops/desk/drawer/plans/workspace-documental/borradores/user-flows.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/views/workspace/node/
- tests/test_mindmap_workspace_reader.py
- tests/e2e_mindmap_workspace.py
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
from_drawer: desk/drawer/tasks/task-ws13-1-lector-documento-contexto-enlaces-foco.md
closeout_evidence:
- tests
- commit
---

# WS13.1: lector de documento, fuente, contexto, enlaces y foco

## Rationale

_Explain why this task exists or the business driver behind it._

El usuario pidió implementar aprovechando lo reutilizable de 8090. El workspace de Mindmap no entrega fuente propia, no lee Markdown no modelado, no sigue enlaces y no tiene foco interno.

## Goal

_Describe the concrete result this task must produce._

Entregar en el host Mindmap un lector de solo lectura con render y fuente cruda íntegra del mismo origen para Markdown modelado y no modelado, contexto real, seguimiento de enlaces y foco compartido donde WS11 defina correspondencia.

## Scope

_State what is in scope and what is out of scope._

Autoridad y versiones. Encargo: runs/subagents/20261102-ws13-1-lector/review-source.md y review-source-2.md. Nodo WS13.1 del plan de deskops, dag.yaml revisión 10. Contrato fuente WS11: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, con nota de aprobación. contratos/operaciones.md sha256 754546d60c5ec47b369c8a8b3d47124615659481403939855bb1ff76b4ce9f39 solo como límite: nada de escritura. Base de código: graph_ui a1b2b22, HEAD del despacho en esta TaskDoc. Esta TaskDoc es autocontenida en objetivo, límites y criterios; las secciones citadas se leen en sus contratos.

Archivos, lista cerrada: frontends/mindmap/workspace_routes.py; frontends/mindmap/views/workspace/node/ (workspace-view.js, workspace.mjs, workspace.css y módulos nuevos ahí); tests/test_mindmap_workspace_reader.py; tests/e2e_mindmap_workspace.py. Opcionales: frontends/mindmap/sldb_adapter.py, solo añadiendo una función, si render y fuente no pueden salir de una lectura sin ella, sin alterar document_ir para otros consumidores; frontends/mindmap/serve.py, solo para despachar la ruta. Antes de editar un opcional se escribe una línea con motivo en runs/subagents/20261102-ws13-1-lector/declaracion-archivos.md.

Definiciones de este delta:
- Identidad. Modelado: Model:name. No modelado: (repo, ruta relativa al root, normalizada con /), solo sufijo .md, sin Model. Si el store rastrea el archivo, Model:name prevalece y la ruta queda como origen; un archivo no tiene dos identidades. Rastreo: doc_status(<directorio del store>, "local:" + ruta); si la consulta falla, se trata como no rastreado. La UI no infiere modelo por carpeta.
- Selección en URL. Modelado: id=Model:name, como hoy. No modelado: path=<ruta relativa>, excluyente con id; ambos o ninguno dan 400. Sin parámetro de alias: el desk del proceso viaja como ausencia.
- Guardias de toda lectura de archivo, las generales de navegacion §3.3: contención con resolve siguiendo symlinks, .git, ignorado por git con fallo cerrado, directorio, 256 KB, binario, codificación. Las guardias de referencias de TaskDoc no aplican. No inventar lista de permitidos: es de WS13.2.
- Mismo origen, navegacion §4. Render y fuente salen de una sola lectura de bytes, o la respuesta lleva la revisión sha256 de los bytes de los que salieron ambos. La fuente se devuelve íntegra y su sha256 coincide con la revisión.
- Render de no modelado sin inventar modelo. Se usa extract_sections o el builder solo si una prueba sobre un Markdown no modelado real del fixture muestra secciones correctas; si no, render propio sobre la misma lectura.
- Forma de la respuesta: la decide el Executor con estos campos mínimos: identidad, ruta, revisión, texto, secciones con span. Es decisión de implementación, no contrato nuevo.
- Enlaces, navegacion §5.2, solo desk propio: parse_links, split_anchor, clasificar prefijo. local: se retira una vez. Un prefijo que no sea local: es nombre local literal, porque en este delta no hay alias de operador, y si no resuelve es referencia rota con origen y causa. Autorizar y contener antes de leer. doc_status(<directorio del store>, "local:" + resto), contención del path resultado, luego lectura protegida. No modelado: resolución protegida de archivo. recover_links, audit_links y resolve_link_target no se usan.
- Foco, navegacion §6.1: elemento dentro del documento abierto, por identidad local. Dominio: sección y span de la misma fuente; campo por field_path; referencia de archivo como objeto {doc, field, position, value}, preservando field y posición antes de concatenar (H-03); arista schema con todas sus procedencias, sin colapsar campos distintos (H-03b). Cada representación muestra solo la correspondencia existente. C1 a C3 navegan, no son foco.
- Rango local de Code, C14a: clic en una línea y mayúsculas más clic para extender, estado local sin persistir. :N±5 sigue siendo contexto.
- No se implementan: C7, C11b, C12, C14b, enlaces entre desks.
- Contexto: identidad, ruta y relaciones de context y graph actuales, más la procedencia de campo cuando exista. No modelado: identidad, ruta, revisión, y lo que falte se muestra como ausente, no se inventa.
- Sin mutación en lectura, navegacion §5.4 y H-14. Las rutas de este delta no llaman document_edges ni rebuild; usan load_edge_index(store, include_linked=False). open_store puede migrar: el fixture prepara el store fuera del request. Criterio: sha256 de todos los archivos bajo .sldb y del archivo leído, iguales antes y después de cada GET de lectura. Si no se sostiene con API pública, bloqueo H-14 en result-summary.md, sin workaround de formato interno.
- Apertura sin conocer ID: catálogo actual para modelados; no modelado desde enlaces, referencias y URL. Explorador completo WS13.2, pestañas y split WS13.3.

Fuera de alcance: edición, commit, transición de workflow, rutas de mutación, shell/api.js (WS15.1), frontends/workspace/ como destino, Changes, Integrity, Agents, multidesk WS41, WS19, WS45-48, Scion, Kimun, push, puertos 8090 y 8091 y sus stores, tareas hermanas. Referencia reutilizable y límites: suplemento-8090.md.

Roles. El Executor implementa y prueba, no hace commits, no cierra ni avanza el Board. Bloqueo que no quepa en el alcance: se registra concreto en result-summary.md con el avance hecho. Sin preguntar al solicitante. Sin mocks ni stubs: stores y desks temporales reales.

## Implementation Path

_Outline the expected implementation route or affected surface._

1. Recuperar estado y leer el bundle. 2. Línea base de pruebas. 3. Implementar ruta de lectura y foco. 4. Implementar UI en views/workspace/node. 5. Pruebas con store y desk temporales reales. 6. result-summary.md, validation.log, handoff al Tester.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/test_mindmap_workspace_reader.py
- python -m pytest -q tests/test_mindmap_workspace.py tests/test_parallel_workspace_serve.py
- python tests/e2e_mindmap_workspace.py
- Tester independiente con ejecución deja runs/subagents/20261102-ws13-1-lector/tester-result-summary.md

## Done When

_Name the observable condition that makes the task complete._

Acceptance: la del nodo WS13.1, sobre stores temporales reales. Pruebas que deben existir y pasar: fuente íntegra byte a byte de modelado y no modelado; misma revisión de render y fuente; contexto real; enlace que resuelve, roto, con ancla y destino con dos puntos sin saltar de store; referencia por campo y posición; multiplicidad de procedencias de arista; foco que sobrevive al alternar Document, Graph y Code sin abrir copia; rango local de Code; contención, symlink que escapa, .git, gitignorado y no .md; store sin cambios tras cada GET. Tester independiente con ejecución verifica comportamiento y DOM o píxeles en navegador real sobre el host Mindmap. pytest del repo comparado con la línea base. G_HUMAN_READ y WS16 siguen pendientes.
