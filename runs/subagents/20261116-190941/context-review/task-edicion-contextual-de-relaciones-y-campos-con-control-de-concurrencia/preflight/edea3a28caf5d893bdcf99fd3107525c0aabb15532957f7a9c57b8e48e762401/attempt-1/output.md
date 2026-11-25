## REFORMULACION

Encargo: implementar en graph_ui la edición contextual de la KB SLDB desde el workspace. Propósito: que el usuario edite campos y agregue/elimine relaciones sin conocer el archivo subyacente, y que escrituras concurrentes (agentes, CLI) fallen con 409 en vez de pisarse. Resultado esperado: endpoints de mutación en `frontends/mindmap` que exigen el hash de revisión previo y rechazan con 409 escrituras obsoletas, más controles en el panel Context y la proyección Document, `docs/workspace-ui.md` y `tests/test_mindmap_workspace_edit.py`. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: no se edita código ni anclajes (T4 opción A); toda escritura pasa por pron.Store/sldb; no se tocan cambios sin commitear de JP en `frontends/desk/app.js` y `task.js`. Cierre: persistencia real bajo lock, supervivencia a recarga y 409 con pytest en verde.

Es un nodo ejecutable (`task.code`), no un agregado.

## AMBIGUEDADES

1. "reutilizando el mecanismo de revisión y 409 que ya usa persistence.py" — no define nombre, forma ni API del mecanismo (¿hash? ¿campo `revision`?); obligaría a inventar el contrato.
2. "relaciones válidas según el modelo" — el modelo no está citado; obligaría a inventar tipos y cardinalidades.
3. "edición de campos vía pron.Store/sldb" — no lista qué campos son editables ni el esquema del payload.
4. "sin perder estado local" — no describe el comportamiento de UI ante 409; obligaría a inventar la UX.
5. "los cambios sin commitear de JP en frontends/desk/app.js y task.js" — no dice cómo detectarlos ni evitarlos; límite difuso.
6. "hash de revisión previo" vs "before-image" — dos términos para lo mismo sin definir equivalencia.

## DRY-RUN

Lecturas: `frontends/mindmap/persistence.py` (mecanismo de revisión/409), `serve.py`, `views/workspace/`, `tests/`, `docs/workspace-ui.md`, SPEC.md (K06/K11/K13/K15), referencia de T4. Cambios previstos: endpoints POST/PATCH/DELETE con verificación de revisión; controles +Add/Remove relation y guardado de campos; doc; tests de persistencia y 409. Dependencias: pron.Store/sldb, lock de servidor, SPEC. Validaciones futuras: `pytest -q tests/test_mindmap_workspace_edit.py`, prueba manual de recarga y de conflicto 409.

## FUTURO

Decisión de JP sobre T4 (hoy "opción A, por ahora"); disponibilidad del contrato de pron.Store/sldb; commit y atom como evidencia de cierre.
