# Proyectar vs representar

## Definición

**Proyectar** es mostrar un conjunto de datos en una forma visual genérica, deduciendo qué dibujar
a partir de la *forma* del dato: cada registro es una caja, cada campo que parece apuntar a otro
registro es una línea. La visualización no sabe qué *es* nada; sabe qué *aspecto* tiene.

**Representar** es mostrar esos datos *como* los constructos de un lenguaje: esta caja es una
clase, esta flecha es una generalización, esta franja es el carril de un actor. Tres cosas lo
distinguen de proyectar:

1. **El significado está declarado, no inferido.** Hay un lenguaje (un vocabulario) que dice qué
   constructos existen, y un mapeo explícito de los datos a esos constructos.
2. **La notación es consecuencia del significado.** Dos constructos distintos se ven distintos;
   el mismo constructo se ve igual en todas partes.
3. **Las acciones significan algo en lo representado.** Conectar dos elementos no es "agregar una
   línea": es declarar una generalización, asignar una mesa, disparar una transición — y el
   lenguaje dice si eso está permitido.

Harel y Rumpe lo formulan para cualquier lenguaje de modelado: una definición de lenguaje consiste
en *"the syntax, semantic domain and semantic mapping from the syntactic elements to the semantic
domain"* (Harel & Rumpe 2004, p. 65). Proyectar tiene sintaxis —cajas y líneas— pero no tiene
mapeo semántico: nadie dijo qué significa cada línea. Ver
[sintaxis abstracta y concreta](sintaxis-abstracta-y-concreta.md).

## Por qué importa aquí

Las tres vistas de `graph_ui` que muestran documentos o clases (KB, Flujo, Schema) proyectan. El
síntoma que motivó este manual —"Flujo no representa nada útil", "KB no se entiende"— no es un
problema de estilo: es la falta de un mapeo declarado. Flujo dibuja cualquier grafo de documentos
como si fuera un flujo porque nada le dice cuándo un grafo *es* un flujo.

## Ejemplo en código: cómo proyecta `graph_ui` hoy

La decisión de qué es una arista está en la forma del payload
(`frontends/mindmap/source/graph.mjs`, código actual):

```js
// A document IS an edge, structurally: kgdb's RelationDoc convention (and any
// model that follows it) declares string source_id/target_id in its payload.
export function isRelationDocument(doc) {
  return typeof doc?.payload?.source_id==='string' && typeof doc?.payload?.target_id==='string';
}
```

Y la contención, cuando el modelo no la declara, sale de una tabla fija por nombre de clase y de
un conjunto global de nombres de campo que "suelen ser referencias" (mismo archivo):

```js
export const CONTAINMENT = {
  BoardDoc:{tasks:['TaskDoc'],pills:['PillDoc'],rituals:['RitualDoc']},
  TaskDoc:{checklists:['ChecklistDoc'],pills:['PillDoc'],atoms:['AtomDoc']},
  // ...
};
export const REFERENCE_FIELDS = new Set(['routine','current_node','entrypoint','source','target',
  'source_id','target_id', /* ... */ 'depends_on','references', /* ... */]);
```

Cualquier documento con `source_id` y `target_id` string se vuelve arista; cualquier campo
llamado `depends_on` se vuelve línea. Eso es proyectar: funciona sobre cualquier store y no
representa nada en particular.

## Ejemplo en código: cómo representa `spec2viz`

En `spec2viz` (herramienta del ecosistema) una relación de un diagrama de clases no puede ser
cualquier cosa: es uno de seis constructos con significado fijo
(`tools/spec2viz/spec2viz/models/class_diagram.py`, código actual):

```python
class ClassRelation(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")
    from_: Identifier = Field(alias="from")
    to: Identifier
    relation: Literal["inheritance", "realization", "composition", "aggregation", "association", "dependency"]
    label: Label | None = None
    from_multiplicity: Multiplicity | None = None
    to_multiplicity: Multiplicity | None = None
```

Su README separa explícitamente significado y aspecto: *"`kind` stays semantic; the `style.kinds`
block is only a renderer hint."* Lo que le falta a `spec2viz` para ser lo que buscamos es una
fuente viva y editable (lee YAML estático) y el camino de vuelta (no edita). Ver
[`../02-prior-art/`](../02-prior-art/index.md).

## Lo que ya declara un mundo `pron`, y lo que no

Un mundo `pron` ya tiene buena parte del significado declarado. Un `RelationTypeDoc` de `kgdb` es
el verbo, con dirección, cardinalidad, eje, tipos de origen y destino, condición y una descripción
en prosa (`/home/jp/proyectos/pron/knowledge/relations/types/implements.md`, documento real):

```markdown
---
name: implements
direction: directed
cardinality: many_to_many
axis: HOW
source_types:
- SurfaceDoc
- CliCommandDoc
target_types:
- SpecDoc
condition: ''
---

# implements

## Description

This module or command implements that chapter of the specification: ...
```

En términos de Harel y Rumpe: `source_types`, `target_types`, `cardinality` y `condition` son
*context conditions* (restringen qué expresiones son válidas) y `description` es un mapeo
semántico informal. Lo que **no** dice el mundo es cómo se representa `implements` en un
vocabulario dado: si es una realización de UML, una dependencia, una arista de un mapa conceptual.
Eso es lo que falta y lo que va a declarar el `VocabularyDoc`, sin tocar el mundo.

## Aplicación a `pron` y `graph_ui`

- `graph_ui` debe dejar de decidir qué es algo por la forma de su payload y leerlo de dos
  declaraciones: la del mundo (qué hay y qué restricciones tiene) y la del vocabulario (cómo se
  representa y se edita).
- Proyectar sigue siendo útil como vista de exploración cruda de un store desconocido, pero no
  debería presentarse como representación.
- Primer hueco concreto: `graph_ui` ignora `direction`, `cardinality` y `axis`, que ya están
  declarados ([`../huecos.md`](../huecos.md)).

## Fuentes

- D. Harel, B. Rumpe, *Meaningful Modeling: What's the Semantics of "Semantics"?*, IEEE Computer
  37(10), 2004, pp. 64–72: https://www.se-rwth.de/staff/rumpe/publications20042008/HR_ModSemantics_IEEEComp_04.pdf
- `spec2viz` README y `spec2viz/models/class_diagram.py` (`tools/spec2viz`).
- `kgdb`, `src/kgdb/models/relation_type_doc.py` (`tools/kgdb`).
- `graph_ui`, `frontends/mindmap/source/graph.mjs`.
