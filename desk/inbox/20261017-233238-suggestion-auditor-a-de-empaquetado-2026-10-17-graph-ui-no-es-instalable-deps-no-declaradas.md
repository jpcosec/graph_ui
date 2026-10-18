---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: graph_ui
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-17T23:32:38'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-10-18T01:32:42'
---

# Auditoría de empaquetado 2026-10-17: graph_ui no es instalable, deps no declaradas

_Describe the incoming message with enough evidence to triage._

Auditoría read-only de empaquetado (2026-10-17). Hallazgos en graph_ui:
1. pyproject.toml:1-4 solo tiene [tool.pytest.ini_options]; no hay [project] ni [build-system]: no es instalable ni tiene versión. No está instalado en ningún entorno.
2. Imports sin declarar: kgdb (src/adapters/kgdb_adapter.py:7-8), sldb (frontends/mindmap/sldb_adapter.py:28-31,155-156,283,295), pron (sldb_adapter.py:49-50,220,232,245; models_service.py:27).
3. Resolución de imports por hacks: pythonpath=["src"] (pyproject.toml:2) para 'from contracts...' (kgdb_adapter.py:10); sys.path.insert en frontends/mindmap/compiler.py:28-29 y tests (p.ej. tests/test_mindmap_contract.py:7); imports sueltos en serve.py:397,446-447 y persistence.py:17. src/__init__.py existe pero el código importa contracts.*/adapters.* como top-level.
4. apps/review-workbench/dist (2026-09-22) desfasado vs su src y no consumido por Python. package.json de knowledge-workbench y review-workbench en 0.1.0.
5. Único tag v-antonia-live-editor-2026.08.29, 107 commits detrás de HEAD 0d393a4; worktree con 123 entradas (79 D, 36 M, 8 ??). Sin .github/.
