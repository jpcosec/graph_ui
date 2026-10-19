# graph_ui's SLDB store

Only `store.yaml` (and this README) is versioned here. It declares the store: the models (local,
or inherited from deskops through the `deskops` link, `../../deskops/.sldb`), the predicates and
which Markdown file is tracked with which model (`include`). Everything else is derived and
ignored: `core/` (store index, model indexes, document entries) and `runtime/` (edge, section
and semantic indexes, caches).

```sh
(cd ../../deskops && sldb stores build)   # the linked store first
sldb stores build                         # rebuild core/ from store.yaml + the Markdown
sldb stores check                         # must PASS
sldb stores build --check                 # CI: the versioned sources rebuild this store
```

After adding a tracked document or model, refresh the declaration with
`sldb stores declare --write` and commit `store.yaml`.
