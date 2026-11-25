# result-summary: executor IR13, intento 2 (arreglo de la regresión de test_ci_workflow)

## Cambio
- tests/test_ci_workflow.py::test_sibling_repos_come_from_git_main_branches_not_releases:
  ahora espera 3 líneas `git+https://github.com/jpcosec/` (antes 4), afirma que los nombres son
  exactamente structuredLanguageDB, pron, deskops (en ese orden) y que `spec2viz` no aparece en
  `.github/requirements-suite.txt` (ni en comentarios). El docstring nuevo dice que spec2viz ya no es hermano.
- No se tocó ningún otro archivo ni nada bajo .github/ (el `--src` de ci.yml queda igual).

## Paso 2: otros tests
`grep -rn "requirements-suite\|notation\]\|optional-dependencies\|spec2viz" tests/*.py` y búsqueda de
`pyproject|[test]|[notation]`: solo tests/test_ci_workflow.py lee requirements-suite.txt/pyproject.toml
(la otra coincidencia, tests/e2e_mindmap_notation.py:167, es un rótulo "[the diagram type has a notation]",
no lee extras). Nada más que arreglar.

## Validación (validation.log)
| Comando | Resultado | Exit |
|---|---|---|
| `python -c "import spec2viz"` (venv uv /dev/shm/venv-ir13-fix) | ModuleNotFoundError | 1 (esperado) |
| `pytest -q -rs tests/test_ci_workflow.py` (MemoryMax=3G, sin -n) | 6 passed | 0 |
| Copia /dev/shm con la línea `-e git+...spec2viz...` re-agregada | 1 failed `assert (4 == 3)` | 1 (esperado) |
| Copia /dev/shm con solo `# spec2viz` agregado | 1 failed `'spec2viz' not in ...` | 1 (esperado) |
| Control: copia con requirements-suite.txt del repo | 1 passed | 0 |

Nota: tras la primera corrida borré el venv por error de rutas en el script (la prueba negativa no llegó
a ejecutarse); lo recreé con los mismos comandos y repetí la prueba negativa. Consta en el log.
/dev/shm limpio (venv y copia borrados).
