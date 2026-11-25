## REFORMULACION

Encargo ejecutable (`task.code`) en el repo `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`: modificar `frontends/mindmap/views/specs/notation/notation-layout.mjs` (`bestLayout`, líneas 469-523) para que devuelva el primer candidato sin problemas y con zoom legible, conservando el orden actual de candidatos y el comportamiento de las specs que ya aciertan al primer intento. Además, instanciar ELK con worker en `notation-view.js` (línea 25), con fallback al hilo principal. Resultado verificable: una prueba node en `tests/mindmap-notation-layout.test.mjs` con contador de corridas inyectado que limite las corridas de la spec de 13 nodos, sin alterar el layout de las fixtures existentes, más e2e de notación en verde. Fuera de alcance: cambiar el layout de specs que ya salen bien.

## AMBIGUEDADES

1. "el primero sin problemas y con zoom >= legible": no se define "problemas" ni el umbral "legible". Obliga a inventar criterio y valor numérico.
2. "no pasa de un tope (p. ej. 30)": el "p. ej." no fija el tope exigido; obliga a inventar si 30 es normativo o ilustrativo.
3. "el patron que use la libreria vendorizada": no se identifica la ruta ni el patrón de worker de elkjs; obliga a inventar la integración.
4. "copiar activity.render-error-handling a tests/fixtures/ si no esta": no se indica ruta origen ni formato del fixture; obliga a inventar la fuente.
5. "dan el mismo layout que antes": no se define la línea base (snapshot, comparación estructural); obliga a inventar el mecanismo de igualdad.

## DRY-RUN

Lecturas: `notation-layout.mjs:469-523`, `notation-view.js:25`, `tests/mindmap-notation-layout.test.mjs`, `tests/mindmap-notation.test.mjs`, `tests/e2e_mindmap_notation.py`, `tests/e2e_notation_activity.py`, dependencia vendorizada de elkjs/elk-worker y fixture de actividad. Cambios previstos: corte temprano en `bestLayout`, contador inyectable, instancia de ELK con `workerUrl` y fallback, fixture y aserciones de tope/igualdad. Dependencias: disponibilidad de elk-worker servido por graph_ui y del fixture. Validaciones futuras: los dos `node --test` y los dos `pytest` indicados. Nada ejecutado.

## FUTURO

Un humano debe fijar el umbral de zoom legible, el valor normativo del tope de corridas y la línea base de "mismo layout". Otro nodo debe confirmar la ruta del fixture y el patrón de worker; la medición en Chrome (johanes) valida el efecto real.
