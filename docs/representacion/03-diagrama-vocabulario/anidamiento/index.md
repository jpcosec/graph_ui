# Anidamiento

## Dónde vive el significado

En **estar dentro de**. Un contenedor dibujado alrededor de otros elementos dice "esto pertenece
a, se despliega en, forma parte de". No hace falta una flecha: el borde del contenedor *es* la
relación. Además, el anidamiento suele definir un **alcance**: lo que está dentro comparte
contexto (un paquete, un sistema, un nodo de ejecución).

`graph_ui` ya usa esta forma en la vista KB (cajas dentro de cajas a partir de
`__containment__`), pero fija: toda contención se dibuja como anidamiento y nada más.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué relación o campo del mundo se dibuja como anidamiento** en esta vista (la misma relación
  podría ser una flecha en otro vocabulario).
- **Kinds de contenedor** y su símbolo (paquete con pestaña, límite de sistema punteado, nodo 3D).
- **Reglas de pertenencia**: si un elemento puede estar en uno o varios contenedores, y qué pasa
  con las aristas que cruzan el borde.
- **Colapso y foco**: un contenedor puede plegarse y mostrarse como un nodo (C4 hace zoom por
  niveles).
- **Gestos**: soltar un elemento dentro de un contenedor crea/cambia la relación de pertenencia;
  sacarlo la quita.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [uml-paquetes.md](uml-paquetes.md) | UML, diagrama de paquetes | organización de elementos en espacios de nombres y sus dependencias | escrito |
| [c4.md](c4.md) | C4 (contexto, contenedores, componentes) | arquitectura de software por niveles de zoom | escrito |
| [uml-despliegue.md](uml-despliegue.md) | UML, diagrama de despliegue | artefactos desplegados en nodos de ejecución | escrito |
| [treemap.md](treemap.md) | treemap | jerarquía con tamaño proporcional a una magnitud | escrito |

## Implicancias

Lo que dejaron los cuatro ejemplos:

- **La misma relación, dos notaciones.** UML ofrece anidamiento o arista tanto para la pertenencia a
  paquetes (círculo con cruz) como para el despliegue (`«deploy»`). El vocabulario visual necesita un
  *cómo* por relación (`anidamiento | arista`), y los gestos de las dos notaciones son la misma
  operación en el mundo (`move-into`).
- **Anidar exige un árbol, y el mundo no lo garantiza.** `many_to_one` asegura un padre; nadie impide
  ciclos ni autocontención (paquetes, treemap). Una relación `many_to_many` (un artefacto en dos nodos)
  no se puede anidar sin una regla explícita.
- **Vistas por nivel y relaciones derivadas.** C4 muestra el mismo mundo a distintos niveles y eleva
  las relaciones por la pertenencia; la derivación encontró una relación que el diagrama hecho a mano
  omitía. Treemap deriva el tamaño de los contenedores sumando hojas.
- **El layout depende del vocabulario.** Aristas que cruzan el borde de un contenedor (hasta PlantUML
  necesitó otro motor) y particiones del espacio (treemap) no son un layout de grafo.
- **Para `graph_ui`**: separar "este campo es contención" (dato) de "esto se dibuja anidado"
  (vocabulario); hoy son lo mismo en `views/documents/map/projection.mjs`. Y el foco actual (entrar en
  un contenedor) debería convertirse en vistas por nivel con relaciones elevadas.

## Fuentes

- OMG, *UML* (paquetes y despliegue): https://www.omg.org/spec/UML/
- S. Brown, *The C4 model for visualising software architecture*: https://c4model.com/
- B. Shneiderman, *Tree visualization with tree-maps: a 2-d space-filling approach* (1992).
