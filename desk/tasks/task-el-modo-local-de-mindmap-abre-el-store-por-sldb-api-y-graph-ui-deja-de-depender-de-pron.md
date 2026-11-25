---
sldb:
  by: agent
  at: '2026-11-25T21:35:50Z'
  authority: generated
  via: save_document_payload
id: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron
status: active
summary: ''
tags: []
current_node: ritual-testing
history:
- task_activates
references:
- .github/requirements-suite.txt
- frontends/mindmap/models_service.py
- frontends/mindmap/persistence.py
- frontends/mindmap/serve.py
- frontends/mindmap/sldb_adapter.py
- pyproject.toml
- tests/test_ci_workflow.py
- tests/test_mindmap_adapter.py
- 6a192d3ba8848c480bbf7e4107c5a8eedda105e7
depends_on: []
pills: []
files:
- .github/requirements-suite.txt
- frontends/mindmap/models_service.py
- frontends/mindmap/persistence.py
- frontends/mindmap/serve.py
- frontends/mindmap/sldb_adapter.py
- pyproject.toml
- tests/test_ci_workflow.py
- tests/test_mindmap_adapter.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-pron
---

# el modo local de mindmap abre el store por sldb.api y graph_ui deja de depender de pron

## Rationale

_Explain why this task exists or the business driver behind it._

ADR sldb/docs/architecture/pron-is-archived.md (JP, 2026-11-25): pron se archiva y la puerta a un store es sldb. El modo local, que es el default, abre el store con pron.world.store.Store (frontends/mindmap/sldb_adapter.py:87) y el editor de clases también (models_service.py). Todo lo que le piden existe en sldb.api, y el modo remoto ya funciona sin pron.

## Goal

_Describe the concrete result this task must produce._

Que mindmap lea, cree, reemplace y quite documentos, registre modelos y edite clases en modo local llamando a sldb.api, sin importar pron.

## Scope

_State what is in scope and what is out of scope._

Dentro: frontends/mindmap/sldb_adapter.py, models_service.py, serve.py, pyproject.toml y .github/requirements-suite.txt. Fuera: la edición por gestos, el modo remoto, reescribir docs/ (tarea aparte).

## Implementation Path

_Outline the expected implementation route or affected surface._

Leer docs/mindmap-developer.md. sldb serve ya implementa las mismas operaciones sobre sldb.api (sldb/src/sldb/cli/serve/): se usan esas funciones, sin una capa nueva.

Aclaraciones de la revisión: Repo: /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Los tres archivos son frontends/mindmap/sldb_adapter.py, frontends/mindmap/models_service.py y frontends/mindmap/serve.py. El ADR está en /mnt/ssd/proyectos/SLDB_1/sldb/docs/architecture/pron-is-archived.md. pyproject.toml y .github/requirements-suite.txt son los de graph_ui. Para registrar modelos y editar clases se usan las funciones públicas de sldb.api (las mismas que llaman las rutas de sldb/src/sldb/cli/serve/); si una operación solo existe en el router de serve y no en sldb.api, no se copia: se manda nota al inbox de sldb (deskops message send --to sldb --kind unclear) y se deja anotada en result-summary. Entorno sin pron: correr los tests con un venv o PYTHONPATH sin pron, o con un test que haga que import pron falle (monkeypatch de sys.modules) y compruebe que el modo local abre el store. La suite es python -m pytest -q tests desde la raíz de graph_ui. No poner Task-Id en el commit de código.

## Validation

_List the checks required before this task can close._

- ! grep -rnE '^(from|import) pron|pron\.world' frontends src
- python -m pytest -q tests

## Done When

_Name the observable condition that makes the task complete._

En un entorno sin pron instalado, la suite completa de tests/ pasa en modo local. Ningún archivo de frontends/ ni de src/ importa pron. pyproject.toml y requirements-suite.txt no lo nombran.
