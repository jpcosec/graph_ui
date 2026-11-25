# Resultado

Archivos: frontends/mindmap/views/specs/notation/notation-draw.mjs (nuevo), notation-svg.mjs (nuevo), notation-view.js (usa notation-draw), tests/mindmap-notation-svg.test.mjs (nuevo).

- notation-draw.mjs: dibujo puro compartido: TERMINAL_MARKERS, laneHeads/laneDrawing (secuencias), gridModel/gridDrawing (matrices). La vista (LanesDiagram, GridDiagram, marcadores) lo consume con el mismo markup de antes.
- notation-svg.mjs: exportSvg(view, {elk, measure, skin, ...}) -> Promise<string> (async porque bestLayout lo es). sceneFor + bestLayout para grafo/activity con carriles; laneScene/gridScene via notation-draw para secuencias y matrices. No hay segundo layout.
- Prueba: activity con carriles (sin ELK), clases y statechart (ELK real si esta en apps/review-workbench/node_modules; se omiten si no), secuencia, fragmentos, matriz; posiciones con tolerancia 1 px contra la escena con approximateMeasure.
- Validacion: node --test de los 3 archivos pedidos (+ el resto de notation*.test.mjs): 64 pass, 0 fail. Ver validation.log.

Para revisar: la vista no se probo en navegador (solo node --check de notation-view.js); el cambio en LanesDiagram/GridDiagram deberia dar el mismo DOM. exportSvg devuelve Promise, no string sincrono. Fuera de alcance: HTML autocontenido y CLI (G-B2). Glyph interiors (texto dentro de cajas) son aproximados; las cajas y aristas son exactas.
