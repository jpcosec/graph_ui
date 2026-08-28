---
id: atom-the-store-is-a-generic-typed-document-engine-not-sldb-owned-infrastructure
title: The store is a generic typed-document engine, not sldb-owned infrastructure
five_wh_one_plus: what
tags:
- system:sldb
- topic:store-extraction
- layer:document-model
provenance: null
---

# The store is a generic typed-document engine, not sldb-owned infrastructure

## Answer

The store (today at sldb/src/sldb/store, ~1857 LOC) is a domain-agnostic engine that indexes, queries, and hashes typed documents. The document TYPE and its serialization FORMAT are consumer-supplied plugins (a Document protocol and a Codec), not part of the core. sldb becomes the first client with {StructuredNLDoc + reversible-Markdown codec}, not the owner. It works for everything precisely because it does not know what it is used for.
