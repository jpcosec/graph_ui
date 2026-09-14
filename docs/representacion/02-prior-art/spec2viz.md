# spec2viz (herramienta propia del ecosistema)

## Qué es

`spec2viz` (`tools/spec2viz`) convierte especificaciones YAML semánticas en diagramas: *"turns
semantic YAML specifications into diagrams and charts"*. En el ecosistema se define como *"the
human-watchable rendering layer over canonical `specYaml` semantics. Renderer hints may exist, but
semantic truth belongs upstream in `specyaml/`."* (README).

Es el germen de la capa intermedia que buscamos: separa significado, representación intermedia y
dibujo. Le falta la fuente viva y la vuelta.

## Arquitectura

```
spec YAML ── load + validate (Pydantic) ──▶ modelo por tipo de diagrama
          ── compile ──▶ IR por tipo (ClassIR, StateIR, SequenceIR…)
          ── render ──▶ PlantUML / Mermaid / D2 / Vega / HTML / JSON
```

- **Un modelo y un IR por tipo de diagrama**: `class`, `component`, `sequence`, `state`,
  `activity`, `deployment`, matriz y `reflection`. Cada IR tiene los conceptos de su dominio
  (`StateIR.transitions` con `on`, `guard`, `action`; `SequenceIR.messages` con `kind`).
- **El IR es independiente del renderer**: *"Each IR is a graphics-ready, renderer-agnostic view of
  a diagram. Compilers produce IRs; renderers consume them."* (`spec2viz/ir.py`).
- **Semántica vs estilo**: *"`kind` stays semantic; the `style.kinds` block is only a renderer
  hint."*

## Cómo declara el mapeo semántico → notación

Dos mapeos, igual que describe el documento de
[sintaxis abstracta y concreta](../01-fundamentos/sintaxis-abstracta-y-concreta.md):

1. **El YAML ya está en los constructos del vocabulario** (una relación es `composition`, una clase
   es `interface`): el autor hace el primer mapeo al escribir.
2. **El renderer tiene una tabla fija constructo → sintaxis** del backend.

Y `docs/CLASS_DIAGRAMS.md` documenta la dirección de cada relación y su glifo UML:

| `relation` | Significado de `from → to` | Glifo UML |
|---|---|---|
| `inheritance` | subtipo → padre | línea sólida, triángulo hueco en el padre |
| `realization` | implementación → interfaz/protocolo | línea punteada, triángulo hueco en el contrato |
| `composition` | dueño → parte | rombo lleno en el dueño |
| `aggregation` | agregado → parte compartida | rombo hueco en el agregado |
| `association` | origen → destino | línea sólida dirigida |
| `dependency` | cliente → proveedor | línea punteada dirigida |

La validación también es semántica: rechaza extremos desconocidos, multiplicidades invertidas,
ciclos de herencia o realización, y realizaciones cuyo destino no es interfaz o protocolo.

## Cómo resuelve la edición de vuelta

No la resuelve: es de un solo sentido. El YAML es la fuente de verdad y se edita a mano.

## Fragmento de código real

La tabla constructo → sintaxis del renderer de clases (`spec2viz/renderers/class_diagram.py`):

```python
MERMAID_RELATION = {
    "inheritance": "--|>", "realization": "..|>", "composition": "*--",
    "aggregation": "o--", "association": "-->", "dependency": "..>",
}
PLANTUML_RELATION = {**MERMAID_RELATION, "inheritance": "--|>", "realization": "..|>"}
```

El compilador de componentes pasa `kind` al IR tal cual y guarda los estilos por kind aparte
(`spec2viz/compilers/component.py`):

```python
nodes = [
    ComponentNode(
        id=nid,
        label=node.label or nid,
        kind=node.kind,
        contains=list(node.contains),
    )
    for nid, node in diagram.data.nodes.items()
]
edges = [
    ComponentEdge(from_=e.from_, to=e.to, relation=e.relation, label=e.label)
    for e in diagram.data.edges
]
style_kinds = {}
if diagram.style is not None:
    style_kinds = dict(diagram.style.kinds)
```

Y el tipo `reflection` (`spec2viz/models/reflection.py`) es el IR más genérico: nodos con `kind`
libre, aristas con `relation` libre y metadatos de seis dimensiones (*who, what, where, when, how,
why*). Es lo más parecido a lo que un mundo `pron` expone:

```python
class ReflectionNode(BaseModel):
    model_config = ConfigDict(extra="ignore")

    kind: str = Field(
        default="core", description="Semantic kind of the node (e.g., repository, module)."
    )
    label: str | None = Field(
        default=None, description="Optional display label for the node."
    )
    metadata: SemanticMetadata | None = Field(
        default=None, description="Optional 6D metadata for the node."
    )
```

## Qué le falta para ser la capa que buscamos

| Necesidad | `spec2viz` hoy |
|---|---|
| fuente viva y editable (un mundo `pron`) | lee YAML estático |
| primer mapeo declarado (mundo → constructos) | lo hace el autor al escribir el YAML |
| edición de vuelta | no existe |
| aplicabilidad (qué vista corresponde a qué dato) | el autor elige `type` |
| render interactivo | produce texto para PlantUML/Mermaid/D2 |

## Qué tomamos y qué no

**Tomamos**

- **IR tipado por forma de diagrama**, independiente del renderer. Es el "modelo gráfico" entre el
  mundo y React Flow, y encaja con la clasificación del
  [eje 3](../03-diagrama-vocabulario/index.md).
- **`kind` semántico separado de estilo.**
- **Validación semántica del diagrama** (ciclos de herencia, destino de una realización) como
  reglas del vocabulario.
- **Los modelos Pydantic existentes como definición de referencia** de cada vocabulario (UML de
  clases, estados, secuencia): no hay que reinventar qué constructos tiene cada uno.
- **Los renderers como oráculo**: los ejemplos del eje 3 se renderizan con `spec2viz` para tener el
  resultado esperado.

**No tomamos**

- Que el usuario escriba el primer mapeo a mano en YAML: en `graph_ui` ese mapeo lo declara el
  `VocabularyDoc` sobre los documentos del mundo.

## Fuentes

- `spec2viz`, `README.md`, `docs/CLASS_DIAGRAMS.md`, `spec2viz/ir.py`,
  `spec2viz/models/{class_diagram,reflection}.py`, `spec2viz/compilers/component.py`,
  `spec2viz/renderers/class_diagram.py` (`tools/spec2viz`, commit `fe0f4f3`).
