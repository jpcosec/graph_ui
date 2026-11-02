# Render Markdown legible en el lector del workspace

Estado: candidato capturado directamente en drawer, 2026-11-02. Origen: revisión root, `runs/subagents/20261102-ws13-1-correccion/review-source.md`. Sin nodo propio en el DAG del plan: productor por reconciliar en deskops. Debe resolverse antes de WS16.

## Problema

En el render del lector, citas, énfasis, código inline y enlaces Markdown estándar quedan literales. No incumple la sintaxis `[[…]]` de WS11 §5.2, pero es deuda visible para la aceptación de lectura.

## Alcance propuesto

Render Markdown usual legible con pruebas sobre README y manual reales. Fuente siempre literal e íntegra. Enlaces locales bajo guardias, externos según política, sin HTML activo inesperado. Reutilizar un motor real antes que regex ad hoc: verificar cuál es dependencia declarada, no solo instalada. No escribir un parser de documentos SLDB. Sin migración a Kimun.

## Dependencia

Bloquea la aceptación humana de lectura: se resuelve antes de WS16. La aceptación técnica de WS13.1 no lo resuelve.
