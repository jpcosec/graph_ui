REFORMULACION
Nodo ejecutable (`task.code`), no agregado. Propósito: que las vistas de `frontends/mindmap/views` dejen de importar `request` de `shell/api.js` y de usar rutas absolutas, para poder montarlas en otra UI (G-A). Resultado: `shell/api.js` expone `createRequest(baseUrl)` —conservando `request` como `createRequest('')`—; las vistas reciben `request` y la base por contexto/props; ninguna ruta es absoluta; en graph_ui el comportamiento es idéntico. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: `views/**`, `shell/api.js`, `app.js` y tests node afectados; fuera `mount()` (G-A2), tema y storage (G-A3).

AMBIGUEDADES
1. "los tests node que toquen": no nombra archivos; obliga a inventar cuáles.
2. "del contexto que app.js ya provee (o de una prop)": obliga a inventar contexto o prop.
3. "request (y la base URL) por su contexto/props" frente a "createRequest(baseUrl)": no aclara si la base es dato separado o encapsulado; obliga a inventar la interfaz.
4. "y otras vistas" / lista "hoy:": no asegura exhaustividad; obliga a inventar el inventario.
5. `pills: []`, `atoms: []` y "The relevant pills are bound to the task": no hay pills/átomos; obliga a asumir ausencia de guardrails.
6. "The task is the active item on `desk/tasks/Board.md`": falta el Board; obliga a asumir estado activo y rituales aplicables.

DRY-RUN
Lecturas: `app.js`, `source/source.js`, `shell/api.js`, las cinco vistas citadas, tests node y e2e, y grep de imports/rutas. Cambios previstos: añadir `createRequest(baseUrl)`; inyectar `request`/base en vistas; resolver `/api`, `/skins/*.css` y `/views/.../*.css` contra base; ajustar `app.js` y tests. Dependencias: contexto de `app.js`, precedente `SourceProvider`, suites existentes. Validaciones futuras: `node --test tests/*.test.mjs` y las dos e2e; grep de ausencia de imports/rutas absolutas. Sin ejecutar.

FUTURO
Un nodo de ejecución implementará; testing ejecutará las suites; closeout hará el commit atómico y reconciliará el Board. Humano/Board promueve y confirma la vía contexto/prop. G-A2 y G-A3 quedan para otros nodos.
