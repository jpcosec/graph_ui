import {mapView} from '../views/documents/map/map-view.js';
import {flowView} from '../views/documents/flow/flow-view.js';
import {treeView} from '../views/draft/tree/tree-view.js';
import {diagramView} from '../views/models/diagram/diagram-view.js';

// Order here drives the tab order in the shell topbar (today: KB, Flujo,
// Brainstorm, Schema) AND which stylesheets app.js injects, in this same
// order (each descriptor's own `styles`, see its view file). Adding or
// reordering a view is one line here — plus its own views/{facet}/{vista}/
// directory with a descriptor that includes `styles` — nothing else to wire
// (shell.js and router.js already iterate VIEWS generically, never a fixed
// set of ids).
export const VIEWS=[mapView, flowView, treeView, diagramView];

export function viewById(id) {
  return VIEWS.find(v=>v.id===id) || mapView;
}
