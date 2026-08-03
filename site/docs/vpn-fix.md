---
id: vpn-fix
sidebar_position: 3
title: "Arreglar la VPN"
---

# 🔧 Arreglar la conexión VPN (WireGuard)

Si la VPN del laboratorio dejó de conectar, es porque el **endpoint del servidor
cambió**. La conexión falla aunque tu configuración siga igual. El arreglo es una sola
línea en tu túnel de WireGuard: cambiar **un número**.

:::warning[Usa los valores de TU propia configuración]

Las capturas de esta guía tienen **datos ocultos a propósito** (clave privada, IP completa
del endpoint, subredes internas). No los necesitas: tu túnel ya tiene esos valores. Solo vas
a cambiar el último número del endpoint. **Nunca compartas tu clave privada (`PrivateKey`)
con nadie.**

:::

## Paso 1 — Abrir el túnel en WireGuard

Abre **WireGuard**, selecciona el túnel del laboratorio (aquí `Lab-Ciberguerra`) y haz clic
en **Editar** (abajo a la derecha).

![WireGuard — seleccionar el túnel y pulsar Editar](/img/vpn-fix/vpn-fix-1.png)

## Paso 2 — Ubicar la línea `Endpoint`

En el cuadro de edición, busca la sección `[Peer]`. Su última línea es `Endpoint`. Con la
config rota, el endpoint termina en **`.2`**:

![Cuadro de edición — el Endpoint termina en .2 (roto)](/img/vpn-fix/vpn-fix-2.png)

## Paso 3 — Corregir el último octeto

El endpoint tiene la forma `A.B.C.D:UWXYZ`. **Solo cambia el último número (`D`)** de `2` a
`254`:

| | Último octeto |
|---|---|
| ❌ Antes (roto) | `.2` |
| ✅ Ahora (correcto) | `.254` |

No cambies nada más — ni el puerto `UWXYZ`, ni el resto de la IP, ni ninguna otra línea. Debe
quedar así:

![Cuadro de edición — el Endpoint corregido termina en .254](/img/vpn-fix/vpn-fix-3.png)

## Paso 4 — Guardar y reconectar

1. Pulsa **Guardar**.
2. En la ventana principal, pulsa **Desactivar** y luego **Activar** (o reconecta el túnel).
3. El estado debe volver a **Activo** y el **Último saludo** actualizarse a "hace pocos
   segundos".

## Paso 5 — Verificar

Abre en el navegador el portal **OFFen EDU**:
[http://192.168.22.147](http://192.168.22.147). Si carga la pantalla de login, la VPN quedó
reconectada:

![Portal OFFen EDU cargando — VPN reconectada](/img/vpn-fix/vpn-fix-4.jpeg)

:::note[¿Sigue sin funcionar?]

Verifica que el endpoint termine exactamente en `.254:[puerto]` (sin espacios) y que el túnel
esté **Activo**. Si el problema persiste, el valor correcto del endpoint lo confirma el
instructor por el canal interno del curso.

:::
