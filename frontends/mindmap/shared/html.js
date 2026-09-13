// Single htm/React binding shared by every .js (DOM) component, so nothing
// re-binds its own copy.
import React from 'react';
import htm from 'htm';
export const html = htm.bind(React.createElement);
