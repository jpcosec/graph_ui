PASA

Commit revisado: 864cc13ef7306438f1476068e0d2e5c363ad1ae3 ("feat: exportSvg del modo lector con el layout de la vista de notacion").
Archivos del commit: notation-draw.mjs (nuevo), notation-svg.mjs (nuevo), notation-view.js (usa notation-draw), tests/mindmap-notation-svg.test.mjs (nuevo).

Validación ejecutada
- node --test tests/mindmap-notation-svg.test.mjs tests/mindmap-notation.test.mjs tests/mindmap-notation-layout.test.mjs -> 47 pass, 0 fail (8 del test nuevo, 18 de notation, 21 de layout).
- node --test de los demás tests de notación (deployment, style, swimlanes) -> 14 pass, 0 fail.
- node --check de notation-draw.mjs, notation-svg.mjs y notation-view.js -> OK.
- Comprobación extra: generé las vistas reales de 20 SpecDoc (activity, class, component, deployment, matrix, sequence, state) con `sldb notations view` y ejecuté exportSvg con ELK; los 20 SVG son válidos y parsean como XML. Cubre los 7 tipos de notación del store con specs en los fixtures.

Cumple
- exportSvg usa sceneFor + bestLayout para grafo/activity, y laneScene/gridScene vía notation-draw para secuencias y matrices; no hay un segundo layout de grafo.
- Las posiciones del SVG coinciden (tolerancia 1 px) con la escena calculada con approximateMeasure en actividad con carriles, clases/ELK, secuencia, fragmentos y matriz.
- El dibujo de carriles y grilla se extrajo a notation-draw.mjs, consumido por la vista y por el exportador; el refactor de notation-view.js conserva el mismo markup (mismas posiciones, atributos y textos).
- No hay archivos tests/*.py en el commit; la validación definida en el TaskDoc es node. El contenedor no tiene pytest instalado, así que no corrí la suite Python; el host la integra.

Observaciones no bloqueantes
- exportSvg devuelve Promise<string> (no string síncrono) porque bestLayout es async; está documentado en el módulo.
- La vista no se probó en navegador; el cambio es un refactor puro verificado por diff y node --check.
