## REFORMULACION

Encargo ejecutable (nodo `task.code`, no agregado): en el repo que contiene `frontends/` y `tests/` (según rutas; no se da URL ni rama), hacer que ningún GET de `frontends/mindmap` migre el store: `runtime_documents` en `sldb_adapter.py` debe usar `sldb.api.read_store` en lugar de `open_store`; `views_routes.py` debe traducir `SLDBStoreError` con «store not prepared» a 503, estado `store_no_preparado`; y `persistence.save` debe convertir ese error en `SaveError(..., 503)` sin escribir. Añadir dos pruebas (save y GET de vistas sobre store des-preparado, 503 y sin cambios en `.sldb`), fabricando el store como la prueba existente citada. Fuera: arranque (`make_server`), imports de `render_model_markdown`/`validate_model_input_roundtrip`, `sldb` y `frontends/desk`.

## AMBIGUEDADES

1. «Reusa la forma de respuesta de error que ya tenga ese módulo» — no se da el esquema JSON ni el nombre del campo de estado; obligaría a inventar contrato de respuesta.
2. «Si su respuesta no lleva campo de estado, se agrega 'store_no_preparado' solo en este caso» — condicional sin especificar campo/forma; obligaría a inventar dónde añadirlo y si altera consumidores.
3. «un SLDBStoreError con 'store not prepared'» — no fija si se detecta por tipo, por mensaje exacto o por subcadena; obligaría a inventar el criterio.
4. «no cambia ningún archivo de .sldb (sha256 y mtime)» — no define directorio raíz ni si el snapshot es recursivo; obligaría a inventar el alcance de la comprobación.

## DRY-RUN

Lecturas: TaskDoc; `sldb_adapter.py`, `projection_views.py`, `views_routes.py`, `persistence.py`, `workspace_routes.py`; pruebas citadas y referencias (`result-summary.md`, `closeout-notes.md`, commit `1479e24`). Cambios previstos: cuatro archivos de código y dos de pruebas. Dependencias: `sldb.api.read_store` existente en `1479e24`; `SLDBStoreError` importable; `SaveError` con `status`; prueba de store no canónico reutilizable. Validaciones futuras: línea base con pytest antes de tocar; grep sin `open_store`; suite unitaria listada; e2e listados.

## FUTURO

Humano decide: rama/commit y si el campo de estado altera el contrato API; ejecución de e2e (entorno/servidor). Otro nodo: corrección de imports pedida a `sldb`; `make_server` sigue preparando el store.
