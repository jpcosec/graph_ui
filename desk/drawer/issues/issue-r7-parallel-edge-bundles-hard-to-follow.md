---
title: "R7: Haces de aristas paralelas que no se pueden seguir"
severity: low
category: layout
status: open
---
# R7: Haces de aristas paralelas que no se pueden seguir

## What
Varias aristas con el mismo rótulo corren juntas (deployment: 5-6 líneas «Service Connect»; superficies: 4
líneas antonia.* entrando a «Entry points»): se leen, pero no se puede seguir cuál va a dónde.

## Expected
Separación mínima entre paralelas y/o resaltar la arista al pasar el mouse sobre su rótulo o extremo, sin
romper los criterios ya cumplidos. Si no sale limpio, se cierra explicando por qué.

## Evidence
- ![deployment](assets/specs-legibility-r3-2026-10-19/deployment.dev-aws.png)
- ![superficies](assets/specs-legibility-r3-2026-10-19/component.superficies-kit-y-satelite.png)

## Acceptance
Deseable.
