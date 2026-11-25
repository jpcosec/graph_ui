FALLA

# Resultado de testing — task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker

Commit evaluado: `d26ff31c10626ebe7b5834273f090ccde22b177d` (`G-D: sin corte temprano en bestIn; worker de ELK vendorizado; fixture real de actividad`).
Corrido en un worktree limpio en `/tmp/gui-d26` sobre ese commit (el árbol de trabajo ya tiene encima el commit posterior G-C `eb72212`, que no toca el worker ni el layout de specs).
Archivos: `frontends/mindmap/vendor/elk-worker.min.js`, `notation-layout.mjs`, `notation-view.js`, `tests/fixtures/notation-view-activity.json`, `tests/mindmap-notation-layout.test.mjs`.

## Veredicto

Los comandos de Validation pasan y la regresión de `state.diagram-sync-lifecycle` está corregida. Falla un requisito explícito del Implementation Path: **el fallback al hilo principal no funciona cuando el worker no carga**. Si `/vendor/elk-worker.min.js` responde 404 (o se aborta), la vista no dibuja nada: el worker se crea, el `layout` de prueba nunca resuelve y no hay fallback. Solo cae al hilo principal si falla el import del API o si el constructor `Worker` lanza de forma síncrona; no si el script del worker no carga.

## Comandos de Validation

1. `node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs`
   - **PASA**: 41 tests, 0 fallos, 0 omitidos.
   - Incluye el tope de la actividad de 13 nodos y el test que fija que una spec que ya sale bien conserva el candidato de mayor zoom.

2. `python -m pytest -q tests/e2e_mindmap_notation.py`
   - **PASA**: 2 tests en 100 s (worktree d26).
   - El caso que fallaba en el intento anterior (`test_specs_view_draws_nest_markers_compartments_and_terminals`) ahora encuadra con margen >= 8; ya no se reproduce el 5.0077.

3. `python -m pytest -q tests/e2e_notation_activity.py`
   - **PASA**: 2 tests en 49 s (worktree d26).

Extras (tests de notación relacionados, corridos de a uno):

- `tests/e2e_notation_legibility.py`: 3 passed en la corrida del árbol de trabajo (incluye la actividad real de `activity-render-error-handling.yml`). En el worktree d26, una corrida del archivo completo tuvo un timeout de Playwright en `test_specs_read_whole_after_fit`; ese test pasó solo en 68 s, sin fallo de aserción de layout.
- `tests/e2e_notation_sequence.py`: 4 passed.
- `tests/e2e_notation_style.py`: 1 passed.
- `tests/test_mindmap_notation.py`: 5 passed.
- `tests/e2e_notation_class.py`: 1 failed, 3 passed; el mismo fallo (`minTextPx = 9.72895` en `test_r10_unrelated_classes_go_in_a_grid_and_the_whole_reads`) ocurre en el padre `0d517ea`, no lo introduce este commit.
- `tests/e2e_notation_deployment.py`: 2 failed, 1 passed; los mismos dos fallos ocurren en `0d517ea`, preexistentes.

## Worker de ELK: lo que sí cumple

En Chromium, con un store real y la spec `activity.render-error-handling`:

- Se observa `Worker: http://127.0.0.1:.../vendor/elk-worker.min.js`.
- La petición a `/vendor/elk-worker.min.js` responde **200**, `text/javascript`, 1.593.716 bytes.
- No hay `pageerror`.
- El archivo está vendorizado y commiteado en `frontends/mindmap/vendor/elk-worker.min.js`; no sale del CDN.
- La prueba e2e dibuja los 13 nodos y las 17 relaciones.

## Fallback al hilo principal: el fallo

Reproducción con Playwright, store de una sola spec y la misma vista `/specs/notation`:

- `route.fulfill(status=404)` sobre `**/vendor/elk-worker.min.js`: se crea el worker, pasan 20 s, **0 nodos dibujados**, sin `pageerror`, sin fallback.
- `route.abort()` sobre la misma URL: mismo resultado, **0 nodos**, sin `pageerror`.
- `window.Worker` sobrescrito para lanzar al construir el worker: **sí** cae al hilo principal; se dibujan los 13 nodos y no se crea worker.

El `await elk.layout({id: 'probe', ...})` de `workerElk()` no detecta el fallo de carga del script: ELK no rechaza la promesa cuando el worker no llega a registrarse. El `catch(mainThreadElk)` cubre el import del API y el constructor, pero no la carga del script del worker. El comentario de `notation-view.js` («si no carga, ELK corre en el hilo principal») no se cumple para el caso más probable: archivo ausente, 404, ruta mal servida o contenido corrupto.

## Observaciones

- **Tope de corridas**: el test node mide 56 con la medida de los tests (`0.5 em`), que es exactamente `24 + 24 + 8` (los 8 candidatos de rescate hasta el primero limpio y legible). Con `approximateMeasure` (`0.56 em`, más parecido al navegador) el mismo escenario da **64** (`24 + 24 + 16`), y en Chromium el worker recibe 64 layouts de `bestLayout` más 1 probe = **65**. El tope 30 no se alcanza; el mínimo actual sin reordenar candidatos es 56 en la medida del test y 64 en la medida aproximada. La cláusula de la tarea permite dejar el mínimo alcanzable, pero pide explicarlo en `result-summary.md` con la cuenta medida; el commit no trae ese archivo, solo el comentario del test.
- **Fixture**: `tests/fixtures/notation-view-activity.json` es exactamente igual a `resolve_view(store, 'activity.render-error-handling')` sobre `tests/fixtures/notation-pilots/activity-render-error-handling.yml` (comparado con `v == snap`, sin diferencias). No es una reconstrucción sintética; es un snapshot fiel del fixture real. El test lee el JSON, no el YAML, así que no detectaría cambios futuros del piloto.
- **Layouts de las demás specs**: la e2e de notación y la de legibilidad pasan con el mismo layout; la regresión de `state.diagram-sync-lifecycle` quedó corregida. Los fallos de class/deployment son preexistentes en `0d517ea`.

## Conclusión

La parte de layout y de worker está bien encaminada, pero el fallback exigido no funciona ante un worker que no carga. Se devuelve al ejecutor. Arreglo mínimo esperado: rechazar la promesa del probe con un `timeout` y/o escuchar `worker.onerror` (y el `error` del `Worker`) antes de caer a `mainThreadElk`, más una prueba que bloquee `/vendor/elk-worker.min.js` y verifique que la vista sigue dibujando.
