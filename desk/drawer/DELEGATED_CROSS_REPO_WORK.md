# Delegated cross-repo work

These roadmap items belong to sibling tools, not graph_ui. Per the
inbox-coordination workflow they were dispatched to the owning repos' inboxes
and their local drawer tasks removed (no duplication). Specs remain here for
reference.

| Item | Owner repo | Inbox note | Spec |
|---|---|---|---|
| Cut store->cli coupling (spike) | sldb | 20260828-*-extract-store-to-generic-typed-document-engine | STORE_EXTRACTION_PROPOSAL.md |
| Generalize store to Document+Codec | sldb | (same note, task 2) | STORE_EXTRACTION_PROPOSAL.md |
| Relation-as-first-class + kgdb assembler | kgdb | 20260828-*-relation-model-and-flow-lens-over-kgdb | RELATION_MODEL_LAYER_SPEC.md |
| Express gemini flow view as lens over kgdb | kgdb | (same note, piece 2) | PROJECTION_LAYERING_SPEC.md |
| Workflow: anti-mock + comprehension gate | deskops | 20260828-*-anti-mock-mandate-and-comprehension-gate | (pills in desk/contexts/) |

Local graph_ui roadmap that remains actionable here surfaces when a real
GraphSnapshot export + a live sldb model export exist (both cross-repo
prerequisites). Until then, the typed-editor foundation is done: build-time
generator sldb-model -> NodeTypeDefinition (commit 8123184).
