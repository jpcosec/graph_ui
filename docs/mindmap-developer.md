# KB Mindmap: guía para desarrolladores

## Propósito

`frontends/mindmap/` es una superficie de edición sobre un store SLDB. La UI
lee el esquema registrado y los documentos reales del store; no usa un fixture
de nodos ni mantiene la KB como estado de `localStorage`.

El servidor se inicia con:

```sh
python3 frontends/mindmap/serve.py 8088
```

El store predeterminado es `tools/graph_ui/.sldb`. Para abrir otra KB se puede
usar `SLDB_STORE` y, si los modelos viven en otro proyecto, `PYTHONPATH`:

```sh
SLDB_STORE=/ruta/a/otra/.sldb \
PYTHONPATH=/ruta/al/proyecto:$PYTHONPATH \
python3 frontends/mindmap/serve.py 8090
```

## Capas

`sldb_adapter.py` es el único módulo que habla con SLDB: schema, documentos,
validación round-trip (por nombre o por ref), create/update/delete, alta de
modelos y vista (posiciones y plegado) con revisión SHA-256. Ningún otro
archivo de este frontend importa internos de SLDB directamente; esa regla la
vigila `tests/test_mindmap_adapter.py`. El schema expone además los metadatos
de grafo declarados por los modelos (`__containment__` y `__references__` en
`StructuredNLDoc`): el mapa no usa listas hardcodeadas cuando el schema
declara esta información.

`contract.py` define el contrato de intercambio JSON congelado (versión 1):
identidad, título, contención/relaciones como referencias del payload y vista
como metadatos. El fixture canónico vive en `fixtures/kb-small.json`.

`serve.py` sirve los archivos estáticos, expone `/api/schema` y `/api/graph` mediante el adaptador, y recibe `POST /api/save`. Las rutas `/sldb/*` siguen disponibles como proxy de solo lectura/escritura hacia el servidor SLDB configurado en `SLDB_URL`.

`persistence.py` es la lógica de lote: prevalida todos los cambios de un lote con el adaptador, crea o actualiza Markdown, actualiza índices y guarda la vista en `.sldb/runtime/mindmap-view.json`. Rechaza conflictos de contenido mediante el payload esperado y conflictos de vista mediante la revisión SHA-256. Todas las operaciones de store se delegan al adaptador.

`compiler.py` compila el JSON declarativo al store SLDB a través del adaptador y ofrece `validate_source` (contrato), `plan_source` (dry-run con validación real de payloads y detección de cambios) y `compile_json` (apply en dos fases: prevalida todo antes de escribir).

`model.mjs` contiene la proyección de presentación. Define iconos y colores por
clase, resuelve aliases de documentos, distingue relaciones de contención,
calcula jerarquías y genera nodos React Flow. La contención y los campos de
referencia provienen de `graphMaps(schema)`; las constantes `CONTAINMENT` y
`REFERENCE_FIELDS` son solo fallback de compatibilidad para stores cuyos
modelos aún no declaran metadatos. La proyección nunca cambia el payload por
sí sola.

`editor.js` contiene el estado de la interacción: selección, modo foco,
modal de ficha, creación rápida, conexión, undo/redo, búsqueda, filtros y
guardado. El frontend usa React 18, React Flow, htm y dagre desde CDN; no hay
build step.

## Flujo de lectura

1. La UI pide `/api/graph` y `/api/schema`.
2. `graph` devuelve documentos serializados, la revisión de la vista y la
   vista persistida.
3. `project()` identifica relaciones de contención, crea grupos anidados y
   conserva las demás relaciones como aristas opcionales.
4. React Flow renderiza los nodos; los documentos muestran solo icono y título.

Los campos de contención conocidos son `Board.tasks/pills/rituals`,
`Task.checklists/pills/atoms`, `Routine.decomposition/edges`,
`Checklist.condition_refs` y `Ritual.steps`. Las clases nuevas reciben un
color e icono determinísticos aunque aún no tengan un adaptador explícito.

## Escrituras

La UI compara `baseline` con el estado actual y envía cambios `create`,
`update` y `delete`. Cada documento existente incluye su payload esperado para
evitar sobrescribir una edición concurrente. Los documentos nuevos se escriben
mediante las operaciones de documentos de SLDB y deben cumplir el round trip
del modelo. El borrado retira el documento del índice y limpia referencias;
conserva el Markdown en disco.

Una conexión se guarda como un valor del campo de referencia elegido en el
documento origen. La UI ofrece solo campos de relación conocidos por el
adaptador. Las aristas de referencia se muestran al activar `Referencias`.

## Modo foco

Al entrar en un contenedor, la UI calcula sus descendientes a partir de la
jerarquía y proyecta solo ese subconjunto. El breadcrumb permite volver al mapa
completo. El modo foco no modifica documentos ni vista persistida.

## Verificación

```sh
node --test tests/mindmap-model.test.mjs
python3 -m pytest tests/test_mindmap_contract.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py -q
python3 -m pytest tests/test_mindmap_compiler.py -q
```

Las pruebas de persistencia crean stores temporales y prueban creación,
actualización, conflictos, borrado, contención y conservación de archivos.
