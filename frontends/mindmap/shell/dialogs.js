import React, {createContext, useContext, useState} from 'react';

// Shell-level dialog host: at most one shell dialog at a time (classes,
// compiler). View-level dialogs (Document/QuickCreate/Connect) stay owned by
// their view; they just read `current` from here to avoid ever stacking two
// dialogs. `spec` is `{kind:'classes', model?}` or `{kind:'compiler'}`.
const ShellDialogsContext = createContext(null);

export function ShellDialogsProvider({children}) {
  const [current, setCurrent] = useState(null);
  const value = {current, open: spec => setCurrent(spec), close: () => setCurrent(null)};
  return React.createElement(ShellDialogsContext.Provider, {value}, children);
}

export function useShellDialogs() {
  return useContext(ShellDialogsContext);
}
