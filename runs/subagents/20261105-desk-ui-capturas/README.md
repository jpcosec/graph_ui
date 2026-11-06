# Capturas de la UI de deskops (frontends/desk), 2026-11-06

Cola (c) del coordinador 2. Playwright (Chromium headless, 1440×900, página completa) contra
`python frontends/desk/serve.py 8095 --root ~/proyectos/SLDB_1/deskops` (desk real de deskops,
solo lectura), graph_ui `5da7c92`, deskops main con el perf del closeout.

| Pantalla | Archivo | Carga |
|---|---|---|
| Board | board.png | 10.8 s (primera vista, proceso frío) |
| Tarea (task-gc03) | task.png | 1.6 s |
| Drawer | drawer.png | 1.6 s |
| Inbox | inbox.png | 1.6 s |
| Agentes | agents.png | 1.6 s |

## Pendiente: comparación con Stitch

No hecha. Las referencias son archivos del proyecto Stitch "Software Factory Knowledge Hub"
(projects/10031397220192998154, ids en deskops desk/drawer/plans/deskops-ui/brief.md) y no hay
copia local. Los TaskDocs task-ui02..ui06 de graph_ui ya están cerrados (el closeout los quitó del
desk), así que las diferencias no se pueden anotar con `deskops edit task`.
