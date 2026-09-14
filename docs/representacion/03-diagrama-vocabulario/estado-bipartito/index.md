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
| statecharts.md | statecharts (Harel) / máquina de estados UML | estados de una entidad y sus transiciones por eventos | pendiente |
| petri.md | redes de Petri | concurrencia y recursos: lugares, transiciones, tokens | pendiente |

## Implicancias

- Para `graph_ui`: validar conexiones en el front a partir de la gramática declarada, antes de
  escribir.
- Para el `VocabularyDoc`: reglas de conexión por pares de kinds y aristas con campos
  estructurados. `kgdb` ya valida `source_types`/`target_types` y `condition` al ingerir: la
  gramática del vocabulario puede apoyarse en eso.

## Fuentes

- D. Harel, *Statecharts: A visual formalism for complex systems* (1987).
- OMG, *UML* (máquinas de estado): https://www.omg.org/spec/UML/
- C. A. Petri, *Kommunikation mit Automaten* (1962); W. Reisig, *Understanding Petri Nets* (2013).
- `pron`, `source/spec/09a-el-mundo-del-restaurante.md`.
