---
id: conexion
sidebar_position: 2
title: Conexión al servidor
---

# 🖥 Conexión al servidor wargame

Todos los ejercicios se resuelven en el entorno del servidor wargame de INICTEL. Necesitas estar conectado a la red interna.

## Datos de acceso

| Campo | Valor |
|-------|-------|
| **Plataforma web** | http://192.168.22.28 |
| **Usuario** | `user1` |
| **Contraseña** | `user1` |

## Estructura de red por ejercicio

Cada ejercicio despliega su propio entorno OpenStack. Los datos de red específicos (IPs, puertos, credenciales de la máquina) se indican en la página de cada ejercicio.

## Patrón típico de conexión

La mayoría de ejercicios siguen este patrón:

```bash
# 1. Conectarte a la máquina de trabajo del ejercicio
ssh user@<IP_MAQUINA>

# 2. Desde ahí, acceder al servidor de archivos del ejercicio
curl http://<IP_FILESERVER>/
```

:::warning[Red interna]
Los servidores de ejercicio (red 192.168.200.x) solo son accesibles desde dentro de la red de INICTEL. Asegúrate de estar conectado antes de intentar acceder.
:::
