"""The deskops ViewDocs in a temporary desk's own store (deskops CC34).

A real desk reaches deskops' seed ViewDocs (`deskops/data/views/`) through its store's link
to the deskops store; sldb's `run_view` does not resolve a ViewDoc of a linked store yet
(sldb H9), so a test desk tracks a copy of each seed in its own store, under `views/`,
written through sldb (`add_model` + `create_document`), never by hand.
"""
from importlib.resources import files
from pathlib import Path

from sldb import api
from sldb.core.exceptions import SLDBModelError
from sldb.models.notation.view_doc import ViewDoc
from sldb.runtime.validation import extract_model_data


def install_views(root):
    root = Path(root)
    store = root / '.sldb'
    try:
        api.add_model(store, 'sldb.models.notation_models:ViewDoc', '')
    except SLDBModelError:  # already registered
        pass
    (root / 'views').mkdir(exist_ok=True)
    names = []
    for seed in sorted(p for p in files('deskops').joinpath('data', 'views').iterdir() if p.name.endswith('.md')):
        payload = ViewDoc.model_validate(extract_model_data(ViewDoc, seed.read_text(encoding='utf-8'))).model_dump()
        api.create_document(store, 'ViewDoc', root / 'views' / seed.name, payload, payload['name'], '')
        names.append(payload['name'])
    return names
