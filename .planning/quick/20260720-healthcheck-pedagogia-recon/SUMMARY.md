---
type: quick-task-summary
slug: healthcheck-pedagogia-recon
status: complete
completed: 2026-07-20
---

# Summary — Enriquecer pedagogía de Healthcheck (Intro + Paso 0 + Paso 1)

## Hecho

Archivo: `site/docs/web-hacking/healthcheck.md` (solo Intro + Paso 0 + Paso 1).

1. **Sección `## Escenario`** (tras Enunciado): narrativa de foothold en el workstation .51 +
   diagrama del Cyber Kill Chain (Lockheed) con marca "aquí empezamos" en la fase 7. Nota
   aclarando que es escenario representativo (ATT&CK T1059), no un incidente real.
2. **Convención `<details> 🔍 Explica el comando`** aplicada a 3 comandos: ping sweep, port
   scan `/dev/tcp`, `curl -sI`. Cada uno: tabla parte-por-parte + el "porqué" + mini-ejercicio.
   Se destiló el patrón mental "generar candidatos → paralelizar → filtrar → ordenar".
3. **Paso 1 renombrado** "Huellar el stack" → "Fingerprinting del stack"; eliminado el verbo
   inventado "huellar/huellamos" (se conservó "huella digital", que es español correcto).
4. **Paso 1 reescrito en items**: qué es el stack, cómo se halla (header `Server:`),
   Flask/Werkzeug, Python-vs-Node/Express, por qué el stack poda el árbol de vectores, por qué
   no `.php`.
5. **Paso 0 — item de puerto no estándar**: por qué es síntoma de candidato, honesto para
   pentest real Y CTF. + `:::caution` del punto ciego ICMP del pipeline sweep→scan.

## Decisiones / desviaciones

- **Mermaid → ASCII.** El diagrama se pidió en Mermaid, pero el sitio no tiene
  `@docusaurus/theme-mermaid` instalado ni habilitado (intranet offline). Se usó un diagrama
  ASCII (cero dependencias, consistente con `my-webview`). Pendiente de decisión: habilitar
  Mermaid site-wide para futuros diagramas.
- **Sin espejo en `soluciones/`.** Los comandos no cambiaron, solo se agregaron explicaciones
  pedagógicas — que no corresponden al cuaderno crudo. No aplicaba mirror.

## Verificación

- `npm run build` → SUCCESS. Sigue en el sidebar de Web Hacking.
- 8 secciones + Escenario intactas. Paso 2 en adelante sin tocar.
