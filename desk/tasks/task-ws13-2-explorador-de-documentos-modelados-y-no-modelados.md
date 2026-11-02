---
id: task-ws13-2-explorador-de-documentos-modelados-y-no-modelados
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-1-correccion/review-source-final.md
- runs/subagents/workspace-documental-acceptance/ws13-2-g-ui-read.md
- runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md
- runs/subagents/20261102-ws13-1-lector/suplemento-8090.md
- runs/subagents/20261102-ws13-1-correccion/result-summary.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion-aprobacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/borradores/vistas.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/views/workspace/explorer/
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- frontends/mindmap/workspace_routes.py
- tests/test_mindmap_workspace_explorer.py
- tests/test_mindmap_workspace_reader.py
- tests/e2e_mindmap_workspace.py
- tests/mindmap-workspace-explorer.test.mjs
- tests/test_mindmap_workspace.py
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/tasks/task-ws13-2-explorador-modelados-y-no-modelados.md
closeout_evidence:
- tests
- commit
---

# WS13.2: explorador de documentos modelados y no modelados

## Rationale

_Explain why this task exists or the business driver behind it._

Root aceptó técnicamente WS13.1 y seleccionó esta hoja. Abrir un Markdown no modelado exige conocer su ruta, y el catálogo cae entero si un modelo no carga.

## Goal

_Describe the concrete result this task must produce._

Entregar en el host Mindmap un explorador de documentos reales modelados y Markdown no modelado, navegable sin conocer ID, con refresco explícito, que consume el lector WS13.1 y tolera modelos que no cargan.

## Scope

_State what is in scope and what is out of scope._

Autoridad: runs/subagents/20261102-ws13-1-correccion/review-source-final.md. Nodo WS13.2 de dag.yaml revisión 10. Contrato: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, §2.2, §3.2, §3.3, §5.4, H-02, con su nota de aprobación. Aceptación técnica de WS13.1 y sus límites: runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md. Referencia reutilizable: runs/subagents/20261102-ws13-1-lector/suplemento-8090.md. La tarea está activa y enrutada; status draft es el campo del modelo. Base: HEAD de main al despacho, posterior al commit citado en el recibo.

Archivos, lista cerrada: frontends/mindmap/views/workspace/explorer/ nuevo; frontends/mindmap/views/workspace/node/workspace-view.js y workspace.css, solo para montar el explorador y el aviso de relaciones de la pestaña Grafo y del panel de contexto; frontends/mindmap/workspace_routes.py; tests/test_mindmap_workspace_explorer.py nuevo; tests/test_mindmap_workspace_reader.py, para el modelo no importable en /source; tests/test_mindmap_workspace.py, solo test_workspace_broken_doc_catalog_returns_500, que describe la conducta retirada por el punto 4: se reemplaza por la nueva, sin relajarla; tests/e2e_mindmap_workspace.py; tests/mindmap-workspace-explorer.test.mjs nuevo. Archivos de evidencia del run: libres.

1. Lista de permitidos (H-02 y navegacion §3.3). Raíz: repo_root del store que el operador configuró al arrancar. Rutas: variable de entorno WORKSPACE_EXPLORER_ROOTS leída una vez en WorkspaceRoutes.__init__, lista separada por comas de rutas relativas a esa raíz; si no está definida, desk y docs. Una entrada absoluta, con .., que sea symlink o que no resuelva dentro de la raíz se ignora y se informa en el campo roots_invalid. Una entrada válida que no exista, incluidas desk y docs por defecto, se omite sin error. El listado no recibe ningún parámetro de ruta del cliente; abrir un resultado usa path= del lector WS13.1, con sus guardias. Solo sufijo .md. Se excluye toda ruta con una parte que empiece por punto y las partes __pycache__ y node_modules. Symlinks: no se siguen directorios; un archivo symlink que resuelva fuera de la raíz se excluye. Ignorados por git: excluidos, con fallo cerrado si la comprobación falla, con una sola invocación git check-ignore --stdin -z por listado, argv fijo y sin shell. Sin repo git no hay esa protección: campo sin_git true. Tope de 5000 archivos: campo truncado true e indicador visible.

2. Listado. Ruta GET /api/workspace/explorer en WorkspaceRoutes. Modelados desde indexed_documents, todos, estén o no bajo las rutas permitidas, que solo limitan el recorrido de no modelados; cada uno lleva su estado de guardia como en /nodes. No modelados recorriendo solo las rutas permitidas, sin abrir archivos. Un archivo rastreado no se repite como no modelado: Model:name prevalece (§2.2). Sin caché: cada llamada recalcula. No migra, no reconstruye, no inicializa desk ni store, sin índices nuevos. Un store inexistente da su error, sin crearlo.

3. Explorador. Módulo en views/workspace/explorer/: árbol por carpetas para no modelados, y modelados por modelo, con filtro local. Abrir navega con id o path al lector WS13.1 existente, sin lector paralelo. Botón explícito de refresco que recarga /nodes y /explorer. El selector de documentos actual de workspace-view.js se conserva. Sin pestañas ni split: WS13.3.

4. Catálogo degradado. El modelo de un documento autorizado, es decir que pasa las guardias, puede no cargar. Eso no derriba /nodes ni el explorador: la entrada conserva identidad y ruta, con estado modelo_no_carga y la causa recibida como texto de la excepción. Cubre un fallo en load_registered_model o en extract_model_data, sin distinguirlos ni inventar otra causa (navegacion §7.5, E7). El resto sigue navegable. /source de ese documento devuelve la fuente segura con esa causa y render sobre extract_sections; /node responde 200 con is_degraded y degraded_reason, como su forma actual, no 500. No se simula payload ni modelo, y no se tocan módulos de modelos.

5. Relaciones indexadas. En la pestaña Grafo y en las relaciones del panel de contexto del lector, no en el explorador, un aviso visible dice que salen del índice preparado y no certifican cambios externos, y que si el operador sabe que cambió un documento o contrato tras preparar hay que prepararlas de nuevo fuera de la UI, con la operación pública, antes de considerarlas vigentes. No se muestra «todo al día» por stale vacío, no se reconstruye por GET y no se añade mecanismo de frescura. La fuente sigue segura.

Fuera de alcance: shell/api.js, frontends/workspace/, mutaciones, render Markdown, WS13.3, multidesk, API nueva de sldb, Changes, Integrity, Scion, push, puertos 8090 y 8091, tareas hermanas, cambios de contrato. El Executor tampoco usa 8092, que es la demo del Supervisor.

Decisiones de implementación que se documentan en result-summary.md: forma JSON de /explorer, orden y presentación del árbol. Bloqueo que no quepa o requiera contrato o API nueva: concreto en result-summary.md con el avance hecho, sin workaround.

Roles. Supervisor: commit, demo en 8092 sobre copia temporal. Tester: otro agente. El Executor implementa y prueba, sin commits ni Board. Sin mocks ni stubs: stores y repos temporales reales, con preparación fuera del request.

## Implementation Path

_Outline the expected implementation route or affected surface._

1. Leer el bundle. 2. Ruta y permitidos. 3. Catálogo degradado. 4. Explorador y avisos. 5. Pruebas. 6. Suite pertinente y general. 7. result-summary.md y handoff.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py
- python -m pytest -q tests/e2e_mindmap_workspace.py
- node --test tests/mindmap-workspace-explorer.test.mjs
- python -m pytest -q tests
- Tester independiente con ejecución deja runs/subagents/20261102-ws13-2-explorador/tester-result-summary.md

## Done When

_Name the observable condition that makes the task complete._

Acceptance: la del nodo WS13.2 sobre stores temporales reales. Pruebas: abrir modelado y no modelado desde el explorador sin conocer ID; alta de un modelado y de un .md aparecen tras refrescar, sin reiniciar; archivo rastreado sin duplicar; permitidos con entrada inválida; symlink de archivo y de directorio; ignorado; punto; sin repo git; truncado; hashes de .sldb, documentos, git status y HEAD iguales antes y después de cada GET; modelo realmente no importable junto a uno sano, sin caer el catálogo, con fuente legible y causa; aviso de relaciones visible y sin afirmación de frescura; ninguna petición que no sea GET. Deben fallar contra la base: /nodes y /source con modelo no importable, y /explorer. Tester independiente con navegador real. Suite general con 218 previas pasando. G_HUMAN_READ y WS16 pendientes.
