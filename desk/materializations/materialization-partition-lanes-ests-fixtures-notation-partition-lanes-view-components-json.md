---
sldb:
  by: agent
  at: '2026-11-25T21:43:47Z'
  authority: generated
  via: create_document
id: materialization-partition-lanes-ests-fixtures-notation-partition-lanes-view-components-json
title: partition-lanes ests-fixtures-notation-partition-lanes-view-components-json
source_atoms:
- atom-una-notacion-con-carriles-por-particion-dibuja-una-columna-por-particion
target_kind: test
target_identity: tests/fixtures/notation-partition-lanes/view-components.json
validation:
- node --test tests/notation-partition-lanes.test.mjs
tags:
- system:graph_ui
- topic:partition-lanes
---

# partition-lanes ests-fixtures-notation-partition-lanes-view-components-json

## Intent

materializa en tests/fixtures/notation-partition-lanes/view-components.json el atom atom-una-notacion-con-carriles-por-particion-dibuja-una-columna-por-particion
