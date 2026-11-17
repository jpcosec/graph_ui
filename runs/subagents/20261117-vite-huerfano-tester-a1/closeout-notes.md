# Notas del coordinador al cierre (vite preview huérfanos)

- **Código y tester.** Commit 9a609dd. El tester independiente da PASS: con carga normal, e2e 4 passed y test_review_workbench 3 passed, sin procesos de la corrida al final. La prueba nueva falla con el _stop viejo. _stop resiste un proceso que ignora TERM (KILL a los 10 s), uno ya muerto y nietos. Un fallo a mitad del fixture no deja huérfanos.
- **Desvío aceptado.** os.killpg(p.pid) en lugar de os.getpgid(p.pid): getpgid falla cuando npx ya murió y el node hijo sigue vivo en el grupo.
- **Con carga ~300** (colapso de RAM de robocop2) la e2e no pasó: el _wait de 60 s de vite dio timeout. No quedaron huérfanos. Es ambiental.
- **Hallazgo 1 (bajo), seguimiento.** npx vite build con subprocess.run(timeout=300) deja huérfanos sh y node si se pasa del timeout. Va a una tarea nueva.
- **Hallazgos 2-4 (info).** wait tras SIGKILL con un líder en estado D, _wait de 60 s con carga alta, descendientes con setsid. Quedan anotados.
