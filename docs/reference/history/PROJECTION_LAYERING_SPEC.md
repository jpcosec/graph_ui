# Projection Layering — sldb, kgdb y la sobrecapa de proyección

Estado: draft. Documenta el modelo de capas que resuelve la proyección de
grafos sobre conocimiento estructurado, y cómo `graph_ui` se posiciona como
la sobrecapa reusable. Referencia hermana: `PROJECTION_GRAMMAR_SPEC.md`
(gramática concreta). Este documento fija los **roles y fronteras** entre
capas; el otro fija la **sintaxis** de las lentes.

---

## 0. Tesis en una frase

El átomo `sldb` es dato puro; `kgdb` lo materializa como grafo canónico
tipado; la sobrecapa de proyección (graph_ui / spec2viz) mapea ese grafo a
lentes visuales. Cada capa ignora deliberadamente lo que hace la de arriba.

```
sldb        átomo tipado (dato + campos)            "qué es"
   │  ingest: sldb_semantic_export_to_snapshot
   ▼
kgdb        grafo materializado (nodos + edges)     "cómo se conecta"
   │  proyección declarativa (gramática)
   ▼
sobrecapa   lente / vista (filtro, encoding, layout) "cómo se ve"
```

---

## 1. El problema que motiva las capas

### 1.1 Cómo se resuelve hoy (anti-patrón observado)

En `gemini_test/frontends` la proyección está resuelta con **lentes estáticos
server-side**: un endpoint Python por vista, cada uno reconstruyendo su propio
grafo a mano desde los átomos `sldb`.

| Vista | Endpoint | Proyecta usando | Mecanismo |
|---|---|---|---|
| taxonomy / mindmap | `/api/taxonomy` | tags jerárquicos (`domain:pizzeria.carta`) | parseo de tags → árbol anidado, `MODEL_MAP` hardcodeado de 11 tipos |
| embeddings | `/api/viz/graph` | campo `embedding` (768-dim) | PCA→2D + edges por similitud coseno sobre umbral |
| flow | `/api/flow` | campos `allowed_transitions`, `grounding_atoms` | export de relaciones a nodos/edges |

Las tres leen **los mismos átomos** y difieren solo en qué campo interpretan
como estructura de grafo. Ninguna comparte código de proyección; cada una
re-parsea campos del modelo a mano.

Esto es exactamente el anti-patrón que graph_ui ya nombró en sus atoms:

- `atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection`
- `atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary`
- `atom-the-projection-grammar-belongs-in-graph-ui-not-sldb`

### 1.2 Por qué es frágil

- Cada vista nueva = código server-side nuevo.
- La lógica de grafo vive dispersa en endpoints, no en un contrato.
- Tres proyectores = tres contratos node/edge incompatibles
  (`atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem`).
- No hay reuso entre proyectos: gemini_test reinventa lo que graph_ui quiere
  ofrecer genérico.

---

## 2. Capa 1 — sldb: el dato

### 2.1 Rol

`sldb` es la **capa de datos/documentos**. Un átomo es un `StructuredNLDoc`:
Markdown legible ↔ objeto tipado, reversible sin pérdida vía render/extract.

### 2.2 El modelo sldb como schema del dominio

Cada modelo (`ConversationStep`, `DomainAtom`, `ToolAtom`, …) define tres
cosas simultáneamente:

1. **`__semantics__` + `__family__`** — identidad taxonómica.
   ```python
   __family__ = "conversation"
   __semantics__ = {"type": ["knowledge", "step"], "workspace": ["knowledge"]}
   ```
   De aquí sale el eje de selección `type.knowledge.step`. El modelo genera su
   propio tag de tipo; el reader selecciona por ese eje.

2. **`__template__`** — el render Markdown reversible.
   Marcadores `⸢rev•campo⸥` marcan los puntos de ida/vuelta entre `.md` y
   objeto tipado.

3. **Los `Field(...)`** — el contrato de datos.
   Ej. en `ConversationStep`: `kind: StepKind` (enum), `allowed_transitions`,
   `grounding_atoms`, `required_slots`, `tool_ref`, `domain_ref`.

### 2.3 Clave: las relaciones ya están declaradas en los campos

El átomo **no es plano**: campos como `allowed_transitions: "booking, onboarding"`
o `grounding_atoms: "atom-x, atom-y"` son aristas **implícitas** expresadas
como texto. El grafo ya vive en el dato; falta materializarlo.

### 2.4 Frontera dura

`sldb` **no sabe de proyección, ni de grafo, ni de encoding.** Es el guardrail
`atom-the-projection-grammar-belongs-in-graph-ui-not-sldb`. Meter semántica de
grafo dentro del modelo sldb sería contaminar la capa de datos.

---

## 3. Capa 2 — kgdb: el grafo canónico

### 3.1 Rol

`kgdb` es la **materialización del grafo**. Toma el export semántico de sldb y
lo convierte en un `GraphSnapshot` tipado y neutral. Es el nivel intermedio:
resuelve las relaciones que el átomo declara implícitamente y las vuelve
aristas navegables.

### 3.2 El contrato (`kgdb/contracts`)

- `KnowledgeNode` — identidad (`SystemIdentity{node_id, node_type}`), `edges`,
  y facetas opcionales (`semantics`, `ast`, `io_ports`, `compliance`, `adr`,
  `test_map`, `git`, `source`).
- `Edge` — `target_id` + `relation_type` (`VocabularyTerm`, token de relación
  definido aguas abajo).
- `GraphSnapshot` — `version`, `nodes[]`, `metadata`.

### 3.3 La ingesta (`kgdb/ingest/sldb.py`)

`sldb_semantic_export_to_snapshot(payload)` construye el grafo canónico:

| Fuente sldb | Nodo kgdb | Aristas producidas |
|---|---|---|
| store | `sldb://store` (`node_type=sldb_store`) | `has_model` → cada modelo |
| tag semántico | `_semantic_tag_node` | `semantic_parent`, `semantic_equivalent` |
| modelo (ConversationStep…) | `_model_node` | (agrupa documentos) |
| documento (átomo) | `_document_node` | a modelo, a tags, a secciones |
| sección | `_section_node` | — |

Contrato de entrada: `sldb_kgdb_semantic_export` v1 (validado en
`_validate_contract`). Provenance completa (`store.root`, `store_path`,
`hash_a`, `runtime_sources`) viaja en cada nodo.

### 3.4 Por qué kgdb es lo que hace posible el reuso

- El átomo dice `allowed_transitions` como texto → kgdb lo vuelve `Edge` real.
- Sin kgdb, cada proyector re-parsea campos a mano (el anti-patrón §1.1).
- graph_ui opera sobre `GraphSnapshot`, **no sobre modelos de dominio**: por
  eso puede ser genérico y no atado a gemini_test.
- Los tres contratos incompatibles (§1.2) convergen aquí: `GraphSnapshot` es
  el único contrato node/edge.

### 3.5 Frontera dura

`kgdb` aporta el **grafo neutral**; no decide color, layout ni filtro. El
guardrail es `pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb`.

---

## 4. Capa 3 — la sobrecapa de proyección

### 4.1 Rol

La sobrecapa (graph_ui / spec2viz) mapea el `GraphSnapshot` de kgdb a **lentes
visuales declarativas**: filtro (primario), encoding (secundario), layout.

### 4.2 No es superclase, es sobrecapa

Distinción central:

- **Superclase** (herencia, debajo del átomo) → mezclaría semántica de grafo
  dentro del modelo de dominio. Rechazado: viola §2.4.
- **Sobrecapa** (interpretación, encima del grafo) → lee nodos/edges y los
  *interpreta*. sldb y el modelo quedan intactos.

La sobrecapa **no extiende el átomo, lo mapea.** El mismo átomo/nodo alimenta N
lentes sin saber de ninguna.

### 4.3 Qué lee la sobrecapa

Lee **kgdb**, no sldb directo. Solo sabe de `KnowledgeNode` / `Edge` /
facetas. No conoce `ConversationStep` ni ningún modelo de dominio. Esa
ignorancia deliberada es lo que la vuelve reusable entre proyectos.

### 4.4 La gramática (detalle en PROJECTION_GRAMMAR_SPEC.md)

Un encoding es "campo/faceta X del nodo → color / posición / arista / tamaño".
Filtrado es el mecanismo primario de proyección; encoding es secundario
(`atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary`).
Las vistas guardadas referencian nombres de faceta/relación, nunca ids
literales de nodo
(`atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids`).

### 4.5 El schema registry

Para que las lentes sean declarativas y no hardcodeadas, la sobrecapa necesita
conocer qué facetas/relaciones existen. Ese es el rol de `atom-schemaregistry`
en graph_ui: el registro de tipos derivado (en última instancia) de los
`__semantics__` de los modelos sldb, transportado por kgdb como
`node_type` / `relation_type` / facetas. El registry es el contrato compartido
que alimenta el mapeo declarativo.

---

## 5. Cómo colapsa el anti-patrón

Las tres vistas bespoke de gemini_test dejan de ser código y pasan a ser
configuración sobre la misma máquina:

| Vista | Hoy (server-side) | Objetivo (lente declarativa sobre kgdb) |
|---|---|---|
| taxonomy | parseo de tags en `/api/taxonomy` | filtro por `semantic_parent` + layout jerárquico |
| embeddings | PCA + coseno en `/api/viz/graph` | encoding de posición por faceta `embedding` + edges por similitud |
| flow | export de transiciones en `/api/flow` | filtro por `relation_type=flows_to` + layout dirigido |

```
gemini_test hoy:  sldb → [3 proyectores Python ad-hoc] → 3 vistas
objetivo:         sldb → kgdb (grafo canónico) → sobrecapa declarativa → N vistas
```

Consecuencia: graph_ui se vuelve el **editor/visualizador canónico de kgdb**;
gemini_test pasa de dueño de sus editores bespoke a **consumidor** de graph_ui.
Los frontends `flow_editor` y `taxonomy` de gemini_test quedan jubilados a
favor de lentes sobre la misma sobrecapa.

---

## 6. Resumen de fronteras (contrato de capas)

| Capa | Sabe de | NO sabe de | Guardrail |
|---|---|---|---|
| sldb | dato tipado, tags, template reversible | grafo, proyección, encoding | projection grammar no vive en sldb |
| kgdb | nodos, edges, facetas, provenance | color, layout, filtro | encoding/layout no viven en kgdb |
| sobrecapa | filtro, encoding, layout | modelos de dominio concretos | lee kgdb, no sldb; referencia facetas, no ids |

Regla de oro: cada capa ignora lo que hace la de arriba. La ignorancia es la
que garantiza el reuso.

---

## 7. El núcleo sldb + kgdb y sus instancias

La consecuencia arquitectónica del layering: **sldb + kgdb dejan de ser
herramientas entre otras y pasan a ser el núcleo del ecosistema.** Todo lo
demás es una *instancia de dominio* montada encima de ese núcleo.

### 7.1 El núcleo

```
sldb   → contenido + relación (autoría, dato tipado, StructuredNLDoc)
kgdb   → ensamblado del grafo (nodos ∪ aristas → GraphSnapshot)
```

El núcleo no conoce ningún dominio concreto. Ofrece: modelar documentos,
autorar relaciones, ensamblar el grafo. Nada más.

### 7.2 Los proyectos como instancias

Cada proyecto deja de ser una app autónoma y pasa a ser un **conjunto de
modelos de dominio (contenido + relación) + una sobrecapa de vista** sobre el
mismo núcleo. Varios ya se autodescriben así:

| Proyecto | Rol como instancia | Qué aporta al núcleo | Qué NO reimplementa |
|---|---|---|---|
| **deskops** | instancia de dominio de *workflow* | modelos workflow (task, pill, ritual, atom), materializadores | infraestructura de documentos: la delega a sldb |
| **spec2viz** | instancia de *rendering* | IR de diagramas + renderers (PlantUML, Mermaid, Vega) como sobrecapa | verdad semántica: vive upstream en sldb |
| **knowledge** (KB conversacional de gemini_test) | instancia de *dominio conversacional* | modelos de conocimiento (ConversationStep, DomainAtom, ToolAtom…) + relaciones de flujo | almacenamiento/consulta: usa sldb; grafo: usa kgdb |

Evidencia de auto-descripción ya presente:

- `deskops/README.md`: *"Workflow-domain instance built on top of sldb… owns
  the operational surfaces that should not live inside generic sldb
  infrastructure."*
- `spec2viz/README.md`: *"the human-watchable rendering layer over canonical
  semantics… semantic truth belongs upstream."*
- `knowledge_base` de gemini_test: sus 11 modelos son `StructuredNLDoc` de sldb;
  su grafo se ingiere vía `kgdb/ingest/sldb.py`.

### 7.3 El patrón de instancia

Una instancia de dominio = exactamente tres piezas, todas encima del núcleo:

```
1. Modelos de contenido   (sldb)  → los tipos del dominio
2. Modelos de relación    (sldb)  → la topología del dominio
3. Sobrecapa de vista     (graph_ui / spec2viz / materializadores) → cómo se ve
```

Todo lo demás — almacenamiento, consulta, edición reversible, ensamblado de
grafo, integridad — **lo provee el núcleo, no la instancia.** Una instancia
nueva no escribe infraestructura: declara modelos y monta una sobrecapa.

### 7.4 Consecuencia

- **No más reimplementación.** deskops no reinventa storage; spec2viz no
  reinventa semántica; knowledge no reinventa grafo. Cada uno declara dominio
  y consume núcleo.
- **graph_ui es la sobrecapa genérica del núcleo**, no una app más: el
  visor/editor de cualquier `GraphSnapshot`, sea cual sea la instancia que lo
  produjo.
- **El ecosistema se vuelve radial:** sldb+kgdb al centro; deskops, spec2viz,
  knowledge, graph_ui como radios. Un cambio en el núcleo se propaga a todas
  las instancias; un dominio nuevo se agrega sin tocar el núcleo.

```
                deskops (workflow)
                      │
   spec2viz ──── sldb + kgdb ──── knowledge (conversacional)
   (rendering)     NÚCLEO                │
                      │            graph_ui (editor de grafo)
                 (más instancias)
```

---

## 8. Preguntas abiertas

- ¿La sobrecapa vive dentro de graph_ui o como paquete propio que tanto
  gemini_test como graph_ui montan?
- ¿El schema registry se deriva en build-time desde `__semantics__` sldb, o
  se descubre en runtime desde el `GraphSnapshot`?
- ¿spec2viz y graph_ui comparten la misma implementación de sobrecapa o solo
  el contrato?
- Convergencia de los tres contratos node/edge: ¿migración forzada a
  `GraphSnapshot` o capa de adaptadores por contrato legado?
- Si todas las instancias comparten núcleo, ¿el schema registry (§4.5) es
  único y global, o uno por instancia de dominio?
- ¿Dónde vive el catálogo de instancias — hay un manifiesto que declare
  "estos son los dominios montados sobre el núcleo"?
