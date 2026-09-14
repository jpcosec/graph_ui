# Flujo

## Dónde vive el significado

En **el orden**. Un flujo tiene un inicio, un fin, pasos que ocurren uno después de otro,
bifurcaciones (decisión, paralelismo) y uniones. Leer el diagrama es recorrerlo. Las aristas no
son "relaciones" cualesquiera: son **secuencia**, y los nodos de control (inicio, fin, decisión,
fork/join) no representan cosas del dominio sino la estructura del recorrido.

Esta es la carpeta que explica por qué la vista Flujo de `graph_ui` no representa nada en un
mundo como la KB de `pron`: dibuja cualquier grafo de documentos como si fuera un flujo. Un flujo
solo existe si el mundo declara pasos y una relación de secuencia entre ellos.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué relación del mundo es la secuencia** (el "siguiente paso").
- **Nodos de control** y su semántica: inicio, fin, decisión (con guardas en las salidas),
  paralelismo.
- **Aplicabilidad**: la vista solo se ofrece si el mundo tiene lo anterior. Es el caso más claro de
  "no toda vista representa lo mismo para todo dato".
- **Orientación y layout** dirigido (izquierda-derecha o arriba-abajo) derivado de la secuencia.
- **Gestos**: insertar un paso entre dos reescribe la secuencia; bifurcar agrega un nodo de
  decisión y sus guardas.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [uml-actividad.md](uml-actividad.md) | UML, diagrama de actividad | el flujo de control y de objetos de un comportamiento | escrito |
| [bpmn.md](bpmn.md) | BPMN 2.0 | procesos de negocio: eventos, actividades, compuertas, carriles | escrito |
| [dfd.md](dfd.md) | diagrama de flujo de datos | cómo circulan los datos entre procesos, almacenes y entidades externas | escrito |

BPMN también usa carriles: ver [`../posicion/`](../posicion/index.md).

## Implicancias

Lo que dejaron los tres ejemplos:

| | Qué es la flecha | Nodos de control | Regla de conexión clave | Dónde se pudo declarar |
|---|---|---|---|---|
| [actividad UML](uml-actividad.md) | paso de un token (control u objeto) | inicial, final, fork, join, decisión, merge | grado según el `kind` del nodo | tipos de flujo sí; grados, no (`cardinality` es por verbo) |
| [BPMN](bpmn.md) | secuencia dentro de un pool, mensaje entre pools | eventos, compuertas | depende del **contenedor** de cada extremo | con `condition` y el pool copiado a un campo; las de clase de evento, no |
| [DFD](dfd.md) | un dato con nombre | ninguno | todo flujo toca un proceso | con **dos verbos** para un solo constructo |

- **La vista Flujo no es inútil por dibujar un grafo dirigido**: sobre un mundo que sí es una actividad
  dibuja el orden bien (captura en [actividad UML](uml-actividad.md)). Lo que le falta es saber qué es un
  paso, qué es control, qué rótulo lleva una arista y cuándo ofrecerse. Es la sección de **aplicabilidad**
  del vocabulario visual más un mapeo de símbolos por campo (`kind`, `position`, `trigger`).
- **Un editor serio elige el verbo del gesto**: bpmn-js decide secuencia o mensaje según el contexto y
  prohíbe lo que no cabe; en DFD y Petri el verbo depende de la clase del origen. El vocabulario visual tiene
  que declarar esa elección y `graph_ui` consultarla **antes** de escribir, con `pron` como validador final.
- **Varios verbos, un constructo; un verbo, varios símbolos**: `feeds` + `produces` son "el flujo" del
  DFD; un `ControlNode` son seis símbolos según `kind`. El mapeo no es uno a uno en ninguna dirección.
- **Los esquemas estándar no validan la gramática** (BPMN XSD acepta una secuencia entre pools, igual que
  PNML un arco lugar-lugar). La validación útil está en los editores y, en este ecosistema, en `pron`.
- **Operaciones compuestas**: insertar un paso, mover una tarea de pool o descomponer un proceso son
  varias escrituras que deben ir juntas y pueden invalidar aristas existentes.
- **Una sintaxis abstracta, varias concretas**: DeMarco y Gane & Sarson sobre el mismo mundo; la
  notación es del vocabulario, no del dato.

## Fuentes

- OMG, *BPMN 2.0*: https://www.omg.org/spec/BPMN/2.0/
- OMG, *UML* (actividades): https://www.omg.org/spec/UML/
- T. DeMarco, *Structured Analysis and System Specification* (Yourdon Press, 1978): DFD con procesos,
  almacenes y entidades externas.
