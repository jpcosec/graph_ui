# KB Mindmap: guía para desarrolladores

## Propósito

`frontends/mindmap/` es una superficie de edición sobre cualquier store
`pron`/`sldb` — documentos y clases. La UI lee el esquema registrado y los
documentos reales del store; no usa un fixture de nodos ni mantiene la KB
como estado de `localStorage` (Brainstorm es la única excepción: su borrador
de ideas, antes de convertir, sí vive en `localStorage`).

El servidor se inicia con:

```sh
python3 frontends/mindmap/serve.py 8088
```

El store predeterminado es `tools/graph_ui/.sldb`. Para abrir otro store se
puede usar `SLDB_STORE` y, si sus modelos no viven en un paquete instalado,
`PYTHONPATH`:

```sh
SLDB_STORE=/ruta/a/otra/.sldb \
PYTHONPATH=/ruta/al/proyecto:$PYTHONPATH \
python3 frontends/mindmap/serve.py 8090
```

## Capas

### Los tres niveles del frontend

El frontend React/htm está ortogonalizado en tres niveles desacoplados,
direccionables como `/{faceta}/{vista}`:

```text
source/          # 1. Fuente: facetas + mutaciones reales
  source.js        SourceProvider / useSource()
  documents.js     useDocumentsFacet (baseline, working, save, undo/redo)
  models.js        useModelsFacet
  draft.js         useDraftFacet
  graph.mjs        # puros
  batch.mjs
  history.mjs
  draft.mjs
views/{faceta}/{vista}/   # 2. Vistas: un directorio por par (faceta, vista)
  documents/map/     map-view.js, document-node.js, sidebar.js, toolbar.js,
                      statusbar.js, document-dialog.js, quick-create-dialog.js,
                      connect-dialog.js, projection.mjs
  models/diagram/     diagram-view.js, projection.mjs
  draft/tree/         tree-view.js
shell/           # 3. Shell + tema
  shell.js         topbar, banner de error, .view-outlet, host de diálogos
  registry.js      VIEWS
  router.js        URL como fuente de verdad
  dialogs.js       ShellDialogsProvider / useShellDialogs()
  api.js           request
  skin.js          SKINS, getSkin/setSkin, resolveToken
  use-before-unload.js
dialogs/         # diálogos del shell (no de una vista): ClassDialog,
                  # CompilerDialog, ConflictDialog
skins/light.css, skins/dark.css   # tokens de tema
app.js           # raíz: SourceProvider > ShellDialogsProvider > Shell
```

Las mutaciones viven solo en `source/`; las vistas nunca tocan el store
directamente, emiten intenciones (`documents.save()`, `draft.convert()`,
...) que la fuente resuelve. Un store por servidor (`SLDB_STORE`); el front
nunca elige entre stores.

### Contrato de la fuente

`SourceProvider` (`source/source.js`) compone las tres facetas detrás de un
único contexto; `useSource()` devuelve
`{documents, models, draft, status, error, reload, dirtyAny}`. `documents`
(`source/documents.js`) trae la copia baseline y la de trabajo, con
undo/redo sobre el reducer puro `source/history.mjs`, más `save`/
`exportMap`/`loadCount` y la resolución de conflictos; usa `source/batch.mjs`
para diffear contra el baseline y detectar conflictos con el servidor.
`models` (`source/models.js`) espeja el `/api/schema` que ya trajo
`documents` en cada recarga. `draft` (`source/draft.js`) son las ideas de
Brainstorm en `localStorage` y su `convert()` vía `/api/plan`+`/api/compile`,
sobre los puros `source/draft.mjs`. `dirtyAny` es `documents.dirty` o
`draft.pending > 0`.

### Contrato de una vista

Cada vista se registra en `shell/registry.js` (`VIEWS`) con un descriptor
`{id, facet, label, component, shell:{primary}}`; la ruta que le corresponde
es `/${facet}/${id}` (`shell/router.js`, `routeFor`). El registro es una
lista explícita de pares faceta/vista, no una matriz combinatoria. Solo la
vista con `shell.primary:true` (hoy, KB) recibe del shell el botón «Guardar
en SLDB» y el `.save-state`; las demás no tienen ese chrome. Cada vista que
usa React Flow monta su propio `<ReactFlowProvider>` (no uno compartido en el
shell): así cada una tiene su propio `useReactFlow()`/viewport. El teclado
sigue el mismo patrón: cada vista instala su propio listener mientras está
montada (por ejemplo `Tab`/`Enter` en KB) y el shell instala el suyo (Ctrl+S)
solo cuando la vista activa es `shell.primary` y ningún diálogo está
bloqueando.

### Diálogos: shell vs. vista

`shell/dialogs.js` (`ShellDialogsProvider`/`useShellDialogs()`) alberga como
máximo un diálogo de shell a la vez — hoy `{kind:'classes', model?}` y
`{kind:'compiler'}` — montados por `Shell` desde `dialogs/`: `ClassDialog`,
`CompilerDialog` y `ConflictDialog` (esta última para conflictos de
guardado). Los diálogos propios de una vista (ficha, creación rápida,
conectar en `views/documents/map/`) los monta y posee la vista misma; solo
leen `dialogs.current` para no apilarse nunca sobre uno de shell.

### Ruteo

`shell/router.js` trata la URL como fuente de verdad: `useRoute()` resuelve
la vista activa a partir de `location.pathname` (`parseRoute`), cae a
`localStorage['kb-editor-route']` si la carga fue en `/`, y por defecto a
`/documents/map`. `navigate()` acepta un descriptor o una ruta como string
(así `tree-view.js` puede navegar sin importar el registro y evitar un
ciclo). `serve.py` sirve el fallback de SPA: una ruta sin extensión que no
existe como archivo estático (p. ej. `/models/diagram`) cae a `index.html`
para que `router.js` la resuelva en el cliente; `/api/*` desconocida
responde 404 JSON en vez de HTML. Ya no existen las rutas antiguas `/flow`
ni `/mindmap`.

### Tema (skin)

`skins/light.css` y `skins/dark.css` definen los mismos tokens (variables
CSS); `shell/skin.js` decide cuál aplica vía `data-skin` en `<html>`,
persistido en `localStorage['kb-skin']` y aplicado antes de montar React con
un script inline en `index.html` (para no parpadear). El selector ◐ del
topbar los alterna. La identidad de color por clase es ortogonal al tema:
`shared/classes.mjs` asigna cada clase a un *slot* (`classStyle` →
`{icon,name,slot}`) y el skin decide el color de cada slot
(`--class-color-N`) — la misma clase se ve igual en todas las vistas y en
ambos temas, solo cambia qué color le toca al slot. `resolveToken(name)` (en
`shell/skin.js`) resuelve un token a su valor computado para consumidores
que no son DOM (por ejemplo los colores que necesita el `MiniMap` de React
Flow, que no acepta `var(...)` directamente); está memoizado por
`(skin, token)` e invalidado solo cuando cambia el tema. Test guardián:
`tests/test_mindmap_skin.py`.

### Añadir una vista o un tema nuevos

Una vista nueva es: un directorio `views/{faceta}/{vista}/` con su
componente, una entrada en `VIEWS` (`shell/registry.js`) con su descriptor, y
un `<link>` a su hoja de estilos propia en `index.html`
(`views/{faceta}/{vista}/{vista}.css`) — no hace falta tocar el router ni el
shell. Un tema nuevo es: un archivo `skins/{nombre}.css` con los mismos
tokens que `light.css`/`dark.css`, una entrada en `SKINS` (`shell/skin.js`) y
un `<link>` en `index.html`.

### Estilos compartidos

`styles/base.css` trae los estilos base (reset, tipografía, botones y
formularios, la superficie de diálogo y las primitivas que comparten shell y
vistas, como `.class-item` o `.state`) y `styles/shell.css` el chrome del
shell (topbar, tabs, selector de tema, banner de error, `.view-outlet`);
cada vista trae la suya (`views/documents/map/map.css`,
`views/models/diagram/diagram.css`, `views/draft/tree/tree.css`). Todas se
enlazan desde `index.html` en ese orden (skins → base → shell → vistas): el
orden de cascada importa y es el mismo que tenía la hoja única anterior. Los
colores solo pueden ser tokens — `tests/test_mindmap_skin.py` falla ante un
hex fuera de `skins/`.

### Backend Python (sin cambios de capas)

`sldb_adapter.py` es el único módulo de este frontend que importa internos
de `sldb`; esa regla la vigila `tests/test_mindmap_adapter.py` recorriendo
todo `frontends/mindmap/*.py`. Por dentro, `SldbAdapter` delega en
`pron.store.Store` — "la única puerta a sldb" (pron, spec 12 §4) — para
schema, documentos, validación round-trip, create/update/delete, alta de
modelos y `default_document_path` (dónde vive un documento nuevo: junto a
los existentes de su misma clase en ese store, o en `<root>/<Clase>/` si es
el primero — nunca una carpeta inventada por este editor). Quedan dos
excepciones deliberadas y documentadas en el propio módulo: `serialize()`
(función pura sobre objetos que `Store.docs()` ya devolvió) y
`resolve_ref`/`validate_ref` (resuelven un ref arbitrario con un `pythonpath`
arbitrario *antes* de que el modelo esté registrado en ningún store; `pron`
no tiene equivalente porque siempre resuelve a través de un modelo ya
registrado). El schema expone además los metadatos de grafo declarados por
los modelos (`__containment__` y `__references__` en `StructuredNLDoc`): el
mapa no usa listas hardcodeadas cuando el schema declara esta información.

`models_service.py` es la puerta del **class editor**: cada función
(`detail`, `list_models`, `template_edit`, `fields_add`, `fields_remove`,
`validate`, `promote`) llama directo a `pron.Store` en el mismo proceso — sin
subprocess, sin importar `sldb` aquí. Es edición del contrato de un modelo,
no de un documento, pero la misma puerta y legitimidad que el resto del
adaptador. Cada función atrapa `StoreError` internamente para devolver
`{"ok": False, ...}` a HTTP 200 en vez de un 500 — una promoción sin draft es
un resultado esperado, no un error de servidor. `pron.Store.model_promote`
invalida el módulo Python del modelo en `sys.modules` tras promover: sin eso,
`schema()` seguiría sirviendo la versión vieja en el mismo proceso hasta
reiniciar el servidor.

`contract.py` define el contrato de intercambio JSON congelado (versión 1):
identidad, título, contención/relaciones como referencias del payload y vista
como metadatos. El fixture canónico vive en `fixtures/kb-small.json`.

`serve.py` sirve los archivos estáticos, expone `/api/schema` y `/api/graph`
mediante el adaptador, recibe `POST /api/save`, `/api/plan`, `/api/compile`,
`/api/export` (vía `compilation.py`/`compiler.py`) y los seis endpoints
`/api/models/*` (vía `models_service.py`, pasando `editor_store.pron_store`).
Las rutas `/sldb/*` siguen disponibles como proxy de solo lectura/escritura
hacia el servidor SLDB configurado en `SLDB_URL`.

`persistence.py` es la lógica de lote: prevalida todos los cambios de un
lote con el adaptador, crea o actualiza Markdown, actualiza índices y guarda
la vista en `.sldb/runtime/mindmap-view.json`. Rechaza conflictos de
contenido mediante el payload esperado y conflictos de vista mediante la
revisión SHA-256. Todas las operaciones de store se delegan al adaptador; el
único atributo propio es `pron_store` (el `Store` del adaptador, expuesto
para que `serve.py` se lo pase al class editor).

`compiler.py` compila el JSON declarativo a un store a través del adaptador
y ofrece `validate_source` (contrato), `plan_source` (dry-run con validación
real de payloads y detección de cambios) y `compile_json` (apply en dos
fases: prevalida todo antes de escribir). Lo usan tanto el diálogo "Importar
JSON" como la conversión de Brainstorm.

`shared/classes.mjs` define iconos y slots por clase (ver "Tema (skin)"
arriba); `shared/documents.mjs` resuelve títulos/aliases, slugs, defaults y
búsqueda de documentos. La contención y los campos de referencia provienen
de `graphMaps(schema)` (`source/graph.mjs`); `CONTAINMENT`/`REFERENCE_FIELDS`
ahí mismo son solo fallback de compatibilidad para stores cuyos modelos aún
no declaran metadatos. `source/draft.mjs` trae la lógica de Brainstorm que no
es puramente de UI: `newIdea`, `brainstormIssues` (qué ideas faltan
título/clase) y `brainstormToSource` (ideas → JSON del contrato, para
pasarlo a `compiler.py` vía `/api/plan` y `/api/compile`).
`views/documents/map/map-view.js` contiene el estado de interacción del modo
KB: selección, modo foco, modal de ficha, creación rápida, conexión,
búsqueda y filtros (undo/redo y guardado viven en `source/documents.js`, ver
"Contrato de la fuente"). Monta sus propios diálogos
(`document-dialog.js`, `quick-create-dialog.js`, `connect-dialog.js`) además
de `sidebar.js`, `toolbar.js` y `statusbar.js`; los diálogos de clase e
importar JSON son del shell (`dialogs/`: `ClassDialog`, `CompilerDialog`,
ver "Diálogos: shell vs. vista"). El frontend usa React 18, React Flow, htm
y dagre desde CDN; no hay build step.

`views/models/diagram/diagram-view.js` es la vista Schema: toma el grafo de
clases de `schemaGraph(models, documents)` (en
`views/models/diagram/projection.mjs`: nodos = modelos con sus campos
anotados como `contains`/`reference`, aristas = solo contención declarada
con clase destino registrada — `__references__` trae nombres de campo sin
clase, así que nunca se inventa una arista para ellas) y lo posiciona con
`dagre` (`rankdir: LR`), con el alto de cada card calculado por su número de
filas (todos los campos son siempre visibles). Cada fila de contención lleva
un `Handle` fuente con `id` = nombre del campo, y la arista usa
`sourceHandle: field`: la flecha sale de la fila concreta, no de la card; la
clase destino recibe por un único handle en su cabecera. Sigue el mismo
patrón que el mapa KB: los nodos viven en estado y React Flow aplica
selección y arrastre por `onNodesChange`; dagre solo los siembra cuando
cambia el schema. El filtro (`schemaMatches`, en el mismo `projection.mjs`)
atenúa cards y aristas en vez de quitarlas. Las cards no usan una pila de
fuentes monospace: en el Chromium headless de esta máquina
`ui-monospace, …, monospace` no generaba cajas de línea (texto invisible con
altura cero), así que las filas van en la fuente base del editor.

## Flujo de lectura (modo KB)

1. La UI pide `/api/graph` y `/api/schema`.
2. `graph` devuelve documentos serializados, la revisión de la vista y la
   vista persistida.
3. `project()` (`views/documents/map/projection.mjs`) identifica relaciones
   de contención, crea grupos anidados y conserva las demás relaciones como
   aristas opcionales.
4. React Flow renderiza los nodos; los documentos muestran solo icono y título.

Los campos de contención conocidos como fallback son `Board.tasks/pills/rituals`,
`Task.checklists/pills/atoms`, `Routine.decomposition/edges`,
`Checklist.condition_refs` y `Ritual.steps` — solo se usan cuando el modelo no
declara `__containment__`. Las clases nuevas reciben un color e icono
determinísticos aunque aún no tengan un adaptador explícito.

## Escrituras (modo KB)

La UI compara `baseline` con el estado actual y envía cambios `create`,
`update` y `delete` a `/api/save`. Cada documento existente incluye su
payload esperado para evitar sobrescribir una edición concurrente. Los
documentos nuevos se escriben vía `pron.Store.create` (por debajo del
adaptador) y deben cumplir el round trip del modelo. El borrado retira el
documento del índice y limpia referencias; conserva el Markdown en disco.

Una conexión se guarda como un valor del campo de referencia elegido en el
documento origen. La UI ofrece solo campos de relación conocidos por el
adaptador. Las aristas de referencia se muestran al activar `Referencias`.

## Modo Brainstorm

Ideas libres (`{id, title, className?, emoji, parentId, convertedDocId?}`)
en `source/draft.mjs`/`source/draft.js`/`views/draft/tree/tree-view.js`, sin
relación con clases SLDB hasta convertir. El borrador persiste en
`localStorage` (`kb-brainstorm-draft-v1`) en cada cambio; salir con ideas
sin convertir dispara una advertencia del navegador, no una pérdida de
datos. `Convertir a SLDB` filtra las ideas con título y clase válidos, arma
el JSON del contrato con `brainstormToSource` (`source/draft.mjs`) y reusa
exactamente el pipeline de `compiler.py` (`/api/plan` → `/api/compile`): las
ideas convertidas no se eliminan del lienzo, quedan marcadas con
`convertedDocId` y una insignia ✓.

## Class editor

`dialogs/class-dialog.js` (`ClassDialog`) es la UI sobre `models_service.py`,
montada por el shell (ver "Diálogos: shell vs. vista"). Cada
edición de contrato (plantilla, campo agregado/quitado) escribe un draft —
`sldb` lo materializa como `<módulo>.py.temp` junto al módulo activo del
modelo, vía `pron.Store.model_template_edit`/`model_fields_add`/
`model_fields_remove`. `Validar draft` corre el round-trip contra los
documentos existentes sin aplicar nada (`pron.Store.model_validate_draft`);
solo una validación exitosa habilita `Promover draft`
(`pron.Store.model_promote`), que instala el draft sobre el módulo activo,
reindexa, bumpea `version` en el índice de modelos y queda visible de
inmediato en `/api/schema` — sin reiniciar el servidor — porque `pron`
invalida el módulo en `sys.modules` al promover.

## Modo foco

Al entrar en un contenedor, la UI calcula sus descendientes a partir de la
jerarquía y proyecta solo ese subconjunto. El breadcrumb permite volver al mapa
completo. El modo foco no modifica documentos ni vista persistida.

## Verificación

```sh
node --test tests/mindmap-model.test.mjs
python3 -m pytest tests/test_mindmap_contract.py tests/test_mindmap_adapter.py \
  tests/test_mindmap_persistence.py tests/test_mindmap_compiler.py \
  tests/test_mindmap_endpoints.py tests/test_mindmap_quick_capture.py -q
python3 -m pytest tests/test_mindmap_skin.py -q
python3 -m pytest tests/e2e_mindmap_brainstorm.py tests/e2e_mindmap_classes.py \
  tests/e2e_mindmap_compiler.py tests/e2e_mindmap_doc_edit.py \
  tests/e2e_mindmap_quick_capture.py tests/e2e_mindmap_schema.py \
  tests/e2e_mindmap_routes.py -q
```

Las pruebas de persistencia crean stores temporales y prueban creación,
actualización, conflictos, borrado, contención y conservación de archivos.
`test_mindmap_skin.py` guarda que los tokens de clase/slot sigan resolviendo
igual en ambos temas. `e2e_mindmap_routes.py` cubre el fallback SPA y el
404 JSON de `/api/*` desconocido. Los e2e levantan `serve.py` real como
subproceso y lo manejan con un navegador real (Playwright) — sin mocks de
servidor ni de store.
