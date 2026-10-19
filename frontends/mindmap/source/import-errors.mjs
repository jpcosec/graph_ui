// Modelos del store que el servidor no pudo importar (schema con import_error).
export function importErrorMessage(models) {
  const broken = (models || []).filter(m => m.import_error);
  if (!broken.length) return '';
  const list = broken.map(m => `${m.id} (${m.model_ref}): ${m.import_error}`).join('; ');
  return `${broken.length} modelo(s) del store no se pueden importar: ${list}. Si viven fuera del entorno, arranca graph-ui con --pythonpath <dir> (o SLDB_PYTHONPATH).`;
}
