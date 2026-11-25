## REFORMULACION

Propósito: hacer de los carriles por partición una capacidad genérica de la vista de notación en el repo graph_ui (`frontends/mindmap/views/specs/notation/`), de modo que cualquier notación pueda pedirlos. Resultado: una notación no-actividad con nodos en tres particiones se dibuja en tres columnas tituladas, cada nodo en la suya; la actividad UML queda igual; sin ramas por nombre de notación ni tipo de diagrama. Límites: solo `notation.mjs`, `notation-swimlanes.mjs` y `notation-layout.mjs`; fuera BPMN, capas de specIR y formas nuevas de eventos/compuertas.

## AMBIGUEDADES

1. Repo no declarado explícitamente: «no se resuelve en graph_ui» presupone graph_ui, pero las rutas («frontends/mindmap/...») no llevan prefijo; obligaría a inventar la raíz del árbol.
2. Notación de prueba sin definir: «Una notación de prueba que no es la de actividad» no indica nombre, archivo ni registro; habría que inventarlos.
3. Contrato para pedir el layout: «que cualquier notación pueda pedir» no especifica interfaz (¿campo del spec, `data.layout`, otro?); obligaría a inventar el mecanismo.
4. Dato de partición: «nodos repartidos en tres particiones» no define forma ni titulado; obligaría a inventar el esquema.
5. Baseline de regresión: «La actividad UML se dibuja igual que antes» no fija criterio de comparación; obligaría a inventar tolerancia.

## DRY-RUN

Lecturas: `docs/representacion/README.md`; los tres archivos de `views/specs/notation/`; `sldb/src/sldb/notations/notation_constants.py` (LAYOUT_KINDS); tests actuales de actividad y mindmap. Cambios previstos: generalizar `notation-swimlanes.mjs` para derivar columnas de particiones declaradas por la notación; resolver selección de layout en `notation-layout.mjs` sin condicionales por nombre; registrar la notación de prueba; crear `tests/notation-partition-lanes.test.mjs`. Dependencias: posible nuevo LAYOUT_KINDS solicitado por `deskops message send` (externo). Validaciones futuras: `node --test tests/notation-partition-lanes.test.mjs` y `python -m pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py`, más comprobación de actividad sin cambios.

## FUTURO

Un nodo ejecutor implementará los cambios; el equipo de sldb decide y acepta cualquier LAYOUT_KINDS nuevo; las notaciones BPMN y de capas de specIR consumirán la capacidad en encargos propios; un humano valida el resultado visual.
