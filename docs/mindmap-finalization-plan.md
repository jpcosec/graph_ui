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

### Brainstorm

Es la vista de captura rápida, cercana a MindMup.

- El nodo muestra solo emoji, color y título.
- El nodo es una caja plana y redondeada.
- Enter crea un hermano y Tab crea un hijo cuando la clase lo permite.
- La creación pide inicialmente solo título y clase.
- Mover nodos cambia la disposición, no inventa relaciones horizontales.
- La jerarquía visual representa contención.
- Una idea se puede abrir luego como documento SLDB real.

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

El orden de preferencia es:

1. API público de SLDB.
2. Operaciones de store expuestas por SLDB.
3. CLI de SLDB como compatibilidad.
4. Escritura directa de índices solo si SLDB no ofrece una operación equivalente.

No se deben duplicar en `graph_ui` las reglas de validación, hash, tracking,
reindexación o promoción de modelos que pertenecen a SLDB.

El API actual expone principalmente `GET /schema`, `GET /graph` y `POST /save`.
`/save` cubre actualización de documentos existentes. Para completar el producto
hay que exponer, o encapsular mediante la API pública equivalente, estas
operaciones:

- crear y trackear un documento;
- eliminar o destrackear un documento;
- crear un draft de modelo;
- editar campos y template del draft;
- validar y promover un draft;
- obtener el impacto del cambio sobre documentos existentes.

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
- usar el API público de SLDB como punto de entrada;
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

### 3. Terminar Brainstorm

- Crear nodos escribiendo solo título.
- Hacer que Enter y Tab no abran formularios innecesarios.
- Elegir clase con una acción rápida.
- Convertir una captura en documento válido.
- Guardar layout y plegado.
- Evitar relaciones implícitas por mover nodos.

Termina cuando se puedan capturar diez nodos y recargarlos sin pérdida.

### 4. Terminar la vista KB

- Diferenciar visualmente contención y relación.
- Dibujar etiquetas de relación.
- Mostrar clase mediante color y emoji consistentes.
- Mantener leyenda permanente en sidebar.
- Mejorar selección, foco, breadcrumbs y navegación.
- Mostrar cambios sin guardar.

Termina cuando una KB con contenedores y links se entienda sin abrir fichas.

### 5. Terminar edición de documentos

- Abrir ficha desde nodo y mini-toolbar.
- Crear rápido con título y defaults válidos.
- Editar campos completos en modal.
- Validar contra schema real.
- Resolver referencias mediante búsqueda de documentos.
- Manejar conflictos de revisión y mostrar la versión actual.

Termina cuando crear, editar, conectar, recargar y reabrir un documento sea estable.

### 6. Implementar edición de clases

- Crear vista de clases y campos.
- Editar template.
- Añadir y quitar campos mediante draft.
- Editar tipo, descripción, default y obligatoriedad.
- Mostrar documentos afectados.
- Ejecutar validación de SLDB.
- Promover solo con validación exitosa.
- Refrescar schema y UI después de promover.

Termina cuando se pueda añadir un campo, validar impacto y usarlo en el modal
sin reiniciar el servidor.

### 7. Integrar el compilador

- Agregar endpoints o servicios al adaptador SLDB.
- Implementar `validate`, `dry-run` y `apply`.
- Añadir importación desde JSON.
- Añadir exportación de la proyección actual.
- Mostrar el reporte de compilación en la UI.
- Recuperar claramente fallos parciales.

Termina cuando un JSON exportado compile en otra KB compatible y produzca el
mismo grafo lógico.

### 8. Pruebas y cierre

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

1. Se pueden crear diez ideas con teclado sin abrir una ficha completa.
2. Se pueden convertir en documentos SLDB válidos.
3. Se pueden agregar hijos y hermanos desde el mini-toolbar.
4. Se pueden conectar documentos usando un campo de relación real.
5. Se distinguen contención, relaciones y clases por la UI.
6. Se puede editar cualquier documento desde un modal.
7. Se puede editar una clase mediante draft, validar y promover.
8. Un error de validación no confirma cambios parciales.
9. Dos sesiones concurrentes producen un conflicto explícito.
10. Exportar y recompilar conserva documentos, clases, relaciones y layout.
11. Todas las escrituras pasan por operaciones de SLDB.
12. La UI no mantiene un modelo paralelo que pueda divergir del store.

## Estado actual

Ya existe una base funcional del editor Mindmap/KB con creación rápida, modal de
documentos, conexiones, foco, leyenda de clases, persistencia y tests de modelo.
También existe una primera versión del compilador JSON y documentación de
desarrollador y usuario.

Lo pendiente de mayor prioridad es consolidar el adaptador contra el API de
SLDB, implementar edición de clases desde frontend y conectar el compilador a
ese mismo camino. Hasta completar eso, el editor debe considerarse una base
funcional y no el producto final.
