---
title: "R8: Un despliegue grande y anidado queda bajo 10 px tras «Ver todo»"
severity: medium
category: legibility
status: open
---
# R8: Un despliegue grande y anidado queda bajo 10 px tras «Ver todo»

## What
Un despliegue real de 34 elementos y 54 relaciones, anidado en cuatro niveles (cuenta > red > cluster >
servicio > artefacto) y con rótulo en casi todas las conexiones, queda a zoom 0,68 (texto de 8,6 px)
a 1800x1200 tras «Ver todo». Antes de la tarea de deployment estaba en 6,6 px.

## Expected
Todo texto >= 10 px tras «Ver todo» (G1), con el flujo de afuera hacia adentro (clientes a la
izquierda de la cuenta, sin aristas que vuelvan alrededor de ella).

## Where
frontends/mindmap/views/specs/notation/notation-layout.mjs (candidatos de ELK y su elección).

## Evidence
- Con ELK ya se probó: sin reservar sitio a los rótulos (y una segunda pasada que reserva solo los que
  no cupieron), menos padding en contenedores, sin plegado en filas ni orden del spec para despliegues
  (ambos invertían las aristas de los clientes). Plegado y compactación de ELK no actúan dentro de
  contenedores anidados.
- El ancho manda (el diagrama ocupa todo el ancho del lienzo y le sobra alto): cada nivel de anidado
  suma su encabezado y su padding en cada capa.
- Siguiente paso posible: un layout propio para despliegues (como los carriles de activity), o
  aceptar que un despliegue de este tamaño se lea con zoom y desplazamiento.
