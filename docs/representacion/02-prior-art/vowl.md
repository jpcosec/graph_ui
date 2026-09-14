# VOWL: notación visual para ontologías OWL

## Qué es

VOWL (*Visual Notation for OWL Ontologies*) es una notación visual especificada para OWL, pensada
para que la entiendan usuarios que no son expertos en ontologías. Del artículo de referencia:
*"The Visual Notation for OWL Ontologies (VOWL) is a well-specified visual language for the
user-oriented representation of ontologies. It defines graphical depictions for most elements of the
Web Ontology Language (OWL) that are combined to a force-directed graph layout visualizing the
ontology."* (Lohmann et al., abstract). Tiene dos implementaciones: WebVOWL (aplicación web) y
ProtégéVOWL (plugin de Protégé).

Interesa porque es una notación para un **metamodelo de conocimiento**, no de software, como los
mundos de `pron`.

> Nota de verificación: el dominio original de la especificación (`vowl.visualdataweb.org`) hoy
> sirve un sitio no relacionado. Este documento cita el artículo publicado y el repositorio oficial
> de WebVOWL.

## Arquitectura

```
ontología OWL ── OWL2VOWL (OWL API) ──▶ VOWL-JSON ──▶ WebVOWL (SVG, layout de fuerzas)
```

- **TBox vs ABox**: VOWL representa principalmente el esquema (clases, propiedades, tipos de dato)
  y solo opcionalmente las instancias. Es la opción A del documento de
  [metamodelado](../01-fundamentos/metamodelado-mof.md): dibujar tipos.
- El JSON intermedio está diseñado *para* la visualización: *"The JSON schema has been designed with
  regard to VOWL, i.e., its structure differs from common OWL serializations in order to enable an
  efficient generation of the graph visualization."*

## Cómo declara el mapeo semántico → notación

Con un conjunto pequeño de **primitivas gráficas** combinadas sistemáticamente y un **esquema de
colores funcional**:

- *"Classes are depicted as circles that are connected by lines representing the properties with
  their domain and range axioms. Property labels and datatypes are displayed in rectangles, and text
  is used for labels and cardinality constraints."*
- El tamaño del círculo puede codificar la cantidad de instancias de la clase (canal de magnitud,
  ver [variables visuales](../01-fundamentos/variables-visuales.md)).
- Los colores se especifican **por función**, no por valor: *"The colors are specified by their
  function in an abstract way and relative to the canvas color to leave room for customization."*
  Por ejemplo, el color de lo externo es *"a dark version of the general color"*. Con reglas de
  prioridad cuando aplica más de uno (lo obsoleto gana a lo externo).
- **Redundancia deliberada** donde ayuda: una clase externa lleva el color externo *y* el texto
  "external" (doble codificación, ver [Physics of Notations](../01-fundamentos/physics-of-notations.md)).
- **Reglas de división** (*splitting rules*): algunos nodos se multiplican en el dibujo para
  mejorar la legibilidad. `owl:Thing` aparece una vez por cada clase conectada a él, y los tipos de
  dato una vez por propiedad. Cambia el número de nodos, no el de aristas.

## Cómo resuelve la edición de vuelta

VOWL es una notación de lectura. WebVOWL permite explorar, filtrar y reorganizar el layout, pero la
edición de la ontología se hace en otras herramientas (el artículo presenta el plugin para Protégé).

## Fragmento de código real

Del repositorio de WebVOWL, `src/app/data/foaf.json` (la ontología FOAF convertida). El JSON separa
el **constructo** (`class`, con su `type` OWL) de sus **datos** (`classAttribute`), ligados por
`id` (en estos fragmentos se omite el campo `annotations`):

```json
{
  "id": "12",
  "type": "owl:equivalentClass"
}
```

```json
{
  "iri": "http://xmlns.com/foaf/0.1/Person",
  "equivalent": [
    "63",
    "64"
  ],
  "baseIri": "http://xmlns.com/foaf/0.1",
  "instances": 0,
  "label": {
    "IRI-based": "Person",
    "undefined": "Person"
  },
  "comment": {
    "undefined": "A person."
  },
  "attributes": [
    "equivalent"
  ],
  "id": "12"
}
```

Y una propiedad, con su dominio y rango apuntando a ids de clases:

```json
{
  "id": "16",
  "type": "owl:objectProperty"
}
```

```json
{
  "iri": "http://xmlns.com/foaf/0.1/workInfoHomepage",
  "baseIri": "http://xmlns.com/foaf/0.1",
  "range": "2",
  "label": {
    "IRI-based": "workInfoHomepage",
    "undefined": "work info homepage"
  },
  "domain": "12",
  "comment": {
    "undefined": "A work info homepage of some person; a page about their work for some organization."
  },
  "attributes": [
    "object"
  ],
  "id": "16"
}
```

El `type` (`owl:equivalentClass`, `owl:objectProperty`) decide el símbolo; los `attributes`
(`external`, `deprecated`, `functional`…) modifican el símbolo con color o texto.

## Qué tomamos y qué no

**Tomamos**

- **Separar el kind del elemento de sus datos** en el formato intermedio: es el "modelo gráfico"
  que `graph_ui` necesita entre el mundo y React Flow.
- **Colores por función, no por valor**: encaja con los tokens y *slots* de `graph_ui` (el skin
  decide el color concreto, el vocabulario solo la función).
- **Atributos que modifican un símbolo base** (externo, obsoleto): menos símbolos, más
  combinaciones (economía gráfica).
- **Reglas de división** como parte declarada de la notación: por ejemplo, en la KB de `pron` las 37
  aristas `implements` convergen en pocos `SpecDoc`; repetir esos nodos cerca de cada origen
  evitaría aristas largas que se cruzan.
- **Dibujar el esquema (TBox) con instancias opcionales**: dos niveles en una misma vista.

**No tomamos**

- El layout de fuerzas como única opción: sirve para exploración, no para vocabularios donde la
  posición significa.
- Que sea solo lectura.

## Fuentes

- S. Lohmann, S. Negru, F. Haag, T. Ertl, *Visualizing Ontologies with VOWL*, Semantic Web 7(4),
  2016, pp. 399–419, DOI 10.3233/SW-150200 (versión de revisión: https://www.semantic-web-journal.net/system/files/swj1114.pdf)
- WebVOWL, repositorio oficial y `src/app/data/foaf.json`: https://github.com/VisualDataWeb/WebVOWL
