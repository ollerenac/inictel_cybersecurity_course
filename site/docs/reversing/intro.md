---
id: reversing-intro
sidebar_position: 1
title: "Introducción a Reversing"
tags: [reversing, introduccion]
---

# Reversing — Ingeniería Inversa

| Campo | Valor |
|-------|-------|
| **Ejercicios en el servidor** | 10 |
| **Niveles** | Básico · Intermedio · Avanzado |
| **Herramientas habituales** | Ghidra, GDB, strings, ltrace, strace, Python 3 |

## ¿De qué trata esta categoría?

La ingeniería inversa (reversing) consiste en **entender cómo funciona un programa sin tener su código fuente**. En estos ejercicios, se presenta un ejecutable o un fragmento de código compilado, y el objetivo es descubrir su lógica — generalmente para encontrar una contraseña, reconstruir un algoritmo, o extraer datos ocultos.

## Prerrequisitos recomendados

- **C básico**: estructuras de control, funciones, punteros a nivel conceptual
- **Assembly x86/x64**: qué son los registros, qué hace una instrucción `call`, qué es el stack
  - No es necesario escribir assembly — solo leerlo e interpretarlo
- **Linux**: ejecutar binarios, permisos, herramientas de línea de comandos
- Los ejercicios básicos no requieren conocimiento previo de reversing — parte desde analizar strings y comportamiento observable

## Conceptos clave

| Concepto | Qué es |
|----------|--------|
| **Desensamblado** | Convertir código máquina (bytes) a instrucciones assembly legibles |
| **Decompilar** | Convertir assembly a pseudocódigo de alto nivel (C aproximado) |
| **ELF / PE** | Formatos de ejecutable en Linux y Windows respectivamente |
| **Símbolos de debug** | Nombres de funciones y variables presentes en binarios no optimizados (o reconstruidos) |
| **Patch de binario** | Modificar bytes del ejecutable para cambiar su comportamiento |
| **Anti-reversing** | Técnicas para dificultar el análisis: packing, ofuscación, anti-debug |
| **Keygen** | Algoritmo que genera claves válidas, encontrado por ingeniería inversa |

## Herramientas de esta categoría

| Herramienta | Uso principal |
|-------------|---------------|
| **Ghidra** | Suite de reversing de la NSA — desensamblado + decompilar a pseudocódigo C |
| **GDB** | Depurador: ejecutar el binario instrucción por instrucción, inspeccionar memoria |
| **strings** | Primera herramienta a usar: qué texto legible hay en el binario |
| **ltrace** | Ver qué funciones de librería llama el binario (strcmp, printf, malloc...) |
| **strace** | Ver qué syscalls hace el binario (open, read, write, execve...) |
| **file / readelf** | Identificar tipo y arquitectura del binario |
| **Python 3** | Automatizar: bruteforce de contraseñas, reimplementar algoritmos, parsear output |

## Metodología básica para un ejercicio de reversing

1. `file <binario>` — ¿qué tipo de archivo es? ¿arquitectura?
2. `strings <binario>` — ¿hay texto revelador? ¿mensajes de error, contraseñas en claro?
3. Ejecutar el binario — ¿qué hace? ¿pide input? ¿genera output?
4. `ltrace ./<binario>` — ¿qué funciones llama? ¿compara strings con `strcmp`?
5. Abrir en Ghidra — buscar `main`, seguir el flujo de comparaciones
6. Si usa obfuscación o packer: identificarlo con `file`/DIE, desempacar primero

## Ejercicios de esta categoría

:::note[En construcción]

Los writeups de esta categoría se están produciendo. Consulta el índice de ejercicios para ver el estado de cada uno.

:::
