# UI de deskops en graph_ui (`frontends/desk/`)

Cliente de la vista de datos de deskops (`deskops view`, contrato en
`deskops/docs/deskops-ui.md`). graph_ui no decide qué se muestra: sirve en
loopback el mismo JSON que devuelve `deskops view … --format json` y lo dibuja.

## Levantarlo

```sh
python3 frontends/desk/serve.py 8091 --root /ruta/al/repo-con-desk \
  [--registry /ruta/al/repo-deskops] [--pythonpath /ruta/a/un/deskops-con-view]
```

- Escucha solo en `127.0.0.1` (puerto por defecto 8091).
- `--root`: desk por defecto. `--registry`: repo cuyo `desk/registry/repo-*.md` alimenta el
  selector de desks (por defecto, `--root`); solo se ofrecen los repos que tienen
  `desk/tasks/Board.md`.
- `--pythonpath`: antepone un directorio a `sys.path` (útil mientras el deskops instalado no
  trae `deskops view`).
- `DESK_UI_HERDR` cambia el ejecutable de Herdr que usa la vista agents.

## Rutas

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/desks` | desks del registro con `desk/` (id, path, default) y errores del registro |
| GET | `/api/view/{board,drawer,inbox,agents}?desk=<id>` | `DeskView(<repo>).<vista>()`, el mismo JSON que `deskops view` |
| GET | `/api/view/task?desk=<id>&id=<task>` | `DeskView(<repo>).task(<task>)` |
| POST | `/api/desk/advance?desk=<id>` | delega en `mindmap.deskops_routes.DeskRoutes` (identidad, origen y guarda de revisión) |
| POST | `/api/inbox/ack?desk=<id>` | `{note, revision}`: si `revision` = sha256 de la nota, ejecuta `deskops message ack <note>` en proceso |
| POST | `/api/inbox/promote?desk=<id>` | `{note, revision}`: igual, con `deskops promote inbox-to-drawer-task <note>` |

Cualquier otro método o ruta POST responde 405; un desk fuera del registro, 404; una vista
que falla devuelve `{"ok": false, "error": "<causa>"}` y la pantalla muestra esa causa.

## Pantallas

Board (UI03), Tarea (UI04), Drawer e Inbox (UI05) y Agentes (UI06); el detalle de cada una,
sus fuentes y sus acciones está en `frontends/desk/README.md`. **Inspeccionar** abre el visor
de nodos (`frontends/workspace`, :8090) con `?id=TaskDoc:<id>`.

Sin CDN ni fuentes externas: CSS propio con los tokens de `DESIGN.md` y pilas de fuentes del
sistema (Inter / JetBrains Mono solo si están instaladas localmente).
