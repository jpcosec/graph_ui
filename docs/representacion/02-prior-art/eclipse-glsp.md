# Eclipse GLSP (Graphical Language Server Platform)

## Qué es

GLSP es un framework cliente/servidor para editores de diagramas web, con la misma idea que el
Language Server Protocol pero para lenguajes gráficos: *"GLSP enables the development of modern,
web-based diagram editors, whereas the heavy lifting, such as loading, interpreting, and editing
diagrams according to the rules of the graphical diagram language, is encapsulated in the
server."* (documentación, *Overview & Architecture*).

De todo el prior art, es el que mejor resuelve **la vuelta**: cómo un gesto en un canvas web se
convierte en una modificación del modelo fuente.

## Arquitectura

```
          servidor GLSP                                     cliente GLSP (Sprotty, SVG)
 ┌───────────────────────────────┐                 ┌────────────────────────────────┐
 │ source model (JSON, EMF, BD…) │                 │                                │
 │        │ GModelFactory        │  modelo gráfico │  renderiza el modelo gráfico   │
 │        ▼                      │ ───────────────▶│  según el tipo de cada         │
 │ graphical model (GModel)      │                 │  elemento                      │
 │        ▲                      │   operation     │                                │
 │        │ OperationHandler     │ ◀─────────────── │  el usuario hace un gesto      │
 └───────────────────────────────┘                 └────────────────────────────────┘
```

La documentación lo describe así: *"The GLSP server is responsible for loading an arbitrary source
model, e.g. a JSON file, EMF model, or database, and defines how to transform it into the graphical
model. The graphical model is a serializable description of the diagram to be rendered on the
client."* y *"Once a user performs a change in the diagram, the client sends a notification to the
server. The server then applies the operation back to the source model, regenerates the graphical
model and updates the client with the new version of the graphical model."*

## Cómo declara el mapeo semántico → notación

En dos mitades:

- **En el servidor**, una `GModelFactory` escribe el modelo gráfico a partir del modelo fuente.
  Cada elemento gráfico lleva un **tipo** como string (`"node:entity"`).
- **En el cliente**, cada tipo se asocia a una clase de elemento y a una vista que lo dibuja
  (`configureModelElement(context, 'edge:weighted', WeightedEdge, WorkflowEdgeView)`).

El mapeo no es declarativo: es código en el servidor y registro de vistas en el cliente. Lo
declarativo es el **contrato**: el modelo gráfico serializable con tipos.

## Cómo resuelve la edición de vuelta

Con **operaciones tipadas**: *"A model operation is a dedicated type of action denoting a request
for performing a specific modification of the source model"*. Cada tipo de operación tiene un
`OperationHandler` en el servidor. GLSP trae operaciones predefinidas (crear nodo, crear arista,
borrar…) y se pueden agregar propias. Tras cada modificación exitosa, el servidor regenera el modelo
gráfico con la `GModelFactory` y lo envía al cliente.

No hay diff de estados: lo que viaja es la intención.

## Fragmento de código real

Documentación de GLSP, *Model Operations*. Una operación propia (TypeScript):

```typescript
export interface MyOperation extends Operation {
    kind: MyOperation.KIND;
    elementId: string;
    location?: Point;
}

export namespace MyOperation {
    export const KIND = 'runMyOperation';
    export function create(
        elementId: string,
        options: { location?: Point } = {}
    ): MyOperation {
        return {
            kind: KIND,
            isOperation: true,
            elementId,
            ...options
        };
    }
}
```

El cliente la despacha:

```typescript
@inject(TYPES.IActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
…
this.actionDispatcher.dispatch(MyOperation.create(element.id, { location: { ... } }));
```

Y el servidor la registra y la ejecuta sobre el modelo fuente:

```typescript
@injectable()
export class MyServerModule extends DiagramModule {
  ...
  configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
    binding.add(MyOperationHandler);
  }
}

@injectable()
export class MyOperationHandler implements OperationHandler {
    readonly operationType = MyOperation.KIND;

    @inject(MyModelState)
    protected modelState: MyModelState;

    execute(operation: MyOperation): MaybePromise<void> {
        // modify your model state here
    }
}
```

Documentación de GLSP, *Graphical Model*. La fábrica que produce el modelo gráfico (servidor Node):

```typescript
@injectable()
export class MyModelFactory implements GModelFactory {
  @inject(MyModelState)
  protected modelState: MyModelState;

  createModel(): void {
    const entities = this.modelState.getModel().getEntities();

    const entityNodes = entities.map((entity) =>
      new GNodeBuilder(GNode)
        .id("node:entity")
        .layout("vbox")
        .add(new GLabelBuilder(GLabel).text(entity.name).build())
        .build()
    );

    const newModel = new GGraphBuilder(GGraph)
      .id("entity-graph")
      .addChildren(...entityNodes)
      .build();

    this.modelState.updateRoot(newModel);
  }
}
```

El registro del tipo en el cliente:

```typescript
const workflowDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    ...
    configureModelElement(context, 'edge:weighted', WeightedEdge, WorkflowEdgeView);
    ...
}
```

## Qué tomamos y qué no

**Tomamos**

- **Operaciones tipadas como único camino de escritura.** Un gesto en `graph_ui` debería producir
  una operación con nombre (`connect`, `reconnect-target`, `nest`, `create-node`), que el backend
  traduce a escrituras en el mundo. Reemplaza el diff de estados de `source/batch.mjs`.
- **Regenerar la vista desde el modelo tras cada operación**, en vez de mantener el diagrama como
  fuente de verdad. `graph_ui` ya lo hace a medias (recalcula desde `working.documents`).
- **Tipos de elemento gráfico como strings** que el cliente asocia a vistas. Encaja con los
  `nodeTypes` de React Flow que `graph_ui` ya usa.
- **Modelo gráfico serializable** como contrato entre "qué se representa" y "cómo se dibuja".

**No tomamos**

- El servidor aparte con JSON-RPC: `graph_ui` ya tiene `serve.py` y un front; alcanza con un
  endpoint de operaciones.
- Que el mapeo sea código en una `GModelFactory`: nosotros queremos que el mapeo esté en un
  documento (`VocabularyDoc`) y que la fábrica sea genérica.

## Fuentes

- GLSP, *Overview & Architecture*: https://eclipse.dev/glsp/documentation/overview/
- GLSP, *Graphical Model*: https://eclipse.dev/glsp/documentation/gmodel/
- GLSP, *Model Operations*: https://eclipse.dev/glsp/documentation/modeloperations/
