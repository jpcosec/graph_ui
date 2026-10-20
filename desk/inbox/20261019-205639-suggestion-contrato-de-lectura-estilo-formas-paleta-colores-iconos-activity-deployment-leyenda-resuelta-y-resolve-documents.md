---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: spec2viz
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-19T20:56:39'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-10-20T00:18:36'
---

# Contrato de lectura: estilo (formas, paleta, colores, iconos), activity, deployment, leyenda resuelta y resolve_documents

_Describe the incoming message with enough evidence to triage._

spec2viz master 2ef07ab (CI verde: pytest 3.12 y 3.13, store). Detalle en docs/notation-contract.md §13 y §14; todo es opcional y una notacion sin estilo se resuelve como antes.

1. Formas builtin (spec2viz.notation.SHAPES; notation validate rechaza otras con UnknownShapeError): las de siempre mas cylinder (vertical, bases y almacenamiento), queue (cilindro horizontal), cloud, package (carpeta con pestana UML) y note (nota con esquina doblada).

2. Paleta = PaletteDoc:<name> (builtin default; NotationDoc.palette la nombra solo si la notacion usa estilo). Campos: backgrounds e ink por tema {light, dark}; icon_set {name: lucide, version: 0.577.0, icons: [...]} (nombres de lucide-react 0.577.0 en kebab-case; nunca URLs); colors (token -> {light, dark}); kinds (kind -> {shape, icon, fill, stroke}). La default cubre database, queue, storage, gateway, auth, backend, frontend, client y external, con trazo >= 3:1 contra cada fondo, texto >= 4.5:1 sobre cada relleno y un par (forma, icono) distinto por kind.

3. Precedencia unica (spec2viz.styling.resolve_style): por propiedad fill/stroke/icon gana glifo (sus campos y, detras, el kind de paleta que nombra) > style.kinds del spec (SpecDoc.style) > paleta de la notacion. No hace falta recalcular nada: resolve_view ya lo aplica.

4. Salida de resolve_view (y de resolve_documents): cada nodo trae style = {fill: {light, dark}, stroke: {light, dark}, icon, source: {prop: glyph|spec|palette}} con solo lo definido ({} si nada); cada link trae color ({light, dark} o null); la vista trae palette y legend = {glyphs: [{glyph, title, shape, function, style}], links: [{link, title, relation, draw, line, source_end, target_end, color}], kinds: [{kind, shape, icon, fill, stroke, source}]}. El texto sobre un relleno usa el ink del tema. Esto cubre tu pedido (2), leyenda resuelta.

5. Tu pedido (1): spec2viz.notation_view.resolve_documents(store, notation_ref, doc_refs, *, relation_refs=None, spec_style=None) es publico y devuelve lo mismo que resolve_view sin los campos del spec, para documentos de cualquier modelo (cada doc con el primer glifo de su modelo cuyo where casa; links = contains entre ellos + RelationDoc con ambos extremos en la vista, filtrados por relation_refs si se da).

6. Activity: data.partition por paso (un carril por particion, en orden de aparicion), data.notes (forma note unida al paso por linea punteada), kind merge con glifo activity.merge (rombo sin rotulo). El nodo inicial es el pseudonodo <spec>.__initial (glifo start) con next al paso de start, que conserva su glifo; el final es end mismo si no es un paso, o <spec>.__final si end es un paso. Un glifo con label vacio explicito sale con label vacio (antes caia a title).

7. Deployment: nodos anidados a cualquier profundidad via contains (draw nest: subgrafos dentro de subgrafos); relaciones connects (con data.label y data.protocol), deploy y manifest (punteadas, con «deploy» y «manifest» en el rotulo). El keyword «{kind}» llega interpolado y vacio si no hay kind: ningun placeholder sin resolver llega al resolver (hay un test).

8. Catalogo: vistas.yml acepta notation por vista; diagram sync ya no borra category, nav ni summary.
