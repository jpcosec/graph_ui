# Notas del coordinador al cierre (vite build huérfano)

- **Código y tester.** Commit e5d731e. El tester independiente da PASS:
  - e2e 5 passed;
  - la prueba nueva falla con el _build viejo, con 2 PID huérfanos;
  - la rama rc != 0 da CalledProcessError con el log;
  - el descriptor del log queda cerrado;
  - _spawn y _stop son byte-idénticos.
- **Hallazgos bajos, sin tarea; quedan como endurecimiento opcional:**
  - _build solo para el grupo ante TimeoutExpired, no ante KeyboardInterrupt (:124-128);
  - el TimeoutExpired relanzado no lleva el log (:128);
  - la prueba no comprueba que hubiera procesos antes del corte (:222-224). En la corrida sí los hubo.
