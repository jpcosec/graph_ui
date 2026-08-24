---
id: atom-kgdb-for_whom
title: Kgdb
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb serves graph_ui as the backing store for live graph reads and writes. It also serves operators indirectly, because a real backend is what makes their edits survive reloads and become reviewable state instead of transient UI changes. For implementers, it is the external system DataProvider must eventually integrate with.
