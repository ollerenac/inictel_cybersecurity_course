---
type: quick-task
slug: healthcheck-pedagogia-recon
status: complete
created: 2026-07-20
---

# Quick Task — Enriquecer pedagogía de Healthcheck (Intro + Paso 0 + Paso 1)

## Objetivo

Mejorar el andamiaje pedagógico del writeup `site/docs/web-hacking/healthcheck.md`
SOLO en Introducción + Paso 0 + Paso 1. No tocar Paso 2 en adelante (siguiente oleada).

## Alcance (5 cambios)

1. Sección `## Escenario` (tras Enunciado, antes de Reconocimiento): narrativa de foothold
   en el workstation .51 + diagrama Mermaid del Cyber Kill Chain (Lockheed) con marca
   "empiezas aquí". Escenario representativo (ATT&CK T1059), no incidente nombrado.
2. Convención `<details> 🔍 Explica el comando` (desglose + porqué + mini-ejercicio) para:
   ping sweep, port scan /dev/tcp, curl -sI.
3. Paso 1: "Huellar el stack" → "Fingerprinting del stack"; eliminar "huellar/huellamos".
4. Paso 1: reescribir en items (qué es el stack, cómo se halla, Flask/Werkzeug, Python vs
   Node/Express, por qué el stack define vectores, por qué no .php).
5. Paso 0: item sobre puerto no estándar como síntoma (pentest real + CTF).

## Definition of done

- `npm run build` pasa; sigue en el sidebar de Web Hacking.
- 8 secciones intactas; Paso 2+ sin tocar.
- Commit atómico.
