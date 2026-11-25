## REFORMULACION

**Propósito:** según el ADR citado, una notación pide un tipo de layout, no trae uno, y no debe haber código por notación. Hoy los carriles por partición solo existen para actividad UML (`notation-swimlanes.mjs`, vía `data.partition`) y el layout `lanes` es de secuencia; BPMN y capas de specIR los necesitan.

**Resultado:** que los carriles por partición sean capacidad genérica de la vista de notación, pedible por cualquier notación. Cierre: una notación de prueba no-actividad con nodos en tres particiones se dibuja en tres columnas con título y cada nodo en la suya; actividad UML igual que antes; sin ramas por nombre de notación ni tipo de diagrama.

**Repo/superficie:** `graph_ui`, en `frontends/mindmap/views/specs/notation/` (`notation.mjs`, `notation-swimlanes.mjs`, `notation-layout.mjs`). Fuera: notación BPMN y capas (specIR), eventos y compuertas como formas nuevas. Si falta un tipo de layout en `LAYOUT_KINDS` de sldb, se pide por inbox de sldb; no se resuelve aquí.

## AMBIGUEDADES

1. “frontends/mindmap/views/specs/notation/” frente a “`npm test` passes for `apps/review-workbench` changes”: no queda claro el repo/raíz real. Obligaría a inventar la ruta base.
2. “docs/representacion/README.md”: no dice si es relativo a graph_ui, a mindmap o a sldb.
3. “una notación de prueba que no es la de actividad”: no la identifica ni indica dónde se define. Obligaría a inventar fixture/notación.
4. “tres columnas con su título”: no especifica de dónde sale el título ni su campo (`data.partition`, nombre, etc.).
5. “La actividad UML se dibuja igual que antes”: no define igualdad (snapshot, DOM, posiciones). Obligaría a inventar el criterio de regresión.
6. “node --test tests/notation-partition-lanes.test.mjs” y “python -m pytest -q tests/e2e_notation_activity.py…” asumen archivos existentes sin declararlo. Habría que inventar si se crean o ya existen.
7. “En el código de la vista no hay ninguna rama…”: no acota si aplica a toda la carpeta o solo a la ruta de carriles.
8. El ritual exige “task is the active item on `desk/tasks/Board.md`” y “pills… bound”, pero el TaskDoc trae `status: draft`, `pills: []`, sin Board. Obligaría a inventar su estado activo.

## DRY-RUN

**Lecturas:** README de representación, los tres `.mjs`, `notation_constants.py` (`LAYOUT_KINDS`), los tests citados. **Cambios previstos:** layout genérico de carriles por partición en `notation-layout.mjs`; generalizar `notation-swimlanes.mjs` guiado por `data.partition`; `notation.mjs` sin ramas por notación/diagrama. **Dependencias:** ADR, constantes de sldb y posible petición `deskops message send`; fixture de notación de prueba. **Validaciones futuras:** los dos comandos citados y comprobación del Done When (tres columnas, paridad UML, sin ramas). Sin ejecutar nada.

## FUTURO

Promover el TaskDoc a activo y vincular pills (Board), decidir la notación de prueba y el criterio de paridad visual, y resolver la petición a sldb vía inbox.
