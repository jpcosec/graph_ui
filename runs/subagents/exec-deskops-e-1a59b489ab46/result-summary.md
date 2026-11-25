# Resumen
Intento 2: cherry-pick de d3076e4 sobre master actual; único conflicto (imports en notation-view.js) resuelto conservando G-D (notation-draw.mjs, bestIn/worker ELK intactos) y añadiendo isViewRef/viewAsNotation.
Archivos (commit en rama deskops/deskops-e-1a59b489ab46, sin Task-Id):
- frontends/mindmap/views/specs/notation/notation-view.js
- frontends/mindmap/views/specs/notation/notation.mjs
- tests/e2e_notation_viewdoc.py
- tests/mindmap-notation.test.mjs
Validación: ver validation.log (todo verde). Nota de entorno: pron se instaló desde /mnt/ssd/proyectos/SLDB_1/pron (no está en el índice) y playwright install chromium.
