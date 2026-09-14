# Metamodelado: capas MOF, instanciación lingüística y ontológica

## Definición

Un **metamodelo** es un modelo que define un lenguaje de modelado: qué constructos tiene y cómo se
combinan (su sintaxis abstracta). La OMG organiza esto en la arquitectura de cuatro capas de MOF
(Meta-Object Facility), donde cada capa es instancia de la de arriba:

| Capa | Qué contiene | Ejemplo canónico |
|---|---|---|
| **M3** meta-metamodelo | el lenguaje para definir metamodelos | MOF |
| **M2** metamodelo | la definición de un lenguaje | el metamodelo de UML (`Class`, `Association`, `Generalization`) |
| **M1** modelo | un modelo escrito en ese lenguaje | el diagrama de clases de un sistema (`Client`, `Reservation`) |
| **M0** instancias | los objetos del mundo que el modelo describe | la reserva de Luis Soto del 11 de septiembre |

## El problema de las cuatro capas: dos clases de "instancia de"

Atkinson y Kühne (2003) mostraron que "instancia de" mezcla dos relaciones distintas:

- **Instanciación lingüística**: un elemento es instancia del *constructo del lenguaje* con que se
  escribió. `Collie` y `Lassie` son, lingüísticamente, instancias de `Class` y `Object` del
  metamodelo. Esta relación separa metaniveles (M1 de M2).
- **Instanciación ontológica**: un elemento es instancia de un *tipo del dominio*. `Lassie` es,
  ontológicamente, un `Collie`. Esta relación vive **dentro de un mismo nivel lingüístico**: `Collie`
  y `Lassie` están los dos en M1.

Laarman y Kurtev lo resumen así: *"Linguistic metamodeling defines the form that a statement
(model) in a language may take. Linguistic instanceOf delimits metalevels (e.g. M1 and M2).
Ontological metamodeling allows the type/instance relation to exist within a single metalevel."*
(Laarman & Kurtev 2009, §2, sobre Atkinson & Kühne). Y señalan el costo de no distinguirlas: en
una herramienta basada solo en MOF, `Collie` (un tipo) y `Lassie` (un individuo) son ambos "objetos
MOF" e indistinguibles para la herramienta.

## Por qué importa aquí

Porque el ecosistema ya hace las dos cosas, y un vocabulario visual va a tener que decir **en qué
nivel** aplica un vocabulario.

| Relación | En el ecosistema |
|---|---|
| lingüística | todo documento de un store es instancia del modelo `StructuredNLDoc` registrado con que se escribió; `sldb` es el metalenguaje (el "M3" práctico) |
| ontológica (entidades) | `table-12` es instancia del modelo `Table` del mundo |
| ontológica (verbos) | la arista `assigned_to--Reservation:r-1--Table:table-12` (una `RelationDoc`) es instancia del verbo `rt-assigned_to` — que es **otro documento** (`RelationTypeDoc`) en el mismo store |

Lo tercero es importante: `kgdb` ya practica metamodelado ontológico. Los tipos de relación no son
código ni schema; son documentos al lado de sus instancias, en el mismo nivel lingüístico. Es lo
que Atkinson y Kühne recomiendan y lo que MOF no permite expresar.

## Dos maneras de que UML viva en un mundo `pron`

La distinción deja ver que "implementar UML sobre `pron`" puede significar dos cosas distintas, y
el vocabulario visual tiene que soportar ambas o elegir.

**Opción A — UML como lectura del esquema del mundo.** Los modelos y verbos del mundo *son* las
clases y asociaciones del diagrama. El mundo del restaurante, sin cambiar nada, se dibuja como un
diagrama de clases: el modelo `Reservation` es una `Class`, el verbo `assigned_to` es una
`Association`. El vocabulario mapea **tipos** (modelos, `RelationTypeDoc`) a constructos UML. Es lo
que intenta hoy la vista Schema. Editar el diagrama es editar el esquema del mundo (agregar un
modelo, un campo, un tipo de relación).

**Opción B — UML como dominio del mundo.** El mundo modela *otro* sistema en UML: sus modelos son
metaclases de UML (`UmlClass`) y sus documentos son las clases del sistema diseñado (`Client`,
`Reservation`). El vocabulario mapea **documentos** y **aristas** a constructos UML. Editar el
diagrama es crear y conectar documentos, que es exactamente lo que el CLI de `sldb`/`pron` ya hace.

| | Opción A | Opción B |
|---|---|---|
| Qué es una clase UML | un modelo del mundo | un documento de modelo `UmlClass` |
| Qué es una asociación | un `RelationTypeDoc` | una `RelationDoc` de tipo `associates` |
| Nivel que mapea el vocabulario | tipos | instancias |
| Editar el diagrama escribe | esquema (`models_service`, drafts, promote) | documentos (`/api/save`) |
| Sirve para | ver/editar la estructura de cualquier mundo | diseñar un sistema en UML guardado como datos |

## Ejemplo en código: la opción B montada de verdad

Archivo [`ejemplos/uml-como-mundo.yaml`](ejemplos/uml-como-mundo.yaml): un modelo `UmlClass`, dos
verbos (`generalizes`, `associates`), tres clases y dos aristas. Se monta con la herramienta del
manual, que solo invoca CLI (`sldb stores init`, `sldb models create`, `sldb models add`,
`pron init`, `sldb docs create`, `pron refresh`, `pron check`):

```yaml
modelos:
  - name: UmlClass
    family: uml
    template: |
      ---
      name: ⸢rev•name⸥
      kind: ⸢rev•kind⸥
      attributes: ⸢rev,list•attributes⸥
      ---

      # ⸢render•name⸥
    fields:
      - {name: name, type: str, description: "Nombre de la clase."}
      - {name: kind, type: str, default: class, description: "class, interface, abstract, enum."}
      - {name: attributes, type: "list[str]", default: [], description: "Atributos como 'nombre: tipo'."}

tipos_de_relacion:
  - {name: generalizes, cardinality: many_to_many, source_types: [UmlClass], target_types: [UmlClass],
     description: "El origen es un subtipo del destino (generalización UML)."}
  # ...

relaciones:
  - {type: generalizes, source: "UmlClass:client", target: "UmlClass:person"}
  - {type: associates, source: "UmlClass:reservation", target: "UmlClass:client"}
```

```sh
python3 docs/representacion/herramientas/montar_mundo.py docs/representacion/01-fundamentos/ejemplos/uml-como-mundo.yaml
```

Salida relevante (resumida; la herramienta imprime cada comando):

```
$ python3 -m sldb models create UmlClass --template ... --fields ... --output .../umlclass.py
  Wrote .../mundo_modelos/umlclass.py
$ python3 -m sldb models add mundo_modelos.umlclass:UmlClass --store .../.sldb --pythonpath ...
  Registered 'UmlClass'
$ pron init --world .../world --pythonpath ...
  "kgdb": "models added: 2 · builtin relation types written: 11 · predicates added: 11"
$ python3 -m sldb docs create --model RelationDoc ... --name generalizes--UmlClass:client--UmlClass:person ...
  Created and tracked 'generalizes--UmlClass:client--UmlClass:person'
$ pron refresh --world .../world --pythonpath ...
  graph: 84 nodes, 78 edges, 13 relation types
$ pron check --world .../world --pythonpath ...
  ok

mundo: .../world  ·  comandos con error: 0
```

Un mundo cuyo dominio es UML se declara sin escribir código Python a mano: `sldb models create`
genera la clase `StructuredNLDoc` desde la plantilla y el YAML de campos. El módulo generado
**sí** es código, solo que lo produce el CLI. Y no alcanza para todo — probado aparte:

- un campo enum (`type: "Literal['terrace', 'indoor']"`) genera un módulo sin
  `from typing import Literal` y falla al importarse con `NameError: name 'Literal' is not defined`;
- `base: Persona` (heredar de otro modelo del mundo) genera `from sldb import Persona`, que no
  existe: la herencia entre modelos no se puede declarar por CLI;
- el generador solo escribe `__family__`, `__semantics__` y `__template__`; no hay forma de declarar
  `__containment__` ni `__references__`.

Los tres están en [`../huecos.md`](../huecos.md). Afectan a la opción A (un enum o una generalización
en el esquema del mundo) más que a la opción B, donde "clase" y "generalización" son datos.

## Aplicación a `pron` y `graph_ui`

- El vocabulario visual necesita un campo que diga a qué nivel aplica cada mapeo: **tipos** (modelos,
  `RelationTypeDoc`) o **instancias** (documentos, `RelationDoc`). Un mismo vocabulario (diagrama de
  clases) sirve para las dos opciones.
- La vista Schema de `graph_ui` es la opción A sin decirlo; KB y Flujo trabajan en el nivel de
  instancias. Hacer explícito el nivel es parte de pasar de proyectar a representar.
- `kgdb` ya resolvió lo difícil (tipos como documentos, validados al ingerir). Un vocabulario puede
  apoyarse en eso para la opción B sin pedir nada nuevo al backend; está por verse cuánto de la
  opción A se puede editar sin tocar `models_service`.

## Fuentes

- OMG, *Meta Object Facility (MOF) Core Specification*: https://www.omg.org/spec/MOF/
- C. Atkinson, T. Kühne, *Model-Driven Development: A Metamodeling Foundation*, IEEE Software
  20(5), 2003, pp. 36–41.
- A. Laarman, I. Kurtev, *Ontological Metamodeling with Explicit Instantiation*, SLE 2009, LNCS
  5969, pp. 174–183, §2 y fig. 1: https://ris.utwente.nl/ws/files/5386011/laarman_kurtev_09.pdf
- `kgdb`, `src/kgdb/models/relation_type_doc.py`; `pron`, `tests/worlds/restaurant.py`.
