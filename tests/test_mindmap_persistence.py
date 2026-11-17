"""Real SLDB round trips in isolated stores; no writes to the user's KB."""
import importlib.util
from pathlib import Path
import pytest
from sldb.cli import main as cli

MODULE = Path(__file__).parents[1] / 'frontends/mindmap/persistence.py'
spec = importlib.util.spec_from_file_location('mindmap_persistence', MODULE)
persistence = importlib.util.module_from_spec(spec)
spec.loader.exec_module(persistence)


@pytest.fixture
def store(tmp_path):
    assert cli(['stores', 'init', '--path', str(tmp_path)]) == 0
    for model in ('board:BoardDoc', 'task:TaskDoc', 'ritual:RitualDoc', 'step:StepDoc'):
        assert cli(['models', 'add', 'deskops.models.' + model, '--store', str(tmp_path / '.sldb')]) == 0
    return persistence.EditorStore(tmp_path / '.sldb')


def create(name, model, **payload):
    return {'action': 'create', 'id': name, 'model': model, 'payload': {'id': name, **payload}}


def save(store, changes, view=None):
    return store.save({'changes': changes, 'view': view or {}, 'viewRevision': store.view()['revision']})


def test_create_update_containment_and_reload_from_disk(store):
    result = save(store, [
        create('child', 'StepDoc', title='Child', action='Run it', outcome='Done'),
        create('parent', 'RitualDoc', title='Parent', purpose='Group', trigger='Always', completion='All steps', steps=['child']),
        create('board', 'BoardDoc', title='Board', scope='UI', purpose='Organize'),
    ], {'collapsed': ['parent']})
    assert len(result['documents']) == 3
    child = next(d for d in result['documents'] if d['id'] == 'child')
    save(store, [{'action': 'update', 'id': 'child', 'model': 'StepDoc',
                  'expected': child['payload'], 'payload': {**child['payload'], 'title': 'Changed'}}])
    reopened = persistence.EditorStore(store.store).graph()
    assert next(d for d in reopened['documents'] if d['id'] == 'child')['payload']['title'] == 'Changed'
    assert next(d for d in reopened['documents'] if d['id'] == 'parent')['payload']['steps'] == ['child']
    assert 'Changed' in (store.root / child['path']).read_text()


def test_invalid_batch_writes_nothing(store):
    with pytest.raises(persistence.SaveError) as error:
        save(store, [create('valid', 'StepDoc', title='Valid', action='x', outcome='y'),
                     create('invalid', 'BoardDoc', title='Missing scope and purpose')])
    assert error.value.status == 422
    assert store.graph()['documents'] == []
    assert not (store.root / 'StepDoc/valid.md').exists()


def test_conflict_and_untrack_preserves_file(store):
    result = save(store, [create('step', 'StepDoc', title='Step', action='x', outcome='y')])
    doc = result['documents'][0]
    with pytest.raises(persistence.SaveError) as error:
        save(store, [{'action': 'update', 'id': doc['id'], 'model': doc['model_name'],
                      'expected': {}, 'payload': doc['payload']}])
    assert error.value.status == 409
    result = save(store, [{'action': 'delete', 'id': doc['id'], 'expected': doc['payload']}])
    assert result['documents'] == []
    assert (store.root / doc['path']).exists()


def test_view_conflict_and_path_traversal_rejected(store):
    revision = store.view()['revision']
    save(store, [], {'collapsed': ['a']})
    with pytest.raises(persistence.SaveError) as error:
        store.save({'changes': [], 'view': {}, 'viewRevision': revision})
    assert error.value.status == 409
    with pytest.raises(persistence.SaveError):
        save(store, [create('../escape', 'StepDoc', title='Bad', action='x', outcome='y')])


def test_save_on_a_store_unprepared_after_open_is_503_store_no_preparado_and_writes_nothing(store):
    """EditorStore abierto sobre un store preparado que después queda no canónico (el índice
    semántico real en su archivo único previo al sharding, como tests/test_mindmap_workspace_explorer.py::
    test_listing_get_on_unprepared_store_is_503_and_writes_nothing): save traduce el 'store not prepared'
    de sldb.api.read_store a SaveError 503 'store_no_preparado' antes de escribir nada en .sldb,
    .sldb_cache ni el archivo de vista."""
    import hashlib
    from sldb.api import store_is_prepared
    from sldb.store.io import load_semantic_index
    from sldb.store.io.utils import yaml_dump
    from sldb.store.layout import semantic_index_path

    sldb_dir = Path(store.store)
    assert store_is_prepared(sldb_dir)
    legacy = semantic_index_path(sldb_dir)
    legacy.write_text(yaml_dump(load_semantic_index(sldb_dir).model_dump(mode='json')), encoding='utf-8')
    assert not store_is_prepared(sldb_dir)

    def tree_state():
        return {str(p): (hashlib.sha256(p.read_bytes()).hexdigest(), p.stat().st_mtime_ns)
                for p in sorted(store.root.rglob('*')) if p.is_file()}

    before = tree_state()
    with pytest.raises(persistence.SaveError) as error:
        save(store, [create('step', 'StepDoc', title='Step', action='x', outcome='y')], {'collapsed': ['a']})
    assert error.value.status == 503 and error.value.estado == 'store_no_preparado'
    assert 'store not prepared' in str(error.value)
    assert tree_state() == before
    assert legacy.exists() and not store_is_prepared(sldb_dir)
