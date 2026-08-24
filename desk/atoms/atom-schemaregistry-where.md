---
id: atom-schemaregistry-where
title: SchemaRegistry
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry lives in `apps/review-workbench/src/schema/registry.ts` and `apps/review-workbench/src/schema/registry.types.ts`, with default registrations in `apps/review-workbench/src/schema/register-defaults.ts`. Those files belong to the frontend schema layer that sits beneath L1 and L2. Together they define the registry implementation, the node-type contract, and the seeded default types.
