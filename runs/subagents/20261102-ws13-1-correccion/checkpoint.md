# Checkpoint de la corrección de WS13.1

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Supervisor, sin escribir producto. Commit de producto `b398d54`. **WS13.1 sigue sin aceptar**: cerrar esta TaskDoc no lo acepta. G_HUMAN_READ y WS16 pendientes. Closeout `ca06f1b` intacto.

Hashes: `entregable-executor.sha256`, 7 archivos, verificados antes del commit.

**Demo.** http://127.0.0.1:8092/workspace/node?path=README.md y http://127.0.0.1:8092/workspace/node?id=TaskDoc:task-corregir-ws13-1-lectura-sin-mutación-guardias-previas-foco-estado-y-anclas, copia temporal `/tmp/ws131-demo` preparada con `rebuild_edges` fuera del request. Capturas en `demo/`, solo GET, sin pageerror. 8090 y 8091 intactos.

## Evidencia por punto

| Punto | Fallaba antes (Executor) | Tester independiente, ejecutado |
|---|---|---|
| 1. Sin mutación | Store cambiaba incluso en canónico; stale reconstruía | Hashes de .sldb, documentos, git status y HEAD iguales en 5 GET por caso, canónico y dos stale; `store_no_preparado` observable; fuente legible; `rebuild_edges` externo restablece |
| 2. Guardias previas | Abría protegidos y symlink; `/nodes` daba 500 | `sys.addaudithook` en serve.py real, 18 peticiones: ninguna fuente prohibida abierta, solicitada o no |
| 3. Foco con dueño | `evidencia-base/old_focus.out` | Chromium, 15 de 15 |
| 4. Sin mezcla | `evidencia-base/base_mix.out` | Chromium con GET real retenido, A→B, A→no modelado, A→B→A |
| 5. Anclas | `ok` para ancla inexistente | Chromium, 15 de 15; URL y peticiones no cambian |

Suite general: 218 passed sobre estos bytes (Executor). Una e2e nueva, `late_node_response_does_not_repopulate_unmodeled_document`, también pasa contra el código de partida: es regresión, no distingue. Una prueba previa modificada: `test_workspace_cycle_and_2hops_real_edges`.

Tiempos en copia real, 307 nodos: `/nodes` 0.3-0.8 s, `/node` 0.47 s la primera vez y 0.03-0.07 s después, `/source` 0.01-0.03 s.

## Límites exactos

1. **`stale` no ve toda la desactualización.** Editar un .md por fuera no lo marca por sí solo, ni añadir un campo a `__references__` con `reindex_model`. Sin stale, relaciones atrasadas se muestran sin aviso. Observado por el Tester; es de sldb y no lo envié aún como intake.
2. **Layout no canónico:** sin consulta pública previa a `open_store`, puede migrar; sin ejecutar. Intake enviado.
3. `/nodes` responde 500 entero si un documento autorizado no carga su modelo. Conducta previa, no corregida.
4. `semantic_tags` de `/node` va vacío: sin API pública que no abra otros documentos. Sin consumidor en `frontends/mindmap`.
5. Sin verificar: otros navegadores, CDN caída, otros orígenes de stale, un campo propio que apunte a otro destino con datos reales (solo función pura).
6. Render básico: tarea en drawer, `task-render-markdown-legible-del-lector`, sin nodo en el DAG; anotado en deskops.
7. El proceso de 8088, ajeno, sirve estáticos nuevos con backend anterior hasta reiniciarse.
