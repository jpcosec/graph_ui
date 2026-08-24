---
id: atom-staticfixtures-why
title: StaticFixtures
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

StaticFixtures exist so the app can render predictable graph-shaped data even before a live kgdb integration is wired. They make local development, demos, and tests possible without needing a running backend. That convenience is also why the repository can look functional today despite not persisting semantic edits.
