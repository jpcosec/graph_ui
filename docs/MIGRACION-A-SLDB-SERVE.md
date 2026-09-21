# Migración de graph_ui hacia `sldb serve` como autoridad HTTP

Estado: 2026-09-21 · vuelta 3 (escrituras con equivalente migradas, con red de
seguridad). Sin commit.

`frontends/mindmap/serve.py` funciona en dos modos, elegidos por
`GRAPH_UI_BACKEND` (default `local`):

```sh
# local — intacto, EditorStore en proceso (depende de pron; hoy roto,
# AVISO-imports-rotos.md)
python3 frontends/mindmap/serve.py 8088

# remote — lecturas Y escrituras con equivalente se sirven desde un
# 'sldb serve' externo; la vista (presentación) se persiste local
SLDB_URL=http://127.0.0.1:8312 GRAPH_UI_BACKEND=remote \
  SLDB_STORE=/ruta/store-local python3 frontends/mindmap/serve.py 8089
```

En modo remote las escrituras que sldb serve ya cubre (`/api/save` y
`/api/models/*`) se migran; la **compilación** (`/api/validate`, `/api/plan`,
`/api/compile`, `/api/export`) no tiene equivalente y **sigue en el proceso
local**: responde 501 explícito en remote. La vista se escribe LOCAL. Este doc
es el mapa de migración.

---

## 1. Tabla: ruta de graph_ui → endpoint de sldb serve

Fuente: `tools/sldb/src/sldb/cli/serve/routes.py` (lectura, working tree
2026-09-21). Las rutas con `[remote]` ya se sirven desde sldb serve hoy.

### Lecturas

| ruta graph_ui | método | endpoint sldb serve | estado | notas |
|---|---|---|---|---|
| `/api/schema` | GET | `GET /schema` | **EXISTE** `[remote]` | Shape `{"models":[{id,model_ref,fields,containment,references,semantics,template}]}`. Desde 2026-09-21 sldb enriquece cada modelo con los dunders de la clase (`__containment__`, `__references__`, `__semantics__`, `__template__`) y el `default` declarado por campo (ver §2.1). |
| `/api/graph` | GET | `GET /graph` | **PARCIAL** `[remote]` | `{"documents":[...]}` idéntico (mismo `serialize_document`). `view` y `revision` son estado de presentación local: desde vuelta 3 se sirven del archivo local `runtime/mindmap-view.json` (revision real = sha256), no del shim vacío (§3).
| `/api/edges` | GET | `GET /edges?from=&to=&relation=` | **EXISTE** `[remote]` | Passthrough 1:1 con query string. |
| `/api/edges/node` | GET | `GET /edges/node?id=` | **EXISTE** `[remote]` | Ídem. |
| `/api/edges/nodes` | GET | `GET /edges/nodes?type=` | **EXISTE** `[remote]` | Ídem. |
| `/api/graph/neighborhood` | GET | `GET /graph/neighborhood?node=&depth=` | **EXISTE** `[remote]` | Ídem. |
| `/api/graph/path` | GET | `GET /graph/path?source=&target=` | **EXISTE** `[remote]` | Ídem (404 si no hay camino). |
| `/api/graph/cycles` | GET | `GET /graph/cycles?limit=` | **EXISTE** `[remote]` | Ídem. |
| `/api/graph/components` | GET | `GET /graph/components` | **EXISTE** `[remote]` | Ídem. |
| `/api/graph/central` | GET | `GET /graph/central?limit=` | **EXISTE** `[remote]` | Ídem. |
| `/api/graph/isolated` | GET | `GET /graph/isolated` | **EXISTE** `[remote]` | Ídem. |
| `/api/models` | GET | `GET /models` | **EXISTE** `[remote]` | Catálogo `{"models":[{name,model_ref,path,version,canonical,family,semantics,documents}]}`. |
| `/api/models/detail` | GET | `GET /models/detail?model=` | **EXISTE** `[remote]` | Ver §2.2 (shape distinta a la local). |
| `/api/models/list` | POST `{}` | `GET /models` | **EXISTE** `[remote]` | Traducción POST→GET en serve.py (lectura del editor de clases). |
| `/api/models/detail` | POST `{model}` | `GET /models/detail?model=` | **EXISTE** `[remote]` | Traducción POST→GET en serve.py. $2.2. |
| `/api/lint` | GET | `GET /lint` | **EXISTE** `[remote]` | `{"problems":[{kind,severity,doc,detail}],"count":N}`. |
| `/api/health` | GET | `GET /health` | **EXISTE** `[remote]` | Extensión natural del passthrough. |
| `/api/kgdb/snapshot` | GET | `GET /kgdb/snapshot` | **EXISTE** `[remote]` | Passthrough; graph_ui no lo consume todavía. |
| `/sldb/*` | GET/POST | cualquier ruta de sldb | **EXISTE** | Proxy pasante preexistente, ambos modos. |
| `/api/document` `/api/document/ir` | GET | `GET /document` `GET /document/ir` | **FALTA** | Otro agente las está agregando a sldb (verificado 2026-09-21: aún no existen en el working tree). Cuando estén, el mapeo genérico `/api/* → /*` las sirve sin tocar código. |

### Escrituras

| ruta graph_ui | método | endpoint sldb serve | estado | notas |
|---|---|---|---|---|
| `/api/save` | POST `{changes, view, viewRevision}` | `POST /save` (batch `{changes}`) | **EXISTE** `[remote]` | Migrada en vuelta 3 con red de seguridad: los `changes` viajan a sldb; la `view` se valida contra la revision local y se persiste en `runtime/mindmap-view.json` SOLO si el guardado remoto fue exitoso (§2.4). Códigos passthrough 1:1: 409 conflicto (expected stale / doc existente / viewRevision), 422 validación, 500 fallo parcial con `completed`. El response compone `{ok, saved, documents, view, revision}` (re-GET `/graph` + vista local), mismo contrato que local. |
| `/api/models/template-edit` | POST `{model, content}` | `POST /models/template-edit` | **EXISTE** `[remote]` | Passthrough 1:1 request/response (§2.5). El `class-dialog.js` usa las mismas claves. |
| `/api/models/fields-add` | POST `{model, field_name, field_type, description, default}` | `POST /models/fields-add` | **EXISTE** `[remote]` | Passthrough 1:1 (§2.5). |
| `/api/models/fields-remove` | POST `{model, field_name}` | `POST /models/fields-remove` | **EXISTE** `[remote]` | Passthrough 1:1 (§2.5). |
| `/api/models/validate` | POST `{model}` | `POST /models/validate` | **EXISTE** `[remote]` | Passthrough 1:1 (§2.5). |
| `/api/models/promote` | POST `{model}` | `POST /models/promote` | **EXISTE** `[remote]` | Passthrough 1:1 (§2.5). |
| `/api/validate` | POST `{source}` | — | **FALTA (local-only)** | Sin equivalente en sldb; en remote responde **501 explícito** (§2.3). |
| `/api/plan` | POST `{source}` | — | **FALTA (local-only)** | Ídem (§2.3). |
| `/api/compile` | POST `{source, planToken}` | — | **FALTA (local-only)** | Ídem (§2.3). |
| `/api/export` | POST `{documents, view}` | — | **FALTA (local-only)** | Ídem (§2.3). |

---

## 2. Firmas exactas de lo que FALTA / PARCIAL

### 2.1 `/api/schema` — resuelto (antes PARCIAL, ahora EXISTE)

sldb serve devuelve por modelo `{id, model_ref, fields, containment, references, semantics, template}`:

- `containment` (dict campo → modelos destino permitidos), `references` (lista de campos que guardan ids de doc), `semantics` (dict) y `template` (str): leídos de los dunders `__containment__` / `__references__` / `__semantics__` / `__template__` de la clase del modelo (`sldb/cli/serve/schema.py`). Si el modelo no los declara, hereda los defaults de `StructuredNLDoc` (`{}`, `[]`, `{"representation": ["markdown"], "source": ["document", "markdown"]}`, `""`) — nunca `None`.
- Por campo, `default` se agrega cuando el modelo lo declara (`FieldInfo.default`): `PydanticUndefined` (requerido o `default_factory`) omite la clave; un default Enum se serializa por su `.value`; un default explícito `None` sí aparece.

La versión local (`SldbAdapter.schema`) añadía esto por introspección; ahora es el servidor el que lo sirve. El consumidor `views/models/diagram/` puede leer `containment`/`references` directamente del schema remoto.

### 2.2 `/api/models/detail` — PARCIAL (shape de response)

- Local (`models_service.detail` → `pron.Store.model_detail`):
  `{"ok": true, "text": "<yaml del modelo>"}`.
- sldb: `{"ok": true, "model": <ModelDescription.model_dump(mode="json")>}`
  — registro, resumen de campos y documentos trackeados, todo estructurado.

El dialog de clases hoy solo usa `ok` más el reporte de `validate`; el cuerpo
de `detail` no se pinta. Migrar = o adaptar sldb a emitir `text` (yaml) o
cambiar el dialog al shape estructurado. Lo segundo es lo correcto: yaml en
el diálogo es presentación derivada.

### 2.3 `/api/validate`, `/api/plan`, `/api/compile`, `/api/export` — local-only

Son el compilador local (`compilation.py` + `compiler.py` + `contract.py`),
independientes del store HTTP. No existe equivalente en sldb serve: **se
quedan en el proceso local incluso en modo remote** y responden 501 con
mensaje explícito. Documentación de firma (por si se portan):

- `POST /api/validate`
  - request: `{"source": <JSON intercambio v1>}`
  - response: `{"ok": bool, ...detalles}` · 200, o 422 si no ok.
- `POST /api/plan`
  - request: `{"source": <JSON v1>}`
  - response: plan con `applicable`, `planToken`, y listas
    (`conflicts`, `invalid_payloads`, `unknown_models`, `model_conflicts`,
    `invalid_models`) · 200.
- `POST /api/compile`
  - request: `{"source": <JSON v1>, "planToken": "<hash>"}`
  - response: reporte de `compile_json` · 200; 409 si el `planToken` no
    coincide (el JSON o la KB cambiaron); 422 si el plan no es aplicable; 500
    con `{completed, models_added, refresh_required, recovery}` si falla a
    mitad (sin rollback).
- `POST /api/export`
  - request: `{"documents": [...], "view": {...}}`
  - response: el **source JSON v1 crudo** (sin wrapper `ok`), tras `validate`.

`planToken` = sha256 del snapshot `{source, graph, models}` — depende del
grafo, así que en remote habrá que calcularlo contra el `GET /graph` remoto.

### 2.4 `/api/save` — resuelto (vuelta 3, escritura migrada)

El proxy parte la transacción como `EditorStore.save` local:

1. **Guard-guard de vista** (local): `viewRevision` del request debe coincidir
   con el sha256 del archivo local `runtime/mindmap-view.json`; si no, 409
   `'El mapa cambió en otra sesión. Recarga antes de guardar.'` — igual que
   local, sin tocar el store remoto.
2. **`changes` → `POST /save` batch de sldb** (solo `{changes}`; la vista no
   viaja). Codigos reenviados tal cual: 409 (expected stale → `'{doc} cambió
   en SLDB. Recarga…'` / doc existente), 400 (shape/ID), 422 (validación en
   prevalidate), 500 con `completed` (fallo parcial en apply). Mismos textos
   que local: el batch de sldb usa la misma prevalidación roundtrip
   (`validate_model_input_roundtrip`) y el mismo orden create→update→delete.
3. **La vista se escribe LOCAL solo si el POST /save fue 200** (red de
   seguridad: guardado fallido ⇒ la vista no se persiste).
4. Response compuesto: `{ok, saved, …}` de sldb + `documents` (re-GET
   `/graph`) + `view`/`revision` locales → contrato idéntico al local
   `{ok, saved, documents, view, revision}` para `documents.js`.
   En errores, el body también lleva `documents`/`revision` refrescados
   (el cliente los usa para actualizar la baseline tras un 409).

Observación empírica (validación E2E, store knowledge_psp): los payloads que
fallan la validación de pydantic (enum inválido, campo requerido ausente,
tipo incorrecto) superan el roundtrip de prevalidación y fallan en **apply**
con 500 + `completed` — comportamiento idéntico al local por usar la misma
función de validación. El 422 queda cableado (prevalidate); con estos modelos
ningún payload lo dispara.

### 2.5 `/api/models/*` — resuelto (vuelta 3, escrituras migradas)

`POST /api/models/{fields-add, fields-remove, template-edit, validate,
promote}` → `POST /models/<misma acción>` passthrough 1:1: request tal cual
(el `class-dialog.js` manda las mismas claves que sldb) y response/status sin
traducción (sldb reporta errores de dominio como `{ok:false}` HTTP 200,
igual que el local). `list`/`detail` siguen como traducción al GET homólogo.

Observación: en el entorno actual (knowledge_psp), los POST `/models/*` de
sldb fallan dentro de sldb al importar `kb_models.index_proxies` en su
maquinaria de drafts — bug del WIP de sldb, ajeno al proxy (el passthrough
reenvía exactamente el body/status de sldb, verificado contra la copia y
contra el 8310 real).

---

## 3. El concepto de `view` — por qué NO migra al store

`view` responde a `{positions: {id: {x,y,parentId}}, collapsed: [ids]}`
(`runtime/mindmap-view.json`) y `viewRevision` es el sha256 de ese archivo.

Es **estado de presentación, no semántica**:

- El store no debe saber **dónde está dibujado un nodo**. `positions`/`collapsed`
  no forman parte del documento, no alimentan hashes de integridad, ni
  referencias, ni indexación.
- La vista es per-sesión/per-display: dos editores pueden tener el mismo store
  con vistas distintas sin que ninguno esté "mal". Meterla en el store
  convertiría presentación en conflicto de escritura (de ahí el 409 por
  `viewRevision` en `EditorStore.save`).
- SLDB persiste documentos y modelos (semántica verificable); `view` es ruido
  para cualquier consumidor no-editor (kgdb, lint, export).

Dónde vive: hoy en `runtime/mindmap-view.json` **del lado del editor** (lo
escribe `SldbAdapter.write_view`; en remote, la vuelta 3 repite esa lógica
con stdlib en `serve.py`: `view_file()`/`local_view()`/`write_local_view()`
sobre `SLDB_STORE`, default el `.sldb` de graph_ui). El proxy sirve la vista
local en `/api/graph` (`view` + `revision` real del archivo) y la persiste en
`/api/save` solo tras un 200 de sldb; nunca en sldb.

---

## 4. Orden de migración (seguro → riesgoso)

1. ✅ Lecturas `/api/schema` y `/api/graph` desde sldb (vuelta 1).
2. ✅ Todas las lecturas: `/api/edges*`, `/api/graph/*`, `/api/models`,
   `/api/models/detail`, `/api/lint`, `/api/health`, `/api/kgdb/snapshot` +
   traducción POST de `list`/`detail` (vuelta 2).
3. ⏭ `/api/document` y `/api/document/ir` ya existen en sldb (verificado
   2026-09-21): servir el serializado coincide con `serialize_document` del
   editor; validar la forma del IR cuando el consumidor lo pida. El mapeo
   genérico ya las cubre sin cambios.
4. ✅ Escritura `POST /api/save` (batch) con vista local y response
   compuesto (vuelta 3, §2.4).
5. ✅ `POST /api/models/{template-edit, fields-add, fields-remove, validate,
   promote}` → passthrough (vuelta 3, §2.5).
6. ⏭ `POST /api/{validate, plan, compile, export}`: **siguen local-only** —
   sin equivalente en sldb (compilador `compiler.py`/`contract.py`, genera
   módulos Python e intercambio v1). En remote responden **501 explícito**;
   migrarlas exigiría portar el compilador o un servicio paralelo y depende
   del `planToken` contra el `/graph` remoto.

Regla: lo que no tiene equivalente en sldb sigue en el proceso local y,
cuando corre bajo remote, responde 501 con mensaje explícito; el modo local
sigue intacto y por defecto.