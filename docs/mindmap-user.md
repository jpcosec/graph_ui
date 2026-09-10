# KB Mindmap: guía de uso

KB Mindmap permite explorar y editar documentos de una KB SLDB como un mapa.
Cada caja representa un documento. El emoji, el color y el borde indican la
clase del documento; la leyenda de la izquierda muestra todas las clases y sus
recuentos.

## Moverse por el mapa

- Arrastra el lienzo para desplazarte.
- Usa los controles de la esquina para acercar, alejar y encuadrar.
- Usa el minimapa para ubicarte en KB grandes.
- `Ver todo` muestra la KB completa.
- `Lectura` vuelve a un encuadre cómodo para leer los títulos.
- Escribe en `Buscar documento…` y pulsa Enter para centrar un documento.
- Pulsa una clase en la leyenda para filtrar temporalmente sus documentos.

## Tirar nodos

Pulsa `＋ Documento`. Elige la clase con su icono y color y escribe solamente
el título. El ID se genera automáticamente a partir del título. El documento
aparece de inmediato en el mapa como cambio sin guardar.

Para añadir contenido dentro de un contenedor:

1. Selecciona un Board, Routine u otra caja que tenga contención.
2. Pulsa `＋ Hijo` en la mini barra.
3. Elige la clase disponible para ese contenedor.
4. Escribe el título y pulsa `Añadir documento`.

Para crear otro documento al mismo nivel, selecciona una caja y pulsa
`＋ Hermano`. El nuevo documento conserva el mismo padre y el mismo campo de
contención.

También puedes usar `Tab` para añadir un hijo y `Enter` para añadir un hermano.
Estas teclas y los botones `＋ Hijo`/`＋ Hermano` abren la **captura rápida**:
un diálogo mínimo donde solo eliges la clase y escribes el título. Los demás
campos parten con los defaults válidos del modelo y los completas después con
✎ Editar. Si la clase no tiene un campo de contención compatible, el botón de
hijo queda desactivado. El botón `＋ Documento` abre la ficha completa por si
quieres rellenar más desde el inicio.

## Editar la ficha en modal

Haz doble clic en una caja o pulsa `✎ Editar` en su mini barra. La ficha se
abre como modal y muestra la clase, el título, los campos esenciales y una
sección `Más campos` con el resto del modelo SLDB.

En una creación rápida solo se pide el título. Los otros campos parten con
valores vacíos o defaults válidos. Después puedes abrir la ficha, completar
objetivo, alcance, estado, referencias, validación y cualquier otro campo, y
aplicar los cambios.

Pulsa `Cancelar` o Escape para cerrar sin aplicar la edición de la ficha.

En una ficha, los campos de referencia (relaciones y contención declaradas por el
modelo) se editan con **búsqueda de documentos**: escribe parte del título o ID,
elige entre las coincidencias y la referencia queda como chip. Para listas,
puedes agregar varias y quitarlas con `×`.

## Conectar documentos

1. Selecciona el documento de origen.
2. Pulsa `⌁ Conectar`.
3. Selecciona el documento destino.
4. Elige el campo de relación que debe guardar esa referencia.
5. Pulsa `Conectar` en el modal.

La relación queda marcada como cambio sin guardar. Activa `Referencias` para
ver las líneas del mapa y pulsa `Guardar en SLDB` para persistirla.

## Contenedores y modo foco

Las cajas grandes representan documentos que contienen otros. Usa `▾` para
plegar su contenido y `▸` para expandirlo. Haz doble clic en una caja contenedora
o pulsa `↳ Entrar` para entrar en modo foco. El breadcrumb superior muestra
en qué contenedor estás; pulsa `Salir del foco` para volver a la KB completa.

## Guardar

`Guardar en SLDB` o `Ctrl+S` escribe los documentos Markdown y actualiza los
índices de la KB. El estado superior indica si hay cambios pendientes.

Si otra sesión modificó el mismo documento, el guardado se rechaza para no
pisar su trabajo y aparece un diálogo de conflicto que compara tu versión con
la actual en SLDB. `Mantener mis cambios` cierra el diálogo (guardar de nuevo
sobrescribe conscientemente) y `Descartar mis cambios y recargar` restaura la
versión del servidor. `↶` y `↷` permiten deshacer y rehacer cambios locales
antes de guardar.

Quitar una caja la elimina del índice al guardar y limpia sus referencias;
el archivo Markdown original se conserva en disco.
