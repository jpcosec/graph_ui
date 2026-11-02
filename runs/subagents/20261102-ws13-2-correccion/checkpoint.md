# Checkpoint de la correccion WS13.2

Claude Opus 5.5, Supervisor, 2026-11-02. Sin escribir producto. Commit de producto `147dabb`. No es aceptacion: root revisa; G_HUMAN_READ y WS16 pendientes. Hashes: `entregable-executor.sha256`, 8 archivos, verificados antes y despues de la suite y antes del commit.

**Traslado.** Por instruccion del dueno, el trabajo paso de `johanes` a `server` (`dios@100.98.206.22`, `~/proyectos/SLDB_1-wip`), copia nueva por rsync sin `.env` ni Scion. El `~/proyectos/SLDB_1` previo del server no se toco.

**Pruebas.** Suite general ejecutada por el Supervisor en `server`: **267 passed**, 754 s, `suite-final.log`, `suite-entorno.txt` (Python 3.13.11, Node 24.14.1, commits de los repos). No es el entorno de johanes (Python 3.13.5, Node 22.22.2), donde la suite base dio 242. Comando: `pytest -v --timeout=300 --durations=15 --basetemp=/dev/shm/... tests`, con TMPDIR en /dev/shm porque el disco del sistema es mecanico. Corridas previas sin cierre, sin fallos: en johanes la detuvo la falta de memoria; en server, `suite-cortada-1` (corte a 1500 s) y `suite-cortada-2` (corte a 2700 s, 238 passed, 0 failed). Tester independiente: PASS sobre estos bytes, en johanes, con Chromium y stores reales: `tester-result-summary.md`; v1 en `renovacion-1/`.

**Puntos de root.**
1. `_fresh_listing` usa `sldb.api.open_store(store, mode="readonly")`, sin import de `sldb.store`; 0 escrituras en GET incl. refresco, medido con audit hook.
2. Raices prohibidas: `roots_invalid`, razon `componente_prohibido`, antes de enumerar; 39 casos.
3. Ruta relativa visible y completa en cada entrada, `explorer-item-path`; rutas largas envueltas, 360-1440 px; la e2e nueva falla con el CSS previo, `[754, 748]`.
4. `modelo_sin_confirmar` con «modelo sin confirmar» mientras /nodes esta pendiente o fallo.

**Calibracion del hook.** Detecta 46 operaciones, incluido escribir y restaurar. No ve sqlite3 ni subprocesos hijos.

**Demo.** Corre en server, loopback, puerto 8092, copia temporal `/tmp/ws132-demo`, preparada con `rebuild_edges` fuera del request: 307 modelados, 317 no modelados, sin pageerror. Captura en `demo-server/`. La copia omite `sldb/`: rebuild avisa 15 relation_types ausentes. 8090 y 8091 sin tocar.

**Limites.**
- `extract_model_data` sigue importada de `sldb.runtime.validation`, fuera de `sldb.api`; `sldb.api` solo ofrece `extract_document_payload`, que carga todos los documentos. Sin alternativa publica desde bytes. Decision de root.
- `sldb.api.stores.indexed_documents`, `sldb.api.documents.document_serialization` y `sldb.links` son submodulos, no superficie de `sldb.api`.
- `open_store` anade sys.path en memoria; layout no canonico sin ensayar.
- Solo Chromium; modo oscuro sin probar; rendimiento en catalogos grandes sin medir.
- Estado `ok` de /explorer es guardia, no carga.
- `.md` fuera de roots permitidos se abre por URL con las guardias del lector.
- El arranque de serve.py crea `.sldb` si falta; previo, no en GET.
- A 360 px la pagina completa tiene scroll horizontal por cabecera, selector de nodo y panel de identidad; fuera del explorador; sin comparar con la base.
- 8088 en johanes es proceso ajeno con backend viejo.
