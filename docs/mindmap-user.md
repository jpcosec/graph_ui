# KB Mindmap: guía de uso

KB Mindmap permite explorar y editar documentos de un store SLDB/pron como un
mapa. La barra superior alterna entre tres vistas: **🗺 KB** (esta guía la
cubre primero), **💡 Brainstorm** (ideación libre antes de escribir nada en
el store) y **📐 Schema** (diagrama de las clases del store) — las dos
últimas se describen más abajo. Cada vista es también una URL
(`/documents/map`, `/draft/tree`, `/models/diagram`) que puedes guardar como
favorito o compartir; entrar por `/` abre la última vista que visitaste. El
botón **📐 Editar clases** (barra lateral de KB, o desde cualquier card del
Schema) abre el editor del contrato de las clases mismas, no de sus
documentos.

## Tema

El botón **◐** de la barra superior alterna entre tema claro y oscuro; la
elección se recuerda entre sesiones. Los colores de cada clase de documento
son los mismos en ambos temas — solo cambia el fondo, no la identidad visual
de las clases.

En modo KB, cada caja representa un documento. El emoji, el color y el borde
indican la clase del documento; la leyenda de la izquierda muestra todas las
clases y sus recuentos.

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
índices de la KB. El estado superior indica si hay cambios pendientes. Este
botón y el atajo solo existen en la vista **🗺 KB**: Brainstorm y Schema no
lo muestran (Brainstorm escribe al store con `Convertir a SLDB`; Schema es
de solo lectura).

Si otra sesión modificó el mismo documento, el guardado se rechaza para no
pisar su trabajo y aparece un diálogo de conflicto que compara tu versión con
la actual en SLDB. `Mantener mis cambios` cierra el diálogo (guardar de nuevo
sobrescribe conscientemente) y `Descartar mis cambios y recargar` restaura la
versión del servidor. `↶` y `↷` permiten deshacer y rehacer cambios locales
antes de guardar.

Quitar una caja la elimina del índice al guardar y limpia sus referencias;
el archivo Markdown original se conserva en disco.

## Brainstorm

Pulsa **💡 Brainstorm** en la barra superior para pensar en ideas sueltas
antes de decidir su clase. No toca el store hasta que conviertes: el
borrador vive solo en tu navegador (`localStorage`), así que cerrar o
recargar no pierde nada — pero el navegador te avisa si quedan ideas sin
convertir antes de dejar la página.

- `＋ Idea raíz` o `＋ Primera idea` crean el primer nodo.
- `Enter` con una idea seleccionada crea un hermano; `Tab` crea un hijo. La
  jerarquía visual es la contención que se propondrá al convertir.
- Doble clic renombra. El icono a la izquierda de cada idea cambia de emoji
  con un clic.
- El selector `Clase…` de cada idea es opcional mientras piensas, pero
  obligatorio (junto con el título) para que esa idea se pueda convertir.
- `×` descarta una idea individual (y a sus hijos). `Descartar borrador`
  (con confirmación) vacía todo el lienzo.
- `Convertir a SLDB` valida las ideas con título y clase, calcula un plan
  contra el store real y, si no hay conflictos, escribe los documentos. Las
  ideas convertidas quedan marcadas con ✓ en el propio lienzo — no
  desaparecen — y la vista KB se recarga con los documentos nuevos.
- Ideas sin título o sin clase se listan como pendientes y no se convierten;
  el resto del lote sí se convierte.

## Schema

Pulsa **📐 Schema** en la barra superior para ver las clases del store como
un diagrama, en vez de sus documentos. Cada card es una clase registrada:

- Cabecera con icono, nombre, identificador del modelo y cuántos documentos
  de esa clase hay en el store.
- Una fila por campo con su tipo; `*` marca los obligatorios. Pasa el cursor
  sobre una fila para leer la descripción del campo.
- Las filas **◆** son campos de contención: guardan IDs de documentos de las
  clases que muestran a la derecha. Cada una tiene un puerto en su borde
  derecho del que sale la flecha hacia esas clases, etiquetada con el nombre
  del campo — así se ve qué campo concreto sostiene cada relación.
- Las filas **⇢** son campos de referencia: guardan IDs de documentos, pero
  el modelo no declara de qué clase. Si algún documento real de esa clase
  tiene valores en ese campo, el destino se infiere escaneándolos: la fila
  muestra la(s) clase(s) inferida(s) con un `?` (p. ej. `SpecDoc?`) y saca
  su propio puerto, coloreado distinto al de contención, con una flecha
  punteada hacia esa clase. Si no hay documentos que lo prueben, la fila se
  queda solo anotada, sin flecha.
- Además de la contención, cabecera a cabecera puede haber **flechas de
  relación** (color de acento): un tipo declarado por un `RelationTypeDoc`
  de kgdb (origen → destino entre clases) y/u observado en documentos de
  relación (`RelationDoc`, con `source_id`/`target_id`/tipo) reales del
  store. La etiqueta lleva el nombre del tipo y cuántas instancias se
  observaron (`implements ×36`); si el tipo está declarado pero el store no
  tiene ninguna instancia todavía, la flecha se dibuja punteada con `×0`
  implícito. Una relación observada sin ningún `RelationTypeDoc` que la
  declare se dibuja igual — la instancia real es prueba suficiente.
- La barra superior resume la card: `N clases · M campos` y, solo si hay
  alguna, `C contenciones · R relaciones · F referencias`.
- Escribe en `Filtrar clase, campo o tipo…` para atenuar todo lo que no
  coincida (busca en nombres de clase, campos, tipos, clases destino
  declaradas o inferidas, y tipos de relación).
- Clic en una card resalta sus flechas; doble clic o `✎ Editar` abre
  **Editar clases** ya posicionado en esa clase. `⛶ Ver todo` reencuadra.

La disposición se calcula sola a partir del esquema; arrastrar cards solo
reordena la sesión actual, no se guarda.

## Editar clases

El botón **📐 Editar clases** de la barra lateral (modo KB), o el doble
clic / `✎ Editar` sobre una card del Schema, abre el editor del contrato de
una clase — no de sus documentos. Selecciona una clase de la lista para ver
sus campos, tipo, obligatoriedad, default y descripción.

- Cada fila tiene un botón `×` para quitar ese campo de un draft en curso.
  La fila inferior de la tabla agrega un campo nuevo (`name`, tipo, default,
  descripción) al draft.
- `Template` (desplegable) permite reemplazar el Markdown de plantilla de la
  clase directamente.
- Cualquier cambio queda como **draft** — no afecta documentos existentes
  todavía. `Validar draft` corre esos documentos contra el draft sin
  escribir nada; el resultado lista qué documentos pasarían y cuáles no.
- `Promover draft` solo se habilita después de una validación exitosa (pide
  confirmación: "actualizará el modelo activo y los hashes de documentos").
  Promover aplica el draft como la versión activa de la clase al instante —
  sin reiniciar el servidor — y sube su número de versión.
- Un campo sin default es obligatorio: si la clase ya tiene documentos, la
  validación fallará hasta que le pongas uno o lo quites.
