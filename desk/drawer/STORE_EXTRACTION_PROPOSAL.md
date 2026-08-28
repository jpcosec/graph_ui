# Store genérico — infraestructura de documentos tipados, agnóstica de dominio

Estado: draft. Propone extraer `sldb/src/sldb/store/` a un **store genérico**
donde sldb deja de ser dueño y pasa a ser el primer cliente. El store no sabe
qué es un documento, cómo se serializa ni de qué dominio es: eso lo aportan
consumidores vía plugins (`Document` protocol + `Codec`).

Contexto: `PROJECTION_LAYERING_SPEC.md` (núcleo sldb+kgdb e instancias),
`RELATION_MODEL_LAYER_SPEC.md` (modelo de relación). Este documento redefine
la pieza más baja: el store como infraestructura común de todo el ecosistema.

---

## 0. Tesis

El store no es "la capa baja de sldb". Es un **motor genérico de documentos
tipados**: indexa, consulta y hashea documentos cuyo *tipo* y *formato* define
el consumidor. sldb, repopackage, deskops, knowledge son todos clientes del
mismo store. "Sirve para todo" precisamente porque no sabe para qué se usa.

```
STORE (core agnóstico):  índice + query + hash + integridad + lock
        ▲  inyectan plugins
   ┌────┴───────────────────────────────┐
 sldb        repopackage      deskops      knowledge
 {NL doc,    {contract,       {workflow,   {atom,
  Markdown}   YAML}            models}      Markdown}
```

---

## 1. Qué debe saber el store (y qué NO)

### 1.1 El core SABE de

| Responsabilidad | Qué hace |
|---|---|
| **Indexado** | catálogo de stores/modelos/documentos/secciones + DAG semántico |
| **Consulta** | queries semánticas y estructurales sobre el índice (no globbing) |
| **Hashing por capas** | hash de texto, de campos normalizados y de índice → drift trazable |
| **Integridad / lock** | consistencia del índice, locking de escritura |
| **Persistencia** | leer/escribir el catálogo y localizar documentos |

### 1.2 El core NO SABE de

- **Qué es un documento** — hoy `StructuredNLDoc`; debe ser un protocolo.
- **Cómo se serializa** — hoy Markdown reversible; debe ser un codec plugin.
- **De qué dominio es** — conversacional, workflow, repos: irrelevante al core.

Regla: el core no menciona formato ni dominio en ninguna firma pública.

---

## 2. Los plugins que aporta cada consumidor

### 2.1 `Document` (protocolo)

Reemplaza el acoplamiento directo a `StructuredNLDoc`. El core opera contra
una interfaz mínima: identidad, tags semánticos, payload de campos, path.
Cada consumidor provee su tipo concreto.

### 2.2 `Codec` (render/extract)

Reemplaza el render Markdown embebido. Un codec sabe:

- `extract(raw) -> fields` — de la representación serializada a campos tipados.
- `render(fields) -> raw` — de campos a la representación serializada.

Consumidores y sus codecs:

| Consumidor | Document | Codec |
|---|---|---|
| **sldb** | `StructuredNLDoc` | Markdown reversible (marcadores `⸢rev•⸥`) |
| **repopackage** | `IntegrationContract`, `ComposableUnit` | YAML |
| **deskops** | task / pill / ritual / atom | Markdown / materializador |
| **knowledge** | ConversationStep, DomainAtom… | Markdown reversible |

El hashing semántico (`hash_fields`) funciona para todos: opera sobre los
campos extraídos por el codec, no sobre el formato. Por eso separa "cambió el
significado" de "cambió el formato" en cualquier consumidor.

### 2.3 `resolve_model_ref` (ya inyectable)

Ya se pasa como callable en `load_runtime_documents(..., resolve_model_ref)`.
Es el patrón correcto que debe generalizarse a `Document` y `Codec`.

---

## 3. Estado actual y acoplamientos a romper

- Ubicación: `sldb/src/sldb/store/` (~1857 LOC, subestructura cohesionada:
  `query_engine/`, `models/`, `io/`, `diagnostics_models/`).
- Entrada: ~20 comandos CLI + 2 no-CLI (`links/`) + ecosistema externo vía
  `load_runtime_documents`. **Alta entrada → es núcleo, no hoja.**

### 3.1 Acoplamientos que lo atan a sldb (a cortar)

| Acoplamiento | Usos | Acción |
|---|---|---|
| `sldb.cli.store_context.get_store_context` | 1 (facade) | **inversión de dependencia**: inyectar contexto, no importarlo |
| `sldb.cli.model_utils.resolve_model_ref` | 1 lazy (diagnostics) | inyectar callable (patrón ya existe) |
| `sldb.models.structured_doc.StructuredNLDoc` | 2 | abstraer a protocolo `Document` |
| `sldb.runtime.validation.extract_model_data` | 3 | abstraer a interfaz `Codec.extract` |
| `sldb.core.exceptions` | 10 | mover al core del store (excepciones propias) |

Los dos primeros son inversión de dependencia (store→cli, mala). Los dos
siguientes son la **generalización** (sacar tipo y formato del core). El
último es trivial.

---

## 4. Plan

1. **Cortar `store → cli`** (get_store_context, resolve_model_ref): inyección
   en vez de import.
2. **Abstraer `Document`**: reemplazar referencias a `StructuredNLDoc` por un
   protocolo. sldb registra su `StructuredNLDoc` como implementación.
3. **Abstraer `Codec`**: sacar `extract_model_data` / render Markdown del core
   a una interfaz. sldb aporta el codec Markdown-reversible.
4. **Excepciones propias** del store (dejar de importar `sldb.core.exceptions`).
5. **Mover** `store/` → paquete/carpeta núcleo independiente.
6. **Reapuntar** CLI y `links/` como clientes.
7. **sldb queda como primer cliente**: `{StructuredNLDoc + codec Markdown}`.

---

## 5. Riesgo

- Extracción pura (mover + invertir 2 imports): **bajo**.
- Generalización (Document + Codec): **medio** — toca firmas públicas
  (`load_runtime_documents`, `hashing`, `facade`), pero el patrón de inyección
  ya existe en el código.
- No es "mover una carpeta": es "extraer + generalizar el core para que deje
  de mencionar formato y dominio".

---

## 6. Por qué esto cierra el hilo del núcleo

- **sldb** = store + plugin `{StructuredNLDoc, Markdown}`. Deja de ser dueño.
- **repopackage** = store + plugin `{IntegrationContract, YAML}` → deja de
  reimplementar YAML + `sha256(json.dumps)` + solver ad-hoc sobre archivos
  sueltos (hoy tiene su propia persistencia paralela; ver §7).
- **kgdb** = consume el store para ensamblar el grafo, agnóstico del codec.
- **deskops / spec2viz / knowledge** = store + sus tipos.

El store se vuelve la infraestructura común que `PROJECTION_LAYERING_SPEC.md §7`
pone al centro del ecosistema radial. sldb+kgdb como núcleo se refina: **el
verdadero núcleo es el store genérico**; sldb es la primera instancia de
consumo (NL + Markdown), kgdb el ensamblador de grafo sobre él.

---

## 7. repopackage: cliente latente que reimplementa el store

repopackage hoy **no usa el store** (cero imports de sldb en `src/`). En su
lugar reimplementa un subconjunto pobre:

| Necesidad | repopackage hoy | store genérico |
|---|---|---|
| Modelos tipados | Pydantic a mano (`IntegrationContract`…) | `Document` protocol |
| Persistencia | `yaml.load`/`dump` con `open()` | io + lock + codec YAML |
| Consulta del grafo | `solver.py` recorre YAML | `query_engine` |
| Hash de estado | `hashlib.sha256(json.dumps(...))` | `hashing` por capas |

El `nldb_example/` (un `StructuredNLDoc` de referencia) es la punta de una
integración ya prototipada pero nunca conectada. repopackage es el caso donde
**la ausencia de un store genérico obligó a reinventarlo**: es el mejor
argumento a favor de esta extracción.

---

## 8. Preguntas abiertas

- ¿`Document` y `Codec` son protocolos (duck typing) o clases base abstractas?
- ¿El registro de tipos/codecs es global (un registry por proceso) o por store?
- ¿El paquete se llama `store` genérico, o toma nombre propio para no arrastrar
  la marca sldb?
- ¿El modelo de relación (`RELATION_MODEL_LAYER_SPEC.md`) es un `Document` más,
  o el store necesita primitiva de arista nativa?
- ¿kgdb consume el store directamente, o vía un export intermedio como hoy?
- Migración de repopackage: ¿portar sus modelos a `Document`+codec YAML es un
  cambio incremental o un rewrite?
