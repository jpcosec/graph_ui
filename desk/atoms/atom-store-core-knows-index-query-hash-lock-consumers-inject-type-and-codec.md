---
id: atom-store-core-knows-index-query-hash-lock-consumers-inject-type-and-codec
title: Store core knows index query hash lock; consumers inject type and codec
five_wh_one_plus: how
tags:
- system:sldb
- topic:store-extraction
- layer:document-model
provenance: null
---

# Store core knows index query hash lock; consumers inject type and codec

## Answer

The store core owns: semantic indexing (tag DAG plus axes), query engine (semantic/structural/filter), layered hashing (text / normalized-fields / index for drift), integrity and write-lock, and catalog persistence. The core must not mention format or domain in any public signature. Consumers inject a Document protocol (identity, semantic tags, field payload, path) and a Codec (extract raw->fields, render fields->raw). hash_fields works for all consumers because it hashes extracted fields, not the format, separating meaning-changed from format-changed.
