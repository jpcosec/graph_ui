PASA

# Resultado de testing — task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker

Commit evaluado: `0680ce2e2ae6280ebc5b31a993e183b15debaded` (`fix: ELK cae al hilo principal si el worker no carga (error + timeout del probe) y e2e 404/abort`), el último commit de la tarea en `master`. `HEAD` (`b85dd9a`) solo agrega documentos de run: `git diff 0680ce2 HEAD -- frontends tests` está vacío. Existe otro commit con el mismo parche (`920887b`) fuera de las ramas; se evaluó el de `master`.

Archivos del commit:

- `frontends/mindmap/views/specs/notation/notation-view.js`
- `tests/e2e_notation_activity.py`

## Veredicto

PASA. El único punto que quedaba abierto tras el tester 2 —el fallback al hilo principal cuando el script del worker no carga— está corregido y cubierto por una e2e que falla en el código previo (`d26ff31`) y pasa en este commit. Los comandos de Validation pasan; no hay regresión de layout en las specs que ya salían bien.

## Entorno

El contenedor no tiene un `python` en PATH con Playwright; las pruebas se corrieron con el intérprete que sí tiene `pytest`, `sldb`, `deskops` y `playwright`:

    /workspace/sldb/.venv/bin/python -m pytest ...

Chromium de Playwright se instaló en `/home/scion/.cache/ms-playwright` (`playwright install chromium`).

Todas las corridas usaron:

    export TMPDIR=/tmp
    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-a3c9d3086652-<caso>"

## Comandos y resultados

1. `node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs`
   - **PASA**: 44 tests, 0 fallos, 0 omitidos (4,0 s).
   - Incluye el tope de corridas de la actividad de 13 nodos y el test de que una spec que ya sale bien conserva el candidato de mayor zoom.

2. `pytest -q tests/e2e_notation_activity.py`
   - **PASA**: 4 tests en 58,49 s.
   - Los 4: particiones en carriles UML, notas/merge por ELK, y las dos nuevas variantes del fallback (`route.fulfill(status=404)` y `route.abort()` sobre `**/vendor/elk-worker.min.js`), cada una dibujando los 13 nodos de `activity.render-error-handling` y comprobando que el worker vendorizado fue pedido.

3. `pytest -q tests/e2e_mindmap_notation.py`
   - **PASA**: 2 tests en 47,54 s.
   - Incluye `test_specs_view_draws_nest_markers_compartments_and_terminals`, la regresión que fallaba en el intento 1 (`assert_nodes_framed` con margen 5,0). Ahora pasa con el layout actual.

4. `pytest -q tests/test_mindmap_notation.py`
   - **PASA**: 5 tests en 18,20 s.

5. `pytest -q tests/e2e_notation_legibility.py` (extra, porque toca la actividad real y el encuadre)
   - **PASA**: 3 tests en 60,43 s.

No se corrieron `tests/e2e_notation_class.py` ni `tests/e2e_notation_deployment.py`: la tarea indica que sus fallos son preexistentes en `0d517ea` y quedan fuera de alcance.

## El fallback: verificación de que la prueba discrimina

Además de que la e2e pasa en `0680ce2`, se comprobó que **falla en el código anterior**: worktree temporal en `d26ff31`, con el `tests/e2e_notation_activity.py` de `0680ce2`, caso `[404]`:

    FAILED ...test_elk_worker_failing_to_load_falls_back_to_the_main_thread[404]
    playwright._impl._errors.TimeoutError: Page.wait_for_function: Timeout 60000ms exceeded.

Es el síntoma reportado por el tester 2: 0 nodos dibujados cuando el worker no carga. En `0680ce2` el mismo caso pasa y se dibujan los 13 nodos. La implementación escucha `error` del `Worker` y pone un timeout de 4 s al probe; ambos rechazan la promesa y `elkReady()` cae a `mainThreadElk`.

## Worker de ELK

- La URL es `new URL('../../../vendor/elk-worker.min.js', import.meta.url)`, es decir, servida por graph_ui; no hay CDN en el código.
- El archivo está vendorizado y commiteado: `frontends/mindmap/vendor/elk-worker.min.js`, 1.593.716 bytes.
- La e2e nueva registra la petición y exige `requested` no vacío, así que no puede pasar como si el worker ni se hubiera intentado.
- En la ruta normal (sin bloquear nada), Playwright ve el worker vivo calculando: `page.workers == ['http://127.0.0.1:.../vendor/elk-worker.min.js']` con los 13 nodos dibujados. No hay caída silenciosa al hilo principal por el timeout de 4 s en esta máquina.

## Tope de corridas (cuenta medida)

Con un contador inyectado y el snapshot real del piloto (`tests/fixtures/notation-view-activity.json`, 13 nodos / 17 relaciones):

    {"runs":56,"nodes":13,"zoom":0.9716835226766641,"issues":{"total":0},"direction":"TB"}

- Son **56 corridas** = 24 del primer sentido + 24 del sentido perpendicular + 8 del pase de rescate sin reservar rótulos, que corta en el primer candidato limpio.
- El tope del test node es `<= 56`, y pasa.
- El objetivo original de 30 no se alcanza sin cambiar layouts de specs que ya salen bien; se deja el mínimo alcanzable y aquí queda la cuenta, como permite la aclaración de la tarea.

## Observaciones

- El test node sigue leyendo `tests/fixtures/notation-view-activity.json`, un snapshot del `resolve_view` del YAML real, no el YAML directamente. Comparado hoy contra `resolve_view(tests/fixtures/notation-pilots/activity-render-error-handling.yml)` la única diferencia es que el snapshot no tiene `"gaps": []`; nodos, enlaces, notación y layout coinciden. La e2e nueva sí parte del YAML real con `sldb notations sync`. No es un fallo de este commit (el snapshot viene de `d26ff31`) y no afecta el fallback evaluado.
- El fix no toca `notation-layout.mjs` ni el worker vendorizado, tal como pedía la aclaración; el diff se limita a `notation-view.js` y a la e2e.

## Conclusión

El fallback exigido funciona ante 404 y red abortada, la vista sigue dibujando los 13 nodos, el worker es un archivo servido por graph_ui y las validaciones de layout y notación pasan. Se acepta.
