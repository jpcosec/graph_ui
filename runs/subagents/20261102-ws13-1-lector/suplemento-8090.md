# Suplemento de reutilización de 8090

Supervisor Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Suplemento de esta revisión; no reescribe auditorías históricas ni adopta el prototipo como base. Hechos observados por root en `review-source.md`, más lo comprobado aquí.

**Procedencia.** `frontends/workspace/{index.html,styles.css,app.js,serve.py,__init__.py}` y `tests/test_parallel_workspace_serve.py` están versionados en graph_ui `20e5797` (`git ls-files`, comprobado). La exclusión de WS11 y WS12 se hizo cuando estaba sin commit; ese motivo no describe este snapshot. Blobs:

- `frontends/workspace/app.js` `17d0b23daccb`
- `frontends/workspace/serve.py` `5f18574959b1`
- `frontends/workspace/index.html` `41d6b5c11087`
- `frontends/workspace/styles.css` `c6dfdb943ca7`

**Qué es referencia reutilizable:** catálogo por modelos y filtro; navegación catálogo→documento; marco de lector con pestañas; contexto lateral con identidad, ruta, hashes y relaciones; extracción `sections_prose`. Se adapta al host Mindmap y a `WorkspaceRoutes`. No se crea un tercer workspace ni un servidor nuevo.

**Límites, no se adoptan:** `_build_changes_projection` cruza git status y vecinos y no compara una línea base: no prueba obsolescencia. `renderAgentsSurface` espera campos que la API no entrega. Etiquetas y referencias inline vacías observadas por root: no copiar el renderer sin verificar con DOM o captura. Que 8090 muestre datos reales no significa contrato WS11 cumplido. Nada de Kimun.

**Evidencia auxiliar:** copias en `evidencia-8090/`, tomadas de `/tmp` por root; las capturas son de 8090, no del host Mindmap.
