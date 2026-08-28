---
id: drawer-generalize-store-to-document-and-codec-plugins
status: drawer
tags:
- workspace:desk
- artifact:task
- source:drawer
depends_on:
- drawer-cut-store-to-cli-coupling-spike
atoms:
- atom-the-store-is-a-generic-typed-document-engine-not-sldb-owned-infrastructure
- atom-store-core-knows-index-query-hash-lock-consumers-inject-type-and-codec
---

# Generalize the store to Document + Codec plugins

## Rationale

After the store-to-cli coupling is cut, the store still mentions format and
domain (`StructuredNLDoc`, `extract_model_data`). To become the generic
nucleus that sldb, repopackage, deskops and knowledge all consume, the core
must stop knowing what a document is and how it serializes.

## Goal

Introduce two consumer-injected plugins and make the core depend only on them:
- `Document` protocol: identity, semantic tags, field payload, path.
- `Codec`: `extract(raw) -> fields`, `render(fields) -> raw`.

sldb registers `{StructuredNLDoc + reversible-Markdown codec}` as the first
client. hash_fields keeps working because it hashes extracted fields.

## Scope

- Abstract `StructuredNLDoc` (2 uses) to the Document protocol.
- Abstract `extract_model_data` (3 uses) to `Codec.extract`.
- Give the store its own exceptions (drop `sldb.core.exceptions`, 10 uses).
- Keep the store folder in place for now; move is a later task.

## Done when

- The store core has zero references to `StructuredNLDoc`, `extract_model_data`
  or `sldb.core.exceptions`.
- sldb passes its suite as the first registered consumer.

## Follow-ups (not here)

- Move `store/` to a standalone package.
- Port repopackage to `{IntegrationContract + YAML codec}`.
- Decide global vs per-store type/codec registry.
