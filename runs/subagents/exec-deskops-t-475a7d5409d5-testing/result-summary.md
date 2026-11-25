FALLA

# Resultado de testing — task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker

Commit evaluado: `8f617a4d6adb454e32cf6762ab378802cb1217b0` (`G-D: layout de notacion corta en el primer candidato legible; ELK en un worker`).
Archivos del commit: `frontends/mindmap/index.html`, `notation-layout.mjs`, `notation-view.js`, `tests/mindmap-notation-layout.test.mjs`.

## Veredicto

La validación declarada por la tarea no pasa: la e2e de notación detecta un cambio de layout en una spec que antes salía bien. No se cumple «las demás dan el mismo layout».

## Comandos y resultados

1. `node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs`
   - PASA: 41 tests, 0 fallos (23 de layout + 18 de notation).
   - El test nuevo de la actividad de 13 nodos pasa con un tope de 60 corridas.

2. `python -m pytest -q tests/e2e_notation_activity.py`
   - PASA: 2 tests.

3. `python -m pytest -q tests/e2e_mindmap_notation.py`
   - FALLA: 1 pasado, 1 fallido.
   - Fallo: `test_specs_view_draws_nest_markers_compartments_and_terminals`
     - `assert_nodes_framed(page)` da margen `5.007781982421875` (< 8) antes y después de «Ver todo».
     - El fallo está en `tests/e2e_notation_legibility.py:204`, invocado desde `tests/e2e_mindmap_notation.py:104`.

## Aislamiento del fallo

- Con el `notation-layout.mjs` del commit padre `0d517ea` (y el resto del commit del ejecutor intacto), la misma e2e pasa.
- Restaurando solo `notation-layout.mjs` al commit `8f617a4`, la e2e vuelve a fallar con el mismo margen 5.0077.
- Por tanto la regresión viene del corte temprano en `bestIn` (`notation-layout.mjs`), no del worker ni de la e2e.

## Observaciones adicionales

- Corridas reales de ELK en la spec de 13 nodos (contador inyectado, mismo escenario del test): **56**, no 99. El tope del test es 60, pero la ruta pedía un tope del orden de 30; la mejora existe pero el primer candidato limpio y legible no llega hasta después de 48 corridas de los dos sentidos.
- El worker de ELK sí se instancia en Chromium: se observó un `Worker` creado al cargar la spec de actividad y ningún `pageerror`. Sin embargo, su URL es el CDN externo `https://cdn.jsdelivr.net/npm/elkjs@0.11.1/lib/elk-worker.min.js`, no un archivo servido por graph_ui como pedía el alcance; el fallback silencioso al hilo principal no se distingue en la e2e.
- El fixture usado por el test node es una reconstrucción sintética de 13 nodos/17 enlaces, no una copia de `tests/fixtures/notation-pilots/activity-render-error-handling.yml`, aunque ese fixture ya existe.

## Conclusión

El cambio rompe una spec existente (`state.diagram-sync-lifecycle`) y la validación exigida falla. Se devuelve al ejecutor.

## Extra

- `python -m pytest -q tests/test_mindmap_notation.py`: PASA (5 tests). No hay `tests/test_notation_layout.py` ni otro `test_<modulo>.py` para el módulo JS tocado.
