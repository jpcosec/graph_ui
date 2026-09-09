# Mindmap: Brainstorm, KB y estructura de conocimiento

## Estado

Propuesta implementable para `graph_ui`. Define la separación entre el mapa de
ideas, la KB persistente y el esquema de clases/documentos.

## Objetivo

El editor debe permitir pensar una estructura antes de convertirla en una KB.
La experiencia rápida del mapa no debe exigir conocer los modelos SLDB, pero la
conversión posterior debe conservar la intención de jerarquía y relaciones.

```text
Brainstorm
  ↓ convertir y clasificar
KB
  ├── contenedores y jerarquía
  ├── relaciones horizontales
  └── documentos
        └── clase, campos y payload

Schema / Documentos
  ├── estructura de clases
  └── fichas concretas
```

`Schema / Documentos` puede aparecer como modo separado de inspección, aunque
sus documentos sean los mismos que se visualizan en el modo KB.

## Modo Brainstorm

Brainstorm es un mapa libre para pensar. Sus nodos son ideas, no documentos
SLDB. Cada nodo contiene como mínimo:

```json
{
  "id": "idea-123",
  "title": "Revisar onboarding",
  "color": "#2563eb",
  "emoji": "💡",
  "parent_id": "idea-root",
  "position": {"x": 320, "y": 180}
}
```

Reglas de interacción:

- `Enter` crea un hermano.
- `Tab` crea un hijo.
- Escribir después de crear edita el título.
- `Escape` cancela una idea vacía.
- Arrastrar cambia la posición sin alterar la intención jerárquica.
- La orientación horizontal o vertical es una preferencia de presentación.
- La jerarquía se expresa por padre/hijo y por la posición del mapa.
- No existen clases SLDB, campos obligatorios, `RelationDoc` ni transclusiones.
- Un enlace visual provisional puede existir para orientar el pensamiento, pero
  no se interpreta como relación persistente.

El modo debe tener una interfaz mínima: canvas, zoom, undo/redo, búsqueda y
toolbar contextual. La leyenda de clases y el formulario de documentos no deben
ocupar la pantalla.

## Conversión de Brainstorm a KB

La acción principal es `Convertir a KB`. Se puede convertir un nodo, un
subárbol o todo el mapa. El sistema debe:

1. Conservar el título.
2. Conservar la jerarquía como propuesta de contención.
3. Proponer una clase cuando haya contexto suficiente.
4. Permitir cambiar la clase antes de crear el documento.
5. Generar IDs estables a partir del título y resolver colisiones.
6. Abrir la ficha solo si faltan decisiones importantes.
7. Crear las relaciones de contención después de crear los documentos.
8. Mantener un vínculo entre la idea original y el documento creado.

La conversión no debe inventar relaciones horizontales. La proximidad visual o
una línea del brainstorm solo se convierte en relación cuando el usuario la
confirma y elige el tipo/campo correspondiente.

Un nodo ambiguo puede convertirse como `InboxNoteDoc`, `PrimitiveDoc` o una
clase equivalente disponible en la KB.

## Modo KB

KB muestra documentos reales del store SLDB. Los nodos representan documentos y
solo muestran emoji de clase, título, color/borde e indicador de hijos.
La ficha completa aparece en un modal.

### Jerarquía

La jerarquía se representa con contenedores anidados. Por ejemplo, un Board
contiene tareas/pills/rituales, una Routine contiene pasos/condiciones/
operadores/edges y una Task contiene checklists/pills/atoms.

Los contenedores se pliegan y expanden. Entrar activa modo foco con breadcrumb:

```text
Mapa completo › Board de operaciones › Tarea de onboarding
```

### Relaciones horizontales

Las relaciones que no son contención se dibujan como líneas entre documentos y
deben distinguirse visualmente:

- contención: grupo y relación espacial;
- referencia: línea punteada o de bajo peso visual;
- transclusión: línea etiquetada cuando el modelo la soporte.

Las referencias están ocultas inicialmente en mapas grandes y se activan con
`Referencias`.

### Creación y edición

Crear un nodo en KB requiere elegir la clase y escribir el título. Los demás
campos parten con defaults válidos y se completan después en la ficha modal.
`Hijo` propone solo clases válidas para el contenedor; `Hermano` conserva el
padre y el campo de relación.

Conectar debe ser explícito: seleccionar origen, pulsar `Conectar` o arrastrar
desde el nodo, seleccionar destino, elegir un campo/tipo compatible y confirmar.
La conexión se guarda en el payload o como documento de relación según el
modelo; nunca queda solo como una línea local después de guardar.

## Modo Schema / Documentos

### Estructura de clases

Debe mostrar nombre, emoji/color, modelo registrado, campos y tipos,
obligatoriedad, enums, clases permitidas como hijos, campos de referencia y
cardinalidades cuando estén declaradas. La información proviene de `/api/schema`
y no se duplica a mano en la UI.

### Documentos

Debe mostrar los documentos de una clase y abrir la ficha completa de cada
instancia. La edición usa los validadores nativos de SLDB. El nodo del mapa y
el documento de esta vista deben referenciar la misma instancia.

## Persistencia

Brainstorm puede persistirse como borrador independiente antes de existir una
KB. Debe conservar ideas, posiciones, colores, emoji y jerarquía.

KB y Schema/Documentos escriben mediante SLDB: crean/actualizan Markdown,
actualizan índices, validan contra el modelo y guardan posiciones/plegado como
estado de vista separado.

El guardado usa control de concurrencia. Si el documento o la vista cambiaron
desde la lectura, se rechaza el lote y se pide recargar; no se sobrescribe
silenciosamente otra edición.

## Estados y transiciones

```text
Idea
  ├── editar título/color/emoji
  ├── mover dentro del brainstorm
  ├── convertir a documento candidato
  └── eliminar

Documento candidato
  ├── elegir clase
  ├── completar ficha
  ├── guardar en KB
  └── volver a idea sin materializar

Documento KB
  ├── editar ficha
  ├── añadir hijo/hermano
  ├── conectar
  ├── plegar/expandir
  └── eliminar o desasociar
```

## Invariantes

- Brainstorm no modifica SLDB hasta convertir y guardar.
- Un documento KB siempre tiene una clase registrada.
- La jerarquía no se infiere únicamente por coordenadas en modo KB.
- Una relación presentada como persistente debe existir en SLDB.
- El título basta para iniciar una creación rápida, pero no reemplaza la
  validación final del modelo.
- La ficha modal es la fuente de verdad para los campos del documento.
- Posición, plegado y zoom son estado de presentación, no contenido.
- Undo/redo funciona antes de guardar y el usuario ve cambios pendientes.

## Criterios de aceptación

- En Brainstorm se pueden crear 20 ideas sin elegir clases ni abrir modales.
- Enter y Tab crean hermanos e hijos consistentemente.
- Un subárbol se convierte a KB conservando títulos y jerarquía.
- En KB se distingue contención de referencias horizontales.
- Crear un documento requiere como máximo elegir clase y escribir título.
- Editar muestra todos los campos del modelo en un modal.
- Una conexión confirmada sobrevive a guardar y recargar.
- Entrar y salir de un contenedor conserva selección y vista global.
- La estructura de clases refleja `/api/schema` sin clases hardcodeadas.
- Un conflicto de guardado se muestra y conserva el trabajo local.
