---
id: atom-the-store-is-coupled-to-sldb-via-two-store-to-cli-imports-plus-type-and-codec
title: The store is coupled to sldb via two store-to-cli imports plus type and codec
five_wh_one_plus: how
tags:
- system:sldb
- topic:store-extraction
- layer:cli
provenance: null
---

# The store is coupled to sldb via two store-to-cli imports plus type and codec

## Answer

Extracting the store requires cutting four couplings: (1) store/facade.py imports sldb.cli.store_context.get_store_context and (2) store/diagnostics.py lazily imports sldb.cli.model_utils.resolve_model_ref -- both are dependency inversions (low layer importing high) and must become injection; (3) StructuredNLDoc (2 uses) abstracts to a Document protocol; (4) extract_model_data (3 uses) abstracts to a Codec interface. sldb.core.exceptions (10 uses) is trivial and moves into the store. The resolve_model_ref callable is already injected in load_runtime_documents -- that is the pattern to generalize.
