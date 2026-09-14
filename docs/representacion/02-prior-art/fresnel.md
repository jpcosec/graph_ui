# Fresnel: vocabulario de presentación para RDF (W3C / MIT)

## Qué es

Fresnel es un vocabulario RDF para declarar **cómo mostrar** datos RDF, independiente del
navegador que los muestre. Del manual de usuario (W3C, 30 de junio de 2005): *"Fresnel is a simple,
browser-independent vocabulary for specifying how to display an RDF model and how to style it using
existing style languages such as CSS."* Nació para no reinventar en cada aplicación la forma de
presentar RDF.

Es el antecedente directo de la separación que tomamos entre `ProjectionDoc` y `VocabularyDoc`, y
además se parece mucho a lo que `pron` ya hace con `display`.

## Arquitectura: lenses y formats

*"Fresnel's two foundational concepts are lenses and formats. Lenses define which properties of an
RDF resource are displayed and how these properties are ordered. Fresnel formats determine how the
selected properties are rendered by specifying RDF-specific formatting attributes and by providing
hooks to CSS"*.

Y la separación es estricta: *"Fresnel adheres to a strict separation between data selection and
formatting."* El proceso de presentación tiene tres pasos: seleccionar con las lenses (resulta un
árbol intermedio), formatear ese árbol con los formats, y producir la salida.

Un detalle importante para nosotros: Fresnel no impone el paradigma visual. *"Fresnel applications
should take all formatting information into account, but are free to interpret and adapt them in a
way that is appropriate w.r.t their fundamental representation paradigm (e.g. nested box-based
textual representation à la XHTML+CSS, node-link diagram, etc.)."*

## Cómo declara el mapeo semántico → notación

- **Dominio de una lens**: `fresnel:classLensDomain` (todas las instancias de una clase) o
  `fresnel:instanceLensDomain` (recursos concretos, o selección por expresión). Son los dos
  [niveles](../01-fundamentos/metamodelado-mof.md): tipo e instancia.
- **Qué propiedades**: `fresnel:showProperties`, `fresnel:hideProperties`, en orden.
- **Propósito**: `fresnel:defaultLens` (la vista principal) y `fresnel:labelLens` (cómo nombrar un
  recurso cuando aparece dentro de otro).
- **Sublens**: al mostrar una propiedad que apunta a otro recurso, qué lens usar para ese recurso
  (con profundidad máxima).
- **Formats**: por propiedad o por clase, cómo se muestra el valor (`fresnel:image`,
  `fresnel:externalLink`), si lleva etiqueta, y clases CSS.
- **Selectores**: simples (un nombre), FSL (tipo XPath sobre el grafo) o SPARQL.

## Cómo resuelve la edición de vuelta

No la resuelve: Fresnel es solo presentación. Es la mitad `get` de una lente.

## Fragmento de código real

Del manual de usuario, sección 1.1 (ejemplo FOAF), en Notation 3:

```turtle
:foafPersonDefaultLens rdf:type fresnel:Lens ;
                       fresnel:purpose fresnel:defaultLens ;
                       fresnel:classLensDomain foaf:Person ;
                       fresnel:group :foafGroup ;
                       fresnel:showProperties ( foaf:name 
                                                foaf:surname 
                                                foaf:depiction ) .

:knowsLens rdf:type fresnel:Lens ;
           fresnel:classLensDomain foaf:Person ;
           fresnel:group :foafGroup ;
           fresnel:showProperties ( foaf:name 
                                    foaf:surname
                                    foaf:mbox 
                                    [ rdf:type fresnel:PropertyDescription ;
                                      fresnel:property foaf:knows ;
                                      fresnel:sublens :foafPersonDefaultLens ] ) .

:depictFormat rdf:type fresnel:Format ;
              fresnel:propertyFormatDomain foaf:depiction ;
              fresnel:label fresnel:none ;
              fresnel:value fresnel:image ;
              fresnel:valueStyle "imageWithThickBorder"^^fresnel:styleClass ; 
              fresnel:group :foafGroup .
```

Una *label lens* (sección 2 del manual), el equivalente de una plantilla `display`:

```turtle
:foafPersonLabelLens rdf:type fresnel:Lens ;
                     fresnel:purpose fresnel:labelLens ;
                     fresnel:classLensDomain foaf:Person ;
                     fresnel:showProperties foaf:name .
```

Y la selección de instancias por condición con FSL (sección 1.3.2):

```turtle
:foafPersonFormat rdf:type fresnel:Format ;
                  fresnel:instanceFormatDomain "foaf:Person[ex:age/'30']"^^fresnel:fslSelector.
```

## Correspondencia con lo que ya existe en `pron`

| Fresnel | `pron` / `graph_ui` hoy |
|---|---|
| lens con `classLensDomain` + `showProperties` | `ProjectionDoc.models` (qué modelos entran) |
| `fresnel:labelLens` | `ProjectionDoc.display[Modelo]`, p. ej. `"{title}"` |
| `fresnel:sublens` sobre una propiedad | plantilla `{relación.campo}` de `display` (sigue una arista y lee un campo del destino) |
| format (cómo se ve un valor) | nada: es lo que falta, el `VocabularyDoc` |

## Qué tomamos y qué no

**Tomamos**

- **La separación lens / format** como justificación de `ProjectionDoc` / `VocabularyDoc`.
- **Dominio por clase o por instancia** en cada declaración.
- **El paradigma visual es de la aplicación**: el vocabulario declara significado y formato; el
  renderer decide cómo aplicarlo a nodo-arista, anidamiento, etc.
- **Label lens y sublens** confirman que `display` de `pron` ya es una lens de etiqueta bien
  planteada.

**No tomamos**

- RDF/Turtle como formato ni los selectores FSL/SPARQL: el `VocabularyDoc` es un documento de
  `sldb`, y las selecciones se apoyan en modelos, `RelationTypeDoc` y predicados de `sldb`.
- Que sea solo lectura: nuestro vocabulario tiene que declarar también la edición.

## Fuentes

- W3C, *Fresnel — Display Vocabulary for RDF, User Manual* (2005): https://www.w3.org/2005/04/fresnel-info/manual/
- W3C, *Fresnel Lens and Format Core Vocabulary*: https://www.w3.org/2004/09/fresnel
- E. Pietriga, C. Bizer, D. Karger, R. Lee, *Fresnel: A Browser-Independent Presentation Vocabulary
  for RDF*, ISWC 2006: https://people.csail.mit.edu/karger/Papers/fresnel.pdf
