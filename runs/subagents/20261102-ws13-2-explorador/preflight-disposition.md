# Comparación del Supervisor, WS13.2

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Leí preflight y cold completos frente a `review-source-final.md`, el nodo y WS11. TaskDoc sha256 `76dd0fef5256d24fd1b8349b6993b36a2827502b2ec0d3c54b988c0adc7453ab`. Intentos: `inicializacion-1` y `-2`.

**Fidelidad.** Objetivo, repo, archivos, límites y roles coinciden. FUTURO correcto: Tester aparte, Supervisor commit y demo, root decide, G_HUMAN_READ y WS16 pendientes, WS13.3 fuera.

**Restantes: implementación, se documentan en `result-summary.md`.** Serialización de la causa: `str(exc)`. Tipos de `roots_invalid`, `sin_git`, `truncado`: decisión del Executor. Ubicación del explorador en la vista. El tope cuenta archivos ya aceptados por los filtros. `check-ignore`: cwd en la raíz, rutas relativas. El refresco no relee el documento abierto; «Actualizar» ya lo hace. `roots_invalid` no incluye raíces ausentes. Operación pública de preparación: `rebuild_edges`.

**Sin contrato inventado, sin compromiso humano afectado.** Sin cambios del DAG.

## Adenda del Supervisor

La suite general mostró que `test_workspace_broken_doc_catalog_returns_500` afirma el 500 que el punto 4 retira. Root ya dispuso que las pruebas de conducta retirada se corrigen de forma explícita (`review-source-final.md`, y la revisión anterior). Amplié `files` y el scope solo a esa prueba. No repetí preflight ni cold: es un archivo más, sin cambio de objetivo, límites ni criterios.
