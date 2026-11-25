---
sldb:
  by: agent
  at: '2026-11-25T14:11:30Z'
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
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
- desk/tasks/task-respaldar-el-enlace-workbench-de-la-pagina-de-tarea-con-prueba-y-sacar-las-urls-base-a-configuracion.md
- desk/tasks/task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con.md
- desk/tasks/task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c.md
- desk/tasks/task-el-panel-embebido-lleva-el-tema-y-el-localstorage-con-alcance-a-su-contenedor.md
- desk/tasks/task-las-demas-vistas-de-mindmap-tambien-se-montan-embebidas-con-mount.md
- desk/tasks/task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion.md
- desk/tasks/task-graph-ui-exporta-un-html-autocontenido-del-modo-lector-que-se-abre-sin-servidor.md
# List of pill-xxx paths
pills: []
# List of ritual-xxx paths
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
# e.g., system:sldb
tags:
- system:graph_ui
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

- Vista Changes: arbol de hashes, staleness e impacto en conocimiento [draft] - Añadir en /workspace la pestaña Changes y la sección Integrity del panel Context: listan los documentos que sldb reporta como cambiados o stale y los anclajes de código que no están intact, y para cada uno los documentos que dependen de él a 1-2 saltos en el índice de relaciones, marcados como potencialmente obsoletos. Todo de solo lectura.
- Edicion contextual de relaciones y campos con control de concurrencia [draft] - En el workspace de Mindmap (/workspace/node, puerto 8088; no el visor standalone de solo lectura de frontends/workspace en el 8090) se puede editar un campo de un documento desde 'Campos del Documento (IR)' de la proyección Documento y agregar o quitar una relación válida según el modelo desde el panel 'Contexto y Relaciones'. Cada escritura lleva la revisión del documento (su source_hash) y el servidor la rechaza con 409 si el documento cambió desde que se leyó, sin perder lo que el usuario escribió.
- Decisión de JP: ¿el workspace de graph_ui edita y ancla código (softfactory K03/K05/K12) o solo muestra el estado de los CodeAnchorDoc de sldb? [draft] - Una decisión escrita de JP, con una de tres opciones: (A) graph_ui solo muestra, en la vista inspect, los anclajes de código de un documento y su estado (intact/changed/lost) leyendo CodeAnchorDoc por la API de sldb, sin editar código; (B) además edita fragmentos de código anclados desde el workspace (K05), con escritura y reanclaje por sldb; (C) nada de código en graph_ui; el tema pasa a la UI de deskops o se descarta.
- Respaldar el enlace Workbench de la página de tarea con prueba y sacar las URLs base a configuración [draft] - Que la base del enlace Workbench (y la de Inspeccionar) se lea de configuración del servidor del desk en vez de constantes fijas en app.js, con valores por defecto iguales a los actuales, y que una prueba cubra el href del enlace Workbench de la página de tarea.
- Las vistas de mindmap reciben request y la URL base del servidor en vez de importar shell/api.js con rutas absolutas [draft] - Que toda vista de frontends/mindmap/views reciba request (y la base URL) por su contexto/props, igual que SourceProvider ya recibe request inyectado (app.js, source/source.js), y que ninguna ruta del cliente sea absoluta a la raiz.
- La vista de notacion de graph_ui se monta en cualquier pagina con mount(contenedor, opciones) sin el cascaron [draft] - Un modulo frontends/mindmap/embed/notation.js que exporte mount(container, {baseUrl, spec, view, theme}) y unmount, que monte la vista de notacion con su SourceProvider y request(baseUrl) sin shell, y una pagina de ejemplo ajena (tests/fixtures/embed/host.html) que lo usa con una llamada.
- El panel embebido lleva el tema y el localStorage con alcance a su contenedor [draft] - Que el tema se aplique en el contenedor (data-skin en el contenedor, css con alcance) y que las claves de almacenamiento lleven un prefijo por instancia (opcion storageKey de mount, default el de hoy en graph_ui).
- Las demas vistas de mindmap tambien se montan embebidas con mount(...) [draft] - Que frontends/mindmap/embed exponga mount para cada vista registrada (o mount(container, {view: <id>, ...}) generico), con request, base, tema y storage como la de notacion.
- De un spec del store sale un SVG del modo lector con el mismo layout que la vista de notacion [draft] - Un modulo puro frontends/mindmap/views/specs/notation/notation-svg.mjs con exportSvg(view, opts) -> string SVG, a partir del mismo payload de GET /api/notation/view, y una prueba que compare posiciones con la vista interactiva.
- graph_ui exporta un HTML autocontenido del modo lector que se abre sin servidor [draft] - Un HTML autocontenido (SVG inline, css inline, sin fetch ni importmap) con zoom/arrastre basico y titulo, generado desde un spec del store por una ruta GET /api/notation/export?spec=..&format=svg|html y un boton de exportar en la vista de notacion.
