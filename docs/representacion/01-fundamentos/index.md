# Eje 1 — Fundamentos

Los conceptos que sostienen el resto del manual. Cada uno responde una pregunta que vamos a
necesitar contestar al diseñar el `VocabularyDoc` y la capa de representación de `graph_ui`.

| Documento | Pregunta que responde | Estado |
|---|---|---|
| [proyectar-vs-representar.md](proyectar-vs-representar.md) | ¿Qué hace hoy `graph_ui` y qué debería hacer? | escrito |
| [sintaxis-abstracta-y-concreta.md](sintaxis-abstracta-y-concreta.md) | ¿Qué parte de un lenguaje de modelado es significado y qué parte es notación? | escrito |
| [metamodelado-mof.md](metamodelado-mof.md) | ¿En qué nivel vive cada cosa: `sldb`/`kgdb`/`pron`, UML, un mundo concreto, sus instancias? | escrito |
| [variables-visuales.md](variables-visuales.md) | ¿Con qué canales perceptibles se carga significado (forma, color, posición, anidamiento)? | escrito |
| [physics-of-notations.md](physics-of-notations.md) | ¿Cómo se evalúa si una notación comunica bien? | escrito |
| [lentes-bidireccionales.md](lentes-bidireccionales.md) | ¿Cómo una edición en la vista vuelve al dato sin romperlo? | escrito |

Los ejemplos ejecutables y archivos de ejemplo de este eje están en [`ejemplos/`](ejemplos/):
`lente-arista.mjs`, `claridad-semiotica.mjs` (se corren con `node`), `restaurante.spec2viz.yml`,
`restaurante.puml`, `reservas.vl.json` y `uml-como-mundo.yaml` (se monta con
[`../herramientas/montar_mundo.py`](../herramientas/montar_mundo.py)).

## Orden de lectura

1. **Proyectar vs representar** fija el problema, con `graph_ui` actual como caso.
2. **Sintaxis abstracta y concreta** da el vocabulario técnico para separar significado y notación.
3. **Metamodelado (MOF)** ubica en capas lo que ya tenemos y distingue dos maneras de que UML viva
   en un mundo `pron`.
4. **Variables visuales** explica *con qué* se dibuja el significado; es la base de la
   clasificación del [eje 3](../03-diagrama-vocabulario/index.md).
5. **Physics of Notations** da criterios para decidir si un mapeo significado → símbolo es bueno.
6. **Lentes bidireccionales** formaliza la vuelta: editar en la vista y actualizar el mundo.

## Lo que deja este eje para el diseño

- Entre un mundo y un dibujo hay **dos mapeos**: mundo → constructos del vocabulario, y constructos
  → notación. El primero es lo que cada mundo declara; el segundo lo fija el vocabulario.
- Un vocabulario tiene que decir **a qué nivel aplica**: tipos (modelos, `RelationTypeDoc`) o
  instancias (documentos, `RelationDoc`).
- Cada constructo necesita **canal + tipo de dato**, y la tabla de símbolos se puede **auditar**
  (claridad semiótica, distancia visual) antes de dibujar.
- La edición vuelve como **operaciones** declaradas por gesto, verificables con GetPut/PutGet.

## Cómo se conectan

```
            mundo pron (sintaxis abstracta + context conditions)
                 │  get  (lente)                          ▲  put (operaciones por gesto)
                 ▼                                        │
      constructos del vocabulario (UML, BPMN…) ── mapeo ──▶ notación (sintaxis concreta)
                                                   │
                                     canales visuales (Bertin, Munzner)
                                     auditados con Physics of Notations
```
