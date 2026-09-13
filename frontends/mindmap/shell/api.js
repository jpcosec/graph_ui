// Single fetch wrapper for every /api/* call: 60s timeout, throws on
// non-2xx or {ok:false}, attaching the parsed body to the error so callers
// (e.g. the save 409-conflict path) can inspect it.
export async function request(path, init) {
  const response = await fetch(path, {...init, signal: AbortSignal.timeout(60000)});
  const body = await response.json();
  if (!response.ok || body.ok === false) {
    const error = new Error(body.error || 'No se pudo completar la operación');
    error.body = body;
    throw error;
  }
  return body;
}
