# Knowledge Workbench — diseño

Superficie de edición sobre SLDB. **Texto primero, grafo al final.**

Estado: diseño acordado, sin implementar. Se construye con datos mock,
desconectado de la API. La conexión viene después.

---

## 1. El modelo mental

Tres capas. No es jerarquía de autoridad: son tres cosas distintas.

| | Qué es | Forma | Se edita |
|---|---|---|---|
| **Fuente** | correo, acta, PDF, WhatsApp | prosa sin estructura | no — es evidencia |
| **Conocimiento** | atoms + relaciones tipadas | grafo | **sí, acá se cura** |
| **Documento** | composiciones de atoms | texto estructurado | no — es derivado |

Entre fuente y conocimiento hay un acto: **anclar**. Marcar un tramo de texto y
decir "esto es un hecho". Eso es `AnchorDoc`.

### Lo que costó entender (y no hay que volver a perder)

**Markdown y store tienen la misma información.** El modelo define una biyección:

```
render(payload)   -> markdown
extract(markdown) -> payload
```

El `__template__` ES esa biyección; los marcadores `⸢rev•campo⸥` son reversibles.
`render_checked` no impone el payload sobre el texto: verifica que la biyección se
cumpla. Si falla, el error es literal `broke idempotency`.

No preguntar "cuál de los dos manda". Si divergen, hay un bug o un índice stale, y
`stores check` lo diagnostica con el par `hash_c` (texto) / `hash_d` (payload):
texto que se mueve con campos quietos = reformateo; campos que se mueven = cambio
real.

**Hay dos ejes, no uno.** Vertical: modelo → documento → campo. Horizontal:
relaciones tipadas entre documentos (`RelationTypeDoc` / `RelationDoc`), con
análisis networkx encima. Una relación NO es un campo escondido en el contenido:
es su propio documento, con motivo propio, versionable y consultable.

---

## 2. Las tres reglas

1. **Un hecho, un lugar.** Si está dos veces es duplicado — la similaridad lo detecta.
2. **Todo atom tiene origen.** Sin provenance no es conocimiento, es opinión.
3. **Los documentos son consultas, no archivos.** Por eso no envejecen.

---

## 3. Base técnica

### Qué copiamos

`tools/graph_ui/apps/review-workbench` ya es el patrón pedido: React + Vite,
fixtures mock validadas con zod, cero API.

| Pieza | Uso |
|---|---|
| `mock/client.ts` | fixtures + `delay()` + validación zod — **el patrón entero** |
| `components/ui/*` | shadcn ya instalado (~20 componentes) |
| `components/layouts/AppShell.tsx` | nav lateral de íconos |
| `KnowledgeGraph.tsx` | React Flow + dagre andando (para la fase 6) |
| `PropertyEditor`, `EntityCard` | edición de propiedades |

### Librerías: todas pagadas menos una

| Necesidad | Librería | Estado |
|---|---|---|
| Grafo | `@xyflow/react` + `dagre`/`elkjs` | ya instalado |
| UI | Radix + Tailwind + shadcn | ya instalado |
| Estado | `zustand` | ya instalado |
| Async | `@tanstack/react-query` | ya instalado |
| Validación | `zod` | ya instalado |
| Command palette | `cmdk` | ya instalado |
| Toasts | `sonner` | ya instalado |
| **Editor estructural** | `prosemirror-*` | **falta** |

El schema PM (`sldb_section`, `sldb_field`, `sldb_readonly`) ya está escrito en
`tools/sldb-ui/src/lib/pm/schema.ts` y se reusa.

### Por qué mock primero

No es prudencia: el mock obliga a definir el contrato sin esconderse detrás de lo
que la API ya devuelve. Diseñar contra `/document/ir` produce un visor de IR —
que es exactamente el error cometido en los intentos anteriores.

---

## 4. Contrato de datos

Cinco tipos. Es lo único que hay que acordar bien: después se conecta contra esto.

```ts
Source   { id, path, text, anchoredRanges[] }
Atom     { id, title, answer, tags[], provenance{sourceId, range} }
Relation { id, type, from, to, motive }     // vocabulario: flows_to, grounded_by
Doc      { id, title, sections[{heading, binding}] }
Binding  = { kind:'list', atomIds[] } | { kind:'query', tags[], relatedTo? }
Draft    { id, text, suggestions[] }
```

`Binding` es la decisión de diseño central: un documento **declara qué mostrar**,
no contiene texto.

---

## 5. Las vistas

### 5.1 LECTOR — anclar sobre texto crudo

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◂ fuentes    RE_ Propuesta Solución MEPU.pdf          ▓▓▓▓▓░░░ 62% anclado │
├──────────────────────────────────────────┬─────────────────────────────────┤
│                                          │  SELECCIÓN                      │
│  ...el cliente manifiesta que no será    │  ┌───────────────────────────┐  │
│  posible una conexión directa a SAP.     │  │ "no será posible una      │  │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │  │  conexión directa a SAP"  │  │
│ ┃ La integración será vía archivos     ┃  │  └───────────────────────────┘  │
│ ┃ planos depositados en un directorio  ┃◂─┤  línea 47-48                   │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │                                 │
│  compartido. ⟦atom-mepu-architecture⟧    │  ╭─ convertir en hecho ───────╮ │
│                                          │  │ título                     │ │
│  El plazo de aceptación de una orden     │  │ ┌────────────────────────┐ │ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │ │MEPU: sin conexión SAP  │ │ │
│ ░es de 24 horas hábiles desde que ░░░░   │  │ └────────────────────────┘ │ │
│ ░░aparece en Mercado Público.░░░░░░░░░   │  │ tags                       │ │
│                                          │  │ [constraint:it-security ×] │ │
│  Respecto al stock, se debe cruzar       │  │ [+ agregar]                │ │
│  contra el maestro de materiales...      │  │                            │ │
│                                          │  │ ╭ sugeridos ─────────────╮ │ │
│                                          │  │ │ ◇ system:lab-chile     │ │ │
│                                          │  │ │ ◇ service:mercadopub.  │ │ │
│                                          │  │ ╰────────────────────────╯ │ │
│                                          │  │                            │ │
│                                          │  │   [ anclar ]   [ cancelar ]│ │
│                                          │  ╰────────────────────────────╯ │
│                                          │                                 │
│                                          │  ⚠ parecido a un hecho que ya  │
│                                          │    existe:                      │
│                                          │    › no-sap-direct-constraint   │
│                                          │      [ver] [es el mismo]        │
└──────────────────────────────────────────┴─────────────────────────────────┘
  ┏━┓ anclado   ░░░ seleccionado   texto normal = sin extraer
```

```
Lector
├── SourcePicker          lista de fuentes + % anclado
├── SourceText            texto inmutable
│   └── AnchorOverlay     tramos ┏━┓ + chip ⟦atom-id⟧ + click → vista Atom
└── AnchorPanel           (aparece al seleccionar)
    ├── SelectionQuote    cita + línea exacta → provenance
    ├── AtomDraftForm     título, tags, sugeridos
    └── DuplicateWarning  similaridad contra atoms existentes
```

La barra de % anclado es la métrica del trabajo: cuánto de la fuente ya es
conocimiento.

### 5.2 ATOM — el hecho en foco

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◂ volver                                            atom-mepu-architecture │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  MEPU architecture: file-based, no SAP connection                    ✎     │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                            │
│  La integración con SAP será vía archivos planos depositados en un         │
│  directorio compartido. No habrá conexión directa por restricción de       │
│  seguridad TI del cliente.                                           ✎     │
│                                                                            │
│  [system:lab-chile] [service:mercadopublico] [constraint:it-security]      │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │  ORIGEN  │  RELACIONES (3)  │  USOS (2)                                │ │
│ ├──────────┴──────────────────┴────────────────────────────────────────  │ │
│ │                                                                        │ │
│ │  RE_ Propuesta Solución MEPU.pdf · línea 47                            │ │
│ │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│ │  │ ...el cliente manifiesta que no será posible una conexión        │  │ │
│ │  │ ▓La integración será vía archivos planos depositados en un▓      │  │ │
│ │  │ ▓directorio compartido.▓                                         │  │ │
│ │  └──────────────────────────────────────────────────────────────────┘  │ │
│ │                                            [abrir en el Lector ▸]      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

Pestaña RELACIONES — cada arista con su motivo, porque es un documento:

```
│  ──grounded_by──▸  atom-no-sap-direct-constraint                          │
│     "restricción original del área de seguridad"                      ✎   │
│                                                                           │
│  ◂──flows_to────  atom-mepu-target-automation-scope                       │
│     "el alcance depende de esta decisión"                                 │
│                                                                           │
│  ──constrains──▸  atom-mepu-sap-finanzas-order-flow                       │
│                                                        [+ relacionar]     │
```

Pestaña USOS — el aviso de impacto:

```
│  Este hecho aparece en 2 documentos:                                      │
│    › Visión general        → "Alcance acordado"       [ir]                │
│    › Acuerdos y decisiones → "Decisiones con cliente" [ir]                │
│                                                                           │
│  ⚠ editarlo cambia los dos.                                               │
```

```
AtomView
├── AtomHeader        título editable
├── AtomBody          contenido editable ── lo único que se edita de verdad
├── TagBar
└── Tabs
    ├── OriginTab     fuente + tramo resaltado
    ├── RelationsTab  aristas tipadas, con motivo editable
    └── UsagesTab     composiciones que lo citan
```

### 5.3 COMPOSITOR — armar un documento sin escribirlo

```
┌────────────────────────────────────────────────────────────────────────────┐
│ MEPU · Visión general                                    [previsualizar ▸] │
├───────────────────┬────────────────────────────────────────────────────────┤
│ SECCIONES         │                                                        │
│                   │  ## Objetivo del proyecto                              │
│ ▸ Objetivo      2 │  ╭────────────────────────────────────────────────╮    │
│ ▸ Alcance       2 │  │ ⠿ MEPU: alcance objetivo de automatización     │    │
│ ▸ Contexto      1 │  │   Procesar órdenes desde Mercado Público,      │ ⊗  │
│                   │  │   cruzarlas con stock y generar insumos SAP.   │    │
│ [+ sección]       │  ╰────────────────────────────────────────────────╯    │
│                   │  ╭────────────────────────────────────────────────╮    │
│                   │  │ ⠿ Objetivo central de la integración           │ ⊗  │
│ ─────────────     │  ╰────────────────────────────────────────────────╯    │
│ FUENTE            │              [+ agregar hecho]                         │
│                   │                                                        │
│  ◉ lista          │  ## Alcance acordado                    ⟨por consulta⟩ │
│  ○ consulta       │  ╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╮     │
│                   │  ┆ tags: [constraint:*]  relacionado-con: mepu   ┆     │
│  esta sección     │  ┆ ───────────────────────────────────────────── ┆     │
│  lista hechos     │  ┆ 4 hechos, actualizado solo                    ┆     │
│  explícitos       │  ┆  · sin conexión directa a SAP                 ┆     │
│                   │  ┆  · PDFs en carpetas aceptadas/rechazadas      ┆     │
│                   │  ┆  · aceptación sólo tras entrega SAP           ┆     │
│                   │  ┆  · semáforo de vencimiento                    ┆     │
│                   │  ╰ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╯     │
└───────────────────┴────────────────────────────────────────────────────────┘
   ⠿ arrastrar    ⊗ sacar (no borra el hecho)   ╭─╮ lista   ╭┄╮ consulta
```

La diferencia que importa:

```
  ╭─────────╮  LISTA      yo elijo qué va          se queda quieto
  ╭┄┄┄┄┄┄┄┄┄╮  CONSULTA   el sistema decide        crece solo
```

```
Compositor
├── SectionList       navegación + contador
├── BindingSwitch     lista ⇄ consulta ── la decisión de diseño
├── Canvas
│   └── SectionBlock
│       ├── ListBinding    bloques arrastrables, ⊗ = quitar del doc
│       └── QueryBinding   criterio + preview en vivo
└── PreviewButton     → render final
```

`⊗` saca del documento, **no borra el hecho**. Ese matiz es el que hoy no existe y
hace que nadie borre nada por miedo.

### 5.4 BANDEJA — lo que anotaste sin saber dónde va

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Bandeja                                                    3 sin ubicar    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ╭──────────────────────────────────────────────────────────────────────╮   │
│ │ "el semáforo de vencimiento lo definieron en la reunión del 12,      │   │
│ │  quedó en 3 días pero hay que confirmarlo con Patricia"              │   │
│ │  escrito hace 2 días                                            ✎ ⊗  │   │
│ ├──────────────────────────────────────────────────────────────────────┤   │
│ │  se parece a:                                                        │   │
│ │   ▸ atom-mepu-expiry-semaphore-rule            87% ─ [es el mismo]   │   │
│ │   ▸ atom-order-lifecycle-sla-timing            41%                   │   │
│ │                                                                      │   │
│ │  iría en:                                                            │   │
│ │   ▸ Acuerdos › Reglas de negocio confirmadas   [ubicar acá]          │   │
│ │   ▸ Bloqueos › Preguntas abiertas              [ubicar acá]          │   │
│ │                                                                      │   │
│ │                        [ convertir en hecho ]  [ descartar ]         │   │
│ ╰──────────────────────────────────────────────────────────────────────╯   │
│                                                                            │
│ ╭──────────────────────────────────────────────────────────────────────╮   │
│ │ "revisar si el flujo de cautela aplica a órdenes parciales"          │   │
│ │  escrito hace 5 horas                                           ✎ ⊗  │   │
│ ├──────────────────────────────────────────────────────────────────────┤   │
│ │  sin parecidos · sin destino claro                                   │   │
│ ╰──────────────────────────────────────────────────────────────────────╯   │
│                                                                            │
│                        [ + anotar algo ]                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

Las sugerencias no son magia: **similaridad** para los parecidos, **vecindad** para
el destino. Análisis networkx que ya existe en `store/graph/analysis/`.

```
Bandeja
└── DraftCard[]
    ├── DraftText         texto libre, editable
    ├── SimilarAtoms      → "es el mismo" fusiona
    ├── SuggestedHomes    → "ubicar acá" crea atom + lo mete en la sección
    └── Actions           promover · descartar
```

### 5.5 SALUD

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Salud del conocimiento                                    ⬤ 2 problemas    │
├────────────────────────────────────────────────────────────────────────────┤
│  ⬤  DIVERGENCIA                                                            │
│      2 documentos difieren entre el texto y el índice.                     │
│      › domain-cobranza-canal   texto cambió, campos no  → reformateo       │
│      › step-cobranza-respuesta campos cambiaron         → cambio real      │
│                                                        [reindexar]         │
│                                                                            │
│  ⬤  SIN ORIGEN                                                             │
│      3 hechos sin provenance. No se puede auditar de dónde salieron.       │
│                                                                            │
│  ◯  AISLADOS                                                               │
│      7 hechos sin ninguna relación.                                        │
│                                                                            │
│  ◯  CIRCULARES                                                             │
│      ninguno.                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

La distinción "texto cambió / campos cambiaron" sale del par `hash_c`/`hash_d`,
que ya calcula `stores check`.

### 5.6 GRAFO — al final

Los atoms como nodos, las relaciones como aristas tipadas. Usa lo que ya existe en
networkx: centralidad (qué hechos sostienen todo), componentes (islas que no se
hablan), ciclos (razonamiento circular), aislados, similaridad (duplicados).

Postergado por decisión explícita: primero la superficie de texto.

---

## 6. Navegación

```
        ┌──────────┐
        │  LECTOR  │  texto crudo ──anclar──┐
        └──────────┘                        │
                                            ▼
    ┌──────────┐                      ┌──────────┐
    │ BANDEJA  │──promover───────────▸│   ATOM   │
    └──────────┘                      └──────────┘
                                            │
                                      se compone
                                            ▼
                                     ┌─────────────┐
                                     │ COMPOSITOR  │
                                     └─────────────┘
```

Todo camino llega al Atom. **Nadie edita un documento.**

---

## 7. Orden de construcción

| # | Vista | Por qué |
|---|---|---|
| 1 | **Atom** | es el centro; sin esto nada tiene a dónde llegar |
| 2 | **Lector** | de acá nace el conocimiento |
| 3 | **Compositor** | acá se prueba lista vs consulta |
| 4 | **Bandeja** | necesita que 1 y 3 existan |
| 5 | Salud | diagnóstico, va al final |
| 6 | Grafo | postergado |

---

## 8. Conexión (después)

| Vista | Contra qué | Existe |
|---|---|---|
| Atom | `/document/ir` + `/edges/node` | sí |
| Lector | crear `AnchorDoc` | modelo sí, flujo no |
| Compositor (lista) | `__compositions__` | sí, pero **una sola vía** |
| Compositor (consulta) | — | **no implementado** |
| Bandeja | `/graph/neighborhood` + `/find` | sí |
| Salud | `stores check` + `/graph/cycles` | sí |
| Grafo | `/graph/*` + `/edges` | sí |

### Los dos huecos reales en SLDB

1. **Edit-through sobre composición.** `composition_modes.md`: *"There is no
   implemented edit-through operation from a summary to its child document."*
   La composición hoy es de ida: `compose_field` renderiza hacia afuera y no hay
   camino de vuelta desde el texto compuesto hacia el atom.

2. **Composición por consulta.** `source_field` exige una lista explícita de rutas.
   No se puede declarar "todos los atoms con tag `constraint:*`". Está marcado
   como propuesta no implementada.

Las dos se diseñan completas en mock antes de tocar SLDB.

---

## 9. Fricciones conocidas

- Los 25 modelos de `knowledge_antonia-cobranza` tienen `path:` apuntando a
  `/home/user/chatbotsknowledgebases/…` (otra máquina). Resolver por `model_ref`,
  nunca por `path`.
- `sldb ast show` imprime un warning antes del JSON: filtrar desde `^{`.
- `models show`, `models template show` y `docs update` **no** aceptan
  `--format json`. Preferir la API HTTP sobre el CLI.
- Sin id estable de sección: se direccionan por slug posicional y los headings
  repetidos se desambiguan por orden de aparición. Mover rompe direcciones.
  El binding por lista de atom ids evita el problema; no reintroducirlo.

---

## 10. Estado — implementado

Las 5 vistas funcionan sobre mock. **26 tests verdes.** Cero errores de consola.

```
npx vite --port 5180      # http://127.0.0.1:5180/
npx vitest run
```

| Vista | Estado | Verificado con |
|---|---|---|
| Lector | ✅ | anclar sube 30% → 36%; duplicado detectado al 88% |
| Hecho | ✅ | 3 pestañas; "editarlo cambia los 2" |
| Compositor | ✅ | lista (sólido) vs consulta (punteado, "se actualiza solo") |
| Bandeja | ✅ | similares + destinos sugeridos; promover |
| Salud | ✅ | 5 chequeos; reacciona a los cambios |
| Grafo | ⏸ | postergado por decisión |

### Decisión técnica: containment, no Jaccard

Jaccard colapsa al comparar una cita corta contra un atom largo — el largo del
atom lleva el puntaje a cero aunque la cita sea textual. Para selección-contra-
contenido se usa **overlap coefficient** (`containment`), asimétrico. Jaccard
queda solo para duplicados entre atoms, donde ambos lados son comparables.

Hay un test que fija la diferencia.

### Estado real del flujo completo

Anclar → el % sube → el hecho aparece con su provenance → Salud lo registra.
Probado end-to-end en el navegador, no solo en tests.

### Lo que falta

- Conectar contra SLDB (§8)
- Edit-through y composición por consulta: los dos huecos reales
- Vista de grafo

---

## 11. Conexión a SLDB — hecho

`src/api/sldb.ts` traduce las formas del store al contrato. Capa de traducción,
no passthrough: filtrar las formas de SLDB hacia las vistas lo devuelve a ser un
visor de IR.

```bash
# store real con los atoms MEPU
cd /home/jp/AntonIA/projects/teva/MercadoPublico
python3 -m sldb serve --store .sldb --pythonpath /home/jp/AntonIA --port 8810 --cors

cd .../knowledge-workbench && npx vite --port 5180   # proxy /sldb -> 8810
```

Toggle `demo | sldb` arriba a la derecha. Con `sldb` carga **60 hechos reales**.

### Lo que se descubrió conectando

**1. `sldb serve` no tiene ruta de listado.** `/models/detail` devuelve solo el
contrato; `/find` con query vacía responde **HTTP 400**. La vía es el índice
semántico: todo documento lleva los `__semantics__` de su modelo como tags, así
que `/find?q=type.knowledge.atom&in=semantic` enumera sus documentos. Devuelve
938 hits para 64 documentos (secciones y campos generan hit aparte), hay que
deduplicar.

**2. Rutas reales:** `/document?id=<name>` (no `/docs/`), `/document/ir`,
`/edges?from=`, `/models`, `/find`, `/stores/check`, `/save`.

**3. El grafo MEPU tiene 583 nodos y CERO aristas.** Los atoms existen, las
relaciones no: `knowledge_graph.kg.json` las trae vacías. Por eso la pestaña
Relaciones sale en 0 contra el store real. No es un bug de la UI.

**4. Los 60 atoms salen "sin origen".** `provenance` en SLDB es una ruta en texto
libre, no un rango de offsets. Un span real sólo existe una vez anclado el texto.
Antes que inventarlo, se guarda en `provenanceHint` y Salud lo reporta — que es
exactamente el hueco que el Lector viene a cerrar.

**5. Bug encontrado mirando:** un mismo atom cae en dos chequeos de Salud y las
keys de React chocaban. Se keyea por `check + id + índice`.

### Estados vacíos honestos

Lector y Compositor no fingen con datos del store: dicen qué falta en SLDB
(fuentes crudas; composición por consulta) y remiten a `demo` para ver el gesto.

### Lo que sigue

- `saveAtom()` está escrito con `expected` → 409, sin probar contra escritura real
- Edit-through y composición por consulta: los dos huecos de SLDB
- Vista de grafo (necesita que existan aristas primero)
