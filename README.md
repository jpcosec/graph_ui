# graph_ui — editor visual de un store pron/sldb

> ⚠️ **Este repo tiene imports rotos contra pron desde el 2026-09-17.** Ver [AVISO-imports-rotos.md](AVISO-imports-rotos.md).


El desarrollo activo está en `frontends/mindmap/`: un editor visual para
cualquier store [`pron`](https://github.com/jpcosec/pron) — y por lo tanto de
cualquier store `sldb`/`kgdb`, que `pron` unifica. No es una KB fija: apunta
al store que quieras con `SLDB_STORE` y edita sus documentos y sus clases.

## Ejecutar

Desde la raíz del repositorio:

```sh
python3 frontends/mindmap/serve.py 8088
```

Abrir http://127.0.0.1:8088/. Requiere `sldb` y `pron` instalados (editable
o no) en el entorno Python — no hace falta `PYTHONPATH` para eso. Usa la
`.sldb` del repositorio por defecto; `SLDB_STORE=/ruta/a/otra/.sldb` apunta a
cualquier otro store. Si los modelos de ese store no viven en un paquete
instalado, agrega su carpeta a `PYTHONPATH`. Las dependencias del navegador
(React, React Flow, htm) se cargan vía CDN — no hay build step.

## Vistas

Cada vista es también una ruta (`/{faceta}/{vista}`), marcable como
favorito; el tab de la barra superior solo navega entre ellas.

- **🗺 KB** (`/documents/map`) — el store como mapa: documentos reales,
  contención anidada, referencias, ficha modal, guardado real. Vista por
  defecto.
- **💡 Brainstorm** (`/draft/tree`) — lienzo libre para pensar en ideas antes
  de que existan como documentos; convertir escribe en el store real.
- **📐 Schema** (`/models/diagram`) — diagrama de clases: una card por
  modelo registrado con todos sus campos y tipos; cada contención declarada
  es una flecha que sale del puerto de su propio campo hacia la clase
  destino; referencias anotadas; filtro por texto. Layout automático
  (dagre) desde `/api/schema`, nunca coordenadas fijas.
- **📐 Editar clases** — diálogo (desde la barra lateral de KB o desde
  cualquier card del Schema) para editar el contrato de una clase:
  plantilla, altas/bajas de campos, validar el draft y promoverlo.
- **Importar JSON** — diálogo para traer un mapa declarativo (validar →
  calcular plan → aplicar) sin tocar el store hasta confirmar.

El botón ◐ de la barra superior alterna el tema claro/oscuro; la elección se
recuerda entre sesiones.

Guía completa de uso: [`docs/mindmap-user.md`](docs/mindmap-user.md).

## Bajo el capó

El frontend está orthogonalizado en tres niveles: la **fuente** (`source/`,
las tres facetas documents/models/draft y las mutaciones reales contra el
store), las **vistas** (`views/{faceta}/{vista}/`, registradas en
`shell/registry.js`, que solo emiten intenciones) y el **shell** (`app.js`,
`shell/`, enrutado por `shell/router.js` y con el tema en `skins/`). Detalle
de capas y flujo: [`docs/mindmap-developer.md`](docs/mindmap-developer.md).
Intención de producto (qué debería hacer cada modo, criterios de
aceptación): [`docs/mindmap-spec.md`](docs/mindmap-spec.md).

## Documentación

| Doc | Para qué |
|---|---|
| [`docs/mindmap-user.md`](docs/mindmap-user.md) | Cómo usar cada vista y diálogo |
| [`docs/mindmap-developer.md`](docs/mindmap-developer.md) | Capas, flujo de datos, dónde toca cada archivo |
| [`docs/mindmap-spec.md`](docs/mindmap-spec.md) | Intención de producto y estado de implementación por modo |
| [`frontends/mindmap/README.md`](frontends/mindmap/README.md) | Arranque, compilar JSON, verificación |
| [`CLAUDE.md`](CLAUDE.md) | Identidades retiradas del repo y reglas para no confundirlas con desarrollo activo |

## Identidades retiradas

`apps/review-workbench/` (editor React anterior), `frontends/flow_editor/`
(editor HCP del que se adaptó Mindmap), `legacy/` y `src/` (contratos de un
editor de grafos genérico, previo a Mindmap/SLDB) siguen en el árbol como
referencia, pero ninguno es desarrollo activo. Detalle y cómo verificarlo:
[`CLAUDE.md`](CLAUDE.md). La rama `archive/hum-view` conserva el observatorio
HUM completo (`git show archive/hum-view:apps/review-workbench/src/features/hum-body/README.md`
para leer su evaluación sin cambiar de rama).
