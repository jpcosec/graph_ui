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
- runs/subagents/20261102-ws13-1-lector/review-source-2.md
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

Autoridad y versiones. Encargo: runs/subagents/20261102-ws13-1-lector/review-source.md y review-source-2.md. Nodo WS13.1 del plan de deskops, dag.yaml revisión 10. Contrato fuente WS11: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, con nota de aprobación. contratos/operaciones.md sha256 754546d60c5ec47b369c8a8b3d47124615659481403939855bb1ff76b4ce9f39 solo como límite: nada de escritura. Base: el workspace integrado de graph_ui a1b2b22; se trabaja sobre el HEAD de main en el momento del despacho, que hereda esa base. status: draft es el campo del modelo: la tarea está enrutada en el Board. Esta TaskDoc es autocontenida en objetivo, límites y criterios; las secciones citadas se leen en sus contratos.

Archivos, lista cerrada: frontends/mindmap/workspace_routes.py; frontends/mindmap/views/workspace/node/ (workspace-view.js, workspace.mjs, workspace.css y módulos nuevos ahí); tests/test_mindmap_workspace_reader.py; tests/e2e_mindmap_workspace.py. Opcionales: frontends/mindmap/sldb_adapter.py, solo añadiendo una función, si render y fuente no pueden salir de una lectura sin ella, sin alterar document_ir para otros consumidores; frontends/mindmap/serve.py, solo para despachar la ruta. Antes de editar un opcional se escribe una línea con motivo en runs/subagents/20261102-ws13-1-lector/declaracion-archivos.md.

Definiciones de este delta:
- Identidad. Modelado: Model:name. No modelado: (repo, ruta relativa al root, normalizada con /), donde repo es local, el desk del proceso (navegacion §3.2), solo sufijo .md, sin Model. Si el store rastrea el archivo, Model:name prevalece y la ruta queda como origen; un archivo no tiene dos identidades. Rastreo: doc_status(<directorio .sldb del store>, "local:" + ruta); si la consulta falla, se trata como no rastreado. La UI no infiere modelo por carpeta.
- Selección en URL. Modelado: id=Model:name, como hoy. No modelado: path=<ruta relativa>, excluyente con id; ambos o ninguno dan 400. Un path que el store rastrea responde 200 con identidad Model:name y su ruta como origen, sin redirección ni copia. Ruta: GET /api/workspace/source en WorkspaceRoutes; el catálogo sigue siendo GET /api/workspace/nodes. No se implementa ningún parámetro de alias en este delta: toda lectura es del desk del proceso.
- Guardias de toda lectura de archivo, las generales de navegacion §3.3, con el mismo criterio y los mismos nombres de estado que _inspect_file_reference: contención con resolve siguiendo symlinks (fuera_del_repo), .git e ignorado por git con fallo cerrado (protegido), inexistente (no_existe), directorio (directorio), más de 256 KB (demasiado_grande), byte nulo (binario), UTF-8 con reemplazo marcado utf-8-replaced. Sufijo distinto de .md: no_markdown. Error: JSON {ok:false, error, estado} con 404 para no_existe, 403 para fuera_del_repo y protegido, 415 para binario, directorio y no_markdown, 413 para demasiado_grande. Las guardias de referencias de TaskDoc no aplican. No inventar lista de permitidos: es de WS13.2.
- Mismo origen, navegacion §4. Mecanismo: la ruta lee los bytes una sola vez y construye render y fuente desde esos bytes, llamando al builder público build_document_ir_json(runtime_doc, markdown, template) con el texto ya leído como markdown, solo para documentos modelados, con el mismo runtime_doc y template que hoy usa document_ir; no duplica su cuerpo ni relee el archivo. Un no modelado no pasa por el builder. La respuesta lleva la revisión sha256 de esos bytes. La revisión es siempre el sha256 de los bytes. Para UTF-8 válido, el sha256 del texto devuelto coincide con la revisión; si hubo reemplazo se marca utf-8-replaced y no se promete identidad.
- Render de no modelado sin inventar modelo. Fixture: un Markdown real escrito en el store temporal, con encabezados de dos niveles y al menos un enlace. Se usa extract_sections si la prueba comprueba que títulos, niveles y spans coinciden con lo escrito en el fixture; si no, render propio sobre la misma lectura.
- Forma de la respuesta: la decide el Executor con estos campos mínimos: identidad, ruta, revisión, texto, secciones con span. El span se expresa en líneas, line_start y line_end, como el IR. Es decisión de implementación: se documenta en result-summary.md para WS13.2 y WS13.3, y no crea contrato nuevo.
- Enlaces, navegacion §5.2, solo desk propio. APIs: parse_links de sldb.links, split_anchor de sldb.links.sections, doc_status de sldb.api. Orden: parse_links, split_anchor, clasificar prefijo. local: se retira una vez. Un destino http:// o https:// es enlace externo: se muestra y no se abre ni se lee. Otro prefijo con dos puntos es nombre local literal, porque en este delta no hay alias de operador, y si no resuelve es referencia rota con origen y causa. Autorizar y contener antes de leer. doc_status(<directorio del store>, "local:" + resto), contención del path resultado, luego lectura protegida. No modelado: resolución protegida de archivo, relativa primero al directorio del documento que contiene el enlace y luego al root del repo, con las guardias generales. Un destino existente que no sea .md no se abre como documento: se informa como referencia no legible aquí, con origen y causa. recover_links, audit_links y resolve_link_target no se usan.
- Foco, navegacion §6.1: elemento dentro del documento abierto, por identidad local. Correspondencia = procedencia real ya presente en los datos: el span de la sección, el field_path, el objeto de referencia, la procedencia de la arista. Sin dato de procedencia no hay correspondencia. Dominio: sección y span de la misma fuente; campo por field_path; referencia de archivo como objeto {doc, field, position, value}, donde position es el índice 0-based en la lista original del campo, contando los elementos omitidos, conservando campo (files o references) y posición antes de que _build_code_projection concatene las dos listas; arista schema, es decir de origin schema en load_edge_index, con todas sus procedencias: metadata field, declared y, en composición, source_field, ref_path y ref_index; la deduplicación por (source, target, type, relation_doc) no descarta campos distintos: se conservan como lista. Cada representación muestra solo la correspondencia existente. Elegir un nodo vecino, una relación o una opción del catálogo navega a otro documento: no es foco.
- Rango local de Code: clic en una línea y mayúsculas más clic para extender, sobre las líneas numeradas del contenido completo del archivo de la tarjeta (campo content), estado local sin persistir. El contexto :N±5 se conserva como está.
- No se implementan: span exacto por campo; mapear líneas de un archivo externo a texto o graph; mapeo texto→código; trasladar un rango de Code al Markdown; enlaces entre desks. La referencia explícita de una tarjeta Code sí fija foco en su campo.
- Contexto: identidad, ruta y las relaciones entrantes y salientes que hoy entrega la proyección de context, calculadas desde load_edge_index con la misma regla de vecindad, más la procedencia de campo cuando exista. No modelado: identidad, ruta, revisión, y lo que falte se muestra como ausente, no se inventa.
- No modelado en el lector: /api/workspace/node no cambia y no recibe path. La vista carga /api/workspace/source y muestra Document con render y fuente. Graph y Code muestran un estado explícito: sin grafo ni referencias porque el documento no está en el store; no se inventan vínculos. Los enlaces del texto sí se siguen.
- Instancia única: alternar Document, Graph y Code no cambia id ni path en la URL, conserva la revisión y el foco, y no añade otro lector al DOM. La prueba e2e lo aserta. Un refresco del mismo documento no es una copia.
- Sin mutación en lectura, navegacion §5.4. Las rutas de este delta no llaman document_edges ni rebuild; usan load_edge_index(store, include_linked=False). open_store puede migrar: el fixture crea y deja canónico el store temporal antes del primer GET, con las mismas operaciones públicas que usan las pruebas actuales de workspace. Criterio: sha256 de todos los archivos bajo .sldb y del archivo leído, iguales antes y después de cada GET de lectura. Si no se sostiene con API pública, bloqueo concreto en result-summary.md, sin workaround de formato interno.
- Apertura sin conocer ID: catálogo actual para modelados; no modelado desde enlaces, referencias y URL. Explorador completo WS13.2, pestañas y split WS13.3.

Fuera de alcance: edición, commit, transición de workflow, rutas de mutación, shell/api.js (WS15.1), frontends/workspace/ como destino, Changes, Integrity, Agents, multidesk WS41, WS19, WS45-48, Scion, Kimun, push, puertos 8090 y 8091 y sus stores, tareas hermanas. Referencia reutilizable y límites: suplemento-8090.md.

Roles. El Executor implementa y prueba, no hace commits, no cierra ni avanza el Board, y usa servidores temporales propios en puertos libres distintos de 8090, 8091 y 8092. La demo en 127.0.0.1:8092 sobre una copia temporal la levanta el Supervisor tras el Tester. El Tester es otro agente. Bloqueo que no quepa en el alcance: se registra concreto en result-summary.md con el avance hecho. Sin preguntar al solicitante. Sin mocks ni stubs: stores y desks temporales reales. Arnés e2e: el mismo de tests/e2e_mindmap_workspace.py, con Playwright y un serve.py temporal real. Si el CDN esm.sh falla, se diagnostica y se busca dependencia local existente; no se falsea la interacción.

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

Acceptance: la del nodo WS13.1, sobre stores temporales reales. Pruebas que deben existir y pasar: fuente íntegra byte a byte de modelado y no modelado; misma revisión de render y fuente; contexto real; enlace que resuelve, roto, con ancla y destino con dos puntos sin saltar de store; referencia por campo y posición; multiplicidad de procedencias de arista; foco que sobrevive al alternar Document, Graph y Code, con la misma identidad en URL, misma revisión y un solo lector en el DOM; rango local de Code; contención, symlink que escapa, .git, gitignorado y no .md; store sin cambios tras cada GET. Tester independiente con ejecución verifica comportamiento y DOM o píxeles en navegador real sobre el host Mindmap. pytest del repo comparado con la línea base. G_HUMAN_READ y WS16 siguen pendientes.
