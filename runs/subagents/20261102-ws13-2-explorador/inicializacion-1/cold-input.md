FILE:desk/tasks/task-ws13-2-explorador-de-documentos-modelados-y-no-modelados.md
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

Autoridad: runs/subagents/20261102-ws13-1-correccion/review-source-final.md. Nodo WS13.2 de dag.yaml revisión 10. Contrato: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, §2.2, §3.2, §3.3, §5.4, H-02, con su nota de aprobación. Aceptación técnica de WS13.1 y sus límites: runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md. Referencia reutilizable: runs/subagents/20261102-ws13-1-lector/suplemento-8090.md. La tarea está activa y enrutada; status draft es el campo del modelo. Base: HEAD de main al despacho.

Archivos, lista cerrada: frontends/mindmap/views/workspace/explorer/ nuevo; frontends/mindmap/views/workspace/node/workspace-view.js y workspace.css, solo para montar el explorador y los dos avisos; frontends/mindmap/workspace_routes.py; tests/test_mindmap_workspace_explorer.py nuevo; tests/test_mindmap_workspace_reader.py; tests/e2e_mindmap_workspace.py; tests/mindmap-workspace-explorer.test.mjs nuevo. Archivos de evidencia del run: libres.

1. Lista de permitidos (H-02 y navegacion §3.3). Raíz: repo_root del store que el operador configuró al arrancar. Rutas: variable de entorno WORKSPACE_EXPLORER_ROOTS leída una vez al arrancar, lista separada por comas de rutas relativas a esa raíz; si no está definida, desk y docs. Una entrada absoluta, con .. o que no resuelva dentro de la raíz se ignora y se informa en la respuesta. El cliente nunca aporta rutas. Solo sufijo .md. Se excluye toda ruta con una parte que empiece por punto y las partes __pycache__ y node_modules. Symlinks: no se siguen directorios; un archivo symlink que resuelva fuera de la raíz se excluye. Ignorados por git: excluidos, con fallo cerrado si la comprobación falla, en una sola invocación por lote con argv fijo y sin shell. Sin repo git no hay esa protección: se declara en la respuesta. Tope de 5000 archivos: se trunca con indicador visible.

2. Listado. Ruta GET /api/workspace/explorer en WorkspaceRoutes. Modelados desde indexed_documents; no modelados recorriendo solo las rutas permitidas, sin abrir archivos. Un archivo rastreado no se repite como no modelado: Model:name prevalece (§2.2). Sin caché: cada llamada recalcula. No migra, no reconstruye, no inicializa desk ni store, sin índices nuevos. Un store inexistente da su error, sin crearlo.

3. Explorador. Módulo en views/workspace/explorer/: árbol por carpetas para no modelados, y modelados por modelo, con filtro local. Abrir navega con id o path al lector WS13.1 existente, sin lector paralelo. Botón explícito de refresco que recarga /nodes y /explorer. El selector actual se conserva. Sin pestañas ni split: WS13.3.

4. Catálogo degradado. Un modelo autorizado que no carga no derriba /nodes ni el explorador: la entrada conserva identidad y ruta, con estado modelo_no_carga y la causa recibida, sin inventar otra (navegacion §7, E7). El resto sigue navegable. /source de ese documento devuelve la fuente segura con esa causa y render sobre extract_sections; /node responde degradado, no 500. No se simula payload ni modelo, y no se tocan módulos de modelos.

5. Relaciones indexadas. Donde se muestren relaciones o grafo, un aviso visible dice que salen del índice preparado y no certifican cambios externos, y que si el operador sabe que cambió un documento o contrato tras preparar hay que preparar fuera antes de considerarlas vigentes. No se muestra «todo al día» por stale vacío, no se reconstruye por GET y no se añade mecanismo de frescura. La fuente sigue segura.

Fuera de alcance: shell/api.js, frontends/workspace/, mutaciones, render Markdown, WS13.3, multidesk, API nueva de sldb, Changes, Integrity, Scion, push, puertos 8090, 8091 y 8092, tareas hermanas, cambios de contrato.

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

Acceptance: la del nodo WS13.2 sobre stores temporales reales. Pruebas: abrir modelado y no modelado desde el explorador sin conocer ID; alta de un modelado y de un .md aparecen tras refrescar, sin reiniciar; archivo rastreado sin duplicar; permitidos con entrada inválida; symlink de archivo y de directorio; ignorado; punto; sin repo git; truncado; hashes de .sldb, documentos, git status y HEAD iguales antes y después de cada GET; modelo realmente no importable junto a uno sano, sin caer el catálogo, con fuente legible y causa; aviso de relaciones visible y sin afirmación de frescura; ninguna petición que no sea GET. Prueba que falla contra la base donde aplique. Tester independiente con navegador real. Suite general con 218 previas pasando. G_HUMAN_READ y WS16 pendientes.

FILE:runs/subagents/20261102-ws13-1-correccion/review-source-final.md
# Revisión root de b398d54 y c567b10, texto recibido

Fuente: mensaje de Codex `w3Y:p2`, root por delegación, 2026-11-02. Aceptación técnica, no humana. Texto copiado sin normalizar.

Revisión root de b398d54/c567b10 terminada. Acepto técnicamente los CINCO CORRECTIVOS y WS13.1 para el alcance comprobado: stores canónicos preparados fuera del request, con la preparación vigente durante el recorrido y contratos de identidad/guardias/foco/anclas de WS11. No es aceptación humana ni garantía para cualquier layout/cambio externo. Verifiqué los7SHA de entregable-executor.sha256 contra árbol actual; leí resultados Executor/Tester completos y código pertinente; auditoría adicional backend sin otro blocker para ese alcance. Abrí demo8092 README con Chromium:1lector, sin pageerror. No reejecuté suite218; su ejecución es evidencia del Executor, y el Tester independiente ejecutó sus suites/casos negativos propios. Mantener atribuciones exactas.

Adenda recibida: intake stale YA enviado sldb, checkpoint inicial decía pendiente. Registrar corrección/adenda del checkpoint sin borrar historia y enlazar intake de layout y de stale con evidencia exacta. No confundir intake con solución.

Condiciones/límites de esta aceptación, en nota externa de aprobación root y handoff a consumidores, sin afirmar más:
- Canonical preparado fuera request por responsable/fixture mediante operación pública documentada. No certificar ausencia de migración para layout no canónico (no ensayado, APIprevia ausente). No inventar chequeo de formato interno ni migrar desde GET para aparentar soporte.
- stale=[] NO demuestra frescura ante edición externa de Markdown ni cambio de __references__. La prueba negativa del core nuevo/shard viejo prueba ese estado, no esas ediciones por sí solas. Fuera del snapshot/preparación vigente, grafo/relaciones y su correspondencia con campos actuales no tienen garantía de actualidad; no llamarlo evidencia verificada ni foco confirmado. No afirmar H14 universalmente cerrado. El alcance técnico acepta las5correcciones bajo esa precondición, y mantiene bloqueo de ampliar garantía sin evidencia/API del repo dueño.
- /nodes500 por modelo no importable queda identificado como deuda previa para el explorador/modo degradado; semantic_tags=[] ausencia declarada, no dato semántico verdadero vacío. G_HUMAN_READ/WS16 siguen pendientes; nada de escrituras ni Scion.
- El render básico continúa con tarea propia en drawer. Mantener enlace de productor y dependencia de aceptación para que no quede perdido antes de WS16; no afirmar que esta aceptación lo resuelve.

AUTORIZACIÓN DE CONTINUIDAD: después de registrar recepción/aprobación y ejecutar el ritual de cierre de ESTA fase de lector/corrección (cada tarea conserva su cierre y commit; phasecommit separado si aún falta), COMENZAR IMPLEMENTACIÓN WS13.2. No pedir otra confirmación humana por esta hoja: el usuario autorizó implementar la UI; root delimita su siguiente delta. No poner execution_authorized=true global ni transferir actaWS13.1 como si recibiera otra. Registrar recibo propio del deltaWS13.2 en graph_ui, con instrucción humana original/actorP01 y la selección técnica de root, efecto de autorizar preparación/implementación, sin aceptar resultado humano ni WS16. Mismos límites no push, no8090/8091, sin cambios ajenos/tareasdraft de Changes/edición.

WS13.2 según DAG y WS11: explorador de documentos REALES modelados y Markdown no modelado del desk, con navegación sin conocer ID y refresco explícito del catálogo. Alta de un modelado y un .md real en desk temporal aparecen tras refrescar, sin reiniciar ni índices nuevos. Consumir lector WS13.1 actual por identidad/origen, no lector paralelo. Leer tablaH02/§3.3/lista de permitidos del contrato; TaskDoc fija raíz/rutas permitidas y controles antes de enumerar/leer, derivados de configuración confiable del operador, nunca paths arbitrarios del cliente. Listado no migra, reconstruye ni inicializa desk/store. Mantener source literal y guards/procedencia del lector, preparación externa vigente y snapshotadecuado. No implementar aún tabs/splitWS13.3 ni edición.

En el preflight de esta hoja se debe concretar el traspaso de dos límites pertinentes (no inventar corrección globalSLDB):
1. Catálogo degradado: un modelo autorizado que no carga NO debe derribar todo el explorador. Conservar entrada con identidad/path y diagnóstico por documento, abrir la fuente segura cuando pueda leerse; el resto del catálogo sigue navegable. Esto cabe en el consumo del catálogo y su ruta dentro deWS13.2. No simular payload/modelo ni alterar módulos de modelos para hacer pasar. Probar con modelo realmente no importable y otro sano, store temporal real. No requiere tipificar shell/api.js deWS15.1.
2. Relaciones indexadas: al mostrarse, hacer visible su origen de índice preparado y que no certifican cambios externos; no sustituir stale[] por 'todo al día' ni por falsa prueba de integridad completa. Si el operador sabe que cambió documento/contrato después de preparación, indicar que requiere preparación externa antes de considerar vigentes relaciones/foco; no añadir mecanismo de frescura inventado ni reconstruir por GET. Fuera de ese supuesto sigue fuente/lector seguro, sin usar relaciones dudosas como aceptación de workflow.

Preparación normal: TaskDocdrawer+commit, promoción+commit antesproducto; pills/átomos pertinentes, suplemento8090 y aprobaciónWS13.1/versiones en bundle. PreflightTaskDoc-only y coldconDeepSeekFlash aislado, interpretar salidas COMPLETAS y repetir si cambia inputmaterial. Executor fresco UNA hoja, Tester independiente con backend/store/navegador reales. Reconciliar no solapamiento con tareas heredadas y archivar/descartar ningún ajeno. Pruebas de listado/refresh/abrir/modelosdegradados/contenciónsymlinks/ignorados/inmutabilidad por GET y no datos inventados. Correr suite apropiada al cambio y validación general requerida al cerrar; no repetir218sin motivo si no cambióproducto. Mantener demo8092 actualizable solo en copia temporal, evidencia exacta por revisión y URL.

Entregar arranque WS13.2 con tarea/run y luego checkpoint de producto, sin adelantarWS13.3. Si el diseño necesita ampliar un contrato/crear API nueva o producerSLDB, señalar caso concreto y registrar antes de workaround; continuar partes independientes. La autorización es de implementación real deWS13.2 y del cierre de la fase previa, no solo de otro plan. No bloquear trabajo de explorador por existencia de intakes upstream del alcance excluido.

FILE:runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md
# Aceptación técnica root de WS13.1

Decisión root por delegación, 2026-11-02, sobre producto `bf55151` y corrección `b398d54`, closeouts `ca06f1b` y `c567b10`. Texto: `runs/subagents/20261102-ws13-1-correccion/review-source-final.md`. **No es aceptación humana.** G_HUMAN_READ y WS16 siguen pendientes.

**Alcance aceptado.** Los cinco correctivos y WS13.1 para stores canónicos preparados fuera del request, con la preparación vigente durante el recorrido, y los contratos de identidad, guardias, foco y anclas de WS11. Hashes de los siete archivos verificados por root: `runs/subagents/20261102-ws13-1-correccion/entregable-executor.sha256`.

**Atribuciones.** Suite 218 passed: ejecución del Executor; root no la repitió. Casos negativos propios: Tester independiente.

**Límites para los consumidores.**
- El store canónico se prepara fuera del request, por responsable o fixture, con operación pública documentada. No se certifica ausencia de migración con layout no canónico: no ensayado y sin consulta pública previa. No se inventa chequeo de formato interno ni se migra desde un GET. Intake: `sldb/desk/inbox/20261102-051843-unclear-falta-lectura-publica-de-store-preparado-sin-open-store-ni-migracion.md`.
- `stale=[]` no demuestra frescura ante una edición externa de Markdown ni un cambio de `__references__`. Fuera del snapshot de preparación vigente, grafo, relaciones y su correspondencia con campos actuales no tienen garantía de actualidad: no son evidencia verificada ni foco confirmado. H-14 no queda cerrado universalmente. Intake: `sldb/desk/inbox/20261102-065705-unclear-edgeindex-stale-no-marca-una-edicion-externa-ni-un-campo-nuevo-de-references.md`. Un intake no es una solución.
- `/nodes` con 500 por modelo no importable: deuda previa, pasa a WS13.2. `semantic_tags=[]` es ausencia declarada, no dato semántico vacío.
- Render básico: tarea propia `desk/drawer/tasks/task-render-markdown-legible-del-lector.md`, a resolver antes de WS16, productor por reconciliar en deskops (`promotion-notes.md`, adenda WS13.1). Esta aceptación no lo resuelve.
- Sin escrituras ni Scion.

FILE:runs/subagents/workspace-documental-acceptance/ws13-2-g-ui-read.md
# Recibo G_UI_READ del delta WS13.2

Es el recibo de este delta solamente; no transfiere el de WS13.1. No es firma ni prueba funcional del humano y no acepta el resultado. `G_HUMAN_READ` y WS16 siguen pendientes de recorrido real.

- **Actor:** solicitante designado P01 (`decisiones.md`).
- **Instrucción humana original:** «Mira, en http://127.0.0.1:8090/ hicieron algo parecido. Creo que quizas hay cosas que se pueden aprovechar de ahi. Revisa eso y luego manda al implementaador a implementar»
- **Selección técnica de root:** esta hoja WS13.2, por delegación: `runs/subagents/20261102-ws13-1-correccion/review-source-final.md`, 2026-11-02.
- **Alcance:** explorador de documentos reales modelados y Markdown no modelado, refresco explícito, catálogo degradado. Contrato fuente WS11: `contratos/navegacion.md` sha256 `6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e`.
- **Efecto:** autorizar preparación e implementación de este delta.
- **Repo y base:** graph_ui, HEAD `a2f0bba`.
- **Tarea receptora:** candidato `desk/drawer/tasks/task-ws13-2-explorador-modelados-y-no-modelados.md`, commit `a2f0bba`, blob `fa3a3eed3731`; tarea activa en el commit de promoción.
- **No solapamiento:** las draft `task-vista-changes-…` y `task-edicion-contextual-…` no se tocan. El render sigue en `task-render-markdown-legible-del-lector`.

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

Strictly read-only: ninguna ruta GET reconstruye indices (load_edge_index, nunca document_edges ni rebuild_edges;
un store desactualizado responde store_no_preparado). Riesgo declarado: open_store, dentro de load_edge_index y
doc_status, migra un layout no canonico y no hay consulta publica previa. Adheres to SLDB contracts, safe repo-bounded file inspection,
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
    def __init__(self, message: str, status: int = 400, estado: str | None = None):
        super().__init__(message)
        self.status = status
        self.estado = estado


# Estado de guardia de lectura de archivo -> estado HTTP (navegacion §3.3, WS13.1).
SOURCE_STATE_HTTP = {
    'no_existe': 404,
    'fuera_del_repo': 403,
    'protegido': 403,
    'binario': 415,
    'directorio': 415,
    'no_markdown': 415,
    'demasiado_grande': 413,
    'sin_repo_root': 503,
    'error_lectura': 500,
    'ambiguous': 409,
}
STORE_NO_PREPARADO = 'store_no_preparado'
ANCLA_INEXISTENTE = 'ancla_inexistente'
_EXTERNAL_PREFIXES = ('http://', 'https://')
_COLON_PREFIX = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._-]*:')


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
        # Lectura única del documento autorizado (None si no se leyó ninguna fuente).
        self.data: bytes | None = None
        self.text: str | None = None
        self.replaced = False
        self.template: str | None = None
        self.extract_error: str | None = None
        self.store_path: Any = None  # para doc_version (hash de campos del índice)


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
            elif route == '/api/workspace/source':
                ident = (query.get('id') or [''])[0]
                path_param = (query.get('path') or [''])[0]
                if bool(ident) == bool(path_param):
                    raise WorkspaceError('Se requiere exactamente uno de id o path.', 400, 'seleccion_invalida')
                return handler.json_response(self.workspace_source(ident, path_param))
            else:
                raise WorkspaceError(f'Ruta desconocida: {route}', 404)
        except WorkspaceError as exc:
            body = {'ok': False, 'error': str(exc)}
            if exc.estado:
                body['estado'] = exc.estado
            return handler.json_response(body, exc.status)
        except Exception as exc:
            return handler.json_response({'ok': False, 'error': str(exc)}, 500)

    # ------------------------------------------------------------------
    # Lectura sin mutación y guardias previas (WS13.1 corrección).
    # Identidad y ruta salen de indexed_documents (solo índices); ninguna fuente se abre
    # antes de pasar las guardias de §3.3, y solo se leen fuentes autorizadas, una a una.
    # ------------------------------------------------------------------

    def _indexed(self) -> list[dict[str, str]]:
        from sldb.api.stores.indexed_documents import indexed_documents
        return indexed_documents(self.store_path)

    def _pythonpath(self) -> str | None:
        return getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None

    @staticmethod
    def _decode(data: bytes) -> tuple[str, bool]:
        try:
            return data.decode('utf-8'), False
        except UnicodeDecodeError:
            return data.decode('utf-8', errors='replace'), True

    def _extract_payload(self, model_name: str, text: str, models: dict[str, Any] | None = None) -> tuple[dict[str, Any], str | None]:
        """Payload del texto ya leído con la API pública (modelo registrado + extract_model_data).

        Devuelve (payload, plantilla del modelo). No abre ningún otro documento."""
        from sldb.api import load_registered_model
        from sldb.runtime.validation import extract_model_data

        cache = models if models is not None else {}
        model_type = cache.get(model_name)
        if model_type is None:
            model_type = load_registered_model(self.store_path, model_name, self._pythonpath()).model_type
            cache[model_name] = model_type
        return extract_model_data(model_type, text), getattr(model_type, '__template__', None)

    def workspace_nodes(self) -> dict[str, Any]:
        """Index of all documents in the store with canonical id Model:name.

        Identidad y ruta salen de los índices. Cada documento pasa las guardias de ruta antes
        de leerse; uno no autorizado aparece con su estado de guardia y su name como título,
        y nunca se abre."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)
        try:
            entries = self._indexed()
        except Exception as exc:
            raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)

        nodes = []
        models: dict[str, Any] = {}
        for e in entries:
            model_name, name, path = e['model'], e['name'], e['path']
            node = {
                'id': f'{model_name}:{name}', 'name': name, 'model_name': model_name,
                'title': name, 'status': '', 'path': path, 'estado': 'ok',
            }
            try:
                _, _, data = self._read_authorized(path, markdown_only=False)
            except WorkspaceError as exc:
                node['estado'] = exc.estado or 'error_lectura'
                nodes.append(node)
                continue
            text, _ = self._decode(data)
            try:
                payload, _ = self._extract_payload(model_name, text, models)
            except Exception as exc:
                raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)
            node['title'] = payload.get('title') or payload.get('name') or name
            node['status'] = payload.get('status', '')
            nodes.append(node)
        return {'ok': True, 'nodes': nodes}

    def workspace_node(self, ident: str, depth: int = 1) -> dict[str, Any]:
        """Multi-projection data for a selected node."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)

        if not ident or '..' in ident or ident.startswith(('/', '\\')):
            raise WorkspaceError('Identificador inválido o con intento de escape.', 400)

        from sldb.api.documents.document_serialization import doc_version

        doc = self._resolve_document(ident, markdown_only=False)
        canon_id = f"{doc.model_name}:{doc.name}"
        payload = getattr(doc, 'payload', {}) or {}

        # 1. Proyección Document (IR estructurado) desde la lectura única del documento autorizado
        doc_proj = {'ok': True, 'ir': None, 'payload': payload, 'semantic_tags': getattr(doc, 'semantic_tags', []), 'error': None}
        if doc.extract_error is not None:
            doc_proj['ok'] = False
            doc_proj['error'] = doc.extract_error
        else:
            try:
                doc_proj['ir'] = self._build_ir(doc)
            except Exception as exc:
                doc_proj['ok'] = False
                doc_proj['error'] = str(exc)

        # 2. Proyección Graph: load_edge_index sin reconstruir; store no preparado => ok false
        idx, idx_error = self._load_index()
        graph_proj = self._build_graph_neighborhood(canon_id, idx, idx_error, depth)

        # 3. Proyección Code (archivos y fragmentos referenciados de forma segura)
        code_proj = self._build_code_projection(payload, doc)

        # 4. Contexto lateral
        content_hash = None
        content_hash_error = None
        try:
            content_hash = doc_version(doc)
        except Exception as exc:
            content_hash_error = str(exc)

        file_revision = hashlib.sha256(doc.data).hexdigest() if doc.data is not None else ''

        relations = self._relations_state(idx, idx_error)
        if relations['ok']:
            edges_all = graph_proj.get('edges', [])
            incoming = [e for e in edges_all if e['target'] == canon_id]
            outgoing = [e for e in edges_all if e['source'] == canon_id]
        else:
            incoming = outgoing = None

        problems_report = self._check_problems_for_node(canon_id, idx, idx_error)

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
            'file_revision_error': None,
            'documents_error': None,
            'is_degraded': getattr(doc, 'is_degraded', False),
            'degraded_reason': getattr(doc, 'degraded_reason', None),
            'summary': payload.get('summary') or payload.get('rationale') or payload.get('goal') or '',
            'incoming_relations': incoming,
            'outgoing_relations': outgoing,
            'relations_state': relations,
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
            'documents_error': None,
            'projections': {
                'document': doc_proj,
                'graph': graph_proj,
                'code': code_proj,
            },
            'context': context
        }

    def _build_ir(self, doc: Any) -> dict[str, Any]:
        """IR del builder público sobre el texto ya leído de un documento autorizado."""
        from sldb.api import build_document_ir_json

        runtime = {
            'store': 'local', 'model': doc.model_name, 'name': doc.name, 'path': doc.path,
            'payload': doc.payload, 'semantic_tags': doc.semantic_tags,
        }
        return build_document_ir_json(runtime, doc.text, doc.template)

    @staticmethod
    def _frontmatter_payload(text: str, name: str) -> tuple[dict[str, Any], bool]:
        """(payload del frontmatter, degradado). Sano si el frontmatter lleva id == name."""
        extracted: dict[str, Any] = {}
        degraded = True
        if text.startswith('---'):
            parts = text.split('---', 2)
            if len(parts) >= 3:
                try:
                    import yaml
                    extracted = yaml.safe_load(parts[1]) or {}
                    if isinstance(extracted, dict) and extracted.get('id') == name:
                        degraded = False
                except Exception:
                    extracted = {}
        return (extracted if isinstance(extracted, dict) else {}), degraded

    def _materialize(self, model_name: str, name: str, rel: str, data: bytes, models: dict[str, Any] | None = None) -> ResolvedNodeDoc:
        """Documento indexado a partir de sus bytes ya leídos (autorizados)."""
        text, replaced = self._decode(data)
        doc = ResolvedNodeDoc(model_name=model_name, name=name, path=rel)
        doc.store_path = self.store_path
        doc.data, doc.text, doc.replaced = data, text, replaced
        try:
            doc.payload, doc.template = self._extract_payload(model_name, text, models)
        except Exception as exc:
            doc.extract_error = str(exc)
            doc.payload, fm_degraded = self._frontmatter_payload(text, name)
            doc.is_degraded = fm_degraded
            doc.degraded_reason = f'Fallo al validar documento en disco ({exc})' if fm_degraded else None
        return doc

    def _match_indexed(self, ident: str, entries: list[dict[str, str]]) -> dict[str, str] | None:
        if ':' in ident:
            model_name, name = ident.split(':', 1)
            return next((e for e in entries if e['model'] == model_name and e['name'] == name), None)
        if '/' in ident:
            model_name, name = ident.split('/', 1)
            return next((e for e in entries if e['model'] == model_name and e['name'] == name), None)
        matches = [e for e in entries if e['name'] == ident]
        if len(matches) > 1:
            models = [e['model'] for e in matches]
            raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
        return matches[0] if matches else None

    def _resolve_document(self, ident: str, markdown_only: bool = False) -> ResolvedNodeDoc:
        """Resuelve la identidad por índices y lee solo el documento pedido, tras las guardias."""
        try:
            entries = self._indexed()
        except Exception:
            entries = []
        entry = self._match_indexed(ident, entries)
        if entry is not None:
            _, rel, data = self._read_authorized(entry['path'], markdown_only)
            return self._materialize(entry['model'], entry['name'], rel, data)
        return self._resolve_document_fallback(ident, markdown_only)

    def _resolve_document_fallback(self, ident: str, markdown_only: bool) -> ResolvedNodeDoc:
        """Documento que los índices no listan: lo busca en el índice de aristas y rescata el
        frontmatter de los candidatos fijos, cada uno tras las guardias de ruta."""
        try:
            from sldb.api.edges.edge_reading import load_edge_index
            idx = load_edge_index(self.store_path, include_linked=False)
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
                    resolved_target = candidates[0].replace('sldb://document/', '').split(':', 1)

            if resolved_target:
                found_model, found_name = resolved_target
                doc = ResolvedNodeDoc(
                    model_name=found_model, name=found_name, path='', payload={},
                    is_degraded=True, degraded_reason='Documento no listado en los índices del store.',
                )
                doc.extract_error = doc.degraded_reason
                doc.store_path = self.store_path
                for rel in (
                    f"desk/tasks/{found_name}.md",
                    f"desk/contexts/{found_name}.md",
                    f"desk/rituals/{found_name}.md",
                    f"desk/roles/{found_name}.md",
                    f"desk/runs/{found_name}.md",
                    f"desk/relations/{found_name}.yaml",
                    f"desk/relations/{found_name}.md",
                ):
                    try:
                        _, crel, data = self._read_authorized(rel, markdown_only=False)
                    except WorkspaceError as exc:
                        if exc.estado == 'no_existe':
                            continue
                        raise
                    text, replaced = self._decode(data)
                    doc.path, doc.data, doc.text, doc.replaced = crel, data, text, replaced
                    doc.payload, doc.is_degraded = self._frontmatter_payload(text, found_name)
                    doc.degraded_reason = None if not doc.is_degraded else doc.degraded_reason
                    if markdown_only and not crel.endswith('.md'):
                        raise WorkspaceError('Solo se abren documentos Markdown (.md).', SOURCE_STATE_HTTP['no_markdown'], 'no_markdown')
                    return doc
                return doc
        except WorkspaceError:
            raise
        except Exception:
            pass
        raise WorkspaceError(f'Documento no encontrado: {ident}', 404)

    def _load_index(self) -> tuple[Any, str | None]:
        """Índice de aristas sin reconstruir (load_edge_index, include_linked=False)."""
        try:
            from sldb.api.edges.edge_reading import load_edge_index
            return load_edge_index(self.store_path, include_linked=False), None
        except Exception as exc:
            return None, str(exc)

    @staticmethod
    def _relations_state(idx: Any, idx_error: str | None) -> dict[str, Any]:
        """Estado de las relaciones: ok, o store_no_preparado con la lista stale, o error."""
        if idx is None:
            return {'ok': False, 'estado': 'error_indice', 'stale': [], 'error': idx_error}
        stale = list(getattr(idx, 'stale', []) or [])
        if stale:
            return {
                'ok': False, 'estado': STORE_NO_PREPARADO, 'stale': stale,
                'error': 'El store no está preparado: el índice de aristas está desactualizado. '
                         'La preparación (rebuild_edges) es explícita y externa a la petición.',
            }
        return {'ok': True, 'estado': 'ok', 'stale': [], 'error': None}

    @staticmethod
    def _document_edges(idx: Any) -> list[dict[str, Any]]:
        """Aristas documento-a-documento del índice, sin reconstruir.

        La deduplicación por (source, target, type, relation_doc) no descarta procedencias:
        cada arista conserva en `provenance` la metadata de todos los registros del índice
        que la originan. Cada procedencia lleva `owner`: el documento cuyo campo la declara
        (el source del registro, para origen schema); relation_doc y structural no tienen
        campo ni dueño (`owner` None).
        """
        prefix = 'sldb://document/'
        merged: dict[tuple, dict[str, Any]] = {}
        for rec in idx.edges:
            if not (rec.source.startswith(prefix) and rec.target.startswith(prefix)):
                continue
            meta = dict(rec.metadata or {})
            relation_doc = meta.get('relation_doc')
            source, target = rec.source[len(prefix):], rec.target[len(prefix):]
            key = (source, target, rec.relation, relation_doc)
            edge = merged.get(key)
            if edge is None:
                edge = {
                    'source': source,
                    'target': target,
                    'type': rec.relation,
                    'origin': str(meta.get('origin', '')),
                    'relationDoc': relation_doc,
                    'provenance': [],
                }
                merged[key] = edge
            prov = {k: v for k, v in meta.items() if k != 'relation_doc'}
            prov['owner'] = source if (meta.get('origin') == 'schema' and meta.get('field')) else None
            if prov not in edge['provenance']:
                edge['provenance'].append(prov)
        return list(merged.values())

    def _node_label(self, entry: dict[str, str] | None, fallback_name: str, models: dict[str, Any]) -> tuple[str, str, str]:
        """(título, status, estado) de un vecino; lee solo si pasa las guardias de ruta."""
        if entry is None:
            return fallback_name, '', 'no_listado'
        try:
            _, _, data = self._read_authorized(entry['path'], markdown_only=False)
        except WorkspaceError as exc:
            return fallback_name, '', exc.estado or 'error_lectura'
        text, _ = self._decode(data)
        try:
            payload, _ = self._extract_payload(entry['model'], text, models)
        except Exception:
            return fallback_name, '', 'error_lectura'
        return payload.get('title') or payload.get('name') or fallback_name, payload.get('status', ''), 'ok'

    def _build_graph_neighborhood(self, root_id: str, idx: Any, idx_error: str | None, depth: int) -> dict[str, Any]:
        state = self._relations_state(idx, idx_error)
        if not state['ok']:
            return {
                'ok': False, 'depth': depth, 'nodes': [], 'edges': [],
                'estado': state['estado'], 'stale': state['stale'], 'error': state['error'],
            }
        try:
            edges = self._document_edges(idx)
            adj: dict[str, list[Any]] = {}
            for edge in edges:
                adj.setdefault(edge['source'], []).append(edge)
                adj.setdefault(edge['target'], []).append(edge)

            visited_nodes: dict[str, int] = {root_id: 0}
            current_level = {root_id}

            for current_depth in range(1, depth + 1):
                next_level = set()
                for nid in current_level:
                    for edge in adj.get(nid, []):
                        neighbor = edge['target'] if edge['source'] == nid else edge['source']
                        if neighbor not in visited_nodes:
                            visited_nodes[neighbor] = current_depth
                            next_level.add(neighbor)
                current_level = next_level

            # Filtrar aristas cuyos dos extremos estén en visited_nodes
            seen_edges = set()
            neighborhood_edges = []
            for nid in visited_nodes:
                for edge in adj.get(nid, []):
                    if edge['source'] in visited_nodes and edge['target'] in visited_nodes:
                        edge_key = (edge['source'], edge['target'], edge['type'], edge['relationDoc'])
                        if edge_key not in seen_edges:
                            seen_edges.add(edge_key)
                            neighborhood_edges.append(edge)

            by_id = {f"{e['model']}:{e['name']}": e for e in self._indexed()}
            models: dict[str, Any] = {}
            nodes = []
            for nid, hop in visited_nodes.items():
                m_name, n_name = nid.split(':', 1) if ':' in nid else ('', nid)
                title, status, estado = self._node_label(by_id.get(nid), n_name, models)
                nodes.append({
                    'id': nid,
                    'name': n_name,
                    'model_name': m_name,
                    'title': title,
                    'status': status,
                    'estado': estado,
                    'depth': hop
                })

            return {
                'ok': True,
                'depth': depth,
                'nodes': nodes,
                'edges': neighborhood_edges,
                'estado': 'ok',
                'stale': [],
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

        # Cada referencia conserva campo y posición 0-based en la lista original del campo
        # (contando los elementos omitidos) antes de concatenar files y references.
        doc_id = f"{getattr(doc, 'model_name', '')}:{getattr(doc, 'name', '')}" if doc is not None else ''
        inspected = []
        for field in ('files', 'references'):
            values = payload.get(field)
            if not isinstance(values, list):
                continue
            for position, ref in enumerate(values):
                if not isinstance(ref, str) or not ref.strip():
                    continue
                item = self._inspect_file_reference(ref.strip())
                item.update({'doc': doc_id, 'field': field, 'position': position, 'value': ref})
                inspected.append(item)

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

    # ------------------------------------------------------------------
    # WS13.1: lector de fuente (GET /api/workspace/source). Solo lectura.
    # ------------------------------------------------------------------

    def _guard_path(self, path_str: str, markdown_only: bool = True) -> tuple[Path, str]:
        """Guardias generales de lectura de archivo (navegacion §3.3), mismos estados que
        _inspect_file_reference. Devuelve (ruta resuelta, ruta relativa con /) o lanza
        WorkspaceError con `estado`. No abre el archivo. `markdown_only` es el criterio de
        /source y de los destinos de enlace; no se aplica a la identidad de /node ni /nodes."""
        def fail(estado: str, message: str):
            raise WorkspaceError(message, SOURCE_STATE_HTTP[estado], estado)

        if not self.repo_root:
            fail('sin_repo_root', 'No se configuró repo_root.')
        if not path_str or '\x00' in path_str:
            raise WorkspaceError('Ruta inválida.', 400, 'ruta_invalida')
        candidate = Path(path_str)
        resolved = candidate.resolve() if candidate.is_absolute() else (self.repo_root / candidate).resolve()
        if not resolved.is_relative_to(self.repo_root):
            fail('fuera_del_repo', 'La ruta o enlace simbólico escapa del repositorio.')
        rel = resolved.relative_to(self.repo_root)
        rel_str = rel.as_posix()
        if '.git' in rel.parts:
            fail('protegido', 'Ruta interna de control de versiones .git.')
        if not resolved.exists():
            fail('no_existe', 'El archivo no existe.')
        is_ignored, ignore_msg = self._is_gitignored(resolved)
        if is_ignored:
            fail('protegido', ignore_msg)
        if resolved.is_dir():
            fail('directorio', 'Es un directorio, no un documento.')
        if markdown_only and resolved.suffix.lower() != '.md':
            fail('no_markdown', 'Solo se abren documentos Markdown (.md).')
        return resolved, rel_str

    def _guard_markdown_file(self, path_str: str) -> tuple[Path, str]:
        return self._guard_path(path_str, True)

    def _read_authorized(self, path_str: str, markdown_only: bool = True) -> tuple[Path, str, bytes]:
        """Guardias de ruta y solo después la lectura única de los bytes."""
        resolved, rel = self._guard_path(path_str, markdown_only)
        data, _ = self._read_markdown_bytes(resolved)
        return resolved, rel, data

    def _read_markdown_bytes(self, resolved: Path) -> tuple[bytes, int]:
        """Lee los bytes una sola vez, con tope y rechazo de binarios."""
        try:
            size = resolved.stat().st_size
            if size > MAX_CODE_BYTES:
                raise WorkspaceError(f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.', 413, 'demasiado_grande')
            data = resolved.read_bytes()
        except WorkspaceError:
            raise
        except OSError as exc:
            raise WorkspaceError(f'Fallo de lectura: {exc}', 500, 'error_lectura')
        if len(data) > MAX_CODE_BYTES:
            raise WorkspaceError(f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.', 413, 'demasiado_grande')
        if b'\x00' in data:
            raise WorkspaceError('Archivo binario no visualizable como texto.', 415, 'binario')
        return data, len(data)

    def _tracked_status(self, rel_or_ref: str):
        """doc_status del store para 'local:'+ref. None si la consulta falla (no rastreado)."""
        from sldb.api.stores.doc_status import doc_status
        try:
            return doc_status(self.store_path, 'local:' + rel_or_ref)
        except Exception:
            return None

    def workspace_source(self, ident: str, path_param: str) -> dict[str, Any]:
        """Render y fuente cruda del mismo origen para un Markdown modelado o no modelado.

        Orden: identidad desde índices, guardias de ruta, y solo entonces la lectura única de
        los bytes del documento autorizado. No se abre ningún otro documento indexado."""
        if not self.store_path or not self.store_path.exists():
            raise WorkspaceError('El store no está disponible.', 503)
        if not self.repo_root:
            raise WorkspaceError('No se configuró repo_root.', 503, 'sin_repo_root')

        requested: dict[str, str] = {}
        doc: ResolvedNodeDoc | None = None
        model_name = name = None

        if ident:
            if '..' in ident or ident.startswith(('/', '\\')):
                raise WorkspaceError('Identificador inválido o con intento de escape.', 400)
            if not self.editor_store:
                raise WorkspaceError('El store no está disponible.', 503)
            requested['id'] = ident
            doc = self._resolve_document(ident, markdown_only=True)
            if doc.data is None or not doc.path:
                raise WorkspaceError('El documento no tiene archivo en disco.', 404, 'no_existe')
            model_name, name = doc.model_name, doc.name
            rel_str, data = doc.path, doc.data
        else:
            requested['path'] = path_param
            resolved, rel_str = self._guard_markdown_file(path_param)
            status = self._tracked_status(rel_str)
            if status is not None and status.status == 'ambiguous':
                raise WorkspaceError(f'La ruta {rel_str} es ambigua en el store; use Model:name.', 409, 'ambiguous')
            data, _ = self._read_markdown_bytes(resolved)
            if status is not None and status.status == 'ok':
                model_name, name = status.model, status.name
                doc = self._materialize(model_name, name, rel_str, data)

        modeled = model_name is not None
        size = len(data)
        revision = hashlib.sha256(data).hexdigest()
        text, replaced = self._decode(data)

        ir = None
        ir_error = None
        fields: list[dict[str, Any]] = []
        sections: list[dict[str, Any]] = []
        extracted = doc is not None and doc.extract_error is None
        if extracted:
            try:
                ir = self._build_ir(doc)
            except Exception as exc:
                ir_error = str(exc)
        elif modeled:
            ir_error = f'Documento degradado: {doc.extract_error}'
        if ir is not None:
            sections = self._sections_from_ir(ir.get('structure') or [])
            for node in ir.get('nodes') or []:
                if node.get('kind') == 'field':
                    span = node.get('span') or {}
                    has_span = span.get('line_start') is not None or span.get('line_end') is not None
                    fields.append({
                        'field_path': node.get('field_path') or node.get('name'),
                        'value': node.get('value'),
                        'span': {'line_start': span.get('line_start'), 'line_end': span.get('line_end')} if has_span else None,
                    })
        else:
            sections = self._sections_from_text(text)

        canon_id = f'{model_name}:{name}' if modeled else None
        links = self._resolve_links(text, rel_str, canon_id, rel_str)
        context = self._source_context(canon_id, model_name, name, rel_str, revision)

        descriptor = None
        if extracted:
            descriptor = {'payload': doc.payload or {}, 'semantic_tags': doc.semantic_tags or []}
        return {
            'ok': True,
            'identity': {
                'kind': 'modeled' if modeled else 'unmodeled',
                'id': canon_id,
                'model_name': model_name,
                'name': name,
                'repo': 'local',
                'path': rel_str,
                'requested': requested,
            },
            'revision': revision,
            'size': size,
            'encoding': 'utf-8-replaced' if replaced else 'utf-8',
            'line_count': len(text.splitlines()),
            'text': text,
            'sections': sections,
            'fields': fields,
            'ir': ir,
            'ir_error': ir_error,
            'descriptor': descriptor,
            'degraded': bool(modeled and not extracted),
            'links': links,
            'context': context,
        }

    @staticmethod
    def _sections_from_ir(structure: list[dict[str, Any]]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []

        def walk(items: list[dict[str, Any]]) -> None:
            for item in items:
                meta = item.get('metadata') or {}
                span = item.get('span') or {}
                out.append({
                    'title': item.get('title') or item.get('name') or '',
                    'slug': meta.get('slug') or '',
                    'level': meta.get('level'),
                    'path': item.get('name') or '',
                    'line_start': span.get('line_start'),
                    'line_end': span.get('line_end'),
                })
                walk(item.get('children') or [])
        walk(structure)
        return out

    @staticmethod
    def _sections_from_text(text: str) -> list[dict[str, Any]]:
        """Secciones de un Markdown no modelado con extract_sections de sldb, sobre la misma lectura."""
        from sldb.api.records.extract import extract_sections
        return [
            {'title': s.title, 'slug': s.slug, 'level': s.level, 'path': s.path,
             'line_start': s.line_start, 'line_end': s.line_end}
            for s in extract_sections(text)
        ]

    def _source_context(self, canon_id: str | None, model_name: str | None, name: str | None, rel: str, revision: str) -> dict[str, Any]:
        context: dict[str, Any] = {
            'id': canon_id, 'name': name, 'model_name': model_name, 'repo': 'local',
            'path': rel, 'revision': revision,
            'incoming_relations': None, 'outgoing_relations': None, 'relations_error': None,
            'relations_absent': None, 'relations_state': None,
        }
        if canon_id is None:
            context['relations_absent'] = 'Documento no modelado: no está en el store, sin relaciones.'
            return context
        idx, idx_error = self._load_index()
        state = self._relations_state(idx, idx_error)
        context['relations_state'] = state
        if not state['ok']:
            context['relations_error'] = state['error']
            return context
        try:
            edges = self._document_edges(idx)
            context['incoming_relations'] = [e for e in edges if e['target'] == canon_id]
            context['outgoing_relations'] = [e for e in edges if e['source'] == canon_id]
        except Exception as exc:
            context['relations_error'] = str(exc)
        return context

    def _resolve_links(self, text: str, doc_rel: str, own_id: str | None, own_path: str) -> list[dict[str, Any]]:
        """Resuelve los enlaces [[...]] del texto contra el desk propio.

        Orden: parse_links, split_anchor, clasificar prefijo. `local:` se retira una vez. Un
        destino con ancla se lee solo tras las guardias de su ruta (lectura autorizada) para
        comprobar la sección con extract_section; el propio documento usa el texto ya leído.
        """
        from sldb.links import parse_links
        from sldb.links.sections import split_anchor

        lines = text.splitlines()
        results: list[dict[str, Any]] = []
        seen: set[str] = set()
        for pl in parse_links(text):
            if pl.raw in seen:
                continue
            seen.add(pl.raw)
            line = next((i + 1 for i, l in enumerate(lines) if pl.raw in l), None)
            entry = {
                'raw': pl.raw, 'target': pl.target, 'kind': pl.kind, 'predicate': pl.predicate,
                'line': line, 'anchor': None, 'status': 'roto', 'cause': '', 'open': None,
                'origin': {'doc': own_id or own_path, 'path': doc_rel, 'line': line},
            }
            base, anchor = split_anchor(pl.target)
            entry['anchor'] = anchor
            self._classify_link(entry, base, doc_rel, own_id, own_path, text)
            results.append(entry)
        return results

    def _check_anchor(self, entry: dict[str, Any], markdown: str | None, where: str) -> bool:
        """Falso (y marca la referencia rota) si la sección no existe en el destino."""
        from sldb.links.sections import extract_section

        anchor = entry.get('anchor')
        if anchor is None:
            return True
        if markdown is not None and extract_section(markdown, anchor) is not None:
            return True
        entry.update(
            status='roto', estado=ANCLA_INEXISTENTE, open=None,
            cause=f'La sección «{anchor}» no existe en {where}.',
        )
        return False

    def _classify_link(self, entry: dict[str, Any], base: str, doc_rel: str, own_id: str | None, own_path: str, own_text: str = '') -> None:
        if base.startswith(_EXTERNAL_PREFIXES):
            entry.update(status='externo', cause='Enlace externo: se muestra, no se abre ni se lee.')
            return
        if base.startswith('local:'):
            base = base[len('local:'):]
        if base == '':
            # ancla del propio documento: se comprueba sobre el texto ya leído
            if not self._check_anchor(entry, own_text, 'el propio documento'):
                return
            entry['status'] = 'ok'
            entry['open'] = {'id': own_id} if own_id else {'path': own_path}
            return
        tracked = self._tracked_status(base)
        if tracked is not None and tracked.status == 'ambiguous':
            entry.update(status='roto', cause='Destino ambiguo en el store; use Model/name.', estado='ambiguous')
            return
        if tracked is not None and tracked.status == 'ok':
            tpath = tracked.path or ''
            try:
                _, _, tdata = self._read_destination(tpath, entry)
            except WorkspaceError as exc:
                entry.update(status='roto', cause=str(exc), estado=exc.estado)
                return
            if not self._check_anchor(entry, tdata, tpath):
                return
            entry['status'] = 'ok'
            entry['open'] = {'id': f'{tracked.model}:{tracked.name}'}
            entry['path'] = tpath
            return
        # No modelado: relativo al directorio del documento y luego al root del repo.
        doc_dir = Path(doc_rel).parent.as_posix()
        candidates = []
        if doc_dir not in ('', '.'):
            candidates.append(f'{doc_dir}/{base}')
        candidates.append(base)
        last_exc: WorkspaceError | None = None
        for cand in candidates:
            try:
                _, rel, tdata = self._read_destination(cand, entry)
            except WorkspaceError as exc:
                if exc.estado == 'no_existe':
                    last_exc = last_exc or exc
                    continue
                entry.update(status='no_markdown' if exc.estado == 'no_markdown' else 'roto', cause=str(exc), estado=exc.estado, path=cand)
                return
            if not self._check_anchor(entry, tdata, rel):
                entry['path'] = rel
                return
            again = self._tracked_status(rel)
            if again is not None and again.status == 'ok':
                entry['open'] = {'id': f'{again.model}:{again.name}'}
            else:
                entry['open'] = {'path': rel}
            entry['status'] = 'ok'
            entry['path'] = rel
            return
        entry.update(status='roto', cause='El destino no existe en el desk.', estado='no_existe')

    def _read_destination(self, path_str: str, entry: dict[str, Any]) -> tuple[Path, str, str | None]:
        """Guardias del destino y, solo si el enlace lleva ancla, su lectura autorizada.

        Sin ancla no se abre el destino (devuelve texto None). Con ancla, el texto decodificado
        de la lectura protegida."""
        resolved, rel = self._guard_markdown_file(path_str)
        if entry.get('anchor') is None:
            return resolved, rel, None
        data, _ = self._read_markdown_bytes(resolved)
        text, _ = self._decode(data)
        return resolved, rel, text

    def _check_problems_for_node(self, canon_id: str, idx: Any = None, idx_error: str | None = None) -> dict[str, Any]:
        """Comprueba problemas reportados por el índice de aristas de SLDB para este nodo."""
        if not self.store_path or not self.store_path.exists():
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': 'Store no disponible'}
        if idx is None:
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': idx_error or 'Índice de aristas no disponible'}
        try:
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
import {
  renderBlocks,
  splitInline,
  linksByRaw,
  sectionForAnchor,
  sectionAtLine,
  sectionFocus,
  fieldFocus,
  referenceFocus,
  edgeFocus,
  edgeKey,
  edgeFields,
  edgeDeclarations,
  referenceKey,
  sectionHighlighted,
  fieldHighlighted,
  edgeHighlighted,
  referenceHighlighted,
  lineInFocus,
  correspondence,
  describeFocus,
  nextRange,
  inRange,
  rangeLabel,
  targetFromSearch,
  targetKey
} from './reader.mjs';

function CodeFileView({file, focus, docId, onFocus, range, onRange, onOpenPath}) {
  const [showFull, setShowFull] = useState(false);
  const lineNum = file.fragment_line || file.line;
  const snippet = parseCodeSnippet(file.content, lineNum, 5);
  const key = referenceKey(file);
  const highlighted = referenceHighlighted(file, focus, docId);
  const fullLines = showFull && file.status === 'ok' && typeof file.content === 'string' ? file.content.split('\n') : [];
  if (fullLines.length && fullLines[fullLines.length - 1] === '') fullLines.pop();
  return html`
    <div
      className=${'workspace-code-file-card' + (highlighted ? ' is-focused' : '')}
      data-testid="code-card"
      data-ref-key=${key}
      data-field=${file.field || ''}
      data-position=${file.position ?? ''}
      data-focused=${highlighted ? 'true' : 'false'}
    >
      <div className="workspace-code-file-header">
        <button
          type="button"
          className="workspace-code-ref-btn"
          data-testid="code-ref-focus"
          title="Fijar foco en el campo de esta referencia"
          onClick=${() => onFocus(referenceFocus(file))}
        >
          <span className="workspace-code-filename">${file.path || file.reference}${lineNum ? `:${lineNum}` : ''}</span>
        </button>
        ${file.field ? html`<span className="workspace-badge" data-testid="code-ref-field">${file.field}[${file.position}]</span>` : ''}
        ${lineNum ? html`<span className="workspace-badge">Línea ${lineNum}</span>` : ''}
        ${file.status === 'ok' && String(file.path || '').toLowerCase().endsWith('.md') ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-open-doc" onClick=${() => onOpenPath(file.path)}>Abrir como documento</button>
        ` : ''}
        ${file.status === 'ok' ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-toggle-full" aria-pressed=${showFull} onClick=${() => setShowFull(v => !v)}>
            ${showFull ? 'Ocultar archivo completo' : 'Ver archivo completo'}
          </button>
        ` : ''}
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
      ${showFull ? html`
        <div className="workspace-code-full" data-testid="code-full">
          <div className="workspace-code-range-bar">
            <span>Rango local (sin persistir):</span>
            <strong data-testid="code-range-label">${range ? rangeLabel(range) : 'ninguno'}</strong>
            ${range ? html`<button type="button" className="workspace-link-btn" data-testid="code-range-clear" onClick=${() => onRange(key, null)}>Limpiar</button>` : ''}
          </div>
          <table className="workspace-code-table workspace-code-table-full">
            <tbody>
              ${fullLines.map((text, idx) => {
                const n = idx + 1;
                return html`
                  <tr
                    key=${n}
                    className=${'workspace-code-line selectable' + (inRange(range, n) ? ' in-range' : '')}
                    data-line=${n}
                    onClick=${e => onRange(key, nextRange(range, n, e.shiftKey))}
                  >
                    <td className="workspace-code-line-num">${n}</td>
                    <td className="workspace-code-line-text">${text}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

function IrSectionView({section, focus, onFocus}) {
  const spanText = section.span ? `L${section.span.line_start ?? ''}-${section.span.line_end ?? ''}` : '';
  const focused = sectionHighlighted(section, focus);
  return html`
    <div className=${'workspace-ir-section' + (focused ? ' is-focused' : '')} data-section-path=${section.name || ''}>
      <h4 className="workspace-ir-title">
        <button
          type="button"
          className="workspace-ir-focus-btn"
          data-testid="section-focus"
          disabled=${!section.span}
          onClick=${() => section.span && onFocus(sectionFocus({path: section.name, title: section.title, line_start: section.span.line_start, line_end: section.span.line_end}))}
        >${section.title || section.name || 'Sección'}</button>
        ${spanText ? html`<small className="workspace-badge">${spanText}</small>` : ''}
      </h4>
      ${section.value ? html`<p>${typeof section.value === 'object' ? JSON.stringify(section.value) : String(section.value)}</p>` : ''}
      ${Array.isArray(section.children) && section.children.length ? html`
        <div>${section.children.map((c, i) => html`<${IrSectionView} key=${i} section=${{...c, span: c.span && (c.span.line_start != null || c.span.line_end != null) ? c.span : null}} focus=${focus} onFocus=${onFocus} />`)}</div>
      ` : ''}
    </div>
  `;
}

function InlineText({text, links, onOpenLink}) {
  const segs = splitInline(text, links);
  return html`${segs.map((seg, i) => {
    if (seg.type === 'text') return html`<span key=${i}>${seg.text}</span>`;
    const l = seg.link;
    if (!l) return html`<span key=${i} className="workspace-link-unresolved">${seg.raw}</span>`;
    if (l.status === 'ok' && l.open) {
      return html`<a
        key=${i}
        href="#"
        className="workspace-doc-link"
        data-testid="doc-link"
        data-status="ok"
        data-open=${l.open.id ? `id:${l.open.id}` : `path:${l.open.path}`}
        onClick=${e => { e.preventDefault(); onOpenLink(l); }}
      >${seg.label}</a>`;
    }
    if (l.status === 'externo') {
      return html`<span key=${i} className="workspace-link-external" data-testid="doc-link" data-status="externo" title=${l.cause}>${seg.label} ↗ (externo, no se abre)</span>`;
    }
    return html`<span key=${i} className="workspace-link-broken" data-testid="doc-link" data-status=${l.status} title=${l.cause}>${seg.label} (${l.status === 'no_markdown' ? 'no es Markdown' : 'roto'})</span>`;
  })}`;
}

function RenderedDocument({text, links, sections, focus, onFocus, onOpenLink}) {
  const blocks = renderBlocks(text);
  const byRaw = linksByRaw(links);
  const blockFocused = b => focus?.kind === 'section' && focus.line_start != null && b.line_start >= focus.line_start && b.line_end <= focus.line_end;
  return html`
    <div className="workspace-render" data-testid="doc-render">
      ${blocks.map((b, i) => {
        const cls = 'workspace-render-block' + (blockFocused(b) ? ' is-focused' : '');
        if (b.kind === 'frontmatter') {
          return html`<pre key=${i} className=${cls + ' workspace-render-frontmatter'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'code') {
          return html`<pre key=${i} className=${cls + ' workspace-render-code'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'heading') {
          const sec = (sections || []).find(s => s.line_start === b.line_start);
          const Tag = 'h' + Math.min(6, b.level + 1);
          return html`<${Tag} key=${i} className=${cls + ' workspace-render-heading'} data-line-start=${b.line_start} data-section-path=${sec?.path || ''}>
            ${sec ? html`<button type="button" className="workspace-ir-focus-btn" data-testid="render-heading" onClick=${() => onFocus(sectionFocus(sec))}>${b.text}</button>` : b.text}
          <//>`;
        }
        if (b.kind === 'list') {
          return html`<ul key=${i} className=${cls} data-line-start=${b.line_start}>${b.items.map(it => html`<li key=${it.line}><${InlineText} text=${it.text} links=${byRaw} onOpenLink=${onOpenLink} /></li>`)}</ul>`;
        }
        return html`<p key=${i} className=${cls} data-line-start=${b.line_start}>${b.lines.map((ln, j) => html`<span key=${j}><${InlineText} text=${ln} links=${byRaw} onOpenLink=${onOpenLink} />${j < b.lines.length - 1 ? ' ' : ''}</span>`)}</p>`;
      })}
    </div>
  `;
}

function RawSource({text, focus, fields}) {
  const lines = String(text ?? '').split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return html`
    <div className="workspace-source" data-testid="doc-source" role="region" aria-label="Fuente cruda">
      <table className="workspace-code-table">
        <tbody>
          ${lines.map((ln, idx) => html`
            <tr key=${idx} className=${'workspace-code-line workspace-src-line' + (lineInFocus(idx + 1, focus, fields) ? ' in-range is-focused' : '')} data-line=${idx + 1}>
              <td className="workspace-code-line-num">${idx + 1}</td>
              <td className="workspace-code-line-text">${ln}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function describeSourceError(err) {
  if (!err) return '';
  const estado = err.body?.estado;
  return estado ? `${err.message} [${estado}]` : (err.message || 'Error al cargar el documento');
}

function WorkspaceView() {
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [target, setTarget] = useState(() => targetFromSearch(window.location.search));
  const [depth, setDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('');
  const [sourceRaw, setSource] = useState(null);
  const [sourceError, setSourceError] = useState('');
  const [nodeRaw, setNodeData] = useState(null);
  const [nodeError, setNodeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState(null);
  const [ranges, setRanges] = useState({});
  const [anchorNote, setAnchorNote] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  const sourceGen = useRef(0);
  const nodeGen = useRef(0);
  const catalogGen = useRef(0);
  // Contador local del lector: se incrementa al navegar a OTRO documento. Cada estado cargado
  // (fuente, nodo, codigo, relaciones) queda ligado a la identidad que lo pidio y a este
  // contador; la respuesta de una generacion anterior se descarta en todos los paneles.
  const navGen = useRef(0);
  const tKeyRef = useRef(targetKey(targetFromSearch(window.location.search)));
  const pendingAnchor = useRef(new URLSearchParams(window.location.search).get('anchor'));

  const tKey = targetKey(target);
  // Solo se usa el estado ligado a la identidad vigente y a la generacion vigente.
  const source = sourceRaw && sourceRaw._gen === navGen.current && sourceRaw._key === tKey ? sourceRaw : null;
  const selectedId = source?.identity?.id || target?.id || '';
  const modeledId = source?.identity?.kind === 'modeled' ? source.identity.id : '';
  const nodeData = nodeRaw && nodeRaw._gen === navGen.current && nodeRaw._id === modeledId ? nodeRaw : null;

  // La URL lleva id o path (excluyentes), depth, tab y, al seguir un enlace con ancla, anchor.
  const updateUrl = (nextTarget, newDepth, tab, {replace = false, anchor = null} = {}) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('path');
      url.searchParams.delete('anchor');
      if (nextTarget?.id) url.searchParams.set('id', nextTarget.id);
      else if (nextTarget?.path) url.searchParams.set('path', nextTarget.path);
      if (anchor) url.searchParams.set('anchor', anchor);
      url.searchParams.set('depth', String(newDepth || 1));
      url.searchParams.set('tab', tab || 'document');
      const newPath = url.pathname + url.search;
      if (replace) window.history.replaceState(null, '', newPath);
      else window.history.pushState(null, '', newPath);
    } catch {}
  };

  const navigateTo = next => {
    const key = targetKey(next);
    if (key === tKeyRef.current) return false;
    tKeyRef.current = key;
    navGen.current += 1;
    // Nada del documento anterior sobrevive: cada panel pasa a carga.
    setSource(null);
    setSourceError('');
    setNodeData(null);
    setNodeError('');
    setAnchorNote('');
    setFocus(null);
    setTarget(next);
    return true;
  };

  const syncFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDepth = parseInt(params.get('depth') || '1', 10);
      const urlTab = params.get('tab') || 'document';
      if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
      if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
      pendingAnchor.current = params.get('anchor');
      const next = targetFromSearch(window.location.search);
      if (next) navigateTo(next);
    } catch {}
  };

  const loadCatalog = async () => {
    const token = ++catalogGen.current;
    setCatalogError('');
    const params = new URLSearchParams(window.location.search);
    const urlDepth = parseInt(params.get('depth') || '1', 10);
    const urlTab = params.get('tab') || 'document';
    if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
    if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
    try {
      const res = await request('/api/workspace/nodes');
      if (token !== catalogGen.current) return;
      const nodes = res.nodes || [];
      setCatalog(nodes);
      if (!targetFromSearch(window.location.search)) {
        if (nodes.length > 0) navigateTo({id: nodes[0].id});
        else setLoading(false);
      }
    } catch (err) {
      if (token === catalogGen.current) {
        setCatalogError(err.message || 'Error al cargar catálogo de nodos');
        if (!targetFromSearch(window.location.search)) setLoading(false);
      }
    }
  };

  // Un solo lector: la fuente, el render y el contexto salen de una unica respuesta de /source.
  const loadSource = async currentTarget => {
    if (!currentTarget) {
      setSource(null);
      setLoading(false);
      return;
    }
    const token = ++sourceGen.current;
    const gen = navGen.current;
    const askedKey = targetKey(currentTarget);
    const stale = () => token !== sourceGen.current || gen !== navGen.current;
    setLoading(true);
    setSourceError('');
    try {
      const qs = currentTarget.id ? `id=${encodeURIComponent(currentTarget.id)}` : `path=${encodeURIComponent(currentTarget.path)}`;
      const res = await request(`/api/workspace/source?${qs}`);
      if (stale()) return;
      setSource({...res, _gen: gen, _key: askedKey});
      if (pendingAnchor.current) {
        const sec = sectionForAnchor(res.sections, pendingAnchor.current);
        if (sec) {
          setFocus(sectionFocus(sec));
          setAnchorNote('');
        } else {
          setAnchorNote(`Ancla no encontrada: ${pendingAnchor.current}`);
        }
        pendingAnchor.current = null;
      } else {
        setAnchorNote('');
      }
    } catch (err) {
      if (!stale()) {
        setSource(null);
        setSourceError(describeSourceError(err));
      }
    } finally {
      if (!stale()) setLoading(false);
    }
  };

  const loadNode = async (id, currentDepth) => {
    if (!id) {
      setNodeData(null);
      setNodeError('');
      return;
    }
    const token = ++nodeGen.current;
    const gen = navGen.current;
    const stale = () => token !== nodeGen.current || gen !== navGen.current;
    setNodeError('');
    try {
      const res = await request(`/api/workspace/node?id=${encodeURIComponent(id)}&depth=${currentDepth}`);
      if (stale()) return;
      const node = res.node || {};
      const projections = res.projections || {};
      const context = res.context || {};
      setNodeData({
        _gen: gen,
        _id: id,
        relations: context.relations_state || null,
        identity: {
          status: context.status || node.status || '',
          current_node: context.current_node || '',
          content_hash: context.content_hash || node.content_hash || '',
          content_hash_error: context.content_hash_error || null,
          file_revision: context.file_revision || node.file_revision || '',
        },
        document: {
          is_degraded: node.is_degraded || !projections.document?.ok,
          error: projections.document?.error,
          title: projections.document?.payload?.title || projections.document?.payload?.name || node.name || id,
          payload: projections.document?.payload || {},
        },
        graph: projections.graph || {ok: false, nodes: [], edges: [], error: 'Sin datos de grafo'},
        code: projections.code || {ok: false, files: []},
        problems: context.problems_report || {ok: true, problems: []}
      });
    } catch (err) {
      if (!stale()) {
        setNodeData(null);
        setNodeError(err.message || 'Error al cargar datos del nodo');
      }
    }
  };

  useEffect(() => {
    loadCatalog();
    const onPopState = () => syncFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => {
      ++catalogGen.current;
      ++sourceGen.current;
      ++nodeGen.current;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    loadSource(target);
  }, [tKey, reloadCount]);

  useEffect(() => {
    if (modeledId) loadNode(modeledId, depth);
    else {
      ++nodeGen.current;
      setNodeData(null);
      setNodeError('');
    }
  }, [modeledId, depth, reloadCount]);

  const openTarget = (nextTarget, {anchor = null, replace = false} = {}) => {
    if (!nextTarget) return;
    pendingAnchor.current = anchor;
    const same = targetKey(nextTarget) === tKey;
    updateUrl(nextTarget, depth, activeTab, {replace, anchor});
    if (same) {
      // mismo documento: se relee (refresco), no se abre otra copia
      setReloadCount(c => c + 1);
      return;
    }
    navigateTo(nextTarget);
  };

  const handleOpenLink = link => {
    if (!link?.open) return;
    openTarget(link.open, {anchor: link.anchor || null});
  };

  const handleTabChange = tabId => {
    setActiveTab(tabId);
    updateUrl(target, depth, tabId, {});
  };

  const handleDepthChange = newDepth => {
    setDepth(newDepth);
    updateUrl(target, newDepth, activeTab, {});
  };

  const handleSelectNode = id => {
    if (!id || id === '__path__' || id === selectedId) return;
    openTarget({id});
  };

  const handleRange = (key, range) => setRanges(prev => ({...prev, [key]: range}));

  const availableModels = Array.from(new Set(catalog.map(n => n.model_name).filter(Boolean))).sort();
  const filteredNodes = filterCatalog(catalog, searchQuery, modelFilter);
  const problemsInfo = formatProblems(nodeData?.problems);

  const modeled = source?.identity?.kind === 'modeled';
  const unmodeled = source?.identity?.kind === 'unmodeled';
  const openDocId = modeled ? source.identity.id : '';
  // Carga real por panel: nada de valores ausentes ni datos del documento anterior.
  const sourceLoading = !!target && !source && !sourceError;
  const nodeLoading = sourceLoading || (modeled && !nodeData && !nodeError);
  const relationsState = source?.context?.relations_state || null;
  const notReady = relationsState && relationsState.ok === false ? relationsState : (nodeData?.relations?.ok === false ? nodeData.relations : null);
  // Un solo documento, dos lecturas (/source y /node): si la revision difiere, se avisa sin unificar.
  const revisionMismatch = !!(modeled && nodeData && source.revision && nodeData.identity.file_revision && nodeData.identity.file_revision !== source.revision);
  const graphEdges = nodeData?.graph?.edges || [];
  const edgeTypes = distinctEdgeTypes(graphEdges);
  const visibleGraphEdges = filterGraphEdges(graphEdges, edgeTypeFilter);
  const codeFiles = nodeData?.code?.files || [];
  const sections = source?.sections || [];
  const fields = source?.fields || [];
  const corr = correspondence(focus, {sections, fields, edges: graphEdges, files: codeFiles, docId: openDocId});
  const outgoing = source?.context?.outgoing_relations || [];
  const incoming = source?.context?.incoming_relations || [];
  const docTitle = source
    ? (source.descriptor?.payload?.title || nodeData?.document?.title || sections.find(s => s.level === 1)?.title || source.identity.path)
    : '';
  const headerTitle = source?.identity?.id || source?.identity?.path || selectedId || target?.path || 'Workspace';
  const selectValue = target?.id || '';

  return html`
    <div className="workspace-view">
      <header className="workspace-header">
        <div className="workspace-header-title">
          <div className="workspace-eyebrow">WORKSPACE / MULTI-PROYECCIÓN</div>
          <h1>${headerTitle}</h1>
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
              value=${selectValue || (target?.path ? '__path__' : '')}
              onChange=${e => handleSelectNode(e.target.value)}
              aria-label="Seleccionar nodo activo"
            >
              ${target?.path ? html`<option value="__path__">[sin modelo] ${target.path}</option>` : ''}
              ${selectValue && !filteredNodes.some(n => n.id === selectValue) ? html`
                <option value=${selectValue}>${selectValue}</option>
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
            onClick=${() => setReloadCount(c => c + 1)}
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
      ${sourceError ? html`<div className="workspace-alert" role="alert" data-testid="source-error">Error: ${sourceError}</div>` : ''}
      ${nodeError ? html`<div className="workspace-alert" role="alert">Error: ${nodeError}</div>` : ''}
      ${anchorNote ? html`<div className="workspace-alert" role="status" data-testid="anchor-note">${anchorNote}</div>` : ''}

      ${focus ? html`
        <div className="workspace-focus-bar" role="status" data-testid="focus-bar" data-focus-kind=${focus.kind}>
          <strong>Foco:</strong> <span data-testid="focus-desc">${describeFocus(focus)}</span>
          <span className="workspace-focus-corr" data-testid="focus-corr">
            Documento: ${corr.document} · Grafo: ${source && unmodeled ? 'sin grafo' : corr.graph} · Código: ${source && unmodeled ? 'sin referencias' : corr.code}
          </span>
          <button type="button" className="workspace-link-btn" data-testid="focus-clear" onClick=${() => setFocus(null)}>Limpiar foco</button>
        </div>
      ` : ''}

      <div className="workspace-body">
        <main className="workspace-main" aria-label="Proyección activa">
          ${sourceLoading && activeTab === 'document' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="document">Cargando documento…</p>` : ''}
          ${!loading && !target && !sourceError ? html`<p className="workspace-empty">Selecciona un nodo del catálogo para visualizar sus proyecciones.</p>` : ''}

          ${source ? html`
            <section
              className="workspace-doc-pane"
              aria-label="Proyección Documental"
              data-testid="document-reader"
              data-revision=${source.revision}
              data-identity=${source.identity.id || source.identity.path}
              hidden=${activeTab !== 'document'}
            >
              ${(modeled && (nodeData?.document?.is_degraded || source.ir_error)) ? html`
                <div className="workspace-degraded-banner" role="status">
                  <strong>Documento Degradado</strong>
                  <p>${source.ir_error || nodeData?.document?.error || 'El documento no pudo ser procesado con IR completo, pero su representación básica sigue disponible.'}</p>
                </div>
              ` : ''}

              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              <header className="workspace-doc-header">
                <h2>${docTitle}</h2>
                <div className="workspace-doc-meta">
                  <span className="workspace-badge">${source.identity.model_name || 'sin modelo'}</span>
                  <code>${source.identity.path}</code>
                  <span className="workspace-badge" data-testid="doc-revision" title=${source.revision}>sha256 ${formatHash(source.revision, 12)}</span>
                  ${source.encoding === 'utf-8-replaced' ? html`<span className="workspace-badge workspace-badge-warn" data-testid="doc-encoding">utf-8-replaced</span>` : ''}
                </div>
              </header>

              <div className="workspace-reader-columns">
                <section className="workspace-reader-col" aria-label="Render">
                  <h3>Render</h3>
                  <${RenderedDocument}
                    text=${source.text}
                    links=${source.links}
                    sections=${sections}
                    focus=${focus}
                    onFocus=${setFocus}
                    onOpenLink=${handleOpenLink}
                  />
                </section>
                <section className="workspace-reader-col" aria-label="Fuente">
                  <h3>Fuente <small className="workspace-badge">${source.line_count} líneas</small></h3>
                  <${RawSource} text=${source.text} focus=${focus} fields=${fields} />
                </section>
              </div>

              ${(() => {
                const irSections = modeled && source.ir ? irSectionsWithCleanMeta(source.ir) : [];
                const irFieldList = modeled && source.ir ? irFields(source.ir, source.descriptor?.payload) : [];
                return html`
                  ${irSections.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Estructura Documental (IR)</h3>
                      ${irSections.map((sec, i) => html`<${IrSectionView} key=${i} section=${sec} focus=${focus} onFocus=${setFocus} />`)}
                    </div>
                  ` : ''}
                  ${unmodeled && sections.length ? html`
                    <div className="workspace-doc-content" data-testid="outline">
                      <h3>Secciones (sin modelo)</h3>
                      <ul className="workspace-outline">
                        ${sections.map((sec, i) => html`
                          <li key=${i} className=${sectionHighlighted(sec, focus) ? 'is-focused' : ''} style=${{marginLeft: `${Math.max(0, (sec.level || 1) - 1) * 14}px`}}>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="section-focus" onClick=${() => setFocus(sectionFocus(sec))}>${sec.title}</button>
                            <small className="workspace-badge">L${sec.line_start}-${sec.line_end}</small>
                          </li>
                        `)}
                      </ul>
                    </div>
                  ` : ''}
                  ${irFieldList.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Campos del Documento (IR)</h3>
                      ${irFieldList.map((f, i) => html`
                        <div
                          key=${i}
                          className=${'workspace-payload-field' + (fieldHighlighted(f.field_path, focus, graphEdges, openDocId) ? ' is-focused' : '')}
                          data-field-path=${f.field_path}
                        >
                          <h3>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="field-focus" onClick=${() => setFocus(fieldFocus(f.field_path))}>${f.field_path}</button>
                            ${f.span ? html`<small className="workspace-badge">L${f.span.line_start}-${f.span.line_end}</small>` : ''}
                          </h3>
                          ${typeof f.value === 'object' && f.value !== null ? html`
                            <pre><code>${JSON.stringify(f.value, null, 2)}</code></pre>
                          ` : html`
                            <p>${f.value !== null ? String(f.value) : '—'}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : modeled && source.descriptor?.payload && Object.keys(source.descriptor.payload).length ? html`
                    <div className="workspace-doc-content">
                      <h3>Payload del Documento (descriptor)</h3>
                      ${Object.entries(source.descriptor.payload).map(([k, v]) => html`
                        <div key=${k} className="workspace-payload-field" data-field-path=${k}>
                          <h3>${k}</h3>
                          ${typeof v === 'object' ? html`
                            <pre><code>${JSON.stringify(v, null, 2)}</code></pre>
                          ` : html`
                            <p>${String(v)}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : ''}
                `;
              })()}
            </section>
          ` : ''}

          ${sourceLoading && activeTab === 'graph' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="graph">Cargando grafo…</p>` : ''}
          ${sourceLoading && activeTab === 'code' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="code">Cargando código…</p>` : ''}

          ${source && activeTab === 'graph' ? html`
            <section className="workspace-graph-pane" aria-label="Proyección de Grafo">
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-graph">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : (nodeData?.graph?.ok === false || (!nodeData && nodeError)) ? html`
                <div className="workspace-alert" role="alert" data-testid=${nodeData?.graph?.estado === 'store_no_preparado' ? 'store-no-preparado' : 'graph-error'}>
                  ${nodeData?.graph?.estado === 'store_no_preparado'
                    ? `Store no preparado: ${(nodeData.graph.stale || []).length} documento(s) con el índice de aristas atrasado (${(nodeData.graph.stale || []).join(', ')}). Se prepara fuera de la petición con rebuild_edges.`
                    : `Error en grafo local: ${nodeData?.graph?.error || nodeError || 'No se pudo calcular la vecindad del grafo.'}`}
                </div>
              ` : !nodeData ? html`<p role="status" className="workspace-empty">Cargando grafo…</p>` : html`
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
                    ${visibleGraphEdges.map((e, idx) => {
                      const on = edgeHighlighted(e, focus, openDocId);
                      const fieldsOfEdge = edgeFields(e, openDocId);
                      return html`
                        <div
                          key=${idx}
                          className=${'workspace-edge-item' + (on ? ' is-focused' : '')}
                          data-testid="edge-item"
                          data-edge-key=${edgeKey(e)}
                          data-focused=${on ? 'true' : 'false'}
                          data-fields=${fieldsOfEdge.join(',')}
                          role="button"
                          tabIndex="0"
                          onClick=${() => setFocus(edgeFocus(e))}
                          onKeyDown=${ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setFocus(edgeFocus(e)); } }}
                        >
                          <code>${e.source}</code>
                          <span className="workspace-edge-rel">──[${e.type || e.rel || 'rel'}]──▶</span>
                          <code>${e.target}</code>
                          ${fieldsOfEdge.length ? html`<span className="workspace-edge-prov" data-testid="edge-prov">campo: ${fieldsOfEdge.join(', ')}</span>` : ''}
                        </div>
                      `;
                    })}
                  </div>
                ` : html`<p className="workspace-empty">No hay aristas que coincidan con el filtro.</p>`}
              `}
            </section>
          ` : ''}

          ${source && activeTab === 'code' ? html`
            <section className="workspace-code-pane" aria-label="Proyección de Código">
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-code">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : !nodeData ? html`
                <p role="status" className="workspace-empty">${nodeError ? 'Código no disponible.' : 'Cargando código…'}</p>
              ` : !nodeData.code?.ok ? html`
                <div className="workspace-alert" role="status">
                  ${nodeData.code?.error || 'No se pudo generar la proyección de código para este documento.'}
                </div>
              ` : (codeFiles.length ? html`
                <div>
                  ${codeFiles.map(file => html`
                    <${CodeFileView}
                      key=${referenceKey(file)}
                      file=${file}
                      focus=${focus}
                      docId=${openDocId}
                      onFocus=${setFocus}
                      range=${ranges[referenceKey(file)] || null}
                      onRange=${handleRange}
                      onOpenPath=${p => openTarget({path: p})}
                    />
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
              <strong className="workspace-identity-val">${source?.identity?.id || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</strong>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Modelo</span>
              <span className="workspace-identity-val">${source?.identity?.model_name || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Estado</span>
              <span className="workspace-identity-val">${nodeData?.identity?.status || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin estado'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Nodo Actual</span>
              <span className="workspace-identity-val"><code>${nodeData?.identity?.current_node || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin nodo'))}</code></span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Path</span>
              <span className="workspace-identity-val" data-testid="ctx-path">${source?.identity?.path || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Repo</span>
              <span className="workspace-identity-val">${source?.identity?.repo || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Content Hash (SLDB)</span>
              ${nodeData?.identity?.content_hash_error ? html`
                <span className="workspace-alert">${nodeData.identity.content_hash_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.content_hash}>
                  ${nodeData?.identity?.content_hash ? formatHash(nodeData.identity.content_hash, 16) : (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : '—'))}
                </span>
              `}
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">File Revision (Git/Disk)</span>
              <span className="workspace-identity-val" data-testid="ctx-revision" title=${source?.revision}>
                ${source?.revision ? formatHash(source.revision, 16) : (sourceLoading ? 'Cargando…' : '—')}
              </span>
            </div>
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Salientes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : outgoing.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty" data-testid="rel-absent">${source.context.relations_absent}</p>` : notReady ? html`
              <div className="workspace-alert" role="alert" data-testid="store-no-preparado-rel">
                Store no preparado (${notReady.estado}): ${(notReady.stale || []).length} documento(s) atrasados${(notReady.stale || []).length ? ` (${notReady.stale.join(', ')})` : ''}. Sin relaciones ni procedencia hasta preparar el índice fuera de la petición.
              </div>
            ` : outgoing.length ? html`
              <ul className="workspace-rel-list">
                ${outgoing.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.target)}
                    >
                      <span className="workspace-edge-rel">${rel.type || rel.rel || 'rel'} →</span>
                      <span>${rel.target}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones salientes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Incidentes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : incoming.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations-in">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty">Ausentes: documento no modelado.</p>` : notReady ? html`<p className="workspace-empty">Store no preparado: sin relaciones incidentes.</p>` : incoming.length ? html`
              <ul className="workspace-rel-list">
                ${incoming.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.source)}
                    >
                      <span className="workspace-edge-rel">← ${rel.type || rel.rel || 'rel'}</span>
                      <span>${rel.source}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov-in">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones incidentes.</p>`}
            ${source?.context?.relations_error ? html`<div className="workspace-alert" role="alert">${source.context.relations_error}</div>` : ''}
          </section>

          <section className="workspace-sidebar-section" data-testid="links-section">
            <h3>Enlaces del documento (${sourceLoading ? 'cargando' : (source?.links || []).length})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="links">Cargando enlaces…</p>` : (source?.links || []).length ? html`
              <ul className="workspace-rel-list">
                ${source.links.map((l, idx) => html`
                  <li key=${idx} data-status=${l.status} data-testid="link-item">
                    ${l.status === 'ok' && l.open ? html`
                      <button className="workspace-rel-item-btn" onClick=${() => handleOpenLink(l)}>
                        <span className="workspace-edge-rel">→</span>
                        <span>${l.target}</span>
                      </button>
                    ` : html`
                      <span className=${l.status === 'externo' ? 'workspace-link-external' : 'workspace-link-broken'}>${l.target}</span>
                      <small className="workspace-edge-prov">${l.status}: ${l.cause} (origen ${l.origin?.path}:${l.origin?.line ?? '?'})</small>
                    `}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin enlaces.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Problemas de Integridad</h3>
            ${unmodeled ? html`
              <p className="workspace-empty">No aplica: el documento no está en el store.</p>
            ` : nodeLoading ? html`
              <p className="workspace-empty" data-testid="panel-loading" data-panel="problems">Cargando integridad…</p>
            ` : problemsInfo.state === 'error' ? html`
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

FILE:dag.yaml (WS13.2, WS13.3, sin context_review)
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

