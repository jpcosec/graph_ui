---
id: atom-the-store-is-a-generic-typed-document-engine-not-sldb-owned-infrastructure
title: The store is a generic typed-document engine, not sldb-owned infrastructure
five_wh_one_plus: what
tags:
- system:sldb
- topic:store-extraction
- layer:document-model
---

# The store is a generic typed-document engine, not sldb-owned infrastructure

## Answer

The store (today at sldb/src/sldb/store, about 7.9k LOC across its modules) is a domain-agnostic engine that indexes, queries, and hashes typed documents. The serialization FORMAT is already a consumer-supplied plugin through the StoreCodec protocol (store/codec.py, default RuntimeCodec); the document type is still coupled to StructuredNLDoc in a few places, and the store has not been separated into its own package (the refactor was a spike). sldb is the first client with {StructuredNLDoc + reversible-Markdown codec}, not the owner.
