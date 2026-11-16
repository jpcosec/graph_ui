---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: IR
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-15T22:48:14'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
---

# IR13 pide migrar graph_ui de spec2viz a sldb (resolve_view, sync de specs, ViewDoc, pilotos)

_Describe the incoming message with enough evidence to triage._

IR13 (gate de retiro de spec2viz, repo IR) pide migrar las dependencias de graph_ui sobre spec2viz. El retiro no está declarado y no se borra nada todavía: este es el pedido de migración que exige el gate (G4). Salida del comprobador `specir retirement check` (IR, solo lectura) sobre UIs/graph_ui, 34 dependencias:

1. Importación en código de producción: `frontends/mindmap/sldb_adapter.py:245` (`from spec2viz.notation_view import ViewError, resolve_view`) y `:437` (`... resolve_documents`) -> `sldb.api.notations.resolve_view`, `resolve_documents` y `ViewError` (fila SV-H03 de `IR/docs/spec2viz/matriz-de-cobertura.md`).
2. Dependencia declarada: `pyproject.toml:19` (extra `notation = ["spec2viz>=0.1.0"]`) y `:24` (extra de test) -> quitar, sldb ya es dependencia; `.github/requirements-suite.txt:10` (`-e git+...spec2viz@master#egg=spec2viz`, el CI lo usa para leer los specs piloto) -> copiar los pilotos que se usan como fixtures propios.
3. Pruebas: `tests/test_projection_views.py:18, 28, 33, 82, 167`, `tests/test_mindmap_notation.py:20, 21, 40, 45`, `tests/e2e_notation_{class:51,58; sequence:101,108; deployment:85,92; activity:121,128; style:141,147; legibility:38,169,175}`, `tests/e2e_mindmap_notation.py:27, 42, 48`, `tests/e2e_review_workbench_views.py:40, 76, 86, 96` (`importorskip("spec2viz")`, `shutil.which("spec2viz")`, `spec2viz diagram sync ... --store .sldb`, `spec2viz.sldb_models.ViewDoc`, pilotos leídos de `spec2viz/docs/architecture/spec2viz`) -> `sldb notations sync --spec <specs> [--notation <yml>] --store .sldb` (SV-E01), `ViewDoc` de `sldb.models.notation.view_doc` (SV-A17), `resolve_view` de `sldb.api.notations` y pilotos copiados como fixtures de graph_ui.

Cuando esté resuelto, respondan con la referencia del commit para registrarla en `IR/docs/spec2viz/acta-de-retiro.md`. Verificación: `cd IR && .venv/bin/specir retirement check --path graph_ui=<ruta> ...` no debe listar nada de graph_ui.
