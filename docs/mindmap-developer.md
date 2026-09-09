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

`serve.py` sirve los archivos estáticos, expone `/api/schema` y `/api/graph`, y
recibe `POST /api/save`. Las rutas `/sldb/*` siguen disponibles como proxy de
solo lectura/escritura hacia el servidor SLDB configurado en `SLDB_URL`.

`persistence.py` es el puente de escritura. Prevalida todos los cambios de un
lote, usa los modelos y validadores nativos de SLDB, crea o actualiza Markdown,
actualiza índices y guarda la vista (posiciones y plegado) en
`.sldb/runtime/mindmap-view.json`. Rechaza conflictos de contenido mediante el
payload esperado y conflictos de vista mediante una revisión SHA-256.

`model.mjs` contiene la proyección de presentación. Define iconos y colores por
clase, resuelve aliases de documentos, distingue relaciones de contención,
calcula jerarquías y genera nodos React Flow. La proyección nunca cambia el
payload por sí sola.

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
python3 -m pytest tests/test_mindmap_persistence.py -q
```

Las pruebas de persistencia crean stores temporales y prueban creación,
actualización, conflictos, borrado, contención y conservación de archivos.
