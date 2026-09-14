# Sirius y Sirius Web (Obeo / Eclipse)

## Qué es

Eclipse Sirius es un framework para construir **modeladores gráficos** sobre un metamodelo sin
programar el editor: se declara una *Viewpoint Specification* (VSM) que dice cómo se representa el
metamodelo y qué herramientas de edición hay. Sirius Web lleva los mismos principios a la web
(*"a framework to easily create and deploy studios to the web. We keep the principles which made
the success of Eclipse Sirius Desktop and make them available on a modern cloud-based stack"*,
README del repositorio). En Sirius Web, tanto los metamodelos (*Domains*) como las definiciones de
representación (*Views*) son modelos que viven dentro de la misma aplicación.

Es la herramienta más cercana a lo que queremos: un documento declarativo, editable en la misma
herramienta, que mapea un modelo semántico a una notación y define la edición.

## Arquitectura

```
metamodelo (Domain, Ecore)        View / VSM (Diagram Description)
        │                                   │
        ▼                                   ▼
modelo semántico ── mappings (candidatos + estilo) ──▶ diagrama
        ▲                                   │
        └──────── tools (operaciones declaradas) ◀── gesto del usuario
```

- Una **Diagram Description** tiene un *Domain Class*: el tipo de elemento semántico sobre el que
  se puede crear ese diagrama.
- Su contenido son **mappings** organizados en **layers** (capas que el usuario activa o desactiva)
  y sus **tools**.
- Cada mapping selecciona elementos del modelo y les asocia una representación: *"A mapping is an
  element defined inside the VSM which identifies a sub-set of the elements in the semantic model
  and associates a graphical representation to them: it maps semantic elements onto some graphical
  notation."* La documentación lo resume así: *"a description of how to project the concepts in
  your semantic model onto the graphical language provided by Sirius (nodes, containers, edges...)
  according to the viewpoint you want the diagram to represent."*

## Cómo declara el mapeo semántico → notación

Cada mapping se evalúa en tres pasos (documentación de Sirius, *Diagrams*):

1. la **Semantic Candidates Expression** devuelve elementos candidatos desde el contexto;
2. se filtran por **Domain Class** (solo instancias de ese tipo);
3. una **Precondition Expression** opcional decide caso por caso.

Los tipos de elemento gráfico son nodos, contenedores, listas, *bordered nodes* (sobre el borde de
otro elemento, *"useful to represent things like communication ports"*) y aristas. Para las aristas
Sirius distingue exactamente los dos casos que tenemos en `pron`:

- **Relation-Based Edge**: *"used to represent a relation between model elements such as
  containment or reference (including computed references). An example in UML would be the
  inheritance relationship, which is represented by references between a class and its
  super-classes."* Equivale a un campo de referencia o de contención de un documento.
- **Element-Based Edge**: *"used when a semantic model element (instead of simply a reference)
  exists to represent the relation itself. An example in UML would be an association between two
  classes A and B: it is not represented by a reference between A to B, but by an explicit
  Association model element which itself references A and B."* Equivale a una `RelationDoc` de
  `kgdb`.

En los dos casos se declaran **Source Mappings** y **Target Mappings**: de qué kinds de elemento
puede salir y a qué kinds puede llegar una arista. Es una gramática de conexión declarada.

El estilo de arista incluye trazo (*solid, dash, dot, dash-dot*), color, ancho y decoraciones en
los extremos, hasta tres etiquetas (centro, origen, destino) y *folding* (plegar lo que cuelga de
un extremo).

## Cómo resuelve la edición de vuelta

Las **tools** son operaciones declaradas como modelo, no código: crear una instancia, cambiar de
contexto, asignar un valor. Se asocian a los mappings (paleta del diagrama, paleta de cada nodo o
arista) y cubren creación, borrado, edición de etiquetas y **reconexión de extremos**.

## Fragmento de código real

Sirius Web construye sus *View descriptions* también por código con builders generados. Este es
el ejemplo oficial *Flow* del repositorio (`FlowTopographyViewDiagramDescriptionProvider.java` y
`DataSourceToProcessorEdgeDescriptionProvider.java`, commit `6843419`).

Una herramienta de creación de nodo es una secuencia de operaciones declaradas:

```java
var createInstance = this.viewBuilderHelper.newCreateInstance()
        .typeName("flow::DataSource")
        .referenceName("elements")
        .variableName("newInstance")
        .children(changeContextNewInstance.build());

return this.diagramBuilderHelper.newNodeTool()
        .name("Data Source")
        .iconURLsExpression("/icons/full/obj16/DataSource_active.gif")
        .body(createInstance.build())
        .build();
```

Una arista basada en elemento (`flow::DataFlow` tiene `source` y `target`, como una `RelationDoc`),
con su estilo y sus herramientas de reconexión:

```java
return this.diagramBuilderHelper.newEdgeDescription()
        .name(NAME)
        .domainType("flow::DataFlow")
        .semanticCandidatesExpression("aql:self.elements.eAllContents(flow::DataFlow)")
        .targetExpression("feature:target")
        .sourceExpression("feature:source")
        .isDomainBasedEdge(true)
        .centerLabelExpression("aql:self.capacity")
        .style(this.diagramBuilderHelper.newEdgeStyle()
                .lineStyle(LineStyle.DASH)
                .color(this.colorProvider.getColor("Flow_Gray"))
                .targetArrowStyle(ArrowStyle.INPUT_CLOSED_ARROW)
                .borderSize(0)
                .build())
        .palette(this.createEdgePalette())
        .build();
```

```java
.edgeReconnectionTools(this.diagramBuilderHelper.newTargetEdgeEndReconnectionTool()
                .body(this.viewBuilderHelper.newChangeContext()
                        .expression("aql:edgeSemanticElement")
                        .children(this.viewBuilderHelper.newSetValue()
                                .featureName("target")
                                .valueExpression("aql:semanticReconnectionTarget")
                                .build())
                        .build())
                .build(),
```

Y la gramática de conexión se completa enlazando la arista con los kinds de nodo permitidos:

```java
optionalDataSourceToProcessorEdgeDescription.get().getSourceDescriptions().add(optionalDataSourceNodeDescription.get());
optionalDataSourceToProcessorEdgeDescription.get().getTargetDescriptions().add(optionalProcessorNodeDescription.get());
```

## Qué tomamos y qué no

**Tomamos**

- **La definición de vista es un modelo del mismo sistema**, editable ahí: el vocabulario visual es un
  documento del mundo.
- **Mapping = candidatos + tipo + precondición + estilo + tools.** Es una estructura probada para
  cada entrada de un vocabulario visual.
- **Relation-based vs element-based edge**: distinción que ya existe en nuestro sustrato (campos de
  referencia vs `RelationDoc`) y que `graph_ui` hoy resuelve por inferencia.
- **Source/Target mappings** como gramática de conexión declarada.
- **Tools como operaciones declaradas** (crear instancia, asignar valor), incluida la reconexión
  de extremos. Es lo que el documento de [lentes](../01-fundamentos/lentes-bidireccionales.md)
  pidió: el gesto dice qué escritura produce.
- **Layers**: activar y desactivar grupos de mappings sin cambiar de diagrama.

**No tomamos**

- El lenguaje de expresiones (AQL sobre EMF). Nuestro equivalente tiene que hablar de documentos,
  campos y `RelationDoc`; la expresión debería reusar lo que ya existe en `pron` (plantillas
  `{campo}` y `{relación.campo}` de `display`) o predicados de `sldb`, no un lenguaje nuevo.
- La dependencia de Ecore como metamodelo: en nuestro caso el metamodelo son los modelos
  `StructuredNLDoc` y los `RelationTypeDoc` del mundo.

## Fuentes

- Sirius, *Specifier Manual — Diagrams*: https://eclipse.dev/sirius/doc/specifier/diagrams/Diagrams.html
- Sirius Web, repositorio y README: https://github.com/eclipse-sirius/sirius-web
- `FlowTopographyViewDiagramDescriptionProvider.java`: https://github.com/eclipse-sirius/sirius-web/blob/6843419ef5474303d6de347b44062f2a3d59e42e/packages/starters/backend/sirius-components-flow-starter/src/main/java/org/eclipse/sirius/components/flow/starter/view/FlowTopographyViewDiagramDescriptionProvider.java
- `DataSourceToProcessorEdgeDescriptionProvider.java`: https://github.com/eclipse-sirius/sirius-web/blob/6843419ef5474303d6de347b44062f2a3d59e42e/packages/starters/backend/sirius-components-flow-starter/src/main/java/org/eclipse/sirius/components/flow/starter/view/descriptions/DataSourceToProcessorEdgeDescriptionProvider.java
