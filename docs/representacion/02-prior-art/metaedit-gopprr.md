# MetaEdit+ y GOPPRR (MetaCase)

## Qué es

MetaEdit+ es una herramienta comercial de **modelado específico de dominio** (DSM): se define un
lenguaje de modelado —con su notación, reglas y generadores— y se usa en la misma herramienta. Su
meta-metamodelo, **GOPPRR**, fue diseñado *para lenguajes de diagramas*, no para programas ni datos
en general. Por eso nombra cosas que otros meta-metamodelos (MOF, Ecore) dejan implícitas.

## Arquitectura: los seis metatipos

Del manual (*1.1.1 GOPPRR concepts*), textual:

| Metatipo | Definición |
|---|---|
| **Graph** | *"A graph is a collection of objects, relationships, roles, and bindings of these to show which objects a relationship connects via which roles."* Ejemplos: *WatchApplication*, *UML Class Diagram*. |
| **Object** | *"An object is an element that can be placed on its own in a graph."* Ejemplos: *State*, *Action*; *Class* y *Object* en un diagrama de clases UML. |
| **Relationship** | *"A relationship is an explicit connection between two or more objects. Relationships attach to objects via roles."* Ejemplos: *Transition*; *Inheritance* y *Association* en UML. |
| **Role** | *"A role specifies how an object participates in a relationship."* Ejemplos: *From* y *To* de una *Transition*; *Ancestors* y *Descendants* de una *Inheritance*. |
| **Port** | *"A port is an optional specification of a specific part of an object to which a role can connect."* Ejemplo: un amplificador con un puerto de entrada analógica, uno de entrada digital y uno de salida; los roles que conectan a cada uno tienen semántica distinta. |
| **Property** | *"A property is a describing or qualifying characteristic associated with the other types, such as a name, an identifier or a description."* |

Dos notas del mismo manual que importan mucho aquí:

- *"The GOPPRR metatypes are applied on both the type and the instance level"*: un tipo de grafo
  (*WatchApplication*) y un grafo concreto (*Stopwatch*). Es la distinción de niveles de
  [metamodelado](../01-fundamentos/metamodelado-mof.md).
- *"On the instance level, each of the GOPPRR concepts (apart from property) can have multiple
  representations, even in different representational paradigms (i.e. diagram, matrix,
  table)."* Un mismo modelo se ve como diagrama, matriz o tabla: es la base de
  [`matriz/`](../03-diagrama-vocabulario/matriz/index.md).

## Cómo declara el mapeo semántico → notación

Cada tipo de objeto, relación y rol tiene un **símbolo** dibujado en un editor de símbolos, con
campos de texto ligados a propiedades. El lenguaje se arma con herramientas visuales (Object Tool,
Relationship Tool, Graph Tool). Las reglas de conexión se declaran en el grafo: qué objetos pueden
unirse por qué relaciones y en qué roles, con qué cardinalidad.

## Cómo resuelve la edición de vuelta

No hay traducción: el diagrama se edita directamente sobre las instancias GOPPRR, porque el
lenguaje y su notación son una sola definición dentro de la herramienta. Las reglas de conexión
del grafo impiden conectar lo que el lenguaje no permite.

## Fragmento de código real

La parte textual de MetaEdit+ es **MERL**, el lenguaje de generadores, que navega los modelos
según GOPPRR. Del manual (*5.3.1 Getting started with MERL*), para el ejemplo *Watch*:

```text
01 Report 'Test'
02 foreach .State [Watch]
03 { 'State : '
04 :State name;
05 newline
06 'Connects to: '
07 newline
08 do ~From>()~To.State [Watch]
09 { ' '
10 :State name;
11 newline
12 }
13 newline
14 }
15 endreport
```

El manual explica la navegación de la línea 8: *"it just says to find all 'From' roles for the
current object first, then follow them through the relationship in that binding to the respective
'To' roles and thence to the 'State [Watch]' objects connected to these roles. The '~' prefixes
denote the roles and the '>' prefix refers to the relationship."* Los prefijos `.` `>` `~` `#` `:`
distinguen objetos, relaciones, roles, puertos y propiedades.

La navegación **pasa por el rol**: no se va de un objeto a otro, se va de un objeto a su rol
`From`, del rol a la relación, de la relación al rol `To` y de ahí al objeto.

## Qué tomamos y qué no

**Tomamos**

- **Rol como concepto de primera clase.** En `kgdb` una `RelationDoc` tiene `source_id` y
  `target_id`, que son roles anónimos fijos. UML (el todo y la parte de una composición), ER (los
  participantes de una relación) y los statecharts (origen y destino de una transición) necesitan
  roles con nombre, multiplicidad y, a veces, más de dos. Es un hueco a verificar en
  [`n-aria/`](../03-diagrama-vocabulario/n-aria/index.md).
- **Relación entre dos *o más* objetos** por definición.
- **Puerto**: un punto de un objeto con semántica propia. La vista Schema de `graph_ui` ya tiene
  algo parecido sin nombrarlo: un *handle* por campo (`id` = nombre del campo). Llamarlo puerto y
  declararlo en el vocabulario permite que conectar a un puerto u otro signifique cosas distintas.
- **Múltiples representaciones por paradigma** (diagrama, matriz, tabla) sobre las mismas
  instancias.
- **Mismos metatipos en nivel de tipo y de instancia.**

**No tomamos**

- La definición de símbolos en un editor gráfico propio: nuestra notación se declara por kinds y
  canales y la dibuja `graph_ui`.
- Que lenguaje y datos vivan en un repositorio propietario: nuestro sustrato son documentos
  Markdown versionables.

## Fuentes

- MetaCase, *MetaEdit+ Workbench — 1.1.1 GOPPRR concepts*: https://www.metacase.com/support/45/manuals/mwb/Mw-1_1_1.html
- MetaCase, *MetaEdit+ Workbench — 5.3.1 Getting started with MERL*: https://www.metacase.com/support/45/manuals/mwb/Mw-5_3_1.html
- S. Kelly, K. Lyytinen, M. Rossi, *MetaEdit+: A fully configurable multi-user and multi-tool CASE
  and CAME environment*, CAiSE 1996, LNCS 1080, pp. 1–21.
