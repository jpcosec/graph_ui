FILE:desk/tasks/task-corregir-ws13-1-lectura-sin-mutación-guardias-previas-foco-estado-y-anclas.md
---
id: task-corregir-ws13-1-lectura-sin-mutación-guardias-previas-foco-estado-y-anclas
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-1-correccion/review-source.md
- runs/subagents/20261102-ws13-1-lector/checkpoint.md
- runs/subagents/20261102-ws13-1-lector/result-summary.md
- runs/subagents/20261102-ws13-1-lector/tester-result-summary.md
- runs/subagents/workspace-documental-acceptance/ws13-1-g-ui-read.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion-aprobacion.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/views/workspace/node/
- tests/test_mindmap_workspace.py
- tests/test_mindmap_workspace_reader.py
- tests/e2e_mindmap_workspace.py
- tests/mindmap-workspace-reader.test.mjs
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/tasks/task-corregir-ws13-1-lectura-guardias-foco-anclas.md
closeout_evidence:
- tests
- commit
---

# Corregir WS13.1: lectura sin mutación, guardias previas, foco, estado y anclas

## Rationale

_Explain why this task exists or the business driver behind it._

Root no aceptó WS13.1: cinco hallazgos son obligación del delta. El closeout ca06f1b se conserva como historia. WS13.2 y WS13.3 esperan.

## Goal

_Describe the concrete result this task must produce._

Corregir los cinco hallazgos en el lector de graph_ui con pruebas reales, incluidos casos negativos, sin implementar hojas siguientes.

## Scope

_State what is in scope and what is out of scope._

Autoridad: runs/subagents/20261102-ws13-1-correccion/review-source.md. Contrato: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, completo, en particular §3.3, §5.2, §5.4, §6, §6.1 y H-14. Esta TaskDoc es autocontenida en objetivo, límites y criterios. Base: HEAD de main al despacho, que contiene bf55151.

Archivos, lista cerrada: frontends/mindmap/workspace_routes.py; frontends/mindmap/views/workspace/node/; tests/test_mindmap_workspace.py; tests/test_mindmap_workspace_reader.py; tests/e2e_mindmap_workspace.py; tests/mindmap-workspace-reader.test.mjs nuevo. frontends/mindmap/sldb_adapter.py solo añadiendo funciones de lectura, declaradas antes con motivo en runs/subagents/20261102-ws13-1-correccion/declaracion-archivos.md.

1. Lectura sin mutación. Ninguna ruta GET del lector (/api/workspace/nodes, /node, /source) llama document_edges ni rebuild. Las aristas salen de load_edge_index(store, include_linked=False). Si EdgeIndex.stale no está vacío, el store no está preparado: graph, relaciones y procedencia responden ok false con estado store_no_preparado y los documentos atrasados, sin escribir; la fuente de un documento autorizado sigue legible porque no depende del índice. La preparación es explícita y externa al request, con la operación pública rebuild_edges en el fixture. tests/test_mindmap_workspace.py::test_workspace_cycle_and_2hops_real_edges describe una conducta retirada: se corrige para preparar el store antes del GET, sin relajar nada, y se añade el caso de rechazo. Layout no canónico: no hay consulta pública previa a open_store; intake enviado a sldb. No se usa _already_canonical ni formato interno: se documenta el caso como bloqueo concreto en result-summary.md con lo que se observó.

2. Guardias antes de leer. Identidad y metadata salen de indexed_documents (sldb.api.stores.indexed_documents, solo índices: name, model, path), sin abrir fuentes. Primero contención, .git, ignorado y demás guardias de §3.3 sobre la ruta; después se leen solo fuentes autorizadas, una a una. No se llama editor_store.documents, resolve_runtime_doc ni load_runtime_documents desde las rutas del lector, porque abren todos los documentos indexados. Payload de un documento autorizado: desde sus bytes ya leídos con API pública (load_registered_model y la extracción pública del modelo; comprobar cuál existe en sldb.api). El fallback _resolve_document no lee sin guardia. Un documento indexado no autorizado aparece en el catálogo con su estado y sin título leído, nunca se abre. Si no existe API pública para extraer un documento desde bytes: bloqueo concreto, con el avance hecho, sin workaround.

3. Foco con dueño. Cada procedencia de arista lleva su documento propietario, el que declara el campo. Una arista solo resalta un campo si el propietario es el documento abierto. Entrantes de otro documento muestran su declaración pero no resaltan campos propios. Se conservan todas las procedencias reales. correspondences no cuenta correspondencias falsas.

4. Sin mezcla de documentos. Cada estado cargado (fuente, nodo, código, relaciones) queda ligado a la identidad que lo pidió, con generación. Una respuesta atrasada se descarta. Durante la carga cada panel muestra carga, no valores ausentes ni datos del documento anterior. Dos revisiones distintas no se unifican en silencio. Una sola instancia.

5. Anclas. Un enlace con ancla solo es ok si la sección existe en el destino, comprobado con extract_section sobre bytes obtenidos por lectura protegida o con el contenido ya leído si es el propio documento, para destino modelado, no modelado y propio. Si no existe: referencia rota ancla_inexistente con origen y causa, no navegable. Sin transcluir. La clasificación ocurre antes de navegar.

Fuera de alcance: shell/api.js, frontends/workspace/, mutaciones, render Markdown (tarea aparte, task-render-markdown-legible-del-lector), WS13.2, WS13.3, multidesk, API nueva de sldb, cierre de WS13.1 como aceptado, Scion, push, puertos 8090, 8091 y 8092, tareas hermanas.

Roles. Supervisor: commit, demo en 8092 sobre copia temporal. Tester: otro agente. El Executor implementa y prueba, sin commits ni Board. Sin mocks ni stubs: stores temporales reales. Observar I/O con sys.addaudithook en un serve.py real es admisible. Retrasar una respuesta GET real con page.route es admisible. Bloqueo que no quepa: concreto en result-summary.md con el avance hecho. Sin preguntar al solicitante.

## Implementation Path

_Outline the expected implementation route or affected surface._

1. Leer el bundle y la línea base. 2. Corregir lectura y guardias en rutas. 3. Corregir foco, estado y anclas. 4. Pruebas de cada caso negativo. 5. Suite pertinente y suite general al final. 6. result-summary.md y handoff.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py
- python -m pytest -q tests/e2e_mindmap_workspace.py
- node --test tests/mindmap-workspace-reader.test.mjs
- python -m pytest -q tests
- Tester independiente con ejecución deja runs/subagents/20261102-ws13-1-correccion/tester-result-summary.md

## Done When

_Name the observable condition that makes the task complete._

Acceptance: por cada punto, prueba real que falla sin la corrección. 1: hashes de store, documentos y estado git iguales antes y después de cada GET en caso canónico y caso desactualizado, con rechazo observable. 2: documento indexado protegido o symlink, solicitado y no solicitado, con observación de I/O que muestra que nunca se abrió; un 403 solo no basta. 3: entrante, saliente, vecino a dos saltos y mismo nombre de campo en documentos distintos. 4: A a B y A a no modelado con respuesta atrasada real, sin datos de A atribuidos a B. 5: ancla válida e inexistente en propio, modelado y no modelado. Tester independiente con ejecución verifica los cinco. Suite general comparada con 204 passed. WS13.1 sigue sin aceptar hasta root; G_HUMAN_READ y WS16 pendientes.

