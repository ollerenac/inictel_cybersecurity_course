---
id: forensics-intro
sidebar_position: 1
title: "Introducción a Forensics"
tags: [forensics, introduccion]
---

# Análisis Forense Digital

| Campo | Valor |
|-------|-------|
| **Ejercicios en el servidor** | 20 |
| **Niveles** | Básico · Intermedio · Avanzado |
| **Herramientas habituales** | FTK Imager, Autopsy, Wireshark, strings, binwalk, Volatility |

## ¿De qué trata esta categoría?

El análisis forense digital consiste en **recuperar, preservar y analizar evidencia digital** de sistemas comprometidos o sujetos a investigación. En el contexto de este curso, los ejercicios de Forensics presentan artefactos — imágenes de disco, capturas de red, volcados de memoria — y piden responder preguntas concretas sobre lo que ocurrió.

## Prerrequisitos recomendados

Antes de comenzar los ejercicios de esta categoría, conviene tener familiaridad con:

- **Sistema de archivos**: qué es un inodo, cómo se organiza NTFS/FAT32, qué significa borrar un archivo
- **Línea de comandos Linux**: navegar directorios, usar `grep`, `strings`, `file`, `xxd`
- **Formatos de archivo**: extensiones vs. magic bytes, archivos comprimidos (zip, 7z, gz)
- **Red básica**: qué es un paquete TCP/IP, qué es un pcap

No se requiere experiencia previa en forense — los primeros ejercicios básicos asumen que partes de cero.

## Conceptos clave

| Concepto | Qué es |
|----------|--------|
| **Imagen forense** | Copia bit a bit de un disco o partición (formatos: .dd, .img, .ad1, .E01) |
| **Cadena de custodia** | Documentación que garantiza que la evidencia no fue alterada |
| **Artefactos** | Rastros que dejan los programas: archivos temporales, claves de registro, logs |
| **Metadatos** | Información sobre un archivo: fechas de creación/modificación, autor, GPS en fotos |
| **Esteganografía** | Ocultar información dentro de un archivo aparentemente inocente (imagen, audio) |
| **Carving** | Recuperar archivos eliminados a partir de los bytes del disco |

## Herramientas de esta categoría

| Herramienta | Uso principal |
|-------------|---------------|
| **FTK Imager** | Montar imágenes forenses (.ad1, .E01) y explorar el sistema de archivos |
| **Autopsy** | Análisis forense integrado: artefactos, búsqueda de keywords, timeline |
| **Wireshark** | Análisis de capturas de tráfico de red (.pcap, .pcapng) |
| **strings** | Extraer texto legible de binarios |
| **binwalk** | Identificar y extraer archivos embebidos en binarios o imágenes |
| **exiftool** | Leer y modificar metadatos de archivos |
| **Volatility** | Análisis de volcados de memoria RAM |

## Ejercicios de esta categoría

:::note[En construcción]

Los writeups de esta categoría se están produciendo. Consulta el índice de ejercicios para ver el estado de cada uno.

:::
