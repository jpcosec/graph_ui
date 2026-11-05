# frontends/desk — la UI de deskops

La superficie de trabajo de la fábrica: Board, Tarea, Drawer, Inbox y Agentes de un desk real.
graph_ui solo dibuja; qué se muestra lo decide `deskops view` (contrato en
`deskops/docs/deskops-ui.md`) y las escrituras son operaciones de deskops.

## Levantarlo

```sh
python3 frontends/desk/serve.py 8091 --root /ruta/al/repo-con-desk
```

Opciones:

- `--registry <repo>`: repo cuyo `desk/registry/repo-*.md` alimenta el selector de desks
  (por defecto, el de `--root`). Solo se ofrecen los repos con `desk/tasks/Board.md`.
- `--pythonpath <dir>`: antepone un directorio a `sys.path`; sirve mientras el deskops
  instalado no traiga `deskops view` (por ejemplo, un worktree de deskops).
- `DESK_UI_HERDR=<ejecutable>`: el Herdr que consulta la pantalla Agentes.
- `DESK_UI_LOG=1`: registra cada petición en stderr.

Escucha solo en `127.0.0.1` (puerto por defecto 8091). Sin CDN ni fuentes externas.

## Pantallas

| Pantalla | Fuente | Acciones |
|---|---|---|
| Board | `deskops view board` (+ `task` para el panel) | Avanzar (`POST /api/desk/advance`, guarda de revisión de Board + tarea) |
| Tarea (`#/task?id=`) | `deskops view task` | Avanzar desde el pie; herencia y dependencias navegables |
| Drawer | `deskops view drawer` | Copiar el comando `deskops add task --from-drawer`; no hay botón que escriba |
| Inbox | `deskops view inbox` | Reconocer (`deskops message ack`) y Pasar al drawer (`deskops promote inbox-to-drawer-task`), con confirmación y guarda de revisión de la nota |
| Agentes | `deskops view agents` | ninguna; si Herdr no responde se muestra la causa |

Iniciar ejecución, Promover a atom y Diferir a drawer se muestran deshabilitados con su motivo:
no hay operación de deskops detrás todavía.

"Inspeccionar" abre el visor de nodos (`frontends/workspace/serve.py`, :8090) con
`?id=TaskDoc:<id>`.

## Archivos

- `serve.py`: servidor stdlib; `GET /api/desks`, `GET /api/view/*`, los tres `POST`.
- `index.html`, `styles.css`: shell y tokens de `DESIGN.md` (tema oscuro).
- `app.js`: estado, carga, rutas, confirmación y avance compartidos.
- `board.js`, `task.js`, `drawer.js`, `inbox.js`, `agents.js`: una pantalla por archivo.
- `main.js`: arranque (se carga al final).

## Tests

```sh
python3 -m pytest -q tests/test_desk_ui_routes.py   # rutas contra desks temporales reales
python3 -m pytest -q tests/e2e_desk_ui.py           # navegador real (Playwright)
```

Ambos se saltan si el deskops importable no trae `deskops.services.desk_view`.
