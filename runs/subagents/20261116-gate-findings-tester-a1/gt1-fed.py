import sys
from pathlib import Path
from sldb.store.edge_index.federation import federated_stores
for p in sys.argv[1:]:
    s = federated_stores(Path(p), True)
    print(p, '->', [str(x) for x in s])
