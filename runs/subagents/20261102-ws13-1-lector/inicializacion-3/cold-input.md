FILE:desk/tasks/task-ws13-1-lector-de-documento-fuente-contexto-enlaces-y-foco.md
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
- Selección en URL. Modelado: id=Model:name, como hoy. No modelado: path=<ruta relativa>, excluyente con id; ambos o ninguno dan 400. No se implementa ningún parámetro de alias en este delta: toda lectura es del desk del proceso.
- Guardias de toda lectura de archivo, las generales de navegacion §3.3: contención con resolve siguiendo symlinks, .git, ignorado por git con fallo cerrado, directorio, 256 KB, binario, codificación. Las guardias de referencias de TaskDoc no aplican. No inventar lista de permitidos: es de WS13.2.
- Mismo origen, navegacion §4. Mecanismo: la ruta lee los bytes una sola vez y construye render y fuente desde esos bytes, llamando al builder público build_document_ir_json con el texto ya leído; no duplica el cuerpo de document_ir ni relee el archivo. La respuesta lleva la revisión sha256 de esos bytes. La fuente se devuelve íntegra y su sha256 coincide con la revisión.
- Render de no modelado sin inventar modelo. Fixture: un Markdown real escrito en el store temporal, con encabezados de dos niveles y al menos un enlace. Se usa extract_sections si la prueba comprueba que títulos, niveles y spans coinciden con lo escrito en el fixture; si no, render propio sobre la misma lectura.
- Forma de la respuesta: la decide el Executor con estos campos mínimos: identidad, ruta, revisión, texto, secciones con span. El span se expresa en líneas, line_start y line_end, como el IR. Es decisión de implementación: se documenta en result-summary.md para WS13.2 y WS13.3, y no crea contrato nuevo.
- Enlaces, navegacion §5.2, solo desk propio. APIs: parse_links de sldb.links, split_anchor de sldb.links.sections, doc_status de sldb.api. Orden: parse_links, split_anchor, clasificar prefijo. local: se retira una vez. Un prefijo que no sea local: es nombre local literal, porque en este delta no hay alias de operador, y si no resuelve es referencia rota con origen y causa. Autorizar y contener antes de leer. doc_status(<directorio del store>, "local:" + resto), contención del path resultado, luego lectura protegida. No modelado: resolución protegida de archivo. recover_links, audit_links y resolve_link_target no se usan.
- Foco, navegacion §6.1: elemento dentro del documento abierto, por identidad local. Correspondencia = procedencia real ya presente en los datos: el span de la sección, el field_path, el objeto de referencia, la procedencia de la arista. Sin dato de procedencia no hay correspondencia. Dominio: sección y span de la misma fuente; campo por field_path; referencia de archivo como objeto {doc, field, position, value}, preservando field y posición antes de concatenar ; arista schema con todas sus procedencias, sin colapsar campos distintos . Cada representación muestra solo la correspondencia existente. Elegir un nodo vecino, una relación o una opción del catálogo navega a otro documento: no es foco.
- Rango local de Code: clic en una línea y mayúsculas más clic para extender, estado local sin persistir. :N±5 sigue siendo contexto.
- No se implementan: span exacto por campo; mapear líneas de un archivo externo a texto o graph; mapeo texto→código; trasladar un rango de Code al Markdown; enlaces entre desks. La referencia explícita de una tarjeta Code sí fija foco en su campo.
- Contexto: identidad, ruta y relaciones de context y graph actuales, más la procedencia de campo cuando exista. No modelado: identidad, ruta, revisión, y lo que falte se muestra como ausente, no se inventa.
- Instancia única: alternar Document, Graph y Code no cambia id ni path en la URL, conserva la revisión y el foco, y no añade otro lector al DOM. La prueba e2e lo aserta. Un refresco del mismo documento no es una copia.
- Sin mutación en lectura, navegacion §5.4. Las rutas de este delta no llaman document_edges ni rebuild; usan load_edge_index(store, include_linked=False). open_store puede migrar: el fixture prepara el store fuera del request. Criterio: sha256 de todos los archivos bajo .sldb y del archivo leído, iguales antes y después de cada GET de lectura. Si no se sostiene con API pública, bloqueo concreto en result-summary.md, sin workaround de formato interno.
- Apertura sin conocer ID: catálogo actual para modelados; no modelado desde enlaces, referencias y URL. Explorador completo WS13.2, pestañas y split WS13.3.

Fuera de alcance: edición, commit, transición de workflow, rutas de mutación, shell/api.js (WS15.1), frontends/workspace/ como destino, Changes, Integrity, Agents, multidesk WS41, WS19, WS45-48, Scion, Kimun, push, puertos 8090 y 8091 y sus stores, tareas hermanas. Referencia reutilizable y límites: suplemento-8090.md.

Roles. El Executor implementa y prueba, no hace commits, no cierra ni avanza el Board, y usa servidores temporales propios en puertos libres distintos de 8090, 8091 y 8092. La demo en 127.0.0.1:8092 sobre una copia temporal la levanta el Supervisor tras el Tester. El Tester es otro agente. Bloqueo que no quepa en el alcance: se registra concreto en result-summary.md con el avance hecho. Sin preguntar al solicitante. Sin mocks ni stubs: stores y desks temporales reales.

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

FILE:runs/subagents/20261102-ws13-1-lector/review-source.md
# Encargo WS13.1, texto recibido

Fuente: mensaje de Codex `w3Y:p2`, root por delegación, en el pane Claude `w3Y:p1`, 2026-11-02. Cita una instrucción literal del usuario. Texto copiado sin normalizar.

NUEVA AUTORIZACIÓN DEL USUARIO, 2026-11-02: «Mira, en http://127.0.0.1:8090/ hicieron algo parecido. Creo que quizas hay cosas que se pueden aprovechar de ahi. Revisa eso y luego manda al implementaador a implementar». Root ya revisó la app viva y su fuente. Te encargo coordinar implementación efectiva, no otra ronda de planificación general. Empezar con una sola hoja WS13.1 (lector, origen, enlaces y foco); después se revisará el checkpoint técnico para continuar sus dependientes. No necesitas volver a pedir autorización humana para preparar/promover/ejecutar esta hoja dentro de su contrato. Lo anterior que prohibía toda UI queda reemplazado por esta autorización concreta; los gates de escrituras/Scion y aceptación de uso humano NO se dan por cumplidos.

REVISIÓN ROOT DE 8090 (lectura de código + navegador real, no tests de producto):
- Proceso python PID3090420, cwd /home/jp/proyectos/SLDB_1/UIs/graph_ui, comando python frontends/workspace/serve.py 8090. Sirve frontends/workspace/{index.html,styles.css,app.js,serve.py}; título KIMUN — Knowledge Workspace. Esto es la UI alternativa, no un mandato de migrar a Kimun. Mantener base Mindmap + SLDB/pron + Deskops y documentos Markdown como fuente/vistas como proyecciones.
- Cambio de evidencia importante frente a la auditoría histórica: frontends/workspace/ YA está versionado en commit graph_ui 20e5797 (HEAD), junto con tests/test_parallel_workspace_serve.py. Verifiqué git ls-files. El plan lo excluía cuando estaba sin commit/autor; ese motivo histórico no describe este snapshot. Registrar suplemento de reutilización de esta revisión y procedencia exacta en TaskDoc/run, sin reescribir auditorías históricas ni meter todo el prototipo en la base por reflejo.
- Backend real: GET /api/workspace/overview y /nodes devuelven store /home/jp/proyectos/SLDB_1/UIs/graph_ui/.sldb (4577 nodos/7820edges en mi lectura), Board real, workers, index.jsonl de runs y git. GET /api/workspace/node da projections documento/grafo/código/changes/contexto. No inferir que datos reales significan contrato WS11 cumplido.
- Reutilizables: catálogo por modelos y filtro/búsqueda global; navegación catálogo→documento; marco de lector con pestañas Documento/Grafo/Código; contexto lateral con identidad, ruta/hashes y relaciones; extracción sections_prose para prosa humana. Reutilizar/adaptar lo que encaje en el host Mindmap existente (base a1b2b22 y WorkspaceRoutes), no construir tercer workspace/servidor ni copiar sin revisar APIs/seguridad.
- Límites observados: _build_changes_projection solo cruza git status y vecinos 1–2saltos, no compara una línea base de staleness; no llamarlo prueba Merkle ni obsolescencia comprobada. renderAgentsSurface consume label/name/id/space/command pero la API observada devuelve pane/kind/cwd/title etc.: vi Agents con contador pero tarjetas sin identificación visible. Varias etiquetas/valores inline aparecen vacíos en la UI observada, incluidas referencias en prosa/contexto/código; no copiar renderer sin verificar con DOM/screenshot. No diagnosticado más allá de observación. UI ejecutó navegación Overview/Tasks/Agents/Runs/History y tabsGraph/Code/Changes sin pageerror; eso NO es aceptación end-to-end ni garantiza ausencia de escrituras transitivas. No arreglar Agents/Changes en WS13.1: son límites para no adoptar sus afirmaciones.
- Capturas locales root: /tmp/deskops-8090-overview.png y /tmp/deskops-8090-changes.png; HTML/JS descargados en /tmp/deskops-8090-index.html y /tmp/deskops-8090-app.js. Son evidencia auxiliar efímera: conserva evidencia durable pertinente en tu run.

ENCARGO IMPLEMENTABLE WS13.1:
1. Recupera estado/skills/Board de graph_ui y deskops. graph_ui HEAD20e5797, dirty solo tres inbox ajenas; deskops tiene cuatro rutas ajenas conocidas. No limpiar ni commitear ajenas. En graph_ui Board ya están task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento y task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia, ambas draft con scopes amplios de workspace/serve. Resolver titularidad/no solapamiento con esas tareas ANTES de tocar archivos; no ejecutarlas ni cerrarlas ni duplicarlas. Usa checkout/worktree aislado si es necesario, conserva padres/config pública y recuerda revalidar integración. No alterar servicio8090 ni sus datos.
2. Preparar una TaskDoc propia y precisa de delta WS13.1 en repo receptor graph_ui (drawer commit, autorización/promoción commit antes del Executor). Registrar en recibo G_UI_READ de ESTE delta la instrucción humana literal de arriba, actor P01 solicitante ya designado, fecha, scopeWS13.1 técnico delimitado por root, efecto preparar/promover/implementar y commit/blob/tarea/no solapamiento. No presentarlo como firma o prueba funcional de humano, ni como recepción de los otros deltas. G_HUMAN_READ y WS16 siguen pendientes de recorrido real. Si hace falta registrar enlace de recepción en deskops, hacerlo mediante su tarea administrativa acotada; no usar execution_authorized=true global para abrir todo el DAG.
3. Bundle frío suficiente, sin chat invisible: TaskDoc, pills/átomos/rituales de lectura/execution/testing/closeout pertinentes, WS13.1 completo y dependencias WS11, contratos/navegacion.md SHA6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e y nota de aprobación, operaciones.md SHA754546d60c5ec47b369c8a8b3d47124615659481403939855bb1ff76b4ce9f39, vistas.md y userflows según corresponda, código exacto vigente a1b2b22/20e5797 y suplemento de8090. Canonicaldag rev10 conserva revisión; nuevos preflightTaskDoc-only y cold-bundle son específicos de ejecución actual. DeepSeek Flash barato aislado no ejecutor, sin historial/tools/contexto automático; leer outputs COMPLETOS y resolver ambigüedades en el brief, no aceptar FUTURO que transfiera responsabilidades erróneas. No reabrir76reviews por cambiar un run local; medir si de verdad se cambia fuente canónica.
4. Tras inicialización y tarea activa, despachar UN Executor fresco y acotado mediante skill subagent-execution, con snapshot board/task/next/graph/git y logs. Tu sesión Claude es Supervisor, no Executor de producto. Implementar realmente el delta WS13.1 bajo frontends/mindmap/views/workspace/, rutas de lectura autorizadas WS11 y tests. frontends/workspace/ es fuente de referencia reutilizable, no destino de otro producto; declarar archivos exactos del delta antes de editar. No tocar shell/api.js reservado a WS15.1 sin declarar conflicto técnico. Respetar host, selección documento/nodo y registro de vistas existente.
5. Resultado WS13.1 conforme al plan: documento modelado y Markdown NO modelado con render legible Y fuente cruda íntegra de solo lectura, ambos mismo origen; contexto con identidad/ruta/relaciones reales; seguir enlaces y alternar representaciones soportadas Document/Graph/Code conserva origen y foco dentro de la misma instancia documental, sin inventar texto→código ni abrir copia por pestaña. No exigir conocer ID a mano. Reutilizar mapeos reales del contrato WS11. No implementar aquí el explorador completo WS13.2 ni tabs/split completos WS13.3; proveer forma de abrir el documento por los contratos públicos actuales y origen, con sus enlaces, y capturar transferencia explícita al explorador posterior. No modelos/API genéricos inventados; no edición, commit ni transición workflow desde HTTP; no habilitar rutas de mutación ya existentes fuera de sus gates. No hacer que GET modifique datos para rellenar la demo. Contratos WS11 reconocen efectos transitorios/legacy de lectura: usar su ruta de preparación/capacidad, sin fingir ausencia de migraciones comprobada por un docstring.
6. Pruebas reales apropiadas con stores/desks temporales, según AGENTS y contrato: lectura/render/fuente idéntica para Markdown sin modelo, referencia modelada/no modelada, navegación y foco, modelos/degradación/errores dentro alcance, contención de rutas/aliases/symlinks y rechazo a .gitignore/secretos según WS11, sin alterar desks reales. Tester independiente con ejecución disponible debe verificar comportamiento y píxeles/DOM con navegador. Nunca convertir Tester read-only en PASS runtime. No mocks/fakes como sustituto del backend; reutilizar fixture temporal real. Suite pytest requerida en repo receptor + comandos/E2E pertinentes; si hay fallo previo, reproducir/comparar y declarar sin limpiarlo ni hacerlo pasar con stubs. CDN ausente: diagnosticar y buscar dependencia local existente; no falsear interacción ni asumir que screenshot del8090 prueba el host Mindmap.
7. Handoff Executor→Tester, corrección si falla, closeout por gate y commit atómico de la hoja solo después de evidencia real. Registrar delta y tests sin marcar tareas hermanas completadas. Preparar demo accesible en localhost mediante puerto libre separado (p.ej8091 si libre), leyendo una copia/store temporal consistente; conservar8090 intacto. Entregar URL exacta, commit, archivos, test results, capturas y límites. No push/despliegue externo.

AUTONOMÍA Y PARADA: autorizado a realizar todo el trabajo de preparación+ejecución+testing de WS13.1 y su cierre al pasar rituales, no solo proponerlo. Si el Executor encuentra que una condición precisa no cabe en scope o requiere otro productor, debe registrar el bloqueo concreto con avance hecho; no inventar comportamiento ni saltar WS11, y no preguntar de nuevo por permiso ya concedido. Tras checkpoint WS13.1 root revisará y seguirá las hojas próximas por el DAG. Nada de Scion, escrituras de contenido, WS19/45/46/47/48 ni migración Kimun en este encargo. No declarar UI completa por tener shell bonito. Confirma arranque y run/tarea activa cuando los tengas, y avanza.

FILE:runs/subagents/20261102-ws13-1-lector/review-source-2.md
# Regularización de inicialización WS13.1, texto recibido

Fuente: mensaje de Codex `w3Y:p2`, root por delegación, 2026-11-02. Texto copiado sin normalizar.

Revisión root del arranque WS13.1: tarea/recibo y alcance recibidos; G_UI_READ autoriza este delta, no resultado ni WS16. Hay un defecto concreto de inicialización que debes regularizar AHORA, sin ampliar scope ni esperar permiso humano:

Leí completos preflight.md, cold.md y preflight-disposition.md. Preflight declara siete ambigüedades y cold seis. La disposición fija formato referencia, URL path, criterio lectura única, rango Code, verificación render y snapshot store, y dice prevalecer sobre TaskDoc. Pero no hay revisión fresca de esos inputs corregidos antes de despachar. Ritual execution y deskops-task-lifecycle requieren resolver hallazgos en brief escrito Y repetir en proceso nuevo antes del Executor; una respuesta del Supervisor no es por sí sola comprensión barata del input corregido.

Coordina con tu Executor una PAUSA en un punto seguro antes de nuevas ediciones de producto. No borrar ni revertir avances; guarda snapshot/estado si ya empezó y declara fielmente qué ocurrió antes del gate regularizado. Integra las precisiones necesarias en la TaskDoc/brief autocontenidos, con versiones y hashes; no dejar instrucciones de ejecución solo en conversación o una disposición ausente del bundle. Distingue decisiones de implementación razonables de contratos que no puede inventar; preflight TaskDoc-only debe tener información suficiente de objetivo/límites/criterios y cold incluir contratos y suplemento necesarios.

Repite preflightTaskDoc-only y cold-bundle con DeepSeek Flash aislado, input exacto actualizado (incluidas aclaraciones escritas), sin outputs previos ni historial/tools. Lee AMBAS salidas COMPLETAS frente a intención y gates. Si todavía hay ambigüedad material corrige pregunta y repite; no solo rotular APTO o responderla fuera del bundle. No modificar helper/DAGfuentes de76reviews por esto. Evidencia local en el run, conservar intentos originales.

Después de comprensión válida de esos inputs, reanuda Executor en contexto fresco con el bundle definitivo y el estado/revisión real de cualquier avance existente claramente declarados, manteniendo una sola hoja activa y la separación de Tester/closeout. No asumir que el contexto ya despachado contenía precisiones posteriores. Sigue implementación autorizada WS13.1, URLdemo8092 y sin tocar8090 ni tareas hermanas. No hace falta pedir confirmación adicional para corregir este gate y continuar. Envía estado breve de regularización cuando esté hecho; checkpoint de producto con pruebas después.

FILE:runs/subagents/20261102-ws13-1-lector/inicializacion.md
# Regularización de la inicialización de WS13.1

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Qué ocurrió, fielmente.

Despaché un Executor tras resolver las ambigüedades de preflight y cold solo en una disposición, sin revisión fresca del input corregido. Root lo detectó (`review-source-2.md`). El Executor se pausó antes de editar: **no tocó producto ni tests**, solo leyó y midió la línea base de workspace (17 passed). Su estado: `estado-pausa.md`.

Intentos originales en `inicializacion-1/`, sin alterar. Las precisiones pasan a la TaskDoc, que prevalece y ya no depende de una disposición fuera del bundle.

FILE:runs/subagents/20261102-ws13-1-lector/estado-pausa.md
# Estado de pausa del Executor WS13.1

Fecha: 2026-11-02. Pausado por orden del coordinador (defecto de inicialización del Supervisor, no del Executor).

## Archivos tocados
Ninguno de producto. Solo este archivo en el run. No hay commits, no hay cambios en frontends/, tests/ ni desk/.

## Hecho (solo lectura)
- Leí la TaskDoc, preflight-disposition.md, review-source.md, suplemento-8090.md, declaracion-archivos.md (vacía de declaraciones opcionales) y contratos/navegacion.md completo (§2.2, §3.2, §3.3, §4, §5.x, §6, §7, §8 y huecos H-01, H-03, H-03b, H-04, H-05b, H-06, H-14).
- Leí contratos/operaciones.md §1.2 (no habilita mutación).
- Leí frontends/mindmap/workspace_routes.py completo (617 líneas).

## No leído todavía
dag.yaml nodo WS13.1, pill y rituales (execution/testing), CLAUDE.md completo (solo las primeras 80 líneas), workspace-view.js, workspace.mjs, shell/registry.js, tests/test_mindmap_workspace.py, tests/e2e_mindmap_workspace.py, frontends/workspace/.

## Probado
Línea base (baseline.log no existía): `python -m pytest -q tests/test_mindmap_workspace.py tests/test_parallel_workspace_serve.py` -> 17 passed in 60.68s. Salida no guardada en archivo.

## A medias
Nada.

## Decisiones fuera de la TaskDoc
Ninguna tomada. Observaciones para el siguiente Executor:
- workspace_routes.py:384 deduplica aristas por (source,target,type,relation_doc); hay que preservar campo/valor/procedencia vía load_edge_index(include_linked=False).
- workspace_node usa document_edges (reconstruye) en _build_graph_neighborhood (línea ~356): para H-14 hay que sustituirlo o declarar bloqueo.
- file_revision se lee aparte del IR (sldb_adapter.document_ir lee el archivo); mismo origen exige una sola lectura de bytes o la misma revisión.
- El git status solo muestra tres archivos ajenos en desk/inbox.

FILE:runs/subagents/20261102-ws13-1-lector/suplemento-8090.md
# Suplemento de reutilización de 8090

Supervisor Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Suplemento de esta revisión; no reescribe auditorías históricas ni adopta el prototipo como base. Hechos observados por root en `review-source.md`, más lo comprobado aquí.

**Procedencia.** `frontends/workspace/{index.html,styles.css,app.js,serve.py,__init__.py}` y `tests/test_parallel_workspace_serve.py` están versionados en graph_ui `20e5797` (`git ls-files`, comprobado). La exclusión de WS11 y WS12 se hizo cuando estaba sin commit; ese motivo no describe este snapshot. Blobs:

- `frontends/workspace/app.js` `17d0b23daccb`
- `frontends/workspace/serve.py` `5f18574959b1`
- `frontends/workspace/index.html` `41d6b5c11087`
- `frontends/workspace/styles.css` `c6dfdb943ca7`

**Qué es referencia reutilizable:** catálogo por modelos y filtro; navegación catálogo→documento; marco de lector con pestañas; contexto lateral con identidad, ruta, hashes y relaciones; extracción `sections_prose`. Se adapta al host Mindmap y a `WorkspaceRoutes`. No se crea un tercer workspace ni un servidor nuevo.

**Límites, no se adoptan:** `_build_changes_projection` cruza git status y vecinos y no compara una línea base: no prueba obsolescencia. `renderAgentsSurface` espera campos que la API no entrega. Etiquetas y referencias inline vacías observadas por root: no copiar el renderer sin verificar con DOM o captura. Que 8090 muestre datos reales no significa contrato WS11 cumplido. Nada de Kimun.

**Evidencia auxiliar:** copias en `evidencia-8090/`, tomadas de `/tmp` por root; las capturas son de 8090, no del host Mindmap.

FILE:runs/subagents/workspace-documental-acceptance/ws13-1-g-ui-read.md
# Recibo G_UI_READ del delta WS13.1

Es el recibo de este delta solamente. No es firma ni prueba funcional del humano, no recibe otros deltas y no resuelve `G_HUMAN_READ` ni WS16, que siguen pendientes de recorrido real. Lo registra el Supervisor en el repo receptor con la instrucción recibida.

- **Actor:** solicitante designado P01 (`decisiones.md`).
- **Instrucción humana literal:** «Mira, en http://127.0.0.1:8090/ hicieron algo parecido. Creo que quizas hay cosas que se pueden aprovechar de ahi. Revisa eso y luego manda al implementaador a implementar»
- **Fecha:** 2026-11-02. Transmitida por root, Codex `w3Y:p2`; `runs/subagents/20261102-ws13-1-lector/review-source.md`.
- **Alcance:** nodo WS13.1, delimitado técnicamente por root: lector, origen, enlaces y foco. Contrato fuente WS11: `contratos/navegacion.md` sha256 `6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e`.
- **Efecto:** preparar, promover e implementar este delta. No acepta el resultado.
- **Repo y base:** graph_ui, base `a1b2b22`, HEAD `20e5797`.
- **Tarea receptora:** candidato `desk/drawer/tasks/task-ws13-1-lector-documento-contexto-enlaces-foco.md`, commit `7fa9a0e`, blob `fdedd1679226`; tarea activa en el commit siguiente.
- **No solapamiento:** las tareas draft `task-vista-changes-…` y `task-edicion-contextual-…` no se ejecutan ni se tocan. Este delta no implementa Changes, Integrity ni edición. Ambas declaran `frontends/mindmap/views/workspace/` de forma amplia: quien las retome rebasa sobre este delta.

FILE:desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
---
# pill-xxx
id: pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:runtime
---

# Guardrail: no mocks, no stubs, no fake data in deliverables

## What

_Define the context or guardrail this pill carries._

A hard prohibition on mock/stub/fake/placeholder implementations in any code an executor delivers. This includes: returning hardcoded fake values instead of real computation, leaving TODO/FIXME stubs in place of logic, fabricated sample data standing in for real data flow, no-op functions pretending to work, commented-out real logic replaced by a shortcut, or tests that assert against invented data instead of the real contract.

## Why

_Explain why this context matters for safe execution._

This ecosystem treats deliverables as production truth. A mock silently breaks the nucleus tesis (real typed data flowing sldb -> sldb.api.graph -> overlay). Mocks pass shallow checks while leaving the contract unimplemented, causing false-green closeouts and drift that surfaces much later. Real wiring is the only acceptable evidence a task is done.

## When

_Describe when an agent should apply this pill._

Applied to every executor and tester dispatch, at all times, for every task. There is no exception where a mock is acceptable as a final deliverable. If real data or a real dependency is genuinely unavailable, the executor must STOP and report the blocker, not paper over it with a mock.

## Where

_Name the files, surfaces, or scope this pill applies to._

All implementation code under apps/, scripts/, src/, and any generated artifacts. Applies to graph_ui and every downstream instance.

## How

_Describe the correct way to apply this guidance._

Wire the real dependency. Derive values from the real source (real model descriptor, real store, real generator output). If a build artifact is needed, generate it with the real generator and commit the real output. Tests must validate the real contract against real generated output, not against inlined fixtures that duplicate the expected answer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not stub a function to return a constant. Do not inline fake node-type definitions to make a test pass. Do not write a test whose expected value is a copy-paste of a hardcoded literal that bypasses the generator. Do not leave TODO placeholders where logic belongs. Do not fabricate data to simulate a data source.

FILE:desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md
---
id: atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
title: Workspace presents document, graph, code, and changes as projections of the
  same node
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:workspace
---

# Workspace presents document, graph, code, and changes as projections of the same node

## Answer

El Knowledge Workspace en Mindmap presenta documento, subgrafo local (1-2 hops), proyección de código e impacto de mutaciones (Changes/staleness) como vistas navegables del mismo objeto lógico del store, acompañadas de un panel lateral de contexto con su identidad, hash, relaciones y alertas de integridad.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion.md
# Contrato de navegación e identidad del workspace documental (WS11)

Estado: borrador del Executor de WS11, 2026-11-01. No está revisado: «contrato básico revisado» exige Tester independiente PASS y revisión root. No hay actas de recepción (sección 12). `execution_authorized` global sigue en `false`; este documento no autoriza implementación, escritura en repos hermanos ni Scion. Corregido el 2026-11-01 tras la revisión root del checkpoint WS11 (`runs/subagents/20261101-ws11-correccion/review-source.md`, texto recibido; autorización de trabajo documental, no aprobación humana): la revisión no aprobó la versión anterior y esta sigue en borrador, sin aprobar y sin acta registrada.

## 0. Convenciones de cita y de estado

- Cada cita de código es `repo@commit ruta:línea` o `ruta:símbolo`, y corresponde a un archivo que el Executor abrió en el commit indicado (ver `runs/subagents/20261101-ws11-navegacion/result-summary.md` para el detalle de lo abierto). Dónde dice «auditoría» se cita `ui.md:N`, `infraestructura.md:N` o `deskops.md:N` = líneas de `auditoria/ui.md`, `auditoria/infraestructura.md`, `auditoria/deskops.md` de este directorio.
- Prefijos de ruta: `GU/` = `../UIs/graph_ui/frontends/mindmap/` (graph_ui `134a665`, árbol limpio salvo untracked); `SL/` = `../sldb/src/sldb/` (sldb `77bd6d0097f46efdec5e7eeb0e58d71d70b98be5`); `DK/` = este repo, leído en el HEAD `c19c6c0d` (las auditorías WS02 fijaron `215bf624`; solo se abrieron `deskops/models/*.py`, `deskops/identity.py` y `deskops/operations.py`, y el Executor no las comparó con `215bf624`; la revisión root informa que las comparó entre `215bf624` y `c19c6c0d` y que el diff es vacío, `review-source.md:7`, y el Executor de la corrección no repitió esa comparación).
- **existe** = el código leído lo muestra en ese commit. **aceptado** = tiene acta de recepción o revisión que lo diga. Hoy no hay ningún aceptado (sección 12). Toda fila de este contrato que diga «soportado» significa «existe en código»; nunca «aceptado» ni «ejecutado». No se ejecutó nada.
- `frontends/workspace/` de graph_ui (sin commit, `ui.md:158`) no es base ni se cita como evidencia.
- «No definido» siempre lleva productor o «sin productor en el DAG».
- **Leer, exponer, devolver**: «lee» = el código abre el archivo; «expone» = entrega a otra capa datos derivados de esa lectura; «devuelve» = entrega el texto. Una negación sobre «devuelve el texto» no se extiende a «lee» ni a «expone».
- **Negaciones**: cada negación de este contrato dice el alcance de su búsqueda (patrón y rutas; «en estas rutas»). Sin esa búsqueda no se afirma. Lo que hoy no existe en el código leído (inventario actual) no es la frontera de lo que se puede definir o construir: esa frontera la fijan las secciones 6 y 11 con sus productores.

## 1. Alcance y estado

**Qué fija este contrato** (lo que WS11 debe fijar según `dag.yaml:681-711`): identidad, origen y modelo opcional de un documento Markdown; nodos graph y code con origen; resolución explícita de repo/store; fuente propia frente a Code referenciado; navegación, enlaces e historia; el dominio de correspondencias que admiten foco compartido; errores de lectura y red; lectura multidesk de solo lectura; el límite de ViewDoc; clasificación de huecos; y el mapa de deltas que requieren recepción.

**Qué no fija**: escritura, guardado, whitelist, conflictos y fallos parciales (todo hueco de escritura va a WS12, `dag.yaml:723-796`); la implementación en graph_ui; Scion; Changes; ViewDoc opcional. La lectura no espera guardado ni WS12.

**Base observada**: graph_ui `134a665` (workspace integrado a1b2b22, cierre f16fcd1, `reconciliacion.md:3`); sldb `77bd6d0097f46efdec5e7eeb0e58d71d70b98be5`. Alcance heredado: `alcance.md:5` (Entrega L), `alcance.md:27` (recepción por delta).

**Dependientes directos de WS11 en `dag.yaml`** (recomputado leyendo `depends_on`): WS12, WS13, WS13.1, WS13.2, WS13.3, WS17, WS18, WS33, WS40, WS41. Son 10; la TaskDoc decía «trece nodos» y el Supervisor lo corrigió (`preflight-disposition.md`). WS15.1 consume este contrato por texto de su aceptación (`dag.yaml:1052-1092`), pero depende de WS13, no de WS11 directamente.

**Fuera de este contrato, por diseño**: el contrato básico no espera Changes (WS29), Scion (WS32-WS36, WS44), ViewDoc opcional (WS18/G_SPEC_VIEW) ni modelos (WS39).

## 2. Identidad y origen

### 2.1 Qué existe hoy

| Concepto | Qué hace el código | Evidencia |
|---|---|---|
| Identidad canónica de documento modelado | `Model:name`. El catálogo la arma como `f"{model_name}:{name}"`; la ruta de nodo la resuelve por `Model:name`, por `Model/name` o por nombre solo | `GU/workspace_routes.py:118`, `:251-269` (`_resolve_document`) |
| Nombre ambiguo | Un nombre presente en más de un modelo responde 400 «Identidad ambigua… Use Model:name» | `GU/workspace_routes.py:264-267`, `:299-300` |
| Guardia de identificador | Rechaza vacío, `..` en cualquier posición y prefijo `/` o `\` con 400. Es un criterio textual: también rechazaría un nombre legítimo que contenga `..` | `GU/workspace_routes.py:134-135` |
| Ruta del documento | Cada nodo del catálogo lleva `path` (`str(getattr(d,'path',''))`), el nodo lo repite y el contexto lo repite | `GU/workspace_routes.py:125`, `:237`, `:209` |
| Resolución de respaldo (documento que no valida) | Intenta `resolve_runtime_doc`; si falla, busca en `load_edge_index` y marca el nodo `is_degraded` con `degraded_reason`; solo busca frontmatter en rutas fijas bajo `desk/tasks`, `desk/contexts`, `desk/rituals`, `desk/roles`, `desk/runs`, `desk/relations` | `GU/workspace_routes.py:271-352` (candidatos `:314-322`) |
| Hash de campos y de archivo | `content_hash` = `doc_version(doc)` (hash de campos); `file_revision` = sha256 de los bytes del archivo si está dentro de `repo_root`, no es `.git` y no está ignorado por git | `GU/workspace_routes.py:173-198`; `SL/api/documents/document_serialization.py:24-32` (`doc_version`) |
| Qué es un documento en sldb | Un archivo Markdown con frontmatter y secciones, registrado en el store; el payload se extrae con el codec del modelo | `infraestructura.md:29-30` |

Esto **existe** y está **sin aceptar**. No hay en graph_ui un concepto de «proyecto» o «desk» en la identidad: el catálogo es de un solo store (sección 3).

### 2.2 Markdown modelado frente a no modelado

- **Modelado** = archivo vinculado a un modelo por `.sldb/store.yaml` (`include:`), nunca inferido por carpeta (`deskops.md:212`, «Reglas» de la sección C). Identidad: `Model:name`. Modelo: el del store. Hoy son 17 modelos (`deskops.md:181`, `deskops.md:185-201`).
- **No modelado** = Markdown del desk sin modelo (p. ej. issues, FAQ de `docs/`, candidatos del drawer, `desk/contexts/README.md`): 118 archivos en el universo auditado (`deskops.md:226`; la cifra es del HEAD `215bf624`). **No es corrupción** (`user-flows.md:176`). Los candidatos de drawer con forma de TaskDoc tampoco están modelados (`deskops.md:217`).

**Regla de identidad para un Markdown no modelado** (definición de este contrato; es lo que WS13.1/WS13.2 deben implementar, y no existe hoy):

1. Identidad = par `(repo, ruta)` donde `repo` es el alias del desk (sección 3) y `ruta` es la ruta relativa al root de ese repo, normalizada, con `/`. No lleva `Model:`.
2. El modelo es **opcional**: ausente significa «no modelado». La UI no lo infiere por carpeta ni por forma del contenido; si el store lo trackea, la identidad pasa a `Model:name` y la ruta queda como origen.
3. Un mismo archivo no puede tener dos identidades: si el store lo trackea, `Model:name` prevalece y el explorador no lo repite como no modelado.
4. Una ruta que no resuelve dentro del root del repo, que cae en `.git`, en un archivo ignorado por git o fuera del criterio de la sección 3.3 no tiene identidad: se muestra el error, no el contenido.

**Qué no existe hoy** (búsqueda de `read_text`, `read_bytes`, `open(` y `focus` en `GU/workspace_routes.py` y `GU/views/workspace/`, y de `read_text`/`read_bytes` en `GU/*.py`; léase «en estas rutas»): ninguna ruta del workspace de graph_ui **devuelve** a la UI el texto del archivo propio de un documento (modelado o no) como tal, ni lista Markdown no modelado. Qué **lee**, **expone** y **devuelve** hoy, para no confundirlo:

- *Lee el archivo propio y devuelve un hash*: `read_bytes` solo para `file_revision` (`GU/workspace_routes.py:196`).
- *Lee el archivo propio y devuelve datos derivados*: `read_text` en la resolución de respaldo, solo para extraer el frontmatter, bajo las rutas fijas de `:314-322` (`:326-331`); y el IR: `workspace_node` llama `editor_store.document_ir` (`:156`), que lee el archivo (`GU/sldb_adapter.py:202`) y construye el IR con `build_document_ir_json` (`:203`). Ese IR **llega entero al cliente** en `projections.document.ir` (`:157`, `:244`), incluido `surface` con el `text` de cada nodo del parser (sección 4); la UI no lo muestra.
- *Lee y devuelve texto*: `_inspect_file_reference` lee con `read_bytes` y devuelve `content` íntegro de cada archivo nombrado en `files`/`references` que pase las guardias de 3.3 (`:539-560`). Es Code referenciado (sección 2.4); si un documento se nombrara a sí mismo en esas listas, su texto llegaría por ahí, y eso no es una lectura de fuente propia ni se cuenta como tal.

`_build_code_projection` lee solo `files`/`references` del payload (`:441-451`; `ui.md:55`); `workspace_nodes` lista solo `editor_store.documents()` (`:102-127`). Sin coincidencias de `focus` en `GU/workspace_routes.py` ni en `GU/views/workspace/`. Producción: lectura de fuente propia, WS13.1; árbol y refresco, WS13.2 (huecos H-01 y H-02).

### 2.3 Nodos graph con origen

- Un nodo graph es un documento: `GU/workspace_routes.py:395-413` arma cada nodo con `id` (`Model:name`), `name`, `model_name`, `title`, `status`, `depth`. Una arista lleva `source`, `target`, `type`, `origin`, `relationDoc` (`:387-393`). El **origen de una arista** es `origin` ∈ {`relation_doc`, `schema`, `structural`} según `DocumentEdge` (`SL/api/edges/document_edge.py:17`; `EdgeRecord.metadata` documenta además `alias`, `SL/store/models/edge_record.py:16`). Para aristas `schema` el registro de sldb guarda el campo del documento que las declara y el valor tal como se escribió (`SL/store/edge_index/declared_references.py:68`, `field=field, declared=value`; también `allowed_models`, `:66`); las de composición llevan `field`, `source_field`, `ref_path` y `ref_index` (`SL/store/edge_index/composition_edges.py:55`); el índice compuesto conserva esa metadata (`SL/store/edge_index/declared_resolution.py:45`). **`DocumentEdge` no la expone** (campos `id, source, target, type, origin, relation_doc`, `SL/api/edges/document_edge.py:13-18`), la ruta de graph_ui tampoco (`GU/workspace_routes.py:387-393`) y además colapsa aristas por `(source, target, type, relation_doc)` (`:384`). Ver filas C8 y C9 de la sección 6.
- Los nodos de los extremos que no son documentos (etiquetas, modelos, campos, el store) quedan fuera de `document_edges` (`SL/api/edges/document_edges.py:18`, `:36-39`).
- El grafo es la vecindad a 1 o 2 saltos (`GU/workspace_routes.py:365-376`; `depth` solo admite 1 o 2, `:86-91`).

### 2.4 Nodos code con origen

- Un nodo code es una referencia a archivo del payload (`files` o `references`), con estados `ok`, `no_es_ruta`, `sin_repo_root`, `fuera_del_repo`, `no_existe`, `protegido`, `directorio`, `demasiado_grande`, `binario`, `error_lectura` (`GU/workspace_routes.py:481-575`). Su **origen** es la cadena original (`reference`), la ruta relativa al repo (`path`) y, si la cadena termina en `:N`, `fragment_line`, `fragment_content`, `fragment_span` (±5 líneas) (`:487-493`, `:565-571`).
- Límite de tamaño 256 KB (`GU/workspace_routes.py:19`); lenguaje por extensión, con `text` por defecto (`:20-37`, `:553`).
- Las referencias a código **no** llevan el nombre del campo de origen ni su posición en la lista: `files` y `references` se concatenan en una sola lista y los elementos que no son texto o están vacíos se omiten antes de inspeccionarse (`:441-451`); cada tarjeta lleva solo `reference` (la cadena) y su resultado (`:481-575`). Ver C4 y C4b.
- Las anclas `code:<ruta>::<símbolo>` de sldb son otra capacidad (`SL/api/anchors/record_anchor.py:15`, `infraestructura.md:94`, requiere extra `[code]`); graph_ui no las consume en estas rutas (sin coincidencias de `anchors` en los `.py`, `.js` y `.mjs` de `GU/`, fuera de `fixtures/`). No hay CST supuesto (Tree-sitter diferido, `ui.md:46`).

## 3. Resolución de repo y store

### 3.1 Lo que existe

- graph_ui resuelve **un solo store por proceso**: `WorkspaceRoutes.__init__` guarda `store_path` y `repo_root = store.parent` (`GU/workspace_routes.py:68-71`, `:612-617`); el servidor lo construye una vez con `store or SLDB_STORE` (`GU/serve.py:506-515`; default: el `.sldb` de graph_ui, `:507`, `:512`). Las rutas de Deskops resuelven una sola raíz (`DESKOPS_ROOT` absoluto o el padre del store) (`GU/deskops_routes.py:129-137`; `ui.md:87`).
- El workspace no existe en modo remote: responde 501 (`GU/serve.py:320-322`).
- La API pública de sldb **sí** recibe el store por llamada: `open_store(store, mode)` acepta un directorio `.sldb` o el alias de un enlace (`SL/api/stores/open_store.py:16-39`; `SL/api/stores/store_discovery.py:67-76`, `_resolve_store_arg`). `load_edge_index(store, include_linked=False)`, `doc_status(store, ref)`, `search(store_path, term, …)` y `document_history(store, doc_ref)` toman el store como argumento (`SL/api/edges/edge_reading.py:14`, `SL/api/stores/doc_status.py:18`, `SL/api/search.py:26`, `SL/api/documents/document_history.py:23`). No hace falta cambiar `SLDB_STORE` para leer otro store.
- **`open_store` no es solo lectura**: si el store existe, migra el layout cuando no está ya canónico (`SL/api/stores/open_store.py:37-38` → `SL/store/migration.py:72-80`, que escribe índices fuera del caso «ya canónico», `:75-76`) y agenda un re-chequeo por operación (`open_store.py:40-41`). El argumento `mode="readonly"` solo se usa cuando no se da store, para el descubrimiento y su respaldo global (`open_store.py:26-27`, `:35`); con un store explícito no cambia nada. Ver 5.4. Y `_resolve_store_arg` acepta cualquier ruta que sea un store (`SL/api/stores/store_discovery.py:69-71`) y, si no lo es, busca el argumento como alias de un enlace en los stores ancestros o global del entorno (`:72-75`, `_alias_registries`, `:58-64`): **sldb no limita roots**; cualquier límite lo pone el llamador, y un alias de sldb no es una autorización.
- Precedente en sentido contrario: `GU/views_routes.py:29-33` (`_store`) acepta del cliente cualquier directorio `.sldb` de la máquina (`store` en query o body) y las vistas pueden **escribir** ahí (`:56-66`). Eso es lo que la lectura multidesk **no** debe replicar.
- El registro de repos de deskops: `RepositoryDoc` con `name`, `id`, `path` (relativa al root del ecosistema), `status`, `description`, `tags` (`DK/deskops/models/repository.py:35-52`); `load_repository_registry` lee `desk/registry/repo-*.md`, resuelve el root y rechaza ids o roots duplicados (`DK/deskops/identity.py:65-88`); `_resolve_registered_root` acepta rutas absolutas y relativas con `..` **sin comprobar contención** (`DK/deskops/identity.py:256-262`). Hay 6 `RepositoryDoc` (`deskops.md:195,220`). `deskops list tasks --include-repos` ya lee los Boards de los repos registrados (`DK/deskops/operations.py:364-394`; `deskops.md:76`) con su propio filtro de rutas de tareas (`:1196-1210`).

### 3.2 Regla del contrato

1. **Explícita por petición.** Cada petición de lectura nombra el desk con un **alias** (cadena de un conjunto cerrado), nunca con una ruta ni con un store. El servidor traduce alias a `(root, store)` consultando el conjunto cerrado. Una petición sin alias usa el desk del proceso, y el alias que lo designa se devuelve en la respuesta: el de la configuración confiable si el operador lo incluyó y, si no, `local`, que ya designa el desk de la petición (5.2, paso 3a). Sin configuración confiable la identidad de 2.2 y la clave de 5.3 usan `local`, y WS13.1 no depende de WS41 para tenerla. **Serialización**: ese `local` del desk del proceso viaja como **ausencia del parámetro de alias**. No existe `?alias=local`: `local` no está en el conjunto, así que como parámetro explícito sigue dando E-MD1 (8.5), sin excepción. URL e historia tratan la ausencia del parámetro como el desk del proceso. Dentro del texto, `local:` sigue siendo el desk del documento que contiene el enlace (5.2, paso 3a): si ese documento pertenece al alias externo `b`, el componente de desk de su identidad y de su clave es `b`, nunca la cadena `local`. Si la configuración confiable incluye el desk del proceso, se usa su alias, que es el canónico, y `local` no aparece como componente.
2. **Aliases y roots autorizados: el contrato del input, no los valores** (decisión root de 2026-11-01, `review-source.md:13`). Los aliases reales son **configuración confiable suministrada por el operador** al arrancar o al seleccionar el despliegue; no son un documento que haya que generar automáticamente.
   - **Reparto**: WS11 (este contrato) fija el contrato del input; WS41 lo consume y lo valida; WS40 da la instancia temporal con la que se prueba.
   - **Contrato del input**: un conjunto cerrado de entradas `alias → (root, store)`, suministrado fuera de la petición (el cliente nunca lo aporta). Cada entrada: un `alias` (cadena que debe poder escribirse como prefijo `alias:` de una referencia, es decir cumplir `[A-Za-z0-9][A-Za-z0-9._-]*`, `SL/api/stores/doc_ref.py:17,19`; `local` ya significa «el store local» en esa sintaxis, `:18,38-39`, y está reservado en la sintaxis de enlaces, queda fuera del conjunto y el operador no puede redefinirlo: WS41 rechaza una entrada con ese alias; ver 5.2, paso 3a), el `root` del repo y el `store` (directorio `.sldb`). Los valores concretos los pone el operador: este contrato no inventa ninguno. El soporte, el formato y el punto de carga de la configuración son implementación de WS41, con estas condiciones: conjunto cerrado, fuera de la petición y sin valores reales en el repo de graph_ui ni en el corpus.
   - **Validación (WS41)**: alias único; no hay dos entradas para el mismo par `(root.resolve(), store.resolve())`: los sinónimos del mismo desk no están en el baseline, y una identidad física normalizada tiene **un alias canónico**, el que se devuelve y se usa en sesión e historia, de modo que una configuración duplicada no abre dos identidades del mismo documento (unos sinónimos futuros serían un delta explícito; sin modelo ni nodo nuevos); la disponibilidad de `root` y `store` se comprueba sin retirar del conjunto autorizado una entrada ausente: si falta cualquiera, esa entrada no se sirve y su petición devuelve E-MD3 (8.5), antes de abrir el store, sin crearlo ni migrarlo y sin descubrimiento o fallback a otro store; cada petición resuelve alias → `(root, store)` consultando solo ese conjunto; la contención de toda ruta contra el `root` de la entrada sigue el criterio de 3.3. Al abrir el store se pasa el **directorio** resuelto, no el alias como cadena, porque `open_store` resolvería una cadena que no es directorio como alias de enlaces del entorno (3.1).
   - **Sin configuración confiable no se habilita la lectura cruzada**: toda petición con parámetro explícito de alias da E-MD1 (8.5); un prefijo escrito en un enlace de texto sigue 5.2, paso 3c, y solo se sirve el desk del proceso.
   - **Registro de deskops**: `desk/registry` da **identidad** (id, path, name) y **puede ser la fuente que el operador designe explícitamente** para armar la configuración; no es autorización automática, y que su `path` admita rutas absolutas o relativas con `..` sin comprobar contención (`DK/deskops/identity.py:256-262`) obliga a que la contención la valide el consumidor (WS41), pero no impide que el operador lo designe.
   - **Instancia de prueba (WS40)**: el generador crea dos desks temporales y su manifiesto JSON (roots, stores, commits, documentos clave; `dag.yaml:2683-2698`). Ese manifiesto es evidencia derivada (sección 10); la configuración confiable de las pruebas de WS41 la suministra la prueba como lo haría un operador. WS41 se prueba contra los dos stores de WS40 (`dag.yaml:2725-2731`); la publicación real (WS43) no define aliases.
   - No se inventan valores de alias ni de roots, ni modelo, ni productor, ni decisión humana nueva en este contrato (H-10, H-11).
3. **Sin cambiar `SLDB_STORE` global** ni abrir un store por una ruta recibida del cliente. Cada petición conserva su `(root, store)`; no hay estado compartido entre peticiones.
4. **Alias no autorizado, ruta que escapa y store ausente** dan error visible con su causa (sección 7, E-MD1 a E-MD3). El estado de un enlace de sldb (`ok` / `missing` / `not-a-store`) está en `SL/api/stores/store_links.py:15-39` y el de una referencia (`ok` / `missing` / `ambiguous` / `link-missing` / `link-broken`) en `SL/api/stores/doc_ref_status.py` y `doc_status.py:18-33`.

### 3.3 Rutas seguras: el criterio sale del código existente

Criterio mínimo, tomado de lo que ya hace `_inspect_file_reference` (`GU/workspace_routes.py:481-575`). Esta tabla son las **guardias generales** de toda lectura de archivo por UI (fuente propia, FAQ, contextos, Board, Code, explorador). Las guardias propias de las referencias de TaskDoc están aparte, en «Guardias específicas», y no se aplican al resto:

| Criterio | Qué hace el código | Evidencia |
|---|---|---|
| Contención | Resuelve (`resolve()`, sigue symlinks) y exige `is_relative_to(repo_root)`; si no, `fuera_del_repo` | `:501-518` |
| `.git` | Cualquier parte `.git` de la ruta → `protegido` | `:521-524` |
| Ignorado por git | `git check-ignore -q` con timeout de 2 s; si falla la verificación, **falla cerrado** (`protegido`). Si el repo no tiene `.git`, no evalúa nada | `:460-479` |
| Directorio | `directorio`, no se lista | `:531-532` |
| Tamaño | Más de 256 KB → `demasiado_grande` | `:536-537` |
| Binario | Un byte nulo → `binario` | `:540-541` |
| Codificación | UTF-8 con reemplazo marcado (`utf-8-replaced`) | `:543-549` |
| URL externa | `http(s)://` → `no_es_ruta`, no se abre | `:484-485` |

**Guardias específicas de referencias de TaskDoc** (no son criterio general): `DeskRoutes.board` valida cada entrada de `Board.tasks` y exige estar dentro del root, dentro de `desk/tasks`, sufijo `.md` y nombre distinto de `Board.md` (`GU/deskops_routes.py:36-40`, la condición en `:39`). Otra copia con el mismo propósito, para los Boards de repos registrados, exige además que el nombre empiece por `task-` y que el archivo exista (`DK/deskops/operations.py:1196-1210`). Ambas responden a «¿esta referencia del Board es una tarea?» y **no** deben aplicarse a la lectura de FAQ, contextos, Board, fuente propia ni explorador: bloquearían archivos legítimos fuera de `desk/tasks`. `_inspect_file_reference` no las aplica (`GU/workspace_routes.py:481-575`, sin ninguna comparación con `desk/tasks`). Un lector que quiera restringir por tipo de documento lo declara en su propia lista de permitidos (WS13.2), no hereda ésta.

**No cubierto por el código existente** (por lo tanto, hueco o decisión de WS13.2/WS41, no inventado aquí):

- Una **lista de permitidos** de carpetas o extensiones: cualquier archivo de texto no ignorado dentro del repo se lee, aunque no sea del desk; las extensiones desconocidas se leen como `text` (`:553`). No hay criterio sobre archivos sensibles que no estén en `.gitignore`.
- La verificación `check-ignore` no existe fuera de un repo git (devuelve «no ignorado»): en el corpus sin repo git no protege nada.
- Condiciones de carrera entre `resolve()` y la lectura (TOCTOU): no tratadas.
- La guardia del identificador de nodo (`'..' in ident`) es textual (`:134`).
- Resolución de enlaces `[[destino]]` de sldb: `resolve_link_target` prueba el destino contra el store, contra el directorio del documento y contra `Path(destino)` absoluto o relativo al directorio actual del proceso (`SL/links/resolver.py:33-35`), y `recover_links` lee el destino con `#ancla` antes de retornar (`SL/links/recovery.py:13-14`) y recursa si `depth > 1` (`:29-30`). Reaplicar la contención **después** de `recover_links` llega tarde: el destino ya se resolvió y se leyó. El orden obligatorio está en 5.2 (analizar y autorizar antes de cualquier lectura o recursión).

El **criterio que este contrato fija** para toda lectura de archivo por UI: todos los de la tabla de guardias generales; más, para el explorador de no modelados (H-02), que el WS13.2 declare su lista de permitidos antes de implementar. No se declara hoy cuál es.

## 4. Fuente propia frente a Code referenciado

- **Fuente propia** = el archivo Markdown del documento (modelado o no). **Code referenciado** = los archivos que el documento nombra en `files`/`references`. Son cosas distintas y no se mezclan en una pestaña.
- Hoy `projections.code` es solo Code referenciado (`GU/workspace_routes.py:431-458`). La fuente propia **no tiene proyección**. `file_revision` solo hashea el archivo propio, no lo entrega (`:180-198`).
- La pestaña Documento muestra el IR (secciones) y los campos, y badges de línea `L<ini>-<fin>`; no muestra el texto crudo (`GU/views/workspace/node/workspace-view.js:41-52`, `:325-379`; `GU/shared/document-ir.mjs:11-26`).
- sldb entrega, junto al IR, `surface`: los nodos crudos del parser con su `text` y su rango de líneas (`SL/api/records/utils.py:10-19`; `SL/core/ir/document_ir.py:8-14`). `workspace_node` ya recibe ese IR (`GU/workspace_routes.py:153-161`; `SL/api/documents/document_ir_serialization.py:13`). Que `surface` reconstruya el texto íntegro **no está verificado**: no se afirma, y la reserva se mantiene (`surface.text` no prueba fuente íntegra). `render_document_markdown` **no** es la fuente: renderiza el payload por la plantilla del modelo (`SL/api/documents/document_render.py:19-28`).
- **En sldb, quién lee el archivo del documento y qué entrega** (búsqueda de `read_text`, `read_bytes` y `.open(` en `SL/api/`, `SL/links/` y `SL/cli/serve/`; léase «en estas rutas»; las lecturas de modelos, índices y plantillas no se enumeran). *Lee y entrega datos derivados*: IR y secciones en `SL/cli/serve/document_routes.py:62`, `SL/cli/serve/sections_routes.py:46`, `SL/api/documents/document_ast.py:22` y `SL/api/records/ast_target.py:38`; procedencia en `SL/api/documents/document_serialization.py:20`; registros de búsqueda en `SL/api/records/iter_records_docs.py:35,44`. *Lee para uso interno*: payload anterior al guardar (`SL/api/documents/payload_save.py:54`), validación al registrar (`SL/api/documents/track_document_file.py:47,48,68`), texto previo al estampar (`SL/api/documents/provenance_stamp.py:31`). *Lee y devuelve texto*: `compose_document` (`SL/links/composer.py:9-31`, exportada por `sldb.links`, `SL/links/__init__.py:6,15`; no por `sldb.api`) lee el archivo con `read_text` y devuelve su `markdown` con las transclusiones `![[…]]` expandidas, siguiendo enlaces a otros archivos con `resolve_link_target`; no es una lectura de bytes del archivo ni segura para un destino no autorizado. En estas rutas no se encontró otra operación que devuelva el texto del archivo del documento tal cual. La capacidad de **guardado** raw-source no existe (`infraestructura.md:33`, productor WS20) y no se confunde con la de lectura.
- Lectura de fuente propia (modelada o no): hueco H-01, clase API (la ruta de lectura no existe en graph_ui; graph_ui puede leer el archivo con el criterio de la sección 3.3, sin pedir nada a sldb), dueño graph_ui, productor WS13.1.
- **«Mismo origen»** (`dag.yaml:841-871`): el render y la fuente salen **de la misma lectura o revisión**, no solo de la misma ruta. Observable: la respuesta que entrega ambos lleva la revisión (hash de bytes) de la lectura de la que salieron los dos, o los dos se derivan de una sola lectura de bytes, y si difieren se ve. Hoy no se cumple por construcción: el IR lee el archivo en `GU/sldb_adapter.py:202` (llamado desde `GU/workspace_routes.py:156`) y el hash de revisión lo lee otra vez, después, en `GU/workspace_routes.py:196`; una edición entre ambas lecturas daría un `file_revision` distinto del texto del que salió el IR. El mecanismo es de WS13.1; no hay dos copias del documento: la copia es una instancia con el mismo origen, no cada representación (`dag.yaml:871`).
- La edición de fuente espera WS20/WS21 y es de WS12; esta lectura no la necesita.

## 5. Navegación, enlaces e historia

### 5.1 Navegación y historia que existen

- Estado en URL: `?id=&depth=&tab=`; cada cambio de nodo, profundidad o pestaña hace `pushState` (`GU/views/workspace/node/workspace-view.js:71-86`, `:213-226`); `popstate` vuelve a leer la URL (`:88-100`, `:196-199`). Las pestañas son `document`, `graph`, `code` (`GU/views/workspace/node/workspace.mjs:5` `TABS`): son **proyecciones** del mismo documento, no pestañas de documentos.
- Seguir una relación o un nodo del grafo cambia el documento activo (`workspace-view.js:222-226`, `:419`, `:537`). El catálogo se carga al montar; «Actualizar» recarga el nodo, no el catálogo (`:102-136`, `:296`; `ui.md:56`).
- Filtro local por id, título y modelo (`workspace.mjs:11` `filterCatalog`); filtro de aristas por tipo (`:83`).
- **La URL no lleva repo ni alias**: no puede distinguir dos desks (H-12, API, graph_ui, WS41; con WS13.3 para la historia). Cuando lo lleve, la ausencia del parámetro significa el desk del proceso (3.2, punto 1).

### 5.2 Enlaces

- **Sintaxis de enlace en el texto que admite sldb hoy** (`SL/links/parser.py:6-7`; `infraestructura.md:88-90`): `[[destino]]`, `![[destino]]` (transclusión) y `[pred:: [[destino]]]`. El `destino` es cualquier texto sin `]`, recortado (`parser.py:6,11,15`); `parse_links(markdown, predicate_types)` es una función pura que no abre archivos (`parser.py:17-20`). `split_anchor` separa `base#Sección` por el primer `#` (`SL/links/sections.py:15-18`; la sección se compara sin distinguir mayúsculas, `:30-37`). `parse_links` se exporta en `sldb.links` (`SL/links/__init__.py:3,11`); `split_anchor` vive en `sldb.links.sections` y no se reexporta.
- **Referencias públicas con prefijo de store** (`SL/api/stores/doc_ref.py`, `split_doc_ref` exportada por `sldb.api`, `SL/api/__init__.py:64,126`; `doc_status`, `:66`): `alias:referencia`, con alias `[A-Za-z0-9][A-Za-z0-9._-]*` (`doc_ref.py:17,19,22-25`) y `referencia` = `name`, `Model/name` o ruta rastreada (`:33`, `matches_doc_ref`, `:43-45`). `split_doc_ref` solo da alias si el store de lectura tiene un enlace directo con ese nombre (`stores add --name`) y, si no, deja la referencia entera (`:6-7`, `:40`); `local:` nombra el store local (`:18,38-39`). Los IDs de la GUI `Model:name` tienen la misma forma `x:y`, pero **no son** referencias de sldb: `Model:name` es el export id del índice de aristas y del catálogo (`GU/workspace_routes.py:118`; `declared_references.py:84-86`), mientras que `matches_doc_ref` compara con `Model/name` (`doc_ref.py:45`).
- **El parser admite el prefijo; el resolutor no.** `[[alias:Model/name]]`, `[[alias:name]]` y `[[alias:ruta#Sección]]` parsean como un único `destino` (`parser.py:6`), sin obstáculo sintáctico. Pero `resolve_link_target` no tiene rama de alias: prueba `alias:x` como nombre rastreado, como ruta relativa al documento y como `Path` absoluto o relativo al directorio actual del proceso (`SL/links/resolver.py:33-35`). Además `_tracked_documents` indexa por `name` solo, no por `Model:name` (`:13`). Por eso `recover_links` (`SL/links/recovery.py:23-31`) y `audit_links` (`SL/links/audit.py:10`) **no sirven como resolutor de la UI** ni para sanear después (3.3): `recover_links` lee el destino con ancla (`:13-14`) y recursa (`:29-30`) tras resolver, y `resolve_link_target` toca el sistema de archivos con el destino tal cual.
- **Tratamiento obligatorio de un enlace de texto** (para WS13.1 con el desk propio y para WS41 entre desks; fija sintaxis y orden para que WS40 y WS17 puedan authorar enlaces reales). Orden: (1) tomar el texto ya leído con las guardias de 3.3 y extraer enlaces con `parse_links`; (2) `split_anchor`; (3) clasificar el prefijo de la base con la gramática de `doc_ref.py:19`, en este orden y una sola vez: (a) `local:` se reconoce **antes** que cualquier alias: está reservado y fuera del conjunto del operador, designa el **desk del documento que contiene el enlace, que es el de la petición que lo leyó y ya está autorizado** (no el desk inicial del proceso si se está viendo otro desk) y se retira una sola vez; (b) si no, un prefijo que coincide con un alias autorizado de 3.2 designa ese desk y se retira; (c) si no, no es alias: la cadena entera es un nombre local en el desk de origen (regla de `doc_ref.py:6-7`), también sin configuración confiable, y si no resuelve se informa como referencia rota con origen y causa (E5), **no** como E-MD1. Lo que queda tras retirar un prefijo es `resto` y no se vuelve a interpretar como alias ni como `local:`; (4) **autorizar el root del desk destino antes de leer nada**; (5) normalizar el resto y, si es una ruta, comprobar contención contra el root autorizado antes de pasarla a cualquier API (E-MD2); (6) resolver sobre el **store objetivo explícitamente autorizado**: `doc_status(<directorio del store>, "local:" + resto)`, con `resto` en la forma `Model/name`, `name` o ruta rastreada (nunca `Model:name`, que sin `local:` `doc_status` informaría como `link-missing`, `SL/api/stores/doc_status.py:31-32`). El prefijo `local:` es **obligatorio**, también para un destino local: `doc_status` llama por dentro a `split_doc_ref` (`doc_status.py:26`), que seguiría cualquier enlace directo de ese store cuyo nombre coincida con lo que hay antes de los dos puntos (`doc_status.py:27-28`, `doc_ref.py:40`), es decir un store que el operador no autorizó; con `local:` el resto queda entero y solo se busca en ese store (`doc_ref.py:38-39`; `doc_status.py:29`). Como `doc_ref.py:38-39` quita solo el primer prefijo, `local:foo:bar` designa literalmente `foo:bar`: por eso el `local:` del autor se retira en (3a) y el del envoltorio se pone una sola vez, sin `local:local:` salvo que el `resto` literal empiece así. Por lo mismo, tampoco se llama `split_doc_ref` con el store de origen; (7) validar también la contención del `path` del resultado (`DocRefStatus.path`, `SL/api/stores/doc_ref_status.py:16`) antes de abrirlo; (8) solo entonces leer con la lectura protegida de WS13.1/13.2, y comprobar la ancla con `extract_section` sobre el texto leído (`SL/links/sections.py:30-37`); (9) `include_linked=False` en toda lectura de índice (el defecto de `load_edge_index` es `True`, `SL/api/edges/edge_reading.py:14`) y sin federación automática. `doc_status` cubre documentos rastreados; un Markdown no modelado se resuelve con la resolución protegida de archivo de WS13.1/13.2, no con un modelo falso. Una referencia rota o un destino no resuelto se muestra con su origen y su causa y no abre nada.
- **Ejemplos del tratamiento** (por lectura de `doc_ref.py:38-40` y `doc_status.py:26-29`; no se ejecutó nada). Documento de origen en el desk `A`, visto con `A` autorizado; `b` es alias autorizado del desk `B`; `foo` no es alias autorizado y `A` puede tener un enlace de store llamado `foo`:

| Destino escrito | Clasificación | Llamada | Resultado esperado |
|---|---|---|---|
| `[[TaskDoc/x]]` | Sin prefijo, desk `A` | `doc_status(A, "local:TaskDoc/x")` | Busca solo en `A` |
| `[[local:TaskDoc/x]]` | (3a), desk de origen | `doc_status(A, "local:TaskDoc/x")` | Igual al anterior. **Nunca** `local:local:TaskDoc/x` |
| `[[local:TaskDoc/x]]` en un documento de `B` | (3a), desk `B` | `doc_status(B, "local:TaskDoc/x")` | Busca en `B`, no en el desk inicial del proceso |
| `[[local:foo:bar]]` | (3a), resto literal `foo:bar` | `doc_status(A, "local:foo:bar")` | Literal `foo:bar` en `A`; no salta al enlace `foo` |
| `[[foo:bar]]` | (3c), nombre local | `doc_status(A, "local:foo:bar")` | Literal en `A`; si no resuelve, E5. No salta al enlace `foo` ni da E-MD1 |
| `[[b:TaskDoc/x]]` | (3b), desk `B` | `doc_status(B, "local:TaskDoc/x")` | Busca solo en `B` |
| `[[b:local:x]]` | (3b), resto literal `local:x` | `doc_status(B, "local:local:x")` | Literal `local:x` en `B`; el resto no se reinterpreta |
| `[[b:TaskDoc/x]]` sin configuración confiable | (3c), nombre local | `doc_status(A, "local:b:TaskDoc/x")` | Literal en `A`; si no resuelve, E5 |
| Parámetro explícito de alias `zzz` en una petición | No es enlace de texto | Ninguna | E-MD1; no se abre nada |
- La auditoría de enlaces del store (`audit_links`, `GET /lint`) informa enlaces no resueltos (`SL/links/audit.py:10`; `SL/cli/serve/lint_routes.py:25,58`).
- **graph_ui no consume `[[…]]` ni `sldb.links` en estas rutas**: sin coincidencias de `sldb.links` en los `.py` de `GU/`; las coincidencias de `[[` son literales de arreglos en módulos de notación, la de `/lint` son los comentarios de proxy de `GU/serve.py:10,241` y la de `recover` es `GU/compilation.py:65` (no relacionadas). Seguir un enlace de texto, hoy, no existe en el workspace (H-06: integración de lectura en graph_ui por la composición de arriba, productor WS13.1; la referencia rota la consume WS15.1).
- **Enlaces entre desks**: ver sección 8.4.
- Referencias por campo: aristas `references` y `contains` declaradas por el modelo (`SL/store/edge_index/declared_references.py:38-71`); el workspace las muestra como relaciones entrantes y salientes (`GU/workspace_routes.py:200-201`; `workspace-view.js:518`, `:537`).
- Backlinks: `incoming_relations` del contexto (`GU/workspace_routes.py:200`) son las aristas entrantes de la vecindad (1 o 2 saltos), no un cálculo con la API de grafo completa (`ui.md:69`). Los backlinks por `edges_to` o `graph` no se consumen (`SL/api/edges/edge_reading.py`, `reconciliacion.md` C-44).

### 5.3 Historia

- **Historia de navegación** = la del navegador (arriba) y, cuando WS13.3 la entregue, la de documentos abiertos de la sesión. Es disposición local (P07, `decisiones.md:31`); no es documento compartido. «Volver sigue el orden inverso» y la restauración de foco son aceptación de WS13.3 (`dag.yaml:933-973`); no existen hoy.
- **Clave de sesión de modelado** (historia, documentos abiertos y foco guardado por documento de WS13.3): se compone de **alias del desk** e **identidad local del documento** (`Model:name` para un modelado; la ruta relativa al root para uno no modelado, 2.2) y los dos componentes viajan juntos, de modo que dos desks con el mismo `Model:name` no colisionen. Este contrato fija los componentes y que no colisionen; **no fija una sintaxis de cadena** (`runs/subagents/20261101-ws11-correccion/preflight-disposition.md`). Hoy la URL y el estado de sesión usan solo el `Model:name` (5.1): la clave con alias es lo que H-12 incorpora.
- **Historial Git** = otra cosa. `document_history(store, doc_ref)` devuelve las versiones comprometidas de un documento; fuera de git devuelve vacío (`SL/api/documents/document_history.py:1-7,23`; `infraestructura.md:60`). graph_ui no lo usa en el workspace. El diff por tarea y repo es WS27.1 (H-13).

### 5.4 Efecto de lectura

Lo que el código leído muestra (no se ejecutó nada; los efectos son los que dicen el código y las docstrings, sin confirmar):

- `_build_graph_neighborhood` llama a `document_edges` (`GU/workspace_routes.py:356-359`), que invoca `rebuild_edges(..., wait=True)` antes de leer (`SL/api/edges/document_edges.py:30`). `rebuild_edges` abre el store en modo por defecto, toma el lock del store y reconstruye los índices semántico, de secciones y de aristas que se movieron (`SL/api/edges/rebuild_edges.py:33-38`); su docstring dice que sobre un store al día no escribe nada (`:20-21`). La docstring de `workspace_routes.py:3` dice «Strictly read-only»; con esta cadena de llamadas la lectura puede escribir archivos derivados y puede esperar el lock.
- `load_edge_index` documenta que «Reading never rebuilds» (`SL/api/edges/edge_reading.py:14-26`) y los módulos de composición del índice que se abrieron no escriben (búsqueda de `write`/`save`/`dump`/`mkdir`/`unlink` en `SL/store/edge_index/compose.py`, `shard_reading.py`, `shard_signature.py`, `edge_index.py` y `cache_keys.py`: sin coincidencias de escritura). Pero **no evita la migración transitiva**: `load_edge_index` llama `open_store(store, mode="readonly")` (`edge_reading.py:28`) y `open_store` migra el layout si el store existe y no está ya canónico (`SL/api/stores/open_store.py:37-38`; `SL/store/migration.py:72-80`). `_check_problems_for_node` de graph_ui también pasa por `load_edge_index` (`GU/workspace_routes.py:584`) en cada respuesta de nodo.
- `doc_status` y `document_history` tienen la misma entrada: `open_store(store, mode="readonly")` (`SL/api/stores/doc_status.py:25`; `SL/api/documents/document_history.py:26`). La docstring de `doc_status` («Asking never writes») se refiere a que el store consultado no gana entradas, modelos ni hashes de los documentos que referencia (`doc_status.py:3-4`); **no garantiza cero escrituras** del propio `open_store`. `mode="readonly"` controla el descubrimiento y su respaldo global, no las escrituras (`open_store.py:26-27,35`).

**Obligación de este contrato (lectura sin mutaciones)**: (a) los stores que se leen están preparados y canónicos **fuera del request**; ninguna petición de lectura migra ni reconstruye como efecto de leer; (b) no se asume que `mode="readonly"` ni `load_edge_index` basten; (c) al ejecutar cada consumidor se comprueba de verdad que las llamadas escogidas no escriben; **criterio observable: tras la lectura, el store (sus archivos y su estado de versión) no cambió**. El medio de la comprobación es de los consumidores. Si con la API pública no puede sostenerse (c), queda como **hueco con dueño** y el caso se bloquea antes de implementar; no se resuelve con un workaround sobre el formato interno ni con una API inventada, y si se prueba una falta de capacidad, el intake explícito en el repo dueño y su tarea van **antes** del workaround (no se agrega una tarea de SLDB por reflejo). **Dueños**: el caso del store propio pertenece al delta de lectura de WS13.1 y a la ruta que consuma WS24; el segundo desk lo verifica WS41. Ver H-14.

**Quién prepara los stores fuera del request**: en el corpus de WS40, su generador o fixture; en las pruebas propias de WS13.1 y WS41, el Executor del consumidor, con la fixture lista antes del GET; en uso real, el operador o responsable del desk, que los prepara o migra a mano y con autorización antes de atender lecturas HTTP. La UI no migra a causa de una petición. La TaskDoc del consumidor identifica la operación pública, su versión y la evidencia de la preparación; este contrato no inventa un comando y no hay productor automático de preparación. Si la API escogida no cumple la ausencia de escrituras bajo esas precondiciones, es hueco o intake en el repo dueño y el caso se bloquea, sin workaround.

## 6. Foco y correspondencias

**Dominio de la tabla**: selecciones que una persona puede hacer en un documento abierto (texto, graph, code) y el destino en otra representación **del mismo documento** o en otro documento. «Foco» = elemento seleccionado **dentro** de un documento (`dag.yaml:857-859`); el documento activo identifica la pestaña. **Navegación** = cambiar el documento activo: es otra cosa y no demuestra foco interno. **Regla**: sin mapeo no hay correspondencia, y ninguna fila se da por soportada por omisión; cada representación muestra solo la correspondencia que realmente existe y no se inventa un resaltado equivalente donde falta.

Cada fila separa tres cosas, que no se mezclan: **datos disponibles** (qué entrega ya sldb o graph_ui, con su procedencia), **interacción existente** (qué hace hoy la UI con eso) y **comportamiento futuro comprometido** (qué compromete este contrato, con su productor). «Existe» indica solo que el código lo muestra; nada está aceptado (sección 12).

**Estado del foco hoy**: no hay estado de foco. Sin coincidencias de `focus` en `GU/workspace_routes.py` ni en `GU/views/workspace/` (búsqueda); el único estado de selección es `selectedId` (un documento) más `depth` y `tab` (`workspace-view.js:57-59`). La tabla describe, por tanto, el **dominio definible** (la frontera de lo realizable con datos reales, no el inventario de lo que la UI hace hoy) y lo que falta para cada fila.

| # | Selección origen | Destino | Correspondencia real | Evidencia | Estado |
|---|---|---|---|---|---|
| C1 | Nodo vecino en el graph | Documento activo (misma identidad `Model:name`) | El `id` del nodo del grafo es la identidad canónica del catálogo | `GU/workspace_routes.py:118`, `:395-413`; `workspace-view.js:222-226`, `:419` | **Navegación**, no foco. Datos: `id` = `Model:name`. Interacción existente: el clic cambia `selectedId` y la URL (existe, no aceptado). Futuro: ninguno propio; no demuestra foco interno |
| C2 | Relación entrante o saliente del contexto | Documento origen o destino | Las aristas llevan `source`/`target` = `Model:name` | `GU/workspace_routes.py:200-201`, `:387-393`; `workspace-view.js:518`, `:537` | **Navegación**, no foco. Datos: `source`/`target`. Interacción existente: el botón cambia `selectedId` (existe, no aceptado). Futuro: ninguno propio |
| C3 | Opción del catálogo | Documento activo | Mismo id | `workspace-view.js:260-264` (selector `onChange`→`handleSelectNode`) | **Navegación**, no foco. Interacción existente: cambia `selectedId` (existe, no aceptado). Futuro: ninguno propio |
| C4 | Entrada de `files`/`references` en el texto/payload | Tarjeta Code de esa referencia | Cada tarjeta lleva `reference` (la cadena original) y `fragment_line` si hay `:N`; las dos listas se concatenan en orden (`files`, luego `references`) y se omiten los elementos vacíos o no textuales | `GU/workspace_routes.py:441-451`, `:487-493`, `:565-571`; `workspace-view.js:15-39`, `:454-456` | **Tarjeta derivada pasiva.** Datos: la tarjeta y su `reference`. Interacción existente: **ninguna** entre el texto y la tarjeta; `CodeFileView` recibe solo `file`, sin callback de selección (`:15`, `:455`), y el campo mostrado en la pestaña Documento no apunta a la tarjeta (`:351-363`). No es una interacción texto→Code existente. Futuro: foco de la referencia con procedencia real (documento, campo, posición, valor), WS13.1, depende de H-03 |
| C4b | Tarjeta Code | Campo (`files` o `references`) del documento | El campo de origen y la posición se pierden: las dos listas se concatenan antes de inspeccionarse. El IR sí tiene un nodo por campo, pero una lista es **un** nodo con toda la lista como valor (`flatten_payload` no desagrega listas) | `GU/workspace_routes.py:441-451`; `SL/api/records/flatten.py:3-10` | **Sin correspondencia hoy**: datos perdidos en la ruta. Futuro: preservar `files`/`references` y la posición de cada elemento antes de concatenar (H-03); identificar la referencia por documento, campo, posición y valor. Hueco H-03 |
| C5 | Sección del texto (IR `structure`) | Rango de líneas del Markdown propio | Cada sección lleva `span.line_start/line_end` (el fin se extiende hasta la siguiente sección de igual o mayor rango, `extract.py:52-59`); cada nodo `surface` lleva `text` y `span` | `SL/api/records/build_ir.py:39`, `:64`; `SL/api/records/extract.py:41-59`; `SL/api/records/utils.py:10-19` | Datos reales de sldb, ya enviados al cliente (`GU/workspace_routes.py:157`). Interacción existente: solo el badge `L<ini>-<fin>` (`workspace-view.js:41-52`); no hay vista de texto con líneas ni foco. Futuro: foco por sección y span de **la misma fuente** (lectura o revisión, sección 4), WS13.1. Hueco H-04 (documentos modelados) |
| C5b | Sección o línea de un Markdown **no modelado** | Estructura | En graph_ui no hay hoy ninguna ruta que produzca estructura para un Markdown sin modelo: `workspace_node` obtiene el IR sobre un documento resuelto del store. En sldb, `extract_sections(markdown)` recibe solo el texto (`SL/api/records/extract.py:6-13`; importable de `sldb.api.records`, `records/__init__.py:12,28`) y `build_document_ir_json` está exportado (`SL/api/__init__.py:14`). El builder no consulta el registro de modelos ni exige un modelo registrado, ni por lectura un valor de modelo no nulo: consume un descriptor con las claves `store`, `path`, `name`, `payload`, `model` y `semantic_tags` (`SL/api/records/build_ir.py:20-21`, `:38`, `:62-63`, `:69-74`, `:81-82`); `MeaningNode.model` admite `None` (`SL/core/ir/meaning_node.py:9`) y `context.semantic` acepta valores arbitrarios (`SL/core/ir/document_context.py:6`) | `GU/workspace_routes.py:151-165`; `GU/sldb_adapter.py:178-215`; `SL/api/records/extract.py:6-13`; `ui.md:55` (solo para la ausencia de Markdown sin modelo en el workspace) | **Sin ruta actual en graph_ui; reutilización por verificar.** No se inventa un modelo para satisfacer una exigencia que el builder no tiene. No se afirma compatibilidad ejecutada ni una API de sldb lista para este caso: la reutilización con un descriptor y `model=None` se verifica al implementar WS13.1, y falta la ruta de graph_ui. Futuro: la estructura y el foco de un no modelado dependen de H-01 y de verificar esa reutilización (WS13.1). Hueco H-01/H-04 |
| C6 | Campo del payload (`field_path`) | Sección que lo contiene | `owning_section` por campo, **opcional**: `str \| None` con defecto `None` (`SL/core/ir/meaning_node.py:12-14`); se asigna `field_section_map.get(field_path)` (`build_ir.py:75`) y el mapa es `{}` si la plantilla y el documento renderizado no corresponden (`SL/api/records/map_fields.py:43-56`, `:59-74`); se deriva del encabezado previo al marcador de la plantilla (`:15-20`, `:39-40`). No es un dueño garantizado ni el rango exacto del campo | `SL/api/records/build_ir.py:68-78`; `SL/api/records/map_fields.py:22-26`, `:43-74`; `GU/shared/document-ir.mjs:8-9`, `:11-17` | Dato opcional de sldb; la UI no lo usa (`irFields` no lo lee, `document-ir.mjs:11-17`; el comentario de `:8-9` dice que en el shape observado viene `null`, sin que el Executor lo haya ejecutado). Futuro: foco de campo y de contenedor cuando el dato exista (WS13.1); si es `None`, no hay resaltado de sección. Hueco H-04 |
| C7 | Campo del payload | Rango de líneas | `_build_field_nodes` no asigna `span` a los campos (queda el `SourceSpan` por defecto, `SL/core/ir/meaning_node.py:15`); la UI ya asume líneas nulas para el frontmatter (`document-ir.mjs:18-22`) | `SL/api/records/build_ir.py:68-78` | **Sin soporte**: el span exacto por campo no existe. **No bloquea** el foco de campo ni de contenedor (C6). Hueco H-05 |
| C8 | Campo de referencia o contención del texto | Arista del graph | sldb guarda el campo y el valor declarado en el registro de arista (`field`, `declared`, `allowed_models`; en composición `field`, `source_field`, `ref_path`, `ref_index`); `DocumentEdge` y la ruta de graph_ui los omiten, y la ruta **deduplica** por `(source, target, type, relation_doc)`: varios campos hacia el mismo destino con el mismo tipo colapsan en una arista | `SL/store/edge_index/declared_references.py:64-71`; `SL/store/edge_index/composition_edges.py:55`; `SL/api/edges/document_edge.py:13-18`; `GU/workspace_routes.py:384`, `:387-393` | **Sin correspondencia hoy en la UI.** Datos: `load_edge_index(...).edges[].metadata` (`SL/api/edges/edge_reading.py:14`; `SL/store/models/edge_record.py:16`); solo las aristas `schema` llevan campo, las `relation_doc` no. Futuro: foco de la arista con **todas** sus procedencias (campo y valor), preservando multiplicidad. Hueco H-03b |
| C9 | Arista del graph | Campo del texto que la declara | Inverso de C8, pero no uno a uno: por la deduplicación de `:384` una arista mostrada puede venir de **varios** campos, y un campo con lista produce varias aristas | `GU/workspace_routes.py:384`; `SL/store/edge_index/declared_references.py:64-71` | **Sin correspondencia hoy.** Futuro: mostrar el conjunto de campos que la declaran; **no se elige arbitrariamente un campo inverso** cuando hay varios. Hueco H-03b |
| C10 | `[[doc]]` en el texto | Documento destino | El parser admite `[[destino]]` (con `alias:` y `#Sección` dentro del destino), pero `recover_links` y `resolve_link_target` no son un resolutor seguro para la UI (5.2); graph_ui no consume `sldb.links` | `SL/links/parser.py:6-7`; `SL/links/resolver.py:33-35`; `SL/links/recovery.py:13-14`, `:29-30`; búsqueda en `GU/` sin consumo (5.2) | **Sin interacción hoy** (existe en sldb la sintaxis, no un resolutor seguro). Futuro: seguir el enlace por la composición de 5.2 (parse, ancla, autorización, `doc_status` o lectura protegida), WS13.1 (desk propio) y WS41 (entre desks). Hueco H-06 |
| C11 | Línea o archivo en Code | Sección, campo o nodo graph | Dos casos distintos. (a) **Foco de la referencia explícita**: la tarjeta es una entrada de `files`/`references`; su correspondencia con el campo y la posición en el texto puede definirse cuando H-03 conserve campo y posición. (b) **Mapeo semántico de las líneas de un archivo externo** a una sección, un campo o un nodo del grafo: no hay correspondencia; el archivo de Code no es un nodo del grafo ni se atribuye a uno | `GU/workspace_routes.py:431-458`; `dag.yaml:857-859` | (a) **Futuro comprometido** por la aceptación de WS13.1 (`dag.yaml:860-871`): seleccionar la tarjeta fija el foco de su referencia en el texto con la procedencia de C4 y C4b; en el graph solo si existe una arista con esa procedencia (C8), nunca por atribuir el archivo a un nodo. (b) **Sin soporte**, sin productor y sin compromiso. Hueco H-05b |
| C12 | Línea o sección del texto | Línea de Code | No hay mapeo texto→código (prohibido inventarlo, `dag.yaml:857-859`) | — | **no soportado, declarado así**. Sin productor y sin compromiso de producirlo |
| C13 | Nodo graph de otro desk | Documento de otro desk | No existe: el workspace tiene un store y la URL no lleva repo | `GU/workspace_routes.py:68-71`; sección 3 | **no soportado hoy**. WS41 (H-12, H-10) |
| C14 | Rango de líneas dentro de un archivo Code (F17) | Rango en el texto | Hay `fragment_line` y `fragment_span` de ±5 líneas: `:N` es **contexto** alrededor de una línea, no un rango elegido por la persona (el cliente repite el ±5, `workspace.mjs:31-61`) | `GU/workspace_routes.py:565-571`; `GU/views/workspace/node/workspace.mjs:31-61` | Se separan dos cosas. (a) **Rango local de Code** (archivo, revisión, líneas): F17 pide «archivo o rango» (`vistas.md:345`); hoy solo existe el contexto `:N±5` y la selección de rango por la persona no existe; es del delta de WS13.1. (b) **Traslado de ese rango al Markdown**: no está comprometido por F17 (`vistas.md:349,351`: no se inventa mapeo texto-código); sin productor. H-05b |

### 6.1 Dominio de foco de WS13.1: lo que existe y lo que este contrato compromete

**Lo que existe hoy** no es foco: C1-C3 solo cambian `selectedId` y navegan a otro documento; C4 es una tarjeta derivada pasiva sin callback de selección. Ninguna de las cuatro filas demuestra un foco interno por documento.

**Dominio futuro comprometido de WS13.1** (decisión root 1 de 2026-11-01, `review-source.md:10`): un **foco interno por documento, distinto de la navegación**, definido solo con **procedencia real**:

1. *Sección y span de la misma fuente*: `structure[].span` del IR, calculado de la misma lectura o revisión que el texto mostrado (C5; sección 4, «mismo origen»).
2. *Campo / `field_path`*: el nodo `field` del IR, con su `owning_section` solo cuando exista (C6) y sin span exacto (C7, que no bloquea el foco de campo ni de contenedor).
3. *Referencia de archivo*, identificada por **documento, campo, posición y valor** (C4, C4b, C11a; requiere que H-03 conserve campo y posición antes de concatenar).
4. *Arista `schema`* con sus procedencias: campo y valor declarado, o `source_field`/`ref_path`/`ref_index` en composición, y todas las que colapsen en una arista mostrada (C8, C9).

Cada representación (texto, graph, Code) muestra **solo la correspondencia que existe** para ese elemento y no inventa un resaltado equivalente donde falta: el archivo externo no se atribuye a un nodo del grafo (C11b), no hay mapeo texto→código (C12) y no hay span por campo (C7). WS13.3 **conserva y restaura** ese foco por documento (clave de sesión, 5.3; `dag.yaml:945-950`). Todo esto cabe en componentes y rutas de graph_ui ya previstos (`dag.yaml:850-852`) y no requiere inventar una API semántica en sldb: los datos salen de `ir`, `load_edge_index` y las listas `files`/`references`, que ya entregan sldb y graph_ui.

### 6.2 Nota de alcance (WS13.1)

La aceptación de WS13.1 dice que «seleccionar en Code, texto o graph actualiza ese foco y las demás representaciones del mismo documento lo comparten» (`dag.yaml:865-867`), y su alcance admite compartir foco «solo donde exista correspondencia real de origen definida WS11» (`dag.yaml:857-859`). **Root decidió no reducir WS13.1 a C1-C4 actuales**: ese conjunto es el inventario actual, no la frontera de lo realizable; los datos reales de 6.1 definen un **delta futuro acotado en graph_ui**. Este contrato compromete ese dominio; lo que queda fuera (C7, C11b, C12 y el traslado de C14b) no se compromete y no bloquea el foco de 6.1. Mientras ese delta no tenga su recibo propio (sección 12), WS13.1 no puede declararse cumplido en foco texto/code/graph.

## 7. Errores de lectura y estados de red (consumidor: WS15.1)

### 7.1 Respuestas del servidor que existen

| Código | Cuándo | Evidencia |
|---|---|---|
| 200, `ok:true` | Nodo o catálogo; la proyección puede traer su propio fallo (abajo) | `GU/workspace_routes.py:92`, `:94` |
| 400 | `id` ausente; `depth` distinto de 1 o 2; identificador con `..` o prefijo de ruta; identidad ambigua | `:84-91`, `:134-135`, `:264-267`, `:299-300` |
| 404 | Documento no encontrado; ruta de workspace desconocida | `:352`, `:96` |
| 405 | Método distinto de GET | `:74-75` |
| 500 | Error no previsto; error al cargar documentos del catálogo | `:99-100`, `:108-109` |
| 503 | `El store no está disponible.` (sin store, store inexistente o sin `editor_store`) | `:104-105`, `:131-132` |
| 501 | Workspace en modo remote | `GU/serve.py:320-322` |
| Forma | `{ok:false, error:<texto>}` con el estado HTTP | `:75`, `:98`, `:100`; `GU/serve.py:json_response` |

### 7.2 Fallos dentro de un 200

- `projections.document.ok=false` + `error`: el IR no se construyó (`GU/workspace_routes.py:152-164`). La UI muestra el payload y un aviso (`workspace-view.js:325-332`).
- `projections.graph.ok=false` + `error` (`:422-429`).
- `projections.code`: `ok=false` con `error` si el documento está degradado (`:432-439`); y cada archivo con `status` (`:481-575`).
- Documento degradado: `is_degraded` y `degraded_reason` en `node` y `context` (`:217-218`, `:240`, `:309-346`).
- `documents_error` si el catálogo del store no se pudo listar al resolver un nodo (`:139-145`, `:216`, `:242`).
- `content_hash_error` y `file_revision_error` (`:173-198`).
- Problemas del índice de aristas: `{ok, problems, store_problems_count, error}` (`:577-609`) y su lectura `formatProblems` en cuatro estados `clean`, `node_problems`, `store_problems`, `error` (`workspace.mjs:63-81`). No sustituye `sldb stores check`, `deskops doctor` ni `drift check` (`reconciliacion.md` C-06).

### 7.3 Cliente

`request()` lanza `Error(body.error || 'No se pudo completar la operación')` cuando la respuesta no es 2xx o `ok===false`, adjunta `error.body`, y aplica timeout de 60 s (`GU/shell/api.js:4-13`). **Descarta `response.status`**: lo usa solo para decidir si lanza (`response.ok`, `:7`) y no lo guarda en el error (`:8-10`); el código HTTP no llega al consumidor y, como `response.json()` se evalúa antes (`:6`), una respuesta de error que no sea JSON tampoco conserva su estado. `loadCatalog` y `loadNode` muestran `err.message` en el panel (`workspace-view.js:126-130`, `:185-189`, `:316-317`). Una caída del backend o una respuesta no-JSON llega como la excepción nativa de `fetch`/`json()`: **por lectura de `api.js` y por el comportamiento estándar de `fetch`; no se ejecutó**. No hay forma normalizada de «sin respuesta»: la persona ve el mensaje del navegador.

**Delta de WS15.1 en el wrapper cliente** (`frontends/mindmap/shell/api.js`, en el `output_scope` de WS15.1; además del renderer, sin API nueva de sldb): manteniendo `error.body` y la compatibilidad con sus consumidores, `request()` debe tipificar y conservar el estado HTTP y distinguir error de red (rechazo de `fetch` o vencimiento del timeout), error HTTP con cuerpo `{ok:false,error}` y respuesta no-JSON, de modo que E1-E3 sean distinguibles y E2 pueda mostrar el código (7.5). Es la razón de que H-09 deje de ser solo un renderer. WS13.1 usa el `request()` vigente, no lo modifica y no espera a WS15.1; WS15.1 depende de WS13 y lo tipifica después, compatible con esos consumidores, así que no hay dependencia circular.

### 7.4 Fallo de carga CDN

`index.html` declara un `importmap` con `esm.sh` para react, react-dom, @xyflow/react, htm, dagre, elkjs y lucide, y una hoja de estilos de `esm.sh` (`GU/index.html:7-8`). Búsqueda de `onerror`, `onError` y `import(` en `index.html`, `app.js` y `shell/*.js`: sin manejo de fallo de carga (solo `try/catch` de `localStorage` e `history`). Como el árbol de módulos se resuelve por el importmap antes de que exista cualquier panel React, **un panel dentro de la aplicación no puede informar ese fallo**; el diagnóstico tiene que vivir fuera del árbol que no cargó. Eso es decisión de implementación de WS15.1; el contrato fija lo observable, no el mecanismo. El empaquetado offline está fuera de alcance (`alcance.md:21,23`); no se afirma funcionamiento sin red.

### 7.5 Estados que WS15.1 debe distinguir (observable)

| Estado | Se reconoce porque | Qué debe verse | Qué debe conservarse |
|---|---|---|---|
| E1 Sin respuesta del backend | `fetch` rechaza o vence el timeout | «Backend sin respuesta» y reintento | Pestañas, foco, historia, último nodo |
| E2 Respuesta de error | HTTP no-2xx con `{ok:false,error}` | El `error` del servidor y el código (hoy el código se descarta en `GU/shell/api.js:5-11`: el wrapper debe conservarlo, 7.3) | Ídem |
| E3 Respuesta ilegible | No es JSON | Mensaje distinto de E2 | Ídem |
| E4 Éxito con fallo de proyección o documento degradado | 200 con `ok:false`/`is_degraded` | Aviso en el panel afectado; el resto sigue | Ídem |
| E5 Referencia rota | `[[x]]` no resuelto por la composición de 5.2 (no por `recover_links`/`audit_links`, que no son el resolutor de la UI) o estado `no_existe`/`fuera_del_repo`/`protegido` en Code | Origen y causa | Navegación |
| E6 Documento ausente | 404 | «Documento no encontrado» + id | Historia |
| E7 Fallo de IR o documento degradado | `projections.document.ok=false` con su `error` (`GU/workspace_routes.py:152-164`), `is_degraded` (`:309-346`) o 422 de la lectura del IR (`GU/sldb_adapter.py:204-205`) | La **causa recibida** tal cual, sin renombrarla. La etiqueta «modelo no importable» se reserva a una causa **corroborada** | Ídem |
| E8 Fallo CDN | Módulos no cargan | Diagnóstico visible; sin prometer offline | No aplica (la app no arrancó) |
| E9 Fuente sin capacidad de edición | Límite read-only | Límite visible, **no** fallo de lectura | Ídem |

**E7 es el caso de E4 sobre el propio documento**: se reconocen igual, y E7 solo añade qué causa se muestra. **Lo recibido no identifica por sí solo un modelo no importable.** El 422 de `sldb_adapter.document_ir` cubre cualquier excepción al leer el archivo o construir el IR (`GU/sldb_adapter.py:201-205`, `except Exception`), es decir también el roundtrip roto, un fallo de lectura u otras excepciones, y la ruta del workspace guarda solo `str(exc)` en `projections.document.error` sin tipo (`GU/workspace_routes.py:162-164`); `is_degraded` por «Fallo al validar documento en disco» tampoco nombra la causa (`:309-310`). Ni el IR no construible, ni `is_degraded`, ni el 422 distinguen la causa; el contrato **no inventa un discriminante que el backend no entrega**: se muestra la causa recibida y la etiqueta de modelo no importable se usa solo si la causa lo corrobora.

No se inventa respuesta del backend ausente: E1 y E8 se prueban simulando la ausencia, no suponiendo qué devolvería. «Reintentar» tras restaurar el backend: el botón Actualizar ya conserva `selectedId`, `tab` y `depth` porque llama `loadNode(selectedId, depth)` sin tocar el estado (`workspace-view.js:296`); el catálogo solo se carga al montar (`:196`).

### 7.6 Qué distingue «error, conflicto, cambio y pérdida de soporte»

`user-flows.md:177` pide un criterio visible. Este contrato fija solo la parte de **lectura**: error (E1-E3, E6), degradado (E4, E7), pérdida de soporte (E5, estados de Code `no_existe`/`fuera_del_repo`/`protegido`). **Conflicto** (409 de guardado, `infraestructura.md:51`) es de WS12/WS19; **cambio** (drift, staleness) es de WS29. Hueco H-15.

## 8. Lectura multidesk de solo lectura (consumidor: WS41)

### 8.1 Alcance

Solo lectura: no hay mutaciones cruzadas, ni envío (`message send` está fuera del baseline, `deskops.md:38`; `user-flows.md:198`), ni copia de documentos ajenos para aparentar navegación federada (`user-flows.md:189`). P07: multidesk inicialmente solo lectura con rutas y aliases explícitos (`decisiones.md:31`, T-P07).

### 8.2 Mecanismo (ver 3.2)

Alias cerrado → `(root, store)`; sin rutas del cliente; sin tocar `SLDB_STORE`. Cada respuesta incluye el alias del desk y el store resuelto, para que «identidad y origen sean visibles».

### 8.3 Lo que sldb ofrece para leer otro store

`open_store(alias_o_ruta)`, `load_edge_index(store, include_linked=False)`, `doc_status(store, ref)` y `search(store_path, …)` reciben el store como argumento (sección 3.1). `doc_status` devuelve `ok/missing/ambiguous/link-missing/link-broken` (`SL/api/stores/doc_status.py:18-33`). **Su docstring («Asking never writes») solo dice que el store consultado no gana entradas, modelos ni hashes de los documentos que referencia (`doc_status.py:3-4`); no garantiza cero escrituras**: `doc_status` abre el store con `open_store(store, mode="readonly")` (`:25`), que migra el layout (`open_store.py:37-38`, sección 5.4). Un enlace a store (`stores add --name`) se resuelve solo si es **directo** (`SL/api/stores/doc_ref.py:1-8`). Las referencias entre stores se escriben `alias:ref` (`doc_ref.py:28-40`), con el alias de un enlace del store de lectura, que no es el alias de operador de 3.2. `load_runtime_documents` federa los stores enlazados solo con `include_linked=True` (`SL/store/query.py:73,76-101`; defecto `False`, `SL/api/documents/runtime_documents.py:17`); graph_ui lo llama sin ese argumento, es decir sin federar (`GU/sldb_adapter.py:386-388`). Por el contrario, el defecto de `load_edge_index` es `include_linked=True` (`SL/api/edges/edge_reading.py:14`): WS41 debe pasar `False` explícito, como ya hace graph_ui (`GU/workspace_routes.py:288`, `:584`).

### 8.4 Cosas que **no** existen y que el contrato registra

- **Ruta de lectura por alias en graph_ui**: `WorkspaceRoutes` tiene un solo store (`workspace_routes.py:68-71`). Hueco H-12, clase API (graph_ui), productor WS41. La URL y la clave de sesión llevan el alias (5.1, 5.3).
- **Enlace de texto entre desks** (decisión root 2 de 2026-11-01, `review-source.md:11`): se resuelve **por composición en graph_ui dentro de WS41**, con el parser y las referencias públicas reales y validación previa; **no se amplía sldb** por faltar un resolutor de wikilinks con alias. Hechos: el parser admite el prefijo dentro del destino y no hay obstáculo sintáctico (`SL/links/parser.py:6`); `resolve_link_target` no tiene rama de alias y trata `alias:x` como nombre o ruta (`SL/links/resolver.py:33-35`); `doc_status` resuelve *referencias* con prefijo de enlace de store, no enlaces de texto (`doc_ref.py:28-40`). La sintaxis y el orden de tratamiento están fijados en 5.2 («Tratamiento obligatorio de un enlace de texto»), para que WS40 y WS17 puedan authorar enlaces reales. H-16 queda como **integración/API de graph_ui en WS41**, con la salvedad independiente de lectura sin mutaciones (abajo). Si la prueba real de WS41 mostrara una falta de capacidad en la API pública de sldb, se actúa como dice 5.4: intake explícito en el repo dueño y su tarea antes del workaround.
- **Lectura sin mutaciones**: `document_edges` reconstruye índices y `open_store(readonly)` migra el layout (sección 5.4); `mode="readonly"` no basta. Obligación y criterio observable en 5.4. Segundo desk: lo verifica WS41; store propio: delta de lectura de WS13.1 y ruta consumida por WS24. Hueco H-14.
- **Configuración confiable de aliases del desk real**: contrato del input en 3.2; no es un documento a generar (H-11).
- **Forma del error multidesk**: ver 8.5.

### 8.5 Errores visibles (la aceptación de WS41 los exige)

| Error | Causa | Contenido mínimo | Fuente del dato |
|---|---|---|---|
| E-MD1 Alias no autorizado | Parámetro explícito de alias de una petición fuera del conjunto cerrado de la configuración confiable, o configuración ausente. No aplica al literal de un enlace de texto que 5.2 (paso 3c) clasifica como nombre local: ese caso es E5 | alias recibido; «no autorizado» | configuración confiable del operador (sección 3.2) |
| E-MD2 Ruta escapada o root arbitrario | Parámetro con ruta, `..`, ruta absoluta o fuera del criterio 3.3 | ruta rechazada y criterio violado | `fuera_del_repo`/`protegido` (`GU/workspace_routes.py:511-529`) |
| E-MD3 Store ausente | El alias autorizado no tiene store | alias y ruta esperada | `store_links` (`missing`/`not-a-store`, `SL/api/stores/store_links.py:15-39`) o 503 (`workspace_routes.py:104`) |
| E-MD4 Documento ausente en el desk destino | `doc_status` ≠ `ok` | `status` y `detail` | `SL/api/stores/doc_ref_status.py` |

La forma JSON sigue la de 7.1 (`{ok:false,error}` + estado HTTP); el campo adicional con el alias es parte de la implementación de WS41, no se fija aquí.

### 8.6 Registro de desks

`RepositoryDoc` da `id`, `path`, `name`, `status`, `description`, `tags` (`DK/deskops/models/repository.py:35-52`). Sirve para **explicar** el directorio de desks (F10) y da identidad; no es autorización automática, aunque el operador puede designarlo como fuente de la configuración confiable (3.2). `list_repo_task_routes` ya lee los Boards de repos registrados en el CLI (`DK/deskops/operations.py:364-394`); graph_ui no lo usa.

## 9. ViewDoc: solo grafo

- ViewDoc es un modelo de spec2viz (datos, sin ruta de store) con `nodes` (`{model, where}`), `relations`, `direction`, `notation`, `layout` (`infraestructura.md:149`; `reconciliacion.md` C-48). **No es contrato universal de UI** ni define formularios, pestañas o tableros (`brief.md:24`).
- Evaluación y rutas **existen en graph_ui, solo en modo local**: `evaluate_view(store, view)` une los documentos de cada `nodes[].model` que cumplen su `where`, filtra aristas por `relations` y `direction`, y toma `layout` de la vista o de la notación (`GU/projection_views.py:107-124`, `:41-62`); `list_views` (`:127`); rutas `GET /api/views`, `/api/views/evaluate`, `POST /api/views/save` (`GU/views_routes.py:69-87`); en modo remote responde 501 (`GU/serve.py:147-150`). `save_view` escribe en `store.parent/sldb/views/<name>.md` y no pasa `expected` (`GU/views_routes.py:56-66`). Notación: delega en `resolve_documents` de spec2viz; sin spec2viz, `notation.error` lo dice (`GU/projection_views.py:85-104`). Todo **existe**, no está aceptado, no se ejecutó.
- **Selección mínima concreta y notación para WS18**: **no hay evidencia en este paquete que fije una selección**. Ni `vistas.md` (F18b: «Selección mínima concreta: no fijada aquí»), ni `user-flows.md` (ninguna UF menciona ViewDoc), ni la reconciliación nombran qué modelos y predicados debe seleccionar un ViewDoc concreto. Las capacidades de evaluación están (arriba), pero elegir qué subgrafo ver sería inventarlo, y `dag.yaml:1212-1244` lo prohíbe («No inventar selección aquí»). **Declaración: la promoción de WS18 se detiene** hasta que un cambio de alcance o una decisión de producto, de root o del solicitante P01, fije la selección y la notación. Root confirmó el 2026-11-01 (decisión 3, `review-source.md:12`) que WS18 sigue detenida por la selección y la notación mínimas no fijadas, que es **opcional**, que no bloquea el contrato básico, el lector ni el manual, que no se elige un subgrafo por reflejo y que **no requiere una nueva pregunta al humano ahora**. WS18 no es prerrequisito del lector ni del manual básico (`alcance.md:27`; `dag.yaml:1565-1590`, WS24 no espera ViewDoc).
- Ruta `sldb/views/` prevista y repo de escritura: pendiente de confirmación al promover (`dag.yaml:1222-1224`); `save_view` de graph_ui escribe bajo `store.parent/sldb/views/`, que es la carpeta del proyecto dueño del store, y eso no prueba que sea del repo spec2viz (`reconciliacion.md` C-50).
- G_SPEC_VIEW: ver sección 12.

## 10. Authored, derivado y preferencia local

| Clase | Qué es | Ejemplos de este contrato |
|---|---|---|
| **Authored** | Texto o estructura escrita por persona o agente como fuente | Un Markdown no modelado; un documento modelado **cuya fuente la escribe una persona o un agente** y sus campos; el RepositoryDoc; las entradas y el mapa de P09 (`decisiones.md:33`); las plantillas, el generador y la definición del corpus de WS40 |
| **Derivado** | Calculado desde otras fuentes; se regenera | Catálogo, vecindad, `incoming_relations`, backlinks, `content_hash`, `file_revision`, IR, lista de issues por estado, lista de desks, el árbol del explorador, el progreso de lectura; SpecDoc y SpecNodeDoc materializados desde el YAML del spec; el manifiesto generado de WS40 (roots, stores, commits, documentos), aunque se versionara |
| **Preferencia local** | Estado de sesión o disposición, no documento compartido (P07, `decisiones.md:31`) | Foco, pestañas, divisiones, profundidad, filtro, historia de la sesión |

Reglas:

1. **El runtime volátil no es documento compartido por defecto** (`vistas.md` reglas a precisar; `brief.md`): estado de workers, intentos y conversaciones se leen del runtime (`deskops.md:140-141`). Un RunDoc authored es otra cosa que su estado operativo.
2. **Sin modelo nuevo** para organizar entradas ni listas derivables: un índice de issues, de FAQ o de desks se calcula (consulta) o se escribe como Markdown authored con enlaces; no se crea un modelo por reflejo (`vistas.md` reglas; `dag.yaml:1170-1198`, índice authored = texto curado, no copia de listados).
3. **Preferencia local** no se persiste como documento. La disposición de WS13.3 es por sesión de navegador, sin exigir persistencia tras recargar (`dag.yaml:933-973`).
4. Las entradas y el mapa del desk (P09) son authored, en deskops, y se **publican** con WS43; el contrato de identidad no las crea (WS17 las escribe como plantillas, WS43 publica). Cuando los listados dependan de lo que ya resuelve una consulta, no se copian.
5. **Authored no equivale a «modelado»**: que un documento esté registrado en un store no lo hace fuente. SpecDoc y SpecNodeDoc materializados por `spec2viz diagram sync` son derivados del YAML del spec, que es la fuente (`vistas.md` F18a, `infraestructura.md:35`); el manifiesto generado por WS40 es evidencia derivada aunque se versione, y la fuente authored son las plantillas, el generador y la definición del corpus. No hay modelo nuevo por esta distinción.

## 11. Huecos

Clases: **instancia** = documento concreto que falta escribir; **vínculo** = referencia o enlace que falta entre documentos existentes; **consulta** = selección o lista derivable sin operación pública para obtenerla; **API** = operación pública ausente en el repo dueño; **renderer** = representación ausente en graph_ui con datos ya disponibles. Cuando aplican dos, se elige la que falta primero y se dice. «Productor» = nodo de `dag.yaml`. Hueco de escritura → WS12. Una candidatura sigue siendo candidatura.

| ID | Hueco | Clase (y por qué esa) | Dueño | Productor |
|---|---|---|---|---|
| H-01 | Lectura del archivo propio de un documento (fuente íntegra + render, modelado o no), con el mismo origen (render y fuente de la misma lectura o revisión, sección 4) | API: en estas rutas no hay lectura que devuelva el texto del archivo propio (`workspace_routes.py:431-458`; sección 2.2); falta antes que el renderer | graph_ui | WS13.1 |
| H-02 | Explorador y árbol de Markdown no modelado del desk, con refresco explícito del catálogo y lista de permitidos (3.3) | API: no hay operación de listado en graph_ui ni en sldb (`workspace_routes.py:102-127`); falta antes que el renderer | graph_ui | WS13.2 |
| H-03 | Campo de origen (`files` o `references`) y posición de cada tarjeta Code: preservarlos antes de concatenar, para identificar la referencia por documento, campo, posición y valor | API: la ruta concatena y pierde el campo y la posición (`workspace_routes.py:441-451`) | graph_ui | WS13.1 |
| H-03b | Campo ↔ arista (C8/C9), con multiplicidad: el campo está en el registro de arista de sldb, la ruta de graph_ui no lo entrega y la deduplica por `(source, target, type, relation_doc)` (`workspace_routes.py:384`) | API (ruta de graph_ui); luego renderer. sldb ya tiene el dato en `load_edge_index` | graph_ui | WS13.1 (delta futuro comprometido por la decisión root 1; ver 6.1 y 6.2) |
| H-04 | Foco por sección y campo en texto (C5, C5b, C6), con la vista de texto con líneas; `owning_section` es opcional (C6) | renderer: los datos ya llegan al cliente (IR); para no modelados, antes falta H-01 y verificar la reutilización de C5b | graph_ui | WS13.1 |
| H-05 | Rango de líneas por campo (C7) | API: `_build_field_nodes` no asigna `span`; no bloquea el foco de campo ni de contenedor | sldb | sin productor en el DAG; no comprometido |
| H-05b | Tres capacidades distintas, no una sola imposible: (a) foco de la referencia explícita de una tarjeta Code en el texto (C11a); (b) rango local de Code, archivo/revisión/líneas, con selección por la persona (C14a); (c) mapeo semántico de las líneas de un archivo externo a texto/graph (C11b) y traslado del rango de Code al Markdown (C14b) | (a) y (b): API/renderer de graph_ui con datos reales, (a) depende de H-03; (c): no hay correspondencia | graph_ui | (a) y (b): WS13.1. (c): **sin productor y sin compromiso** (F17 no lo compromete, `vistas.md:349,351`) |
| H-06 | Seguir `[[…]]` y mostrar referencia rota desde el texto | API: graph_ui no consume `sldb.links` en estas rutas y `recover_links`/`audit_links` no sirven como resolutor de la UI (5.2); falta antes que el renderer; se compone `parse_links` + `split_anchor` + `doc_status` o la lectura protegida, con autorización antes de leer | graph_ui | WS13.1 (seguir enlace en el desk propio); WS41 (entre desks); WS15.1 (referencia rota) |
| H-07 | Pestañas, divisiones y foco por documento (disposición local) | renderer | graph_ui | WS13.3 |
| H-08 | Diagnóstico de fallo CDN (E8) | renderer: los «datos» (la carga fallida) viven fuera del árbol React, ver 7.4 | graph_ui | WS15.1 |
| H-09 | Estados E1-E3 distinguibles (con el código HTTP en E2) y reintento sobre catálogo; E7 muestra la causa recibida | API del cliente + renderer: `request()` descarta `response.status` (`GU/shell/api.js:5-11`), así que el dato falta antes que el renderer; el wrapper cliente lo tipifica y conserva sin API nueva de sldb (7.3) | graph_ui | WS15.1 |
| H-10 | Instancia temporal de prueba de WS40 (dos desks y su manifiesto: roots, stores, commits, documentos clave); el manifiesto generado es evidencia derivada (sección 10) | instancia: documento concreto que falta | graph_ui | WS40 |
| H-11 | Aliases reales del desk **real**: configuración confiable suministrada por el operador al arrancar o seleccionar el despliegue (contrato del input en 3.2); no es un documento a generar | Fuera de las cinco clases documentales: es configuración de entrada, no un documento pendiente; **no es una instancia a escribir** ni lleva clase, modelo ni nodo nuevo. Los valores no se inventan | operador (suministra); graph_ui WS41 (consume y valida) | WS11 fija el contrato del input (3.2); WS41 lo consume; sin productor de documento |
| H-12 | Ruta de lectura por alias y URL con repo/alias; clave de sesión con alias (5.3) | API: el workspace tiene un store (`workspace_routes.py:68-71`) | graph_ui | WS41 (historia en WS13.3) |
| H-14 | Lectura sin mutaciones: stores preparados fuera del request y comprobación real al ejecutar los consumidores de que las llamadas escogidas no escriben (5.4); `load_edge_index` en vez de `document_edges`, sabiendo que `open_store(readonly)` aún migra | API: `document_edges` reconstruye índices y `open_store` migra (`workspace_routes.py:356-359`; `open_store.py:37-38`); si no puede sostenerse con la API pública: hueco con dueño y bloqueo del caso antes de implementar | graph_ui | Store propio: delta de lectura WS13.1 y ruta consumida por WS24. Segundo desk: WS41. Si se prueba falta de capacidad: intake explícito en el repo dueño y tarea antes del workaround |
| H-16 | Resolver un enlace de texto entre desks (`[[alias:Model/name]]`, `[[alias:name]]`, `[[alias:ruta#Sección]]`) | API/integración de graph_ui por composición (5.2): `parse_links` + `split_anchor` + autorización + `doc_status`; el resolutor `resolve_link_target` no se usa (`resolver.py:33-35`). No se amplía sldb (decisión root 2) | graph_ui | WS41; salvedad independiente de lectura sin mutaciones (H-14) |
| H-17 | Enlaces authored entre los dos desks del corpus, con la sintaxis de 5.2 | vínculo (se escriben entre documentos que WS40 genera) | graph_ui | WS40; WS17 para las plantillas |
| H-13 | Diff Git por tarea y repo | renderer/API: `document_history` existe (por documento); el diff por tarea no | graph_ui | WS27.1 |
| H-15 | Criterio visible error/conflicto/cambio/pérdida de soporte (parte de lectura fijada en 7.6) | renderer | graph_ui | WS15.1 (error), WS29 (cambio); conflicto: WS12/WS19 |
| H-18 | Tablero, dependencias y apertura de TaskDoc/pills en el lector | renderer: `GET /api/desk/board` y `/task` existen (`DeskRoutes.board` y `DeskRoutes.dispatch` en `GU/deskops_routes.py`; `board` desde `:31`) | graph_ui | WS22 |
| H-19 | Procedimiento: renderer de RitualDoc/StepDoc | renderer | graph_ui | WS23 |
| H-20 | Vista genérica de conocimiento, clasificación y backlinks completos | renderer, luego consulta | graph_ui | WS24 |
| H-21 | Progreso de paso de un procedimiento | API: ningún campo de progreso en `RitualDoc`/`StepDoc` (`DK/deskops/models/ritual.py:57-82`, `step.py:31-38`; búsqueda de `progress`, `done`, `status`, `complete` y `checked` en esos dos archivos: la única coincidencia es la descripción de `completion`, que es un criterio, `ritual.py:77-79`). `RitualDoc.steps` es una lista de prosa **ordenada** (`list[str]`, `ritual.py:65-68`): tiene orden y posición, sin `StepDoc` enlazado ni progreso. WS23 declara que no se marca por leer (`dag.yaml:1540-1545`) | deskops | sin productor en el DAG; no comprometido |
| H-22 | Campo faltante de `InboxNoteDoc`, `MaterializationContractDoc`, `PillDoc`, `StepDoc`, `DeskFAQDoc`, `RepositoryDoc` | **resuelto por lectura** (ver 13, punto 5) | — | — |
| H-23 | Búsqueda con estados distintos por API | API (sldb ofrece `search`, `SL/api/search.py:26`, y `GET /find`, `SL/cli/serve/find_routes.py:1-12`; en estas rutas graph_ui no los consume: sin coincidencias de `/api/find` ni `.search(` en los `.py`, `.js` y `.mjs` de `GU/`, fuera de `fixtures/`) | graph_ui | WS14 |
| H-24 | Orientación de proyecto sin desk | renderer | graph_ui | WS15.2 |
| H-25 | Captura, ack, respuesta local (inbox), autoría de tareas y edición de campos | **escritura**: remitido a WS12 | deskops / graph_ui | WS12 (contrato); WS25.x, WS26.x, WS19.x, WS21 (UI) |

**Candidaturas sin productor** (siguen como tales, `vistas.md` sección «Candidaturas sin productor»; no son prerrequisito del lector ni compromisos): consulta guardada y búsqueda por significado sin CLI (`infraestructura.md:115,121`; dueño sldb); edición de `RoleDoc` y `RuntimeProfileDoc` (excluida por UF09; dueño deskops); navegación de preguntas de `DeskFAQDoc`; lista de issues en la UI (dueño graph_ui; `issue list` existe como CLI de deskops, `deskops.md:49`, y la UI no tiene ruta que lo llame); renderer de roles; vista Specs embebida en el lector. **Genérico Markdown o modelado no implica renderer especial** de FAQ, issues, roles o Specs. Hallazgo sobre Specs: la vista **Specs sí existe en graph_ui** como vista de primer nivel (`notationView`, `GU/views/specs/notation/notation-view.js:356`, registrada en `GU/shell/registry.js:16`); la auditoría `ui.md` no tiene fila para ella (candidatura de vistas.md). Lo que sigue sin productor es **integrarla en el lector** (candidatura); la vista misma no está aceptada, y de ella se abrieron solo su declaración (`notation-view.js:356`) y su registro (`registry.js:16`), no todo el renderer.

## 12. Mapa de deltas graph_ui que requieren recepción

**Regla** (`dag.yaml` gates `G_UI_READ`, `G_UI_WRITE`, `G_SLDB_WRITE`, `G_SPEC_VIEW`; `reconciliacion.md:27`; `alcance.md:27`): cada delta tiene su propio recibo; `evaluation: per_delta`; `accepted_scope_nodes: []` en todos. El **actor** que registra el acta es el solicitante designado en P01 (`decisiones.md:25`), receptor del repo dueño, al preparar o promover ese delta. El Executor de WS11 no escribe ni commitea actas interrepo y este contrato no afirma que alguna se haya recibido. «Efecto» = qué desbloquea el recibo, según el nodo. **Todas las filas: sin acta registrada** (búsqueda en graph_ui: no existe `runs/subagents/workspace-documental-acceptance/`; `ls` sin resultados).

### 12.1 Lectura: gate G_UI_READ (contrato fuente: este documento)

| ID | Efecto | Actor | Gate | Acta |
|---|---|---|---|---|
| WS13 (agregado) | Se cumple cuando WS13.1-3 cumplen; sin recibo propio | P01 | G_UI_READ | sin acta registrada |
| WS13.1 | Documento/fuente solo lectura, contexto, enlaces, foco | P01 | G_UI_READ | sin acta registrada |
| WS13.2 | Explorador de modelados y no modelados | P01 | G_UI_READ | sin acta registrada |
| WS13.3 | Pestañas, divisiones, historia | P01 | G_UI_READ | sin acta registrada |
| WS14 | Búsqueda por API pública con estados distintos | P01 | G_UI_READ | sin acta registrada |
| WS15 (agregado) / WS15.1 / WS15.2 | Errores de lectura y modo degradado (WS15.1); orientación sin desk (WS15.2) | P01 | G_UI_READ | sin acta registrada |
| WS22 | Board como trabajo navegable en el lector | P01 | G_UI_READ | sin acta registrada |
| WS23 | Procedimiento de rituales y pasos, solo lectura | P01 | G_UI_READ | sin acta registrada |
| WS24 | Vista genérica de conocimiento; no espera ViewDoc | P01 | G_UI_READ | sin acta registrada |
| WS27 (agregado) / WS27.1 / WS27.2 | Diff Git; evidencia declarada/encontrada/verificada | P01 | G_UI_READ | sin acta registrada |
| WS29 | Changes/Integrity (extensión independiente) | P01 | G_UI_READ | sin acta registrada |
| WS35 | Trazabilidad de ejecución (ramal E; además exige G_SCION) | P01 | G_UI_READ (+G_SCION) | sin acta registrada |
| WS40 | Generador del corpus Taller | P01 | G_UI_READ | sin acta registrada |
| WS41 | Lectura segura entre desks | P01 | G_UI_READ | sin acta registrada |

Los IDs son los nodos con `owner_repo: graph_ui` que declaran `G_UI_READ` en `requires` (recomputado leyendo `dag.yaml`: WS13, WS13.1, WS13.2, WS13.3, WS14, WS15, WS15.1, WS15.2, WS22, WS23, WS24, WS27, WS27.1, WS27.2, WS29, WS35, WS40, WS41), que coinciden con `scope_nodes` del gate.

### 12.2 Escritura: solo remisión a WS12

Nodos graph_ui que declaran `G_UI_WRITE` (y `G_WRITE_CONTRACT`): WS19, WS19.1, WS19.2, WS21, WS25, WS25.1, WS25.2, WS26, WS26.1, WS26.2, WS28, WS36, WS39, WS42. Sus huecos de escritura **se remiten a WS12** (H-25) y su contrato de efectos lo produce WS12 (`dag.yaml:723-796`); este contrato no define operación alguna. Receptor: P01. Gates: `G_UI_WRITE` y `G_WRITE_CONTRACT`, con `contract_source: WS12`. Sin acta registrada. En sldb, `G_SLDB_WRITE` cubre WS20 y WS45; también remitido a WS12.

### 12.3 G_SPEC_VIEW (opcional, aparte)

`G_SPEC_VIEW`: alcance WS18 (owner spec2viz), `evaluation: per_delta`, `contract_source: WS11`, receptor P01, `state: pending`, sin acta registrada. Se obtiene al preparar WS18, **no bloquea** la navegación base, ni WS24, ni el manual. La selección que WS18 necesita no está fijada (sección 9).

## 13. Trazabilidad

Cada punto de «Lo que WS11 deberá precisar» de `runs/subagents/20261101-ws09-vistas/result-summary.md`:

| # | Punto | Resolución | Dónde |
|---|---|---|---|
| 1 | Identidad, ruta y modelo opcional del Markdown no modelado (entradas, drawer, issues, FAQ) | **Resuelto como regla**: `(repo, ruta)` con modelo opcional. La implementación (lectura, explorador) es hueco con productor | 2.2; H-01, H-02 |
| 2 | Correspondencia real de origen texto/graph/code, foco compartido, rango dentro de un archivo (F17) | **Resuelto como dominio y tabla**: C1-C3 son navegación y C4 una tarjeta pasiva; el foco interno por documento es un dominio futuro de WS13.1 con procedencia real (decisión root 1: no se reduce WS13.1 a C1-C4); C7, C11b, C12 y el traslado de C14b quedan sin compromiso | 6; 6.1; 6.2; H-03 a H-05b |
| 3 | Selección mínima de ViewDoc y notación (F18b) | **Resuelto como declaración**: no hay evidencia; la promoción de WS18 se detiene | 9 |
| 4 | Vista Specs de Mindmap sin fila en `ui.md` | **Parcialmente resuelto**: la vista existe en graph_ui (`notationView`); integración en el lector sigue siendo candidatura sin productor | 11 (hallazgo) |
| 5 | Campos de `RepositoryDoc`, `InboxNoteDoc`, `MaterializationContractDoc`, `PillDoc`, `StepDoc`, `DeskFAQDoc` | **Resuelto por lectura de modelos** en `DK` (c19c6c0d): `RepositoryDoc` — name, id, path, status, description, tags (`models/repository.py:35-52`); `InboxNoteDoc` — kind (`unclear`/`suggestion`), sender_project, target_project, created_at, status (`open`/`closed`), acknowledged_by, acknowledged_at, title, body (`models/inbox.py:37-61`); `MaterializationContractDoc` — id, title, source_atoms, target_kind, target_identity, intent, validation, tags, provenance (`models/materialization.py:31-61`); `PillDoc` — title, id, status, summary, current_node, history, what, why, when, where, how, how_not, tags (`models/pill.py:59-80`); `StepDoc` — title, id, action, outcome, tags (`models/step.py:31-38`); `DeskFAQDoc` — title, body (`models/faq.py:19-22`). Son campos del modelo, no contrato de UI | 8.6; 13 |
| 6 | Progreso de paso en un procedimiento | **Hueco**: ningún campo de progreso en `RitualDoc`/`StepDoc` (búsqueda acotada a esos dos archivos); `RitualDoc.steps` es prosa ordenada sin `StepDoc` ni progreso; WS23 no marca por leer | H-21 |
| 7 | Aliases y roots autorizados; forma de errores de lectura multidesk | **Resuelto como contrato del input** (decisión root 4): los aliases reales son configuración confiable del operador; WS11 fija el input, WS41 lo consume y valida, WS40 da la instancia de prueba; los valores no se inventan. Enlaces entre desks por composición en graph_ui dentro de WS41 (decisión root 2) | 3.2; 5.2; 8; H-10, H-11, H-16 |
| 8 | Criterio visible error/conflicto/cambio/pérdida de soporte | **Parcial**: la parte de lectura se fija; conflicto y cambio quedan en WS12/WS19 y WS29 | 7.6; H-15 |
| 9 | Forma de errores de API y red (backend ausente, CDN) | **Resuelto como tabla de estados**; mecanismo CDN lo decide WS15.1 | 7 |

FILE:../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion-aprobacion.md
# Aprobación de `navegacion.md`

Decisión root por delegación, 2026-11-01. No es aprobación humana. Texto: `runs/subagents/20261101-ws11-disponibilidad/review-source.md`.

**Aprobado para uso de planificación:** `contratos/navegacion.md`, sha256 `6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e`.

El encabezado de ese archivo dice «borrador» y se conserva como se revisó. Para esos bytes, ese estado queda superado documentalmente por esta nota. Si el archivo cambia, esta nota no lo cubre.

**Condiciones de root, cumplidas:** hash exacto; Tester focal PASS; revisión fresca WS13.1 y WS41 comparada sin contradicción real; checks verdes. Evidencia en ese run.

**No aprueba:** implementación, recepción ni actas. Las filas de la sección 12 siguen «sin acta registrada». Nada se probó en runtime; los ensayos de ausencia de escrituras y readiness son obligaciones de los consumidores.

**Cobertura:** incremental por bytes, no un Tester completo único sobre el contrato final: `runs/subagents/20261101-ws11-alineacion/freeze-final.md`.

FILE:frontends/mindmap/workspace_routes.py
"""Multi-projection workspace routes: document IR, neighborhood graph, and referenced code.

Strictly read-only. Adheres to SLDB contracts, safe repo-bounded file inspection,
and zero top-level SLDB imports to support remote/headless modes without regressions.
"""
from __future__ import annotations

import hashlib
from http.server import BaseHTTPRequestHandler
import json
import os
from pathlib import Path
import re
import subprocess
from typing import Any
from urllib.parse import parse_qs, urlparse


MAX_CODE_BYTES = 256 * 1024  # 256 KB max for source previews
TEXT_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript',
    '.mjs': 'javascript',
    '.ts': 'typescript',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.txt': 'text',
    '.sh': 'shell',
    '.bash': 'shell',
    '.toml': 'toml',
    '.sql': 'sql',
    '.xml': 'xml',
}


class WorkspaceError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


class ResolvedNodeDoc:
    """Representación canónica unificada de un nodo resuelto en el store."""
    def __init__(
        self,
        model_name: str,
        name: str,
        path: str = '',
        payload: dict[str, Any] | None = None,
        semantic_tags: list[str] | None = None,
        is_degraded: bool = False,
        degraded_reason: str | None = None
    ):
        self.model_name = model_name
        self.name = name
        self.path = path
        self.payload = payload or {}
        self.semantic_tags = semantic_tags or []
        self.is_degraded = is_degraded
        self.degraded_reason = degraded_reason


class WorkspaceRoutes:
    def __init__(self, store_path: Path | str | None, repo_root: Path | str | None = None, editor_store: Any = None):
        self.store_path = Path(store_path).resolve() if store_path else None
        self.repo_root = Path(repo_root).resolve() if repo_root else (self.store_path.parent if self.store_path else None)
        self.editor_store = editor_store

    def dispatch(self, handler: BaseHTTPRequestHandler, method: str) -> None:
        if method != 'GET':
            return handler.json_response({'ok': False, 'error': f'Método {method} no permitido.'}, 405)

        route = urlparse(handler.path).path
        query = parse_qs(urlparse(handler.path).query)

        try:
            if route == '/api/workspace/node':
                ident = (query.get('id') or [None])[0]
                depth_str = (query.get('depth') or ['1'])[0]
                if not ident:
                    raise WorkspaceError('Parámetro id es obligatorio.', 400)
                try:
                    depth = int(depth_str)
                    if depth not in (1, 2):
                        raise ValueError()
                except ValueError:
                    raise WorkspaceError('depth debe ser 1 o 2.', 400)
                return handler.json_response(self.workspace_node(ident, depth))
            elif route == '/api/workspace/nodes':
                return handler.json_response(self.workspace_nodes())
            else:
                raise WorkspaceError(f'Ruta desconocida: {route}', 404)
        except WorkspaceError as exc:
            return handler.json_response({'ok': False, 'error': str(exc)}, exc.status)
        except Exception as exc:
            return handler.json_response({'ok': False, 'error': str(exc)}, 500)

    def workspace_nodes(self) -> dict[str, Any]:
        """Index of all documents in the store with canonical id Model:name."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)
        try:
            docs = self.editor_store.documents()
        except Exception as exc:
            raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)

        nodes = []
        for d in docs:
            payload = getattr(d, 'payload', {}) or {}
            title = payload.get('title') or payload.get('name') or getattr(d, 'name', '')
            status = payload.get('status', '')
            model_name = getattr(d, 'model_name', '')
            name = getattr(d, 'name', '')
            canon_id = f"{model_name}:{name}"
            nodes.append({
                'id': canon_id,
                'name': name,
                'model_name': model_name,
                'title': title,
                'status': status,
                'path': str(getattr(d, 'path', ''))
            })
        return {'ok': True, 'nodes': nodes}

    def workspace_node(self, ident: str, depth: int = 1) -> dict[str, Any]:
        """Multi-projection data for a selected node."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)

        if not ident or '..' in ident or ident.startswith(('/', '\\')):
            raise WorkspaceError('Identificador inválido o con intento de escape.', 400)

        from sldb.api.documents.document_serialization import doc_version

        docs = []
        documents_error = None
        try:
            docs = self.editor_store.documents()
        except Exception as exc:
            docs = []
            documents_error = str(exc)

        doc = self._resolve_document(ident, docs)
        canon_id = f"{doc.model_name}:{doc.name}"
        payload = getattr(doc, 'payload', {}) or {}

        # 1. Proyección Document (IR estructurado) usando Model/name para evitar ambigüedades
        doc_proj = {'ok': True, 'ir': None, 'payload': payload, 'semantic_tags': getattr(doc, 'semantic_tags', []), 'error': None}
        try:
            # Pasar Model/name que sldb resuelve sin colisión de nombres
            canonical_ref = f"{doc.model_name}/{doc.name}"
            doc_ir = self.editor_store.document_ir(canonical_ref)
            doc_proj['ir'] = doc_ir.get('ir')
            if 'payload' in doc_ir:
                doc_proj['payload'] = doc_ir['payload']
            if 'semantic_tags' in doc_ir:
                doc_proj['semantic_tags'] = doc_ir['semantic_tags']
        except Exception as exc:
            doc_proj['ok'] = False
            doc_proj['error'] = str(exc)

        # 2. Proyección Graph (vecindad a 1-2 hops con una sola llamada a document_edges)
        graph_proj = self._build_graph_neighborhood(canon_id, docs, depth)

        # 3. Proyección Code (archivos y fragmentos referenciados de forma segura)
        code_proj = self._build_code_projection(payload, doc)

        # 4. Contexto lateral
        content_hash = None
        content_hash_error = None
        try:
            content_hash = doc_version(doc)
        except Exception as exc:
            content_hash_error = str(exc)

        file_path = None
        doc_path_raw = getattr(doc, 'path', None)
        if self.repo_root and doc_path_raw:
            try:
                candidate = (self.repo_root / str(doc_path_raw).lstrip('/')).resolve()
                if candidate.is_relative_to(self.repo_root) and candidate.is_file():
                    is_ign, _ = self._is_gitignored(candidate)
                    if not any(p == '.git' for p in candidate.parts) and not is_ign:
                        file_path = candidate
            except (ValueError, OSError):
                file_path = None

        file_revision = ''
        file_revision_error = None
        if file_path and file_path.is_file():
            try:
                file_revision = hashlib.sha256(file_path.read_bytes()).hexdigest()
            except OSError as exc:
                file_revision_error = str(exc)

        incoming = [e for e in graph_proj.get('edges', []) if e['target'] == canon_id]
        outgoing = [e for e in graph_proj.get('edges', []) if e['source'] == canon_id]

        problems_report = self._check_problems_for_node(canon_id)

        context = {
            'id': canon_id,
            'name': doc.name,
            'model_name': doc.model_name,
            'path': str(getattr(doc, 'path', '')),
            'status': payload.get('status', ''),
            'current_node': payload.get('current_node', ''),
            'content_hash': content_hash,
            'content_hash_error': content_hash_error,
            'file_revision': file_revision,
            'file_revision_error': file_revision_error,
            'documents_error': documents_error,
            'is_degraded': getattr(doc, 'is_degraded', False),
            'degraded_reason': getattr(doc, 'degraded_reason', None),
            'summary': payload.get('summary') or payload.get('rationale') or payload.get('goal') or '',
            'incoming_relations': incoming,
            'outgoing_relations': outgoing,
            'problems_report': problems_report,
            'metadata': {
                'tags': getattr(doc, 'semantic_tags', []),
                'pills': payload.get('pills', []),
                'atoms': payload.get('atoms', []),
                'depends_on': payload.get('depends_on', [])
            }
        }

        return {
            'ok': True,
            'node': {
                'id': canon_id,
                'name': doc.name,
                'model_name': doc.model_name,
                'path': str(getattr(doc, 'path', '')),
                'content_hash': content_hash,
                'file_revision': file_revision,
                'is_degraded': getattr(doc, 'is_degraded', False),
            },
            'documents_error': documents_error,
            'projections': {
                'document': doc_proj,
                'graph': graph_proj,
                'code': code_proj,
            },
            'context': context
        }

    def _resolve_document(self, ident: str, docs: list[Any]) -> Any:
        if docs:
            if ':' in ident:
                model_name, name = ident.split(':', 1)
                match = next((d for d in docs if getattr(d, 'model_name') == model_name and getattr(d, 'name') == name), None)
                if match is not None:
                    return match
            elif '/' in ident:
                model_name, name = ident.split('/', 1)
                match = next((d for d in docs if getattr(d, 'model_name') == model_name and getattr(d, 'name') == name), None)
                if match is not None:
                    return match
            else:
                matches = [d for d in docs if getattr(d, 'name') == ident]
                if len(matches) > 1:
                    models = [getattr(d, 'model_name') for d in matches]
                    raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
                if matches:
                    return matches[0]

        # Si docs está vacío o no lo encontró en caché, intentar resolución directa vía runtime_document
        from sldb.api.records.resolve import resolve_runtime_doc
        clean_ref = ident.replace(':', '/')
        pythonpath = getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None
        try:
            rdoc = resolve_runtime_doc(str(self.store_path), clean_ref, pythonpath)
            return ResolvedNodeDoc(
                model_name=rdoc['model'],
                name=rdoc['name'],
                path=rdoc.get('path', ''),
                payload=rdoc.get('payload', {}),
                semantic_tags=rdoc.get('semantic_tags', [])
            )
        except Exception as exc:
            # Fallback seguro usando la API pública de load_edge_index (sin tocar YAMLs internos)
            try:
                from sldb.api.edges.edge_reading import load_edge_index
                idx = load_edge_index(self.store_path, include_linked=False)
                # En idx.nodes las claves son: sldb://document/Model:name
                target_key = f"sldb://document/{ident}" if ':' in ident else None
                m_name, d_name = ident.split(':', 1) if ':' in ident else (None, ident)

                resolved_target = None
                if target_key and target_key in idx.nodes:
                    resolved_target = (m_name, d_name)
                elif not m_name:
                    candidates = [k for k in idx.nodes if k.startswith('sldb://document/') and k.endswith(f":{d_name}")]
                    if len(candidates) > 1:
                        models = [c.replace('sldb://document/', '').split(':', 1)[0] for c in candidates]
                        raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
                    elif len(candidates) == 1:
                        found_canon = candidates[0].replace('sldb://document/', '')
                        resolved_target = found_canon.split(':', 1)

                if resolved_target:
                    found_model, found_name = resolved_target
                    discovered_path = ''
                    extracted_payload = {}
                    is_degraded = True
                    degraded_reason = f'Fallo al validar documento en disco ({exc})'

                    # Intentar rescatar frontmatter y código de archivos sanos en disco
                    if self.repo_root:
                        for cand in [
                            self.repo_root / f"desk/tasks/{found_name}.md",
                            self.repo_root / f"desk/contexts/{found_name}.md",
                            self.repo_root / f"desk/rituals/{found_name}.md",
                            self.repo_root / f"desk/roles/{found_name}.md",
                            self.repo_root / f"desk/runs/{found_name}.md",
                            self.repo_root / f"desk/relations/{found_name}.yaml",
                            self.repo_root / f"desk/relations/{found_name}.md",
                        ]:
                            if cand.is_file():
                                discovered_path = str(cand.relative_to(self.repo_root))
                                try:
                                    t = cand.read_text(encoding='utf-8')
                                    if t.startswith('---'):
                                        parts = t.split('---', 2)
                                        if len(parts) >= 3:
                                            import yaml
                                            extracted_payload = yaml.safe_load(parts[1]) or {}
                                            # Si tiene frontmatter válido con id coincidente, el documento físico es sano
                                            if extracted_payload.get('id') == found_name:
                                                is_degraded = False
                                                degraded_reason = None
                                except Exception:
                                    pass
                                break

                    return ResolvedNodeDoc(
                        model_name=found_model,
                        name=found_name,
                        path=discovered_path,
                        payload=extracted_payload,
                        is_degraded=is_degraded,
                        degraded_reason=degraded_reason
                    )
            except WorkspaceError:
                raise
            except Exception:
                pass
            raise WorkspaceError(f'Documento no encontrado: {ident}', 404)

    def _build_graph_neighborhood(self, root_id: str, docs: list[Any], depth: int) -> dict[str, Any]:
        try:
            from sldb.api.edges.document_edges import document_edges

            pythonpath = getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None
            edges = document_edges(self.store_path, pythonpath=pythonpath)
            adj: dict[str, list[Any]] = {}
            for edge in edges:
                adj.setdefault(edge.source, []).append(edge)
                adj.setdefault(edge.target, []).append(edge)

            visited_nodes: dict[str, int] = {root_id: 0}
            current_level = {root_id}

            for current_depth in range(1, depth + 1):
                next_level = set()
                for nid in current_level:
                    for edge in adj.get(nid, []):
                        neighbor = edge.target if edge.source == nid else edge.source
                        if neighbor not in visited_nodes:
                            visited_nodes[neighbor] = current_depth
                            next_level.add(neighbor)
                current_level = next_level

            # Filtrar aristas cuyos dos extremos estén en visited_nodes
            seen_edges = set()
            neighborhood_edges = []
            for nid in visited_nodes:
                for edge in adj.get(nid, []):
                    if edge.source in visited_nodes and edge.target in visited_nodes:
                        edge_key = (edge.source, edge.target, edge.type, edge.relation_doc)
                        if edge_key not in seen_edges:
                            seen_edges.add(edge_key)
                            neighborhood_edges.append({
                                'source': edge.source,
                                'target': edge.target,
                                'type': edge.type,
                                'origin': edge.origin,
                                'relationDoc': edge.relation_doc
                            })

            doc_map = {f"{getattr(d, 'model_name')}:{getattr(d, 'name')}": d for d in docs}
            nodes = []
            for nid, hop in visited_nodes.items():
                d = doc_map.get(nid)
                m_name, n_name = nid.split(':', 1) if ':' in nid else ('', nid)
                title = ''
                status = ''
                if d:
                    p = getattr(d, 'payload', {}) or {}
                    title = p.get('title') or p.get('name') or n_name
                    status = p.get('status', '')
                nodes.append({
                    'id': nid,
                    'name': n_name,
                    'model_name': m_name,
                    'title': title,
                    'status': status,
                    'depth': hop
                })

            return {
                'ok': True,
                'depth': depth,
                'nodes': nodes,
                'edges': neighborhood_edges,
                'error': None
            }
        except Exception as exc:
            return {
                'ok': False,
                'depth': depth,
                'nodes': [],
                'edges': [],
                'error': str(exc)
            }

    def _build_code_projection(self, payload: dict[str, Any], doc: Any = None) -> dict[str, Any]:
        if getattr(doc, 'is_degraded', False):
            reason = getattr(doc, 'degraded_reason', None) or 'Documento corrupto en disco (payload no disponible).'
            return {
                'ok': False,
                'files': [],
                'total': 0,
                'error': f'Código no disponible: {reason}'
            }

        raw_refs = []
        if isinstance(payload.get('files'), list):
            raw_refs.extend(payload['files'])
        if isinstance(payload.get('references'), list):
            raw_refs.extend(payload['references'])

        inspected = []
        for ref in raw_refs:
            if not isinstance(ref, str) or not ref.strip():
                continue
            inspected.append(self._inspect_file_reference(ref.strip()))

        return {
            'ok': True,
            'files': inspected,
            'total': len(inspected),
            'error': None
        }

    def _is_gitignored(self, resolved: Path) -> tuple[bool, str]:
        """Verifica si un archivo está ignorado por git, distinguiendo repositorios válidos y fallando cerrado."""
        if not self.repo_root:
            return False, ""
        dot_git = self.repo_root / '.git'
        if not dot_git.exists():
            return False, ""  # No es un repo git: no hay .gitignore que evaluar
        try:
            res = subprocess.run(
                ['git', '-C', str(self.repo_root), 'check-ignore', '-q', str(resolved)],
                capture_output=True,
                timeout=2
            )
            if res.returncode == 0:
                return True, "Archivo ignorado por .gitignore."
            if res.returncode == 1:
                return False, ""
            return True, f"Acceso restringido: verificación git falló (código {res.returncode})."
        except Exception as exc:
            return True, f"Acceso restringido: error al ejecutar git check-ignore ({exc})."

    def _inspect_file_reference(self, ref: str) -> dict[str, Any]:
        """Clasifica una referencia a archivo sin filtrar en silencio y protegiendo fronteras."""
        # Detectar URLs externas o identificadores de modelo/lógicos explícitos
        if ref.startswith(('http://', 'https://')):
            return {'reference': ref, 'status': 'no_es_ruta', 'message': 'URL externa.'}

        # Desglosar posible fragmento de línea `:123`
        fragment_line = None
        path_str = ref
        m = re.match(r'^(.*):(\d+)$', ref)
        if m:
            path_str = m.group(1)
            fragment_line = int(m.group(2))

        candidate = Path(path_str)

        # Si no parece ruta y no existe en disco, clasificar como no_es_ruta
        if not self.repo_root:
            return {'reference': ref, 'status': 'sin_repo_root', 'message': 'No se configuró repo_root.'}

        if candidate.is_absolute():
            resolved = candidate.resolve()
        else:
            resolved = (self.repo_root / candidate).resolve()

        # Si no existe en disco ni como ruta relativa ni absoluta, verificar si parece ruta
        if not resolved.exists():
            # Si contiene / o tiene extension comun, es una ruta inexistente
            if '/' in path_str or candidate.suffix in TEXT_EXTENSIONS or '.' in candidate.name:
                # Comprobar seguridad de frontera aun si no existe
                if not resolved.is_relative_to(self.repo_root):
                    return {'reference': ref, 'path': str(candidate), 'status': 'fuera_del_repo', 'message': 'La ruta escapa del repositorio.'}
                return {'reference': ref, 'path': str(candidate), 'status': 'no_existe', 'message': 'El archivo o directorio no existe.'}
            return {'reference': ref, 'status': 'no_es_ruta', 'message': 'Referencia lógica o de modelo.'}

        # Comprobar si escapa del repositorio (symlink hacia afuera o ruta absoluta externa)
        if not resolved.is_relative_to(self.repo_root):
            return {'reference': ref, 'path': str(candidate), 'status': 'fuera_del_repo', 'message': 'La ruta o enlace simbólico escapa del repositorio.'}

        # Comprobar archivos protegidos (.git o gitignored)
        rel_path = resolved.relative_to(self.repo_root)
        rel_parts = rel_path.parts
        if '.git' in rel_parts:
            return {'reference': ref, 'path': str(rel_path), 'status': 'protegido', 'message': 'Ruta interna de control de versiones .git.'}

        # Comprobar git check-ignore con política segura
        is_ignored, ignore_msg = self._is_gitignored(resolved)
        if is_ignored:
            return {'reference': ref, 'path': str(rel_path), 'status': 'protegido', 'message': ignore_msg}

        if resolved.is_dir():
            return {'reference': ref, 'path': str(rel_path), 'status': 'directorio', 'message': 'Es un directorio, no un archivo de código.'}

        try:
            stat = resolved.stat()
            if stat.st_size > MAX_CODE_BYTES:
                return {'reference': ref, 'path': str(rel_path), 'size': stat.st_size, 'status': 'demasiado_grande', 'message': f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.'}

            content_bytes = resolved.read_bytes()
            if b'\x00' in content_bytes:
                return {'reference': ref, 'path': str(rel_path), 'status': 'binario', 'message': 'Archivo binario no visualizable como texto.'}

            # Detección de encoding limpio
            has_replacement = False
            try:
                text = content_bytes.decode('utf-8')
            except UnicodeDecodeError:
                text = content_bytes.decode('utf-8', errors='replace')
                has_replacement = True

            lines = text.splitlines()
            suffix = resolved.suffix.lower()
            language = TEXT_EXTENSIONS.get(suffix, 'text')

            res_dict = {
                'reference': ref,
                'path': str(rel_path),
                'status': 'ok',
                'language': language,
                'content': text,
                'line_count': len(lines),
                'size': stat.st_size,
                'encoding': 'utf-8' if not has_replacement else 'utf-8-replaced'
            }
            if fragment_line is not None:
                res_dict['fragment_line'] = fragment_line
                # Extraer fragmento alrededor de la línea solicitada (+/- 5 líneas)
                start_l = max(1, fragment_line - 5)
                end_l = min(len(lines), fragment_line + 5)
                res_dict['fragment_content'] = '\n'.join(lines[start_l - 1:end_l])
                res_dict['fragment_span'] = [start_l, end_l]

            return res_dict
        except Exception as exc:
            return {'reference': ref, 'status': 'error_lectura', 'message': str(exc)}

    def _check_problems_for_node(self, canon_id: str) -> dict[str, Any]:
        """Comprueba problemas reportados por el índice de aristas de SLDB para este nodo."""
        if not self.store_path or not self.store_path.exists():
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': 'Store no disponible'}
        try:
            from sldb.api.edges.edge_reading import load_edge_index

            idx = load_edge_index(self.store_path, include_linked=False)
            raw_problems = list(getattr(idx, 'problems', []) or [])
            node_name = canon_id.split(':', 1)[1] if ':' in canon_id else canon_id

            matched_problems = []
            for prob in raw_problems:
                if not isinstance(prob, str):
                    continue
                # El formato de sldb para aristas rechazadas es:
                # relation '<rel>': <source|target> '<Model:name>' is not a tracked document
                if (
                    f"'{canon_id}'" in prob
                    or f"'{node_name}'" in prob
                    or prob.startswith(f"relation '{node_name}':")
                    or prob.startswith(f"relation '{canon_id}':")
                ):
                    matched_problems.append(prob)

            return {
                'ok': len(matched_problems) == 0,
                'problems': matched_problems,
                'store_problems_count': len(raw_problems),
                'error': None
            }
        except Exception as exc:
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': str(exc)}


def configured_workspace_routes(store_path: Path | str | None, editor_store: Any = None) -> WorkspaceRoutes:
    if not store_path:
        return WorkspaceRoutes(None, None, editor_store)
    store = Path(store_path).resolve()
    repo_root = store.parent
    return WorkspaceRoutes(store, repo_root, editor_store)

FILE:frontends/mindmap/views/workspace/node/workspace-view.js
import {useEffect, useState, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {irSectionsWithCleanMeta, irFields} from '../../../shared/document-ir.mjs';
import {
  TABS,
  filterCatalog,
  formatHash,
  parseCodeSnippet,
  formatProblems,
  filterGraphEdges,
  distinctEdgeTypes
} from './workspace.mjs';

function CodeFileView({file}) {
  const lineNum = file.fragment_line || file.line;
  const snippet = parseCodeSnippet(file.content, lineNum, 5);
  return html`
    <div className="workspace-code-file-card">
      <div className="workspace-code-file-header">
        <span className="workspace-code-filename">${file.path}${lineNum ? `:${lineNum}` : ''}</span>
        ${lineNum ? html`<span className="workspace-badge">Línea ${lineNum}</span>` : ''}
      </div>
      ${file.error || (file.message && file.status !== 'ok') ? html`<div className="workspace-alert" role="alert">${file.error || file.message}</div>` : ''}
      ${snippet.lines.length ? html`
        <table className="workspace-code-table">
          <tbody>
            ${snippet.lines.map(line => html`
              <tr key=${line.number} className=${'workspace-code-line' + (line.isTarget ? ' target-line' : '')}>
                <td className="workspace-code-line-num">${line.number}</td>
                <td className="workspace-code-line-text">${line.text}</td>
              </tr>
            `)}
          </tbody>
        </table>
      ` : html`<p className="workspace-empty">Archivo vacío o no disponible.</p>`}
    </div>
  `;
}

function IrSectionView({section}) {
  const spanText = section.span ? `L${section.span.line_start ?? ''}-${section.span.line_end ?? ''}` : '';
  return html`
    <div className="workspace-ir-section">
      <h4 className="workspace-ir-title">${section.title || section.name || 'Sección'} ${spanText ? html`<small className="workspace-badge">${spanText}</small>` : ''}</h4>
      ${section.value ? html`<p>${typeof section.value === 'object' ? JSON.stringify(section.value) : String(section.value)}</p>` : ''}
      ${Array.isArray(section.children) && section.children.length ? html`
        <div>${section.children.map((c, i) => html`<${IrSectionView} key=${i} section=${c} />`)}</div>
      ` : ''}
    </div>
  `;
}

function WorkspaceView() {
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [depth, setDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('');
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodeError, setNodeError] = useState('');

  const nodeGen = useRef(0);
  const catalogGen = useRef(0);

  // Sync state with URL params
  const updateUrl = (id, newDepth, tab, replace = false) => {
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set('id', id);
      else url.searchParams.delete('id');
      url.searchParams.set('depth', String(newDepth || 1));
      url.searchParams.set('tab', tab || 'document');
      const newPath = url.pathname + url.search;
      if (replace) {
        window.history.replaceState(null, '', newPath);
      } else {
        window.history.pushState(null, '', newPath);
      }
    } catch {}
  };

  const syncFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const urlDepth = parseInt(params.get('depth') || '1', 10);
      const urlTab = params.get('tab') || 'document';

      if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
      if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
      if (urlId && urlId !== selectedId) {
        setSelectedId(urlId);
      }
    } catch {}
  };

  const loadCatalog = async () => {
    const token = ++catalogGen.current;
    setCatalogError('');
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    const urlDepth = parseInt(params.get('depth') || '1', 10);
    const urlTab = params.get('tab') || 'document';

    if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
    if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);

    try {
      const res = await request('/api/workspace/nodes');
      if (token !== catalogGen.current) return;
      const nodes = res.nodes || [];
      setCatalog(nodes);

      if (urlId) {
        setSelectedId(urlId);
      } else if (nodes.length > 0) {
        setSelectedId(nodes[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (token === catalogGen.current) {
        setCatalogError(err.message || 'Error al cargar catálogo de nodos');
        if (urlId) {
          setSelectedId(urlId);
        } else {
          setLoading(false);
        }
      }
    }
  };

  const loadNode = async (id, currentDepth) => {
    if (!id) {
      setNodeData(null);
      setLoading(false);
      return;
    }
    const token = ++nodeGen.current;
    setLoading(true);
    setNodeError('');
    try {
      const res = await request(`/api/workspace/node?id=${encodeURIComponent(id)}&depth=${currentDepth}`);
      if (token !== nodeGen.current) return;
      const node = res.node || {};
      const projections = res.projections || {};
      const context = res.context || {};
      const normalizedData = {
        identity: {
          id: node.id || id,
          name: node.name || '',
          model: node.model_name || '',
          path: node.path || '',
          status: context.status || node.status || '',
          current_node: context.current_node || '',
          content_hash: context.content_hash || node.content_hash || '',
          content_hash_error: context.content_hash_error || null,
          file_revision: context.file_revision || node.file_revision || '',
          file_revision_error: context.file_revision_error || null,
        },
        document: {
          is_degraded: node.is_degraded || !projections.document?.ok,
          error: projections.document?.error,
          title: projections.document?.payload?.title || projections.document?.payload?.name || node.name || id,
          payload: projections.document?.payload || {},
          ir: projections.document?.ir,
          semantic_tags: projections.document?.semantic_tags || []
        },
        graph: projections.graph || { ok: false, nodes: [], edges: [], error: 'Sin datos de grafo' },
        code: projections.code || { ok: false, files: [] },
        context: {
          status: context.status || '',
          current_node: context.current_node || '',
          outgoing: context.outgoing_relations || [],
          incoming: context.incoming_relations || [],
        },
        problems: context.problems_report || { ok: true, problems: [] }
      };
      setNodeData(normalizedData);
    } catch (err) {
      if (token === nodeGen.current) {
        setNodeData(null);
        setNodeError(err.message || 'Error al cargar datos del nodo');
      }
    } finally {
      if (token === nodeGen.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    const onPopState = () => syncFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => {
      ++catalogGen.current;
      ++nodeGen.current;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadNode(selectedId, depth);
    }
  }, [selectedId, depth]);

  const handleTabChange = tabId => {
    setActiveTab(tabId);
    updateUrl(selectedId, depth, tabId, false);
  };

  const handleDepthChange = newDepth => {
    setDepth(newDepth);
    updateUrl(selectedId, newDepth, activeTab, false);
  };

  const handleSelectNode = id => {
    if (!id || id === selectedId) return;
    setSelectedId(id);
    updateUrl(id, depth, activeTab, false);
  };

  const availableModels = Array.from(new Set(catalog.map(n => n.model_name).filter(Boolean))).sort();
  const filteredNodes = filterCatalog(catalog, searchQuery, modelFilter);
  const problemsInfo = formatProblems(nodeData?.problems);

  const graphEdges = nodeData?.graph?.edges || [];
  const edgeTypes = distinctEdgeTypes(graphEdges);
  const visibleGraphEdges = filterGraphEdges(graphEdges, edgeTypeFilter);

  return html`
    <div className="workspace-view">
      <header className="workspace-header">
        <div className="workspace-header-title">
          <div className="workspace-eyebrow">WORKSPACE / MULTI-PROYECCIÓN</div>
          <h1>${nodeData?.identity?.id || selectedId || 'Workspace'}</h1>
        </div>
        <div className="workspace-controls">
          <div className="workspace-node-select">
            <input
              type="search"
              placeholder="Buscar nodo..."
              value=${searchQuery}
              onChange=${e => setSearchQuery(e.target.value)}
              aria-label="Buscar nodo"
            />
            <select
              value=${modelFilter}
              onChange=${e => setModelFilter(e.target.value)}
              aria-label="Filtrar catálogo por modelo"
            >
              <option value="">Todos los modelos</option>
              ${availableModels.map(m => html`<option key=${m} value=${m}>${m}</option>`)}
            </select>
            <select
              value=${selectedId}
              onChange=${e => handleSelectNode(e.target.value)}
              aria-label="Seleccionar nodo activo"
            >
              ${selectedId && !filteredNodes.some(n => n.id === selectedId) ? html`
                <option value=${selectedId}>${selectedId}</option>
              ` : ''}
              ${filteredNodes.map(n => html`
                <option key=${n.id} value=${n.id}>
                  [${n.model_name}] ${n.title || n.id}
                </option>
              `)}
            </select>
          </div>

          <div className="workspace-depth-control" role="group" aria-label="Profundidad de grafo">
            <button
              className=${'workspace-depth-btn' + (depth === 1 ? ' active' : '')}
              aria-pressed=${depth === 1}
              onClick=${() => handleDepthChange(1)}
            >
              1 hop
            </button>
            <button
              className=${'workspace-depth-btn' + (depth === 2 ? ' active' : '')}
              aria-pressed=${depth === 2}
              onClick=${() => handleDepthChange(2)}
            >
              2 hops
            </button>
          </div>

          <button
            className="workspace-refresh-btn"
            disabled=${loading}
            onClick=${() => loadNode(selectedId, depth)}
          >
            ${loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <nav className="workspace-tabs-bar" aria-label="Proyecciones del nodo">
        ${TABS.map(tab => html`
          <button
            key=${tab.id}
            className=${'workspace-tab-btn' + (activeTab === tab.id ? ' active' : '')}
            aria-selected=${activeTab === tab.id}
            onClick=${() => handleTabChange(tab.id)}
          >
            ${tab.label}
          </button>
        `)}
      </nav>

      ${catalogError ? html`<div className="workspace-alert" role="alert">Error de catálogo: ${catalogError}</div>` : ''}
      ${nodeError ? html`<div className="workspace-alert" role="alert">Error: ${nodeError}</div>` : ''}

      <div className="workspace-body">
        <main className="workspace-main" aria-label="Proyección activa">
          ${loading && !nodeData ? html`<p role="status" className="workspace-empty">Cargando nodo…</p>` : ''}
          ${!loading && !selectedId && !nodeError ? html`<p className="workspace-empty">Selecciona un nodo del catálogo para visualizar sus proyecciones.</p>` : ''}

          ${nodeData && activeTab === 'document' ? html`
            <section className="workspace-doc-pane" aria-label="Proyección Documental">
              ${nodeData.document?.is_degraded ? html`
                <div className="workspace-degraded-banner" role="status">
                  <strong>Documento Degradado</strong>
                  <p>${nodeData.document.error || 'El documento no pudo ser procesado con IR completo, pero su representación básica sigue disponible.'}</p>
                </div>
              ` : ''}

              <header className="workspace-doc-header">
                <h2>${nodeData.document?.title || nodeData.identity?.id}</h2>
                <div className="workspace-doc-meta">
                  <span className="workspace-badge">${nodeData.identity?.model}</span>
                  <code>${nodeData.identity?.path}</code>
                </div>
              </header>

              ${(() => {
                const sections = irSectionsWithCleanMeta(nodeData.document?.ir);
                const fields = irFields(nodeData.document?.ir, nodeData.document?.payload);
                return html`
                  ${sections.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Estructura Documental (IR)</h3>
                      ${sections.map((sec, i) => html`<${IrSectionView} key=${i} section=${sec} />`)}
                    </div>
                  ` : ''}
                  ${fields.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Campos del Documento (IR)</h3>
                      ${fields.map((f, i) => html`
                        <div key=${i} className="workspace-payload-field">
                          <h3>${f.field_path} ${f.span ? html`<small className="workspace-badge">L${f.span.line_start}-${f.span.line_end}</small>` : ''}</h3>
                          ${typeof f.value === 'object' && f.value !== null ? html`
                            <pre><code>${JSON.stringify(f.value, null, 2)}</code></pre>
                          ` : html`
                            <p>${f.value !== null ? String(f.value) : '—'}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : nodeData.document?.payload && Object.keys(nodeData.document.payload).length ? html`
                    <div className="workspace-doc-content">
                      <h3>Payload del Documento</h3>
                      ${Object.entries(nodeData.document.payload).map(([k, v]) => html`
                        <div key=${k} className="workspace-payload-field">
                          <h3>${k}</h3>
                          ${typeof v === 'object' ? html`
                            <pre><code>${JSON.stringify(v, null, 2)}</code></pre>
                          ` : html`
                            <p>${String(v)}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : html`<p className="workspace-empty">Sin contenido estructurado.</p>`}
                `;
              })()}
            </section>
          ` : ''}

          ${nodeData && activeTab === 'graph' ? html`
            <section className="workspace-graph-pane" aria-label="Proyección de Grafo">
              ${nodeData.graph?.ok === false ? html`
                <div className="workspace-alert" role="alert">
                  Error en grafo local: ${nodeData.graph.error || 'No se pudo calcular la vecindad del grafo.'}
                </div>
              ` : html`
                <div className="workspace-graph-filter-bar">
                  <label htmlFor="edge-type-select">Filtrar relación:</label>
                  <select
                    id="edge-type-select"
                    value=${edgeTypeFilter}
                    onChange=${e => setEdgeTypeFilter(e.target.value)}
                    aria-label="Filtrar por tipo de relación"
                  >
                    <option value="">Todas las relaciones (${graphEdges.length})</option>
                    ${edgeTypes.map(t => html`<option key=${t} value=${t}>${t}</option>`)}
                  </select>
                </div>

                <h3>Vecindario Local (${nodeData.graph?.nodes?.length || 0} nodos, ${visibleGraphEdges.length} aristas visibles${edgeTypeFilter ? ` filtradas por "${edgeTypeFilter}"` : ''})</h3>
                <div className="workspace-graph-nodes-grid">
                  ${(() => {
                    const connected = new Set([selectedId]);
                    for (const e of visibleGraphEdges) {
                      if (e.source) connected.add(e.source);
                      if (e.target) connected.add(e.target);
                    }
                    return (nodeData.graph?.nodes || []).map(node => {
                      const isDimmed = !!edgeTypeFilter && !connected.has(node.id);
                      return html`
                        <div
                          key=${node.id}
                          className=${'workspace-graph-node-card' + (node.id === selectedId ? ' is-center' : '') + (isDimmed ? ' dimmed' : '')}
                          onClick=${() => handleSelectNode(node.id)}
                        >
                          <div className="workspace-badge">${node.model_name || 'Doc'}</div>
                          <div className="workspace-graph-node-title">${node.title || node.id}</div>
                          <code>${node.id}</code>
                        </div>
                      `;
                    });
                  })()}
                </div>

                ${visibleGraphEdges.length ? html`
                  <div className="workspace-graph-edges-list">
                    <h4>Aristas del vecindario</h4>
                    ${visibleGraphEdges.map((e, idx) => html`
                      <div key=${idx} className="workspace-edge-item">
                        <code>${e.source}</code>
                        <span className="workspace-edge-rel">──[${e.type || e.rel || 'rel'}]──▶</span>
                        <code>${e.target}</code>
                      </div>
                    `)}
                  </div>
                ` : html`<p className="workspace-empty">No hay aristas que coincidan con el filtro.</p>`}
              `}
            </section>
          ` : ''}

          ${nodeData && activeTab === 'code' ? html`
            <section className="workspace-code-pane" aria-label="Proyección de Código">
              ${!nodeData.code?.ok ? html`
                <div className="workspace-alert" role="status">
                  ${nodeData.code?.error || 'No se pudo generar la proyección de código para este documento.'}
                </div>
              ` : (nodeData.code?.files?.length ? html`
                <div>
                  ${nodeData.code.files.map((file, idx) => html`
                    <${CodeFileView} key=${idx} file=${file} />
                  `)}
                </div>
              ` : html`
                <p className="workspace-empty">Este nodo no tiene archivos de código declarados o vinculados.</p>
              `)}
            </section>
          ` : ''}
        </main>

        <aside className="workspace-sidebar" aria-label="Contexto y Relaciones">
          <section className="workspace-sidebar-section">
            <h3>Identidad Canónica</h3>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">ID</span>
              <strong className="workspace-identity-val">${nodeData?.identity?.id || '—'}</strong>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Modelo</span>
              <span className="workspace-identity-val">${nodeData?.identity?.model || '—'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Estado</span>
              <span className="workspace-identity-val">${nodeData?.identity?.status || 'Sin estado'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Nodo Actual</span>
              <span className="workspace-identity-val"><code>${nodeData?.identity?.current_node || 'Sin nodo'}</code></span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Path</span>
              <span className="workspace-identity-val">${nodeData?.identity?.path || '—'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Content Hash (SLDB)</span>
              ${nodeData?.identity?.content_hash_error ? html`
                <span className="workspace-alert">${nodeData.identity.content_hash_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.content_hash}>
                  ${nodeData?.identity?.content_hash ? formatHash(nodeData.identity.content_hash, 16) : '—'}
                </span>
              `}
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">File Revision (Git/Disk)</span>
              ${nodeData?.identity?.file_revision_error ? html`
                <span className="workspace-alert">${nodeData.identity.file_revision_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.file_revision}>
                  ${nodeData?.identity?.file_revision ? formatHash(nodeData.identity.file_revision, 16) : '—'}
                </span>
              `}
            </div>
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Salientes (${nodeData?.context?.outgoing?.length || 0})</h3>
            ${nodeData?.context?.outgoing?.length ? html`
              <ul className="workspace-rel-list">
                ${nodeData.context.outgoing.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.target)}
                    >
                      <span className="workspace-edge-rel">${rel.type || rel.rel || 'rel'} →</span>
                      <span>${rel.target}</span>
                    </button>
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones salientes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Incidentes (${nodeData?.context?.incoming?.length || 0})</h3>
            ${nodeData?.context?.incoming?.length ? html`
              <ul className="workspace-rel-list">
                ${nodeData.context.incoming.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.source)}
                    >
                      <span className="workspace-edge-rel">← ${rel.type || rel.rel || 'rel'}</span>
                      <span>${rel.source}</span>
                    </button>
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones incidentes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Problemas de Integridad</h3>
            ${problemsInfo.state === 'error' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Error al consultar integridad del store:</strong>
                <p><code>${problemsInfo.error}</code></p>
              </div>
            ` : problemsInfo.state === 'node_problems' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Problemas detectados en este nodo (${problemsInfo.count}):</strong>
                <ul>
                  ${problemsInfo.list.map((p, idx) => html`
                    <li key=${idx}><code>${p}</code></li>
                  `)}
                </ul>
              </div>
            ` : problemsInfo.state === 'store_problems' ? html`
              <div className="workspace-problems-warning" role="alert">
                <strong>Inconsistencias en el store (${problemsInfo.storeTotal}):</strong>
                <p>El store tiene relaciones rechazadas globales que no nombran directamente a este nodo.</p>
              </div>
            ` : html`
              <div className="workspace-no-problems">
                ✓ Sin problemas detectados en el store.
              </div>
            `}
          </section>
        </aside>
      </div>
    </div>
  `;
}

export const workspaceView = {
  id: 'node',
  facet: 'workspace',
  label: 'Workspace',
  component: WorkspaceView,
  shell: {primary: false, workers: 'collapsed'},
  styles: ['/views/workspace/node/workspace.css']
};

FILE:frontends/mindmap/views/workspace/node/workspace.mjs
/**
 * Pure helper functions for the multi-projection workspace view.
 */

export const TABS = [
  { id: 'document', label: 'Documento' },
  { id: 'graph', label: 'Grafo Local' },
  { id: 'code', label: 'Código' }
];

export function filterCatalog(nodes = [], query = '', model = '') {
  const q = (query || '').trim().toLowerCase();
  const m = (model || '').trim().toLowerCase();
  return (nodes || []).filter(node => {
    if (!node) return false;
    const matchesModel = !m || (node.model_name || '').toLowerCase() === m;
    if (!matchesModel) return false;
    if (!q) return true;
    const id = (node.id || '').toLowerCase();
    const title = (node.title || '').toLowerCase();
    const modelName = (node.model_name || '').toLowerCase();
    return id.includes(q) || title.includes(q) || modelName.includes(q);
  });
}

export function formatHash(hash, length = 8) {
  if (!hash || typeof hash !== 'string') return '';
  return hash.slice(0, length);
}

export function parseCodeSnippet(content = '', targetLine = null, context = 3) {
  if (typeof content !== 'string') return { lines: [], startLine: 1, endLine: 1 };
  const allLines = content.split('\n');
  if (targetLine === null || targetLine === undefined || targetLine <= 0) {
    return {
      lines: allLines.map((text, idx) => ({
        number: idx + 1,
        text,
        isTarget: false
      })),
      startLine: 1,
      endLine: allLines.length
    };
  }
  const lineIdx = targetLine - 1;
  const start = Math.max(0, lineIdx - context);
  const end = Math.min(allLines.length, lineIdx + context + 1);
  const slice = allLines.slice(start, end);
  return {
    lines: slice.map((text, offset) => {
      const num = start + offset + 1;
      return {
        number: num,
        text,
        isTarget: num === targetLine
      };
    }),
    startLine: start + 1,
    endLine: end
  };
}

export function formatProblems(problemsData) {
  if (!problemsData) {
    return { state: 'clean', hasProblems: false, list: [], count: 0, storeTotal: 0, error: null };
  }
  const list = Array.isArray(problemsData.problems) ? problemsData.problems : [];
  const storeTotal = problemsData.store_problems_count || 0;
  const error = problemsData.error || null;

  if (error) {
    return { state: 'error', hasProblems: true, list: [], count: 0, storeTotal, error };
  }
  if (list.length > 0) {
    return { state: 'node_problems', hasProblems: true, list, count: list.length, storeTotal, error: null };
  }
  if (storeTotal > 0) {
    return { state: 'store_problems', hasProblems: true, list: [], count: 0, storeTotal, error: null };
  }
  return { state: 'clean', hasProblems: false, list: [], count: 0, storeTotal: 0, error: null };
}

export function filterGraphEdges(edges = [], typeFilter = '') {
  const tf = (typeFilter || '').trim();
  if (!tf) return edges || [];
  return (edges || []).filter(e => (e.type || e.rel) === tf);
}

export function distinctEdgeTypes(edges = []) {
  const types = new Set();
  for (const e of edges || []) {
    const t = e.type || e.rel;
    if (t) types.add(t);
  }
  return Array.from(types).sort();
}

FILE:dag.yaml (WS13.1, WS13.2, WS13.3, sin context_review)
id: WS13.1
title: Leer documento, contexto y enlaces
status: candidate
kind: implementation
depends_on:
- WS11
requires:
- G_UI_READ
owner_repo: graph_ui
output_scope: frontends/mindmap/views/workspace/ (reutilizar node/workspace-view.js y componentes Document/Graph/Code/contexto existentes); rutas de lectura contrato WS11; tests/
scope: Documento/fuente solo lectura, panel de contexto (identidad, relaciones y origen), enlaces y Code local con selección por documento/nodo. Mantener rutas del host; no requerir índices nuevos. Implementación o delta conciliado sobre el workspace integrado a1b2b22, según contrato WS11 y recibo externo del delta. Foco = elemento/nodo seleccionado dentro del documento; documento activo identifica pestaña. Compartir foco solo donde exista correspondencia real de origen definida WS11; no inventar mapeo texto→código.
acceptance: 'Markdown sin modelo tiene render de lectura y fuente cruda íntegra legibles (ambas), con mismo origen; el panel de contexto muestra identidad, las relaciones que declare el contrato WS11 y la ruta de origen reales; seguir un enlace y alternar entre texto/graph/code, en las representaciones que el catálogo WS09 (borradores/vistas.md) y el contrato WS11 declaren soportadas, preserva origen. La selección por documento/nodo fija el foco del documento abierto: seleccionar en Code, texto o graph actualiza ese foco y las demás representaciones del mismo documento lo comparten, sin abrir otra copia. No depender de conocer un ID; no crear otro workspace independiente.  La base a1b2b22 es punto de partida reutilizable; el cierre de este delta exige SU evidencia de aceptación ampliada Markdown no modelado/fuente, enlaces y foco. Ni cierre f16fcd1 ni commit previo sustituyen esa evidencia. Una copia es instancia documental con mismo origen, no cada representación.'
estimate: M
task_file: desk/drawer/tasks/workspace-documental/task-ws13-1.md
promotion: not_authorized; precise changed files/pills/atoms/evidence and task-only preflight required
output_base: graph_ui:repository_root/
node_role: delivery
parent_id: WS13
overlap_with: workspace
integration_mode: delta_or_existing_ticket; matriz WS06 llega de forma transitiva por WS11/WS12; never_parallel_duplicate
reconciliation: 'reconciliacion.md: base a1b2b22/f16fcd1/134a665 reutilizable; acceptance de este nodo/delta pendiente, no duplicar implementación ni inferir cierre por commit'

id: WS13.2
title: Explorar documentos modelados y no modelados
status: candidate
kind: implementation
depends_on:
- WS11
- WS13.1
requires:
- G_UI_READ
owner_repo: graph_ui
output_scope: frontends/mindmap/views/workspace/explorer/; rutas de lectura definidas por el contrato WS11; tests/
scope: Explorador sobre documentos reales del store y Markdown no modelado del desk. El árbol se obtiene de la API del store y del sistema de archivos del desk, según contrato WS11.
acceptance: Desde el explorador abrir un documento modelado y uno no modelado sin conocer su ID ni usar índices nuevos; al añadir un documento al store temporal de prueba, aparece sin cambiar código. Altas de documento modelado en store y Markdown no modelado en desk aparecen tras refresco explícito del catálogo sin reiniciar servidor ni cambiar código. Se permite reutilizar catálogo/filtro existente para modelados; WS11 determina API/seguridad para no modelados.
estimate: S
task_file: desk/drawer/tasks/workspace-documental/task-ws13-2.md
promotion: not_authorized; precise changed files/pills/atoms/evidence and task-only preflight required
output_base: graph_ui:repository_root/
node_role: delivery
parent_id: WS13
overlap_with: workspace
integration_mode: delta_or_existing_ticket; matriz WS06 llega de forma transitiva por WS11/WS12; never_parallel_duplicate
reconciliation: 'reconciliacion.md: base a1b2b22/f16fcd1/134a665 reutilizable; acceptance de este nodo/delta pendiente, no duplicar implementación ni inferir cierre por commit'

id: WS13.3
title: Abrir documentos en pestañas y divisiones con historia
status: candidate
kind: implementation
depends_on:
- WS11
- WS13.1
requires:
- G_UI_READ
owner_repo: graph_ui
output_scope: frontends/mindmap/views/workspace/layout/; rutas de lectura definidas por el contrato WS11; tests/
scope: Pestañas, dos documentos lado a lado, foco e historia de navegación; disposición como estado local según P07, no como documento compartido. Foco es el elemento seleccionado dentro de un documento; origen es su soporte y ruta real. Cambiar de pestaña o división cambia el documento activo sin alterar el foco guardado de cada documento; volver restaura documento, foco y origen. Disposición por sesión de navegador; no se exige persistir tras recargar.
acceptance: Abrir, cambiar y cerrar pestañas; abrir dos documentos en divisiones, alternar el documento activo y volver conservando foco e historia. Volver sigue el orden inverso de navegación.
estimate: S
task_file: desk/drawer/tasks/workspace-documental/task-ws13-3.md
promotion: not_authorized; precise changed files/pills/atoms/evidence and task-only preflight required
output_base: graph_ui:repository_root/
node_role: delivery
parent_id: WS13
overlap_with: workspace
integration_mode: delta_or_existing_ticket; matriz WS06 llega de forma transitiva por WS11/WS12; never_parallel_duplicate
reconciliation: 'reconciliacion.md: base a1b2b22/f16fcd1/134a665 reutilizable; acceptance de este nodo/delta pendiente, no duplicar implementación ni inferir cierre por commit'


FILE:vistas.md (fichas F01, F17)
### F01 — Entrada ecosistema/proyecto, índice o mapa

- **Propósito humano**: explicar propósito, superficies y trabajo actual de un proyecto sin rutas memorizadas (`user-flows.md:13`).
- **Origen**: entrada del ecosistema y entrada del desk `desk/README.md` + mapa authored (P09, `decisiones.md:33`; `user-flows.md:15`); registro `desk/registry` con 6 RepositoryDoc (`deskops.md:195,220`). Documento de la entrada del ecosistema y del mapa: no definido; productor de contrato WS11, de plantillas WS17 (`dag.yaml:1170-1198`, owner_repo deskops) y de publicación real WS43 (`dag.yaml:2792-2803`).
- **Identidad**: no definido para entrada y mapa; productor WS11 (`dag.yaml:693-694`). El repo se identifica con `deskops repo whoami` (`deskops.md:101`).
- **Contrato**: sin contrato. Ninguno de los 17 modelos registrados es de entrada o índice (`deskops.md:185-201`); P09 los define como documentos authored (`decisiones.md:33`).
- **Campos y relaciones**: enlaces `[[doc]]` y `[[doc#Sección]]` (`infraestructura.md:88`) y aristas por campo (`infraestructura.md:92`). Campos de RepositoryDoc: no leídos en las auditorías; productor WS11.
- **Renderer existente o requerido**: base existente: panel de nodo y vecindad 1-2 saltos para documentos del store (`ui.md:54-55,69`). Requerido para Markdown no modelado: ausente (`ui.md:55`), productor WS13.1 y WS13.2 (graph_ui; `dag.yaml:841,892`). Lista enlazada de entradas: no definido; contrato WS11, implementación WS13.1 y WS13.2.
- **Navegación**: abrir destinos; URL/`popstate` y tarjetas que reorientan (`ui.md:57,69`); resolver origen y proyecto lo fija WS11 (`dag.yaml:693-697`); otro desk: WS41 (`ui.md:87`).
- **Acción/dueño**: solo lectura. Dueño de las entradas authored: deskops, productor WS17.
- **Destino de escritura**: la UI no escribe. Las plantillas viven en `ejemplo/nav/` del paquete del plan (`dag.yaml:1179`).
- **Error**: condicionado a WS11 y WS13.1: proyecto no accesible o referencia rota muestra el origen y conserva la navegación (`user-flows.md:13`). Contrato de errores de API y red: no definido; productor WS11 (`user-flows.md:30`).
- **Estado**: bloqueado. Necesita el contrato WS11 y los nodos WS13.1, WS13.2 y WS17.
- **Clase**: authored (entrada y mapa); derivado (vecindad, inventario de proyectos: «inventarios... se calculan», línea 25 de este archivo); preferencia local (selección e historia, `decisiones.md:31`).
- **UF**: UF01 (`user-flows.md:9-33`); UF10 (índices authored, `user-flows.md:233`).
- **Evidencia**: `ui.md:54-57,69,87`; `deskops.md:101,185-201,195,220`; `infraestructura.md:88,92`; `user-flows.md:13-33,233`.

### F17 — Código local referenciado

- **Propósito humano**: ver, solo lectura, el archivo o rango que un documento referencia, junto a su soporte.
- **Origen**: `files` y `references` del payload del documento (`ui.md:55`; `reconciliacion.md:51`). Las anclas `code:<ruta>::<símbolo>` son otra capacidad (`infraestructura.md:94`).
- **Identidad**: ruta del archivo con límites de repo, gitignore, binario y tamaño (`reconciliacion.md:5,51`). Identidad de rango y correspondencia nodo-código: no definido; productor de contrato WS11 (`dag.yaml:857-859`).
- **Contrato**: sin contrato.
- **Campos y relaciones**: lee `files`/`references`, no el archivo propio del documento (`ui.md:55`). Mapeo texto-código: no definido; productor WS11; no se inventa.
- **Renderer existente o requerido**: base existente: `_build_code_projection` y `_inspect_file_reference` en la pestaña Código (`ui.md:55,77`; `reconciliacion.md:51`). Soporte de rango dentro del archivo: no leído; no definido; productor WS11. Sin CST supuesto; Tree-sitter queda diferido (`ui.md:183`).
- **Navegación**: foco compartido entre Code, texto y graph solo donde exista correspondencia real de origen definida por WS11 (`dag.yaml:857-859,865-867`); no se inventa mapeo texto-código.
- **Acción/dueño**: leer. Sin edición; el anclaje y la edición de código están en un candidato diferido (`ui.md:46`).
- **Destino de escritura**: ninguno.
- **Error**: condicionado a WS11 y WS13.1: archivo excluido por repo, gitignore, binario o tamaño (`reconciliacion.md:5`). Mensaje y forma: no definido; productor WS11.
- **Estado**: bloqueado. La base existente no basta: origen y foco necesitan el contrato WS11 y WS13.1 (`dag.yaml:841-871`).
- **Clase**: derivado (proyección del archivo referenciado); preferencia local (foco y selección).
- **UF**: ninguna lo usa de forma explícita. UF07 nombra anclas a código (`user-flows.md:171`) y UF05 la apertura de soporte (`user-flows.md:126`); no se afirma equivalencia con esta fila.
- **Evidencia**: `ui.md:46,55,77,183`; `reconciliacion.md:5,51`; `infraestructura.md:94`; `dag.yaml:841-871`; `user-flows.md:126,171`.


