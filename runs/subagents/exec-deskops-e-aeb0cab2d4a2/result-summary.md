# Resultado
- buildScene (notation.mjs) acepta layout.kind 'partition-lanes' y lee `layout.by` (campo del nodo, en data o en el nodo); sin `by` el campo es `partition` (la actividad no cambia). Titulo de columna = valor. Sin ramas por notacion.
- Tests: tests/notation-partition-lanes.test.mjs (nuevo, incluye guardia de no-rama en notation/), fixture tests/fixtures/notation-partition-lanes/view-components.json (by: layer, 3 particiones).
- Archivos: frontends/mindmap/views/specs/notation/notation.mjs, notation-swimlanes.mjs (comentario), tests/notation-partition-lanes.test.mjs, tests/fixtures/notation-partition-lanes/view-components.json
- Validacion: ver validation.log. Aserciones de los e2e de actividad sin cambios.
- Revisar: sldb aun no acepta 'partition-lanes' en LAYOUT_KINDS; pedido enviado al inbox de sldb (suggestion). Commit de codigo sin Task-Id, segun la aclaracion.
