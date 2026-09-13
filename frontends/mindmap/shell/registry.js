import {mapView} from '../views/documents/map/map-view.js';
import {treeView} from '../views/draft/tree/tree-view.js';
import {diagramView} from '../views/models/diagram/diagram-view.js';

// Order here drives the tab order in the shell topbar: KB, Brainstorm, Schema.
export const VIEWS=[mapView, treeView, diagramView];

export function viewById(id) {
  return VIEWS.find(v=>v.id===id) || mapView;
}
