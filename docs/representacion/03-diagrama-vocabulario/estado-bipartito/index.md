# Estado y grafos bipartitos

## Dónde vive el significado

En **qué clase de nodo se conecta con cuál**. En una red de Petri hay lugares y transiciones, y
una arista *siempre* une un lugar con una transición, nunca dos lugares entre sí. En un statechart
los nodos son estados y las aristas son transiciones etiquetadas con evento, guarda y acción;
además hay pseudo-estados (inicial, final, historia) y estados compuestos que contienen otros.

El significado no está solo en la forma de cada elemento, sino en la **gramática de conexión** y
en la semántica de ejecución (qué pasa cuando llega un evento, dónde están los tokens).

El mundo del restaurante de `pron` ya tiene una máquina de estados declarada como datos: modelo
`State` y relación `transitions_to` con `condition` (`source/spec/09a`). Es material directo
para estos ejemplos.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Clases de nodo** y la **gramática de conexión** entre ellas (qué kind puede ir a qué kind).
- **Etiquetas estructuradas en la arista**: evento, guarda, acción (no un texto libre).
- **Pseudo-nodos** (inicial, final, historia) que no son documentos del mundo o que lo son con un
  kind especial.
- **Jerarquía**: estados compuestos (se cruza con [anidamiento](../anidamiento/index.md)).
- **Gestos que respetan la gramática**: conectar dos lugares debe estar prohibido por la vista,
  no fallar después en el store.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [statecharts.md](statecharts.md) | statecharts (Harel) / máquina de estados UML | estados de una entidad y sus transiciones por eventos | escrito |
| [petri.md](petri.md) | redes de Petri | concurrencia y recursos: lugares, transiciones, tokens | escrito |

## Implicancias

Lo que dejaron los dos ejemplos:

| | Gramática de conexión | Semántica de ejecución | Dónde se hace cumplir hoy |
|---|---|---|---|
| [statecharts](statecharts.md) | `State → State` | un valor por campo; evento → transición con guarda | `Kernel.change` (formas de `pron`, de cualquier superficie); **no** en `Store.replace`, la puerta actual de `graph_ui` |
| [Petri](petri.md) | `Place → Transition → Place` | marcado; disparo consume y produce | la bipartición, en la ingesta tipada de `kgdb`; el disparo, en ninguna parte |

- **La gramática por pares se expresa bien cuando hay un verbo por par**: `input_of` y `output_to`
  rechazan lugar → lugar y transición → transición, mejor que la propia gramática PNML. Para `graph_ui`
  esto significa que puede **validar antes de escribir** leyendo `source_types`/`target_types`, y elegir
  el verbo de un arrastre por la clase del origen.
- **Estos vocabularios se ejecutan**, y el oráculo tiene que ser de comportamiento, no solo un dibujo:
  XState y SNAKES dieron la secuencia de estados y el grafo de alcanzabilidad contra los que se comparó el
  mundo. El vocabulario visual tiene que distinguir **editar el modelo** (estados, arcos) de **ejecutarlo**
  (disparar, simular), y decir si la ejecución escribe al mundo o vive en la vista.
- **La arista necesita campos**: evento, guarda y efecto en una transición; peso en un arco. `condition`
  cubre la guarda; el resto no tiene lugar, y dos aristas iguales se pisan en silencio en el grafo de
  `pron`.
- **Pseudonodos y derivados**: estado inicial, historia, habilitación de una transición. Unos faltan en el
  mundo (inicial), otros se calculan (habilitación): el vocabulario tiene que poder declarar ambos.
- **Corrección a la versión anterior de este índice**: decía que `kgdb` valida `condition` al ingerir. No
  lo hace; la evalúa `pron` al afirmar o al cambiar un campo (ver [huecos](../../huecos.md)).

## Fuentes

- D. Harel, *Statecharts: A visual formalism for complex systems* (1987).
- OMG, *UML* (máquinas de estado): https://www.omg.org/spec/UML/
- C. A. Petri, *Kommunikation mit Automaten* (1962); W. Reisig, *Understanding Petri Nets* (2013).
- `pron`, `source/spec/09a-el-mundo-del-restaurante.md`.
