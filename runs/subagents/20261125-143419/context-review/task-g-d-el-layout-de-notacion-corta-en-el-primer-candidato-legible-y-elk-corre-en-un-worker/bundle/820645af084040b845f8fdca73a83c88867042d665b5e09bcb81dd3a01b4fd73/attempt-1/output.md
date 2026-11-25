## REFORMULACION
Nodo ejecutable `task.code` (no agregado). Propósito: eliminar la latencia y el bloqueo de UI al calcular layouts de notación. Resultado: `bestLayout` devuelve el primer candidato sin problemas y con zoom legible; ELK se instancia con worker y fallback al hilo principal; una prueba node fija un tope de corridas para la fixture de 13 nodos y conserva el layout de las fixtures existentes. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: solo `notation-layout.mjs`, `notation-view.js`, tests node de layout y una e2e/medición; no cambiar el layout de specs que ya salen bien; respetar Board/pills.

## AMBIGUEDADES
1. “el primero sin problemas y con zoom >= legible”: no define “problemas” ni el umbral `legible`; obligaría a inventar el predicado y el valor.
2. “no pasa de un tope (p. ej. 30)”: el tope es ejemplo, no contrato; obligaría a fijar 30 u otro número.
3. “workerUrl servido por graph_ui (o el patron que use la libreria vendorizada)”: no da ruta, build ni detección de fallo; obligaría a inventar el mecanismo de serving.
4. “las specs de fixtures existentes dan el mismo layout que antes”: no enumera fixtures ni baseline; obligaría a inventar el conjunto y la referencia.
5. “copiar activity.render-error-handling a tests/fixtures/ si no esta”: no precisa ruta/origen/formato; obligaría a inventar el fixture.
6. “las pills ligadas” y “los átomos ligados”: el TaskDoc trae `pills: []` y `atoms: []`, sin documentos; obligaría a inventar guardrails.
7. “los rituales enrutados por el Board”: no se incluye el Board; obligaría a inventar el estado activo.

## DRY-RUN
Lecturas: TaskDoc, rituales execution/testing/closeout, Board, pills/átomos si existen, `notation-layout.mjs` (bestLayout), `notation-view.js`, tests y fixtures, dependencia elkjs/worker. Cambios previstos: corte temprano de candidatos; inicialización de ELK con worker y fallback; contador inyectable y tope en test; fixture de actividad. Dependencias: constante de zoom legible, predicado de problemas, asset worker servido. Validaciones futuras: `node --test ...` y `pytest ...` indicados; medir corridas y layout estable. Sin ejecutar.

## FUTURO
Otro nodo/humano debe aportar Board y pills/átomos reales, fijar umbral y tope, confirmar ruta del worker y baseline de fixtures; luego ejecutar validaciones y closeout atómico.
