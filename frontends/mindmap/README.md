# KB Mindmap

Editor visual de cualquier store `pron`/`sldb`. Ver
[qué es esto y sus identidades retiradas](../../README.md) y
[cómo se relaciona con `pron`](../../docs/mindmap-developer.md) si vienes de
fuera de este directorio.

## Ejecutar

```sh
python3 frontends/mindmap/serve.py 8088
```

Requiere `sldb` y `pron` instalados en el entorno Python (no hace falta
`PYTHONPATH` para eso). Usa la `.sldb` de este repositorio por defecto;
`SLDB_STORE=/ruta/a/otra/.sldb` abre cualquier otro store — no tiene que ser
uno compilado por este editor. Si los modelos de ese store no viven en un
paquete instalado, agrega su carpeta con `PYTHONPATH`. React, React Flow y
htm se cargan vía CDN.

## Vistas y diálogos

Cada vista es una ruta (`/{faceta}/{vista}`): el switch de la barra superior
navega entre ellas (`role=tab`), no es un simple estado local. `/` abre la
última ruta visitada, recordada en `localStorage`. El botón ◐ alterna el
tema claro/oscuro (también persistido); no cambia la identidad de color de
las clases, que es la misma en ambos temas.

- **🗺 KB** (`/documents/map`) — mapa del store real: documentos, contención
  anidada, referencias, ficha modal, guardado. Es la única vista con
  `shell.primary`: el botón «Guardar en SLDB» / `Ctrl+S` del shell solo
  existe aquí.
- **💡 Brainstorm** (`/draft/tree`) — lienzo libre de ideas (`Enter` hermano,
  `Tab` hijo); vive en `localStorage` hasta convertir. `Convertir a SLDB`
  valida y escribe las ideas con clase y título asignados usando el mismo
  compilador que "Importar JSON" (`plan` → `compile`).
- **📐 Schema** (`/models/diagram`) — diagrama de clases del store: una card
  por modelo con todos sus campos (tipo, `*` obligatorio), filas ◆ de
  contención con la clase destino y filas ⇢ de referencia. Cada contención
  declarada es una arista que sale del puerto de su propio campo (a la
  altura de la fila) y entra por la cabecera de la clase destino, etiquetada
  con el campo. Filtro por texto; doble clic o ✎ abre «Editar clases» en esa
  clase. Solo lectura: el contrato se edita en el diálogo.

Tres diálogos:

- **📐 Editar clases** (barra lateral de KB, o desde una card del Schema) —
  plantilla, altas/bajas de campos, `Validar draft` y `Promover draft`.
  Cada cambio de contrato vive como un draft (`.py.temp`) hasta que se
  promueve; promover bumpea la versión del modelo y aplica al instante (sin
  reiniciar el servidor).
- **Importar JSON** (toolbar) — pega o sube un mapa declarativo: `Validar`
  (solo contrato) → `Calcular plan` (valida contra el store real, sin
  escribir) → `Aplicar en SLDB` (escribe). Los documentos ausentes del JSON
  se conservan.
- **⌁ Conectar** — desde la mini barra de un documento seleccionado, arma
  una referencia elegible por campo hacia otro documento.

Detalle paso a paso de cada uno: [`docs/mindmap-user.md`](../../docs/mindmap-user.md).

## Trabajar con documentos (modo KB)

- Cajas redondeadas, borde y emoji coherentes con la leyenda de clases.
- Seleccionar muestra la mini barra: Hijo, Hermano, Editar, Conectar y Quitar.
- Tab añade un hijo cuando el modelo tiene contención; Enter añade un hermano.
- Doble clic abre la ficha. Los campos y validaciones siguen el esquema real
  del store, vía `/api/schema`.
- Los hijos se guardan en campos reales de contención declarados por cada
  modelo (`__containment__`); las clases sin esos campos no ofrecen creación
  de hijos. Hermano conserva el padre y su campo de relación.
- Contenedores anidados y plegables; los documentos compartidos aparecen bajo
  un padre determinista. Sus referencias restantes se conservan en el payload.
- «Referencias» muestra conexiones no estructurales, ocultas inicialmente.
- La leyenda destaca las clases y muestra sus recuentos. En móvil se abre con ☰.

## Guardado real

«Guardar en SLDB» / Ctrl+S usa `POST /api/save`. El servidor pre-valida todo
el lote contra los modelos reales (round-trip de sldb) y escribe a través de
`pron.Store` — crea/actualiza Markdown y actualiza los índices sin que este
frontend reimplemente esa lógica. Los documentos nuevos se crean junto a los
documentos existentes de la misma clase en ese store (el store decide su
propio layout, no este editor); si es el primero de su clase, cae en
`<raíz del store>/<Clase>/<ID>.md`.

Quitar retira el documento del índice y limpia las referencias del mapa;
conserva el archivo Markdown en disco. Quitar un contenedor conserva sus hijos.
Las posiciones y el plegado se guardan en `.sldb/runtime/mindmap-view.json`.

El servidor rechaza payloads obsoletos para evitar sobrescribir otra edición.
Los errores parciales se notifican como fallo y mantienen los cambios
pendientes; no se anuncian como éxito. Recargar con cambios pendientes pide
descartarlos.

## Compilar JSON a un store

El mapa puede mantenerse como JSON declarativo y compilarse al store (es lo
que usan tanto "Importar JSON" como "Convertir a SLDB" de Brainstorm por
debajo). El compilador genera las clases `StructuredNLDoc` que falten, las
registra, valida cada documento con el round-trip nativo y escribe los
Markdown e índices vía `pron.Store`. Las clases existentes se reutilizan con
`ref`.

```sh
python3 frontends/mindmap/compiler.py mapa.json --store .sldb
```

Si los modelos referenciados (`ref`) no viven en un paquete instalado, agrega
su ubicación a `PYTHONPATH` antes de correr el comando.

Formato mínimo:

```json
{
  "models": [{
    "name": "Board",
    "family": "workspace",
    "fields": [
      {"name": "id", "type": "str", "description": "Stable id"},
      {"name": "title", "type": "str", "description": "Title"},
      {"name": "children", "type": "list[str]", "default": [], "description": "Contained docs"}
    ]
  }],
  "documents": [{"id": "main", "model": "Board", "payload": {"title": "Main", "children": []}}],
  "view": {"positions": {"main": {"x": 0, "y": 0}}}
}
```

Para una clase ya existente, el modelo declara por ejemplo
`"ref": "deskops.models.board:BoardDoc"` y su `name` debe ser `BoardDoc`.
La compilación es idempotente: un documento existente se actualiza y uno nuevo
se crea; cambiarle la clase se rechaza para evitar migraciones implícitas.
No se usa localStorage como fuente de documentos del store — solo Brainstorm
lo usa, y únicamente como borrador antes de convertir.

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
  tests/e2e_mindmap_routes.py -q   # Playwright, requiere navegador
```

Las pruebas Python crean stores y servidores reales en directorios
temporales; no modifican la KB de trabajo. `tests/test_auditor.py`,
`test_editor.py`, `test_kgdb_adapter.py`, `test_provider.py` y
`test_sldb_end_to_end.py` pertenecen a la identidad retirada de `src/`, no a
Mindmap — ver [`CLAUDE.md`](../../CLAUDE.md).
