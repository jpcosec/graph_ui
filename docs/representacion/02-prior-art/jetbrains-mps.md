# JetBrains MPS (Meta Programming System)

## Qué es

MPS es un *language workbench* de código abierto con **edición proyectiva**: los programas no se
guardan como texto que se parsea, sino como árbol de sintaxis abstracta, y lo que el usuario ve y
edita es una proyección de ese árbol. De la documentación (*Basic notions*): *"MPS differentiates
itself from many other language workbenches by avoiding the text form. Your programs are always
represented by an AST. You edit the code as an AST, you save it as an AST, you compile it as, well,
as an AST."*

Aclaración de vocabulario: en MPS "proyección" significa exactamente lo que en este manual llamamos
*representar* — editar el modelo a través de una notación —, no lo que llamamos *proyectar*.

## Arquitectura

| Noción | Qué es en MPS |
|---|---|
| **Node** | elemento del AST: tiene padre, hijos, propiedades y referencias a otros nodos |
| **Concept** | el tipo de un nodo: qué hijos, propiedades y referencias puede tener; los concepts forman jerarquía de herencia |
| **Language** | un conjunto de concepts más *aspects*: editor, completado, sistema de tipos, generadores |
| **Editor** | la proyección del nodo, que además actúa como controlador |
| **Generator** | transformaciones modelo a modelo |

Un detalle que conecta con `kgdb`: *"Since everything in MPS revolves around AST, concept
declarations are AST-nodes themselves. In fact, they are instances of a particular concept,
ConceptDeclaration."* Los tipos son nodos del mismo árbol, igual que un `RelationTypeDoc` es un
documento del mismo store que sus instancias.

## Cómo declara el mapeo semántico → notación

Con el **aspecto editor**: para cada concept se define un modelo de celdas. De la documentación
(*Editor*), las celdas básicas:

- **constant cell**: *"a cell which will always contain the same text. Constant cells typically
  mirror 'keywords' in text-based programming languages."*
- **collection cell**: contiene otras celdas, en fila, en columna o con sangría.
- **property cell**: *"a cell which will show a value of a certain property of a node. The value of
  a property can be edited in a property cell, therefore, a property cell serves not only as a view
  also but as a controller."*
- **child cell**: muestra el editor del hijo.
- **referent cell**: muestra un objetivo de referencia sin su editor completo (típicamente su nombre).

Y admite varias notaciones por lenguaje: *"There can be multiple presentations available for a
language, in which case the user can choose code visualisation to apply at any given moment."*
Las notaciones no son solo texto: tablas, fórmulas y diagramas se proyectan sobre el mismo AST.

## Cómo resuelve la edición de vuelta

No hay vuelta que calcular: *"The editor in MPS directly manipulates AST. No parsing is necessary,
since the code is always represented in the tree form."* y *"All user actions, including typing
characters on the keyboard, are translated into editor actions, which are then processed by the
corresponding nodes of the AST."* Cada celda puede tener un **action map** que redefine qué hace una
acción (borrar, seleccionar) sobre ese concept.

## Fragmento de código real

La documentación de MPS muestra casi todo como imágenes del editor proyectivo, porque no hay texto
fuente. El único ejemplo de action map aparece en el HTML como un párrafo con los tokens de la
proyección, sin saltos de línea; se reproduce tal cual (*Editor → Action maps*):

```text
action DELETE description : <no description> execute : (node, editorContext)->void { node < ExpressionStatement > expressionStatement = node . replace with new ( ExpressionStatement ) ; expressionStatement . expression . set ( node . expression ) ; }
```

El contexto que da la documentación: *"when you have a return statement without any action maps in
its editor, and you press Delete on a cell with the keyword 'return,' the whole statement is
deleted. But you may specify an action map containing a delete action map item, which instead of
just deleting return statement replaces it with an expression statement containing the same
expression as the deleted return statement."*

Es decir: el gesto "borrar" sobre un concept no significa siempre "eliminar el nodo"; el lenguaje
declara qué significa.

## Qué tomamos y qué no

**Tomamos**

- **La vista es también controlador.** Cada elemento que `graph_ui` dibuje desde un vocabulario
  debería declarar qué se puede editar ahí (como la *property cell*).
- **El significado de un gesto depende del concept**, y se declara (action maps). Refuerza la
  necesidad de gesto → operación por kind en el `VocabularyDoc`.
- **Varias notaciones sobre el mismo modelo, elegibles por el usuario**: un mundo con varios
  vocabularios aplicables.
- **Los tipos son nodos del mismo árbol** (`ConceptDeclaration`): valida la forma en que `kgdb`
  modela los verbos.

**No tomamos**

- El AST como forma de almacenamiento y la edición carácter a carácter: nuestro dato son documentos
  Markdown con plantillas, y la edición gráfica opera sobre documentos y relaciones, no sobre
  celdas de texto.
- La complejidad de definir un editor completo por concept: un `VocabularyDoc` debería declarar
  kinds, canales y gestos, no un modelo de celdas.

## Fuentes

- MPS, *Basic notions*: https://www.jetbrains.com/help/mps/basic-notions.html
- MPS, *Editor* (cell models, action maps): https://www.jetbrains.com/help/mps/editor.html
