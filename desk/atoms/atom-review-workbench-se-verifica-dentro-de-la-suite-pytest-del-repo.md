---
id: atom-review-workbench-se-verifica-dentro-de-la-suite-pytest-del-repo
title: review-workbench se verifica dentro de la suite pytest del repo
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:testing
- layer:review-workbench
provenance: tests/test_review_workbench.py
---

# review-workbench se verifica dentro de la suite pytest del repo

## Answer

apps/review-workbench tiene su propia cadena: tsc --noEmit sobre tsconfig.app.json, vitest y un lint de arquitectura (scripts/lint-architecture.mjs). tests/test_review_workbench.py la invoca tal cual desde la raíz (npx tsc, npx vitest run, node scripts/lint-architecture.mjs), así python3 -m pytest tests cubre también el editor React y los closeouts de deskops sobre review-workbench tienen evidencia bajo tests/, que es lo único que el gate de tests acepta. Vitest se llama directo y no con npm test, porque npm test corre antes hum:sync (generate-node-types.mjs) y escribiría en el árbol durante la suite. Si no hay node o no se corrió npm install en apps/review-workbench, los tres tests se saltan con un motivo explícito, no se simulan.
