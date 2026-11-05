// Start-up and global listeners; loaded last, after the screen scripts.
'use strict';

document.getElementById('desk-select').addEventListener('change', (event) => {
  const search = new URLSearchParams(location.search);
  search.set('desk', event.target.value);
  location.search = search.toString();
});
document.getElementById('refresh').addEventListener('click', () => {
  state.action = null;
  state.inboxAction = null;
  refresh();
});
window.addEventListener('hashchange', onRoute);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.selected && screen() === 'board' && !document.getElementById('confirm').open) select(null);
});

(async function start() {
  document.getElementById('main').replaceChildren(h('p', { class: 'loading' }, 'Cargando el desk…'));
  await loadDesks();
  await loadViews();
  const { screen: name, params } = route();
  if (name === 'task' && params.get('id')) state.selected = params.get('id');
  await loadTask();
  render();
})();
