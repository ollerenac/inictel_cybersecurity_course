---
id: denylist
sidebar_position: 2
title: "Denylist"
tags: [intermedio, web-hacking, file-upload, apache, php, analisis-de-codigo]
---

# Denylist

| Campo | Valor |
|-------|-------|
| **Categoría** | Web Hacking |
| **Dificultad** | 🟡 Intermedio |
| **Herramientas** | Navegador, `curl`, Docker, Apache HTTP Server |
| **Concepto clave** | Una carga de archivos atraviesa la aplicación y el servidor web |
| **TTP** | Exploit Public-Facing Application (T1190) |

## Enunciado

> Bypass the file extension denylist on the server to upload a file and obtain the flag.

Antes de tocar la instancia CTF, la lección construye el modelo mental necesario para interpretar
lo que ocurre allí. El punto de partida es la pregunta más básica: **¿qué sucede cuando un
navegador pide una página a Apache?**

:::caution[Nota]
Todo lo que sigue se realiza en `localhost`, dentro de un contenedor propio. El CTF se visitará
más adelante, únicamente en su instancia sandbox asignada.
:::

---

## Anatomía de una petición HTTP en Apache

- Al visitar una URL, el navegador identifica el servidor indicado por el host y el puerto, y le envía una petición HTTP para solicitar un recurso.
- El servidor web recibe la petición, determina qué recurso corresponde a la URL y devuelve una respuesta HTTP al navegador.
- En particular, Apache HTTP Server es una implementación de servidor web. En este laboratorio, Apache recibe la petición, aplica su configuración y decide cómo obtener o generar la respuesta.

La misma petición tiene dos perspectivas. La red muestra los paquetes que circulan entre el
cliente y Apache; la configuración del servidor explica qué decisiones se tomaron después de que
la petición llegó. Ambas perspectivas se observarán por separado.

## Levantar un Apache que pueda inspeccionarse

Se utiliza Docker para no instalar ni modificar el Apache del sistema operativo. Docker ejecuta
el Apache oficial dentro de un contenedor, pero el contenido, la configuración y los logs viven
en carpetas normales del repositorio. Por eso pueden abrirse y modificarse con cualquier editor.

El laboratorio se inicia desde la raíz del repositorio con:

```bash
docker run --rm --name apache-intro -p 127.0.0.1:8080:8080 \
  -v "$PWD/labs/apache-intro/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" \
  -v "$PWD/labs/apache-intro/public:/usr/local/apache2/htdocs:ro" \
  -v "$PWD/labs/apache-intro/logs:/usr/local/apache2/logs" \
  httpd:2.4
```

La primera vez Docker descargará la imagen `httpd:2.4`. Después, el comando hace cuatro cosas:

| Fragmento | Efecto |
|---|---|
| `--name apache-intro` | Da un nombre fácil de usar al contenedor. |
| `--rm` | Lo elimina al detenerlo; los archivos del laboratorio no se eliminan. |
| `-p 127.0.0.1:8080:8080` | Conecta el puerto 8080 de la máquina local con el 8080 de Apache, solo en la propia máquina. |
| `-v …` | Monta una carpeta o archivo local dentro del contenedor. |

Los tres montajes son la parte importante: Apache ve la configuración, el contenido público y los
logs del laboratorio, aunque dentro del contenedor sus rutas tengan otro nombre.

```text
Carpeta del repositorio                    Ruta vista por Apache
────────────────────────────────────      ─────────────────────────────────
labs/apache-intro/conf/httpd.conf      →  /usr/local/apache2/conf/httpd.conf
labs/apache-intro/public/              →  /usr/local/apache2/htdocs/
labs/apache-intro/logs/                →  /usr/local/apache2/logs/
```

## ¿Qué compone este servidor?

Una vez iniciado Apache, puede consultarse la estructura real:

```bash
find labs/apache-intro/ -maxdepth 2 -type f | sort
```

```text
labs/apache-intro/conf/httpd.conf
labs/apache-intro/logs/access.log
labs/apache-intro/logs/error.log
labs/apache-intro/logs/httpd.pid
labs/apache-intro/public/index.html
labs/apache-intro/README.md
```

No todos estos archivos tienen el mismo propósito:

| Pieza | Responsabilidad |
|---|---|
| `conf/httpd.conf` | Indica a Apache dónde escuchar, qué contenido publicar y dónde registrar eventos. |
| `public/` | Es el **DocumentRoot**: la raíz del contenido que Apache puede exponer por HTTP. |
| `public/index.html` | Es el archivo estático que Apache servirá. |
| `logs/access.log` | Guarda una línea por cada petición que Apache atendió. |
| `logs/error.log` | Guarda errores y mensajes de inicio del servidor. |
| `logs/httpd.pid` | Guarda el identificador del proceso principal de Apache mientras está activo. |

`README.md` no participa en Apache: documenta el laboratorio.

## 1. Lo observable en la red

Al abrir [http://localhost:8080/](http://localhost:8080/) en el navegador aparece la frase
“Apache sirve este archivo estático”. Esa es una comprobación visual, pero el navegador oculta la
mayor parte de la conversación HTTP.

Wireshark permite observar la conversación en la red. Con Apache iniciado, puede seleccionarse la
interfaz `any` —útil cuando Docker interviene—, aplicar el filtro de visualización siguiente y
generar una petición con `curl`:

```text
tcp.port == 8080
```

```bash
curl -i http://localhost:8080/
```

La captura siguiente corresponde a una petición del laboratorio:

![Intercambio TCP y HTTP entre curl y Apache local](/img/denylist/apache-http-exchange.png)

La secuencia se interpreta así:

```text
Cliente:55844  →  Apache:8080  SYN          el cliente inicia una conexión TCP
Cliente:55844  ←  Apache:8080  SYN, ACK     Apache acepta la conexión
Cliente:55844  →  Apache:8080  ACK          TCP queda establecido

Cliente:55844  →  Apache:8080  GET / HTTP/1.1
Cliente:55844  ←  Apache:8080  HTTP/1.1 200 OK (text/html)

FIN / ACK                   cliente y servidor cierran la conexión ordenadamente
```

`55844` es un puerto efímero elegido por el cliente. `8080` es el puerto donde Apache escucha.
Wireshark demuestra que hubo una conexión TCP y que por ella circuló HTTP; no puede mostrar qué
archivo leyó Apache ni qué directivas aplicó. Esa explicación viene de la configuración.

### La respuesta HTTP sin el navegador

La misma petición se puede leer directamente en la terminal:

```bash
curl -i http://localhost:8080/
```

La respuesta de este laboratorio contiene, entre otras líneas:

```http
HTTP/1.1 200 OK
Server: Apache/2.4.68 (Unix)
Content-Length: 343
Content-Type: text/html

<!doctype html>
<html lang="es">…</html>
```

La respuesta se lee en tres partes:

- **Estado** — `200 OK` significa que Apache encontró un recurso y pudo responder correctamente.
- **Cabeceras** — `Server`, `Content-Length` y `Content-Type` describen quién respondió, cuánto
  contenido envía y cómo debe interpretarlo el navegador.
- **Cuerpo** — el HTML después de la línea vacía es el contenido de `public/index.html`.

La parte de la URL después del puerto es `/`. La siguiente sección explica por qué Apache devolvió
un archivo llamado `index.html` y no un listado del directorio.

## 2. Lo que Apache decide internamente

La configuración puede mostrarse con números de línea:

```bash
nl -ba labs/apache-intro/conf/httpd.conf
```

Estas líneas explican exactamente la respuesta anterior:

```apache
Listen 8080
DocumentRoot "/usr/local/apache2/htdocs"
DirectoryIndex index.html
```

### `DocumentRoot`

- **Definición:** es la carpeta que Apache considera la raíz del contenido público de un sitio web.
- **Función:** Apache la usa como punto de partida para convertir rutas de URL en rutas de archivos
  públicos.
- **Alcance:** no equivale a la raíz completa del disco; delimita qué archivos puede buscar Apache
  mediante esta configuración.
- **En este laboratorio:** su valor es `/usr/local/apache2/htdocs` dentro del contenedor Docker.

Las equivalencias de esta configuración son:

```text
URL solicitada                   Archivo que Apache busca
──────────────────────────────   ─────────────────────────────────────────
http://localhost:8080/           /usr/local/apache2/htdocs/
http://localhost:8080/a.html     /usr/local/apache2/htdocs/a.html
http://localhost:8080/img/x.png  /usr/local/apache2/htdocs/img/x.png
```

### `DirectoryIndex index.html`

- **Definición:** esta directiva define qué archivo debe buscar Apache cuando la URL apunta a una
  carpeta y no a un archivo concreto.
- **Al solicitar `GET / HTTP/1.1`:**

  1. Apache llega primero al directorio `/usr/local/apache2/htdocs/`.
  2. `DirectoryIndex index.html` hace que Apache busque
     `/usr/local/apache2/htdocs/index.html`.
  3. Apache devuelve ese archivo como respuesta HTTP.

- **Resultado visible:** el navegador sigue mostrando `http://localhost:8080/`; no necesita
  mostrar `index.html` porque Apache lo elige internamente.


Una vez que Apache recibe el `GET / HTTP/1.1` visto en Wireshark, el recorrido interno es:

```text
1. Apache acepta la conexión en localhost:8080     ← Listen 8080
2. Apache recibe GET / HTTP/1.1
3. / significa “la raíz del contenido público”     ← DocumentRoot
4. Apache busca el índice de esa carpeta           ← DirectoryIndex index.html
5. Apache encuentra /usr/local/apache2/htdocs/index.html
6. mod_mime aplica .html → text/html                ← TypesConfig
7. Apache envía HTTP/1.1 200 OK y el HTML
8. CustomLog registra GET / HTTP/1.1 200 343
```

Por el montaje Docker anterior, el paso 5 corresponde, en la máquina local, a
`labs/apache-intro/public/index.html`.

La sección de directorio completa el permiso para servir ese contenido:

```apache
<Directory "/usr/local/apache2/htdocs">
    AllowOverride None
    Require all granted
</Directory>
```

- `Require all granted` permite responder peticiones para esta carpeta.
- `AllowOverride None` indica que, por ahora, Apache ignorará configuración por directorio. Esta última línea será crucial al estudiar el CTF; hoy mantiene reglas simples y predecibles para el servidor estático.

## 3. La evidencia que deja Apache

Después de una petición, la última entrada del log puede consultarse con:

```bash
tail -n 1 labs/apache-intro/logs/access.log
```

```text
172.17.0.1 - - [25/Sep/2026:10:08:00 +0000] GET / HTTP/1.1 200 343
```

La IP `172.17.0.1` es la red puente de Docker: Apache ve a Docker como origen de la petición. Lo
que importa por ahora es el final de la línea:

```text
GET / HTTP/1.1   → qué se pidió
200              → cómo respondió Apache
343              → cuántos bytes envió
```

El navegador muestra el resultado; `curl` muestra la respuesta HTTP; `access.log` muestra lo que
Apache registró. Son tres puntos de observación del mismo evento.

## 4. Configuración central frente a configuración distribuida

Hasta ahora, todas las reglas vistas estaban en `httpd.conf`. Ese archivo es la
**configuración central**: pertenece al administrador y puede definir el comportamiento de todo
el servidor o de directorios específicos.

Apache también puede usar **configuración distribuida**: un archivo situado dentro de un directorio
publicado, normalmente llamado `.htaccess`, contiene reglas que pueden afectar ese directorio y sus
subdirectorios.

```text
Administrador                         Directorio publicado
──────────────────────────────        ───────────────────────────
conf/httpd.conf                       public/.htaccess
configuración central                 configuración por directorio
define qué se permite                 solo aplica si Apache la permite
```

La configuración central conserva siempre el control. Esta línea decide si Apache debe leer
configuración distribuida dentro de `public/`:

```apache
AllowOverride None
```

`None` significa que Apache ignora `.htaccess`. El archivo puede existir en el disco, pero no
cambia el comportamiento del servidor.

### Paso 1: comprobar el perfil seguro

El perfil inicial del laboratorio usa `conf/httpd.conf`. Contiene `AllowOverride None` y el
archivo `public/.htaccess` ya existe.

Puede consultarse su contenido:

```bash
cat labs/apache-intro/public/.htaccess
```

```apache
DirectoryIndex portada.html
```

La regla dice que el índice deseado sería `portada.html`. Sin embargo, al abrir
`http://localhost:8080/` o ejecutar el comando siguiente, Apache continúa sirviendo `index.html`:

```bash
curl -s http://localhost:8080/ | grep '<h1>'
```

```text
<h1>Apache sirve este archivo estático</h1>
```

La regla local no falló: simplemente fue ignorada por `AllowOverride None`.

### Paso 2: permitir una clase limitada de reglas locales

El segundo perfil se llama `conf/httpd-distributed.conf`. La única diferencia relevante es esta:

```diff
-    AllowOverride None
+    AllowOverride Indexes
```

Puede verificarse con:

```bash
diff -u labs/apache-intro/conf/httpd.conf \
  labs/apache-intro/conf/httpd-distributed.conf
```

`Indexes` permite una clase limitada de directivas relacionadas con directorios, incluida
`DirectoryIndex`. No habilita todas las directivas de Apache.

El contenedor que usa el perfil seguro se detiene con `Ctrl+C`. Después, Apache se inicia con el
perfil distribuido:

```bash
docker run --rm --name apache-intro -p 127.0.0.1:8080:8080 \
  -v "$PWD/labs/apache-intro/conf/httpd-distributed.conf:/usr/local/apache2/conf/httpd.conf:ro" \
  -v "$PWD/labs/apache-intro/public:/usr/local/apache2/htdocs:ro" \
  -v "$PWD/labs/apache-intro/logs:/usr/local/apache2/logs" \
  httpd:2.4
```

Desde otra terminal, se repite exactamente la misma petición:

```bash
curl -s http://localhost:8080/ | grep '<h1>'
```

Esta vez la respuesta es distinta:

```text
<h1>Apache aplicó la configuración distribuida</h1>
```

La URL no cambió. El archivo `.htaccess` tampoco cambió. Lo único que cambió fue la autorización
central para que Apache leyera la regla distribuida.

### Qué se observó y qué lo explica

| Evidencia | Qué demuestra |
|---|---|
| `diff -u` | La configuración central cambió de ignorar a permitir la clase `Indexes`. |
| Misma URL, encabezado distinto | Apache aplicó la regla `DirectoryIndex portada.html` desde `.htaccess`. |
| `access.log` | Apache atendió la petición, pero el log normal no detalla qué regla de configuración eligió. |

Esta es una distinción útil: los paquetes de red y el `access.log` prueban que existió una
petición y una respuesta; el cambio de configuración y el resultado visible explican **por qué**
la respuesta cambió.

### Restaurar el perfil seguro

El contenedor distribuido se detiene con `Ctrl+C` y se vuelve a iniciar con el comando inicial, que
monta `conf/httpd.conf`. Así se restaura `AllowOverride None` y Apache vuelve a ignorar
`.htaccess`.

:::note[Relación con el CTF]

La lección todavía no usa PHP ni una carga de archivos. Solo demuestra el principio necesario para
el reto: una regla guardada dentro de un directorio público puede tener efecto si la configuración
central de Apache se lo concede.

:::

## 5. Apache y PHP: dos responsabilidades

- El laboratorio anterior muestra el caso más simple: Apache recibe una petición y entrega un
  archivo que ya existe en el `DocumentRoot`.
- PHP añade una segunda responsabilidad: generar el contenido de una respuesta mientras Apache
  conserva el control del tráfico HTTP y de su configuración.
- La tabla siguiente representa el **recorrido temporal de una petición**, no la creación de
  componentes en cada fila.
- Apache y su módulo PHP se cargaron al iniciar el servidor. Lo que sucede de forma secuencial es
  el tratamiento de una solicitud concreta.

| Paso | Componente que actúa | Responsabilidad en una petición a `respuesta.php` |
|---:|---|---|
| 1 | Apache | Escucha la conexión, interpreta HTTP, asocia la URL con un recurso y aplica su configuración. |
| 2 | Apache y el manejador de PHP | Apache entrega el recurso al manejador de PHP que la configuración asoció con los archivos `.php`. |
| 3 | Script PHP | PHP ejecuta el script, usa los datos disponibles, genera cabeceras y cuerpo de respuesta, y devuelve esa salida. |
| 4 | Apache | Envía la respuesta generada al cliente y registra los datos de la petición. |

- PHP no reemplaza a Apache.
- En una instalación integrada como la del laboratorio, Apache conserva la entrada y la salida HTTP; el código PHP participa solo cuando una regla de Apache indica que el recurso solicitado debe ser tratado por su manejador.
- Apache recibe la petición y consulta su configuración para determinar cómo debe tratar el recurso solicitado.
- Cuando la URL se resuelve en un archivo con extensión `.php`, la regla `FilesMatch` coincide con ese archivo y `SetHandler application/x-httpd-php` lo asigna al manejador de PHP.
- Apache entrega el archivo al manejador `mod_php`; PHP interpreta el script y devuelve la salida a Apache para que este construya y envíe la respuesta HTTP.

### Laboratorio 1: comparar contenido estático y contenido generado

- El directorio `labs/apache-php` del repositorio contiene dos recursos que ocupan el mismo lugar
  dentro del `DocumentRoot`:

```text
labs/apache-php/public/
├── estatico.html   ← Apache lo entrega como archivo
└── respuesta.php   ← Apache lo entrega al manejador de PHP

labs/apache-php/conf/
├── php.load         ← carga el módulo de PHP en Apache
└── docker-php.conf  ← asigna .php al manejador de PHP
```

- El laboratorio se inicia desde la raíz del repositorio:

```bash
docker run --rm --name apache-php-intro -p 127.0.0.1:8001:80 \
  -v "$PWD/labs/apache-php/conf/php.load:/etc/apache2/mods-enabled/php.load:ro" \
  -v "$PWD/labs/apache-php/conf/docker-php.conf:/etc/apache2/conf-enabled/docker-php.conf:ro" \
  -v "$PWD/labs/apache-php/public:/var/www/html:ro" \
  php:8.3-apache
```

- La imagen `php:8.3-apache` proporciona Apache y la biblioteca de PHP compatible con esa imagen.
- `labs/apache-php/conf/php.load` se monta sobre `/etc/apache2/mods-enabled/php.load` y carga
  `php_module`.
- `labs/apache-php/conf/docker-php.conf` se monta sobre
  `/etc/apache2/conf-enabled/docker-php.conf` y contiene la regla que asigna `.php` a PHP.
- El puerto se asocia únicamente a `127.0.0.1`, de modo que el laboratorio no queda expuesto a la
  red.
- El directorio se monta como solo lectura: el código de ejemplo puede leerse, pero el contenedor
  no puede modificarlo.

- Desde otra terminal, se comparan las respuestas:

```bash
curl -i http://127.0.0.1:8001/estatico.html
curl -i http://127.0.0.1:8001/respuesta.php
```

### Caso A: Apache entrega `estatico.html`

- Una ejecución del primer comando produce una respuesta como esta:

```http
HTTP/1.1 200 OK
Date: Fri, 25 Sep 2026 23:54:46 GMT
Server: Apache/2.4.68 (Debian)
Last-Modified: Fri, 25 Sep 2026 23:49:40 GMT
ETag: "103-65c575eaf45a0"
Accept-Ranges: bytes
Content-Length: 259
Vary: Accept-Encoding
Content-Type: text/html

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Recurso estático</title>
  </head>
  <body>
    <h1>Apache entregó este archivo estático</h1>
    <p>El contenido estaba almacenado tal como se recibió.</p>
  </body>
</html>
```

- Apache convierte `/estatico.html` en la ruta del archivo que está bajo el `DocumentRoot`.
- Como ninguna regla entrega ese archivo a otro manejador, Apache lo lee y lo transmite.
- Apache obtiene o genera metadatos propios de un archivo estático: `Last-Modified`, `ETag`,
  `Accept-Ranges`, `Content-Length` y el tipo `text/html`.
- El cuerpo coincide con los bytes almacenados en `estatico.html`; no hay código PHP que se
  ejecute.

### Caso B: Apache entrega `respuesta.php` al manejador de PHP

- Una ejecución del segundo comando produce una respuesta como esta:

```http
HTTP/1.1 200 OK
Date: Fri, 25 Sep 2026 23:55:00 GMT
Server: Apache/2.4.68 (Debian)
X-Powered-By: PHP/8.3.35
X-Lab-Renderer: php
Vary: Accept-Encoding
Content-Length: 309
Content-Type: text/html; charset=UTF-8

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Respuesta generada por PHP</title>
  </head>
  <body>
    <h1>PHP generó esta respuesta para Apache</h1>
    <p>Método recibido: <code>GET</code></p>
    <p>Recurso solicitado: <code>/respuesta.php</code></p>
  </body>
</html>
```

- Apache también localiza primero el archivo dentro de `/var/www/html`, pero aplica una regla
  distinta.
- `labs/apache-php/conf/php.load` contiene la carga del módulo:

```apache
LoadModule php_module /usr/lib/apache2/modules/libphp.so
```

- `labs/apache-php/conf/docker-php.conf` contiene la regla que activa el manejador:

```apache
<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>
```

- Al coincidir `respuesta.php`, Apache no envía el texto fuente del archivo al cliente.
- Apache lo entrega al intérprete de PHP incorporado mediante `mod_php`; el intérprete ejecuta el
  script y devuelve su salida a Apache.
- `X-Lab-Renderer: php` fue creado explícitamente por el script; `X-Powered-By` fue añadido por
  PHP en esta configuración de laboratorio.
- En un servicio público conviene ocultar `X-Powered-By`, porque revela la versión de PHP sin ser
  necesaria para atender la petición.
- `Date`, las versiones, `Last-Modified`, `ETag` y `Content-Length` pueden cambiar según la imagen,
  la fecha de edición y el entorno.
- La diferencia que importa para el experimento es que el caso B incluye las cabeceras y el cuerpo
  generados por PHP, mientras el caso A entrega el archivo tal como está guardado.

### Qué regla activa PHP en este laboratorio

- La frase “Apache activa PHP” es correcta si se entiende con precisión.
- Apache carga el módulo una vez al arrancar; no crea un intérprete nuevo para cada `GET`.
- Durante una petición, la regla `SetHandler` hace que Apache despache el archivo `.php` ya
  localizado a ese módulo.
- `mod_php` ejecuta entonces el script dentro del proceso de Apache y devuelve el resultado al
  servidor web.
- Existen otras arquitecturas: Apache también puede delegar PHP a un proceso externo, como PHP-FPM,
  mediante FastCGI.
- Esa variante conserva la misma separación conceptual, pero no es la que usa este laboratorio.

### `VirtualHost` no pertenece a Docker ni a PHP

- Un `VirtualHost` es una construcción de configuración de Apache.
- Permite que una sola instancia de Apache atienda varios sitios, seleccionando reglas según la
  combinación de dirección IP, puerto y, habitualmente, el encabezado HTTP `Host`.
- Docker solo puede empaquetar una configuración que use `VirtualHost`; PHP solo puede participar
  dentro de ella si Apache le asigna un manejador.
- El laboratorio utiliza el sitio predeterminado que trae la imagen, pero los conceptos de
  `DocumentRoot`, directorios y manejadores se aplican tanto dentro como fuera de un `VirtualHost`.

### El recorrido completo de `GET /respuesta.php`

```text
Cliente ── GET /respuesta.php ──► Apache
                                    │
                                    ├─ aplica VirtualHost, Directory y demás reglas
                                    ├─ ubica /var/www/html/respuesta.php
                                    ├─ identifica que el recurso usa el manejador de PHP
                                    ▼
                                  PHP ejecuta respuesta.php
                                    │
                                    ├─ lee REQUEST_METHOD y REQUEST_URI
                                    └─ genera cabeceras y HTML
                                    ▼
                                  Apache ── registra método, URL, estado y tamaño ──► access.log
                                    │
Cliente ◄── HTTP 200 + HTML ──────┘
```

- El `access.log` no es parte del cuerpo de la respuesta ni del camino hacia el cliente.
- Es un efecto lateral de Apache al completar el tratamiento de la petición; por eso se muestra
  como una rama lateral.
- Una entrada como `GET /respuesta.php HTTP/1.1 200 ...` prueba que Apache atendió la solicitud,
  pero no describe la lógica interna del script.
- Para entenderla se debe leer `respuesta.php` y contrastar su código con la respuesta obtenida
  mediante `curl`.
- El contenedor se detiene con `Ctrl+C` al terminar la comparación. Se elimina automáticamente por
  `--rm`; los archivos del laboratorio permanecen en el repositorio.

:::note[Relación con el CTF]

El reto de Denylist involucra ambas capas. PHP puede decidir si acepta y guarda una carga según la lógica de la aplicación. Más tarde, si la carga queda dentro de un directorio publicado, Apache puede aplicar sus propias reglas al recibir una petición para ese archivo. Analizar una sola capa no basta para determinar el comportamiento final.

:::

## 6. Trazar una carga dentro de PHP

- El laboratorio siguiente no reproduce la validación del CTF; su objetivo es identificar qué
  datos recibe PHP y qué decisión toma cada función antes de guardar un archivo.
- El código observado en la instancia CTF se analizará después de este laboratorio para distinguir
  una allowlist didáctica de una denylist real.
- El archivo de destino queda fuera del `DocumentRoot`; esta decisión hace visible una mitigación
  importante sin exponer un archivo cargado por HTTP.

### Laboratorio 2: una carga inocua y trazable

- El laboratorio se encuentra en `labs/php-upload-trace`:

```text
conf/php.load          ← carga php_module
conf/docker-php.conf   ← asigna .php a mod_php
fixtures/carga-inocua.txt
public/upload.php      ← código que se analizará
```

- El laboratorio se inicia desde la raíz del repositorio:

```bash
docker run --rm --name php-upload-trace -p 127.0.0.1:8002:80 \
  -v "$PWD/labs/php-upload-trace/conf/php.load:/etc/apache2/mods-enabled/php.load:ro" \
  -v "$PWD/labs/php-upload-trace/conf/docker-php.conf:/etc/apache2/conf-enabled/docker-php.conf:ro" \
  -v "$PWD/labs/php-upload-trace/public:/var/www/html:ro" \
  --tmpfs /var/lab-uploads:rw,mode=1777 \
  php:8.3-apache
```

- El montaje de `public/` es de solo lectura; PHP solo puede escribir en `/var/lab-uploads`.
- `--tmpfs` crea `/var/lab-uploads` dentro del contenedor, fuera de `/var/www/html`; Apache no
  puede servir sus archivos mediante una URL del laboratorio.
- `mode=1777` permite la escritura temporal de `www-data`. Como el directorio existe solo durante
  la ejecución del contenedor, el archivo se descarta al terminar la práctica.

### La evidencia HTTP de la carga

- La petición siguiente envía el archivo inocuo incluido en el laboratorio:

```bash
curl -i \
  -F 'document=@labs/php-upload-trace/fixtures/carga-inocua.txt;type=text/plain' \
  http://127.0.0.1:8002/upload.php
```

- Una respuesta aceptada incluye `HTTP/1.1 200 OK` y `X-Lab-Upload: accepted`.
- Su cuerpo contiene una traza con el nombre que recibió PHP, el nombre base, la extensión
  derivada, el nombre temporal, la decisión y el nombre aleatorio asignado por el servidor.
- El nombre asignado cambia en cada solicitud; no es un valor que el cliente controle.

### Del formulario a `$_FILES`

- `upload.php` solo procesa una petición `POST` con `enctype="multipart/form-data"`.
- PHP analiza ese formato antes de ejecutar el script y rellena `$_FILES['document']`.
- Los campos relevantes del laboratorio son:

| Campo | Origen | Uso en el laboratorio |
|---|---|---|
| `name` | Nombre declarado por el cliente | Se conserva como evidencia; no se usa como nombre final. |
| `tmp_name` | Ruta temporal generada por PHP | Es el único origen que se entrega a `move_uploaded_file`. |
| `error` | Resultado de la recepción en PHP | Debe ser `UPLOAD_ERR_OK` antes de continuar. |
| `type` | Tipo MIME declarado por el cliente | El laboratorio no lo usa para autorizar; no es evidencia confiable por sí sola. |

- La existencia de `$_FILES` demuestra que PHP recibió una carga; no demuestra que sea segura ni
  que deba almacenarse.

### Del nombre recibido a una decisión

- El código sigue esta secuencia:

```text
$_FILES['document']['name']
            │
            ▼
      basename(nombre)
            │
            ▼
pathinfo(nombre_base, PATHINFO_EXTENSION)
            │
            ▼
 strtolower(extensión) ──► in_array(extensión, ['txt'], true)
            │                              │
            │                         rechazar si no coincide
            ▼
      generar nombre aleatorio
            │
            ▼
move_uploaded_file(tmp_name, /var/lab-uploads/nombre_aleatorio)
```

- `basename` elimina componentes de ruta del nombre recibido, pero no convierte un nombre del
  cliente en un identificador confiable.
- `pathinfo` deriva una extensión a partir del nombre; no inspecciona el contenido del archivo.
- `strtolower` evita que las mayúsculas cambien la comparación de extensiones.
- `in_array(..., true)` compara la extensión con la lista permitida sin conversiones implícitas de
  tipo.
- `move_uploaded_file` acepta como origen un archivo temporal que PHP reconoce como resultado de
  una carga HTTP y lo mueve al destino elegido por el servidor.
- El servidor crea `upload-<aleatorio>.txt`; nunca reutiliza `name` como ruta final.

### Qué demuestra y qué no demuestra este laboratorio

- Demuestra la diferencia entre el nombre controlado por el cliente, el archivo temporal de PHP y
  el nombre final controlado por el servidor.
- Demuestra que una validación de extensión es una decisión sobre el nombre, no una inspección del
  contenido.
- No reproduce la lógica del CTF ni proporciona una técnica para evadirla.
- No sustituye controles de producción como validación de tipo por servidor, límites de tamaño,
  análisis antimalware, permisos mínimos y almacenamiento fuera del contenido publicado.

## 7. Por qué `GET /` muestra código PHP

- Al visitar `http://<IP-del-sandbox>/`, el navegador no solicita directamente el sistema de
  archivos ni el `DocumentRoot`.
- El navegador envía una petición HTTP con la ruta `/`.
- `DocumentRoot` es una ruta interna que Apache usa para convertir esa URL en una ubicación del
  servidor.
- En la instancia observada, la respuesta de la raíz muestra código PHP coloreado. Esa evidencia
  no implica que Apache entregue el texto fuente de `index.php` como un archivo estático.
- El código observado contiene `highlight_file(__FILE__)`. Esa función lee el archivo PHP que se
  está ejecutando y escribe una representación HTML coloreada de su contenido.

### Del `GET /` a la respuesta visible

- El recorrido que explica la respuesta observada es el siguiente:

```text
Navegador ── GET / ──► Apache
                         │
                         ├─ selecciona el sitio y su DocumentRoot
                         ├─ resuelve el índice del directorio como index.php
                         ├─ asigna index.php al manejador de PHP
                         ▼
                       PHP ejecuta index.php
                         │
                         ├─ en un GET no existe $_FILES['file']
                         └─ highlight_file(__FILE__) genera HTML con el propio código
                         ▼
Navegador ◄── HTML coloreado ◄── Apache
```

- La selección de `index.php` depende de una regla `DirectoryIndex` configurada en Apache.
- La ejecución depende, además, de que una regla de manejador asocie el archivo `.php` con PHP.
- La presencia de código coloreado es evidencia de que `highlight_file` se ejecutó; no es evidencia
  de que Apache tenga una configuración insegura que entregue normalmente los archivos PHP sin
  interpretarlos.
- Si se dispusiera de la configuración completa del servidor, esa configuración permitiría probar
  directamente la regla `DirectoryIndex`; la respuesta HTTP y el código observado permiten
  reconstruir el recorrido con alta confianza.

### Qué revela `highlight_file(__FILE__)`

- `__FILE__` se sustituye por la ruta del archivo PHP actual durante la ejecución.
- `highlight_file` lee ese archivo y envía al cuerpo de la respuesta una versión con colores de
  sintaxis.
- En una petición `GET /`, la condición `isset($_FILES['file'])` resulta falsa, por lo que la rama
  de carga no se ejecuta antes de mostrar el código.
- Esa divulgación permite que el estudiante analice la lógica real sin adivinar qué funciones usa
  la aplicación.

:::caution[Alcance]

- La divulgación de código es una condición propia de esta instancia de práctica.
- Una aplicación de producción no debería invocar `highlight_file` sobre su propio código en una
  respuesta accesible al público.

:::

## 8. Del código observado a la decisión de PHP

- El siguiente extracto conserva las decisiones relevantes del código observado. El arreglo se
  abrevia solo para concentrar la lectura en el flujo de datos:

```php
$denylist = [/* extensiones denegadas observadas */];

if (isset($_FILES['file'])) {
    $file_ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));

    if (!in_array($file_ext, $denylist)) {
        move_uploaded_file(
            $_FILES['file']['tmp_name'],
            'uploads/' . basename($_FILES['file']['name'])
        );
    }
}
```

- El campo del formulario se llama `file`; por esa razón PHP expone sus metadatos en
  `$_FILES['file']`.
- `pathinfo(..., PATHINFO_EXTENSION)` deriva una extensión a partir del nombre declarado por el
  cliente.
- `strtolower` normaliza las mayúsculas antes de comparar.
- `!in_array(...)` invierte el resultado de la búsqueda: la aplicación guarda un archivo solo si
  la extensión derivada no aparece en la denylist.
- `move_uploaded_file` usa el archivo temporal reconocido por PHP como origen y construye el
  destino con `uploads/` y el nombre base declarado por el cliente.

### Qué datos se usan y cuáles se omiten

| Dato | Procedencia | Tratamiento en el código observado |
|---|---|---|
| `$_FILES['file']['name']` | Cliente | Se usa para derivar la extensión y para formar el nombre de destino. |
| `$_FILES['file']['tmp_name']` | PHP | Se usa como origen de `move_uploaded_file`. |
| Extensión derivada | Aplicación | Se normaliza y se compara contra la denylist. |
| Tipo MIME declarado | Cliente | No participa en esa decisión. |
| Contenido del archivo | Archivo recibido | No participa en esa decisión. |
| Código de error de la carga | PHP | No se comprueba de forma explícita en este fragmento. |

- La denylist del CTF y la allowlist del laboratorio 2 son políticas distintas:

| Política | Pregunta que responde | Riesgo principal |
|---|---|---|
| Allowlist del laboratorio | «¿La extensión está entre los valores permitidos?» | Sigue siendo una validación basada en el nombre si no se inspecciona el contenido. |
| Denylist del CTF | «¿La extensión no está entre los valores bloqueados?» | Requiere anticipar todos los valores que deberían rechazarse. |

- El estudiante debe tratar `name` y `type` como datos declarados por el cliente, no como pruebas
  de la naturaleza real del archivo.
- El estudiante debe distinguir la decisión de PHP sobre el nombre de cualquier decisión posterior
  de Apache sobre el archivo almacenado.

## 9. Guardar un archivo no equivale a publicarlo ni ejecutarlo

- La llamada a `move_uploaded_file` ocurre durante la petición `POST` de carga.
- Una solicitud posterior del archivo sería una segunda petición, normalmente un `GET`, recibida y
  tratada por Apache.
- La cadena `uploads/` del código expresa un destino relativo. El fragmento, por sí solo, no prueba
  la ruta absoluta resultante ni que exista una URL pública para ese directorio.
- La publicación depende de cómo el sitio relacione su `DocumentRoot` con el directorio donde PHP
  guardó el archivo.
- La ejecución depende de las reglas Apache aplicables cuando llegue esa segunda petición.

```text
POST /index.php                         GET /ruta-del-archivo
────────────────                         ────────────────────
Cliente ─► PHP                           Cliente ─► Apache
            │                                         │
            ├─ valida el nombre                       ├─ localiza un recurso
            └─ mueve el temporal                      ├─ aplica reglas del directorio
                                                      └─ elige cómo responder
```

- Ninguna de las dos flechas posteriores se deduce únicamente de `move_uploaded_file`.
- La evidencia necesaria procede de la ruta efectiva de almacenamiento, de la configuración Apache
  o de observaciones controladas en el sandbox autorizado.

## 10. Apache vuelve a intervenir en `uploads/`

- Si un directorio de cargas queda publicado, Apache aplica las reglas que correspondan a ese
  directorio cuando recibe una URL para un archivo almacenado.
- `AllowOverride` determina si Apache considera archivos `.htaccess` situados en ese directorio.
- Las clases de directivas permitidas determinan qué cambios por directorio puede aceptar Apache.
- `FilesMatch`, `SetHandler` y asociaciones de tipo son mecanismos de Apache que pueden influir en
  el manejador elegido para un recurso.
- Una asociación de manejador no procede de PHP ni del nombre por sí solo: debe existir una regla
  Apache aplicable y el módulo correspondiente debe estar cargado.

### Preguntas que debe responder la investigación

- ¿El destino efectivo de `uploads/` está bajo una ubicación publicada por Apache?
- ¿Qué URL, si existe, corresponde a un archivo almacenado allí?
- ¿Qué configuración central y por directorio evalúa Apache para esa URL?
- ¿`AllowOverride` permite que Apache considere `.htaccess` en ese directorio?
- ¿Qué directivas y qué manejador quedan activos después de aplicar esa configuración?
- ¿La respuesta observada confirma la hipótesis formulada para cada paso?

- La lección explica qué significa cada pregunta, pero no adelanta sus respuestas para la instancia
  CTF ni proporciona una secuencia para obtener la flag.

## 11. Comprobaciones en la instancia CTF

- El estudiante puede documentar la investigación con la siguiente tabla:

| Pregunta | Evidencia que debe reunirse | Conclusión permitida |
|---|---|---|
| ¿Qué script recibe la carga? | Formulario, método HTTP y código observado | Se identifica el punto de entrada de PHP. |
| ¿Qué valor valida PHP? | Lectura de `pathinfo`, `strtolower` e `in_array` | Se identifica la propiedad usada en la decisión. |
| ¿Dónde intenta guardar PHP? | Segundo argumento de `move_uploaded_file` | Se formula una hipótesis de ruta, aún por verificar. |
| ¿La ruta está publicada? | Respuesta HTTP y configuración autorizada | Se confirma o descarta una URL accesible. |
| ¿Qué manejador aplica Apache? | Configuración efectiva y respuesta a una solicitud | Se explica cómo Apache trata el recurso. |

- Cada conclusión debe asociarse con una respuesta HTTP, una línea de configuración o una línea del
  código observado.
- Una hipótesis no confirmada debe conservarse como hipótesis; no debe transformarse en un hecho por
  parecer compatible con el enunciado.
- La práctica se limita a la instancia sandbox asignada y a los mecanismos autorizados por el curso.
