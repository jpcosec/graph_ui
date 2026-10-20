# Ronda r13 — diagramas reagrupados (store de diagramas externo)

Arranque: SLDB_STORE=<store de diagramas>/.sldb graph-ui --pythonpath <src del store> 8092
Capturas: /tmp/shots/jerarquia/*.png. Scripts: /tmp/shots-scr/pane.mjs, fit.mjs, shot.mjs.

R13 (obligatorio) El lienzo de React Flow crece con la leyenda del panel izquierdo y queda más alto que la
    ventana: con viewport 1800x1200, .react-flow mide top 113 / bottom 1705 en component.contexto (la
    leyenda de la notación de componentes tiene 14 glifos + 8 links) y bottom 1516 en deployment.dev-aws;
    document.scrollHeight sigue en 1200 (overflow oculto). "Ver todo" encuadra contra ese lienzo, así que la
    parte de abajo del diagrama queda fuera de la ventana (el nodo «system» del contexto y la capa Datos de
    kit-componentes se cortan). Mi aserción anterior de margen pasaba porque medía contra el lienzo, no contra
    la ventana. Pedido: el lienzo ocupa exactamente el alto disponible (la leyenda hace scroll propio en su
    panel) y el e2e mide el margen contra window.innerHeight.
R14 Encabezados de participantes de sequence: el texto toca o se corta en el borde derecho de la caja
    ("S1_borde", "S4_gateway", "BD_plataforma" en sequence.publicar-agente) desde que llevan color/ícono.
R15 (deseable) En component.contexto el nodo central («system», al que llegan casi todas las aristas)
    queda en la esquina inferior derecha y las aristas cruzan todo el lienzo. Si el layout puede, que el nodo con
    más grado quede al centro, o como mínimo en la capa media entre las fuentes (Personas/Canales) y los destinos
    (AWS/Terceros).
