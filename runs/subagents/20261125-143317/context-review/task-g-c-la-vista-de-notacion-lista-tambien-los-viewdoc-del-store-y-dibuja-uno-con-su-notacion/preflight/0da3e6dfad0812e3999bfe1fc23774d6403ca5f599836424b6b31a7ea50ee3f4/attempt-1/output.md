## REFORMULACION
**Propósito:** que la vista de notación deje de listar solo `SpecDoc` y también liste los `ViewDoc` del store, permitiendo dibujar uno con su notación.
**Resultado:** catálogo que incluye ambos tipos; al seleccionar un `ViewDoc`, se obtiene su evaluación y se dibuja reutilizando `sceneFor` y `bestLayout`.
**Repo:** `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`.
**Límites:** dentro, `frontends/mindmap/views/specs/notation/`, `views_routes.py` solo si es necesario, un test node y una e2e. Fuera: crear `ViewDoc` desde la UI y la notación de specIR.

## AMBIGUEDADES
1. «marcados como vista, agrupados por category si la traen, si no en su propio grupo»: obliga a inventar la etiqueta visual, el nombre y el orden del grupo propio.
2. «si el resultado trae lo mismo que GET /api/notation/view para un spec»: obliga a definir qué significa «lo mismo» (campos, forma y criterio de comparación).
3. «adaptarlo en un punto (funcion pura testeada), sin un segundo layout»: obliga a inventar firma, ubicación y contrato de esa función.
4. «views_routes.py:3-7» y «solo si hace falta exponer algo»: obliga a decidir si se modifica el router y cómo tratar errores o resultados vacíos.
5. «store temporal con un ViewDoc y una notacion propia (sincronizada con sldb notations sync)»: obliga a inventar el fixture, el esquema del store y la invocación concreta de `sync`.
6. «un test node y una e2e» / «(o uno nuevo)»: obliga a elegir el archivo definitivo y el alcance exacto del test.

## DRY-RUN
Sin ejecutar: un ejecutor leería `notation.mjs` (catálogo y carga), `views_routes.py`, `tests/mindmap-notation.test.mjs` y `tests/e2e_mindmap_notation.py`. Modificaría el filtro de `specCatalog` para incluir `ViewDoc` con notación, añadiría la selección y llamada a `/api/views/evaluate?view=ViewDoc:<name>`, normalizaría el payload con una función pura y reutilizaría `sceneFor`/`bestLayout`; añadiría el test node y la e2e. Depende del endpoint de evaluación, de `sldb notations sync` y del harness de tests. Validación futura: `node --test tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py`.

## FUTURO
Otro nodo de IR implementa la notación de specIR. CI ejecuta las validaciones y un humano revisa el resultado visual y cierra la tarea.
