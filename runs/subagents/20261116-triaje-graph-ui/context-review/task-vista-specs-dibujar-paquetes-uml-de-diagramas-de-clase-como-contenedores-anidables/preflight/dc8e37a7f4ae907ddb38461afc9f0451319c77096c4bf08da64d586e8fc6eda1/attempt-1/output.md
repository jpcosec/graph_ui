## REFORMULACION

Propósito: que la vista Specs dibuje `data.packages` de un spec class como contenedores UML anidados, no cajas sueltas, consumiendo los links `uml-class.contains` con `draw nest` que resuelve sldb. Resultado: en `/specs/notation` cada paquete con forma package (carpeta con pestaña y título), clases y subpaquetes adentro a cualquier profundidad, `node.style` respetado (relleno/trazo/ícono), sin solapes y «Ver todo» encajando en la ventana. Repo: graph_ui; superficie: `notation-view.js`, `notation.mjs`, `notation-layout.mjs`, `notation.css`, `tests/e2e_notation_class.py` y el fixture `tests/fixtures/notation-pilots/class.packages.yml`. Límites: no tocar contrato ni notación en sldb, ni layout de otros diagramas, ni spec2viz; sin `data.packages` nada cambia; las clases no heredan el color del paquete. Cierre: pytest e2e verde sin skips, `node --test`, captura.

## AMBIGUEDADES

1. «Reusar la ruta de contención que ya usa deployment (… notation-deployment.mjs)»: ¿extraer código compartido (tocaría un archivo no listado en `files`) o duplicar en class? Obliga a inventar el alcance del refactor.
2. «criterio G2» y «R13»: citados sin definición; obliga a inventar la métrica de "título no tapado" y de encaje en ventana.
3. «el relleno/trazo/ícono de node.style del paquete»: no se indica qué campos mapean a qué propiedad; obliga a inventar el mapeo.
4. «una prueba node de la lógica pura si se toca notation-layout.mjs»: el paso 2 lo toca; ¿obligatoria o condicional? Obliga a fijar el criterio.
5. «copiado de sldb/… a tests/fixtures/…»: ¿literal o adaptado?
6. «runs/subagents/<run>/»: placeholder sin valor; obliga a inventar el directorio.
7. «a cualquier profundidad» frente a «un subpaquete dentro de su padre»: obliga a decidir cuántos niveles cubre el e2e.

## DRY-RUN

Ejecutor hipotético, sin ejecutar: lee `uml-class.yml`, la salida de `resolve_view` sobre `class.packages.yml`, `notation-layout.mjs`, `notation-deployment.mjs` (referencia), `notation.css` y el e2e existente. Cambios previstos: rama class que consume `parentId/container/containerHeader`; CSS `shape-package` con pestaña; fixture copiado; e2e nuevo (clase dentro de paquete, subpaquete anidado, título visible, «Ver todo»); test node si aplica; captura y commit. Dependencias: `task-ir13` (API sldb) resuelta y fixture origen existente. Validaciones futuras: `pytest tests/e2e_notation_class.py`, `node --test`, inspección de captura.

## FUTURO

Humano decide commit, captura y, si el contrato sldb resulta insuficiente, la nota por inbox a sldb. Otro nodo (`task-ir13`) provee `resolve_view`.
