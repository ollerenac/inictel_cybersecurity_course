---
id: system-hacking-intro
sidebar_position: 1
title: "Introducción a System Hacking"
tags: [system-hacking, introduccion]
---

# System Hacking — Explotación de Sistemas

| Campo | Valor |
|-------|-------|
| **Ejercicios en el servidor** | 12 |
| **Niveles** | Básico · Intermedio · Avanzado |
| **Herramientas habituales** | netcat, pwntools, GDB, ROPgadget, Python 3 |

## ¿De qué trata esta categoría?

System Hacking agrupa ejercicios donde el objetivo es **ganar acceso o escalar privilegios** en un sistema. Esto incluye explotar vulnerabilidades en binarios (buffer overflow, format strings), abusar de configuraciones inseguras, y moverse lateralmente dentro de una red.

## Prerrequisitos recomendados

- **C/C++ básico**: qué es un puntero, cómo funciona la pila (stack), qué hace `malloc`
- **Assembly x86/x64**: registros básicos (rsp, rbp, rip), qué es una instrucción `ret`
- **Linux**: permisos de archivo, procesos, variables de entorno, SUID bit
- **Redes**: puertos TCP, cómo funciona una shell reversa

Los ejercicios básicos no requieren conocimiento de exploits — pueden resolverse abusando de configuraciones o lógica de la aplicación.

## Conceptos clave

| Concepto | Qué es |
|----------|--------|
| **Buffer overflow** | Escribir más datos de los que el buffer puede contener, sobrescribiendo memoria adyacente |
| **Shell reversa** | La víctima inicia una conexión hacia el atacante, que recibe una shell |
| **Escalada de privilegios** | Pasar de usuario normal a root abusando de SUID, sudo mal configurado, o cron jobs |
| **ROP (Return-Oriented Programming)** | Técnica para ejecutar código usando fragmentos del binario cuando DEP/NX está activo |
| **ASLR / DEP / NX** | Mitigaciones modernas que dificultan la explotación de binarios |
| **Pivot de red** | Usar una máquina comprometida como puente para atacar redes internas |

## Herramientas de esta categoría

| Herramienta | Uso principal |
|-------------|---------------|
| **netcat / ncat** | Conexiones TCP brutas, shells reversas y bind shells |
| **pwntools** | Librería Python para automatizar exploits (interacción con procesos, sockets, ROP) |
| **GDB + peda/pwndbg** | Depuración interactiva de binarios |
| **ROPgadget / ropper** | Buscar gadgets ROP en binarios |
| **ltrace / strace** | Interceptar llamadas a librerías y syscalls |
| **strings / objdump** | Inspección estática de binarios |

## Ejercicios de esta categoría

:::note[En construcción]

Los writeups de esta categoría se están produciendo. Consulta el índice de ejercicios para ver el estado de cada uno.

:::
