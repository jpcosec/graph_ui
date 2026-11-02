## REFORMULACION

**Objetivo.** Corregir cuatro defectos del explorador WS13.2 de graph_ui —frontera API del refresco, filtro de raíces, identidad visible de títulos repetidos y estado honesto de modelo— con pruebas reales, más calibrar el hook de escrituras. No iniciar WS13.3.

**Alcance.** Cuatro puntos tasados en la tarea, con lista cerrada de archivos: `workspace_routes.py`; `explorer/explorer-view.js` y `explorer.mjs`; `node/workspace-view.js` y `workspace.css` solo estados/identidad; tres suites de test. Base `ec0eb43` o posterior; el Executor registra el SHA hallado.

**Repo.** graph_ui. Autoridad: `review-source.md`; contrato `navegacion.md` sha256 `6a4f85…361e`, §2.2, §3.3, §5.4, H-02.

**Límites.** Sin commits ni Board ni suite general (Supervisor); sin mocks/stubs, stores temporales reales (page.route sobre GET real admitido); prohibidos `shell/api.js`, persistencia/edición, `frontends/workspace/`, WS13.3, formato interno, Scion, push, puertos 8090/8091/8092; sin preguntar al solicitante; bloqueo concreto → `result-summary.md`.

## AMBIGUEDADES

1. «reemplazar _fresh_listing por sldb.api.open_store(<directorio .sldb explícito>, mode="readonly")». El cold-input solo aporta `sldb/api/stores/open_store.py`, no `sldb/api/__init__.py`; obligaría a inventar si el símbolo público es `sldb.api.open_store` o el import interno `sldb.api.stores.open_store.open_store`.
2. «cero escrituras observadas, hashes iguales». No dice hashes de qué conjunto (store entero, índices, documentos); obligaría a inventar el universo hasheado y su orden.
3. «Mientras /nodes está pendiente o falló, la entrada modelada muestra el estado modelo_sin_confirmar». No separa pendiente de fallo ni fija el estado antes de la primera respuesta; obligaría a inventar una máquina de estados y dónde se pinta el error conservado.
4. «muestra de forma visible… la ruta relativa del documento como identificador secundario, siempre». Hay modelados con `path` vacío (fallback de `_resolve_document`); obligaría a inventar el texto alternativo.
5. «registrando open con modo de escritura, os.remove, os.rename, os.mkdir y equivalentes». «Equivalentes» no está enumerado; obligaría a inventar la lista de eventos de `sys.addaudithook` que cuenta como escritura.

## DRY-RUN

1. Leer `review-source.md`, `result-summary.md` del explorador y verificar HEAD ≥ `ec0eb43`; registrar SHA.
2. En `workspace_routes.py`: comprobar `.exists()` del store antes de abrir; sustituir el cuerpo de `_fresh_listing` por `open_store(self.store_path, mode="readonly")` (import a decidir según ambigüedad 1). Si `mode="readonly"` no evita migración, no tocar caché propia.
3. En `_explorer_roots`: rechazar entrada con componente que empiece por `.` o en `EXPLORER_SKIP_PARTS` antes de resolver, con nueva `reason` y su etiqueta en `REASON_LABELS` (`explorer.mjs`); conservar válidas en mixta. `_walk_candidates` ya poda debajo.
4. En `explorer-view.js`/`explorer.mjs`: renderizar `path` como secundario visible y añadir estado `modelo_sin_confirmar` («modelo sin confirmar») cuando el catálogo `/nodes` no haya llegado o falló, sin borrar su error; al llegar, título y diagnóstico.
5. Tests: audit hook en proceso real de `serve.py` con calibración positiva propia; casos de raíz directa/anidada/mixta con y sin git, centinelas; DOM con dos títulos iguales; `/nodes` retenida con modelo no importable. Ejecutar solo las tres suites focales.
6. Escribir `result-summary.md` con evidencia por punto y handoff.

**Errores esperados:** escritura detectada aun canónica → reproductor, `_fresh_listing` intacto, puntos 2–4 continúan; símbolo no público; hook que no dispara con `os.mkdir(exist_ok=True)`.

**Resultado esperado:** tres suites focales verdes, sin commit, sin suite general.

## FUTURO

Tester independiente produce `tester-result-summary.md` con control positivo del hook. Supervisor commitea, corre la suite general una vez sobre bytes finales y hace demo en 8092. Root decide aceptación del delta, disposición del intake y arranque de WS13.3. G_HUMAN_READ y WS16 siguen pendientes.
