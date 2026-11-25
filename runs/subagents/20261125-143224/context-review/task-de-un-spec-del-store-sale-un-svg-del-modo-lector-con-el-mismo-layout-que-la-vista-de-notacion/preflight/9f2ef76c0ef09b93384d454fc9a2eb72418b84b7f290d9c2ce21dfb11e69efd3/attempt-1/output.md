REFORMULACION
Encargo ejecutable (`task.code`): crear en el repo `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui` un módulo puro `notation-svg.mjs` con `exportSvg(view, opts) -> string`, que genere SVG del modo lector usando la misma escena/layout que la vista interactiva, a partir del payload de `GET /api/notation/view`. Además, extraer el dibujo de secuencias y matrices de `notation-view.js` a un módulo puro compartido, sin alterar la vista, y añadir `tests/mindmap-notation-svg.test.mjs`. Límites: no HTML autocontenido ni CLI (G-B2), no segundo layout, no cambiar lo mostrado por la vista; validación mediante `node --test` y sin canvas.

AMBIGUEDADES
1. «los 8 tipos de diagrama»: no se enumeran; obligaría a inventar el catálogo completo y cómo cubrirlos, pues la prueba solo exige «al menos actividad con carriles, clases, una secuencia y una matriz».
2. «las mismas posiciones que la escena» / «posiciones relativas, tolerancia de 1 px»: obligaría a inventar sistema de coordenadas, transformaciones y algoritmo de comparación.
3. «la misma medida de texto que la vista (o una aproximada inyectable, como approximateMeasure...)»: obligaría a decidir el valor por defecto y cuándo usar medida exacta o aproximada.
4. «exportSvg(view, opts)»: obligaría a inventar el contrato de `view` y `opts`, y la forma exacta del payload de «GET /api/notation/view».
5. «sacar ese dibujo a un modulo puro (p. ej. notation-draw.mjs)»: obligaría a definir la frontera exacta del refactor y cómo garantizar «sin cambiar lo que la vista muestra».
6. «tests/fixtures/notation-*»: obligaría a inventar qué fixtures existen y qué tipo de diagrama cubre cada una.

DRY-RUN
Lecturas previstas: `notation.mjs` (`sceneFor`, `laneScene`, `gridScene`), `notation-layout.mjs`, `notation-style.mjs`, `notation-swimlanes.mjs`, `notation-deployment.mjs`, `notation-view.js`, fixtures y tests node existentes. Cambios previstos: nuevo `notation-svg.mjs`; nuevo módulo puro de dibujo compartido; ajuste de `notation-view.js` para consumirlo; nuevo test. Dependencias: payload de vista, `approximateMeasure`, escenas puras y fixtures. Validaciones futuras: ejecutar `node --test tests/mindmap-notation-svg.test.mjs tests/mindmap-notation.test.mjs tests/mindmap-notation-layout.test.mjs` y comprobar SVG de los tipos exigidos.

FUTURO
Un humano o nodo posterior debe confirmar el catálogo de 8 tipos, el contrato `view/opts`, los fixtures y aceptar el refactor de la vista. El ejecutor entregará módulos, test y resultados de validación.
