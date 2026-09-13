import {useEffect} from 'react';

// Installs a single beforeunload guard while `when` is truthy. Centralizes
// what used to be three separate inline listeners (App/dirty,
// BrainstormView/pending, CompilerDialog/busy).
export function useBeforeUnload(when) {
  useEffect(() => {
    if (!when) return;
    const callback = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', callback);
    return () => window.removeEventListener('beforeunload', callback);
  }, [when]);
}
