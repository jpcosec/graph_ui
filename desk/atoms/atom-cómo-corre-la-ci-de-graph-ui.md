---
id: atom-cómo-corre-la-ci-de-graph-ui
title: Cómo corre la CI de graph_ui
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:ci
---

# Cómo corre la CI de graph_ui

## Answer

.github/workflows/ci.yml corre en cada push a master y en cada PR, con tres jobs. mindmap: pytest sobre tests/ sin los e2e_* y node --test tests/*.test.mjs. review-workbench: npm ci en apps/review-workbench, luego tsc -p tsconfig.app.json --noEmit, vitest run y scripts/lint-architecture.mjs (los mismos comandos que tests/test_review_workbench.py, que localmente se salta sin node_modules). e2e: Playwright con chromium (playwright install --with-deps chromium) y pytest tests/e2e_*.py. Los repos hermanos (structuredLanguageDB, pron, deskops, spec2viz) se instalan desde sus ramas principales en git según .github/requirements-suite.txt, porque no hay releases hasta que la suite completa esté lista; spec2viz va editable y clonado fuera del checkout (--src) porque los tests de notación leen sus pilotos en docs/. tests/test_ci_workflow.py fija esa forma.
