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
    for model in ('board:BoardDoc', 'task:TaskDoc', 'routine:RoutineDoc', 'condition:ConditionDoc'):
        assert cli(['models', 'add', 'deskops.models.' + model, '--store', str(tmp_path / '.sldb')]) == 0
    return persistence.EditorStore(tmp_path / '.sldb')


def create(name, model, **payload):
    return {'action': 'create', 'id': name, 'model': model, 'payload': {'id': name, **payload}}


def save(store, changes, view=None):
    return store.save({'changes': changes, 'view': view or {}, 'viewRevision': store.view()['revision']})


def test_create_update_containment_and_reload_from_disk(store):
    result = save(store, [
        create('child', 'ConditionDoc', title='Child', subject='status', predicate='eq'),
        create('parent', 'RoutineDoc', title='Parent', entrypoint='child', decomposition=['child']),
        create('board', 'BoardDoc', title='Board', scope='UI', purpose='Organize'),
    ], {'collapsed': ['parent']})
    assert len(result['documents']) == 3
    child = next(d for d in result['documents'] if d['id'] == 'child')
    save(store, [{'action': 'update', 'id': 'child', 'model': 'ConditionDoc',
                  'expected': child['payload'], 'payload': {**child['payload'], 'title': 'Changed'}}])
    reopened = persistence.EditorStore(store.store).graph()
    assert next(d for d in reopened['documents'] if d['id'] == 'child')['payload']['title'] == 'Changed'
    assert next(d for d in reopened['documents'] if d['id'] == 'parent')['payload']['decomposition'] == ['child']
    assert 'Changed' in (store.root / child['path']).read_text()


def test_invalid_batch_writes_nothing(store):
    with pytest.raises(persistence.SaveError) as error:
        save(store, [create('valid', 'ConditionDoc', title='Valid', subject='x', predicate='eq'),
                     create('invalid', 'BoardDoc', title='Missing scope and purpose')])
    assert error.value.status == 422
    assert store.graph()['documents'] == []
    assert not (store.root / 'desk/mindmap/ConditionDoc/valid.md').exists()


def test_conflict_and_untrack_preserves_file(store):
    result = save(store, [create('condition', 'ConditionDoc', title='Condition', subject='x', predicate='eq')])
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
        save(store, [create('../escape', 'ConditionDoc', title='Bad', subject='x', predicate='eq')])
