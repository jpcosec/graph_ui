// Panel de workers plegable, recordado por vista: cada vista declara su estado inicial
// (shell.workers: 'collapsed' en la vista Specs, para que el diagrama tenga el lienzo entero) y el
// operador lo cambia con el control del panel; lo que elige se guarda por vista.
export const STORAGE_PREFIX = 'kb-workers-collapsed:';

export function workersCollapsed(viewId, defaultCollapsed, storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_PREFIX + viewId);
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch {}
  return Boolean(defaultCollapsed);
}

export function rememberWorkers(viewId, collapsed, storage = globalThis.localStorage) {
  try { storage?.setItem(STORAGE_PREFIX + viewId, collapsed ? '1' : '0'); } catch {}
}
