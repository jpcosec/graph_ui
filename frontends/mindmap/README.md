# KB Mindmap

Editor integrado con SLDB, adaptado del editor HCP conservado en
`../flow_editor/` junto con sus dependencias originales.

## Ejecutar

```sh
python3 frontends/mindmap/serve.py 8088
```

Requiere `sldb` y los paquetes de los modelos registrados (en esta KB,
`deskops`) en el entorno Python. Usa la `.sldb` de este repositorio; `SLDB_STORE`
permite seleccionar otra. React, React Flow y htm se cargan vía CDN.

## Trabajar con documentos

- Cajas redondeadas, borde y emoji coherentes con la leyenda de clases SLDB.
- Seleccionar muestra la mini barra: Hijo, Hermano, Editar y Quitar.
- Tab añade un hijo cuando el modelo tiene contención; Enter añade un hermano.
- Doble clic abre la ficha. Los campos y validaciones siguen el esquema SLDB.
- Los hijos se guardan en campos reales: Board.tasks/pills/rituals,
  Routine.decomposition/edges, Task.checklists/pills/atoms,
  Checklist.condition_refs y Ritual.steps. Las clases sin esos campos no
  ofrecen creación de hijos. Hermano conserva el padre y su campo de relación.
- Contenedores anidados y plegables; los documentos compartidos aparecen bajo
  un padre determinista. Sus referencias restantes se conservan en el payload.
- «Referencias» muestra conexiones no estructurales, ocultas inicialmente.
- La leyenda destaca las clases y muestra sus recuentos. En móvil se abre con ☰.

## Guardado real

«Guardar en SLDB» / Ctrl+S usa `POST /api/save`. El servidor pre-valida todo
el lote con los modelos y el round trip de SLDB, crea/actualiza documentos
Markdown y actualiza los índices mediante las operaciones nativas de SLDB.
Los documentos nuevos se crean en `desk/mindmap/<Clase>/<ID>.md`.

Quitar retira el documento del índice y limpia las referencias del mapa;
conserva el archivo Markdown en disco. Quitar un contenedor conserva sus hijos.
Las posiciones y el plegado se guardan en `.sldb/runtime/mindmap-view.json`.

## Compilar JSON a SLDB

El mapa puede mantenerse como JSON declarativo y compilarse al store. El
compilador genera las clases `StructuredNLDoc` que falten, las registra en
SLDB, valida cada documento con el round-trip nativo y escribe los Markdown e
índices. Las clases existentes se pueden reutilizar con `ref`.

```bash
PYTHONPATH=src:/home/jp/proyectos/hum-ecosystem/tools/sldb/src \
  python3 frontends/mindmap/compiler.py mapa.json --store .sldb
```

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
No se usa localStorage como fuente de documentos o como mecanismo de guardado.

El servidor rechaza payloads obsoletos para evitar sobrescribir otra edición.
Los errores parciales se notifican como fallo y mantienen los cambios pendientes;
no se anuncian como éxito. Recargar con cambios pendientes pide descartarlos.

## Verificación

```sh
python3 -m pytest tests/test_mindmap_persistence.py -q
node --test tests/mindmap-model.test.mjs
```

Las pruebas Python crean stores temporales reales; no modifican la KB de trabajo.
