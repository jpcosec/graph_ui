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
| uml-despliegue.md | UML, diagrama de despliegue | artefactos desplegados en nodos de ejecución | pendiente |
| treemap.md | treemap | jerarquía con tamaño proporcional a una magnitud | pendiente |

## Implicancias

- Para `graph_ui`: separar "este campo es contención" (dato) de "esto se dibuja anidado"
  (vocabulario). Hoy son lo mismo en `views/documents/map/projection.mjs`.
- Para el `VocabularyDoc`: una relación necesita un `como` (arista, anidamiento, celda, eje), no
  solo un estilo.

## Fuentes

- OMG, *UML* (paquetes y despliegue): https://www.omg.org/spec/UML/
- S. Brown, *The C4 model for visualising software architecture*: https://c4model.com/
- B. Shneiderman, *Tree visualization with tree-maps: a 2-d space-filling approach* (1992).
