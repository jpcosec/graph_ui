# Variables visuales: con qué se dibuja el significado

## Definición

Una representación gráfica codifica información con **marcas** (puntos, líneas, áreas) cuyo
aspecto varía según **variables visuales** (Bertin) o **canales** (Munzner). Jacques Bertin, en
*Sémiologie graphique* (1967), identificó siete:

| Variable | Qué varía |
|---|---|
| posición (dos dimensiones del plano) | dónde está la marca |
| tamaño | cuán grande es |
| valor | cuán clara u oscura |
| textura (grano) | la trama |
| color (tono) | el matiz |
| orientación | el ángulo |
| forma | el contorno |

Moody (2009) cuenta ocho, separando posición horizontal y vertical.

Bertin clasificó además qué puede transmitir cada variable según su **nivel de organización**:
**asociativa** (se perciben los símbolos como grupo pese a que difieran en esa variable),
**selectiva** (se aísla de inmediato un grupo de símbolos por un cambio en la variable), **ordenada** (el orden se lee sin leyenda) y **cuantitativa** (se
puede estimar la diferencia numérica). Solo la posición y el tamaño son cuantitativos; el color
(tono) es selectivo y asociativo pero no ordenado.

## Canales de Munzner: identidad y magnitud

Munzner (*Visualization Analysis and Design*, 2014) sintetiza esta tradición con dos principios:

- **Expresividad**: *"Visual encoding should express all of, and only, the information in the
  dataset attributes."*
- **Efectividad**: *"Importance of the attribute should match the salience of the channel."*

Y dos familias de canales, ordenadas por efectividad (fig. de p. 94):

| Canales de **magnitud** (atributos ordenados), de más a menos efectivo | Canales de **identidad** (atributos categóricos), de más a menos efectivo |
|---|---|
| posición en escala común | región espacial |
| posición en escala no alineada | color (tono) |
| longitud (1D) | movimiento |
| inclinación / ángulo | forma |
| área (2D) | |
| profundidad (posición 3D) | |
| luminancia del color, saturación | |
| curvatura, volumen | |

Para redes, Munzner distingue dos marcas de vínculo: **conexión** (una relación entre dos nodos) y
**contención** (jerarquía).

## Por qué importa aquí

Estas tablas dicen **qué canal usar para qué constructo**, y por eso son la base de la
clasificación del [eje 3](../03-diagrama-vocabulario/index.md). Cada carpeta de ese eje es un canal
dominante:

| Carpeta del eje 3 | Canal dominante | Tipo de canal |
|---|---|---|
| nodo-arista tipado | forma (del nodo, del terminal), conexión | identidad |
| anidamiento | contención, región espacial | identidad |
| posición | posición en escala común | magnitud |
| estado-bipartito | forma + regla de conexión | identidad |
| flujo | conexión dirigida + posición ordinal (orientación del recorrido) | identidad + magnitud |
| n-aria | forma (nodo de relación) + conexión con roles | identidad |
| matriz | posición en dos escalas categóricas (fila, columna) | identidad |
| árbol | contención o conexión + profundidad | identidad + magnitud |

Dos consecuencias:

1. **Un kind (clase, estado, generalización) es un atributo categórico**: le corresponden canales
   de identidad —forma, región, tono—, no de magnitud.
2. **Un campo ordenado (fecha, orden de un paso, madurez) merece posición**, el canal más
   efectivo. Si un vocabulario tiene un eje temporal y el diagrama lo tira a dagre, se desperdicia
   el mejor canal: es lo que pasa hoy en `graph_ui`, donde la posición no significa nada.

## Ejemplo en código: declarar campo → canal con Vega-Lite

Vega-Lite hace exactamente lo que un vocabulario necesita para un canal: nombra el campo del dato,
el canal y el **tipo de medida** del dato (`nominal`, `ordinal`, `quantitative`, `temporal`). Su
documentación define: *"The `encoding` property represents the mapping between encoding channels
and data fields, constant visual values, or constant data values."*

Archivo [`ejemplos/reservas.vl.json`](ejemplos/reservas.vl.json), con las reservas del mundo del
restaurante de `pron`:

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "mark": "point",
  "encoding": {
    "x": {"field": "start", "type": "temporal", "title": "hora"},
    "y": {"field": "table", "type": "nominal", "title": "mesa (assigned_to)"},
    "color": {"field": "status", "type": "nominal"},
    "size": {"field": "party_size", "type": "quantitative"},
    "tooltip": {"field": "reservation", "type": "nominal"}
  }
}
```

Validado contra el JSON Schema oficial de Vega-Lite v5 con `jsonschema.Draft7Validator`: 0
errores; como control, cambiar `"type": "quantitative"` por `"type": "cuantitativo"` produce 1
error.

La hora (ordenada) va a posición x; la mesa (categórica, viene del verbo `assigned_to`) a posición
y; el estado (categórico) a color; el tamaño del grupo (cuantitativo) a tamaño. Es una
representación de *posición* del eje 3, declarada en seis líneas.

Lo que Vega-Lite **no** tiene y un `VocabularyDoc` sí necesita: marcas de conexión y contención
(no dibuja grafos), kinds con símbolos propios, y el camino de vuelta (arrastrar un punto no edita
`start`).

## Aplicación a `pron` y `graph_ui`

- Un `VocabularyDoc` debería declarar, por constructo, **el canal y el tipo del dato** —como la
  `encoding` de Vega-Lite—, no un estilo suelto.
- `graph_ui` ya usa bien un canal de identidad: la clase de un documento se codifica con tono por
  *slot* (`shared/classes.mjs`). Los tipos de arista, en cambio, se distinguen solo por patrón de
  punteado y tono, canales de baja capacidad para categorías.
- El tipo de dato de un campo ya está en el esquema (`kind` de cada campo en `/api/schema`); con eso
  un vocabulario puede validar que no se mande una categoría a un canal de magnitud.

## Fuentes

- J. Bertin, *Sémiologie graphique* (1967); trad. *Semiology of Graphics* (1983).
- T. Munzner, *Visualization Analysis and Design*, CRC Press, 2014, cap. 5 (marcas y canales,
  ranking p. 94), vía apuntes de VDA Universität Wien:
  https://teaching.vda.univie.ac.at/vis/23s/LectureNotes/04_visual_encoding_principles.pdf
- D. L. Moody, *The "Physics" of Notations*, IEEE TSE 35(6), 2009.
- Vega-Lite, *Encoding*: https://vega.github.io/vega-lite/docs/encoding.html y *Type*:
  https://vega.github.io/vega-lite/docs/type.html
- Axis Maps, *Visual Variables* (niveles de organización de Bertin): https://www.axismaps.com/guide/visual-variables
