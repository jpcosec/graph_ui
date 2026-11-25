PASA

# Tester independiente: modo local de mindmap sobre sldb.api, sin pron

Veredicto: **PASA**. El commit del ejecutor (`6a192d3`, «feat: el modo local de mindmap abre el store por sldb.api y graph_ui deja pron») cumple el `Done When`: en un entorno con `pron` bloqueado el adaptador y el editor de clases abren y operan el store local, `frontends/` y `src/` no importan `pron`, y `pyproject.toml`/`.github/requirements-suite.txt` ya no lo nombran.

## Trabajo revisado

- Commit: `6a192d3ba8848c480bbf7e4107c5a8eedda105e7` (sin `Task-Id` en el mensaje, como pidió la aclaración de la revisión).
- Archivos:
  - `frontends/mindmap/sldb_adapter.py`
  - `frontends/mindmap/models_service.py`
  - `frontends/mindmap/serve.py`
  - `frontends/mindmap/persistence.py`
  - `pyproject.toml`
  - `.github/requirements-suite.txt`
  - `tests/test_ci_workflow.py`
  - `tests/test_mindmap_adapter.py`
- El árbol actual coincide con el commit en los archivos de código/tests (los commits posteriores solo tocan `.sldb/`, `desk/` y `runs/`).

## Entorno

- No hay `python` en el PATH del contenedor. Usé `/mnt/ssd/proyectos/SLDB_1/sldb/.venv/bin/python` (Python 3.13.18, pytest 9.1.1).
- `pron` está instalado en ese venv, así que lo bloqueé con un `sitecustomize.py` en `/tmp/no-pron` que inserta un `MetaPathFinder` y hace fallar `import pron` con `ModuleNotFoundError` (verificado).
- `TMPDIR=/tmp` y `PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-85bb9600cb62"` en todas las corridas.

## Validación ejecutada

| Comando | Resultado |
|---|---|
| `grep -rnE '^(from\|import) pron\|pron\.world' frontends src` | sin coincidencias (exit 1) |
| `grep -n pron pyproject.toml .github/requirements-suite.txt` | sin coincidencias (exit 1) |
| `pytest -q tests/test_ci_workflow.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py` | 18 passed |
| `pytest -q tests/test_mindmap_endpoints.py` | 33 passed |
| las cuatro suites anteriores con `pron` bloqueado | 51 passed |
| `pytest -q tests/test_mindmap_workspace.py tests/test_projection_views.py tests/test_mindmap_notation.py` con `pron` bloqueado | 34 passed |
| script directo sobre `models_service` + servidor local con `pron` bloqueado | OK |

El script directo compila la KB pequeña, abre `SldbAdapter`, y comprueba `models_service.list_models`, `detail`, `fields_add`, `validate` (`promoted: false`), `promote` (`promoted: true`, versión 2 con el campo nuevo), `add_model` en un store vacío, y los endpoints locales `/api/models/{list,detail,fields-remove,validate,promote}`. También cubre crear/reemplazar/quitar documentos vía los tests de `test_mindmap_adapter.py` y `test_mindmap_persistence.py`.

No corrí `e2e_mindmap_classes.py`: no hay navegadores de Playwright instalados en esta sesión. Las cinco operaciones del diálogo de clases quedaron cubiertas por el script directo y por HTTP, incluida la promoción del draft.

## Observaciones (no bloqueantes)

- `models_service.list_models` reutiliza `catalog_payload` de `sldb.cli.serve.models_routes` (el catálogo con versión/canonical/family/documentos no existe en `sldb.api`). El ejecutor lo anotó en su `result-summary`, pero no consta la nota al inbox de `sldb` que pedía el `Implementation Path` para operaciones que solo viven en el router. Funcionalmente no afecta al `Done When`; queda como deuda de frontera entre graph_ui y sldb.
- `frontends/mindmap/__pycache__` tenía `.pyc` viejos (Python 3.12, de antes del commit) que aún contenían `pron` y hacían fallar el `grep` de validación. Son cachés generados e ignorados por git: los eliminé y el grep quedó limpio; el código fuente nunca importó `pron`.
- Quedan menciones de «pron» en comentarios (`source/projections.mjs`, `source/graph.mjs`, vistas) y en docs; no son imports y la reescritura de docs quedó fuera de alcance según la tarea.
