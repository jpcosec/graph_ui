# Comparación del Supervisor, corrección de WS13.1

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Leí preflight y cold completos, frente a `review-source.md`, el nodo y WS11. TaskDoc sha256 `af29dbaf9dac416dcbd6f434a55b86d420d303129846aceec13448127c1368b0`. Intentos: `inicializacion-1` a `-6`; cada ronda corrigió la TaskDoc.

**Fidelidad.** Objetivo, repo, archivos, límites y roles coinciden. FUTURO correcto: Supervisor commit y demo, Tester aparte, root decide, intake en sldb, render aparte.

**Ambigüedades restantes: implementación, no contratos.** Se documentan en `result-summary.md`:

| Punto | Resolución |
|---|---|
| Forma JSON y nombres de estados | Delegada; los estados están en `_inspect_file_reference` |
| Recarga y generación | Solo navegar a otro documento incrementa; recargar el mismo no |
| Comparación de revisiones | Cuando ambas respuestas de la misma generación llegaron; no modelado no compara |
| Rastreo y `model_type` por `path` | `indexed_documents` da el modelo, `load_registered_model` el tipo. `doc_status` no se usa en estas rutas |
| `__template__` | Atributo del modelo que sldb usa igual; no es formato interno de store |
| Elemento seleccionado | El foco vigente |
| Guardia de candidatos `.yaml` | Parte de ruta, sin criterio `.md`: escrito en la TaskDoc |

Comprobado en fuente: `EdgeIndex.stale` existe (`edge_index.py:19`). Layout no canónico: riesgo declarado, con intake.

**Sin contrato inventado, sin compromiso humano afectado.** Sin cambios del DAG.
