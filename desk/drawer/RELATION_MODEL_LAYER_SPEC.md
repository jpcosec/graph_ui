# Relation Model — la relación como capa sldb de primera clase

Estado: draft. Extiende `PROJECTION_LAYERING_SPEC.md`. Propone separar la
topología del contenido: introducir un **modelo de relación** content-blind,
autorado en sldb igual que el contenido, dejando a kgdb como puro ensamblador.

Referencia hermana: `PROJECTION_LAYERING_SPEC.md` (capas sldb→kgdb→sobrecapa),
`PROJECTION_GRAMMAR_SPEC.md` (gramática de lentes).

---

## 0. Tesis en una frase

La relación no es un campo escondido dentro del contenido: es su propio
modelo, ciego al contenido, autorado en sldb. El grafo es la unión de todas
las instancias de modelos de contenido (nodos) y modelos de relación
(aristas); kgdb solo las ensambla.

```
Modelo de contenido (sldb)  → QUÉ es cada cosa       (ConversationStep, DomainAtom…)
Modelo de relación (sldb)   → QUÉ conecta con qué      (flows_to, grounded_by…)  content-blind
kgdb                        → ensamblador             (unión de instancias = GraphSnapshot)
```

---

## 1. El problema que resuelve

### 1.1 Hoy: la relación vive escondida en el contenido

Un `ConversationStep` declara su topología como **texto dentro de un campo**:

```
allowed_transitions: "booking, onboarding"
grounding_atoms: "atom-x, atom-y"
tool_ref: "tool-reserva"
```

Consecuencias:

- **Acople contenido↔topología.** Reconectar el grafo obliga a editar el
  átomo. Editar el átomo arriesga mover aristas.
- **kgdb re-parsea a mano.** `ingest/sldb.py` tiene que interpretar esos
  campos-texto para materializar aristas → lógica de dominio hardcodeada en la
  capa de ensamblado.
- **Tensión de guardrail sin resolver.** ¿El vocabulario de relación
  (`flows_to`) vive en el modelo de contenido o en kgdb? Ninguna respuesta era
  limpia: la primera contamina el contenido con semántica de grafo, la segunda
  contamina kgdb con dominio.

### 1.2 El sesgo code-wiki de kgdb (contexto)

`KnowledgeNode` trae facetas fijas de su vida pasada como wiki de código
(`ast`, `git`, `test_map`, `compliance`, `adr`, `io_ports`). La ingesta sldb
ya las ignora y aplana todo en `semantics` (cajón `extra="allow"`). Ver
`PROJECTION_LAYERING_SPEC.md §3.4`. Mientras las aristas se deriven de facetas
o de campos-texto, kgdb sigue atado a un molde ajeno.

---

## 2. La propuesta: tres modelos, no dos

### 2.1 Modelo de contenido (sldb) — "¿qué es esto?"

Sin cambios respecto a hoy, con una sustracción: **deja de cargar sus
relaciones como campos-texto**. El átomo describe qué es y qué dice; no a qué
se conecta.

### 2.2 Modelo de relación (sldb) — "¿qué conecta con qué?"

Un nuevo tipo de `StructuredNLDoc`, ciego al contenido. Una instancia es una
arista autorada:

- `source_id` — id del nodo origen
- `target_id` — id del nodo destino
- `relation_type` — token de vocabulario (`flows_to`, `grounded_by`, …)
- (opcional) `direction`, `cardinality`, `constraints`, `metadata`

Content-blind: no sabe qué *es* un step ni qué *dice*. Solo que A→B con tipo T.

### 2.3 La especificación de relación también es contenido

Punto clave: un **tipo** de relación (su nombre, endpoints válidos, semántica,
dirección permitida) es en sí mismo un documento — se autora en sldb como
cualquier otro `StructuredNLDoc`. Distinguir dos niveles:

- **Spec de relación** (`RelationType`): define qué es "flows_to" — endpoints
  válidos, dirección, cardinalidad. Es contenido → vive en sldb.
- **Instancia de relación** (`Relation`): un edge concreto A→B de tipo
  "flows_to". También documento sldb, validado contra su spec.

sldb sigue siendo la **única capa de autoría**. No se rompe ningún guardrail:
tanto contenido como relación como spec-de-relación son documentos sldb.

### 2.4 kgdb — ensamblador puro

kgdb deja de "saber relaciones". Su trabajo se reduce a:

1. Tomar instancias de modelos de contenido → `KnowledgeNode`.
2. Tomar instancias de modelos de relación → `Edge`.
3. Emitir `GraphSnapshot`.

Sin re-parseo de campos-texto. Sin vocabulario de dominio hardcodeado. Puro
merge tipado.

---

## 3. El grafo como unión

```
Nodos   = { documentos de modelos de contenido }
Aristas = { documentos de modelos de relación }
Grafo   = Nodos ∪ Aristas   (ensamblado por kgdb → GraphSnapshot)
```

Regla de ignorancia extendida a nodo↔arista:

- El nodo no sabe de sus aristas (ya no las lleva embebidas).
- La arista no sabe del contenido de sus nodos (solo ids).
- kgdb no sabe del interior de ninguno (solo tipos e ids).

---

## 4. Qué resuelve de golpe

| Problema | Antes | Con modelo de relación |
|---|---|---|
| Tensión de guardrail (¿dónde vive el vocabulario?) | sin respuesta limpia | vive en su propio modelo sldb; nadie se contamina |
| Sesgo code-wiki de `KnowledgeNode` | aristas derivadas de facetas/texto | aristas autoradas; facetas quedan vestigio inerte |
| Acople contenido↔topología | editar grafo = editar átomo | reconectar sin tocar contenido; editar contenido sin mover aristas |
| kgdb con lógica de dominio | `ingest/sldb.py` re-parsea campos | kgdb = merge puro, agnóstico |
| node_type plano | `sldb_document` genérico | derivable de `__semantics__` del contenido |

---

## 5. Tensión a resolver: integridad referencial

Al separar la arista del nodo, aparece un costo que antes el campo embebido
pagaba "gratis":

- Borrar un átomo puede dejar **aristas colgando** (`source_id`/`target_id`
  apuntando a un nodo inexistente).
- Renombrar un id rompe todas las relaciones que lo referencian.

Opciones (no excluyentes):

- **Validación en el modelo de relación:** al extraer/guardar una instancia,
  verificar que ambos endpoints existen en el store.
- **Validación en el ensamblado kgdb:** al construir el `GraphSnapshot`,
  descartar o marcar aristas huérfanas (con diagnóstico, no en silencio).
- **Cascada / soft-delete:** política de qué pasa con las aristas cuando su
  nodo desaparece.

Decisión abierta: ¿la integridad la garantiza sldb (autoría) o kgdb
(ensamblado)? Probable: ambos — sldb previene, kgdb detecta.

---

## 6. Simetría resultante

- **sldb-contenido** responde *"¿qué es esto?"* — sin saber a qué se conecta.
- **sldb-relación** responde *"¿con qué se conecta esto?"* — sin abrir el nodo.
- **kgdb** responde *"¿cómo se ve el grafo completo?"* — sin abrir nodo ni arista.
- **sobrecapa** responde *"¿cómo se ve esto en pantalla?"* — sin saber de dominio.

Cuatro capas, cada una ciega al interior de la de al lado. La ignorancia
deliberada es lo que garantiza el reuso y el desacople.

---

## 7. Impacto en el layering (actualiza PROJECTION_LAYERING_SPEC.md)

El modelo de tres capas de `PROJECTION_LAYERING_SPEC.md` se refina:

```
sldb-contenido  ─┐
                 ├─→ kgdb (ensamblador) ─→ sobrecapa (lentes) ─→ vistas
sldb-relación   ─┘
```

kgdb baja de rango: ya no "materializa relaciones desde campos", solo
ensambla instancias autoradas. La inteligencia de topología sube a sldb (como
contenido autorable); la inteligencia visual queda en la sobrecapa. kgdb es el
punto neutral de encuentro.

---

## 8. Preguntas abiertas

- Forma exacta del `RelationType` (spec) vs `Relation` (instancia): ¿dos
  modelos sldb, o uno con discriminador?
- ¿Las relaciones se guardan como documentos individuales (un `.md` por arista)
  o como colecciones (un doc con muchas aristas)? Trade-off granularidad vs
  ruido de archivos.
- Migración: los campos-texto actuales (`allowed_transitions`, etc.) ¿se
  extraen automáticamente a instancias de relación, o se re-autoran?
- ¿kgdb necesita cambiar su contrato, o `Edge` + `KnowledgeNode` ya bastan para
  recibir aristas autoradas? (Probable: bastan; el cambio es en la ingesta.)
- Integridad referencial: política final (§5).
