# Eje 2 — Prior art

La idea de declarar un lenguaje visual sobre un modelo, sin código, y editar el modelo a través
del diagrama, tiene al menos treinta años de herramientas detrás (MetaEdit+ es de 1996). Este eje
documenta las más cercanas a lo que queremos y extrae qué tomar de cada una. Todos los fragmentos
de código están copiados de documentación oficial o de los repositorios oficiales, con enlace.

| Documento | Qué es | Qué nos enseña | Estado |
|---|---|---|---|
| [sirius-web.md](sirius-web.md) | Obeo/Eclipse: modeladores gráficos declarados como modelos, en web | Mapeos nodo/arista y herramientas de edición declarados sin código, dentro de la misma app; aristas basadas en relación vs en elemento | escrito |
| [eclipse-glsp.md](eclipse-glsp.md) | Plataforma cliente/servidor para editores de diagramas web | Cómo un gesto en el cliente se vuelve una operación tipada sobre el modelo fuente | escrito |
| [metaedit-gopprr.md](metaedit-gopprr.md) | MetaCase: metamodelado para lenguajes de dominio (Graph-Object-Property-Port-Role-Relationship) | Roles y puertos como conceptos de primera clase; relaciones de dos o más objetos | escrito |
| [jetbrains-mps.md](jetbrains-mps.md) | Language workbench con edición proyectiva | Muchas notaciones sobre el mismo modelo; la vista es también controlador; el significado de un gesto depende del concept | escrito |
| [fresnel.md](fresnel.md) | Vocabulario W3C/MIT para presentar RDF | Separar *qué se muestra* (lens) de *cómo se muestra* (format); label lens y sublens ≈ `display` de `pron` | escrito |
| [vowl.md](vowl.md) | Notación visual para ontologías OWL | Notación para un metamodelo de conocimiento; colores por función; reglas de división | escrito |
| [structurizr-c4.md](structurizr-c4.md) | Arquitectura como código (modelo C4) | Un solo modelo, muchas vistas; tags → estilos; relaciones implícitas entre niveles | escrito |
| [spec2viz.md](spec2viz.md) | Herramienta propia del ecosistema | Modelo semántico → IR tipado → renderer; `kind` vs `style`; qué le falta | escrito |

## Comparación

| | Mapeo declarado sin código | Edición de vuelta | Gramática de conexión | Roles con nombre | Varias vistas del mismo modelo | Vive en la misma herramienta |
|---|---|---|---|---|---|---|
| Sirius / Sirius Web | sí (mappings) | sí (tools declaradas) | sí (source/target mappings) | no | sí (layers, varios diagramas) | sí |
| GLSP | no (código en `GModelFactory`) | sí (operaciones tipadas) | por código | no | por código | — |
| MetaEdit+ | sí (herramientas visuales) | sí (edita instancias GOPPRR) | sí | **sí** | sí (diagrama, matriz, tabla) | sí |
| MPS | sí (aspecto editor) | sí (acciones sobre el AST) | por la estructura del concept y el sistema de tipos | links con nombre (binarios: `leftOperand`) | sí | sí |
| Fresnel | sí (lenses/formats) | **no** | — | — | sí | sí (es RDF) |
| VOWL | notación fija | **no** | — | — | TBox con ABox opcional | — |
| Structurizr | sí (DSL) | solo layout | — | — | **sí** | sí |
| spec2viz | parcial (el YAML ya está en constructos) | **no** | validación semántica | — | un tipo por spec | — |

Nadie reúne las cuatro cosas que queremos a la vez sobre un sustrato genérico de documentos:
mapeo declarado como documento, edición por operaciones, roles y aplicabilidad por mundo.
Sirius Web es lo más cercano; MetaEdit+ aporta los roles; GLSP la forma de la vuelta; Fresnel la
separación con `ProjectionDoc`.

## Dónde cae cada uno respecto de nuestras decisiones

| Decisión | Quién la respalda |
|---|---|
| El vocabulario es un documento del mundo, editable en la misma herramienta | Sirius Web, MetaEdit+ |
| Separar qué se nombra (`ProjectionDoc`) de cómo se dibuja (vocabulario visual) | Fresnel (lens/format), Structurizr (modelo/vistas) |
| La edición vuelve como operación tipada, no como diff de grafo | GLSP (operations), Sirius (tools), MPS (action maps) |
| El sustrato no conoce el vocabulario | MOF (capas), MPS (AST independiente de la notación), VOWL (notación sobre OWL) |
| `kind` semántico separado de estilo | spec2viz, VOWL (colores por función), Structurizr (tags → styles) |
| Una arista puede ser un campo o un documento, y se distinguen | Sirius (relation-based vs element-based edge) |

## Lo que este eje agrega al diseño

1. **Estructura de un mapping** (Sirius): candidatos + tipo + precondición + estilo + herramientas.
2. **Dos clases de arista**: basada en referencia (campo de un documento) y basada en elemento
   (`RelationDoc`), declaradas, no inferidas.
3. **Roles y puertos** (GOPPRR) como vocabulario para los extremos y los puntos de conexión.
4. **Operaciones con nombre** (GLSP) como único camino de escritura, regenerando la vista después.
5. **Colores por función** (VOWL) y **tags → estilos** (Structurizr): el vocabulario declara la
   función; el skin de `graph_ui` elige el color.
6. **Relaciones implícitas entre niveles** (Structurizr) para vistas con agrupamiento o foco.
