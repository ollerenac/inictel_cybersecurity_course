---
id: baby-rsa
sidebar_position: 1
title: "Baby RSA"
tags: [basico, crypto, rsa, teoria-de-numeros]
---

# Baby RSA

| Campo | Valor |
|-------|-------|
| **Categoría** | Criptografía |
| **Dificultad** | 🟢 Básico |
| **Herramientas** | Python 3, pycryptodome |
| **Concepto clave** | RSA con módulo de potencia prima — totiente computable |

## Enunciado

> Decrypt the ciphertext included in the challenge file to obtain the flag!

**Infraestructura del ejercicio:**
- Máquina de trabajo: `192.168.200.51` — usuario: `user`, contraseña: `user`
- Servidor de archivos: `http://192.168.200.200/`

## Archivos del ejercicio

Desde la máquina de trabajo, descarga los dos archivos:

```bash
curl http://192.168.200.200/challenge.py -o challenge.py
curl http://192.168.200.200/output.txt -o output.txt
```

El servidor lista:
- `challenge.py` — el código que generó el cifrado
- `output.txt` — los valores `c`, `n`, `p` producidos al ejecutarlo

---

## Teoría

### El problema que RSA resuelve

Imagina que Alice quiere enviarle un mensaje secreto a Bob usando un canal público — un canal donde cualquiera puede leer lo que se transmite. ¿Cómo puede Alice cifrar el mensaje de forma que solo Bob pueda leerlo, sin que antes hayan compartido ningún secreto?

RSA resuelve esto con el concepto de **clave pública y clave privada**.

---

### Clave pública y clave privada

Piensa en una caja con dos llaves distintas:

- **Clave pública** — cualquiera puede tenerla. Sirve para *cerrar* (cifrar) la caja.
- **Clave privada** — solo la tiene el destinatario. Sirve para *abrir* (descifrar) la caja.

Bob publica su clave pública. Alice la usa para cifrar el mensaje y envía la caja cerrada. Solo Bob, con su clave privada, puede abrirla. Aunque un atacante intercepte la caja, no puede abrirla sin la clave privada.

En RSA, la clave pública es el par **(n, e)** y la clave privada es **d**. A continuación se explica qué significa cada uno.

---

### Los ingredientes de RSA

| Variable | Nombre | Quién la conoce | Descripción |
|----------|--------|-----------------|-------------|
| `p`, `q` | Primos secretos | Solo el dueño de la clave | Dos números primos grandes generados aleatoriamente |
| `n` | Módulo | Todos (pública) | `n = p × q`. Es el "tamaño" del sistema |
| `e` | Exponente público | Todos (pública) | Normalmente `65537` (`0x10001`). Define cómo se cifra |
| `φ(n)` | Totiente | Solo el dueño (requiere p y q) | Cantidad de números menores a n coprimos con n |
| `d` | Clave privada | Solo el dueño | Inverso modular de e respecto a φ(n). Permite descifrar |
| `m` | Mensaje (plaintext) | Solo emisor/receptor | El mensaje original convertido a número |
| `c` | Ciphertext | Todos (pública) | El mensaje cifrado. Es lo que se transmite |

---

### Cómo funciona RSA paso a paso

**1. Generación de claves** (lo hace Bob, una sola vez):

```
Elegir dos primos grandes:   p = ?  ,  q = ?
Calcular el módulo:          n = p × q
Calcular el totiente:        φ(n) = (p - 1) × (q - 1)
Elegir exponente público:    e = 65537
Calcular clave privada:      d = e⁻¹ mod φ(n)

Clave pública  → (n, e)   ← Bob la publica
Clave privada  → d        ← Bob la guarda en secreto
p y q          → secretos ← Bob los destruye o guarda
```

**2. Cifrado** (lo hace Alice con la clave pública de Bob):

```
Convertir el mensaje a número:   m = bytes_to_long("Hola")
Cifrar:                          c = m^e mod n
Enviar c a Bob
```

**3. Descifrado** (lo hace Bob con su clave privada):

```
Recibir c
Descifrar:                       m = c^d mod n
Convertir a texto:               mensaje = long_to_bytes(m)
```

La operación `m^e mod n` es fácil de calcular para cualquiera. Pero revertirla — es decir, encontrar `m` conociendo solo `c`, `e` y `n` — es computacionalmente imposible **siempre que no se pueda factorizar `n`**.

---

### El totiente de Euler φ(n)

El totiente φ(n) es el número de enteros entre 1 y n que no comparten factores con n. Lo que importa aquí es cómo calcularlo:

- Si `n = p × q` (dos primos distintos): `φ(n) = (p-1) × (q-1)`
- Si `n = p^k` (una sola prima elevada a k): `φ(p^k) = p^(k-1) × (p-1)`

El totiente es el secreto que permite calcular `d`. Por eso:
- En RSA estándar, para calcular φ(n) necesitas conocer `p` y `q` — que están ocultos.
- Si alguien te da `p` y `q`, o puede factorizar `n`, puede calcular φ(n), luego `d`, y descifrar cualquier mensaje.

---

### ¿Dónde está la vulnerabilidad en este ejercicio?

Mira el código del reto:

```python
p = getPrime(512)
r = 7
n = p**r          # n = p^7  ← NO es p × q
```

Hay **dos debilidades** combinadas:

1. **`n = p^7` en lugar de `p × q`** — el módulo es una potencia de un solo primo. Esto significa que φ(n) = p⁶ × (p-1), que es trivialmente computable si conoces `p`.

2. **`p` se imprime en `output.txt`** — el secreto fundamental del esquema queda expuesto en la salida del programa.

Con `p` conocido y `n = p^7`, cualquiera puede calcular φ(n), derivar `d`, y descifrar `c` para obtener la flag.

---

## Solución

### Paso 1 — Leer los valores del ejercicio

Abre `output.txt` y extrae `c`, `n` y `p`.

### Paso 2 — Razonar el ataque

Tenemos `p` y sabemos que `n = p^7`, por lo tanto:

```
φ(n) = φ(p^7) = p^6 × (p - 1)
```

Con `φ(n)` calculamos la clave privada:

```
d = e⁻¹ mod φ(n)
```

Y desciframos:

```
m = c^d mod n
flag = bytes(m)
```

### Paso 3 — Script de solución

```python
from Crypto.Util.number import inverse, long_to_bytes

# Valores de output.txt
c = <pegar_c_de_output.txt>
n = <pegar_n_de_output.txt>
p = <pegar_p_de_output.txt>

e = 0x10001  # del challenge.py
r = 7        # del challenge.py

# Totiente de p^7
phi_n = p**6 * (p - 1)

# Clave privada
d = inverse(e, phi_n)

# Descifrado
m = pow(c, d, n)
flag = long_to_bytes(m)
print(flag)
```

### Paso 4 — Ejecutar y obtener la flag

```bash
python3 solve.py
# b'flag_...'
```

Copia el contenido entre las comillas (sin la `b'` inicial ni la `'` final) y pégalo en el campo de respuesta.

---

## ¿Qué aprendimos?

- **RSA requiere `n = p × q` con ambos factores secretos.** Usar `n = p^r` con `p` conocido rompe completamente la seguridad.
- **El totiente de una potencia prima `p^k` es `p^(k-1)(p-1)`.** Con el totiente, cualquiera puede computar la clave privada.
- **Imprimir `p` en el output invalida el cifrado.** La información pública nunca debe incluir los factores primos.

:::note[Callejón sin salida explorado]

Al principio puede parecer que hay que "hackear" el servidor de archivos en `192.168.200.200`. No es el caso — ese servidor simplemente lista archivos vía HTTP estándar. La vulnerabilidad es matemática, no de red.

:::
