# Resultado: G-C ViewDoc en la vista de notación
run_id: exec-deskops-e-84ca580617e9 · session: (no disponible en este entorno) · session_sha256: n/a

## Hecho
- `notation.mjs`: `specCatalog` incluye los ViewDoc con `notation` (`kind:'view'`, id `ViewDoc:<name>`, grupo `category` o «Vistas»). Nuevo `viewAsNotation(evaluated, ref)`: función pura, único punto de adaptación de `/api/views/evaluate` a la forma de `/api/notation/view` (nodos `Model:name` con glifo resuelto, links por posición). Notación con error -> lanza.
- `notation-view.js`: al elegir un `ViewDoc:` pide `/api/views/evaluate?view=...` y adapta; mismo `sceneFor` + layout. Marca `data-kind` en el catálogo.
- Sin cambios en `views_routes.py`.
- Tests: 3 nuevos en `tests/mindmap-notation.test.mjs`; e2e nueva `tests/e2e_notation_viewdoc.py`.

## Validación (validation.log)
`node --test tests/mindmap-notation.test.mjs && pytest tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py` -> 21 node ok, 3 pytest ok, exit 0.

## Revisar
- Los ViewDoc llegan al catálogo por `kb.documents` (funciona en la e2e). Los ViewDoc no traen compartimentos ni markers: se dibujan vacíos.
- Entorno: el extra `dev` no existe en pyproject; instalé pytest/playwright a mano en /tmp/ws-venv.

Archivos: frontends/mindmap/views/specs/notation/notation.mjs, notation-view.js, tests/mindmap-notation.test.mjs, tests/e2e_notation_viewdoc.py
