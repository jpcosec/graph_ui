// Skin selection: persisted in localStorage, applied via data-skin on <html>.
// Class identity colors are NOT skin — see shared/classes.mjs. This module
// only resolves the CSS custom properties a skin defines.
export const SKINS = ['light', 'dark'];
const STORAGE_KEY = 'kb-skin';

export function getSkin() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SKINS.includes(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
}

export function setSkin(name) {
  const next = SKINS.includes(name) ? name : 'light';
  try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  document.documentElement.dataset.skin = next;
  return next;
}

// Memoized per (skin, token) so a skin switch is the only thing that
// invalidates a cached read; components re-render and call this again.
const cache = new Map();
export function resolveToken(name) {
  const key = `${document.documentElement.dataset.skin || getSkin()}|${name}`;
  if (cache.has(key)) return cache.get(key);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  cache.set(key, value);
  return value;
}
