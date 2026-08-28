---
id: atom-deskops-spec2viz-and-knowledge-are-instances-of-the-sldb-plus-kgdb-nucleus
title: deskops spec2viz and knowledge are instances of the sldb-plus-kgdb nucleus
five_wh_one_plus: why
tags:
- system:sldb
- topic:composition
- layer:document-model
provenance: null
---

# deskops spec2viz and knowledge are instances of the sldb-plus-kgdb nucleus

## Answer

Once the store is generic, sldb+kgdb are the ecosystem nucleus and every project is a domain instance = {content models + relation models + a view overlay} on top, reimplementing no infrastructure. deskops is the workflow-domain instance (its README already says 'workflow-domain instance built on top of sldb'). spec2viz is the rendering overlay ('human-watchable rendering layer, semantic truth belongs upstream'). knowledge (gemini_test KB) is the conversational-domain instance (11 StructuredNLDoc models, graph via kgdb ingest). repopackage is the inter-repo composition plane and a latent store client that today reinvents YAML+hash+solver. graph_ui is the generic view overlay of any GraphSnapshot.
