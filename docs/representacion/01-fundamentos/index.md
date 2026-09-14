# Eje 1 — Fundamentos

Los conceptos que sostienen el resto del manual. Cada uno responde una pregunta que vamos a
necesitar contestar al diseñar el `VocabularyDoc` y la capa de representación de `graph_ui`.

| Documento | Pregunta que responde | Estado |
|---|---|---|
| proyectar-vs-representar.md | ¿Qué hace hoy `graph_ui` y qué debería hacer? | pendiente |
| sintaxis-abstracta-y-concreta.md | ¿Qué parte de un lenguaje de modelado es significado y qué parte es notación? | pendiente |
| metamodelado-mof.md | ¿En qué nivel vive cada cosa: `sldb`/`kgdb`/`pron`, UML, un mundo concreto, sus instancias? | pendiente |
| variables-visuales.md | ¿Con qué canales perceptibles se carga significado (forma, color, posición, anidamiento)? | pendiente |
| physics-of-notations.md | ¿Cómo se evalúa si una notación comunica bien? | pendiente |
| lentes-bidireccionales.md | ¿Cómo una edición en la vista vuelve al dato sin romperlo? | pendiente |

## Orden de lectura

1. **Proyectar vs representar** fija el problema, con `graph_ui` actual como caso.
2. **Sintaxis abstracta y concreta** da el vocabulario técnico para separar significado y notación.
3. **Metamodelado (MOF)** ubica en capas lo que ya tenemos: el sustrato genérico, el vocabulario,
   el mundo y los datos.
4. **Variables visuales** explica *con qué* se dibuja el significado; es la base de la
   clasificación del [eje 3](../03-diagrama-vocabulario/index.md).
5. **Physics of Notations** da criterios para decidir si un mapeo significado → símbolo es bueno.
6. **Lentes bidireccionales** formaliza la vuelta: editar en la vista y actualizar el mundo.

## Cómo se conectan

```
            mundo pron (sintaxis abstracta, nivel M1 sobre sldb/kgdb/pron como M3)
                 │  get  (lente)                          ▲  put (lente)
                 ▼                                        │
      vocabulario (metamodelo M2: UML, BPMN…) ── mapeo ──▶ notación (sintaxis concreta)
                                                   │
                                     canales visuales (Bertin)
                                     evaluados con Physics of Notations
```
