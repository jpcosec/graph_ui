Task: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron
Title: el modo local de mindmap abre el store por sldb.api y graph_ui deja de depender de pron
Status: active
Current node: ritual-testing
Task type: task.code
Lifecycle gates:
- task_hands_to_closeout -> ritual-closeout: open [nonempty(validation)]
  post-hook evento-para-el-coordinador: sh -c mkdir -p runs/hooks && printf '%s %s %s %s->%s\n' "$(date -u +%FT%TZ)" "$DESKOPS_TASK_ID" "$DESKOPS_TRANSITION" "$DESKOPS_FROM_NODE" "$DESKOPS_TO_NODE" >> runs/hooks/events.log
  post-hook encola-reap-del-tester: deskops queue add dispatch-reap --root .

---
sldb:
  by: agent
  at: '2026-11-25T20:55:24Z'
  authority: generated
  via: save_document_payload
id: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron
status: active
summary: ''
tags: []
current_node: ritual-testing
history:
- task_activates
references: []
depends_on: []
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
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

## Como probar (tester)

Ubica el trabajo del ejecutor:

    git log -1 --format=%H --grep "Task-Id: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron"   # commit del ejecutor
    git show --name-only <commit>                           # sus archivos

Los tests a correr son los archivos tests/*.py de ese commit, mas tests/test_<modulo>.py cuando exista para cada modulo de codigo tocado; de a uno, con `TMPDIR=/tmp python -m pytest -q <archivo>`. No corras la suite completa: la corre integrate en el host.

Escribe result-summary.md con el veredicto PASA o FALLA en la primera linea.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-85bb9600cb62"
