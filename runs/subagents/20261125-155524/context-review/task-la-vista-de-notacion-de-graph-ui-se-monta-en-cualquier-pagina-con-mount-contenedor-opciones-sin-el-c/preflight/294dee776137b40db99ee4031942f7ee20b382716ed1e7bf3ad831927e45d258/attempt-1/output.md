## REFORMULACION
**Propósito:** paso 2 de G-A: ofrecer un punto de entrada embebible para la vista de notación de graph_ui, de modo que cualquier página anfitriona la monte con una llamada, sin el cascarón de la app.
**Resultado:** nuevo módulo `frontends/mindmap/embed/notation.js` que exporte `mount(container, {baseUrl, spec, view, theme})` y `unmount`, montando la vista de notación con su `SourceProvider` y `request(baseUrl)` sin shell; página de ejemplo `tests/fixtures/embed/host.html` que lo usa con una llamada; e2e nueva `tests/e2e_embed_notation.py`.
**Repo:** `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`.
**Límites:** solo `frontends/mindmap/embed/`, página host y e2e. Fuera: tema/storage con alcance (G-A3) y otras vistas (G-A4). La vista es de solo lectura (`nodesConnectable=false`, sin diálogos de edición). El importmap lo pone la página anfitriona e incluye react, `@xyflow/react` y elkjs.

## AMBIGUEDADES
1. «mount(container, {baseUrl, spec, view, theme})» frente a «Fuera: tema/storage con alcance (G-A3)»: se incluye `theme` en la firma pero el tema queda fuera; obligaría a inventar su semántica o si debe ignorarse.
2. «abre host.html (otro origen o ruta fuera de mindmap)»: no fija ruta ni origen exactos; obligaría a inventar ubicación y configuración de servido.
3. «monta una spec de fixtures»: no identifica fixture ni formato; obligaría a inventar el archivo y su contenido.
4. «sin shell»: no enumera qué responsabilidades del cascarón se excluyen (router, storage, layout); obligaría a inventar el límite.
5. «con su SourceProvider y request(baseUrl)»: no indica cómo construirlos sin shell; obligaría a inventar su API.
6. «y unmount»: sin firma ni comportamiento; obligaría a inventar su contrato.
7. «lo mismo que tests/e2e_mindmap_notation.py en su caso basico»: el alcance de «caso básico» no está delimitado; obligaría a elegir aserciones.
8. «{baseUrl, spec, view, theme}»: `view` no se define; obligaría a inventar qué selecciona.

## DRY-RUN
**Lecturas:** este TaskDoc; `index.html` (importmap actual); vista de notación y su `SourceProvider`; `tests/e2e_mindmap_notation.py` y su helper `_serve`; fixtures existentes; estado de `depends_on`.
**Cambios previstos:** crear `frontends/mindmap/embed/notation.js`, `tests/fixtures/embed/host.html` y `tests/e2e_embed_notation.py`.
**Dependencias:** que la tarea dependiente ya exponga `request(baseUrl)`; importmap de la página host con react, `@xyflow/react` y elkjs; servidor de graph_ui para la e2e.
**Validaciones futuras:** `python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py`; comprobar catálogo, dibujo, cambio de spec, «Ver todo» y ausencia de errores de consola/página.

## FUTURO
La tarea dependiente debe entregar el contrato `request(baseUrl)`/`SourceProvider`. Un humano decide la intención de `theme` y el origen exacto de `host.html` si no se aclara antes. La ejecución de la e2e y la aceptación final corresponden al ejecutor y al revisor.
