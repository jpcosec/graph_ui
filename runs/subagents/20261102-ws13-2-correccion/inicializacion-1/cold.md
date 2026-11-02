## REFORMULACION

**Objetivo:** corregir cuatro defectos del explorador WS13.2 en graph_ui: (1) sustituir el refresco que importa `sldb.store` por la vía pública `sldb.api.open_store(<dir .sldb>, mode="readonly")`, solo si pasa las mismas pruebas; (2) rechazar raíces con componentes prohibidos antes de enumerar; (3) mostrar identidad secundaria visible ante títulos repetidos; (4) no afirmar modelo cargado cuando `/nodes` está pendiente o falló.

**Alcance:** lista cerrada de archivos: `workspace_routes.py`, `explorer/{explorer-view.js,explorer.mjs}`, `workspace-view.js/css` solo estados e identidad, y tres suites de pruebas. Autoridad: `review-source.md`; contrato `navegacion.md` sha256 indicado.

**Repo/base:** graph_ui, “HEAD de main al despacho, que contiene dacf5ad”.

**Límites:** sin commits del Executor, sin suite general, sin `shell/api.js`, persistencia, edición, `frontends/workspace/`, WS13.3, Scion, puertos 8090/8091/8092, mocks o stubs. Bloqueo se documenta, no se pregunta.

## AMBIGUEDADES

1. «Base: HEAD de main al despacho, que contiene dacf5ad» frente a «Repo y base: graph_ui, HEAD `a2f0bba`» del recibo. No se fija el SHA exacto de partida ni la rama; obligaría a inventar el commit base o elegir entre ambos.

2. «cero escrituras comprobadas por observación de operaciones, no solo por hashes» sin fijar el mecanismo del Executor; a la vez, «calibrar el hook de escrituras» aparece en el Goal pero los Roles lo asignan al Tester. Obligaría a inventar instrumentación o a decidir si el Executor escribe la prueba de calibración.

3. «Mientras /nodes está pendiente o falló, la entrada modelada muestra un estado honesto de modelo sin confirmar y no se borra el error global». No se define el texto, el nombre de estado, el selector DOM ni qué es «error global». Obligaría a inventar copy, estado y contrato de prueba.

4. «un identificador secundario: nombre de documento o ruta». Son alternativas sin criterio de elección; si título, nombre y basename coinciden, no se sabe qué hace distinguible la entrada. Obligaría a inventar la regla de desambiguación.

5. «parar ese punto, sin caché propia ni conservar el import por reflejo». No dice si el Executor deja `_fresh_listing` interno intacto, lo elimina o continúa los puntos 2-4. Obligaría a inventar el estado parcial entregable.

## DRY-RUN

Un ejecutor futuro: (a) en `workspace_routes.py`, comprobar existencia del store antes de llamar y reemplazar el cuerpo de `_fresh_listing` por `sldb.api.open_store(self.store_path, mode="readonly")`; (b) en `_explorer_roots`, rechazar componentes con punto, `__pycache__` y `node_modules` sobre la ruta completa antes de enumerar, conservando raíces válidas en configuración mixta; (c) en `explorer.mjs`/`explorer-view.js`, añadir identidad secundaria visible y estado de modelo no confirmado, sin borrar error global; (d) pruebas: raíz prohibida directa/anidada/mixta con y sin git y centinelas `.md`; DOM con dos títulos iguales; e2e con `/nodes` real retenida; `node --test`. Errores esperados: escritura en canónico → reproductor y parada del punto 1; store inexistente → error sin crearlo. Resultado: tres suites verdes y `result-summary.md` con evidencia por punto.

## FUTURO

Supervisor: commit, suite general única sobre bytes finales, demo 8092. Tester independiente: calibración positiva del hook y `tester-result-summary.md`. Root decide aceptación, intake del punto 1 y WS13.3. G_HUMAN_READ y WS16 siguen pendientes.
