FILE:desk/tasks/task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com.md
---
sldb:
  by: agent
  at: '2026-11-16T03:48:41Z'
  authority: generated
  via: save_document_payload
id: task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- desk/inbox/20261115-224814-suggestion-ir13-pide-migrar-graph-ui-de-spec2viz-a-sldb-resolve-view-sync-de-specs-viewdoc-pilotos.md
- ../../IR/docs/spec2viz/matriz-de-cobertura.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views_routes.py
- frontends/mindmap/projection_views.py
- frontends/mindmap/persistence.py
- frontends/mindmap/serve.py
- frontends/mindmap/views/specs/notation/
- pyproject.toml
- .github/requirements-suite.txt
- tests/fixtures/notation-pilots/
- tests/test_projection_views.py
- tests/test_mindmap_notation.py
- tests/test_mindmap_skin.py
- tests/e2e_notation_class.py
- tests/e2e_notation_sequence.py
- tests/e2e_notation_deployment.py
- tests/e2e_notation_activity.py
- tests/e2e_notation_style.py
- tests/e2e_notation_legibility.py
- tests/e2e_mindmap_notation.py
- tests/e2e_review_workbench_views.py
- desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
- atom-cómo-corre-la-ci-de-graph-ui
---

# IR13: migrar graph_ui de spec2viz a sldb.api.notations (resolve_view, sync de specs, ViewDoc, pilotos como fixtures)

## Rationale

_Explain why this task exists or the business driver behind it._

IR13 (gate de retiro de spec2viz en el repo IR, gate G4) exige que ningún consumidor dependa de spec2viz antes de retirarlo. `specir retirement check` encontró 34 dependencias en graph_ui (nota del inbox 20261115-224814 de IR). sldb ya trae todo lo equivalente: `sldb.api.notations` (resolve_view, resolve_documents, ViewError), `sldb notations sync --spec` y `sldb.models.notation.view_doc.ViewDoc` (filas SV-H03, SV-E01 y SV-A17 de IR/docs/spec2viz/matriz-de-cobertura.md).

## Goal

_Describe the concrete result this task must produce._

graph_ui deja de importar, instalar o invocar spec2viz: el código de producción usa `sldb.api.notations`, el store registra el ViewDoc de sldb, las pruebas sincronizan specs con `sldb notations sync --spec ... --store .sldb` sobre pilotos copiados como fixtures propios de graph_ui, y `specir retirement check` no lista nada de graph_ui.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py (líneas ~239-247 y ~435-437), views_routes.py (VIEW_MODEL_REF = 'spec2viz.sldb_models:ViewDoc' pasa a 'sldb.models.notation.view_doc:ViewDoc'), projection_views.py, persistence.py y serve.py (imports y docstrings que nombran spec2viz como el que resuelve). (2) pyproject.toml: quitar el extra 'notation' y 'spec2viz>=0.1.0' del extra 'test'. (3) .github/requirements-suite.txt: quitar la línea '-e git+https://github.com/jpcosec/spec2viz@master#egg=spec2viz' y su comentario de tres líneas. (4) Crear tests/fixtures/notation-pilots/ con exactamente estos 10 archivos, copiados byte a byte de spec2viz en el commit 2a218b1 (2026-11-15): de spec2viz/docs/architecture/spec2viz/ activity-render-error-handling.yml, class-sldb-models.yml, component-architecture.yml, component-exception-hierarchy.yml, component-type-system.yml, matrix-pipeline-coverage.yml, sequence-render-pipeline.yml, sequence-sync-pipeline.yml y state-diagram-sync-lifecycle.yml; de spec2viz/tests/fixtures/ matrix.quotation-view.yml. Sin los .mmd ni .vega.json generados. Más un README.md de una línea: 'Copiados de jpcosec/spec2viz en 2a218b1 (IR13); se mantienen aquí, spec2viz se retira.' Los demás fixtures (tests/fixtures/notation-activity, -class, -deployment, -legibility, -sequence, -style) ya son de graph_ui y no se tocan. (5) Pruebas: tests/test_projection_views.py, tests/test_mindmap_notation.py, tests/test_mindmap_skin.py (solo el comentario de la línea 62), tests/e2e_notation_{class,sequence,deployment,activity,style,legibility}.py, tests/e2e_mindmap_notation.py y tests/e2e_review_workbench_views.py: PILOTS y MATRIX pasan a tests/fixtures/notation-pilots/; importorskip('spec2viz') y shutil.which('spec2viz') se quitan (sldb es dependencia obligatoria); cada 'spec2viz diagram sync A.yml B.yml [--notation N.yml] --store .sldb' pasa a 'sldb notations sync --spec A.yml --spec B.yml [--notation N.yml] --store .sldb' (mismo cwd); 'spec2viz.sldb_models.ViewDoc' pasa a 'sldb.models.notation.view_doc.ViewDoc'. Ninguna prueba se salta por falta de spec2viz. (6) Textos visibles y comentarios que atribuyen la resolución a spec2viz (notation-view.js, notation.mjs, notation-style.mjs, notation-swimlanes.mjs) pasan a decir sldb. (7) Actualizar el atom atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz con 'deskops edit atom' para que diga sldb.api.notations y sldb/src/sldb/notations/builtin/. NO ENTRA: dibujar paquetes UML (otra tarea), cambiar el layout o el estilo de la vista, tocar los repos spec2viz, sldb o IR, y los cambios sin commitear de JP en frontends/desk/app.js y frontends/desk/task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Correr 'grep -rn spec2viz frontends tests pyproject.toml .github' para fijar la lista real. 2) Reemplazar los imports por 'from sldb.api.notations import ViewError, resolve_view, resolve_documents'. Las firmas son las mismas que las de spec2viz: resolve_view(store, spec_ref, pythonpath=None) -> dict y resolve_documents(store, notation_ref, doc_refs, *, relation_refs=None, spec_style=None, pythonpath=None, docs=None) -> dict; ViewError es subclase de ValueError en ambos. Se cambia el import, no se envuelve. El 501 por 'spec2viz no está instalado' desaparece: sldb siempre está. 3) VIEW_MODEL_REF = 'sldb.models.notation.view_doc:ViewDoc'. El .sldb de graph_ui no registra ViewDoc (grep ViewDoc .sldb/store.yaml no devuelve nada): ensure_model de views_routes.py lo registra a pedido en el store servido, así que no hay registro que migrar. 4) Copiar los 10 pilotos del alcance con 'git -C ../../spec2viz show 2a218b1:<ruta>' a tests/fixtures/notation-pilots/ y apuntar PILOTS y MATRIX ahí. 5) Cambiar las llamadas de sync en las pruebas como dice el alcance. 6) Quitar spec2viz de pyproject.toml y .github/requirements-suite.txt; reinstalar el entorno de pruebas sin spec2viz ('pip uninstall -y spec2viz') para validar. 7) Correr la validación, commitear y responder a IR con 'deskops message send --to IR' con el sha del commit para IR/docs/spec2viz/acta-de-retiro.md.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py
- python -m pytest -q -rs tests/e2e_notation_class.py tests/e2e_notation_sequence.py tests/e2e_notation_deployment.py tests/e2e_notation_activity.py tests/e2e_notation_style.py tests/e2e_notation_legibility.py tests/e2e_mindmap_notation.py tests/e2e_review_workbench_views.py
- ! grep -rnE 'from spec2viz|import spec2viz|importorskip\("spec2viz"\)|which\("spec2viz"\)|spec2viz\.sldb_models|spec2viz>=|spec2viz@' frontends tests pyproject.toml .github
- cd ../../IR && .venv/bin/specir retirement check --path graph_ui=../UIs/graph_ui

## Done When

_Name the observable condition that makes the task complete._

En un entorno sin spec2viz instalado (`python -c "import spec2viz"` falla), la validación pasa sin skips por spec2viz; el grep de la validación no devuelve nada; `specir retirement check` no lista ninguna dependencia de graph_ui; IR recibió por inbox el sha del commit.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

