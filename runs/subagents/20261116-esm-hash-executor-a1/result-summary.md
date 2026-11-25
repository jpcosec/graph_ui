# Result summary: executor a1, timeout + sha256 en el hook de esm.sh

## Diff (`git diff -- tests/mindmap-workspace-reader.test.mjs`)

```diff
diff --git a/tests/mindmap-workspace-reader.test.mjs b/tests/mindmap-workspace-reader.test.mjs
index ef253c3..24310f7 100644
--- a/tests/mindmap-workspace-reader.test.mjs
+++ b/tests/mindmap-workspace-reader.test.mjs
@@ -111,7 +111,48 @@ test('sin identidad abierta no se resalta nada por propiedad', () => {
 const indexHtml = readFileSync(new URL('../frontends/mindmap/index.html', import.meta.url), 'utf-8');
 const importMap = JSON.parse(indexHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 const MD_URL = importMap.imports['markdown-it'];
+// Integridad y plazo: cada modulo https que pide el hook (la URL que recibe load(), antes de
+// redirecciones) debe estar en EXPECTED_SHA256 con el sha256 de su texto UTF-8; una URL ausente, un
+// contenido distinto o un fetch que no termina en 20 s hacen fallar la prueba nombrando la URL.
+// Para regenerar la tabla al cambiar la version del import map: agregar temporalmente en load(),
+// tras descargar, console.error(url, createHash('sha256').update(text, 'utf8').digest('hex')),
+// correr `node --test tests/mindmap-workspace-reader.test.mjs` con red, copiar aqui cada par
+// URL -> hash impreso (las URLs de dependencias tambien cambian) y quitar el log.
+const EXPECTED_SHA256 = {
+  'https://esm.sh/markdown-it@14.1.0':
+    'ced1c1bb5a8502ed7924950ef10f8bcf524d541c9c2c111f8861a1a0820937df',
+  'https://esm.sh/entities@^4.4.0?target=es2022':
+    '6be2794a0aa9a0c29d15a0a4006a4e3e4a68a789396ab7f1c35134bd53fb5faa',
+  'https://esm.sh/entities@4.5.0/es2022/lib/decode.mjs':
+    'ef22e25f6bca668e40c4f7d4ecaebe2172a833a18372d55b54f997d0d8702dcd',
+  'https://esm.sh/punycode.js@^2.3.1?target=es2022':
+    'd1b84265b5e42da1f9c6e3d457985ead3d63633caa06b1df1b7578d09cfcec05',
+  'https://esm.sh/linkify-it@^5.0.0?target=es2022':
+    'f745edba9b39a27b310f0855021f58c5183c36c989ea3bd8d4869b494a058a9c',
+  'https://esm.sh/mdurl@^2.0.0?target=es2022':
+    '0432b26197f320df4fff103362a7f841fe2f23a5348f2353863a298e482bdda3',
+  'https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs':
+    '82ffca240d509b4840880b2e20e3625bb67c7e6c6777ba0da3f28815acbce558',
+  'https://esm.sh/uc.micro@^2.1.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/uc.micro@^2.0.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/punycode.js@2.3.1/es2022/punycode.mjs':
+    '91fcd4eab87734cc0b84f71999b151c798f4bda8b922a337bfd3af3109a7e0b5',
+  'https://esm.sh/entities@4.5.0/es2022/lib/escape.mjs':
+    '116aef78e5ff05efa6f79851b8b59da025ab88f5c25d2262f73df98f4d57c3fa',
+  'https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs':
+    'a7f8bf81f86ab33b188173277252922bb577cb6c72e7f5f5b75d99d68a66a092',
+  'https://esm.sh/mdurl@2.1.0/es2022/mdurl.mjs':
+    '487149fd6591ee740f4e9df7cf13c4694bfd613650b49b5f6895ab3b1e81627d',
+  'https://esm.sh/uc.micro@2.1.0/es2022/uc.micro.mjs':
+    '549d36fd64ab29703da6e300957bed9de0dae7d7218eca8bbe6681994133e8b0',
+  'https://esm.sh/entities@4.5.0/es2022/entities.mjs':
+    '4a9306e4021ae1079e83b5db26e1678c536fa69c8f2839802bc3cc43282cef08',
+};
 const HTTPS_HOOKS = `
+import {createHash} from 'node:crypto';
+const EXPECTED_SHA256 = ${JSON.stringify(EXPECTED_SHA256)};
 export async function resolve(specifier, context, next) {
   const parent = context.parentURL || '';
   if (specifier.startsWith('https://')) return {url: specifier, shortCircuit: true};
@@ -120,9 +161,20 @@ export async function resolve(specifier, context, next) {
 }
 export async function load(url, context, next) {
   if (!url.startsWith('https://')) return next(url, context);
-  const res = await fetch(url);
-  if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
-  return {format: 'module', source: await res.text(), shortCircuit: true};
+  const expected = EXPECTED_SHA256[url];
+  if (!expected) throw new Error('GET ' + url + ' -> sin sha256 esperado en EXPECTED_SHA256');
+  let res, text;
+  try {
+    res = await fetch(url, {signal: AbortSignal.timeout(20000)});
+    if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
+    text = await res.text();
+  } catch (err) {
+    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) throw new Error('GET ' + url + ' -> timeout 20 s');
+    throw err;
+  }
+  const got = createHash('sha256').update(text, 'utf8').digest('hex');
+  if (got !== expected) throw new Error('GET ' + url + ' -> sha256 ' + got + ' != ' + expected);
+  return {format: 'module', source: text, shortCircuit: true};
 }`;
 register('data:text/javascript,' + encodeURIComponent(HTTPS_HOOKS));
 const {default: MarkdownIt} = await import(MD_URL);
```

## Tabla de URLs y hashes (descubrimiento)

Obtenida con un console.error temporal en load() ANTES de agregar el control (discovery.log, rc 0, 16/16), repetida en una segunda descarga con resultado idéntico (discovery-pass2.txt). El log temporal ya no está en el archivo. Clave = URL que recibe load().

| URL pedida | sha256 |
|---|---|
| https://esm.sh/markdown-it@14.1.0 | ced1c1bb5a8502ed7924950ef10f8bcf524d541c9c2c111f8861a1a0820937df |
| https://esm.sh/entities@^4.4.0?target=es2022 | 6be2794a0aa9a0c29d15a0a4006a4e3e4a68a789396ab7f1c35134bd53fb5faa |
| https://esm.sh/entities@4.5.0/es2022/lib/decode.mjs | ef22e25f6bca668e40c4f7d4ecaebe2172a833a18372d55b54f997d0d8702dcd |
| https://esm.sh/punycode.js@^2.3.1?target=es2022 | d1b84265b5e42da1f9c6e3d457985ead3d63633caa06b1df1b7578d09cfcec05 |
| https://esm.sh/linkify-it@^5.0.0?target=es2022 | f745edba9b39a27b310f0855021f58c5183c36c989ea3bd8d4869b494a058a9c |
| https://esm.sh/mdurl@^2.0.0?target=es2022 | 0432b26197f320df4fff103362a7f841fe2f23a5348f2353863a298e482bdda3 |
| https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs | 82ffca240d509b4840880b2e20e3625bb67c7e6c6777ba0da3f28815acbce558 |
| https://esm.sh/uc.micro@^2.1.0?target=es2022 | 2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60 |
| https://esm.sh/uc.micro@^2.0.0?target=es2022 | 2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60 |
| https://esm.sh/punycode.js@2.3.1/es2022/punycode.mjs | 91fcd4eab87734cc0b84f71999b151c798f4bda8b922a337bfd3af3109a7e0b5 |
| https://esm.sh/entities@4.5.0/es2022/lib/escape.mjs | 116aef78e5ff05efa6f79851b8b59da025ab88f5c25d2262f73df98f4d57c3fa |
| https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs | a7f8bf81f86ab33b188173277252922bb577cb6c72e7f5f5b75d99d68a66a092 |
| https://esm.sh/mdurl@2.1.0/es2022/mdurl.mjs | 487149fd6591ee740f4e9df7cf13c4694bfd613650b49b5f6895ab3b1e81627d |
| https://esm.sh/uc.micro@2.1.0/es2022/uc.micro.mjs | 549d36fd64ab29703da6e300957bed9de0dae7d7218eca8bbe6681994133e8b0 |
| https://esm.sh/entities@4.5.0/es2022/entities.mjs | 4a9306e4021ae1079e83b5db26e1678c536fa69c8f2839802bc3cc43282cef08 |

## Casos

Las copias de (b), (c) y (c') estuvieron en /dev/shm/esm-e1/. Las importaciones relativas (reader.mjs e index.html) se cambiaron a file:// absolutos del repo real. Los logs completos, con el diff de cada copia, están en el run dir.

| Caso | Comando | Exit | Duración | Mensaje |
|---|---|---|---|---|
| (a) con red (case-red.log) | `node --test tests/mindmap-workspace-reader.test.mjs` | 0 | 2,98 s | 16/16 pass |
| (b) hash alterado (case-hash.log) | `node --test /dev/shm/esm-e1/case-hash.test.mjs`, con la entrada de markdown-it@14.1.0 = 64 ceros | 1 | 1,60 s | `Error: GET https://esm.sh/markdown-it@14.1.0 -> sha256 ced1c1bb…937df != 0000…0000` (9 pass, 1 fail) |
| (c) listener TCP que acepta y no responde (case-colgado.log, primera parte) | `time node --test /dev/shm/esm-e1/case-colgado.test.mjs`, MD_URL=https://127.0.0.1:42039 en la tabla, sin la aserción de MD_URL | 1 | 11,33 s (real, < 30 s) | **`TypeError: fetch failed`, no el mensaje de timeout** |
| (c') listener TLS que completa el handshake y no responde (case-colgado.log, sección VARIANTE) | `time env NODE_EXTRA_CA_CERTS=/dev/shm/esm-e1/cert.pem node --test /dev/shm/esm-e1/case-colgado-tls.test.mjs` | 1 | 20,22 s (real, < 30 s) | `Error: GET https://127.0.0.1:43783 -> timeout 20 s` |

### Discrepancia en el caso (c), para que la disponga el coordinador
Con (c) tal como se dispuso, el handshake TLS nunca termina. undici aplica su propio connect timeout de 10 s antes que AbortSignal.timeout(20000) y lanza `TypeError('fetch failed')` con `cause.code = UND_ERR_CONNECT_TIMEOUT` (`cause.name = ConnectTimeoutError`); lo confirmé con un fetch aislado: 10718 ms. No es TimeoutError ni AbortError, así que, según la disposición ("solo TimeoutError/AbortError se relanza"), se conserva tal cual. La prueba falla en 11,3 s (< 30 s), pero sin el mensaje 'GET <url> -> timeout 20 s' y sin nombrar la URL, así que el Done When de (c) no se cumple al pie de la letra. No me salí de la disposición. La variante (c') muestra que el camino del AbortSignal de 20 s funciona cuando el cuelgue ocurre después de la conexión. Opción posible si se acepta: mapear también `err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT'` a un mensaje propio, por ejemplo 'GET <url> -> connect timeout'.

## Validación (validation.log)
- `node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs`: exit 0, 23/23 pass
- `node --test tests/*.test.mjs`: exit 0, 158/158 pass
- `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm /dev/shm/venv-esm-e1/bin/python -m pytest -q -p no:cacheprovider tests/test_mindmap_workspace_reader.py` (venv uv con -e ../../sldb ../../pron ../../deskops ".[test]", sin -n): exit 0, 31 passed, 1 warning, 322 s

Limpieza: listeners terminados por PID (2552336, 2557082 y el del diagnóstico aislado); /dev/shm/esm-e1*, /dev/shm/venv-esm-e1 borrados.

EXECUTOR DONE: timeout de 20 s + EXPECTED_SHA256 (15 URLs) implementados en tests/mindmap-workspace-reader.test.mjs; (a) y (b) OK; (c) falla en 11,3 s pero con 'fetch failed' por el connect timeout de undici (discrepancia para disponer), y (c') muestra el mensaje 'timeout 20 s' en 20,2 s; validación node y pytest en verde.
Archivos tocados: tests/mindmap-workspace-reader.test.mjs; runs/subagents/20261116-esm-hash-executor-a1/{discovery.log,discovery-pass2.txt,case-red.log,case-hash.log,case-colgado.log,validation.log,result-summary.md}

## Corrección 1 (el coordinador autorizó mapear el connect timeout de undici)

Cambio: si `err.cause?.code` o `err.code` es `UND_ERR_CONNECT_TIMEOUT`, el error se relanza como `Error('GET <url> -> connect timeout')`. TimeoutError/AbortError siguen dando `timeout 20 s` y el resto conserva su error. Diff completo actual:

```diff
diff --git a/tests/mindmap-workspace-reader.test.mjs b/tests/mindmap-workspace-reader.test.mjs
index ef253c3..98dc2a7 100644
--- a/tests/mindmap-workspace-reader.test.mjs
+++ b/tests/mindmap-workspace-reader.test.mjs
@@ -111,7 +111,48 @@ test('sin identidad abierta no se resalta nada por propiedad', () => {
 const indexHtml = readFileSync(new URL('../frontends/mindmap/index.html', import.meta.url), 'utf-8');
 const importMap = JSON.parse(indexHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 const MD_URL = importMap.imports['markdown-it'];
+// Integridad y plazo: cada modulo https que pide el hook (la URL que recibe load(), antes de
+// redirecciones) debe estar en EXPECTED_SHA256 con el sha256 de su texto UTF-8; una URL ausente, un
+// contenido distinto o un fetch que no termina en 20 s hacen fallar la prueba nombrando la URL.
+// Para regenerar la tabla al cambiar la version del import map: agregar temporalmente en load(),
+// tras descargar, console.error(url, createHash('sha256').update(text, 'utf8').digest('hex')),
+// correr `node --test tests/mindmap-workspace-reader.test.mjs` con red, copiar aqui cada par
+// URL -> hash impreso (las URLs de dependencias tambien cambian) y quitar el log.
+const EXPECTED_SHA256 = {
+  'https://esm.sh/markdown-it@14.1.0':
+    'ced1c1bb5a8502ed7924950ef10f8bcf524d541c9c2c111f8861a1a0820937df',
+  'https://esm.sh/entities@^4.4.0?target=es2022':
+    '6be2794a0aa9a0c29d15a0a4006a4e3e4a68a789396ab7f1c35134bd53fb5faa',
+  'https://esm.sh/entities@4.5.0/es2022/lib/decode.mjs':
+    'ef22e25f6bca668e40c4f7d4ecaebe2172a833a18372d55b54f997d0d8702dcd',
+  'https://esm.sh/punycode.js@^2.3.1?target=es2022':
+    'd1b84265b5e42da1f9c6e3d457985ead3d63633caa06b1df1b7578d09cfcec05',
+  'https://esm.sh/linkify-it@^5.0.0?target=es2022':
+    'f745edba9b39a27b310f0855021f58c5183c36c989ea3bd8d4869b494a058a9c',
+  'https://esm.sh/mdurl@^2.0.0?target=es2022':
+    '0432b26197f320df4fff103362a7f841fe2f23a5348f2353863a298e482bdda3',
+  'https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs':
+    '82ffca240d509b4840880b2e20e3625bb67c7e6c6777ba0da3f28815acbce558',
+  'https://esm.sh/uc.micro@^2.1.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/uc.micro@^2.0.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/punycode.js@2.3.1/es2022/punycode.mjs':
+    '91fcd4eab87734cc0b84f71999b151c798f4bda8b922a337bfd3af3109a7e0b5',
+  'https://esm.sh/entities@4.5.0/es2022/lib/escape.mjs':
+    '116aef78e5ff05efa6f79851b8b59da025ab88f5c25d2262f73df98f4d57c3fa',
+  'https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs':
+    'a7f8bf81f86ab33b188173277252922bb577cb6c72e7f5f5b75d99d68a66a092',
+  'https://esm.sh/mdurl@2.1.0/es2022/mdurl.mjs':
+    '487149fd6591ee740f4e9df7cf13c4694bfd613650b49b5f6895ab3b1e81627d',
+  'https://esm.sh/uc.micro@2.1.0/es2022/uc.micro.mjs':
+    '549d36fd64ab29703da6e300957bed9de0dae7d7218eca8bbe6681994133e8b0',
+  'https://esm.sh/entities@4.5.0/es2022/entities.mjs':
+    '4a9306e4021ae1079e83b5db26e1678c536fa69c8f2839802bc3cc43282cef08',
+};
 const HTTPS_HOOKS = `
+import {createHash} from 'node:crypto';
+const EXPECTED_SHA256 = ${JSON.stringify(EXPECTED_SHA256)};
 export async function resolve(specifier, context, next) {
   const parent = context.parentURL || '';
   if (specifier.startsWith('https://')) return {url: specifier, shortCircuit: true};
@@ -120,9 +161,22 @@ export async function resolve(specifier, context, next) {
 }
 export async function load(url, context, next) {
   if (!url.startsWith('https://')) return next(url, context);
-  const res = await fetch(url);
-  if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
-  return {format: 'module', source: await res.text(), shortCircuit: true};
+  const expected = EXPECTED_SHA256[url];
+  if (!expected) throw new Error('GET ' + url + ' -> sin sha256 esperado en EXPECTED_SHA256');
+  let res, text;
+  try {
+    res = await fetch(url, {signal: AbortSignal.timeout(20000)});
+    if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
+    text = await res.text();
+  } catch (err) {
+    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) throw new Error('GET ' + url + ' -> timeout 20 s');
+    // undici corta la conexion (TCP + TLS) a los 10 s con su propio connect timeout
+    if (err && (err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'UND_ERR_CONNECT_TIMEOUT')) throw new Error('GET ' + url + ' -> connect timeout');
+    throw err;
+  }
+  const got = createHash('sha256').update(text, 'utf8').digest('hex');
+  if (got !== expected) throw new Error('GET ' + url + ' -> sha256 ' + got + ' != ' + expected);
+  return {format: 'module', source: text, shortCircuit: true};
 }`;
 register('data:text/javascript,' + encodeURIComponent(HTTPS_HOOKS));
 const {default: MarkdownIt} = await import(MD_URL);
```

- Caso (c) repetido con `net.createServer`, que acepta y no responde (puerto 33921, pid 2597113, terminado por PID), mediante `time node --test /dev/shm/esm-e1/case-colgado.test.mjs`: **exit 1, real 11,01 s (< 30 s)**, con `Error: GET https://127.0.0.1:33921 -> connect timeout` (9 pass, 1 fail). Esa salida reemplaza la (c) anterior en case-colgado.log; la sección (c') y su nota se conservan, con una línea que aclara que la nota es anterior a la corrección.
- `node --test tests/*.test.mjs`: exit 0, 158/158 (validation.log, sección "Corrección 1"). No repetí pytest, como indicó el coordinador.
- /dev/shm limpio.

EXECUTOR DONE: timeout de 20 s, connect timeout de undici mapeado y EXPECTED_SHA256 (15 URLs) en tests/mindmap-workspace-reader.test.mjs. (a) pasa; (b) falla con el sha256; (c) falla en 11,0 s con 'connect timeout'; (c') falla en 20,2 s con 'timeout 20 s'. node --test tests/*.test.mjs pasa 158/158 y pytest pasó 31/31 antes de la corrección.
Archivos tocados: tests/mindmap-workspace-reader.test.mjs; runs/subagents/20261116-esm-hash-executor-a1/{discovery.log,discovery-pass2.txt,case-red.log,case-hash.log,case-colgado.log,validation.log,result-summary.md}

## Corrección 2 (comentario de regeneración, tras el tester)

Solo cambió el comentario; la lógica queda igual. El procedimiento anterior (agregar un console.error en load()) no servía con URLs nuevas, porque el throw "sin sha256 esperado" ocurre antes del fetch. El comentario nuevo describe un ciclo: la URL nueva falla nombrándose; se agrega con 64 ceros; el siguiente intento falla con `sha256 <obtenido> != ...`; se copia <obtenido>; se repite hasta que pase y se borran las entradas que ya no se piden. Diff completo actual:

```diff
diff --git a/tests/mindmap-workspace-reader.test.mjs b/tests/mindmap-workspace-reader.test.mjs
index ef253c3..0cda600 100644
--- a/tests/mindmap-workspace-reader.test.mjs
+++ b/tests/mindmap-workspace-reader.test.mjs
@@ -111,7 +111,51 @@ test('sin identidad abierta no se resalta nada por propiedad', () => {
 const indexHtml = readFileSync(new URL('../frontends/mindmap/index.html', import.meta.url), 'utf-8');
 const importMap = JSON.parse(indexHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 const MD_URL = importMap.imports['markdown-it'];
+// Integridad y plazo: cada modulo https que pide el hook (la URL que recibe load(), antes de
+// redirecciones) debe estar en EXPECTED_SHA256 con el sha256 de su texto UTF-8; una URL ausente, un
+// contenido distinto o un fetch que no termina en 20 s hacen fallar la prueba nombrando la URL.
+// Para regenerar la tabla al cambiar la version del import map (las URLs de dependencias tambien
+// cambian): correr `node --test tests/mindmap-workspace-reader.test.mjs` con red. Una URL nueva
+// falla con 'GET <url> -> sin sha256 esperado en EXPECTED_SHA256': agregarla a la tabla con un hash
+// cualquiera (p. ej. 64 ceros) y volver a correr; ahora falla con
+// 'GET <url> -> sha256 <obtenido> != <esperado>', y <obtenido> es el hash real a copiar en su
+// entrada. Repetir (cada modulo nuevo aparece al cargar el anterior) hasta que la prueba pase, y
+// borrar las entradas de URLs que ya no se piden.
+const EXPECTED_SHA256 = {
+  'https://esm.sh/markdown-it@14.1.0':
+    'ced1c1bb5a8502ed7924950ef10f8bcf524d541c9c2c111f8861a1a0820937df',
+  'https://esm.sh/entities@^4.4.0?target=es2022':
+    '6be2794a0aa9a0c29d15a0a4006a4e3e4a68a789396ab7f1c35134bd53fb5faa',
+  'https://esm.sh/entities@4.5.0/es2022/lib/decode.mjs':
+    'ef22e25f6bca668e40c4f7d4ecaebe2172a833a18372d55b54f997d0d8702dcd',
+  'https://esm.sh/punycode.js@^2.3.1?target=es2022':
+    'd1b84265b5e42da1f9c6e3d457985ead3d63633caa06b1df1b7578d09cfcec05',
+  'https://esm.sh/linkify-it@^5.0.0?target=es2022':
+    'f745edba9b39a27b310f0855021f58c5183c36c989ea3bd8d4869b494a058a9c',
+  'https://esm.sh/mdurl@^2.0.0?target=es2022':
+    '0432b26197f320df4fff103362a7f841fe2f23a5348f2353863a298e482bdda3',
+  'https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs':
+    '82ffca240d509b4840880b2e20e3625bb67c7e6c6777ba0da3f28815acbce558',
+  'https://esm.sh/uc.micro@^2.1.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/uc.micro@^2.0.0?target=es2022':
+    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
+  'https://esm.sh/punycode.js@2.3.1/es2022/punycode.mjs':
+    '91fcd4eab87734cc0b84f71999b151c798f4bda8b922a337bfd3af3109a7e0b5',
+  'https://esm.sh/entities@4.5.0/es2022/lib/escape.mjs':
+    '116aef78e5ff05efa6f79851b8b59da025ab88f5c25d2262f73df98f4d57c3fa',
+  'https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs':
+    'a7f8bf81f86ab33b188173277252922bb577cb6c72e7f5f5b75d99d68a66a092',
+  'https://esm.sh/mdurl@2.1.0/es2022/mdurl.mjs':
+    '487149fd6591ee740f4e9df7cf13c4694bfd613650b49b5f6895ab3b1e81627d',
+  'https://esm.sh/uc.micro@2.1.0/es2022/uc.micro.mjs':
+    '549d36fd64ab29703da6e300957bed9de0dae7d7218eca8bbe6681994133e8b0',
+  'https://esm.sh/entities@4.5.0/es2022/entities.mjs':
+    '4a9306e4021ae1079e83b5db26e1678c536fa69c8f2839802bc3cc43282cef08',
+};
 const HTTPS_HOOKS = `
+import {createHash} from 'node:crypto';
+const EXPECTED_SHA256 = ${JSON.stringify(EXPECTED_SHA256)};
 export async function resolve(specifier, context, next) {
   const parent = context.parentURL || '';
   if (specifier.startsWith('https://')) return {url: specifier, shortCircuit: true};
@@ -120,9 +164,22 @@ export async function resolve(specifier, context, next) {
 }
 export async function load(url, context, next) {
   if (!url.startsWith('https://')) return next(url, context);
-  const res = await fetch(url);
-  if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
-  return {format: 'module', source: await res.text(), shortCircuit: true};
+  const expected = EXPECTED_SHA256[url];
+  if (!expected) throw new Error('GET ' + url + ' -> sin sha256 esperado en EXPECTED_SHA256');
+  let res, text;
+  try {
+    res = await fetch(url, {signal: AbortSignal.timeout(20000)});
+    if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
+    text = await res.text();
+  } catch (err) {
+    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) throw new Error('GET ' + url + ' -> timeout 20 s');
+    // undici corta la conexion (TCP + TLS) a los 10 s con su propio connect timeout
+    if (err && (err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'UND_ERR_CONNECT_TIMEOUT')) throw new Error('GET ' + url + ' -> connect timeout');
+    throw err;
+  }
+  const got = createHash('sha256').update(text, 'utf8').digest('hex');
+  if (got !== expected) throw new Error('GET ' + url + ' -> sha256 ' + got + ' != ' + expected);
+  return {format: 'module', source: text, shortCircuit: true};
 }`;
 register('data:text/javascript,' + encodeURIComponent(HTTPS_HOOKS));
 const {default: MarkdownIt} = await import(MD_URL);
```

- Comprobación (case-regenerar.log): en una copia en /dev/shm se quitó la entrada `https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs` y se siguió el comentario.
  - Paso 1: exit 1, `sin sha256 esperado`; se agregó la URL con 64 ceros.
  - Paso 2: exit 1, `sha256 a7f8bf81…a092 != 000…0`; se copió el hash obtenido.
  - Paso 3: exit 0, 16/16. El hash recuperado coincide con el de la tabla real.
- `node --test tests/*.test.mjs`: exit 0, 158/158 (validation.log, sección "Corrección 2").
- /dev/shm limpio.

EXECUTOR DONE: timeout de 20 s, connect timeout de undici mapeado y EXPECTED_SHA256 (15 URLs) en tests/mindmap-workspace-reader.test.mjs. El comentario de regeneración está verificado de punta a punta (case-regenerar.log). Los casos (a), (b), (c) y (c') están en el run dir; node --test tests/*.test.mjs pasa 158/158.
Archivos tocados: tests/mindmap-workspace-reader.test.mjs; runs/subagents/20261116-esm-hash-executor-a1/{discovery.log,discovery-pass2.txt,case-red.log,case-hash.log,case-colgado.log,case-regenerar.log,validation.log,result-summary.md}
