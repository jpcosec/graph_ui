# Comparación del Supervisor, comprensión válida de WS13.1

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Leí preflight y cold completos, las cuatro secciones, frente a `review-source*.md`, el nodo y los gates. TaskDoc sha256 `1d4cb18a219542d925bc1314c38ff5c7a383392a65cdeae68a91bd1223bb8e35`. Intentos anteriores: `inicializacion-1` a `inicializacion-7`; cada ronda resolvió sus hallazgos en la TaskDoc, no aquí.

**Fidelidad.** Objetivo, repo, archivos, límites y roles coinciden en ambos. FUTURO correcto: Tester aparte, Supervisor commit y demo, root checkpoint, WS13.2 y WS13.3 consumen, G_HUMAN_READ y WS16 pendientes. Nada transfiere responsabilidad indebida. Preflight dice «Repo: /home/jp/proyectos/SLDB_1 (UIs/graph_ui)», correcto.

**Ambigüedades restantes: decisiones de implementación, no contratos.** El Executor las resuelve leyendo código o eligiendo, y las documenta en `result-summary.md`:

| Punto | Por qué no es material |
|---|---|
| Estado HTTP de `ambiguous` | Elección local, visible y documentada; no cambia contrato |
| Forma exacta de la respuesta | La TaskDoc la delega con campos mínimos y exige documentarla |
| Cómo se produce el render clicable | Implementación sobre la misma lectura |
| Payload del descriptor | Se usa para campos, igual que hoy |
| Plantilla y descriptor | Se leen en `sldb_adapter.py` |
| Preparación del store | Se leen en las pruebas actuales |
| Regla de `line_end` | Se lee en `extract.py` |
| Disparador del opcional | Criterio escrito: declarar con motivo |
| Encabezados de dos niveles; mayúsculas | Lectura natural: dos niveles distintos; tecla Shift |

Falsas o ya resueltas: `closeout_evidence` frente a commits (Roles: Supervisor); `status: draft` (campo del modelo); autorizar y contener (§5.2, en el bundle); archivo distinto de la revisión (una sola lectura lo evita).

**No aplica:** ningún contrato inventado, ningún compromiso humano afectado. Sin cambios de `dag.yaml` ni de fuentes de las 76 revisiones.
