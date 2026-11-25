PASA

# Tester independiente: vista de notación con ViewDoc del store

Veredicto: **PASA**. El commit del ejecutor (`eb72212`, «feat: la vista de notacion lista y dibuja los ViewDoc del store (sobre G-D)») cumple el `Done When`: la vista lista los ViewDoc con notación junto a los SpecDoc y dibuja uno con su notación por el mismo camino `sceneFor + bestLayout`. Todas las pruebas pedidas pasan sobre el árbol actual, que ya contiene G-D.

## Trabajo revisado

- Commit: `eb722129796ba0139e09ad94636a437ce2dae2f2` (sin `Task-Id` en el mensaje, como pidió la tarea).
- Archivos:
  - `frontends/mindmap/views/specs/notation/notation.mjs`
  - `frontends/mindmap/views/specs/notation/notation-view.js`
  - `tests/mindmap-notation.test.mjs`
  - `tests/e2e_notation_viewdoc.py`
- G-D (`8f617a4`, `d26ff31`) es ancestro del commit revisado; el worker de ELK y el criterio de `bestIn`/primer candidato legible siguen presentes.

## Validación ejecutada

Entorno: no hay `python` en el PATH del contenedor ni navegadores de Playwright instalados. Usé el venv de sldb (`/mnt/ssd/proyectos/SLDB_1/sldb/.venv/bin/python`, Python 3.13, pytest 9.1.1) e instalé los navegadores de Playwright en esta sesión (`playwright install chromium chromium-headless-shell`). Los temporales de pytest quedaron en `/tmp/pytest-deskops-t-7f8600cb1dbb` con `TMPDIR=/tmp`.

| Comando | Resultado |
|---|---|
| `node --test tests/mindmap-notation.test.mjs` | 21 passed, 0 failed (incluye los 3 tests nuevos de catálogo/adaptación) |
| `node --test tests/mindmap-notation-layout.test.mjs` | 23 passed, 0 failed (pruebas de G-D sobre layout/candidato legible) |
| `TMPDIR=/tmp python -m pytest -q tests/e2e_notation_viewdoc.py` | 1 passed |
| `TMPDIR=/tmp python -m pytest -q tests/e2e_mindmap_notation.py` | 2 passed |
| `TMPDIR=/tmp python -m pytest -q tests/test_mindmap_notation.py` | 5 passed |

La e2e nueva comprueba el recorrido completo sobre un store temporal: el ViewDoc aparece en el catálogo con `data-kind="view"` y en el grupo «Vistas», al elegirlo se dibujan sus nodos con la forma que resolvió la notación `infra`, hay aristas y la barra muestra la notación de la vista.

## Observaciones (no bloqueantes)

- `viewAsNotation` rellena `kind` y `collection` con `n.model` en lugar de `n.payload.kind`/`n.payload.collection`. Para el caso validado (layout `graph`) no afecta, pero un ViewDoc con layout `grid` perdería sus filas/columnas (`components`/`stages`) y caería al fallback de grafo. El payload de `/api/views/evaluate` tampoco trae compartimentos, marcadores ni `refs`, así que un ViewDoc de clases se dibuja sin compartimentos. Es una limitación del adaptador actual, fuera del caso observable que exige esta tarea.
- El test node cubre el grupo por defecto «Vistas»; no hay caso explícito de un ViewDoc con `category` propia, aunque la implementación la respeta.
