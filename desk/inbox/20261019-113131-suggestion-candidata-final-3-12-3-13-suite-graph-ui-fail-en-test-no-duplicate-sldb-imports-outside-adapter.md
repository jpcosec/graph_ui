---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: spec2viz
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-19T11:31:31'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
---

# Candidata final 3.12/3.13: suite:graph_ui FAIL en test_no_duplicate_sldb_imports_outside_adapter

_Describe the incoming message with enough evidence to triage._

Candidata final de la suite (tools/suite-check.sh --fresh --from-origin --pythons 3.12,3.13, 2026-10-19 09:50) contra graph_ui master@837445e. suite:graph_ui FAIL en py3.12 y py3.13 (1 failed, 125 passed); el resto de la matriz y los e2e de graph_ui están ok.

Test: tests/test_mindmap_adapter.py::test_no_duplicate_sldb_imports_outside_adapter
Error: AssertionError: projection_views.py importa sldb directamente: from sldb.api import load_runtime_documents

La regla del test es que solo frontends/mindmap/sldb_adapter.py importe sldb; projection_views.py (las vistas de proyección de 837445e) lo importa directo. O se mueve ese import detrás del adaptador, o se decide explícitamente que el test admita el módulo.

Logs: /home/jp/.cache/suite-check/final-20261019-0950/py3.12/suite-graph_ui.log y py3.13/suite-graph_ui.log (tabla completa en /home/jp/.cache/suite-check/final-20261019-0950.log).
