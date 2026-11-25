# sldb serve crece sin tope en los tests de graph_ui (robocop2, 2026-11-16)

Caso mínimo: un solo test, sin xdist, bajo `systemd-run --user --scope -p MemoryMax=3G`:
`pytest tests/test_mindmap_deskops.py::test_real_advance_stale_origin_and_types` (venv /dev/shm/venv-ir13-r2, sldb editable de ../../sldb en main).

- rss2.log: el único `sldb serve` (store /dev/shm/rss-min-bt/.../repo/.sldb) pasa de 55 MB a 2,4 GB en 63 s; nunca responde; el test cae por timeout (502 "sldb serve no respondió").
- traceback*.out: en reposo el serve está en select(); el `/views/board` y `/views/task` de un store ya caliente responden en 0,3-0,5 s sin crecer.
- stack5.txt (faulthandler por SIGUSR1 vía sitecustomize): 6 hilos de petición, todos en `list_views -> load_edge_index -> compose_edge_index -> _merge_store -> load_edges_shard -> _cached_shard (model_copy(deep=True))`.
- compose-single.out: `load_edge_index(<store del test>)` en un hilo federa 7 stores (el del test + deskops, sldb, spec2viz, pron, scion, herramientas/deskops, por los enlaces transitivos): 15.617 shards, 31.152 nodos, 178.756 aristas, 35,5 s y 1,2 GB la primera vez; 0,6 s después.

Causa: (1) list_views compone el índice federado con include_linked=True y transitivo; un desk de 300 KB arrastra todo el ecosistema de la máquina. (2) Sin lock en la composición en frío: cada petición concurrente compone por su cuenta y retiene sus copias profundas, así que la memoria se multiplica por el número de hilos. (3) El timeout del cliente no cancela el trabajo del hilo. Con pytest -n 4: 4 serves de 2,3 a 4,8 GB cada uno; robocop2 quedó con 5 GB disponibles.
