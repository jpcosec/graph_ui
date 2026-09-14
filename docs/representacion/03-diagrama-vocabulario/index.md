# Eje 3 — Relaciones diagrama ↔ vocabulario

No todos los vocabularios son "cajas unidas por flechas". Lo que cambia de uno a otro es **dónde
vive el significado** en el diagrama: en la forma de un nodo, en estar dentro de otro, en la
posición sobre un eje, en alternar dos clases de nodo… Esa diferencia decide qué tiene que poder
declarar un `VocabularyDoc`, qué layout necesita `graph_ui` y qué gestos de edición tienen
sentido.

Este eje tiene dos niveles. **Nivel 1**: una carpeta por lugar donde vive el significado.
**Nivel 2**: dentro de cada carpeta, un documento por notación de ejemplo.

## Nivel 1 — dónde vive el significado

| Carpeta | El significado vive en… | Ejemplos (nivel 2) | Qué exige al `VocabularyDoc` |
|---|---|---|---|
| [`nodo-arista-tipado/`](nodo-arista-tipado/index.md) | la forma del nodo y el trazo/terminales de la arista | UML de clases, entidad-relación, ArchiMate, mapa conceptual, VOWL | kind de modelo → símbolo; kind de relación → trazo, marcadores de extremo, roles, multiplicidad |
| [`anidamiento/`](anidamiento/index.md) | estar dentro de otro | UML de paquetes, C4, UML de despliegue, treemap | declarar que una relación se dibuja como contención y no como arista |
| [`posicion/`](posicion/index.md) | el lugar sobre un eje o en un carril | UML de secuencia, swimlanes, Gantt, Wardley | layout semántico: ejes, orden, carriles; el layout genérico no alcanza |
| [`estado-bipartito/`](estado-bipartito/index.md) | alternar clases de nodo (estado/transición, lugar/transición) | statecharts, redes de Petri | restricciones de conexión por kind; pseudo-estados; jerarquía |
| [`flujo/`](flujo/index.md) | un orden dirigido con inicio, fin y bifurcaciones | UML de actividad, BPMN, DFD | nodos de control (inicio, fin, decisión), orientación del flujo; aplicabilidad solo a datos que son flujo |
| [`n-aria/`](n-aria/index.md) | una relación con atributos o con más de dos extremos | clase de asociación, ER n-aria, argument maps (IBIS) | relación reificada como nodo + roles con nombre |
| [`matriz/`](matriz/index.md) | la celda (fila, columna) | DSM, RACI | la misma relación dibujada como tabla en vez de grafo |
| [`arbol/`](arbol/index.md) | la jerarquía padre-hijo única | mind map, feature model, WBS | una relación con cardinalidad `many_to_one` como eje del layout |

## Cómo se usa esta clasificación

- Un mismo vocabulario puede usar más de un lugar: BPMN es **flujo** (orden) y **posición**
  (carriles). Cada notación vive en una sola carpeta —la de su canal principal— y las demás la
  enlazan.
- Una misma relación del mundo puede representarse en lugares distintos según la vista: la
  contención de un board sobre sus tareas puede ser **anidamiento** (cajas dentro de cajas),
  **nodo-arista** (flecha con rombo) o **árbol**. El dato no cambia; cambia el vocabulario.
- La base teórica de "dónde vive el significado" son las variables visuales de Bertin
  ([`../01-fundamentos/`](../01-fundamentos/index.md)).
