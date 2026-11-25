## REFORMULACION
**Propósito:** hacer embebibles las vistas de mindmap en otra UI, eliminando imports directos de `shell/api.js` y rutas absolutas a la raíz.
**Resultado:** las vistas reciben `request` y la URL base por contexto/props; `shell/api.js` expone `createRequest(baseUrl)` —manteniendo `request` como `createRequest('')`— y ninguna ruta cliente queda absoluta. En `graph_ui` el comportamiento debe ser idéntico.
**Repo:** `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`.
**Límites:** incluye `frontends/mindmap/views/**`, `shell/api.js`, `app.js` y tests node afectados. Excluye `mount()` embebible (G-A2), tema y storage (G-A3). Es una tarea de código ejecutable, no un agregado.

## AMBIGUEDADES
1. «reciba request (y la base URL) por su contexto/props»: no define nombre de claves, forma del contrato ni si será contexto, prop o ambos. Obliga a inventar la interfaz de inyección y sus fallbacks.
2. «createRequest(baseUrl) que devuelve request(path, init) resolviendo path contra baseUrl (default '')»: no precisa cómo tratar rutas con `/` inicial, URLs externas o concatenación. Obliga a inventar la semántica de resolución.
3. «las URLs de css/skins se resuelven contra la base»: no indica el mecanismo ni si cubre también `/views/.../*.css`. Obliga a inventar cómo llega la base a los helpers de CSS.
4. «app.js ya provee (o de una prop)»: deja abiertas dos alternativas incompatibles. Obliga a decidir el canal definitivo.

## DRY-RUN
**Lecturas hipotéticas:** TaskDoc; `app.js`; el patrón de `SourceProvider`/`source/source.js`; `shell/api.js`; las cinco vistas citadas; tests node y e2e de notación; brief G-A/G-B si está disponible.
**Cambios previstos:** añadir `createRequest(base)` y conservar `request`; inyectar `request`/base desde `app.js` a las vistas; sustituir imports y rutas absolutas; ajustar tests.
**Dependencias:** contrato de contexto/props, precedente de `SourceProvider`, servido de CSS/skins.
**Validaciones futuras, sin ejecutar:** `node --test tests/*.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py`; grep de imports de `shell/api` y rutas absolutas; comprobación de comportamiento idéntico en `graph_ui`.

## FUTURO
Un nodo ejecutor producirá el diff y la salida de tests; un revisor comprobará el cierre contra «Done When»; un humano validará el encaje con G-A y decidirá el cierre.
