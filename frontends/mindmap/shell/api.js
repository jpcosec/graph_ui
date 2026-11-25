// Fetch wrapper for every /api/* call: 60s timeout, throws on non-2xx or
// {ok:false}, attaching the parsed body to the error so callers (e.g. the
// save 409-conflict path) can inspect it.
// createRequest(baseUrl) resolves each path against baseUrl (default ''), so
// the same code can be mounted on a page served from another origin/prefix.
export function joinUrl(baseUrl, path) {
  const base = baseUrl || '';
  if (!base || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path;
  return base.replace(/\/+$/, '') + (path.startsWith('/') ? path : '/' + path);
}

export function createRequest(baseUrl = '') {
  return async function request(path, init) {
    const response = await fetch(joinUrl(baseUrl, path), {...init, signal: AbortSignal.timeout(60000)});
    const body = await response.json();
    if (!response.ok || body.ok === false) {
      const error = new Error(body.error || 'No se pudo completar la operación');
      error.body = body;
      throw error;
    }
    return body;
  };
}

export const request = createRequest('');
