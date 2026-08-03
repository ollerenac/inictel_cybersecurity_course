---
id: vpn-fix
sidebar_position: 3
title: "Arreglar la VPN"
---

# 🔧 Arreglar la conexión VPN (WireGuard)

Si la VPN del laboratorio dejó de conectar, es porque el **endpoint del servidor
cambió**. La conexión falla aunque tu configuración siga igual. El arreglo es una sola
línea en tu túnel de WireGuard.

:::warning[Usa los valores de TU propia configuración]

Las capturas de esta guía tienen **datos ocultos a propósito** (clave privada, IP completa
del endpoint, subredes internas). No los necesitas: tu túnel ya tiene esos valores. Solo vas
a cambiar **un número**. Nunca compartas tu clave privada (`PrivateKey`) con nadie.

:::

## Paso 1 — Abrir el túnel en WireGuard

Abre **WireGuard**, selecciona el túnel del laboratorio (aquí `Lab-Ciberguerra`) y haz clic
en **Editar** (abajo a la derecha).

![WireGuard — seleccionar el túnel y pulsar Editar](/img/vpn-fix/vpn-fix-1.png)

## Paso 2 — Encontrar la línea `Endpoint`

En el cuadro de edición, busca la sección `[Peer]`. La última línea es `Endpoint`:

![Cuadro de edición del túnel — línea Endpoint](/img/vpn-fix/vpn-fix-2.png)

## Paso 3 — Corregir el último octeto

El endpoint tiene la forma `A.B.C.D:51820`. **Solo cambia el último número (`D`):**

| | Valor |
|---|---|
| ❌ Antes (roto) | `…​.2:51820` |
| ✅ Ahora (correcto) | `…​.254:51820` |

Es decir: el último octeto del endpoint debe ser **`254`**, no `2`. **No cambies nada más** —
ni el puerto `51820`, ni el resto de la IP, ni ninguna otra línea.

## Paso 4 — Guardar y reconectar

1. Pulsa **Guardar**.
2. En la ventana principal, pulsa **Desactivar** y luego **Activar** (o reconecta el túnel).
3. El estado debe volver a **Activo** y el **Último saludo** actualizarse a "hace pocos
   segundos".

## Paso 5 — Verificar

Abre en el navegador el portal **OFFen EDU**: [http://192.168.22.147](http://192.168.22.147).
Si carga la pantalla de login, la VPN quedó reconectada. Si no carga, revisa que el endpoint
termine exactamente en `.254:51820` y que el túnel esté **Activo**.

:::note[¿Sigue sin funcionar?]

Verifica que el endpoint sea `…​.254:51820` (sin espacios). Si el problema persiste, el valor
correcto del endpoint lo confirma el instructor por el canal interno del curso.

:::
