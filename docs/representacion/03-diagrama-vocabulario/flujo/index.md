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
| uml-actividad.md | UML, diagrama de actividad | el flujo de control y de objetos de un comportamiento | pendiente |
| bpmn.md | BPMN 2.0 | procesos de negocio: eventos, actividades, compuertas, carriles | pendiente |
| dfd.md | diagrama de flujo de datos | cómo circulan los datos entre procesos, almacenes y entidades externas | pendiente |

BPMN también usa carriles: ver [`../posicion/`](../posicion/index.md).

## Implicancias

- Para `graph_ui`: la vista Flujo actual debería reemplazarse por un vocabulario de flujo que se
  ofrezca solo cuando el mundo lo declara.
- Para el `VocabularyDoc`: necesita una sección de aplicabilidad (qué debe existir en el mundo) y
  kinds de nodo "de control" que pueden no ser documentos.

## Fuentes

- OMG, *BPMN 2.0*: https://www.omg.org/spec/BPMN/2.0/
- OMG, *UML* (actividades): https://www.omg.org/spec/UML/
- T. DeMarco, *Structured Analysis and System Specification* (1978): DFD con procesos, almacenes
  y entidades externas.
