# Eje 2 — Prior art

La idea de declarar un lenguaje visual sobre un modelo, sin código, y editar el modelo a través
del diagrama, tiene al menos veinte años de herramientas detrás. Este eje documenta las más
cercanas a lo que queremos y extrae qué tomar de cada una.

| Documento | Qué es | Qué nos enseña | Estado |
|---|---|---|---|
| sirius-web.md | Obeo/Eclipse: modeladores gráficos declarados como modelos, en web | Mapeos nodo/arista y herramientas de edición declarados sin código, dentro de la misma app | pendiente |
| eclipse-glsp.md | Plataforma cliente/servidor para editores de diagramas web | Cómo un gesto en el cliente se vuelve una operación tipada sobre el modelo fuente | pendiente |
| metaedit-gopprr.md | MetaCase: metamodelado para lenguajes de dominio (Graph-Object-Property-Port-Role-Relationship) | Roles y puertos como conceptos de primera clase | pendiente |
| jetbrains-mps.md | Language workbench con edición proyectiva | Muchas notaciones sobre el mismo modelo; el modelo se edita a través de ellas | pendiente |
| fresnel.md | Vocabulario W3C/MIT para presentar RDF | Separar *qué se muestra* (lens) de *cómo se muestra* (format) | pendiente |
| vowl.md | Notación visual para ontologías OWL | Una notación definida para un metamodelo de conocimiento, no de software | pendiente |
| structurizr-c4.md | Arquitectura como código (modelo C4) | Un solo modelo, muchas vistas | pendiente |
| spec2viz.md | Herramienta propia del ecosistema | Modelo semántico → IR tipado → renderer; `kind` vs `style` | pendiente |

## Dónde cae cada uno respecto de nuestras decisiones

| Decisión | Quién la respalda |
|---|---|
| El vocabulario es un documento del mundo, editable en la misma herramienta | Sirius Web, MetaEdit+ |
| Separar qué se nombra (`ProjectionDoc`) de cómo se dibuja (`VocabularyDoc`) | Fresnel (lens/format), Structurizr (modelo/vistas) |
| La edición vuelve como operación tipada, no como diff de grafo | GLSP, Sirius (tools), MPS |
| El sustrato no conoce el vocabulario | MOF (capas), MPS (AST independiente de la notación), VOWL (notación sobre OWL) |
| `kind` semántico separado de estilo | spec2viz, Physics of Notations |
