# Checkpoint WS13.1

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Supervisor, sin escribir producto. Commit de producto `bf55151`. No es aceptación humana: G_HUMAN_READ y WS16 siguen pendientes.

**Entregado.** `GET /api/workspace/source`; lector en el host Mindmap con render y fuente de una sola lectura; Markdown no modelado por `?path=`; contexto con procedencia por campo; enlaces `[[…]]` del desk propio; foco interno que sobrevive al alternar pestañas; rango local de Code.

**Pruebas.** Línea base 177 passed; tras el delta 204 passed (Executor, `validation.log`). Tester independiente con fixture propio y Chromium real: PASS, `tester-result-summary.md`, 28 passed y unos 35 GET con `.sldb` sin cambios, sobre los bytes de este commit (hashes en `entregable-executor.sha256`).

**Demo.** http://127.0.0.1:8092/workspace/node?path=README.md y http://127.0.0.1:8092/workspace/node, sobre copia temporal `/tmp/ws131-demo`. Capturas en `demo/`. 8090 intacto.

**Límites.**
1. `/api/workspace/node` sigue llamando `document_edges`, que reconstruye: incumple «sin mutación» si el store está desactualizado. Sobre store canónico el Tester no vio cambios. Una prueba existente fuera de la lista cerrada depende de esa reconstrucción. `/source` sí usa solo `load_edge_index`. H-14 queda abierto para el store propio.
2. El render es básico: enlaces Markdown estándar `[x](y)` y sintaxis inline quedan literales, y en modelados el frontmatter sale como bloque. Solo `[[…]]` se sigue. Lo vi en capturas de la demo; el Tester no lo cubrió.
3. Mientras carga `/node`, la barra muestra «Sin estado» y «Sin nodo» unos instantes.
4. Sin verificar: `sin_repo_root`, `error_lectura`, `ambiguous`, IR roto, otros navegadores, CDN caída, clic en enlace hacia modelado.
5. El proceso de 8088, ajeno, sirve estáticos de este árbol con backend anterior hasta reiniciarse.

**Transferencia.** WS13.2 y WS13.3: `result-summary.md`. Tareas hermanas sin tocar; rebasan sobre este delta.
