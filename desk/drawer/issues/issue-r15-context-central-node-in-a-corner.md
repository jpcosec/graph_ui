---
title: "R15: En un diagrama de contexto, el nodo central queda en una esquina"
severity: low
category: legibility
status: closed
---
# R15: En un diagrama de contexto, el nodo central queda en una esquina

## What
En un component de contexto, el sistema (el nodo al que llegan casi todas las aristas) queda en la esquina
inferior derecha y las aristas cruzan todo el lienzo.

## Expected
Deseable: el nodo de más grado al centro, o como mínimo en la capa media entre las fuentes y los destinos,
sin romper los criterios de legibilidad. Si no sale limpio, se cierra explicando por qué.

## Where
frontends/mindmap/views/specs/notation/notation-layout.mjs (elección del layout).

## Evidence
- assets/specs-legibility-r13-2026-10-20/component.contexto.png
- assets/specs-legibility-r13-2026-10-20/fit-component.contexto.png

## Resolution

Closed: 2026-10-20
Reason: Sin arreglo limpio. ELK layered pone al nodo central en la capa que dictan las aristas y cada grupo es un bloque continuo. En el contexto, Personas incluye a un destino del sistema (Cliente) y Terceros junta una fuente (GitHub) con un destino (Composio): ningún reparto lo deja entre todas sus fuentes y destinos. Probadas 13 variantes (capas MIN_WIDTH, COFFMAN_GRAHAM, LONGEST_PATH(_SOURCE), BF_MODEL_ORDER, STRETCH_WIDTH; colocación BRANDES_KOEPF BALANCED; SEPARATE_CHILDREN; TB y LR) con fuente real y lienzo 1540x1105. Lo mejor sin problemas descentra 0.22-0.31 (hoy ~0.4): en TB pasa de 0.77 a 0.68 del ancho y queda igual en alto (0.75). El radial que pide un contexto solo existe en ELK sin ruteo ortogonal ni reserva de rótulos (stress/force) y rompe G5/R2/R3. Una mejora de 0.09 no paga 6 corridas más de ELK por diagrama ni una heurística nueva. Si el sistema tiene que ir al centro, se resuelve en el spec: separar fuentes y destinos en grupos distintos.
Refs: 
