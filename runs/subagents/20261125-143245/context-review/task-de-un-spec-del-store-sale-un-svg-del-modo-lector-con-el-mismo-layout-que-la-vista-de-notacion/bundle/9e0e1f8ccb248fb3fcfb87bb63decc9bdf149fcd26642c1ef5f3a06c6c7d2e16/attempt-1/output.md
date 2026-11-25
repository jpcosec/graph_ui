## REFORMULACION

Encargo: producir un exportador SVG estático del modo lector que reutilice la geometría y estilos de la vista interactiva, sin un segundo layout. Resultado: módulo puro `notation-svg.mjs` con `exportSvg(view, opts) -> string`, más extracción del dibujo de lanes/grid a `notation-draw.mjs` compartido por vista y exportador, y test node que compara posiciones (tolerancia 1 px) contra la escena calculada con `approximateMeasure`. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: solo SVG; fuera HTML autocontenido y CLI; no cambiar lo que muestra la vista; esta revisión no ejecuta nada.

## AMBIGUEDADES

1. «cubra los 8 tipos de diagrama»: no se enumeran los ocho; solo se nombran cuatro en la prueba. Obliga a inventar el catálogo y la escena de cada tipo.
2. «una prueba que compare posiciones con la vista interactiva» frente a «se comparan contra la escena calculada con la misma medida aproximada». Contradice el oráculo (vista/navegador vs escena node). Obliga a decidir si se usa jsdom o solo funciones puras.
3. «sacar ese dibujo a un modulo puro (p. ej. notation-draw.mjs)»: no define API ni formato de salida (¿string, VDOM, descriptor?). Obliga a inventar el contrato y cómo lo consume `htm`.
4. «un SVG valido»: sin criterio de validez (XML bien formado, sin recursos externos, `viewBox`, etc.). Obliga a inventar los criterios.
5. «tests/fixtures/notation-*»: no se listan fixtures ni nombres de los ocho tipos. Obliga a inventar la selección concreta.
6. «las pills ligadas» (instrucción): el bundle no incluye pills y el TaskDoc declara `pills: []`. Obliga a inventar guardrails.

## DRY-RUN

No ejecutable: es un TaskDoc de implementación, no un paquete. Un ejecutor futuro leería `notation.mjs` (`sceneFor`, `laneScene`, `gridScene`), `notation-layout.mjs`, `notation-style.mjs`, `notation-swimlanes.mjs`, `notation-deployment.mjs`, `notation-view.js`, fixtures y `package.json`. Crearía `notation-draw.mjs`, `notation-svg.mjs` y `tests/mindmap-notation-svg.test.mjs`; modificaría `notation-view.js` para consumir el dibujador común. Dependencias: módulos puros existentes y `node --test`. Validaciones futuras: el comando de la sección Validation, más comprobación de que la vista no cambia.

## FUTURO

El Board debe promover la tarea a activa y un humano ligar las pills; otro nodo ejecutará y validará; un humano decidirá el catálogo de los ocho tipos y la paridad visual en navegador; el cierre exige commit atómico y board reconciliado.
