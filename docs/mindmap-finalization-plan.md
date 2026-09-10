# Plan para finalizar el editor Mindmap / SLDB

Este documento reúne el objetivo, las decisiones y el orden de trabajo para
terminar el editor. La regla central es que el frontend no debe inventar un
segundo modelo de datos: todas las vistas representan los mismos modelos y
documentos de SLDB.

## Resultado esperado

El producto final es un editor visual de una KB SLDB que permite pensar,
organizar y editar conocimiento desde un mismo mapa. El usuario puede capturar
ideas, convertirlas en documentos SLDB, organizar contención, conectar
documentos, editar fichas y editar clases desde la interfaz.

Hay un solo modelo de datos:

```text
SLDB store
├── modelos / clases
│   ├── campos
│   ├── templates
│   └── relaciones permitidas
└── documentos
    ├── payload validado
    ├── relaciones y contención
    └── metadatos de vista
```

Brainstorm, KB, estructura de clases y documentos son proyecciones o editores
distintos sobre ese mismo store.

## Vistas del producto

### Brainstorm (feature nueva)

Es la vista de captura rápida, cercana a MindMup.

- El nodo muestra solo emoji, color y título.
- El nodo es una caja plana y redondeada.
- Enter crea un hermano y Tab crea un hijo.
- La creación pide inicialmente solo título y clase.
- Mover nodos cambia la disposición, no inventa relaciones horizontales.
- La jerarquía visual representa contención.
- Una idea se puede abrir luego como documento SLDB real.

Esta vista todavía no existe en `frontends/mindmap/`. Debe tener un estado de
trabajo propio para capturas que aún no son documentos SLDB. La conversión a KB
debe ser una operación explícita y validada; cerrar o recargar no debe perder
capturas sin avisar.

### KB

Es la vista operativa del conocimiento.

- Los contenedores se ven como contenedores.
- Las relaciones horizontales se ven como líneas etiquetadas.
- Las referencias de SLDB son la fuente de esas líneas.
- El mini-toolbar permite agregar hijo, hermano, editar y conectar.
- La conexión elige un campo de relación válido del modelo origen.
- El usuario puede entrar al foco de un contenedor y volver mediante breadcrumbs.

### Estructura de clases

Es el editor del contrato SLDB.

- Lista clases registradas.
- Muestra campos, tipos, obligatoriedad y descripción.
- Muestra contención y relaciones permitidas.
- Edita template y campos mediante drafts.
- Muestra documentos afectados antes de promover un cambio.
- Valida el draft con SLDB y solo después permite promoverlo.

### Documento

La ficha completa vive en un modal.

- El mapa no muestra todos los campos.
- El modal muestra primero los campos principales y agrupa el resto.
- Los campos obligatorios se validan usando el schema real de SLDB.
- Las relaciones se editan como referencias cuando el tipo lo permite.
- Cancelar no modifica el documento.

## API y responsabilidades

El frontend maneja interacción, estado transitorio y proyección visual. El
backend del editor debe ser un adaptador del API de SLDB.

El orden de preferencia, verificado contra SLDB v1 y `sldb-ui`, es:

1. API Python pública de SLDB, cuando la operación exista.
2. CLI pública y documentada de SLDB.
3. Gateway HTTP existente de `sldb-ui`, que envuelve esa CLI pública.
4. Operaciones internas de store solo dentro de un adaptador transitorio y con
   deuda explícita.

No se escriben índices directamente desde `graph_ui`. Si SLDB no ofrece una
operación equivalente, se reduce el alcance o se implementa la capacidad en el
sucesor vigente del motor. El repositorio SLDB v1 está congelado y no recibe
features nuevas.

No se deben duplicar en `graph_ui` las reglas de validación, hash, tracking,
reindexación o promoción de modelos que pertenecen a SLDB.

`sldb serve` expone `GET /schema`, `GET /graph`, `GET /kgdb/snapshot` y
`POST /save`; `/save` cubre actualización de documentos existentes. El ciclo
de modelos está disponible en la CLI pública. Además, `sldb-ui` ya expone
detalle de modelos y validación/promoción a través de su gateway a esa CLI.
Para completar el producto hay que reutilizar o extender esas superficies para
estas operaciones:

- crear y trackear un documento;
- eliminar o destrackear un documento;
- generar una clase nueva con `models create` y registrarla explícitamente;
- editar el template mediante draft con `models template edit`;
- añadir y quitar campos mediante draft con `models fields add/remove`;
- validar y promover con `models validate [--promote] --format json`;
- obtener un reporte completo de impacto cuando existan documentos inválidos.

SLDB v1 todavía no ofrece edición directa de tipo, descripción, default u
obligatoriedad de un campo existente, descarte explícito de drafts, reporte
completo de impacto ni política de migración para renombrar, cambiar tipo o
eliminar campos. Esas capacidades no se simulan editando Python o índices desde
el frontend.

## Compilador JSON → SLDB

El JSON es una representación declarativa para importar, exportar y probar el
mapa. No debe convertirse en un segundo almacén permanente.

```text
JSON
  ↓ validar contrato de entrada
adaptador del API SLDB
  ↓ crear / actualizar modelos y documentos
SLDB valida, renderiza Markdown, actualiza hashes e índices
  ↓
proyección Mindmap
```

La primera versión en `frontends/mindmap/compiler.py` prueba la idea y tiene
tests, pero debe evolucionar para:

- dejar de llamar directamente clases internas de `sldb.cli.commands`;
- usar la API Python pública cuando exista y, para el ciclo de modelos, la CLI
  pública mediante un gateway;
- separar `validate`, `dry-run` y `apply`;
- informar cambios, conflictos y documentos afectados antes de escribir;
- tratar referencias a modelos existentes como operación principal;
- tratar modelos nuevos como una operación explícita de schema;
- rechazar sobrescrituras cuando cambió el documento fuera de la sesión;
- devolver un reporte JSON estable para la UI.

Contrato sugerido:

```json
{
  "version": 1,
  "models": [{
    "name": "BoardDoc",
    "ref": "deskops.models.board:BoardDoc",
    "draft": {"fields": [], "template": null}
  }],
  "documents": [{
    "id": "main-board",
    "model": "BoardDoc",
    "payload": {"title": "Main board"}
  }],
  "view": {"positions": {}, "collapsed": []}
}
```

El compilador debe ofrecer tres modos:

- `validate`: no escribe y devuelve errores y advertencias;
- `dry-run`: calcula altas, cambios, conflictos e impacto;
- `apply`: ejecuta operaciones de SLDB y devuelve el estado resultante.

## Orden de implementación

### 1. Congelar el contrato de datos

- Definir el JSON de intercambio y su versión.
- Definir identidad, título, contención y relación.
- Definir referencias simples, listas y relaciones inversas.
- Definir posición y plegado como metadatos de vista.
- Validar ese contrato.

Termina cuando un fixture JSON represente una KB pequeña sin ambigüedades.

### 2. Consolidar el adaptador SLDB

- Identificar el API público real de la versión usada.
- Crear un módulo único para schema, graph, create, update, delete y drafts.
- Eliminar accesos duplicados desde `serve.py`, `persistence.py` y el compilador.
- Propagar validación, conflictos y locks con códigos claros.
- Mantener control optimista mediante revisión o hash.

Termina cuando UI y compilador usan el mismo adaptador.

### 3. Separar captura rápida de Brainstorm

La captura rápida dentro de KB ya existe parcialmente: hay creación con título,
Enter/Tab y acciones de hijo/hermano. Ese flujo se termina y se prueba como
parte de KB, pero no se debe confundir con Brainstorm.

### 4. Construir Brainstorm desde cero

- Crear estado y proyección para ideas todavía no persistidas como documentos.
- Implementar nodos de título, emoji y color.
- Implementar Enter para hermano y Tab para hijo.
- Permitir disposición libre horizontal y vertical.
- Mostrar claramente qué ideas están sin convertir.
- Convertir una idea o un subárbol a documentos SLDB.
- Elegir clase y aplicar defaults durante la conversión.
- Validar la conversión completa antes de escribir.
- Guardar el borrador de Brainstorm o advertir antes de descartarlo.

Termina cuando una captura de diez ideas pueda convertirse en una KB válida sin
copiar títulos manualmente.

### 5a. Terminar la captura rápida dentro de KB

- Mantener la creación rápida de documentos escribiendo solo el título.
- Hacer que Enter y Tab no abran formularios innecesarios.
- Elegir la clase con una acción rápida.
- Aplicar defaults válidos antes de guardar.
- Guardar layout y plegado.
- Evitar relaciones implícitas por mover nodos.

Termina cuando se puedan capturar diez nodos en KB y recargarlos sin pérdida.

### 5b. Terminar la visualización de KB

- Diferenciar visualmente contención y relación.
- Dibujar etiquetas de relación.
- Mostrar clase mediante color y emoji consistentes.
- Mantener leyenda permanente en sidebar.
- Mejorar selección, foco, breadcrumbs y navegación.
- Mostrar cambios sin guardar.

Termina cuando una KB con contenedores y links se entienda sin abrir fichas.

### 6. Terminar edición de documentos

- Abrir ficha desde nodo y mini-toolbar.
- Crear rápido con título y defaults válidos.
- Editar campos completos en modal.
- Validar contra schema real.
- Resolver referencias mediante búsqueda de documentos.
- Manejar conflictos de revisión y mostrar la versión actual.

Termina cuando crear, editar, conectar, recargar y reabrir un documento sea estable.

### 7. Implementar el alcance de edición de clases soportado por SLDB

La verificación contra SLDB v1 y `sldb-ui` está hecha:

- La CLI pública implementa drafts para template y campos.
- `models fields add/remove` y `models template edit` escriben un archivo
  `*.py.temp` sin modificar el modelo activo.
- `models validate --format json` valida el contrato y los documentos
  rastreados; el recorrido se detiene en el primer documento inválido.
- `models validate --promote` instala el draft, incrementa la versión y ejecuta
  la actualización de hashes e índices.
- `sldb-ui` ya expone detalle y validación de modelos. Su endpoint de validación
  acepta `promote`, aunque la pantalla todavía no ofrece esa acción.
- No hay API Python pública para el ciclo de modelos y `sldb serve` no lo expone.
  El contrato reutilizable actual es la CLI pública.

Primera entrega, sobre capacidades existentes:

- Crear la vista de clases y campos a partir del schema real.
- Reutilizar o extender el gateway de `sldb-ui`; no importar clases
  `sldb.cli.commands` desde el frontend ni reimplementar sus reglas.
- Editar template mediante draft.
- Añadir y quitar campos mediante draft.
- Mostrar la validación devuelta por SLDB y los documentos alcanzados.
- Promover únicamente después de una validación exitosa y una confirmación
  explícita del usuario.
- Refrescar schema, versión y UI después de promover, sin reiniciar el servidor.

Alcance diferido hasta que el motor tenga contratos explícitos:

- editar tipo, descripción, default u obligatoriedad de un campo existente;
- renombrar campos;
- descartar drafts mediante una operación pública;
- mostrar el impacto completo después del primer documento inválido;
- migrar payloads por cambios o eliminación de campos;
- garantizar rollback si falla la promoción después de reemplazar el modelo.

Termina su primera entrega cuando se pueda editar un template o añadir/quitar un
campo, validar todos los documentos que SLDB alcance, promover el draft y usar
el nuevo contrato en el modal. Las operaciones diferidas permanecen
deshabilitadas y explicadas en la UI.

### 8. Integrar el compilador

- Agregar endpoints o servicios al adaptador SLDB.
- Implementar `validate`, `dry-run` y `apply`.
- Añadir importación desde JSON.
- Añadir exportación de la proyección actual.
- Mostrar el reporte de compilación en la UI.
- Recuperar claramente fallos parciales.

Termina cuando un JSON exportado compile en otra KB compatible y produzca el
mismo grafo lógico.

### 9. Pruebas y cierre

- Tests de proyección y jerarquía.
- Tests del adaptador SLDB.
- Tests de round-trip JSON → SLDB → graph.
- Tests de conflictos de guardado.
- Tests de drafts inválidos y promoción.
- Tests de creación rápida, conexión y foco con navegador.
- Prueba manual con una KB pequeña y otra grande.
- Documentar ejecución local, otra KB y recuperación de errores.

## Criterios de aceptación

El trabajo está terminado cuando:

1. Se pueden crear diez ideas en Brainstorm con teclado sin abrir una ficha.
2. Se pueden convertir esas ideas en documentos SLDB válidos.
3. La captura rápida de KB permite agregar hijos y hermanos desde el mini-toolbar.
4. Se pueden conectar documentos usando un campo de relación real.
5. Se distinguen contención, relaciones y clases por la UI.
6. Se puede editar cualquier documento desde un modal.
7. La edición de clases habilita solo operaciones soportadas por la CLI pública;
   las migraciones y mutaciones sin contrato permanecen deshabilitadas.
8. Un error de validación no confirma cambios parciales.
9. Dos sesiones concurrentes producen un conflicto explícito.
10. Exportar y recompilar conserva documentos, clases, relaciones y layout.
11. Todas las escrituras pasan por operaciones de SLDB.
12. La UI no mantiene un modelo paralelo que pueda divergir del store.

## Priorización si hay que recortar

El núcleo que debe mantenerse es: adaptador SLDB único, captura rápida de KB,
edición modal, relaciones, guardado con conflictos y pruebas de round-trip.

El primer recorte razonable del editor de clases es implementar solo template,
alta/baja de campos, validación y promoción sobre la CLI pública; se posponen
mutaciones de campos existentes y migraciones. El segundo es posponer
exportación y recompilación completa de JSON. Brainstorm sigue siendo una
feature importante, pero puede salir inicialmente solo con captura y conversión
a documentos; el layout avanzado y la edición de color/emoji pueden venir
después.

## Estado actual

Ya existe una base funcional del editor Mindmap/KB con creación rápida, modal de
documentos, conexiones, foco, leyenda de clases, persistencia y tests de modelo.
También existe una primera versión del compilador JSON y documentación de
desarrollador y usuario.

Avance del plan:

- **Paso 1 (contrato de datos): listo.** `frontends/mindmap/contract.py`
  congela la versión 1 del JSON de intercambio y `fixtures/kb-small.json` es
  el fixture canónico; los tests viven en `tests/test_mindmap_contract.py`.
- **Paso 2 (adaptador SLDB): listo.** `frontends/mindmap/sldb_adapter.py` es el
  único módulo que importa internos de SLDB; `serve.py`, `persistence.py` y
  `compiler.py` ya lo usan (regla vigilada por test). El compilador ofrece
  `validate_source` y `plan_source` (dry-run) además de `compile_json`.
- **Paso 5a (captura rápida en KB): listo.** El adaptador enriquece `/api/schema`
  con los defaults reales de cada campo; `quickPayload`/`defaultsFor` en
  `model.mjs` construyen payloads válidos con solo título (verificado contra
  los 17 modelos del store). Enter/Tab/`＋ Hijo`/`＋ Hermano` abren un diálogo
  mínimo de captura; `＋ Documento` mantiene la ficha completa. Prueba E2E:
  `python3 tests/e2e_mindmap_quick_capture.py` (10 nodos con teclado,
  guardado, recarga sin pérdida). Requirió añadir `__template__` a
  `PrimitiveDoc` en deskops (no renderizaba Markdown y fallaba el round-trip).
- **Paso 5b (visualización de KB): listo.** Contención = grupos anidados con
  cabecera; referencias = aristas punteadas de bajo peso con flecha y etiqueta
  del campo; leyenda permanente de clases en sidebar con conteos; foco con
  breadcrumbs; estado de cambios sin guardar. Verificado con captura
  (`shot-references.png`) y test de proyección.
- **Correcciones técnicas posteriores (cola del revisor): listas.**
  `plan_source` valida payloads contra SLDB y reporta cambios reales
  (`creates/updates/unchanged/conflicts/invalid_payloads`), incluso con store
  inexistente; limpia `sys.modules` del módulo temporal entre dry-runs. El
  contrato valida referencias por completo (campo, kind,
  target_model y cross-check contra modelos/campos declarados). Los metadatos
  de grafo (`__containment__`/`__references__`) se declaran en los modelos
  SLDB/deskops y se exponen por el schema del adaptador; `model.mjs` los usa
  vía `graphMaps()` con fallback legacy **por modelo** (un store mixto no
  pierde contención). E2E endurecido: selección determinista del contenedor
  por título, fallo explícito si el servidor no responde, integrado a pytest.
  Bug sutil corregido: `{}`/`[]` son truthy en JS; tanto `graphMaps` como
  `childOptions` confundían declaración vacía con ausencia.
- **Paso 6 (edición de documentos): listo.** El modal resuelve referencias
  mediante búsqueda de documentos (`ReferenceField` con chips y matches por
  título/ID/path), valida requeridos y enums client-side contra el schema,
  aplica defaults reales y cancela sin tocar el documento. El conflicto de
  revisión muestra un diálogo con la versión local y la actual de SLDB por
  documento, con salidas explícitas: "Mantener mis cambios" (retry =
  sobrescritura consciente) y "Descartar y recargar". E2E:
  `tests/e2e_mindmap_doc_edit.py` (búsqueda → persistencia en SLDB y ciclo
  completo de conflicto en dos rondas). El compilador emite
  `__references__`/`__containment__` desde el contrato; el contrato valida
  `containment` con cross-check. Ambos E2E corren dentro de la suite
  (`python_files` incluye `e2e_*.py`).
- **Paso 7 (edición de clases): superficie verificada y alcance dividido.**
  SLDB v1 ya ofrece por CLI pública drafts de template, alta/baja de campos,
  validación JSON y promoción con versión/reindexado. `sldb-ui` ya envuelve
  detalle y validación/promoción. La primera entrega puede reutilizar ese camino;
  edición de atributos de campos, impacto completo, migraciones y rollback quedan
  diferidos porque el motor no ofrece esos contratos.
- Deuda reconocida: la atomicidad de escritura sigue siendo mejor-esfuerzo
  (reporta `completed` sin rollback); los `except Exception` amplios del
  adaptador; el test de imports no cubre imports dinámicos. El uso de
  DocCLI/ModelCLI como fachada persiste. Para el ciclo de modelos nuevo se debe
  usar la CLI pública mediante un gateway, no importar esas clases internas.
- **Paso 8 (integración del compilador): listo.** Los endpoints
  `POST /api/validate|plan|compile|export` tienen cobertura HTTP real
  (`tests/test_mindmap_endpoints.py`: servidor real + 413/403/400/409/422), el
  round-trip export → plan contra store vacío demuestra conservación de
  documentos, altas y layout, y el E2E Playwright
  (`tests/e2e_mindmap_compiler.py`) importa el fixture desde el
  `CompilerDialog` (Validar → plan → Aplicar) y captura el export del
  navegador. Se corrigió de paso el caso de store sin inicializar: la UI ahora
  muestra 'Tu KB está vacía' en vez de un error y el token del plan lo trata
  como KB vacía.

Lo pendiente de mayor prioridad es construir Brainstorm (paso 4) y luego implementar la primera entrega acotada de edición de clases sobre la CLI
pública ya verificada. Las migraciones de modelos se retoman únicamente cuando
el motor vigente exponga contratos para impacto completo y transformación de
payloads. Hasta completar eso, el editor debe considerarse una base funcional y
no el producto final.
