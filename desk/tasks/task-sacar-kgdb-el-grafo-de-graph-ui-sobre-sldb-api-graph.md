---
id: task-sacar-kgdb-el-grafo-de-graph-ui-sobre-sldb-api-graph
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-closeout
history:
- task_activates
- task_hands_to_closeout
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Sacar kgdb: el grafo de graph_ui sobre sldb.api.graph

## Rationale

_Explain why this task exists or the business driver behind it._

kgdb dejó de existir como proyecto: su capa de grafo se integró entera a sldb (merge 6deb222). graph_ui todavía lo importa y lo declaraba como dependencia.

## Goal

_Describe the concrete result this task must produce._

Ningún import de kgdb en graph_ui: el adaptador, los contratos y los tests usan sldb.api.graph (GraphSnapshot, snapshot_load, KnowledgeNode, StructuredQuery). pyproject declara solo structuredLanguageDB y pron.

## Scope

_State what is in scope and what is out of scope._

src/adapters, src/contracts/graph_data.py, los tests que usan kgdb (test_kgdb_adapter, test_sldb_end_to_end, comentarios de e2e_mindmap_flow), pyproject.toml y README. Lo que falte en sldb.api se le pide a sldb-04.

## Implementation Path

_Outline the expected implementation route or affected surface._

Renombrar el adaptador a snapshot_adapter sobre sldb.api.graph; portar los tests; verificar la suite en un venv sin el paquete kgdb.

## Validation

_List the checks required before this task can close._

- python3 -m pytest tests -q
- node --test tests/*.mjs

## Done When

_Name the observable condition that makes the task complete._

grep de kgdb sin imports; la suite pasa en un venv sin kgdb instalado; pyproject sin kgdb.
