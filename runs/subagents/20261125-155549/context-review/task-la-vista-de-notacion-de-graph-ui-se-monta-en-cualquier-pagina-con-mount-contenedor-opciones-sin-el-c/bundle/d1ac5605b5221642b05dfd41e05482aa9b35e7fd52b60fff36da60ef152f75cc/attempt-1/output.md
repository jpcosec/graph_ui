## REFORMULACION

Nodo ejecutable (`task.code`). Propósito: ofrecer un punto de entrada embebible para la vista de notación de graph_ui, sin shell, para integrarla en cualquier página. Resultado: `frontends/mindmap/embed/notation.js` con `mount(container, {baseUrl, spec, view, theme})` y `unmount`, montando la vista con su `SourceProvider` y `request(baseUrl)`; página anfitriona `tests/fixtures/embed/host.html`; y e2e `tests/e2e_embed_notation.py`. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: solo `frontends/mindmap/embed/`, página host y e2e nueva; fuera tema/storage con alcance (G-A3) y otras vistas (G-A4).

## AMBIGUEDADES

1. «abre host.html (otro origen o ruta fuera de mindmap)»: no se fija el origen, la ruta ni el servidor. Obliga a inventar el montaje de servido, rutas y posible CORS.
2. «mount(container, {baseUrl, spec, view, theme})» frente a «Fuera: tema/storage con alcance (G-A3)»: no se define si `theme` se aplica, se ignora o se reserva. Obliga a inventar su comportamiento y el significado de `view`.
3. «con su SourceProvider y request(baseUrl)»: no se da contrato, importación ni forma de `baseUrl`. Obliga a inventar API, normalización y errores.
4. «spec de fixtures» y «lista el catalogo»: no se nombra fixture, endpoint ni esquema del catálogo. Obliga a inventar origen y datos.
5. «El importmap que hoy pone index.html (react, @xyflow/react, ...)» y «incluye elkjs ademas de react y @xyflow/react»: no se listan especificadores ni versiones completas. Obliga a inventar el importmap.
6. «exporte mount(...) y unmount»: no se define firma ni ciclo de vida de `unmount`. Obliga a inventar su contrato.

## DRY-RUN

Lecturas hipotéticas: TaskDoc, rituales, tarea dependiente, `index.html`, módulo de notación, `tests/e2e_mindmap_notation.py` y fixtures. Cambios previstos: crear `embed/notation.js`, `tests/fixtures/embed/host.html` y `tests/e2e_embed_notation.py`; reutilizar el patrón `_serve` y las aserciones básicas de notación. Dependencias: contrato de `SourceProvider`/`request(baseUrl)` de la tarea previa y el importmap de la página anfitriona. Validaciones futuras: ejecutar `python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py`.

## FUTURO

El Board debe promover la tarea a activa y ligar las pills; otro nodo debe entregar el contrato de `SourceProvider`/`request(baseUrl)`; un humano debe resolver las ambigüedades; después actúan los rituales de ejecución, testing y closeout, incluido el commit atómico.
