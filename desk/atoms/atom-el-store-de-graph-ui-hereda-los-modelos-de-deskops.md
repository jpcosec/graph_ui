---
id: atom-el-store-de-graph-ui-hereda-los-modelos-de-deskops
title: El store de graph_ui hereda los modelos de deskops
five_wh_one_plus: how
tags:
- system:graph_ui
- system:sldb
- topic:store
provenance: .sldb/core/store_index.yaml
---

# El store de graph_ui hereda los modelos de deskops

## Answer

El store .sldb de graph_ui está enlazado al de deskops (sldb stores add ../../deskops/.sldb --name deskops) y hereda de él los modelos que deskops posee (sldb models inherit deskops:<Model>): AtomDoc, BoardDoc, CrossroadDoc, InboxNoteDoc, PillDoc, ProtoAtomDoc, RepositoryDoc, RitualDoc, RoleDoc, StepDoc y TaskDoc. Las entradas usan el model_ref del dueño, deskops.models:<Model>. FAQDoc y MaterializationContractDoc siguen como entradas propias porque deskops no los posee.
