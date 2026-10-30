# Deskops en Mindmap

La ruta **`/workflow/deskops`** muestra el Board del desk seleccionado: tareas,
objetivos, alcance, validaciones, pills, dependencias y próximos pasos. Se integra
con el shell, los temas y el panel Workers existentes. El buscador y el filtro
por estado operan sobre las tareas enrutadas; los contadores representan ese
Board completo. Una referencia rota aparece como error y no como tablero vacío.

```sh
pip install -e '.[deskops]'
SLDB_STORE=/abs/deskops/.sldb DESKOPS_ROOT=/abs/deskops graph-ui 8091
```

Abrir `http://127.0.0.1:8091/workflow/deskops`. `DESKOPS_ROOT` debe ser absoluto.
Sin esa variable, en modo local se usa el padre del store pasado al servidor
(incluido `SLDB_STORE`). Con `GRAPH_UI_BACKEND=remote`, el workflow requiere
`DESKOPS_ROOT`: las rutas Deskops son locales y no se reenvían a SLDB remoto.
Un desk o lifecycle ausente se informa como error de configuración.

Seleccionar una tarjeta con ratón o teclado permite inspeccionar sus condiciones.
**Avanzar** solo se habilita cuando una transición no terminal cumple sus gates;
Deskops vuelve a evaluarlos al ejecutar. **Actualizar** relee el Board y el detalle.
Si cambia la tarea o el Board, una revisión anterior recibe un conflicto y hay que
actualizar antes de reintentar. El cierre se realiza con `deskops closeout commit`
en el CLI, con su evidencia; la UI no cierra ni hace commits. Tampoco crea tareas
ni permite editar `status` o `current_node` a través del editor genérico de SLDB.

## Contrato y límites

- `GET /api/desk/board`: identidad del root, payload del Board, tareas referenciadas
  y errores individuales. No escanea tareas huérfanas.
- `GET /api/desk/task?id=...`: solo identidades válidas en ese Board; devuelve
  payload, gates de `show_task`, próximos pasos de `next_action_report` y revisión.
- `POST /api/desk/advance`: JSON con únicamente `id` y `revision`, máximo 8192 bytes.
  Delega `advance_task(id)` sin aceptar un destino. Rechaza Origin externo,
  tipos inválidos y revisiones obsoletas; un gate bloqueado devuelve 409 con detalle.

SLDB sigue siendo responsable de extracción y persistencia documental, y Deskops
de las reglas de workflow. Esta vista no introduce otro parser ni estado persistente.
La revisión es SHA256 de los bytes del Board, un separador nulo y los bytes de la
tarea. Un `RLock` por servidor serializa lectura, comparación, avance y refresco de
las peticiones de la UI. **No existe un lock compartido con escritores CLI externos**:
la revisión detecta cambios previos pero no garantiza atomicidad frente a un CLI
que escriba durante esa secuencia. Coordinar esos escritores y actualizar después.
La revisión no incluye dependencias ni el lifecycle; los gates se reevalúan siempre.

El servidor es local, sin autenticación, escuchando en loopback. El navegador usa
las dependencias CDN del Mindmap existente. Un fallo global de SLDB puede mostrarse
en el shell aunque Deskops esté disponible de forma independiente.

Esta guía materializa
[`atom-deskops-workflow-views-delegate-state-and-gates-to-deskops`](../desk/atoms/atom-deskops-workflow-views-delegate-state-and-gates-to-deskops.md).
