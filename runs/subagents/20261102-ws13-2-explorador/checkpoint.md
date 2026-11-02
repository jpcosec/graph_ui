# Checkpoint WS13.2

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Supervisor, sin escribir producto. Commit de producto `dacf5ad`. No es aceptación: root revisa; G_HUMAN_READ y WS16 pendientes. Hashes: `entregable-executor.sha256`, 10 archivos, verificados antes y después de la suite.

**Demo.** http://127.0.0.1:8092/workspace/node?path=README.md, copia temporal `/tmp/ws132-demo`, preparada con `rebuild_edges` fuera del request: 307 modelados, 317 no modelados. Captura en `demo/`, solo GET, sin pageerror. Proceso temporal. 8090 intacto; 8091 sin tocar.

**Pruebas.** Suite general ejecutada por el Supervisor sobre estos bytes: **242 passed**, `suite-final.log`. Tester independiente: v1 FAIL (`renovacion-1/`), v2 PASS sobre estos bytes, con Chromium, stores y `sys.addaudithook` reales.

**Lo que la v1 encontró.** Un modelado creado por otro proceso no aparecía tras refrescar, aunque las pruebas del Executor pasaban. `/node` no marcaba `is_degraded`. Un symlink interno daba dos identidades. Corregidos.

**Prueba previa modificada.** `test_workspace_broken_doc_catalog_returns_500`, conducta retirada por tu punto 4: ahora `…_degrades_that_entry_and_keeps_healthy_ones`. Ampliación de `files` declarada en `preflight-disposition.md`.

**Lista de permitidos.** `WORKSPACE_EXPLORER_ROOTS` leída al arrancar; por defecto `desk,docs`. Solo `.md`. Excluye partes con punto, `__pycache__`, `node_modules`, symlinks y gitignorados con fallo cerrado. El cliente no aporta rutas.

## Límites

1. **El arreglo del refresco usa funciones fuera de `sldb.api`:** `new_operation` de `sldb.store.runtime_cache_signature` y de `sldb.store.documents_hash`. Sin guion bajo, solo invalidan caché en memoria, con precedente en `sldb_adapter`. **Revisa si lo aceptas.** Intake: `sldb/desk/inbox/20261102-081659-unclear-falta-forma-publica-de-abrir-operacion-de-lectura-sin-open-store.md`.
2. Hereda los límites de WS13.1: layout no canónico sin ensayar; `stale=[]` no prueba frescura.
3. `/explorer` marca `ok` a un modelo que no carga; la UI toma `modelo_no_carga` de `/nodes`.
4. Documentos con igual título se repiten sin distinguirse: visto en la demo con `ActionsSection`. Sin corregir.
5. Sin rendimiento medido con catálogos grandes, otros navegadores, móvil ni el tope de 20000 candidatos.
6. El hook del Tester no se validó con una escritura positiva conocida.
7. `.md` fuera de las rutas permitidas sigue abriéndose por URL con las guardias del lector: la lista limita el listado.

**Transferencia a WS13.3.** `result-summary.md`. No iniciada.
