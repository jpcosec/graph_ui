## REFORMULACION

**Objetivo:** entregar en el host Mindmap un explorador de documentos reales modelados y Markdown no modelado, navegable sin conocer ID, con refresco explícito, que consume el lector WS13.1 y tolera modelos que no cargan.

**Alcance:** lista cerrada — nuevo `views/workspace/explorer/`; `workspace-view.js` y `workspace.css` solo para montar explorador y aviso de relaciones; `workspace_routes.py`; tests `test_mindmap_workspace_explorer.py` (nuevo), `test_mindmap_workspace_reader.py`, `e2e_mindmap_workspace.py`, `mindmap-workspace-explorer.test.mjs` (nuevo). Autoridad: `review-source-final.md`; contrato `navegacion.md` sha256 6a4f8518…, §2.2/§3.2/§3.3/§5.4/H-02.

**Repo:** `/home/jp/proyectos/SLDB_1/UIs/graph_ui`, superficie `frontends/mindmap/` y `tests/`.

**Límites:** sin mocks/stubs/datos falsos; solo GET; el Executor no commitea ni toca Board; sin puertos 8090/8091/8092; sin cambios de contrato; fuera de alcance shell/api.js, `frontends/workspace/`, mutaciones, WS13.3, multidesk, API nueva.

## AMBIGUEDADES

1. "la causa recibida como texto de la excepción" (§4): no se fija formato (`str`, `repr`, truncado, encoding). Obligaría a inventar la serialización.
2. "cada uno lleva su estado de guardia como en /nodes" (§2): la forma no está citada aquí. Obligaría a inventar nombres o inferirlos de código existente.
3. "campo roots_invalid", "campo sin_git true", "campo truncado true" (§1): se nombran campos sin tipar (¿array de strings o de objetos con motivo?). Obligaría a inventar su estructura.
4. "un indicador visible" (§1, truncado): forma UI no definida. Obligaría a inventarlo.
5. "is_degraded y degraded_reason, como su forma actual" (§4): "forma actual" remite a código no citado.
6. "con la operación pública" (§5): no se nombra la operación. Obligaría a inventar el comando.
*(La forma JSON y el orden del árbol no son ambigüedad: se difieren a `result-summary.md`.)*

## DRY-RUN

Un ejecutor futuro: (1) lee bundle (review-source-final, aceptación WS13.1, contrato, suplemento). (2) En `workspace_routes.py` añade `GET /api/workspace/explorer`, lee `WORKSPACE_EXPLORER_ROOTS` en `__init__`, valida raíces (`roots_invalid`), omite inexistentes, excluye puntos/`__pycache__`/`node_modules`, no sigue symlinks de directorio, `git check-ignore` una vez, tope 5000. (3) Crea `views/workspace/explorer/` y monta en `workspace-view.js/css`, conserva selector actual y añade botón de refresco. (4) Degrada catálogo `modelo_no_carga` en `/nodes`, `/source` con fuente segura, `/node` 200 con `is_degraded`/`degraded_reason`. (5) Añade aviso de relaciones en Grafo y panel de contexto. (6) Escribe los 4 tests. (7) Ejecuta validaciones. (8) Redacta `result-summary.md` y handoff.

**Errores esperados:** contra la base, `/explorer` ausente y `/nodes`/`/source` con modelo no importable deben fallar. **Resultado esperado:** listado modelado + no modelado, altas visibles tras refrescar, hashes/HEAD/git status idénticos antes y después de cada GET, 218 pruebas previas pasando.

## FUTURO

El Executor implementa y prueba (sin commit). El Supervisor commitea y hace demo en 8092 sobre copia temporal. Un Tester independiente con navegador real produce `runs/subagents/20261102-ws13-2-explorador/tester-result-summary.md`. Quedan pendientes G_HUMAN_READ y WS16; WS13.3 (pestañas/split) excluido.
