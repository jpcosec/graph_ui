# Nodo-arista tipado

## Dónde vive el significado

En **qué es** cada nodo y **qué es** cada arista, y en que eso se note a la vista. Una clase y una
interfaz son dos kinds de nodo; una herencia y una composición son dos kinds de relación, con
terminales distintos (triángulo hueco, rombo lleno) y extremos con significado propio (quién es
el todo, quién la parte, cuántos puede haber). La posición en el lienzo no significa nada: el
layout es libre.

Es la forma más familiar y la más cercana a lo que `graph_ui` ya hace. Justamente por eso es
donde más fácil se confunde *proyectar* con *representar*: dibujar cajas y líneas no basta si
todas las líneas se ven iguales.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Kinds de nodo** y, para cada uno, de qué modelo(s) del mundo sale y con qué símbolo se dibuja
  (forma, estereotipo, compartimentos: atributos, operaciones).
- **Kinds de relación** y, para cada uno, de qué tipo de relación (`RelationTypeDoc`) o campo del
  mundo sale, con qué trazo y con qué **terminal en cada extremo**.
- **Roles y multiplicidad** en cada extremo (nombre del rol, `0..1`, `1..*`). Parte de esto ya
  existe en `kgdb` (`cardinality`, `direction`).
- **Restricciones de conexión**: qué kinds de nodo pueden unirse con qué kind de relación (una
  realización va de clase a interfaz, no al revés).
- **Gestos de edición**: arrastrar de un nodo a otro con un kind de relación elegido crea una
  arista de ese tipo en el mundo; cambiar el terminal cambia el kind.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [uml-clases.md](uml-clases.md) | UML, diagrama de clases | estructura de tipos: clases, interfaces, herencia, composición, asociaciones | escrito |
| [entidad-relacion.md](entidad-relacion.md) | ER (Chen / crow's foot) | datos persistentes: entidades, atributos, relaciones con cardinalidad | escrito |
| archimate.md | ArchiMate | arquitectura empresarial por capas (negocio, aplicación, tecnología) | pendiente |
| mapa-conceptual.md | mapa conceptual | conceptos unidos por proposiciones etiquetadas | pendiente |
| vowl-owl.md | VOWL | clases y propiedades de una ontología OWL | pendiente |

## Implicancias

- Para `graph_ui`: la vista Schema actual es un nodo-arista, pero con kinds *inferidos* por
  estructura (`containment`, `relation`, `reference`) y un solo trazo por kind. Le faltan
  terminales, roles, multiplicidad y restricciones de conexión declaradas.
- Para el `VocabularyDoc`: esta forma fija el mínimo — mapeo de modelos a kinds de nodo y de
  relaciones a kinds de arista, con terminales. Todas las demás formas agregan algo encima.

## Fuentes

- OMG, *Unified Modeling Language* (especificación): https://www.omg.org/spec/UML/
- P. Chen, *The Entity-Relationship Model — Toward a Unified View of Data* (1976).
- The Open Group, *ArchiMate Specification*: https://pubs.opengroup.org/architecture/archimate3-doc/
- VOWL: https://www.semantic-web-journal.net/content/visualizing-ontologies-vowl-0
