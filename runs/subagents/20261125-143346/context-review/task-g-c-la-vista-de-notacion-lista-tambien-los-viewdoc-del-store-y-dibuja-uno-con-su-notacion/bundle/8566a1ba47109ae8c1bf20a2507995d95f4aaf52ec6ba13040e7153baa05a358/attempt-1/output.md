## REFORMULACION
El nodo es una tarea de código ejecutable, no un agregado. **Propósito:** que la vista de notación del frontend deje de mostrar solo `SpecDoc` y también liste y dibuje `ViewDoc` del store. **Resultado:** catálogo con ambos tipos, selección de un `ViewDoc` que consulta su evaluación y lo dibuja con el mismo lienzo/layout, más test node y e2e. **Repo:** `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. **Límites:** tocar catálogo/carga en `frontends/mindmap/views/specs/notation/`, `views_routes.py` solo si hace falta, y tests; fuera crear `ViewDoc` desde la UI y la notación de specIR.

## AMBIGUEDADES
1. “specCatalog incluye tambien los ViewDoc que tengan notacion”: no se define cómo detectar que un `ViewDoc` “tiene notación”; obligaría a inventar fuente de verdad y criterio de filtrado.
2. “GET /api/views/evaluate?view=ViewDoc:<name>”: no se precisa cómo construir `<name>` ni si incluye prefijo/ruta; obligaría a inventar el identificador exacto.
3. “si el resultado trae lo mismo que GET /api/notation/view para un spec”: no se define “lo mismo” ni el esquema comparado; obligaría a inventar contrato y función de equivalencia.
4. “agrupados por category si la traen, si no en su propio grupo”: no se indica etiqueta ni orden del grupo propio; obligaría a inventar presentación.
5. “store temporal con un ViewDoc y una notacion propia (sincronizada con sldb notations sync)”: no se detallan fixtures ni formato; obligaría a inventar la preparación e2e.
6. TaskDoc `status: draft`, `current_node: ritual-execution`, pero el ritual exige que sea “the active item on `desk/tasks/Board.md`”; no se aporta el Board, obligaría a asumir promoción/activación.

## DRY-RUN
Leería el TaskDoc, rituales execution/testing/closeout y los archivos citados: `notation.mjs`, `views_routes.py`, tests existentes y e2e de notación. Cambios previstos: ampliar `specCatalog`; al seleccionar `ViewDoc`, consultar evaluación; normalizar el payload en una función pura testeada; dibujar con `sceneFor` + `bestLayout`; añadir test node y e2e; tocar `views_routes.py` solo si falta exposición. Dependencias: contrato real de `/api/views/evaluate`, forma de `/api/notation/view`, sincronización de notaciones. Validaciones futuras: `node --test tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py`. Sin ejecutar nada.

## FUTURO
El Board debe promover/marcar activa la tarea y ligar pills; otro nodo o humano confirma el contrato de evaluación; el ejecutor implementa; el ritual de testing corre las validaciones; closeout actualiza el Board y registra un commit atómico.
